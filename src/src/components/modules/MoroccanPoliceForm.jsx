import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Printer, 
  Send, 
  CheckCircle,
  Download,
  Info,
  Camera,
  Upload,
  FileCheck,
  X,
  RotateCcw,
  Search,
  List,
  Eye,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PolicePrintTemplate from './PolicePrintTemplate';
import './MoroccanPoliceForm.css';

const MoroccanPoliceForm = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    nationalite: 'Marocaine',
    profession: '',
    domicileHabituel: '',
    typeDocument: 'CNIE',
    numDocument: '',
    dateDelivrance: '',
    lieuDelivrance: '',
    dateArrivee: new Date().toISOString().split('T')[0],
    dureeSejour: '1',
    provenance: '',
    destination: '',
    motifVoyage: 'Tourisme'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDoc, setScannedDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const historyData = useMemo(() => [
    { id: 1, nom: 'ALAMI', prenom: 'Omar', doc: 'BE123456', date: '2026-04-26', status: 'Transmis', method: 'API' },
    { id: 2, nom: 'MERTENS', prenom: 'Alice', doc: 'EP998877', date: '2026-04-25', status: 'Transmis', method: 'API' },
    { id: 3, nom: 'THOMPSON', prenom: 'Mark', doc: 'US445566', date: '2026-04-24', status: 'Erreur', method: 'Manuel' },
    { id: 4, nom: 'DUBOIS', prenom: 'Jean-Pierre', doc: 'FR112233', date: '2026-04-23', status: 'Transmis', method: 'API' },
  ], []);

  const filteredHistory = historyData.filter(h => 
    h.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.doc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScannedDoc({ name: 'PASSPORT_SCAN_ALAMI.PDF', size: '1.2 MB' });
      setFormData(prev => ({
        ...prev,
        nom: 'ALAMI',
        prenom: 'Omar',
        numDocument: 'BE123456',
        nationalite: 'Marocaine'
      }));
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScannedDoc({ name: file.name.toUpperCase(), size: `${(file.size / 1024 / 1024).toFixed(1)} MB` });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
       setIsSubmitted(false);
       setActiveTab('history');
    }, 2000);
  };

  return (
    <div className="police-form-container">
      <header className="police-form-header">
        <div className="header-title">
           <div className="icon-shield">
             <Shield size={24} />
           </div>
           <div>
             <h1>Fiches de Police (DGSN)</h1>
             <p>Gestion réglementaire des déclarations individuelles.</p>
           </div>
        </div>
        <div className="header-tabs">
           <button className={`tab-link ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
             <FileText size={16} /> Nouvelle Fiche
           </button>
           <button className={`tab-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
             <RotateCcw size={16} /> Historique & Suivi
           </button>
        </div>
      </header>

      <div className="police-form-layout">
        <div className="main-content-area">
          <AnimatePresence mode="wait">
            {activeTab === 'new' ? (
              <motion.div 
                key="new"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <form className="police-main-form glass-panel" onSubmit={handleSubmit}>
                  {/* Section 0: Document Capture */}
                  <div className="form-section document-capture-section">
                    <h3 className="section-label"><Camera size={18} /> Numérisation du Document</h3>
                    <div className="capture-controls">
                        <button type="button" className={`btn-capture-scan ${isScanning ? 'scanning' : ''}`} onClick={simulateScan}>
                          {isScanning ? <><RotateCcw size={18} className="spinning" /> Scan en cours...</> : <><Camera size={18} /> Scanner Passeport / CIN</>}
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
                              <span className="doc-size">{scannedDoc.size} • Prêt pour télétransmission</span>
                          </div>
                        </div>
                        <button type="button" className="btn-remove-doc" onClick={() => setScannedDoc(null)}><X size={14} /></button>
                      </div>
                    )}
                  </div>

                  {/* Section 1: État Civil */}
                  <div className="form-section">
                    <h3 className="section-label"><User size={18} /> État Civil / Personal Details</h3>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Nom / Last Name</label>
                        <input name="nom" value={formData.nom} onChange={handleChange} placeholder="Ex: ALAMI" required />
                      </div>
                      <div className="input-group">
                        <label>Prénom / First Name</label>
                        <input name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Ex: Omar" required />
                      </div>
                      <div className="input-group">
                        <label>Date de Naissance</label>
                        <input type="date" name="dateNaissance" value={formData.dateNaissance} onChange={handleChange} required />
                      </div>
                      <div className="input-group">
                        <label>Lieu de Naissance</label>
                        <input name="lieuNaissance" value={formData.lieuNaissance} onChange={handleChange} placeholder="Ville / Pays" required />
                      </div>
                      <div className="input-group">
                        <label>Nationalité</label>
                        <select name="nationalite" value={formData.nationalite} onChange={handleChange}>
                          <option value="Marocaine">Marocaine</option>
                          <option value="Française">Française</option>
                          <option value="Espagnole">Espagnole</option>
                          <option value="Américaine">Américaine</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>Profession</label>
                        <input name="profession" value={formData.profession} onChange={handleChange} placeholder="Ex: Ingénieur" />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Pièce d'identité */}
                  <div className="form-section">
                    <h3 className="section-label"><CreditCard size={18} /> Pièce d'Identité / ID Document</h3>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Type de Document</label>
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
                    <h3 className="section-label"><Calendar size={18} /> Détails du Séjour / Stay Details</h3>
                    <div className="form-grid">
                      <div className="input-group">
                        <label>Date d'Arrivée</label>
                        <input type="date" name="dateArrivee" value={formData.dateArrivee} onChange={handleChange} required />
                      </div>
                      <div className="input-group">
                        <label>Durée prévue (Jours)</label>
                        <input type="number" name="dureeSejour" value={formData.dureeSejour} onChange={handleChange} min="1" />
                      </div>
                      <div className="input-group">
                        <label>Provenance (Venu de)</label>
                        <input name="provenance" value={formData.provenance} onChange={handleChange} placeholder="Dernière ville visitée" />
                      </div>
                      <div className="input-group">
                        <label>Destination (Allant à)</label>
                        <input name="destination" value={formData.destination} onChange={handleChange} placeholder="Prochaine étape" />
                      </div>
                      <div className="input-group full-width">
                        <label>Motif du Voyage</label>
                        <div className="radio-group">
                          {['Tourisme', 'Affaires', 'Mission', 'Santé', 'Autre'].map(motif => (
                            <label key={motif} className="radio-label">
                              <input 
                                type="radio" 
                                name="motifVoyage" 
                                value={motif} 
                                checked={formData.motifVoyage === motif}
                                onChange={handleChange}
                              />
                              {motif}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-footer">
                    <div className="legal-notice">
                      <Info size={14} />
                      <p>Ces données sont collectées pour le compte de la DGSN. Télétransmission sécurisée.</p>
                    </div>
                    <button type="submit" className="btn-submit" disabled={isSubmitted}>
                      {isSubmitted ? <><CheckCircle size={18} /> Transmission...</> : <><Send size={18} /> Valider et Télétransmettre</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="police-history-view glass-panel"
              >
                <div className="history-header">
                   <div className="search-bar-history">
                      <Search size={16} />
                      <input 
                        type="text" 
                        placeholder="Rechercher par nom ou n° document..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                   </div>
                   <div className="history-filters">
                      <button className="btn-filter-tag active">Tous</button>
                      <button className="btn-filter-tag">Transmis</button>
                      <button className="btn-filter-tag">En attente</button>
                   </div>
                </div>

                <div className="history-table-wrapper">
                   <table className="police-table">
                      <thead>
                         <tr>
                            <th>Nom & Prénom</th>
                            <th>N° Document</th>
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
                               <td className="text-muted">{row.doc}</td>
                               <td>{row.date}</td>
                               <td><span className="method-badge">{row.method}</span></td>
                               <td>
                                  <span className={`status-badge ${row.status === 'Transmis' ? 'success' : 'error'}`}>
                                     {row.status === 'Transmis' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                     {row.status}
                                  </span>
                               </td>
                               <td className="table-actions">
                                  <button className="btn-table-icon" title="Voir"><Eye size={16} /></button>
                                  <button className="btn-table-icon" title="Imprimer"><Printer size={16} /></button>
                                  <button className="btn-table-icon" title="Partager"><Download size={16} /></button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: Help & Info */}
        <aside className="police-form-sidebar">
          <div className="info-card glass-panel">
            <h3><Shield size={18} color="var(--accent-blue)" /> Guide de Saisie</h3>
            <ul className="guide-list">
              <li>Assurez-vous que les noms correspondent exactement à la pièce d'identité.</li>
              <li>Le n° de Passeport est obligatoire pour les étrangers.</li>
              <li>Télétransmission sous 24h obligatoire.</li>
            </ul>
          </div>

          <div className="status-card glass-panel">
             <div className="status-header">
               <div className="pulse-green"></div>
               <h3>Connexion DGSN</h3>
             </div>
             <p>Système opérationnel.</p>
             <button className="btn-text">Vérifier certificat</button>
          </div>

          <div className="quick-stats-police glass-panel">
             <div className="q-stat">
                <span className="q-label">Total Mois</span>
                <span className="q-val">42</span>
             </div>
             <div className="q-stat">
                <span className="q-label">Aujourd'hui</span>
                <span className="q-val">3</span>
             </div>
          </div>
        </aside>
      </div>
      <PolicePrintTemplate data={formData} />
    </div>
  );
};

export default MoroccanPoliceForm;
