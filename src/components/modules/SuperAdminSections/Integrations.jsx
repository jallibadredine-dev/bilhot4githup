import React, { useState } from 'react';
import { Globe, Plus, CheckCircle, XCircle, AlertTriangle, Settings, ExternalLink,
         ToggleLeft, ToggleRight, Plug, Webhook, Link2, RefreshCw, Save, Eye, EyeOff, Key } from 'lucide-react';
import { LS_TUYA_ID, LS_TUYA_SEC, LS_TUYA_REG, TUYA_REGIONS } from '../../../lib/tuya';

/* ── Global TTLock app-credential keys (shared with SmartLockHub) ── */
const TT_CLIENT_ID_KEY  = 'hova_ttlock_client_id';
const TT_CLIENT_SEC_KEY = 'hova_ttlock_client_sec';

const GROUPS = [
  {cat:'Paiements',items:[
    {id:'stripe',  name:'Stripe',           em:'💳',col:'#635BFF',st:'connected',   desc:'Paiements, abonnements, factures',    feat:['Checkout','Subscriptions','Webhooks'],since:'Jan 2026'},
    {id:'paypal',  name:'PayPal',           em:'🔵',col:'#003087',st:'disconnected',desc:'Passerelle PayPal / Braintree',       feat:['Checkout','Express Pay'],since:null},
  ]},
  {cat:'Distribution OTA',items:[
    {id:'channex', name:'Channex.io',       em:'🔗',col:'#2563EB',st:'connected',   desc:'Channel Manager — Airbnb, Booking…', feat:['Rate Sync','Availability','Reviews'],since:'Jan 2026'},
    {id:'airbnb',  name:'Airbnb',           em:'🏠',col:'#FF385C',st:'connected',   desc:'Connexion directe iCal / API',       feat:['iCal','Messaging','Reviews'],since:'Fév 2026'},
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
  const [cid,   setCid]   = useState(() => localStorage.getItem(TT_CLIENT_ID_KEY)  || '');
  const [csec,  setCsec]  = useState(() => localStorage.getItem(TT_CLIENT_SEC_KEY) || '');
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
        Credentials d'application TTLock — obtenus sur{' '}
        <a href="https://open.ttlock.com" target="_blank" rel="noreferrer" style={{ color: '#8B5CF6' }}>open.ttlock.com</a>.
        Ces credentials sont partagés avec tous les utilisateurs de la plateforme.
      </div>
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

/* ── Tuya-specific config panel ── */
function TuyaConfig() {
  const [cid,   setCid]   = useState(() => localStorage.getItem(LS_TUYA_ID)  || '');
  const [csec,  setCsec]  = useState(() => localStorage.getItem(LS_TUYA_SEC) || '');
  const [reg,   setReg]   = useState(() => localStorage.getItem(LS_TUYA_REG) || 'eu');
  const [showS, setShowS] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!cid.trim() || !csec.trim()) return;
    localStorage.setItem(LS_TUYA_ID,  cid.trim());
    localStorage.setItem(LS_TUYA_SEC, csec.trim());
    localStorage.setItem(LS_TUYA_REG, reg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="sa2-int-config">
      <div style={{ fontSize: '0.7rem', color: '#718096', marginBottom: 10, lineHeight: 1.5 }}>
        Credentials d'application Tuya — obtenus sur{' '}
        <a href="https://iot.tuya.com" target="_blank" rel="noreferrer" style={{ color: '#059669' }}>iot.tuya.com</a>
        {' '}→ Développement Cloud → Créer un projet. Ces credentials sont partagés avec tous les utilisateurs.
      </div>
      <div className="sa2-form-row">
        <label>Client ID (Access ID)</label>
        <input
          type="text"
          value={cid}
          onChange={e => setCid(e.target.value)}
          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
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
            placeholder="••••••••••••••••••••••••••••••••"
            className="sa2-input"
            style={{ fontFamily: 'monospace', fontSize: '0.75rem', flex: 1 }}
          />
          <button onClick={() => setShowS(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '0 4px' }}>
            {showS ? <EyeOff size={13}/> : <Eye size={13}/>}
          </button>
        </div>
      </div>
      <div className="sa2-form-row">
        <label>Région Cloud</label>
        <select value={reg} onChange={e => setReg(e.target.value)} className="sa2-input" style={{ fontSize: '0.8rem' }}>
          {Object.entries(TUYA_REGIONS).map(([k, v]) => (
            <option key={k} value={k}>{v.label} — {v.base.replace('https://','')}</option>
          ))}
        </select>
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
