import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle2, 
  CalendarDays, 
  MessageSquare, 
  Wallet, 
  Sparkles,
  Zap,
  Users,
  ShieldCheck,
  Bot,
  Play,
  PlayCircle,
  Video,
  Pause,
  ExternalLink,
  Smartphone,
  ChevronRight,
  Plus,
  CreditCard,
  Building,
  Car,
  Utensils,
  Key,
  Globe2,
  Database,
  Layers,
  Monitor,
  Search,
  Lock,
  Unlock,
  RefreshCcw,
  Clock,
  Briefcase,
  Flag,
  FileText
} from 'lucide-react';
import './LandingPage.css';

// Mini-Demo Components
const MiniTimeline = () => {
  const [dragged, setDragged] = useState(false);
  return (
    <div className="mini-demo mini-timeline glass-card">
      <div className="timeline-header-mock"><span>Lundi 31</span><span>Mardi 01</span><span>Mercredi 02</span></div>
      <div className="timeline-row-mock">
        <div className="room-label">Ch. 104</div>
        <motion.div 
          className="booking-bar bar-blue" 
          drag="x" 
          dragConstraints={{ left: 0, right: 100 }}
          onDragStart={() => setDragged(true)}
        >
          {dragged ? 'Relâcher pour modifier' : 'Alice - 3 nuits (Glisser)'}
        </motion.div>
      </div>
      <div className="timeline-row-mock">
        <div className="room-label">Ch. 201</div>
        <div className="booking-bar bar-purple" style={{ width: '120px', marginLeft: '40px' }}>Groupe Renault</div>
      </div>
    </div>
  );
};

const SmartLockDemo = () => {
  const [status, setStatus] = useState('locked');
  const [pin, setPin] = useState(null);

  const generatePin = () => {
    setStatus('unlocking');
    setTimeout(() => {
      setStatus('unlocked');
      setPin(Math.floor(1000 + Math.random() * 9000));
    }, 1500);
  };

  return (
    <div className="mini-demo smart-lock-demo glass-card">
      <div className="lock-visual">
        <motion.div 
           className={`lock-icon ${status}`}
           animate={{ scale: status === 'unlocking' ? [1, 1.2, 1] : 1 }}
           transition={{ repeat: status === 'unlocking' ? Infinity : 0 }}
        >
          {status === 'locked' ? <Lock size={32} /> : <Unlock size={32} color="#10b981" />}
        </motion.div>
      </div>
      <div className="lock-controls">
        <h3>Serrure Entrée Villa</h3>
        <p>{status === 'locked' ? 'Porte Verrouillée' : status === 'unlocking' ? 'Génération du PIN...' : 'PIN Invité: ' + pin}</p>
        <button className="btn-luxe-small" onClick={generatePin} disabled={status !== 'locked'}>
          {status === 'locked' ? 'Générer PIN Oracle' : 'Action en cours...'}
        </button>
      </div>
    </div>
  );
};

const AIChatDemo = () => {
  const [messages, setMessages] = useState([
    { role: 'guest', text: 'Est-il possible d\'avoir un check-in anticipé ?' }
  ]);
  const [typing, setTyping] = useState(false);

  const handleReply = () => {
    setTyping(true);
    setTimeout(() => {
      setMessages([...messages, { role: 'ai', text: 'Bien sûr ! Votre villa sera prête à 11:00. Voici votre code d\'accès.' }]);
      setTyping(false);
    }, 2000);
  };

  return (
    <div className="mini-demo ai-chat-demo glass-card">
      <div className="chat-thread">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            {m.role === 'ai' && <Sparkles size={12} className="ai-icon" />}
            {m.text}
          </div>
        ))}
        {typing && <div className="chat-bubble ai typing">Oracle réfléchit...</div>}
      </div>
      <button className="btn-ai-mock" onClick={handleReply} disabled={typing || messages.length > 1}>
        Simuler Réponse IA
      </button>
    </div>
  );
};

const LandingPage = ({ onGoToAuth }) => {
  const [activeCategory, setActiveCategory] = useState('Hotel');
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollPos(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = ['Service', 'Hotel', 'Event', 'Online Meeting', 'Rental', 'Chauffeur'];

  return (
    <div className="landing-container">
      {/* Iridescent Background Overlay */}
      <div className="bg-iridescent"></div>

      {/* Modern Minimalist Navigation */}
      <nav className={`landing-nav glass-card ${scrollPos > 100 ? 'scrolled' : ''}`}>
        <div className="nav-logo">
          <div className="logo-box"><Plus size={20} /></div>
          <span className="logo-name">Aura PMS</span>
        </div>
        
        <div className="nav-links">
          <a href="#planning">Planning</a>
          <a href="#channel">Distribution</a>
          <a href="#locks">IoT Access</a>
          <a href="#finance">Finance</a>
          <a href="#dgsn">Réglementation</a>
        </div>

        <div className="nav-actions">
          <button className="btn-get-aura" onClick={onGoToAuth}>Essai Gratuit</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        {/* Floating Elements Container */}
        <div className="floating-elements">
          <motion.div className="f-card card-yoga glass-card" style={{ '--rot': '-15deg' }} drag><div className="yoga-badge">Yoga Props Kit</div><div className="price-tag">€40 <span>ADD</span></div></motion.div>
          <motion.div className="f-card card-villa glass-card" style={{ '--rot': '-5deg' }} drag><img src="/c:/Users/lenovo/Desktop/HosFlow/villa_agadir_night_1774944694796.png" alt="Luxury Villa" className="villa-img" /><h4>Villa Ocean Dream</h4><p>Agadir, Morocco</p></motion.div>
          <motion.div className="f-card card-checkin glass-card" style={{ '--rot': '10deg' }} drag><label>CHECK IN</label><h3>AUG 11, 2025</h3></motion.div>
          <motion.div className="f-card card-car glass-card" style={{ '--rot': '5deg' }} drag><img src="/c:/Users/lenovo/Desktop/HosFlow/mercedes_white_luxe_1774944855268.png" alt="Luxury Car" className="car-img" /><h4>Mercedes CLA 200</h4><p>Disponible à l'aéroport</p></motion.div>
        </div>

        {/* Hero Content */}
        <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="new-badge"><span className="tag-new">New</span><span className="tag-sub">Propulsé par Super Work AI (Oracle)</span></div>
          <h1 className="hero-title">Le PMS de nouvelle génération pour <span className="dynamic-text">hôtels & villas</span></h1>
          <p className="hero-desc">Une interface holographique, automatisée et optimisée pour le marché de l'hospitalité au Maroc.</p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={onGoToAuth}>Démarrer Maintenant</button>
            <button className="btn-hero-video"><Play size={18} fill="currentColor" /> Voir la démo</button>
          </div>
        </motion.div>

        {/* Bottom Template Selection Bar */}
        <div className="bottom-template-bar glass-card">
           <div className="play-circle"><Play size={14} fill="currentColor" /></div>
           <div className="template-links">
             {categories.map(cat => (<span key={cat} className={activeCategory === cat ? 'active' : ''} onClick={() => setActiveCategory(cat)}>{cat}</span>))}
           </div>
           <div className="btn-all-templates">Tout voir</div>
        </div>
      </section>

      {/* DETAILED FEATURE BLOCKS */}
      
      {/* 1. Planning & Operations */}
      <section className="feature-block" id="planning">
        <div className="block-text">
          <div className="block-label"><CalendarDays size={16} /> OPERATIONS</div>
          <h2>Planning Front-Desk Ultra-Fluide</h2>
          <p>Gérez vos réservations avec une réactivité sans précédent. Le drag-and-drop intelligent d'Oracle ajuste automatiquement les tarifs et les tâches de ménage.</p>
          <ul className="feature-list-luxe">
            <li><CheckCircle2 size={16} /> Multi-propriétés en vue unifiée</li>
            <li><CheckCircle2 size={16} /> Codes couleurs par statut (Nettoyé, Arrivée, Séjour)</li>
            <li><CheckCircle2 size={16} /> Check-in/out en 2 clics</li>
          </ul>
        </div>
        <div className="block-demo">
           <MiniTimeline />
        </div>
      </section>

      {/* 2. Channel Manager & Distribution */}
      <section className="feature-block reverse" id="channel">
        <div className="block-demo">
           <div className="channel-sync-visual glass-card">
              <div className="channel-node airbnb"><RefreshCcw size={20} /> <span>Airbnb</span></div>
              <div className="channel-node booking"><RefreshCcw size={20} /> <span>Booking</span></div>
              <div className="channel-node expedia"><RefreshCcw size={20} /> <span>Expedia</span></div>
              <div className="main-pms-hub">AURA CORE</div>
           </div>
        </div>
        <div className="block-text">
          <div className="block-label"><Globe2 size={16} /> DISTRIBUTION</div>
          <h2>Channel Manager Bidirectionnel</h2>
          <p>Dites adieu aux sur-réservations. Synchronisez vos stocks, vos prix et vos photos en 500ms sur plus de 100 canaux mondiaux.</p>
          <ul className="feature-list-luxe">
            <li><CheckCircle2 size={16} /> API Directe avec Airbnb & Booking.com</li>
            <li><CheckCircle2 size={16} /> Booking Engine intégré pour votre site direct</li>
            <li><CheckCircle2 size={16} /> Parité tarifaire automatisée</li>
          </ul>
        </div>
      </section>

      {/* 3. Smart Access & IoT */}
      <section className="feature-block" id="locks">
        <div className="block-text">
          <div className="block-label"><Key size={16} /> SMART ACCESS</div>
          <h2>Automatisation des Accès (IoT)</h2>
          <p>Plus besoin de clés physiques. Générez des codes PIN uniques pour chaque réservation, synchronisés directement avec vos serrures connectées.</p>
          <ul className="feature-list-luxe">
            <li><CheckCircle2 size={16} /> Support TTLock, Tediton et Zigbee</li>
            <li><CheckCircle2 size={16} /> Envoi auto du code par WhatsApp</li>
            <li><CheckCircle2 size={16} /> Monitoring de batterie et alertes sécurité</li>
          </ul>
        </div>
        <div className="block-demo">
           <SmartLockDemo />
        </div>
      </section>

      {/* 4. Finance & MAD Management */}
      <section className="feature-block reverse" id="finance">
        <div className="block-demo">
            <div className="finance-mini-card glass-card">
               <div className="mini-kpi"><span>MAD Prov. Taxes</span> <strong>18 450 DH</strong></div>
               <div className="mini-chart-mock"><span></span><span></span><span></span></div>
            </div>
        </div>
        <div className="block-text">
          <div className="block-label"><CreditCard size={16} /> FINANCE PRO</div>
          <h2>Moteur de Facturation Marocain</h2>
          <p>Un Billing Engine optimisé pour le dirham (MAD). Gérez la TVA, la Taxe de séjour et les factures proforma en un clin d'œil.</p>
          <ul className="feature-list-luxe">
            <li><CheckCircle2 size={16} /> Multi-devises (MAD, EUR, USD)</li>
            <li><CheckCircle2 size={16} /> Export comptable SAP, Sage et QuickBooks</li>
            <li><CheckCircle2 size={16} /> Gestion des acomptes et folios complexes</li>
          </ul>
        </div>
      </section>

      {/* 5. DGSN & Local Compliance (New Section) */}
      <section className="feature-block" id="dgsn">
        <div className="block-text">
          <div className="block-label"><ShieldCheck size={16} /> COMPLIANCE</div>
          <h2>Conformité DGSN & STDN Simplifiée</h2>
          <p>Générez vos rapports de police et statistiques pour le Ministère du Tourisme en un clic. Automatisez vos fiches de police numériques.</p>
          <ul className="feature-list-luxe">
            <li><CheckCircle2 size={16} /> Export automatique format DGSN/Police</li>
            <li><CheckCircle2 size={16} /> Signature numérique des fiches de police</li>
            <li><CheckCircle2 size={16} /> Stockage sécurisé conforme CNDP</li>
          </ul>
        </div>
        <div className="block-demo">
            <div className="dgsn-report-mock glass-card">
               <FileText size={32} color="#1e293b" />
               <h4>Fiche de Police Digitale</h4>
               <div className="badge-ok">Prêt pour envoi</div>
            </div>
        </div>
      </section>

      {/* 6. AI & Unified Inbox */}
      <section className="feature-block reverse" id="ai">
        <div className="block-demo">
            <AIChatDemo />
        </div>
        <div className="block-text">
          <div className="block-label"><Sparkles size={16} /> INTELLIGENCE ARTIFICIELLE</div>
          <h2>Oracle AI : Votre Assistant Réception</h2>
          <p>L'IA d'Oracle analyse, trie et répond aux messages de vos clients sur tous les canaux. Un gain de temps massif pour votre staff.</p>
          <ul className="feature-list-luxe">
            <li><CheckCircle2 size={16} /> Inbox unifiée (WhatsApp, Airbnb, Booking)</li>
            <li><CheckCircle2 size={16} /> Rédaction auto de réponses personnalisées</li>
            <li><CheckCircle2 size={16} /> Traduction en temps réel (Français, Arabe, Anglais)</li>
          </ul>
          <div className="ai-fab" onClick={onGoToAuth}>
            <Sparkles size={24} color="#000" />
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
