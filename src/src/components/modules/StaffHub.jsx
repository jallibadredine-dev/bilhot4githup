import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Star, 
  TrendingUp, 
  Clock, 
  FileText, 
  Shield, 
  MessageSquare, 
  Award,
  ChevronLeft,
  X,
  Calendar,
  MoreVertical,
  Activity,
  Heart,
  Check,
  Mail,
  Smartphone,
  Eye,
  Trash2,
  Lock,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './StaffHub.css';

const initialStaff = [
  {
    id: 'STF-001', name: 'Maria Gomez', role: 'Head of Housekeeping', dept: 'Housekeeping', status: 'online', 
    nps: 4.8, productivity: '92%', upselling: '€0', punctuality: 98,
    badges: ['Employé du mois', 'Expert Clean'],
    notes: [
      { date: '12 Oct 2026', author: 'Admin', text: 'Excellente gestion des plannings VIP.' }
    ]
  },
  {
    id: 'STF-002', name: 'David Lee', role: 'Réceptionniste', dept: 'Front Desk', status: 'offline', 
    nps: 4.5, productivity: '85%', upselling: '€4,250', punctuality: 95,
    badges: ['Champion Ventes'],
    notes: [
      { date: '05 Oct 2026', author: 'Manager', text: 'A vendu 3 upgrades en Suite ce mois-ci.' }
    ]
  },
  {
    id: 'STF-003', name: 'Sarah Martin', role: 'Chef de Rang', dept: 'F&B', status: 'online', 
    nps: 4.9, productivity: '88%', upselling: '€1,800', punctuality: 100,
    badges: ['Smile Ambassador'],
    notes: [
      { date: '18 Sep 2026', author: 'F&B Dir', text: 'Superbe attitude avec les clients du petit-déjeuner.' }
    ]
  },
  {
    id: 'STF-004', name: 'Lisa Petit', role: 'Spa Therapist', dept: 'Spa & Wellness', status: 'online', 
    nps: 4.7, productivity: '78%', upselling: '€950', punctuality: 90,
    badges: ['Relaxation Master'],
    notes: []
  },
  {
    id: 'STF-005', name: 'Pierre Dubois', role: 'Concierge Clefs d\'Or', dept: 'Conciergerie', status: 'offline', 
    nps: 5.0, productivity: '100%', upselling: '€8,500', punctuality: 100,
    badges: ['Elite Service', 'Local Expert'],
    notes: [
      { date: '01 Oct 2026', author: 'GM', text: 'Obtention de places impossibles pour L\'Opéra.' }
    ]
  }
];

const StaffHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffList, setStaffList] = useState(initialStaff);

  // Invitation Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [isSendingAuth, setIsSendingAuth] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '', email: '', whatsapp: '', autoPassword: true,
    role: 'Réceptionniste', dept: 'Front Desk',
    permissions: { viewPrices: true, deleteRes: false, clientChat: true, exportData: false }
  });

  const handleNextStep = () => {
    if (addStep < 3) setAddStep(addStep + 1);
  };
  const handlePrevStep = () => {
    if (addStep > 1) setAddStep(addStep - 1);
  };

  const handleConfirmInvite = () => {
    setIsSendingAuth(true);
    setTimeout(() => {
      const generatedStaff = {
        id: `STF-00${staffList.length + 1}`,
        name: newStaff.name || 'Nouveau Membre',
        role: newStaff.role,
        dept: newStaff.dept,
        status: 'offline',
        nps: 0.0, productivity: 'N/A', upselling: '€0', punctuality: 100,
        badges: ['New Hire'],
        notes: [{ date: new Date().toLocaleDateString('fr-FR'), author: 'System', text: 'Invitation envoyée (Email/WhatsApp). Mot de passe temporaire généré.' }]
      };
      setStaffList([generatedStaff, ...staffList]);
      setIsSendingAuth(false);
      setIsAddModalOpen(false);
      setAddStep(1);
      setNewStaff({
        name: '', email: '', whatsapp: '', autoPassword: true,
        role: 'Réceptionniste', dept: 'Front Desk',
        permissions: { viewPrices: true, deleteRes: false, clientChat: true, exportData: false }
      });
    }, 1500);
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="staff-hub-container animate-fade-in">
      {/* Header */}
      <header className="staff-header">
        <div className="title-group">
          <h1>Équipe & RH <span className="ai-badge">Staff Hub 360°</span></h1>
          <p>Gestion des performances, plannings et analyses d'upselling.</p>
        </div>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher un membre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-filter"><Filter size={16} /> Filtrer</button>
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Ajouter Collaborateur
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="staff-grid-wrapper">
        <div className="staff-grid">
          {filteredStaff.map((staff, i) => (
            <motion.div 
              key={staff.id}
              className="staff-card glass-panel"
              onClick={() => setSelectedStaff(staff)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="card-top">
                <div className="staff-avatar-lg">
                  {staff.name.split(' ').map(n=>n[0]).join('')}
                  <span className={`status-dot ${staff.status}`}></span>
                </div>
                <button className="btn-icon"><MoreVertical size={16}/></button>
              </div>
              <div className="card-body">
                <h3>{staff.name}</h3>
                <span className="staff-role">{staff.role}</span>
                <span className="staff-dept">{staff.dept}</span>
              </div>
              
              <div className="card-kpis">
                <div className="kpi-micro">
                  <Star size={14} className="text-gold" />
                  <span>{staff.nps} NPS</span>
                </div>
                <div className="kpi-micro">
                  <Activity size={14} className="text-blue" />
                  <span>{staff.productivity}</span>
                </div>
                {staff.upselling !== '€0' && (
                  <div className="kpi-micro">
                    <TrendingUp size={14} className="text-green" />
                    <span>{staff.upselling}</span>
                  </div>
                )}
              </div>
              
              <div className="card-badges">
                {staff.badges.map((b, idx) => (
                  <span key={idx} className="badge-micro"><Award size={10}/> {b}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Employee Detail Dashboard Overlay */}
      <AnimatePresence>
        {selectedStaff && (
          <motion.div 
            className="staff-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStaff(null)}
          >
            <motion.div 
              className="staff-detail-modal"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="detail-header">
                <button className="btn-back" onClick={() => setSelectedStaff(null)}>
                  <ChevronLeft size={20} /> Retour
                </button>
                <div className="detail-actions">
                  <button className="btn-secondary"><Calendar size={16}/> Planning</button>
                  <button className="btn-primary"><MessageSquare size={16}/> Message</button>
                </div>
              </div>

              <div className="detail-profile-section">
                <div className="profile-hero">
                  <div className="staff-avatar-xl">
                    {selectedStaff.name.split(' ').map(n=>n[0]).join('')}
                    <span className={`status-dot-xl ${selectedStaff.status}`}></span>
                  </div>
                  <div className="profile-info">
                    <h2>{selectedStaff.name}</h2>
                    <p className="profile-role">{selectedStaff.role} • <strong>{selectedStaff.dept}</strong></p>
                    <p className="profile-id">ID: {selectedStaff.id} | Contrat: CDI Temps Plein</p>
                  </div>
                </div>

                <div className="gamification-row">
                  {selectedStaff.badges.map((b, idx) => (
                    <div key={idx} className="gamification-badge">
                      <Award size={16} /> {b}
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-kpi-grid">
                <div className="kpi-box glass-panel">
                  <div className="kpi-icon-wrap bg-gold"><Star size={20} /></div>
                  <div className="kpi-data">
                    <span className="kpi-value">{selectedStaff.nps}/5.0</span>
                    <span className="kpi-label">CSAT / NPS</span>
                  </div>
                </div>
                <div className="kpi-box glass-panel">
                  <div className="kpi-icon-wrap bg-blue"><Activity size={20} /></div>
                  <div className="kpi-data">
                    <span className="kpi-value">{selectedStaff.productivity}</span>
                    <span className="kpi-label">Productivité</span>
                  </div>
                </div>
                <div className="kpi-box glass-panel">
                  <div className="kpi-icon-wrap bg-green"><TrendingUp size={20} /></div>
                  <div className="kpi-data">
                    <span className="kpi-value">{selectedStaff.upselling}</span>
                    <span className="kpi-label">Revenu Upselling</span>
                  </div>
                </div>
                <div className="kpi-box glass-panel">
                  <div className="kpi-icon-wrap bg-purple"><Clock size={20} /></div>
                  <div className="kpi-data">
                    <span className="kpi-value">{selectedStaff.punctuality}%</span>
                    <span className="kpi-label">Ponctualité</span>
                  </div>
                </div>
              </div>

              <div className="detail-bottom-grid">
                <div className="notes-section glass-panel">
                  <div className="section-head">
                    <h3><FileText size={18} /> Feedback & Notes Managériales</h3>
                    <button className="btn-add-micro"><Plus size={14}/></button>
                  </div>
                  <div className="notes-list">
                    {selectedStaff.notes.length > 0 ? selectedStaff.notes.map((note, i) => (
                      <div key={i} className="note-item">
                        <div className="note-meta">
                          <strong>{note.author}</strong> • <span>{note.date}</span>
                        </div>
                        <p>{note.text}</p>
                      </div>
                    )) : (
                      <p className="empty-state">Aucune note enregistrée pour le moment.</p>
                    )}
                  </div>
                </div>

                <div className="hr-tools-section glass-panel">
                  <div className="section-head">
                    <h3><Shield size={18} /> Outils RH & Actions</h3>
                  </div>
                  <div className="tools-list">
                     <button className="hr-tool-btn">
                       <FileText size={16} /> Documents Numérisés (CIN/Contrat)
                     </button>
                     <button className="hr-tool-btn">
                       <Shield size={16} /> Éditer Permissions PMS
                     </button>
                     <button className="hr-tool-btn highlight">
                       <Receipt size={16} /> Générer Fiche de Paie (Mois Actuel)
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Collaborator 3-Step Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="add-staff-overlay">
            <motion.div 
              className="add-staff-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="add-modal-header">
                <h2>Nouveau Collaborateur</h2>
                <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}><X size={20}/></button>
              </div>

              <div className="step-indicator">
                <div className={`step ${addStep >= 1 ? 'active' : ''}`}>1. Identité</div>
                <div className={`step-line ${addStep >= 2 ? 'active' : ''}`}></div>
                <div className={`step ${addStep >= 2 ? 'active' : ''}`}>2. Rôle</div>
                <div className={`step-line ${addStep >= 3 ? 'active' : ''}`}></div>
                <div className={`step ${addStep >= 3 ? 'active' : ''}`}>3. Permissions</div>
              </div>

              <div className="add-modal-body">
                {addStep === 1 && (
                  <motion.div className="step-content" initial={{x: 20, opacity: 0}} animate={{x: 0, opacity: 1}}>
                    <div className="form-group row">
                      <div className="form-sub-group">
                        <label>Nom complet *</label>
                        <input type="text" placeholder="Ex: Jean Dupont" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="form-sub-group">
                        <label>Email de connexion *</label>
                        <input type="email" placeholder="jean@hotel.com" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                      </div>
                      <div className="form-sub-group">
                        <label>WhatsApp (Notifications)</label>
                        <input type="tel" placeholder="+33 6 00 00 00 00" value={newStaff.whatsapp} onChange={e => setNewStaff({...newStaff, whatsapp: e.target.value})} />
                      </div>
                    </div>
                    <div className="password-gen-box">
                      <div className="gen-text">
                        <strong>Génération de Sécurité Automatique</strong>
                        <p>Le système générera un mot de passe temporaire fort et l'enverra via email et WhatsApp.</p>
                      </div>
                      <div className={`toggle-switch ${newStaff.autoPassword ? 'active' : ''}`} onClick={() => setNewStaff({...newStaff, autoPassword: !newStaff.autoPassword})}>
                        <div className="toggle-knob"></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {addStep === 2 && (
                  <motion.div className="step-content" initial={{x: 20, opacity: 0}} animate={{x: 0, opacity: 1}}>
                    <div className="role-selector">
                      <label className={`role-card ${newStaff.role === 'Manager' ? 'selected' : ''}`}>
                        <input type="radio" name="role" checked={newStaff.role === 'Manager'} onChange={() => setNewStaff({...newStaff, role: 'Manager', dept: 'Direction'})} />
                        <div className="role-icon"><Shield size={20}/></div>
                        <div className="role-desc">
                          <strong>Manager (Admin)</strong>
                          <span>Accès complet aux statistiques, rapports financiers et RH.</span>
                        </div>
                      </label>
                      <label className={`role-card ${newStaff.role === 'Réceptionniste' ? 'selected' : ''}`}>
                        <input type="radio" name="role" checked={newStaff.role === 'Réceptionniste'} onChange={() => setNewStaff({...newStaff, role: 'Réceptionniste', dept: 'Front Desk'})} />
                        <div className="role-icon"><Calendar size={20}/></div>
                        <div className="role-desc">
                          <strong>Réceptionniste</strong>
                          <span>Gestion du planning, Check-in/out, facturation et CRM client.</span>
                        </div>
                      </label>
                      <label className={`role-card ${newStaff.role === 'Staff Service' ? 'selected' : ''}`}>
                        <input type="radio" name="role" checked={newStaff.role === 'Staff Service'} onChange={() => setNewStaff({...newStaff, role: 'Staff Service', dept: 'F&B / Spa'})} />
                        <div className="role-icon"><Star size={20}/></div>
                        <div className="role-desc">
                          <strong>Staff Service (F&B/Spa)</strong>
                          <span>Accès limité au Hub de Services pour gérer les commandes.</span>
                        </div>
                      </label>
                      <label className={`role-card ${newStaff.role === 'Housekeeping' ? 'selected' : ''}`}>
                        <input type="radio" name="role" checked={newStaff.role === 'Housekeeping'} onChange={() => setNewStaff({...newStaff, role: 'Housekeeping', dept: 'Housekeeping'})} />
                        <div className="role-icon"><Check size={20}/></div>
                        <div className="role-desc">
                          <strong>Housekeeping</strong>
                          <span>Uniquement la liste des tâches ménagères et statuts de chambre.</span>
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}

                {addStep === 3 && (
                  <motion.div className="step-content" initial={{x: 20, opacity: 0}} animate={{x: 0, opacity: 1}}>
                    <p className="step-desc">Ajustez finement les permissions spécifiques pour ce membre (Rôle: {newStaff.role}).</p>
                    <div className="permissions-list">
                      <div className="perm-row">
                        <div className="perm-info">
                          <Eye size={16}/>
                          <div>
                            <strong>Visibilité des Prix & Revenus</strong>
                            <span>Autorise la lecture des tarifs des chambres et du chiffre global.</span>
                          </div>
                        </div>
                        <div className={`toggle-switch ${newStaff.permissions.viewPrices ? 'active' : ''}`} onClick={() => setNewStaff({...newStaff, permissions: {...newStaff.permissions, viewPrices: !newStaff.permissions.viewPrices}})}>
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                      
                      <div className="perm-row">
                        <div className="perm-info">
                          <MessageSquare size={16}/>
                          <div>
                            <strong>Accès au Chat Multicanal (Clients)</strong>
                            <span>Peut répondre aux messages Airbnb, Booking, WhatsApp.</span>
                          </div>
                        </div>
                        <div className={`toggle-switch ${newStaff.permissions.clientChat ? 'active' : ''}`} onClick={() => setNewStaff({...newStaff, permissions: {...newStaff.permissions, clientChat: !newStaff.permissions.clientChat}})}>
                          <div className="toggle-knob"></div>
                        </div>
                      </div>

                      <div className="perm-row danger">
                        <div className="perm-info">
                          <Trash2 size={16}/>
                          <div>
                            <strong>Suppression de Réservations</strong>
                            <span>Autorise l'annulation/suppression définitive d'un dossier.</span>
                          </div>
                        </div>
                        <div className={`toggle-switch ${newStaff.permissions.deleteRes ? 'active' : ''}`} onClick={() => setNewStaff({...newStaff, permissions: {...newStaff.permissions, deleteRes: !newStaff.permissions.deleteRes}})}>
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                      
                      <div className="perm-row warning">
                        <div className="perm-info">
                          <Globe size={16}/>
                          <div>
                            <strong>Exportation de Base de Données (Excel)</strong>
                            <span>Autorise le téléchargement massif des contacts clients.</span>
                          </div>
                        </div>
                        <div className={`toggle-switch ${newStaff.permissions.exportData ? 'active' : ''}`} onClick={() => setNewStaff({...newStaff, permissions: {...newStaff.permissions, exportData: !newStaff.permissions.exportData}})}>
                          <div className="toggle-knob"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="add-modal-footer">
                {addStep > 1 ? (
                  <button className="btn-secondary" onClick={handlePrevStep}>Précédent</button>
                ) : <div></div>}
                
                {addStep < 3 ? (
                  <button className="btn-primary" onClick={handleNextStep}>Étape Suivante</button>
                ) : (
                  <button className="btn-invite" onClick={handleConfirmInvite} disabled={isSendingAuth}>
                    {isSendingAuth ? 'Génération et Envoi...' : <><Mail size={16}/> Confirmer & Envoyer Invitations</>}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StaffHub;
