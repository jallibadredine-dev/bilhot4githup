import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, Key, Bell, CreditCard, ChevronRight, Zap, MoreHorizontal, FileText } from 'lucide-react';
import './GuestJourneyDiagram.css';

const GuestJourneyDiagram = () => {
  const nodes = [
    { id: 'guest', title: 'Profil Voyageur', desc: 'Alice Smith', icon: <User size={18} />, pos: 'pos-center', color: 'blue', status: 'Active' },
    { id: 'booking', title: 'Source Réservation', desc: 'Airbnb Plus', icon: <Mail size={18} />, pos: 'pos-top-left', color: 'cyan', status: 'Success' },
    { id: 'id-scan', title: 'Scan Pièce ID', desc: 'Passeport détecté', icon: <ShieldCheck size={18} />, pos: 'pos-top-mid', color: 'green', status: 'Success' },
    { id: 'ocr', title: 'Extraction OCR', desc: 'Données extraites', icon: <Zap size={18} />, pos: 'pos-top-right', color: 'green', status: 'Success' },
    { id: 'police', title: 'Fiche Police', desc: 'Générée avec succès', icon: <FileText size={18} />, pos: 'pos-bottom-right', color: 'blue', status: 'Success' },
    { id: 'keys', title: 'Clé Numérique', desc: 'Serrure #8821', icon: <Key size={18} />, pos: 'pos-bottom-left', color: 'blue', status: 'Active' },
  ];

  const paths = [
    { d: "M 320 220 Q 400 350 512 350", active: true }, // Booking to Guest
    { d: "M 512 200 Q 512 280 512 350", active: true }, // ID Scan to Guest
    { d: "M 700 220 Q 700 400 512 350", active: true }, // OCR to Guest
    { d: "M 512 350 Q 620 350 700 480", active: true }, // Guest to Police
    { d: "M 512 350 Q 400 350 320 480", active: true }, // Guest to Keys
  ];

  return (
    <div className="journey-diagram-container">
      <svg className="diagram-svg" viewBox="0 0 1024 700">
        {paths.map((p, i) => (
          <path key={i} d={p.d} className={`connection-path ${p.active ? 'active' : ''}`} />
        ))}
        <motion.circle 
          cx="0" cy="0" r="4" 
          className="pulse-circle"
          animate={{ offsetDistance: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ offsetPath: "path('M 320 220 Q 400 350 512 350')" }}
        />
      </svg>

      <div className="diagram-nodes">
        {nodes.map(node => (
          <motion.div 
            key={node.id} 
            className={`journey-node glass-card ${node.pos}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
          >
            <div className="node-header">
               <div className={`node-icon-box bg-${node.color}-light text-${node.color}`}>
                  {node.icon}
               </div>
               <MoreHorizontal size={14} color="var(--text-muted)" />
            </div>
            <div className="node-content">
               <h4>{node.title}</h4>
               <p>{node.desc}</p>
            </div>
            <div className="node-footer">
               <span className={`node-status-badge status-${node.status.toLowerCase()}`}>
                  {node.status}
               </span>
               <ChevronRight size={14} color="var(--text-muted)" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GuestJourneyDiagram;
