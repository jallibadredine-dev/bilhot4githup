import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, Unlock, Wifi, Battery, Zap, Activity, ShieldCheck, 
  Key, MoreHorizontal, ChevronRight, Cpu, Signal, 
  RefreshCcw, ShieldAlert, Smartphone, Clock, LayoutGrid, 
  List, Search, Plus, ArrowUpRight, Check, X, Shield,
  History, Settings, Bell, Info
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import './SmartAccess.css';

const DEMO_LOCKS = [
  { id: '1', location: 'Appartement Marais', brand: 'TTLock', battery: 95, signal: 85, status: 'online', locked: true, lastSync: '2 min ago' },
  { id: '2', location: 'Studio Eiffel', brand: 'TTLock', battery: 42, signal: 60, status: 'online', locked: false, lastSync: '10 min ago' },
  { id: '3', location: 'Villa Sunrise', brand: 'Tuya', battery: 98, signal: 95, status: 'online', locked: true, lastSync: 'Just now' },
  { id: '4', location: 'Ocean View 4A', brand: 'Tuya', battery: 15, signal: 20, status: 'offline', locked: true, lastSync: '1 hour ago' },
];

const DEMO_ACTIVITIES = [
  { id: 1, type: 'unlock', user: 'J. Doe', unit: 'Appartement Marais', time: '11:42 AM', status: 'success' },
  { id: 2, type: 'alert', user: 'System', unit: 'Ocean View 4A', time: '11:15 AM', status: 'warning', msg: 'Low Battery' },
  { id: 3, type: 'lock', user: 'S. Connor', unit: 'Studio Eiffel', time: '10:30 AM', status: 'success' },
];

const SmartAccess = () => {
  // Read access cards from the centralized store; fallback to demo data when store is empty
  const accessCards = useAppStore(s => s.accessCards);
  const upsertAccessCard = useAppStore(s => s.upsertAccessCard);

  // Map store access cards to lock-display format, or use demo data
  const locks = accessCards.length > 0
    ? accessCards.map(c => ({
        id:       String(c.id),
        location: c.room_id || c.description || c.label || 'Room',
        brand:    c.brand   || 'Smart Lock',
        battery:  c.battery ?? 100,
        signal:   c.signal  ?? 80,
        status:   c.status  || 'online',
        locked:   c.locked  !== false,
        lastSync: c.last_sync || 'Unknown',
      }))
    : DEMO_LOCKS;

  const activities = DEMO_ACTIVITIES;

  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('status');

  const stats = {
    total: locks.length,
    online: locks.filter(l => l.status === 'online').length,
    lowBattery: locks.filter(l => l.battery < 25).length,
    health: 98.4
  };

  const toggleLock = (id) => {
    if (accessCards.length > 0) {
      const card = accessCards.find(c => String(c.id) === id);
      if (card) upsertAccessCard({ ...card, locked: !card.locked });
    }
  };

  return (
    <div className="smart-access-luxe">
      <div className="luxe-mesh-bg"></div>
      
      <div className="luxe-content-scroll">
        {/* Header Section */}
        <header className="page-header">
          <div className="header-title-group">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              IoT Control Center
            </motion.h1>
            <p>Infrastructure d'accès haute sécurité & monitoring temps réel</p>
          </div>
          <div className="header-global-actions">
            <div className="status-badge-group">
              <div className="status-pill green"><Shield size={14}/> Système Immunisé</div>
              <div className="status-pill blue"><Activity size={14}/> 12 Hubs Actifs</div>
            </div>
            <motion.button 
              className="btn-luxe-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={18}/> Déployer Infrastructure
            </motion.button>
          </div>
        </header>

        {/* Operational Stats Grid */}
        <div className="ops-stats-grid">
          {[
            { label: 'Unités Gérées', val: stats.total, icon: <Cpu />, color: 'blue', trend: '+12%' },
            { label: 'Uptime Réseau', val: `${(stats.online/stats.total * 100).toFixed(0)}%`, icon: <Signal />, color: 'green', trend: 'Optimal' },
            { label: 'Santé Batterie', val: '88%', icon: <Battery />, color: 'red', trend: 'Action Requise' },
            { label: 'Score Sécurité', val: stats.health, icon: <ShieldCheck />, color: 'purple', trend: 'Stable' }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              className="op-stat-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`op-icon ${stat.color}`}>{stat.icon}</div>
              <div className="op-info">
                <strong>{stat.val}</strong>
                <span>{stat.label}</span>
              </div>
              <div className={`op-trend ${stat.color === 'red' ? 'red' : 'green'}`}>{stat.trend}</div>
            </motion.div>
          ))}
        </div>

        {/* Main Interface */}
        <div className="main-interface-grid">
          
          {/* Left Panel: Connectivity Visualization */}
          <div className="left-stack">
            <section className="connectivity-visualizer luxe-panel">
              <div className="panel-header">
                <h3><Activity size={18} className="text-blue"/> Topologie Réseau</h3>
                <button className="btn-refresh"><RefreshCcw size={16}/></button>
              </div>
              <div className="visual-core">
                <svg className="connection-svg" viewBox="0 0 400 400">
                  {locks.map((lock, i) => {
                    const angle = (i * (360 / locks.length)) * (Math.PI / 180);
                    const x2 = 200 + 120 * Math.cos(angle);
                    const y2 = 200 + 120 * Math.sin(angle);
                    return (
                      <g key={lock.id}>
                        <line 
                          x1="200" y1="200" x2={x2} y2={y2} 
                          className="connection-path"
                        />
                        <motion.circle 
                          r="3" className="pulse-circle"
                          animate={{ 
                            cx: [200, x2], 
                            cy: [200, y2],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            delay: i * 0.5,
                            ease: "linear"
                          }}
                        />
                      </g>
                    );
                  })}
                </svg>

                <div className="hub-center">
                  <div className="hub-pulse"></div>
                  <div className="hub-icon"><Wifi size={32}/></div>
                  <span className="hub-label">GATEWAY-PRO</span>
                </div>

                <div className="node-rings">
                  {locks.map((lock, i) => (
                    <motion.div 
                      key={lock.id}
                      className={`node-dot ${lock.status}`}
                      style={{ 
                        transform: `rotate(${i * (360/locks.length)}deg) translateY(-120px)` 
                      }}
                      animate={{ 
                        scale: lock.status === 'online' ? [1, 1.2, 1] : 1,
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    />
                  ))}
                </div>
                
                <div className="visual-legend">
                  <div className="leg-item"><div className="dot green"></div><span>Signal Fort</span></div>
                  <div className="leg-item"><div className="dot yellow"></div><span>Interférence</span></div>
                  <div className="leg-item"><div className="dot grey"></div><span>Hors Ligne</span></div>
                </div>
              </div>
            </section>

            <section className="recent-activity-panel luxe-panel">
              <div className="panel-header">
                <h3><History size={18} className="text-blue"/> Activité Récente</h3>
                <button className="btn-text-link">Voir tout</button>
              </div>
              <div className="console-body">
                <div className="activity-list">
                  {activities.map(act => (
                    <div key={act.id} className="activity-item">
                      <div className="act-icon">
                        {act.type === 'unlock' ? <Unlock size={14}/> : act.type === 'lock' ? <Lock size={14}/> : <ShieldAlert size={14} className="text-red"/>}
                      </div>
                      <div className="act-info">
                        <strong>{act.unit}</strong>
                        <span>{act.user} • {act.msg || (act.type === 'unlock' ? 'Ouverture' : 'Fermeture')}</span>
                      </div>
                      <div className="act-time">{act.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Panel: Management List */}
          <section className="management-console luxe-panel">
            <div className="panel-header-tabs">
              <div className="tabs-group">
                <button className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`} onClick={() => setActiveTab('status')}>Live Status</button>
                <button className={`tab-btn ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')}>Configuration</button>
                <button className={`tab-btn ${activeTab === 'access' ? 'active' : ''}`} onClick={() => setActiveTab('access')}>Access Rights</button>
              </div>
              <div className="view-toggle">
                <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><LayoutGrid size={18}/></button>
                <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={18}/></button>
              </div>
            </div>

            <div className="console-body">
              <div className="search-filter-bar">
                <div className="luxe-search">
                  <Search size={18}/>
                  <input placeholder="Filtrer par unité, marque ou statut..." />
                </div>
                <div className="quick-filters">
                  <button className="pill-filter active">Tout</button>
                  <button className="pill-filter">Batterie Faible</button>
                  <button className="pill-filter">TTLock</button>
                </div>
              </div>

              <div className={`lock-display-area ${viewMode}`}>
                <AnimatePresence mode='popLayout'>
                  {locks.map(lock => (
                    <motion.div 
                      key={lock.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`luxe-lock-item ${lock.status}`}
                    >
                      <div className="item-meta">
                        <div className="brand-tag">{lock.brand}</div>
                        <div className={`status-indicator ${lock.status}`}>
                          {lock.status === 'online' ? <Check size={12}/> : <X size={12}/>}
                          {lock.status.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="item-main">
                        <h4>{lock.location}</h4>
                        <p><Clock size={14}/> Dernière sync: {lock.lastSync}</p>
                      </div>

                      <div className="item-metrics">
                        <div className="metric">
                          <span className="metric-label">Énergie</span>
                          <div className="metric-value">
                            <Battery size={16} className={lock.battery < 25 ? 'text-red' : ''}/>
                            <span className={lock.battery < 25 ? 'text-red' : ''}>{lock.battery}%</span>
                          </div>
                          <div className="health-bar">
                            <motion.div 
                              className={`health-fill ${lock.battery < 25 ? 'red' : 'green'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${lock.battery}%` }}
                            />
                          </div>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Signal RF</span>
                          <div className="metric-value">
                            <Signal size={16}/>
                            <span>{lock.signal}%</span>
                          </div>
                          <div className="health-bar">
                            <motion.div 
                              className="health-fill green"
                              initial={{ width: 0 }}
                              animate={{ width: `${lock.signal}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="item-actions">
                        <button className="btn-luxe-action">Console <ChevronRight size={14}/></button>
                        <motion.button 
                          className={`btn-lock-toggle ${lock.locked ? 'locked' : 'unlocked'}`}
                          onClick={() => toggleLock(lock.id)}
                          whileTap={{ scale: 0.9 }}
                        >
                          {lock.locked ? <Lock size={18}/> : <Unlock size={18}/>}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="panel-footer">
              <div className="auto-gen-info">
                <Zap size={16} className="text-amber"/>
                <span>Protocoles de sécurité automatisés actifs</span>
              </div>
              <div className="footer-links">
                <button className="btn-text-link">Audit complet <ArrowUpRight size={14}/></button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SmartAccess;
