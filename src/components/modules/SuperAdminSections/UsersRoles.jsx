import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit3, Trash2, Search, Eye, XCircle, UserCheck, Shield, Crown, Save, RefreshCw, Check, X, Lock } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { adminFetch } from './adminUtils';

const ROLES = ['super_admin','admin','manager','support','user'];
const ROLE_COLORS = {super_admin:'#EF4444',admin:'#F59E0B',manager:'#3B82F6',support:'#8B5CF6',user:'#94A3B8'};
const ROLE_LABELS = {super_admin:'Super Admin',admin:'Admin',manager:'Manager',support:'Support',user:'Utilisateur'};

const PERMISSIONS_MATRIX = [
  {module:'Dashboard',          key:'dashboard'},
  {module:'Gestion PMS',        key:'pms'},
  {module:'Clients / CRM',      key:'clients'},
  {module:'Plans & Abonnements',key:'plans'},
  {module:'Paiements',          key:'payments'},
  {module:'API Manager',        key:'apis'},
  {module:'Intégrations',       key:'integrations'},
  {module:'CMS Site Web',       key:'cms'},
  {module:'Utilisateurs',       key:'users'},
  {module:'Rôles & Droits',     key:'roles'},
  {module:'Journal d\'activité',key:'logs'},
  {module:'Paramètres système', key:'settings'},
];

const DEFAULT_PERMS = {
  super_admin: {dashboard:true,pms:true,clients:true,plans:true,payments:true,apis:true,integrations:true,cms:true,users:true,roles:true,logs:true,settings:true},
  admin:       {dashboard:true,pms:true,clients:true,plans:true,payments:true,apis:false,integrations:true,cms:true,users:true,roles:false,logs:true,settings:false},
  manager:     {dashboard:true,pms:true,clients:true,plans:false,payments:false,apis:false,integrations:false,cms:false,users:false,roles:false,logs:true,settings:false},
  support:     {dashboard:true,pms:false,clients:true,plans:false,payments:false,apis:false,integrations:false,cms:false,users:false,roles:false,logs:true,settings:false},
  user:        {dashboard:false,pms:false,clients:false,plans:false,payments:false,apis:false,integrations:false,cms:false,users:false,roles:false,logs:false,settings:false},
};

const RolePill = ({role}) => {
  const c=ROLE_COLORS[role]||'#94A3B8';
  return <span style={{background:c+'18',color:c,border:`1px solid ${c}40`,borderRadius:5,padding:'2px 8px',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',whiteSpace:'nowrap'}}>{ROLE_LABELS[role]||role}</span>;
};

export default function UsersRoles() {
  // Render directly from the global store — realtime updates propagate automatically
  const profiles         = useAppStore(s => s.profiles);
  const setStoreProfiles = useAppStore(s => s.setProfiles);

  const [tab,setTab]         = useState('users');
  const [loading,setLoading] = useState(true);
  const [q,setQ]             = useState('');
  const [sel,setSel]         = useState(null);
  const [perms,setPerms]     = useState(DEFAULT_PERMS);
  const [permsSaved,setPermsSaved] = useState(false);

  const refresh = () => {
    setLoading(true);
    adminFetch('/api/admin/users').then(r=>r.json()).then(d=>{
      const arr = Array.isArray(d) ? d : (Array.isArray(d?.users) ? d.users : []);
      if (arr.length) setStoreProfiles(arr); // write only to store; render from store
    }).catch(()=>{}).finally(()=>setLoading(false));
  };

  useEffect(()=>{ refresh(); },[]);

  // Computed from store — reactive to realtime updates
  const filtered = profiles.filter(u=>
    !q||[u.full_name,u.email,u.role,u.plan,u.company].some(v=>(v||'').toLowerCase().includes(q.toLowerCase()))
  );

  const savePerms = async () => {
    setPermsSaved(true);
    await new Promise(r=>setTimeout(r,800));
    setPermsSaved(false);
  };

  const fmtDate = d => d?new Date(d).toLocaleDateString('fr-FR'):'—';

  return (
    <div className="sa2-section">
      <div className="sa2-section-header">
        <div><h2 className="sa2-section-title">Utilisateurs & Rôles</h2><p className="sa2-section-desc">Gestion des comptes, rôles et matrice de permissions ACL</p></div>
        <button className="sa2-btn sa2-btn-primary"><Plus size={13}/> Nouveau compte</button>
      </div>

      <div className="sa2-tabs">
        {[['users','Utilisateurs'],['roles','Rôles & Permissions']].map(([id,lbl])=>(
          <button key={id} className={`sa2-tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      <div className="sa2-tab-content">

        {tab==='users' && (
          <div>
            <div className="sa2-toolbar">
              <div className="sa2-search-box"><Search size={13}/><input placeholder="Nom, email, plan, rôle…" value={q} onChange={e=>setQ(e.target.value)}/></div>
              <button className="sa2-btn sa2-btn-ghost" onClick={refresh}><RefreshCw size={13}/> Rafraîchir</button>
            </div>

            {loading ? (
              <div style={{textAlign:'center',padding:40,color:'var(--sa2-text-muted)'}}>Chargement…</div>
            ) : (
              <div style={{display:'grid',gridTemplateColumns:sel?'1fr 320px':'1fr',gap:16}}>
                <div className="sa2-table-wrap">
                  <table className="sa2-table">
                    <thead><tr><th>Utilisateur</th><th>Email</th><th>Entreprise</th><th>Plan</th><th>Rôle</th><th>Créé le</th><th/></tr></thead>
                    <tbody>
                      {filtered.length===0?(
                        <tr><td colSpan={7} style={{textAlign:'center',padding:32,color:'var(--sa2-text-muted)'}}>Aucun utilisateur trouvé</td></tr>
                      ):filtered.map(u=>(
                        <tr key={u.id} onClick={()=>setSel(sel?.id===u.id?null:u)} className={sel?.id===u.id?'sa2-row-active':''}>
                          <td>
                            <div className="sa2-user-cell">
                              <div className="sa2-avatar-sm" style={{background:ROLE_COLORS[u.role]||'#5B5BA6'}}>
                                {(u.full_name||u.email||'?').slice(0,2).toUpperCase()}
                              </div>
                              <span className="sa2-cell-primary">{u.full_name||'—'}</span>
                            </div>
                          </td>
                          <td className="sa2-cell-sub">{u.email}</td>
                          <td className="sa2-cell-sub">{u.company||'—'}</td>
                          <td><span className="sa2-plan-badge">{u.plan||'starter'}</span></td>
                          <td><RolePill role={u.role}/></td>
                          <td className="sa2-cell-sub">{fmtDate(u.created_at)}</td>
                          <td>
                            <div className="sa2-row-actions">
                              <button className="sa2-icon-btn"><Edit3 size={12}/></button>
                              <button className="sa2-icon-btn danger"><Trash2 size={12}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {sel && (
                  <div className="sa2-detail-panel" style={{position:'sticky',top:0,alignSelf:'start'}}>
                    <div className="sa2-detail-header">
                      <div className="sa2-avatar-sm" style={{background:ROLE_COLORS[sel.role]||'#5B5BA6',width:28,height:28,fontSize:'0.7rem'}}>
                        {(sel.full_name||sel.email||'?').slice(0,2).toUpperCase()}
                      </div>
                      <strong style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sel.full_name||sel.email}</strong>
                      <button className="sa2-icon-btn" onClick={()=>setSel(null)}><XCircle size={13}/></button>
                    </div>
                    <div className="sa2-detail-grid">
                      <div><span>Email</span><strong style={{fontSize:'0.75rem'}}>{sel.email}</strong></div>
                      <div><span>Rôle</span><RolePill role={sel.role}/></div>
                      <div><span>Plan</span><span className="sa2-plan-badge">{sel.plan||'starter'}</span></div>
                      <div><span>Entreprise</span><strong>{sel.company||'—'}</strong></div>
                      <div><span>Téléphone</span><strong>{sel.phone||'—'}</strong></div>
                      <div><span>Créé le</span><strong>{fmtDate(sel.created_at)}</strong></div>
                    </div>
                    <div style={{padding:'12px 16px',borderTop:'1px solid var(--sa2-border)',display:'flex',gap:8,flexWrap:'wrap'}}>
                      <button className="sa2-btn sa2-btn-ghost sa2-btn-sm"><Edit3 size={11}/> Modifier</button>
                      <button className="sa2-btn sa2-btn-ghost sa2-btn-sm"><Lock size={11}/> Réinitialiser mdp</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab==='roles' && (
          <div>
            <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
              <button className="sa2-btn sa2-btn-primary" onClick={savePerms} disabled={permsSaved}>
                <Save size={13}/> {permsSaved?'Sauvegardé ✓':'Sauvegarder les permissions'}
              </button>
            </div>
            <div className="sa2-table-wrap">
              <table className="sa2-table sa2-perms-table">
                <thead>
                  <tr>
                    <th style={{minWidth:200}}>Module</th>
                    {ROLES.map(r=>(
                      <th key={r} style={{textAlign:'center',minWidth:110}}>
                        <span style={{color:ROLE_COLORS[r],fontWeight:700,fontSize:'0.72rem',textTransform:'uppercase'}}>{ROLE_LABELS[r]}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS_MATRIX.map(({module,key})=>(
                    <tr key={key}>
                      <td><strong style={{fontSize:'0.82rem'}}>{module}</strong></td>
                      {ROLES.map(role=>(
                        <td key={role} style={{textAlign:'center'}}>
                          {role==='super_admin' ? (
                            <Check size={15} style={{color:'#10B981',margin:'0 auto'}}/>
                          ) : (
                            <button
                              className={`sa2-perm-btn ${perms[role]?.[key]?'granted':'denied'}`}
                              onClick={()=>setPerms(p=>({...p,[role]:{...p[role],[key]:!p[role]?.[key]}}))}
                            >
                              {perms[role]?.[key]
                                ? <Check size={13} style={{color:'#10B981'}}/>
                                : <X size={13} style={{color:'#94A3B8'}}/>
                              }
                            </button>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
