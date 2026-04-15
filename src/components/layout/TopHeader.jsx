import React from 'react';
import { Search, Plus, MoreVertical, LayoutTemplate, RotateCcw, ChevronDown, Download, Save, Grid, List } from 'lucide-react';
import './TopHeader.css';

const TopHeader = ({ pmsMode, setPmsMode }) => {
  return (
    <div className="topheader-container">
      
      {/* 1. TOP ROW: Primary Filters & Actions */}
      <div className="header-top-row">
        
        {/* Interval Selector */}
        <div className="filter-group interval">
           <span className="label">Interval</span>
           <div className="date-picker-compact">
              <span className="date">14.03.2026</span>
              <span className="time">08:00 - 12:00</span>
              <ChevronDown size={14} />
           </div>
        </div>

        {/* Breakdown Filter */}
        <div className="filter-group breakdown">
           <span className="label">Breakdown</span>
           <button className="select-box">
             <span>Property &gt; Room</span>
             <ChevronDown size={14} />
           </button>
        </div>

        {/* Stats / Counts (High Density) */}
        <div className="stats-filters">
           <div className="stat-pill">
              <span className="label">Checked in</span>
              <span className="count">12</span>
              <ChevronDown size={12} />
           </div>
           <div className="stat-pill">
              <span className="label">Pending</span>
              <span className="count">5</span>
              <ChevronDown size={12} />
           </div>
           <div className="stat-pill">
              <span className="label">Urgent</span>
              <span className="count">2</span>
              <ChevronDown size={12} />
           </div>
        </div>

        {/* Mode Switcher (Global) */}
        <div className="mode-switcher-container">
          <div 
            className={`mode-switch-btn ${pmsMode === 'hot' ? 'active' : ''}`}
            onClick={() => setPmsMode('hot')}
            title="Mode Seasonal / Villa"
          >
            <span className="icon">🔥</span>
            <span className="label">PMS HOT</span>
          </div>
          <div 
            className={`mode-switch-btn ${pmsMode === 'pro' ? 'active' : ''}`}
            onClick={() => setPmsMode('pro')}
            title="Mode Hotel / Residence"
          >
            <span className="icon">🏢</span>
            <span className="label">PMS PRO</span>
          </div>
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
              <Search size={16} />
              <input type="text" placeholder="Quick search..." />
           </div>
           <div className="toggle-mode">
              <span>Edit</span>
              <div className="toggle-switch small active"></div>
           </div>
        </div>

        <div className="view-controls">
           <div className="metric-selector">
              <span className="label">Metric</span>
              <button className="select-box-pill">
                <span>Occupancy %</span>
                <ChevronDown size={14} />
              </button>
           </div>
           
           <button className="btn-reset">
              <RotateCcw size={14} />
              <span>Reset</span>
           </button>
        </div>

        <div className="layout-switcher">
           <button className="layout-btn"><Grid size={18} /></button>
           <button className="layout-btn active"><List size={18} /></button>
        </div>

      </div>

    </div>
  );
};

export default TopHeader;
