import React from 'react';
import { Search, RotateCcw, ChevronDown, Download, Save, Grid, List } from 'lucide-react';
import './TopHeader.css';

const StatPill = ({ label, count }) => (
  <button className="stat-pill" aria-label={`View ${label} details`}>
    <span className="label">{label}</span>
    <span className="count">{count}</span>
    <ChevronDown size={12} />
  </button>
);

const TopHeader = ({ pmsMode, setPmsMode }) => {
  return (
    <header className="topheader-container">
      {/* 1. TOP ROW: Primary Filters & Actions */}
      <div className="header-top-row">
        {/* Interval Selector */}
        <div className="filter-group interval">
           <span className="label" id="interval-label">Interval</span>
           <button className="date-picker-compact" aria-labelledby="interval-label">
              <span className="date">14.03.2026</span>
              <span className="time">08:00 - 12:00</span>
              <ChevronDown size={14} />
           </button>
        </div>

        {/* Breakdown Filter */}
        <div className="filter-group breakdown">
           <span className="label" id="breakdown-label">Breakdown</span>
           <button className="select-box" aria-labelledby="breakdown-label">
             <span>Property &gt; Room</span>
             <ChevronDown size={14} />
           </button>
        </div>

        {/* Stats / Counts (High Density) */}
        <div className="stats-filters" role="group" aria-label="Quick statistics">
           <StatPill label="Checked in" count="12" />
           <StatPill label="Pending" count="5" />
           <StatPill label="Urgent" count="2" />
        </div>

        {/* Mode Switcher (Global) */}
        <div className="mode-switcher-container" role="radiogroup" aria-label="PMS Mode">
          <button 
            className={`mode-switch-btn ${pmsMode === 'hot' ? 'active' : ''}`}
            onClick={() => setPmsMode('hot')}
            title="Mode Seasonal / Villa"
            role="radio"
            aria-checked={pmsMode === 'hot'}
          >
            <span className="icon" aria-hidden="true">🔥</span>
            <span className="label">PMS HOT</span>
          </button>
          <button 
            className={`mode-switch-btn ${pmsMode === 'pro' ? 'active' : ''}`}
            onClick={() => setPmsMode('pro')}
            title="Mode Hotel / Residence"
            role="radio"
            aria-checked={pmsMode === 'pro'}
          >
            <span className="icon" aria-hidden="true">🏢</span>
            <span className="label">PMS PRO</span>
          </button>
        </div>

        {/* Action Buttons (Load / Save style) */}
        <div className="primary-actions">
           <button className="btn-action dark">
              <Download size={16} />
              <span>Load Report</span>
              <ChevronDown size={14} />
           </button>
           <button className="btn-action primary">
              <Save size={16} />
              <span>Save Changes</span>
           </button>
        </div>
      </div>

      {/* 2. BOTTOM ROW: Search & Secondary Controls */}
      <div className="header-bottom-row">
        <div className="search-section">
           <div className="search-input-wrapper">
              <Search size={16} aria-hidden="true" />
              <input type="text" placeholder="Quick search..." aria-label="Search across platform" />
           </div>
           <div className="toggle-mode">
              <span id="edit-mode-label">Edit</span>
              <button 
                className="toggle-switch small active"
                role="switch"
                aria-checked="true"
                aria-labelledby="edit-mode-label"
              ></button>
           </div>
        </div>

        <div className="view-controls">
           <div className="metric-selector">
              <span className="label" id="metric-label">Metric</span>
              <button className="select-box-pill" aria-labelledby="metric-label">
                <span>Occupancy %</span>
                <ChevronDown size={14} />
              </button>
           </div>
           
           <button className="btn-reset">
              <RotateCcw size={14} />
              <span>Reset</span>
           </button>
        </div>

        <div className="layout-switcher" role="group" aria-label="Layout controls">
           <button className="layout-btn" aria-label="Grid view"><Grid size={18} /></button>
           <button className="layout-btn active" aria-label="List view" aria-current="true"><List size={18} /></button>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
