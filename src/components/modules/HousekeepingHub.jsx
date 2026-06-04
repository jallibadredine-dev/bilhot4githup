import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, AlertTriangle, Clock, Ban, Wrench,
  Eye, RefreshCw, Filter, Search, Bell, Wifi, WifiOff,
  ChevronDown, X, Check, User, Users, Layers, Zap,
  BarChart3, Building2, ArrowRight, Settings, Copy, ExternalLink,
  Play, Pause, MoreHorizontal, Plus
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { supabase, SUPABASE_READY } from '../../lib/supabase';
import './HousekeepingHub.css';

/* ─── STATUS CONFIG ──────────────────────────────────────────── */
const STATUS = {
  clean:       { label: 'Propre',          color: '#059669', bg: '#ECFDF5', border: '#6EE7B7', icon: CheckCircle2,  emoji: '✅' },
  dirty:       { label: 'À nettoyer',      color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', icon: Sparkles,      emoji: '🧹' },
  in_progress: { label: 'En cours',        color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD', icon: RefreshCw,     emoji: '🔄' },
  dnd:         { label: 'Ne pas déranger', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', icon: Ban,           emoji: '🚫' },
  inspection:  { label: 'Inspection',      color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD', icon: Eye,           emoji: '🔍' },
  maintenance: { label: 'Maintenance',     color: '#EA580C', bg: '#FFF7ED', border: '#FDBA74', icon: Wrench,        emoji: '🔧' },
};

const FLOORS = ['Tous', '1er étage', '2ème étage', '3ème étage', '4ème étage'];

const DEMO_ROOMS = [
  { id: 'r1',  name: '101', floor: 1, type: 'Standard',  status: 'clean',       assigned: 'Fatima B.', guest: null,          iot: true  },
  { id: 'r2',  name: '102', floor: 1, type: 'Standard',  status: 'dirty',       assigned: null,        guest: 'M. Dupont',   iot: true  },
  { id: 'r3',  name: '103', floor: 1, type: 'Superior',  status: 'in_progress', assigned: 'Aisha K.',  guest: 'Mme Martin',  iot: false },
  { id: 'r4',  name: '104', floor: 1, type: 'Suite',     status: 'dnd',         assigned: null,        guest: 'M. Chen',     iot: true  },
  { id: 'r5',  name: '105', floor: 1, type: 'Standard',  status: 'clean',       assigned: null,        guest: null,          iot: false },
  { id: 'r6',  name: '201', floor: 2, type: 'Standard',  status: 'dirty',       assigned: 'Nora S.',   guest: 'Mme García',  iot: true  },
  { id: 'r7',  name: '202', floor: 2, type: 'Superior',  status: 'inspection',  assigned: 'Chef H.',   guest: null,          iot: true  },
  { id: 'r8',  name: '203', floor: 2, type: 'Standard',  status: 'clean',       assigned: null,        guest: null,          iot: false },
  { id: 'r9',  name: '204', floor: 2, type: 'Standard',  status: 'maintenance', assigned: 'Tech. Ali', guest: null,          iot: false },
  { id: 'r10', name: '205', floor: 2, type: 'Suite',     status: 'dnd',         assigned: null,        guest: 'Fam. Kowalski', iot: true },
  { id: 'r11', name: '301', floor: 3, type: 'Standard',  status: 'dirty',       assigned: null,        guest: 'M. Novák',    iot: true  },
  { id: 'r12', name: '302', floor: 3, type: 'Superior',  status: 'clean',       assigned: null,        guest: null,          iot: false },
  { id: 'r13', name: '303', floor: 3, type: 'Suite',     status: 'in_progress', assigned: 'Fatima B.', guest: null,          iot: true  },
  { id: 'r14', name: '304', floor: 3, type: 'Standard',  status: 'clean',       assigned: null,        guest: 'Mme El Idrissi', iot: false },
  { id: 'r15', name: '401', floor: 4, type: 'Penthouse', status: 'inspection',  assigned: 'Chef H.',   guest: null,          iot: true  },
  { id: 'r16', name: '402', floor: 4, type: 'Suite',     status: 'dirty',       assigned: null,        guest: null,          iot: true  },
];

const STAFF = ['Fatima B.', 'Aisha K.', 'Nora S.', 'Chef H.', 'Tech. Ali', 'Sara M.'];

/* ─── WEBHOOK LOG DEMO ───────────────────────────────────────── */
const DEMO_LOGS = [
  { id: 1, time: '14:32:11', room: '104', status: 'dnd',         trigger: 'hardware_button', ip: '192.168.1.12' },
  { id: 2, time: '14:28:05', room: '201', status: 'dirty',       trigger: 'checkout_auto',   ip: '—' },
  { id: 3, time: '14:15:44', room: '102', status: 'dirty',       trigger: 'hardware_button', ip: '192.168.1.8'  },
  { id: 4, time: '13:55:22', room: '303', status: 'in_progress', trigger: 'mobile_app',      ip: '—' },
  { id: 5, time: '13:42:10', room: '202', status: 'inspection',  trigger: 'mobile_app',      ip: '—' },
];

/* ─── COMPONENT ──────────────────────────────────────────────── */
export default function HousekeepingHub() {
  const storeRooms = useAppStore(s => s.rooms);

  const [rooms, setRooms]               = useState(DEMO_ROOMS);
  const [activeFloor, setActiveFloor]   = useState('Tous');
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchQ, setSearchQ]           = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeTab, setActiveTab]       = useState('rooms');  // rooms | tasks | iot
  const [logs, setLogs]                 = useState(DEMO_LOGS);
  const [webhookUrl, setWebhookUrl]     = useState('');
  const [copied, setCopied]             = useState(false);
  const [iotOnline, setIotOnline]       = useState(true);
  const [lastSync, setLastSync]         = useState(new Date());

  /* Build webhook URL from env */
  useEffect(() => {
    const domain = window.location.hostname;
    setWebhookUrl(`https://${domain}/api/housekeeping/status-update`);
  }, []);

  /* Merge Supabase rooms if available */
  useEffect(() => {
    if (storeRooms && storeRooms.length > 0) {
      const merged = storeRooms.map(r => ({
        id: r.id,
        name: r.name || r.room_number || '—',
        floor: parseInt(r.name?.[0]) || 1,
        type: r.room_type || 'Standard',
        status: r.housekeeping_status || r.status || 'clean',
        assigned: r.assigned_to || null,
        guest: r.current_guest || null,
        iot: !!r.iot_device_id,
      }));
      setRooms(merged);
    }
  }, [storeRooms]);

  /* Subscribe to real-time room updates via Supabase */
  useEffect(() => {
    if (!SUPABASE_READY) return;
    const channel = supabase
      .channel('housekeeping-rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload) => {
        setLastSync(new Date());
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setRooms(prev => {
            const exists = prev.find(r => r.id === payload.new.id);
            if (exists) return prev.map(r => r.id === payload.new.id ? { ...r, status: payload.new.housekeeping_status || payload.new.status || r.status } : r);
            return prev;
          });
          /* Add to live log */
          setLogs(prev => [{
            id: Date.now(),
            time: new Date().toLocaleTimeString('fr-FR'),
            room: payload.new.name || payload.new.id,
            status: payload.new.housekeeping_status || payload.new.status,
            trigger: 'realtime_sync',
            ip: '—',
          }, ...prev.slice(0, 19)]);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const updateRoomStatus = useCallback(async (roomId, newStatus) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
    if (SUPABASE_READY) {
      await supabase.from('rooms').update({ housekeeping_status: newStatus, updated_at: new Date().toISOString() }).eq('id', roomId);
    }
    setSelectedRoom(prev => prev?.id === roomId ? { ...prev, status: newStatus } : prev);
  }, []);

  const assignStaff = useCallback((roomId, staffName) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, assigned: staffName } : r));
    setSelectedRoom(prev => prev?.id === roomId ? { ...prev, assigned: staffName } : prev);
  }, []);

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Filtered rooms ── */
  const filtered = rooms.filter(r => {
    const floorMatch  = activeFloor === 'Tous' || r.floor === parseInt(activeFloor);
    const statusMatch = activeStatus === 'all' || r.status === activeStatus;
    const searchMatch = !searchQ || r.name.includes(searchQ) || (r.guest || '').toLowerCase().includes(searchQ.toLowerCase());
    return floorMatch && statusMatch && searchMatch;
  });

  /* ── Stats ── */
  const stats = {
    total:       rooms.length,
    clean:       rooms.filter(r => r.status === 'clean').length,
    dirty:       rooms.filter(r => r.status === 'dirty').length,
    inProgress:  rooms.filter(r => r.status === 'in_progress').length,
    dnd:         rooms.filter(r => r.status === 'dnd').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    inspection:  rooms.filter(r => r.status === 'inspection').length,
    iotConnected: rooms.filter(r => r.iot).length,
  };

  /* ─── RENDER ─────────────────────────────────────────────── */
  return (
    <div className="hk-root">

      {/* ── Header ── */}
      <div className="hk-header">
        <div className="hk-header-left">
          <div className="hk-title-row">
            <Sparkles size={20} className="hk-title-icon" />
            <h1 className="hk-title">Housekeeping Hub</h1>
            <span className={`hk-iot-badge ${iotOnline ? 'online' : 'offline'}`}>
              {iotOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {iotOnline ? 'IoT Connecté' : 'IoT Hors-ligne'}
            </span>
          </div>
          <p className="hk-subtitle">
            Gestion des chambres • Tâches housekeeping • Intégration IoT temps réel
          </p>
        </div>
        <div className="hk-header-right">
          <span className="hk-sync-info">
            <RefreshCw size={12} />
            Sync {lastSync.toLocaleTimeString('fr-FR')}
          </span>
          <button className="hk-btn-outline" onClick={() => setActiveTab('iot')}>
            <Settings size={14} /> Config IoT
          </button>
        </div>
      </div>

      {/* ── KPI Stats ── */}
      <div className="hk-stats-grid">
        {[
          { label: 'Total Chambres', value: stats.total,      color: '#2563EB', bg: '#EFF6FF',  icon: Building2 },
          { label: 'Propres',        value: stats.clean,      color: '#059669', bg: '#ECFDF5',  icon: CheckCircle2 },
          { label: 'À nettoyer',     value: stats.dirty,      color: '#D97706', bg: '#FFFBEB',  icon: Sparkles },
          { label: 'En cours',       value: stats.inProgress, color: '#2563EB', bg: '#EFF6FF',  icon: RefreshCw },
          { label: 'DND',            value: stats.dnd,        color: '#DC2626', bg: '#FEF2F2',  icon: Ban },
          { label: 'IoT Actifs',     value: stats.iotConnected, color: '#7C3AED', bg: '#F5F3FF', icon: Zap },
        ].map((s, i) => (
          <motion.div key={s.label} className="hk-stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ borderColor: s.color + '33' }} onClick={() => setActiveStatus(s.label === 'Total Chambres' ? 'all' : Object.keys(STATUS).find(k => STATUS[k].label === s.label) || 'all')}>
            <div className="hk-stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={16} /></div>
            <div>
              <div className="hk-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="hk-stat-label">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="hk-tabs">
        {[
          { id: 'rooms', label: 'Vue Chambres',   icon: Building2 },
          { id: 'tasks', label: 'Tâches & Équipe', icon: Users },
          { id: 'iot',   label: 'Intégration IoT', icon: Zap },
        ].map(t => (
          <button key={t.id} className={`hk-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB: ROOMS
      ══════════════════════════════════════════════ */}
      {activeTab === 'rooms' && (
        <div className="hk-rooms-tab">

          {/* Filters */}
          <div className="hk-filters">
            <div className="hk-search-wrap">
              <Search size={15} className="hk-search-icon" />
              <input className="hk-search" placeholder="Chambre, client…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>

            <div className="hk-filter-pills">
              {FLOORS.map(f => (
                <button key={f} className={`hk-pill ${activeFloor === f ? 'active' : ''}`}
                  onClick={() => setActiveFloor(activeFloor === f ? 'Tous' : f)}>
                  {f}
                </button>
              ))}
            </div>

            <div className="hk-filter-pills">
              <button className={`hk-pill ${activeStatus === 'all' ? 'active' : ''}`} onClick={() => setActiveStatus('all')}>Tous</button>
              {Object.entries(STATUS).map(([k, v]) => (
                <button key={k} className={`hk-pill ${activeStatus === k ? 'active' : ''}`}
                  style={activeStatus === k ? { background: v.bg, color: v.color, borderColor: v.border } : {}}
                  onClick={() => setActiveStatus(activeStatus === k ? 'all' : k)}>
                  {v.emoji} {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Room Grid */}
          <div className="hk-room-grid">
            <AnimatePresence>
              {filtered.map(room => {
                const cfg = STATUS[room.status] || STATUS.clean;
                const Icon = cfg.icon;
                return (
                  <motion.div key={room.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className={`hk-room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                    style={{ borderColor: cfg.border }}
                    onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}>

                    <div className="hk-room-header">
                      <div className="hk-room-number">
                        <span className="hk-room-num">{room.name}</span>
                        <span className="hk-room-type">{room.type}</span>
                      </div>
                      <div className="hk-room-badges">
                        {room.iot && <span className="hk-iot-dot" title="IoT connecté"><Zap size={10} /></span>}
                        <span className="hk-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                          <Icon size={11} /> {cfg.label}
                        </span>
                      </div>
                    </div>

                    <div className="hk-room-body">
                      {room.guest && (
                        <div className="hk-room-guest">
                          <User size={12} /> <span>{room.guest}</span>
                        </div>
                      )}
                      {room.assigned && (
                        <div className="hk-room-assigned">
                          <Users size={12} /> <span>{room.assigned}</span>
                        </div>
                      )}
                      {!room.guest && !room.assigned && (
                        <div className="hk-room-empty">Chambre libre</div>
                      )}
                    </div>

                    <div className="hk-room-floor">Étage {room.floor}</div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="hk-empty">Aucune chambre trouvée pour ces filtres.</div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: TASKS
      ══════════════════════════════════════════════ */}
      {activeTab === 'tasks' && (
        <div className="hk-tasks-tab">
          <div className="hk-tasks-layout">

            {/* Task list */}
            <div className="hk-task-list">
              <div className="hk-section-title"><Sparkles size={15} /> Chambres à traiter</div>
              {rooms.filter(r => ['dirty', 'inspection', 'in_progress'].includes(r.status)).map(room => {
                const cfg = STATUS[room.status];
                const Icon = cfg.icon;
                return (
                  <div key={room.id} className="hk-task-row" onClick={() => setSelectedRoom(room)}>
                    <div className="hk-task-room">
                      <span className="hk-task-num">Ch. {room.name}</span>
                      <span className="hk-task-type">{room.type} • Étage {room.floor}</span>
                    </div>
                    <span className="hk-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                      <Icon size={11} /> {cfg.label}
                    </span>
                    <div className="hk-task-assign">
                      {room.assigned
                        ? <span className="hk-assigned-name"><Users size={12}/> {room.assigned}</span>
                        : <button className="hk-btn-assign" onClick={e => { e.stopPropagation(); setSelectedRoom(room); }}>
                            <Plus size={12} /> Assigner
                          </button>
                      }
                    </div>
                    <div className="hk-task-actions">
                      {room.status === 'dirty' &&
                        <button className="hk-btn-action start" onClick={e => { e.stopPropagation(); updateRoomStatus(room.id, 'in_progress'); }}>
                          <Play size={12} /> Démarrer
                        </button>
                      }
                      {room.status === 'in_progress' &&
                        <button className="hk-btn-action done" onClick={e => { e.stopPropagation(); updateRoomStatus(room.id, 'inspection'); }}>
                          <Check size={12} /> Terminer
                        </button>
                      }
                      {room.status === 'inspection' &&
                        <button className="hk-btn-action clean" onClick={e => { e.stopPropagation(); updateRoomStatus(room.id, 'clean'); }}>
                          <CheckCircle2 size={12} /> Valider
                        </button>
                      }
                    </div>
                  </div>
                );
              })}

              {rooms.filter(r => ['dirty', 'inspection', 'in_progress'].includes(r.status)).length === 0 && (
                <div className="hk-empty">✅ Toutes les chambres sont à jour !</div>
              )}
            </div>

            {/* Staff panel */}
            <div className="hk-staff-panel">
              <div className="hk-section-title"><Users size={15} /> Équipe Housekeeping</div>
              {STAFF.map(name => {
                const assigned = rooms.filter(r => r.assigned === name);
                const inProgress = assigned.filter(r => r.status === 'in_progress').length;
                const done = assigned.filter(r => r.status === 'clean' || r.status === 'inspection').length;
                return (
                  <div key={name} className="hk-staff-card">
                    <div className="hk-staff-avatar">{name.split(' ').map(n => n[0]).join('')}</div>
                    <div className="hk-staff-info">
                      <div className="hk-staff-name">{name}</div>
                      <div className="hk-staff-stats">
                        <span className="hk-staff-stat blue">{inProgress} en cours</span>
                        <span className="hk-staff-stat green">{done} terminée{done > 1 ? 's' : ''}</span>
                        <span className="hk-staff-stat grey">{assigned.length} total</span>
                      </div>
                    </div>
                    <div className="hk-staff-load" title={`${assigned.length} tâches`}>
                      <div className="hk-load-bar"><div className="hk-load-fill" style={{ width: `${Math.min(assigned.length * 20, 100)}%` }} /></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: IoT INTEGRATION
      ══════════════════════════════════════════════ */}
      {activeTab === 'iot' && (
        <div className="hk-iot-tab">
          <div className="hk-iot-layout">

            {/* Webhook config */}
            <div className="hk-iot-card">
              <div className="hk-iot-card-header">
                <Zap size={16} className="hk-iot-icon" />
                <span>Webhook Endpoint IoT</span>
                <span className="hk-badge-live">LIVE</span>
              </div>
              <p className="hk-iot-desc">
                Configurez vos modules IoT (Shelly, Sonoff, Zigbee…) pour envoyer une requête POST à cette URL lors d'un changement d'état de chambre.
              </p>
              <div className="hk-webhook-url">
                <code>{webhookUrl}</code>
                <button className="hk-copy-btn" onClick={copyWebhook}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>

              <div className="hk-iot-example">
                <div className="hk-example-title">Exemple de payload JSON :</div>
                <pre className="hk-code-block">{`POST ${webhookUrl}
Content-Type: application/json
X-API-Key: <votre_clé>

{
  "room_number": "103",
  "status": "dnd",
  "trigger": "hardware_button",
  "device_id": "shelly-103-btn1",
  "timestamp": "2025-06-03T14:32:00Z"
}`}</pre>
              </div>

              <div className="hk-status-codes">
                <div className="hk-iot-card-header" style={{ marginBottom: 8, fontSize: 13 }}>
                  <Settings size={13} /> Valeurs de statut acceptées
                </div>
                <div className="hk-code-grid">
                  {Object.entries(STATUS).map(([k, v]) => (
                    <div key={k} className="hk-code-row">
                      <code className="hk-code-key" style={{ color: v.color, background: v.bg }}>{k}</code>
                      <span className="hk-code-val">{v.emoji} {v.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live log */}
            <div className="hk-iot-card">
              <div className="hk-iot-card-header">
                <Bell size={16} className="hk-iot-icon" />
                <span>Journal Temps Réel</span>
                <span className={`hk-badge-${iotOnline ? 'live' : 'off'}`}>{iotOnline ? '● LIVE' : '○ OFF'}</span>
                <button className="hk-iot-toggle" onClick={() => setIotOnline(p => !p)}>
                  {iotOnline ? <Pause size={12} /> : <Play size={12} />}
                </button>
              </div>

              <div className="hk-log-list">
                <AnimatePresence>
                  {logs.map(log => {
                    const cfg = STATUS[log.status] || STATUS.clean;
                    return (
                      <motion.div key={log.id} className="hk-log-row" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        <span className="hk-log-time">{log.time}</span>
                        <span className="hk-log-room">Ch. {log.room}</span>
                        <span className="hk-log-status" style={{ color: cfg.color, background: cfg.bg }}>{cfg.emoji} {cfg.label}</span>
                        <span className="hk-log-trigger">{log.trigger}</span>
                        {log.ip !== '—' && <span className="hk-log-ip">{log.ip}</span>}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {logs.length === 0 && <div className="hk-empty">En attente d'événements IoT…</div>}
              </div>

              {/* Architecture overview */}
              <div className="hk-arch-box">
                <div className="hk-arch-title">Architecture IoT</div>
                <div className="hk-arch-flow">
                  {[
                    { icon: '🔌', label: 'Module\nIoT', sub: 'Shelly/Sonoff' },
                    { icon: '→', arrow: true },
                    { icon: '📡', label: 'Webhook\nPOST', sub: 'HTTPS' },
                    { icon: '→', arrow: true },
                    { icon: '⚙️', label: 'API\nServer', sub: 'Node.js' },
                    { icon: '→', arrow: true },
                    { icon: '📊', label: 'PMS\nDashboard', sub: 'BilHot' },
                  ].map((step, i) => step.arrow
                    ? <div key={i} className="hk-arch-arrow">→</div>
                    : (
                      <div key={i} className="hk-arch-step">
                        <div className="hk-arch-icon">{step.icon}</div>
                        <div className="hk-arch-label">{step.label}</div>
                        <div className="hk-arch-sub">{step.sub}</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* IoT device list */}
            <div className="hk-iot-card" style={{ gridColumn: '1 / -1' }}>
              <div className="hk-iot-card-header">
                <Wifi size={16} className="hk-iot-icon" />
                <span>Modules IoT par Chambre</span>
                <span className="hk-iot-count">{rooms.filter(r => r.iot).length}/{rooms.length} connectés</span>
              </div>
              <div className="hk-device-grid">
                {rooms.map(room => (
                  <div key={room.id} className={`hk-device-row ${room.iot ? 'connected' : 'disconnected'}`}>
                    <span className="hk-device-room">Ch. {room.name}</span>
                    <span className="hk-device-status">{room.iot ? '🟢 Connecté' : '⚪ Non configuré'}</span>
                    <span className={`hk-status-badge sm`} style={{ background: (STATUS[room.status] || STATUS.clean).bg, color: (STATUS[room.status] || STATUS.clean).color }}>
                      {(STATUS[room.status] || STATUS.clean).emoji} {(STATUS[room.status] || STATUS.clean).label}
                    </span>
                    {!room.iot && (
                      <button className="hk-btn-connect" onClick={() => alert(`Configurez le module IoT de la chambre ${room.name} pour envoyer des requêtes à :\n\n${webhookUrl}`)}>
                        Configurer <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          ROOM DETAIL PANEL (slide-in)
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div className="hk-detail-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRoom(null)}>
            <motion.div className="hk-detail-panel" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              onClick={e => e.stopPropagation()}>

              <div className="hk-detail-header">
                <div>
                  <h2 className="hk-detail-title">Chambre {selectedRoom.name}</h2>
                  <p className="hk-detail-sub">{selectedRoom.type} • Étage {selectedRoom.floor}</p>
                </div>
                <button className="hk-close-btn" onClick={() => setSelectedRoom(null)}><X size={18} /></button>
              </div>

              {/* Current status */}
              <div className="hk-detail-section">
                <div className="hk-detail-label">Statut actuel</div>
                <div className="hk-status-selector">
                  {Object.entries(STATUS).map(([k, v]) => {
                    const Icon = v.icon;
                    return (
                      <button key={k} className={`hk-status-btn ${selectedRoom.status === k ? 'active' : ''}`}
                        style={selectedRoom.status === k ? { background: v.bg, color: v.color, borderColor: v.border } : {}}
                        onClick={() => updateRoomStatus(selectedRoom.id, k)}>
                        <Icon size={13} /> {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guest info */}
              {selectedRoom.guest && (
                <div className="hk-detail-section">
                  <div className="hk-detail-label">Client en chambre</div>
                  <div className="hk-detail-value"><User size={14} /> {selectedRoom.guest}</div>
                </div>
              )}

              {/* Assign staff */}
              <div className="hk-detail-section">
                <div className="hk-detail-label">Assigner à</div>
                <div className="hk-staff-select">
                  <button className={`hk-staff-btn ${!selectedRoom.assigned ? 'active' : ''}`} onClick={() => assignStaff(selectedRoom.id, null)}>
                    — Non assigné
                  </button>
                  {STAFF.map(name => (
                    <button key={name} className={`hk-staff-btn ${selectedRoom.assigned === name ? 'active' : ''}`}
                      onClick={() => assignStaff(selectedRoom.id, name)}>
                      <Users size={12} /> {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* IoT status */}
              <div className="hk-detail-section">
                <div className="hk-detail-label">Module IoT</div>
                <div className={`hk-iot-status-row ${selectedRoom.iot ? 'on' : 'off'}`}>
                  {selectedRoom.iot ? <><Wifi size={14} /> Connecté — mises à jour automatiques</> : <><WifiOff size={14} /> Non configuré</>}
                </div>
              </div>

              {/* Quick actions */}
              <div className="hk-detail-actions">
                <button className="hk-detail-btn primary" onClick={() => { updateRoomStatus(selectedRoom.id, 'in_progress'); }}>
                  <Play size={14} /> Démarrer ménage
                </button>
                <button className="hk-detail-btn success" onClick={() => { updateRoomStatus(selectedRoom.id, 'clean'); }}>
                  <CheckCircle2 size={14} /> Marquer propre
                </button>
                <button className="hk-detail-btn danger" onClick={() => { updateRoomStatus(selectedRoom.id, 'maintenance'); }}>
                  <Wrench size={14} /> Maintenance
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
