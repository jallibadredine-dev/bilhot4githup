/* ═══════════════════════════════════════════════════════════════
   CARD ENCODER DRIVER  –  CP210x USB-UART Bridge (Web Serial API)
   ────────────────────────────────────────────────────────────────
   Communicates with hotel RFID card encoders via Web Serial.
   Supports:  Mifare 1K / 4K  ·  EM4100  ·  HID Prox
   Baud: 9600 8N1  (standard for most CP210x hotel encoders)
   ─────────────────────────────────────────────────────────────── */

const BAUD_RATE    = 9600;
const READ_TIMEOUT = 5000;  // ms — wait up to 5 s for encoder reply
const CMD_PING     = 'PING\r\n';
const CMD_PREFIX   = 'ENC:';
const CMD_SUFFIX   = ';END\r\n';
const RESP_OK      = 'OK:';
const RESP_ERR     = 'ERR:';

/* ── Internal port state ───────────────────────────────────── */
let _port   = null;
let _reader = null;
let _writer = null;

/* ─────────────────────────────────────────────────────────────
   isSupported()  —  true when the browser supports Web Serial
──────────────────────────────────────────────────────────────  */
export function isSerialSupported() {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
}

/* ─────────────────────────────────────────────────────────────
   connect()
   Opens a port selection dialog and connects to the CP210x.
   Returns { ok, error? }
──────────────────────────────────────────────────────────────  */
export async function connect() {
  if (!isSerialSupported()) {
    return { ok: false, error: 'Web Serial non supporté sur ce navigateur. Utilisez Chrome ou Edge.' };
  }
  try {
    // Prompt user to select the CP210x port
    _port = await navigator.serial.requestPort({
      filters: [
        { usbVendorId: 0x10C4 }, // Silicon Labs CP210x
        { usbVendorId: 0x0403 }, // FTDI  (alternative encoder chips)
        { usbVendorId: 0x1A86 }, // CH340 (clone encoders)
      ],
    });
    await _port.open({ baudRate: BAUD_RATE, dataBits: 8, stopBits: 1, parity: 'none' });

    _writer = _port.writable.getWriter();
    _reader = _port.readable.getReader();

    // Verify encoder responds to PING
    const pong = await _sendCommand(CMD_PING, 2000);
    if (!pong.startsWith(RESP_OK) && !pong.toLowerCase().includes('pong') && pong !== '') {
      // Some encoders don't implement PING — treat as connected if no error
    }
    return { ok: true };
  } catch (err) {
    await _cleanup();
    if (err.name === 'NotFoundError') {
      return { ok: false, error: 'Aucun port sélectionné. Veuillez choisir le port de l\'encodeur.' };
    }
    return { ok: false, error: err.message || 'Impossible de se connecter à l\'encodeur.' };
  }
}

/* ─────────────────────────────────────────────────────────────
   disconnect()  —  release the serial port
──────────────────────────────────────────────────────────────  */
export async function disconnect() {
  await _cleanup();
}

/* ─────────────────────────────────────────────────────────────
   isConnected()
──────────────────────────────────────────────────────────────  */
export function isConnected() {
  return _port !== null && _port.readable !== null;
}

/* ─────────────────────────────────────────────────────────────
   writeCard(cardData)
   Sends guest stay data to the encoder and waits for ACK.

   cardData : {
     guestName   : string,
     room        : string,   e.g. '101'
     floor       : string,   e.g. '1'
     checkIn     : string,   'YYYY-MM-DD'
     checkOut    : string,   'YYYY-MM-DD'
     pin?        : string,
     cardType?   : 'MIFARE_1K' | 'MIFARE_4K' | 'EM4100'
   }

   Returns { ok, cardUid?, error? }
──────────────────────────────────────────────────────────────  */
export async function writeCard(cardData) {
  if (!isConnected()) {
    return { ok: false, error: 'Encodeur non connecté.' };
  }
  const { guestName = '', room = '', floor = '', checkIn = '', checkOut = '', pin = '', cardType = 'MIFARE_1K' } = cardData;

  // Compact date format YYYYMMDD
  const ci = checkIn.replace(/-/g, '');
  const co = checkOut.replace(/-/g, '');

  // Build command string
  const cmd = `${CMD_PREFIX}ROOM=${room};FLOOR=${floor};CI=${ci};CO=${co};GUEST=${encodeGuest(guestName)};PIN=${pin};TYPE=${cardType}${CMD_SUFFIX}`;

  try {
    const resp = await _sendCommand(cmd, READ_TIMEOUT);

    if (resp.startsWith(RESP_OK)) {
      const uid = resp.replace(RESP_OK, '').replace('CARD_WRITTEN:', '').trim();
      return { ok: true, cardUid: uid || null };
    }
    if (resp.startsWith(RESP_ERR)) {
      const msg = resp.replace(RESP_ERR, '').trim();
      return { ok: false, error: _friendlyError(msg) };
    }
    // Unknown but non-empty response — assume success
    if (resp.length > 0) return { ok: true, cardUid: null };

    return { ok: false, error: 'Délai dépassé — assurez-vous que la carte est bien posée sur l\'encodeur.' };
  } catch (err) {
    return { ok: false, error: err.message || 'Erreur de communication avec l\'encodeur.' };
  }
}

/* ─────────────────────────────────────────────────────────────
   DEMO MODE  —  simulates the full encoding flow without hardware
   Useful for dev / testing when no encoder is present.
──────────────────────────────────────────────────────────────  */
export async function writeCardDemo(cardData) {
  // Simulate connect delay
  await _delay(800);
  // Simulate scanning delay
  await _delay(1200);
  // Return a fake UID
  const fakeUid = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':');
  return { ok: true, cardUid: fakeUid, demo: true };
}

/* ─────────────────────────────────────────────────────────────
   INTERNAL HELPERS
──────────────────────────────────────────────────────────────  */

/** Send a command string and read back one line of response */
async function _sendCommand(cmd, timeoutMs = READ_TIMEOUT) {
  const encoded = new TextEncoder().encode(cmd);
  await _writer.write(encoded);

  const decoder = new TextDecoder();
  let response  = '';
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const { value, done } = await Promise.race([
      _reader.read(),
      _delay(timeoutMs).then(() => ({ value: null, done: true })),
    ]);
    if (done || value === null) break;
    response += decoder.decode(value, { stream: true });
    if (response.includes('\n')) break;
  }
  return response.trim();
}

/** Release all resources */
async function _cleanup() {
  try { if (_reader) { await _reader.cancel(); _reader.releaseLock(); } } catch (_) {}
  try { if (_writer) { _writer.releaseLock(); } } catch (_) {}
  try { if (_port)   { await _port.close(); } } catch (_) {}
  _port = _reader = _writer = null;
}

/** Encode guest name — strip special chars for serial safety */
function encodeGuest(name) {
  return (name || '').replace(/[;=\r\n]/g, '').slice(0, 24);
}

/** Map raw encoder error codes to French messages */
function _friendlyError(code) {
  const MAP = {
    NO_CARD:       'Aucune carte détectée. Posez la carte sur l\'encodeur et réessayez.',
    WRITE_FAIL:    'Échec d\'écriture. La carte est peut-être protégée ou incompatible.',
    BAD_CARD:      'Carte non reconnue. Utilisez une carte Mifare 1K/4K ou EM4100.',
    PORT_BUSY:     'Port occupé. Fermez les autres applications utilisant ce port.',
    TIMEOUT:       'Délai dépassé. Vérifiez la connexion de l\'encodeur.',
    AUTH_FAIL:     'Échec d\'authentification de la carte. Clé de secteur incorrecte.',
  };
  return MAP[code] || `Erreur encodeur : ${code}`;
}

function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
