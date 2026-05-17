import React, { useState, useRef, useEffect } from 'react';
import { Search, RotateCcw, ChevronDown, Download, Save, Grid, List, Calendar, Filter, Shield, LogOut, Settings, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import './TopHeader.css';

const StatPill = ({ label, count, type = 'default' }) => (
  <div className={`stat-pill-premium stat-${type}`} aria-label={`View ${label} details`}>
    <span className="stat-label">{label}</span>
    <span className="stat-count">{count}</span>
  </div>
);

const UserAvatar = ({ name, email }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : email?.[0]?.toUpperCase() ?? 'U';

  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
  const colorIndex = (name || email || '').charCodeAt(0) % colors.length;
  const bg = colors[colorIndex];

  return (
    <div className="user-avatar" style={{ background: bg }}>
      {initials}
    </div>
  );
};

const TopHeader = ({ pmsMode, setPmsMode, setActiveView, onLogout, currentUser }) => {
  const [loggingOut, setLoggingOut] = useState(false);
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
    if (onLogout) onLogout();
  };

  return (
    <header className="topheader-premium">
      {/* ─── MAIN TOOLBAR ─── */}
      <div className="toolbar-main">

        {/* Left Section: Context & Filters */}
        <div className="toolbar-left">
          <div className="context-group">
            <div className="selector-wrapper">
              <span className="selector-hint">Interval</span>
              <button className="premium-selector date-range">
                <Calendar size={14} className="icon-left" />
                <div className="selector-content">
                  <span className="primary-txt">14.03.2026</span>
                  <span className="secondary-txt">08:00 - 12:00</span>
                </div>
                <ChevronDown size={14} className="icon-right" />
              </button>
            </div>

            <div className="selector-wrapper">
              <span className="selector-hint">Breakdown</span>
              <button className="premium-selector property-breakdown">
                <Filter size={14} className="icon-left" />
                <span className="primary-txt">Property &gt; Room</span>
                <ChevronDown size={14} className="icon-right" />
              </button>
            </div>
          </div>
        </div>

        {/* Center Section: Live Metrics */}
        <div className="toolbar-center">
          <div className="metrics-container">
            <StatPill label="Checked in" count="12" type="blue" />
            <StatPill label="Pending" count="5" type="warning" />
            <StatPill label="Urgent" count="2" type="danger" />
          </div>
        </div>

        {/* Right Section: Global Modes & Actions */}
        <div className="toolbar-right">
          <div className="global-actions">
            <button className="btn-premium secondary police-btn" onClick={() => setActiveView('police')}>
              <Shield size={16} />
              <span>Fiche Police</span>
            </button>
            <button className="btn-premium secondary load-btn">
              <Download size={16} />
              <span>Load Report</span>
            </button>
            <button className="btn-premium primary save-btn">
              <Save size={16} />
              <span>Save Changes</span>
            </button>

            {/* User Profile */}
            {currentUser && (
              <div className="user-profile-wrapper" ref={dropdownRef}>
                <button
                  className={`user-profile-btn ${dropdownOpen ? 'open' : ''}`}
                  onClick={() => setDropdownOpen(v => !v)}
                >
                  <UserAvatar name={displayName} email={email} />
                  <div className="user-profile-info">
                    <span className="user-profile-name">{displayName}</span>
                    <span className="user-profile-email">{email}</span>
                  </div>
                  <ChevronDown size={14} className={`profile-chevron ${dropdownOpen ? 'rotated' : ''}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="user-dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      <div className="user-dropdown-header">
                        <UserAvatar name={displayName} email={email} />
                        <div>
                          <p className="dropdown-name">{displayName}</p>
                          <p className="dropdown-email">{email}</p>
                        </div>
                      </div>
                      <div className="user-dropdown-divider" />
                      <button
                        className="user-dropdown-item"
                        onClick={() => { setActiveView('settings'); setDropdownOpen(false); }}
                      >
                        <Settings size={15} />
                        <span>Paramètres</span>
                      </button>
                      <button
                        className="user-dropdown-item"
                        onClick={() => { setActiveView('system-admin'); setDropdownOpen(false); }}
                      >
                        <User size={15} />
                        <span>Mon compte</span>
                      </button>
                      <div className="user-dropdown-divider" />
                      <button
                        className="user-dropdown-item logout-item"
                        onClick={handleLogout}
                        disabled={loggingOut}
                      >
                        <LogOut size={15} />
                        <span>{loggingOut ? 'Déconnexion...' : 'Se déconnecter'}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── SECONDARY BAR ─── */}
      <div className="toolbar-secondary">
        <div className="search-box-wrapper">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Quick search..." className="premium-search-input" />
          <kbd className="search-kbd">⌘K</kbd>
        </div>

        <div className="controls-group">
          <div className="edit-mode-control">
            <span className="control-label">Edit Mode</span>
            <button className="premium-toggle active" role="switch" aria-checked="true"></button>
          </div>

          <div className="divider" />

          <div className="metric-config">
            <span className="control-label">Metric</span>
            <button className="config-pill">
              <span>Occupancy %</span>
              <ChevronDown size={14} />
            </button>
          </div>

          <button className="btn-ghost reset-btn">
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          <div className="layout-group">
            <button className="layout-option" aria-label="Grid"><Grid size={16} /></button>
            <button className="layout-option active" aria-label="List"><List size={16} /></button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
