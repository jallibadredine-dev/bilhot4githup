import React, { useState } from 'react';
import { ArrowRight, X, Eye, EyeOff, User, Mail, Lock, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import './AuthPage.css';

const AuthPage = ({ onLogin, onClose }) => {
  const [mode, setMode] = useState('register');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState(null);

  const validate = () => {
    const e = {};
    if (mode === 'register' && !form.name.trim()) e.name = 'Nom requis';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Email invalide';
    if (form.password.length < 6) e.password = 'Minimum 6 caractères';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { full_name: form.name }
          }
        });
        if (error) throw error;
        onLogin('pro');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });
        if (error) throw error;
        onLogin('pro');
      }
    } catch (err) {
      setIsLoading(false);
      if (err.message?.includes('already registered') || err.message?.includes('User already registered')) {
        setAuthError('Ce compte existe déjà. Utilisez l\'onglet Connexion.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setAuthError('Email ou mot de passe incorrect.');
      } else if (err.message?.includes('Email not confirmed')) {
        setAuthError('Vérifiez votre email pour confirmer votre compte.');
      } else {
        setAuthError(err.message || 'Une erreur est survenue. Réessayez.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      setIsLoading(false);
      setAuthError('Connexion Google impossible. Réessayez.');
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    if (authError) setAuthError(null);
  };

  if (isLoading) {
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
        <p className="loading-text">
          {mode === 'register' ? 'Création de votre espace...' : 'Connexion en cours...'}
        </p>
      </div>
    );
  }

  return (
    <div className="auth-container">
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
          className="auth-form-card"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setErrors({}); setAuthError(null); }}
            >
              Inscription
            </button>
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setErrors({}); setAuthError(null); }}
            >
              Connexion
            </button>
            <div className={`auth-tab-slider ${mode === 'login' ? 'right' : ''}`} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="auth-form-header">
                <h1>{mode === 'register' ? 'Créer votre compte' : 'Bon retour 👋'}</h1>
                <p>
                  {mode === 'register'
                    ? 'Démarrez gratuitement, sans carte bancaire.'
                    : 'Connectez-vous à votre espace Hova.'}
                </p>
              </div>

              {authError && (
                <motion.div
                  className="auth-error-banner"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={15} />
                  <span>{authError}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                {mode === 'register' && (
                  <div className={`auth-field ${errors.name ? 'has-error' : ''}`}>
                    <label>Nom complet</label>
                    <div className="auth-input-wrap">
                      <User size={16} className="field-icon" />
                      <input
                        type="text"
                        placeholder="Marie Dupont"
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                    {errors.name && <span className="field-error">{errors.name}</span>}
                  </div>
                )}

                <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
                  <label>Adresse e-mail</label>
                  <div className="auth-input-wrap">
                    <Mail size={16} className="field-icon" />
                    <input
                      type="email"
                      placeholder="marie@hotel.com"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
                  <label>Mot de passe</label>
                  <div className="auth-input-wrap">
                    <Lock size={16} className="field-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => handleChange('password', e.target.value)}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(v => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <button type="submit" className="auth-submit-btn">
                  {mode === 'register' ? (
                    <><Check size={16} /> Créer mon compte gratuit</>
                  ) : (
                    <>Se connecter <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="auth-divider"><span>ou</span></div>

              <button className="btn-google" onClick={handleGoogleLogin} type="button">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707a5.41 5.41 0 0 1 0-3.414V4.961H.957a8.992 8.992 0 0 0 0 8.078l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 3.166 6.656 3.58 9 3.58z"/>
                </svg>
                Continuer avec Google
              </button>

              {mode === 'register' && (
                <p className="auth-legal">
                  En vous inscrivant, vous acceptez nos{' '}
                  <span className="auth-link">Conditions d'utilisation</span> et notre{' '}
                  <span className="auth-link">Politique de confidentialité</span>.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
