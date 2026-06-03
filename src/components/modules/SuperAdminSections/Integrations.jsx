import React, { useState } from 'react';
import { Globe, Plus, CheckCircle, XCircle, AlertTriangle, Settings, ExternalLink,
         ToggleLeft, ToggleRight, Plug, Webhook, Link2, RefreshCw, Save, Eye, EyeOff, Key, Lock, ShieldCheck } from 'lucide-react';
import { LS_TUYA_ID, LS_TUYA_SEC, LS_TUYA_REG, LS_TUYA_CODE, TUYA_REGIONS,
         ENV_TUYA_ID, ENV_TUYA_SEC, ENV_TUYA_CODE } from '../../../lib/tuya';

/* ── Global TTLock / TTHotel app-credential keys (shared with SmartLockHub) ── */
const TT_CLIENT_ID_KEY  = 'hova_ttlock_client_id';
const TT_CLIENT_SEC_KEY = 'hova_ttlock_client_sec';
const ENV_TTHOTEL_CLIENT_ID = import.meta.env.VITE_TTHOTEL_CLIENT_ID || '';
const ENV_TTHOTEL_CLIENT_SECRET = import.meta.env.VITE_TTHOTEL_CLIENT_SECRET || '';

const GROUPS = [
  {cat:'Paiements',items:[
    {id:'stripe',  name:'Stripe',           em:'💳',col:'#635BFF',st:'connected',   desc:'Paiements, abonnements, factures',    feat:['Checkout','Subscriptions','Webhooks'],since:'Jan 2026'},
    {id:'paypal',  name:'PayPal',           em:'🔵',col:'#003087',st:'disconnected',desc:'Passerelle PayPal / Braintree',       feat:['Checkout','Express Pay'],since:null},
  ]},
  {cat:'Distribution OTA',items:[
    {id:'channex', name:'Channex.io',       em:'🔗',col:'#2563EB',st:'connected',   desc:'Channel Manager — Airbnb, Booking…', feat:['Rate Sync','Availability','Reviews'],since:'Jan 2026'},
    {id:'airbnb',  name:'Airbnb',           em:'🏠',col:'#2563EB',st:'connected',   desc:'Connexion directe iCal / API',       feat:['iCal','Messaging','Reviews'],since:'Fév 2026'},
    {id:'booking', name:'Booking.com',      em:'🅱️',col:'#003580',st:'connected',   desc:'Via Channex',                        feat:['Rate Sync','Reservations'],since:'Fév 2026'},
    {id:'beds24',  name:'Beds24',           em:'🛏️',col:'#1E40AF',st:'disconnected',desc:'Moteur de réservation',              feat:['Booking Engine','iCal'],since:null},
  ]},
  {cat:'Communications',items:[
    {id:'twilio',  name:'Twilio',           em:'📞',col:'#F22F46',st:'connected',   desc:'SMS, WhatsApp, Voice, 2FA',          feat:['SMS','WhatsApp','Voice'],since:'Mar 2026'},
    {id:'wabiz',   name:'WhatsApp Business',em:'💬',col:'#25D366',st:'pending',     desc:'API Meta directe',                   feat:['Messaging','Templates'],since:null},
    {id:'emailjs', name:'EmailJS',          em:'📧',col:'#EA4335',st:'connected',   desc:'Emails transactionnels',             feat:['Templates','Analytics'],since:'Jan 2026'},
  ]},
  {cat:'Intelligence Artificielle',items:[
    {id:'openai',  name:'OpenAI GPT-4o',    em:'🤖',col:'#10A37F',st:'connected',   desc:'Oracle AI — assistant & analyse',    feat:['Chat','Embeddings','Vision'],since:'Jan 2026'},
    {id:'gemini',  name:'Google Gemini',    em:'🔍',col:'#4285F4',st:'disconnected',desc:'Traduction & NLP',                   feat:['Translation','NLP'],since:null},
  ]},
  {cat:'Accès & Sécurité',items:[
    {id:'ttlock',  name:'TTLock / TTHotel', em:'🔐',col:'#8B5CF6',st:'connected',   desc:'Serrures connectées, PIN, RFID',     feat:['Lock/Unlock','PIN','RFID'],since:'Jan 2026'},
    {id:'tuya',   name:'Tuya Smart',        em:'🌿',col:'#059669',st:'connected',   desc:'Serrures & appareils IoT Tuya',      feat:['Lock/Unlock','Devices','IoT'],since:'Jan 2026'},
    {id:'gauth',   name:'Google OAuth 2.0', em:'🔑',col:'#4285F4',st:'connected',   desc:'Authentification SSO',               feat:['SSO','OAuth2'],since:'Jan 2026'},
  ]},
  {cat:'Automatisations',items:[
    {id:'zapier',  name:'Zapier',           em:'⚡',col:'#FF4A00',st:'disconnected',desc:'Automatisations no-code',            feat:['Triggers','Actions'],since:null},
    {id:'slack',   name:'Slack',            em:'💬',col:'#4A154B',st:'disconnected',desc:'Notifications équipe',              feat:['Alerts','Reports'],since:null},
  ]},
];

const SC = {
  connected:   {col:'#10B981',icon:<CheckCircle size={11}/>,   lbl:'Connecté'},
  disconnected:{col:'#94A3B8',icon:<XCircle size={11}/>,       lbl:'Non connecté'},
  degraded:    {col:'#F59E0B',icon:<AlertTriangle size={11}/>, lbl:'Dégradé'},
  pending:     {col:'#3B82F6',icon:<RefreshCw size={11}/>,     lbl:'En attente'},
};

/* ── TTLock-specific config panel ── */
function TTLockConfig() {
  const [cid,   setCid]   = useState(() => localStorage.getItem(TT_CLIENT_ID_KEY)  || ENV_TTHOTEL_CLIENT_ID || '');
  const [csec,  setCsec]  = useState(() => localStorage.getItem(TT_CLIENT_SEC_KEY) || ENV_TTHOTEL_CLIENT_SECRET || '');
  const [showS, setShowS] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!cid.trim() || !csec.trim()) return;
    localStorage.setItem(TT_CLIENT_ID_KEY,  cid.trim());
    localStorage.setItem(TT_CLIENT_SEC_KEY, csec.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="sa2-int-config">
      <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: 10, lineHeight: 1.5 }}>
        Identifiants d'application TTHotel / TTLock — gérés de façon centralisée depuis le panneau Super Admin.
        <br/>
        Ces credentials sont partagés avec tous les utilisateurs de la plateforme et sont nécessaires pour les connexions réelles avec des comptes TTHotel.
      </div>
      {ENV_TTHOTEL_CLIENT_ID && ENV_TTHOTEL_CLIENT_SECRET && (
        <div style={{ fontSize: '0.75rem', padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, marginBottom: 14 }}>
          <strong>Variables d'environnement actives :</strong>
          <div style={{ marginTop: 8 }}><code style={{ color: '#4338ca' }}>VITE_TTHOTEL_CLIENT_ID</code> = {ENV_TTHOTEL_CLIENT_ID}</div>
          <div><code style={{ color: '#4338ca' }}>VITE_TTHOTEL_CLIENT_SECRET</code> = {ENV_TTHOTEL_CLIENT_SECRET}</div>
        </div>
      )}
      <div className="sa2-form-row">
        <label>Client ID</label>
        <input
          type="text"
          value={cid}
          onChange={e => setCid(e.target.value)}
          placeholder="cdcd9c7d…"
          className="sa2-input"
          style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
        />
      </div>
      <div className="sa2-form-row">
        <label>Client Secret</label>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type={showS ? 'text' : 'password'}
            value={csec}
            onChange={e => setCsec(e.target.value)}
            placeholder="4b63ca9c…"
            className="sa2-input"
            style={{ fontFamily: 'monospace', fontSize: '0.75rem', flex: 1 }}
          />
          <button
            onClick={() => setShowS(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0 4px' }}
          >
            {showS ? <EyeOff size={13}/> : <Eye size={13}/>}
          </button>
        </div>
      </div>
      <button
        className="sa2-btn sa2-btn-primary sa2-btn-sm"
        onClick={save}
        disabled={!cid.trim() || !csec.trim()}
        style={{ marginTop: 4 }}
      >
        {saved ? <><CheckCircle size={11}/> Sauvegardé</> : <><Save size={11}/> Sauvegarder</>}
      </button>
    </div>
  );
}

/* ── Tuya-specific config panel (Super Admin) ── */
function TTHotelTTLockCentralConfig() {
  const [cid, setCid] = useState(() => localStorage.getItem(TT_CLIENT_ID_KEY) || ENV_TTHOTEL_CLIENT_ID || '');
  const [csec, setCsec] = useState(() => localStorage.getItem(TT_CLIENT_SEC_KEY) || ENV_TTHOTEL_CLIENT_SECRET || '');
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasEnvCreds = !!(ENV_TTHOTEL_CLIENT_ID && ENV_TTHOTEL_CLIENT_SECRET);

  const save = () => {
    if (!cid.trim() || !csec.trim()) return;
    localStorage.setItem(TT_CLIENT_ID_KEY, cid.trim());
    localStorage.setItem(TT_CLIENT_SEC_KEY, csec.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="sa2-int-config" style={{ marginBottom: 20 }}>
      <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: 12, lineHeight: 1.6 }}>
        Panneau centralisé des credentials TTHotel / TTLock. Ces identifiants sont utilisés par tous les comptes de la plateforme
        pour l’authentification TTHotel réelle et les actions entièrement opérationnelles.
      </div>
      {hasEnvCreds && (
        <div style={{ padding: '10px 12px', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 10, marginBottom: 14 }}>
          <strong>Variables d’environnement actives :</strong>
          <div style={{ marginTop: 8 }}><code style={{ color: '#4338ca' }}>VITE_TTHOTEL_CLIENT_ID</code> = {ENV_TTHOTEL_CLIENT_ID}</div>
          <div><code style={{ color: '#4338ca' }}>VITE_TTHOTEL_CLIENT_SECRET</code> = {ENV_TTHOTEL_CLIENT_SECRET}</div>
        </div>
      )}
      <div className="sa2-form-row">
        <label>Client ID TTHotel</label>
        <input
          type="text"
          value={cid}
          onChange={e => setCid(e.target.value)}
          placeholder="4bfda77c44f1463aa1005222f28787cc"
          className="sa2-input"
          style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
        />
      </div>
      <div className="sa2-form-row">
        <label>Client Secret TTHotel</label>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type={showSecret ? 'text' : 'password'}
            value={csec}
            onChange={e => setCsec(e.target.value)}
            placeholder="e9a239827303299addd7bec18ddbc9af"
            className="sa2-input"
            style={{ fontFamily: 'monospace', fontSize: '0.75rem', flex: 1 }}
          />
          <button
            onClick={() => setShowSecret(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0 4px' }}
          >
            {showSecret ? <EyeOff size={13}/> : <Eye size={13}/>}  
          </button>
        </div>
      </div>
      <button
        className="sa2-btn sa2-btn-primary sa2-btn-sm"
        onClick={save}
        disabled={!cid.trim() || !csec.trim()}
      >
        {saved ? <><CheckCircle size={11}/> Sauvegardé</> : <><Save size={11}/> Enregistrer</>}
      </button>
    </div>
  );
}

function TuyaConfig() {
  const [id, setId] = useState(() => localStorage.getItem(LS_TUYA_ID) || ENV_TUYA_ID || '');
  const [secret, setSecret] = useState(() => localStorage.getItem(LS_TUYA_SEC) || ENV_TUYA_SEC || '');
  const [code, setCode] = useState(() => localStorage.getItem(LS_TUYA_CODE) || ENV_TUYA_CODE || '');
  const [reg, setReg] = useState(() => localStorage.getItem(LS_TUYA_REG) || 'eu');
  const [showId, setShowId] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasEnvCreds = !!(ENV_TUYA_ID && ENV_TUYA_SEC);
  const hasSavedCreds = !!(id.trim() && secret.trim());
  const hasProjectCode = !!code.trim();

  const save = () => {
    if (!id.trim() || !secret.trim()) return;
    localStorage.setItem(LS_TUYA_ID, id.trim());
    localStorage.setItem(LS_TUYA_SEC, secret.trim());
    localStorage.setItem(LS_TUYA_CODE, code.trim());
    localStorage.setItem(LS_TUYA_REG, reg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="sa2-int-config">
      {/* Platform credentials banner */}
      <div style={{
        background: hasSavedCreds || hasEnvCreds ? '#F0FDF4' : '#FFF7ED',
        border: `1px solid ${hasSavedCreds || hasEnvCreds ? '#BBF7D0' : '#FED7AA'}`,
        borderRadius: 8, padding: '10px 12px', marginBottom: 12,
        display: 'flex', alignItems: 'flex-start', gap: 8
      }}>
        {(hasSavedCreds || hasEnvCreds)
          ? <ShieldCheck size={15} style={{ color: '#16A34A', marginTop: 1, flexShrink: 0 }}/>
          : <AlertTriangle size={15} style={{ color: '#F59E0B', marginTop: 1, flexShrink: 0 }}/>
        }
        <div style={{ fontSize: '0.72rem', lineHeight: 1.55, color: (hasSavedCreds || hasEnvCreds) ? '#166534' : '#92400E' }}>
          {(hasSavedCreds || hasEnvCreds) ? (
            <>
              <strong>Credentials Tuya actifs</strong> — gérés depuis Super Admin.
              <br/>
              Les utilisateurs peuvent se connecter avec leur compte Smart Life / Tuya sans saisir le client_id / client_secret.
            </>
          ) : (
            <>
              <strong>Aucun credential Tuya configuré.</strong>
              <br/>
              Ajoutez <code>VITE_TUYA_CLIENT_ID</code>, <code>VITE_TUYA_CLIENT_SECRET</code> et <code>VITE_TUYA_PROJECT_CODE</code> dans les secrets Replit, ou saisissez-les ci-dessous.
            </>
          )}
        </div>
      </div>

      <div className="sa2-form-row">
        <label>Access ID / Client ID</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type={showId ? 'text' : 'password'}
            value={id}
            onChange={e => setId(e.target.value)}
            placeholder="vmsde9hpfme9e5aq8uvj"
            className="sa2-input"
            style={{ fontFamily: 'monospace', fontSize: '0.75rem', flex: 1 }}
          />
          <button
            onClick={() => setShowId(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0 4px' }}
          >
            {showId ? <EyeOff size={13}/> : <Eye size={13}/>}  
          </button>
        </div>
      </div>

      <div className="sa2-form-row">
        <label>Access Secret / Client Secret</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type={showSecret ? 'text' : 'password'}
            value={secret}
            onChange={e => setSecret(e.target.value)}
            placeholder="2791f4f3ab784361a8932b4fd2062227"
            className="sa2-input"
            style={{ fontFamily: 'monospace', fontSize: '0.75rem', flex: 1 }}
          />
          <button
            onClick={() => setShowSecret(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0 4px' }}
          >
            {showSecret ? <EyeOff size={13}/> : <Eye size={13}/>}  
          </button>
        </div>
      </div>

      <div className="sa2-form-row">
        <label>Project Code</label>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="p17791216260284mksvm"
          className="sa2-input"
          style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
        />
      </div>

      <div className="sa2-form-row">
        <label>Région Cloud (défaut)</label>
        <select value={reg} onChange={e => setReg(e.target.value)} className="sa2-input" style={{ fontSize: '0.8rem' }}>
          {Object.entries(TUYA_REGIONS).map(([k, v]) => (
            <option key={k} value={k}>{v.label} — {v.base.replace('https://','')}</option>
          ))}
        </select>
      </div>

      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginBottom: 8, lineHeight: 1.5 }}>
        Les utilisateurs se connectent avec leur email/mot de passe Smart Life. Les identifiants Tuya Cloud sont gérés depuis Super Admin.
      </div>

      <button
        className="sa2-btn sa2-btn-primary sa2-btn-sm"
        onClick={save}
        disabled={!id.trim() || !secret.trim()}
      >
        {saved ? <><CheckCircle size={11}/> Sauvegardé</> : <><Save size={11}/> Sauvegarder</>}
      </button>
    </div>
  );
}

function Card({integ}) {
  const [cfg,setCfg]=useState(false);
  const s=SC[integ.st];
  return (
    <div className="sa2-int-card">
      <div className="sa2-int-card-top">
        <div className="sa2-int-logo" style={{background:integ.col+'15',border:`1px solid ${integ.col}25`}}>
          <span style={{fontSize:22}}>{integ.em}</span>
        </div>
        <div className="sa2-int-info">
          <div className="sa2-int-name">{integ.name}</div>
          <div className="sa2-int-status" style={{color:s.col}}>
            {s.icon} {s.lbl}
            {integ.since&&<span className="sa2-int-since"> · {integ.since}</span>}
          </div>
        </div>
        <button style={{background:'none',border:'none',cursor:'pointer',padding:0,flexShrink:0}}>
          {integ.st==='connected'?<ToggleRight size={20} style={{color:'#10B981'}}/>:<ToggleLeft size={20} style={{color:'#94A3B8'}}/>}
        </button>
      </div>
      <p className="sa2-int-desc">{integ.desc}</p>
      <div className="sa2-int-features">{integ.feat.map(f=><span key={f} className="sa2-tag">{f}</span>)}</div>
      <div className="sa2-int-actions">
        {integ.st==='connected'?(
          <>
            <button className="sa2-btn sa2-btn-sm sa2-btn-ghost" onClick={()=>setCfg(v=>!v)}><Settings size={11}/> Configurer</button>
            <button className="sa2-btn sa2-btn-sm sa2-btn-ghost"><Webhook size={11}/> Webhooks</button>
          </>
        ):(
          <button className="sa2-btn sa2-btn-sm sa2-btn-primary"><Plug size={11}/> Connecter</button>
        )}
        <button className="sa2-btn sa2-btn-sm sa2-btn-ghost"><ExternalLink size={11}/> Docs</button>
      </div>
      {cfg && integ.st==='connected' && (
        integ.id === 'ttlock' ? <TTLockConfig/>
        : integ.id === 'tuya' ? <TuyaConfig/>
        : (
          <div className="sa2-int-config">
            <div className="sa2-form-row"><label>Clé API</label><input type="password" defaultValue="••••••••••••" className="sa2-input"/></div>
            <div className="sa2-form-row"><label>Webhook URL</label><input type="text" placeholder="https://…/webhook" className="sa2-input"/></div>
            <button className="sa2-btn sa2-btn-primary sa2-btn-sm">Sauvegarder</button>
          </div>
        )
      )}
    </div>
  );
}

export default function Integrations() {
  const [filter,setFilter]=useState('all');
  const all=GROUPS.flatMap(g=>g.items);
  const conn=all.filter(i=>i.st==='connected').length;
  const deg=all.filter(i=>i.st==='degraded').length;
  return (
    <div className="sa2-section">
      <div className="sa2-section-header">
        <div><h2 className="sa2-section-title">Centre d'Intégrations</h2><p className="sa2-section-desc">Connectez et gérez tous vos services tiers depuis un seul endroit</p></div>
        <button className="sa2-btn sa2-btn-primary"><Plus size={13}/> Nouvelle intégration</button>
      </div>

      <div className="sa2-block" style={{ marginBottom: 24, padding: 20, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div className="sa2-block-title">TTHotel / TTLock — Credentials centralisés</div>
            <div style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
              Gérez les identifiants d'application TTHotel et TTLock en un seul endroit. Ces clés sont utilisées par toutes les connexions TTHotel réelles de la plateforme.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ShieldCheck size={18} color="#7C3AED" />
            <span style={{ color: '#334155', fontWeight: 600 }}>Centralisé</span>
          </div>
        </div>
        <TTHotelTTLockCentralConfig />
      </div>

      <div className="sa2-kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:24}}>
        {[[Globe,all.length,'Total','#5B5BA6'],[CheckCircle,conn,'Connectées','#10B981'],[AlertTriangle,deg,'Dégradées','#F59E0B'],[XCircle,all.length-conn-deg,'Inactives','#94A3B8']].map(([Icon,v,l,c])=>(
          <div key={l} className="sa2-kpi-card"><div className="sa2-kpi-icon" style={{background:c+'18',color:c}}><Icon size={17}/></div><div className="sa2-kpi-body"><div className="sa2-kpi-label">{l}</div><div className="sa2-kpi-value">{v}</div></div></div>
        ))}
      </div>
      <div className="sa2-tabs" style={{marginBottom:24}}>
        {[['all','Toutes'],['connected','Connectées'],['disconnected','À connecter']].map(([f,l])=>(
          <button key={f} className={`sa2-tab ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>{l}</button>
        ))}
      </div>
      {GROUPS.map(g=>{
        const items=g.items.filter(i=>filter==='all'||(filter==='connected'&&i.st==='connected')||(filter==='disconnected'&&i.st!=='connected'));
        if(!items.length) return null;
        return (
          <div key={g.cat} className="sa2-int-group">
            <div className="sa2-int-group-title"><Link2 size={12}/> {g.cat}</div>
            <div className="sa2-int-grid">{items.map(i=><Card key={i.id} integ={i}/>)}</div>
          </div>
        );
      })}
    </div>
  );
}
