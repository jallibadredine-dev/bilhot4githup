import React, { useState } from 'react';
import {
  Key, Globe, Zap, MessageSquare, CreditCard, Shield, Mail,
  Plus, Edit3, Trash2, Eye, EyeOff, Copy, RefreshCw,
  CheckCircle, AlertTriangle, XCircle, Activity, Clock,
  Search, ToggleLeft, ToggleRight, Download,
} from 'lucide-react';

const APIS = [
  {id:'channex',name:'Channex.io',      cat:'Channel Manager',Icon:Globe,        st:'active',  key:'chx_live_••••4f8a',req:14280,err:12, up:99.99,ms:120, q:50000},
  {id:'stripe', name:'Stripe',          cat:'Paiements',      Icon:CreditCard,   st:'active',  key:'sk_live_••••7k2p', req:8945, err:3,  up:99.97,ms:82,  q:100000},
  {id:'ttlock', name:'TTLock/TTHotel',  cat:'Smart Locks',    Icon:Key,          st:'degraded',key:'ttl_••••9x1q',     req:2100, err:180,up:96.44,ms:980, q:10000},
  {id:'twilio', name:'Twilio',          cat:'SMS & WhatsApp', Icon:MessageSquare,st:'active',  key:'AC••••3m5z',       req:5640, err:8,  up:99.9, ms:145, q:20000},
  {id:'openai', name:'OpenAI GPT-4o',   cat:'Intelligence AI',Icon:Zap,          st:'active',  key:'sk-••••w9p2',      req:3280, err:15, up:99.98,ms:380, q:5000},
  {id:'google', name:'Google OAuth',    cat:'Auth',           Icon:Shield,       st:'active',  key:'••••oauth2',       req:12100,err:2,  up:100,  ms:45,  q:999999},
  {id:'email',  name:'EmailJS',         cat:'Emails',         Icon:Mail,         st:'inactive',key:'user_••••em3',     req:890,  err:0,  up:99.5, ms:220, q:2000},
];
const LOGS = [
  {t:'10:54:12',api:'Channex',m:'GET', ep:'/reservations',   s:200,ms:118},
  {t:'10:54:08',api:'Stripe', m:'POST',ep:'/charges',        s:200,ms:95},
  {t:'10:53:55',api:'TTLock', m:'POST',ep:'/lock/unlock',    s:500,ms:1200},
  {t:'10:53:40',api:'Twilio', m:'POST',ep:'/messages',       s:201,ms:132},
  {t:'10:53:22',api:'OpenAI', m:'POST',ep:'/chat/completions',s:200,ms:380},
  {t:'10:52:59',api:'TTLock', m:'GET', ep:'/lock/status',    s:504,ms:3000},
];
const SC = {active:'#10B981',degraded:'#F59E0B',inactive:'#94A3B8'};

export default function APIManager() {
  const [tab,setTab]     = useState('overview');
  const [shown,setShown] = useState({});
  const [q,setQ]         = useState('');
  const [pinging,setPing]= useState(false);

  const pingAll = async () => { setPing(true); await new Promise(r=>setTimeout(r,1200)); setPing(false); };
  const filtered = APIS.filter(a=>a.name.toLowerCase().includes(q.toLowerCase())||a.cat.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="sa2-section">
      <div className="sa2-section-header">
        <div><h2 className="sa2-section-title">API Manager</h2><p className="sa2-section-desc">Clés API centralisées, monitoring temps réel, quotas et logs d'erreurs</p></div>
        <div style={{display:'flex',gap:8}}>
          <button className="sa2-btn sa2-btn-ghost" onClick={pingAll}><RefreshCw size={13} className={pinging?'sa2-spin':''}/> Ping tous</button>
          <button className="sa2-btn sa2-btn-primary"><Plus size={13}/> Ajouter API</button>
        </div>
      </div>

      <div className="sa2-tabs">
        {[['overview','Vue d\'ensemble'],['keys','Clés API'],['logs','Logs & Erreurs'],['quotas','Quotas']].map(([id,lbl])=>(
          <button key={id} className={`sa2-tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      <div className="sa2-tab-content">

        {tab==='overview' && (
          <div>
            <div className="sa2-kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:24}}>
              {[[CheckCircle,'5','APIs actives','#10B981'],[AlertTriangle,'1','Dégradées','#F59E0B'],[Activity,'47.2k','Req/jour','#3B82F6'],[XCircle,'220','Erreurs/jour','#EF4444']].map(([Icon,v,l,c])=>(
                <div key={l} className="sa2-kpi-card">
                  <div className="sa2-kpi-icon" style={{background:c+'18',color:c}}><Icon size={17}/></div>
                  <div className="sa2-kpi-body"><div className="sa2-kpi-label">{l}</div><div className="sa2-kpi-value">{v}</div></div>
                </div>
              ))}
            </div>
            <div className="sa2-api-cards-grid">
              {APIS.map(api=>{
                const pct=Math.min(100,Math.round((api.req/api.q)*100));
                return (
                  <div key={api.id} className="sa2-api-card">
                    <div className="sa2-api-card-header">
                      <div className="sa2-api-icon"><api.Icon size={16}/></div>
                      <div><div className="sa2-api-name">{api.name}</div><div className="sa2-api-cat">{api.cat}</div></div>
                      <div style={{width:8,height:8,borderRadius:'50%',background:SC[api.st],flexShrink:0,marginLeft:'auto'}}/>
                    </div>
                    <div className="sa2-api-stats">
                      <span><Activity size={10}/> {api.req.toLocaleString()}</span>
                      <span><Clock size={10}/> {api.ms}ms</span>
                      <span style={{color:api.err>50?'#EF4444':'var(--sa2-text-muted)'}}>{api.err} err</span>
                    </div>
                    <div className="sa2-quota-bar"><div className="sa2-quota-fill" style={{width:`${pct}%`,background:pct>80?'#EF4444':pct>60?'#F59E0B':'#5B5BA6'}}/></div>
                    <div className="sa2-api-quota-label">{api.req.toLocaleString()} / {api.q.toLocaleString()} ({pct}%)</div>
                    <div className="sa2-api-actions">
                      <button className="sa2-icon-btn"><Edit3 size={11}/></button>
                      <button className="sa2-icon-btn">{api.st==='active'?<ToggleRight size={14} style={{color:'#10B981'}}/>:<ToggleLeft size={14} style={{color:'#94A3B8'}}/>}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab==='keys' && (
          <div>
            <div className="sa2-toolbar"><div className="sa2-search-box"><Search size={13}/><input placeholder="Rechercher API…" value={q} onChange={e=>setQ(e.target.value)}/></div></div>
            <div className="sa2-table-wrap">
              <table className="sa2-table">
                <thead><tr><th>Service</th><th>Catégorie</th><th>Clé / Token</th><th>Uptime</th><th>Statut</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(a=>(
                    <tr key={a.id}>
                      <td><div className="sa2-user-cell"><div className="sa2-api-icon-sm"><a.Icon size={12}/></div><span className="sa2-cell-primary">{a.name}</span></div></td>
                      <td className="sa2-cell-sub">{a.cat}</td>
                      <td>
                        <div className="sa2-key-field">
                          <code className="sa2-code">{shown[a.id]?a.key:'••••••••••••••••'}</code>
                          <button className="sa2-icon-btn" onClick={()=>setShown(p=>({...p,[a.id]:!p[a.id]}))}>{shown[a.id]?<EyeOff size={11}/>:<Eye size={11}/>}</button>
                          <button className="sa2-icon-btn" onClick={()=>navigator.clipboard.writeText(a.key).catch(()=>{})}><Copy size={11}/></button>
                        </div>
                      </td>
                      <td>{a.up}%</td>
                      <td><span style={{color:SC[a.st],fontSize:'0.7rem',fontWeight:700,textTransform:'uppercase'}}>● {a.st}</span></td>
                      <td><div className="sa2-row-actions"><button className="sa2-icon-btn"><Edit3 size={11}/></button><button className="sa2-icon-btn"><RefreshCw size={11}/></button><button className="sa2-icon-btn danger"><Trash2 size={11}/></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='logs' && (
          <div>
            <div className="sa2-toolbar"><div className="sa2-search-box"><Search size={13}/><input placeholder="Filtrer les logs…"/></div><button className="sa2-btn sa2-btn-ghost"><Download size={13}/> Exporter</button></div>
            <div className="sa2-table-wrap">
              <table className="sa2-table sa2-table-mono">
                <thead><tr><th>Heure</th><th>API</th><th>Méthode</th><th>Endpoint</th><th>Status</th><th>Latence</th></tr></thead>
                <tbody>
                  {LOGS.map((l,i)=>(
                    <tr key={i} className={l.s>=400?'sa2-row-error':''}>
                      <td><code>{l.t}</code></td>
                      <td><span className="sa2-tag">{l.api}</span></td>
                      <td><code className="sa2-method" data-method={l.m}>{l.m}</code></td>
                      <td><code className="sa2-endpoint">{l.ep}</code></td>
                      <td><span style={{color:l.s<300?'#10B981':l.s<500?'#F59E0B':'#EF4444',fontWeight:700}}>{l.s}</span></td>
                      <td style={{color:l.ms>500?'#EF4444':l.ms>200?'#F59E0B':'inherit'}}>{l.ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='quotas' && (
          <div className="sa2-quotas-grid">
            {APIS.filter(a=>a.st!=='inactive').map(api=>{
              const pct=Math.min(100,Math.round((api.req/api.q)*100));
              return (
                <div key={api.id} className="sa2-quota-card">
                  <div className="sa2-quota-card-header"><api.Icon size={14}/><span>{api.name}</span></div>
                  <div className="sa2-quota-nums"><strong>{api.req.toLocaleString()}</strong> / {api.q.toLocaleString()}</div>
                  <div className="sa2-quota-bar-lg"><div className="sa2-quota-fill" style={{width:`${pct}%`,background:pct>80?'#EF4444':pct>60?'#F59E0B':'#5B5BA6'}}/></div>
                  <div className="sa2-quota-pct" style={{color:pct>80?'#EF4444':pct>60?'#F59E0B':'#10B981'}}>{pct}%</div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
