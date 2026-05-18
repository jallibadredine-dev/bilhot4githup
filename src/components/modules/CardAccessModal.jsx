/**
 * CardAccessModal
 * Modal partagé pour gérer les cartes d'accès RFID/NFC d'une chambre.
 * Utilisé depuis SmartLockHub et SmartInventory.
 *
 * Props:
 *   open        bool
 *   onClose     fn()
 *   roomId      string  – identifiant de chambre
 *   roomName    string  – ex: "Suite 101"
 *   lockId      string? – identifiant de la serrure
 *   floor       string? – ex: "Étage 1"
 *   guestName   string? – pré-rempli depuis une réservation
 *   checkIn     string? – YYYY-MM-DD pré-rempli
 *   checkOut    string? – YYYY-MM-DD pré-rempli
 */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CreditCard, Plus, Calendar, User, Check,
  RefreshCw, Clock, Zap, Scan, Trash2, RotateCcw,
  AlertTriangle, ChevronLeft
} from 'lucide-react';
import {
  getAllCards, issueCard, activateCard, deactivateCard,
  updateCard, CARD_STATUS
} from '../../lib/cardManagement';
import CardEncoderModal from './CardEncoderModal';

/* ─── Status config ──────────────────────────────────────── */
const STATUS_CFG = {
  pending:     { label: 'En attente',   bg: '#FEF3C7', color: '#92400E' },
  active:      { label: 'Active',       bg: '#DCFCE7', color: '#166534' },
  expired:     { label: 'Expirée',      bg: '#F3F4F6', color: '#6B7280' },
  deactivated: { label: 'Désactivée',   bg: '#FEE2E2', color: '#991B1B' },
  lost:        { label: 'Perdue',       bg: '#FEE2E2', color: '#7F1D1D' },
};

/* ─── Helpers ────────────────────────────────────────────── */
const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = iso.slice(0, 10);
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const nextWeek  = () => {
  const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().slice(0, 10);
};

/* ════════════════════════════════════════════════════════════
   CardAccessModal
════════════════════════════════════════════════════════════ */
export default function CardAccessModal({
  open, onClose,
  roomId = '', roomName = '', lockId = '', floor = '',
  guestName = '', checkIn = '', checkOut = '',
}) {
  const [cards,      setCards]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [view,       setView]       = useState('list'); // 'list' | 'new'
  const [form,       setForm]       = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [activating, setActivating] = useState(null);
  const [success,    setSuccess]    = useState('');
  const [encoderOpen,  setEncoderOpen]  = useState(false);
  const [encoderData,  setEncoderData]  = useState({});
  const [editDates,    setEditDates]    = useState(null); // card.id being date-edited

  /* ── Load cards for this room ── */
  const loadCards = useCallback(async () => {
    if (!roomId) { setCards([]); return; }
    setLoading(true);
    try { setCards(await getAllCards({ room_id: roomId })); }
    catch { setCards([]); }
    finally { setLoading(false); }
  }, [roomId]);

  /* ── Reset when opening ── */
  useEffect(() => {
    if (!open) return;
    setView('list');
    setSuccess('');
    setEditDates(null);
    setForm({
      guest_name:   guestName,
      activated_at: checkIn  || todayISO(),
      expires_at:   checkOut || nextWeek(),
      notes: '',
    });
    loadCards();
  }, [open, guestName, checkIn, checkOut, loadCards]);

  /* ── Create new card ── */
  const handleCreate = async () => {
    if (!form.guest_name?.trim()) return;
    setSubmitting(true);
    try {
      const card = await issueCard({
        guest_name:   form.guest_name.trim(),
        room_id:      roomId,
        lock_id:      lockId || null,
        activated_at: form.activated_at || null,
        expires_at:   form.expires_at   || null,
        notes:        form.notes        || null,
      });
      setSuccess('Carte créée !');
      await loadCards();
      setView('list');
      openEncoder(card, form.activated_at, form.expires_at);
    } catch (e) {
      setSuccess('Erreur : ' + (e.message || 'création impossible'));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Activate / update dates ── */
  const handleActivate = async (card, newDates = null) => {
    setActivating(card.id);
    setSuccess('');
    try {
      if (newDates) await updateCard(card.id, { activated_at: newDates.activated_at, expires_at: newDates.expires_at });
      await activateCard(card.id);
      setSuccess('Carte activée !');
      setEditDates(null);
      await loadCards();
    } catch (e) {
      setSuccess('Erreur : ' + (e.message || 'activation impossible'));
    } finally {
      setActivating(null);
    }
  };

  /* ── Deactivate ── */
  const handleDeactivate = async (card) => {
    setActivating(card.id);
    try {
      await deactivateCard(card.id, 'manual');
      setSuccess('Carte désactivée.');
      await loadCards();
    } catch (e) {
      setSuccess('Erreur désactivation');
    } finally {
      setActivating(null);
    }
  };

  /* ── Open physical encoder ── */
  const openEncoder = (card, ci, co) => {
    setEncoderData({
      guestName: card.guest_name || guestName || 'Client',
      room:      roomName || roomId,
      floor:     floor || '',
      checkIn:   (ci  || card.activated_at || '').slice(0, 10),
      checkOut:  (co  || card.expires_at   || '').slice(0, 10),
      pin:       '',
    });
    setEncoderOpen(true);
  };

  if (!open) return null;

  const sc = (s) => STATUS_CFG[s] || STATUS_CFG.pending;

  /* ──────────────────────────────────────────────────────── */
  return (
    <>
      <AnimatePresence>
        {open && (
          <div style={STYLES.overlay} onClick={onClose}>
            <motion.div
              style={STYLES.modal}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              onClick={e => e.stopPropagation()}
            >
              {/* HEAD */}
              <div style={STYLES.head}>
                <div style={STYLES.headLeft}>
                  <div style={STYLES.headIcon}><CreditCard size={18} color="#6D28D9"/></div>
                  <div>
                    <div style={STYLES.headTitle}>Cartes d'accès</div>
                    <div style={STYLES.headSub}>{roomName || `Chambre ${roomId}`}{floor ? ` · ${floor}` : ''}</div>
                  </div>
                </div>
                <button style={STYLES.closeBtn} onClick={onClose}><X size={16}/></button>
              </div>

              {/* BODY */}
              {view === 'list' ? (
                <div style={STYLES.body}>
                  {/* Action bar */}
                  <div style={STYLES.actionBar}>
                    <button style={STYLES.newBtn} onClick={() => { setView('new'); setSuccess(''); }}>
                      <Plus size={14}/> Nouvelle carte
                    </button>
                    <button style={STYLES.refreshBtn} onClick={loadCards} disabled={loading}>
                      <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}}/>
                    </button>
                  </div>

                  {/* Success banner */}
                  {success && (
                    <div style={{ ...STYLES.banner, background: success.startsWith('Erreur') ? '#FEE2E2' : '#DCFCE7', color: success.startsWith('Erreur') ? '#991B1B' : '#166534' }}>
                      {success.startsWith('Erreur') ? <AlertTriangle size={14}/> : <Check size={14}/>} {success}
                    </div>
                  )}

                  {/* Card list */}
                  {loading ? (
                    <div style={STYLES.emptyState}><RefreshCw size={22} color="#CBD5E1" style={{ animation: 'spin 1s linear infinite' }}/><span style={{ color: '#94A3B8', fontSize: 13 }}>Chargement…</span></div>
                  ) : cards.length === 0 ? (
                    <div style={STYLES.emptyState}>
                      <CreditCard size={34} color="#CBD5E1" strokeWidth={1.5}/>
                      <span style={{ color: '#94A3B8', fontSize: 13 }}>Aucune carte pour cette chambre</span>
                      <button style={STYLES.newBtn} onClick={() => setView('new')}><Plus size={13}/> Créer une carte</button>
                    </div>
                  ) : (
                    <div style={STYLES.cardList}>
                      {cards.map(card => {
                        const cfg = sc(card.status);
                        const isEditingDates = editDates === card.id;
                        return (
                          <div key={card.id} style={STYLES.cardRow}>
                            <div style={STYLES.cardRowTop}>
                              <div style={STYLES.cardRowLeft}>
                                <span style={{ ...STYLES.statusBadge, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                                <span style={STYLES.guestName}>{card.guest_name || '—'}</span>
                              </div>
                              <span style={STYLES.dates}>
                                <Calendar size={11}/>
                                {fmtDate(card.activated_at)} → {fmtDate(card.expires_at)}
                              </span>
                            </div>

                            {/* Inline date editor */}
                            {isEditingDates && (
                              <div style={STYLES.dateEditor}>
                                <div style={STYLES.dateFields}>
                                  <div style={STYLES.dateFieldWrap}>
                                    <label style={STYLES.fieldLabel}>Arrivée</label>
                                    <input type="date" style={STYLES.dateInput}
                                      defaultValue={card.activated_at?.slice(0,10) || ''}
                                      id={`ci-${card.id}`}/>
                                  </div>
                                  <div style={STYLES.dateFieldWrap}>
                                    <label style={STYLES.fieldLabel}>Départ</label>
                                    <input type="date" style={STYLES.dateInput}
                                      defaultValue={card.expires_at?.slice(0,10) || ''}
                                      id={`co-${card.id}`}/>
                                  </div>
                                </div>
                                <div style={STYLES.dateEditorBtns}>
                                  <button style={STYLES.btnGhost} onClick={() => setEditDates(null)}>Annuler</button>
                                  <button
                                    style={{ ...STYLES.btnPrimary, opacity: activating === card.id ? 0.6 : 1 }}
                                    disabled={activating === card.id}
                                    onClick={() => {
                                      const ci = document.getElementById(`ci-${card.id}`)?.value;
                                      const co = document.getElementById(`co-${card.id}`)?.value;
                                      handleActivate(card, { activated_at: ci || null, expires_at: co || null });
                                    }}
                                  >
                                    {activating === card.id ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }}/> : <Zap size={12}/>} Activer
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            {!isEditingDates && (
                              <div style={STYLES.cardRowActions}>
                                {/* Encode button — always available */}
                                <button style={STYLES.btnEncode} onClick={() => openEncoder(card, null, null)}
                                  title="Encoder physiquement la carte">
                                  <Scan size={12}/> Scanner / Encoder
                                </button>
                                {/* Activate */}
                                {(card.status === 'pending' || card.status === 'deactivated' || card.status === 'expired') && (
                                  <button style={STYLES.btnActivate} onClick={() => setEditDates(card.id)}
                                    title="Définir les dates et activer">
                                    <Calendar size={12}/> Personnaliser dates
                                  </button>
                                )}
                                {/* Deactivate */}
                                {card.status === 'active' && (
                                  <button style={STYLES.btnDeactivate}
                                    disabled={activating === card.id}
                                    onClick={() => handleDeactivate(card)}
                                    title="Désactiver cette carte">
                                    {activating === card.id ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }}/> : <Trash2 size={12}/>} Désactiver
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* ── NEW CARD FORM ── */
                <div style={STYLES.body}>
                  <button style={STYLES.backBtn} onClick={() => setView('list')}><ChevronLeft size={14}/> Retour</button>
                  <div style={STYLES.formTitle}><Plus size={15} color="#6D28D9"/> Nouvelle carte d'accès</div>

                  <div style={STYLES.field}>
                    <label style={STYLES.fieldLabel}><User size={12}/> Nom du client *</label>
                    <input style={STYLES.input}
                      placeholder="Ex: Mohamed Al Fassi"
                      value={form.guest_name || ''}
                      onChange={e => setForm(f => ({ ...f, guest_name: e.target.value }))}/>
                  </div>
                  <div style={STYLES.fieldRow}>
                    <div style={STYLES.field}>
                      <label style={STYLES.fieldLabel}><Calendar size={12}/> Arrivée</label>
                      <input type="date" style={STYLES.input}
                        value={form.activated_at || ''}
                        onChange={e => setForm(f => ({ ...f, activated_at: e.target.value }))}/>
                    </div>
                    <div style={STYLES.field}>
                      <label style={STYLES.fieldLabel}><Calendar size={12}/> Départ</label>
                      <input type="date" style={STYLES.input}
                        value={form.expires_at || ''}
                        onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}/>
                    </div>
                  </div>
                  <div style={STYLES.field}>
                    <label style={STYLES.fieldLabel}>Notes (optionnel)</label>
                    <input style={STYLES.input}
                      placeholder="Ex: VIP, chambre de remplacement…"
                      value={form.notes || ''}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}/>
                  </div>

                  {success && (
                    <div style={{ ...STYLES.banner, background: success.startsWith('Erreur') ? '#FEE2E2' : '#DCFCE7', color: success.startsWith('Erreur') ? '#991B1B' : '#166534' }}>
                      {success.startsWith('Erreur') ? <AlertTriangle size={14}/> : <Check size={14}/>} {success}
                    </div>
                  )}

                  <div style={STYLES.formFoot}>
                    <button style={STYLES.btnGhost} onClick={() => setView('list')}>Annuler</button>
                    <button
                      style={{ ...STYLES.btnPrimary, opacity: (!form.guest_name?.trim() || submitting) ? 0.5 : 1 }}
                      disabled={!form.guest_name?.trim() || submitting}
                      onClick={handleCreate}
                    >
                      {submitting
                        ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }}/> Création…</>
                        : <><CreditCard size={13}/> Créer et encoder</>}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Physical encoder */}
      <CardEncoderModal
        open={encoderOpen}
        onClose={() => setEncoderOpen(false)}
        cardData={encoderData}
      />
    </>
  );
}

/* ─── Inline styles ────────────────────────────────────────── */
const STYLES = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1100, padding: 16,
  },
  modal: {
    background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,.18)',
    width: '100%', maxWidth: 480, maxHeight: '85vh', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  head: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid #E2E8F0', flexShrink: 0,
  },
  headLeft:  { display: 'flex', alignItems: 'center', gap: 12 },
  headIcon:  { width: 36, height: 36, borderRadius: 10, background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headTitle: { fontSize: 15, fontWeight: 700, color: '#0F172A' },
  headSub:   { fontSize: 12, color: '#64748B', marginTop: 1 },
  closeBtn:  { width: 30, height: 30, borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' },
  body: {
    padding: '16px 20px', overflowY: 'auto', flex: 1,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  actionBar:   { display: 'flex', gap: 8, alignItems: 'center' },
  newBtn:      { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: '#6D28D9', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  refreshBtn:  { width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' },
  banner:      { display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 },
  emptyState:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '32px 0' },
  cardList:    { display: 'flex', flexDirection: 'column', gap: 10 },
  cardRow:     { border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 14px', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 10 },
  cardRowTop:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  cardRowLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: 0.2 },
  guestName:   { fontSize: 13, fontWeight: 600, color: '#1E293B' },
  dates:       { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B' },
  cardRowActions: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  btnEncode:    { display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 7, background: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  btnActivate:  { display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 7, background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  btnDeactivate:{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 7, background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  dateEditor:   { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 },
  dateFields:   { display: 'flex', gap: 10 },
  dateFieldWrap:{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  dateEditorBtns: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  backBtn:   { display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#6D28D9', fontSize: 13, fontWeight: 600, padding: '2px 0' },
  formTitle: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 2 },
  field:     { display: 'flex', flexDirection: 'column', gap: 5 },
  fieldRow:  { display: 'flex', gap: 10 },
  fieldLabel:{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: '#475569' },
  input:     { padding: '8px 12px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#1E293B', background: '#FAFAFA', outline: 'none', width: '100%', boxSizing: 'border-box' },
  dateInput: { padding: '7px 10px', border: '1.5px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#1E293B', background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' },
  formFoot:  { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 },
  btnGhost:  { padding: '8px 16px', borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#475569', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  btnPrimary:{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, background: '#6D28D9', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'opacity .15s' },
};
