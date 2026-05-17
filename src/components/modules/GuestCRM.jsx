import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Sparkles, 
  Star, 
  TrendingUp, 
  User, 
  Mail, 
  Smile, 
  Frown, 
  Meh,
  Send,
  History,
  Tag,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  DollarSign,
  Info,
  ChevronRight,
  ShieldCheck,
  Zap,
  Phone,
  MessageCircle,
  ClipboardList,
  Wallet,
  Settings,
  Share2,
  Trash2,
  Lock,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './GuestCRM.css';

const GuestCRM = () => {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('insights');
  const [showActionMenu, setShowActionMenu] = useState(false);

  const guests = useMemo(() => [
    { 
      id: 1, 
      name: 'Alice Mertens', 
      sentiment: 'Positive', 
      score: 92, 
      status: 'Loyal', 
      lastStay: '2 days ago', 
      avatar: 'AM',
      email: 'alice.m@example.com',
      totalSpent: '4,250€',
      visits: 8,
      tags: ['VIP', 'Spa Lover', 'Business'],
      tier: 'Gold',
      probability: '98%',
      phone: '+33 6 12 34 56 78',
      wallet: '150.00€',
      loyaltyPoints: 1250
    },
    { 
      id: 2, 
      name: 'Mark Thompson', 
      sentiment: 'Neutral', 
      score: 55, 
      status: 'New', 
      lastStay: 'Last month', 
      avatar: 'MT',
      email: 'm.thompson@web.de',
      totalSpent: '850€',
      visits: 1,
      tags: ['Family', 'First Timer'],
      tier: 'Bronze',
      probability: '45%',
      phone: '+49 176 9876 5432',
      wallet: '0.00€',
      loyaltyPoints: 50
    },
    { 
      id: 3, 
      name: 'Elena Rodriguez', 
      sentiment: 'Negative', 
      score: 28, 
      status: 'At Risk', 
      lastStay: 'Today', 
      avatar: 'ER',
      email: 'elena.rod@icloud.com',
      totalSpent: '1,120€',
      visits: 3,
      tags: ['Frequent Flyer', 'Late Check-out'],
      tier: 'Silver',
      probability: '12%',
      phone: '+34 600 112 233',
      wallet: '45.50€',
      loyaltyPoints: 320
    },
    { 
      id: 4, 
      name: 'Jean-Pierre Dubois', 
      sentiment: 'Positive', 
      score: 85, 
      status: 'Loyal', 
      lastStay: '1 week ago', 
      avatar: 'JD',
      email: 'jp.dubois@corporation.fr',
      totalSpent: '12,800€',
      visits: 15,
      tags: ['Corporate', 'High LTV'],
      tier: 'Platinum',
      probability: '95%',
      phone: '+33 7 44 55 66 77',
      wallet: '1,200.00€',
      loyaltyPoints: 8500
    },
  ], []);

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateDraft = () => {
    setIsDrafting(true);
    setDraft('');
    setTimeout(() => {
      setDraft(`Dear ${selectedGuest.name}, we've noticed your preference for our Spa services during your last ${selectedGuest.visits} visits. As a ${selectedGuest.tier} member, we'd like to offer you an exclusive 20% discount on the new Rejuvenation Package. We look forward to welcoming you back!`);
      setIsDrafting(false);
    }, 1500);
  };

  const handleGuestSelect = (guest) => {
    setSelectedGuest(guest);
    setActiveTab('insights');
    setDraft('');
  };

  return (
    <div className="crm-container-premium">
      
      {/* ─── CRM HEADER ─── */}
      <header className="crm-premium-header">
        <div className="header-left">
          <div className="icon-box">
             <Users size={24} className="header-icon" />
          </div>
          <div className="title-stack">
            <h1>Intelligence Client & CRM</h1>
            <p>Analyse prédictive et hyper-personnalisation de l'expérience client.</p>
          </div>
        </div>
        <div className="header-right">
          <div className="crm-stats-mini">
            <div className="mini-stat">
              <span className="label">Satisfaction Globale</span>
              <span className="value text-green">8.4/10</span>
            </div>
            <div className="divider-v" />
            <div className="mini-stat">
              <span className="label">Taux de Rétention</span>
              <span className="value text-blue">62%</span>
            </div>
          </div>
          <button className="btn-premium primary"><Mail size={16} /> Campagne Smart-Targeting</button>
        </div>
      </header>

      <div className="crm-main-layout">
        
        {/* ─── LEFT: GUEST DIRECTORY ─── */}
        <aside className="guest-directory">
          <div className="directory-controls">
            <div className="search-bar">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Rechercher un client..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-icon-filter"><Filter size={16} /></button>
          </div>

          <div className="directory-list scrollbar-hidden">
            {filteredGuests.map(guest => (
              <div 
                key={guest.id} 
                className={`guest-item-card ${selectedGuest?.id === guest.id ? 'selected' : ''}`}
                onClick={() => handleGuestSelect(guest)}
              >
                <div className="card-top">
                  <div className={`guest-avatar tier-${guest.tier.toLowerCase()}`}>{guest.avatar}</div>
                  <div className="guest-meta">
                    <span className="guest-name">{guest.name}</span>
                    <span className="guest-email">{guest.email}</span>
                  </div>
                  <div className="sentiment-chip">
                    {guest.sentiment === 'Positive' && <Smile size={14} className="text-green" />}
                    {guest.sentiment === 'Neutral' && <Meh size={14} className="text-amber" />}
                    {guest.sentiment === 'Negative' && <Frown size={14} className="text-red" />}
                  </div>
                </div>
                <div className="card-bottom">
                  <span className="stay-info"><Calendar size={12} /> {guest.lastStay}</span>
                  <span className="spent-info"><DollarSign size={12} /> {guest.totalSpent}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ─── RIGHT: GUEST INTELLIGENCE ─── */}
        <main className="guest-intelligence-pane">
          {selectedGuest ? (
            <div className="intelligence-content scrollbar-hidden">
              
              {/* Profile Overview Card */}
              <section className="profile-overview-card glass-premium">
                <div className="profile-header">
                  <div className="header-main">
                    <div className="avatar-large">{selectedGuest.avatar}</div>
                    <div className="name-stack">
                      <div className="name-with-actions">
                        <h2>{selectedGuest.name}</h2>
                        <div className="action-menu-wrapper">
                          <button className="btn-icon-more" onClick={() => setShowActionMenu(!showActionMenu)}>
                            <MoreVertical size={20} />
                          </button>
                          <AnimatePresence>
                            {showActionMenu && (
                              <motion.div 
                                className="action-dropdown"
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              >
                                <button className="dropdown-item"><User size={14} /> Modifier Profil</button>
                                <button className="dropdown-item"><Share2 size={14} /> Partager Fiche</button>
                                <button className="dropdown-item"><Settings size={14} /> Paramètres Avancés</button>
                                <div className="dropdown-divider" />
                                <button className="dropdown-item text-red"><Lock size={14} /> Bloquer Client</button>
                                <button className="dropdown-item text-red"><Trash2 size={14} /> Supprimer</button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="badge-row">
                        <span className={`badge-tier ${selectedGuest.tier.toLowerCase()}`}>
                          <ShieldCheck size={12} /> {selectedGuest.tier} Member
                        </span>
                        <span className="badge-status">{selectedGuest.status}</span>
                        <span className="badge-id">ID: #G-{selectedGuest.id}092</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="quick-actions-bar">
                    <button className="btn-quick-action" title="Appeler"><Phone size={18} /></button>
                    <button className="btn-quick-action" title="Email"><Mail size={18} /></button>
                    <button className="btn-quick-action" title="WhatsApp"><MessageCircle size={18} /></button>
                    <button className="btn-quick-action" title="Ajouter Tâche"><ClipboardList size={18} /></button>
                  </div>
                </div>

                <div className="guest-highlights">
                   <div className="highlight-item">
                      <Wallet size={16} className="text-blue" />
                      <div className="h-text">
                         <span className="h-label">Portefeuille</span>
                         <span className="h-value">{selectedGuest.wallet}</span>
                      </div>
                   </div>
                   <div className="highlight-item">
                      <Star size={16} className="text-amber" />
                      <div className="h-text">
                         <span className="h-label">Points Fidélité</span>
                         <span className="h-value">{selectedGuest.loyaltyPoints} pts</span>
                      </div>
                   </div>
                   <div className="highlight-item">
                      <History size={16} className="text-slate" />
                      <div className="h-text">
                         <span className="h-label">Dernier Séjour</span>
                         <span className="h-value">{selectedGuest.lastStay}</span>
                      </div>
                   </div>
                </div>

                <div className="tags-container">
                  {selectedGuest.tags.map(tag => (
                    <span key={tag} className="guest-tag"><Tag size={12} /> {tag}</span>
                  ))}
                  <button className="btn-add-tag"><Plus size={12} /></button>
                </div>
              </section>

              {/* Tabbed Navigation */}
              <nav className="intelligence-tabs">
                <button className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>
                   <Sparkles size={16} /> Aperçu AI
                </button>
                <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                   <History size={16} /> Historique & Finances
                </button>
                <button className={`tab-btn ${activeTab === 'comms' ? 'active' : ''}`} onClick={() => setActiveTab('comms')}>
                   <MessageSquare size={16} /> Communications
                </button>
              </nav>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'insights' && (
                  <motion.div 
                    key="insights"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="tab-content"
                  >
                    <div className="intelligence-grid">
                      <section className="insight-section ai-predictions glass-premium">
                        <div className="section-title">
                          <Sparkles size={18} className="text-blue" />
                          <h3>Prédictions Oracle AI</h3>
                        </div>
                        <div className="prediction-grid">
                          <div className="pred-card">
                            <div className="p-header">
                               <span className="p-label">Probabilité de Retour</span>
                               <span className="p-value">{selectedGuest.probability}</span>
                            </div>
                            <div className="progress-bar-container">
                               <div className="progress-fill" style={{ width: selectedGuest.probability }}></div>
                            </div>
                          </div>
                          <div className="pred-card">
                            <span className="p-label">Risque de Churn</span>
                            <div className="churn-indicator">
                               <div className={`indicator-dot ${selectedGuest.sentiment === 'Negative' ? 'bg-red' : 'bg-green'}`}></div>
                               <span className={`p-value ${selectedGuest.sentiment === 'Negative' ? 'text-red' : 'text-green'}`}>
                                 {selectedGuest.sentiment === 'Negative' ? 'Élevé (Attention)' : 'Faible (Fidèle)'}
                               </span>
                            </div>
                          </div>
                        </div>
                        <div className="behavioral-note">
                          <Zap size={14} className="text-amber" />
                          <p><strong>Recommandation Oracle :</strong> {selectedGuest.sentiment === 'Negative' ? "Envoyer un coupon de compensation immédiatement. Le client a mentionné une frustration liée au room-service." : "Inviter à rejoindre le cercle 'Ambassadeurs' et proposer un sur-classement Suite Junior."}</p>
                        </div>
                      </section>

                      <section className="insight-section smart-actions glass-premium">
                         <div className="section-title">
                            <TrendingUp size={18} className="text-green" />
                            <h3>Actions de Croissance (Upsell)</h3>
                         </div>
                         <div className="growth-list">
                            <div className="growth-item">
                               <div className="g-info">
                                  <strong>Spa & Bien-être</strong>
                                  <p>Fréquence élevée. Proposer l'abonnement annuel.</p>
                               </div>
                               <button className="btn-action-sm">Activer</button>
                            </div>
                            <div className="growth-item">
                               <div className="g-info">
                                  <strong>Early Check-in</strong>
                                  <p>Arrive souvent le matin. Option automatisée.</p>
                               </div>
                               <button className="btn-action-sm">Activer</button>
                            </div>
                         </div>
                      </section>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'comms' && (
                  <motion.div 
                    key="comms"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="tab-content"
                  >
                    <section className="insight-section communication-center glass-premium">
                      <div className="section-title">
                        <MessageSquare size={18} className="text-blue" />
                        <h3>Oracle Smart-Reply</h3>
                        <button className="btn-generate-ai" onClick={generateDraft} disabled={isDrafting}>
                          {isDrafting ? 'Analyse...' : <><Zap size={14} /> Générer Draft IA</>}
                        </button>
                      </div>
                      
                      <div className="reply-composer">
                        {isDrafting ? (
                          <div className="draft-loader">
                            <Sparkles className="spinning" />
                            <span>Oracle analyse les préférences et l'historique...</span>
                          </div>
                        ) : draft ? (
                          <div className="draft-view">
                            <textarea value={draft} onChange={e => setDraft(e.target.value)} />
                            <div className="draft-actions">
                              <button className="btn-action-outline">Enregistrer Brouillon</button>
                              <button className="btn-action-primary"><Send size={14} /> Envoyer Message</button>
                            </div>
                          </div>
                        ) : (
                          <div className="empty-draft-hint">
                            <MessageCircle size={32} className="icon-faint" />
                            <p>Utilisez l'IA pour rédiger une proposition personnalisée basée sur les données comportementales de {selectedGuest.name}.</p>
                          </div>
                        )}
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === 'history' && (
                  <motion.div 
                    key="history"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="tab-content"
                  >
                    <section className="interaction-history glass-premium">
                       <div className="section-title">
                          <History size={18} className="text-slate" />
                          <h3>Historique & Finances</h3>
                       </div>
                       <div className="history-grid">
                          <div className="mini-card-stats">
                             <div className="m-stat">
                                <span>Total Facturé</span>
                                <strong>{selectedGuest.totalSpent}</strong>
                             </div>
                             <div className="m-stat">
                                <span>Nb. Réservations</span>
                                <strong>{selectedGuest.visits}</strong>
                             </div>
                          </div>
                          <div className="timeline-v">
                            <div className="timeline-item">
                               <div className="t-dot active"></div>
                               <div className="t-content">
                                  <span className="t-date">Aujourd'hui</span>
                                  <p><strong>Avis Positif détecté</strong> sur Google Maps. Sentiment Score: 98%.</p>
                               </div>
                            </div>
                            <div className="timeline-item">
                               <div className="t-dot"></div>
                               <div className="t-content">
                                  <span className="t-date">15 Mars 2026</span>
                                  <p>Check-out (Chambre 204). Paiement Stripe validé.</p>
                               </div>
                            </div>
                            <div className="timeline-item">
                               <div className="t-dot"></div>
                               <div className="t-content">
                                  <span className="t-date">10 Mars 2026</span>
                                  <p>Check-in automatisé via Mobile App.</p>
                               </div>
                            </div>
                          </div>
                       </div>
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ) : (
            <div className="crm-empty-state glass-premium">
              <div className="empty-artwork">
                 <Users size={64} className="icon-faint" />
              </div>
              <h3>Gestion de l'Intelligence Client</h3>
              <p>Sélectionnez un profil pour activer l'analyse Oracle et les outils d'engagement automatisé.</p>
              <button className="btn-premium primary" style={{ marginTop: '20px' }}>Importer une base de données</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Internal components
const Users = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

export default GuestCRM;
