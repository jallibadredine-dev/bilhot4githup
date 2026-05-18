import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Plus, RefreshCw, Search, Filter, X,
  CheckCircle2, XCircle, Clock, AlertTriangle, Key,
  Trash2, RotateCcw, ShieldOff, History, Building2,
  Calendar, User, Lock, Info, ChevronDown, Copy, Check,
  Wifi, WifiOff
} from 'lucide-react';
import {
  issueCard, activateCard, deactivateCard, markCardLost,
  reEncodeCard, renewCard, updateCard, getAllCards, getCardEvents, getAllCardEvents,
  getCardStats, logEvent, seedDemoCards, CARD_STATUS, CARD_EVENT
} from '../../lib/cardManagement';
import CardEncoderModal from './CardEncoderModal';
import './CardManagement.css';

/* ── Status config ─────────────────────────────────────────────── */
const STATUS = {
  pending:     { label: 'En attente',  color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', Icon: Clock       },
  active:      { label: 'Active',      color: '#10B981', bg: '#ECFDF5', border: '#6EE7B7', Icon: CheckCircle2 },
  expired:     { label: 'Expirée',     color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', Icon: XCircle      },
  deactivated: { label: 'Désactivée',  color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', Icon: ShieldOff    },
  lost:        { label: 'Perdue',      color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', Icon: AlertTriangle },
};

const EVENT_LABELS = {
  encoded:        { label: 'Encodée',      color: '#6366F1' },
  activated:      { label: 'Activée',      color: '#10B981' },
  deactivated:    { label: 'Désactivée',   color: '#EF4444' },
  expired:        { label: 'Expirée',      color: '#6B7280' },
  lost:           { label: 'Perdue',       color: '#8B5CF6' },
  're-encoded':   { label: 'Ré-encodée',   color: '#0EA5E9' },
  renewed:        { label: 'Renouvelée',   color: '#14B8A6' },
  access_granted: { label: 'Accès accordé',color: '#22C55E' },
  access_denied:  { label: 'Accès refusé', color: '#F97316' },
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr', { day: 'numeric', month: 'short', year: 'numeric' });
};
const fmtDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/* ── MAIN COMPONENT ────────────────────────────────────────────── */
export default function CardManagement() {
  const [cards,       setCards]       = useState([]);
  const [stats,       setStats]       = useState({ total:0, active:0, pending:0, expired:0, deactivated:0, lost:0 });
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [filterStatus,setFilterStatus]= useState('all');
  const [selected,    setSelected]    = useState(null);
  const [cardEvents,  setCardEvents]  = useState([]);
  const [eventsLoading,setEventsLoading]=useState(false);
  const [showIssue,   setShowIssue]   = useState(false);
  const [showEncoder, setShowEncoder] = useState(false);
  const [encoderData, setEncoderData] = useState({});
  const [copied,      setCopied]      = useState('');
  const [activeTab,   setActiveTab]   = useState('cards');
  const [doorEvents,  setDoorEvents]  = useState([]);
  const [opError,     setOpError]     = useState('');

  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true);
    seedDemoCards();
    const [all, st, evts] = await Promise.all([
      getAllCards(), getCardStats(), getAllCardEvents({ limit: 200 }),
    ]);
    setCards(all);
    setStats(st);
    setDoorEvents(evts.filter(e =>
      e.event_type === CARD_EVENT.ACCESS_GRANTED || e.event_type === CARD_EVENT.ACCESS_DENIED
    ));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Open card detail ── */
  const openCard = useCallback(async (card) => {
    setSelected(card);
    setEventsLoading(true);
    const evts = await getCardEvents(card.id);
    setCardEvents(evts);
    setEventsLoading(false);
  }, []);

  const _wrapOp = async (fn) => {
    setOpError('');
    try { await fn(); }
    catch (e) { setOpError(e.message || 'Opération échouée'); }
  };

  /* ── Actions ── */
  const handleActivate = async (cardId) => {
    await _wrapOp(async () => { await activateCard(cardId); await load(); if (selected?.id === cardId) openCard({ ...selected, status: 'active' }); });
  };
  const handleDeactivate = async (cardId) => {
    await _wrapOp(async () => { await deactivateCard(cardId); await load(); setSelected(null); });
  };
  const handleLost = async (cardId) => {
    await _wrapOp(async () => { await markCardLost(cardId); await load(); setSelected(null); });
  };
  const handleReEncode = async (card) => {
    const updated = await reEncodeCard(card.id);
    await load();
    openCard(updated);
    setEncoderData({ cardId: updated.id, guestName: card.guest_name, room: card.room_id, checkIn: card.activated_at?.slice(0,10) || '', checkOut: card.expires_at?.slice(0,10) || '', pin: '' });
    setShowEncoder(true);
  };

  const copyUid = (uid) => {
    navigator.clipboard.writeText(uid).then(() => { setCopied(uid); setTimeout(() => setCopied(''), 2000); });
  };

  /* ── Filtered ── */
  const filtered = cards.filter(c => {
    const ms = !search || c.guest_name?.toLowerCase().includes(search.toLowerCase()) || c.room_id?.includes(search) || c.card_uid?.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus === 'all' || c.status === filterStatus;
    return ms && mf;
  });

  return (
    <div className="rcm-root">
      {/* ── HEADER ── */}
      <div className="rcm-header">
        <div className="rcm-header-left">
          <div className="rcm-icon-badge"><CreditCard size={20} /></div>
          <div>
            <h1 className="rcm-title">Gestion des Cartes d'Accès</h1>
            <p className="rcm-subtitle">RFID/NFC · TTHotel / TTLock · Cycle de vie complet</p>
          </div>
        </div>
        <button className="rcm-btn-issue" onClick={() => setShowIssue(true)}>
          <Plus size={15} /> Nouvelle carte
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="rcm-stats-row">
        {[
          { key: 'all',         label: 'Total',       val: stats.total,       color: '#6366F1' },
          { key: 'active',      label: 'Actives',     val: stats.active,      color: '#10B981' },
          { key: 'pending',     label: 'En attente',  val: stats.pending,     color: '#F59E0B' },
          { key: 'expired',     label: 'Expirées',    val: stats.expired,     color: '#6B7280' },
          { key: 'deactivated', label: 'Désactivées', val: stats.deactivated, color: '#EF4444' },
          { key: 'lost',        label: 'Perdues',     val: stats.lost,        color: '#8B5CF6' },
        ].map(s => (
          <button
            key={s.key}
            className={`rcm-stat-pill ${filterStatus === s.key ? 'active' : ''}`}
            style={{ '--pill-color': s.color }}
            onClick={() => setFilterStatus(s.key)}
          >
            <span className="rcm-stat-val">{s.val}</span>
            <span className="rcm-stat-lbl">{s.label}</span>
          </button>
        ))}
        <button className="rcm-refresh-btn" onClick={load} title="Rafraîchir">
          <RefreshCw size={14} className={loading ? 'rcm-spin' : ''} />
        </button>
      </div>

      {/* ── OPERATION ERROR BANNER ── */}
      {opError && (
        <div className="rcm-error-banner">
          <AlertTriangle size={14} /> {opError}
          <button onClick={() => setOpError('')}><X size={12} /></button>
        </div>
      )}

      {/* ── SEARCH ── */}
      <div className="rcm-toolbar">
        <div className="rcm-search">
          <Search size={14} />
          <input placeholder="Chercher par client, chambre ou UID…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')}><X size={12} /></button>}
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="rcm-tab-bar">
        {[['cards', "Cartes d'accès"], ['locks', 'Serrures & Accès']].map(([k, l]) => (
          <button key={k} className={`rcm-tab ${activeTab === k ? 'active' : ''}`} onClick={() => setActiveTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── CARDS TAB ── */}
      {activeTab === 'cards' && <div className="rcm-layout">
        {/* ── TABLE ── */}
        <div className="rcm-table-wrap">
          {loading ? (
            <div className="rcm-loading">
              {[1,2,3,4].map(i => <div key={i} className="rcm-skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rcm-empty">
              <CreditCard size={40} strokeWidth={1} />
              <h3>Aucune carte{search ? ' trouvée' : ''}</h3>
              {!search && <button className="rcm-btn-issue sm" onClick={() => setShowIssue(true)}><Plus size={13} /> Émettre la première carte</button>}
            </div>
          ) : (
            <table className="rcm-table">
              <thead>
                <tr>
                  {['Client', 'Chambre', 'UID Carte', 'Activation', 'Expiration', 'Statut', ''].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map(card => {
                    const st = STATUS[card.status] || STATUS.pending;
                    const isActive = selected?.id === card.id;
                    return (
                      <motion.tr
                        key={card.id}
                        className={`rcm-tr ${isActive ? 'selected' : ''}`}
                        onClick={() => openCard(card)}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td>
                          <div className="rcm-guest-cell">
                            <div className="rcm-avatar">{(card.guest_name || '?').charAt(0).toUpperCase()}</div>
                            <span>{card.guest_name || '—'}</span>
                          </div>
                        </td>
                        <td><span className="rcm-room-badge"><Building2 size={11} /> {card.room_id}</span></td>
                        <td>
                          {card.card_uid
                            ? <code className="rcm-uid">{card.card_uid}</code>
                            : <span className="rcm-no-uid">—</span>}
                        </td>
                        <td className="rcm-date-cell">{fmtDate(card.activated_at)}</td>
                        <td className="rcm-date-cell">{fmtDate(card.expires_at)}</td>
                        <td>
                          <span className="rcm-status-chip" style={{ color: st.color, background: st.bg, borderColor: st.border }}>
                            <st.Icon size={10} /> {st.label}
                          </span>
                        </td>
                        <td><ChevronDown size={13} className="rcm-row-arrow" /></td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* ── DETAIL DRAWER ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="rcm-drawer"
              key="drawer"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
            >
              <div className="rcm-drawer-head">
                <div className="rcm-drawer-avatar">{(selected.guest_name || '?').charAt(0).toUpperCase()}</div>
                <div>
                  <h3>{selected.guest_name}</h3>
                  <span>Chambre {selected.room_id}</span>
                </div>
                <button className="rcm-drawer-close" onClick={() => setSelected(null)}><X size={16} /></button>
              </div>

              {/* Status chip */}
              {(() => { const st = STATUS[selected.status] || STATUS.pending; return (
                <div className="rcm-drawer-status" style={{ background: st.bg, border: `1px solid ${st.border}`, color: st.color }}>
                  <st.Icon size={14} /> {st.label}
                </div>
              ); })()}

              {/* Card details */}
              <div className="rcm-drawer-rows">
                {selected.card_uid && (
                  <div className="rcm-drawer-row">
                    <CreditCard size={13} />
                    <span>UID : <code>{selected.card_uid}</code></span>
                    <button className="rcm-copy-btn" onClick={() => copyUid(selected.card_uid)} title="Copier">
                      {copied === selected.card_uid ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                )}
                {selected.lock_id && (
                  <div className="rcm-drawer-row"><Lock size={13} /><span>Serrure : {selected.lock_id}</span></div>
                )}
                <div className="rcm-drawer-row">
                  <Calendar size={13} />
                  <span>{fmtDate(selected.activated_at)} → {fmtDate(selected.expires_at)}</span>
                </div>
                {selected.reservation_id && (
                  <div className="rcm-drawer-row"><Key size={13} /><span>Rés. {selected.reservation_id}</span></div>
                )}
                {selected.notes && (
                  <div className="rcm-drawer-row"><Info size={13} /><span>{selected.notes}</span></div>
                )}
              </div>

              {/* Actions */}
              <div className="rcm-drawer-actions">
                {selected.status === 'pending' && (
                  <button className="rcm-act-btn green" onClick={() => handleActivate(selected.id)}>
                    <CheckCircle2 size={13} /> Activer
                  </button>
                )}
                {(selected.status === 'active' || selected.status === 'pending') && (
                  <button className="rcm-act-btn indigo" onClick={() => {
                    setEncoderData({ cardId: selected.id, guestName: selected.guest_name, room: selected.room_id, checkIn: selected.activated_at?.slice(0,10)||'', checkOut: selected.expires_at?.slice(0,10)||'', pin: '' });
                    setShowEncoder(true);
                  }}>
                    <CreditCard size={13} /> Encoder
                  </button>
                )}
                {(selected.status === 'active' || selected.status === 'pending') && (
                  <button className="rcm-act-btn orange" onClick={() => handleReEncode(selected)}>
                    <RotateCcw size={13} /> Ré-encoder
                  </button>
                )}
                {(selected.status === 'active' || selected.status === 'pending') && (
                  <button className="rcm-act-btn red" onClick={() => handleDeactivate(selected.id)}>
                    <ShieldOff size={13} /> Désactiver
                  </button>
                )}
                {selected.status === 'active' && (
                  <button className="rcm-act-btn purple" onClick={() => handleLost(selected.id)}>
                    <AlertTriangle size={13} /> Perdue
                  </button>
                )}
              </div>

              {/* Event history */}
              <div className="rcm-events-section">
                <div className="rcm-events-title"><History size={13} /> Historique</div>
                {eventsLoading ? (
                  <div className="rcm-events-loading"><RefreshCw size={14} className="rcm-spin" /></div>
                ) : cardEvents.length === 0 ? (
                  <div className="rcm-events-empty">Aucun événement enregistré.</div>
                ) : (
                  <div className="rcm-events-list">
                    {cardEvents.map((evt, i) => {
                      const ec = EVENT_LABELS[evt.event_type] || { label: evt.event_type, color: '#6B7280' };
                      return (
                        <div key={evt.id || i} className="rcm-event-row">
                          <div className="rcm-event-dot" style={{ background: ec.color }} />
                          <div className="rcm-event-info">
                            <span style={{ color: ec.color }}>{ec.label}</span>
                            <span className="rcm-event-time">{fmtDateTime(evt.created_at)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>}

      {/* ── LOCKS & DOOR EVENTS TAB ── */}
      {activeTab === 'locks' && (
        <div className="rcm-locks-panel">
          {/* Lock status grid */}
          <div className="rcm-locks-section">
            <div className="rcm-section-title"><Lock size={13} /> État des serrures TTHotel / TTLock</div>
            <div className="rcm-locks-grid">
              {LOCKS.map(lock => (
                <div key={lock.id} className="rcm-lock-card">
                  <div className="rcm-lock-head">
                    <div className="rcm-lock-icon-wrap"><Lock size={15} /></div>
                    <div>
                      <div className="rcm-lock-name">{lock.label}</div>
                      <code className="rcm-lock-id">{lock.id}</code>
                    </div>
                  </div>
                  <div className="rcm-lock-meta">
                    <span className="rcm-lock-status-chip online"><Wifi size={10} /> Connectée</span>
                    <span className="rcm-lock-battery">🔋 —</span>
                  </div>
                  <p className="rcm-lock-stub">Statut en temps réel disponible après connexion TTLock configurée.</p>
                </div>
              ))}
            </div>
          </div>

          {/* Door access event log */}
          <div className="rcm-locks-section">
            <div className="rcm-section-title"><History size={13} /> Journal d'accès (accordé / refusé)</div>
            {doorEvents.length === 0 ? (
              <div className="rcm-events-empty" style={{ margin: '16px 0', padding: '24px', background: '#F9FAFB', borderRadius: '10px' }}>
                Aucun événement d'accès physique enregistré.<br />
                <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Les passages TTLock/TTHotel apparaîtront ici une fois l'encodeur connecté.</span>
              </div>
            ) : (
              <table className="rcm-table" style={{ marginTop: 8 }}>
                <thead>
                  <tr>{['Événement', 'Serrure', 'Client', 'Date'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {doorEvents.map((evt, i) => {
                    const card = cards.find(c => c.id === evt.card_id);
                    const ec = EVENT_LABELS[evt.event_type] || { label: evt.event_type, color: '#6B7280' };
                    return (
                      <tr key={evt.id || i} className="rcm-tr">
                        <td><span style={{ color: ec.color, fontWeight: 600, fontSize: '0.8rem' }}>{ec.label}</span></td>
                        <td><span className="rcm-room-badge"><Lock size={10} /> {evt.lock_id || '—'}</span></td>
                        <td><code className="rcm-uid">{card?.guest_name || evt.card_id?.slice(0, 8) || '—'}</code></td>
                        <td className="rcm-date-cell">{fmtDateTime(evt.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── ISSUE CARD MODAL ── */}
      <AnimatePresence>
        {showIssue && (
          <IssueCardModal
            onClose={() => setShowIssue(false)}
            onIssued={async (card) => {
              setShowIssue(false);
              await load();
              openCard(card);
              setEncoderData({ cardId: card.id, guestName: card.guest_name, room: card.room_id, checkIn: card.activated_at?.slice(0,10)||'', checkOut: card.expires_at?.slice(0,10)||'', pin: '' });
              setShowEncoder(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── ENCODER MODAL ── */}
      <AnimatePresence>
        {showEncoder && (
          <CardEncoderModal
            open={showEncoder}
            onClose={() => setShowEncoder(false)}
            cardData={encoderData}
            onEncoded={async (uid) => {
              if (encoderData.cardId) {
                await _wrapOp(async () => {
                  await updateCard(encoderData.cardId, { card_uid: uid, status: CARD_STATUS.ACTIVE });
                  await logEvent({ card_id: encoderData.cardId, event_type: CARD_EVENT.ENCODED, details: { card_uid: uid } });
                });
                await load();
                if (selected?.id === encoderData.cardId) openCard({ ...selected, card_uid: uid, status: CARD_STATUS.ACTIVE });
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   IssueCardModal
══════════════════════════════════════════════════════════════════ */
const ROOMS = ['101','102','103','104','201','202','203','304','305','306'];
const LOCKS = [
  { id: 'TTH-001', label: 'TTHotel Pro #001 — Chambre 101' },
  { id: 'TTH-002', label: 'TTHotel Pro #002 — Chambre 102' },
  { id: 'TTH-003', label: 'TTHotel Lite #003 — Chambre 103' },
  { id: 'TTH-004', label: 'TTHotel Pro #004 — Chambre 201' },
];

function IssueCardModal({ onClose, onIssued }) {
  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const [form, setForm] = useState({
    guest_name: '', room_id: '101', lock_id: 'TTH-001',
    reservation_id: '', activated_at: today, expires_at: nextWeek, notes: '', card_uid: '',
  });
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');
  const [resvInfo,     setResvInfo]     = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Lookup reservation in automation bookings cache — canonical Channex booking ID
  const handleReservationChange = (rawId) => {
    set('reservation_id', rawId);
    if (!rawId.trim()) { setResvInfo(null); return; }
    try {
      const cache = JSON.parse(localStorage.getItem('hosflow_processed_bookings') || '{}');
      const entry = cache[rawId.trim()];
      if (entry && entry.arrivalDate && entry.departureDate) {
        setResvInfo(entry);
        setForm(p => ({
          ...p,
          reservation_id: rawId.trim(),
          activated_at:   entry.arrivalDate,
          expires_at:     entry.departureDate,
          ...(entry.guestName && !p.guest_name ? { guest_name: entry.guestName } : {}),
        }));
      } else {
        setResvInfo(null);
      }
    } catch { setResvInfo(null); }
  };

  const handleSubmit = async () => {
    if (!form.guest_name || !form.room_id) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const card = await issueCard({
        ...form,
        activated_at: form.activated_at ? `${form.activated_at}T14:00:00.000Z` : null,
        expires_at:   form.expires_at   ? `${form.expires_at}T12:00:00.000Z`   : null,
      });
      setSubmitting(false);
      onIssued(card);
    } catch (err) {
      setSubmitting(false);
      setSubmitError(err.message || 'Erreur lors de la création de la carte.');
    }
  };

  return (
    <div className="rcm-overlay" onClick={onClose}>
      <motion.div
        className="rcm-issue-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="rcm-modal-close" onClick={onClose}><X size={18} /></button>
        <div className="rcm-modal-head">
          <div className="rcm-modal-icon"><CreditCard size={22} /></div>
          <h2>Émettre une carte d'accès</h2>
          <p>La carte sera encodée via l'encodeur RFID USB après confirmation.</p>
        </div>

        {submitError && (
          <div className="rcm-submit-error"><AlertTriangle size={13} /> {submitError}</div>
        )}

        <div className="rcm-form-grid">
          <div className="rcm-field">
            <label>Nom du client *</label>
            <div className="rcm-input-wrap"><User size={13} /><input placeholder="Marie Dupont" value={form.guest_name} onChange={e => set('guest_name', e.target.value)} /></div>
          </div>
          <div className="rcm-field">
            <label>ID de réservation Channex</label>
            <div className="rcm-input-wrap">
              <Key size={13} />
              <input
                placeholder="booking-id Channex (auto-remplit les dates)"
                value={form.reservation_id}
                onChange={e => handleReservationChange(e.target.value)}
              />
            </div>
            {resvInfo && (
              <div className="rcm-resv-found">
                <CheckCircle2 size={11} /> Réservation trouvée · Arrivée {resvInfo.arrivalDate} · Départ {resvInfo.departureDate}
                {resvInfo.guestName ? ` · ${resvInfo.guestName}` : ''}
              </div>
            )}
          </div>
          <div className="rcm-field">
            <label>Chambre *</label>
            <select value={form.room_id} onChange={e => set('room_id', e.target.value)}>
              {ROOMS.map(r => <option key={r} value={r}>Chambre {r}</option>)}
            </select>
          </div>
          <div className="rcm-field">
            <label>Serrure</label>
            <select value={form.lock_id} onChange={e => set('lock_id', e.target.value)}>
              <option value="">— Aucune —</option>
              {LOCKS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>
          <div className="rcm-field">
            <label>Date d'arrivée</label>
            <input type="date" value={form.activated_at} onChange={e => set('activated_at', e.target.value)} />
          </div>
          <div className="rcm-field">
            <label>Date de départ</label>
            <input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} />
          </div>
          <div className="rcm-field" style={{ gridColumn: '1 / -1' }}>
            <label>UID carte (optionnel — rempli par l'encodeur)</label>
            <div className="rcm-input-wrap"><CreditCard size={13} /><input placeholder="A1:B2:C3:D4" value={form.card_uid} onChange={e => set('card_uid', e.target.value)} /></div>
          </div>
          <div className="rcm-field" style={{ gridColumn: '1 / -1' }}>
            <label>Notes</label>
            <textarea rows={2} placeholder="Chambre double, 2 clés…" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>

        <div className="rcm-modal-foot">
          <button className="rcm-btn-cancel" onClick={onClose}>Annuler</button>
          <button className="rcm-btn-submit" onClick={handleSubmit} disabled={!form.guest_name || submitting}>
            <CreditCard size={14} /> {submitting ? 'Création…' : 'Créer & Encoder'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
