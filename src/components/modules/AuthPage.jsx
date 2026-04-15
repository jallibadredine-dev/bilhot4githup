import React, { useState } from 'react';
import { Building2, Home, ArrowRight, Zap, Shield, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import './AuthPage.css';

const AuthPage = ({ onLogin }) => {
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
        <p className="loading-text">Authenticating your workspace...</p>
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
          <h2>Antigravity</h2>
        </div>
      </header>

      <div className="auth-content">
        <motion.div 
          className="auth-hero"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Create your workspace</h1>
          <p>Choose the operating model that perfectly fits your property portfolio.</p>
        </motion.div>

        <div className="auth-cards-container">
          {/* Card 1: HOT */}
          <motion.div 
            className="auth-card hot-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="card-top">
              <h3>PMS HOT <span className="tag-free">AUTOMATED</span></h3>
              <p className="card-desc">Skip the hassle. Perfect for independent hosts, villas, and luxury apartments.</p>
            </div>
            
            <div className="card-features">
              <div className="feature">
                <div className="icon-wrap bg-blue-100"><Home size={16} className="text-blue-600"/></div>
                <span>Multi-Channel Airbnb Sync</span>
              </div>
              <div className="feature">
                <div className="icon-wrap bg-purple-100"><Zap size={16} className="text-purple-600"/></div>
                <span>Self Check-in & Smart Locks</span>
              </div>
              <div className="feature">
                <div className="icon-wrap bg-orange-100"><Sparkles size={16} className="text-orange-600"/></div>
                <span>AI Workflow Automation</span>
              </div>
            </div>

            <button className="btn-select hot-btn" onClick={() => handleSelect('hot')}>
              Continue as Automated <ArrowRight size={16}/>
            </button>
          </motion.div>

          <div className="auth-separator">OR</div>

          {/* Card 2: PRO */}
          <motion.div 
            className="auth-card pro-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="card-top">
              <h3>PMS PRO <span className="tag-pro">ENTERPRISE</span></h3>
              <p className="card-desc">Get added benefits. Designed for fully-staffed hotels, resorts, and residences.</p>
            </div>
            
            <div className="card-features">
              <div className="feature">
                <div className="icon-wrap bg-gray-100"><Building2 size={16} className="text-gray-700"/></div>
                <span>F&B Services Hub & POS</span>
              </div>
              <div className="feature">
                <div className="icon-wrap bg-green-100"><Users size={16} className="text-green-600"/></div>
                <span>HR, Staff & Security Access</span>
              </div>
              <div className="feature">
                <div className="icon-wrap bg-gold-100"><Shield size={16} className="text-gold-600"/></div>
                <span>Advanced Billing Engine</span>
              </div>
            </div>

            <button className="btn-select pro-btn" onClick={() => handleSelect('pro')}>
               Sign up for Professional <ArrowRight size={16}/>
            </button>
          </motion.div>
        </div>

        <motion.div 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Already have an account? <span className="auth-link" onClick={() => handleSelect('pro')}>Log in</span>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
