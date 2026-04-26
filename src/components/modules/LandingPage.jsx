import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight, Monitor, Key, Globe2, Sparkles, Download, Code, Zap, LayoutGrid, Users, CreditCard } from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onGoToAuth }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  return (
    <div className="td-landing-wrapper">
      {/* Background Ambient Orbs */}
      <div className="td-ambient-orb td-orb-1"></div>
      <div className="td-ambient-orb td-orb-2"></div>
      <div className="td-ambient-orb td-orb-3"></div>

      {/* Navbar */}
      <nav className={`td-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="td-nav-container">
          <div className="td-logo">
            <div className="td-logo-icon">H</div>
            <span>HosFlow</span>
          </div>
          <div className="td-nav-links hide-mobile">
            <a href="#bento">Fonctionnalités</a>
            <a href="#features">Intégration</a>
            <a href="#customers">Témoignages</a>
            <a href="#pricing">Tarifs</a>
          </div>
          <div className="td-nav-actions">
            <button className="td-btn-secondary hide-mobile" onClick={onGoToAuth}>Connexion</button>
            <button className="td-btn-primary" onClick={onGoToAuth}>
              Essai Gratuit <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="td-hero" id="hero">
        <motion.div {...fadeInUp}>
          <div className="td-badge">
            <span className="td-badge-highlight">Nouveau</span>
            HosFlow AI : Votre assistant réceptionniste V2
            <ChevronRight size={14} />
          </div>
          <h1 className="td-hero-title">
            Le PMS qui transforme vos propriétés en<br />
            <span className="td-gradient-text">entreprises automatisées.</span>
          </h1>
          <p className="td-hero-desc">
            Le Property Management System le plus avancé pour l'hôtellerie moderne. 
            Unifiez votre Channel Manager, vos serrures connectées et la communication client dans une interface ultra-rapide.
          </p>
          <div className="td-hero-buttons">
            <button className="td-btn-primary large" onClick={onGoToAuth}>
              Lancer l'Application
            </button>
            <a href="#bento" className="td-btn-outline large" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Découvrir les modules
            </a>
          </div>
          <p className="td-hero-subtext">Aucune carte de crédit requise. Configuration en 5 minutes.</p>
        </motion.div>
        
        {/* Hero Image Mockup */}
        <motion.div 
          className="td-hero-mockup-wrapper"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          {/* Floating OTA Spheres (Bolles) */}
          <motion.div 
            className="td-floating-bubble bubble-airbnb"
            style={{ color: '#FF5A5F' }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            A
          </motion.div>
          
          <motion.div 
            className="td-floating-bubble bubble-booking"
            style={{ color: '#003580' }}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            B
          </motion.div>
          
          <motion.div 
            className="td-floating-bubble bubble-expedia"
            style={{ color: '#000080' }}
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            E
          </motion.div>
          
          <motion.div 
            className="td-floating-bubble bubble-tripadvisor"
            style={{ color: '#00AF87' }}
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            T
          </motion.div>

          <div className="td-hero-mockup">
            <div className="td-mockup-header">
               <div className="td-dots"><span></span><span></span><span></span></div>
               <div className="td-url">hosflow.app/planning</div>
            </div>
            <div className="td-mockup-body" style={{ height: 'auto' }}>
               <img src="/images/image_0.png" alt="HosFlow Dashboard View" className="td-mockup-img" />
            </div>
          </div>
        </motion.div>
      </header>

      {/* Logo Cloud */}
      <motion.section className="td-logos" id="customers" {...fadeInUp}>
        <p>ILS NOUS FONT CONFIANCE POUR LEUR GESTION HÔTELIÈRE</p>
        <div className="td-logo-track">
           <span>Airbnb</span>
           <span>Booking.com</span>
           <span>Expedia</span>
           <span>TTLock</span>
           <span>Stripe</span>
        </div>
      </motion.section>

      {/* Feature Bento Grid */}
      <section className="td-bento-section" id="bento">
        <motion.div className="td-section-header" {...fadeInUp}>
          <h2>Performances natives.<br/>Accessibilité web universelle.</h2>
          <p>Tout ce dont vous avez besoin pour gérer votre établissement, regroupé dans une interface foudroyante de rapidité.</p>
        </motion.div>

        <div className="td-bento-grid">
          
          {/* Bento Item 1 */}
          <motion.div className="td-bento-card col-span-2 row-span-2" {...fadeInUp} transition={{ delay: 0.1 }}>
            <div className="td-bento-content">
              <Globe2 className="td-bento-icon" />
              <h3>Channel Manager Universel</h3>
              <p>Synchronisez votre calendrier, vos prix et vos disponibilités sur plus de 100 OTA instantanément. Dites adieu aux doubles réservations.</p>
            </div>
            <div className="td-bento-visual">
               <img src="/images/image_3.png" alt="Channel Manager Calendar" className="td-bento-img" />
            </div>
          </motion.div>

          {/* Bento Item 2 */}
          <motion.div className="td-bento-card" {...fadeInUp} transition={{ delay: 0.2 }}>
            <div className="td-bento-content">
              <Key className="td-bento-icon" />
              <h3>Accès Intelligent (IoT)</h3>
              <p>Générez automatiquement des codes PIN uniques pour chaque voyageur via l'intégration TTLock et Sciener.</p>
            </div>
            <div className="td-bento-visual" style={{ marginTop: '1rem', padding: 0 }}>
               <img src="/images/image_1.png" alt="Smart Lock Integration" className="td-bento-img" style={{ objectFit: 'contain' }} />
            </div>
          </motion.div>

          {/* Bento Item 3 */}
          <motion.div className="td-bento-card" {...fadeInUp} transition={{ delay: 0.3 }}>
            <div className="td-bento-content">
              <Sparkles className="td-bento-icon" />
              <h3>Partenaires PMS</h3>
              <p>Intégrations bidirectionnelles avec Mews, Protel, et Sihot pour une gouvernance parfaite.</p>
            </div>
            <div className="td-bento-visual" style={{ marginTop: '1rem', padding: 0 }}>
               <img src="/images/image_2.png" alt="PMS Partners" className="td-bento-img" style={{ objectFit: 'contain' }} />
            </div>
          </motion.div>

          {/* Bento Item 4 */}
          <motion.div className="td-bento-card col-span-2" {...fadeInUp} transition={{ delay: 0.4 }}>
            <div className="td-bento-content">
              <CreditCard className="td-bento-icon" />
              <h3>Facturation & Booking Engine Direct</h3>
              <p>Augmentez vos revenus directs grâce à un moteur de réservation personnalisable. Traitez les paiements et générez des factures proforma multi-devises.</p>
            </div>
            <div className="td-bento-visual" style={{ marginTop: '1rem', padding: 0 }}>
               <img src="/images/image_4.png" alt="Direct Booking Engine" className="td-bento-img" style={{ objectPosition: 'center', height: '180px' }} />
            </div>
          </motion.div>

        </div>
      </section>

      {/* Detailed Code / Setup Section */}
      <section className="td-setup-section" id="features">
        <div className="td-setup-container">
          <motion.div className="td-setup-text" {...fadeInUp}>
            <h2>Prêt en quelques minutes,<br/>pas en quelques mois.</h2>
            <p>Contrairement aux logiciels PMS obsolètes, HosFlow ne nécessite aucune installation lourde sur vos ordinateurs. Connectez vos OTA, configurez vos chambres, et lancez votre activité.</p>
            <ul className="td-check-list">
              <li><CheckCircle2 size={18} /> Architecture API-First (Ouverte)</li>
              <li><CheckCircle2 size={18} /> Disponibilité garantie à 99.99%</li>
              <li><CheckCircle2 size={18} /> Sécurité de niveau bancaire</li>
            </ul>
          </motion.div>
          <motion.div className="td-setup-code" {...fadeInUp} transition={{ delay: 0.2 }}>
            <div className="td-code-window">
               <div className="td-code-header">
                 <span></span><span></span><span></span>
                 <div className="td-code-title">config_hotel.js</div>
               </div>
               <pre>
                 <code>
<span className="c-keyword">import</span> {'{'} HosFlowPMS {'}'} <span className="c-keyword">from</span> <span className="c-string">'@hosflow/core'</span>;{'\n\n'}
<span className="c-keyword">const</span> hotel = <span className="c-keyword">new</span> HosFlowPMS({'{'}{'\n'}
{'  '}propertyId: <span className="c-string">'boutique-hotel-marrakech'</span>,{'\n'}
{'  '}channels: [<span className="c-string">'airbnb'</span>, <span className="c-string">'booking'</span>, <span className="c-string">'expedia'</span>],{'\n'}
{'  '}smartLocks: <span className="c-string">'ttlock-enabled'</span>,{'\n'}
{'  '}aiConcierge: <span className="c-keyword">true</span>{'\n'}
{'}'});{'\n\n'}
hotel.startAutomation();
                 </code>
               </pre>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="td-cta-section" id="pricing">
        <motion.div className="td-cta-box" {...fadeInUp}>
          <h2>Prêt à révolutionner votre établissement ?</h2>
          <p>Rejoignez les centaines de gérants d'hôtels et de conciergeries qui ont choisi HosFlow pour scaler leur activité.</p>
          <button className="td-btn-primary large" onClick={onGoToAuth}>
            Créer un compte gratuit
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="td-footer">
        <div className="td-footer-top">
          <div className="td-footer-brand">
            <div className="td-logo-icon small">H</div>
            <span>HosFlow</span>
          </div>
          <div className="td-footer-links">
            <div className="link-col">
              <h4>Produit</h4>
              <a href="#bento">Fonctionnalités</a>
              <a href="#features">Intégrations (OTA)</a>
              <a href="#pricing">Tarifs</a>
              <a href="#">Mises à jour</a>
            </div>
            <div className="link-col">
              <h4>Ressources</h4>
              <a href="#">Documentation</a>
              <a href="#">Référence API</a>
              <a href="#">Blog</a>
              <a href="#">Communauté</a>
            </div>
            <div className="link-col">
              <h4>Légal</h4>
              <a href="#">Confidentialité</a>
              <a href="#">Conditions générales</a>
              <a href="#">Sécurité des données</a>
            </div>
          </div>
        </div>
        <div className="td-footer-bottom">
          <p>&copy; 2026 HosFlow Technologies. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
