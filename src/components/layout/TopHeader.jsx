import React, { useState } from 'react';
import { Search, RotateCcw, ChevronDown, Download, Save, Grid, List, Calendar, Filter, Shield, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './TopHeader.css';

const StatPill = ({ label, count, type = 'default' }) => (
  <div className={`stat-pill-premium stat-${type}`} aria-label={`View ${label} details`}>
    <span className="stat-label">{label}</span>
    <span className="stat-count">{count}</span>
  </div>
);

const TopHeader = ({ pmsMode, setPmsMode, setActiveView, onLogout }) => {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
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
          {/* Mode Switcher removed */}

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
            <button
              className="btn-premium logout-btn"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Se déconnecter"
            >
              <LogOut size={16} />
              <span>{loggingOut ? '...' : 'Déconnexion'}</span>
            </button>
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
