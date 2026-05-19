import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Check, Star, ChevronDown, ChevronUp,
  Zap, Globe, MessageSquare, Lock, Smartphone,
  BarChart3, Bot, Calendar, Shield, Clock,
  Users, TrendingUp, Menu, X, Building2,
  CheckCircle2, AlertCircle, Wifi, Key
} from 'lucide-react';
import AuthPage from './AuthPage';
import PricingSimulator from './PricingSimulator';
import heroImg from '../../assets/hero.png';
import lockBannerImg from '../../assets/lock-banner.png';
import './LandingPage.css';

const LandingPage = ({ onLogin }) => {
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [planType, setPlanType] = useState('standard');
  const [openFaq, setOpenFaq] = useState(null);

  const handleOpenAuth = () => setShowAuthModal(true);
  const handleCloseAuth = () => setShowAuthModal(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.55, ease: 'easeOut' }
  };

  const faqs = [
    {
      q: "Comment fonctionne BilHot ?",
      a: "BilHot centralise toutes vos opérations hôtelières : connectez vos canaux de distribution (Airbnb, Booking.com, Expedia), gérez vos réservations, automatisez les communications clients et contrôlez vos serrures connectées depuis une seule interface."
    },
    {
      q: "Mes données sont-elles en sécurité ?",
      a: "Absolument. BilHot utilise Supabase avec chiffrement bout-en-bout, authentification multi-facteurs et hébergement sur des serveurs européens certifiés ISO 27001. Vos données clients et vos tokens d'accès ne quittent jamais notre infrastructure sécurisée."
    },
    {
      q: "Combien de temps pour démarrer ?",
      a: "La plupart de nos clients sont opérationnels en moins de 30 minutes. Il suffit de connecter vos canaux, importer vos propriétés et configurer vos automatisations. Notre équipe support vous accompagne à chaque étape."
    },
    {
      q: "Quels canaux sont supportés ?",
      a: "BilHot se connecte nativement à Airbnb, Booking.com, Expedia, TripAdvisor, VRBO et plus de 150 autres plateformes via notre intégration Channex. Les disponibilités et tarifs se synchronisent en temps réel."
    },
    {
      q: "Puis-je annuler à tout moment ?",
      a: "Oui, sans frais ni pénalité. Vous pouvez annuler votre abonnement à tout moment depuis votre espace client. Vos données restent exportables pendant 30 jours après résiliation."
    },
    {
      q: "Comment fonctionne l'intégration des serrures connectées ?",
      a: "BilHot s'intègre avec TTLock et d'autres systèmes IoT. Les codes d'accès sont générés automatiquement à chaque nouvelle réservation et révoqués à la date de départ — aucune intervention manuelle requise."
    },
  ];

  const steps = [
    { icon: <Building2 size={22} />, label: "Ajout des propriétés", time: "5 min", desc: "Importez vos établissements et configurez vos chambres" },
    { icon: <Globe size={22} />, label: "Connexion des canaux", time: "10 min", desc: "Synchronisez Airbnb, Booking.com et vos autres plateformes" },
    { icon: <Zap size={22} />, label: "Configuration IA", time: "5 min", desc: "Paramétrez vos automatisations et messages automatiques" },
    { icon: <CheckCircle2 size={22} />, label: "Opérationnel !", time: "0 min", desc: "Votre PMS est prêt à gérer vos réservations en temps réel" },
  ];

  const features = [
    {
      icon: <BarChart3 size={20} />,
      title: "Tableau de bord unifié",
      desc: "Toutes vos réservations, revenus et taux d'occupation en un seul coup d'œil. Rapports automatiques par propriété.",
      img: heroImg,
    },
    {
      icon: <MessageSquare size={20} />,
      title: "Inbox omnicanale",
      desc: "Airbnb, Booking.com, WhatsApp et SMS centralisés dans un seul fil de conversation. Réponses automatiques par IA.",
      img: heroImg,
    },
    {
      icon: <Lock size={20} />,
      title: "Serrures IoT sans clé",
      desc: "Codes d'accès générés et révoqués automatiquement selon les dates de séjour. Compatible TTLock et 50+ marques.",
      img: lockBannerImg,
    },
  ];

  const testimonials = [
    { initials: 'JD', name: 'Jean Dupont', role: 'Host à Paris · 12 appartements', text: '"Le gain de temps est phénoménal. La synchronisation avec les serrures est un game changer total pour ma logistique. Je gère tout depuis mon téléphone."', rating: 5 },
    { initials: 'SM', name: 'Sarah Martin', role: 'Directrice de Résidence · Marrakech', text: '"L\'interface est la plus belle du marché. L\'IA répond aux clients en arabe, français et anglais automatiquement. C\'est un plaisir à utiliser."', rating: 5 },
    { initials: 'RB', name: 'Robert Bernard', role: 'Fondateur · Conciergerie Premium', text: '"BilHot nous a permis de scaler de 8 à 45 appartements sans recruter. L\'automatisation gère les check-ins, les codes et les messages."', rating: 5 },
    { initials: 'AL', name: 'Amina Lahlou', role: 'Gérante · Riad Fès', text: '"La connexion avec Booking.com et Airbnb se fait en 10 minutes. Plus jamais de double réservation. Je recommande à 100%."', rating: 5 },
    { initials: 'MC', name: 'Marc Chabert', role: 'Investisseur immobilier · Lyon', text: '"Les rapports automatiques me font gagner 6 heures par semaine. Je vois mes revenus en temps réel sur l\'app mobile."', rating: 5 },
    { initials: 'FO', name: 'Fatima Ouali', role: 'Responsable · Villa & Suites Agadir', text: '"Le support est exceptionnel. En 24h nous étions complètement opérationnels. BilHot a transformé notre façon de travailler."', rating: 5 },
  ];

  const privacyCards = [
    {
      icon: <CheckCircle2 size={28} />,
      title: "Satisfait ou remboursé",
      desc: "100% remboursé si vous n'êtes pas satisfait dans les 14 premiers jours. Sans question.",
    },
    {
      icon: <Shield size={28} />,
      title: "Vos données vous appartiennent",
      desc: "Vous restez propriétaire de toutes vos données. Export complet disponible à tout moment.",
    },
    {
      icon: <Clock size={28} />,
      title: "Hébergement européen",
      desc: "Données stockées sur des serveurs en Europe, conformes RGPD. Suppression garantie à la résiliation.",
    },
  ];

  return (
    <div className="lp-wrapper">

      {/* ══════════════════════════════════
          1. TOP BAR
      ══════════════════════════════════ */}
      <div className="lp-topbar">
        <div className="lp-topbar-inner">
          <div className="lp-topbar-left">
            <span className="lp-tp-stars">{'★★★★★'}</span>
            <span className="lp-tp-text">Noté 4.9 / 5 avec +2 500 avis</span>
          </div>
          <div className="lp-topbar-links">
            <a href="#faq">FAQ</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
            <a href="#">API</a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          2. HEADER
      ══════════════════════════════════ */}
      <header className={`lp-header ${scrolled ? 'lp-header-scrolled' : ''}`}>
        <div className="lp-header-inner">
          <div className="lp-header-left">
            <a href="#" className="lp-logo">
              <span className="lp-logo-accent">Bil</span>Hot
            </a>
            <nav className="lp-header-nav hide-mobile">
              <a href="#examples">Exemples</a>
              <a href="#how-it-works">Fonctionnement</a>
              <a href="#features">Fonctionnalités</a>
              <a href="#pricing">Tarifs</a>
              <a href="#faq">FAQ</a>
            </nav>
          </div>
          <div className="lp-header-right">
            <button className="lp-nav-link hide-mobile" onClick={handleOpenAuth}>Connexion</button>
            <button className="lp-btn-header-cta" onClick={handleOpenAuth}>
              Démarrer gratuitement
            </button>
            <button className="lp-mobile-toggle show-mobile" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lp-mobile-menu">
            <a href="#examples" onClick={() => setMobileMenuOpen(false)}>Exemples</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Fonctionnement</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <button className="lp-btn-header-cta" style={{ marginTop: '0.5rem' }} onClick={handleOpenAuth}>Démarrer gratuitement</button>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════
          3. HERO
      ══════════════════════════════════ */}
      <section className="lp-hero">
        {/* Plan toggle */}
        <div className="lp-hero-toggle">
          <button className={planType === 'standard' ? 'active' : ''} onClick={() => setPlanType('standard')}>Hôtels & Résidences</button>
          <button className={planType === 'corporate' ? 'active' : ''} onClick={() => setPlanType('corporate')}>Conciergeries & Groupes</button>
        </div>

        <motion.div className="lp-hero-content" {...fadeUp}>
          <p className="lp-hero-eyebrow">Logiciel de gestion hôtelière propulsé par l'IA</p>
          <h1 className="lp-hero-h1">
            Le PMS <span className="lp-highlight">N°1</span> pour gérer,<br />
            automatiser et développer<br />
            votre activité hôtelière
          </h1>
          <p className="lp-hero-sub">
            Gérez vos réservations, synchronisez vos canaux et automatisez vos opérations en quelques minutes avec notre PMS alimenté par l'IA. Connectez vos propriétés et recevez vos premières réservations synchronisées. <strong>Il suffit d'un compte.</strong>
          </p>

          <button className="lp-btn-hero-cta" onClick={handleOpenAuth}>
            Commencer gratuitement <ArrowRight size={18} />
          </button>

          {/* Trust checklist */}
          <div className="lp-hero-checklist">
            {[
              "Satisfait ou remboursé 14 jours",
              "Synchronisation en temps réel",
              "Facture entreprise disponible",
              "Réductions jusqu'à 40% pour les groupes",
            ].map((item, i) => (
              <span key={i} className="lp-check-item">
                <Check size={14} /> {item}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Scrolling dashboard showcase */}
        <div className="lp-hero-gallery">
          <div className="lp-gallery-track">
            {[heroImg, lockBannerImg, heroImg, lockBannerImg, heroImg, lockBannerImg, heroImg, lockBannerImg].map((img, i) => (
              <div key={i} className="lp-gallery-item">
                <img src={img} alt={`BilHot dashboard view ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Stats trust bar */}
        <motion.div className="lp-trust-bar" {...fadeUp} transition={{ delay: 0.3 }}>
          <div className="lp-trust-rating">
            <span className="lp-trust-stars">{'★★★★★'}</span>
            <span className="lp-trust-label">Noté 4.9 / 5 avec +2 500 avis</span>
          </div>
          <div className="lp-trust-sep" />
          <div className="lp-stat"><span className="lp-stat-val">+2 500</span><span className="lp-stat-lbl">Établissements</span></div>
          <div className="lp-trust-sep" />
          <div className="lp-stat"><span className="lp-stat-val">150+</span><span className="lp-stat-lbl">Intégrations</span></div>
          <div className="lp-trust-sep" />
          <div className="lp-stat"><span className="lp-stat-val">99.9%</span><span className="lp-stat-lbl">Uptime</span></div>
          <div className="lp-trust-sep" />
          <div className="lp-stat"><span className="lp-stat-val">24/7</span><span className="lp-stat-lbl">Support</span></div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════
          4. PRICING SIMULATOR (original)
      ══════════════════════════════════ */}
      <section className="lp-pricing-section lp-pricing-section-top" id="pricing">
        <motion.div className="lp-section-center" {...fadeUp}>
          <p className="lp-section-eyebrow">Tarification</p>
          <h2 className="lp-section-h2">
            Un PMS professionnel<br />pour 8× moins cher qu'un système traditionnel
          </h2>
          <p className="lp-section-desc">
            Le coût moyen d'un PMS classique dépasse 5 000 MAD/mois en licence + maintenance.
            BilHot commence à <strong>35 MAD / chambre / mois</strong>.
          </p>
        </motion.div>
        <PricingSimulator onStart={handleOpenAuth} />
      </section>

      {/* ══════════════════════════════════
          5. EXAMPLES / REVIEWS
      ══════════════════════════════════ */}
      <section className="lp-examples-section" id="examples">
        <motion.div className="lp-section-center" {...fadeUp}>
          <p className="lp-section-eyebrow">Avis & Exemples</p>
          <h2 className="lp-section-h2">
            +847 000 réservations gérées<br />pour +2 500 établissements heureux
          </h2>
          <p className="lp-section-desc">Rejoignez des centaines de gestionnaires qui ont transformé leur activité avec BilHot.</p>
        </motion.div>

        {/* Review cards + case studies */}
        <div className="lp-examples-grid">
          {[
            {
              tag: "Cas client",
              title: "Comment une conciergerie de Marrakech a géré 40 riads depuis un seul tableau de bord",
              desc: "Découvrez comment Conciergerie Atlas a réduit son temps de gestion de 70% en connectant tous ses canaux sur BilHot.",
              stat: "–70% de temps admin"
            },
            {
              tag: "Cas client",
              title: "Pourquoi ce groupe hôtelier a choisi BilHot après avoir testé 4 autres PMS",
              desc: "Lira Hôtels gère désormais 12 établissements à travers le Maroc avec une seule interface et zéro double réservation.",
              stat: "0 double réservation"
            },
            {
              tag: "Intégration API",
              title: "Comment une agence immobilière a construit son PMS sur mesure avec l'API BilHot",
              desc: "Grâce à notre API RESTful, Agence Prestige a intégré BilHot dans son ERP existant en moins d'une semaine.",
              stat: "< 1 semaine d'intégration"
            },
          ].map((c, i) => (
            <motion.div key={i} className="lp-example-card" {...fadeUp} transition={{ delay: i * 0.1 }}>
              <span className="lp-example-tag">{c.tag}</span>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <div className="lp-example-stat">{c.stat}</div>
              <button className="lp-example-link" onClick={handleOpenAuth}>Lire le cas client <ArrowRight size={14} /></button>
            </motion.div>
          ))}
        </div>

        <div className="lp-examples-ctas">
          <button className="lp-btn-outline-md" onClick={handleOpenAuth}>Voir tous les avis et exemples</button>
          <button className="lp-btn-primary-md" onClick={handleOpenAuth}>Commencer gratuitement <ArrowRight size={15} /></button>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. HOW IT WORKS
      ══════════════════════════════════ */}
      <section className="lp-how-section" id="how-it-works">
        <motion.div className="lp-section-center" {...fadeUp}>
          <p className="lp-section-eyebrow">Fonctionnement</p>
          <h2 className="lp-section-h2">Comment démarrer avec BilHot en 20 minutes</h2>
          <p className="lp-section-desc">Économisez des heures de configuration grâce à notre onboarding guidé par IA.</p>
        </motion.div>

        {/* Comparison: BilHot vs ancien PMS */}
        <div className="lp-how-comparison">
          <div className="lp-how-col lp-how-bilhot">
            <div className="lp-how-col-header">
              <span className="lp-how-badge good">Avec BilHot</span>
              <span className="lp-how-total">~20 min</span>
            </div>
            {steps.map((s, i) => (
              <motion.div key={i} className="lp-how-step" {...fadeUp} transition={{ delay: i * 0.1 }}>
                <div className="lp-how-step-icon">{s.icon}</div>
                <div className="lp-how-step-body">
                  <strong>{s.label}</strong>
                  <span>{s.desc}</span>
                </div>
                <span className="lp-how-step-time">{s.time}</span>
              </motion.div>
            ))}
          </div>

          <div className="lp-how-vs">
            <span>vs</span>
          </div>

          <div className="lp-how-col lp-how-old">
            <div className="lp-how-col-header">
              <span className="lp-how-badge bad">Ancien PMS traditionnel</span>
              <span className="lp-how-total lp-how-total-bad">Semaines</span>
            </div>
            {[
              { icon: <AlertCircle size={22} />, label: "Formation obligatoire", desc: "2 à 5 jours de formation sur site" },
              { icon: <AlertCircle size={22} />, label: "Installation serveur", desc: "Infrastructure dédiée et coûteuse" },
              { icon: <AlertCircle size={22} />, label: "Intégrations manuelles", desc: "Semaines de développement custom" },
              { icon: <AlertCircle size={22} />, label: "Support lent", desc: "Tickets ouvert, délais de 48-72h" },
            ].map((s, i) => (
              <div key={i} className="lp-how-step lp-how-step-bad">
                <div className="lp-how-step-icon lp-how-icon-bad">{s.icon}</div>
                <div className="lp-how-step-body">
                  <strong>{s.label}</strong>
                  <span>{s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-section-cta">
          <button className="lp-btn-primary-lg" onClick={handleOpenAuth}>
            Démarrer BilHot en 20 minutes <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════
          6. FEATURES
      ══════════════════════════════════ */}
      <section className="lp-features-section" id="features">
        <motion.div className="lp-section-center" {...fadeUp}>
          <p className="lp-section-eyebrow">Fonctionnalités</p>
          <h2 className="lp-section-h2">Tout ce dont vous avez besoin,<br />dans une seule interface</h2>
        </motion.div>

        {features.map((f, i) => (
          <motion.div key={i} className={`lp-feature-row ${i % 2 === 1 ? 'lp-feature-row-reverse' : ''}`} {...fadeUp} transition={{ delay: 0.1 }}>
            <div className="lp-feature-row-text">
              <div className="lp-feature-row-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <button className="lp-feature-row-link" onClick={handleOpenAuth}>
                Explorer cette fonctionnalité <ArrowRight size={14} />
              </button>
            </div>
            <div className="lp-feature-row-visual">
              <img src={f.img} alt={f.title} />
            </div>
          </motion.div>
        ))}

        {/* Extra features grid */}
        <div className="lp-extra-features">
          {[
            { icon: <Smartphone size={20} />, title: "App mobile native", desc: "Gérez tout depuis iOS et Android" },
            { icon: <Wifi size={20} />, title: "Synchronisation temps réel", desc: "Disponibilités mises à jour instantanément" },
            { icon: <Key size={20} />, title: "Codes d'accès IoT", desc: "Serrures TTLock synchronisées auto" },
            { icon: <TrendingUp size={20} />, title: "Revenus optimisés", desc: "Tarification dynamique par IA" },
            { icon: <Bot size={20} />, title: "IA Conciergerie", desc: "Réponses automatiques multilingues" },
            { icon: <Users size={20} />, title: "Multi-utilisateurs", desc: "Rôles et permissions par propriété" },
          ].map((f, i) => (
            <motion.div key={i} className="lp-extra-card" {...fadeUp} transition={{ delay: i * 0.07 }}>
              <div className="lp-extra-icon">{f.icon}</div>
              <strong>{f.title}</strong>
              <span>{f.desc}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          8. FAQ
      ══════════════════════════════════ */}
      <section className="lp-faq-section" id="faq">
        <motion.div className="lp-section-center" {...fadeUp}>
          <p className="lp-section-eyebrow">FAQ</p>
          <h2 className="lp-section-h2">Questions fréquentes</h2>
          <p className="lp-faq-ownership">
            👑 Vous gardez le contrôle total de vos données et de vos propriétés
          </p>
        </motion.div>

        <div className="lp-faq-list">
          {faqs.map((faq, i) => (
            <motion.div key={i} className={`lp-faq-item ${openFaq === i ? 'open' : ''}`} {...fadeUp} transition={{ delay: i * 0.05 }}>
              <button className="lp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    className="lp-faq-a"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          9. TESTIMONIALS
      ══════════════════════════════════ */}
      <section className="lp-reviews-section">
        <motion.div className="lp-section-center" {...fadeUp}>
          <p className="lp-section-eyebrow">Témoignages clients</p>
          <h2 className="lp-section-h2">Ils adorent BilHot</h2>
          <div className="lp-reviews-meta">
            <span className="lp-reviews-stars">{'★★★★★'}</span>
            <span>4.9 / 5 · Plus de 2 500 avis</span>
          </div>
        </motion.div>

        <div className="lp-reviews-grid">
          {testimonials.map((t, i) => (
            <motion.div key={i} className="lp-review-card" {...fadeUp} transition={{ delay: i * 0.08 }}>
              <div className="lp-review-stars">{'★'.repeat(t.rating)}</div>
              <p className="lp-review-text">{t.text}</p>
              <div className="lp-review-author">
                <div className="lp-review-avatar">{t.initials}</div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          10. PRIVACY + FINAL CTA
      ══════════════════════════════════ */}
      <section className="lp-cta-section" id="cta">
        <motion.div className="lp-cta-top" {...fadeUp}>
          <p className="lp-cta-origin">🇲🇦 Conçu pour le marché africain. Nous respectons votre vie privée.</p>
          <h2>Un PMS professionnel<br />qui respecte vos données</h2>
        </motion.div>

        <div className="lp-privacy-cards">
          {privacyCards.map((c, i) => (
            <motion.div key={i} className="lp-privacy-card" {...fadeUp} transition={{ delay: i * 0.1 }}>
              <div className="lp-privacy-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="lp-cta-final">
          <button className="lp-btn-cta-final" onClick={handleOpenAuth}>
            Choisir votre formule BilHot <ArrowRight size={18} />
          </button>
          <span className="lp-cta-final-note"><Check size={13} /> Pas de carte de crédit requise · Annulation à tout moment</span>
        </div>
      </section>

      {/* ══════════════════════════════════
          11. FOOTER
      ══════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="lp-footer-logo"><span className="lp-logo-accent">Bil</span>Hot</span>
            <p>Le futur du Property Management.<br />Simple, puissant et automatisé.</p>
            <div className="lp-footer-trust">
              <span>{'★★★★★'}</span>
              <span>4.9/5 · +2 500 avis</span>
            </div>
          </div>
          {[
            { title: 'Produit', links: ['Fonctionnement', 'Fonctionnalités', 'Tarifs', 'Sécurité', 'API'] },
            { title: 'Comparer', links: ['vs Beds24', 'vs Lodgify', 'vs Guesty', 'vs Hostaway'] },
            { title: 'Ressources', links: ['Guides', 'Blog', 'Communauté', 'Helpdesk'] },
            { title: 'Légal', links: ['Confidentialité', 'Mentions légales', 'Cookies', 'RGPD'] },
          ].map(col => (
            <div key={col.title} className="lp-footer-col">
              <h4>{col.title}</h4>
              {col.links.map(l => <a key={l} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="lp-footer-bottom">
          <span>© 2021 – 2026 BilHot · Tous droits réservés.</span>
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
