import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  MessageSquare, 
  Building2, 
  Calendar, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  Home,
  Bell,
  Star
} from 'lucide-react';
import './AperçuGlobal.css';

const AperçuGlobal = ({ pmsMode, onModuleSelect }) => {
  const stats = pmsMode === 'pro' ? [
    { label: 'RevPAR (Journalier)', value: '€142.50', trend: '+12%', color: 'blue' },
    { label: 'Occupation', value: '78%', trend: '+5%', color: 'green' },
    { label: 'Arrivées', value: '14', trend: '8 Départs', color: 'yellow' },
    { label: 'Ménage', value: '42/65', trend: '6 Insp.', color: 'red' },
  ] : [
    { label: 'Propriétés', value: '16', trend: '+2', color: 'blue' },
    { label: 'Occupation', value: '85%', trend: 'Actif', color: 'green' },
    { label: 'Check-ins', value: '4', trend: 'Aujourd\'hui', color: 'yellow' },
    { label: 'Crédits SMS', value: '2.9k', trend: 'Bas', color: 'red' },
  ];

  const todayActivities = [
    { time: '09:00', guest: 'Famille ALAMI', action: 'Check-in', unit: 'Villa Mer', status: 'ready' },
    { time: '11:30', guest: 'Jean Dupont', action: 'Check-out', unit: 'Appart. 101', status: 'pending' },
    { time: '14:00', guest: 'Alice Mertens', action: 'Check-in', unit: 'Studio 204', status: 'ready' },
  ];

  return (
    <div className={`dashboard-container mode-${pmsMode}`}>
      
      {/* ─── TOP SECTION: GREETING & QUICK STATS ─── */}
      <div className="dashboard-hero">
         <div className="hero-content">
            <h1>Bonjour, Omar 👋</h1>
            <p>Voici ce qui se passe dans votre établissement aujourd'hui.</p>
         </div>
         <div className="hero-actions">
            <button className="btn-hero-notify"><Bell size={20} /><span className="badge-dot"></span></button>
            <div className="user-avatar-group">
               <img src="https://ui-avatars.com/api/?name=Omar+Alami&background=2E65F3&color=fff" alt="Avatar" />
            </div>
         </div>
      </div>

      <div className="dashboard-grid-layout">
         
         {/* LEFT COLUMN: Stats & Main Widgets */}
         <div className="dashboard-main-col">
            <div className="stats-responsive-grid">
               {stats.map((stat, i) => (
                 <motion.div 
                   key={i} 
                   className={`stat-card-premium ${stat.color}`}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.1 }}
                 >
                   <div className="stat-icon-wrap">
                      {stat.label === 'Occupation' ? <TrendingUp size={18} /> : 
                       stat.label === 'Arrivées' || stat.label === 'Check-ins' ? <Users size={18} /> : 
                       <LayoutDashboard size={18} />}
                   </div>
                   <div className="stat-info">
                      <span className="stat-label">{stat.label}</span>
                      <span className="stat-value">{stat.value}</span>
                      <span className="stat-trend"><ArrowUpRight size={12} /> {stat.trend}</span>
                   </div>
                 </motion.div>
               ))}
            </div>

            {/* MINI CALENDAR DEMO SECTION */}
            <section className="dashboard-section glass-panel">
               <div className="section-header">
                  <div className="header-title">
                     <Calendar size={18} className="text-blue" />
                     <h3>Aperçu Calendrier (Live Demo)</h3>
                  </div>
                  <button className="btn-view-all" onClick={() => onModuleSelect && onModuleSelect('timeline')}>
                     Voir le calendrier complet <ChevronRight size={14} />
                  </button>
               </div>

               <div className="mini-calendar-timeline">
                  <div className="timeline-days-header">
                     <div className="unit-col-empty"></div>
                     {[...Array(7)].map((_, i) => (
                       <div key={i} className="day-header-cell">
                          <span className="day-name">{['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][i]}</span>
                          <span className="day-num">{26 + i}</span>
                       </div>
                     ))}
                  </div>

                  <div className="timeline-body">
                     {['Appart. 101', 'Villa Mer', 'Studio 204'].map((unit, i) => (
                       <div key={i} className="timeline-row">
                          <div className="unit-cell">
                             <Home size={14} /> <span>{unit}</span>
                          </div>
                          <div className="booking-cells">
                             {i === 0 && <div className="booking-bar blue" style={{ left: '0%', width: '42%' }}>ALAMI (3 nuits)</div>}
                             {i === 1 && <div className="booking-bar green" style={{ left: '30%', width: '55%' }}>DUPONT (5 nuits)</div>}
                             {i === 2 && <div className="booking-bar yellow" style={{ left: '10%', width: '25%' }}>MERTENS</div>}
                             {[...Array(7)].map((_, j) => <div key={j} className="empty-cell"></div>)}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* DISTRIBUTION CHANNELS */}
            <section className="dashboard-section glass-panel">
               <div className="section-header">
                  <h3>Canaux de Réservation</h3>
                  <div className="status-live"><span className="pulse"></span> Live Sync</div>
               </div>
               <div className="channels-horizontal">
                  <div className="channel-item">
                     <img src="https://www.google.com/s2/favicons?domain=booking.com&sz=32" alt=""/>
                     <div className="ch-meta">
                        <span>Booking.com</span>
                        <div className="ch-progress"><div className="fill blue" style={{width: '75%'}}></div></div>
                     </div>
                  </div>
                  <div className="channel-item">
                     <img src="https://www.google.com/s2/favicons?domain=airbnb.com&sz=32" alt=""/>
                     <div className="ch-meta">
                        <span>Airbnb</span>
                        <div className="ch-progress"><div className="fill red" style={{width: '45%'}}></div></div>
                     </div>
                  </div>
                  <div className="channel-item">
                     <img src="https://www.google.com/s2/favicons?domain=expedia.com&sz=32" alt=""/>
                     <div className="ch-meta">
                        <span>Expedia</span>
                        <div className="ch-progress"><div className="fill yellow" style={{width: '30%'}}></div></div>
                     </div>
                  </div>
               </div>
            </section>
         </div>

         {/* RIGHT COLUMN: Agenda & Tasks */}
         <div className="dashboard-side-col">
            <div className="agenda-card glass-panel">
               <div className="agenda-header">
                  <h3><Clock size={18} /> Agenda du Jour</h3>
                  <span className="date-tag">26 Oct.</span>
               </div>
               <div className="agenda-list">
                  {todayActivities.map((act, i) => (
                    <div key={i} className="agenda-item">
                       <div className={`time-indicator ${act.status}`}>{act.time}</div>
                       <div className="agenda-info">
                          <span className="guest-name">{act.guest}</span>
                          <span className="action-tag">{act.action} • {act.unit}</span>
                       </div>
                       <ChevronRight size={14} className="text-muted" />
                    </div>
                  ))}
               </div>
               <button className="btn-full-agenda">Voir tout l'agenda</button>
            </div>

            <div className="performance-card glass-panel">
               <h3>Performance Hebdo</h3>
               <div className="perf-chart-sim">
                  {[45, 60, 55, 80, 70, 90, 85].map((h, i) => (
                    <div key={i} className="bar-wrap">
                       <motion.div 
                         className="bar" 
                         initial={{ height: 0 }} 
                         animate={{ height: `${h}%` }} 
                         transition={{ delay: i * 0.05 }}
                       ></motion.div>
                       <span className="bar-label">{['L','M','M','J','V','S','D'][i]}</span>
                    </div>
                  ))}
               </div>
               <div className="perf-footer">
                  <div className="p-stat">
                     <span className="p-val">€8,420</span>
                     <span className="p-lab">CA Estimé</span>
                  </div>
                  <div className="p-stat">
                     <span className="p-val">4.8</span>
                     <span className="p-lab"><Star size={10} fill="currentColor" /> Avis</span>
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};

export default AperçuGlobal;
