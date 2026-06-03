import React, { useState } from 'react';
import { 
  Users, 
  Scan, 
  CheckCircle2, 
  ShieldAlert, 
  UserPlus, 
  Search, 
  ChevronRight, 
  Smartphone, 
  CreditCard,
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SmartDesk.css';

const SmartDesk = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [arrivals, setArrivals] = useState([
    { id: 1, name: 'Jean Dupont', status: 'Arriving', rooms: '304', type: 'Elite', alert: false },
    { id: 2, name: 'Sarah Miller', status: 'Scanning...', rooms: 'Pending', type: 'Standard', alert: true },
    { id: 3, name: 'Robert Chen', status: 'Checked In', rooms: '102', type: 'VIP', alert: false },
  ]);

  const simulateScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult({
        name: 'Alice Mertens',
        document: 'Passport ID: BE992834',
        matchScore: '98%',
        preferredRoom: 'Room 502 (Quiet Zone)',
        fraudRisk: 'Low'
      });
    }, 3000);
  };

  return (
    <div className="smart-desk-container animate-fade-in">
      <header className="desk-header">
        <div className="title-section">
          <h1>Smart Desk <span className="ai-badge">AI-Powered</span></h1>
          <p>Réception intelligente & Check-in de masse</p>
        </div>
        <div className="header-actions">
           <div className="search-box">
             <Search size={16} />
             <input type="text" placeholder="Rechercher une réservation..." />
           </div>
           <button className="btn-primary"><UserPlus size={16} /> Nouveau Walk-in</button>
        </div>
      </header>

      <div className="desk-grid">
        {/* Left Column: Arrival Queue */}
        <section className="arrival-section glass-panel">
          <div className="section-header">
             <Users size={18} />
             <h3>File d'Arrivée (Live)</h3>
             <span className="badge-count">12 en attente</span>
          </div>
          
          <div className="arrival-list">
            {arrivals.map(guest => (
              <div key={guest.id} className={`guest-row ${guest.alert ? 'has-alert' : ''}`}>
                <div className="guest-info">
                   <div className="guest-avatar">{guest.name.split(' ').map(n => n[0]).join('')}</div>
                   <div>
                     <span className="name">{guest.name}</span>
                     <span className="guest-type">{guest.type} Member</span>
                   </div>
                </div>
                <div className="guest-status">
                   <span className={`status-pill ${guest.status.toLowerCase().includes('scanning') ? 'scanning' : guest.status.toLowerCase().replace(' ', '-')}`}>
                     {guest.status}
                   </span>
                   {guest.alert && <ShieldAlert size={14} className="alert-icon" />}
                </div>
                <button className="btn-action">Check-in <ChevronRight size={14} /></button>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: AI Scanner & Matching */}
        <section className="ai-ops-section">
          
          {/* AI Scan Module */}
          <div className="ai-card scan-card glass-panel">
            <div className="card-header">
               <Sparkles size={18} color="var(--accent-blue)" />
               <h3>AI Document Scanner</h3>
            </div>
            
            <div className="scan-area">
               <AnimatePresence mode="wait">
                 {isScanning ? (
                   <motion.div 
                     key="scanning"
                     className="scanning-box"
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   >
                     <div className="scan-line"></div>
                     <Scan size={48} className="scanning-icon" />
                     <p>Extraction des données biométriques...</p>
                   </motion.div>
                 ) : scanResult ? (
                   <motion.div 
                     key="result"
                     className="scan-result"
                     initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                   >
                     <div className="result-header">
                       <CheckCircle2 size={24} color="var(--status-green)" />
                       <h4>Client Identifié</h4>
                     </div>
                     <div className="data-grid">
                       <div className="data-item"><label>Nom</label> <span>{scanResult.name}</span></div>
                       <div className="data-item"><label>Match IA</label> <span className="text-success">{scanResult.matchScore}</span></div>
                       <div className="data-item"><label>Risque Fraude</label> <span className="text-low">{scanResult.fraudRisk}</span></div>
                     </div>
                     <div className="ai-suggestion">
                        <Info size={14} />
                        <p>Suggestion IA: <strong>{scanResult.preferredRoom}</strong> basée sur ses séjours à Lyon.</p>
                     </div>
                     <button className="btn-success-full" onClick={() => setScanResult(null)}>Attribuer & Confirmer</button>
                   </motion.div>
                 ) : (
                   <div className="scan-placeholder" onClick={simulateScan}>
                     <Scan size={48} />
                     <p>Placer le document ou scanner le QR code</p>
                     <button className="btn-outline-small">Simuler un Scan</button>
                   </div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Quick Stats / Feedback */}
          <div className="ai-stats-row">
            <div className="ai-stat-card glass-panel smaller">
               <Smartphone size={20} />
               <span>Check-ins Mobiles</span>
               <strong>85%</strong>
            </div>
            <div className="ai-stat-card glass-panel smaller">
               <CreditCard size={20} />
               <span>Prépaiement AI</span>
               <strong>Complet</strong>
            </div>
          </div>
        </section>
      </div>

      {/* Mass Check-in Footer Bar */}
      <footer className="mass-checkin-bar">
         <div className="bar-info">
           <strong>Flux de Groupe: Renault Paris</strong>
           <span>15 chambres prêtes pour distribution</span>
         </div>
         <button className="btn-auto-assign">
           <Sparkles size={16} /> Attribution Automatique IA
         </button>
      </footer>
    </div>
  );
};

export default SmartDesk;
