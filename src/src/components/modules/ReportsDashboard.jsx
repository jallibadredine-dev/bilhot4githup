import React from 'react';
import { TrendingUp, PieChart, DollarSign, Calendar, ChevronDown, Download } from 'lucide-react';
import './ReportsDashboard.css';

const ReportsDashboard = () => {
  const expenses = [
    { id: 1, label: 'Maintenance', cat: 'Services', val: '-34 508,35€' },
    { id: 2, label: 'Marketing', cat: 'Digital', val: '-1 200,54€' },
    { id: 3, label: 'Personnel', cat: 'Salaires', val: '-10,00€' },
    { id: 4, label: 'Taxes', cat: 'État', val: '-45,54€' },
  ];

  return (
    <div className="reports-module">
      <div className="module-header-glass">
        <div>
          <h2>Rapports & Statistiques</h2>
          <p className="text-secondary">Analyse financière et performance du parc</p>
        </div>
        <div className="header-actions">
           <button className="btn-action dark"><Calendar size={16} /> <span>Jan 2026 - Juin 2026</span></button>
           <button className="btn-action primary"><Download size={16} /> <span>Exporter PDF</span></button>
        </div>
      </div>

      <div className="reports-charts-grid">
         <div className="chart-section glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h4>Revenus Mensuels</h4>
               <TrendingUp size={18} color="var(--status-green)" />
            </div>
            <div className="chart-placeholder">
               <div className="chart-bar" style={{ height: '40%' }}></div>
               <div className="chart-bar" style={{ height: '60%' }}></div>
               <div className="chart-bar" style={{ height: '55%' }}></div>
               <div className="chart-bar" style={{ height: '80%' }}></div>
               <div className="chart-bar" style={{ height: '95%' }}></div>
               <div className="chart-bar" style={{ height: '70%' }}></div>
            </div>
         </div>

         <div className="expenses-section">
            <div className="glass-card expenses-card" style={{ padding: '1.5rem' }}>
               <h4>Dépenses Récentes</h4>
               <div style={{ marginTop: '1rem' }}>
                  {expenses.map(exp => (
                    <div key={exp.id} className="expense-row">
                       <div>
                          <div style={{ fontWeight: 600 }}>{exp.label}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.cat}</div>
                       </div>
                       <span className="val">{exp.val}</span>
                    </div>
                  ))}
               </div>
               <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Dépenses: </span>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>-4 532,44€</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
