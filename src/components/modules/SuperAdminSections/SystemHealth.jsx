import React, { useState, useEffect, useCallback } from 'react';
import {
  Database, Server, Shield, Lock, CreditCard, Wifi,
  RefreshCw, CheckCircle, AlertTriangle, XCircle,
  HelpCircle, Clock, Activity, Filter, ChevronDown, ChevronRight,
  Radio, TrendingUp, AlertCircle,
} from 'lucide-react';
import { adminFetch } from './adminUtils';

const SEVERITY_COLOR = {
  info:     '#3B82F6',
  warn:     '#F59E0B',
  error:    '#EF4444',
  critical: '#7C3AED',
};

const STATUS_META = {
  up:             { color: '#10B981', label: 'Opérationnel',   Icon: CheckCircle  },
  degraded:       { color: '#F59E0B', label: 'Dégradé',        Icon: AlertTriangle },
  down:           { color: '#EF4444', label: 'Hors ligne',      Icon: XCircle      },
  timeout:        { color: '#EF4444', label: 'Timeout',         Icon: XCircle      },
  not_configured: { color: '#6B7280', label: 'Non configuré',   Icon: HelpCircle   },
  unknown:        { color: '#6B7280', label: 'Inconnu',         Icon: HelpCircle   },
};

const PROVIDER_ICONS = {
  supabase:     Database,
  backend:      Server,
  google_oauth: Shield,
  ttlock:       Lock,
  rfid:         CreditCard,
  redis:        Wifi,
};

const fmtMs = (ms) => ms == null ? '—' : ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};
const fmtDateFull = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const SEV_ORDER = ['critical','error','warn','info'];

/* ── Uptime percentage bar ───────────────────────────────────── */
function UptimeBar({ pct }) {
  if (pct == null) return (
    <span style={{ fontSize: '0.68rem', color: 'var(--sa2-text-muted)' }}>Collecte en cours…</span>
  );
  const color = pct >= 99 ? '#10B981' : pct >= 95 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--sa2-border)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: '0.68rem', fontWeight: 600, color, minWidth: 36 }}>{pct.toFixed(1)}%</span>
    </div>
  );
}

/* ── Recent errors expander ──────────────────────────────────── */
function RecentErrors({ errors }) {
  const [open, setOpen] = useState(false);
  if (!errors || errors.length === 0) return null;
  return (
    <div style={{ borderTop: '1px solid var(--sa2-border)', paddingTop: 6 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#EF4444', fontSize: '0.68rem', fontWeight: 600 }}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        <AlertCircle size={11} />
        {errors.length} erreur{errors.length > 1 ? 's' : ''} récente{errors.length > 1 ? 's' : ''}
      </button>
      {open && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: '0.65rem', color: 'var(--sa2-text-muted)', padding: '3px 6px', borderRadius: 4, background: '#EF444410', border: '1px solid #EF444420' }}>
              <span style={{ fontWeight: 600, color: '#EF4444', marginRight: 4 }}>{e.status}</span>
              {e.responseMs != null && <span style={{ marginRight: 4 }}>{e.responseMs} ms</span>}
              <span>{fmtDate(e.ts)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SystemHealth() {
  const [providers, setProviders]         = useState([]);
  const [checkedAt, setCheckedAt]         = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const [logs, setLogs]             = useState([]);
  const [logsTotal, setLogsTotal]   = useState(0);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logSeverity, setLogSeverity] = useState('');
  const [logModule, setLogModule]   = useState('');
  const [tableReady, setTableReady] = useState(true);

  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const r = await adminFetch('/api/health/providers');
      if (r.ok) {
        const d = await r.json();
        setProviders(d.providers || []);
        setCheckedAt(d.checkedAt || null);
      }
    } catch (_) {}
    setHealthLoading(false);
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (logSeverity) params.set('severity', logSeverity);
      if (logModule)   params.set('module',   logModule);
      const r = await adminFetch(`/api/health/logs?${params}`);
      if (r.ok) {
        const d = await r.json();
        setLogs(d.logs || []);
        setLogsTotal(d.total || 0);
        if (d.tableNotReady) setTableReady(false);
        else setTableReady(true);
      }
    } catch (_) {}
    setLogsLoading(false);
  }, [logSeverity, logModule]);

  useEffect(() => { loadHealth(); loadLogs(); }, []);
  useEffect(() => { loadLogs(); }, [logSeverity, logModule]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => { loadHealth(); loadLogs(); }, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, loadHealth, loadLogs]);

  const upCount       = providers.filter(p => p.status === 'up').length;
  const degradedCount = providers.filter(p => p.status === 'degraded' || p.status === 'timeout').length;
  const downCount     = providers.filter(p => p.status === 'down').length;
  const configuredCount = providers.filter(p => p.status !== 'not_configured').length;

  const overallStatus = downCount > 0 ? 'down' : degradedCount > 0 ? 'degraded' : configuredCount > 0 ? 'up' : 'unknown';
  const overall = STATUS_META[overallStatus] || STATUS_META.unknown;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: overall.color + '18', border: `1px solid ${overall.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} style={{ color: overall.color }} />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--sa2-text)' }}>Santé Système</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--sa2-text-muted)' }}>
              {checkedAt ? `Dernière vérification : ${fmtDate(checkedAt)}` : 'Vérification en cours…'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setAutoRefresh(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, border: `1px solid ${autoRefresh ? '#10B98140' : 'var(--sa2-border)'}`, background: autoRefresh ? '#10B98110' : 'transparent', color: autoRefresh ? '#10B981' : 'var(--sa2-text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            <Radio size={12} /> {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={() => { loadHealth(); loadLogs(); }}
            disabled={healthLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, border: '1px solid var(--sa2-border)', background: 'transparent', color: 'var(--sa2-text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}
          >
            <RefreshCw size={12} style={{ animation: healthLoading ? 'spin 1s linear infinite' : 'none' }} />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Global status pill ───────────────────────────────── */}
      <div style={{ background: overall.color + '12', border: `1px solid ${overall.color}30`, borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <overall.Icon size={20} style={{ color: overall.color }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: overall.color }}>{overall.label}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--sa2-text-muted)' }}>
            {upCount} opérationnels · {degradedCount} dégradés · {downCount} hors ligne · {providers.filter(p => p.status === 'not_configured').length} non configurés
          </div>
        </div>
        {configuredCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--sa2-surface)', border: '1px solid var(--sa2-border)' }}>
            <TrendingUp size={13} style={{ color: '#10B981' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sa2-text)' }}>
              {Math.round((upCount / Math.max(configuredCount, 1)) * 100)}% disponibilité
            </span>
          </div>
        )}
      </div>

      {/* ── Provider grid ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {healthLoading && providers.length === 0
          ? [1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: 'var(--sa2-surface)', border: '1px solid var(--sa2-border)', borderRadius: 'var(--sa2-radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="sa2-skeleton" style={{ width: '60%', height: 14 }} />
                <div className="sa2-skeleton" style={{ width: '40%', height: 12 }} />
              </div>
            ))
          : providers.map(p => {
              const meta = STATUS_META[p.status] || STATUS_META.unknown;
              const ProvIcon = PROVIDER_ICONS[p.id] || Server;
              return (
                <div key={p.id} style={{ background: 'var(--sa2-surface)', border: `1px solid ${meta.color}30`, borderRadius: 'var(--sa2-radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Provider header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: meta.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ProvIcon size={14} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--sa2-text)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--sa2-text-muted)' }}>{p.description}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: meta.color + '15', border: `1px solid ${meta.color}30`, flexShrink: 0 }}>
                      <meta.Icon size={10} style={{ color: meta.color }} />
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: meta.color }}>{meta.label}</span>
                    </div>
                  </div>

                  {/* Response time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={11} style={{ color: 'var(--sa2-text-muted)' }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--sa2-text-muted)' }}>
                      Réponse : <strong style={{ color: p.responseMs == null ? 'var(--sa2-text-muted)' : p.responseMs < 500 ? '#10B981' : p.responseMs < 2000 ? '#F59E0B' : '#EF4444' }}>{fmtMs(p.responseMs)}</strong>
                    </span>
                  </div>

                  {/* Uptime percentage bar */}
                  {p.status !== 'not_configured' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <TrendingUp size={10} style={{ color: 'var(--sa2-text-muted)' }} />
                        <span style={{ fontSize: '0.65rem', color: 'var(--sa2-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uptime (session)</span>
                      </div>
                      <UptimeBar pct={p.uptimePct} />
                    </div>
                  )}

                  {/* Recent errors */}
                  <RecentErrors errors={p.recentErrors} />

                  {/* Provider note */}
                  {p.note && (
                    <div style={{ fontSize: '0.65rem', color: 'var(--sa2-text-muted)', borderTop: '1px solid var(--sa2-border)', paddingTop: 6 }}>{p.note}</div>
                  )}
                </div>
              );
            })}
      </div>

      {/* ── System Logs ──────────────────────────────────────── */}
      <div style={{ background: 'var(--sa2-surface)', border: '1px solid var(--sa2-border)', borderRadius: 'var(--sa2-radius)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--sa2-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} style={{ color: 'var(--sa2-text-muted)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--sa2-text)' }}>
              Journal système
              {logsTotal > 0 && <span style={{ marginLeft: 6, fontSize: '0.72rem', color: 'var(--sa2-text-muted)', fontWeight: 400 }}>({logsTotal} entrées)</span>}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={logSeverity}
              onChange={e => setLogSeverity(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--sa2-border)', background: 'var(--sa2-surface2)', color: 'var(--sa2-text)', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              <option value="">Toute sévérité</option>
              {SEV_ORDER.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select
              value={logModule}
              onChange={e => setLogModule(e.target.value)}
              style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--sa2-border)', background: 'var(--sa2-surface2)', color: 'var(--sa2-text)', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              <option value="">Tous les modules</option>
              {['system','auth','api','health','realtime','ttlock','rfid','stripe','automation'].map(m =>
                <option key={m} value={m}>{m}</option>
              )}
            </select>
            <button
              onClick={loadLogs}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--sa2-border)', background: 'transparent', color: 'var(--sa2-text-muted)', fontSize: '0.72rem', cursor: 'pointer' }}
            >
              <RefreshCw size={11} style={{ animation: logsLoading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {!tableReady ? (
          <div style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--sa2-text-muted)', marginBottom: 6 }}>
              La table <code style={{ background: 'var(--sa2-surface2)', padding: '1px 5px', borderRadius: 4 }}>system_logs</code> n'existe pas encore.
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--sa2-text-muted)' }}>
              Exécutez <strong>database/migrations/001_system_logs.sql</strong> dans votre éditeur SQL Supabase pour l'activer.
            </div>
          </div>
        ) : logsLoading ? (
          <div style={{ padding: '20px' }}>
            {[1,2,3].map(i => <div key={i} className="sa2-skeleton" style={{ height: 32, marginBottom: 6, borderRadius: 6 }} />)}
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '24px 20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--sa2-text-muted)' }}>
            Aucun log système{logSeverity || logModule ? ' pour ce filtre' : ''}.
          </div>
        ) : (
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'var(--sa2-surface2)', position: 'sticky', top: 0, zIndex: 1 }}>
                  {['Sévérité', 'Module', 'Message', 'Date'].map(h => (
                    <th key={h} style={{ padding: '7px 12px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 700, color: 'var(--sa2-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--sa2-border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => {
                  const col = SEVERITY_COLOR[log.severity] || '#6B7280';
                  return (
                    <tr key={log.id || i} style={{ borderBottom: '1px solid var(--sa2-border)' }}>
                      <td style={{ padding: '7px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: col + '18', border: `1px solid ${col}30`, fontSize: '0.68rem', fontWeight: 600, color: col }}>
                          {log.severity}
                        </span>
                      </td>
                      <td style={{ padding: '7px 12px', color: 'var(--sa2-text-muted)', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>{log.module}</td>
                      <td style={{ padding: '7px 12px', color: 'var(--sa2-text)', maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.message}>
                        {log.message}
                        {log.details && (
                          <span style={{ marginLeft: 6, fontSize: '0.65rem', color: 'var(--sa2-text-muted)' }}>
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details).slice(0, 60)}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '7px 12px', color: 'var(--sa2-text-muted)', whiteSpace: 'nowrap', fontSize: '0.7rem' }}>
                        {fmtDateFull(log.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Real-time note ───────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#3B82F610', border: '1px solid #3B82F630', borderRadius: 10, fontSize: '0.75rem', color: '#93C5FD' }}>
        <Radio size={12} />
        Les modules PMS (réservations, clients, chambres, paiements, accès) reçoivent les mises à jour en temps réel via Supabase Realtime — aucun rechargement de page nécessaire.
      </div>
    </div>
  );
}
