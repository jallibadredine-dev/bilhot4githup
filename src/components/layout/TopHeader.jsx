import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Shield, LogOut, Settings, User, Home, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { clearSensitiveLocalState } from '../../lib/secureStorage';
import { motion, AnimatePresence } from 'framer-motion';
import './TopHeader.css';

const UserAvatar = ({ name, email, size = 30 }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : email?.[0]?.toUpperCase() ?? 'U';

  const colors = ['#FF385C', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];
  const colorIndex = (name || email || '').charCodeAt(0) % colors.length;

  return (
    <div className="th-avatar" style={{ background: colors[colorIndex], width: size, height: size }}>
      {initials}
    </div>
  );
};

const TopHeader = ({ pmsMode, setPmsMode, setActiveView, onLogout, currentUser }) => {
  const [loggingOut, setLoggingOut]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = currentUser?.user_metadata?.full_name
    || currentUser?.user_metadata?.name
    || currentUser?.email?.split('@')[0]
    || 'Utilisateur';

  const email = currentUser?.email || '';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    setDropdownOpen(false);
    await supabase.auth.signOut();
    clearSensitiveLocalState();
    if (onLogout) onLogout();
  };

  return (
    <div className="th-header">

      {/* ── LEFT: Property context + live stats ── */}
      <div className="th-left">
        <button className="th-property-pill">
          <span className="th-property-icon">
            <Home size={13} />
          </span>
          <span className="th-property-name">Ocean View Apt</span>
          <ChevronDown size={13} className="th-property-chevron" />
        </button>

        {/* Live stats */}
        <div className="th-stats">
          <div className="th-stat-pill th-stat-blue">
            <span className="th-stat-num">12</span>
            <span>Check-in</span>
          </div>
          <div className="th-stat-pill th-stat-amber">
            <span className="th-stat-num">5</span>
            <span>En attente</span>
          </div>
          <div className="th-stat-pill th-stat-red">
            <span className="th-stat-num">2</span>
            <span>Urgent</span>
          </div>
        </div>
      </div>

      {/* ── CENTER: Search ── */}
      <div className="th-center">
        <div className="th-search">
          <Search size={16} className="th-search-icon" />
          <input type="text" placeholder="Rechercher réservation, client, chambre…" />
          <kbd className="th-search-kbd">⌘K</kbd>
        </div>
      </div>

      {/* ── RIGHT: Actions + User ── */}
      <div className="th-right">

        <button
          className="th-btn th-btn-ghost"
          onClick={() => setActiveView('police')}
          title="Fiche Police"
        >
          <Shield size={15} />
          <span>Fiche Police</span>
        </button>

        <button className="th-icon-btn" title="Notifications">
          <Bell size={17} />
        </button>

        {/* User Profile */}
        {currentUser && (
          <div className="th-user-wrapper" ref={dropdownRef}>
            <button
              className={`th-user-btn ${dropdownOpen ? 'open' : ''}`}
              onClick={() => setDropdownOpen(v => !v)}
              aria-label="User menu"
            >
              <UserAvatar name={displayName} email={email} size={30} />
              <span className="th-user-name">{displayName}</span>
              <ChevronDown size={14} className={`th-chevron ${dropdownOpen ? 'rotated' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="th-dropdown"
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <div className="th-dropdown-header">
                    <UserAvatar name={displayName} email={email} size={40} />
                    <div>
                      <p className="th-dd-name">{displayName}</p>
                      <p className="th-dd-email">{email}</p>
                    </div>
                  </div>
                  <div className="th-dd-divider" />
                  <button
                    className="th-dd-item"
                    onClick={() => { setActiveView('settings'); setDropdownOpen(false); }}
                  >
                    <Settings size={15} />
                    <span>Paramètres</span>
                  </button>
                  <button
                    className="th-dd-item"
                    onClick={() => { setActiveView('system-admin'); setDropdownOpen(false); }}
                  >
                    <User size={15} />
                    <span>Mon compte</span>
                  </button>
                  <div className="th-dd-divider" />
                  <button
                    className="th-dd-item danger"
                    onClick={handleLogout}
                    disabled={loggingOut}
                  >
                    <LogOut size={15} />
                    <span>{loggingOut ? 'Déconnexion…' : 'Se déconnecter'}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopHeader;
