import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  RefreshCcw, 
  Filter, 
  Search, 
  MoreVertical, 
  CreditCard,
  Building2,
  Receipt,
  ArrowUpRight,
  Split,
  Send,
  Printer,
  FileCheck,
  Building,
  UploadCloud,
  ChevronDown,
  Info,
  TrendingUp,
  AlertCircle,
  Clock,
  PieChart,
  User,
  CheckCircle2,
  Share2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './BillingEngine.css';

const BillingEngine = ({ pmsMode }) => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currency, setCurrency] = useState('EUR');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    guest: '',
    room: '',
    type: pmsMode === 'hot' ? 'Propriété' : 'Individual',
    date: new Date().toISOString().split('T')[0],
    items: [{ desc: '', amount: 0, cat: pmsMode === 'hot' ? 'Hébergement' : 'Room' }]
  });

  const initialInvoices = [
    { id: 'INV-2024-001', guest: 'Alice Mertens', room: '502', amount: 1860.10, status: 'Draft', date: '2024-10-24', type: 'Individual' },
    { id: 'INV-2024-002', guest: 'Groupe Renault', room: '15 Rooms', amount: 45000.00, status: 'Proforma', date: '2024-10-25', type: 'Corporate' },
    { id: 'INV-2024-003', guest: 'Robert Chen', room: '102', amount: 3450.50, status: 'Paid', date: '2024-10-23', type: 'Individual' },
    { id: 'INV-2024-004', guest: 'TechCorp Retreat', room: '8 Rooms', amount: 12400.00, status: 'Overdue', date: '2024-10-15', type: 'Corporate' },
    { id: 'INV-2024-005', guest: 'Elena Rodriguez', room: '208', amount: 840.00, status: 'Paid', date: '2024-10-22', type: 'Individual' },
    { id: 'INV-2024-006', guest: 'Marc Dubreuil', room: '304', amount: 2150.00, status: 'Overdue', date: '2024-10-10', type: 'Individual' },
  ];

  const [invoicesList, setInvoicesList] = useState(initialInvoices);
  const [downloading, setDownloading] = useState(false);

  const simulateDownload = (id) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`Facture ${id} téléchargée avec succès (Format PDF)`);
    }, 1500);
  };

  const filteredInvoices = activeTab === 'invoices' 
    ? invoicesList.filter(inv => filterStatus === 'All' || inv.status === filterStatus)
    : invoicesList;

  const folioDetails = {
    room: [
      { desc: 'Room Stay (3 nights)', amount: 1350.00 },
      { desc: 'Late Check-out Fee', amount: 45.00 }
    ],
    fnb: [
      { desc: 'Room Service Breakfast x2', amount: 70.00 },
      { desc: 'Minibar Console', amount: 32.00 },
      { desc: 'Le Jules Verne Dinner', amount: 124.00 }
    ],
    spa: [
      { desc: 'Hot Stone Massage', amount: 85.00 },
      { desc: 'Detox Ritual', amount: 120.00 }
    ],
    taxes: [
      { desc: 'TVA 10% (Hébergement)', amount: 139.50 },
      { desc: 'TVA 20% (Services/Restauration)', amount: 86.20 },
      { desc: 'City Tax (€4/nuit)', amount: 12.00 }
    ]
  };

  const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85, MAD: 10.85 };
  
  const formatCurrency = (amount) => {
    const converted = (amount || 0) * exchangeRates[currency];
    const locale = currency === 'MAD' ? 'fr-MA' : 'fr-FR';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(converted);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'status-draft';
      case 'Proforma': return 'status-proforma';
      case 'Paid': return 'status-paid';
      case 'Overdue': return 'status-overdue';
      default: return '';
    }
  };

  return (
    <div className="billing-engine-container animate-fade-in">
      <header className="billing-header">
        <div className="title-group">
          <div className="breadcrumb-mini">Finance / Ledger / Bills</div>
          <h1>Billing Engine <span className="pro-badge">{pmsMode === 'hot' ? 'HOT' : 'PRO'}</span></h1>
          <p>{pmsMode === 'hot' ? 'Gestion des revenus & taxes de séjour' : 'Global Financial Center & Tax Compliance Management'}</p>
        </div>
        <div className="header-actions">
           <div className="currency-pill">
             <span className="pill-label">Base:</span>
             <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
               <option value="EUR">€ EUR</option>
               <option value="MAD">DH MAD</option>
               <option value="USD">$ USD</option>
               <option value="GBP">£ GBP</option>
             </select>
           </div>
           <div className="action-divider"></div>
           <button className="btn-secondary"><Share2 size={16} /> Link Folio</button>
           <button className="btn-primary" onClick={() => setIsNewInvoiceModalOpen(true)}><FileText size={16} /> Nouvelle Facture</button>
        </div>
      </header>

      {/* High-Density KPI Row */}
      <div className="finance-kpi-grid">
         <motion.div className="kpi-card glass-premium" whileHover={{ y: -5 }}>
            <div className="card-top">
              <span className="kpi-label">Revenus Globaux</span>
              <div className="trend-up"><ArrowUpRight size={14} /> +12%</div>
            </div>
            <span className="kpi-value">{formatCurrency(1425500)}</span>
            <div className="kpi-progress-bar"><div className="progress-fill" style={{ width: '75%' }}></div></div>
            <span className="kpi-subtext">vs Mois Précédent</span>
         </motion.div>

         <motion.div className="kpi-card glass-premium" whileHover={{ y: -5 }}>
            <div className="card-top">
              <span className="kpi-label">A.R. (En Attente)</span>
              <Info size={14} className="text-muted" />
            </div>
            <span className="kpi-value text-gold">{formatCurrency(42150)}</span>
            <span className="kpi-subtext">28 Folios ouverts</span>
         </motion.div>

         <motion.div className="kpi-card glass-premium overdue-highlight" whileHover={{ y: -5 }}>
            <div className="card-top">
              <span className="kpi-label">Montant Impayé (Dû)</span>
              <AlertCircle size={14} className="text-red" />
            </div>
            <span className="kpi-value text-red">{formatCurrency(12400)}</span>
            <span className="kpi-subtext">Action requise sur 6 dossiers</span>
         </motion.div>

         <motion.div className="kpi-card glass-premium" whileHover={{ y: -5 }}>
            <div className="card-top">
              <span className="kpi-label">Provision Taxes (TVA + City)</span>
              <TrendingUp size={14} className="text-green" />
            </div>
            <div className="tax-breakdown">
               <div className="tax-mini"><span>TVA</span> <strong>{formatCurrency(18450)}</strong></div>
               <div className="tax-mini"><span>City</span> <strong>{formatCurrency(6400)}</strong></div>
            </div>
            <span className="kpi-subtext">Prêt pour reversement DGI</span>
         </motion.div>

         <motion.div className="kpi-card glass-premium" whileHover={{ y: -5 }}>
            <div className="card-top">
              <span className="kpi-label">Modes de Paiement</span>
              <PieChart size={14} className="text-blue" />
            </div>
            <div className="payment-split">
               <div className="split-segment card" style={{ width: '68%' }} title="Card 68%"></div>
               <div className="split-segment cash" style={{ width: '32%' }} title="Cash 32%"></div>
            </div>
            <div className="split-legend">
               <span><i className="dot card"></i> Carte (68%)</span>
               <span><i className="dot cash"></i> Espèce (32%)</span>
            </div>
         </motion.div>
      </div>

      <div className="billing-grid">
        {/* Left Column: PMS Ledger */}
        <section className="invoice-list-pane glass-panel">
          <div className="pane-header">
             <div className="tabs-pro">
               <button className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
                 {pmsMode === 'hot' ? 'Livre des Recettes' : 'PMS Ledger'}
                 {invoicesList.length > 0 && <span className="count-badge">{invoicesList.length}</span>}
               </button>
               <button className={`tab-btn ${activeTab === 'erp' ? 'active' : ''}`} onClick={() => setActiveTab('erp')}>Tax & ERP Sync</button>
             </div>
             
             {activeTab === 'invoices' && (
               <div className="table-filters">
                 <div className="filter-group">
                   <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="status-select">
                     <option value="All">Tous Statuts</option>
                     <option value="Paid">Payé</option>
                     <option value="Overdue">Impayé</option>
                     <option value="Draft">Brouillon</option>
                   </select>
                 </div>
                 <div className="search-minimal">
                   <Search size={14} />
                   <input type="text" placeholder="Rechercher..." />
                 </div>
               </div>
             )}
          </div>

          {activeTab === 'invoices' ? (
            <div className="invoice-table-container hide-scrollbar">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Client / Entité</th>
                    <th>{pmsMode === 'hot' ? 'Propriétés / Unités' : 'Ref Chambre'}</th>
                    <th>Date d'émission</th>
                    <th>Total T.T.C.</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      className={selectedInvoice?.id === inv.id ? 'selected-row' : ''}
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      <td className="id-cell">{inv.id}</td>
                      <td>
                        <div className="entity-cell">
                          <div className="entity-avatar">{inv.guest[0]}</div>
                          <div className="entity-info">
                            <span className="entity-name">{inv.guest}</span>
                            <span className="entity-type">{inv.type}</span>
                          </div>
                        </div>
                      </td>
                      <td className="room-cell">{inv.room}</td>
                      <td className="date-cell">{inv.date}</td>
                      <td className="amount-cell">{formatCurrency(inv.amount)}</td>
                      <td><span className={`status-tag ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                      <td>
                        <div className="row-actions">
                          <button className="btn-row-action" title="Télécharger" onClick={(e) => { e.stopPropagation(); simulateDownload(inv.id); }}>
                            <Download size={14} />
                          </button>
                          <button className="btn-more"><MoreVertical size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="erp-sync-pane">
               <div className="sync-header">
                 <h3>Synchronisation ERP & Comptabilité</h3>
                 <p>Flux direct vers vos plateformes de gestion financière</p>
               </div>
               <div className="erp-grid">
                 {['SAP Business One', 'Sage Intacct', 'QuickBooks Pro'].map((name, i) => (
                   <div key={i} className="erp-sync-card">
                     <div className="sync-icon"><RefreshCcw size={20} /></div>
                     <div className="sync-meta">
                       <h4>{name}</h4>
                       <span>Dernière sync: Il y a 2h</span>
                     </div>
                     <button className="btn-sync">Sync</button>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </section>

        {/* Right Column: Luxury Folio Ticket */}
        <section className="folio-viewer-pane glass-panel">
          <AnimatePresence mode="wait">
            {selectedInvoice ? (
              <motion.div 
                className="luxury-folio-ticket"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                key={selectedInvoice.id}
              >
                {/* Visual Header */}
                <div className="folio-branding">
                   <div className="brand-logo">AURA</div>
                   <div className="brand-identity">
                     <h2>AURA LUXURY PMS</h2>
                     <span>Hospitality Financial Document</span>
                   </div>
                   <div className="folio-type-badge">{selectedInvoice.status}</div>
                </div>

                <div className="folio-main-content">
                  <div className="folio-meta-grid">
                    <div className="meta-box">
                      <label>Facturé à</label>
                      <h3>{selectedInvoice.guest}</h3>
                      <p>{pmsMode === 'hot' ? 'Villa' : 'Chambre'} {selectedInvoice.room}</p>
                      <p>{selectedInvoice.type === 'Corporate' ? 'Compte Entreprise B2B' : 'Profil Guest Individuel'}</p>
                    </div>
                    <div className="meta-box align-right">
                      <div className="meta-line"><span>N° Document</span> <strong>{selectedInvoice.id}</strong></div>
                      <div className="meta-line"><span>Date d'émission</span> <strong>{selectedInvoice.date}</strong></div>
                      <div className="meta-line"><span>Devise</span> <strong>{currency}</strong></div>
                    </div>
                  </div>

                  <div className="folio-items-section">
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Description des prestations</th>
                          <th className="text-right">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="group-title"><td colSpan="2"><Building size={12} /> HÉBERGEMENT</td></tr>
                        {folioDetails.room.map((item, i) => (
                          <tr key={i} className="item-row">
                            <td>{item.desc}</td>
                            <td className="text-right">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                        
                        <tr className="group-title"><td colSpan="2"><Receipt size={12} /> RESTAURATION & SERVICES</td></tr>
                        {folioDetails.fnb.map((item, i) => (
                          <tr key={i} className="item-row">
                            <td>{item.desc}</td>
                            <td className="text-right">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                        {folioDetails.spa.map((item, i) => (
                          <tr key={i} className="item-row">
                            <td>{item.desc}</td>
                            <td className="text-right">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="folio-calculation-zone">
                    <div className="calc-row"><span>Total Hors Taxes (Net)</span> <span>{formatCurrency(selectedInvoice.amount * 0.9)}</span></div>
                    <div className="calc-row sub"><span>Taxes & Frais (TVA 10% + City)</span> <span>{formatCurrency(selectedInvoice.amount * 0.1)}</span></div>
                    <div className="calc-row grand-total">
                      <span>Total T.T.C.</span>
                      <span className="total-val">{formatCurrency(selectedInvoice.amount)}</span>
                    </div>
                  </div>

                  <div className="folio-legal-footer">
                    <div className="payment-hint">
                      <CreditCard size={14} /> Méthode: {selectedInvoice.status === 'Paid' ? 'Carte de Crédit (Visa/Amex)' : 'En attente de règlement'}
                    </div>
                    <div className="legal-text">
                      Document certifié conforme aux normes fiscales locales. <br />
                      Généré par AURA Finance Engine à {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {/* Floating Actions */}
                <div className="luxury-actions-bar">
                   <button className="luxe-btn" onClick={() => window.print()}><Printer size={16} /> Imprimer</button>
                   <button 
                     className={`luxe-btn ${downloading ? 'loading' : ''}`} 
                     onClick={() => simulateDownload(selectedInvoice.id)}
                     disabled={downloading}
                   >
                     {downloading ? <RefreshCcw size={16} className="animate-spin" /> : <Download size={16} />} 
                     {downloading ? 'Génération...' : 'Export PDF'}
                   </button>
                   <button className="luxe-btn primary"><ExternalLink size={16} /> Envoyer au Guest</button>
                </div>
              </motion.div>
            ) : (
              <div className="empty-folio-state">
                 <div className="empty-icon"><FileCheck size={40} /></div>
                 <h3>Sélectionnez une écriture</h3>
                 <p>Choisissez un folio dans le livre comptable pour visualiser le détail des lignes budgétaires et générer le document fiscal.</p>
              </div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* NEW INVOICE MODAL */}
      <AnimatePresence>
        {isNewInvoiceModalOpen && (
          <motion.div 
            className="billing-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="billing-modal-content glass-premium"
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
            >
              <div className="modal-header">
                <div className="header-text">
                  <h2>Créer Nouveau Folio / Facture</h2>
                  <p>Saisie des prestations et génération du document fiscal</p>
                </div>
                <button className="btn-close-modal" onClick={() => setIsNewInvoiceModalOpen(false)}>×</button>
              </div>

              <div className="modal-body">
                <div className="form-grid-luxe">
                  <div className="input-field">
                    <label>Client / Entité</label>
                    <div className="input-with-icon">
                      <User size={16} />
                      <input 
                        type="text" 
                        placeholder="Nom complet ou Nom Entreprise"
                        value={newInvoiceForm.guest}
                        onChange={(e) => setNewInvoiceForm({...newInvoiceForm, guest: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{pmsMode === 'hot' ? 'Nom de la Villa / Unité' : 'Ref Chambre'}</label>
                    <div className="input-with-icon">
                      <Building2 size={16} />
                      <input 
                        type="text" 
                        placeholder={pmsMode === 'hot' ? 'ex: Villa Agadir Ocean' : 'ex: 502'} 
                        value={newInvoiceForm.room}
                        onChange={(e) => setNewInvoiceForm({...newInvoiceForm, room: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="input-field">
                    <label>Type de Compte</label>
                    <select 
                      value={newInvoiceForm.type}
                      onChange={(e) => setNewInvoiceForm({...newInvoiceForm, type: e.target.value})}
                    >
                      <option value="Individual">Profil Guest Individuel</option>
                      <option value="Corporate">Compte Entreprise B2B</option>
                    </select>
                  </div>
                  <div className="input-field">
                    <label>Date d'émission</label>
                    <input 
                      type="date" 
                      value={newInvoiceForm.date}
                      onChange={(e) => setNewInvoiceForm({...newInvoiceForm, date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="items-builder-zone">
                  <div className="builder-header">
                    <h3>Détail des Prestations</h3>
                    <button 
                      className="btn-add-line"
                      onClick={() => setNewInvoiceForm({
                        ...newInvoiceForm, 
                        items: [...newInvoiceForm.items, { desc: '', amount: 0, cat: 'Service' }]
                      })}
                    >
                      + Ajouter une ligne
                    </button>
                  </div>
                  <div className="builder-scroll hide-scrollbar">
                    <table className="builder-table">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th>Catégorie</th>
                          <th width="140">Montant ({currency})</th>
                          <th width="40"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {newInvoiceForm.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <input 
                                type="text" 
                                placeholder="Désignation du service"
                                value={item.desc}
                                onChange={(e) => {
                                  let newItems = [...newInvoiceForm.items];
                                  newItems[index].desc = e.target.value;
                                  setNewInvoiceForm({...newInvoiceForm, items: newItems});
                                }}
                              />
                            </td>
                            <td>
                              <select 
                                value={item.cat}
                                onChange={(e) => {
                                  let newItems = [...newInvoiceForm.items];
                                  newItems[index].cat = e.target.value;
                                  setNewInvoiceForm({...newInvoiceForm, items: newItems});
                                }}
                              >
                                <option value="Room">Hébergement</option>
                                <option value="F&B">Restauration</option>
                                <option value="Spa">Spa & Wellness</option>
                                <option value="Service">Autre Service</option>
                              </select>
                            </td>
                            <td>
                              <input 
                                type="number" 
                                value={item.amount}
                                onChange={(e) => {
                                  let newItems = [...newInvoiceForm.items];
                                  newItems[index].amount = parseFloat(e.target.value);
                                  setNewInvoiceForm({...newInvoiceForm, items: newItems});
                                }}
                              />
                            </td>
                            <td>
                              <button 
                                className="btn-line-delete"
                                onClick={() => {
                                  let newItems = newInvoiceForm.items.filter((_, i) => i !== index);
                                  setNewInvoiceForm({...newInvoiceForm, items: newItems});
                                }}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="modal-footer-luxe">
                <div className="total-indicator">
                  <span>Total Brut T.T.C.</span>
                  <strong>{formatCurrency(newInvoiceForm.items.reduce((acc, item) => acc + (item.amount || 0), 0))}</strong>
                </div>
                <div className="footer-btns">
                  <button className="luxe-btn-outline" onClick={() => alert('Impression en cours...')}><Printer size={16} /> Imprimer</button>
                  <button className="luxe-btn-outline" onClick={() => alert('Email envoyé avec succès !')}><Send size={16} /> Envoyer</button>
                  <button className="luxe-btn-primary" onClick={() => {
                    const total = newInvoiceForm.items.reduce((acc, item) => acc + (item.amount || 0), 0);
                    const newId = `INV-2024-00${invoicesList.length + 1}`;
                    setInvoicesList([{
                      id: newId,
                      guest: newInvoiceForm.guest || 'Nouveau Client',
                      room: newInvoiceForm.room || 'N/A',
                      amount: total,
                      status: 'Draft',
                      date: newInvoiceForm.date,
                      type: newInvoiceForm.type
                    }, ...invoicesList]);
                    setIsNewInvoiceModalOpen(false);
                    alert('Facture ajoutée au Ledger !');
                  }}>
                    Enregistrer la Facture
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillingEngine;
