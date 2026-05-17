import React from 'react';
import { 
  Zap, Code, Shield, Globe, Lock, Activity, 
  ArrowRight, Terminal, Smartphone, Database,
  Share2, CheckCircle2, Server
} from 'lucide-react';
import { motion } from 'framer-motion';
import './APIDescription.css';

const APIDescription = ({ onModuleSelect }) => {
  const features = [
    {
      icon: <Code size={24} />,
      title: "Architecture RESTful & JSON",
      desc: "Une simplicité déconcertante. Intégrez nos endpoints en quelques minutes grâce à une structure JSON standardisée et prévisible."
    },
    {
      icon: <Shield size={24} />,
      title: "Multi-tenancy Native",
      desc: "Sécurité absolue. Vos données et celles de vos clients sont isolées physiquement au niveau de l'infrastructure pour une confidentialité totale."
    },
    {
      icon: <Share2 size={24} />,
      title: "Webhooks Temps Réel",
      desc: "Soyez notifié instantanément. Réagissez aux événements de réservation, check-in ou paiements dès qu'ils surviennent."
    },
    {
      icon: <Activity size={24} />,
      title: "Uptime de 99.9%",
      desc: "Une fiabilité de classe entreprise. Notre infrastructure auto-scalable garantit une disponibilité constante pour vos services critiques."
    }
  ];

  const useCases = [
    {
      icon: <Globe size={32} />,
      title: "Site Web Personnalisé",
      desc: "Connectez votre propre moteur de réservation et synchronisez les disponibilités en temps réel sans intermédiaire."
    },
    {
      icon: <Lock size={32} />,
      title: "Serrures Connectées",
      desc: "Automatisez la génération des codes d'accès IoT (TTLock, Sciener) dès qu'une réservation est confirmée."
    },
    {
      icon: <Database size={32} />,
      title: "Dashboard de Statistiques",
      desc: "Extrayez vos données brutes pour créer vos propres rapports BI ou intégrer votre comptabilité."
    }
  ];

  const quickStartCode = `// Récupérer la disponibilité d'une chambre
fetch('https://api.hosflow.com/v1/availability?property_id=prop_99', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'X-Tenant-ID': 'your_client_id'
  }
})
.then(response => response.json())
.then(data => console.log(data));`;

  return (
    <div className="api-desc-wrapper">
      {/* --- HERO SECTION --- */}
      <section className="api-hero">
        <div className="api-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="api-hero-content"
          >
            <div className="api-badge">API DEVELOPERS</div>
            <h1>L'API qui automatise votre <br /><span>gestion immobilière</span></h1>
            <p>
              Connectez, étendez et automatisez chaque aspect de votre établissement avec une API conçue pour la performance et la scalabilité.
            </p>
            <div className="api-hero-btns">
              <button className="api-btn-primary" onClick={() => onModuleSelect && onModuleSelect('api-integration')}>Obtenir une clé API <ArrowRight size={18} /></button>
              <button className="api-btn-secondary" onClick={() => onModuleSelect && onModuleSelect('api-docs')}>Explorer la Documentation</button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="api-hero-visual"
          >
            <div className="code-window">
              <div className="code-header">
                <div className="dots"><span></span><span></span><span></span></div>
                <div className="tab">availability.js</div>
              </div>
              <div className="code-body">
                <pre><code>{quickStartCode}</code></pre>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- VALUE PROP: ANTIGRAVITY --- */}
      <section className="api-antigravity">
        <div className="api-container">
          <div className="antigravity-card">
            <div className="antigravity-icon">
              <Zap size={40} fill="currentColor" />
            </div>
            <div className="antigravity-text">
              <h2>Powered by <span>Antigravity</span></h2>
              <p>
                Contrairement aux PMS classiques, HosFlow n'est pas une simple base de données. Notre moteur <strong>Antigravity</strong> gère intelligemment la logique complexe : conflits de dates, règles de prix dynamiques et taxes automatiques, garantissant une vitesse de calcul instantanée et une synchronisation parfaite.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="api-features">
        <div className="api-container">
          <div className="section-title">
            <h2>Conçue par des développeurs, <span>pour des développeurs</span></h2>
            <p>Tous les outils nécessaires pour bâtir des intégrations robustes et sécurisées.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-item" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- USE CASES --- */}
      <section className="api-use-cases">
        <div className="api-container">
          <div className="section-title">
            <h2>Possibilités <span>illimitées</span></h2>
            <p>Voici comment nos partenaires utilisent l'API HosFlow aujourd'hui.</p>
          </div>
          <div className="use-cases-grid">
            {useCases.map((u, i) => (
              <div className="use-case-card" key={i}>
                <div className="uc-icon">{u.icon}</div>
                <h3>{u.title}</h3>
                <p>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STRATEGIC ELEMENTS --- */}
      <section className="api-strategic">
        <div className="api-container">
          <div className="strategic-grid">
            <div className="strategic-item">
              <Lock size={32} className="text-indigo-600" />
              <h3>Sécurité SaaS-Ready</h3>
              <p>Authentification via OAuth2 ou clés API sécurisées avec limitation de débit (Rate Limiting) native pour protéger votre infrastructure.</p>
            </div>
            <div className="strategic-item">
              <Server size={32} className="text-indigo-600" />
              <h3>Scalabilité Sans Limites</h3>
              <p>Que vous gériez un studio indépendant ou une chaîne internationale de 500 hôtels, notre infrastructure cloud s'adapte à votre charge.</p>
            </div>
            <div className="strategic-item">
              <CheckCircle2 size={32} className="text-indigo-600" />
              <h3>Conformité Totale</h3>
              <p>Architecture conforme RGPD et SOC2, assurant que les données de vos clients sont traitées avec le plus haut niveau de rigueur.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- QUICK START SECTION --- */}
      <section className="api-quickstart">
        <div className="api-container">
          <div className="quickstart-box">
            <div className="qs-text">
              <h2>Prêt à commencer ?</h2>
              <p>Générez votre première clé API en quelques secondes et commencez à construire le futur de l'hospitalité.</p>
              <div className="qs-btns">
                <button className="api-btn-primary" onClick={() => onModuleSelect && onModuleSelect('api-integration')}>Générer une clé API</button>
                <button className="api-btn-outline" onClick={() => onModuleSelect && onModuleSelect('api-docs')}>Documentation Scalar</button>
              </div>
            </div>
            <div className="qs-terminal">
              <div className="terminal-header">
                <Terminal size={14} />
                <span>bash</span>
              </div>
              <div className="terminal-body">
                <code>$ curl -X GET "https://api.hosflow.com/v1/me" \</code>
                <code>  -H "Authorization: Bearer {`{YOUR_KEY}`} "</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <footer className="api-footer">
        <div className="api-container">
          <div className="footer-content">
            <div className="brand">
              <div className="logo">H</div>
              <span>HosFlow API</span>
            </div>
            <p>Propulsé par le moteur Antigravity. © 2026 HosFlow.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default APIDescription;
