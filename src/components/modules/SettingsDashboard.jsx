import React, { useState } from 'react';
import {
  Building2, Home, Users, CreditCard, Globe, ShieldCheck,
  Check, Save, Camera, Lock, RefreshCw, Bell, Key, Palette,
  MapPin, Hash, Euro, Clock, AlertTriangle, Eye, EyeOff,
  BadgeCheck, PlusCircle, Trash2, ChevronRight, ToggleLeft,
  ToggleRight, Mail, Phone, Wifi, Database, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SettingsDashboard.css';

const NAV = [
  { group: 'Organisation', items: [
    { id: 'identity',     label: 'Identité & Marque',         icon: Building2,   color: '#6366F1' },
    { id: 'properties',   label: 'Propriétés & OTA',          icon: Home,        color: '#FF385C' },
    { id: 'team',         label: 'Équipe & Accès',            icon: Users,       color: '#3B82F6' },
  ]},
  { group: 'Finances',    items: [
    { id: 'billing',      label: 'Abonnement & Facturation',  icon: CreditCard,  color: '#10B981' },
    { id: 'payout',       label: 'Compte de Reversement',     icon: Euro,        color: '#F59E0B' },
  ]},
  { group: 'Système',     items: [
    { id: 'integrations', label: 'Intégrations & API',        icon: Globe,       color: '#8B5CF6' },
    { id: 'notifications',label: 'Notifications',             icon: Bell,        color: '#EC4899' },
    { id: 'security',     label: 'Sécurité',                  icon: ShieldCheck, color: '#EF4444' },
  ]},
];

const TEAM = [
  { name: 'Directeur Général', role: 'Super Admin',      email: 'dg@ocean-atlantique.ma',    online: true,  color: '#0F172A' },
  { name: 'Mehdi Tazi',        role: 'Réceptionniste',   email: 'mehdi@ocean-atlantique.ma', online: true,  color: '#3B82F6' },
  { name: 'Sara Benali',       role: 'Ménage',           email: 'sara@ocean-atlantique.ma',  online: false, color: '#8B5CF6' },
];

const INTEGRATIONS = [
  { id: 'channex',   name: 'Channex.io',     desc: 'Channel Manager — Airbnb, Booking, Expedia',  status: 'connected', color: '#3B82F6', icon: 'CX' },
  { id: 'stripe',    name: 'Stripe Live',    desc: 'Paiements en ligne — cartes CB/Visa',          status: 'connected', color: '#6366F1', icon: 'S'  },
  { id: 'emailjs',   name: 'EmailJS',        desc: 'Emails automatiques — confirmations / check-in', status: 'connected', color: '#EC4899', icon: 'EJ' },
  { id: 'ttlock',    name: 'TTLock Cloud',   desc: 'Serrures connectées Bluetooth/WiFi',           status: 'connected', color: '#10B981', icon: '🔐' },
  { id: 'beds24',    name: 'Beds24',         desc: 'PMS externe — sync bidirectionnelle',          status: 'pending',   color: '#F59E0B', icon: 'B2' },
  { id: 'zapier',    name: 'Zapier',         desc: 'Automatisations no-code — 5000+ apps',         status: 'inactive',  color: '#94A3B8', icon: 'Z'  },
];

const Toggle = ({ on, onToggle }) => (
  <button className={`sd2-toggle ${on ? 'on' : ''}`} onClick={onToggle} type="button">
    <span className="sd2-toggle-thumb" />
  </button>
);

const Field = ({ label, hint, children }) => (
  <div className="sd2-field">
    <div className="sd2-field-label">
      <span>{label}</span>
      {hint && <span className="sd2-field-hint">{hint}</span>}
    </div>
    <div className="sd2-field-input">{children}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="sd2-section">
    <div className="sd2-section-title">{title}</div>
    {children}
  </div>
);

/* ── Section renderers ─────────────────────────────────── */
const renderIdentity = () => (
  <>
    <Section title="Informations générales">
      <Field label="Nom de l'établissement" hint="Affiché sur les factures et emails clients">
        <input className="sd2-input" defaultValue="Villa Océan Atlantique" />
      </Field>
      <Field label="Email de contact principal">
        <input className="sd2-input" type="email" defaultValue="direction@ocean-atlantique.ma" />
      </Field>
      <Field label="Téléphone">
        <input className="sd2-input" type="tel" defaultValue="+212 522 000 000" />
      </Field>
      <Field label="Adresse">
        <input className="sd2-input" defaultValue="12 Boulevard de la Corniche, Casablanca, Maroc" />
      </Field>
    </Section>
    <Section title="Identité visuelle">
      <Field label="Logo officiel" hint="PNG 512×512 recommandé">
        <div className="sd2-upload">
          <div className="sd2-upload-preview"><Camera size={18} /></div>
          <div>
            <button className="sd2-btn-outline">Changer le logo</button>
            <div className="sd2-upload-hint">PNG, SVG · max 2 Mo</div>
          </div>
        </div>
      </Field>
      <Field label="Couleur d'accentuation" hint="Utilisée sur les factures, emails et moteur de réservation">
        <div className="sd2-color-row">
          <input type="color" className="sd2-color-picker" defaultValue="#FF385C" />
          <input className="sd2-input mono w120" defaultValue="#FF385C" />
          <span className="sd2-badge-pill" style={{ background: '#FF385C20', color: '#FF385C' }}>Prévisualiser</span>
        </div>
      </Field>
    </Section>
    <Section title="Domaine personnalisé (White-label)">
      <Field label="Nom de domaine" hint="CNAME pointant vers bookings.hosflow.app">
        <div className="sd2-input-with-badge">
          <input className="sd2-input" defaultValue="reservation.ocean-atlantique.ma" />
          <span className="sd2-status-badge connected">✓ CNAME vérifié</span>
        </div>
      </Field>
    </Section>
  </>
);

const renderProperties = () => {
  const [lead, setLead] = useState('airbnb');
  return (
    <>
      <Section title="Gestion des annonces">
        <Field label="Plateforme source principale" hint="Priorité pour les noms, photos et descriptions">
          <div className="sd2-radio-group">
            {['Airbnb', 'Booking.com', 'Vrbo', 'Direct'].map(p => (
              <label key={p} className={`sd2-radio-btn ${lead === p.toLowerCase().replace('.','') ? 'active' : ''}`}>
                <input type="radio" name="lead" value={p} checked={lead === p.toLowerCase().replace('.','')} onChange={() => setLead(p.toLowerCase().replace('.',''))} />
                {p}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Réinitialiser les noms" hint="Remet les noms HosFlow à ceux de la plateforme source">
          <button className="sd2-btn-outline danger"><RefreshCw size={13}/> Réinitialiser les noms de propriétés</button>
        </Field>
      </Section>
      <Section title="Majorations tarifaires par OTA (Markup %)">
        <div className="sd2-markup-grid">
          {[
            { ota: 'Airbnb',       pct: 15, color: '#FF385C' },
            { ota: 'Booking.com',  pct: 18, color: '#003580' },
            { ota: 'Vrbo',         pct: 12, color: '#1E40AF' },
            { ota: 'Agoda',        pct: 20, color: '#4F46E5' },
            { ota: 'Expedia',      pct: 16, color: '#FFB400' },
            { ota: 'Direct',       pct:  0, color: '#10B981', direct: true },
          ].map(o => (
            <div key={o.ota} className={`sd2-markup-card ${o.direct ? 'direct' : ''}`}>
              <div className="sd2-markup-ota" style={{ color: o.color }}>{o.ota}</div>
              <div className="sd2-markup-input-wrap">
                <input type="number" className="sd2-markup-input" defaultValue={o.pct} min={0} max={50} />
                <span>%</span>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
};

const renderTeam = () => {
  const [defaultView, setDefaultView] = useState('timeline');
  return (
    <>
      <Section title="Préférences interface">
        <Field label="Vue par défaut à la connexion">
          <select className="sd2-select" value={defaultView} onChange={e => setDefaultView(e.target.value)}>
            <option value="dashboard">Tableau de bord global</option>
            <option value="timeline">Calendrier des réservations</option>
            <option value="inbox">Messagerie unifiée</option>
            <option value="checkins">Arrivées du jour</option>
          </select>
        </Field>
      </Section>
      <Section title="Membres de l'équipe">
        <div className="sd2-team-list">
          {TEAM.map((m, i) => (
            <div key={i} className="sd2-team-row">
              <div className="sd2-team-avatar" style={{ background: m.color }}>{m.name.slice(0,2).toUpperCase()}</div>
              <div className="sd2-team-info">
                <span className="sd2-team-name">{m.name}</span>
                <span className="sd2-team-email">{m.email}</span>
              </div>
              <span className="sd2-badge-pill" style={{ background: '#F1F5F9', color: '#64748B' }}>{m.role}</span>
              <span className={`sd2-online-dot ${m.online ? 'on' : ''}`} title={m.online ? 'En ligne' : 'Hors ligne'} />
              <button className="sd2-icon-btn"><Trash2 size={13}/></button>
            </div>
          ))}
        </div>
        <button className="sd2-btn-outline mt16"><PlusCircle size={13}/> Inviter un membre</button>
      </Section>
    </>
  );
};

const renderBilling = () => (
  <>
    <Section title="Plan actuel">
      <div className="sd2-plan-card">
        <div className="sd2-plan-header">
          <div>
            <div className="sd2-plan-name">Plan PRO</div>
            <div className="sd2-plan-price">299 MAD <span>/ mois · par propriété</span></div>
          </div>
          <span className="sd2-status-badge connected">Actif</span>
        </div>
        <div className="sd2-plan-features">
          {['Toutes les intégrations', 'Support prioritaire', 'Channel Manager illimité', 'Revenue AI inclus', 'Sauvegardes quotidiennes'].map(f => (
            <div key={f} className="sd2-plan-feat"><Check size={13} color="#10B981"/>{f}</div>
          ))}
        </div>
        <div className="sd2-plan-footer">
          <span>Prochain prélèvement : <strong>01 Juin 2026</strong></span>
          <button className="sd2-btn-outline">Gérer la facturation</button>
        </div>
      </div>
    </Section>
    <Section title="Historique de facturation">
      <div className="sd2-invoice-list">
        {[
          { date: '01 Mai 2026',  amount: '897 MAD', status: 'Payée' },
          { date: '01 Avr 2026',  amount: '897 MAD', status: 'Payée' },
          { date: '01 Mars 2026', amount: '598 MAD', status: 'Payée' },
        ].map((inv, i) => (
          <div key={i} className="sd2-invoice-row">
            <span className="sd2-invoice-date">{inv.date}</span>
            <span className="sd2-invoice-amount">{inv.amount}</span>
            <span className="sd2-status-badge connected">{inv.status}</span>
            <button className="sd2-icon-btn" title="Télécharger"><Database size={13}/></button>
          </div>
        ))}
      </div>
    </Section>
  </>
);

const renderPayout = () => (
  <>
    <Section title="Compte bancaire de reversement">
      <Field label="IBAN / RIB" hint="Virement automatique des encaissements sous 3 jours ouvrés">
        <input className="sd2-input mono" defaultValue="MA59 007 012 0000001234567890" />
      </Field>
      <Field label="Code SWIFT / BIC">
        <input className="sd2-input mono w200" defaultValue="BCMAMAMC" />
      </Field>
      <Field label="Titulaire du compte">
        <input className="sd2-input" defaultValue="SCI Océan Atlantique" />
      </Field>
    </Section>
    <Section title="Paramètres de devise & région">
      <Field label="Devise principale">
        <select className="sd2-select w200">
          <option value="MAD">Dirham marocain (MAD)</option>
          <option value="EUR">Euro (€)</option>
          <option value="USD">Dollar US ($)</option>
        </select>
      </Field>
      <Field label="Fuseau horaire">
        <select className="sd2-select w240">
          <option value="Africa/Casablanca">Casablanca (UTC+1)</option>
          <option value="Europe/Paris">Paris (UTC+2 été)</option>
          <option value="UTC">UTC</option>
        </select>
      </Field>
    </Section>
  </>
);

const renderIntegrations = () => (
  <>
    <Section title="Connecteurs actifs">
      <div className="sd2-integrations-grid">
        {INTEGRATIONS.map(int => (
          <div key={int.id} className={`sd2-integration-card ${int.status}`}>
            <div className="sd2-int-logo" style={{ background: int.color + '18', color: int.color }}>{int.icon}</div>
            <div className="sd2-int-info">
              <div className="sd2-int-name">{int.name}</div>
              <div className="sd2-int-desc">{int.desc}</div>
            </div>
            <span className={`sd2-int-status ${int.status}`}>
              {int.status === 'connected' ? 'Connecté' : int.status === 'pending' ? 'En attente' : 'Inactif'}
            </span>
            <button className="sd2-icon-btn"><ChevronRight size={14}/></button>
          </div>
        ))}
      </div>
    </Section>
    <Section title="Webhooks & API Hova">
      <Field label="Clé API publique (lecture seule)" hint="Utilisez cette clé pour les intégrations entrantes">
        <div className="sd2-input-copy">
          <input className="sd2-input mono" readOnly defaultValue="pk_live_hnzscc_a1b2c3d4e5f6" />
          <button className="sd2-btn-inline">Copier</button>
        </div>
      </Field>
      <Field label="Endpoint Webhook" hint="POST reçus à chaque évènement PMS">
        <input className="sd2-input" placeholder="https://your-server.com/webhook" />
      </Field>
    </Section>
  </>
);

const renderNotifications = () => {
  const [toggles, setToggles] = useState({ booking: true, checkin: true, message: true, review: false, report: true, maintenance: false });
  const t = (k) => setToggles(p => ({ ...p, [k]: !p[k] }));
  return (
    <Section title="Canaux & évènements">
      {[
        { k: 'booking',     label: 'Nouvelle réservation',       desc: 'Email + push dès qu\'une réservation est confirmée' },
        { k: 'checkin',     label: 'Check-in imminant',          desc: '24h avant l\'arrivée d\'un voyageur' },
        { k: 'message',     label: 'Nouveau message client',     desc: 'Toutes les plateformes (Airbnb, Booking…)' },
        { k: 'review',      label: 'Nouvel avis reçu',           desc: 'Alerte lors d\'un avis 1-3 étoiles uniquement' },
        { k: 'report',      label: 'Rapport hebdomadaire',       desc: 'Résumé de performance chaque lundi matin' },
        { k: 'maintenance', label: 'Alertes maintenance',        desc: 'Serrure déconnectée, batterie faible, incident' },
      ].map(item => (
        <div key={item.k} className="sd2-toggle-row">
          <div>
            <div className="sd2-toggle-label">{item.label}</div>
            <div className="sd2-toggle-desc">{item.desc}</div>
          </div>
          <Toggle on={toggles[item.k]} onToggle={() => t(item.k)} />
        </div>
      ))}
    </Section>
  );
};

const renderSecurity = () => {
  const [showPw, setShowPw] = useState(false);
  return (
    <>
      <Section title="Authentification">
        <div className="sd2-alert warning">
          <AlertTriangle size={14}/> Authentification à deux facteurs non configurée — recommandé pour tous les administrateurs.
          <button className="sd2-btn-inline">Activer 2FA</button>
        </div>
        <Field label="Sessions actives" hint="Toutes les connexions en cours à votre compte">
          <div className="sd2-sessions">
            <div className="sd2-session-row">
              <div className="sd2-session-icon"><Globe size={14}/></div>
              <div className="sd2-session-info"><span>Chrome · Casablanca, MA</span><span className="active-now">En cours</span></div>
              <button className="sd2-btn-outline danger small">Révoquer</button>
            </div>
            <div className="sd2-session-row">
              <div className="sd2-session-icon"><Globe size={14}/></div>
              <div className="sd2-session-info"><span>Safari · Paris, FR</span><span>il y a 2 jours</span></div>
              <button className="sd2-btn-outline danger small">Révoquer</button>
            </div>
          </div>
        </Field>
      </Section>
      <Section title="Mot de passe">
        <Field label="Mot de passe actuel">
          <input className="sd2-input" type="password" placeholder="••••••••••" />
        </Field>
        <Field label="Nouveau mot de passe">
          <div className="sd2-password-wrap">
            <input className="sd2-input" type={showPw ? 'text' : 'password'} placeholder="12 caractères minimum" />
            <button type="button" className="sd2-pw-eye" onClick={() => setShowPw(v => !v)}>
              {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
            </button>
          </div>
        </Field>
        <Field label="Confirmer le nouveau mot de passe">
          <input className="sd2-input" type="password" placeholder="••••••••••" />
        </Field>
      </Section>
    </>
  );
};

const RENDERERS = {
  identity:      renderIdentity,
  properties:    renderProperties,
  team:          renderTeam,
  billing:       renderBilling,
  payout:        renderPayout,
  integrations:  renderIntegrations,
  notifications: renderNotifications,
  security:      renderSecurity,
};

/* ── Main component ─────────────────────────────────────── */
const SettingsDashboard = () => {
  const [active, setActive] = useState('identity');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const activeItem = NAV.flatMap(g => g.items).find(i => i.id === active);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 900);
  };

  const Content = RENDERERS[active];

  return (
    <div className="sd2-root">

      {/* ── Sidebar ────────────────────────── */}
      <aside className="sd2-sidebar">
        <div className="sd2-sidebar-brand">
          <div className="sd2-brand-icon"><Key size={16}/></div>
          <span>Paramètres</span>
        </div>

        <nav className="sd2-nav">
          {NAV.map(group => (
            <div key={group.group} className="sd2-nav-group">
              <div className="sd2-nav-group-label">{group.group}</div>
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`sd2-nav-item ${active === item.id ? 'active' : ''}`}
                    onClick={() => setActive(item.id)}
                    style={active === item.id ? { '--item-color': item.color } : {}}
                  >
                    <span className="sd2-nav-icon" style={{ color: active === item.id ? item.color : undefined }}>
                      <Icon size={15}/>
                    </span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sd2-sidebar-footer">
          <span>HosFlow v2.4.1</span>
        </div>
      </aside>

      {/* ── Content ────────────────────────── */}
      <main className="sd2-main">
        <div className="sd2-main-header">
          <div className="sd2-main-header-icon" style={{ background: activeItem?.color + '15', color: activeItem?.color }}>
            {activeItem && <activeItem.icon size={18}/>}
          </div>
          <div>
            <h1 className="sd2-main-title">{activeItem?.label}</h1>
            <p className="sd2-main-desc">{activeItem?.desc}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="sd2-main-body"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <Content />
          </motion.div>
        </AnimatePresence>

        <div className="sd2-main-footer">
          <span className="sd2-footer-hint">Les modifications sont sauvegardées sur votre compte HosFlow</span>
          <button className="sd2-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><RefreshCw size={14} className="sd2-spin"/> Sauvegarde…</>
            ) : saved ? (
              <><Check size={14}/> Enregistré</>
            ) : (
              <><Save size={14}/> Sauvegarder</>
            )}
          </button>
        </div>
      </main>

    </div>
  );
};

export default SettingsDashboard;
