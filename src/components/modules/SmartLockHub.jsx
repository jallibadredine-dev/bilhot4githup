import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock, Key, Smartphone, RefreshCcw, Search, Plus, ShieldCheck,
  Zap, Wifi, WifiOff, Battery, BatteryLow, Unlock,
  History, Settings, X, Check,
  Bluetooth, Timer, Clock,
  AlertTriangle, MoreHorizontal, Building2,
  Signal, Activity, ShieldAlert, Cpu, Power,
  BarChart3, Bell, User, LayoutGrid, List,
  CalendarDays, Eye, EyeOff, RefreshCw, LogIn,
  ChevronDown, Send, Copy, ExternalLink, Shield,
  Fingerprint, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ttlockAPI } from '../../lib/ttlock';
import './SmartLockHub.css';

const BRAND_COLORS = {
  TTLock: '#3b82f6',
  TTHotel: '#10b981',
  Tuya: '#f59e0b',
  Igloohome: '#8b5cf6',
};

const SmartLockHub = () => {
  // Auth state
  const [ttUsername, setTtUsername] = useState(localStorage.getItem('ttlock_user') || '');
  const [ttPassword, setTtPassword] = useState('');
  const [accessToken, setAccessToken] = useState(localStorage.getItem('ttlock_token') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(!localStorage.getItem('ttlock_token'));

  // Data state
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [apiError, setApiError] = useState(null);

  // UI state
  const [selectedLock, setSelectedLock] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // PIN generation state
  const [pinValue, setPinValue] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [pinName, setPinName] = useState('');
  const [pinType, setPinType] = useState('periodic');
  const [pinStart, setPinStart] = useState('');
  const [pinEnd, setPinEnd] = useState('');
  const [pinLoading, setPinLoading] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // New lock form
  const [newLockBrand, setNewLockBrand] = useState('TTLock');
  const [newLockId, setNewLockId] = useState('');
  const [newLockName, setNewLockName] = useState('');

  // Lock logs
  const [lockLogs, setLockLogs] = useState([]);
  const [lockLogLoading, setLockLogLoading] = useState(false);

  const isAuthenticated = !!accessToken;

  const fetchLocks = useCallback(async (token = accessToken) => {
    if (!token) return;
    setLoading(true);
    setApiError(null);
    try {
      const data = await ttlockAPI.getLocks(token);
      if (data?.list) {
        const mapped = data.list.map(lock => ({
          id: lock.lockId,
          name: lock.lockAlias || lock.lockName || `Serrure ${lock.lockId}`,
          brand: 'TTLock',
          model: lock.lockVersion?.showAdminKbpwdFlag ? 'TTLock Pro' : 'TTLock',
          battery: lock.electricQuantity ?? null,
          status: lock.lockVersion ? 'online' : 'offline',
          locked: lock.lockStatus === 0 ? true : false,
          signal: lock.rssi ? Math.min(100, Math.round((lock.rssi + 100) * 2)) : null,
          lockId: lock.lockId,
          rawData: lock,
          logs: [],
          modes: ['code', 'bluetooth'],
        }));
        setLocks(mapped);
        setLastSync(new Date());
      } else if (data?.errcode !== undefined && data.errcode !== 0) {
        throw new Error(data.errmsg || 'Erreur TTLock');
      }
    } catch (err) {
      setApiError(err.message || 'Impossible de charger les serrures TTLock');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) fetchLocks();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const data = await ttlockAPI.getToken(ttUsername, ttPassword);
      if (data?.access_token) {
        setAccessToken(data.access_token);
        localStorage.setItem('ttlock_token', data.access_token);
        localStorage.setItem('ttlock_user', ttUsername);
        if (data.refresh_token) localStorage.setItem('ttlock_refresh', data.refresh_token);
        setShowConfig(false);
        setTtPassword('');
        await fetchLocks(data.access_token);
      } else {
        throw new Error(data?.errmsg || 'Identifiants incorrects');
      }
    } catch (err) {
      setAuthError(err.message || 'Connexion TTLock échouée');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('ttlock_token');
    localStorage.removeItem('ttlock_refresh');
    setAccessToken('');
    setLocks([]);
    setShowConfig(true);
  };

  const toggleLock = async (lock) => {
    if (!accessToken) return;
    const origLocks = [...locks];
    setLocks(prev => prev.map(l => l.id === lock.id ? { ...l, locked: !l.locked } : l));
    try {
      if (lock.locked) {
        await ttlockAPI.unlock(accessToken, lock.lockId || lock.id);
      } else {
        await ttlockAPI.lock(accessToken, lock.lockId || lock.id);
      }
    } catch (err) {
      setLocks(origLocks);
      setApiError(`Commande échouée: ${err.message}`);
    }
  };

  const loadLockLogs = async (lock) => {
    if (!accessToken || !lock.lockId) return;
    setLockLogLoading(true);
    try {
      const data = await ttlockAPI.getLockLogs(accessToken, lock.lockId);
      if (data?.list) {
        setLockLogs(data.list.map(log => ({
          id: log.lockRecordId,
          time: new Date(log.lockDate).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }),
          date: new Date(log.lockDate).toLocaleDateString('fr'),
          user: log.username || log.keyboardPwdName || 'Inconnu',
          method: log.recordType === 1 ? 'code' : log.recordType === 3 ? 'bluetooth' : log.recordType === 7 ? 'rfid' : 'autre',
          status: log.success === 1 ? 'success' : 'failed',
        })));
      }
    } catch (err) {
      setLockLogs([]);
    } finally {
      setLockLogLoading(false);
    }
  };

  const handleSelectLock = (lock) => {
    setSelectedLock(lock);
    loadLockLogs(lock);
  };

  const generatePin = async () => {
    if (!selectedLock || !accessToken) return;
    setPinLoading(true);
    setPinSuccess(false);
    try {
      const startMs = pinStart ? new Date(pinStart).getTime() : Date.now();
      const endMs = pinEnd ? new Date(pinEnd).getTime() : Date.now() + 7 * 86400000;
      await ttlockAPI.createPasscode(accessToken, selectedLock.lockId || selectedLock.id, {
        passcode: pinValue,
        passcodeName: pinName || `Accès ${new Date().toLocaleDateString('fr')}`,
        startDate: startMs,
        endDate: endMs,
        type: pinType === 'one-time' ? 4 : pinType === 'permanent' ? 2 : 1,
      });
      setPinSuccess(true);
      setTimeout(() => { setPinSuccess(false); setShowPinModal(false); }, 1500);
    } catch (err) {
      setApiError(`PIN non créé: ${err.message}`);
    } finally {
      setPinLoading(false);
    }
  };

  const refreshPin = () => {
    setPinValue(Math.floor(100000 + Math.random() * 900000).toString());
  };

  const copyPin = () => {
    navigator.clipboard.writeText(pinValue);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 1500);
  };

  const filtered = locks.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all'
      || (filter === 'online' && l.status === 'online')
      || (filter === 'offline' && l.status === 'offline')
      || (filter === 'low-battery' && l.battery !== null && l.battery < 20);
    return matchSearch && matchFilter;
  });

  const stats = {
    total: locks.length,
    online: locks.filter(l => l.status === 'online').length,
    lowBattery: locks.filter(l => l.battery !== null && l.battery < 20).length,
    offline: locks.filter(l => l.status === 'offline').length,
  };

  // ── CONFIG PANEL (Login) ────────────────────────────────────────────────
  if (showConfig || !isAuthenticated) {
    return (
      <div className="lock-portal luxe-theme">
        <div className="mesh-bg"></div>
        <div className="lock-container">
          <div className="lock-config-center">
            <motion.div
              className="lock-config-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="lock-config-icon"><Lock size={28} /></div>
              <h2>Connexion TTLock</h2>
              <p>Connectez votre compte TTLock pour gérer vos serrures connectées en temps réel.</p>

              {authError && (
                <div className="lock-error-banner">
                  <AlertTriangle size={14} />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="lock-config-form">
                <div className="lock-field">
                  <label>Email / Username TTLock</label>
                  <div className="lock-input-wrap">
                    <User size={15} className="lock-input-icon" />
                    <input type="text" value={ttUsername} onChange={e => setTtUsername(e.target.value)} placeholder="votre@email.com" required />
                  </div>
                </div>
                <div className="lock-field">
                  <label>Mot de passe</label>
                  <div className="lock-input-wrap">
                    <Lock size={15} className="lock-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={ttPassword}
                      onChange={e => setTtPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" className="lock-input-toggle" onClick={() => setShowPassword(v => !v)}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="lock-config-submit" disabled={authLoading}>
                  {authLoading ? <><RefreshCcw size={15} className="cm-spin" /> Connexion...</> : <><LogIn size={15} /> Se connecter</>}
                </button>
              </form>

              <div className="lock-config-info">
                <Shield size={13} /> OAuth2 sécurisé · Client ID: {import.meta.env.VITE_TTLOCK_CLIENT_ID || '8754dc08...'}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lock-portal luxe-theme">
      <div className="mesh-bg"></div>
      <div className="lock-container">

        {/* Header */}
        <header className="lock-header">
          <div className="lock-title-group">
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              Command Center IoT
            </motion.h1>
            <p>TTLock · Supervision temps réel · {locks.length} serrure{locks.length !== 1 ? 's' : ''} connectée{locks.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="lock-header-actions">
            {lastSync && <span className="lock-sync-label">Sync {lastSync.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}</span>}
            <button className="btn-secondary" onClick={() => fetchLocks()} disabled={loading}>
              <RefreshCcw size={16} className={loading ? 'cm-spin' : ''} /> Actualiser
            </button>
            <button className="btn-secondary" onClick={() => setShowConfig(true)}>
              <Settings size={16} />
            </button>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Déployer
            </button>
          </div>
        </header>

        {/* API Error */}
        {apiError && (
          <div className="cm-error-banner" style={{ margin: '0 0 1rem' }}>
            <AlertTriangle size={15} /> <span>{apiError}</span>
            <button onClick={() => setApiError(null)}><X size={13} /></button>
          </div>
        )}

        {/* Stats */}
        <div className="lock-stats-grid">
          {[
            { filterVal: 'all', label: 'Total', val: stats.total, icon: <Cpu />, color: 'blue' },
            { filterVal: 'online', label: 'En ligne', val: stats.online, icon: <Wifi />, color: 'green' },
            { filterVal: 'low-battery', label: 'Batterie faible', val: stats.lowBattery, icon: <BatteryLow />, color: 'red' },
            { filterVal: 'offline', label: 'Hors ligne', val: stats.offline, icon: <ShieldAlert />, color: 'amber' },
          ].map((s, i) => (
            <motion.div
              key={i}
              className={`l-stat-card clickable ${filter === s.filterVal ? 'active-filter' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setFilter(s.filterVal)}
            >
              <div className={`l-stat-icon ${s.color}`}>{s.icon}</div>
              <div className="l-stat-info">
                <strong>{s.val}</strong>
                <span>{s.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="lock-control-bar">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Rechercher une serrure..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="view-toggle-group">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={17} /></button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><LayoutGrid size={17} /></button>
          </div>
        </div>

        {/* Empty State */}
        {!loading && locks.length === 0 && (
          <div className="lock-empty">
            <Lock size={40} />
            <h3>Aucune serrure trouvée</h3>
            <p>Ajoutez des serrures TTLock dans votre compte pour les voir apparaître ici.</p>
          </div>
        )}

        {/* Loading */}
        {loading && locks.length === 0 && (
          <div className="lock-empty">
            <RefreshCcw size={32} className="cm-spin" />
            <p>Chargement des serrures TTLock...</p>
          </div>
        )}

        {/* Locks Grid/List */}
        <div className={`lock-display-area ${viewMode}`}>
          <AnimatePresence mode="popLayout">
            {filtered.map(lock => (
              <motion.div
                key={lock.id}
                className={`luxe-lock-item ${viewMode}-view ${lock.status}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleSelectLock(lock)}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="l-card-header">
                      <div className="l-card-brand" style={{ color: BRAND_COLORS[lock.brand], background: BRAND_COLORS[lock.brand] + '18' }}>
                        {lock.brand}
                      </div>
                      <div className={`luxe-status-tag ${lock.status}`}>
                        <div className="dot" />
                        <span>{lock.status === 'online' ? 'EN LIGNE' : 'HORS LIGNE'}</span>
                      </div>
                    </div>
                    <div className="l-card-body">
                      <h3>{lock.name}</h3>
                      <p className="l-card-loc"><Building2 size={12} /> {lock.model}</p>
                    </div>
                    <div className="l-card-metrics">
                      <div className="l-metric">
                        <Battery size={13} />
                        <span>{lock.battery !== null ? `${lock.battery}%` : '—'}</span>
                      </div>
                      {lock.signal !== null && (
                        <div className="l-metric">
                          <Signal size={13} />
                          <span>{lock.signal}%</span>
                        </div>
                      )}
                    </div>
                    <div className="l-card-footer">
                      <div className={`lock-state-badge ${lock.locked ? 'locked' : 'unlocked'}`}>
                        {lock.locked ? <Lock size={14} /> : <Unlock size={14} />}
                        {lock.locked ? 'Verrouillé' : 'Déverrouillé'}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="l-list-row">
                    <div className={`l-list-icon ${lock.status === 'online' ? 'online' : 'offline'}`}>
                      {lock.locked ? <Lock size={18} /> : <Unlock size={18} />}
                    </div>
                    <div className="l-list-info">
                      <strong>{lock.name}</strong>
                      <span>{lock.brand} · {lock.model}</span>
                    </div>
                    <div className="l-list-right">
                      {lock.battery !== null && (
                        <span className={`l-battery ${lock.battery < 20 ? 'low' : ''}`}>
                          <Battery size={13} /> {lock.battery}%
                        </span>
                      )}
                      <div className={`luxe-status-tag ${lock.status}`} style={{ marginLeft: 8 }}>
                        <div className="dot" />
                        <span>{lock.status === 'online' ? 'EN LIGNE' : 'HORS LIGNE'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Detail Drawer */}
        <AnimatePresence>
          {selectedLock && (
            <div className="luxe-drawer-overlay" onClick={() => setSelectedLock(null)}>
              <motion.div
                className="luxe-detail-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="drawer-header">
                  <div className="drawer-lock-icon" style={{ color: BRAND_COLORS[selectedLock.brand] }}>
                    <Lock size={28} />
                  </div>
                  <div>
                    <h3>{selectedLock.name}</h3>
                    <span>{selectedLock.brand} · {selectedLock.model}</span>
                  </div>
                  <button className="drawer-close" onClick={() => setSelectedLock(null)}><X size={20} /></button>
                </div>

                <div className="drawer-tabs">
                  <button className="active">CONTRÔLE</button>
                  <button onClick={() => loadLockLogs(selectedLock)}>LOGS</button>
                </div>

                <div className="drawer-body">
                  <div className="d-section">
                    <h4>Commandes</h4>
                    <div className="d-actions">
                      <button
                        className="d-btn-action main"
                        onClick={() => toggleLock(selectedLock)}
                        style={{ background: selectedLock.locked ? '#3b82f6' : '#ef4444' }}
                      >
                        {selectedLock.locked ? <><Unlock size={18} /> Déverrouiller</> : <><Lock size={18} /> Verrouiller</>}
                      </button>
                      <button className="d-btn-action outline" onClick={() => setShowPinModal(true)}>
                        <Key size={18} /> Générer PIN
                      </button>
                    </div>
                  </div>

                  <div className="d-section">
                    <h4>Diagnostic</h4>
                    <div className="d-stats">
                      <div className="d-stat">
                        <span>Batterie</span>
                        <strong className={selectedLock.battery < 20 ? 'text-red' : ''}>{selectedLock.battery !== null ? `${selectedLock.battery}%` : '—'}</strong>
                      </div>
                      <div className="d-stat">
                        <span>Signal</span>
                        <strong>{selectedLock.signal !== null ? `${selectedLock.signal}%` : '—'}</strong>
                      </div>
                      <div className="d-stat">
                        <span>Statut</span>
                        <strong style={{ color: selectedLock.status === 'online' ? '#10b981' : '#ef4444' }}>
                          {selectedLock.status === 'online' ? 'En ligne' : 'Hors ligne'}
                        </strong>
                      </div>
                      <div className="d-stat">
                        <span>Lock ID</span>
                        <strong style={{ fontSize: '0.75rem' }}>{selectedLock.lockId || selectedLock.id}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="d-section" style={{ flex: 1 }}>
                    <div className="d-header-flex">
                      <h4>Logs d'Accès</h4>
                      {lockLogLoading && <RefreshCcw size={14} className="cm-spin" />}
                    </div>
                    <div className="d-mini-timeline">
                      {lockLogs.length > 0 ? lockLogs.map((log, i) => (
                        <div key={i} className={`mini-log ${log.status}`}>
                          <div className="m-time">{log.time}</div>
                          <div className="m-content">
                            <p><strong>{log.user}</strong> <span className={`m-tag ${log.method}`}>{log.method}</span></p>
                            <span>{log.date}</span>
                          </div>
                        </div>
                      )) : (
                        <p className="empty-text">{lockLogLoading ? 'Chargement...' : 'Aucun log récent.'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: GENERATE PIN */}
        <AnimatePresence>
          {showPinModal && selectedLock && (
            <div className="luxe-modal-overlay">
              <motion.div
                className="luxe-modal pin-modal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <button className="modal-close" onClick={() => setShowPinModal(false)}><X size={18} /></button>
                <div className="modal-header">
                  <div className="modal-icon gold"><Key size={22} /></div>
                  <h2>Générer un Code PIN</h2>
                  <p>Accès temporaire pour <strong>{selectedLock.name}</strong></p>
                </div>

                {pinSuccess ? (
                  <div className="pin-success">
                    <Check size={32} />
                    <p>PIN créé avec succès sur la serrure !</p>
                  </div>
                ) : (
                  <div className="pin-generator-content">
                    <div className="pin-display">
                      <span>Code PIN</span>
                      <div className="pin-value">{pinValue}</div>
                      <div className="pin-display-actions">
                        <button className="btn-icon-soft" onClick={refreshPin} title="Générer nouveau"><RefreshCw size={15} /></button>
                        <button className="btn-icon-soft" onClick={copyPin} title="Copier">
                          {copiedPin ? <Check size={15} /> : <Copy size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Nom de l'accès</label>
                      <input type="text" placeholder="Ex: Client – Marie Dupont" value={pinName} onChange={e => setPinName(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label>Type d'accès</label>
                      <div className="access-types">
                        {[
                          { id: 'periodic', label: 'Périodique', icon: <CalendarDays size={14} /> },
                          { id: 'permanent', label: 'Permanent', icon: <Clock size={14} /> },
                          { id: 'one-time', label: 'Usage unique', icon: <History size={14} /> },
                        ].map(t => (
                          <div key={t.id} className={`a-type ${pinType === t.id ? 'active' : ''}`} onClick={() => setPinType(t.id)}>
                            {t.icon} {t.label}
                          </div>
                        ))}
                      </div>
                    </div>

                    {pinType !== 'permanent' && (
                      <div className="form-row">
                        <div className="form-group">
                          <label>Début</label>
                          <input type="datetime-local" value={pinStart} onChange={e => setPinStart(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Fin</label>
                          <input type="datetime-local" value={pinEnd} onChange={e => setPinEnd(e.target.value)} />
                        </div>
                      </div>
                    )}

                    <div className="modal-actions">
                      <button className="btn-secondary" onClick={() => setShowPinModal(false)}>Annuler</button>
                      <button className="btn-primary" onClick={generatePin} disabled={pinLoading}>
                        {pinLoading ? <><RefreshCcw size={14} className="cm-spin" /> Envoi...</> : <><Key size={14} /> Valider sur serrure</>}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: CONFIG (si déjà connecté mais veut changer) */}
        <AnimatePresence>
          {showConfig && isAuthenticated && (
            <div className="luxe-modal-overlay">
              <motion.div className="luxe-modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <button className="modal-close" onClick={() => setShowConfig(false)}><X size={18} /></button>
                <div className="modal-header">
                  <div className="modal-icon"><Settings size={22} /></div>
                  <h2>Configuration TTLock</h2>
                  <p>Gérez votre connexion API TTLock.</p>
                </div>
                <div className="modal-form">
                  <div className="lock-config-info" style={{ marginTop: 0 }}>
                    <Shield size={13} /> Connecté en tant que <strong>{ttUsername || 'Utilisateur TTLock'}</strong>
                  </div>
                  <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                    <button className="btn-secondary" onClick={() => setShowConfig(false)}>Fermer</button>
                    <button className="btn-danger" onClick={handleDisconnect}><WifiOff size={14} /> Déconnecter</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default SmartLockHub;
