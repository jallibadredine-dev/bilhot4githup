import React, { useState } from 'react';
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
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './GuestCRM.css';

const GuestCRM = () => {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draft, setDraft] = useState('');

  const guests = [
    { id: 1, name: 'Alice Mertens', sentiment: 'Positive', score: 92, status: 'Loyal', lastStay: '2 days ago', avatar: 'AM' },
    { id: 2, name: 'Mark Thompson', sentiment: 'Neutral', score: 55, status: 'New', lastStay: 'Last month', avatar: 'MT' },
    { id: 3, name: 'Elena Rodriguez', sentiment: 'Negative', score: 28, status: 'At Risk', lastStay: 'Today', avatar: 'ER' },
  ];

  const generateDraft = () => {
    setIsDrafting(true);
    setDraft('');
    setTimeout(() => {
      setDraft("Dear Alice, we're thrilled you enjoyed the spa! As a token of our appreciation for your positive feedback, we've added a complimentary breakfast to your next stay. We can't wait to see you again soon!");
      setIsDrafting(false);
    }, 2000);
  };

  return (
    <div className="crm-container animate-fade-in">
      <header className="crm-header">
        <div className="title-group">
          <h1>Guest Experience & CRM <span className="ai-badge">Hyper-Personalized</span></h1>
          <p>Analyse de sentiment & Engagement automatisé</p>
        </div>
        <div className="header-actions">
           <button className="btn-primary"><Mail size={16} /> Campagne IA</button>
        </div>
      </header>

      <div className="crm-grid">
        {/* Left: Guest List with Sentiment */}
        <section className="guest-list-pane glass-panel">
          <div className="pane-header">
             <User size={18} />
             <h3>Base Clients AI-Enhanced</h3>
          </div>
          
          <div className="guest-cards-scroll">
            {guests.map(guest => (
              <div 
                key={guest.id} 
                className={`guest-card ${selectedGuest?.id === guest.id ? 'active' : ''}`}
                onClick={() => setSelectedGuest(guest)}
              >
                <div className="guest-main">
                   <div className="avatar">{guest.avatar}</div>
                   <div className="info">
                      <strong>{guest.name}</strong>
                      <span>{guest.status} • {guest.lastStay}</span>
                   </div>
                </div>
                <div className="sentiment-indicator">
                   {guest.sentiment === 'Positive' && <Smile size={18} color="#10B981" />}
                   {guest.sentiment === 'Neutral' && <Meh size={18} color="#F59E0B" />}
                   {guest.sentiment === 'Negative' && <Frown size={18} color="#EF4444" />}
                   <span className="score">{guest.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: AI Insights & Communication */}
        <section className="guest-detail-pane">
          {selectedGuest ? (
            <div className="detail-content animate-slide-up">
              <div className="detail-header glass-panel">
                 <div className="guest-summary">
                    <h2>{selectedGuest.name}</h2>
                    <div className="tags">
                       <span className="tag"><Tag size={12} /> High Spender</span>
                       <span className="tag"><Tag size={12} /> Spa Lover</span>
                    </div>
                 </div>
                 <div className="loyalty-score">
                    <Heart size={20} fill="#EF4444" color="#EF4444" />
                    <span>Score de Fidélité : <strong>9.5/10</strong></span>
                 </div>
              </div>

              {/* AI Analysis Box */}
              <div className="ai-insight-card glass-panel">
                 <div className="card-header">
                    <Sparkles size={18} color="var(--accent-blue)" />
                    <h3>Analyse Prédictive IA</h3>
                 </div>
                 <div className="insight-body">
                    <p>Probabilité de retour : <span className="text-highlight">88%</span></p>
                    <p>Préférence chambre : <span className="text-highlight">Étage élevé, loin de l'ascenseur</span></p>
                    <div className="sentiment-note">
                       <Info size={14} />
                       <span>L'analyse de sentiment détecte une frustration légère sur le délai du Room Service (Séjours n-1).</span>
                    </div>
                 </div>
              </div>

              {/* AI Smart Reply */}
              <div className="smart-reply-box glass-panel">
                 <div className="reply-header">
                    <MessageSquare size={18} />
                    <h3>Réponse Assistée par IA</h3>
                    <button className="btn-ai-generate" onClick={generateDraft} disabled={isDrafting}>
                      <Sparkles size={14} /> {isDrafting ? 'Génération...' : 'Rédiger une réponse personnalisée'}
                    </button>
                 </div>
                 
                 <div className="draft-area">
                    <AnimatePresence>
                      {isDrafting ? (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="loading-draft">
                            <Sparkles className="spin" />
                            <span>Oracle analyse l'historique de {selectedGuest.name}...</span>
                         </motion.div>
                      ) : draft && (
                         <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="draft-preview">
                            <textarea value={draft} onChange={e => setDraft(e.target.value)} />
                            <div className="draft-footer">
                               <button className="btn-send"><Send size={14} /> Envoyer</button>
                            </div>
                         </motion.div>
                      )}
                    </AnimatePresence>
                    {!draft && !isDrafting && <div className="placeholder-text">Cliquez sur le bouton pour générer une réponse optimisée basée sur le profil du client.</div>}
                 </div>
              </div>
            </div>
          ) : (
            <div className="empty-state glass-panel">
               <User size={48} color="#CBD5E1" />
               <p>Sélectionnez un client pour voir l'analyse prédictive et les outils d'engagement IA.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GuestCRM;
