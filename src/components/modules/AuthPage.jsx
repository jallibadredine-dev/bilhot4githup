/**
 * AuthPage — Connexion / Inscription HOVA PMS
 * Inscription → OnboardingWizard multi-étapes (6 steps, essai 14 jours)
 * Connexion → formulaire classique + Google OAuth
 */
import React, { useState, useRef } from 'react';
import {
  X, Eye, EyeOff, Mail, Lock, AlertCircle,
  ChevronRight, ArrowRight, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import OnboardingWizard from './OnboardingWizard';
import './AuthPage.css';

/* ── Test credentials ── */
const TEST_USER = { email: 'test@hova.app', password: 'TestHova2026!', name: 'Testeur Hova' };

/* ── Google SVG ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707a5.41 5.41 0 0 1 0-3.414V4.961H.957a8.992 8.992 0 0 0 0 8.078l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
  </svg>
);

/* ── Google signup CTA shown in register tab ── */
const GoogleSignupCTA = ({ onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const handleGoogle = async () => {
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch {
      setLoading(false);
      setErr('Provider Google non configuré. Consultez docs/google-oauth-setup.md.');
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, padding: '10px 16px', borderRadius: 10, border: '1.5px solid #e2e8f0',
          background: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 500, fontSize: 14, color: '#1e293b', opacity: loading ? 0.7 : 1,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <GoogleIcon/>
        {loading ? 'Redirection…' : "S'inscrire avec Google"}
      </button>
      {err && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6, textAlign: 'center' }}>{err}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }}/>
        <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>ou créez un compte par email</span>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }}/>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   Login form — standalone sub-component
══════════════════════════════════════════════ */
const LoginForm = ({ onLogin, onSwitchRegister }) => {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
    if (authError) setAuthError(null);
  };

  const validate = () => {
    const e = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Email invalide';
    if (form.password.length < 6) e.password = 'Minimum 6 caractères';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setAuthError(null);
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw error;
      onLogin('pro');
    } catch (err) {
      setIsLoading(false);
      if (err.message?.includes('Invalid login credentials')) {
        setAuthError('Email ou mot de passe incorrect.');
      } else if (err.message?.includes('Email not confirmed')) {
        setAuthError('Confirmez votre email avant de vous connecter.');
      } else {
        setAuthError(err.message || 'Erreur de connexion.');
      }
    }
  };

  const handleGoogle = async () => {
    setAuthError(null);
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch {
      setGoogleLoading(false);
      setAuthError(
        'Connexion Google impossible. Assurez-vous que le provider Google est activé dans Supabase Dashboard ' +
        '(Authentication > Providers > Google) et que les credentials OAuth Google sont configurés. ' +
        'Consultez docs/google-oauth-setup.md pour le guide complet.'
      );
    }
  };

  const fillTest = () => {
    setForm({ email: TEST_USER.email, password: TEST_USER.password });
    setErrors({});
    setAuthError(null);
  };

  return (
    <>
      <div className="auth-form-header">
        <h1>Bon retour 👋</h1>
        <p>Connectez-vous à votre espace BilHot.</p>
      </div>

      {authError && (
        <motion.div className="auth-error-banner" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <AlertCircle size={15}/>
          <span>{authError}</span>
        </motion.div>
      )}

      {/* Quick test fill */}
      <div className="auth-test-profile">
        <div className="atp-left">
          <span className="atp-dot"></span>
          <span>Profil de test disponible</span>
        </div>
        <button type="button" className="atp-fill-btn" onClick={fillTest}>
          Remplir <ChevronRight size={11}/>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
          <label>Adresse e-mail</label>
          <div className="auth-input-wrap">
            <Mail size={16} className="field-icon"/>
            <input type="email" placeholder="marie@hotel.com"
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
            <Lock size={16} className="field-icon"/>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => handleChange('password', e.target.value)}
              autoComplete="current-password"
            />
            <button type="button" className="toggle-password" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
              {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
          {isLoading ? 'Connexion…' : <>Se connecter <ArrowRight size={16}/></>}
        </button>
      </form>

      <div className="auth-divider"><span>ou</span></div>

      {/* Demo */}
      <button className="btn-demo-access" type="button" onClick={() => onLogin('demo')}>
        <span className="btn-demo-icon">🚀</span>
        Accès instantané — Démo
        <span className="btn-demo-sub">Sans compte · Toutes les fonctions</span>
      </button>

      <div className="auth-divider"><span>ou</span></div>

      {/* Google */}
      <button className="btn-google" onClick={handleGoogle} type="button" disabled={googleLoading}>
        <GoogleIcon/>
        {googleLoading ? 'Redirection…' : 'Continuer avec Google'}
      </button>

      {/* Switch to register */}
      <p className="auth-legal" style={{ marginTop: '1.2rem' }}>
        Pas encore de compte ?{' '}
        <span className="auth-link" onClick={onSwitchRegister}>
          Créer un compte gratuit
        </span>
      </p>
    </>
  );
};

/* ══════════════════════════════════════════════
   AuthPage — main component
══════════════════════════════════════════════ */
const AuthPage = ({ onLogin, onClose }) => {
  const [mode, setMode] = useState('register'); // 'register' | 'login'

  // ── Hidden admin access: 3 rapid logo clicks ──
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);
  const handleLogoClick = () => {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 2000);
    if (logoClickCount.current >= 3) {
      logoClickCount.current = 0;
      window.location.href = window.location.pathname + '?admin';
    }
  };

  const switchToLogin    = () => setMode('login');
  const switchToRegister = () => setMode('register');

  /* For wizard in registration mode, card grows to accommodate 6 steps */
  const isWizardMode = mode === 'register';

  return (
    <div className="auth-container">
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <div className="ambient-orb orb-3"></div>

      <header className="auth-header">
        <div className="logo-group" onClick={handleLogoClick} style={{ cursor: 'default', userSelect: 'none' }}>
          <span style={{ fontWeight: 800, fontSize: 22, letterSpacing: -0.5, lineHeight: 1, userSelect: 'none' }}>
            <span style={{ color: '#2563EB' }}>Bil</span><span style={{ color: '#111827' }}>Hot</span>
          </span>
        </div>
        {onClose && (
          <button className="auth-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={24}/>
          </button>
        )}
      </header>

      <div className="auth-content">
        <motion.div
          className={`auth-form-card ${isWizardMode ? 'auth-form-card--wizard' : ''}`}
          layout
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={switchToRegister}
            >
              Inscription
            </button>
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={switchToLogin}
            >
              Connexion
            </button>
            <div className={`auth-tab-slider ${mode === 'login' ? 'right' : ''}`}/>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'register' ? (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.22 }}
              >
                {/* Google signup shortcut — visible before wizard steps begin */}
                <div style={{ padding: '0 0 4px' }}>
                  <GoogleSignupCTA onSwitchToLogin={switchToLogin}/>
                </div>
                <OnboardingWizard
                  onComplete={(plan) => onLogin(plan || 'trial')}
                  onSwitchToLogin={switchToLogin}
                />
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                <LoginForm onLogin={onLogin} onSwitchRegister={switchToRegister}/>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legal footer */}
          <div className="auth-legal" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Shield size={11} style={{ color: '#94A3B8' }}/>
            Données chiffrées · Hébergement sécurisé · RGPD
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
