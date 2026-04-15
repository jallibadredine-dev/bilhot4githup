import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, MessageSquare, Trash2, Edit2, 
  MoreHorizontal, Key, Smartphone, Tag, CreditCard, X, 
  CheckCircle2, Calculator, Plus, Search, Calendar, 
  User, CheckCircle, CreditCard as CardIcon, Download, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './TimelineView.css';

const TimelineView = () => {
  // Calendar View State
  const [currentView, setCurrentView] = useState('week'); // 'day', 'week', 'month'
  
  // Selected Item State
  const [selectedRes, setSelectedRes] = useState(null);
  const [activeTab, setActiveTab] = useState('detail'); // detail, access, finance
  
  // Create New Reservation State
  const [isCreating, setIsCreating] = useState(false);
  const [newResData, setNewResData] = useState({ room: '', dateIndex: 0, guestName: '' });

  // Mock reservations data
  const [reservations, setReservations] = useState([
    { id: 'RES-001', guest: 'Jean Dupont', room: '101', status: 'confirmed', start: 10, width: 30, basePrice: 450, totalPaid: 150, hasKey: false, type: 'standard', arrival: '10 Oct', departure: '13 Oct', nights: 3, source: 'Airbnb' },
    { id: 'RES-002', guest: 'Marie Laurent', room: '204', status: 'in-house', start: 40, width: 45, basePrice: 1200, totalPaid: 1200, hasKey: true, type: 'vip', arrival: '13 Oct', departure: '18 Oct', nights: 5, source: 'Direct' },
    { id: 'RES-003', guest: 'Lucie Bernard', room: '312', status: 'pending', start: 0, width: 25, basePrice: 320, totalPaid: 0, hasKey: false, type: 'standard', arrival: '09 Oct', departure: '11 Oct', nights: 2, source: 'Booking.com' },
  ]);

  const rooms = [
    { id: '101', type: 'Chambre Double', floor: 1 },
    { id: '102', type: 'Chambre Simple', floor: 1 },
    { id: '105', type: 'Suite', floor: 1 },
    { id: '201', type: 'Chambre Double', floor: 2 },
    { id: '204', type: 'Suite VIP', floor: 2 },
    { id: '312', type: 'Chambre Familiale', floor: 3 },
  ];

  /* ─── Handlers ─── */
  const handleBarClick = (res, e) => {
    e.stopPropagation();
    setSelectedRes(res);
    setActiveTab('detail');
  };

  const closePanel = () => {
    setSelectedRes(null);
  };

  const handleGridClick = (roomId, cellIndex) => {
    setNewResData({ room: roomId, dateIndex: cellIndex, guestName: '' });
    setIsCreating(true);
  };

  const submitNewReservation = () => {
    if (!newResData.guestName.trim()) return;
    const newRes = {
      id: `RES-00${reservations.length + 1}`,
      guest: newResData.guestName,
      room: newResData.room,
      status: 'pending',
      start: newResData.dateIndex * (100 / 14), // 14 days visible
      width: 20, // default width
      basePrice: 200,
      totalPaid: 0,
      hasKey: false,
      type: 'standard',
      arrival: `Oct ${10 + newResData.dateIndex}`,
      departure: `Oct ${12 + newResData.dateIndex}`,
      nights: 2,
      source: 'Manual'
    };
    setReservations([...reservations, newRes]);
    setIsCreating(false);
  };

  /* ─── Mock PIN Gen ─── */
  const [pin, setPin] = useState(null);
  const generatePin = () => {
    setPin('4829-11');
    setTimeout(() => {
      setReservations(prev => prev.map(r => r.id === selectedRes.id ? { ...r, hasKey: true } : r));
      setSelectedRes(prev => ({...prev, hasKey: true}));
    }, 500);
  };

  return (
    <div className="timeline-container hide-scrollbar">
      
      {/* ─── Header Toolbar ─── */}
      <div className="timeline-header">
        <div className="timeline-toolbar">
          <div className="timeline-controls-left">
            <div className="date-nav-group">
              <button className="btn-nav-arrow"><ChevronLeft size={16} /></button>
              <button className="btn-nav-arrow"><ChevronRight size={16} /></button>
            </div>
            <span className="current-date-range">Oct 09 — Oct 22, 2026</span>
            <button className="btn-today">Aujourd'hui</button>
          </div>
          
          <div className="timeline-controls-right">
            <div className="view-toggle">
              <button className={`view-btn ${currentView === 'day' ? 'active' : ''}`} onClick={() => setCurrentView('day')}>Jour</button>
              <button className={`view-btn ${currentView === 'week' ? 'active' : ''}`} onClick={() => setCurrentView('week')}>Semaine</button>
              <button className={`view-btn ${currentView === 'month' ? 'active' : ''}`} onClick={() => setCurrentView('month')}>Mois</button>
            </div>
            <button className="btn-action-outline"><Filter size={16}/> Filtres</button>
            <button className="btn-action-outline"><Search size={16}/></button>
            <button className="btn-primary-add" onClick={() => setIsCreating(true)}><Plus size={16}/> Nouvelle Résa</button>
          </div>
        </div>

        {/* Days Row */}
        <div className="days-row">
          {Array.from({ length: 14 }).map((_, i) => {
            const date = i + 9;
            const isToday = date === 14;
            return (
              <div key={i} className={`day-header ${isToday ? 'active' : ''}`}>
                {isToday && <div className="time-badge-pro">10:44</div>}
                <span className="day-name">Oct</span>
                <span>{date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Timeline Grid ─── */}
      <div className="timeline-grid hide-scrollbar">
        
        {/* Background Lines */}
        <div className="grid-bg-lines">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className={`grid-line-col ${i === 5 ? 'current-day-line' : ''}`}></div>
          ))}
        </div>

        {/* Tracks List */}
        <div className="timeline-tracks-container">
          {rooms.map((room) => {
            // Filter reservations for this room
            const roomReses = reservations.filter(r => r.room === room.id);
            
            return (
              <div className="track-row" key={room.id}>
                {/* Fixed Label Sidebar */}
                <div className="room-sidebar-label">
                  <span className="room-name-text">Ch. {room.id}</span>
                  <span className="room-type-text">{room.type}</span>
                </div>

                {/* Interactive Grid Area (for clicking to add) */}
                <div className="grid-interactive-area">
                  {Array.from({ length: 14 }).map((_, cellIdx) => (
                    <div 
                      key={cellIdx} 
                      className="grid-cell-clickable"
                      onClick={() => handleGridClick(room.id, cellIdx)}
                    ></div>
                  ))}
                </div>

                {/* Reservation Bars */}
                {roomReses.map(res => (
                  <div 
                    key={res.id} 
                    className={`res-bar-wrapper status-${res.status}`}
                    style={{ left: `calc(140px + ${res.start}%)`, width: `${res.width}%` }}
                    onClick={(e) => handleBarClick(res, e)}
                  >
                    <div className="res-edge-indicator"></div>
                    <div className="res-content">
                      <span className="res-guest-name">{res.guest}</span>
                      <div className="res-icons">
                        {res.hasKey && <Key size={12} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── ADVANCED SIDE PANEL ─── */}
      <AnimatePresence>
        {selectedRes && (
          <motion.div 
            className="advanced-panel-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
          >
            <motion.div 
              className="side-panel-content"
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="panel-top-banner">
                <div>
                  <h2 className="panel-guest-title">{selectedRes.guest}</h2>
                  <span className="panel-res-id">{selectedRes.id} • {selectedRes.source}</span>
                </div>
                <button className="btn-close-panel" onClick={closePanel}><X size={20}/></button>
              </div>

              <div className="panel-meta-bar">
                <div className="meta-item"><Calendar size={14} color="#64748B"/> {selectedRes.arrival} — {selectedRes.departure}</div>
                <div className="meta-item"><User size={14} color="#64748B"/> 2 Adultes</div>
                <div className="meta-item" style={{color: '#16A34A', fontWeight: 700}}>Ch. {selectedRes.room}</div>
              </div>

              {/* TABS */}
              <div className="panel-tabs-container">
                <div className={`panel-tab ${activeTab === 'detail' ? 'active' : ''}`} onClick={() => setActiveTab('detail')}>Vue Globale</div>
                <div className={`panel-tab ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>Finance</div>
                <div className={`panel-tab ${activeTab === 'access' ? 'active' : ''}`} onClick={() => setActiveTab('access')}>Accès IoT</div>
              </div>

              {/* BODY SCROLL */}
              <div className="panel-body-scroll hide-scrollbar">
                
                {/* TAB: DETAIL */}
                {activeTab === 'detail' && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} className="tab-pane">
                    <h3 className="section-headline">Informations Séjour</h3>
                    <div className="info-card-grid">
                      <div className="info-block">
                        <span className="info-label">Statut</span>
                        <span className="info-value" style={{color: selectedRes.status === 'in-house' ? '#059669' : '#2563EB', textTransform: 'capitalize'}}>{selectedRes.status}</span>
                      </div>
                      <div className="info-block">
                        <span className="info-label">Check-in / Check-out</span>
                        <span className="info-value">14:00 / 11:00</span>
                      </div>
                      <div className="info-block">
                        <span className="info-label">Canal de vente</span>
                        <span className="info-value">{selectedRes.source}</span>
                      </div>
                      <div className="info-block">
                        <span className="info-label">Tarif de base</span>
                        <span className="info-value">{selectedRes.basePrice}€ / {selectedRes.nights} Nuits</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB: FINANCE */}
                {activeTab === 'finance' && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} className="tab-pane">
                    <h3 className="section-headline">Détails de Facturation</h3>
                    <table className="finance-table">
                      <tbody>
                        <tr><td>Hébergement ({selectedRes.nights} nuits)</td><td>€{selectedRes.basePrice.toFixed(2)}</td></tr>
                        <tr><td>Taxe de séjour (City Tax)</td><td>€{(selectedRes.nights * 2.5).toFixed(2)}</td></tr>
                        <tr><td>Acompte déjà payé (OTA)</td><td style={{color: '#16A34A'}}>- €{selectedRes.totalPaid.toFixed(2)}</td></tr>
                        <tr className="total-row">
                          <td className={(selectedRes.basePrice + (selectedRes.nights * 2.5) - selectedRes.totalPaid) > 0 ? 'balance-due' : ''}>Solde restant à régler</td>
                          <td className={(selectedRes.basePrice + (selectedRes.nights * 2.5) - selectedRes.totalPaid) > 0 ? 'balance-due' : ''}>€{Math.max(0, (selectedRes.basePrice + (selectedRes.nights * 2.5) - selectedRes.totalPaid)).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {/* TAB: ACCESS */}
                {activeTab === 'access' && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} className="tab-pane">
                    <h3 className="section-headline">Smart Lock (Salto / TTLock)</h3>
                    <div className="access-control-box">
                      <div className="access-status-row">
                        <span style={{fontWeight: 600, color: '#0F172A'}}>Serrure Ch. {selectedRes.room}</span>
                        <div className={`status-pill ${selectedRes.hasKey ? 'active' : 'pending'}`}>
                          <div className={`led-dot ${selectedRes.hasKey ? 'green' : ''}`}></div>
                          {selectedRes.hasKey ? 'Clé Active' : 'Aucune Clé'}
                        </div>
                      </div>
                      <p style={{fontSize: '0.8rem', color: '#64748B', marginBottom: '16px'}}>Générez un code PIN pour l'envoyer via WhatsApp ou SMS au client.</p>
                      
                      {selectedRes.hasKey || pin ? (
                        <div className="access-pin-display">{pin || '8492-45'}</div>
                      ) : (
                        <button className="btn-generate-pin" onClick={generatePin}>
                          <Smartphone size={16}/> Générer Code PIN
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

              </div>

              {/* FOOTER */}
              <div className="panel-footer-actions">
                <button className="btn-panel-secondary">Contacter Client</button>
                <button className="btn-panel-primary">Sauvegarder</button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── QUICK CREATE MODAL (POPOVER) ─── */}
      <AnimatePresence>
        {isCreating && (
          <div className="advanced-panel-overlay" style={{justifyContent: 'center', alignItems: 'center'}} onClick={() => setIsCreating(false)}>
            <motion.div 
              className="create-modal-container" 
              initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.95}}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="create-modal-header">Nouvelle Réservation</h2>
              <div className="create-form-group">
                <label>Nom du Client</label>
                <input autoFocus type="text" className="luxe-input" value={newResData.guestName} onChange={e => setNewResData({...newResData, guestName: e.target.value})} placeholder="Ex: Alex Marchand" />
              </div>
              <div className="create-form-group">
                <label>Chambre (Assignation)</label>
                <select className="luxe-input" value={newResData.room} onChange={e => setNewResData({...newResData, room: e.target.value})}>
                  <option value="">Sélectionnez...</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>Chambre {r.id} ({r.type})</option>)}
                </select>
              </div>
              <div className="create-actions">
                <button className="btn-panel-secondary" onClick={() => setIsCreating(false)} style={{flex: 'unset', padding: '10px 16px'}}>Annuler</button>
                <button className="btn-panel-primary" onClick={submitNewReservation} style={{flex: 'unset', padding: '10px 20px'}}>Créer la Réservation</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TimelineView;
