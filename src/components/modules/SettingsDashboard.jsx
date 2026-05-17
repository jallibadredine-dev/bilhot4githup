import React, { useState } from 'react';
import {
  Building2, Home, Users, CreditCard, Globe, ShieldCheck,
  Check, Save, Camera, Lock, RefreshCw, Bell,
  Eye, EyeOff, AlertTriangle, PlusCircle, Trash2, ChevronRight,
  Database, Key, BadgeCheck, Euro, ExternalLink
} from 'lucide-react';
import './SettingsDashboard.css';

/* ── Helpers ────────────────────────────────────────────── */
const Toggle = ({ on, onToggle }) => (
  <button className={`sd-toggle ${on ? 'on' : ''}`} onClick={onToggle} type="button">
    <span className="sd-toggle-thumb" />
  </button>
);

const Row = ({ label, hint, children, last }) => (
  <div className={`sd-row ${last ? 'last' : ''}`}>
    <div className="sd-row-label">
      <span>{label}</span>
      {hint && <span className="sd-row-hint">{hint}</span>}
    </div>
    <div className="sd-row-control">{children}</div>
  </div>
);

const Block = ({ id, icon: Icon, color, title, desc, children }) => (
  <div id={id} className="sd-block">
    <div className="sd-block-head">
      <div className="sd-block-icon" style={{ background: color + '15', color }}>
        <Icon size={17} />
      </div>
      <div>
        <h2 className="sd-block-title">{title}</h2>
        <p className="sd-block-desc">{desc}</p>
      </div>
    </div>
    <div className="sd-block-body">{children}</div>
  </div>
);

const TEAM = [
  { name: 'Directeur Général', role: 'Super Admin',    email: 'dg@ocean-atlantique.ma',    online: true,  bg: '#0F172A' },
  { name: 'Mehdi Tazi',        role: 'Réceptionniste', email: 'mehdi@ocean-atlantique.ma', online: true,  bg: '#3B82F6' },
  { name: 'Sara Benali',       role: 'Ménage',         email: 'sara@ocean-atlantique.ma',  online: false, bg: '#8B5CF6' },
];

const INTEGRATIONS = [
  { name: 'Channex.io',   desc: 'Channel Manager',         status: 'connected', color: '#3B82F6', icon: 'CX' },
  { name: 'Stripe Live',  desc: 'Paiements en ligne',       status: 'connected', color: '#6366F1', icon: 'S'  },
  { name: 'EmailJS',      desc: 'Emails automatiques',      status: 'connected', color: '#EC4899', icon: 'EJ' },
  { name: 'TTLock Cloud', desc: 'Serrures connectées',      status: 'connected', color: '#10B981', icon: '🔐' },
  { name: 'Beds24',       desc: 'PMS externe',              status: 'pending',   color: '#F59E0B', icon: 'B2' },
];

/* ── Component ──────────────────────────────────────────── */
const SettingsDashboard = () => {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [lead,   setLead]   = useState('airbnb');
  const [defView,setDefView]= useState('timeline');
  const [notifs, setNotifs] = useState({ booking: true, checkin: true, message: true, review: false, report: true });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 900);
  };

  return (
    <div className="sd-root">
      <div className="sd-page">

        {/* ── Identité & Marque ─────────────────────────── */}
        <Block id="identity" icon={Building2} color="#6366F1" title="Identité & Marque" desc="Informations de l'établissement, logo et domaine white-label">
          <Row label="Nom de l'établissement">
            <input className="sd-input" defaultValue="Villa Océan Atlantique" />
          </Row>
          <Row label="Email principal" hint="Affiché sur les factures et emails clients">
            <input className="sd-input" type="email" defaultValue="direction@ocean-atlantique.ma" />
          </Row>
          <Row label="Téléphone">
            <input className="sd-input" type="tel" defaultValue="+212 522 000 000" />
          </Row>
          <Row label="Adresse">
            <input className="sd-input" defaultValue="12 Boulevard de la Corniche, Casablanca" />
          </Row>
          <Row label="Logo officiel" hint="PNG 512×512 recommandé">
            <div className="sd-upload">
              <div className="sd-upload-box"><Camera size={17} /></div>
              <div>
                <button type="button" className="sd-btn-sm">Changer le logo</button>
                <div className="sd-hint-txt">PNG, SVG · max 2 Mo</div>
              </div>
            </div>
          </Row>
          <Row label="Couleur d'accentuation">
            <div className="sd-color-row">
              <input type="color" className="sd-color-pick" defaultValue="#FF385C" />
              <input className="sd-input mono w120" defaultValue="#FF385C" />
            </div>
          </Row>
          <Row label="Domaine white-label" hint="CNAME pointant vers bookings.hosflow.app" last>
            <div className="sd-input-flex">
              <input className="sd-input" defaultValue="reservation.ocean-atlantique.ma" />
              <span className="sd-badge green">✓ CNAME vérifié</span>
            </div>
          </Row>
        </Block>

        {/* ── Propriétés & OTA ──────────────────────────── */}
        <Block id="properties" icon={Home} color="#FF385C" title="Propriétés & OTA" desc="Synchronisation des annonces et majorations tarifaires par canal">
          <Row label="Plateforme source principale" hint="Priorité pour noms, photos et descriptions">
            <div className="sd-radio-row">
              {['Airbnb', 'Booking.com', 'Vrbo', 'Direct'].map(p => {
                const v = p.toLowerCase().replace('.','');
                return (
                  <label key={p} className={`sd-radio ${lead === v ? 'active' : ''}`}>
                    <input type="radio" name="lead" checked={lead === v} onChange={() => setLead(v)} />
                    {p}
                  </label>
                );
              })}
            </div>
          </Row>
          <Row label="Majorations par OTA (%)">
            <div className="sd-markup-grid">
              {[
                { name: 'Airbnb',      val: 15, accent: '#FF385C' },
                { name: 'Booking.com', val: 18, accent: '#003580' },
                { name: 'Vrbo',        val: 12, accent: '#1E40AF' },
                { name: 'Agoda',       val: 20, accent: '#4F46E5' },
                { name: 'Expedia',     val: 16, accent: '#FFB400' },
                { name: 'Direct',      val:  0, accent: '#10B981', direct: true },
              ].map(o => (
                <div key={o.name} className={`sd-markup ${o.direct ? 'direct' : ''}`}>
                  <span style={{ color: o.accent, fontWeight: 700, fontSize: '0.8rem' }}>{o.name}</span>
                  <div className="sd-markup-val">
                    <input type="number" defaultValue={o.val} min={0} max={50} className="sd-markup-input" />
                    <span>%</span>
                  </div>
                </div>
              ))}
            </div>
          </Row>
          <Row label="Réinitialiser les noms" hint="Remet les noms à ceux de la plateforme source" last>
            <button type="button" className="sd-btn-sm danger"><RefreshCw size={13}/> Réinitialiser</button>
          </Row>
        </Block>

        {/* ── Équipe & Accès ────────────────────────────── */}
        <Block id="team" icon={Users} color="#3B82F6" title="Équipe & Accès" desc="Membres du personnel, rôles et vue par défaut à la connexion">
          <Row label="Vue par défaut à la connexion">
            <select className="sd-select" value={defView} onChange={e => setDefView(e.target.value)}>
              <option value="dashboard">Tableau de bord global</option>
              <option value="timeline">Calendrier des réservations</option>
              <option value="inbox">Messagerie unifiée</option>
              <option value="checkins">Arrivées du jour</option>
            </select>
          </Row>
          <Row label="Membres de l'équipe" last>
            <div className="sd-team">
              {TEAM.map((m, i) => (
                <div key={i} className="sd-team-row">
                  <div className="sd-team-av" style={{ background: m.bg }}>{m.name.slice(0,2)}</div>
                  <div className="sd-team-info">
                    <span>{m.name}</span>
                    <span>{m.email}</span>
                  </div>
                  <span className="sd-tag">{m.role}</span>
                  <span className={`sd-dot ${m.online ? 'on' : ''}`}/>
                  <button className="sd-icon-btn"><Trash2 size={13}/></button>
                </div>
              ))}
              <button type="button" className="sd-btn-sm mt8"><PlusCircle size={13}/> Inviter un membre</button>
            </div>
          </Row>
        </Block>

        {/* ── Abonnement ────────────────────────────────── */}
        <Block id="billing" icon={CreditCard} color="#10B981" title="Abonnement & Facturation" desc="Plan actuel, historique des factures et compte de reversement bancaire">
          <Row label="Plan actuel">
            <div className="sd-plan-card">
              <div className="sd-plan-top">
                <div>
                  <div className="sd-plan-name">Plan PRO</div>
                  <div className="sd-plan-price">299 MAD <span>/mois · par propriété</span></div>
                </div>
                <span className="sd-badge green">Actif</span>
              </div>
              <div className="sd-plan-feats">
                {['Toutes les intégrations', 'Support prioritaire', 'Channel Manager illimité', 'Revenue AI inclus'].map(f => (
                  <div key={f} className="sd-plan-feat"><Check size={12} color="#10B981"/>{f}</div>
                ))}
              </div>
              <div className="sd-plan-foot">
                <span>Prochain prélèvement : <strong>01 Juin 2026</strong></span>
                <button type="button" className="sd-btn-sm">Gérer la facturation</button>
              </div>
            </div>
          </Row>
          <Row label="IBAN / Compte payout" hint="Virement automatique sous 3 jours ouvrés">
            <input className="sd-input mono" defaultValue="MA59 007 012 0000001234567890" />
          </Row>
          <Row label="Code SWIFT / BIC">
            <input className="sd-input mono w200" defaultValue="BCMAMAMC" />
          </Row>
          <Row label="Devise & Fuseau horaire">
            <div className="sd-flex-gap">
              <select className="sd-select w160">
                <option>Dirham (MAD)</option>
                <option>Euro (€)</option>
                <option>Dollar ($)</option>
              </select>
              <select className="sd-select w200">
                <option>Casablanca (UTC+1)</option>
                <option>Paris (UTC+2)</option>
                <option>UTC</option>
              </select>
            </div>
          </Row>
          <Row label="Historique de facturation" last>
            <div className="sd-invoice-list">
              {[
                { date: '01 Mai 2026',  amt: '897 MAD' },
                { date: '01 Avr 2026',  amt: '897 MAD' },
                { date: '01 Mars 2026', amt: '598 MAD' },
              ].map((inv, i) => (
                <div key={i} className="sd-invoice-row">
                  <span>{inv.date}</span>
                  <span className="fw700">{inv.amt}</span>
                  <span className="sd-badge green">Payée</span>
                  <button className="sd-icon-btn" title="Télécharger"><Database size={12}/></button>
                </div>
              ))}
            </div>
          </Row>
        </Block>

        {/* ── Intégrations ──────────────────────────────── */}
        <Block id="integrations" icon={Globe} color="#8B5CF6" title="Intégrations & API" desc="Connecteurs tiers, clé API publique et endpoints webhook">
          <Row label="Connecteurs actifs">
            <div className="sd-int-list">
              {INTEGRATIONS.map((it, i) => (
                <div key={i} className={`sd-int-row ${it.status}`}>
                  <div className="sd-int-logo" style={{ background: it.color + '18', color: it.color }}>{it.icon}</div>
                  <div className="sd-int-info">
                    <span>{it.name}</span>
                    <span>{it.desc}</span>
                  </div>
                  <span className={`sd-badge ${it.status === 'connected' ? 'green' : 'amber'}`}>
                    {it.status === 'connected' ? 'Connecté' : 'En attente'}
                  </span>
                  <button className="sd-icon-btn"><ChevronRight size={13}/></button>
                </div>
              ))}
            </div>
          </Row>
          <Row label="Clé API publique" hint="Pour les intégrations entrantes (lecture seule)">
            <div className="sd-input-flex">
              <input className="sd-input mono" readOnly defaultValue="pk_live_hnzscc_a1b2c3d4e5f6" />
              <button type="button" className="sd-btn-sm">Copier</button>
            </div>
          </Row>
          <Row label="Endpoint Webhook" last>
            <input className="sd-input" placeholder="https://your-server.com/webhook" />
          </Row>
        </Block>

        {/* ── Notifications ─────────────────────────────── */}
        <Block id="notifications" icon={Bell} color="#EC4899" title="Notifications" desc="Activez ou désactivez les alertes par type d'évènement">
          {[
            { k: 'booking',  label: 'Nouvelle réservation',     desc: 'Email + push lors d\'une confirmation' },
            { k: 'checkin',  label: 'Check-in imminant',         desc: '24h avant l\'arrivée d\'un voyageur' },
            { k: 'message',  label: 'Nouveau message client',    desc: 'Toutes les plateformes OTA' },
            { k: 'review',   label: 'Avis 1-3 étoiles',          desc: 'Alerte uniquement sur mauvais avis' },
            { k: 'report',   label: 'Rapport hebdomadaire',       desc: 'Résumé de performance chaque lundi' },
          ].map((n, i, arr) => (
            <Row key={n.k} label={n.label} hint={n.desc} last={i === arr.length - 1}>
              <Toggle on={notifs[n.k]} onToggle={() => setNotifs(p => ({ ...p, [n.k]: !p[n.k] }))} />
            </Row>
          ))}
        </Block>

        {/* ── Sécurité ──────────────────────────────────── */}
        <Block id="security" icon={ShieldCheck} color="#EF4444" title="Sécurité" desc="Authentification 2FA, sessions actives et changement de mot de passe">
          <Row label="Authentification 2FA">
            <div className="sd-alert-warn">
              <AlertTriangle size={14}/> Non configuré — fortement recommandé pour les administrateurs.
              <button type="button" className="sd-btn-sm">Activer 2FA</button>
            </div>
          </Row>
          <Row label="Sessions actives">
            <div className="sd-sessions">
              <div className="sd-session">
                <Globe size={13} color="#64748B"/>
                <div className="sd-session-info"><span>Chrome · Casablanca, MA</span><span className="active-label">En cours</span></div>
                <button type="button" className="sd-btn-sm danger">Révoquer</button>
              </div>
              <div className="sd-session">
                <Globe size={13} color="#64748B"/>
                <div className="sd-session-info"><span>Safari · Paris, FR</span><span>il y a 2 jours</span></div>
                <button type="button" className="sd-btn-sm danger">Révoquer</button>
              </div>
            </div>
          </Row>
          <Row label="Nouveau mot de passe" last>
            <input className="sd-input" type="password" placeholder="Mot de passe actuel" style={{ marginBottom: 6 }} />
            <div className="sd-pw-wrap">
              <input className="sd-input" type={showPw ? 'text' : 'password'} placeholder="Nouveau mot de passe (12+ caractères)" />
              <button type="button" className="sd-pw-eye" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </Row>
        </Block>

      </div>

      {/* ── Save footer ─────────────────────────────────── */}
      <div className="sd-footer">
        <span className="sd-footer-hint">Les modifications sont sauvegardées sur votre compte HosFlow</span>
        <button className="sd-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? <><RefreshCw size={14} className="sd-spin"/> Sauvegarde…</> : saved ? <><Check size={14}/> Enregistré</> : <><Save size={14}/> Sauvegarder</>}
        </button>
      </div>
    </div>
  );
};

export default SettingsDashboard;
