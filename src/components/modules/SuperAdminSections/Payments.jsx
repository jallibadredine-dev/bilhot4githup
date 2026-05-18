import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, RefreshCw, Download, Search, Eye, CheckCircle, XCircle, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAppStore } from '../../../store/appStore';

const fmtEur = n => `${Number(n||0).toLocaleString('fr-FR')} €`;
const MRR_DATA = [
  {m:'Oct',mrr:18400,txn:62},{m:'Nov',mrr:22100,txn:75},{m:'Dec',mrr:26800,txn:89},
  {m:'Jan',mrr:31200,txn:104},{m:'Fév',mrr:29700,txn:98},{m:'Mar',mrr:38900,txn:128},
];
const MOCK_TXN = [
  {id:'pi_3Rf8Xs2',customer:'Riad Al Andalous',amount:34900,currency:'EUR',status:'succeeded',date:'2026-05-17',method:'card'},
  {id:'pi_3Rf8Xr3',customer:'Villa Océane',    amount:14900,currency:'EUR',status:'succeeded',date:'2026-05-15',method:'card'},
  {id:'pi_3Rf7Wq1',customer:'Dar Essalam',     amount:34900,currency:'EUR',status:'succeeded',date:'2026-05-12',method:'card'},
  {id:'pi_3Rf6Vp2',customer:'Hotel Le Marin',  amount:89900,currency:'EUR',status:'succeeded',date:'2026-05-10',method:'card'},
  {id:'pi_3Rf5Up4',customer:'Test Client',     amount:14900,currency:'EUR',status:'failed',   date:'2026-05-08',method:'card'},
  {id:'pi_3Rf4To3',customer:'Riad Al Andalous',amount:34900,currency:'EUR',status:'refunded', date:'2026-05-05',method:'card'},
];

const StatusBadge = ({s}) => {
  const M={succeeded:{c:'#10B981',l:'Réussi'},failed:{c:'#EF4444',l:'Échoué'},pending:{c:'#F59E0B',l:'En attente'},refunded:{c:'#8B5CF6',l:'Remboursé'}};
  const cfg=M[s]||{c:'#94A3B8',l:s};
  return <span style={{background:cfg.c+'18',color:cfg.c,border:`1px solid ${cfg.c}40`,borderRadius:5,padding:'2px 8px',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase'}}>{cfg.l}</span>;
};

export default function Payments() {
  const storePayments    = useAppStore(s => s.payments);
  const setStorePayments = useAppStore(s => s.setPayments);

  const [payments,setPayments] = useState(() => storePayments.length ? storePayments : []); // pre-populate from store
  const [loading,setLoading]   = useState(storePayments.length === 0);
  const [tab,setTab]           = useState('overview');
  const [q,setQ]               = useState('');

  useEffect(()=>{
    fetch('/api/admin/payments').then(r=>r.json()).then(d=>{
      const arr = Array.isArray(d) ? d : (Array.isArray(d?.payments) ? d.payments : []);
      const result = arr.length ? arr : MOCK_TXN;
      setPayments(result);
      if (arr.length) setStorePayments(arr); // keep global store in sync
    }).catch(()=>setPayments(storePayments.length ? storePayments : MOCK_TXN))
      .finally(()=>setLoading(false));
  },[]);

  const txns = (payments.length ? payments : MOCK_TXN).filter(t =>
    !q || (t.customer||t.description||t.id||'').toLowerCase().includes(q.toLowerCase())
  );

  const total = MRR_DATA.reduce((s,d)=>s+d.mrr,0);
  const mrr   = MRR_DATA[MRR_DATA.length-1].mrr;

  return (
    <div className="sa2-section">
      <div className="sa2-section-header">
        <div><h2 className="sa2-section-title">Paiements & Finance</h2><p className="sa2-section-desc">Dashboard financier — transactions Stripe, revenus et statistiques</p></div>
        <button className="sa2-btn sa2-btn-ghost"><Download size={13}/> Exporter CSV</button>
      </div>

      <div className="sa2-tabs">
        {[['overview','Vue d\'ensemble'],['transactions','Transactions'],['subscriptions','Abonnements']].map(([id,lbl])=>(
          <button key={id} className={`sa2-tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      <div className="sa2-tab-content">

        {tab==='overview' && (
          <div>
            <div className="sa2-kpi-grid">
              <div className="sa2-kpi-card"><div className="sa2-kpi-icon" style={{background:'#10B98118',color:'#10B981'}}><DollarSign size={19}/></div><div className="sa2-kpi-body"><div className="sa2-kpi-label">MRR (Mars 2026)</div><div className="sa2-kpi-value">{fmtEur(mrr)}</div><div className="sa2-kpi-sub" style={{color:'#10B981'}}><TrendingUp size={11}/> +31% vs Oct</div></div></div>
              <div className="sa2-kpi-card"><div className="sa2-kpi-icon" style={{background:'#5B5BA618',color:'#5B5BA6'}}><BarChart3 size={19}/></div><div className="sa2-kpi-body"><div className="sa2-kpi-label">Revenue Total (6m)</div><div className="sa2-kpi-value">{fmtEur(total)}</div></div></div>
              <div className="sa2-kpi-card"><div className="sa2-kpi-icon" style={{background:'#3B82F618',color:'#3B82F6'}}><CreditCard size={19}/></div><div className="sa2-kpi-body"><div className="sa2-kpi-label">Transactions / mois</div><div className="sa2-kpi-value">128</div></div></div>
              <div className="sa2-kpi-card"><div className="sa2-kpi-icon" style={{background:'#8B5CF618',color:'#8B5CF6'}}><CheckCircle size={19}/></div><div className="sa2-kpi-body"><div className="sa2-kpi-label">Taux de succès</div><div className="sa2-kpi-value">97.6%</div></div></div>
            </div>

            <div className="sa2-charts-grid">
              <div className="sa2-chart-card sa2-chart-wide">
                <div className="sa2-chart-title"><TrendingUp size={14}/> MRR — 6 derniers mois</div>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={MRR_DATA}>
                    <defs>
                      <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" tick={{fill:'var(--sa2-text-muted)',fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:'var(--sa2-text-muted)',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                    <Tooltip formatter={v=>[fmtEur(v),'MRR']} contentStyle={{background:'var(--sa2-surface)',border:'1px solid var(--sa2-border)',borderRadius:8,fontSize:12}}/>
                    <Area type="monotone" dataKey="mrr" stroke="#10B981" strokeWidth={2} fill="url(#mrrGrad)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="sa2-chart-card">
                <div className="sa2-chart-title"><BarChart3 size={14}/> Transactions / mois</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={MRR_DATA} barSize={20}>
                    <XAxis dataKey="m" tick={{fill:'var(--sa2-text-muted)',fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:'var(--sa2-text-muted)',fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:'var(--sa2-surface)',border:'1px solid var(--sa2-border)',borderRadius:8,fontSize:12}}/>
                    <Bar dataKey="txn" name="Transactions" fill="#5B5BA6" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab==='transactions' && (
          <div>
            <div className="sa2-toolbar">
              <div className="sa2-search-box"><Search size={13}/><input placeholder="Rechercher client, ID…" value={q} onChange={e=>setQ(e.target.value)}/></div>
              <button className="sa2-btn sa2-btn-ghost"><Download size={13}/> Exporter</button>
            </div>
            {loading ? (
              <div style={{textAlign:'center',padding:40,color:'var(--sa2-text-muted)'}}>Chargement Stripe…</div>
            ) : (
              <div className="sa2-table-wrap">
                <table className="sa2-table">
                  <thead><tr><th>ID</th><th>Client</th><th>Montant</th><th>Méthode</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {txns.map(t=>(
                      <tr key={t.id}>
                        <td><code className="sa2-code">{t.id?.slice(0,14)}…</code></td>
                        <td><div className="sa2-cell-primary">{t.customer||t.description||'—'}</div></td>
                        <td><strong>{fmtEur((t.amount||0)/100)}</strong></td>
                        <td><span className="sa2-tag">{t.method||t.payment_method_types?.[0]||'card'}</span></td>
                        <td><StatusBadge s={t.status}/></td>
                        <td className="sa2-cell-sub">{t.date||(t.created?new Date(t.created*1000).toLocaleDateString('fr-FR'):'—')}</td>
                        <td>
                          <div className="sa2-row-actions">
                            <button className="sa2-icon-btn" title="Voir"><Eye size={12}/></button>
                            {t.status==='succeeded'&&<button className="sa2-icon-btn" title="Rembourser" style={{color:'#8B5CF6'}}><RefreshCw size={12}/></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab==='subscriptions' && (
          <div>
            <div className="sa2-table-wrap">
              <table className="sa2-table">
                <thead><tr><th>Client</th><th>Plan</th><th>Montant</th><th>Intervalle</th><th>Prochain paiement</th><th>Statut</th><th/></tr></thead>
                <tbody>
                  {[
                    {c:'Riad Al Andalous',plan:'Gold',   amt:349,  freq:'mensuel', next:'2026-06-10',st:'active'},
                    {c:'Villa Océane',    plan:'Silver',  amt:149,  freq:'mensuel', next:'2026-06-15',st:'active'},
                    {c:'Dar Essalam',     plan:'Gold',   amt:3490, freq:'annuel',  next:'2027-01-12',st:'active'},
                    {c:'Hotel Le Marin',  plan:'Enterprise',amt:899,freq:'mensuel', next:'2026-06-10',st:'active'},
                  ].map((s,i)=>(
                    <tr key={i}>
                      <td><div className="sa2-cell-primary">{s.c}</div></td>
                      <td><span className="sa2-plan-badge">{s.plan}</span></td>
                      <td><strong>{s.amt.toLocaleString('fr-FR')} €</strong></td>
                      <td><span className="sa2-tag">{s.freq}</span></td>
                      <td className="sa2-cell-sub">{s.next}</td>
                      <td><span style={{color:'#10B981',fontWeight:700,fontSize:'0.7rem',textTransform:'uppercase'}}>● Actif</span></td>
                      <td><div className="sa2-row-actions"><button className="sa2-icon-btn"><Eye size={12}/></button></div></td>
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
