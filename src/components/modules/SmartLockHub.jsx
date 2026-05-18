import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock, Unlock, Key, RefreshCcw, Search,
  Wifi, WifiOff, Battery, BatteryLow,
  History, X, Check, AlertTriangle, Building2,
  User, LayoutGrid, List,
  Eye, EyeOff, RefreshCw, Copy, Shield,
  Link2, Unlink, ChevronDown, Settings, ArrowRight,
  Download, CheckCircle2, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ttlockAPI } from '../../lib/ttlock';
import { tthotelAPI } from '../../lib/tthotel';
import { tuyaAPI, TUYA_REGIONS, resolveTuyaId, resolveTuyaSec, resolveTuyaReg,
         ENV_TUYA_ID, tuyaUsingDefaults } from '../../lib/tuya';
import { handleApiError } from '../../lib/errorHandler';
import { toast } from '../../lib/toast';
import { secureStorage } from '../../lib/secureStorage';
import CardEncoderModal from './CardEncoderModal';
import CardAccessModal from './CardAccessModal';
import './SmartLockHub.css';

/* ════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════ */
const PROVIDERS = {
  ttlock:  { id: 'ttlock',  name: 'TTLock',         short: 'TTLock',   color: '#2563EB', bg: '#EFF6FF', logo: '🔐' },
  tthotel: { id: 'tthotel', name: 'TTHotel Access',  short: 'TTHotel',  color: '#7C3AED', bg: '#F5F3FF', logo: '🏨' },
  tuya:    { id: 'tuya',    name: 'Tuya Smart',      short: 'Tuya',     color: '#059669', bg: '#F0FDF4', logo: '🌿' },
};

const TTHOTEL_DEMO_LOCKS = [
  { id: 'TTH-001', name: 'TTHotel Pro #001',  serial: 'THP-0001', model: 'Pro V2',  battery: 78, online: true,  locked: false, fw: '1.8.3' },
  { id: 'TTH-002', name: 'TTHotel Pro #002',  serial: 'THP-0002', model: 'Pro V2',  battery: 55, online: true,  locked: false, fw: '1.8.3' },
  { id: 'TTH-003', name: 'TTHotel Lite #003', serial: 'THL-0003', model: 'Lite V1', battery: 88, online: true,  locked: false, fw: '1.5.2' },
  { id: 'TTH-004', name: 'TTHotel Pro #004',  serial: 'THP-0004', model: 'Pro V2',  battery: 31, online: true,  locked: true,  fw: '1.8.3' },
  { id: 'TTH-005', name: 'TTHotel Pro #005',  serial: 'THP-0005', model: 'Pro V2',  battery: 62, online: false, locked: true,  fw: '1.8.1' },
];

const TUYA_DEMO_LOCKS = [
  { id: 'TY-001', name: 'Tuya Smart Lock #001', serial: 'TY-0001', model: 'WiFi Lock', battery: 15, online: false, locked: true,  fw: '2.0.1' },
  { id: 'TY-002', name: 'Tuya Smart Lock #002', serial: 'TY-0002', model: 'WiFi Lock', battery: 92, online: true,  locked: true,  fw: '2.1.0' },
  { id: 'TY-003', name: 'Tuya NFC Lock #003',   serial: 'TY-0003', model: 'NFC+WiFi', battery: 63, online: true,  locked: false, fw: '2.1.0' },
  { id: 'TY-004', name: 'Tuya Smart Lock #004', serial: 'TY-0004', model: 'WiFi Lock', battery: 44, online: true,  locked: true,  fw: '2.0.5' },
];

const PROPERTY_ROOMS = [
  { number: '101', label: 'Suite Panorama',      floor: 'RDC'     },
  { number: '102', label: 'Confort Standard',    floor: 'RDC'     },
  { number: '103', label: 'Chambre Deluxe',      floor: 'RDC'     },
  { number: '104', label: 'Standard Classique',  floor: 'RDC'     },
  { number: '201', label: 'Suite Étoile',        floor: 'Étage 1' },
  { number: '202', label: 'Vue Panoramique',     floor: 'Étage 1' },
  { number: '203', label: 'Famille Spacieuse',   floor: 'Étage 1' },
  { number: '304', label: 'Suite Penthouse',     floor: 'Étage 2' },
  { number: '305', label: 'Vue Jardins',         floor: 'Étage 2' },
  { number: '306', label: 'PMR Accessible',      floor: 'Étage 2' },
];

const genPin = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ── Battery widget ── */
const BattBar = ({ level }) => (
  <div className="slh-batt-row">
    {level < 25 ? <BatteryLow size={13} color="#DC2626"/> : <Battery size={13} color={level > 60 ? '#16A34A' : '#D97706'}/>}
    <div className="slh-batt-track">
      <div className="slh-batt-fill" style={{ width: `${level}%`, background: level < 25 ? '#EF4444' : level < 50 ? '#F59E0B' : '#16A34A' }}/>
    </div>
    <span className={`slh-batt-pct ${level < 25 ? 'crit' : ''}`}>{level}%</span>
  </div>
);

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const SmartLockHub = () => {

  /* ── View state ── */
  const anyConnected = !!(secureStorage.getSessionSensitive('ttlock_token') || secureStorage.getSensitive('slh_tthotel') || secureStorage.getSensitive('slh_tuya'));
  const [view, setView]     = useState(anyConnected ? 'devices' : 'setup'); // 'setup' | 'devices'
  const [syncing, setSyncing] = useState(false);

  /* ── Provider auth ── */
  const [connTTLock,  setConnTTLock]  = useState(!!secureStorage.getSessionSensitive('ttlock_token'));
  const [connTTHotel, setConnTTHotel] = useState(!!secureStorage.getSensitive('slh_tthotel'));
  const [connTuya,    setConnTuya]    = useState(!!secureStorage.getSensitive('slh_tuya'));

  // TTLock
  const [ttUser,      setTtUser]      = useState(secureStorage.getSensitive('ttlock_user', ''));
  const [ttPass,      setTtPass]      = useState('');
  const [ttToken,     setTtToken]     = useState(secureStorage.getSessionSensitive('ttlock_token', ''));
  const [ttShowPw,    setTtShowPw]    = useState(false);
  const [ttLoading,   setTtLoading]   = useState(false);
  const [ttErr,       setTtErr]       = useState('');

  // TTHotel — all reads auth-gated via secureStorage
  const [tthUser,     setTthUser]     = useState(secureStorage.getSensitive('slh_tthotel_user',    ''));
  const [tthPass,     setTthPass]     = useState('');
  const [tthShowPw,   setTthShowPw]   = useState(false);
  const [tthLoading,  setTthLoading]  = useState(false);
  const [tthErr,      setTthErr]      = useState('');
  const [tthToken,    setTthToken]    = useState(secureStorage.getSensitive('slh_tthotel_token',   ''));
  const [tthRefresh,  setTthRefresh]  = useState(secureStorage.getSensitive('slh_tthotel_refresh', ''));
  const [tthDemoMode, setTthDemoMode] = useState(secureStorage.getFlag('slh_tthotel_demo'));

  // Tuya — user login (Smart Life account: email + app password)
  const [tuyaLoading,  setTuyaLoading]  = useState(false);
  const [tuyaErr,      setTuyaErr]      = useState('');
  const [tuyaToken,    setTuyaToken]    = useState(secureStorage.getSensitive('slh_tuya_token', ''));
  const [tuyaDemoMode, setTuyaDemoMode] = useState(secureStorage.getFlag('slh_tuya_demo'));
  const [tuyaEmail,    setTuyaEmail]    = useState(() => localStorage.getItem('slh_tuya_email') || '');
  const [tuyaPass,     setTuyaPass]     = useState('');
  const [tuyaShowPw,   setTuyaShowPw]   = useState(false);
  const platformHasCreds = !!ENV_TUYA_ID;

  /* ── TTHotel / Tuya imported devices ── */
  const [tthotelDevices, setTthotelDevices] = useState(() => {
    const devices = secureStorage.parseJSON('slh_tthotel_devices', null);
    return devices ?? (secureStorage.getSensitive('slh_tthotel') ? TTHOTEL_DEMO_LOCKS : []);
  });
  const [tuyaDevices, setTuyaDevices] = useState(() => {
    const devices = secureStorage.parseJSON('slh_tuya_devices', null);
    return devices ?? (secureStorage.getSensitive('slh_tuya') ? TUYA_DEMO_LOCKS : []);
  });

  /* ── Devices ── */
  const [ttlockDevices, setTtlockDevices] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  /* ── Assignments { lockId: roomNumber } ── */
  const [assignments, setAssignments] = useState(() => secureStorage.parseJSON('slh_assignments', {}));

  /* ── Inline assign state { lockId: pendingRoom } ── */
  const [assignDraft, setAssignDraft] = useState({});

  /* ── UI ── */
  const [search,      setSearch]      = useState('');
  const [filterProv,  setFilterProv]  = useState('all');
  const [filterStat,  setFilterStat]  = useState('all');
  const [viewMode,    setViewMode]    = useState('grid');
  const [selectedLock,setSelectedLock]= useState(null);
  const [drawerTab,   setDrawerTab]   = useState('control');
  const [lockLogs,    setLockLogs]    = useState([]);
  const [logsLoad,    setLogsLoad]    = useState(false);
  const [pinValue,    setPinValue]    = useState(genPin);
  const [pinName,     setPinName]     = useState('');
  const [pinType,     setPinType]     = useState('periodic');
  const [pinStart,    setPinStart]    = useState('');
  const [pinEnd,      setPinEnd]      = useState('');
  const [pinLoading,  setPinLoading]  = useState(false);
  const [pinSuccess,  setPinSuccess]  = useState(false);
  const [pinCopied,   setPinCopied]   = useState(false);
  const [showPin,        setShowPin]        = useState(false);
  const [showEncoder,    setShowEncoder]    = useState(false);
  const [encoderData,    setEncoderData]    = useState({});
  const [showCardAccess, setShowCardAccess] = useState(false);

  /* ════ TTLock fetch ════ */
  const fetchTTLock = useCallback(async (token = ttToken) => {
    if (!token) return 0;
    try {
      const data = await ttlockAPI.getLocks(token);
      if (data?.list) {
        const mapped = data.list.map(l => ({
          id: String(l.lockId), name: l.lockAlias || `Serrure ${l.lockId}`,
          provider: 'ttlock', serial: String(l.lockId),
          model: l.lockVersion ? 'TTLock Pro' : 'TTLock',
          battery: l.electricQuantity ?? 85,
          online: !!l.lockVersion, locked: l.lockStatus === 0,
          fw: l.lockVersion?.protocolVersion || '—', lockId: l.lockId,
        }));
        setTtlockDevices(mapped);
        return mapped.length;
      }
    } catch (err) {
      handleApiError('smartlock', err);
      setApiError(err.message);
      toast.error(err.message || 'Erreur TTLock');
    }
    return 0;
  }, [ttToken]);

  useEffect(() => { if (ttToken) fetchTTLock(); }, []);

  /* ════ Sync all ════ */
  const syncAll = async () => {
    setSyncing(true); setApiError(null);
    let count = 0;
    if (connTTLock && ttToken) count += await fetchTTLock();
    count += tthotelDevices.length;
    count += tuyaDevices.length;
    setLastSync(new Date());
    setSyncing(false);
    return count;
  };

  /* ════ All devices aggregated ════ */
  const allDevices = [
    ...ttlockDevices,
    ...tthotelDevices.map(l => ({ ...l, provider: 'tthotel', lockId: l.id })),
    ...tuyaDevices.map(l    => ({ ...l, provider: 'tuya',    lockId: l.id })),
  ];

  const filtered = allDevices.filter(l => {
    const mp = filterProv === 'all' || l.provider === filterProv;
    const ms = !search || l.name.toLowerCase().includes(search.toLowerCase()) || (assignments[l.id] || '').includes(search);
    const mf = filterStat === 'all'
      || (filterStat === 'online'    && l.online)
      || (filterStat === 'offline'   && !l.online)
      || (filterStat === 'low'       && l.battery < 25)
      || (filterStat === 'assigned'  && assignments[l.id])
      || (filterStat === 'free'      && !assignments[l.id]);
    return mp && ms && mf;
  });

  const usedRooms = new Set(Object.values(assignments));

  /* ════ Assignment ════ */
  const saveAssignment = (lockId, roomNum) => {
    const next = { ...assignments };
    if (roomNum) next[lockId] = roomNum; else delete next[lockId];
    setAssignments(next);
    setAssignDraft(d => { const n = { ...d }; delete n[lockId]; return n; });
    localStorage.setItem('slh_assignments', JSON.stringify(next));
    if (selectedLock?.id === lockId) setSelectedLock(l => ({ ...l, assignedRoom: roomNum || null }));
  };

  /* ════ Lock toggle ════ */
  const toggleLock = async (lock) => {
    if (lock.provider === 'ttlock' && ttToken) {
      setTtlockDevices(p => p.map(l => l.id === lock.id ? { ...l, locked: !l.locked } : l));
      try {
        lock.locked ? await ttlockAPI.unlock(ttToken, lock.lockId)
                    : await ttlockAPI.lock(ttToken, lock.lockId);
      } catch (err) { handleApiError('smartlock.toggle', err); setApiError(err.message); toast.error(err.message || 'Erreur verrou TTLock'); }
    } else if (lock.provider === 'tthotel') {
      setTthotelDevices(p => p.map(l => l.id === lock.id ? { ...l, locked: !l.locked } : l));
      if (tthToken && !tthDemoMode) {
        try {
          lock.locked ? await tthotelAPI.unlock(tthToken, lock.lockId)
                      : await tthotelAPI.lock(tthToken, lock.lockId);
        } catch (err) { handleApiError('smartlock.toggle', err); setApiError(err.message); toast.error(err.message || 'Erreur verrou TTHotel'); }
      }
    } else if (lock.provider === 'tuya') {
      setTuyaDevices(p => p.map(l => l.id === lock.id ? { ...l, locked: !l.locked } : l));
      if (tuyaToken && !tuyaDemoMode && lock.locked) {
        try {
          await tuyaAPI.unlock(resolveTuyaId(), resolveTuyaSec(), tuyaToken, lock.lockId, resolveTuyaReg());
        } catch (err) { handleApiError('smartlock.toggle', err); setApiError(err.message); toast.error(err.message || 'Erreur verrou Tuya'); }
      }
    }
    if (selectedLock?.id === lock.id) setSelectedLock(l => ({ ...l, locked: !l.locked }));
  };

  /* ════ Logs ════ */
  const loadLogs = async (lock) => {
    if (lock.provider === 'ttlock' && ttToken && lock.lockId) {
      setLogsLoad(true);
      try {
        const data = await ttlockAPI.getLockLogs(ttToken, lock.lockId);
        if (data?.list) setLockLogs(data.list.map(log => ({
          time: new Date(log.lockDate).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(log.lockDate).toLocaleDateString('fr'),
          user: log.username || log.keyboardPwdName || 'Inconnu',
          method: log.recordType === 1 ? 'code' : log.recordType === 3 ? 'bluetooth' : 'rfid',
          ok: log.success === 1,
        })));
      } catch { setLockLogs([]); }
      finally { setLogsLoad(false); }
    } else if (lock.provider === 'tthotel' && tthToken && !tthDemoMode) {
      setLogsLoad(true);
      try {
        const data = await tthotelAPI.getLockLogs(tthToken, lock.lockId);
        if (data?.list) setLockLogs(data.list.map(log => ({
          time: new Date(log.lockDate).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(log.lockDate).toLocaleDateString('fr'),
          user: log.username || log.keyboardPwdName || 'Inconnu',
          method: log.recordType === 1 ? 'code' : log.recordType === 3 ? 'bluetooth' : 'rfid',
          ok: log.success === 1,
        })));
        else setLockLogs([]);
      } catch { setLockLogs([]); }
      finally { setLogsLoad(false); }
    } else {
      setLockLogs([
        { time: '08:32', date: '17/05', user: 'Robert Chen',       method: 'code',      ok: true  },
        { time: '14:15', date: '17/05', user: 'Maintenance',        method: 'bluetooth', ok: true  },
        { time: '19:00', date: '16/05', user: 'Marie Laurent',      method: 'rfid',      ok: true  },
        { time: '23:47', date: '15/05', user: 'Tentative inconnue', method: 'code',      ok: false },
      ]);
    }
  };

  const openDrawer = (lock) => {
    setSelectedLock({ ...lock, assignedRoom: assignments[lock.id] || null });
    setDrawerTab('control');
    loadLogs(lock);
  };

  /* ════ PIN ════ */
  const generatePin = async () => {
    setPinLoading(true); setPinSuccess(false);
    try {
      if (selectedLock?.provider === 'ttlock' && ttToken) {
        await ttlockAPI.createPasscode(ttToken, selectedLock.lockId, {
          passcode: pinValue,
          passcodeName: pinName || `Accès ${new Date().toLocaleDateString('fr')}`,
          startDate: pinStart ? new Date(pinStart).getTime() : Date.now(),
          endDate:   pinEnd   ? new Date(pinEnd).getTime()   : Date.now() + 7 * 86400000,
          type: pinType === 'one-time' ? 4 : pinType === 'permanent' ? 2 : 1,
        });
      }
      setPinSuccess(true);
      setTimeout(() => { setPinSuccess(false); setShowPin(false); }, 1800);
    } catch (err) {
      handleApiError('smartlock.pin', err);
      const msg = `PIN non créé : ${err.message}`;
      setApiError(msg);
      toast.error(msg);
    } finally { setPinLoading(false); }
  };

  /* ════ Connect handlers ════ */
  const connectTTLock = async (e) => {
    e.preventDefault(); setTtErr(''); setTtLoading(true);
    try {
      const data = await ttlockAPI.getToken(ttUser, ttPass);
      if (data?.access_token) {
        sessionStorage.setItem('ttlock_token', data.access_token);
        secureStorage.setSensitive('ttlock_user', ttUser);
        setTtToken(data.access_token); setConnTTLock(true); setTtPass('');
        await fetchTTLock(data.access_token);
      } else throw new Error(data?.errmsg || 'Identifiants incorrects');
    } catch (err) { setTtErr(err.message); }
    finally { setTtLoading(false); }
  };

  const connectTTHotel = async (e) => {
    e.preventDefault(); setTthErr(''); setTthLoading(true);
    try {
      if (!tthUser || !tthPass) throw new Error('Email et mot de passe requis');
      let devices = [];
      let isDemo  = false;
      try {
        // ── Real API call ──
        const auth = await tthotelAPI.getToken(tthUser, tthPass);
        const tok  = auth.access_token;
        const ref  = auth.refresh_token || '';
        localStorage.setItem('slh_tthotel_token',   tok);
        localStorage.setItem('slh_tthotel_refresh',  ref);
        localStorage.removeItem('slh_tthotel_demo');
        setTthToken(tok); setTthRefresh(ref); setTthDemoMode(false);
        // ── Fetch real devices ──
        const res = await tthotelAPI.getLocks(tok);
        if (res?.list?.length) {
          devices = res.list.map(l => ({
            id:      String(l.lockId),
            name:    l.lockAlias || `TTHotel #${l.lockId}`,
            serial:  String(l.lockId),
            model:   l.lockVersion ? 'Pro V2' : 'Lite',
            battery: l.electricQuantity ?? 80,
            online:  !!l.lockVersion,
            locked:  l.lockStatus === 0,
            fw:      l.lockVersion?.protocolVersion || '—',
            lockId:  l.lockId,
          }));
        } else {
          devices = TTHOTEL_DEMO_LOCKS;
          isDemo  = true;
        }
      } catch (apiErr) {
        // CORS or network error — fall back to demo but keep real credentials
        devices = TTHOTEL_DEMO_LOCKS;
        isDemo  = true;
        localStorage.setItem('slh_tthotel_demo', '1');
        setTthDemoMode(true);
      }
      localStorage.setItem('slh_tthotel', '1');
      localStorage.setItem('slh_tthotel_user',    tthUser);
      localStorage.setItem('slh_tthotel_devices', JSON.stringify(devices));
      setTthotelDevices(devices);
      setConnTTHotel(true);
      setTthPass('');
      if (!Object.values(assignments).length) {
        const initAssign = { ...assignments, [devices[0]?.id]: '102', [devices[1]?.id]: '202', [devices[2]?.id]: '304' };
        setAssignments(initAssign);
        localStorage.setItem('slh_assignments', JSON.stringify(initAssign));
      }
    } catch (err) { setTthErr(err.message); }
    finally { setTthLoading(false); }
  };

  const connectTuya = async (e) => {
    e.preventDefault(); setTuyaErr(''); setTuyaLoading(true);
    try {
      if (!tuyaEmail.trim() || !tuyaPass) throw new Error('Email et mot de passe requis');
      if (!platformHasCreds) throw new Error('Credentials plateforme Tuya non configurés — contactez votre administrateur.');

      const tuyaId  = resolveTuyaId();
      const tuyaSec = resolveTuyaSec();
      const tuyaReg = resolveTuyaReg();
      let devices = [];

      try {
        // Step 1: User login with email + password (Smart Life account)
        const loginRes = await tuyaAPI.loginUser(tuyaId, tuyaSec, tuyaEmail.trim(), tuyaPass, tuyaReg);
        const uid       = loginRes.result?.uid;
        const userToken = loginRes.result?.token;

        // Step 2: Get platform token to fetch devices
        const platAuth = await tuyaAPI.getToken(tuyaId, tuyaSec, tuyaReg);
        const platToken = platAuth.result?.access_token;
        if (!platToken) throw new Error('Token plateforme non reçu');

        localStorage.setItem('slh_tuya_token', platToken);
        localStorage.setItem('slh_tuya_uid',   uid || '');
        localStorage.removeItem('slh_tuya_demo');
        setTuyaToken(platToken); setTuyaDemoMode(false);

        // Step 3: Fetch user's devices
        let res = uid
          ? await tuyaAPI.getUserDevices(tuyaId, tuyaSec, platToken, uid, tuyaReg)
          : null;

        // Fallback: list all project devices if UID path fails
        if (!res?.result?.length) {
          res = await tuyaAPI.getDevices(tuyaId, tuyaSec, platToken, tuyaReg);
        }
        if (!res?.result?.devices?.length && !res?.result?.length) {
          res = await tuyaAPI.getAllDevices(tuyaId, tuyaSec, platToken, tuyaReg);
        }

        const list = res?.result?.devices || res?.result?.list || res?.result || [];
        if (list.length) {
          devices = list.map(d => ({
            id:      d.id,
            name:    d.name || `Tuya ${d.id?.slice(-4)}`,
            serial:  d.id,
            model:   d.product_name || 'Smart Lock',
            battery: d.status?.find(s => s.code === 'battery_percentage')?.value ?? 75,
            online:  d.online ?? false,
            locked:  d.status?.find(s => s.code === 'door_lock_state')?.value !== 'unlock',
            fw:      d.sub ? 'Zigbee' : 'WiFi',
            lockId:  d.id,
          }));
        } else {
          devices = TUYA_DEMO_LOCKS;
          localStorage.setItem('slh_tuya_demo', '1');
          setTuyaDemoMode(true);
        }
      } catch (apiErr) {
        // Network/CORS error — demo mode with saved credentials
        devices = TUYA_DEMO_LOCKS;
        localStorage.setItem('slh_tuya_demo', '1');
        setTuyaDemoMode(true);
      }

      localStorage.setItem('slh_tuya',         '1');
      localStorage.setItem('slh_tuya_email',   tuyaEmail.trim());
      localStorage.setItem('slh_tuya_devices', JSON.stringify(devices));
      setTuyaDevices(devices);
      setConnTuya(true);
      setTuyaPass('');
    } catch (err) { setTuyaErr(err.message); }
    finally { setTuyaLoading(false); }
  };

  const disconnect = (prov) => {
    if (prov === 'ttlock')  { sessionStorage.removeItem('ttlock_token'); secureStorage.removeSensitive('ttlock_user'); secureStorage.removeSensitive('ttlock_client_id'); secureStorage.removeSensitive('ttlock_client_sec'); setTtToken(''); setTtlockDevices([]); setConnTTLock(false); }
    if (prov === 'tthotel') { ['slh_tthotel','slh_tthotel_user','slh_tthotel_token','slh_tthotel_refresh','slh_tthotel_devices','slh_tthotel_demo'].forEach(k => localStorage.removeItem(k)); setTthotelDevices([]); setTthToken(''); setTthRefresh(''); setTthDemoMode(false); setConnTTHotel(false); }
    if (prov === 'tuya')    { ['slh_tuya','slh_tuya_id','slh_tuya_secret','slh_tuya_token','slh_tuya_devices','slh_tuya_demo','slh_tuya_email','slh_tuya_uid'].forEach(k => localStorage.removeItem(k)); setTuyaDevices([]); setTuyaToken(''); setTuyaDemoMode(false); setTuyaEmail(''); setConnTuya(false); }
    if (selectedLock?.provider === prov) setSelectedLock(null);
  };

  /* ════════════════════════════════════════════════════════════
     VIEW: SETUP
  ════════════════════════════════════════════════════════════ */
  if (view === 'setup') {
    const anyConn = connTTLock || connTTHotel || connTuya;
    return (
      <div className="slh-root">
        <div className="slh-setup-header">
          <div className="slh-setup-header-icon"><Lock size={22}/></div>
          <div>
            <h1>Connexion Serrures Intelligentes</h1>
            <p>Entrez vos identifiants pour chaque fournisseur afin d'importer tous vos appareils</p>
          </div>
          {anyConn && (
            <button className="slh-setup-skip" onClick={() => { syncAll(); setView('devices'); }}>
              Accéder aux appareils <ArrowRight size={14}/>
            </button>
          )}
        </div>

        <div className="slh-setup-grid">

          {/* ── TTLock ── */}
          <div className={`slh-setup-card ${connTTLock ? 'connected' : ''}`}>
            <div className="slh-setup-card-head" style={{ borderTop: `3px solid #2563EB` }}>
              <span className="slh-setup-logo">🔐</span>
              <div>
                <span className="slh-setup-prov-name" style={{ color: '#2563EB' }}>TTLock</span>
                <span className="slh-setup-prov-desc">API officielle OAuth2 — connexion en temps réel</span>
              </div>
              {connTTLock && <span className="slh-setup-conn-badge"><CheckCircle2 size={15} color="#16A34A"/> Connecté</span>}
            </div>

            {connTTLock ? (
              <div className="slh-setup-connected-info">
                <Wifi size={14} color="#16A34A"/>
                <span>Connecté en tant que <strong>{ttUser}</strong></span>
                <span className="slh-setup-dev-count">{ttlockDevices.length} appareil{ttlockDevices.length !== 1 ? 's' : ''}</span>
                <button className="slh-setup-disconnect" onClick={() => disconnect('ttlock')}><Unlink size={12}/> Déconnecter</button>
              </div>
            ) : (
              <form onSubmit={connectTTLock} className="slh-setup-form">
                {ttErr && <div className="slh-setup-err"><AlertTriangle size={13}/> {ttErr}</div>}
                <div className="slh-sf-group">
                  <label>Email / Identifiant TTLock</label>
                  <div className="slh-sf-input"><User size={13}/><input type="text" value={ttUser} onChange={e => setTtUser(e.target.value)} placeholder="votre@email.com ou +212..." required/></div>
                </div>
                <div className="slh-sf-group">
                  <label>Mot de passe</label>
                  <div className="slh-sf-input">
                    <Lock size={13}/>
                    <input type={ttShowPw ? 'text' : 'password'} value={ttPass} onChange={e => setTtPass(e.target.value)} placeholder="••••••••" required/>
                    <button type="button" className="slh-sf-eye" onClick={() => setTtShowPw(v => !v)}>{ttShowPw ? <EyeOff size={13}/> : <Eye size={13}/>}</button>
                  </div>
                </div>
                <div className="slh-sf-hint"><Shield size={11}/> OAuth2 · Credentials chiffrés localement</div>
                <button type="submit" className="slh-sf-submit" style={{ background: '#2563EB' }} disabled={ttLoading}>
                  {ttLoading ? <><RefreshCcw size={13} className="slh-spin"/> Connexion…</> : <><Wifi size={13}/> Connecter TTLock</>}
                </button>
              </form>
            )}
          </div>

          {/* ── TTHotel Access ── */}
          <div className={`slh-setup-card ${connTTHotel ? 'connected' : ''}`}>
            <div className="slh-setup-card-head" style={{ borderTop: `3px solid #7C3AED` }}>
              <span className="slh-setup-logo">🏨</span>
              <div>
                <span className="slh-setup-prov-name" style={{ color: '#7C3AED' }}>TTHotel Access</span>
                <span className="slh-setup-prov-desc">Système hôtelier TTHotel — accès par token API</span>
              </div>
              {connTTHotel && <span className="slh-setup-conn-badge"><CheckCircle2 size={15} color="#16A34A"/> Connecté</span>}
            </div>

            {connTTHotel ? (
              <div className="slh-setup-connected-info">
                <Wifi size={14} color="#16A34A"/>
                <span>Connecté en tant que <strong>{tthUser || secureStorage.getSensitive('slh_tthotel_user', '')}</strong></span>
                <span className="slh-setup-dev-count">{tthotelDevices.length} appareil{tthotelDevices.length !== 1 ? 's' : ''}</span>
                {tthDemoMode && <span className="slh-demo-badge">Mode Démo</span>}
                <button className="slh-setup-disconnect" onClick={() => disconnect('tthotel')}><Unlink size={12}/> Déconnecter</button>
              </div>
            ) : (
              <form onSubmit={connectTTHotel} className="slh-setup-form">
                {tthErr && <div className="slh-setup-err"><AlertTriangle size={13}/> {tthErr}</div>}
                <div className="slh-sf-group">
                  <label>Email / Identifiant TTHotel</label>
                  <div className="slh-sf-input"><User size={13}/><input type="text" value={tthUser} onChange={e => setTthUser(e.target.value)} placeholder="votre@email.com" required/></div>
                </div>
                <div className="slh-sf-group">
                  <label>Mot de passe de l'application</label>
                  <div className="slh-sf-input">
                    <Lock size={13}/>
                    <input type={tthShowPw ? 'text' : 'password'} value={tthPass} onChange={e => setTthPass(e.target.value)} placeholder="••••••••" required/>
                    <button type="button" className="slh-sf-eye" onClick={() => setTthShowPw(v => !v)}>{tthShowPw ? <EyeOff size={13}/> : <Eye size={13}/>}</button>
                  </div>
                </div>
                <div className="slh-sf-hint"><Shield size={11}/> Connexion sécurisée — identifiants de votre compte TTHotel</div>
                <button type="submit" className="slh-sf-submit" style={{ background: '#7C3AED' }} disabled={tthLoading}>
                  {tthLoading ? <><RefreshCcw size={13} className="slh-spin"/> Connexion & import…</> : <><Wifi size={13}/> Connecter et importer les appareils</>}
                </button>
              </form>
            )}
          </div>

          {/* ── Tuya Smart ── */}
          <div className={`slh-setup-card ${connTuya ? 'connected' : ''}`}>
            <div className="slh-setup-card-head" style={{ borderTop: `3px solid #059669` }}>
              <span className="slh-setup-logo">🌿</span>
              <div>
                <span className="slh-setup-prov-name" style={{ color: '#059669' }}>Tuya Smart</span>
                <span className="slh-setup-prov-desc">Serrures WiFi/Zigbee — Tuya IoT Platform</span>
              </div>
              {connTuya && <span className="slh-setup-conn-badge"><CheckCircle2 size={15} color="#16A34A"/> Connecté</span>}
            </div>

            {connTuya ? (
              <div className="slh-setup-connected-info">
                <Wifi size={14} color="#16A34A"/>
                <span>Tuya Smart <strong>connecté</strong> {tuyaEmail && <span style={{color:'#64748B',fontWeight:400}}>· {tuyaEmail}</span>}</span>
                <span className="slh-setup-dev-count">{tuyaDevices.length} appareil{tuyaDevices.length !== 1 ? 's' : ''}</span>
                {tuyaDemoMode && <span className="slh-demo-badge">Mode Démo</span>}
                <button className="slh-setup-disconnect" onClick={() => disconnect('tuya')}><Unlink size={12}/> Déconnecter</button>
              </div>
            ) : (
              <form onSubmit={connectTuya} className="slh-setup-form">
                {tuyaErr && <div className="slh-setup-err"><AlertTriangle size={13}/> {tuyaErr}</div>}

                <div className="slh-sf-field">
                  <label className="slh-sf-label">Email / Identifiant Tuya</label>
                  <input
                    type="email"
                    className="slh-sf-input"
                    value={tuyaEmail}
                    onChange={e => setTuyaEmail(e.target.value)}
                    placeholder="votre@email.com"
                    autoComplete="username"
                  />
                </div>

                <div className="slh-sf-field">
                  <label className="slh-sf-label">Mot de passe de l'application</label>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <input
                      type={tuyaShowPw ? 'text' : 'password'}
                      className="slh-sf-input"
                      value={tuyaPass}
                      onChange={e => setTuyaPass(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      style={{flex:1}}
                    />
                    <button type="button" className="slh-sf-eye" onClick={() => setTuyaShowPw(v => !v)}>
                      {tuyaShowPw ? <EyeOff size={13}/> : <Eye size={13}/>}
                    </button>
                  </div>
                </div>

                <div className="slh-sf-hint">
                  <Shield size={11}/> Connectez-vous avec votre compte <strong>Smart Life</strong> ou <strong>Tuya Smart</strong>. Vos appareils s'importeront automatiquement.
                </div>

                <button
                  type="submit"
                  className="slh-sf-submit"
                  style={{ background: '#059669' }}
                  disabled={tuyaLoading || !tuyaEmail.trim() || !tuyaPass || !platformHasCreds}
                >
                  {tuyaLoading
                    ? <><RefreshCcw size={13} className="slh-spin"/> Connexion & import des appareils…</>
                    : <><Wifi size={13}/> Connecter et importer les appareils</>
                  }
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        {anyConn && (
          <div className="slh-setup-cta">
            <div className="slh-setup-cta-info">
              <CheckCircle2 size={16} color="#16A34A"/>
              <span>
                {[connTTLock && 'TTLock', connTTHotel && 'TTHotel', connTuya && 'Tuya'].filter(Boolean).join(' · ')} connecté{(connTTLock && connTTHotel) || (connTTLock && connTuya) || (connTTHotel && connTuya) ? 's' : ''}
                &nbsp;—&nbsp;
                <strong>{allDevices.length} appareil{allDevices.length !== 1 ? 's' : ''} prêt{allDevices.length !== 1 ? 's' : ''}</strong>
              </span>
            </div>
            <button className="slh-setup-cta-btn" onClick={() => { syncAll(); setView('devices'); }}>
              <Download size={15}/> Importer et voir les appareils <ArrowRight size={15}/>
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     VIEW: DEVICES
  ════════════════════════════════════════════════════════════ */
  const stats = {
    total:    allDevices.length,
    online:   allDevices.filter(l => l.online).length,
    assigned: Object.keys(assignments).filter(id => allDevices.some(l => l.id === id)).length,
    free:     allDevices.filter(l => !assignments[l.id]).length,
  };

  return (
    <div className="slh-root">

      {/* ── Topbar ── */}
      <div className="slh-topbar">
        <div className="slh-topbar-left">
          <div className="slh-title-icon"><Lock size={20}/></div>
          <div>
            <h1>Serrures Intelligentes</h1>
            <p>
              {[connTTLock && '🔐 TTLock', connTTHotel && '🏨 TTHotel', connTuya && '🌿 Tuya'].filter(Boolean).join(' · ')}
              {lastSync && ` · sync ${lastSync.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
        </div>
        <div className="slh-topbar-right">
          <button className="slh-btn-outline" onClick={() => setView('setup')}>
            <Settings size={14}/> Connexions
          </button>
          <button className="slh-btn-primary-sm" onClick={syncAll} disabled={syncing}>
            <Download size={14} className={syncing ? 'slh-spin' : ''}/>
            {syncing ? 'Synchronisation…' : `Importer les appareils`}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      <AnimatePresence>
        {apiError && (
          <motion.div className="slh-error-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AlertTriangle size={14}/> {apiError}
            <button onClick={() => setApiError(null)}><X size={13}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats ── */}
      <div className="slh-stats-row">
        {[
          { label: 'Total appareils', val: stats.total,    col: '#2563EB', bg: '#EFF6FF' },
          { label: 'En ligne',        val: stats.online,   col: '#15803D', bg: '#DCFCE7' },
          { label: 'Liées chambres',  val: stats.assigned, col: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Non assignées',   val: stats.free,     col: '#B45309', bg: '#FEF3C7' },
        ].map(s => (
          <div className="slh-stat-card" key={s.label}>
            <span className="slh-stat-val" style={{ color: s.col }}>{s.val}</span>
            <span className="slh-stat-lbl">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className={`slh-content ${selectedLock ? 'panel-open' : ''}`}>
        <div className="slh-list-area">

          {/* Controls */}
          <div className="slh-controls">
            <div className="slh-search-wrap">
              <Search size={14} color="#94A3B8"/>
              <input placeholder="Rechercher appareil ou chambre…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>

            {/* Provider filter pills */}
            <div className="slh-prov-pills">
              {[['all', 'Tous'], ['ttlock', '🔐 TTLock'], ['tthotel', '🏨 TTHotel'], ['tuya', '🌿 Tuya']].map(([id, lbl]) => {
                const cnt = id === 'all' ? allDevices.length : allDevices.filter(l => l.provider === id).length;
                if (id !== 'all' && cnt === 0) return null;
                const prov = PROVIDERS[id];
                return (
                  <button key={id}
                    className={`slh-prov-pill ${filterProv === id ? 'active' : ''}`}
                    style={filterProv === id && prov ? { background: prov.bg, color: prov.color, borderColor: prov.color + '60' } : {}}
                    onClick={() => setFilterProv(id)}
                  >
                    {lbl} <span>{cnt}</span>
                  </button>
                );
              })}
            </div>

            <select className="slh-filter-sel" value={filterStat} onChange={e => setFilterStat(e.target.value)}>
              <option value="all">Tous statuts</option>
              <option value="online">En ligne</option>
              <option value="offline">Hors ligne</option>
              <option value="low">Batterie faible</option>
              <option value="assigned">Liées</option>
              <option value="free">Non assignées</option>
            </select>

            <div className="slh-view-toggle">
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><LayoutGrid size={16}/></button>
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={16}/></button>
            </div>
          </div>

          {/* Empty */}
          {allDevices.length === 0 && (
            <div className="slh-empty-state">
              <div className="slh-empty-icon"><Lock size={44} strokeWidth={1}/></div>
              <h3>Aucun appareil importé</h3>
              <p>Cliquez sur <strong>Importer les appareils</strong> pour charger tous vos appareils connectés.</p>
              <button className="slh-sf-submit" style={{ background: '#2563EB', width: 'auto', padding: '10px 24px' }} onClick={syncAll} disabled={syncing}>
                <Download size={14}/> Importer les appareils
              </button>
            </div>
          )}

          {/* Device grid/list */}
          {allDevices.length > 0 && (
            <div className={`slh-locks-grid ${viewMode}`}>
              <AnimatePresence mode="popLayout">
                {filtered.map(lock => {
                  const prov     = PROVIDERS[lock.provider];
                  const room     = assignments[lock.id];
                  const roomInfo = PROPERTY_ROOMS.find(r => r.number === room);
                  const draft    = assignDraft[lock.id] || '';
                  const isActive = selectedLock?.id === lock.id;

                  return (
                    <motion.div key={lock.id}
                      className={`slh-lock-card ${viewMode === 'list' ? 'list' : ''} ${!lock.online ? 'offline' : ''} ${isActive ? 'active' : ''}`}
                      layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={isActive ? { borderColor: prov.color } : {}}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {/* Card top: click to open drawer */}
                          <div className="slh-card-clickable" onClick={() => openDrawer(lock)}>
                            <div className="slh-card-head">
                              <span className="slh-prov-badge" style={{ background: prov.bg, color: prov.color }}>
                                {prov.logo} {prov.short}
                              </span>
                              <span className={`slh-online-dot ${lock.online ? 'on' : 'off'}`}/>
                            </div>
                            <div className="slh-card-name">{lock.name}</div>
                            <div className="slh-card-serial">{lock.serial} · {lock.model}</div>
                            <BattBar level={lock.battery}/>
                          </div>

                          {/* Inline room assignment */}
                          <div className="slh-inline-assign">
                            {room ? (
                              <div className="slh-assigned-chip">
                                <Building2 size={11}/> Ch. {room} — {roomInfo?.label}
                                <button className="slh-chip-unlink" onClick={() => saveAssignment(lock.id, null)} title="Délier"><X size={10}/></button>
                              </div>
                            ) : (
                              <div className="slh-assign-row">
                                <select
                                  className="slh-assign-select"
                                  value={draft}
                                  onChange={e => setAssignDraft(d => ({ ...d, [lock.id]: e.target.value }))}
                                >
                                  <option value="">Lier à une chambre…</option>
                                  {PROPERTY_ROOMS.map(r => (
                                    <option key={r.number} value={r.number} disabled={usedRooms.has(r.number)}>
                                      {r.number} · {r.label}{usedRooms.has(r.number) ? ' (occupée)' : ''}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  className="slh-assign-btn-sm"
                                  disabled={!draft}
                                  style={{ background: draft ? prov.color : undefined }}
                                  onClick={() => saveAssignment(lock.id, draft)}
                                >
                                  <Link2 size={12}/>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        /* LIST ROW */
                        <div className="slh-list-row">
                          <span className="slh-prov-badge sm" style={{ background: prov.bg, color: prov.color }}>{prov.logo}</span>
                          <div className="slh-list-info" onClick={() => openDrawer(lock)} style={{ cursor: 'pointer' }}>
                            <strong>{lock.name}</strong>
                            <span>{lock.serial} · {prov.short}</span>
                          </div>
                          <BattBar level={lock.battery}/>
                          <span className={`slh-online-dot ${lock.online ? 'on' : 'off'}`}/>

                          {room ? (
                            <div className="slh-assigned-chip sm">
                              <Building2 size={11}/> {room}
                              <button className="slh-chip-unlink" onClick={() => saveAssignment(lock.id, null)}><X size={10}/></button>
                            </div>
                          ) : (
                            <div className="slh-assign-row">
                              <select className="slh-assign-select sm" value={draft} onChange={e => setAssignDraft(d => ({ ...d, [lock.id]: e.target.value }))}>
                                <option value="">Chambre…</option>
                                {PROPERTY_ROOMS.map(r => (
                                  <option key={r.number} value={r.number} disabled={usedRooms.has(r.number)}>{r.number}{usedRooms.has(r.number) ? ' ✓' : ''}</option>
                                ))}
                              </select>
                              <button className="slh-assign-btn-sm" disabled={!draft} style={{ background: draft ? prov.color : undefined }} onClick={() => saveAssignment(lock.id, draft)}>
                                <Link2 size={12}/>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && allDevices.length > 0 && (
                <div className="slh-no-results" style={{ gridColumn: '1/-1' }}>
                  <Search size={28} color="#CBD5E1" strokeWidth={1}/>
                  <span>Aucun appareil trouvé</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ═══ DETAIL DRAWER ════════════════════════════════ */}
        <AnimatePresence>
          {selectedLock && (() => {
            const prov = PROVIDERS[selectedLock.provider];
            const room = assignments[selectedLock.id];
            const roomInfo = PROPERTY_ROOMS.find(r => r.number === room);
            return (
              <motion.div className="slh-drawer" key="drawer"
                initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              >
                <div className="slh-drawer-head" style={{ borderTop: `3px solid ${prov.color}` }}>
                  <div className="slh-drawer-head-left">
                    <span className="slh-drawer-prov" style={{ background: prov.bg, color: prov.color }}>{prov.logo} {prov.name}</span>
                    <span className="slh-drawer-name">{selectedLock.name}</span>
                    <span className="slh-drawer-serial">{selectedLock.serial} · {selectedLock.model}</span>
                  </div>
                  <button className="slh-close-btn" onClick={() => setSelectedLock(null)}><X size={16}/></button>
                </div>

                <div className="slh-drawer-tabs">
                  {[['control','Contrôle'],['room','Chambre'],['logs','Logs']].map(([k,l]) => (
                    <button key={k} className={drawerTab === k ? 'active' : ''} onClick={() => setDrawerTab(k)}>{l}</button>
                  ))}
                </div>

                <div className="slh-drawer-body">
                  {/* CONTRÔLE */}
                  {drawerTab === 'control' && (
                    <div className="slh-tab-pane">
                      <div className="slh-drawer-batt-card" style={{ borderColor: prov.color + '30', background: prov.bg }}>
                        <div className="slh-drawer-batt-row">
                          <BattBar level={selectedLock.battery}/>
                          <span className={`slh-status-pill ${selectedLock.online ? 'on' : 'off'}`}>
                            {selectedLock.online ? <><Wifi size={11}/> En ligne</> : <><WifiOff size={11}/> Hors ligne</>}
                          </span>
                        </div>
                        <div className="slh-drawer-meta-row">
                          <span>Modèle: <strong>{selectedLock.model}</strong></span>
                          <span>Firmware: <strong>{selectedLock.fw || '—'}</strong></span>
                        </div>
                      </div>
                      <div className="slh-ctrl-grid">
                        <button className={`slh-toggle-btn ${selectedLock.locked ? 'locked' : 'unlocked'}`} onClick={() => toggleLock(selectedLock)}>
                          {selectedLock.locked ? <><Unlock size={16}/> Déverrouiller</> : <><Lock size={16}/> Verrouiller</>}
                        </button>
                        <button className="slh-pin-open-btn" onClick={() => { setShowPin(true); setPinValue(genPin()); setPinSuccess(false); }}>
                          <Key size={14}/> Code PIN
                        </button>
                        <button className="slh-pin-open-btn" style={{ background: '#F5F3FF', color: '#6D28D9', border: '1.5px solid #DDD6FE' }} onClick={() => setShowCardAccess(true)}>
                          <CreditCard size={14}/> Carte d'accès
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CHAMBRE */}
                  {drawerTab === 'room' && (
                    <div className="slh-tab-pane">
                      {room ? (
                        <div className="slh-assigned-room-card">
                          <div><Building2 size={22} color={prov.color}/></div>
                          <div>
                            <span className="slh-assigned-room-num">Chambre {room}</span>
                            {roomInfo && <span className="slh-assigned-room-name">{roomInfo.label} · {roomInfo.floor}</span>}
                          </div>
                          <button className="slh-unassign-btn" onClick={() => saveAssignment(selectedLock.id, null)}>
                            <Unlink size={13}/> Délier
                          </button>
                        </div>
                      ) : (
                        <div className="slh-no-room-card">
                          <Unlink size={28} color="#CBD5E1" strokeWidth={1.5}/>
                          <span>Non assignée</span>
                        </div>
                      )}
                      <div className="slh-room-assign-section">
                        <label>{room ? 'Réassigner' : 'Assigner à une chambre'}</label>
                        <select className="slh-room-select" value={assignDraft[selectedLock.id] || ''} onChange={e => setAssignDraft(d => ({ ...d, [selectedLock.id]: e.target.value }))}>
                          <option value="">— Choisir une chambre —</option>
                          {PROPERTY_ROOMS.map(r => (
                            <option key={r.number} value={r.number} disabled={usedRooms.has(r.number) && assignments[selectedLock.id] !== r.number}>
                              {r.number} · {r.label} ({r.floor}){usedRooms.has(r.number) && assignments[selectedLock.id] !== r.number ? ' — occupée' : ''}
                            </option>
                          ))}
                        </select>
                        <button className="slh-assign-btn" disabled={!assignDraft[selectedLock.id] || assignDraft[selectedLock.id] === room} style={{ background: prov.color }}
                          onClick={() => saveAssignment(selectedLock.id, assignDraft[selectedLock.id])}>
                          <Link2 size={14}/> {room ? 'Réassigner' : 'Lier la chambre'}
                        </button>
                      </div>
                      <div className="slh-rooms-overview">
                        <span className="slh-section-label">Toutes les chambres</span>
                        {PROPERTY_ROOMS.map(r => {
                          const lk = allDevices.find(l => assignments[l.id] === r.number);
                          const lp = lk ? PROVIDERS[lk.provider] : null;
                          return (
                            <div key={r.number} className="slh-room-overview-row">
                              <span className="slh-room-ov-num">{r.number}</span>
                              <span className="slh-room-ov-name">{r.label}</span>
                              {lk ? <span className="slh-room-ov-lock" style={{ color: lp.color }}>{lp.logo} {lk.name}</span>
                                  : <span className="slh-room-ov-none">Pas de serrure</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* LOGS */}
                  {drawerTab === 'logs' && (
                    <div className="slh-tab-pane">
                      {logsLoad ? (
                        <div className="slh-logs-loading"><RefreshCcw size={20} className="slh-spin"/> Chargement…</div>
                      ) : lockLogs.length > 0 ? lockLogs.map((log, i) => (
                        <div key={i} className={`slh-log-row ${log.ok ? 'ok' : 'fail'}`}>
                          <div className={`slh-log-dot ${log.ok ? 'ok' : 'fail'}`}/>
                          <div className="slh-log-info">
                            <span className="slh-log-user">{log.user}</span>
                            <span className="slh-log-method">{log.method}</span>
                          </div>
                          <span className="slh-log-time">{log.time} · {log.date}</span>
                        </div>
                      )) : <div className="slh-logs-empty"><History size={28} color="#CBD5E1" strokeWidth={1}/><span>Aucun log</span></div>}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* ══ PIN MODAL ══════════════════════════════════════ */}
      <AnimatePresence>
        {showPin && selectedLock && (
          <div className="slh-modal-overlay" onClick={() => setShowPin(false)}>
            <motion.div className="slh-modal slh-modal-sm" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} onClick={e => e.stopPropagation()}>
              <div className="slh-modal-head">
                <div className="slh-modal-prov-logo" style={{ background: '#EDE9FE' }}><Key size={20} color="#6D28D9"/></div>
                <div><h2>Code PIN</h2><p>{selectedLock.name}</p></div>
                <button className="slh-close-btn" onClick={() => setShowPin(false)}><X size={16}/></button>
              </div>
              {pinSuccess ? (
                <div className="slh-pin-success">
                  <Check size={32} color="#16A34A"/>
                  <span>Code PIN créé !</span>
                  <button
                    className="slh-encode-card-btn"
                    onClick={() => {
                      const room     = assignments[selectedLock.id] || '';
                      const roomInfo = PROPERTY_ROOMS.find(r => r.number === room);
                      setEncoderData({
                        guestName: pinName || 'Client',
                        room,
                        floor:    roomInfo?.floor || '',
                        checkIn:  pinStart ? pinStart.slice(0, 10) : '',
                        checkOut: pinEnd   ? pinEnd.slice(0, 10)   : '',
                        pin:      pinValue,
                      });
                      setShowPin(false);
                      setShowEncoder(true);
                    }}
                  >
                    <CreditCard size={14} /> Encoder la carte d'accès RFID
                  </button>
                </div>
              ) : (
                <div className="slh-auth-form">
                  <div className="slh-pin-display">
                    <span>Code PIN</span>
                    <div className="slh-pin-value">{pinValue}</div>
                    <div className="slh-pin-actions">
                      <button type="button" className="slh-pin-act-btn" onClick={() => setPinValue(genPin())}><RefreshCw size={14}/></button>
                      <button type="button" className="slh-pin-act-btn" onClick={() => { navigator.clipboard.writeText(pinValue); setPinCopied(true); setTimeout(() => setPinCopied(false), 1500); }}>
                        {pinCopied ? <Check size={14}/> : <Copy size={14}/>}
                      </button>
                    </div>
                  </div>
                  <div className="slh-field"><label>Nom de l'accès</label>
                    <div className="slh-input-wrap"><User size={13}/><input value={pinName} onChange={e => setPinName(e.target.value)} placeholder="Ex: Robert Chen"/></div>
                  </div>
                  <div className="slh-pin-types">
                    {[['periodic','Périodique'],['permanent','Permanent'],['one-time','Usage unique']].map(([k,l]) => (
                      <div key={k} className={`slh-pin-type ${pinType === k ? 'active' : ''}`} onClick={() => setPinType(k)}>{l}</div>
                    ))}
                  </div>
                  {pinType !== 'permanent' && (
                    <div className="slh-field-row">
                      <div className="slh-field"><label>Début</label><input type="datetime-local" value={pinStart} onChange={e => setPinStart(e.target.value)}/></div>
                      <div className="slh-field"><label>Fin</label><input type="datetime-local" value={pinEnd} onChange={e => setPinEnd(e.target.value)}/></div>
                    </div>
                  )}
                  <div className="slh-modal-foot">
                    <button className="slh-btn-ghost" onClick={() => setShowPin(false)}>Annuler</button>
                    <button className="slh-btn-primary" style={{ background: '#6D28D9' }} onClick={generatePin} disabled={pinLoading}>
                      {pinLoading ? <><RefreshCcw size={13} className="slh-spin"/> Envoi…</> : <><Key size={13}/> Valider PIN</>}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ CARD ENCODER MODAL ══════════════════════════════ */}
      <AnimatePresence>
        {showEncoder && (
          <CardEncoderModal
            open={showEncoder}
            onClose={() => setShowEncoder(false)}
            cardData={encoderData}
          />
        )}
      </AnimatePresence>

      {/* ══ CARD ACCESS MODAL ═══════════════════════════════ */}
      {showCardAccess && selectedLock && (() => {
        const assignedRoom = assignments[selectedLock.id] || '';
        const roomInfo     = PROPERTY_ROOMS.find(r => r.number === assignedRoom);
        return (
          <CardAccessModal
            open={showCardAccess}
            onClose={() => setShowCardAccess(false)}
            roomId={assignedRoom || selectedLock.id}
            roomName={roomInfo ? `Chambre ${roomInfo.number} — ${roomInfo.label}` : selectedLock.name}
            lockId={selectedLock.id}
            floor={roomInfo?.floor || ''}
            guestName={pinName}
            checkIn={pinStart ? pinStart.slice(0, 10) : ''}
            checkOut={pinEnd   ? pinEnd.slice(0, 10)   : ''}
          />
        );
      })()}
    </div>
  );
};

export default SmartLockHub;
