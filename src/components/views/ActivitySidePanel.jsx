import React from 'react';
import { ChevronLeft, ChevronRight, Edit2, MessageSquare, Check, Plus } from 'lucide-react';
import './ActivitySidePanel.css';

const ActivitySidePanel = () => {
  return (
    <div className="activity-container hide-scrollbar">
      
      {/* Recent Activities Section */}
      <div className="section-header-side">
        <h3>Activités Récentes</h3>
        <button className="btn-icon-small"><MoreVerticalIcon /></button>
      </div>

      <h4 className="month-title">Octobre 2025</h4>

      {/* Mini Calendar Header */}
      <div className="mini-calendar">
        <div className="cal-nav">
          <button className="btn-nav-small"><ChevronLeft size={14}/></button>
          <button className="btn-nav-small"><ChevronRight size={14}/></button>
        </div>
        <div className="cal-days">
          <div className="cal-col"><span>Lun</span>17</div>
          <div className="cal-col"><span>Mar</span>18</div>
          <div className="cal-col active"><span>Mer</span>19<span>•</span></div>
          <div className="cal-col"><span>Jeu</span>20</div>
          <div className="cal-col"><span>Ven</span>21</div>
          <div className="cal-col"><span>Sam</span>22</div>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="activity-cards">
        
        {/* Reservation update */}
        <div className="white-card activity-card">
          <div className="act-header">
            <h4>Check-out réussi</h4>
            <button className="btn-edit"><Edit2 size={12}/></button>
          </div>
          <p className="act-desc">Ménage requis - Ch. 201</p>
          <span className="tag-summary">Automatique</span>
          
          <div className="act-footer">
            <div className="act-user">
              <div className="avatar micro"></div>
              <span>Système Oracle</span>
            </div>
            <div className="act-icons">
               <span className="emoji-hand">🧹</span>
               <MessageSquare size={14} color="var(--text-muted)" />
            </div>
          </div>
        </div>

        {/* Group Joined */}
        <div className="white-card activity-card">
          <div className="act-header">
             <h4>Famille Durant +3 (Arrivée) <span className="dot-yellow"></span></h4>
             <button className="btn-edit"><Edit2 size={12}/></button>
          </div>
          <div className="act-footer mt-md">
            <div className="avatar-group micro">
               <div className="avatar"></div>
               <div className="avatar bg-green">FD</div>
            </div>
            <span className="act-date">19 Oct</span>
            <button className="btn-add-circle"><Plus size={14} color="white" /></button>
          </div>
        </div>
      </div>

      {/* Checklist Section */}
      <div className="section-header-side mt-lg">
        <h3>To-do List <span className="text-muted">3</span></h3>
        <button className="btn-date-filter">
          <ChevronLeft size={12} /> 19 Oct <ChevronRight size={12} />
        </button>
      </div>

      <div className="checklist-items">
        <div className="white-card check-item active">
          <h4>Préparer Accueil VIP</h4>
          <div className="check-row">
            <span className="tag-green">Suite Royale</span>
            <div className="check-circle green"><Check size={12} color="white" /></div>
          </div>
        </div>

        <div className="white-card check-item">
          <h4>Vérification Minibar</h4>
          <ChevronRight size={16} color="var(--text-muted)"/>
        </div>
        
        <div className="white-card check-item">
          <h4>Rapport DGSN <span className="dot-cyan"></span></h4>
          <ChevronRight size={16} color="var(--text-muted)"/>
        </div>
      </div>

    </div>
  );
};

// Helper for the three dots icon since it was missed in the import
const MoreVerticalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

export default ActivitySidePanel;
