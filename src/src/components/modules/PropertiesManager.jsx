import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Home, Hotel, Plus,
  Globe, Download, X, Check,
  Zap, Image as ImageIcon,
  MapPin, MoreHorizontal,
  Link2, Calendar, Wifi, Wind, Car, Waves,
  ChefHat, Dumbbell, ShieldCheck, Star, CheckCircle,
  AlertCircle, Sparkles
} from 'lucide-react';
import './PropertiesManager.css';

/* ─── Platform Definitions ─── */
const PLATFORMS = {
  airbnb: {
    label: 'Airbnb',
    color: '#FF5A5F',
    bg: '#FFF0F0',
    emoji: '🏠',
    patterns: ['airbnb.com'],
    hint: 'Lien Airbnb détecté',
  },
  booking: {
    label: 'Booking.com',
    color: '#003580',
    bg: '#E8F0FA',
    emoji: '🅱',
    patterns: ['booking.com'],
    hint: 'Lien Booking.com détecté',
  },
  expedia: {
    label: 'Expedia',
    color: '#00355F',
    bg: '#E8F2FA',
    emoji: '✈',
    patterns: ['expedia.com', 'vrbo.com'],
    hint: 'Lien Expedia détecté',
  },
  beds24: {
    label: 'Beds24',
    color: '#8B5CF6',
    bg: '#F3F0FF',
    emoji: '🛏',
    patterns: ['beds24.com', 'beds24:', 'PROP-'],
    hint: 'ID Beds24 / SiteMinder détecté',
  },
};

/* ─── Import Step Definitions ─── */
const IMPORT_STEPS = [
  { id: 1, label: 'Analyse de l\'URL...', duration: 700 },
  { id: 2, label: 'Récupération des images HD...', duration: 900 },
  { id: 3, label: 'Extraction de la description et des équipements...', duration: 800 },
  { id: 4, label: 'Synchronisation du calendrier terminée.', duration: 600 },
];

/* ─── Mock Data Extractor ─── */
const MOCK_DATA_BY_PLATFORM = {
  airbnb: {
    title: 'Villa Jade — Vue Mer Panoramique',
    description: 'Magnifique villa avec piscine à débordement offrant une vue imprenable sur la mer. Idéal pour les séjours en famille ou entre amis. Architecture contemporaine et décoration haut de gamme.',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600',
    ],
    basePrice: 420,
    location: 'Tanger, Malabata — Maroc',
    amenities: ['WiFi Fibre', 'Piscine Privée', 'Parking', 'Climatisation', 'Cuisine Équipée', 'Gym'],
    channelId: 'airbnb_listing_12345',
    type: 'Villa',
    rating: 4.9,
    reviews: 87,
  },
  booking: {
    title: 'Riad Dar El Sadaka — Médina',
    description: 'Authentique Riad du 19ème siècle entièrement rénové, niché au cœur de la Médina de Marrakech. Patio central avec fontaine, chambres en suite avec zellij artisanal.',
    images: [
      'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=600',
      'https://images.unsplash.com/photo-1570213489059-0aac6626cade?q=80&w=600',
      'https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?q=80&w=600',
    ],
    basePrice: 185,
    location: 'Marrakech, Médina — Maroc',
    amenities: ['WiFi', 'Petit Déjeuner Inclus', 'Climatisation', 'Rooftop Terrasse', 'Hammam'],
    channelId: 'booking_property_67890',
    type: 'Riad',
    rating: 4.7,
    reviews: 203,
  },
  expedia: {
    title: 'Sky Garden Apartment — Centre-Ville',
    description: 'Appartement moderne avec terrasse panoramique et jacuzzi, situé au 15ème étage d\'une tour résidentielle de standing. Vue à 360° sur la ville et l\'océan Atlantique.',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600',
    ],
    basePrice: 130,
    location: 'Casablanca, Centre — Maroc',
    amenities: ['WiFi Haut Débit', 'Jacuzzi', 'Concierge 24h', 'Vue Panoramique', 'Parking Sécurisé'],
    channelId: 'expedia_prop_11111',
    type: 'Appartement',
    rating: 4.6,
    reviews: 54,
  },
  beds24: {
    title: 'Villa Atlas — Piscine & Montagne',
    description: 'Grande villa de luxe avec vue sur le massif de l\'Atlas. Piscine chauffée, jardin paysager de 2000m², et service de chef privé disponible sur demande.',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=600',
      'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=600',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=600',
    ],
    basePrice: 650,
    location: 'Marrakech, Route de l\'Ourika — Maroc',
    amenities: ['WiFi Fibre', 'Piscine Chauffée', 'Chef Privé', 'Sécurité 24h', 'Hammam', 'Jardins'],
    channelId: 'beds24_property_22222',
    type: 'Villa',
    rating: 5.0,
    reviews: 31,
  },
};

const detectSource = (url) => {
  if (!url || url.trim() === '') return null;
  const lower = url.toLowerCase();
  for (const [key, platform] of Object.entries(PLATFORMS)) {
    if (platform.patterns.some(p => lower.includes(p))) {
      return { key, ...platform };
    }
  }
  // Generic URL fallback
  if (lower.startsWith('http') || lower.startsWith('www')) {
    return { key: 'generic', label: 'URL détectée', color: '#64748B', bg: '#F1F5F9', emoji: '🔗', hint: 'Source personnalisée' };
  }
  return null;
};

const extractPropertyData = (url, sourceKey) => {
  const data = MOCK_DATA_BY_PLATFORM[sourceKey] || MOCK_DATA_BY_PLATFORM['airbnb'];
  return { ...data };
};

const AMENITY_ICONS = {
  'WiFi': <Wifi size={12} />, 'WiFi Fibre': <Wifi size={12} />, 'WiFi Haut Débit': <Wifi size={12} />,
  'Piscine': <Waves size={12} />, 'Piscine Privée': <Waves size={12} />, 'Piscine Chauffée': <Waves size={12} />,
  'Parking': <Car size={12} />, 'Parking Sécurisé': <Car size={12} />,
  'Climatisation': <Wind size={12} />,
  'Cuisine Équipée': <ChefHat size={12} />, 'Chef Privé': <ChefHat size={12} />,
  'Gym': <Dumbbell size={12} />,
  'Sécurité 24h': <ShieldCheck size={12} />,
};

const generateId = () => Math.random().toString(36).substr(2, 9);

/* ─── Main Component ─── */
const PropertiesManager = ({ pmsMode }) => {
  const [properties, setProperties] = useState([
    {
      id: 'p1',
      name: 'Riad Dar El Sadaka',
      type: 'Riad',
      status: 'Libre',
      housekeepingStatus: 'dirty', // dirty, cleaning, clean
      channels: ['airbnb', 'booking'],
      image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?q=80&w=400',
      location: 'Marrakech, Médina',
      price: 150,
      active: true
    },
    {
      id: 'p2',
      name: 'Villa Ocean View',
      type: 'Villa',
      status: 'Occupé',
      housekeepingStatus: 'clean',
      channels: ['booking', 'expedia'],
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=400',
      location: 'Casablanca, Anfa',
      price: 450,
      active: true
    },
    {
      id: 'p3',
      name: 'Appartement Sky Garden',
      type: 'Appartement',
      status: 'Libre',
      housekeepingStatus: 'cleaning',
      channels: ['airbnb'],
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=400',
      location: 'Rabat, Agdal',
      price: 85,
      active: false
    }
  ]);

  const updateHousekeeping = (id, newStatus) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, housekeepingStatus: newStatus } : p
    ));
    showToast(`Statut ménage mis à jour : ${newStatus === 'clean' ? 'Propre' : newStatus === 'cleaning' ? 'En cours' : 'À nettoyer'}`);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('auto');

  // Smart Import State
  const [importUrl, setImportUrl] = useState('');
  const [detectedSource, setDetectedSource] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [importedData, setImportedData] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [toast, setToast] = useState(null);

  // Manual Form State
  const [manualData, setManualData] = useState({
    name: '', type: 'Appartement', location: '', capacity: 2, price: 0, description: '', images: []
  });

  // Detect URL source on input change
  useEffect(() => {
    setDetectedSource(detectSource(importUrl));
    setImportedData(null);
    setCurrentStep(0);
  }, [importUrl]);

  /* ─── Show Toast ─── */
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ─── Smart Import Handler ─── */
  const handleSmartImport = async () => {
    if (!importUrl.trim()) return;
    setIsImporting(true);
    setImportedData(null);
    setCurrentStep(0);

    // Chain through steps
    let delay = 0;
    IMPORT_STEPS.forEach((step, idx) => {
      setTimeout(() => {
        setCurrentStep(idx + 1);
      }, delay);
      delay += step.duration;
    });

    // After all steps complete, set data
    setTimeout(() => {
      const sourceKey = detectedSource?.key || 'airbnb';
      const data = extractPropertyData(importUrl, sourceKey);
      setImportedData(data);
      setActiveImageIdx(0);
      setIsImporting(false);
    }, delay + 200);
  };

  /* ─── Confirm Import ─── */
  const handleConfirmImport = () => {
    if (!importedData) return;
    const sourceKey = detectedSource?.key || 'airbnb';
    const newProp = {
      id: generateId(),
      name: importedData.title,
      type: importedData.type,
      status: 'Libre',
      channels: sourceKey !== 'generic' ? [sourceKey] : [],
      image: importedData.images[0],
      location: importedData.location,
      price: importedData.basePrice,
      active: true,
      amenities: importedData.amenities,
    };
    setProperties(prev => [newProp, ...prev]);
    resetModal();
    showToast('Logement importé et synchronisé avec succès !');
  };

  /* ─── Reset / Close Modal ─── */
  const resetModal = () => {
    setImportUrl('');
    setDetectedSource(null);
    setIsImporting(false);
    setCurrentStep(0);
    setImportedData(null);
    setActiveImageIdx(0);
    setIsModalOpen(false);
  };

  /* ─── Manual Submit ─── */
  const handleManualSubmit = (e) => {
    e.preventDefault();
    const newProp = {
      id: generateId(),
      ...manualData,
      status: 'Libre',
      channels: [],
      image: manualData.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=400',
      active: true
    };
    setProperties(prev => [newProp, ...prev]);
    setManualData({ name: '', type: 'Appartement', location: '', capacity: 2, price: 0, description: '', images: [] });
    setIsModalOpen(false);
    showToast('Logement créé avec succès !');
  };

  const progressPct = isImporting
    ? Math.round((currentStep / IMPORT_STEPS.length) * 100)
    : (importedData ? 100 : 0);

  return (
    <div className="properties-manager-container">

      {/* ─── Toast Notification ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`pm-toast ${toast.type}`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ─── */}
      <div className="module-header">
        <div className="header-text">
          <h1>Gestion de Propriété</h1>
          <p>Supervisez l'ensemble de vos propriétés sur un dashboard centralisé.</p>
        </div>
        <button className="btn-add-property" onClick={() => { setIsModalOpen(true); setModalTab('auto'); }}>
          <Sparkles size={18} />
          <span>Smart Import</span>
        </button>
      </div>

      {/* ─── Properties Grid ─── */}
      <div className="properties-grid">
        {properties.map((prop) => (
          <motion.div
            key={prop.id}
            className="property-card glass-panel"
            layout
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-image">
              <img src={prop.image} alt={prop.name} />
              <div className={`status-badge ${prop.status.toLowerCase()}`}>{prop.status}</div>
              <div className={`housekeeping-badge ${prop.housekeepingStatus}`}>
                 {prop.housekeepingStatus === 'clean' ? <Sparkles size={12} /> : 
                  prop.housekeepingStatus === 'cleaning' ? <Zap size={12} className="spinning-icon" /> : 
                  <AlertCircle size={12} />}
                 <span>{prop.housekeepingStatus === 'clean' ? 'Propre' : prop.housekeepingStatus === 'cleaning' ? 'Ménage...' : 'À Nettoyer'}</span>
              </div>
              <div className="property-type-tag">
                {prop.type === 'Appartement' && <Building2 size={12} />}
                {prop.type === 'Riad' && <Home size={12} />}
                {prop.type === 'Villa' && <Hotel size={12} />}
                <span>{prop.type}</span>
              </div>
            </div>
            <div className="card-content">
              <div className="card-title">
                <h3>{prop.name}</h3>
                <button className="btn-more"><MoreHorizontal size={18} /></button>
              </div>
              <div className="card-info">
                <div className="info-item">
                  <MapPin size={14} />
                  <span>{prop.location}</span>
                </div>
                <div className="info-item">
                  <span className="price-tag">{prop.price}€</span>
                  <span className="unit">/nuit</span>
                </div>
              </div>

              {/* Housekeeping Action Button */}
              <div className="housekeeping-actions" style={{ marginTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px' }}>
                {prop.housekeepingStatus !== 'clean' ? (
                  <button 
                    className={`btn-housekeeping-action ${prop.housekeepingStatus}`}
                    onClick={(e) => { e.stopPropagation(); updateHousekeeping(prop.id, prop.housekeepingStatus === 'dirty' ? 'cleaning' : 'clean'); }}
                  >
                    {prop.housekeepingStatus === 'dirty' ? 'Démarrer Ménage' : 'Terminer & Valider'}
                  </button>
                ) : (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>
                     <CheckCircle size={14} /> Logement Prêt
                   </div>
                )}
              </div>
              <div className="card-footer">
                <div className="connected-channels">
                  {prop.channels.map(chan => (
                    <div key={chan} className={`channel-mini-icon ${chan}`}>{chan.charAt(0).toUpperCase()}</div>
                  ))}
                  {prop.channels.length === 0 && <span className="no-channels">Aucun canal lié</span>}
                </div>
                <div className="toggle-container">
                  <div className={`ios-switch ${prop.active ? 'on' : ''}`}><div className="handle"></div></div>
                  <span className="visibility-label">{prop.active ? 'Visible' : 'Masqué'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add Placeholder */}
        <motion.div
          className="add-placeholder-card glass-panel dashed"
          onClick={() => { setIsModalOpen(true); setModalTab('auto'); }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="plus-circle"><Plus size={32} /></div>
          <p>Nouveau Logement</p>
        </motion.div>
      </div>

      {/* ═══════════════ SMART IMPORT MODAL ═══════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={resetModal}>
            <motion.div
              className="hybrid-modal glass-panel"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="modal-header">
                <div className="modal-header-left">
                  <div className="modal-header-icon">
                    {modalTab === 'auto' ? <Sparkles size={20} /> : <Plus size={20} />}
                  </div>
                  <h2>{modalTab === 'auto' ? 'Smart Import' : 'Ajout Manuel'}</h2>
                </div>
                <button className="btn-close" onClick={resetModal}><X size={20} /></button>
              </div>

              {/* Modal Tabs */}
              <div className="modal-tabs">
                <button className={`m-tab ${modalTab === 'auto' ? 'active' : ''}`} onClick={() => setModalTab('auto')}>
                  <Globe size={16} />
                  <span>Importation URL</span>
                </button>
                <button className={`m-tab ${modalTab === 'manual' ? 'active' : ''}`} onClick={() => setModalTab('manual')}>
                  <Plus size={16} />
                  <span>Saisie Manuelle</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="modal-body hide-scrollbar">

                {/* ─── AUTO IMPORT TAB ─── */}
                {modalTab === 'auto' && (
                  <div className="tab-content auto-import animate-in">

                    {/* URL Input Section */}
                    {!isImporting && !importedData && (
                      <>
                        <div className="smart-input-section">
                          <div className="smart-input-label">
                            <Zap size={14} className="label-icon" />
                            <span>Collez votre URL — Airbnb, Booking, Expedia ou Beds24</span>
                          </div>
                          <div className={`smart-url-input-wrap ${detectedSource ? 'detected' : ''}`}
                            style={detectedSource ? { borderColor: detectedSource.color } : {}}>
                            <Link2 size={18} className="url-input-icon" />
                            <input
                              type="text"
                              className="smart-url-input"
                              placeholder="https://www.airbnb.com/rooms/12345..."
                              value={importUrl}
                              onChange={e => setImportUrl(e.target.value)}
                              autoFocus
                            />
                            {importUrl && (
                              <button className="url-clear-btn" onClick={() => setImportUrl('')}>
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          {/* Source Badge */}
                          <AnimatePresence>
                            {detectedSource && (
                              <motion.div
                                className="source-badge"
                                style={{ background: detectedSource.bg, borderColor: detectedSource.color + '40', color: detectedSource.color }}
                                initial={{ opacity: 0, y: -8, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -8, height: 0 }}
                              >
                                <span className="source-emoji">{detectedSource.emoji}</span>
                                <div className="source-badge-text">
                                  <strong>{detectedSource.label}</strong>
                                  <span>{detectedSource.hint}</span>
                                </div>
                                <CheckCircle size={16} className="source-check" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Platform Shortcuts */}
                        <div className="platform-shortcuts">
                          <span className="shortcuts-label">Sources supportées :</span>
                          <div className="shortcuts-row">
                            {Object.entries(PLATFORMS).map(([key, p]) => (
                              <button
                                key={key}
                                className="platform-chip"
                                style={{ '--chip-color': p.color }}
                                onClick={() => setImportUrl(p.patterns[0] + '/rooms/example-123')}
                              >
                                <span>{p.emoji}</span>
                                <span>{p.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Import Button */}
                        <button
                          className={`btn-smart-import ${detectedSource ? 'ready' : ''}`}
                          onClick={handleSmartImport}
                          disabled={!importUrl.trim()}
                          style={detectedSource ? { background: detectedSource.color } : {}}
                        >
                          <Download size={18} />
                          <span>Importer &amp; Synchroniser</span>
                          {detectedSource && <span className="import-btn-source">via {detectedSource.label}</span>}
                        </button>
                      </>
                    )}

                    {/* ─── STEP LOADER ─── */}
                    {isImporting && (
                      <motion.div
                        className="import-loader"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="loader-header">
                          <div className="loader-spinner">
                            <div className="spinner-ring" style={{ borderTopColor: detectedSource?.color || '#3B82F6' }} />
                            <span className="loader-emoji">{detectedSource?.emoji || '🔗'}</span>
                          </div>
                          <div className="loader-title-block">
                            <h3>Extraction en cours…</h3>
                            <p>Connexion à {detectedSource?.label || 'la source'}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="import-progress-wrap">
                          <div
                            className="import-progress-bar"
                            style={{
                              width: `${progressPct}%`,
                              background: `linear-gradient(90deg, ${detectedSource?.color || '#3B82F6'}, ${detectedSource?.color || '#3B82F6'}aa)`
                            }}
                          />
                        </div>
                        <div className="progress-label">{progressPct}%</div>

                        {/* Steps List */}
                        <div className="import-steps">
                          {IMPORT_STEPS.map((step, idx) => {
                            const isDone = currentStep > idx;
                            const isActive = currentStep === idx + 1;
                            return (
                              <motion.div
                                key={step.id}
                                className={`import-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: currentStep >= idx ? 1 : 0.3, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                              >
                                <div className="step-icon" style={isDone ? { background: detectedSource?.color || '#10B981', borderColor: detectedSource?.color || '#10B981' } : {}}>
                                  {isDone ? <Check size={12} /> : <span className="step-dot" />}
                                </div>
                                <span className="step-label">{step.label}</span>
                                {isActive && <div className="step-pulse" style={{ background: detectedSource?.color || '#3B82F6' }} />}
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ─── PREVIEW CONFIRMATION CARD ─── */}
                    {importedData && !isImporting && (
                      <motion.div
                        className="preview-confirm-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 25 }}
                      >
                        {/* Success Banner */}
                        <div className="preview-success-banner" style={{ background: detectedSource?.color || '#10B981' }}>
                          <CheckCircle size={16} />
                          <span>Importation réussie depuis <strong>{detectedSource?.label || 'URL'}</strong></span>
                        </div>

                        {/* Hero Image Gallery */}
                        <div className="preview-gallery">
                          <img
                            src={importedData.images[activeImageIdx]}
                            alt={importedData.title}
                            className="preview-hero-img"
                          />
                          <div className="gallery-dots">
                            {importedData.images.map((_, i) => (
                              <button
                                key={i}
                                className={`gallery-dot ${i === activeImageIdx ? 'active' : ''}`}
                                style={i === activeImageIdx ? { background: detectedSource?.color || '#fff' } : {}}
                                onClick={() => setActiveImageIdx(i)}
                              />
                            ))}
                          </div>
                          <div className="preview-rating">
                            <Star size={12} fill="gold" color="gold" />
                            <span>{importedData.rating} ({importedData.reviews} avis)</span>
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="preview-details">
                          <h3 className="preview-title">{importedData.title}</h3>
                          <div className="preview-meta-row">
                            <div className="preview-meta-item">
                              <MapPin size={14} />
                              <span>{importedData.location}</span>
                            </div>
                            <div className="preview-price">
                              <span className="preview-price-value">{importedData.basePrice}€</span>
                              <span className="preview-price-unit">/nuit</span>
                            </div>
                          </div>
                          <p className="preview-description">{importedData.description}</p>

                          {/* Amenity Chips */}
                          <div className="preview-amenities">
                            {importedData.amenities.map((amenity) => (
                              <div key={amenity} className="amenity-chip" style={{ '--chip-accent': detectedSource?.color || '#3B82F6' }}>
                                {AMENITY_ICONS[amenity] || <Check size={12} />}
                                <span>{amenity}</span>
                              </div>
                            ))}
                          </div>

                          {/* Channel Sync Info */}
                          <div className="preview-channel-info">
                            <div className="channel-sync-badge" style={{ borderColor: detectedSource?.color + '30', background: detectedSource?.bg }}>
                              <span>{detectedSource?.emoji}</span>
                              <div>
                                <strong style={{ color: detectedSource?.color }}>Synchronisation active</strong>
                                <br />
                                <small>ID: {importedData.channelId}</small>
                              </div>
                              <div className="sync-pulse" style={{ background: detectedSource?.color }} />
                            </div>
                          </div>
                        </div>

                        {/* Confirm / Cancel Actions */}
                        <div className="preview-actions">
                          <button className="btn-cancel-import" onClick={() => { setImportedData(null); setCurrentStep(0); setIsImporting(false); }}>
                            <X size={16} />
                            <span>Recommencer</span>
                          </button>
                          <button
                            className="btn-confirm-import"
                            style={{ background: detectedSource?.color || '#10B981' }}
                            onClick={handleConfirmImport}
                          >
                            <Check size={16} />
                            <span>Confirmer &amp; Ajouter</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* ─── MANUAL TAB ─── */}
                {modalTab === 'manual' && (
                  <form className="tab-content manual-entry animate-in" onSubmit={handleManualSubmit}>
                    <div className="form-grid">
                      <div className="input-group full">
                        <label>Nom du logement</label>
                        <input type="text" placeholder="Ex: Villa Royale Marrakech" value={manualData.name}
                          onChange={e => setManualData({ ...manualData, name: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label>Type de bien</label>
                        <div className="type-icons">
                          {['Appartement', 'Riad', 'Villa'].map(t => (
                            <button key={t} type="button" className={`type-btn ${manualData.type === t ? 'active' : ''}`}
                              onClick={() => setManualData({ ...manualData, type: t })}>
                              {t === 'Appartement' && <Building2 size={24} />}
                              {t === 'Riad' && <Home size={24} />}
                              {t === 'Villa' && <Hotel size={24} />}
                              <span>{t}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="input-group">
                        <label>Localisation</label>
                        <input type="text" placeholder="Ville, Quartier" value={manualData.location}
                          onChange={e => setManualData({ ...manualData, location: e.target.value })} required />
                      </div>
                      <div className="input-group">
                        <label>Prix par nuit (€)</label>
                        <input type="number" value={manualData.price}
                          onChange={e => setManualData({ ...manualData, price: e.target.value })} />
                      </div>
                      <div className="input-group full">
                        <label>Photos (Drag &amp; Drop)</label>
                        <div className="dropzone">
                          <ImageIcon size={32} />
                          <p>Glissez vos fichiers ici</p>
                        </div>
                      </div>
                    </div>
                    <div className="form-footer">
                      <div className="automation-toggles">
                        <div className="toggle-item">
                          <Calendar size={16} /><span>Sync Calendrier auto</span>
                          <div className="ios-switch on"><div className="handle"></div></div>
                        </div>
                      </div>
                      <button type="submit" className="btn-primary-action">
                        <Check size={18} /><span>Créer le logement</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertiesManager;
