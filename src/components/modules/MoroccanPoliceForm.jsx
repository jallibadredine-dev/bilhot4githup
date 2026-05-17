import React, { useState, useMemo, useCallback } from 'react';
import {
  Shield, FileText, User, Calendar, MapPin, CreditCard, Printer,
  Send, CheckCircle, Download, Info, Camera, Upload, FileCheck,
  X, RotateCcw, Search, Eye, AlertCircle, Sparkles, ChevronRight,
  Clock, Check, ExternalLink, Zap, ArrowDownToLine, ClipboardList,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PolicePrintTemplate from './PolicePrintTemplate';
import { getAllCheckins } from '../../lib/checkin';
import './MoroccanPoliceForm.css';

/* ── Local declarations store ─────────────────────── */
const DECL_KEY = 'hosflow_police_declarations';

const getDeclarations = () => {
  try { return JSON.parse(localStorage.getItem(DECL_KEY) || '[]'); } catch { return []; }
};

const saveDeclaration = (data) => {
  const list = getDeclarations();
  const entry = {
    id: Date.now(),
    nom: data.nom, prenom: data.prenom,
    doc: data.numDocument,
    date: data.dateArrivee,
    nationalite: data.nationalite,
    status: 'Transmis',
    method: data.checkinId ? 'Check-in' : 'Manuel',
    checkinId: data.checkinId || null,
    signature: data.signature || null,
    submittedAt: new Date().toISOString(),
    fullData: { ...data },
  };
  list.unshift(entry);
  localStorage.setItem(DECL_KEY, JSON.stringify(list));
  return entry;
};

/* ── Blank form ───────────────────────────────────── */
const BLANK = {
  nom: '', prenom: '', dateNaissance: '', lieuNaissance: '',
  nationalite: 'Marocaine', profession: '', domicileHabituel: '',
  typeDocument: 'CNIE', numDocument: '', dateDelivrance: '',
  lieuDelivrance: '',
  dateArrivee: new Date().toISOString().split('T')[0],
  dureeSejour: '1',
  provenance: '', destination: '', motifVoyage: 'Tourisme',
  checkinId: null, signature: null,
};

/* ── Doc type mapper ──────────────────────────────── */
const mapDocType = (t) => {
  if (!t) return 'CNIE';
  const tl = t.toLowerCase();
  if (tl === 'passport' || tl === 'passeport') return 'Passeport';
  if (tl === 'carte_sejour') return 'Carte de Séjour';
  return 'CNIE';
};

/* ══════════════════════════════════════════════════ */
const MoroccanPoliceForm = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [formData, setFormData] = useState({ ...BLANK });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDoc, setScannedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [declarations, setDeclarations] = useState(getDeclarations());
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [importedCheckinId, setImportedCheckinId] = useState(null);
  const [printMode, setPrintMode] = useState(false);
  const [previewDecl, setPreviewDecl] = useState(null);

  /* ── Completed check-ins without a declaration ── */
  const completedCheckins = useMemo(() => {
    const declared = getDeclarations().map(d => d.checkinId).filter(Boolean);
    return getAllCheckins().filter(c =>
      c.status === 'completed' && !declared.includes(c.id)
    );
  }, [declarations]);

  /* ── Import from check-in ──────────────────────── */
  const importCheckin = useCallback((c) => {
    const id = c.identity || {};
    const nights = c.arrivalDate && c.departureDate
      ? Math.max(1, Math.round(
          (new Date(c.departureDate) - new Date(c.arrivalDate)) / 86400000
        ))
      : 1;

    setFormData({
      ...BLANK,
      nom: (id.lastName || '').toUpperCase(),
      prenom: id.firstName || '',
      nationalite: id.nationality || 'Marocaine',
      typeDocument: mapDocType(id.docType),
      numDocument: id.docNumber || '',
      dateArrivee: c.arrivalDate || BLANK.dateArrivee,
      dureeSejour: String(nights),
      checkinId: c.id,
      signature: c.signature || null,
    });
    setImportedCheckinId(c.id);
    setShowImportPanel(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedDoc({ name: 'PASSPORT_SCAN.PDF', size: '1.2 MB' });
      setFormData(prev => ({ ...prev, nom: 'ALAMI', prenom: 'Omar', numDocument: 'BE123456', nationalite: 'Marocaine' }));
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setScannedDoc({ name: file.name.toUpperCase(), size: `${(file.size / 1024 / 1024).toFixed(1)} MB` });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      const entry = saveDeclaration(formData);
      setDeclarations(getDeclarations());
      setIsSubmitted(false);
      setFormData({ ...BLANK });
      setScannedDoc(null);
      setImportedCheckinId(null);
      setActiveTab('history');
    }, 1800);
  };

  const handlePrint = () => {
    window.print();
  };

  /* ── Filtered history ──────────────────────────── */
  const filteredHistory = useMemo(() => {
    return declarations.filter(h => {
      const matchSearch = !searchTerm ||
        (h.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.doc || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.nationalite || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || h.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [declarations, searchTerm, filterStatus]);

  /* ── Print preview modal ───────────────────────── */
  if (printMode && previewDecl) {
    return (
      <div className="pf-print-preview-overlay">
        <div className="pf-print-preview-bar">
          <span>Aperçu impression — {previewDecl.nom} {previewDecl.prenom}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="pf-btn-print" onClick={handlePrint}><Printer size={15} /> Imprimer</button>
            <button className="pf-btn-close-print" onClick={() => { setPrintMode(false); setPreviewDecl(null); }}><X size={15} /> Fermer</button>
          </div>
        </div>
        <div className="pf-print-preview-body">
          <PolicePrintTemplate data={{ ...previewDecl.fullData, signature: previewDecl.signature }} />
        </div>
      </div>
    );
  }

  return (
    <div className="police-form-container">

      {/* ── HEADER ────────────────────────────────── */}
      <header className="police-form-header">
        <div className="header-title">
          <div className="icon-shield"><Shield size={24} /></div>
          <div>
            <h1>Fiches de Police (DGSN)</h1>
            <p>Déclarations individuelles d'hébergement — Maroc</p>
          </div>
        </div>
        <div className="header-tabs">
          <button className={`tab-link ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
            <FileText size={16} /> Nouvelle Fiche
            {completedCheckins.length > 0 && (
              <span className="pf-tab-badge">{completedCheckins.length}</span>
            )}
          </button>
          <button className={`tab-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <RotateCcw size={16} /> Historique
            {declarations.length > 0 && <span className="pf-tab-count">{declarations.length}</span>}
          </button>
        </div>
      </header>

      <div className="police-form-layout">
        <div className="main-content-area">
          <AnimatePresence mode="wait">

            {/* ════════════ ONGLET NOUVELLE FICHE ════════════ */}
            {activeTab === 'new' && (
              <motion.div key="new" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>

                {/* ── Import banner ──────────────────── */}
                {completedCheckins.length > 0 && !importedCheckinId && (
                  <div className="pf-import-banner">
                    <div className="pf-import-banner-left">
                      <div className="pf-import-icon"><Sparkles size={18} /></div>
                      <div>
                        <strong>{completedCheckins.length} check-in{completedCheckins.length > 1 ? 's' : ''} validé{completedCheckins.length > 1 ? 's' : ''} en attente de déclaration</strong>
                        <p>Importez les données d'identité en un clic — aucune saisie manuelle.</p>
                      </div>
                    </div>
                    <button className="pf-btn-import" onClick={() => setShowImportPanel(true)}>
                      <ArrowDownToLine size={15} /> Importer depuis Check-in <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                {/* ── Imported badge ─────────────────── */}
                {importedCheckinId && (
                  <div className="pf-imported-badge">
                    <Check size={15} />
                    <span>Données importées depuis le Check-in Digital · Signature incluse</span>
                    <button onClick={() => { setImportedCheckinId(null); setFormData({ ...BLANK }); }}><X size={13} /></button>
                  </div>
                )}

                <form className="police-main-form glass-panel" onSubmit={handleSubmit}>

                  {/* Section 0: Scan */}
                  <div className="form-section document-capture-section">
                    <h3 className="section-label"><Camera size={18} /> Numérisation du Document</h3>
                    <div className="capture-controls">
                      <button type="button" className={`btn-capture-scan ${isScanning ? 'scanning' : ''}`} onClick={simulateScan}>
                        {isScanning ? <><RotateCcw size={18} className="spinning" /> Scan en cours…</> : <><Camera size={18} /> Scanner Passeport / CIN</>}
                      </button>
                      <div className="upload-dropzone">
                        <Upload size={20} className="text-muted" />
                        <div className="dropzone-text">
                          <p>Glisser ou joindre le PDF</p>
                          <span>Max 5MB (PDF, PNG, JPG)</span>
                        </div>
                        <input type="file" className="file-input-overlay" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
                      </div>
                    </div>
                    {scannedDoc && (
                      <div className="scanned-preview-bar">
                        <div className="doc-info">
                          <FileCheck size={18} className="text-green" />
                          <div className="doc-meta">
                            <span className="doc-name">{scannedDoc.name}</span>
                            <span className="doc-size">{scannedDoc.size} · Prêt pour télétransmission</span>
                          </div>
                        </div>
                        <button type="button" className="btn-remove-doc" onClick={() => setScannedDoc(null)}><X size={14} /></button>
                      </div>
                    )}
                  </div>

                  {/* Section 1: État Civil */}
                  <div className="form-section">
                    <h3 className="section-label"><User size={18} /> État Civil / البيانات الشخصية</h3>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Nom / اللقب</label>
                        <input name="nom" value={formData.nom} onChange={handleChange} placeholder="Ex: ALAMI" required />
                      </div>
                      <div className="input-group">
                        <label>Prénom / الاسم</label>
                        <input name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Ex: Omar" required />
                      </div>
                      <div className="input-group">
                        <label>Date de naissance</label>
                        <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} />
                      </div>
                      <div className="input-group">
                        <label>Lieu de naissance</label>
                        <input name="lieuNaissance" value={formData.lieuNaissance} onChange={handleChange} placeholder="Ville / Pays" />
                      </div>
                      <div className="input-group">
                        <label>Nationalité</label>
                        <select name="nationalite" value={formData.nationalite} onChange={handleChange}>
                          {['Marocaine','Française','Espagnole','Américaine','Britannique','Belge','Néerlandaise','Canadienne','Allemande','Italienne','Autre'].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Profession</label>
                        <input name="profession" value={formData.profession} onChange={handleChange} placeholder="Ex: Ingénieur" />
                      </div>
                      <div className="input-group pf-full">
                        <label>Domicile habituel</label>
                        <input name="domicileHabituel" value={formData.domicileHabituel} onChange={handleChange} placeholder="Adresse complète de résidence" />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Pièce d'identité */}
                  <div className="form-section">
                    <h3 className="section-label"><CreditCard size={18} /> Pièce d'Identité / وثيقة الهوية</h3>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Type de document</label>
                        <select name="typeDocument" value={formData.typeDocument} onChange={handleChange}>
                          <option value="CNIE">CNIE (Carte Nationale)</option>
                          <option value="Passeport">Passeport</option>
                          <option value="Carte de Séjour">Carte de Séjour</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>N° du Document</label>
                        <input name="numDocument" value={formData.numDocument} onChange={handleChange} placeholder="Ex: BE123456" required />
                      </div>
                      <div className="input-group">
                        <label>Délivré le</label>
                        <input type="date" name="dateDelivrance" value={formData.dateDelivrance} onChange={handleChange} />
                      </div>
                      <div className="input-group">
                        <label>À (Lieu de délivrance)</label>
                        <input name="lieuDelivrance" value={formData.lieuDelivrance} onChange={handleChange} placeholder="Ex: Rabat" />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Séjour */}
                  <div className="form-section">
                    <h3 className="section-label"><Calendar size={18} /> Détails du Séjour / تفاصيل الإقامة</h3>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Date d'arrivée</label>
                        <input type="date" name="dateArrivee" value={formData.dateArrivee} onChange={handleChange} required />
                      </div>
                      <div className="input-group">
                        <label>Durée prévue (jours)</label>
                        <input type="number" name="dureeSejour" value={formData.dureeSejour} onChange={handleChange} min="1" />
                      </div>
                      <div className="input-group">
                        <label>Provenance (venu de)</label>
                        <input name="provenance" value={formData.provenance} onChange={handleChange} placeholder="Dernière ville visitée" />
                      </div>
                      <div className="input-group">
                        <label>Destination (allant à)</label>
                        <input name="destination" value={formData.destination} onChange={handleChange} placeholder="Prochaine étape" />
                      </div>
                      <div className="input-group pf-full">
                        <label>Motif du voyage</label>
                        <div className="radio-group">
                          {['Tourisme','Affaires','Mission','Santé','Autre'].map(m => (
                            <label key={m} className="radio-label">
                              <input type="radio" name="motifVoyage" value={m} checked={formData.motifVoyage === m} onChange={handleChange} />
                              {m}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signature preview if imported */}
                  {formData.signature && (
                    <div className="form-section pf-sig-section">
                      <h3 className="section-label"><FileCheck size={18} /> Signature Digitale (depuis Check-in)</h3>
                      <div className="pf-sig-preview-row">
                        <img src={formData.signature} alt="signature" className="pf-sig-img" />
                        <div className="pf-sig-legal">
                          Signature capturée lors du check-in digital.<br />
                          Valeur légale conformément au règlement eIDAS.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-footer">
                    <div className="legal-notice">
                      <Info size={14} />
                      <p>Ces données sont collectées pour le compte de la DGSN. Télétransmission sécurisée dans les 24h.</p>
                    </div>
                    <button type="submit" className="btn-submit" disabled={isSubmitted}>
                      {isSubmitted
                        ? <><CheckCircle size={18} /> Transmission en cours…</>
                        : <><Send size={18} /> Valider et Télétransmettre</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ════════════ ONGLET HISTORIQUE ════════════ */}
            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                {declarations.length === 0 ? (
                  <div className="pf-history-empty glass-panel">
                    <ClipboardList size={38} />
                    <h3>Aucune déclaration soumise</h3>
                    <p>Les fiches de police transmises apparaîtront ici.</p>
                    <button className="pf-btn-new" onClick={() => setActiveTab('new')}><FileText size={14} /> Créer une fiche</button>
                  </div>
                ) : (
                  <div className="police-history-view glass-panel">
                    <div className="history-header">
                      <div className="search-bar-history">
                        <Search size={16} />
                        <input
                          type="text"
                          placeholder="Rechercher par nom, n° document…"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="history-filters">
                        {['all','Transmis','Erreur'].map(s => (
                          <button
                            key={s}
                            className={`btn-filter-tag ${filterStatus === s ? 'active' : ''}`}
                            onClick={() => setFilterStatus(s)}
                          >
                            {s === 'all' ? 'Tous' : s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="history-table-wrapper">
                      <table className="police-table">
                        <thead>
                          <tr>
                            <th>Nom & Prénom</th>
                            <th>N° Document</th>
                            <th>Nationalité</th>
                            <th>Date d'Arrivée</th>
                            <th>Méthode</th>
                            <th>Statut DGSN</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredHistory.map(row => (
                            <tr key={row.id}>
                              <td className="font-bold">{row.nom} {row.prenom}</td>
                              <td className="text-muted pf-mono">{row.doc}</td>
                              <td>{row.nationalite || '–'}</td>
                              <td>{row.date}</td>
                              <td>
                                <span className={`method-badge ${row.method === 'Check-in' ? 'checkin' : ''}`}>
                                  {row.method === 'Check-in' && <Sparkles size={11} />}
                                  {row.method}
                                </span>
                              </td>
                              <td>
                                <span className={`status-badge ${row.status === 'Transmis' ? 'success' : 'error'}`}>
                                  {row.status === 'Transmis' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                  {row.status}
                                </span>
                              </td>
                              <td className="table-actions">
                                <button
                                  className="btn-table-icon"
                                  title="Aperçu & Impression"
                                  onClick={() => { setPreviewDecl(row); setPrintMode(true); }}
                                >
                                  <Printer size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── SIDEBAR ────────────────────────────── */}
        <aside className="police-form-sidebar">
          <div className="info-card glass-panel">
            <h3><Shield size={18} color="var(--accent-blue)" /> Guide de Saisie</h3>
            <ul className="guide-list">
              <li>Noms en MAJUSCULES, exactement comme sur le document.</li>
              <li>Passeport obligatoire pour les étrangers non-résidents.</li>
              <li>Télétransmission sous <strong>24h</strong> obligatoire.</li>
              <li>Conserver une copie du document 6 mois.</li>
            </ul>
          </div>

          {completedCheckins.length > 0 && (
            <div className="pf-checkin-sidebar-card glass-panel">
              <div className="pf-cs-header">
                <Sparkles size={15} />
                <strong>Check-ins en attente</strong>
                <span className="pf-cs-count">{completedCheckins.length}</span>
              </div>
              <p className="pf-cs-sub">Importez les données identité en un clic.</p>
              <button className="pf-cs-btn" onClick={() => { setActiveTab('new'); setShowImportPanel(true); }}>
                <ArrowDownToLine size={14} /> Importer maintenant
              </button>
              <div className="pf-cs-list">
                {completedCheckins.slice(0, 3).map(c => (
                  <div key={c.id} className="pf-cs-item">
                    <span className="pf-cs-name">{c.identity?.firstName} {c.identity?.lastName}</span>
                    <span className="pf-cs-prop">{c.propertyName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="status-card glass-panel">
            <div className="status-header">
              <div className="pulse-green" />
              <h3>Connexion DGSN</h3>
            </div>
            <p>Système opérationnel.</p>
            <button className="btn-text">Vérifier certificat</button>
          </div>

          <div className="quick-stats-police glass-panel">
            <div className="q-stat">
              <span className="q-label">Total</span>
              <span className="q-val">{declarations.length}</span>
            </div>
            <div className="q-stat">
              <span className="q-label">Ce mois</span>
              <span className="q-val">
                {declarations.filter(d => new Date(d.submittedAt).getMonth() === new Date().getMonth()).length}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Hidden print template */}
      <PolicePrintTemplate data={formData} />

      {/* ── IMPORT CHECKIN MODAL ─────────────────── */}
      <AnimatePresence>
        {showImportPanel && (
          <div className="pf-overlay" onClick={() => setShowImportPanel(false)}>
            <motion.div
              className="pf-import-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="pf-modal-close" onClick={() => setShowImportPanel(false)}><X size={18} /></button>
              <div className="pf-modal-header">
                <div className="pf-modal-icon"><ArrowDownToLine size={22} /></div>
                <h2>Importer depuis Check-in Digital</h2>
                <p>Sélectionnez un check-in validé pour pré-remplir automatiquement la fiche de police.</p>
              </div>

              {completedCheckins.length === 0 ? (
                <div className="pf-modal-empty">
                  <CheckCircle size={32} />
                  <p>Tous les check-ins validés ont déjà une déclaration.</p>
                </div>
              ) : (
                <div className="pf-checkin-cards">
                  {completedCheckins.map(c => (
                    <motion.button
                      key={c.id}
                      className="pf-checkin-card"
                      onClick={() => importCheckin(c)}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="pf-cc-avatar">{c.identity?.firstName?.charAt(0) || c.guestName?.charAt(0) || '?'}</div>
                      <div className="pf-cc-body">
                        <div className="pf-cc-name">
                          {(c.identity?.firstName || '')} {(c.identity?.lastName || c.guestName || '')}
                        </div>
                        <div className="pf-cc-detail">
                          <span>{c.propertyName}</span>
                          <span>·</span>
                          <span>{c.arrivalDate} → {c.departureDate}</span>
                        </div>
                        <div className="pf-cc-id">
                          {c.identity?.docType?.toUpperCase()} · {c.identity?.docNumber}
                          {c.signature && <span className="pf-cc-sig-badge"><Check size={9} /> Signature</span>}
                        </div>
                      </div>
                      <div className="pf-cc-arrow"><ChevronRight size={18} /></div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoroccanPoliceForm;
