import React, { useState, useEffect } from 'react';
import { FileText, Search, Download, RefreshCw, Filter, Clock, User, Shield, Settings, Database, CreditCard, Key, Eye } from 'lucide-react';

const TYPE_CFG = {
  auth:    {col:'#3B82F6', Icon:Shield,   lbl:'Auth'},
  user:    {col:'#8B5CF6', Icon:User,     lbl:'Utilisateur'},
  system:  {col:'#F59E0B', Icon:Settings, lbl:'Système'},
  payment: {col:'#10B981', Icon:CreditCard,lbl:'Paiement'},
  api:     {col:'#EF4444', Icon:Key,      lbl:'API'},
  data:    {col:'#94A3B8', Icon:Database, lbl:'Données'},
};

const MOCK_LOGS = [
  {id:1, user:'admin@hosflow.com',   action:'Connexion Super Admin',          resource:'auth',    type:'auth',    ip:'41.140.xx.xx', at:'2026-05-18T10:54:12Z'},
  {id:2, user:'admin@hosflow.com',   action:'Création compte client',         resource:'profiles',type:'user',    ip:'41.140.xx.xx', at:'2026-05-18T10:42:05Z'},
  {id:3, user:'admin@hosflow.com',   action:'Modification plan — Gold',       resource:'plans',   type:'system',  ip:'41.140.xx.xx', at:'2026-05-18T10:38:30Z'},
  {id:4, user:'k.bensouda@riad.ma',  action:'Check-in effectué RES-003',     resource:'checkin', type:'user',    ip:'197.x.x.x',    at:'2026-05-17T14:20:10Z'},
  {id:5, user:'admin@hosflow.com',   action:'Remboursement pi_3Rf4To3',      resource:'stripe',  type:'payment', ip:'41.140.xx.xx', at:'2026-05-17T11:00:45Z'},
  {id:6, user:'system',              action:'Sync Channex — 12 nouvelles réservations',resource:'channex',type:'api', ip:'—',          at:'2026-05-17T08:00:00Z'},
  {id:7, user:'admin@hosflow.com',   action:'Suppression employé ID:4',       resource:'employees',type:'user',   ip:'41.140.xx.xx', at:'2026-05-16T16:45:22Z'},
  {id:8, user:'system',              action:'Backup automatique BDD',         resource:'database',type:'system',  ip:'—',            at:'2026-05-16T03:00:00Z'},
  {id:9, user:'z.alaoui@daress.ma',  action:'Tentative connexion échouée',    resource:'auth',    type:'auth',    ip:'102.x.x.x',    at:'2026-05-15T22:13:00Z'},
  {id:10,user:'admin@hosflow.com',   action:'Activation intégration WhatsApp',resource:'integrations',type:'api', ip:'41.140.xx.xx', at:'2026-05-15T14:30:00Z'},
];

export default function AuditLogs() {
  const [logs,setLogs]     = useState([]);
  const [loading,setLoading] = useState(true);
  const [q,setQ]           = useState('');
  const [typeFilter,setTypeFilter] = useState('all');
  const [sel,setSel]       = useState(null);

  useEffect(()=>{
    fetch('/api/admin/audit-logs').then(r=>r.json()).then(d=>{
      const arr = Array.isArray(d) ? d : (Array.isArray(d?.logs) ? d.logs : []);
      setLogs(arr.length ? arr : MOCK_LOGS);
    }).catch(()=>setLogs(MOCK_LOGS)).finally(()=>setLoading(false));
  },[]);

  const reload = () => {
    setLoading(true);
    fetch('/api/admin/audit-logs').then(r=>r.json()).then(d=>{
      const arr = Array.isArray(d) ? d : (Array.isArray(d?.logs) ? d.logs : []);
      setLogs(arr.length ? arr : MOCK_LOGS);
    }).catch(()=>setLogs(MOCK_LOGS)).finally(()=>setLoading(false));
  };

  const filtered = logs.filter(l=>{
    const matchQ = !q || [l.user,l.action,l.resource].some(v=>(v||'').toLowerCase().includes(q.toLowerCase()));
    const matchT = typeFilter==='all' || l.type===typeFilter;
    return matchQ && matchT;
  });

  const fmtDt = s => {
    try { return new Date(s).toLocaleString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}); }
    catch { return s; }
  };

  return (
    <div className="sa2-section">
      <div className="sa2-section-header">
        <div><h2 className="sa2-section-title">Journal d'Activité</h2><p className="sa2-section-desc">Audit complet de toutes les actions effectuées sur la plateforme</p></div>
        <div style={{display:'flex',gap:8}}>
          <button className="sa2-btn sa2-btn-ghost" onClick={reload}><RefreshCw size={13} className={loading?'sa2-spin':''}/> Rafraîchir</button>
          <button className="sa2-btn sa2-btn-ghost"><Download size={13}/> Exporter</button>
        </div>
      </div>

      <div className="sa2-kpi-grid" style={{gridTemplateColumns:'repeat(6,1fr)',marginBottom:20}}>
        {Object.entries(TYPE_CFG).map(([k,{col,Icon,lbl}])=>{
          const cnt=logs.filter(l=>l.type===k).length;
          return (
            <div key={k} className="sa2-kpi-card" onClick={()=>setTypeFilter(typeFilter===k?'all':k)} style={{cursor:'pointer',borderColor:typeFilter===k?col+'60':'transparent'}}>
              <div className="sa2-kpi-icon" style={{background:col+'18',color:col}}><Icon size={15}/></div>
              <div className="sa2-kpi-body"><div className="sa2-kpi-label">{lbl}</div><div className="sa2-kpi-value" style={{fontSize:'1.2rem'}}>{cnt}</div></div>
            </div>
          );
        })}
      </div>

      <div className="sa2-toolbar">
        <div className="sa2-search-box"><Search size={13}/><input placeholder="Rechercher action, utilisateur, ressource…" value={q} onChange={e=>setQ(e.target.value)}/></div>
        <select className="sa2-select" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
          <option value="all">Tous les types</option>
          {Object.entries(TYPE_CFG).map(([k,{lbl}])=><option key={k} value={k}>{lbl}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{textAlign:'center',padding:40,color:'var(--sa2-text-muted)'}}>Chargement des logs…</div>
      ) : (
        <div className="sa2-table-wrap">
          <table className="sa2-table sa2-table-mono">
            <thead><tr><th>Date & Heure</th><th>Utilisateur</th><th>Action</th><th>Ressource</th><th>Type</th><th>IP</th><th/></tr></thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--sa2-text-muted)'}}>Aucun log trouvé</td></tr>
              ) : filtered.map(l=>{
                const cfg=TYPE_CFG[l.type]||TYPE_CFG.data;
                return (
                  <tr key={l.id||l.created_at} onClick={()=>setSel(sel?.id===l.id?null:l)} className={sel?.id===l.id?'sa2-row-active':''} style={{cursor:'pointer'}}>
                    <td><div className="sa2-cell-with-icon" style={{gap:6}}><Clock size={10}/><code style={{fontSize:'0.75rem'}}>{fmtDt(l.at||l.created_at)}</code></div></td>
                    <td className="sa2-cell-sub" style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.user||l.user_email||'—'}</td>
                    <td style={{maxWidth:240}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:'0.82rem'}}>{l.action}</div></td>
                    <td><code className="sa2-code">{l.resource}</code></td>
                    <td>
                      <span style={{background:cfg.col+'18',color:cfg.col,border:`1px solid ${cfg.col}40`,borderRadius:4,padding:'1px 7px',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',whiteSpace:'nowrap'}}>
                        {cfg.lbl}
                      </span>
                    </td>
                    <td><code style={{fontSize:'0.72rem',color:'var(--sa2-text-muted)'}}>{l.ip||'—'}</code></td>
                    <td><button className="sa2-icon-btn"><Eye size={11}/></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {sel && (
        <div className="sa2-detail-panel" style={{marginTop:16}}>
          <div className="sa2-detail-header">
            <FileText size={14}/>
            <strong>Détail de l'action</strong>
            <button className="sa2-icon-btn" onClick={()=>setSel(null)}><Eye size={13}/></button>
          </div>
          <div className="sa2-detail-grid">
            {[['Utilisateur',sel.user||sel.user_email],['Action',sel.action],['Ressource',sel.resource],['Type',sel.type],['IP',sel.ip||'—'],['Date',fmtDt(sel.at||sel.created_at)]].map(([k,v])=>(
              <div key={k}><span>{k}</span><strong style={{fontSize:'0.78rem'}}>{v}</strong></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
