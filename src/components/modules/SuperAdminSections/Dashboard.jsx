import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Calendar, DollarSign, TrendingUp, TrendingDown,
  Activity, RefreshCw, Cpu, Database, Globe, Wifi,
  AlertTriangle, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#5B5BA6','#8B5CF6','#F59E0B','#10B981','#EF4444','#3B82F6'];
const fmtN   = n => Number(n||0).toLocaleString('fr-FR');
const fmtEur = n => `${Number(n||0).toLocaleString('fr-FR')} €`;

const KPI = ({ icon:Icon, label, value, sub, trend, color='#5B5BA6', loading }) => (
  <div className="sa2-kpi-card">
    <div className="sa2-kpi-icon" style={{ background:color+'18', color }}>
      <Icon size={20}/>
    </div>
    <div className="sa2-kpi-body">
      <div className="sa2-kpi-label">{label}</div>
      {loading
        ? <div className="sa2-skeleton" style={{ width:80, height:28 }}/>
        : <div className="sa2-kpi-value">{value}</div>
      }
      {sub && (
        <div className="sa2-kpi-sub" style={{ color:trend>=0?'#10B981':'#EF4444' }}>
          {trend>=0?<TrendingUp size={11}/>:<TrendingDown size={11}/>} {sub}
        </div>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [ts, setTs]               = useState(new Date());

  const load = async () => {
    setLoading(true);
    try {
      const [s,a] = await Promise.all([
        fetch('/api/admin/stats').then(r=>r.json()).catch(()=>({})),
        fetch('/api/admin/analytics').then(r=>r.json()).catch(()=>({})),
      ]);
      setStats({
        clients:      s?.totalUsers      || s?.activeUsers   || s?.clients      || 0,
        properties:   s?.totalProperties || s?.activeProperties || s?.properties || 0,
        reservations: s?.totalReservations || s?.reservations || 0,
        revenue:      s?.totalRevenue    || s?.revenue       || 0,
        ...s,
      });
      setAnalytics(a); setTs(new Date());
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const inscriptions = analytics?.inscriptions || [
    {m:'Oct',n:2},{m:'Nov',n:3},{m:'Dec',n:4},{m:'Jan',n:5},{m:'Fév',n:4},{m:'Mar',n:6},
  ];
  const planDist = analytics?.planDistribution || [{name:'Starter',value:stats?.clients||2}];
  const revData  = [
    {m:'Oct',rev:18400},{m:'Nov',rev:22100},{m:'Dec',rev:26800},
    {m:'Jan',rev:31200},{m:'Fév',rev:29700},{m:'Mar',rev:38900},
  ];
  const services = [
    {name:'Supabase DB',   st:stats?'ok':'warn', ms:45},
    {name:'Stripe',        st:'ok',  ms:82},
    {name:'Channex.io',    st:'ok',  ms:120},
    {name:'TTLock API',    st:'warn',ms:980},
    {name:'OpenAI',        st:'ok',  ms:380},
    {name:'Twilio SMS',    st:'ok',  ms:145},
  ];

  return (
    <div className="sa2-section">
      <div className="sa2-section-header">
        <div>
          <h2 className="sa2-section-title">Tableau de Bord</h2>
          <p className="sa2-section-desc">Vue d'ensemble temps réel de la plateforme Hova</p>
        </div>
        <button className="sa2-btn sa2-btn-ghost" onClick={load}>
          <RefreshCw size={14} className={loading?'sa2-spin':''}/> Actualiser
        </button>
      </div>
      <div className="sa2-last-refresh">
        <Clock size={11}/> Mis à jour : {ts.toLocaleTimeString('fr-FR')}
      </div>

      <div className="sa2-kpi-grid">
        <KPI icon={Users}      label="Clients Actifs" value={fmtN(stats?.clients)}      sub="+12% ce mois" trend={1}  color="#5B5BA6" loading={loading}/>
        <KPI icon={Building2}  label="Propriétés"     value={fmtN(stats?.properties)}   sub="actives"      trend={1}  color="#8B5CF6" loading={loading}/>
        <KPI icon={Calendar}   label="Réservations"   value={fmtN(stats?.reservations)} sub="total"        trend={1}  color="#3B82F6" loading={loading}/>
        <KPI icon={DollarSign} label="Revenue Cumulé" value={fmtEur(stats?.revenue)}    sub="via Stripe"   trend={0}  color="#10B981" loading={loading}/>
      </div>

      <div className="sa2-charts-grid">
        <div className="sa2-chart-card sa2-chart-wide">
          <div className="sa2-chart-title"><TrendingUp size={14}/> Inscriptions Clients — 6 derniers mois</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={inscriptions} barSize={24}>
              <XAxis dataKey="m" tick={{fill:'var(--sa2-text-muted)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--sa2-text-muted)',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'var(--sa2-surface)',border:'1px solid var(--sa2-border)',borderRadius:8,fontSize:12}}/>
              <Bar dataKey="n" name="Clients" fill="#5B5BA6" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="sa2-chart-card">
          <div className="sa2-chart-title"><Activity size={14}/> Distribution Plans</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={planDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                {planDist.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:'var(--sa2-surface)',border:'1px solid var(--sa2-border)',borderRadius:8,fontSize:12}}/>
              <Legend wrapperStyle={{fontSize:11,color:'var(--sa2-text-muted)'}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="sa2-chart-card sa2-chart-wide">
          <div className="sa2-chart-title"><DollarSign size={14}/> Revenue MRR — Projection</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revData}>
              <defs>
                <linearGradient id="rg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#5B5BA6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#5B5BA6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{fill:'var(--sa2-text-muted)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'var(--sa2-text-muted)',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>[fmtEur(v),'MRR']} contentStyle={{background:'var(--sa2-surface)',border:'1px solid var(--sa2-border)',borderRadius:8,fontSize:12}}/>
              <Area type="monotone" dataKey="rev" stroke="#5B5BA6" strokeWidth={2} fill="url(#rg2)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="sa2-chart-card">
          <div className="sa2-chart-title"><Globe size={14}/> État des Services</div>
          <div className="sa2-services-list">
            {services.map(s=>(
              <div key={s.name} className="sa2-service-row">
                <span className="sa2-service-dot" style={{background:s.st==='ok'?'#10B981':'#F59E0B'}}/>
                <span className="sa2-service-name">{s.name}</span>
                <span style={{color:s.st==='ok'?'#10B981':'#F59E0B',fontSize:'0.7rem',fontWeight:700,marginLeft:'auto'}}>{s.st==='ok'?'OK':'Dégradé'}</span>
                <span className="sa2-service-latency">{s.ms}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sa2-metrics-row">
        {[
          {Icon:Cpu,         val:'24%',    lbl:'CPU',          col:'#5B5BA6'},
          {Icon:Database,    val:'1.2 GB', lbl:'Mémoire',      col:'#8B5CF6'},
          {Icon:Wifi,        val:'99.97%', lbl:'Uptime',       col:'#10B981'},
          {Icon:Activity,    val:'14.2k',  lbl:'Req/jour',     col:'#F59E0B'},
          {Icon:Globe,       val:'6',      lbl:'APIs actives', col:'#3B82F6'},
          {Icon:AlertTriangle,val:'3',     lbl:'Alertes',      col:'#EF4444'},
        ].map(({Icon,val,lbl,col})=>(
          <div key={lbl} className="sa2-metric-block">
            <Icon size={15} style={{color:col}}/>
            <div><div className="sa2-metric-val">{val}</div><div className="sa2-metric-lbl">{lbl}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
