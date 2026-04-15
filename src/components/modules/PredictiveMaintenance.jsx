import React, { useState } from 'react';
import { 
  Wrench, 
  Wind, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Sparkles,
  Navigation,
  Box,
  Zap,
  Power
} from 'lucide-react';
import { motion } from 'framer-motion';
import './PredictiveMaintenance.css';

const PredictiveMaintenance = () => {
  const [activeTab, setActiveTab] = useState('housekeeping');

  const predictiveAlerts = [
    { id: 1, component: 'AC Unit - Room 402', issue: 'Compressor Vibration High', risk: 'Critical', time: 'Est. failure: 48h' },
    { id: 2, component: 'Elevator B', issue: 'Door Motor Lag', risk: 'Medium', time: 'Scheduled: Tonight' },
  ];

  const tasks = [
    { id: 101, room: '101', type: 'Stay-over', priority: 'High', staff: 'Maria G.', status: 'In Progress' },
    { id: 102, room: '304', type: 'Deep Clean', priority: 'Medium', staff: 'David L.', status: 'Pending' },
    { id: 103, room: '512', type: 'Inspection', priority: 'Critical', staff: 'Unassigned', status: 'Unassigned' },
  ];

  return (
    <div className="maintenance-container animate-fade-in">
      <header className="maintenance-header">
        <div className="title-group">
          <h1>Ops & Maintenance <span className="ai-badge">Predictive AI</span></h1>
          <p>Optimisation des ressources & Maintenance préventive</p>
        </div>
        <div className="tab-switcher">
           <button className={`tab ${activeTab === 'housekeeping' ? 'active' : ''}`} onClick={() => setActiveTab('housekeeping')}>Ménage (Optimisé)</button>
           <button className={`tab ${activeTab === 'technical' ? 'active' : ''}`} onClick={() => setActiveTab('technical')}>Maintenance Technique</button>
        </div>
      </header>

      <div className="maintenance-grid">
        {/* Left Column: Alerts and Predictions */}
        <section className="predictive-pane glass-panel">
          <div className="pane-header">
             <Sparkles size={18} color="var(--accent-blue)" />
             <h3>Alertes Prédictives IA</h3>
          </div>
          
          <div className="alerts-list">
            {predictiveAlerts.map(alert => (
              <div key={alert.id} className={`alert-card ${alert.risk.toLowerCase()}`}>
                 <div className="alert-top">
                    <AlertTriangle size={16} />
                    <strong>{alert.component}</strong>
                    <span className="risk-badge">{alert.risk}</span>
                 </div>
                 <p className="issue-desc">{alert.issue}</p>
                 <div className="alert-footer">
                    <span><Clock size={12} /> {alert.time}</span>
                    <button className="btn-fix">Assigner Réparation</button>
                 </div>
              </div>
            ))}
          </div>

          <div className="energy-prediction glass-panel smaller">
             <div className="energy-header">
                <Zap size={16} color="#F59E0B" />
                <h4>Prédiction Consommation</h4>
             </div>
             <div className="energy-bar"><div className="fill" style={{ width: '65%' }}></div></div>
             <p>L'IA prévoit un pic de charge à 19h00. Passage en <strong>Mode Éco</strong> suggéré pour les zones communes.</p>
          </div>
        </section>

        {/* Right Column: Optimized Cleaning Schedule */}
        <section className="ops-pane glass-panel">
           <div className="pane-header">
              <Navigation size={18} />
              <h3>Parcours Ménage Optimisés</h3>
              <div className="route-score">Efficacité: +18%</div>
           </div>

           <div className="task-list">
             {tasks.map(task => (
               <div key={task.id} className="task-row">
                  <div className="room-box">
                     <span className="room-label">Room</span>
                     <span className="room-num">{task.room}</span>
                  </div>
                  <div className="task-details">
                     <div className="task-top">
                        <strong>{task.type}</strong>
                        <span className={`priority-pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                     </div>
                     <div className="staff-info">
                        <User size={12} /> {task.staff}
                     </div>
                  </div>
                  <div className="task-actions">
                     {task.status === 'Unassigned' ? (
                        <button className="btn-assign">Auto-Assign <Sparkles size={12} /></button>
                     ) : (
                        <span className="status-label">{task.status}</span>
                     )}
                     <ArrowRight size={16} className="arrow" />
                  </div>
               </div>
             ))}
           </div>

           <div className="stock-prediction-box">
              <Box size={24} />
              <div className="stock-content">
                 <h4>Auto-Refill Consommables</h4>
                 <p>Basé sur l'occupation prévue, commande de <strong>400 sets</strong> de serviettes initiée pour Mercredi.</p>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default PredictiveMaintenance;
