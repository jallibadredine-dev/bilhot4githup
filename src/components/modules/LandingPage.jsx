import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Star, Users, ShieldCheck,
  Zap, Globe, MessageSquare, Lock, Smartphone,
  BarChart3, ChevronRight, Bot, Calendar
} from 'lucide-react';
import AuthPage from './AuthPage';
import PricingSimulator from './PricingSimulator';
import heroImg from '../../assets/hero.png';
import lockBannerImg from '../../assets/lock-banner.png';
import './LandingPage.css';

const LandingPage = ({ onLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleOpenAuth = () => setShowAuthModal(true);
  const handleCloseAuth = () => setShowAuthModal(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.55, ease: 'easeOut' }
  };

  const features = [
    {
      icon: <BarChart3 size={22} />,
      title: 'PMS Tout-en-Un',
      desc: 'Réservations, calendrier, facturation et rapports dans une seule interface.',
    },
    {
      icon: <Zap size={22} />,
      title: 'Automatisations Intelligentes',
      desc: "Déclenchez des actions automatiques sur chaque événement de séjour.",
    },
    {
      icon: <Bot size={22} />,
      title: 'IA Conciergerie',
      desc: 'Répondez aux clients, gérez les demandes et optimisez vos tarifs avec l\'IA.',
    },
  ];

  const cards = [
    {
      icon: <Smartphone size={20} />,
      title: 'Application mobile native',
      desc: 'Gérez check-ins, serrures et messages depuis votre smartphone, partout.',
      img: heroImg,
    },
    {
      icon: <Lock size={20} />,
      title: 'Accès IoT sans clé',
      desc: 'Codes d\'accès automatiques synchronisés avec les dates de séjour.',
      img: lockBannerImg,
    },
    {
      icon: <MessageSquare size={20} />,
      title: 'Inbox omnicanale',
      desc: 'Airbnb, Booking, WhatsApp et SMS centralisés dans un seul fil.',
      img: heroImg,
    },
  ];

  return (
    <div className="lp-wrapper">

      {/* ── Navbar ── */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <span className="lp-logo">
            <span className="lp-logo-blue">Bil</span>Hot
          </span>
          <div className="lp-nav-links hide-mobile">
            <a href="#features">Fonctionnalités</a>
            <a href="#how-it-works">Fonctionnement</a>
            <a href="#pricing">Tarifs</a>
            <a href="#testimonials">Avis</a>
          </div>
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost hide-mobile" onClick={handleOpenAuth}>Connexion</button>
            <button className="lp-btn-dark" onClick={handleOpenAuth}>
              Mon compte <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <motion.div className="lp-hero-content" {...fadeUp}>
          <div className="lp-hero-badge">
            <span className="lp-badge-dot" />
            Un PMS. Une IA. Zéro friction.
          </div>

          <h1 className="lp-hero-h1">
            Une app pour <span className="lp-highlight">gérer</span>,{' '}
            <span className="lp-highlight">automatiser</span>,<br />
            et développer votre activité
          </h1>

          <p className="lp-hero-sub">
            Connectez vos canaux, gérez vos serrures et fidélisez vos clients avec
            une suite complète propulsée par <strong>l'Intelligence Artificielle</strong>.
          </p>

          <div className="lp-hero-ctas">
            <button className="lp-btn-primary-lg" onClick={handleOpenAuth}>
              Commencer gratuitement <ArrowRight size={17} />
            </button>
            <button className="lp-btn-outline-lg" onClick={handleOpenAuth}>
              Voir une démo
            </button>
          </div>
          <p className="lp-hero-note">
            <Check size={13} /> Pas de carte de crédit · Annulation à tout moment
          </p>
        </motion.div>

        {/* Product screenshot */}
        <motion.div
          className="lp-hero-mockup"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="lp-mockup-browser">
            <div className="lp-browser-bar">
              <span className="lp-browser-dot red" />
              <span className="lp-browser-dot yellow" />
              <span className="lp-browser-dot green" />
              <span className="lp-browser-url">app.bilhot.com</span>
            </div>
            <img src={heroImg} alt="BilHot Dashboard" className="lp-mockup-img" />
          </div>
          <div className="lp-forbes-badge">
            <strong>Forbes</strong>
            <span>"L'Outil Essentiel pour l'Hôtellerie Moderne"</span>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div className="lp-stats-bar" {...fadeUp} transition={{ delay: 0.3 }}>
          <div className="lp-stat">
            <span className="lp-stat-val">99.9%</span>
            <span className="lp-stat-lbl">Uptime garanti</span>
          </div>
          <div className="lp-stat-sep" />
          <div className="lp-stat">
            <span className="lp-stat-val">+2 500</span>
            <span className="lp-stat-lbl">Établissements</span>
          </div>
          <div className="lp-stat-sep" />
          <div className="lp-stat">
            <span className="lp-stat-val">150+</span>
            <span className="lp-stat-lbl">Intégrations</span>
          </div>
          <div className="lp-stat-sep" />
          <div className="lp-stat">
            <span className="lp-stat-val">24/7</span>
            <span className="lp-stat-lbl">Support expert</span>
          </div>
        </motion.div>
      </section>

      {/* ── Logo cloud ── */}
      <section className="lp-partners">
        <p className="lp-partners-label">Ils nous font confiance pour leur croissance</p>
        <div className="lp-partners-row">
          {['Airbnb', 'Booking.com', 'Expedia', 'TripAdvisor', 'Stripe', 'TTLock'].map(name => (
            <span key={name} className="lp-partner-name">{name}</span>
          ))}
        </div>
      </section>

      {/* ── Features split ── */}
      <section className="lp-features-split" id="features">
        <div className="lp-features-split-inner">
          <div className="lp-features-list">
            <p className="lp-section-eyebrow">Tout ce dont vous avez besoin</p>
            <h2 className="lp-section-h2">
              Conçu pour les <span className="lp-highlight">gestionnaires</span> modernes
            </h2>
            <div className="lp-feature-items">
              {features.map((f, i) => (
                <motion.div key={i} className="lp-feature-item" {...fadeUp} transition={{ delay: i * 0.1 }}>
                  <div className="lp-feature-icon">{f.icon}</div>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="lp-btn-primary-lg" onClick={handleOpenAuth} style={{ marginTop: '2rem' }}>
              Démarrer gratuitement <ArrowRight size={16} />
            </button>
          </div>

          <motion.div className="lp-features-screenshot" {...fadeUp} transition={{ delay: 0.2 }}>
            <img src={lockBannerImg} alt="BilHot App Screenshot" />
          </motion.div>
        </div>
      </section>

      {/* ── 3 Feature Cards ── */}
      <section className="lp-cards-section" id="how-it-works">
        <motion.div className="lp-section-center" {...fadeUp}>
          <p className="lp-section-eyebrow">Fonctionnalités clés</p>
          <h2 className="lp-section-h2">
            Tout ce qu'il faut pour <span className="lp-highlight">scaler</span>
          </h2>
        </motion.div>

        <div className="lp-cards-grid">
          {cards.map((card, i) => (
            <motion.div key={i} className="lp-card" {...fadeUp} transition={{ delay: i * 0.12 }}>
              <div className="lp-card-screenshot">
                <img src={card.img} alt={card.title} />
              </div>
              <div className="lp-card-body">
                <div className="lp-card-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="lp-pricing-section" id="pricing">
        <motion.div className="lp-section-center" {...fadeUp}>
          <p className="lp-section-eyebrow">Tarification</p>
          <h2 className="lp-section-h2">Payez selon votre taille, pas plus</h2>
          <p className="lp-section-desc">Pas de surprise. Pas de contrat. Annulez à tout moment.</p>
        </motion.div>
        <PricingSimulator onStart={handleOpenAuth} />
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-testimonials-section" id="testimonials">
        <motion.div className="lp-section-center" {...fadeUp}>
          <p className="lp-section-eyebrow">Témoignages</p>
          <h2 className="lp-section-h2">Ils adorent <span className="lp-highlight">BilHot</span></h2>
        </motion.div>

        <div className="lp-testimonials-grid">
          {[
            { initials: 'JD', name: 'Jean Dupont', role: 'Host à Paris (12 appts)', text: '"Le gain de temps est phénoménal. La synchronisation avec les serrures est un game changer total pour ma logistique."' },
            { initials: 'SM', name: 'Sarah Martin', role: 'Directrice de Résidence', text: '"L\'interface est la plus belle du marché. C\'est un plaisir de l\'utiliser au quotidien."' },
            { initials: 'RB', name: 'Robert Bernard', role: 'Fondateur de Conciergerie', text: '"BilHot nous a permis de scaler notre conciergerie sans recruter massivement. L\'automatisation fait tout."' },
          ].map((t, i) => (
            <motion.div key={i} className="lp-testimonial" {...fadeUp} transition={{ delay: i * 0.1 }}>
              <div className="lp-stars">{'★★★★★'}</div>
              <p className="lp-testimonial-text">{t.text}</p>
              <div className="lp-testimonial-author">
                <div className="lp-avatar">{t.initials}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-inner">
          <div className="lp-cta-text">
            <span className="lp-cta-eyebrow">Commencer aujourd'hui</span>
            <h2>Toute votre activité,<br />un seul login</h2>
            <p>Pas de carte de crédit. Pas de contrat.<br />Juste les outils pour gérer, automatiser et encaisser.</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
              <button className="lp-cta-btn" onClick={handleOpenAuth}>
                Commencer gratuitement <ArrowRight size={16} />
              </button>
            </div>
            <span className="lp-cta-note"><Check size={12} /> Pas de carte de crédit requise</span>
          </div>
          <div className="lp-cta-mockup">
            <img src={heroImg} alt="BilHot App" />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="lp-logo" style={{ fontSize: 20 }}>
              <span className="lp-logo-blue">Bil</span>Hot
            </span>
            <p>Le futur du Property Management.<br />Simple, puissant et automatisé.</p>
          </div>
          {[
            { title: 'Produit', links: ['Fonctionnement', 'Fonctionnalités', 'Tarifs', 'Sécurité'] },
            { title: 'Ressources', links: ['Guides', 'API Docs', 'Blog', 'Communauté'] },
            { title: 'Légal', links: ['Confidentialité', 'Mentions légales', 'Cookies'] },
          ].map(col => (
            <div key={col.title} className="lp-footer-col">
              <h4>{col.title}</h4>
              {col.links.map(l => <a key={l} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 BilHot. Tous droits réservés.</span>
          <div className="lp-footer-social">
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </footer>

      {showAuthModal && <AuthPage onLogin={onLogin} onClose={handleCloseAuth} />}
    </div>
  );
};

export default LandingPage;
