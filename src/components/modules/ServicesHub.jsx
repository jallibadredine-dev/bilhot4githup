import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Sparkles, 
  Clock, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Timer,
  Star,
  Coffee,
  Flower2,
  ConciergeBell,
  ArrowRight,
  MoreVertical,
  Plus,
  Filter,
  X,
  Printer,
  Smartphone,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ServicesHub.css';

const ServicesHub = ({ addFolioCharge, roomFolios = {} }) => {
  const [activeTab, setActiveTab] = useState('fnb');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const tabs = [
    { id: 'fnb', label: 'F&B', icon: <UtensilsCrossed size={16} />, count: 8 },
    { id: 'spa', label: 'Spa & Wellness', icon: <Flower2 size={16} />, count: 3 },
    { id: 'concierge', label: 'Conciergerie', icon: <ConciergeBell size={16} />, count: 5 },
  ];

  const [orders, setOrders] = useState({
    fnb: [
      { id: 142, room: '304', guest: 'Jean Dupont', items: 'Cocktail x2, Club Sandwich', amount: 48.00, status: 'preparing', priority: 'VIP', time: '12min', staff: 'Maria G.' },
      { id: 143, room: '512', guest: 'Alice Mertens', items: 'Room Service Breakfast', amount: 35.00, status: 'new', priority: 'Standard', time: '2min', staff: null },
      { id: 144, room: '102', guest: 'Robert Chen', items: 'Champagne Moët, Fruits', amount: 124.00, status: 'delivering', priority: 'VIP', time: '18min', staff: 'David L.' },
      { id: 145, room: '208', guest: 'Elena Rodriguez', items: 'Salade César, Eau plate x2', amount: 28.50, status: 'completed', priority: 'Standard', time: '32min', staff: 'Sarah M.' },
    ],
    spa: [
      { id: 201, room: '304', guest: 'Jean Dupont', items: 'Hot Stone Massage 60min', amount: 120.00, status: 'preparing', priority: 'VIP', time: '10min', staff: 'Lisa P.' },
      { id: 202, room: '405', guest: 'Marie Laurent', items: 'Facial Treatment Premium', amount: 95.00, status: 'new', priority: 'Standard', time: '1min', staff: null },
      { id: 203, room: '102', guest: 'Robert Chen', items: 'Couple Massage 90min', amount: 280.00, status: 'delivering', priority: 'VIP', time: '45min', staff: 'Alex K.' },
    ],
    concierge: [
      { id: 301, room: '304', guest: 'Jean Dupont', items: 'Restaurant Booking — Le Jules Verne 20h', amount: 0, status: 'completed', priority: 'VIP', time: '5min', staff: 'Pierre D.' },
      { id: 302, room: '512', guest: 'Alice Mertens', items: 'Airport Transfer — CDG 14h30', amount: 85.00, status: 'preparing', priority: 'Standard', time: '8min', staff: 'Pierre D.' },
      { id: 303, room: '720', guest: 'Mark Thompson', items: 'Theater Tickets x2 — Opéra Garnier', amount: 240.00, status: 'new', priority: 'Elite', time: '1min', staff: null },
    ],
  });

  // Modal States
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [chargeToRoom, setChargeToRoom] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [newOrderForm, setNewOrderForm] = useState({
    service: 'fnb',
    room: '',
    guest: '',
    items: '',
    amount: ''
  });

  const staff = [
    { name: 'Maria G.', role: 'F&B Service', load: 72, status: 'active', tasks: 3 },
    { name: 'David L.', role: 'F&B Runner', load: 45, status: 'active', tasks: 2 },
    { name: 'Sarah M.', role: 'F&B Service', load: 88, status: 'active', tasks: 4 },
    { name: 'Lisa P.', role: 'Spa Therapist', load: 60, status: 'active', tasks: 2 },
    { name: 'Pierre D.', role: 'Concierge', load: 35, status: 'active', tasks: 2 },
  ];

  const currentOrders = orders[activeTab] || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'preparing': return 'status-preparing';
      case 'delivering': return 'status-delivering';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'Nouvelle';
      case 'preparing': return 'En cours';
      case 'delivering': return 'Livraison';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getProgress = (status) => {
    switch (status) {
      case 'new': return 10;
      case 'preparing': return 50;
      case 'delivering': return 80;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const totalRevenue = currentOrders.reduce((sum, o) => sum + o.amount, 0);
  const pendingCount = currentOrders.filter(o => o.status !== 'completed').length;

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const newOrder = {
      id: Math.floor(Math.random() * 1000) + 400,
      room: newOrderForm.room || 'N/A',
      guest: newOrderForm.guest || 'Client Passager',
      items: newOrderForm.items,
      amount: parseFloat(newOrderForm.amount) || 0,
      status: 'new',
      priority: 'Standard',
      time: '0min',
      staff: null
    };

    setOrders(prev => ({
      ...prev,
      [newOrderForm.service]: [newOrder, ...prev[newOrderForm.service]]
    }));
    
    // Switch to the tab where the order was created
    setActiveTab(newOrderForm.service);
    setSelectedOrder(newOrder); // auto-select the new order
    setIsNewOrderModalOpen(false);
    setNewOrderForm({ service: 'fnb', room: '', guest: '', items: '', amount: '' });
  };

  const handleAdvanceStatus = () => {
    if (!selectedOrder) return;
    setIsProcessing(true);

    setTimeout(() => {
      let nextStatus = 'completed';
      if (selectedOrder.status === 'new') nextStatus = 'preparing';
      else if (selectedOrder.status === 'preparing') nextStatus = 'delivering';

      const updatedOrder = { ...selectedOrder, status: nextStatus };

      setOrders(prev => {
        const tabOrders = prev[activeTab].map(o =>
          o.id === selectedOrder.id ? updatedOrder : o
        );
        return { ...prev, [activeTab]: tabOrders };
      });

      setSelectedOrder(updatedOrder);

      if (nextStatus === 'completed' && chargeToRoom && addFolioCharge) {
        const typeMap = { fnb: 'F&B', spa: 'Spa', concierge: 'Conciergerie' };
        addFolioCharge(selectedOrder.room, selectedOrder.amount, selectedOrder.items, typeMap[activeTab] || 'Service');
      }

      setIsProcessing(false);
      setIsAdvanceModalOpen(false);
    }, 800);
  };

  const handlePrint = () => {
    if (!selectedOrder) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    const htmlContent = `
      <html>
      <head>
        <title>Facture #${selectedOrder.id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
          .logo { font-size: 28px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
          .hotel-info { font-size: 13px; color: #666; margin-top: 8px; line-height: 1.5; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .client-info h3 { margin: 0 0 5px 0; font-size: 18px; }
          .client-info p { margin: 0; font-size: 14px; }
          .meta-info { text-align: right; font-size: 14px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { border-bottom: 2px solid #222; padding: 12px 0; text-align: left; font-size: 13px; text-transform: uppercase; color: #555; }
          td { padding: 16px 0; border-bottom: 1px solid #eee; line-height: 1.5; font-size: 14px; }
          .total-row { display: flex; justify-content: flex-end; align-items: center; border-top: 2px solid #222; padding-top: 20px; }
          .total-label { font-size: 16px; font-weight: 600; margin-right: 40px; text-transform: uppercase; }
          .total-amount { font-size: 24px; font-weight: 800; color: #000; }
          .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px;}
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ANTIGRAVITY PMS</div>
          <div class="hotel-info">123 Avenue des Champs-Élysées, 75008 Paris<br/>Tél: +33 1 23 45 67 89 | contact@antigravity.com</div>
        </div>
        
        <div class="invoice-details">
          <div class="client-info">
            <p style="font-size: 12px; color: #888; margin-bottom: 6px; text-transform: uppercase; font-weight: bold;">Facturé à :</p>
            <h3>${selectedOrder.guest}</h3>
            <p>Chambre : <strong>${selectedOrder.room}</strong></p>
          </div>
          <div class="meta-info">
            <p><strong>FACTURE N°:</strong> #INV-${new Date().getFullYear()}-${selectedOrder.id}</p>
            <p><strong>Date d'émission:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            <p><strong>Heure:</strong> ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 70%">Désignation des Services / Articles</th>
              <th style="width: 30%; text-align: right;">Montant TTC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${selectedOrder.items.replace(/\ng/, '<br/>')}</td>
              <td style="text-align: right; font-weight: 600;">€${selectedOrder.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-row">
          <span class="total-label">Total à Payer (TTC) :</span>
          <span class="total-amount">€${selectedOrder.amount.toFixed(2)}</span>
        </div>

        <div class="footer">
          Merci de votre confiance. Tous nos montants incluent la TVA en vigueur.<br/>
          Document généré automatiquement le ${new Date().toLocaleString('fr-FR')} par le PMS Antigravity.
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!selectedOrder) return;
    const content = `=================================\nFACTURE - ANTIGRAVITY PMS\n=================================\n\nCommande #${selectedOrder.id}\nClient: ${selectedOrder.guest}\nChambre: ${selectedOrder.room}\n\n---------------------------------\nArticles:\n${selectedOrder.items}\n---------------------------------\n\nMONTANT TOTAL: €${selectedOrder.amount.toFixed(2)}\n\nMerci de votre confiance !`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Facture_Commande_${selectedOrder.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="services-hub-container animate-fade-in">
      <header className="services-header">
        <div className="title-group">
          <h1>Hub de Services <span className="ai-badge">Opérations Live</span></h1>
          <p>Gestion unifiée F&B, Spa & Conciergerie — Push automatique sur folio</p>
        </div>
        <div className="header-actions">
          <button className="btn-filter"><Filter size={16} /> Filtrer</button>
          <button className="btn-primary" onClick={() => setIsNewOrderModalOpen(true)}>
            <Plus size={16} /> Nouvelle Commande
          </button>
        </div>
      </header>

      {/* Tab Switcher */}
      <div className="services-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`service-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
        <div className="tab-stats">
          <span className="stat-item"><Clock size={14} /> {pendingCount} en cours</span>
          <span className="stat-item revenue">€{totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      <div className="services-grid">
        {/* Left: Order Queue */}
        <section className="order-queue-pane glass-panel">
          <div className="pane-header">
            <h3>File de Commandes</h3>
            <span className="badge-count">{currentOrders.length} commandes</span>
          </div>

          <div className="orders-list">
            <AnimatePresence>
              {currentOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''} ${getStatusColor(order.status)}`}
                  onClick={() => setSelectedOrder(order)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  <div className="order-top">
                    <div className="order-id">
                      <span className="id-label">#{order.id}</span>
                      {order.priority === 'VIP' && <span className="vip-badge"><Star size={10} /> VIP</span>}
                      {order.priority === 'Elite' && <span className="elite-badge"><Star size={10} /> Elite</span>}
                    </div>
                    <span className={`status-pill ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="order-body">
                    <div className="order-guest">
                      <span className="room-tag">Rm {order.room}</span>
                      <span className="guest-name">{order.guest}</span>
                    </div>
                    <p className="order-items">{order.items}</p>
                  </div>

                  <div className="order-footer">
                    <div className="order-meta">
                      <span className="time-info"><Timer size={12} /> {order.time}</span>
                      {order.staff && <span className="staff-info"><User size={12} /> {order.staff}</span>}
                    </div>
                    <span className="order-amount">€{order.amount.toFixed(2)}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="order-progress">
                    <div className="progress-fill" style={{ width: `${getProgress(order.status)}%` }}></div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Center: Staff Dispatch */}
        <section className="staff-dispatch-pane glass-panel">
          <div className="pane-header">
            <h3>Dispatch Personnel</h3>
            <button className="btn-ai-assign"><Sparkles size={14} /> Auto-Assign IA</button>
          </div>

          <div className="staff-list">
            {staff.map((member, i) => (
              <div key={i} className="staff-card">
                <div className="staff-avatar">{member.name.split(' ').map(n => n[0]).join('')}</div>
                <div className="staff-info">
                  <strong>{member.name}</strong>
                  <span className="staff-role">{member.role}</span>
                </div>
                <div className="staff-load">
                  <div className="load-bar">
                    <div className="load-fill" style={{ width: `${member.load}%`, background: member.load > 80 ? 'var(--status-red)' : member.load > 60 ? 'var(--status-yellow)' : 'var(--status-green)' }}></div>
                  </div>
                  <span className="load-text">{member.load}%</span>
                </div>
                <span className="task-count">{member.tasks} tâches</span>
              </div>
            ))}
          </div>

          {/* Live Tracking */}
          <div className="live-tracking">
            <div className="tracking-header">
              <h4>Suivi Livraison Temps Réel</h4>
            </div>
            {currentOrders.filter(o => o.status === 'delivering' || o.status === 'preparing').map(order => (
              <div key={order.id} className="tracking-item">
                <span className="tracking-id">#{order.id} — Rm {order.room}</span>
                <div className="tracking-bar">
                  <div className="tracking-fill" style={{ width: `${getProgress(order.status)}%` }}></div>
                </div>
                <span className="tracking-percent">{getProgress(order.status)}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Order Detail / Folio Push */}
        <section className="order-detail-pane">
          {selectedOrder ? (
            <motion.div
              className="detail-card glass-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="detail-header">
                <h3>Commande #{selectedOrder.id}</h3>
                <button className="btn-icon"><MoreVertical size={16} /></button>
              </div>

              <div className="detail-body">
                <div className="detail-row">
                  <label>Client</label>
                  <span>{selectedOrder.guest}</span>
                </div>
                <div className="detail-row">
                  <label>Chambre</label>
                  <span className="room-badge">{selectedOrder.room}</span>
                </div>
                <div className="detail-row">
                  <label>Articles</label>
                  <span>{selectedOrder.items}</span>
                </div>
                <div className="detail-row">
                  <label>Assigné à</label>
                  <span>{selectedOrder.staff || <em className="unassigned">Non assigné</em>}</span>
                </div>
                <div className="detail-row">
                  <label>Statut</label>
                  <span className={`status-pill ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>

                <div className="detail-divider"></div>

                <div className="detail-row total-row">
                  <label>Montant Total</label>
                  <span className="total-amount">€{selectedOrder.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="detail-actions">
                {selectedOrder.status !== 'completed' ? (
                  <>
                    {!selectedOrder.staff && (
                      <button className="btn-assign-detail"><Sparkles size={14} /> Assigner IA</button>
                    )}
                    <button className="btn-advance" onClick={() => setIsAdvanceModalOpen(true)}>
                      Avancer Statut <ArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <div className="folio-confirmation">
                    <CheckCircle2 size={18} color="var(--status-green)" />
                    <span>Ajouté au folio Rm {selectedOrder.room}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="empty-detail glass-panel">
              <Coffee size={48} color="#CBD5E1" />
              <p>Sélectionnez une commande pour voir les détails et pousser les frais sur le folio.</p>
            </div>
          )}
        </section>
      </div>

      {/* Auto-Folio Push Footer */}
      <footer className="folio-push-bar">
        <div className="folio-info">
          <CheckCircle2 size={16} color="var(--status-green)" />
          <strong>Auto-Push Folio Actif</strong>
          <span>Les frais sont automatiquement ajoutés au folio de la chambre à la livraison confirmée</span>
        </div>
        <div className="folio-stats">
          <span className="folio-stat">Aujourd'hui: <strong>€2,450.00</strong> poussés sur folios</span>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {isNewOrderModalOpen && (
          <motion.div className="services-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNewOrderModalOpen(false)}>
            <motion.div className="services-modal-content glass-panel" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="modal-top">
                <h3>Nouvelle Commande</h3>
                <button className="btn-close-modal" onClick={() => setIsNewOrderModalOpen(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateOrder} className="modal-form">
                <div className="form-group">
                  <label>Département / Service</label>
                  <select value={newOrderForm.service} onChange={(e) => setNewOrderForm({...newOrderForm, service: e.target.value})} required>
                    <option value="fnb">Food & Beverage (F&B)</option>
                    <option value="spa">Spa & Wellness</option>
                    <option value="concierge">Conciergerie</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Chambre (Optionnel)</label>
                    <input type="text" placeholder="Ex: 304" value={newOrderForm.room} onChange={(e) => setNewOrderForm({...newOrderForm, room: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Nom du Client</label>
                    <input type="text" placeholder="Ex: Jean Dupont" value={newOrderForm.guest} onChange={(e) => setNewOrderForm({...newOrderForm, guest: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Détails des Articles</label>
                  <textarea placeholder="2x Café, 1x Croissant..." required value={newOrderForm.items} onChange={(e) => setNewOrderForm({...newOrderForm, items: e.target.value})} rows="3"></textarea>
                </div>
                <div className="form-group">
                  <label>Montant Total (€)</label>
                  <input type="number" step="0.01" min="0" required placeholder="0.00" value={newOrderForm.amount} onChange={(e) => setNewOrderForm({...newOrderForm, amount: e.target.value})} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsNewOrderModalOpen(false)}>Annuler</button>
                  <button type="submit" className="btn-primary-modal">
                    <CheckCircle2 size={16} /> Créer & Assigner
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isAdvanceModalOpen && selectedOrder && (
          <motion.div className="services-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isProcessing && setIsAdvanceModalOpen(false)}>
            <motion.div className="services-modal-content glass-panel" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="modal-top">
                <h3>Validation & Checkout</h3>
                <button className="btn-close-modal" onClick={() => setIsAdvanceModalOpen(false)} disabled={isProcessing}><X size={20} /></button>
              </div>
              <div className="modal-body-pad">
                <p className="advance-desc">Vous êtes sur le point d'avancer le statut de la commande <strong>#{selectedOrder.id}</strong> (Chambre {selectedOrder.room}).</p>
                
                <div className="quick-action-buttons">
                  <button className="btn-receipt" onClick={handlePrint}><Printer size={16} /> Imprimer Facture</button>
                  <button className="btn-download" onClick={handleDownload}><Download size={16} /> Télécharger (.txt)</button>
                </div>

                <div className="checkbox-wrapper">
                  <input type="checkbox" id="chargeToRoom" checked={chargeToRoom} onChange={(e) => setChargeToRoom(e.target.checked)} disabled={isProcessing} />
                  <label htmlFor="chargeToRoom">
                    <strong>Ajouter à la note de la chambre</strong>
                    <span>Le montant de €{selectedOrder.amount.toFixed(2)} sera automatiquement transféré sur le folio principal au checkout.</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setIsAdvanceModalOpen(false)} disabled={isProcessing}>Annuler</button>
                <button className="btn-primary-modal" onClick={handleAdvanceStatus} disabled={isProcessing}>
                  {isProcessing ? <div className="spinner-sm"></div> : <ArrowRight size={16} />}
                  {isProcessing ? 'Traitement...' : 'Confirmer le Statut'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesHub;
