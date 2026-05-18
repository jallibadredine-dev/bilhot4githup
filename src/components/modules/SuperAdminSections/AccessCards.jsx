import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, RefreshCw, CheckCircle2, XCircle, Clock,
  AlertTriangle, ShieldOff, History, Filter, Building2,
  Calendar, User, Search, X
} from 'lucide-react';
import {
  getAllCards, getAllCardEvents, getCardStats, seedDemoCards,
  deactivateCard, CARD_STATUS
} from '../../../lib/cardManagement';
import './AccessCards.css';

/* ── Status config ─────────────────────────────────────────────── */
const STATUS = {
  pending:     { label: 'En attente',  color: '#F59E0B', bg: '#FFFBEB', Icon: Clock        },
  active:      { label: 'Active',      color: '#10B981', bg: '#ECFDF5', Icon: CheckCircle2  },
  expired:     { label: 'Expirée',     color: '#6B7280', bg: '#F9FAFB', Icon: XCircle       },
  deactivated: { label: 'Désactivée',  color: '#EF4444', bg: '#FEF2F2', Icon: ShieldOff     },
  lost:        { label: 'Perdue',      color: '#8B5CF6', bg: '#F5F3FF', Icon: AlertTriangle },
};

const EVENT_LABELS = {
  issued:         'Émise',        encoded:   'Encodée',
  activated:      'Activée',      deactivated: 'Désactivée',
  expired:        'Expirée',      lost:        'Perdue',
  're-encoded':   'Ré-encodée',   renewed:     'Renouvelée',
  access_granted: 'Accès accordé', access_denied: 'Accès refusé',
};
const ENCODER_EVENTS = new Set(['encoded', 're-encoded']);

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr', { day:'numeric', month:'short', year:'numeric' }) : '—';
const fmtDT   = (iso) => iso ? new Date(iso).toLocaleString('fr',   { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—';

/* ══════════════════════════════════════════════════════════════════
   AccessCards — Super Admin Section
══════════════════════════════════════════════════════════════════ */
export default function AccessCards() {
  const [cards,    setCards]    = useState([]);
  const [events,   setEvents]   = useState([]);
  const [stats,    setStats]    = useState({ total:0, active:0, pending:0, expired:0, deactivated:0, lost:0 });
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('cards');
  const [search,   setSearch]   = useState('');
  const [fStatus,  setFStatus]  = useState('all');
  const [fEvType,  setFEvType]  = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    await seedDemoCards();
    const [c, e, s] = await Promise.all([getAllCards(), getAllCardEvents({ limit: 200 }), getCardStats()]);
    setCards(c);
    setEvents(e);
    setStats(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeactivate = async (cardId) => {
    await deactivateCard(cardId);
    load();
  };

  const filteredCards = cards.filter(c => {
    const ms = !search || c.guest_name?.toLowerCase().includes(search.toLowerCase()) || c.room_id?.includes(search);
    const mf = fStatus === 'all' || c.status === fStatus;
    return ms && mf;
  });

  return (
    <div className="sac-root">
      {/* ── HEADER ── */}
      <div className="sac-header">
        <div className="sac-header-icon"><CreditCard size={20} /></div>
        <div>
          <h2 className="sac-title">Cartes d'Accès RFID/NFC</h2>
          <p className="sac-subtitle">Cycle de vie complet · TTHotel / TTLock</p>
        </div>
        <button className="sac-refresh" onClick={load} title="Actualiser">
          <RefreshCw size={14} className={loading ? 'sac-spin' : ''} />
        </button>
      </div>

      {/* ── STATS GRID ── */}
      <div className="sac-stats-grid">
        {[
          { label:'Total',        val: stats.total,       color:'#6366F1', Icon: CreditCard  },
          { label:'Actives',      val: stats.active,      color:'#10B981', Icon: CheckCircle2 },
          { label:'En attente',   val: stats.pending,     color:'#F59E0B', Icon: Clock        },
          { label:'Expirées',     val: stats.expired,     color:'#6B7280', Icon: XCircle      },
          { label:'Désactivées',  val: stats.deactivated, color:'#EF4444', Icon: ShieldOff    },
          { label:'Perdues',      val: stats.lost,        color:'#8B5CF6', Icon: AlertTriangle},
        ].map(s => (
          <div key={s.label} className="sac-stat-card" style={{ '--sac-color': s.color }}>
            <div className="sac-stat-icon"><s.Icon size={18} /></div>
            <div className="sac-stat-val">{s.val}</div>
            <div className="sac-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── PER-PROPERTY BREAKDOWN ── */}
      {stats.byProperty && stats.byProperty.length > 0 && (
        <div className="sac-property-table-wrap">
          <div className="sac-section-title"><Building2 size={13} /> Répartition par propriété</div>
          <table className="sac-table sac-property-table">
            <thead>
              <tr>{['Propriété','Total','Actives','En attente','Expirées','Désactivées','Perdues'].map(h=><th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {stats.byProperty.map(p => (
                <tr key={p.property_id} className="sac-tr">
                  <td><span className="sac-room-badge"><Building2 size={10}/> {p.property_id || 'Non assignée'}</span></td>
                  <td style={{ fontWeight: 700 }}>{p.total}</td>
                  <td style={{ color: '#10B981' }}>{p.active}</td>
                  <td style={{ color: '#F59E0B' }}>{p.pending}</td>
                  <td style={{ color: '#6B7280' }}>{p.expired}</td>
                  <td style={{ color: '#EF4444' }}>{p.deactivated}</td>
                  <td style={{ color: '#8B5CF6' }}>{p.lost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── TABS ── */}
      <div className="sac-tabs">
        {[['cards','Toutes les cartes'],['events','Journal des événements'],['encoder','Journal encodeur']].map(([k,l]) => (
          <button key={k} className={`sac-tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="sac-toolbar">
        <div className="sac-search">
          <Search size={13} />
          <input placeholder="Client, chambre…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')}><X size={11} /></button>}
        </div>
        {tab === 'cards' && (
          <select className="sac-filter-sel" value={fStatus} onChange={e => setFStatus(e.target.value)}>
            <option value="all">Tous les statuts</option>
            {Object.entries(CARD_STATUS).map(([,v]) => (
              <option key={v} value={v}>{STATUS[v]?.label || v}</option>
            ))}
          </select>
        )}
        {tab === 'events' && (
          <select className="sac-filter-sel" value={fEvType} onChange={e => setFEvType(e.target.value)}>
            <option value="all">Tous les événements</option>
            {Object.keys(EVENT_LABELS).map(k => (
              <option key={k} value={k}>{EVENT_LABELS[k]}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── CARDS TABLE ── */}
      {tab === 'cards' && (
        loading ? (
          <div className="sac-loading">{[1,2,3,4].map(i=><div key={i} className="sac-skel"/>)}</div>
        ) : (
          <div className="sac-table-wrap">
            <table className="sac-table">
              <thead>
                <tr>{['Client','Chambre','UID','Activation','Expiration','Statut','Action'].map(h=><th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredCards.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:'center', padding:'32px', color:'#9CA3AF' }}>Aucune carte</td></tr>
                ) : filteredCards.map(card => {
                  const st = STATUS[card.status] || STATUS.pending;
                  return (
                    <tr key={card.id} className="sac-tr">
                      <td>
                        <div className="sac-guest-cell">
                          <div className="sac-av">{(card.guest_name||'?').charAt(0).toUpperCase()}</div>
                          <span>{card.guest_name||'—'}</span>
                        </div>
                      </td>
                      <td><span className="sac-room-badge"><Building2 size={10}/> {card.room_id}</span></td>
                      <td><code className="sac-uid">{card.card_uid||'—'}</code></td>
                      <td className="sac-date">{fmtDate(card.activated_at)}</td>
                      <td className="sac-date">{fmtDate(card.expires_at)}</td>
                      <td>
                        <span className="sac-chip" style={{ color:st.color, background:st.bg }}>
                          <st.Icon size={9}/> {st.label}
                        </span>
                      </td>
                      <td>
                        {(card.status === 'active' || card.status === 'pending') && (
                          <button className="sac-deact-btn" onClick={() => handleDeactivate(card.id)}>
                            <ShieldOff size={11}/> Désactiver
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── EVENTS LOG ── */}
      {tab === 'events' && (() => {
        const filtered = events.filter(e =>
          (fEvType === 'all' || e.event_type === fEvType) &&
          (!search || cards.find(c => c.id === e.card_id)?.guest_name?.toLowerCase().includes(search.toLowerCase()))
        );
        return loading ? (
          <div className="sac-loading">{[1,2,3].map(i=><div key={i} className="sac-skel"/>)}</div>
        ) : (
          <div className="sac-table-wrap">
            <table className="sac-table">
              <thead>
                <tr>{['Événement','Carte','Chambre','Date','Détails'].map(h=><th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign:'center', padding:'32px', color:'#9CA3AF' }}>Aucun événement</td></tr>
                ) : filtered.map((evt, i) => {
                  const card = cards.find(c => c.id === evt.card_id);
                  return (
                    <tr key={evt.id || i} className="sac-tr">
                      <td><span className="sac-evtype">{EVENT_LABELS[evt.event_type] || evt.event_type}</span></td>
                      <td><code className="sac-uid">{card?.card_uid || evt.card_id?.slice(0,8)+'…'}</code></td>
                      <td>{card ? <span className="sac-room-badge"><Building2 size={10}/> {card.room_id}</span> : '—'}</td>
                      <td className="sac-date">{fmtDT(evt.created_at)}</td>
                      <td className="sac-date" style={{ fontSize:'0.68rem', color:'#9CA3AF' }}>
                        {evt.details && typeof evt.details === 'object'
                          ? Object.entries(evt.details).map(([k,v])=>`${k}: ${v}`).join(' · ')
                          : (evt.details||'')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* ── ENCODER LOG PANEL ── */}
      {tab === 'encoder' && (() => {
        const encEvts = events.filter(e => ENCODER_EVENTS.has(e.event_type));
        return loading ? (
          <div className="sac-loading">{[1,2,3].map(i=><div key={i} className="sac-skel"/>)}</div>
        ) : (
          <>
            <div className="sac-encoder-info">
              <CreditCard size={13} />
              Journal des opérations d'encodage physique RFID — événements&nbsp;<code>encoded</code>&nbsp;et&nbsp;<code>re-encoded</code> uniquement.
              <span className="sac-encoder-count">{encEvts.length} encodage(s)</span>
            </div>
            <div className="sac-table-wrap">
              <table className="sac-table">
                <thead>
                  <tr>{['Opération','Client','Chambre','UID carte','Date','Propriété'].map(h=><th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {encEvts.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign:'center', padding:'32px', color:'#9CA3AF' }}>Aucun encodage enregistré</td></tr>
                  ) : encEvts.map((evt, i) => {
                    const card = cards.find(c => c.id === evt.card_id);
                    return (
                      <tr key={evt.id || i} className="sac-tr">
                        <td><span className="sac-evtype sac-evtype--encoder">{EVENT_LABELS[evt.event_type] || evt.event_type}</span></td>
                        <td>
                          <div className="sac-guest-cell">
                            <div className="sac-av">{(card?.guest_name||'?').charAt(0).toUpperCase()}</div>
                            <span>{card?.guest_name || '—'}</span>
                          </div>
                        </td>
                        <td>{card ? <span className="sac-room-badge"><Building2 size={10}/> {card.room_id}</span> : '—'}</td>
                        <td><code className="sac-uid">{evt.details?.card_uid || card?.card_uid || '—'}</code></td>
                        <td className="sac-date">{fmtDT(evt.created_at)}</td>
                        <td className="sac-date" style={{ fontSize:'0.68rem' }}>{card?.property_id || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        );
      })()}
    </div>
  );
}
