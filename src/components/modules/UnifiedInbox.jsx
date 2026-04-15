import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, Paperclip, Send, Settings, CheckCircle2, AlertCircle, RefreshCw, X, FileText, Image as ImageIcon, Plus } from 'lucide-react';
import './UnifiedInbox.css';

const UnifiedInbox = ({ pmsMode = 'pro' }) => {
  const [activeView, setActiveView] = useState('chat'); // 'chat' or 'config'
  const [selectedChat, setSelectedChat] = useState(1);
  const [messageInput, setMessageInput] = useState('');

  // Config State
  const [channels, setChannels] = useState([
    { id: 'whatsapp', name: 'WhatsApp Business API', connected: true, type: 'api', color: '#25D366' },
    { id: 'booking', name: 'Booking.com', connected: true, type: 'app', color: '#003580' },
    { id: 'airbnb', name: 'Airbnb', connected: true, type: 'app', color: '#FF5A5F' },
    { id: 'messenger', name: 'Facebook Messenger', connected: false, type: 'oauth', color: '#0084FF' },
    { id: 'instagram', name: 'Instagram Direct', connected: false, type: 'oauth', color: '#E1306C' },
    { id: 'sms', name: 'SMS (Twilio)', connected: true, type: 'api', color: '#10B981' }
  ]);

  // Mock Conversations
  const [conversations] = useState([
    { id: 1, guest: 'Alexandre Dubois', source: 'whatsapp', lastMsg: 'Bonjour, est-ce que le late check-out est possible ?', time: '10:42', unread: 2, reservation: 'RES-9482', pmsLinked: true },
    { id: 2, guest: 'Sarah Connor', source: 'airbnb', lastMsg: 'I will arrive around 8 PM. Thanks!', time: 'Yesterday', unread: 0, reservation: 'RES-1033', pmsLinked: true },
    { id: 3, guest: '+33 6 12 34 56 78', source: 'sms', lastMsg: 'Merci pour le code de la porte.', time: 'Monday', unread: 0, reservation: null, pmsLinked: false },
    { id: 4, guest: 'Maria Rossi', source: 'booking', lastMsg: 'Can we book a table at the restaurant?', time: 'Oct 12', unread: 1, reservation: 'RES-5521', pmsLinked: true },
  ]);

  // Mock Active Chat
  const [activeMessages, setActiveMessages] = useState([
    { id: 1, sender: 'guest', text: 'Bonjour, nous arrivons demain. Est-ce que le late check-out est possible ?', time: '10:40' },
    { id: 2, sender: 'system', text: 'Automated AI Reply: Bonjour Alexandre ! Le late check-out est sujet à disponibilité. Nous vous tiendrons au courant demain matin.', time: '10:41', ai: true },
    { id: 3, sender: 'guest', text: 'Super, merci beaucoup.', time: '10:42' }
  ]);

  const toggleChannel = (id) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'host',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setActiveMessages([...activeMessages, newMsg]);
    setMessageInput('');
  };

  const renderSourceIcon = (source) => {
    const channel = channels.find(c => c.id === source);
    if (!channel) return <MessageSquare size={14} />;
    
    // Quick brand initials or colors since we don't have branded SVG components readily available
    return (
      <div className="source-badge" style={{ backgroundColor: channel.color }}>
        {source === 'whatsapp' ? 'WA' : source === 'airbnb' ? 'ab' : source === 'booking' ? 'B.' : source === 'sms' ? 'SMS' : 'Msg'}
      </div>
    );
  };

  const activeChatData = conversations.find(c => c.id === selectedChat);

  return (
    <div className={`unified-inbox-module mode-${pmsMode}`}>
      
      {/* Header */}
      <div className="inbox-header glass-panel">
        <div className="header-left">
          <MessageSquare className="header-icon" size={24} />
          <h2>Inbox Omnicanale</h2>
          <span className="badge-pro">BETA</span>
        </div>
        <div className="header-right">
          <button 
            className={`btn-toggle-view ${activeView === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveView('chat')}
          >
            <MessageSquare size={16} /> Messages
          </button>
          <button 
            className={`btn-toggle-view ${activeView === 'config' ? 'active' : ''}`}
            onClick={() => setActiveView('config')}
          >
            <Settings size={16} /> Connexions (Admin)
          </button>
        </div>
      </div>

      {activeView === 'chat' ? (
        <div className="inbox-layout">
          {/* Sidebar Ticket List */}
          <div className="inbox-sidebar glass-panel">
            <div className="sidebar-search">
              <input type="text" placeholder="Rechercher un invité, un message..." />
            </div>
            
            <div className="ticket-list hide-scrollbar">
              {conversations.map(conv => (
                <div 
                  key={conv.id} 
                  className={`ticket-item ${selectedChat === conv.id ? 'active' : ''} ${conv.unread ? 'unread' : ''}`}
                  onClick={() => setSelectedChat(conv.id)}
                >
                  <div className="ticket-avatar">
                    <div className="avatar-circle">{conv.guest.charAt(0)}</div>
                    <div className="source-indicator">{renderSourceIcon(conv.source)}</div>
                  </div>
                  <div className="ticket-info">
                    <div className="ticket-top">
                      <span className="guest-name">{conv.guest}</span>
                      <span className="msg-time">{conv.time}</span>
                    </div>
                    <div className="ticket-bottom">
                      <span className="last-msg">{conv.lastMsg}</span>
                      {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
                    </div>
                    {conv.pmsLinked && (
                      <div className="pms-link-badge">
                        <CheckCircle2 size={12} /> {conv.reservation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="inbox-main glass-panel">
            {activeChatData ? (
              <>
                <div className="chat-header">
                  <div className="chat-guest-info">
                    <h3>{activeChatData.guest}</h3>
                    <div className="chat-meta">
                      <span className="source-tag" style={{ background: channels.find(c => c.id === activeChatData.source)?.color + '20', color: channels.find(c => c.id === activeChatData.source)?.color }}>
                        Via {channels.find(c => c.id === activeChatData.source)?.name}
                      </span>
                      {activeChatData.pmsLinked ? (
                        <span className="pms-status linked"><CheckCircle2 size={14}/> Profil PMS Connecté</span>
                      ) : (
                        <span className="pms-status unlinked"><AlertCircle size={14}/> Non réconcilié</span>
                      )}
                    </div>
                  </div>
                  <div className="chat-actions">
                    <button className="action-icon"><Phone size={18} /></button>
                    <button className="action-icon"><Mail size={18} /></button>
                  </div>
                </div>

                <div className="chat-messages hide-scrollbar">
                  {activeMessages.map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                      {msg.ai && <span className="ai-label"><RefreshCw size={10}/> Réponse Autopilot</span>}
                      <div className="msg-text">{msg.text}</div>
                      <div className="msg-time">{msg.time}</div>
                    </div>
                  ))}
                </div>

                <div className="chat-input-area">
                  <button className="attachment-btn"><Paperclip size={20} /></button>
                  <input 
                    type="text" 
                    placeholder={`Répondre à ${activeChatData.guest} (SMS/WhatsApp/Booking...)`}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="send-btn" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                    <Send size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-chat">
                <MessageSquare size={48} />
                <p>Sélectionnez une conversation pour commencer</p>
              </div>
            )}
          </div>
          
          {/* Reservation Context Sidebar (Optional Extra Pane) */}
          {activeChatData && activeChatData.pmsLinked && (
            <div className="context-sidebar glass-panel">
               <h3>Détails Séjour</h3>
               <div className="res-card">
                 <div className="res-badge">N° {activeChatData.reservation}</div>
                 <div className="res-detail"><strong>Check-in:</strong> 15 Oct 2026</div>
                 <div className="res-detail"><strong>Check-out:</strong> 18 Oct 2026</div>
                 <div className="res-detail"><strong>Logement:</strong> Chambre 104</div>
               </div>
               <div className="quick-actions-box">
                 <h4>Actions PMS Rapids</h4>
                 <button className="btn-qa"><FileText size={14}/> Envoyer Facture PDF</button>
                 <button className="btn-qa"><ImageIcon size={14}/> Envoyer Plan d'Accès</button>
               </div>
            </div>
          )}
        </div>
      ) : (
        /* Setup / Configuration Panel */
        <div className="config-layout glass-panel hide-scrollbar">
          <div className="config-header">
            <h3>Canaux de Communication</h3>
            <p>Connectez vos différents canaux pour centraliser tous vos messages dans Antigravity. Le système réconciliera automatiquement les messages avec vos réservations (via numéro de téléphone ou email).</p>
          </div>

          <div className="channels-grid">
            {channels.map(channel => (
              <div key={channel.id} className="channel-card glass-card">
                <div className="channel-top">
                  <div className="channel-icon" style={{ backgroundColor: channel.color }}>
                    {channel.id === 'whatsapp' ? 'WA' : channel.id === 'airbnb' ? 'ab' : channel.id === 'booking' ? 'B.' : channel.id.substring(0,2).toUpperCase()}
                  </div>
                  <div className={`status-badge ${channel.connected ? 'active' : 'inactive'}`}>
                    {channel.connected ? 'Connecté' : 'Non Connecté'}
                  </div>
                </div>
                <h4>{channel.name}</h4>
                <p className="channel-desc">
                  {channel.type === 'oauth' 
                    ? 'Authentification en 1 clic via OAuth 2.0.' 
                    : channel.type === 'api' ? 'Connexion sécurisée via Clé API ou Webhook.' : 'Synchronisation directe avec la plateforme.'}
                </p>
                <div className="channel-action">
                  {channel.connected ? (
                    <button className="btn-disconnect" onClick={() => toggleChannel(channel.id)}>Déconnecter</button>
                  ) : (
                    <button 
                      className="btn-connect" 
                      style={{ background: channel.color, color: 'white' }}
                      onClick={() => toggleChannel(channel.id)}
                    >
                      <Plus size={16} /> Connecter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedInbox;
