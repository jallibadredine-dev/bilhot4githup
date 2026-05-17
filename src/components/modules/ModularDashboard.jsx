import React, { useState } from 'react';
import { 
  Building2, 
  TrendingUp, 
  CalendarDays, 
  Key, 
  Settings2, 
  ArrowRight,
  TrendingDown,
  Users,
  CreditCard,
  MessageSquare,
  Sparkles,
  BedDouble,
  Activity,
  BellRing,
  GripHorizontal,
  Maximize2,
  X,
  PlusCircle,
  Check,
  Bot
} from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import TimelineView from '../views/TimelineView';
import './ModularDashboard.css';

const WIDGETS_CONFIG = [
  { id: 'stats', title: 'Indicateurs Clés de Performance (KPIs)' },
  { id: 'cal_stats', title: 'Statistiques Calendrier' },
  { id: 'timeline', title: 'Calendrier des Réservations (Live)' },
  { id: 'activities', title: 'Opérations & Tâches à faire' },
  { id: 'modules', title: 'Fonctionnalités PMS Pro' }
];

const kpis = [
  { title: "Taux d'Occupation", value: "82%", unit: "", trend: "+5% vs hier", trendType: "positive", icon: <Building2 size={20} color="#2563EB" />, bg: "#EFF6FF" },
  { title: "RevPAR (Aujourd'hui)", value: "145", unit: "€", trend: "+12% vs last week", trendType: "positive", icon: <TrendingUp size={20} color="#16A34A" />, bg: "#F0FDF4" },
  { title: "Arrivées / Départs", value: "14 / 8", unit: "", trend: "2 Check-ins en retard", trendType: "negative", icon: <Users size={20} color="#D97706" />, bg: "#FFFBEB" },
  { title: "Chambres Libres", value: "6", unit: "/ 34", trend: "Toutes nettoyées", trendType: "positive", icon: <BedDouble size={20} color="#7C3AED" />, bg: "#F5F3FF" }
];

const calStats = [
  { label: "Check-ins (7 jours)", value: "48", icon: <Users size={16} />, color: "#2563EB" },
  { label: "Taux Occ. (7 jours)", value: "76%", icon: <Activity size={16} />, color: "#16A34A" },
  { label: "Revenu prévisionnel", value: "12,450€", icon: <TrendingUp size={16} />, color: "#7C3AED" },
  { label: "Annulations", value: "3", icon: <X size={16} />, color: "#DC2626" }
];

const operations = [
  { title: "Clés Salto à Générer", desc: "3 réservations n'ont pas encore reçu leur accès IoT pour aujourd'hui.", time: "Urgent", type: "alert", icon: <Key size={18} /> },
  { title: "Nettoyage VIP (Ch. 204)", desc: "Le client arrive à 14h00. Ménage en cours, validation requise.", time: "Il y a 10 min", type: "warning", icon: <Sparkles size={18} /> },
  { title: "Paiements Synchronisés", desc: "2 acomptes Booking.com traités avec succès via Stripe.", time: "11:42 AM", type: "success", icon: <CreditCard size={18} /> }
];

const features = [
  { title: "Smart Access (IoT)", desc: "Gérez les serrures connectées Salto/TTLock, générez des codes et affichez la topologie.", icon: <Key size={24} />, route: 'locks' },
  { title: "Channel Manager", desc: "Synchronisation GDS bi-directionnelle (Booking, Airbnb, Expedia) en temps réel.", icon: <Activity size={24} />, route: 'distribution' },
  { title: "Finance & Facturation", desc: "Moteur de facturation automatisé, paiements Stripe et taxes de séjour.", icon: <CreditCard size={24} />, route: 'billing-engine' },
  { title: "Guest CRM & Inbox", desc: "Messagerie centralisée et parcours client automatisé interactif.", icon: <MessageSquare size={24} />, route: 'guests' }
];

const ModularDashboard = ({ pmsMode, onModuleSelect }) => {
  const [items, setItems] = useState(['stats', 'cal_stats', 'timeline', 'activities', 'modules']);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={`pro-dashboard-container ${isEditing ? 'editing-mode' : ''}`}>
      
      {/* ─── HEADER ─── */}
      <header className="pro-dashboard-header">
        <div className="header-title-group">
          <h1>Tableau de Bord <span className="ai-badge">Modulaire</span></h1>
          <p>Personnalisez votre page d'accueil avec les données PMS Pro.</p>
        </div>
        <div className="header-actions">
           <button className={`btn-edit-layout ${isEditing ? 'active' : ''}`} onClick={() => setIsEditing(!isEditing)}>
             {isEditing ? <><Check size={16} /> Terminer</> : <><Settings2 size={16} /> Configurer Layout</>}
           </button>
           <button className="btn-edit-layout"><PlusCircle size={16} /> Ajouter Widget</button>
        </div>
      </header>

      {/* ─── WIDGET GRID (DRAG & DROP) ─── */}
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="widget-grid">
        {items.map(item => (
          <Reorder.Item 
            key={item} 
            value={item}
            className={`widget-container widget-${item}`}
          >
            {/* Grab Handle */}
            <div className="widget-handle">
               <GripHorizontal size={16} color="#64748B" />
               <span>{WIDGETS_CONFIG.find(w => w.id === item)?.title}</span>
               <div className="widget-ops">
                  <Maximize2 size={14} className="cursor-pointer hover:text-blue-500" />
                  <X size={14} className="cursor-pointer hover:text-red-500" />
               </div>
            </div>
            
            {/* Widget Content */}
            <div className="widget-content">
               
               {/* 1. WIDGET: STATS (KPIs) */}
               {item === 'stats' && (
                 <div className="kpi-master-grid">
                   {kpis.map((kpi, index) => (
                     <div className="kpi-card" key={index}>
                       <div className="kpi-header">
                         <span className="kpi-label">{kpi.title}</span>
                         <div className="kpi-icon-wrap" style={{ background: kpi.bg }}>{kpi.icon}</div>
                       </div>
                       <div className="kpi-value-block">
                         <span className="kpi-value">{kpi.value}</span>
                         {kpi.unit && <span className="kpi-unit">{kpi.unit}</span>}
                       </div>
                       <div className={`kpi-trend trend-${kpi.trendType}`}>
                         {kpi.trendType === 'positive' && <TrendingUp size={14} />}
                         {kpi.trendType === 'negative' && <TrendingDown size={14} />}
                         <span className="trend-text">{kpi.trend}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               )}

               {/* 1b. WIDGET: CALENDAR STATS */}
               {item === 'cal_stats' && (
                 <div className="cal-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '1rem' }}>
                   {calStats.map((stat, i) => (
                     <div key={i} className="cal-stat-card" style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: stat.color }}>
                          {stat.icon}
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{stat.label}</span>
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>{stat.value}</span>
                     </div>
                   ))}
                 </div>
               )}

               {/* 2. WIDGET: TIMELINE / CALENDAR */}
               {item === 'timeline' && (
                 <div>
                   <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <CalendarDays size={20} color="#2563EB" />
                     <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Planning des Réservations</h2>
                     <div className="live-pulse" style={{ marginLeft: 'auto' }} title="Synchronisation Active"></div>
                   </div>
                   <div className="calendar-embed-wrapper">
                      {/* TimelineView is mounted here as requested */}
                      <TimelineView />
                   </div>
                 </div>
               )}

               {/* 3. WIDGET: ACTIVITIES */}
               {item === 'activities' && (
                 <div>
                   <h2 className="widget-title"><BellRing size={20} color="#F59E0B" /> Tâches & Alertes</h2>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     {operations.map((op, i) => (
                       <div style={{ display: 'flex', gap: '12px', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }} key={i}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: op.type === 'alert' ? '#FEF2F2' : op.type === 'warning' ? '#FFFBEB' : '#F0FDF4', color: op.type === 'alert' ? '#DC2626' : op.type === 'warning' ? '#D97706' : '#16A34A' }}>
                            {op.icon}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>{op.title}</h4>
                            <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4' }}>{op.desc}</p>
                            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94A3B8', marginTop: '6px', display: 'block' }}>{op.time}</span>
                          </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}

               {/* 4. WIDGET: MODULES / FEATURES */}
               {item === 'modules' && (
                 <div>
                   <h2 className="widget-title"><Building2 size={20} color="#0F172A" /> Hub des Fonctionnalités PMS Pro</h2>
                   <div className="features-grid">
                      {features.map((feat, i) => (
                         <div className="feature-card" key={i} onClick={() => onModuleSelect && onModuleSelect(feat.route)}>
                            <div className="feat-icon-box">{feat.icon}</div>
                            <div className="feat-info">
                               <h3>{feat.title}</h3>
                               <p>{feat.desc}</p>
                            </div>
                            <ArrowRight size={20} className="feat-arrow" />
                         </div>
                      ))}
                   </div>
                 </div>
               )}

            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Edit Overlay Hint */}
      {isEditing && (
        <motion.div className="edit-overlay" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
           <div className="edit-hint">
             <GripHorizontal size={20} />
             <span>Glissez les poignées pour réorganiser vos Widgets.</span>
           </div>
        </motion.div>
      )}

    </div>
  );
};

export default ModularDashboard;
