import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock, Unlock, Key, RefreshCcw, Search, Plus,
  Wifi, WifiOff, Battery, BatteryLow,
  History, Settings, X, Check, AlertTriangle, Building2,
  User, LayoutGrid, List,
  Eye, EyeOff, RefreshCw, Copy, Shield,
  Link2, Unlink, Signal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ttlockAPI } from '../../lib/ttlock';
import './SmartLockHub.css';

/* ════════════════════════════════════════════════════════════
   CONSTANTS & SEED DATA
════════════════════════════════════════════════════════════ */
const PROVIDERS = {
  ttlock: {
    id: 'ttlock', name: 'TTLock', shortName: 'TTLock',
    color: '#2563EB', bg: '#EFF6FF', logo: '🔐',
    desc: 'Intégration API officielle TTLock (OAuth2)',
    authType: 'credentials',
  },
  tthotel: {
    id: 'tthotel', name: 'TTHotel Access', shortName: 'TTHotel',
    color: '#7C3AED', bg: '#F5F3FF', logo: '🏨',
    desc: 'Système de serrures TTHotel — accès API hôtelier',
    authType: 'token',
  },
  tuya: {
    id: 'tuya', name: 'Tuya Smart', shortName: 'Tuya',
    color: '#059669', bg: '#F0FDF4', logo: '🌿',
    desc: 'Serrures WiFi/Zigbee Tuya IoT Platform',
    authType: 'key',
  },
};

const TTHOTEL_DEMO_LOCKS = [
  { id: 'TTH-001', name: 'TTHotel Pro #001', serial: 'THP-0001', model: 'Pro V2',  battery: 78, online: true,  locked: false, fw: '1.8.3' },
  { id: 'TTH-002', name: 'TTHotel Pro #002', serial: 'THP-0002', model: 'Pro V2',  battery: 55, online: true,  locked: false, fw: '1.8.3' },
  { id: 'TTH-003', name: 'TTHotel Lite #003',serial: 'THL-0003', model: 'Lite V1', battery: 88, online: true,  locked: false, fw: '1.5.2' },
  { id: 'TTH-004', name: 'TTHotel Pro #004', serial: 'THP-0004', model: 'Pro V2',  battery: 31, online: true,  locked: true,  fw: '1.8.3' },
  { id: 'TTH-005', name: 'TTHotel Pro #005', serial: 'THP-0005', model: 'Pro V2',  battery: 62, online: false, locked: true,  fw: '1.8.1' },
];

const TUYA_DEMO_LOCKS = [
  { id: 'TY-001', name: 'Tuya Smart Lock #001', serial: 'TY-0001', model: 'WiFi Lock',  battery: 15, online: false, locked: true,  fw: '2.0.1' },
  { id: 'TY-002', name: 'Tuya Smart Lock #002', serial: 'TY-0002', model: 'WiFi Lock',  battery: 92, online: true,  locked: true,  fw: '2.1.0' },
  { id: 'TY-003', name: 'Tuya NFC Lock #003',   serial: 'TY-0003', model: 'NFC+WiFi',   battery: 63, online: true,  locked: false, fw: '2.1.0' },
  { id: 'TY-004', name: 'Tuya Smart Lock #004', serial: 'TY-0004', model: 'WiFi Lock',  battery: 44, online: true,  locked: true,  fw: '2.0.5' },
];

const PROPERTY_ROOMS = [
  { number: '101', label: 'Suite Panorama',     floor: 'RDC',     type: 'Suite'      },
  { number: '102', label: 'Confort Standard',   floor: 'RDC',     type: 'Supérieure' },
  { number: '103', label: 'Chambre Deluxe',     floor: 'RDC',     type: 'Deluxe'     },
  { number: '104', label: 'Standard Classique', floor: 'RDC',     type: 'Standard'   },
  { number: '201', label: 'Suite Étoile',       floor: 'Étage 1', type: 'Suite'      },
  { number: '202', label: 'Vue Panoramique',    floor: 'Étage 1', type: 'Deluxe'     },
  { number: '203', label: 'Famille Spacieuse',  floor: 'Étage 1', type: 'Familiale'  },
  { number: '304', label: 'Suite Penthouse',    floor: 'Étage 2', type: 'Suite'      },
  { number: '305', label: 'Vue Jardins',        floor: 'Étage 2', type: 'Supérieure' },
  { number: '306', label: 'PMR Accessible',     floor: 'Étage 2', type: 'PMR'        },
];

const genPin = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ════════════════════════════════════════════════════════════
   BATTERY ICON
════════════════════════════════════════════════════════════ */
const BattIcon = ({ level, size = 14 }) => {
  if (level > 60) return <Battery size={size} color="#16A34A"/>;
  if (level > 25) return <Battery size={size} color="#D97706"/>;
  return <BatteryLow size={size} color="#DC2626"/>;
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const SmartLockHub = () => {

  /* ── Provider connection states ── */
  const [connTTLock,  setConnTTLock]  = useState(!!localStorage.getItem('ttlock_token'));
  const [connTTHotel, setConnTTHotel] = useState(!!localStorage.getItem('slh_tthotel'));
  const [connTuya,    setConnTuya]    = useState(!!localStorage.getItem('slh_tuya'));

  /* ── TTLock auth ── */
  const [ttUser,     setTtUser]     = useState(localStorage.getItem('ttlock_user') || '');
  const [ttPass,     setTtPass]     = useState('');
  const [ttToken,    setTtToken]    = useState(localStorage.getItem('ttlock_token') || '');
  const [showPass,   setShowPass]   = useState(false);
  const [authErr,    setAuthErr]    = useState(null);
  const [authLoad,   setAuthLoad]   = useState(false);

  /* ── TTHotel auth form ── */
  const [tthApiUrl,     setTthApiUrl]     = useState(localStorage.getItem('slh_tthotel_url') || 'https://api.tthotel.com');
  const [tthToken,      setTthToken]      = useState(localStorage.getItem('slh_tthotel_token') || '');
  const [tthHotelCode,  setTthHotelCode]  = useState(localStorage.getItem('slh_tthotel_code') || '');

  /* ── Tuya auth form ── */
  const [tuyaClientId, setTuyaClientId] = useState(localStorage.getItem('slh_tuya_id') || '');
  const [tuyaSecret,   setTuyaSecret]   = useState(localStorage.getItem('slh_tuya_secret') || '');
  const [tuyaRegion,   setTuyaRegion]   = useState(localStorage.getItem('slh_tuya_region') || 'eu');

  /* ── Locks aggregated from all providers ── */
  const [ttlockLocks, setTtlockLocks] = useState([]);
  const [apiLoading,  setApiLoading]  = useState(false);
  const [apiError,    setApiError]    = useState(null);
  const [lastSync,    setLastSync]    = useState(null);

  /* ── UI state ── */
  const [activeProvider, setActiveProvider] = useState('all'); // 'all' | 'ttlock' | 'tthotel' | 'tuya'
  const [viewMode,       setViewMode]       = useState('grid');
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [selectedLock,   setSelectedLock]   = useState(null);
  const [connectModal,   setConnectModal]   = useState(null); // 'ttlock' | 'tthotel' | 'tuya'

  /* ── Room assignments: { lockId: roomNumber } ── */
  const [assignments, setAssignments] = useState(() => {
    try { return JSON.parse(localStorage.getItem('slh_assignments') || '{}'); }
    catch { return { 'TTH-001': '102', 'TTH-002': '202', 'TTH-003': '304' }; }
  });
  const [assignTarget, setAssignTarget] = useState(''); // selected room in drawer

  /* ── PIN generation ── */
  const [pinValue,   setPinValue]   = useState(genPin);
  const [pinName,    setPinName]    = useState('');
  const [pinType,    setPinType]    = useState('periodic');
  const [pinStart,   setPinStart]   = useState('');
  const [pinEnd,     setPinEnd]     = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinCopied,  setPinCopied]  = useState(false);
  const [showPin,    setShowPin]    = useState(false);

  /* ── Lock logs ── */
  const [lockLogs,    setLockLogs]    = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [drawerTab,   setDrawerTab]   = useState('control'); // 'control' | 'room' | 'logs'

  /* ════ FETCH TTLock locks ════ */
  const fetchTTLockLocks = useCallback(async (token = ttToken) => {
    if (!token) return;
    setApiLoading(true); setApiError(null);
    try {
      const data = await ttlockAPI.getLocks(token);
      if (data?.list) {
        setTtlockLocks(data.list.map(l => ({
          id: String(l.lockId), name: l.lockAlias || `Serrure ${l.lockId}`,
          provider: 'ttlock', serial: String(l.lockId),
          model: l.lockVersion ? 'TTLock Pro' : 'TTLock',
          battery: l.electricQuantity ?? 85,
          online: !!l.lockVersion, locked: l.lockStatus === 0,
          signal: l.rssi ? Math.min(100, Math.round((l.rssi + 100) * 2)) : 80,
          fw: l.lockVersion?.protocolVersion || '—', lockId: l.lockId,
        })));
        setLastSync(new Date());
      } else if (data?.errcode && data.errcode !== 0) {
        throw new Error(data.errmsg || 'Erreur API TTLock');
      }
    } catch (err) {
      setApiError(err.message || 'Impossible de charger les serrures TTLock');
    } finally { setApiLoading(false); }
  }, [ttToken]);

  useEffect(() => { if (ttToken && connTTLock) fetchTTLockLocks(); }, []);

  /* ════ ALL LOCKS aggregated ════ */
  const allLocks = [
    ...ttlockLocks.map(l => ({ ...l, provider: 'ttlock' })),
    ...(connTTHotel ? TTHOTEL_DEMO_LOCKS.map(l => ({ ...l, provider: 'tthotel', lockId: l.id })) : []),
    ...(connTuya    ? TUYA_DEMO_LOCKS.map(l    => ({ ...l, provider: 'tuya',    lockId: l.id })) : []),
  ];

  const filtered = allLocks.filter(l => {
    const matchProv   = activeProvider === 'all' || l.provider === activeProvider;
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || (assignments[l.id] && assignments[l.id].includes(search));
    const matchStatus = filterStatus === 'all'
      || (filterStatus === 'online' && l.online)
      || (filterStatus === 'offline' && !l.online)
      || (filterStatus === 'low' && l.battery < 20)
      || (filterStatus === 'assigned' && assignments[l.id])
      || (filterStatus === 'unassigned' && !assignments[l.id]);
    return matchProv && matchSearch && matchStatus;
  });

  const stats = {
    total:    allLocks.length,
    online:   allLocks.filter(l => l.online).length,
    offline:  allLocks.filter(l => !l.online).length,
    assigned: Object.keys(assignments).filter(id => allLocks.some(l => l.id === id)).length,
    lowBatt:  allLocks.filter(l => l.battery < 20).length,
  };

  /* ════ CONNECT HANDLERS ════ */
  const handleConnectTTLock = async (e) => {
    e.preventDefault();
    setAuthLoad(true); setAuthErr(null);
    try {
      const data = await ttlockAPI.getToken(ttUser, ttPass);
      if (data?.access_token) {
        setTtToken(data.access_token);
        localStorage.setItem('ttlock_token', data.access_token);
        localStorage.setItem('ttlock_user', ttUser);
        setConnTTLock(true);
        setConnectModal(null);
        setTtPass('');
        await fetchTTLockLocks(data.access_token);
      } else throw new Error(data?.errmsg || 'Identifiants TTLock incorrects');
    } catch (err) { setAuthErr(err.message); }
    finally { setAuthLoad(false); }
  };

  const handleConnectTTHotel = (e) => {
    e.preventDefault();
    if (!tthToken || !tthHotelCode) { setAuthErr('Renseignez le token et le code hôtel.'); return; }
    localStorage.setItem('slh_tthotel', '1');
    localStorage.setItem('slh_tthotel_url', tthApiUrl);
    localStorage.setItem('slh_tthotel_token', tthToken);
    localStorage.setItem('slh_tthotel_code', tthHotelCode);
    setConnTTHotel(true);
    setConnectModal(null);
    setAuthErr(null);
    // Pre-assign demo locks to rooms
    setAssignments(prev => {
      const updated = { ...prev, 'TTH-001': '102', 'TTH-002': '202', 'TTH-003': '304' };
      localStorage.setItem('slh_assignments', JSON.stringify(updated));
      return updated;
    });
  };

  const handleConnectTuya = (e) => {
    e.preventDefault();
    if (!tuyaClientId || !tuyaSecret) { setAuthErr('Renseignez le Client ID et le Secret.'); return; }
    localStorage.setItem('slh_tuya', '1');
    localStorage.setItem('slh_tuya_id', tuyaClientId);
    localStorage.setItem('slh_tuya_secret', tuyaSecret);
    localStorage.setItem('slh_tuya_region', tuyaRegion);
    setConnTuya(true);
    setConnectModal(null);
    setAuthErr(null);
  };

  const handleDisconnect = (provider) => {
    if (provider === 'ttlock') {
      localStorage.removeItem('ttlock_token');
      localStorage.removeItem('ttlock_user');
      setTtToken(''); setTtlockLocks([]); setConnTTLock(false);
    } else if (provider === 'tthotel') {
      localStorage.removeItem('slh_tthotel');
      setConnTTHotel(false);
    } else if (provider === 'tuya') {
      localStorage.removeItem('slh_tuya');
      setConnTuya(false);
    }
    if (selectedLock?.provider === provider) setSelectedLock(null);
  };

  /* ════ LOCK CONTROLS ════ */
  const toggleLock = async (lock) => {
    if (lock.provider === 'ttlock' && ttToken) {
      try {
        setTtlockLocks(prev => prev.map(l => l.id === lock.id ? { ...l, locked: !l.locked } : l));
        if (lock.locked) await ttlockAPI.unlock(ttToken, lock.lockId);
        else             await ttlockAPI.lock(ttToken, lock.lockId);
        if (selectedLock?.id === lock.id) setSelectedLock(l => ({ ...l, locked: !l.locked }));
      } catch (err) { setApiError(err.message); }
    } else {
      // Simulated toggle for TTHotel / Tuya
      const update = (list, setter) => {
        setter(list.map(l => l.id === lock.id ? { ...l, locked: !l.locked } : l));
      };
      if (lock.provider === 'tthotel') {
        TTHOTEL_DEMO_LOCKS.forEach(l => { if (l.id === lock.id) l.locked = !l.locked; });
      } else {
        TUYA_DEMO_LOCKS.forEach(l => { if (l.id === lock.id) l.locked = !l.locked; });
      }
      if (selectedLock?.id === lock.id) setSelectedLock(l => ({ ...l, locked: !l.locked }));
    }
  };

  /* ════ ROOM ASSIGNMENT ════ */
  const assignRoom = (lockId, roomNumber) => {
    const updated = roomNumber ? { ...assignments, [lockId]: roomNumber } : { ...assignments };
    if (!roomNumber) delete updated[lockId];
    setAssignments(updated);
    localStorage.setItem('slh_assignments', JSON.stringify(updated));
    if (selectedLock?.id === lockId) setSelectedLock(l => ({ ...l, assignedRoom: roomNumber || null }));
    setAssignTarget('');
  };

  const usedRooms = new Set(Object.values(assignments));

  /* ════ LOAD LOGS ════ */
  const loadLogs = async (lock) => {
    if (lock.provider === 'ttlock' && ttToken && lock.lockId) {
      setLogsLoading(true);
      try {
        const data = await ttlockAPI.getLockLogs(ttToken, lock.lockId);
        if (data?.list) {
          setLockLogs(data.list.map(log => ({
            time: new Date(log.lockDate).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
            date: new Date(log.lockDate).toLocaleDateString('fr'),
            user: log.username || log.keyboardPwdName || 'Inconnu',
            method: log.recordType === 1 ? 'code' : log.recordType === 3 ? 'bluetooth' : 'rfid',
            success: log.success === 1,
          })));
        }
      } catch { setLockLogs([]); }
      finally { setLogsLoading(false); }
    } else {
      // Simulated logs for other providers
      setLockLogs([
        { time: '08:32', date: '17/05', user: 'Robert Chen',    method: 'code',      success: true  },
        { time: '14:15', date: '17/05', user: 'Maintenance',    method: 'bluetooth', success: true  },
        { time: '19:00', date: '16/05', user: 'Marie Laurent',  method: 'rfid',      success: true  },
        { time: '23:47', date: '15/05', user: 'Tentative inconnue', method: 'code', success: false },
      ]);
    }
  };

  const openLock = (lock) => {
    setSelectedLock({ ...lock, assignedRoom: assignments[lock.id] || null });
    setDrawerTab('control');
    setAssignTarget(assignments[lock.id] || '');
    loadLogs(lock);
  };

  /* ════ PIN ════ */
  const generatePin = async () => {
    if (!selectedLock) return;
    setPinLoading(true); setPinSuccess(false);
    try {
      if (selectedLock.provider === 'ttlock' && ttToken) {
        const startMs = pinStart ? new Date(pinStart).getTime() : Date.now();
        const endMs   = pinEnd   ? new Date(pinEnd).getTime()   : Date.now() + 7 * 86400000;
        await ttlockAPI.createPasscode(ttToken, selectedLock.lockId, {
          passcode: pinValue,
          passcodeName: pinName || `Accès ${new Date().toLocaleDateString('fr')}`,
          startDate: startMs, endDate: endMs,
          type: pinType === 'one-time' ? 4 : pinType === 'permanent' ? 2 : 1,
        });
      }
      // For TTHotel & Tuya: simulated success
      setPinSuccess(true);
      setTimeout(() => { setPinSuccess(false); setShowPin(false); }, 1800);
    } catch (err) { setApiError(`PIN non créé: ${err.message}`); }
    finally { setPinLoading(false); }
  };

  /* ════ LOCK CARD COMPONENT ════ */
  const LockCard = ({ lock }) => {
    const prov  = PROVIDERS[lock.provider];
    const room  = assignments[lock.id];
    const roomInfo = PROPERTY_ROOMS.find(r => r.number === room);
    return (
      <motion.div
        className={`slh-lock-card ${viewMode === 'list' ? 'list' : ''} ${!lock.online ? 'offline' : ''} ${selectedLock?.id === lock.id ? 'active' : ''}`}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => openLock(lock)}
      >
        {viewMode === 'grid' ? (
          <>
            <div className="slh-card-head">
              <span className="slh-prov-badge" style={{ background: prov.bg, color: prov.color }}>
                {prov.logo} {prov.shortName}
              </span>
              <span className={`slh-online-dot ${lock.online ? 'on' : 'off'}`}/>
            </div>
            <div className="slh-card-name">{lock.name}</div>
            <div className="slh-card-serial">{lock.serial} · {lock.model}</div>
            <div className="slh-card-batt">
              <BattIcon level={lock.battery} size={13}/>
              <div className="slh-batt-track">
                <div className="slh-batt-fill" style={{
                  width: `${lock.battery}%`,
                  background: lock.battery < 20 ? '#EF4444' : lock.battery < 40 ? '#F59E0B' : '#16A34A'
                }}/>
              </div>
              <span className={lock.battery < 20 ? 'slh-batt-crit' : ''}>{lock.battery}%</span>
            </div>
            <div className="slh-card-foot">
              {roomInfo ? (
                <span className="slh-room-chip"><Building2 size={10}/> {room} · {roomInfo.label}</span>
              ) : (
                <span className="slh-no-room"><Unlink size={10}/> Non assignée</span>
              )}
              <span className={`slh-lock-state ${lock.locked ? 'locked' : 'unlocked'}`}>
                {lock.locked ? <><Lock size={11}/> Verr.</> : <><Unlock size={11}/> Ouv.</>}
              </span>
            </div>
          </>
        ) : (
          <div className="slh-list-row">
            <span className="slh-prov-badge sm" style={{ background: prov.bg, color: prov.color }}>
              {prov.logo}
            </span>
            <div className="slh-list-info">
              <strong>{lock.name}</strong>
              <span>{lock.serial} · {prov.shortName}</span>
            </div>
            <div className="slh-list-meta">
              {roomInfo ? <span className="slh-room-chip">{room}</span> : <span className="slh-no-room">—</span>}
              <BattIcon level={lock.battery} size={13}/>
              <span className={lock.battery < 20 ? 'slh-batt-crit' : ''}>{lock.battery}%</span>
              <span className={`slh-online-dot ${lock.online ? 'on' : 'off'}`}/>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <div className="slh-root">

      {/* ══ HEADER ══════════════════════════════════════════ */}
      <div className="slh-topbar">
        <div className="slh-topbar-left">
          <div className="slh-title-icon"><Lock size={20}/></div>
          <div>
            <h1>Command Center Serrures IoT</h1>
            <p>TTLock · TTHotel Access · Tuya Smart — Gestion unifiée multi-fournisseurs</p>
          </div>
        </div>
        <div className="slh-topbar-right">
          {(connTTLock || connTTHotel || connTuya) && lastSync && (
            <span className="slh-sync-lbl">Sync {lastSync.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>
          )}
          {connTTLock && (
            <button className="slh-btn-outline" onClick={() => fetchTTLockLocks()} disabled={apiLoading}>
              <RefreshCcw size={14} className={apiLoading ? 'slh-spin' : ''}/> Actualiser
            </button>
          )}
        </div>
      </div>

      {/* ══ PROVIDER CONNECTION BAR ══════════════════════════ */}
      <div className="slh-provider-bar">
        {Object.values(PROVIDERS).map(prov => {
          const connected = prov.id === 'ttlock' ? connTTLock : prov.id === 'tthotel' ? connTTHotel : connTuya;
          return (
            <div key={prov.id} className={`slh-prov-card ${connected ? 'connected' : ''}`} style={{ borderColor: connected ? prov.color + '40' : '#E2E8F0' }}>
              <div className="slh-prov-card-left">
                <span className="slh-prov-card-logo">{prov.logo}</span>
                <div>
                  <span className="slh-prov-card-name" style={{ color: connected ? prov.color : '#334155' }}>{prov.name}</span>
                  <span className="slh-prov-card-desc">{prov.desc}</span>
                </div>
              </div>
              <div className="slh-prov-card-right">
                {connected ? (
                  <>
                    <span className="slh-conn-badge">
                      <span className="slh-conn-dot"/>Connecté · {allLocks.filter(l => l.provider === prov.id).length} serrures
                    </span>
                    <button className="slh-disconnect-btn" onClick={() => handleDisconnect(prov.id)}>
                      <WifiOff size={12}/> Déconnecter
                    </button>
                  </>
                ) : (
                  <button className="slh-connect-btn" style={{ background: prov.color }} onClick={() => { setConnectModal(prov.id); setAuthErr(null); }}>
                    <Wifi size={13}/> Connecter
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* API Error banner */}
      <AnimatePresence>
        {apiError && (
          <motion.div className="slh-error-bar" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <AlertTriangle size={14}/> {apiError}
            <button onClick={() => setApiError(null)}><X size={13}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ STATS ROW ════════════════════════════════════════ */}
      {allLocks.length > 0 && (
        <div className="slh-stats-row">
          {[
            { label: 'Total serrures', value: stats.total,    icon: <Lock size={17}/>,        col: '#2563EB', bg: '#EFF6FF' },
            { label: 'En ligne',       value: stats.online,   icon: <Wifi size={17}/>,        col: '#15803D', bg: '#DCFCE7' },
            { label: 'Hors ligne',     value: stats.offline,  icon: <WifiOff size={17}/>,     col: '#B91C1C', bg: '#FEE2E2' },
            { label: 'Assignées',      value: stats.assigned, icon: <Building2 size={17}/>,   col: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Batterie faible',value: stats.lowBatt,  icon: <BatteryLow size={17}/>,  col: '#B45309', bg: '#FEF3C7' },
          ].map(s => (
            <div className="slh-stat-card" key={s.label}>
              <div className="slh-stat-icon" style={{ background: s.bg, color: s.col }}>{s.icon}</div>
              <div>
                <span className="slh-stat-val">{s.value}</span>
                <span className="slh-stat-lbl">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ CONTENT AREA ═════════════════════════════════════ */}
      <div className={`slh-content ${selectedLock ? 'panel-open' : ''}`}>

        {/* ─── Left: lock list area ─── */}
        <div className="slh-list-area">

          {/* No provider connected */}
          {!connTTLock && !connTTHotel && !connTuya && (
            <div className="slh-empty-state">
              <div className="slh-empty-icon"><Lock size={48} strokeWidth={1}/></div>
              <h3>Aucun fournisseur connecté</h3>
              <p>Connectez TTLock, TTHotel Access ou Tuya Smart pour gérer vos serrures IoT depuis cette interface.</p>
              <div className="slh-empty-btns">
                {Object.values(PROVIDERS).map(p => (
                  <button key={p.id} className="slh-empty-connect" style={{ borderColor: p.color, color: p.color }} onClick={() => { setConnectModal(p.id); setAuthErr(null); }}>
                    {p.logo} Connecter {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          {allLocks.length > 0 && (
            <>
              <div className="slh-controls">
                <div className="slh-search-wrap">
                  <Search size={14} color="#94A3B8"/>
                  <input placeholder="Rechercher serrure ou chambre…" value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
                <select className="slh-filter-sel" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">Tous</option>
                  <option value="online">En ligne</option>
                  <option value="offline">Hors ligne</option>
                  <option value="low">Batterie faible</option>
                  <option value="assigned">Assignées</option>
                  <option value="unassigned">Non assignées</option>
                </select>
                <div className="slh-view-toggle">
                  <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><LayoutGrid size={16}/></button>
                  <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={16}/></button>
                </div>
              </div>

              {/* Provider filter tabs */}
              <div className="slh-prov-tabs">
                {[['all', 'Toutes', ''], ['ttlock', '🔐 TTLock', '#2563EB'], ['tthotel', '🏨 TTHotel', '#7C3AED'], ['tuya', '🌿 Tuya', '#059669']].map(([id, label, color]) => {
                  const count = id === 'all' ? allLocks.length : allLocks.filter(l => l.provider === id).length;
                  if (id !== 'all' && count === 0) return null;
                  return (
                    <button key={id}
                      className={`slh-prov-tab ${activeProvider === id ? 'active' : ''}`}
                      style={activeProvider === id && color ? { color, borderBottomColor: color } : {}}
                      onClick={() => setActiveProvider(id)}
                    >
                      {label} <span className="slh-tab-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Locks grid/list */}
              <div className={`slh-locks-grid ${viewMode}`}>
                <AnimatePresence mode="popLayout">
                  {filtered.map(lock => <LockCard key={lock.id} lock={lock}/>)}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <div className="slh-no-results">
                    <Search size={32} color="#CBD5E1" strokeWidth={1}/>
                    <span>Aucune serrure trouvée</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ═══ LOCK DETAIL DRAWER ══════════════════════════ */}
        <AnimatePresence>
          {selectedLock && (() => {
            const prov     = PROVIDERS[selectedLock.provider];
            const room     = assignments[selectedLock.id];
            const roomInfo = PROPERTY_ROOMS.find(r => r.number === room);

            return (
              <motion.div className="slh-drawer" key="drawer"
                initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 40, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              >
                {/* Drawer header */}
                <div className="slh-drawer-head" style={{ borderTop: `3px solid ${prov.color}` }}>
                  <div className="slh-drawer-head-left">
                    <span className="slh-drawer-prov" style={{ background: prov.bg, color: prov.color }}>
                      {prov.logo} {prov.name}
                    </span>
                    <span className="slh-drawer-name">{selectedLock.name}</span>
                    <span className="slh-drawer-serial">{selectedLock.serial}</span>
                  </div>
                  <button className="slh-close-btn" onClick={() => setSelectedLock(null)}><X size={16}/></button>
                </div>

                {/* Tabs */}
                <div className="slh-drawer-tabs">
                  {[['control','Contrôle'],['room','Chambre'],['logs','Logs']].map(([k,l]) => (
                    <button key={k} className={drawerTab === k ? 'active' : ''} onClick={() => setDrawerTab(k)}>{l}</button>
                  ))}
                </div>

                <div className="slh-drawer-body">

                  {/* ── TAB: CONTRÔLE ── */}
                  {drawerTab === 'control' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="slh-tab-pane">
                      {/* Battery */}
                      <div className="slh-drawer-batt-card" style={{ borderColor: prov.color + '30', background: prov.bg }}>
                        <div className="slh-drawer-batt-row">
                          <BattIcon level={selectedLock.battery} size={16}/>
                          <div className="slh-batt-track" style={{ flex: 1 }}>
                            <div className="slh-batt-fill" style={{
                              width: `${selectedLock.battery}%`,
                              background: selectedLock.battery < 20 ? '#EF4444' : selectedLock.battery < 40 ? '#F59E0B' : '#16A34A'
                            }}/>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>{selectedLock.battery}%</span>
                          <span className={`slh-status-pill ${selectedLock.online ? 'on' : 'off'}`}>
                            {selectedLock.online ? <><Wifi size={11}/> En ligne</> : <><WifiOff size={11}/> Hors ligne</>}
                          </span>
                        </div>
                        <div className="slh-drawer-meta-row">
                          <span>Modèle: <strong>{selectedLock.model}</strong></span>
                          <span>Firmware: <strong>{selectedLock.fw || '—'}</strong></span>
                          {selectedLock.signal && <span>Signal: <strong>{selectedLock.signal}%</strong></span>}
                        </div>
                      </div>

                      {/* Lock/Unlock */}
                      <div className="slh-ctrl-grid">
                        <button
                          className={`slh-toggle-btn ${selectedLock.locked ? 'locked' : 'unlocked'}`}
                          onClick={() => toggleLock(selectedLock)}
                        >
                          {selectedLock.locked ? <><Unlock size={16}/> Déverrouiller</> : <><Lock size={16}/> Verrouiller</>}
                        </button>
                        <button className="slh-pin-open-btn" onClick={() => { setShowPin(true); setPinValue(genPin()); setPinSuccess(false); }}>
                          <Key size={14}/> Générer PIN
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── TAB: CHAMBRE (room assignment) ── */}
                  {drawerTab === 'room' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="slh-tab-pane">
                      {/* Current assignment */}
                      {room ? (
                        <div className="slh-assigned-room-card">
                          <div className="slh-assigned-room-icon"><Building2 size={22} color={prov.color}/></div>
                          <div>
                            <span className="slh-assigned-room-num">Chambre {room}</span>
                            {roomInfo && <span className="slh-assigned-room-name">{roomInfo.label} · {roomInfo.floor}</span>}
                          </div>
                          <button className="slh-unassign-btn" onClick={() => assignRoom(selectedLock.id, null)}>
                            <Unlink size={13}/> Délier
                          </button>
                        </div>
                      ) : (
                        <div className="slh-no-room-card">
                          <Unlink size={28} color="#CBD5E1" strokeWidth={1.5}/>
                          <span>Serrure non assignée à une chambre</span>
                        </div>
                      )}

                      {/* Room selector */}
                      <div className="slh-room-assign-section">
                        <label>{room ? 'Réassigner à une autre chambre' : 'Assigner à une chambre'}</label>
                        <select className="slh-room-select" value={assignTarget} onChange={e => setAssignTarget(e.target.value)}>
                          <option value="">— Choisir une chambre —</option>
                          {PROPERTY_ROOMS.map(r => (
                            <option key={r.number} value={r.number} disabled={usedRooms.has(r.number) && assignments[selectedLock.id] !== r.number}>
                              {r.number} · {r.label} ({r.floor}){usedRooms.has(r.number) && assignments[selectedLock.id] !== r.number ? ' — occupée' : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          className="slh-assign-btn"
                          disabled={!assignTarget || assignTarget === room}
                          style={{ background: prov.color }}
                          onClick={() => assignRoom(selectedLock.id, assignTarget)}
                        >
                          <Link2 size={14}/> {room ? 'Réassigner' : 'Lier la chambre'}
                        </button>
                      </div>

                      {/* Property rooms overview */}
                      <div className="slh-rooms-overview">
                        <span className="slh-section-label">Chambres de la propriété</span>
                        {PROPERTY_ROOMS.map(r => {
                          const lockForRoom = allLocks.find(l => assignments[l.id] === r.number);
                          const lockProv = lockForRoom ? PROVIDERS[lockForRoom.provider] : null;
                          return (
                            <div key={r.number} className="slh-room-overview-row">
                              <span className="slh-room-ov-num">{r.number}</span>
                              <span className="slh-room-ov-name">{r.label}</span>
                              {lockForRoom ? (
                                <span className="slh-room-ov-lock" style={{ color: lockProv.color }}>
                                  {lockProv.logo} {lockForRoom.name}
                                </span>
                              ) : (
                                <span className="slh-room-ov-none">Pas de serrure</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ── TAB: LOGS ── */}
                  {drawerTab === 'logs' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="slh-tab-pane">
                      {logsLoading ? (
                        <div className="slh-logs-loading"><RefreshCcw size={20} className="slh-spin" /> Chargement des logs…</div>
                      ) : lockLogs.length > 0 ? lockLogs.map((log, i) => (
                        <div key={i} className={`slh-log-row ${log.success ? 'ok' : 'fail'}`}>
                          <div className={`slh-log-dot ${log.success ? 'ok' : 'fail'}`}/>
                          <div className="slh-log-info">
                            <span className="slh-log-user">{log.user}</span>
                            <span className="slh-log-method">{log.method}</span>
                          </div>
                          <span className="slh-log-time">{log.time} · {log.date}</span>
                        </div>
                      )) : (
                        <div className="slh-logs-empty"><History size={28} color="#CBD5E1" strokeWidth={1}/><span>Aucun log disponible</span></div>
                      )}
                    </motion.div>
                  )}

                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>

      {/* ══ CONNECT MODALS ═══════════════════════════════════ */}
      <AnimatePresence>
        {connectModal && (
          <div className="slh-modal-overlay" onClick={() => setConnectModal(null)}>
            <motion.div className="slh-modal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} onClick={e => e.stopPropagation()}>
              <div className="slh-modal-head">
                <div className="slh-modal-prov-logo">{PROVIDERS[connectModal].logo}</div>
                <div>
                  <h2>Connexion {PROVIDERS[connectModal].name}</h2>
                  <p>{PROVIDERS[connectModal].desc}</p>
                </div>
                <button className="slh-close-btn" onClick={() => setConnectModal(null)}><X size={16}/></button>
              </div>

              {authErr && <div className="slh-auth-err"><AlertTriangle size={13}/> {authErr}</div>}

              {/* TTLock form */}
              {connectModal === 'ttlock' && (
                <form onSubmit={handleConnectTTLock} className="slh-auth-form">
                  <div className="slh-field">
                    <label>Email / Username TTLock</label>
                    <div className="slh-input-wrap"><User size={13}/><input type="text" value={ttUser} onChange={e => setTtUser(e.target.value)} placeholder="votre@email.com" required/></div>
                  </div>
                  <div className="slh-field">
                    <label>Mot de passe</label>
                    <div className="slh-input-wrap">
                      <Lock size={13}/>
                      <input type={showPass ? 'text' : 'password'} value={ttPass} onChange={e => setTtPass(e.target.value)} placeholder="••••••••" required/>
                      <button type="button" className="slh-eye-btn" onClick={() => setShowPass(v => !v)}>{showPass ? <EyeOff size={13}/> : <Eye size={13}/>}</button>
                    </div>
                  </div>
                  <div className="slh-field-info"><Shield size={12}/> OAuth2 sécurisé — Client ID: {import.meta.env.VITE_TTLOCK_CLIENT_ID?.slice(0,8) || '8754dc08'}…</div>
                  <div className="slh-modal-foot">
                    <button type="button" className="slh-btn-ghost" onClick={() => setConnectModal(null)}>Annuler</button>
                    <button type="submit" className="slh-btn-primary" style={{ background: '#2563EB' }} disabled={authLoad}>
                      {authLoad ? <><RefreshCcw size={13} className="slh-spin"/> Connexion…</> : <><Wifi size={13}/> Se connecter</>}
                    </button>
                  </div>
                </form>
              )}

              {/* TTHotel form */}
              {connectModal === 'tthotel' && (
                <form onSubmit={handleConnectTTHotel} className="slh-auth-form">
                  <div className="slh-field">
                    <label>API Endpoint TTHotel</label>
                    <div className="slh-input-wrap"><Shield size={13}/><input type="url" value={tthApiUrl} onChange={e => setTthApiUrl(e.target.value)} placeholder="https://api.tthotel.com" required/></div>
                  </div>
                  <div className="slh-field">
                    <label>Code Hôtel</label>
                    <div className="slh-input-wrap"><Building2 size={13}/><input type="text" value={tthHotelCode} onChange={e => setTthHotelCode(e.target.value)} placeholder="HTL-XXXX" required/></div>
                  </div>
                  <div className="slh-field">
                    <label>Access Token</label>
                    <div className="slh-input-wrap"><Key size={13}/><input type="password" value={tthToken} onChange={e => setTthToken(e.target.value)} placeholder="eyJhbGci…" required/></div>
                  </div>
                  <div className="slh-modal-foot">
                    <button type="button" className="slh-btn-ghost" onClick={() => setConnectModal(null)}>Annuler</button>
                    <button type="submit" className="slh-btn-primary" style={{ background: '#7C3AED' }}>
                      <Wifi size={13}/> Connecter TTHotel
                    </button>
                  </div>
                </form>
              )}

              {/* Tuya form */}
              {connectModal === 'tuya' && (
                <form onSubmit={handleConnectTuya} className="slh-auth-form">
                  <div className="slh-field">
                    <label>Client ID (Access ID)</label>
                    <div className="slh-input-wrap"><Key size={13}/><input type="text" value={tuyaClientId} onChange={e => setTuyaClientId(e.target.value)} placeholder="xxxxxxxxxxxxxxxx" required/></div>
                  </div>
                  <div className="slh-field">
                    <label>Client Secret</label>
                    <div className="slh-input-wrap"><Shield size={13}/><input type="password" value={tuyaSecret} onChange={e => setTuyaSecret(e.target.value)} placeholder="••••••••••••••••" required/></div>
                  </div>
                  <div className="slh-field">
                    <label>Région du Cloud Tuya</label>
                    <select className="slh-select" value={tuyaRegion} onChange={e => setTuyaRegion(e.target.value)}>
                      <option value="eu">Europe (eu.iot.tuya.com)</option>
                      <option value="us">Amérique (us.iot.tuya.com)</option>
                      <option value="cn">Chine (cn.iot.tuya.com)</option>
                      <option value="in">Inde (in.iot.tuya.com)</option>
                    </select>
                  </div>
                  <div className="slh-modal-foot">
                    <button type="button" className="slh-btn-ghost" onClick={() => setConnectModal(null)}>Annuler</button>
                    <button type="submit" className="slh-btn-primary" style={{ background: '#059669' }}>
                      <Wifi size={13}/> Connecter Tuya Smart
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ PIN MODAL ════════════════════════════════════════ */}
      <AnimatePresence>
        {showPin && selectedLock && (
          <div className="slh-modal-overlay" onClick={() => setShowPin(false)}>
            <motion.div className="slh-modal slh-modal-sm" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} onClick={e => e.stopPropagation()}>
              <div className="slh-modal-head">
                <div className="slh-modal-prov-logo" style={{ background: '#EDE9FE' }}><Key size={20} color="#6D28D9"/></div>
                <div><h2>Générer un Code PIN</h2><p>Accès temporaire — {selectedLock.name}</p></div>
                <button className="slh-close-btn" onClick={() => setShowPin(false)}><X size={16}/></button>
              </div>
              {pinSuccess ? (
                <div className="slh-pin-success"><Check size={32} color="#16A34A"/><span>Code PIN créé avec succès !</span></div>
              ) : (
                <div className="slh-auth-form">
                  <div className="slh-pin-display">
                    <span>Code PIN</span>
                    <div className="slh-pin-value">{pinValue}</div>
                    <div className="slh-pin-actions">
                      <button type="button" className="slh-pin-act-btn" onClick={() => setPinValue(genPin())} title="Régénérer"><RefreshCw size={14}/></button>
                      <button type="button" className="slh-pin-act-btn" onClick={() => { navigator.clipboard.writeText(pinValue); setPinCopied(true); setTimeout(() => setPinCopied(false), 1500); }}>
                        {pinCopied ? <Check size={14}/> : <Copy size={14}/>}
                      </button>
                    </div>
                  </div>
                  <div className="slh-field"><label>Nom de l'accès</label>
                    <div className="slh-input-wrap"><User size={13}/><input value={pinName} onChange={e => setPinName(e.target.value)} placeholder="Ex: Client – Robert Chen"/></div>
                  </div>
                  <div className="slh-pin-types">
                    {[['periodic','Périodique'], ['permanent','Permanent'], ['one-time','Usage unique']].map(([k,l]) => (
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
    </div>
  );
};

export default SmartLockHub;
