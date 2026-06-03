import React, { useState } from 'react';
import { 
  TrendingUp, 
  CloudSun, 
  Calendar, 
  UsersRound, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Zap, 
  ShieldCheck,
  Globe,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import './RevenueAI.css';

const RevenueAI = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const priceImpacts = [
    { label: 'Exposition Automobile', impact: '+€45.00', type: 'Event', color: 'blue' },
    { label: 'Météo (Soleil)', impact: '+€12.00', type: 'Weather', color: 'orange' },
    { label: 'Concurrence (Occupé)', impact: '+€18.00', type: 'Market', color: 'purple' },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="revenue-ai-container animate-fade-in">
      <header className="revenue-header">
        <div className="title-group">
          <h1>Revenue Management <span className="ai-badge">AI-Driven</span></h1>
          <p>Optimisation dynamique des tarifs & Yield Management</p>
        </div>
        <div className="header-actions">
           <button className={`btn-sync ${isSyncing ? 'syncing' : ''}`} onClick={handleSync}>
             <RefreshCw size={16} /> 
             {isSyncing ? 'Synchronisation GDS...' : 'Sync Tous les Canaux'}
           </button>
        </div>
      </header>

      {/* Main Stats Summary */}
      <div className="revenue-summary-grid">
         <div className="summary-card glass-panel">
            <span className="label">RevPAR Actuel</span>
            <span className="value">€142.50</span>
            <span className="trend positive"><ArrowUpRight size={14} /> +8.4%</span>
         </div>
         <div className="summary-card glass-panel">
            <span className="label">Forecast Occupancy</span>
            <span className="value">92%</span>
            <span className="trend positive"><ArrowUpRight size={14} /> +12%</span>
         </div>
         <div className="summary-card glass-panel">
            <span className="label">Profit Net (Est.)</span>
            <span className="value">€42,800</span>
            <span className="trend positive"><ArrowUpRight size={14} /> +5.2%</span>
         </div>
      </div>

      <div className="revenue-main-grid">
        {/* Left: Dynamic Pricing Chart Simulation */}
        <section className="chart-section glass-panel">
          <div className="section-header">
            <h3>Forecast de Demande & Tarification</h3>
            <div className="chart-legend">
               <span><i className="dot price"></i> Tarif IA</span>
               <span><i className="dot occupancy"></i> Occupation</span>
            </div>
          </div>
          
          <div className="chart-visual">
             {/* Simple SVG Chart Representation */}
             <svg viewBox="0 0 800 200" className="revenue-svg">
                <path d="M0,150 Q100,50 200,120 T400,80 T600,140 T800,60" fill="none" stroke="var(--accent-blue)" strokeWidth="3" className="path-animate" />
                <path d="M0,160 Q100,140 200,150 T400,120 T600,100 T800,110" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="2" strokeDasharray="4 4" />
                
                {/* Data Points */}
                <circle cx="200" cy="120" r="5" fill="var(--accent-blue)" />
                <circle cx="400" cy="80" r="5" fill="var(--accent-blue)" />
                <circle cx="800" cy="60" r="5" fill="var(--accent-blue)" />
             </svg>
             <div className="chart-labels">
                <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
             </div>
          </div>

          <div className="ai-insight-box">
             <Sparkles size={20} color="var(--accent-blue)" />
             <div className="insight-content">
                <h4>Optimisation Suggérée</h4>
                <p>Augmentez le tarif de <strong>€15.00</strong> pour le Samedi soir. Un concert local non répertorié booste la demande de 25%.</p>
                <button className="btn-apply-suggestion">Appliquer l'ajustement</button>
             </div>
          </div>
        </section>

        {/* Right: Market Factors */}
        <section className="factors-section">
          <div className="factors-card glass-panel">
             <h3>Facteurs d'Influence (Live)</h3>
             <div className="factors-list">
                {priceImpacts.map((factor, i) => (
                  <div key={i} className="factor-item">
                     <div className={`factor-icon ${factor.color}`}>
                        {factor.type === 'Event' && <Calendar size={16} />}
                        {factor.type === 'Weather' && <CloudSun size={16} />}
                        {factor.type === 'Market' && <TrendingUp size={16} />}
                     </div>
                     <div className="factor-info">
                        <strong>{factor.label}</strong>
                        <span>{factor.type} Impact</span>
                     </div>
                     <span className="factor-impact positive">{factor.impact}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="ota-distribution glass-panel">
             <h3>Distribution par OTA</h3>
             <div className="ota-bar"><label>Booking.com</label><div className="bar-wrap"><div className="fill" style={{ width: '65%' }}></div></div><span>65%</span></div>
             <div className="ota-bar"><label>Expedia</label><div className="bar-wrap"><div className="fill" style={{ width: '20%' }}></div></div><span>20%</span></div>
             <div className="ota-bar"><label>Ventes Directes</label><div className="bar-wrap"><div className="fill" style={{ width: '15%', background: 'var(--status-green)' }}></div></div><span>15%</span></div>
             <p className="ota-tip"><Info size={12} /> L'IA suggère de pousser les offres directes pour économiser <strong>€1,200</strong> de commissions ce mois.</p>
          </div>
        </section>
      </div>

      <footer className="revenue-footer">
         <div className="trust-badge">
            <ShieldCheck size={16} />
            AI-Native Security & Compliance (GDPR)
         </div>
         <div className="global-reach">
            <Globe size={16} />
            Connecté à 250+ plateformes OTA
         </div>
      </footer>
    </div>
  );
};

export default RevenueAI;
