import React, { useState } from 'react';
import { 
  Check, X, Shield, Zap, Sparkles, Building, 
  ChevronRight, Info, Bot, Key, ChartLine, 
  Gem, Hotel, Headset, Calculator, CreditCard, Lock,
  ArrowRight, MousePointer2, BadgeCheck, ToggleLeft, ToggleRight, 
  ShieldCheck, Layout, Globe, MessageCircle, Crown, Ticket,
  ChevronDown, HelpCircle, Star, Target, Server, Activity, 
  Database, RefreshCw, Copy, ExternalLink, HardDrive, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ClientPlans.css';

// Ultra-Modern Architectural Building Component
const ArchitecturalBuilding = ({ rooms }) => {
  const floors = Math.max(1, Math.min(12, Math.ceil(rooms / 25)));
  const widthFactor = Math.min(1.4, 0.7 + (rooms / 400));
  
  return (
    <div className="arch-visualizer">
      <motion.div 
        className="arch-structure"
        animate={{ height: floors * 20, width: 100 * widthFactor }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
      >
        <div className="arch-glass-facade"></div>
        {[...Array(floors)].map((_, i) => (
          <div key={i} className="arch-floor">
            <div className="arch-window"></div>
            <div className="arch-window"></div>
            <div className="arch-window"></div>
            <div className="arch-window"></div>
          </div>
        ))}
        <div className="arch-base"></div>
      </motion.div>
      <div className="arch-ground-glow"></div>
    </div>
  );
};

const ClientPlans = ({ pmsMode }) => {
  const [rooms, setRooms] = useState(30);
  const [duration, setDuration] = useState({ months: 12, discount: 0.8, label: 'ANNUEL' });
  const [addOns, setAddOns] = useState({
    aiMessaging: false, smartLocks: false, channelPlus: false, staffMobility: false
  });
  
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [licenceModalOpen, setLicenceModalOpen] = useState(false);

  // Add-on Config
  const addOnConfig = {
    aiMessaging: { name: 'Assistant IA Concierge', price: 49, desc: 'IA Conversationnelle 24/7', icon: <Bot size={16}/> },
    smartLocks: { name: 'Hub Serrures IOT', price: 29, desc: 'Gestion accès sans clé', icon: <Key size={16}/> },
    channelPlus: { name: 'Channel Manager Pro+', price: 39, desc: 'Sync ultra-rapide < 1s', icon: <Globe size={16}/> },
    staffMobility: { name: 'App Staff Illimitée', price: 19, desc: 'Accès mobile pour vos équipes', icon: <Smartphone size={16}/> }
  };

  const getPrices = () => {
    let starter = rooms * 3.5;
    let business = rooms * 5.5;
    let ultimate = (rooms * 5.5) + 69;
    let addOnsTotal = Object.keys(addOns).reduce((sum, key) => addOns[key] ? sum + addOnConfig[key].price : sum, 0);
    const suffix = duration.months === 1 ? " /mois" : " total";
    
    return {
      starter: Math.round((starter + addOnsTotal) * duration.months * duration.discount),
      business: Math.round((business + addOnsTotal) * duration.months * duration.discount),
      ultimate: Math.round((ultimate + addOnsTotal) * duration.months * duration.discount),
      lifetime: 1999 + (rooms * 12),
      suffix
    };
  };

  const prices = getPrices();

  const handleOpenCheckout = (planName, price, isOneTime = false) => {
    const activeAddOns = Object.keys(addOns).filter(k => addOns[k]).map(k => addOnConfig[k]);
    setSelectedPlan({ 
      name: planName, total: price, rooms, isOneTime,
      duration: isOneTime ? 'LIFETIME' : duration.label,
      addOns: isOneTime ? [] : activeAddOns,
      basePrice: isOneTime ? price : (planName === 'Essentiel' ? rooms * 3.5 : planName === 'Business' ? rooms * 5.5 : (rooms * 5.5) + 69)
    });
    setCheckoutOpen(true);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  const processPayment = () => {
    setIsProcessing(true);
    setTimeout(() => { setIsProcessing(false); setIsSuccess(true); }, 3500);
  };

  return (
    <motion.div className="luxe-portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="luxe-mesh-bg"></div>
      
      <div className="luxe-content">
        {/* Navigation */}
        <nav className="luxe-nav">
          <div className="luxe-brand">
            <div className="luxe-logo-box">H</div>
            <span>HosFlow Antigravity</span>
          </div>
          <div className="luxe-nav-links">
            <button className="active">Pricing</button>
            <button>Infrastructure</button>
            <button>API</button>
          </div>
          <button className="luxe-btn-licence" onClick={() => setLicenceModalOpen(true)}>Activer Licence</button>
        </nav>

        <div className="luxe-main-grid">
          {/* Config Sidebar */}
          <aside className="luxe-sidebar">
            <section className="luxe-config-group">
              <header>
                <Target size={14} className="text-blue-500" />
                <h3>Dimensionnement</h3>
              </header>
              
              <div className="luxe-arch-box">
                <ArchitecturalBuilding rooms={rooms} />
                <div className="luxe-rooms-counter">
                  <span className="count">{rooms}</span>
                  <span className="label">Unités d'Hébergement</span>
                </div>
              </div>

              <input 
                type="range" className="luxe-range" 
                min="1" max="500" value={rooms} 
                onChange={(e) => setRooms(parseInt(e.target.value))}
              />
              
              <div className="luxe-toggle-grid">
                <button 
                  className={duration.months === 12 ? 'active' : ''} 
                  onClick={() => setDuration({ months: 12, discount: 0.8, label: 'ANNUEL' })}
                >
                  Annuel <span className="discount">SAVE 20%</span>
                </button>
                <button 
                  className={duration.months === 1 ? 'active' : ''}
                  onClick={() => setDuration({ months: 1, discount: 1, label: 'MENSUEL' })}
                >
                  Mensuel
                </button>
              </div>
            </section>

            <section className="luxe-config-group">
              <header>
                <Sparkles size={14} className="text-amber-500" />
                <h3>Add-ons Premium</h3>
              </header>
              <div className="luxe-addons">
                {Object.keys(addOnConfig).map(key => (
                  <div key={key} className={`l-addon ${addOns[key] ? 'active' : ''}`} onClick={() => setAddOns(p => ({ ...p, [key]: !p[key] }))}>
                    <div className="l-addon-icon">{addOnConfig[key].icon}</div>
                    <div className="l-addon-details">
                      <h4>{addOnConfig[key].name}</h4>
                      <p>{addOnConfig[key].desc}</p>
                    </div>
                    <div className="l-addon-check">{addOns[key] ? <BadgeCheck size={18}/> : <div className="dot"></div>}</div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          {/* Pricing Stack */}
          <main className="luxe-cards-stack">
            <header className="luxe-stack-header">
              <h1>Liberté & Performance</h1>
              <p>Une tarification haute précision adaptée à votre établissement.</p>
            </header>

            <div className="luxe-cards-grid">
              {/* Card 1 */}
              <motion.div className="luxe-card" whileHover={{ y: -8 }}>
                <div className="l-card-type">ESSENTIEL</div>
                <h3>Starter Pack</h3>
                <div className="l-card-price">${prices.starter}<span>{prices.suffix}</span></div>
                <ul className="l-card-features">
                  <li><Check size={14}/> PMS Cloud Engine</li>
                  <li><Check size={14}/> Facturation Illimitée</li>
                  <li><Check size={14}/> Support Standard</li>
                </ul>
                <button className="l-card-btn" onClick={() => handleOpenCheckout('Essentiel', prices.starter)}>Choisir</button>
              </motion.div>

              {/* Card 2 - Featured */}
              <motion.div className="luxe-card featured" whileHover={{ y: -12 }}>
                <div className="l-card-badge">RECOMMENDED</div>
                <div className="l-card-type">PRO</div>
                <h3>Intelligence</h3>
                <div className="l-card-price">${prices.business}<span>{prices.suffix}</span></div>
                <ul className="l-card-features">
                  <li><Zap size={14}/> Synchro OTA Temps Réel</li>
                  <li><Zap size={14}/> Booking Engine Premium</li>
                  <li><Zap size={14}/> Yield Management IA</li>
                </ul>
                <button className="l-card-btn gold" onClick={() => handleOpenCheckout('Business', prices.business)}>Activer Business</button>
              </motion.div>

              {/* Card 3 - One Time */}
              <motion.div className="luxe-card dark" whileHover={{ y: -8 }}>
                <div className="l-card-type grey">LIFETIME</div>
                <h3>Elite License</h3>
                <div className="l-card-price white">${prices.lifetime}<span>/activation</span></div>
                <ul className="l-card-features">
                  <li><Crown size={14} className="text-amber-500"/> Licence Perpétuelle</li>
                  <li><Crown size={14} className="text-amber-500"/> Updates à vie</li>
                  <li><Crown size={14} className="text-amber-500"/> Support VIP 24/7</li>
                </ul>
                <button className="l-card-btn white" onClick={() => handleOpenCheckout('Elite Lifetime', prices.lifetime, true)}>Acheter Code</button>
              </motion.div>
            </div>

            <div className="luxe-security-banner">
              <ShieldCheck size={18} />
              <span>Infrastructure certifiée ISO-27001 • Paiements sécurisés par Stripe SSL v3</span>
            </div>
          </main>
        </div>
      </div>

      {/* Premium Stripe Checkout Pop-up */}
      <AnimatePresence>
        {checkoutOpen && (
          <div className="luxe-modal-overlay">
            <motion.div 
              className="stripe-luxe-modal"
              initial={{ scale: 0.94, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 40 }}
            >
              <button className="luxe-modal-close" onClick={() => setCheckoutOpen(false)}><X size={20}/></button>
              
              <div className="stripe-luxe-split">
                {/* Left Panel: Summary */}
                <div className="stripe-luxe-summary">
                  <div className="stripe-luxe-brand">
                    <div className="dot"></div>
                    <span>Antigravity Checkout</span>
                  </div>

                  {isSuccess ? (
                    <div className="luxe-success-view">
                      <motion.div 
                        className="luxe-check-circle"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <Check size={48} className="text-white" />
                      </motion.div>
                      <h2>Paiement Réussi</h2>
                      <p>Votre plan <b>{selectedPlan.name}</b> est maintenant actif.</p>
                      <button className="luxe-btn-done" onClick={() => setCheckoutOpen(false)}>Accéder au Dashboard</button>
                    </div>
                  ) : (
                    <div className="luxe-order-details">
                      <div className="luxe-plan-info">
                        <span className="luxe-label">ABONNEMENT</span>
                        <h3>{selectedPlan.name}</h3>
                        <div className="luxe-main-total">${selectedPlan.total}</div>
                        <p>Facturation {selectedPlan.isOneTime ? 'unique' : duration.label.toLowerCase()}</p>
                      </div>

                      <div className="luxe-breakdown">
                        <div className="l-item">Base ({selectedPlan.rooms} unités) <span>${selectedPlan.basePrice}</span></div>
                        {selectedPlan.addOns.map((a, i) => (
                          <div key={i} className="l-item">Add-on: {a.name} <span>+${a.price}</span></div>
                        ))}
                      </div>

                      <div className="luxe-footer-info">
                        <p>Besoin d'aide ? <button className="link">Contactez-nous</button></p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Panel: Payment Form */}
                {!isSuccess && (
                  <div className="stripe-luxe-form">
                    <div className="stripe-header">
                      <h3>Informations de Paiement</h3>
                      <div className="stripe-secure"><Lock size={12}/> Secure</div>
                    </div>

                    <div className="luxe-form-stack">
                      <div className="l-input-group">
                        <label>Numéro de Carte</label>
                        <div className="l-input-wrap">
                          <CreditCard size={18} className="text-slate-400" />
                          <input type="text" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
                        </div>
                      </div>
                      
                      <div className="l-input-row">
                        <div className="l-input-group">
                          <label>Date d'expiration</label>
                          <input type="text" placeholder="MM / YY" defaultValue="12 / 28" />
                        </div>
                        <div className="l-input-group">
                          <label>CVC</label>
                          <input type="text" placeholder="123" defaultValue="123" />
                        </div>
                      </div>

                      <div className="l-input-group">
                        <label>Nom Complet</label>
                        <input type="text" placeholder="Jean Dupont" />
                      </div>
                    </div>

                    <button 
                      className={`luxe-pay-btn ${isProcessing ? 'processing' : ''}`}
                      disabled={isProcessing}
                      onClick={processPayment}
                    >
                      {isProcessing ? <div className="luxe-spinner"></div> : `Payer $${selectedPlan.total}`}
                    </button>
                    
                    <div className="luxe-pay-footer">
                      <p>Paiement traité par <b>Stripe</b>. Vos données bancaires ne sont jamais stockées sur nos serveurs.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minimal Licence Modal */}
      <AnimatePresence>
        {licenceModalOpen && (
          <div className="luxe-modal-overlay">
            <motion.div className="licence-luxe-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
              <button className="luxe-close" onClick={() => setLicenceModalOpen(false)}><X size={16}/></button>
              <Ticket size={32} className="text-blue-500 mb-4" />
              <h2>Code d'Activation</h2>
              <p>Entrez votre clé de licence perpétuelle.</p>
              <input type="text" placeholder="GH-XXXX-XXXX" />
              <button className="l-primary-btn">Vérifier & Activer</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientPlans;
