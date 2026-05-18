import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Zap, Play, Square, RefreshCw, CheckCircle2, AlertTriangle,
  XCircle, Info, Clock, Key, Lock, Globe, Building2, ArrowRight,
  Plus, Trash2, X, Settings, Activity, ChevronRight, Wifi,
  BarChart3, Bell, Calendar, User, Shield, Hash, Eye, EyeOff,
  PlusCircle, AlertCircle, Check, Link as LinkIcon, Mail, MessageCircle,
  Send, Copy, ExternalLink, Smartphone, ToggleLeft, ToggleRight,
  BookOpen, FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AutomationEngine,
  automationEvents,
  getAutomationLog,
  getPropertyLockMap,
  savePropertyLockMap,
} from '../../lib/automation';
import {
  getNotifConfig, saveNotifConfig,
  getNotifLog, clearNotifLog,
  buildTemplateVars, buildSMSText, buildWhatsAppLink,
  sendEmailNotification,
  DEFAULT_SMS_TEMPLATE, DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_BODY,
} from '../../lib/notifications';
import { channexAPI } from '../../lib/channex';
import { logError } from '../../lib/errorHandler';
import { toast } from '../../lib/toast';
import { secureStorage } from '../../lib/secureStorage';
import './AutomationHub.css';

const AutomationHub = () => {
  const [running, setRunning] = useState(AutomationEngine.isRunning);
  const [log, setLog] = useState(getAutomationLog());
  const [mappings, setMappings] = useState(getPropertyLockMap());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cycleStats, setCycleStats] = useState({ newBookings: 0, pinsCreated: 0, errors: 0 });
  const [lastCycle, setLastCycle] = useState(null);
  const [cycling, setCycling] = useState(false);
  const [interval, setIntervalMin] = useState(5);

  // Tokens
  const channexToken = secureStorage.getSensitive('channex_token', '');
  const ttlockToken = sessionStorage.getItem('ttlock_token') || '';
  const hasChannex = !!channexToken;
  const hasTTLock = !!ttlockToken;
  const isReady = hasChannex && hasTTLock;

  // Properties from Channex
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  // Mapping modal
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [newMapPropertyId, setNewMapPropertyId] = useState('');
  const [newMapPropertyName, setNewMapPropertyName] = useState('');
  const [newMapLockId, setNewMapLockId] = useState('');
  const [newMapLockName, setNewMapLockName] = useState('');

  // ── Notification state ───────────────────────────────────────────────────
  const [notifConfig, setNotifConfig] = useState(getNotifConfig());
  const [notifLog, setNotifLog] = useState(getNotifLog());
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showEjsKey, setShowEjsKey] = useState(false);
  const [copied, setCopied] = useState('');
  const [smsPreview, setSmsPreview] = useState('');

  // Persist config changes
  const updateNotifConfig = (patch) => {
    const updated = { ...notifConfig, ...patch };
    setNotifConfig(updated);
    saveNotifConfig(updated);
  };

  // SMS preview with sample data
  useEffect(() => {
    const sample = buildTemplateVars({
      guestName: 'Marie Dupont', guestEmail: 'marie@example.com',
      guestPhone: '+212600000000', propertyName: 'Villa Sunrise',
      pin: '320102', lockName: 'Porte Principale', arrivalDate: '2026-06-10',
      departureDate: '2026-06-15', bookingId: 'bk-abc123',
    });
    setSmsPreview(
      (notifConfig.smsTemplate || DEFAULT_SMS_TEMPLATE)
        .replace(/\{\{(\w+)\}\}/g, (_, k) => sample[k] ?? `{{${k}}}`)
    );
  }, [notifConfig.smsTemplate]);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleTestEmail = async () => {
    if (testSending) return;
    setTestSending(true);
    setTestResult(null);
    try {
      await sendEmailNotification({
        guestName: 'Test Client', guestEmail: notifConfig.testEmail || '',
        guestPhone: '', propertyName: 'Villa Test Hova',
        pin: '123456', lockName: 'Porte Principale',
        arrivalDate: '2026-06-10', departureDate: '2026-06-15',
        bookingId: 'test-001',
      });
      setTestResult({ ok: true, msg: 'Email envoyé avec succès !' });
      setNotifLog(getNotifLog());
    } catch (e) {
      const msg = e.text || e.message || 'Erreur envoi';
      logError('automation.test', msg);
      toast.error(msg);
      setTestResult({ ok: false, msg });
    }
    setTestSending(false);
  };

  // Log auto-scroll
  const logEndRef = useRef(null);

  useEffect(() => {
    const onLog = (e) => {
      setLog(getAutomationLog());
    };
    const onStatus = (e) => {
      setRunning(e.detail.running);
    };
    const onCycleStart = () => setCycling(true);
    const onCycleEnd = (e) => {
      setCycling(false);
      setCycleStats(e.detail);
      setLastCycle(new Date());
    };

    automationEvents.addEventListener('log', onLog);
    automationEvents.addEventListener('log-cleared', onLog);
    automationEvents.addEventListener('status', onStatus);
    automationEvents.addEventListener('cycle-start', onCycleStart);
    automationEvents.addEventListener('cycle-end', onCycleEnd);

    return () => {
      automationEvents.removeEventListener('log', onLog);
      automationEvents.removeEventListener('log-cleared', onLog);
      automationEvents.removeEventListener('status', onStatus);
      automationEvents.removeEventListener('cycle-start', onCycleStart);
      automationEvents.removeEventListener('cycle-end', onCycleEnd);
    };
  }, []);

  useEffect(() => {
    if (logEndRef.current && activeTab === 'logs') {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [log, activeTab]);

  const loadProperties = useCallback(async () => {
    if (!channexToken) return;
    setPropertiesLoading(true);
    try {
      const res = await channexAPI.getProperties(channexToken);
      if (res?.data) setProperties(res.data);
    } catch (e) {
      logError('automation.properties', e?.message || 'Échec du chargement des propriétés');
    }
    setPropertiesLoading(false);
  }, [channexToken]);

  useEffect(() => {
    if (activeTab === 'mapping') loadProperties();
  }, [activeTab]);

  const handleStart = () => {
    if (!isReady) return;
    AutomationEngine.start(channexToken, ttlockToken, interval);
    setRunning(true);
  };

  const handleStop = () => {
    AutomationEngine.stop();
    setRunning(false);
  };

  const handleManualRun = async () => {
    if (!isReady || cycling) return;
    await AutomationEngine.runOnce(channexToken, ttlockToken);
  };

  const addMapping = () => {
    if (!newMapPropertyId || !newMapLockId) return;
    const updated = [
      ...mappings,
      {
        id: Date.now(),
        channexPropertyId: newMapPropertyId,
        propertyName: newMapPropertyName || newMapPropertyId,
        ttlockLockId: newMapLockId,
        lockName: newMapLockName || newMapLockId,
        createdAt: new Date().toISOString(),
      }
    ];
    setMappings(updated);
    savePropertyLockMap(updated);
    setNewMapPropertyId('');
    setNewMapPropertyName('');
    setNewMapLockId('');
    setNewMapLockName('');
    setShowMappingModal(false);
  };

  const removeMapping = (id) => {
    const updated = mappings.filter(m => m.id !== id);
    setMappings(updated);
    savePropertyLockMap(updated);
  };

  const pinsCreatedCount = log.filter(e => e.type === 'pin-created').length;
  const errorsCount = log.filter(e => e.status === 'error').length;

  const TABS = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Activity },
    { id: 'mapping', label: 'Mapping Propriétés', icon: LinkIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'logs', label: `Activité (${log.length})`, icon: Clock },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  const getLogIcon = (entry) => {
    if (entry.type === 'pin-created') return <CheckCircle2 size={15} />;
    if (entry.type === 'error') return <XCircle size={15} />;
    if (entry.type === 'skip') return <AlertTriangle size={15} />;
    if (entry.type === 'engine-start') return <Play size={15} />;
    if (entry.type === 'engine-stop') return <Square size={15} />;
    return <Info size={15} />;
  };

  const getLogColor = (entry) => {
    if (entry.status === 'success') return '#10B981';
    if (entry.status === 'error') return '#EF4444';
    if (entry.status === 'warning') return '#F59E0B';
    return '#6366F1';
  };

  return (
    <div className="ah-wrapper">

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="ah-header">
        <div className="ah-header-left">
          <div className={`ah-engine-badge ${running ? 'on' : 'off'}`}>
            <Zap size={18} />
          </div>
          <div>
            <h1 className="ah-title">Automation Engine</h1>
            <p className="ah-subtitle">
              Channex.io Booking → TTLock PIN · Auto-création de codes d'accès
            </p>
          </div>
        </div>
        <div className="ah-header-right">
          {running && (
            <div className="ah-running-badge">
              <div className="ah-dot pulse" />
              Actif · Cycle /{interval}min
            </div>
          )}
          <button
            className="ah-btn-icon"
            onClick={handleManualRun}
            disabled={!isReady || cycling}
            title="Lancer un cycle maintenant"
          >
            <RefreshCw size={16} className={cycling ? 'ah-spin' : ''} />
          </button>
          {running ? (
            <button className="ah-btn-stop" onClick={handleStop}>
              <Square size={15} /> Arrêter
            </button>
          ) : (
            <button className="ah-btn-start" onClick={handleStart} disabled={!isReady}>
              <Play size={15} /> Démarrer
            </button>
          )}
        </div>
      </div>

      {/* ── NOT READY BANNER ───────────────────────────── */}
      {!isReady && (
        <div className="ah-warn-banner">
          <AlertCircle size={15} />
          <span>
            {!hasChannex && 'Connectez Channex.io dans Channel Manager · '}
            {!hasTTLock && 'Connectez TTLock dans Serrures Connectées'}
          </span>
        </div>
      )}

      {/* ── TABS ───────────────────────────────────────── */}
      <div className="ah-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`ah-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <t.icon size={14} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── CONTENT ────────────────────────────────────── */}
      <div className="ah-content">

        {/* ── DASHBOARD ─── */}
        {activeTab === 'dashboard' && (
          <div className="ah-section">
            <div className="ah-metrics-grid">
              <div className="ah-metric">
                <div className="ah-metric-icon" style={{ background: '#EEF2FF', color: '#6366F1' }}><Key size={20} /></div>
                <div className="ah-metric-val">{pinsCreatedCount}</div>
                <div className="ah-metric-label">PINs créés</div>
              </div>
              <div className="ah-metric">
                <div className="ah-metric-icon" style={{ background: '#D1FAE5', color: '#10B981' }}><CheckCircle2 size={20} /></div>
                <div className="ah-metric-val">{mappings.length}</div>
                <div className="ah-metric-label">Propriétés mappées</div>
              </div>
              <div className="ah-metric">
                <div className="ah-metric-icon" style={{ background: errorsCount > 0 ? '#FEF2F2' : '#F0FDF4', color: errorsCount > 0 ? '#EF4444' : '#10B981' }}>
                  {errorsCount > 0 ? <XCircle size={20} /> : <Shield size={20} />}
                </div>
                <div className="ah-metric-val">{errorsCount}</div>
                <div className="ah-metric-label">Erreurs</div>
              </div>
              <div className="ah-metric">
                <div className="ah-metric-icon" style={{ background: '#FFF7ED', color: '#F59E0B' }}><Clock size={20} /></div>
                <div className="ah-metric-val">{interval}m</div>
                <div className="ah-metric-label">Intervalle</div>
              </div>
            </div>

            {/* How it works */}
            <div className="ah-card">
              <div className="ah-card-header">
                <h3><Zap size={16} /> Fonctionnement</h3>
              </div>
              <div className="ah-flow">
                {[
                  { icon: <Globe size={18} />, color: '#6366F1', label: 'Channex.io', desc: 'Nouvelle réservation confirmée' },
                  { icon: <ArrowRight size={16} />, color: '#94A3B8', label: '', desc: '' },
                  { icon: <Activity size={18} />, color: '#F59E0B', label: 'Engine', desc: 'Détecte et traite en automatique' },
                  { icon: <ArrowRight size={16} />, color: '#94A3B8', label: '', desc: '' },
                  { icon: <Key size={18} />, color: '#10B981', label: 'TTLock', desc: 'PIN créé pour la période exacte' },
                  { icon: <ArrowRight size={16} />, color: '#94A3B8', label: '', desc: '' },
                  { icon: <User size={18} />, color: '#3B82F6', label: 'Client', desc: 'Accès automatique à la chambre' },
                ].map((step, i) => (
                  <div key={i} className={`ah-flow-step ${step.label ? 'node' : 'arrow'}`}>
                    {step.label ? (
                      <>
                        <div className="ah-flow-icon" style={{ background: step.color + '18', color: step.color }}>
                          {step.icon}
                        </div>
                        <div className="ah-flow-label">{step.label}</div>
                        <div className="ah-flow-desc">{step.desc}</div>
                      </>
                    ) : (
                      <div className="ah-flow-arr">{step.icon}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Last cycle */}
            {lastCycle && (
              <div className="ah-card">
                <div className="ah-card-header">
                  <h3><Clock size={16} /> Dernier cycle</h3>
                  <span className="ah-badge-time">{lastCycle.toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <div className="ah-cycle-row">
                  <div className="ah-cycle-item"><Calendar size={14} />{cycleStats.newBookings} nouvelle{cycleStats.newBookings !== 1 ? 's' : ''} rés.</div>
                  <div className="ah-cycle-item success"><Key size={14} />{cycleStats.pinsCreated} PIN{cycleStats.pinsCreated !== 1 ? 's' : ''} créé{cycleStats.pinsCreated !== 1 ? 's' : ''}</div>
                  {cycleStats.errors > 0 && <div className="ah-cycle-item error"><XCircle size={14} />{cycleStats.errors} erreur{cycleStats.errors !== 1 ? 's' : ''}</div>}
                </div>
              </div>
            )}

            {/* Recent log preview */}
            <div className="ah-card">
              <div className="ah-card-header">
                <h3><Activity size={16} /> Activité récente</h3>
                <button className="ah-link" onClick={() => setActiveTab('logs')}>Voir tout →</button>
              </div>
              {log.slice(0, 5).length === 0 ? (
                <div className="ah-empty">
                  <Clock size={28} />
                  <p>Aucune activité · Démarrez le moteur pour commencer</p>
                </div>
              ) : (
                <div className="ah-log-list">
                  {log.slice(0, 5).map(entry => (
                    <div key={entry.id} className="ah-log-item">
                      <div className="ah-log-icon" style={{ color: getLogColor(entry) }}>
                        {getLogIcon(entry)}
                      </div>
                      <div className="ah-log-text">{entry.message}</div>
                      <div className="ah-log-time">
                        {new Date(entry.createdAt).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MAPPING ─── */}
        {activeTab === 'mapping' && (
          <div className="ah-section">
            <div className="ah-section-header">
              <div>
                <h2>Mapping Propriétés ↔ Serrures</h2>
                <p>Associez chaque propriété Channex.io à une serrure TTLock pour l'auto-création des PINs.</p>
              </div>
              <button className="ah-btn-primary" onClick={() => setShowMappingModal(true)}>
                <Plus size={15} /> Ajouter mapping
              </button>
            </div>

            {/* Channex properties hint */}
            {properties.length > 0 && (
              <div className="ah-hint-box">
                <Globe size={14} />
                <span>Propriétés Channex disponibles :</span>
                {properties.map(p => (
                  <button key={p.id} className="ah-prop-chip" onClick={() => {
                    setNewMapPropertyId(p.id);
                    setNewMapPropertyName(p.attributes?.title || p.id);
                    setShowMappingModal(true);
                  }}>
                    {p.attributes?.title || p.id}
                  </button>
                ))}
              </div>
            )}

            {mappings.length === 0 ? (
              <div className="ah-empty-box">
                <LinkIcon size={36} />
                <h3>Aucun mapping configuré</h3>
                <p>Associez vos propriétés Channex à vos serrures TTLock pour activer l'automation.</p>
                <button className="ah-btn-primary" onClick={() => setShowMappingModal(true)}>
                  <Plus size={14} /> Créer le premier mapping
                </button>
              </div>
            ) : (
              <div className="ah-mapping-list">
                {mappings.map(m => (
                  <div key={m.id} className="ah-mapping-card">
                    <div className="ah-mapping-left">
                      <div className="ah-mapping-icon channex"><Globe size={18} /></div>
                      <div>
                        <strong>{m.propertyName || m.channexPropertyId}</strong>
                        <span>ID: {m.channexPropertyId}</span>
                      </div>
                    </div>
                    <div className="ah-mapping-arrow"><ArrowRight size={18} /></div>
                    <div className="ah-mapping-right">
                      <div className="ah-mapping-icon lock"><Lock size={18} /></div>
                      <div>
                        <strong>{m.lockName || m.ttlockLockId}</strong>
                        <span>Lock ID: {m.ttlockLockId}</span>
                      </div>
                    </div>
                    <button className="ah-remove-btn" onClick={() => removeMapping(m.id)} title="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── NOTIFICATIONS ─── */}
        {activeTab === 'notifications' && (
          <div className="ah-section">

            {/* ─ Channel toggles ─ */}
            <div className="ah-notif-channels">
              <div className={`ah-channel-card ${notifConfig.emailEnabled ? 'enabled' : ''}`}>
                <div className="ah-channel-icon email"><Mail size={20} /></div>
                <div className="ah-channel-body">
                  <strong>Email automatique</strong>
                  <span>Envoyé via EmailJS au client dès la création du PIN</span>
                </div>
                <button className="ah-toggle-btn" onClick={() => updateNotifConfig({ emailEnabled: !notifConfig.emailEnabled })}>
                  {notifConfig.emailEnabled
                    ? <ToggleRight size={28} color="#6366F1" />
                    : <ToggleLeft size={28} color="#94A3B8" />}
                </button>
              </div>

              <div className={`ah-channel-card ${notifConfig.whatsappEnabled ? 'enabled' : ''}`}>
                <div className="ah-channel-icon whatsapp"><MessageCircle size={20} /></div>
                <div className="ah-channel-body">
                  <strong>WhatsApp</strong>
                  <span>Lien pré-rempli généré dans le journal · clic pour envoyer</span>
                </div>
                <button className="ah-toggle-btn" onClick={() => updateNotifConfig({ whatsappEnabled: !notifConfig.whatsappEnabled })}>
                  {notifConfig.whatsappEnabled
                    ? <ToggleRight size={28} color="#25D366" />
                    : <ToggleLeft size={28} color="#94A3B8" />}
                </button>
              </div>
            </div>

            {/* ─ EmailJS Config ─ */}
            {notifConfig.emailEnabled && (
              <div className="ah-card">
                <div className="ah-card-header">
                  <h3><Mail size={15} /> Configuration EmailJS</h3>
                  <a
                    href="https://www.emailjs.com"
                    target="_blank"
                    rel="noreferrer"
                    className="ah-ext-link"
                  >
                    emailjs.com <ExternalLink size={11} />
                  </a>
                </div>

                <div className="ah-notif-fields">
                  <div className="ah-field">
                    <label>Service ID</label>
                    <input
                      type="text"
                      placeholder="service_xxxxxxx"
                      value={notifConfig.ejsServiceId || ''}
                      onChange={e => updateNotifConfig({ ejsServiceId: e.target.value })}
                    />
                    <span className="ah-field-hint">EmailJS → Email Services → Service ID</span>
                  </div>

                  <div className="ah-field">
                    <label>Template ID</label>
                    <input
                      type="text"
                      placeholder="template_xxxxxxx"
                      value={notifConfig.ejsTemplateId || ''}
                      onChange={e => updateNotifConfig({ ejsTemplateId: e.target.value })}
                    />
                    <span className="ah-field-hint">EmailJS → Email Templates → Template ID</span>
                  </div>

                  <div className="ah-field">
                    <label>Clé publique</label>
                    <div className="ah-input-row">
                      <input
                        type={showEjsKey ? 'text' : 'password'}
                        placeholder="•••••••••••••"
                        value={notifConfig.ejsPublicKey || ''}
                        onChange={e => updateNotifConfig({ ejsPublicKey: e.target.value })}
                      />
                      <button className="ah-eye-btn" onClick={() => setShowEjsKey(v => !v)}>
                        {showEjsKey ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <span className="ah-field-hint">EmailJS → Account → Public Key</span>
                  </div>

                  <div className="ah-field">
                    <label>Objet de l'email</label>
                    <input
                      type="text"
                      placeholder={DEFAULT_EMAIL_SUBJECT}
                      value={notifConfig.emailSubject || ''}
                      onChange={e => updateNotifConfig({ emailSubject: e.target.value })}
                    />
                  </div>
                </div>

                {/* Template vars reference */}
                <div className="ah-vars-box">
                  <div className="ah-vars-title"><BookOpen size={12} /> Variables disponibles dans le template EmailJS :</div>
                  <div className="ah-vars-list">
                    {['guest_name','property_name','pin_code','lock_name','arrival_date','departure_date','valid_from','valid_to','guest_email','booking_id'].map(v => (
                      <button key={v} className="ah-var-chip" onClick={() => copyToClipboard(`{{${v}}}`, v)}>
                        {copied === v ? <Check size={10} /> : <Copy size={10} />}
                        {`{{${v}}}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test email */}
                <div className="ah-test-row">
                  <div className="ah-field" style={{ flex: 1, marginBottom: 0 }}>
                    <label>Email de test</label>
                    <input
                      type="email"
                      placeholder="vous@exemple.com"
                      value={notifConfig.testEmail || ''}
                      onChange={e => updateNotifConfig({ testEmail: e.target.value })}
                    />
                  </div>
                  <button
                    className="ah-btn-primary"
                    onClick={handleTestEmail}
                    disabled={testSending || !notifConfig.ejsServiceId || !notifConfig.ejsTemplateId || !notifConfig.ejsPublicKey || !notifConfig.testEmail}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    {testSending ? <RefreshCw size={13} className="ah-spin" /> : <FlaskConical size={13} />}
                    Tester
                  </button>
                </div>

                {testResult && (
                  <div className={`ah-test-result ${testResult.ok ? 'ok' : 'fail'}`}>
                    {testResult.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    {testResult.msg}
                  </div>
                )}
              </div>
            )}

            {/* ─ SMS / WhatsApp template ─ */}
            <div className="ah-card">
              <div className="ah-card-header">
                <h3><Smartphone size={15} /> Template SMS / WhatsApp</h3>
                <button
                  className="ah-btn-ghost"
                  style={{ fontSize: '0.72rem' }}
                  onClick={() => updateNotifConfig({ smsTemplate: DEFAULT_SMS_TEMPLATE })}
                >
                  Réinitialiser
                </button>
              </div>

              <div className="ah-sms-split">
                <div className="ah-sms-editor">
                  <label className="ah-sms-label">Template</label>
                  <textarea
                    className="ah-sms-textarea"
                    value={notifConfig.smsTemplate || DEFAULT_SMS_TEMPLATE}
                    onChange={e => updateNotifConfig({ smsTemplate: e.target.value })}
                    rows={9}
                    spellCheck={false}
                  />
                </div>
                <div className="ah-sms-preview-col">
                  <label className="ah-sms-label">Aperçu (données test)</label>
                  <div className="ah-phone-mockup">
                    <div className="ah-phone-bubble">{smsPreview}</div>
                  </div>
                  <button
                    className="ah-btn-secondary"
                    style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
                    onClick={() => copyToClipboard(smsPreview, 'sms')}
                  >
                    {copied === 'sms' ? <Check size={12} /> : <Copy size={12} />}
                    {copied === 'sms' ? 'Copié !' : 'Copier le message'}
                  </button>
                </div>
              </div>
            </div>

            {/* ─ Notification log ─ */}
            <div className="ah-card">
              <div className="ah-card-header">
                <h3><Send size={15} /> Historique des envois</h3>
                <button className="ah-btn-ghost" style={{ fontSize: '0.72rem' }} onClick={() => { clearNotifLog(); setNotifLog([]); }}>
                  <Trash2 size={11} /> Vider
                </button>
              </div>

              {notifLog.length === 0 ? (
                <div className="ah-empty">
                  <Mail size={24} />
                  <p>Aucune notification envoyée pour l'instant</p>
                </div>
              ) : (
                <div className="ah-notif-log">
                  {notifLog.map(n => (
                    <div key={n.id} className={`ah-notif-log-item ${n.status}`}>
                      <div className="ah-notif-log-icon">
                        {n.channel === 'email' ? <Mail size={13} /> : <MessageCircle size={13} />}
                      </div>
                      <div className="ah-notif-log-body">
                        <span className="ah-notif-log-to">{n.to || n.guestName}</span>
                        {n.pin && <span className="ah-notif-log-pin"><Key size={10} />{n.pin}</span>}
                        {n.error && <span className="ah-notif-log-err">{n.error}</span>}
                      </div>
                      <div className="ah-notif-log-time">
                        {new Date(n.sentAt).toLocaleString('fr', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── LOGS ─── */}
        {activeTab === 'logs' && (
          <div className="ah-section">
            <div className="ah-section-header">
              <h2>Journal d'Activité</h2>
              <div className="ah-header-actions">
                <button className="ah-btn-secondary" onClick={handleManualRun} disabled={!isReady || cycling}>
                  <RefreshCw size={13} className={cycling ? 'ah-spin' : ''} /> Lancer cycle
                </button>
                <button className="ah-btn-ghost" onClick={() => { AutomationEngine.clearLog(); setLog([]); }}>
                  <Trash2 size={13} /> Vider
                </button>
              </div>
            </div>

            {log.length === 0 ? (
              <div className="ah-empty-box">
                <Activity size={36} />
                <h3>Journal vide</h3>
                <p>Les événements de l'automation apparaîtront ici en temps réel.</p>
              </div>
            ) : (
              <div className="ah-full-log">
                <AnimatePresence>
                  {log.map(entry => (
                    <motion.div
                      key={entry.id}
                      className={`ah-log-full ${entry.status}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="ah-log-full-icon" style={{ color: getLogColor(entry) }}>
                        {getLogIcon(entry)}
                      </div>
                      <div className="ah-log-full-body">
                        <div className="ah-log-full-msg">{entry.message}</div>
                        <div className="ah-log-full-meta">
                          {entry.bookingId && <span><Hash size={10} /> {entry.bookingId.slice(0, 8)}</span>}
                          {entry.pin && <span><Key size={10} /> PIN: <strong>{entry.pin}</strong></span>}
                          {entry.lockName && <span><Lock size={10} /> {entry.lockName}</span>}
                        </div>
                      </div>
                      <div className="ah-log-full-time">
                        {new Date(entry.createdAt).toLocaleString('fr', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={logEndRef} />
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ─── */}
        {activeTab === 'settings' && (
          <div className="ah-section">
            <div className="ah-settings-grid">
              <div className="ah-card">
                <div className="ah-card-header"><h3><Clock size={15} /> Intervalle de polling</h3></div>
                <div className="ah-setting-row">
                  <span>Fréquence de vérification des réservations</span>
                  <div className="ah-interval-btns">
                    {[1, 5, 10, 15, 30].map(m => (
                      <button
                        key={m}
                        className={`ah-interval-btn ${interval === m ? 'active' : ''}`}
                        onClick={() => setIntervalMin(m)}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
                <p className="ah-setting-hint">
                  Recommandé : 5 min pour une réactivité optimale sans surcharger l'API Channex.
                </p>
              </div>

              <div className="ah-card">
                <div className="ah-card-header"><h3><Globe size={15} /> Statut Channex.io</h3></div>
                <div className="ah-conn-status">
                  {hasChannex ? (
                    <><CheckCircle2 size={16} style={{ color: '#10B981' }} /> Connecté · Clé API configurée</>
                  ) : (
                    <><XCircle size={16} style={{ color: '#EF4444' }} /> Non connecté</>
                  )}
                </div>
              </div>

              <div className="ah-card">
                <div className="ah-card-header"><h3><Lock size={15} /> Statut TTLock</h3></div>
                <div className="ah-conn-status">
                  {hasTTLock ? (
                    <><CheckCircle2 size={16} style={{ color: '#10B981' }} /> Connecté · Token actif</>
                  ) : (
                    <><XCircle size={16} style={{ color: '#EF4444' }} /> Non connecté</>
                  )}
                </div>
              </div>

              <div className="ah-card">
                <div className="ah-card-header"><h3><Key size={15} /> Format des PINs</h3></div>
                <p className="ah-setting-hint" style={{ margin: 0, padding: '12px 0 4px' }}>
                  Format 6 chiffres généré à partir du nom du client et de la date d'arrivée.
                  Chaque PIN est unique par séjour. Validité : check-in 14h → check-out 12h.
                </p>
                <div className="ah-pin-example">
                  <Hash size={12} /> Exemple : <strong>3201022026</strong> → Dupont · 02/01/2026
                </div>
              </div>

              <div className="ah-card ah-danger-zone">
                <div className="ah-card-header"><h3><Trash2 size={15} /> Zone de reset</h3></div>
                <div className="ah-danger-actions">
                  <button className="ah-btn-ghost red" onClick={() => { AutomationEngine.clearLog(); setLog([]); }}>
                    <Trash2 size={13} /> Vider le journal
                  </button>
                  <button className="ah-btn-ghost red" onClick={() => AutomationEngine.clearProcessed()}>
                    <RefreshCw size={13} /> Réinitialiser les réservations traitées
                  </button>
                </div>
                <p className="ah-setting-hint">Réinitialiser les traitées permet de recréer des PINs pour des réservations déjà traitées (test).</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MAPPING MODAL ──────────────────────────────── */}
      <AnimatePresence>
        {showMappingModal && (
          <div className="ah-modal-overlay" onClick={() => setShowMappingModal(false)}>
            <motion.div
              className="ah-modal"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="ah-modal-close" onClick={() => setShowMappingModal(false)}><X size={18} /></button>
              <div className="ah-modal-header">
                <div className="ah-modal-icon"><LinkIcon size={22} /></div>
                <h2>Nouveau Mapping</h2>
                <p>Associez une propriété Channex.io à une serrure TTLock.</p>
              </div>

              <div className="ah-modal-body">
                <div className="ah-field">
                  <label>Propriété Channex</label>
                  {properties.length > 0 ? (
                    <select value={newMapPropertyId} onChange={e => {
                      const prop = properties.find(p => p.id === e.target.value);
                      setNewMapPropertyId(e.target.value);
                      setNewMapPropertyName(prop?.attributes?.title || '');
                    }}>
                      <option value="">-- Sélectionner --</option>
                      {properties.map(p => (
                        <option key={p.id} value={p.id}>{p.attributes?.title || p.id}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="ID ou nom de la propriété Channex"
                      value={newMapPropertyId}
                      onChange={e => setNewMapPropertyId(e.target.value)}
                    />
                  )}
                </div>

                <div className="ah-field">
                  <label>Nom affiché (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Villa Sunrise"
                    value={newMapPropertyName}
                    onChange={e => setNewMapPropertyName(e.target.value)}
                  />
                </div>

                <div className="ah-mapping-divider"><ArrowRight size={18} /></div>

                <div className="ah-field">
                  <label>Lock ID TTLock</label>
                  <input
                    type="text"
                    placeholder="Ex: 3247891"
                    value={newMapLockId}
                    onChange={e => setNewMapLockId(e.target.value)}
                  />
                  <span className="ah-field-hint">Trouvez l'ID dans Serrures Connectées → Détail</span>
                </div>

                <div className="ah-field">
                  <label>Nom de la serrure (optionnel)</label>
                  <input
                    type="text"
                    placeholder="Ex: Porte Principale Suite 201"
                    value={newMapLockName}
                    onChange={e => setNewMapLockName(e.target.value)}
                  />
                </div>
              </div>

              <div className="ah-modal-actions">
                <button className="ah-btn-secondary" onClick={() => setShowMappingModal(false)}>Annuler</button>
                <button
                  className="ah-btn-primary"
                  onClick={addMapping}
                  disabled={!newMapPropertyId || !newMapLockId}
                >
                  <Check size={14} /> Enregistrer mapping
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutomationHub;
