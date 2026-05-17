import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Plus, Star, TrendingUp, Clock, FileText, Shield,
  MessageSquare, Award, X, Calendar, Activity, Check, Mail,
  Trash2, ChevronLeft, MoreVertical, Lock, Globe, Sparkles,
  Eye, EyeOff, Smartphone, CheckCircle2, AlertCircle, RefreshCw,
  Settings, Loader2, Building2, Key, Wifi, BedDouble, LogOut,
  ChevronRight, Bell, UserCheck, Home, Wrench, Utensils
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './StaffHub.css';

/* ─── ROLE DEFINITIONS ─────────────────────────────────────── */
const ROLE_DEFS = {
  manager: {
    id: 'manager', label: 'Manager', emoji: '👑', color: '#FF385C', bg: '#FFF1F2',
    desc: 'Accès complet à toutes les fonctionnalités du PMS',
    modules: { dashboard:true, frontdesk:true, checkin:true, distribution:true, inbox:true, inventory:true, locks:true, revenue:true, reputation:true, guests:true, staff:true, billing:true, settings:true, services:true, housekeeping:true, maintenance:true },
  },
  receptionist: {
    id: 'receptionist', label: 'Réceptionniste', emoji: '🛎️', color: '#3B82F6', bg: '#EFF6FF',
    desc: 'Front desk, check-in/out, inbox, facturation, CRM clients',
    modules: { dashboard:true, frontdesk:true, checkin:true, inbox:true, inventory:true, locks:true, reputation:true, guests:true, billing:true, services:true, distribution:false, revenue:false, staff:false, settings:false, housekeeping:false, maintenance:false },
  },
  waiter: {
    id: 'waiter', label: 'Serveur / F&B', emoji: '🍽️', color: '#F59E0B', bg: '#FFFBEB',
    desc: 'Services, commandes restaurant et spa uniquement',
    modules: { services:true, dashboard:false, frontdesk:false, checkin:false, distribution:false, inbox:false, inventory:false, locks:false, revenue:false, reputation:false, guests:false, staff:false, billing:false, settings:false, housekeeping:false, maintenance:false },
  },
  housekeeping: {
    id: 'housekeeping', label: 'Femme de chambre', emoji: '🧹', color: '#10B981', bg: '#ECFDF5',
    desc: 'Tableau ménage uniquement — voir et marquer les chambres',
    modules: { housekeeping:true, dashboard:false, frontdesk:false, checkin:false, distribution:false, inbox:false, inventory:false, locks:false, revenue:false, reputation:false, guests:false, staff:false, billing:false, settings:false, services:false, maintenance:false },
  },
  maintenance: {
    id: 'maintenance', label: 'Maintenance', emoji: '🔧', color: '#8B5CF6', bg: '#F5F3FF',
    desc: 'Tickets de maintenance, état des équipements',
    modules: { maintenance:true, inventory:true, locks:true, dashboard:false, frontdesk:false, checkin:false, distribution:false, inbox:false, revenue:false, reputation:false, guests:false, staff:false, billing:false, settings:false, services:false, housekeeping:false },
  },
};

const MODULE_LABELS = {
  dashboard:    { label: 'Dashboard & Statistiques',  icon: '📊' },
  frontdesk:    { label: 'Front Desk / Check-in',     icon: '🛎️' },
  checkin:      { label: 'Gestionnaire Check-in',     icon: '✅' },
  distribution: { label: 'Channel Manager (OTA)',     icon: '🌐' },
  inbox:        { label: 'Inbox Omnicanal',            icon: '💬' },
  inventory:    { label: 'Inventaire Chambres',        icon: '🏠' },
  locks:        { label: 'Serrures Connectées',        icon: '🔒' },
  revenue:      { label: 'Revenue AI & Tarification',  icon: '📈' },
  reputation:   { label: 'E-Réputation & Avis',        icon: '⭐' },
  guests:       { label: 'CRM Clients',                icon: '👥' },
  staff:        { label: 'Équipe & RH',                icon: '👔' },
  billing:      { label: 'Facturation & Paiements',    icon: '💳' },
  settings:     { label: 'Paramètres Système',         icon: '⚙️' },
  services:     { label: 'Services Hub (F&B / Spa)',   icon: '🍽️' },
  housekeeping: { label: 'Tableau Ménage',             icon: '🧹' },
  maintenance:  { label: 'Maintenance Technique',      icon: '🔧' },
};

/* ─── CLEANING STATUSES ────────────────────────────────────── */
const CLEAN_CFG = {
  dirty:       { label: 'À nettoyer',   color: '#DC2626', bg: '#FEE2E2', dot: '#EF4444', next: 'in_progress', nextLabel: 'Démarrer le ménage' },
  in_progress: { label: 'En cours',     color: '#D97706', bg: '#FEF3C7', dot: '#F59E0B', next: 'clean',       nextLabel: 'Marquer Terminé ✓'  },
  clean:       { label: 'Propre',       color: '#059669', bg: '#ECFDF5', dot: '#10B981', next: 'inspected',   nextLabel: 'Valider Inspection' },
  inspected:   { label: 'Inspecté ✓',   color: '#7C3AED', bg: '#F5F3FF', dot: '#8B5CF6', next: null,          nextLabel: null                 },
};

/* ─── DEFAULT DATA ─────────────────────────────────────────── */
const DEFAULT_STAFF = [
  { id:'STF-001', name:'Maria Gomez',    email:'maria@hova.io',   phone:'+212 6 00 11 22', role:'housekeeping', status:'online',  joined:'2026-01-15', nps:4.8, notes:[{ date:'15 Mai 2026', author:'Admin',   text:'Excellente gestion du planning VIP.' }] },
  { id:'STF-002', name:'David Lee',      email:'david@hova.io',   phone:'+212 6 00 22 33', role:'receptionist', status:'online',  joined:'2026-02-01', nps:4.5, notes:[{ date:'05 Mai 2026', author:'Manager', text:'A vendu 3 upgrades en Suite ce mois.' }] },
  { id:'STF-003', name:'Sarah Martin',   email:'sarah@hova.io',   phone:'+212 6 00 33 44', role:'waiter',       status:'offline', joined:'2026-03-10', nps:4.9, notes:[] },
  { id:'STF-004', name:'Pierre Dubois',  email:'pierre@hova.io',  phone:'+212 6 00 44 55', role:'manager',      status:'online',  joined:'2025-11-01', nps:5.0, notes:[{ date:'01 Mai 2026', author:'GM',      text:'Performance exemplaire Q2.' }] },
  { id:'STF-005', name:'Fatima Zahra',   email:'fatima@hova.io',  phone:'+212 6 00 55 66', role:'housekeeping', status:'online',  joined:'2026-04-01', nps:4.7, notes:[] },
];

const DEFAULT_CLEANING = {
  '102': { status:'dirty',       floor:1, roomType:'Supérieure', guestName:'Robert Chen',   checkoutTime:'11:00', priority:'high',   assignedTo:null,      note:'' },
  '103': { status:'dirty',       floor:1, roomType:'Deluxe',     guestName:'Ana Santos',     checkoutTime:'10:30', priority:'high',   assignedTo:'STF-001', note:'' },
  '202': { status:'in_progress', floor:2, roomType:'Deluxe',     guestName:'Marie Laurent',  checkoutTime:'12:00', priority:'medium', assignedTo:'STF-005', note:'' },
  '304': { status:'clean',       floor:3, roomType:'Suite',      guestName:'Jean Dupont',    checkoutTime:'09:30', priority:'high',   assignedTo:'STF-001', note:'Minibar restock OK' },
  '201': { status:'inspected',   floor:2, roomType:'Suite',      guestName:'Leila Hassan',   checkoutTime:'09:00', priority:'normal', assignedTo:'STF-005', note:'' },
};

const newStaffDefault = () => ({
  name:'', email:'', phone:'', whatsapp:'',
  role:'receptionist',
  permissions: { ...ROLE_DEFS.receptionist.modules },
});

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const StaffHub = () => {
  const [activeTab,      setActiveTab]      = useState('team');
  const [staffList,      setStaffList]      = useState(() => { try { return JSON.parse(localStorage.getItem('sh_staff')) || DEFAULT_STAFF; } catch { return DEFAULT_STAFF; } });
  const [cleaningTasks,  setCleaningTasks]  = useState(() => { try { return JSON.parse(localStorage.getItem('sh_cleaning_status')) || DEFAULT_CLEANING; } catch { return DEFAULT_CLEANING; } });
  const [selectedStaff,  setSelectedStaff]  = useState(null);
  const [isAddOpen,      setIsAddOpen]      = useState(false);
  const [addStep,        setAddStep]        = useState(1);
  const [newStaff,       setNewStaff]       = useState(newStaffDefault);
  const [sending,        setSending]        = useState(false);
  const [cleanFilter,    setCleanFilter]    = useState('all');
  const [searchQ,        setSearchQ]        = useState('');
  const [noteInput,      setNoteInput]      = useState('');
  const [addingNote,     setAddingNote]     = useState(false);

  /* ── Persist to localStorage ── */
  useEffect(() => { localStorage.setItem('sh_staff', JSON.stringify(staffList)); }, [staffList]);
  useEffect(() => { localStorage.setItem('sh_cleaning_status', JSON.stringify(cleaningTasks)); }, [cleaningTasks]);

  /* ── Role changes → reset permissions ── */
  const setRole = (roleId) => {
    const def = ROLE_DEFS[roleId];
    setNewStaff(prev => ({ ...prev, role: roleId, permissions: { ...def.modules } }));
  };

  /* ── Add staff confirm ── */
  const handleConfirmAdd = () => {
    setSending(true);
    setTimeout(() => {
      const id = `STF-${String(staffList.length + 1).padStart(3,'0')}`;
      setStaffList(prev => [{
        id, name: newStaff.name || 'Nouveau Membre',
        email: newStaff.email, phone: newStaff.phone, whatsapp: newStaff.whatsapp,
        role: newStaff.role, status: 'offline',
        joined: new Date().toISOString().slice(0,10), nps: 0,
        notes: [{ date: new Date().toLocaleDateString('fr-FR'), author: 'System', text: 'Compte créé. Invitation envoyée.' }],
        customPermissions: newStaff.permissions,
      }, ...prev]);
      setSending(false);
      setIsAddOpen(false);
      setAddStep(1);
      setNewStaff(newStaffDefault());
    }, 1200);
  };

  /* ── Update cleaning task status ── */
  const updateCleaningStatus = (roomNumber, newStatus) => {
    setCleaningTasks(prev => ({
      ...prev,
      [roomNumber]: { ...prev[roomNumber], status: newStatus, updatedAt: new Date().toISOString() },
    }));
  };

  const assignCleaner = (roomNumber, staffId) => {
    setCleaningTasks(prev => ({
      ...prev,
      [roomNumber]: { ...prev[roomNumber], assignedTo: staffId || null },
    }));
  };

  const updateCleanNote = (roomNumber, note) => {
    setCleaningTasks(prev => ({
      ...prev,
      [roomNumber]: { ...prev[roomNumber], note },
    }));
  };

  const addStaffNote = (staffId, text) => {
    if (!text.trim()) return;
    setStaffList(prev => prev.map(s => s.id !== staffId ? s : {
      ...s, notes: [{ date: new Date().toLocaleDateString('fr-FR'), author: 'Manager', text }, ...s.notes],
    }));
    setNoteInput(''); setAddingNote(false);
    setSelectedStaff(prev => prev ? { ...prev, notes: [{ date: new Date().toLocaleDateString('fr-FR'), author: 'Manager', text }, ...prev.notes] } : prev);
  };

  /* ── Filtered staff ── */
  const filteredStaff = useMemo(() =>
    staffList.filter(s =>
      (!searchQ || s.name.toLowerCase().includes(searchQ.toLowerCase()) ||
       (ROLE_DEFS[s.role]?.label || '').toLowerCase().includes(searchQ.toLowerCase()))
    ), [staffList, searchQ]);

  /* ── Filtered cleaning tasks ── */
  const filteredTasks = useMemo(() => {
    return Object.entries(cleaningTasks).filter(([,t]) =>
      cleanFilter === 'all' || t.status === cleanFilter
    );
  }, [cleaningTasks, cleanFilter]);

  /* ── KPIs ── */
  const online   = staffList.filter(s => s.status === 'online').length;
  const pending  = Object.values(cleaningTasks).filter(t => t.status === 'dirty').length;
  const inProg   = Object.values(cleaningTasks).filter(t => t.status === 'in_progress').length;
  const housekeepers = staffList.filter(s => s.role === 'housekeeping');

  /* ════════════ RENDER ════════════ */
  return (
    <div className="sh-container">

      {/* ── TOP BAR ── */}
      <div className="sh-topbar">
        <div className="sh-topbar-left">
          <div className="sh-icon-badge"><Users size={18} color="#FF385C"/></div>
          <div>
            <h1 className="sh-title">Équipe & RH</h1>
            <p className="sh-subtitle">Gestion des accès, rôles et tableau ménage</p>
          </div>
        </div>
        <div className="sh-topbar-right">
          <button className="sh-btn-primary" onClick={() => { setIsAddOpen(true); setAddStep(1); }}>
            <Plus size={15}/> Ajouter un membre
          </button>
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="sh-kpi-row">
        <div className="sh-kpi"><span className="sh-kpi-label">Effectif Total</span><div className="sh-kpi-val">{staffList.length}</div><span className="sh-kpi-sub">collaborateurs</span></div>
        <div className="sh-kpi"><span className="sh-kpi-label">En ligne</span><div className="sh-kpi-val" style={{color:'#10B981'}}>{online}</div><span className="sh-kpi-sub">actifs maintenant</span></div>
        <div className="sh-kpi"><span className="sh-kpi-label">Ménage urgent</span><div className="sh-kpi-val" style={{color: pending > 0 ? '#DC2626' : '#222222'}}>{pending}</div><span className="sh-kpi-sub">chambres à nettoyer</span></div>
        <div className="sh-kpi"><span className="sh-kpi-label">En cours</span><div className="sh-kpi-val" style={{color: inProg > 0 ? '#D97706' : '#222222'}}>{inProg}</div><span className="sh-kpi-sub">ménages en cours</span></div>
      </div>

      {/* ── TABS ── */}
      <div className="sh-tabs-bar">
        {[
          { id:'team',         label:'Équipe',          count: staffList.length },
          { id:'housekeeping', label:'Tableau Ménage',   count: pending > 0 ? pending : null, urgent: pending > 0 },
          { id:'permissions',  label:'Matrice Accès',    count: null },
        ].map(tab => (
          <button
            key={tab.id}
            className={`sh-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="sh-tab-badge" style={tab.urgent ? { background:'#FF385C', color:'white' } : {}}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
        <div className="sh-tabs-search">
          {activeTab === 'team' && (
            <div className="sh-search">
              <Search size={13} color="#AAAAAA"/>
              <input placeholder="Rechercher…" value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
            </div>
          )}
        </div>
      </div>

      {/* ════════════ TAB: TEAM ════════════ */}
      {activeTab === 'team' && (
        <div className="sh-team-grid">
          {filteredStaff.map((member, i) => {
            const role = ROLE_DEFS[member.role] || ROLE_DEFS.receptionist;
            return (
              <motion.div
                key={member.id}
                className="sh-member-card"
                onClick={() => setSelectedStaff(member)}
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y:-2, boxShadow:'0 8px 24px rgba(0,0,0,0.1)' }}
              >
                <div className="sh-card-top">
                  <div className="sh-avatar" style={{ background: role.bg, color: role.color }}>
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    <span className={`sh-status-dot ${member.status}`}/>
                  </div>
                  <button className="sh-card-more" onClick={e => { e.stopPropagation(); }}>
                    <MoreVertical size={14}/>
                  </button>
                </div>
                <div className="sh-card-info">
                  <h3 className="sh-card-name">{member.name}</h3>
                  <div className="sh-card-role" style={{ background: role.bg, color: role.color }}>
                    {role.emoji} {role.label}
                  </div>
                  <div className="sh-card-email">{member.email}</div>
                </div>
                <div className="sh-card-metrics">
                  {member.nps > 0 && (
                    <div className="sh-metric"><Star size={11} color="#F59E0B" fill="#F59E0B"/><span>{member.nps}/5</span></div>
                  )}
                  <div className="sh-metric"><Calendar size={11} color="#AAAAAA"/><span>{member.joined}</span></div>
                </div>
              </motion.div>
            );
          })}
          {/* Add card */}
          <motion.div
            className="sh-add-card"
            onClick={() => { setIsAddOpen(true); setAddStep(1); }}
            whileHover={{ y:-2 }}
          >
            <div className="sh-add-icon"><Plus size={24} color="#AAAAAA"/></div>
            <span>Ajouter un collaborateur</span>
          </motion.div>
        </div>
      )}

      {/* ════════════ TAB: HOUSEKEEPING BOARD ════════════ */}
      {activeTab === 'housekeeping' && (
        <div className="sh-housekeeping">

          {/* Sub-filters */}
          <div className="sh-hk-filters">
            {[
              { id:'all',         label:'Toutes les chambres', count: Object.keys(cleaningTasks).length },
              { id:'dirty',       label:'À nettoyer',          count: Object.values(cleaningTasks).filter(t=>t.status==='dirty').length },
              { id:'in_progress', label:'En cours',            count: Object.values(cleaningTasks).filter(t=>t.status==='in_progress').length },
              { id:'clean',       label:'Propres',             count: Object.values(cleaningTasks).filter(t=>t.status==='clean'||t.status==='inspected').length },
            ].map(f => (
              <button
                key={f.id}
                className={`sh-hk-filter ${cleanFilter === f.id ? 'active' : ''}`}
                onClick={() => setCleanFilter(f.id)}
              >
                {f.label}
                <span className="sh-hk-filter-count">{f.count}</span>
              </button>
            ))}
            <div style={{marginLeft:'auto', display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:'0.72rem', color:'#717171', fontWeight:600}}>
                {housekeepers.length} femme{housekeepers.length > 1 ? 's' : ''} de chambre disponible{housekeepers.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Task cards grid */}
          <div className="sh-hk-grid">
            {filteredTasks.length === 0 && (
              <div className="sh-hk-empty">
                <CheckCircle2 size={32} color="#10B981"/>
                <p>Toutes les chambres sont propres ! 🎉</p>
              </div>
            )}
            <AnimatePresence>
              {filteredTasks.map(([roomNumber, task]) => {
                const cfg  = CLEAN_CFG[task.status] || CLEAN_CFG.dirty;
                const assigned = staffList.find(s => s.id === task.assignedTo);
                return (
                  <motion.div
                    key={roomNumber}
                    className="sh-hk-card"
                    style={{ borderLeftColor: cfg.color }}
                    initial={{ opacity:0, y:8 }}
                    animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0 }}
                    layout
                  >
                    {/* Card header */}
                    <div className="sh-hk-card-head">
                      <div className="sh-hk-room-num">
                        <BedDouble size={14} color={cfg.color}/>
                        Chambre {roomNumber}
                      </div>
                      <span className="sh-hk-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                        <span className="sh-hk-dot" style={{ background: cfg.dot }}/>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Room details */}
                    <div className="sh-hk-details">
                      <div className="sh-hk-detail"><Building2 size={11}/> Étage {task.floor} · {task.roomType}</div>
                      <div className="sh-hk-detail"><LogOut size={11}/> Checkout: {task.checkoutTime} · {task.guestName}</div>
                      {task.priority === 'high' && (
                        <div className="sh-hk-priority high"><AlertCircle size={11}/> Priorité haute</div>
                      )}
                    </div>

                    {/* Assign housekeeper */}
                    <div className="sh-hk-assign">
                      <label className="sh-hk-assign-label">Assigné à</label>
                      <select
                        className="sh-hk-select"
                        value={task.assignedTo || ''}
                        onChange={e => assignCleaner(roomNumber, e.target.value)}
                      >
                        <option value="">— Non assigné —</option>
                        {housekeepers.map(hk => (
                          <option key={hk.id} value={hk.id}>{hk.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Note */}
                    <input
                      className="sh-hk-note"
                      placeholder="Note (optionnel)…"
                      value={task.note || ''}
                      onChange={e => updateCleanNote(roomNumber, e.target.value)}
                    />

                    {/* Action button */}
                    {cfg.next && (
                      <button
                        className="sh-hk-action-btn"
                        style={{ background: cfg.next === 'clean' ? '#10B981' : cfg.next === 'inspected' ? '#8B5CF6' : '#F59E0B', color: 'white' }}
                        onClick={() => updateCleaningStatus(roomNumber, cfg.next)}
                      >
                        {cfg.next === 'in_progress' && <RefreshCw size={13}/>}
                        {cfg.next === 'clean'       && <CheckCircle2 size={13}/>}
                        {cfg.next === 'inspected'   && <Shield size={13}/>}
                        {cfg.nextLabel}
                      </button>
                    )}
                    {task.status === 'inspected' && (
                      <div className="sh-hk-done"><CheckCircle2 size={14}/> Validé par le manager</div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ════════════ TAB: PERMISSIONS MATRIX ════════════ */}
      {activeTab === 'permissions' && (
        <div className="sh-permissions">
          <div className="sh-perm-header">
            <h3>Matrice des accès par rôle</h3>
            <p>Chaque rôle détermine les modules accessibles dans le PMS. Personnalisable à l'ajout d'un membre.</p>
          </div>
          <div className="sh-perm-table-wrap">
            <table className="sh-perm-table">
              <thead>
                <tr>
                  <th className="sh-perm-module-col">Module PMS</th>
                  {Object.values(ROLE_DEFS).map(role => (
                    <th key={role.id} style={{ color: role.color }}>
                      <div className="sh-perm-role-head">
                        <span>{role.emoji}</span>
                        <span>{role.label}</span>
                        <span className="sh-perm-role-count">
                          {staffList.filter(s => s.role === role.id).length} membre{staffList.filter(s => s.role === role.id).length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(MODULE_LABELS).map(([modKey, mod]) => (
                  <tr key={modKey}>
                    <td className="sh-perm-module-cell">
                      <span className="sh-perm-mod-icon">{mod.icon}</span>
                      <span>{mod.label}</span>
                    </td>
                    {Object.values(ROLE_DEFS).map(role => (
                      <td key={role.id} className="sh-perm-check-cell">
                        {role.modules[modKey]
                          ? <span className="sh-perm-check yes"><Check size={13}/></span>
                          : <span className="sh-perm-check no"><X size={11}/></span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════ STAFF DETAIL PANEL ════════════ */}
      <AnimatePresence>
        {selectedStaff && (
          <motion.div className="sh-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={() => setSelectedStaff(null)}>
            <motion.div
              className="sh-detail-panel"
              initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
              transition={{ type:'spring', damping:28, stiffness:220 }}
              onClick={e => e.stopPropagation()}
            >
              {(() => {
                const role = ROLE_DEFS[selectedStaff.role] || ROLE_DEFS.receptionist;
                return (
                  <>
                    <div className="sh-detail-head">
                      <button className="sh-btn-back" onClick={() => setSelectedStaff(null)}><ChevronLeft size={18}/> Retour</button>
                      <div style={{display:'flex', gap:8}}>
                        <button className="sh-btn-icon"><Mail size={15}/></button>
                        <button className="sh-btn-icon"><MessageSquare size={15}/></button>
                      </div>
                    </div>

                    {/* Profile hero */}
                    <div className="sh-detail-profile">
                      <div className="sh-detail-avatar" style={{ background: role.bg, color: role.color }}>
                        {selectedStaff.name.split(' ').map(n=>n[0]).join('').toUpperCase()}
                        <span className={`sh-status-dot-xl ${selectedStaff.status}`}/>
                      </div>
                      <h2 className="sh-detail-name">{selectedStaff.name}</h2>
                      <div className="sh-detail-role-badge" style={{ background: role.bg, color: role.color }}>
                        {role.emoji} {role.label}
                      </div>
                      <div className="sh-detail-meta">
                        <span><Mail size={11}/> {selectedStaff.email}</span>
                        {selectedStaff.phone && <span><Smartphone size={11}/> {selectedStaff.phone}</span>}
                        <span><Calendar size={11}/> Depuis {selectedStaff.joined}</span>
                      </div>
                    </div>

                    {/* KPIs */}
                    <div className="sh-detail-kpis">
                      <div className="sh-detail-kpi"><Star size={16} color="#F59E0B" fill="#F59E0B"/><span>{selectedStaff.nps > 0 ? `${selectedStaff.nps}/5` : 'N/A'}</span><label>NPS</label></div>
                      <div className="sh-detail-kpi"><Activity size={16} color="#3B82F6"/><span>{selectedStaff.status === 'online' ? 'En ligne' : 'Hors ligne'}</span><label>Statut</label></div>
                      <div className="sh-detail-kpi"><Shield size={16} color={role.color}/><span>{role.emoji} {role.label}</span><label>Rôle</label></div>
                    </div>

                    {/* Role description + accesses */}
                    <div className="sh-detail-section">
                      <div className="sh-detail-section-title">Accès autorisés</div>
                      <p className="sh-detail-role-desc">{role.desc}</p>
                      <div className="sh-detail-modules">
                        {Object.entries(role.modules).filter(([,v]) => v).map(([k]) => (
                          <span key={k} className="sh-detail-module-tag">
                            {MODULE_LABELS[k]?.icon} {MODULE_LABELS[k]?.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Housekeeping tasks (if housekeeper) */}
                    {selectedStaff.role === 'housekeeping' && (
                      <div className="sh-detail-section">
                        <div className="sh-detail-section-title">Chambres assignées</div>
                        <div className="sh-detail-hk-tasks">
                          {Object.entries(cleaningTasks)
                            .filter(([,t]) => t.assignedTo === selectedStaff.id)
                            .map(([room, task]) => {
                              const cfg = CLEAN_CFG[task.status];
                              return (
                                <div key={room} className="sh-detail-hk-task" style={{ borderLeftColor: cfg.color }}>
                                  <span className="sh-detail-hk-room">Chambre {room}</span>
                                  <span className="sh-hk-status-badge" style={{ background: cfg.bg, color: cfg.color, fontSize:'0.65rem', padding:'2px 8px' }}>
                                    {cfg.label}
                                  </span>
                                </div>
                              );
                            })}
                          {Object.entries(cleaningTasks).filter(([,t]) => t.assignedTo === selectedStaff.id).length === 0 && (
                            <p style={{fontSize:'0.75rem', color:'#AAAAAA'}}>Aucune chambre assignée</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Manager notes */}
                    <div className="sh-detail-section">
                      <div className="sh-detail-section-title-row">
                        <span className="sh-detail-section-title">Notes managériales</span>
                        <button className="sh-btn-add-note" onClick={() => setAddingNote(true)}><Plus size={13}/> Ajouter</button>
                      </div>
                      {addingNote && (
                        <div className="sh-note-add-box">
                          <textarea
                            className="sh-note-textarea"
                            placeholder="Votre note…"
                            value={noteInput}
                            onChange={e => setNoteInput(e.target.value)}
                            rows={2}
                          />
                          <div className="sh-note-add-actions">
                            <button className="sh-btn-cancel-sm" onClick={() => { setAddingNote(false); setNoteInput(''); }}>Annuler</button>
                            <button className="sh-btn-save-note" onClick={() => addStaffNote(selectedStaff.id, noteInput)}>Enregistrer</button>
                          </div>
                        </div>
                      )}
                      <div className="sh-notes-list">
                        {selectedStaff.notes.length === 0
                          ? <p style={{fontSize:'0.75rem', color:'#AAAAAA'}}>Aucune note pour l'instant.</p>
                          : selectedStaff.notes.map((note, i) => (
                            <div key={i} className="sh-note-item">
                              <div className="sh-note-meta"><strong>{note.author}</strong> · {note.date}</div>
                              <p>{note.text}</p>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════ ADD STAFF MODAL ════════════ */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="sh-modal-overlay">
            <motion.div
              className="sh-modal"
              initial={{ scale:0.95, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              exit={{ scale:0.95, opacity:0 }}
            >
              <div className="sh-modal-head">
                <h2>Nouveau Collaborateur</h2>
                <button className="sh-btn-icon" onClick={() => setIsAddOpen(false)}><X size={18}/></button>
              </div>

              {/* Step indicator */}
              <div className="sh-steps">
                {['Identité', 'Rôle', 'Permissions'].map((label, idx) => (
                  <React.Fragment key={label}>
                    <div className={`sh-step ${addStep > idx + 1 ? 'done' : ''} ${addStep === idx + 1 ? 'active' : ''}`}>
                      <div className="sh-step-num">{addStep > idx + 1 ? <Check size={12}/> : idx + 1}</div>
                      <span>{label}</span>
                    </div>
                    {idx < 2 && <div className={`sh-step-line ${addStep > idx + 1 ? 'done' : ''}`}/>}
                  </React.Fragment>
                ))}
              </div>

              <div className="sh-modal-body">

                {/* STEP 1: Identity */}
                {addStep === 1 && (
                  <motion.div className="sh-step-content" initial={{x:20,opacity:0}} animate={{x:0,opacity:1}}>
                    <div className="sh-form-row">
                      <div className="sh-form-group">
                        <label>Nom complet *</label>
                        <input placeholder="Jean Dupont" value={newStaff.name} onChange={e => setNewStaff(p=>({...p,name:e.target.value}))}/>
                      </div>
                    </div>
                    <div className="sh-form-row">
                      <div className="sh-form-group">
                        <label>Email de connexion *</label>
                        <input type="email" placeholder="jean@hotel.com" value={newStaff.email} onChange={e => setNewStaff(p=>({...p,email:e.target.value}))}/>
                      </div>
                      <div className="sh-form-group">
                        <label>Téléphone</label>
                        <input type="tel" placeholder="+212 6 00 00 00" value={newStaff.phone} onChange={e => setNewStaff(p=>({...p,phone:e.target.value}))}/>
                      </div>
                    </div>
                    <div className="sh-form-group">
                      <label>WhatsApp (notifications automatiques)</label>
                      <input type="tel" placeholder="+212 6 00 00 00" value={newStaff.whatsapp} onChange={e => setNewStaff(p=>({...p,whatsapp:e.target.value}))}/>
                    </div>
                    <div className="sh-info-box">
                      <Sparkles size={14} color="#7C3AED"/>
                      <div>
                        <strong>Invitation automatique</strong>
                        <p>Un mot de passe temporaire sécurisé sera généré et envoyé par email et WhatsApp.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Role */}
                {addStep === 2 && (
                  <motion.div className="sh-step-content" initial={{x:20,opacity:0}} animate={{x:0,opacity:1}}>
                    <p className="sh-step-desc">Choisissez le rôle — les permissions s'ajustent automatiquement.</p>
                    <div className="sh-role-grid">
                      {Object.values(ROLE_DEFS).map(role => (
                        <label key={role.id} className={`sh-role-card ${newStaff.role === role.id ? 'selected' : ''}`} style={newStaff.role === role.id ? { borderColor: role.color, background: role.bg } : {}}>
                          <input type="radio" name="role" checked={newStaff.role === role.id} onChange={() => setRole(role.id)}/>
                          <div className="sh-role-emoji">{role.emoji}</div>
                          <div className="sh-role-info">
                            <strong style={{ color: newStaff.role === role.id ? role.color : '#222222' }}>{role.label}</strong>
                            <span>{role.desc}</span>
                          </div>
                          <div className="sh-role-access-count">
                            {Object.values(role.modules).filter(Boolean).length} module{Object.values(role.modules).filter(Boolean).length > 1 ? 's' : ''}
                          </div>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Permissions */}
                {addStep === 3 && (
                  <motion.div className="sh-step-content" initial={{x:20,opacity:0}} animate={{x:0,opacity:1}}>
                    <p className="sh-step-desc">
                      Permissions pour <strong>{ROLE_DEFS[newStaff.role]?.emoji} {ROLE_DEFS[newStaff.role]?.label}</strong> — activez/désactivez selon vos besoins.
                    </p>
                    <div className="sh-perms-list">
                      {Object.entries(MODULE_LABELS).map(([key, mod]) => (
                        <div key={key} className={`sh-perm-row ${newStaff.permissions[key] ? 'on' : ''}`}>
                          <div className="sh-perm-left">
                            <span className="sh-perm-icon">{mod.icon}</span>
                            <span className="sh-perm-name">{mod.label}</span>
                          </div>
                          <div
                            className={`sh-toggle ${newStaff.permissions[key] ? 'on' : ''}`}
                            onClick={() => setNewStaff(p => ({ ...p, permissions: { ...p.permissions, [key]: !p.permissions[key] } }))}
                          >
                            <div className="sh-toggle-knob"/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="sh-modal-footer">
                <div>
                  {addStep > 1 && <button className="sh-btn-secondary" onClick={() => setAddStep(p=>p-1)}>Précédent</button>}
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  {!newStaff.name.trim() && addStep === 1 && <span style={{fontSize:'0.72rem',color:'#AAAAAA'}}>Remplissez le nom complet</span>}
                  {addStep < 3
                    ? <button className="sh-btn-primary" onClick={() => setAddStep(p=>p+1)} disabled={addStep===1 && !newStaff.name.trim()}>
                        Étape suivante <ChevronRight size={14}/>
                      </button>
                    : <button className="sh-btn-invite" onClick={handleConfirmAdd} disabled={sending}>
                        {sending ? <><Loader2 size={14} className="sh-spin"/> Envoi…</> : <><Mail size={14}/> Confirmer & Inviter</>}
                      </button>
                  }
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StaffHub;
