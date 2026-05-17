import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Key, 
  Settings, 
  Activity, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download,
  Lock,
  Globe,
  Database,
  Smartphone,
  Mail,
  MoreVertical,
  Plus,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SystemAdmin.css';

const SystemAdmin = () => {
  const [activeTab, setActiveTab] = useState('users');

  const users = [
    { id: 1, name: 'Marie Dupont', role: 'General Manager', modules: 'All', mfa: true, lastLogin: 'Il y a 2 min', status: 'active' },
    { id: 2, name: 'Lucas Martin', role: 'Front Desk Lead', modules: 'Desk, Guests', mfa: true, lastLogin: 'Il y a 45 min', status: 'active' },
    { id: 3, name: 'Sarah Connor', role: 'Finance Admin', modules: 'Finance, Reports', mfa: true, lastLogin: 'Hier 18:30', status: 'active' },
    { id: 4, name: 'Tom David', role: 'Housekeeping', modules: 'Housekeeping', mfa: false, lastLogin: 'Il y a 3 jours', status: 'inactive' },
  ];

  const securityLogs = [
    { id: 101, time: '17:04:22', user: 'System', action: 'API Sync: Booking.com (Success)', type: 'info', module: 'Distribution' },
    { id: 102, time: '16:58:10', user: 'Marie Dupont', action: 'Changed Rate Plan: Summer Promo (+15€)', type: 'warning', module: 'Revenue' },
    { id: 103, time: '16:45:00', user: 'Lucas Martin', action: 'Mass Check-in Executed (12 rooms)', type: 'info', module: 'Front Desk' },
    { id: 104, time: '15:20:11', user: 'Unknown IP', action: 'Failed Login Attempt (3/3)', type: 'danger', module: 'Auth' },
    { id: 105, time: '14:10:05', user: 'Sarah Connor', action: 'Exported Financial Report (Q3)', type: 'info', module: 'Finance' },
  ];

  const apis = [
    { name: 'Booking.com', type: 'Channel', status: 'connected', latency: '124ms', calls: '14.2k/day', icon: <Globe size={16} /> },
    { name: 'Stripe', type: 'Payment', status: 'connected', latency: '85ms', calls: '850/day', icon: <Database size={16} /> },
    { name: 'Twilio', type: 'SMS/Comms', status: 'warning', latency: '420ms', calls: '2.1k/day', icon: <Smartphone size={16} /> },
    { name: 'Salto Locks', type: 'IoT', status: 'connected', latency: '45ms', calls: '4.5k/day', icon: <Lock size={16} /> },
    { name: 'SAP ERP', type: 'Finance', status: 'error', latency: 'TIMEOUT', calls: '1/day', icon: <Server size={16} /> },
  ];

  return (
    <div className="admin-container animate-fade-in">
      <header className="admin-header">
        <div className="title-group">
          <h1>Administration Système <span className="ai-badge">Secure Core</span></h1>
          <p>Gestion des rôles, logs d'audit et configuration des API tierces</p>
        </div>
        <div className="header-actions">
           <div className="system-health">
             <span className="pulse-dot"></span> System Status: <strong className="text-green">All Systems Operational</strong>
           </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <Users size={16} /> Utilisateurs & Rôles
        </button>
        <button className={`admin-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
          <Shield size={16} /> Logs de Sécurité (Audit)
        </button>
        <button className={`admin-tab ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>
          <Server size={16} /> API & Intégrations
        </button>
        <button className={`admin-tab ${activeTab === 'iot' ? 'active' : ''}`} onClick={() => setActiveTab('iot')}>
          <Zap size={16} /> IoT & Serrures
        </button>
        <button className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <Settings size={16} /> Paramètres Globaux
        </button>
      </div>

      <div className="admin-content-area">
        
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="users-layout">
            <section className="users-table-pane glass-panel">
               <div className="pane-header">
                 <div className="search-box">
                   <Search size={14} />
                   <input type="text" placeholder="Rechercher utilisateur..." />
                 </div>
                 <div className="pane-actions">
                   <button className="btn-icon"><Filter size={16} /></button>
                   <button className="btn-primary-small"><Plus size={14} /> Nouvel Utilisateur</button>
                 </div>
               </div>
               
               <div className="table-wrapper hide-scrollbar">
                 <table className="admin-table">
                   <thead>
                     <tr>
                       <th>Utilisateur</th>
                       <th>Rôle</th>
                       <th>Accès Modules</th>
                       <th>Sécurité (2FA)</th>
                       <th>Dernière Connexion</th>
                       <th>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {users.map(user => (
                       <tr key={user.id} className={user.status === 'inactive' ? 'inactive-row' : ''}>
                         <td>
                           <div className="user-cell">
                             <div className={`avatar ${user.status}`}>{user.name.split(' ').map(n=>n[0]).join('')}</div>
                             <strong>{user.name}</strong>
                           </div>
                         </td>
                         <td><span className="role-badge">{user.role}</span></td>
                         <td className="text-muted">{user.modules}</td>
                         <td>
                           {user.mfa ? <span className="mfa-badge success"><CheckCircle2 size={12} /> Configuré</span> 
                                     : <span className="mfa-badge warning"><AlertTriangle size={12} /> Requis</span>}
                         </td>
                         <td className="text-muted text-small">{user.lastLogin}</td>
                         <td><button className="btn-icon"><MoreVertical size={14} /></button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </section>

            <section className="role-builder-pane glass-panel">
               <h3>Role-Based Access Control (RBAC)</h3>
               <p className="subtitle">Permissions matrice pour : <strong>Front Desk Lead</strong></p>
               
               <div className="permissions-matrix">
                 <div className="matrix-row header">
                   <div>Module</div>
                   <div>Lire</div>
                   <div>Écrire</div>
                   <div>Admin</div>
                 </div>
                 <div className="matrix-row">
                   <div className="module-name">Front Desk</div>
                   <div><input type="checkbox" checked readOnly/></div>
                   <div><input type="checkbox" checked readOnly/></div>
                   <div><input type="checkbox" readOnly/></div>
                 </div>
                 <div className="matrix-row">
                   <div className="module-name">Guest CRM</div>
                   <div><input type="checkbox" checked readOnly/></div>
                   <div><input type="checkbox" checked readOnly/></div>
                   <div><input type="checkbox" readOnly/></div>
                 </div>
                 <div className="matrix-row">
                   <div className="module-name">Finance</div>
                   <div><input type="checkbox" checked readOnly/></div>
                   <div><input type="checkbox" readOnly/></div>
                   <div><input type="checkbox" readOnly/></div>
                 </div>
                 <div className="matrix-row">
                   <div className="module-name">System Config</div>
                   <div><input type="checkbox" readOnly/></div>
                   <div><input type="checkbox" readOnly/></div>
                   <div><input type="checkbox" readOnly/></div>
                 </div>
               </div>
               
               <button className="btn-primary-outline w-full mt-4">Sauvegarder Matrice</button>
            </section>
          </div>
        )}

        {/* SECURITY LOGS TAB */}
        {activeTab === 'security' && (
          <div className="security-layout">
            <section className="logs-pane glass-panel">
               <div className="pane-header">
                 <h3>Audit Trail & Security Logs</h3>
                 <div className="pane-actions">
                   <button className="btn-icon"><Filter size={16} /></button>
                   <button className="btn-primary-outline"><Download size={14} /> Exporter CSV</button>
                 </div>
               </div>
               
               <div className="logs-timeline hide-scrollbar">
                 {securityLogs.map(log => (
                   <div key={log.id} className={`log-item ${log.type}`}>
                     <div className="log-time">{log.time}</div>
                     <div className="log-icon">
                       {log.type === 'info' && <Activity size={12} />}
                       {log.type === 'warning' && <AlertTriangle size={12} />}
                       {log.type === 'danger' && <Shield size={12} />}
                     </div>
                     <div className="log-content">
                       <span className={`log-module ${log.module.toLowerCase().replace(' ', '-')}`}>{log.module}</span>
                       <span className="log-action"><strong>{log.user}</strong> — {log.action}</span>
                     </div>
                   </div>
                 ))}
               </div>
            </section>
            
            <section className="security-metrics glass-panel">
               <h3>Security Posture</h3>
               
               <div className="metric-card">
                 <Shield size={24} className="text-blue" />
                 <div className="metric-info">
                   <span className="metric-val">100%</span>
                   <span className="metric-label">Data Encrypted (AES-256)</span>
                 </div>
               </div>
               
               <div className="metric-card">
                 <Users size={24} className="text-yellow" />
                 <div className="metric-info">
                   <span className="metric-val">85%</span>
                   <span className="metric-label">Staff with 2FA enabled</span>
                 </div>
                 <button className="btn-text">Enforce All</button>
               </div>
               
               <div className="security-alert-box">
                 <AlertTriangle size={20} />
                 <div className="alert-text">
                   <strong>Multiple Failed Logins</strong>
                   <p>Detected 3 failed attempts from IP 192.168.1.45. IP has been temporarily blocked.</p>
                 </div>
               </div>
            </section>
          </div>
        )}

        {/* API INTEGRATIONS TAB */}
        {activeTab === 'api' && (
          <div className="api-layout">
            <div className="api-grid">
              {apis.map((api, i) => (
                <motion.div 
                  key={i} 
                  className={`api-card glass-panel ${api.status}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="api-header">
                    <div className="api-title">
                      <div className="api-icon">{api.icon}</div>
                      <div>
                        <h3>{api.name}</h3>
                        <span className="api-type">{api.type}</span>
                      </div>
                    </div>
                    <div className="api-status-dot"></div>
                  </div>
                  
                  <div className="api-stats">
                    <div className="stat">
                      <span className="stat-label">Latency</span>
                      <strong className={api.latency === 'TIMEOUT' ? 'text-red' : ''}>{api.latency}</strong>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Traffic</span>
                      <strong>{api.calls}</strong>
                    </div>
                  </div>
                  
                  <div className="api-footer">
                    {api.status === 'error' ? (
                       <span className="error-text"><AlertTriangle size={12} /> Connection failed</span>
                    ) : api.status === 'warning' ? (
                       <span className="warning-text"><AlertTriangle size={12} /> High latency detected</span>
                    ) : (
                       <span className="success-text"><CheckCircle2 size={12} /> Healthy</span>
                    )}
                    <button className="btn-config"><Settings size={14} /> Config</button>
                  </div>
                </motion.div>
              ))}
              
              <div className="api-card add-new glass-panel">
                <Plus size={32} color="var(--text-muted)" />
                 <h4>Ajouter Intégration</h4>
                <p>Webhooks, PMS, ERP, IoT...</p>
              </div>
            </div>
          </div>
        )}
        {/* IoT & SMART LOCKS TAB */}
        {activeTab === 'iot' && (
          <div className="iot-admin-layout animate-fade-in">
            <div className="iot-sidebar-config glass-panel">
               <h3>Fournisseurs IoT</h3>
               <div className="provider-list">
                 {['August', 'Yale', 'TTLock', 'TTHotel', 'Nuki', 'Tuya', 'Schlage', 'Honeywell', 'Ecobee'].map(p => (
                   <div key={p} className="provider-config-item">
                     <span>{p}</span>
                     <div className={`status-led ${p === 'TTLock' ? 'online' : 'pending'}`}></div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="iot-main-config">
               <section className="iot-form-card glass-panel">
                  <div className="form-header">
                     <div className="brand-badge-large">TTLock / TTHotel</div>
                     <span className="sync-status success">Connecté - API v3.2</span>
                  </div>
                  
                  <div className="iot-form-grid">
                    <div className="form-group-adv">
                       <label>Client ID</label>
                       <input type="password" value="XXXXXXXXXXXX4822" readOnly />
                    </div>
                    <div className="form-group-adv">
                       <label>Client Secret</label>
                       <input type="password" value="************************" readOnly />
                    </div>
                    <div className="form-group-adv">
                       <label>Webhook URL (Event Sync)</label>
                       <div className="input-copy">
                          <input type="text" value="https://api.hosflow.pro/webhooks/ttlock" readOnly />
                          <button className="btn-copy">Copy</button>
                       </div>
                    </div>
                  </div>

                  <div className="iot-actions">
                    <button className="btn-primary-outline">Tester la Connexion</button>
                    <button className="btn-primary">Mettre à jour les Clés</button>
                  </div>
               </section>

               <section className="iot-health-card glass-panel">
                  <h3>Santé du Réseau IoT</h3>
                  <div className="health-grid">
                    <div className="h-metric">
                       <span className="h-label">Passerelles (Gateways)</span>
                       <span className="h-val">12 <small className="text-green">Online</small></span>
                    </div>
                    <div className="h-metric">
                       <span className="h-label">Batterie Moyenne</span>
                       <span className="h-val">84%</span>
                    </div>
                    <div className="h-metric">
                       <span className="h-label">Échecs d'Auto-provisioning</span>
                       <span className="h-val text-red">0</span>
                    </div>
                  </div>
               </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAdmin;
