import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Settings, 
  Copy, 
  CheckCircle2, 
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Check,
  X,
  Edit3,
  Clock,
  Download
} from 'lucide-react';
import './AffiliateSystem.css';

const AffiliateSystem = ({ pmsMode = 'hot' }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [copied, setCopied] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [showBankPopup, setShowBankPopup] = useState(false);
  const [bankInfo, setBankInfo] = useState({
    bankName: 'Banque Populaire',
    iban: 'MA64 ************ 1234',
    swift: '',
    holderName: 'HosFlow User'
  });
  const [tempBankInfo, setTempBankInfo] = useState(bankInfo);

  // Mock Data
  const defaultCommission = 25; // Requested: ajouter les pourcentages de 25 % sur le PMS
  const minimumPayoutString = '500 MAD';
  const minimumPayoutNum = 500;
  
  const stats = {
    clicks: 1245,
    conversions: 42,
    conversionRate: '3.4%',
    totalSales: pmsMode === 'pro' ? 125000 : 25000,
    currentBalance: pmsMode === 'pro' ? 25000 : 3750,
    currency: 'MAD'
  };

  const chartData = [
    { label: 'Jan', value: 45 },
    { label: 'Fév', value: 52 },
    { label: 'Mar', value: 38 },
    { label: 'Avr', value: 65 },
    { label: 'Mai', value: 85 },
    { label: 'Juin', value: 70 },
  ];
  const maxChartValue = Math.max(...chartData.map(d => d.value));

  const clientsList = [
    { id: 'CLI-001', name: 'Riad Al Andalous', date: '12/03/2026', plan: 'PRO Annuel', status: 'active', commission: pmsMode === 'pro' ? 2400 : 1500 },
    { id: 'CLI-002', name: 'Villa Océane', date: '25/03/2026', plan: 'HOT Mensuel', status: 'waiting', commission: pmsMode === 'pro' ? 200 : 150 },
    { id: 'CLI-003', name: 'Dar Essalam', date: '05/04/2026', plan: 'PRO Mensuel', status: 'active', commission: pmsMode === 'pro' ? 200 : 150 },
    { id: 'CLI-004', name: 'Appartement Marina', date: '10/04/2026', plan: 'HOT Annuel', status: 'cancelled', commission: 0 },
  ];

  const payoutsHistory = [
    { id: 'PAY-1002', date: '01/03/2026', amount: pmsMode === 'pro' ? 8500 : 2500, method: 'Virement Bancaire', status: 'paid' },
    { id: 'PAY-1001', date: '01/02/2026', amount: pmsMode === 'pro' ? 4200 : 1200, method: 'PayPal', status: 'paid' },
  ];

  const adminAffiliates = [
    { id: 'AFF-001', name: 'Agence Web Plus', email: 'contact@webplus.ma', sales: 45, commRate: 20, status: 'active' },
    { id: 'AFF-002', name: 'Consultant Immo', email: 'immo@consult.com', sales: 12, commRate: 15, status: 'pending' },
    { id: 'AFF-003', name: 'Tech Solutions', email: 'info@techsol.ma', sales: 120, commRate: 30, status: 'active' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://hosflow.com/ref/partenaire-1029');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayoutRequest = () => {
    setPayoutRequested(true);
    setTimeout(() => {
      alert("Demande de retrait envoyée avec succès.");
      setPayoutRequested(false);
    }, 1500);
  };

  const openBankPopup = () => {
    setTempBankInfo(bankInfo);
    setShowBankPopup(true);
  };

  const saveBankInfo = () => {
    setBankInfo(tempBankInfo);
    setShowBankPopup(false);
  };

  const renderBankPopup = () => {
    if (!showBankPopup) return null;
    return (
      <div className="bank-popup-overlay">
        <div className="bank-popup-box">
          <div className="bank-popup-header">
            <h3><CreditCard size={20} /> Modifier les infos bancaires</h3>
            <button className="btn-icon" onClick={() => setShowBankPopup(false)}><X size={18} /></button>
          </div>
          
          <div className="bank-form-group">
            <label>Nom de la Banque</label>
            <input 
              type="text" 
              value={tempBankInfo.bankName} 
              onChange={e => setTempBankInfo({...tempBankInfo, bankName: e.target.value})} 
              placeholder="Ex: Banque Populaire"
            />
          </div>
          <div className="bank-form-group">
            <label>Nom du titulaire de compte</label>
            <input 
              type="text" 
              value={tempBankInfo.holderName} 
              onChange={e => setTempBankInfo({...tempBankInfo, holderName: e.target.value})} 
              placeholder="Ex: HosFlow User"
            />
          </div>
          <div className="bank-form-group">
            <label>IBAN (Numéro de compte)</label>
            <input 
              type="text" 
              value={tempBankInfo.iban} 
              onChange={e => setTempBankInfo({...tempBankInfo, iban: e.target.value})} 
              placeholder="Ex: MA64..."
            />
          </div>
          <div className="bank-form-group">
            <label>Code SWIFT / BIC (Optionnel)</label>
            <input 
              type="text" 
              value={tempBankInfo.swift} 
              onChange={e => setTempBankInfo({...tempBankInfo, swift: e.target.value})} 
              placeholder="Ex: BPOPMA..."
            />
          </div>
          
          <div className="bank-popup-actions">
            <button className="btn-secondary" onClick={() => setShowBankPopup(false)}>Annuler</button>
            <button className="btn-primary" onClick={saveBankInfo}>Enregistrer</button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="affiliate-dashboard animate-fade-in">
      {/* Stats Grid */}
      <div className="affiliate-stats-grid mb-8">
        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Solde Actuel</p>
              <h3 className="stat-value">{stats.currentBalance.toLocaleString()} {stats.currency}</h3>
            </div>
            <div className="stat-icon-wrapper blue">
              <Wallet size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="stat-trend positive"><ArrowUpRight size={14} className="inline mr-1"/>+15%</span>
            <span className="text-xs text-gray-500 font-medium">Commission: {defaultCommission}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Ventes (30j)</p>
              <h3 className="stat-value">{stats.conversions}</h3>
            </div>
            <div className="stat-icon-wrapper green">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="stat-trend positive"><ArrowUpRight size={14} className="inline mr-1"/>+8%</span>
            <span className="text-xs text-gray-500 font-medium">Taux de conv. {stats.conversionRate}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Clics Générés</p>
              <h3 className="stat-value">{stats.clicks.toLocaleString()}</h3>
            </div>
            <div className="stat-icon-wrapper purple">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
             <div className="referral-link-box w-full mt-0">
               <input type="text" value="hosflow.com/ref/p-1029" readOnly />
               <button onClick={handleCopyLink} className="btn-secondary" style={{padding: '0.25rem 0.5rem'}}>
                 {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <div className="affiliate-chart-container">
             <div className="chart-header">
               <h3>Performance des Ventes</h3>
               <div className="flex gap-2">
                 <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">6 Derniers Mois</span>
               </div>
             </div>
             <div className="css-bar-chart">
               {chartData.map((data, idx) => {
                 const heightPct = (data.value / maxChartValue) * 100;
                 return (
                   <div key={idx} className="chart-bar-group">
                     <div 
                       className="chart-bar" 
                       style={{ height: `${heightPct}%` }}
                       data-val={`${data.value} ventes`}
                     ></div>
                     <span className="chart-label">{data.label}</span>
                   </div>
                 );
               })}
             </div>
           </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="affiliate-section h-full flex flex-col justify-between">
            <div>
              <div className="section-header">
                <h3><CreditCard size={20} /> Prochain Paiement</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Le seuil minimum de retrait est fixé à <strong>{minimumPayoutString}</strong>. 
                Les commissions sont validées après le délai de rétractation légal (14 jours).
              </p>
              
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Progression</span>
                  <span className="font-semibold text-gray-900">
                    {stats.currentBalance} / {minimumPayoutNum}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (stats.currentBalance/minimumPayoutNum)*100)}%`, background: pmsMode === 'hot' ? '#ea580c' : '#4f46e5' }}
                  ></div>
                </div>
              </div>
            </div>

            <button 
              className="btn-primary w-full justify-center"
              onClick={handlePayoutRequest}
              disabled={stats.currentBalance < minimumPayoutNum || payoutRequested}
            >
              {payoutRequested ? (
                <><Clock size={18} className="animate-spin" /> Traitement...</>
              ) : (
                <><Wallet size={18} /> Demander un retrait</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderClients = () => (
    <div className="affiliate-section animate-fade-in">
      <div className="section-header">
        <h3><Users size={20} /> Clients Parrainés</h3>
        <button className="btn-secondary"><Download size={16} /> Exporter (CSV)</button>
      </div>
      <div className="table-wrapper">
        <table className="affiliate-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Abonnement</th>
              <th>Commission</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {clientsList.map(client => (
              <tr key={client.id}>
                <td><span className="text-gray-500 text-sm">{client.date}</span></td>
                <td className="font-medium">{client.name}</td>
                <td><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{client.plan}</span></td>
                <td className="font-semibold">{client.commission > 0 ? `${client.commission} ${stats.currency}` : '-'}</td>
                <td>
                  <span className={`status-badge ${client.status}`}>
                    {client.status === 'active' ? 'Validé' : 
                     client.status === 'waiting' ? 'En attente (14j)' : 'Annulé'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPayouts = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2">
        <div className="affiliate-section">
          <div className="section-header">
            <h3><CreditCard size={20} /> Historique des Paiements</h3>
          </div>
          <div className="table-wrapper">
            <table className="affiliate-table">
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Date</th>
                  <th>Méthode</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {payoutsHistory.map(payout => (
                  <tr key={payout.id}>
                    <td className="text-gray-500 font-mono text-sm">{payout.id}</td>
                    <td>{payout.date}</td>
                    <td>{payout.method}</td>
                    <td className="font-bold">{payout.amount} {stats.currency}</td>
                    <td><span className="status-badge paid"><CheckCircle2 size={14} /> Payé</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-1">
        <div className="affiliate-section">
          <div className="section-header mb-4">
            <h3>Méthode de Paiement</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900">Virement Bancaire</span>
              <span className="status-badge active border border-green-200">Par Défaut</span>
            </div>
            {bankInfo.holderName && <p className="text-sm text-gray-800 font-medium mb-1">{bankInfo.holderName}</p>}
            <p className="text-sm text-gray-600 font-mono mb-1">{bankInfo.iban}</p>
            <p className="text-sm text-gray-600">{bankInfo.bankName} {bankInfo.swift && `- ${bankInfo.swift}`}</p>
          </div>
          <button className="btn-outline w-full justify-center" onClick={openBankPopup}>
            <Edit3 size={16} /> Modifier les infos
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="affiliate-section animate-fade-in border-indigo-200" style={{ borderTopWidth: '4px' }}>
      <div className="section-header">
        <h3><ShieldCheck size={20} className="text-indigo-600" /> Administration des Affiliés</h3>
        <span className="text-sm text-gray-500">Gérez les revendeurs et leurs taux.</span>
      </div>
      <div className="table-wrapper mt-4">
        <table className="affiliate-table">
          <thead>
            <tr>
              <th>Revendeur</th>
              <th>Contact</th>
              <th>Ventes Tot.</th>
              <th>Commission</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminAffiliates.map(aff => (
              <tr key={aff.id}>
                <td className="font-semibold text-gray-900">{aff.name}</td>
                <td><span className="text-gray-500 text-sm">{aff.email}</span></td>
                <td>{aff.sales}</td>
                <td>
                  <span className="bg-gray-100 text-gray-800 font-mono px-2 py-1 rounded text-sm">
                    {aff.commRate}%
                  </span>
                </td>
                <td>
                   <span className={`status-badge ${aff.status === 'active' ? 'approved' : 'pending'}`}>
                    {aff.status === 'active' ? 'Approuvé' : 'En examen'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {aff.status === 'pending' && (
                      <>
                        <button className="btn-icon approve" title="Approuver"><Check size={16} /></button>
                        <button className="btn-icon reject" title="Rejeter"><X size={16} /></button>
                      </>
                    )}
                    <button className="btn-icon edit" title="Modifier Taux"><Edit3 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`affiliate-system-container mode-${pmsMode}`}>
      <div className="affiliate-header">
        <div className="affiliate-header-left">
          <h1>Programme Partenaire</h1>
          <p>Gérez vos références, suivez vos commissions et demandez vos retraits.</p>
        </div>
        
        <div className="affiliate-nav">
          <button 
            className={`affiliate-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={18} /> Tableau de bord
          </button>
          <button 
            className={`affiliate-tab ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            <Users size={18} /> Clients
          </button>
          <button 
            className={`affiliate-tab ${activeTab === 'payouts' ? 'active' : ''}`}
            onClick={() => setActiveTab('payouts')}
          >
            <CreditCard size={18} /> Paiements
          </button>
          {/* Admin tab is visible for demo purposes */}
          <button 
            className={`affiliate-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <Settings size={18} /> Administration <span className="admin-badge">PRO</span>
          </button>
        </div>
      </div>

      <div className="affiliate-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'clients' && renderClients()}
        {activeTab === 'payouts' && renderPayouts()}
        {activeTab === 'admin' && renderAdmin()}
      </div>
      
      {renderBankPopup()}
    </div>
  );
};

export default AffiliateSystem;
