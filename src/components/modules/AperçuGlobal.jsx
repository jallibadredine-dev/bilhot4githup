import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Users, CheckCircle2, MessageSquare, Building2 } from 'lucide-react';
import './AperçuGlobal.css';

const AperçuGlobal = ({ pmsMode, hideStats = false, hideDiagram = false, hideTimeline = false }) => {
  const stats = pmsMode === 'pro' ? [
    { label: 'RevPAR (Journalier)', value: '€142.50', trend: '+12% vs last week', color: 'blue' },
    { label: 'Taux d\'Occupation', value: '78%', trend: '92% forecasted for weekend', color: 'green' },
    { label: 'Arrivées / Départs', value: '14 / 8', trend: 'Peak flow: 11:00 AM', color: 'yellow' },
    { label: 'Status Ménage', value: '42 / 65', trend: '6 rooms in inspection', color: 'red' },
  ] : [
    { label: 'Total Propriétés', value: '16', trend: '+2 this month', color: 'blue' },
    { label: 'Réservations Actives', value: '11', trend: '85% occupancy', color: 'green' },
    { label: 'Check-ins en Attente', value: '4', trend: 'Today', color: 'yellow' },
    { label: 'Crédits SMS', value: '2,900', trend: 'Low balance alert', color: 'red' },
  ];

  // Cable connections for the diagram
  const connections = [
    { d: "M 200 100 Q 300 200 512 200", active: true },
    { d: "M 800 100 Q 700 200 512 200", active: true },
    { d: "M 512 200 Q 512 300 512 450", active: true },
  ];

  return (
    <div className={`dashboard-container mode-${pmsMode}`}>
      
      {/* 1. Quick Stats Grid */}
      {!hideStats && (
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              className="stat-card glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="label text-muted">{stat.label}</span>
              <div className="value-wrap">
                <span className="value">{stat.value}</span>
                {stat.label.includes('Occupation') && <div className="mini-progress"><div className="fill" style={{ width: '78%' }}></div></div>}
              </div>
              <div className="trend">
                 <TrendingUp size={12} />
                 <span>{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 2. Central Connectivity Diagram (The Cables) */}
      {!hideDiagram && (
        <div className="cable-diagram-section glass-panel">
           <span className="diagram-title">{pmsMode === 'pro' ? 'Flux Opérationnel Hôtelier (Live)' : 'Connectivité du Flux Opérationnel'}</span>
           
           <svg className="diagram-overlay" viewBox="0 0 1024 500">
              {connections.map((c, i) => (
                <path 
                  key={i} 
                  d={c.d} 
                  className={`connection-path active ${pmsMode === 'pro' ? 'pro-stroke' : ''}`} 
                  style={{ strokeOpacity: 0.2 }}
                />
              ))}
              
              {/* Animated Pulses */}
              <motion.circle cx="0" cy="0" r="3" fill="var(--accent-blue)" style={{ offsetPath: "path('M 200 100 Q 300 200 512 200')" }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
              <motion.circle cx="0" cy="0" r="3" fill="var(--status-green)" style={{ offsetPath: "path('M 800 100 Q 700 200 512 200')" }} animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
           </svg>

           {/* Center Node: The Hub */}
           <div className="journey-node glass-card pos-center" style={{ width: '180px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              {pmsMode === 'pro' ? <Building2 size={32} color="var(--accent-blue)" /> : <LayoutDashboard size={32} color="var(--accent-blue)" />}
              <h4 style={{ marginTop: '10px' }}>{pmsMode === 'pro' ? 'PMS PRO HUB' : 'PMS CORE'}</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--status-green)' }}>● Synchronisé</span>
           </div>
           
           {/* Operations Tags (Mode PRO Only) */}
           {pmsMode === 'pro' && (
             <>
               <div className="op-tag pos-top-left">Housekeeping Assigned</div>
               <div className="op-tag pos-top-right">GDS Syncing...</div>
               <div className="op-tag pos-bottom">Front Desk Active</div>
             </>
           )}
        </div>
      )}

      {/* 3. High-level Timeline (Inspired by image) */}
      {!hideTimeline && (
        <div className="dashboard-timeline glass-card" style={{ padding: '1.5rem' }}>
           <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>{pmsMode === 'pro' ? 'Canaux de Distribution (Hôtel)' : 'Aperçu des Canaux Directs'}</h3>
           
           <div className="timeline-row" style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
              <div className="channel-tag"><img src="https://www.google.com/s2/favicons?domain=booking.com&sz=32" alt=""/> Booking.com (GDS)</div>
              <div style={{ flex: 1, height: '8px', background: 'var(--accent-blue-light)', borderRadius: '4px', position: 'relative' }}>
                 <div style={{ position: 'absolute', left: '10%', width: '80%', height: '100%', background: 'var(--accent-blue)', borderRadius: '4px' }}></div>
              </div>
              <span className="row-value">€4,250</span>
           </div>

           <div className="timeline-row">
              <div className="channel-tag"><img src="https://www.google.com/s2/favicons?domain=expedia.com&sz=32" alt=""/> Expedia</div>
              <div style={{ flex: 1, height: '8px', background: 'var(--accent-gold-light)', borderRadius: '4px', position: 'relative' }}>
                 <div style={{ position: 'absolute', left: '30%', width: '40%', height: '100%', background: 'var(--accent-gold)', borderRadius: '4px' }}></div>
              </div>
              <span className="row-value">€1,820</span>
           </div>
        </div>
      )}

    </div>
  );
};

export default AperçuGlobal;
