import React, { useState, useEffect } from 'react';
import {
  PlusCircle, Copy, Check, Trash2, ExternalLink, User,
  Calendar, Key, Clock, CheckCircle2, AlertCircle, XCircle,
  Link as LinkIcon, Eye, Shield, Smartphone, Wifi, Home,
  Mail, Phone, FileText, ChevronRight, Search, Filter, X,
  Building2, QrCode, Download, Send, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllCheckins, createCheckin, deleteCheckin,
  buildCheckinURL, fmtDateLong,
} from '../../lib/checkin';
import './CheckinManager.css';

const EMPTY_FORM = {
  guestName: '', guestEmail: '', guestPhone: '',
  propertyName: '', propertyAddress: '', propertyDesc: '',
  propertyEmoji: '🏡',
  pin: '', lockName: '',
  arrivalDate: '', departureDate: '',
  wifiName: '', wifiPassword: '',
  houseRules: `Merci de respecter les règles de la maison.
Pas de fêtes ni de soirées.
Fumée interdite à l'intérieur.
Animaux non autorisés sans accord préalable.
Check-out avant 12h, check-in à partir de 14h.
Merci de laisser le logement propre à votre départ.`,
};

const STATUS_LABELS = {
  pending:   { label: 'En attente',  color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  completed: { label: 'Validé',      color: '#10B981', bg: '#D1FAE5', border: '#6EE7B7' },
  expired:   { label: 'Expiré',      color: '#94A3B8', bg: '#F1F5F9', border: '#CBD5E1' },
};

const CheckinManager = () => {
  const [checkins, setCheckins] = useState(getAllCheckins());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [copied, setCopied] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeFormTab, setActiveFormTab] = useState('guest');

  const refresh = () => setCheckins(getAllCheckins());

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2500);
    });
  };

  const handleCreate = () => {
    const checkin = createCheckin(form);
    refresh();
    setShowForm(false);
    setForm(EMPTY_FORM);
    setActiveFormTab('guest');
    setSelectedId(checkin.id);
  };

  const handleDelete = (id) => {
    deleteCheckin(id);
    if (selectedId === id) setSelectedId(null);
    refresh();
  };

  const getStatus = (c) => {
    if (c.status === 'completed') return 'completed';
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return 'expired';
    return 'pending';
  };

  const filtered = checkins.filter(c => {
    const matchSearch = !search || c.guestName.toLowerCase().includes(search.toLowerCase()) ||
      c.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      c.guestEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || getStatus(c) === filterStatus;
    return matchSearch && matchStatus;
  });

  const selected = selectedId ? checkins.find(c => c.id === selectedId) : null;

  const counts = {
    all: checkins.length,
    pending: checkins.filter(c => getStatus(c) === 'pending').length,
    completed: checkins.filter(c => getStatus(c) === 'completed').length,
  };

  const FORM_TABS = [
    { id: 'guest', label: 'Client & Séjour', icon: User },
    { id: 'property', label: 'Propriété', icon: Home },
    { id: 'access', label: 'Accès', icon: Key },
    { id: 'rules', label: 'Règles', icon: FileText },
  ];

  return (
    <div className="cm2-wrapper">
      {/* ── HEADER ─────────────────────────────── */}
      <div className="cm2-header">
        <div className="cm2-header-left">
          <div className="cm2-icon-badge"><CheckCircle2 size={20} /></div>
          <div>
            <h1 className="cm2-title">Check-in Digital</h1>
            <p className="cm2-subtitle">Créez des liens de check-in personnalisés et suivez les validations.</p>
          </div>
        </div>
        <button className="cm2-btn-create" onClick={() => setShowForm(true)}>
          <PlusCircle size={16} /> Nouveau check-in
        </button>
      </div>

      {/* ── STATS ──────────────────────────────── */}
      <div className="cm2-stats">
        <div className="cm2-stat">
          <div className="cm2-stat-val">{counts.all}</div>
          <div className="cm2-stat-label">Total</div>
        </div>
        <div className="cm2-stat success">
          <div className="cm2-stat-val">{counts.completed}</div>
          <div className="cm2-stat-label">Validés</div>
        </div>
        <div className="cm2-stat pending">
          <div className="cm2-stat-val">{counts.pending}</div>
          <div className="cm2-stat-label">En attente</div>
        </div>
        <div className="cm2-stat rate">
          <div className="cm2-stat-val">
            {counts.all ? Math.round((counts.completed / counts.all) * 100) : 0}%
          </div>
          <div className="cm2-stat-label">Taux completion</div>
        </div>
      </div>

      {/* ── TOOLBAR ────────────────────────────── */}
      <div className="cm2-toolbar">
        <div className="cm2-search-wrap">
          <Search size={14} />
          <input
            type="text"
            placeholder="Chercher un client ou une propriété…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="cm2-clear-btn" onClick={() => setSearch('')}><X size={13} /></button>}
        </div>
        <div className="cm2-filter-btns">
          {['all', 'pending', 'completed'].map(s => (
            <button
              key={s}
              className={`cm2-filter-btn ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'Tous' : s === 'pending' ? 'En attente' : 'Validés'}
              <span className="cm2-filter-count">
                {s === 'all' ? counts.all : s === 'pending' ? counts.pending : counts.completed}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT ────────────────────────── */}
      <div className="cm2-layout">

        {/* ── LIST ─── */}
        <div className="cm2-list">
          {filtered.length === 0 ? (
            <div className="cm2-empty">
              <CheckCircle2 size={36} />
              <h3>Aucun check-in {search ? 'trouvé' : 'créé'}</h3>
              {!search && <button className="cm2-btn-create-sm" onClick={() => setShowForm(true)}><PlusCircle size={13} /> Créer le premier</button>}
            </div>
          ) : (
            filtered.map(c => {
              const st = getStatus(c);
              const stInfo = STATUS_LABELS[st];
              const url = buildCheckinURL(c.token);
              return (
                <motion.div
                  key={c.id}
                  className={`cm2-item ${selectedId === c.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="cm2-item-avatar">
                    {c.guestName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="cm2-item-body">
                    <div className="cm2-item-name">{c.guestName || 'Client'}</div>
                    <div className="cm2-item-prop">{c.propertyName}</div>
                    <div className="cm2-item-dates">
                      {c.arrivalDate} → {c.departureDate}
                    </div>
                  </div>
                  <div className="cm2-item-right">
                    <div className="cm2-status-chip" style={{ color: stInfo.color, background: stInfo.bg, border: `1px solid ${stInfo.border}` }}>
                      {st === 'completed' ? <CheckCircle2 size={10} /> : st === 'expired' ? <XCircle size={10} /> : <Clock size={10} />}
                      {stInfo.label}
                    </div>
                    <div className="cm2-item-actions">
                      <button
                        className="cm2-item-btn"
                        onClick={e => { e.stopPropagation(); copyText(url, c.id); }}
                        title="Copier le lien"
                      >
                        {copied === c.id ? <Check size={13} /> : <LinkIcon size={13} />}
                      </button>
                      <button
                        className="cm2-item-btn red"
                        onClick={e => { e.stopPropagation(); handleDelete(c.id); }}
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* ── DETAIL PANEL ─── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="cm2-detail"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
            >
              <div className="cm2-detail-header">
                <div className="cm2-detail-avatar">{selected.guestName?.charAt(0)?.toUpperCase() || '?'}</div>
                <div>
                  <h3>{selected.guestName || 'Client'}</h3>
                  <span>{selected.propertyName}</span>
                </div>
                <button className="cm2-detail-close" onClick={() => setSelectedId(null)}><X size={16} /></button>
              </div>

              {/* Link */}
              <div className="cm2-detail-link">
                <div className="cm2-link-url">{buildCheckinURL(selected.token)}</div>
                <button className="cm2-copy-link-btn" onClick={() => copyText(buildCheckinURL(selected.token), 'detail-url')}>
                  {copied === 'detail-url' ? <><Check size={13} /> Copié !</> : <><Copy size={13} /> Copier</>}
                </button>
              </div>

              {/* Share buttons */}
              <div className="cm2-share-row">
                <a
                  href={`https://wa.me/${(selected.guestPhone||'').replace(/[^\d+]/g,'')}?text=${encodeURIComponent(`Bonjour ${selected.guestName} ! Voici votre lien de check-in Hova : ${buildCheckinURL(selected.token)}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="cm2-share-btn whatsapp"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
                <a
                  href={`mailto:${selected.guestEmail}?subject=Votre check-in — ${selected.propertyName}&body=Bonjour ${selected.guestName},%0A%0AVoici votre lien de check-in :%0A${buildCheckinURL(selected.token)}%0A%0AÀ bientôt !`}
                  className="cm2-share-btn email"
                >
                  <Mail size={15} /> Email
                </a>
                <a href={buildCheckinURL(selected.token)} target="_blank" rel="noreferrer" className="cm2-share-btn preview">
                  <ExternalLink size={15} /> Prévisualiser
                </a>
              </div>

              {/* Status */}
              {selected.status === 'completed' && (
                <div className="cm2-completed-banner">
                  <CheckCircle2 size={16} />
                  <div>
                    <strong>Check-in validé</strong>
                    <span>{selected.completedAt ? new Date(selected.completedAt).toLocaleString('fr', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                </div>
              )}

              {/* Tabs for detail data */}
              <div className="cm2-detail-rows">
                {selected.guestEmail && (
                  <div className="cm2-detail-row"><Mail size={13} /><span>{selected.guestEmail}</span></div>
                )}
                {selected.guestPhone && (
                  <div className="cm2-detail-row"><Phone size={13} /><span>{selected.guestPhone}</span></div>
                )}
                <div className="cm2-detail-row">
                  <Calendar size={13} />
                  <span>{fmtDateLong(selected.arrivalDate)} → {fmtDateLong(selected.departureDate)}</span>
                </div>
                {selected.pin && (
                  <div className="cm2-detail-row">
                    <Key size={13} />
                    <span>PIN : <strong style={{ fontFamily: 'monospace', color: '#6366F1' }}>{selected.pin}</strong></span>
                  </div>
                )}
                {selected.wifiName && (
                  <div className="cm2-detail-row">
                    <Wifi size={13} />
                    <span>Wi-Fi : {selected.wifiName} / <code>{selected.wifiPassword}</code></span>
                  </div>
                )}
              </div>

              {/* Identity (if completed) */}
              {selected.identity && (
                <div className="cm2-identity-card">
                  <div className="cm2-identity-title"><Shield size={13} /> Identité vérifiée</div>
                  <div className="cm2-identity-row"><User size={12} />{selected.identity.firstName} {selected.identity.lastName}</div>
                  {selected.identity.docNumber && (
                    <div className="cm2-identity-row"><FileText size={12} />{selected.identity.docType?.toUpperCase()} · {selected.identity.docNumber}</div>
                  )}
                  {selected.signature && (
                    <div className="cm2-sig-preview">
                      <span>Signature</span>
                      <img src={selected.signature} alt="signature" />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CREATE MODAL ─────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <div className="cm2-overlay" onClick={() => setShowForm(false)}>
            <motion.div
              className="cm2-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="cm2-modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
              <div className="cm2-modal-header">
                <div className="cm2-modal-icon"><PlusCircle size={22} /></div>
                <h2>Nouveau check-in digital</h2>
                <p>Créez un lien personnalisé à envoyer à votre client.</p>
              </div>

              <div className="cm2-modal-tabs">
                {FORM_TABS.map(t => (
                  <button
                    key={t.id}
                    className={`cm2-modal-tab ${activeFormTab === t.id ? 'active' : ''}`}
                    onClick={() => setActiveFormTab(t.id)}
                  >
                    <t.icon size={13} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div className="cm2-modal-body">

                {/* Guest & Stay */}
                {activeFormTab === 'guest' && (
                  <div className="cm2-form-section">
                    <div className="cm2-form-row">
                      <div className="cm2-field">
                        <label>Nom du client</label>
                        <input type="text" placeholder="Marie Dupont" value={form.guestName}
                          onChange={e => setForm(p => ({ ...p, guestName: e.target.value }))} />
                      </div>
                      <div className="cm2-field">
                        <label>Email</label>
                        <input type="email" placeholder="marie@email.com" value={form.guestEmail}
                          onChange={e => setForm(p => ({ ...p, guestEmail: e.target.value }))} />
                      </div>
                    </div>
                    <div className="cm2-form-row">
                      <div className="cm2-field">
                        <label>Téléphone</label>
                        <input type="tel" placeholder="+212 6 00 00 00 00" value={form.guestPhone}
                          onChange={e => setForm(p => ({ ...p, guestPhone: e.target.value }))} />
                      </div>
                    </div>
                    <div className="cm2-form-row">
                      <div className="cm2-field">
                        <label>Date d'arrivée</label>
                        <input type="date" value={form.arrivalDate}
                          onChange={e => setForm(p => ({ ...p, arrivalDate: e.target.value }))} />
                      </div>
                      <div className="cm2-field">
                        <label>Date de départ</label>
                        <input type="date" value={form.departureDate}
                          onChange={e => setForm(p => ({ ...p, departureDate: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Property */}
                {activeFormTab === 'property' && (
                  <div className="cm2-form-section">
                    <div className="cm2-form-row">
                      <div className="cm2-field">
                        <label>Nom de la propriété</label>
                        <input type="text" placeholder="Villa Sunrise" value={form.propertyName}
                          onChange={e => setForm(p => ({ ...p, propertyName: e.target.value }))} />
                      </div>
                      <div className="cm2-field" style={{ maxWidth: 80 }}>
                        <label>Emoji</label>
                        <input type="text" placeholder="🏡" value={form.propertyEmoji}
                          onChange={e => setForm(p => ({ ...p, propertyEmoji: e.target.value }))} />
                      </div>
                    </div>
                    <div className="cm2-field">
                      <label>Adresse</label>
                      <input type="text" placeholder="12 Rue des Palmiers, Marrakech" value={form.propertyAddress}
                        onChange={e => setForm(p => ({ ...p, propertyAddress: e.target.value }))} />
                    </div>
                    <div className="cm2-field">
                      <label>Description d'accueil</label>
                      <textarea rows={3} placeholder="Bienvenue dans notre magnifique villa…" value={form.propertyDesc}
                        onChange={e => setForm(p => ({ ...p, propertyDesc: e.target.value }))} />
                    </div>
                    <div className="cm2-form-row">
                      <div className="cm2-field">
                        <label>Nom Wi-Fi</label>
                        <input type="text" placeholder="VillaSunrise_5G" value={form.wifiName}
                          onChange={e => setForm(p => ({ ...p, wifiName: e.target.value }))} />
                      </div>
                      <div className="cm2-field">
                        <label>Mot de passe Wi-Fi</label>
                        <input type="text" placeholder="MotDePasseWifi" value={form.wifiPassword}
                          onChange={e => setForm(p => ({ ...p, wifiPassword: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Access */}
                {activeFormTab === 'access' && (
                  <div className="cm2-form-section">
                    <div className="cm2-form-row">
                      <div className="cm2-field">
                        <label>Code PIN d'accès</label>
                        <input type="text" placeholder="123456" maxLength={10} value={form.pin}
                          onChange={e => setForm(p => ({ ...p, pin: e.target.value }))} />
                        <span className="cm2-field-hint">Le client verra ce code après validation du check-in.</span>
                      </div>
                      <div className="cm2-field">
                        <label>Nom de la serrure</label>
                        <input type="text" placeholder="Porte Principale" value={form.lockName}
                          onChange={e => setForm(p => ({ ...p, lockName: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Rules */}
                {activeFormTab === 'rules' && (
                  <div className="cm2-form-section">
                    <div className="cm2-field">
                      <label>Règlement intérieur</label>
                      <textarea rows={10} value={form.houseRules}
                        onChange={e => setForm(p => ({ ...p, houseRules: e.target.value }))} />
                      <span className="cm2-field-hint">Le client devra lire et accepter ce texte avant de recevoir son code.</span>
                    </div>
                  </div>
                )}

              </div>

              <div className="cm2-modal-actions">
                <button className="cm2-btn-cancel" onClick={() => setShowForm(false)}>Annuler</button>
                <button
                  className="cm2-btn-submit"
                  onClick={handleCreate}
                  disabled={!form.guestName}
                >
                  <PlusCircle size={15} /> Créer le lien de check-in
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckinManager;
