import React, { useState, useEffect } from 'react';
import { 
  Lock, Key, Smartphone, RefreshCcw, Search, Plus, ShieldCheck,
  Zap, Fingerprint, Wifi, WifiOff, Battery, BatteryLow, Unlock,
  History, Settings, ChevronRight, ChevronDown, X, Check,
  Bluetooth, CreditCard, Timer, Clock, Radio, Download,
  AlertTriangle, Info, MoreHorizontal, Star, Building2,
  Signal, Activity, ShieldAlert, Cpu, Share2, Power,
  ArrowUpRight, BarChart3, Bell, User, LayoutGrid, List,
  CalendarDays, SmartphoneNfc
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartLockHub.css';

// -------- Mock Data Enhanced --------
const INITIAL_LOCKS = [
  {
    id: 1, brand: 'TTLock', name: 'Suite 101 – Entrée Principale',
    model: 'TTLock Pro G3', location: 'Villa Sunrise', floor: '1F',
    battery: 82, status: 'online', locked: true, signal: 92,
    code: '8492-45', firmwareVersion: '3.12.1',
    autoLock: 30, passageMode: false,
    logs: [
      { id: 101, time: '10:42', user: 'Marie Dupont', method: 'code', status: 'success', date: 'Aujourd\'hui', duration: 'Check-in imminent' },
      { id: 102, time: '09:15', user: 'Staff – Lucas', method: 'fingerprint', status: 'success', date: 'Aujourd\'hui', duration: 'Nettoyage' },
      { id: 103, time: '08:30', user: 'Inconnu', method: 'code', status: 'failed', date: 'Aujourd\'hui', duration: 'Alerte Intrusion' },
    ],
    modes: ['code', 'bluetooth', 'fingerprint', 'rfid']
  },
  {
    id: 2, brand: 'Tuya', name: 'Apartment 204 – Porte',
    model: 'Tuya Smart ZL01', location: 'Ocean View Apt', floor: '2F',
    battery: 15, status: 'online', locked: false, signal: 75,
    code: '1103-88', firmwareVersion: '2.0.4',
    autoLock: 15, passageMode: true,
    logs: [
      { id: 201, time: '11:00', user: 'Jean Martin', method: 'rfid', status: 'success', date: 'Hier', duration: 'Passage' },
    ],
    modes: ['code', 'bluetooth', 'rfid']
  },
  {
    id: 3, brand: 'TTHotel', name: 'Salle de Gym – Accès',
    model: 'TTHotel H5', location: 'Main Tower', floor: 'RDC',
    battery: 65, status: 'online', locked: true, signal: 88,
    code: '9920-12', firmwareVersion: '1.8.2',
    autoLock: 5, passageMode: false,
    logs: [
      { id: 301, time: '11:20', user: 'Admin', method: 'code', status: 'success', date: 'Hier', duration: 'Maintenance' },
    ],
    modes: ['code', 'bluetooth', 'rfid', 'fingerprint']
  },
  {
    id: 4, brand: 'TTLock', name: 'Service Room 5',
    model: 'TTLock Lite', location: 'Main Tower', floor: '3F',
    battery: 91, status: 'offline', locked: true, signal: 0,
    code: '4452-90', firmwareVersion: '3.10.0',
    autoLock: 60, passageMode: false,
    logs: [],
    modes: ['code', 'rfid']
  }
];

const BRAND_COLORS = {
  TTLock: '#3b82f6',
  Tuya: '#f59e0b',
  TTHotel: '#10b981',
};

const SmartLockHub = () => {
  const [locks, setLocks] = useState(INITIAL_LOCKS);
  const [selectedLock, setSelectedLock] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  
  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Form states for new lock
  const [newLockBrand, setNewLockBrand] = useState('TTLock');
  const [newLockName, setNewLockName] = useState('');
  const [newLockLocation, setNewLockLocation] = useState('Villa Sunrise');

  const filtered = locks.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || 
                        (filter === 'online' && l.status === 'online') || 
                        (filter === 'offline' && l.status === 'offline') || 
                        (filter === 'low-battery' && l.battery < 20);
    return matchSearch && matchFilter;
  });

  const stats = {
    total: locks.length,
    online: locks.filter(l => l.status === 'online').length,
    lowBattery: locks.filter(l => l.battery <= 20).length,
    alerts: 2
  };

  const toggleLock = (id) => {
    setLocks(locks.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
  };

  const handleAddLock = (e) => {
    e.preventDefault();
    if (!newLockName) return;
    
    const newLock = {
      id: Date.now(),
      brand: newLockBrand,
      name: newLockName,
      model: `${newLockBrand} Nouveau`,
      location: newLockLocation,
      floor: 'TBA',
      battery: 100,
      status: 'online',
      locked: true,
      signal: 100,
      code: Math.floor(100000 + Math.random() * 900000).toString().slice(0, 4) + '-' + Math.floor(10 + Math.random() * 90),
      firmwareVersion: '1.0.0',
      autoLock: 30,
      passageMode: false,
      logs: [],
      modes: ['code', 'bluetooth']
    };

    setLocks([newLock, ...locks]);
    setShowAddModal(false);
    setNewLockName('');
  };

  const generateRandomPin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  return (
    <div className="lock-portal luxe-theme">
      <div className="mesh-bg"></div>
      
      <div className="lock-container">
        {/* Header Section */}
        <header className="lock-header">
          <div className="lock-title-group">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Command Center IoT
            </motion.h1>
            <p>Supervision opérationnelle des accès physiques & sécurité périmétrique</p>
          </div>
          <div className="lock-header-actions">
            <button className="btn-secondary"><Bluetooth size={16}/> Scan Appareils</button>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Déployer Serrure
            </button>
          </div>
        </header>

        {/* Stats Row (Clickable for filtering) */}
        <div className="lock-stats-grid">
          {[
            { filterVal: 'all', label: 'Unités Gérées', val: stats.total, icon: <Cpu />, color: 'blue', trend: 'Stable' },
            { filterVal: 'online', label: 'Opérationnelles', val: stats.online, icon: <Wifi />, color: 'green', trend: 'Optimal' },
            { filterVal: 'low-battery', label: 'Batteries faibles', val: stats.lowBattery, icon: <BatteryLow />, color: 'red', trend: 'Action Requise' },
            { filterVal: 'offline', label: 'Alertes Hors-Ligne', val: locks.length - stats.online, icon: <ShieldAlert />, color: 'amber', trend: 'Vérifier' }
          ].map((s, i) => (
            <motion.div 
              key={i}
              className={`l-stat-card clickable ${filter === s.filterVal ? 'active-filter' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setFilter(s.filterVal)}
            >
              <div className={`l-stat-icon ${s.color}`}>{s.icon}</div>
              <div className="l-stat-info">
                <strong>{s.val}</strong>
                <span>{s.label}</span>
              </div>
              <div className={`l-stat-trend ${s.color === 'red' ? 'down' : s.color === 'green' ? 'up' : ''}`}>
                {s.trend} {s.color === 'blue' && <Activity size={12}/>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Control Bar */}
        <div className="lock-control-bar">
          <div className="search-box">
            <Search size={18}/>
            <input placeholder="Rechercher par nom, chambre ou localisation..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="view-toggle-group">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={18}/></button>
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><LayoutGrid size={18}/></button>
          </div>
        </div>

        {/* Main Locks View (Grid or List) */}
        <div className={`lock-display-area ${viewMode}`}>
          <AnimatePresence mode='popLayout'>
            {filtered.map(lock => (
              <motion.div 
                key={lock.id} 
                className={`luxe-lock-item ${viewMode === 'grid' ? 'grid-view' : 'list-view'} ${lock.status}`} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedLock(lock)}
              >
                {viewMode === 'grid' ? (
                  // ---- GRID CARD VIEW ----
                  <>
                    <div className="l-card-header">
                      <div className="l-card-brand" style={{ color: BRAND_COLORS[lock.brand], background: BRAND_COLORS[lock.brand] + '15' }}>
                        {lock.brand}
                      </div>
                      <div className={`luxe-status-tag ${lock.status}`}>
                        <div className="dot" />
                        <span>{lock.status === 'online' ? 'OPÉRATIONNEL' : 'HORS LIGNE'}</span>
                      </div>
                    </div>
                    <div className="l-card-body">
                      <h3>{lock.name}</h3>
                      <p className="l-card-loc"><Building2 size={12}/> {lock.location} · {lock.floor}</p>
                      
                      <div className="l-card-metrics">
                        <div className="l-metric">
                          <span>SIGNAL RF</span>
                          <div className="luxe-signal">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={`sig-bar ${i <= (lock.signal/20) ? 'active' : ''}`} />
                            ))}
                          </div>
                        </div>
                        <div className="l-metric">
                          <span>ÉNERGIE</span>
                          <div className="l-battery-val">
                            <div className="b-bar"><motion.div className={`b-fill ${lock.battery < 20 ? 'red' : ''}`} animate={{ width: `${lock.battery}%` }} /></div>
                            <span style={{ fontSize: 11, fontWeight: 800 }}>{lock.battery}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="l-card-footer">
                      <div className={`l-lock-state ${lock.locked ? 'locked' : 'unlocked'}`}>
                        {lock.locked ? <Lock size={14} className="text-green"/> : <Unlock size={14} className="text-red"/>}
                        <span>{lock.locked ? 'VERROUILLÉ' : 'OUVERT'}</span>
                      </div>
                      <div className="l-card-action">CONSOLE <ArrowUpRight size={14}/></div>
                    </div>
                  </>
                ) : (
                  // ---- LIST ROW VIEW ----
                  <>
                    <div className="list-col col-brand">
                      <div className="list-icon" style={{ background: BRAND_COLORS[lock.brand] + '15', color: BRAND_COLORS[lock.brand] }}>
                        {lock.brand === 'TTLock' ? <Lock size={18} /> : lock.brand === 'Tuya' ? <Zap size={18} /> : <Cpu size={18} />}
                      </div>
                    </div>
                    <div className="list-col col-info">
                      <h4>{lock.name}</h4>
                      <span><Building2 size={12}/> {lock.location} - {lock.floor}</span>
                    </div>
                    <div className="list-col col-status">
                      <div className={`luxe-status-tag ${lock.status} small`}>
                        <div className="dot" />
                        <span>{lock.status}</span>
                      </div>
                    </div>
                    <div className="list-col col-metrics">
                      <div className="metric-inline">
                        <Battery size={14} className={lock.battery < 20 ? 'text-red' : 'text-green'} />
                        <span className={lock.battery < 20 ? 'text-red' : ''}>{lock.battery}%</span>
                      </div>
                      <div className="metric-inline">
                        <Signal size={14} className={lock.status === 'online' ? 'text-blue' : 'text-muted'} />
                        <span className={lock.status === 'online' ? 'text-blue' : 'text-muted'}>{lock.signal}%</span>
                      </div>
                    </div>
                    <div className="list-col col-state">
                      <div className={`l-lock-state ${lock.locked ? 'locked' : 'unlocked'} horizontal`}>
                        {lock.locked ? <Lock size={14} className="text-green"/> : <Unlock size={14} className="text-red"/>}
                        <span>{lock.locked ? 'VERROUILLÉ' : 'OUVERT'}</span>
                      </div>
                    </div>
                    <div className="list-col col-actions">
                      <button className="btn-icon-soft" onClick={(e) => { e.stopPropagation(); toggleLock(lock.id); }}>
                        <Power size={18} />
                      </button>
                      <button className="btn-icon-soft"><ChevronRight size={18}/></button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="empty-state">
              <ShieldAlert size={40} className="text-muted" />
              <h3>Aucune Serrure Trouvée</h3>
              <p>Essayez de modifier vos filtres ou term de recherche.</p>
            </div>
          )}
        </div>

        {/* Global Auto Rules Table */}
        <div className="automation-dashboard mt-12">
          <div className="console-panel">
            <div className="panel-header-flex">
              <h3><Zap size={18} className="text-amber"/> Automatisation Projet (PMS ↔ Serrures)</h3>
              <button className="btn-text">Gérer les Règles</button>
            </div>
            
            <div className="auto-rules-list">
              <div className="auto-rule-item active">
                <div className="rule-icon"><CalendarDays size={20} className="text-blue" /></div>
                <div className="rule-content">
                  <h4>Génération Auto au Check-in</h4>
                  <p>Crée un code PIN unique valable de l'heure du check-in jusqu'au check-out.</p>
                </div>
                <div className="rule-status">
                  <span className="badge-active">Actif (30 logs)</span>
                  <div className="luxe-toggle-mini active"></div>
                </div>
              </div>

              <div className="auto-rule-item">
                <div className="rule-icon"><AlertTriangle size={20} className="text-amber" /></div>
                <div className="rule-content">
                  <h4>Alerte Batterie Faible (Slack / SMS)</h4>
                  <p>Notifie l'équipe de maintenance si une serrure passe sous les 20%.</p>
                </div>
                <div className="rule-status">
                  <span className="badge-active">Actif</span>
                  <div className="luxe-toggle-mini active"></div>
                </div>
              </div>

              <div className="auto-rule-item inactive">
                <div className="rule-icon"><SmartphoneNfc size={20} className="text-muted" /></div>
                <div className="rule-content">
                  <h4>Partage Clé Bluetooth (App HosFlow)</h4>
                  <p>Permet aux clients d'ouvrir la porte via NFC ou Mobile App Bluetooth.</p>
                </div>
                <div className="rule-status">
                  <span className="badge-inactive">Désactivé</span>
                  <div className="luxe-toggle-mini"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER OVERLAY */}
      <AnimatePresence>
        {selectedLock && (
          <div className="luxe-drawer-overlay" onClick={() => setSelectedLock(null)}>
            <motion.div 
              className="luxe-lock-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="drawer-header">
                <div className="brand" style={{ color: BRAND_COLORS[selectedLock.brand] }}>{selectedLock.brand}</div>
                <h2>{selectedLock.name}</h2>
                <div className="l-drawer-meta">
                  <div className={`luxe-status-tag ${selectedLock.status}`}><div className="dot"/> {selectedLock.status.toUpperCase()}</div>
                  <span style={{ marginLeft: 'auto' }}>ID: {selectedLock.id}XF-92</span>
                </div>
              </div>

              <div className="drawer-tabs">
                <button className="active">CONTRÔLE</button>
                <button>HISTORIQUE</button>
                <button>SYSTÈME</button>
              </div>

              <div className="drawer-body">
                <div className="d-section">
                  <h4>Commandes Critiques</h4>
                  <div className="d-actions">
                    <button 
                      className="d-btn-action main" 
                      onClick={() => toggleLock(selectedLock.id)} 
                      style={{ background: selectedLock.locked ? 'var(--luxe-blue)' : 'var(--luxe-red)' }}
                    >
                      {selectedLock.locked ? <Lock size={20}/> : <Unlock size={20}/>} 
                      {selectedLock.locked ? 'Déverrouiller' : 'Verrouiller'}
                    </button>
                    <button className="d-btn-action outline" onClick={() => setShowPinModal(true)}>
                      <Key size={20}/> Générer PIN
                    </button>
                  </div>
                </div>

                <div className="d-section">
                  <h4>Diagnostic Énergie & Réseau</h4>
                  <div className="d-stats">
                    <div className="d-stat">
                      <span>Capacité Batterie</span>
                      <strong className={selectedLock.battery < 20 ? 'text-red' : ''}>{selectedLock.battery}%</strong>
                    </div>
                    <div className="d-stat">
                      <span>Force Signal (Wi-Fi)</span>
                      <strong className="text-blue">{selectedLock.signal}%</strong>
                    </div>
                  </div>
                </div>

                <div className="d-section" style={{ flex: 1 }}>
                  <div className="d-header-flex">
                    <h4>Logs Récents (Aujourd'hui)</h4>
                    <span className="text-blue" style={{ fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Voir tout</span>
                  </div>
                  <div className="d-mini-timeline">
                    {selectedLock.logs.length > 0 ? selectedLock.logs.map(log => (
                      <div key={log.id} className={`mini-log ${log.status}`}>
                        <div className="m-time">{log.time}</div>
                        <div className="m-content">
                          <p><strong>{log.user}</strong> <span className={`m-tag ${log.method}`}>{log.method}</span></p>
                          <span>{log.duration}</span>
                        </div>
                      </div>
                    )) : (
                      <p className="empty-text">Aucun log récent pour cette serrure.</p>
                    )}
                  </div>
                </div>

                <button className="btn-full-sec" onClick={() => setSelectedLock(null)} style={{ border: 'none', background: 'rgba(255,255,255,0.05)' }}>Fermer la console</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD LOCK */}
      <AnimatePresence>
        {showAddModal && (
          <div className="luxe-modal-overlay">
            <motion.div 
              className="luxe-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={20}/></button>
              <div className="modal-header">
                <div className="modal-icon"><Plus size={24} className="text-blue" /></div>
                <h2>Déployer Nouvelle Serrure</h2>
                <p>Ajoutez un appareil IoT au réseau HosFlow pour la synchronisation automatique.</p>
              </div>
              <form onSubmit={handleAddLock} className="modal-form">
                <div className="form-group">
                  <label>Marque / Protocole</label>
                  <select value={newLockBrand} onChange={(e) => setNewLockBrand(e.target.value)}>
                    <option value="TTLock">TTLock (Bluetooth & Wi-Fi Gateway)</option>
                    <option value="Tuya">Tuya Smart (Zigbee / Wi-Fi)</option>
                    <option value="TTHotel">TTHotel (Enterprise)</option>
                    <option value="Igloohome">Igloohome (Offline algo)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nom de la porte / Unité</label>
                  <input type="text" placeholder="Ex: Suite Présidentielle 401" value={newLockName} onChange={(e) => setNewLockName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Propriété (Location)</label>
                  <select value={newLockLocation} onChange={(e) => setNewLockLocation(e.target.value)}>
                    <option value="Villa Sunrise">Villa Sunrise</option>
                    <option value="Ocean View Apt">Ocean View Apt</option>
                    <option value="Main Tower">Main Tower</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
                  <button type="submit" className="btn-primary">Connecter & Sauvegarder</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: GENERATE PIN */}
      <AnimatePresence>
        {showPinModal && (
          <div className="luxe-modal-overlay" style={{ zIndex: 2000 }}>
            <motion.div 
              className="luxe-modal pin-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <button className="modal-close" onClick={() => setShowPinModal(false)}><X size={20}/></button>
              <div className="modal-header">
                <div className="modal-icon gold"><Key size={24} className="text-amber" /></div>
                <h2>Générer un Code PIN</h2>
                <p>Création d'un accès temporaire pour <strong>{selectedLock?.name}</strong>.</p>
              </div>
              <div className="pin-generator-content">
                <div className="pin-display">
                  <span>Code Autogénéré</span>
                  <div className="pin-value">{generateRandomPin()}</div>
                  <button className="btn-icon-soft"><RefreshCcw size={16}/></button>
                </div>
                
                <div className="form-group mt-4">
                  <label>Type d'accès</label>
                  <div className="access-types">
                    <div className="a-type active"><CalendarDays size={16}/> Périodique</div>
                    <div className="a-type"><Clock size={16}/> Permanent</div>
                    <div className="a-type"><History size={16}/> Usage Unique</div>
                  </div>
                </div>

                <div className="form-row mt-4">
                  <div className="form-group">
                    <label>Début</label>
                    <input type="datetime-local" defaultValue="2026-04-01T14:00" />
                  </div>
                  <div className="form-group">
                    <label>Fin</label>
                    <input type="datetime-local" defaultValue="2026-04-05T11:00" />
                  </div>
                </div>
                
                <div className="form-group check-group mt-4">
                  <input type="checkbox" id="sendSms" defaultChecked />
                  <label htmlFor="sendSms">Envoyer automatiquement par SMS ou WhatsApp au client</label>
                </div>

                <div className="modal-actions mt-6">
                  <button type="button" className="btn-secondary" onClick={() => setShowPinModal(false)}>Annuler</button>
                  <button type="button" className="btn-primary" onClick={() => setShowPinModal(false)}>Valider & Envoyer</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SmartLockHub;
