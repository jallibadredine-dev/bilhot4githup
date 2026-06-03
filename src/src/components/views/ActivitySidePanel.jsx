import React from 'react';
import { ChevronLeft, ChevronRight, Edit2, MessageSquare, Check, Plus } from 'lucide-react';
import './ActivitySidePanel.css';

const ActivitySidePanel = () => {
  return (
    <div className="activity-container hide-scrollbar">
      {/* Interface removed as requested */}
      <div className="empty-panel-hint" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>
         <p>Espace réservé pour les notifications et flux d'activités.</p>
      </div>
    </div>
  );
};


export default ActivitySidePanel;
