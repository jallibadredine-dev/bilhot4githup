import React, { useState } from 'react';
import { Building2, Home, ArrowRight, Zap, Shield, Sparkles, Users, X } from 'lucide-react';
import { motion } from 'framer-motion';
import './AuthPage.css';

const AuthPage = ({ onLogin, onClose }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSelect = (mode) => {
    setIsLoggingIn(true);
    // Simulate network authentication delay
    setTimeout(() => {
      onLogin(mode);
    }, 800);
  };

  if (isLoggingIn) {
    return (
      <div className="auth-container loading-state">
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className="spinner-core"></div>
        </motion.div>
        <p className="loading-text">Authentification de votre espace de travail...</p>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {/* Blurred background anomalies */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      <header className="auth-header">
        <div className="logo-group">
          <div className="logo-icon-auth">H</div>
          <h2>Hova</h2>
        </div>
        {onClose && (
          <button className="auth-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={24} />
          </button>
        )}
      </header>

      <div className="auth-content">
        <motion.div 
          className="auth-hero"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Créez votre espace de travail</h1>
          <p>Choisissez le modèle opérationnel qui s'adapte parfaitement à votre portefeuille immobilier.</p>
        </motion.div>

        <div className="auth-cards-container" style={{ display: 'flex', justifyContent: 'center' }}>
          {/* Card 2: PRO */}
          <motion.div 
            className="auth-card pro-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            style={{ maxWidth: '450px' }}
          >
            <div className="card-top">
              <h3>PMS PRO <span className="tag-pro">ENTREPRISE</span></h3>
              <p className="card-desc">Bénéficiez d'avantages supplémentaires. Conçu pour les hôtels, complexes hôteliers et résidences avec personnel.</p>
            </div>
            
            <div className="card-features">
              <div className="feature">
                <div className="icon-wrap bg-gray-100"><Building2 size={16} className="text-gray-700"/></div>
                <span>Hub de Services F&B & POS</span>
              </div>
              <div className="feature">
                <div className="icon-wrap bg-green-100"><Users size={16} className="text-green-600"/></div>
                <span>RH, Personnel & Accès Sécurisés</span>
              </div>
              <div className="feature">
                <div className="icon-wrap bg-gold-100"><Shield size={16} className="text-gold-600"/></div>
                <span>Moteur de Facturation Avancé</span>
              </div>
            </div>

            <button className="btn-select pro-btn" onClick={() => handleSelect('pro')}>
               Inscription Professionnelle <ArrowRight size={16}/>
            </button>

            <button className="btn-google" onClick={() => handleSelect('pro')}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707a5.41 5.41 0 0 1 0-3.414V4.961H.957a8.992 8.992 0 0 0 0 8.078l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 3.166 6.656 3.58 9 3.58z"/>
              </svg>
              Continuer avec Google
            </button>
          </motion.div>
        </div>

        <motion.div 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Vous avez déjà un compte ? <span className="auth-link" onClick={() => handleSelect('pro')}>Connexion</span>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
