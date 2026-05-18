import React, { useState } from 'react';
import {
  Building2, BedDouble, Calendar, Users, Plus, Edit3, Trash2,
  Search, Eye, CheckCircle, Clock, XCircle, Key, ClipboardList, MapPin,
} from 'lucide-react';

const TABS = [
  {id:'hotels',       label:'Hôtels & Propriétés', Icon:Building2},
  {id:'rooms',        label:'Chambres & Unités',    Icon:BedDouble},
  {id:'reservations', label:'Réservations',         Icon:Calendar},
  {id:'checkin',      label:'Check-in / Out',       Icon:ClipboardList},
  {id:'employees',    label:'Équipe',               Icon:Users},
];

const SBadge = ({s}) => {
  const M = {
    active:'#10B981',inactive:'#94A3B8',confirmed:'#10B981',pending:'#F59E0B',
    cancelled:'#EF4444',checked_in:'#3B82F6',available:'#10B981',occupied:'#EF4444',cleaning:'#F59E0B',
  };
  const L = {
    active:'Actif',inactive:'Inactif',confirmed:'Confirmée',pending:'En attente',
    cancelled:'Annulée',checked_in:'Arrivé',available:'Libre',occupied:'Occupée',cleaning:'Nettoyage',
  };
  const c = M[s]||'#94A3B8';
  return <span style={{background:c+'18',color:c,border:`1px solid ${c}40`,borderRadius:5,padding:'2px 8px',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',whiteSpace:'nowrap'}}>{L[s]||s}</span>;
};

const HOTELS = [
  {id:1,name:'Riad Al Andalous',city:'Marrakech', rooms:12,occ:78, status:'active',owner:'Ahmed Benali',   plan:'gold'},
  {id:2,name:'Villa Océane',    city:'Agadir',    rooms:6, occ:45, status:'active',owner:'Sara Khalidi',   plan:'silver'},
  {id:3,name:'Dar Essalam',     city:'Fès',       rooms:8, occ:60, status:'active',owner:'Youssef Tazi',   plan:'gold'},
  {id:4,name:'Hotel Le Marin',  city:'Casablanca',rooms:24,occ:82, status:'active',owner:'Nadia El Amrani',plan:'enterprise'},
];
const ROOMS = [
  {id:1,hotel:'Riad Al Andalous',num:'101',type:'Standard',   cap:2,price:450, status:'occupied', feat:['WiFi','Clim','TV']},
  {id:2,hotel:'Riad Al Andalous',num:'102',type:'Deluxe',     cap:2,price:650, status:'available',feat:['WiFi','Clim','Balcon']},
  {id:3,hotel:'Villa Océane',    num:'A1', type:'Suite',      cap:4,price:1200,status:'cleaning', feat:['WiFi','Piscine']},
  {id:4,hotel:'Dar Essalam',     num:'201',type:'Standard',   cap:2,price:350, status:'available',feat:['WiFi','Clim']},
  {id:5,hotel:'Hotel Le Marin',  num:'305',type:'Junior Suite',cap:3,price:850,status:'occupied', feat:['WiFi','Vue mer']},
];
const RES = [
  {id:'RES-001',hotel:'Riad Al Andalous',guest:'Jean Dupont',  room:'101',in:'2026-05-18',out:'2026-05-22',nights:4,amount:1800,status:'confirmed'},
  {id:'RES-002',hotel:'Villa Océane',    guest:'Maria Garcia', room:'A1', in:'2026-05-20',out:'2026-05-25',nights:5,amount:6000,status:'pending'},
  {id:'RES-003',hotel:'Dar Essalam',     guest:'Ahmed Bensaid',room:'201',in:'2026-05-17',out:'2026-05-19',nights:2,amount:700, status:'checked_in'},
  {id:'RES-004',hotel:'Hotel Le Marin',  guest:'Sophie Martin',room:'305',in:'2026-05-15',out:'2026-05-20',nights:5,amount:4250,status:'confirmed'},
];
const EMP = [
  {id:1,name:'Karim Bensouda', role:'Réceptionniste',hotel:'Riad Al Andalous',status:'active',  shift:'Matin'},
  {id:2,name:'Fatima Ouazzani',role:'Gouvernante',   hotel:'Riad Al Andalous',status:'active',  shift:'Matin'},
  {id:3,name:'Mehdi Tounsi',   role:'Concierge',     hotel:'Villa Océane',    status:'active',  shift:'Après-midi'},
  {id:4,name:'Zineb Alaoui',   role:'Réceptionniste',hotel:'Dar Essalam',     status:'inactive',shift:'Nuit'},
];

const Bar = ({search,setSearch,btn}) => (
  <div className="sa2-toolbar">
    <div className="sa2-search-box"><Search size={13}/><input placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
    <button className="sa2-btn sa2-btn-primary"><Plus size={13}/> {btn}</button>
  </div>
);

function Hotels() {
  const [q,setQ]=useState(''); const [sel,setSel]=useState(null);
  const list=HOTELS.filter(h=>h.name.toLowerCase().includes(q.toLowerCase())||h.city.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Bar search={q} setSearch={setQ} btn="Ajouter hôtel"/>
      <div className="sa2-table-wrap">
        <table className="sa2-table">
          <thead><tr><th>Établissement</th><th>Ville</th><th>Ch.</th><th>Occupation</th><th>Plan</th><th>Statut</th><th/></tr></thead>
          <tbody>
            {list.map(h=>(
              <tr key={h.id} onClick={()=>setSel(sel?.id===h.id?null:h)} className={sel?.id===h.id?'sa2-row-active':''}>
                <td><div className="sa2-cell-primary">{h.name}</div><div className="sa2-cell-sub">{h.owner}</div></td>
                <td><div className="sa2-cell-with-icon"><MapPin size={11}/>{h.city}</div></td>
                <td><strong>{h.rooms}</strong></td>
                <td>
                  <div className="sa2-occ-bar"><div className="sa2-occ-fill" style={{width:`${h.occ}%`,background:h.occ>70?'#10B981':h.occ>40?'#F59E0B':'#EF4444'}}/></div>
                  <span className="sa2-cell-sub">{h.occ}%</span>
                </td>
                <td><span className="sa2-plan-badge">{h.plan}</span></td>
                <td><SBadge s={h.status}/></td>
                <td><div className="sa2-row-actions"><button className="sa2-icon-btn"><Eye size={12}/></button><button className="sa2-icon-btn"><Edit3 size={12}/></button><button className="sa2-icon-btn danger"><Trash2 size={12}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel&&(
        <div className="sa2-detail-panel">
          <div className="sa2-detail-header"><Building2 size={14}/><strong>{sel.name}</strong><button className="sa2-icon-btn" onClick={()=>setSel(null)}><XCircle size={13}/></button></div>
          <div className="sa2-detail-grid">
            {[['Ville',sel.city],['Chambres',sel.rooms],['Occupation',`${sel.occ}%`],['Propriétaire',sel.owner],['Plan',sel.plan]].map(([k,v])=>(
              <div key={k}><span>{k}</span><strong>{v}</strong></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Rooms() {
  const [q,setQ]=useState('');
  const list=ROOMS.filter(r=>r.hotel.toLowerCase().includes(q.toLowerCase())||r.num.includes(q));
  return (
    <div>
      <Bar search={q} setSearch={setQ} btn="Ajouter chambre"/>
      <div className="sa2-table-wrap">
        <table className="sa2-table">
          <thead><tr><th>N°</th><th>Hôtel</th><th>Type</th><th>Cap.</th><th>Prix/nuit</th><th>Équipements</th><th>Statut</th><th/></tr></thead>
          <tbody>
            {list.map(r=>(
              <tr key={r.id}>
                <td><strong>#{r.num}</strong></td>
                <td className="sa2-cell-sub">{r.hotel}</td>
                <td>{r.type}</td>
                <td>{r.cap} pers.</td>
                <td><strong>{r.price} MAD</strong></td>
                <td><div className="sa2-tags">{r.feat.map(f=><span key={f} className="sa2-tag">{f}</span>)}</div></td>
                <td><SBadge s={r.status}/></td>
                <td><div className="sa2-row-actions"><button className="sa2-icon-btn"><Edit3 size={12}/></button><button className="sa2-icon-btn danger"><Trash2 size={12}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Reservations() {
  const [q,setQ]=useState('');
  const list=RES.filter(r=>r.guest.toLowerCase().includes(q.toLowerCase())||r.id.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Bar search={q} setSearch={setQ} btn="Nouvelle réservation"/>
      <div className="sa2-table-wrap">
        <table className="sa2-table">
          <thead><tr><th>ID</th><th>Client</th><th>Hôtel</th><th>Arrivée</th><th>Départ</th><th>Nuits</th><th>Montant</th><th>Statut</th><th/></tr></thead>
          <tbody>
            {list.map(r=>(
              <tr key={r.id}>
                <td><code className="sa2-code">{r.id}</code></td>
                <td><div className="sa2-cell-primary">{r.guest}</div></td>
                <td><div className="sa2-cell-primary">{r.hotel}</div><div className="sa2-cell-sub">Ch. {r.room}</div></td>
                <td>{r.in}</td><td>{r.out}</td>
                <td><strong>{r.nights}</strong></td>
                <td><strong>{r.amount.toLocaleString('fr-FR')} MAD</strong></td>
                <td><SBadge s={r.status}/></td>
                <td><div className="sa2-row-actions"><button className="sa2-icon-btn"><Eye size={12}/></button><button className="sa2-icon-btn"><Edit3 size={12}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Checkin() {
  return (
    <div>
      <div className="sa2-checkin-kpis">
        {[[CheckCircle,'3',"Check-in aujourd'hui",'#10B981'],[XCircle,'2',"Check-out aujourd'hui",'#EF4444'],[Clock,'1','En attente','#F59E0B'],[Key,'5','Cartes RFID actives','#8B5CF6']].map(([Icon,v,l,c])=>(
          <div key={l} className="sa2-ck-kpi"><Icon size={17} style={{color:c}}/><div><strong>{v}</strong><span>{l}</span></div></div>
        ))}
      </div>
      <div className="sa2-table-wrap">
        <table className="sa2-table">
          <thead><tr><th>Client</th><th>Hôtel</th><th>Ch.</th><th>Arrivée</th><th>Départ</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {RES.slice(0,3).map(r=>(
              <tr key={r.id}>
                <td><div className="sa2-cell-primary">{r.guest}</div></td>
                <td className="sa2-cell-sub">{r.hotel}</td>
                <td><strong>#{r.room}</strong></td>
                <td>{r.in}</td><td>{r.out}</td>
                <td><SBadge s={r.status}/></td>
                <td>
                  <div className="sa2-row-actions">
                    <button className="sa2-btn sa2-btn-sm sa2-btn-primary"><CheckCircle size={11}/> Check-in</button>
                    <button className="sa2-btn sa2-btn-sm sa2-btn-ghost"><Key size={11}/> RFID</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Employees() {
  const [q,setQ]=useState('');
  const list=EMP.filter(e=>e.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Bar search={q} setSearch={setQ} btn="Ajouter employé"/>
      <div className="sa2-table-wrap">
        <table className="sa2-table">
          <thead><tr><th>Nom</th><th>Rôle</th><th>Établissement</th><th>Shift</th><th>Statut</th><th/></tr></thead>
          <tbody>
            {list.map(e=>(
              <tr key={e.id}>
                <td>
                  <div className="sa2-user-cell">
                    <div className="sa2-avatar-sm">{e.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
                    <span className="sa2-cell-primary">{e.name}</span>
                  </div>
                </td>
                <td>{e.role}</td>
                <td className="sa2-cell-sub">{e.hotel}</td>
                <td><span className="sa2-tag">{e.shift}</span></td>
                <td><SBadge s={e.status}/></td>
                <td><div className="sa2-row-actions"><button className="sa2-icon-btn"><Edit3 size={12}/></button><button className="sa2-icon-btn danger"><Trash2 size={12}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PMSManager() {
  const [tab,setTab]=useState('hotels');
  return (
    <div className="sa2-section">
      <div className="sa2-section-header">
        <div><h2 className="sa2-section-title">Gestion PMS</h2><p className="sa2-section-desc">Hôtels, chambres, réservations, accès et équipes</p></div>
      </div>
      <div className="sa2-tabs">
        {TABS.map(t=>(
          <button key={t.id} className={`sa2-tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
            <t.Icon size={13}/> {t.label}
          </button>
        ))}
      </div>
      <div className="sa2-tab-content">
        {tab==='hotels'       && <Hotels/>}
        {tab==='rooms'        && <Rooms/>}
        {tab==='reservations' && <Reservations/>}
        {tab==='checkin'      && <Checkin/>}
        {tab==='employees'    && <Employees/>}
      </div>
    </div>
  );
}
