import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Check, X, Star, Users, ShieldCheck, 
  Zap, Calendar, Key, Globe, Layout, MessageSquare, 
  CreditCard, BarChart3, ChevronRight, Smartphone, 
  Bell, Lock, Mail 
} from 'lucide-react';
import AuthPage from './AuthPage';
import PricingSimulator from './PricingSimulator';
import './LandingPage.css';

const LandingPage = ({ onLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleOpenAuth = () => setShowAuthModal(true);
  const handleCloseAuth = () => setShowAuthModal(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    },
    viewport: { once: true }
  };

  return (
    <div className="td-landing-wrapper">
      {/* Background Ambient Orbs - Matching AuthPage Style */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>
      <div className="ambient-orb orb-4"></div>

      {/* Navbar */}
      <nav className={`td-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="td-nav-container">
          <div className="td-logo">
            <div className="td-logo-icon">H</div>
            <span>Hova</span>
          </div>
          <div className="td-nav-links hide-mobile">
            <a href="#how-it-works">Fonctionnement</a>
            <a href="#features">Fonctionnalités</a>
            <a href="#pricing">Tarifs</a>
            <a href="#testimonials">Avis</a>
          </div>
          <div className="td-nav-actions">
            <button className="td-btn-secondary hide-mobile" onClick={handleOpenAuth}>Connexion</button>
            <button className="td-btn-primary" onClick={handleOpenAuth}>
              Démarrer <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="td-hero">
        {/* Floating OTA Bubbles with Logos */}
        <div className="hp-floating-bubbles-container">
          <div className="hp-bubble bubble-airbnb">
            <img src="https://www.vectorlogo.zone/logos/airbnb/airbnb-icon.svg" alt="Airbnb" />
          </div>
          <div className="hp-bubble bubble-booking">
            <img src="https://www.vectorlogo.zone/logos/booking/booking-icon.svg" alt="Booking.com" />
          </div>
          <div className="hp-bubble bubble-expedia">
            <Globe size={28} />
          </div>
          <div className="hp-bubble bubble-tripadvisor">
            <img src="https://www.vectorlogo.zone/logos/tripadvisor/tripadvisor-icon.svg" alt="TripAdvisor" />
          </div>
          <div className="hp-bubble bubble-stripe">
            <img src="https://www.vectorlogo.zone/logos/stripe/stripe-icon.svg" alt="Stripe" />
          </div>
          <div className="hp-bubble bubble-ttlock">
            <img src="https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg" alt="Cloud" />
          </div>
        </div>

        <motion.div {...fadeInUp} style={{ position: 'relative', zIndex: 10 }}>
          <div className="hp-trust-badges">
            <div className="hp-trust-badge">
              <Star size={14} fill="currentColor" />
              <span>4.9/5 sur Trustpilot</span>
            </div>
            <div className="hp-trust-badge">
              <Users size={14} />
              <span>+2,500 établissements</span>
            </div>
            <div className="hp-trust-badge">
              <ShieldCheck size={14} />
              <span>Conforme RGPD & SOC2</span>
            </div>
          </div>
          
          <h1 className="td-hero-title">
            Gérez vos propriétés <br/>
            en mode <span style={{ color: 'var(--hp-blue)' }}>pilote automatique.</span>
          </h1>
          
          <p className="td-hero-desc">
            Le PMS nouvelle génération qui connecte vos canaux, vos serrures et vos clients dans une interface unique et ultra-fluide.
          </p>
          
          <div className="hp-hero-cta-group">
            <button className="td-btn-primary large" onClick={handleOpenAuth}>
              Essayer Hova Gratuitement
            </button>
            <p className="hp-cta-subtext">
              <Check size={14} className="hp-check" /> Pas de carte de crédit • Annulation possible à tout moment
            </p>
          </div>
          
          <div className="hp-stats-grid">
            <div className="hp-stat-item">
              <span className="hp-stat-value">99.9%</span>
              <span className="hp-stat-label">Uptime</span>
            </div>
            <div className="hp-stat-item">
              <span className="hp-stat-value">150+</span>
              <span className="hp-stat-label">Intégrations</span>
            </div>
            <div className="hp-stat-item">
              <span className="hp-stat-value">24/7</span>
              <span className="hp-stat-label">Support Expert</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Logo Cloud */}
      <section className="td-logos">
        <p>Ils nous font confiance pour leur croissance</p>
        <div className="td-logo-track">
           <span>Airbnb</span>
           <span>Booking.com</span>
           <span>Expedia</span>
           <span>TripAdvisor</span>
           <span>Stripe</span>
           <span>TTLock</span>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="hp-features-showcase" id="features">
        <div className="hp-section-header">
          <h2>Tout ce dont vous avez besoin</h2>
          <p>Une suite complète d'outils pour dominer le marché de la location saisonnière et de l'hôtellerie.</p>
        </div>

        {/* Feature 1: Mobile App */}
        <div className="hp-feature-row">
          <motion.div className="hp-feature-text" {...fadeInUp}>
            <Smartphone className="hp-icon-accent" size={40} style={{ color: 'var(--hp-blue)', marginBottom: '1.5rem' }} />
            <h2>Contrôlez tout, partout.</h2>
            <p>Notre application mobile native vous permet de gérer les check-ins, d'ouvrir les portes à distance et de répondre aux clients, même en déplacement.</p>
            <ul className="hp-feature-list">
              <li><Check size={18} className="hp-check" /> Notifications push en temps réel</li>
              <li><Check size={18} className="hp-check" /> Ouverture de serrure via Bluetooth/Wi-Fi</li>
              <li><Check size={18} className="hp-check" /> Mode Hors-ligne disponible</li>
            </ul>
          </motion.div>
          <motion.div className="hp-feature-image" {...fadeInUp} transition={{ delay: 0.2 }}>
            <img src="/hosflow_mobile_app_mockup_1777482343211.png" alt="Mobile App Mockup" />
          </motion.div>
        </div>

        {/* Feature 2: Unified Inbox */}
        <div className="hp-feature-row reverse">
          <motion.div className="hp-feature-text" {...fadeInUp}>
            <Mail className="hp-icon-accent" size={40} style={{ color: 'var(--hp-blue)', marginBottom: '1.5rem' }} />
            <h2>Boîte de réception unifiée.</h2>
            <p>Ne perdez plus jamais un message. Centralisez toutes les conversations Airbnb, Booking, WhatsApp et SMS dans un flux unique et intelligent.</p>
            <ul className="hp-feature-list">
              <li><Check size={18} className="hp-check" /> Réponses automatiques par IA</li>
              <li><Check size={18} className="hp-check" /> Traduction instantanée intégrée</li>
              <li><Check size={18} className="hp-check" /> Notes internes pour l'équipe</li>
            </ul>
          </motion.div>
          <motion.div className="hp-feature-image" {...fadeInUp} transition={{ delay: 0.2 }}>
            <img src="/hosflow_unified_inbox_mockup_1777482367848.png" alt="Unified Inbox Mockup" />
          </motion.div>
        </div>

        {/* Feature 3: Smart Locks */}
        <div className="hp-feature-row">
          <motion.div className="hp-feature-text" {...fadeInUp}>
            <Lock className="hp-icon-accent" size={40} style={{ color: 'var(--hp-blue)', marginBottom: '1.5rem' }} />
            <h2>Accès sans clé, 100% sûr.</h2>
            <p>Connectez vos serrures TTLock ou Sciener. Hova génère et envoie automatiquement les codes d'accès valides uniquement pendant la durée du séjour.</p>
            <ul className="hp-feature-list">
              <li><Check size={18} className="hp-check" /> Synchronisation automatique des dates</li>
              <li><Check size={18} className="hp-check" /> Journal d'accès en temps réel</li>
              <li><Check size={18} className="hp-check" /> Alerte batterie faible</li>
            </ul>
          </motion.div>
          <motion.div className="hp-feature-image" {...fadeInUp} transition={{ delay: 0.2 }}>
            <img src="/images/image_1.png" alt="Smart Locks" />
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="hp-how-it-works" id="how-it-works">
        <div className="hp-section-header">
          <h2>Simplifiez votre quotidien</h2>
          <p>Trois étapes vers une liberté totale.</p>
        </div>
        
        <div className="hp-steps-grid">
          <motion.div className="hp-step-card" {...fadeInUp}>
            <div className="hp-step-number">1</div>
            <h3>Importation Rapide</h3>
            <p>Connectez vos comptes OTA. Nous importons tout en moins de 60 secondes.</p>
            <div className="hp-step-visual">
              <img src="/images/image_3.png" alt="Channel Manager" />
            </div>
          </motion.div>
          
          <motion.div className="hp-step-card" {...fadeInUp} transition={{ delay: 0.1 }}>
            <div className="hp-step-number">2</div>
            <h3>Configuration IA</h3>
            <p>Notre IA analyse vos annonces et configure les automatisations optimales.</p>
            <div className="hp-step-visual">
              <img src="/images/image_0.png" alt="AI Config" />
            </div>
          </motion.div>
          
          <motion.div className="hp-step-card" {...fadeInUp} transition={{ delay: 0.2 }}>
            <div className="hp-step-number">3</div>
            <h3>Encaissez Directement</h3>
            <p>Le moteur de réservation direct s'occupe de tout le reste.</p>
            <div className="hp-step-visual">
              <img src="/images/image_4.png" alt="Billing" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="hp-comparison" id="comparison">
        <div className="hp-section-header">
          <h2>L'avantage Hova</h2>
          <p>Pourquoi nos clients ne reviendront jamais en arrière.</p>
        </div>
        
        <div className="hp-comparison-container">
          <table className="hp-table">
            <thead>
              <tr>
                <th className="hp-table-col-label">Fonctionnalité</th>
                <th className="hp-table-col-hosflow">Hova</th>
                <th className="hp-table-col-old">Autres PMS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mise à jour Calendrier</td>
                <td><Zap size={16} fill="currentColor" /> Instantanée</td>
                <td>Lente (2-5 min)</td>
              </tr>
              <tr>
                <td>Accès IoT Natif</td>
                <td><Check size={18} className="hp-check" /> Oui</td>
                <td>Via tierce partie</td>
              </tr>
              <tr>
                <td>IA Concierge</td>
                <td><Check size={18} className="hp-check" /> Inclus</td>
                <td>Option payante</td>
              </tr>
              <tr>
                <td>Mobile App Native</td>
                <td><Check size={18} className="hp-check" /> iOS & Android</td>
                <td>Web-only souvent</td>
              </tr>
              <tr>
                <td>Paiements Directs</td>
                <td>Stripe / PayPal</td>
                <td>Limité</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="hp-pricing" id="pricing">
        <div className="hp-section-header">
          <h2>Calculez votre tarif en direct</h2>
          <p>Payez selon le nombre de chambres que vous gérez. Pas de surprise.</p>
        </div>
        <PricingSimulator onStart={handleOpenAuth} />
      </section>

      {/* Testimonials */}
      <section className="hp-testimonials" id="testimonials">
        <div className="hp-section-header">
          <h2>Ils adorent Hova</h2>
          <p>Rejoignez les milliers de gestionnaires qui ont repris le contrôle.</p>
        </div>
        
        <div className="hp-testimonial-grid">
          <motion.div className="hp-testimonial-card" {...fadeInUp}>
            <div className="hp-user-info">
              <div className="hp-user-avatar">JD</div>
              <div className="hp-user-details">
                <h4>Jean Dupont</h4>
                <p>Host à Paris (12 appts)</p>
              </div>
            </div>
            <p className="hp-testimonial-text">
              "Le gain de temps est phénoménal. La synchronisation avec les serrures est un 'game changer' total pour ma logistique."
            </p>
          </motion.div>
          
          <motion.div className="hp-testimonial-card" {...fadeInUp} transition={{ delay: 0.1 }}>
            <div className="hp-user-info">
              <div className="hp-user-avatar">SM</div>
              <div className="hp-user-details">
                <h4>Sarah Martin</h4>
                <p>Directrice de Résidence</p>
              </div>
            </div>
            <p className="hp-testimonial-text">
              "L'interface est la plus belle du marché. C'est un plaisir de l'utiliser au quotidien. L'équipe support est géniale."
            </p>
          </motion.div>
          
          <motion.div className="hp-testimonial-card" {...fadeInUp} transition={{ delay: 0.2 }}>
            <div className="hp-user-info">
              <div className="hp-user-avatar">RB</div>
              <div className="hp-user-details">
                <h4>Robert Bernard</h4>
                <p>Fondateur de Conciergerie</p>
              </div>
            </div>
            <p className="hp-testimonial-text">
              "Hova nous a permis de scaler notre conciergerie sans recruter massivement. L'automatisation fait tout le travail."
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="td-footer">
        <div className="td-footer-top">
          <div className="td-footer-brand">
            <div className="td-logo">
              <div className="td-logo-icon">H</div>
              <span style={{ color: 'white' }}>Hova</span>
            </div>
            <p>Le futur du Property Management. Simple, puissant et automatisé.</p>
          </div>
          <div className="link-col">
            <h4>Produit</h4>
            <a href="#how-it-works">Fonctionnement</a>
            <a href="#features">Fonctionnalités</a>
            <a href="#pricing">Tarifs</a>
            <a href="#">Security</a>
          </div>
          <div className="link-col">
            <h4>Ressources</h4>
            <a href="#">Guides</a>
            <a href="#">API Docs</a>
            <a href="#">Blog</a>
            <a href="#">Communauté</a>
          </div>
          <div className="link-col">
            <h4>Légal</h4>
            <a href="#">Confidentialité</a>
            <a href="#">Mentions</a>
            <a href="#">Cookies</a>
          </div>
        </div>
        <div className="td-footer-bottom">
          <p>&copy; 2026 Hova. Tous droits réservés.</p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Twitter</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>LinkedIn</a>
            <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Instagram</a>
          </div>
        </div>
      </footer>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <AuthPage onLogin={onLogin} onClose={handleCloseAuth} />
      )}
    </div>
  );
};

export default LandingPage;
