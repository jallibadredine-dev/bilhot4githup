import React, { useState } from 'react';
import { Package, Plus, Edit3, Trash2, Check, X, Save, Users, Building2, Zap, Key, MessageSquare, Globe, BarChart3, Terminal, UserCheck, Crown } from 'lucide-react';

const FEATURES = [
  {id:'channex',  lbl:'Channel Manager',   Icon:Globe},
  {id:'iot',      lbl:'Serrures IoT',      Icon:Key},
  {id:'comms',    lbl:'SMS & WhatsApp',    Icon:MessageSquare},
  {id:'ai',       lbl:'Oracle AI',         Icon:Zap},
  {id:'reporting',lbl:'Rapports avancés',  Icon:BarChart3},
  {id:'multi',    lbl:'Multi-propriétés',  Icon:Building2},
  {id:'api',      lbl:'Accès API',         Icon:Terminal},
  {id:'support',  lbl:'Support prioritaire',Icon:UserCheck},
];

const INIT = {
  starter:   {lbl:'Starter',   color:'#94A3B8',price:0,   trial:14, props:1,  feat:[],                                         users:1},
  silver:    {lbl:'Silver',    color:'#6366F1',price:149,  trial:7,  props:5,  feat:['channex','iot'],                          users:3},
  gold:      {lbl:'Gold',      color:'#F59E0B',price:349,  trial:0,  props:20, feat:['channex','iot','comms','reporting'],       users:10},
  enterprise:{lbl:'Enterprise',color:'#8B5CF6',price:899,  trial:0,  props:999,feat:['ai','iot','comms','channex','reporting','multi','api','support'],users:999},
};

export default function PlansManager() {
  const [plans,setPlans] = useState(INIT);
  const [editing,setEditing] = useState(null);
  const [form,setForm] = useState({});
  const [saving,setSaving] = useState(false);

  const startEdit = (id) => { setEditing(id); setForm({...plans[id]}); };
  const saveEdit  = async () => {
    setSaving(true);
    await new Promise(r=>setTimeout(r,600));
    setPlans(p=>({...p,[editing]:form}));
    setEditing(null); setSaving(false);
  };
  const toggleFeat = (f) => {
    setForm(p=>({...p, feat: p.feat.includes(f) ? p.feat.filter(x=>x!==f) : [...p.feat,f]}));
  };

  return (
    <div className="sa2-section">
      <div className="sa2-section-header">
        <div><h2 className="sa2-section-title">Plans & Abonnements</h2><p className="sa2-section-desc">Gérez les packs, fonctionnalités, prix et limites pour chaque plan</p></div>
        <button className="sa2-btn sa2-btn-primary"><Plus size={13}/> Nouveau plan</button>
      </div>

      <div className="sa2-plans-grid">
        {Object.entries(plans).map(([id,plan])=>(
          <div key={id} className="sa2-plan-card" style={{borderColor:plan.color+'40'}}>
            <div className="sa2-plan-card-header" style={{borderBottom:`2px solid ${plan.color}`}}>
              <div className="sa2-plan-badge-lg" style={{background:plan.color+'18',color:plan.color}}>
                <Crown size={14}/> {plan.lbl}
              </div>
              <div className="sa2-plan-price">
                <strong style={{fontSize:'1.6rem'}}>{plan.price === 0 ? 'Gratuit' : `${plan.price} €`}</strong>
                {plan.price>0&&<span>/mois</span>}
              </div>
            </div>

            <div className="sa2-plan-details">
              <div className="sa2-plan-detail-row">
                <Building2 size={13}/> <span>{plan.props === 999 ? 'Illimité' : plan.props} propriétés</span>
              </div>
              <div className="sa2-plan-detail-row">
                <Users size={13}/> <span>{plan.users === 999 ? 'Illimité' : plan.users} utilisateurs</span>
              </div>
              {plan.trial > 0 && (
                <div className="sa2-plan-detail-row" style={{color:'#F59E0B'}}>
                  <Zap size={13}/> <span>{plan.trial} jours d'essai gratuit</span>
                </div>
              )}
            </div>

            <div className="sa2-plan-features">
              {FEATURES.map(f=>(
                <div key={f.id} className={`sa2-plan-feat ${plan.feat.includes(f.id)?'on':'off'}`}>
                  {plan.feat.includes(f.id)
                    ? <Check size={12} style={{color:'#10B981'}}/>
                    : <X size={12} style={{color:'#94A3B8'}}/>
                  }
                  <span>{f.lbl}</span>
                </div>
              ))}
            </div>

            <div className="sa2-plan-actions">
              <button className="sa2-btn sa2-btn-ghost sa2-btn-sm" onClick={()=>startEdit(id)}><Edit3 size={12}/> Modifier</button>
              {id!=='starter'&&<button className="sa2-btn sa2-btn-ghost sa2-btn-sm danger"><Trash2 size={12}/> Supprimer</button>}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="sa2-modal-overlay" onClick={()=>setEditing(null)}>
          <div className="sa2-modal" onClick={e=>e.stopPropagation()} style={{maxWidth:520}}>
            <div className="sa2-modal-header">
              <strong>Modifier le plan — {form.lbl}</strong>
              <button className="sa2-icon-btn" onClick={()=>setEditing(null)}><X size={15}/></button>
            </div>
            <div className="sa2-modal-body">
              <div className="sa2-form-row-2col">
                <div className="sa2-form-row">
                  <label>Nom du plan</label>
                  <input className="sa2-input" value={form.lbl} onChange={e=>setForm(p=>({...p,lbl:e.target.value}))}/>
                </div>
                <div className="sa2-form-row">
                  <label>Prix mensuel (€)</label>
                  <input type="number" className="sa2-input" value={form.price} onChange={e=>setForm(p=>({...p,price:Number(e.target.value)}))}/>
                </div>
              </div>
              <div className="sa2-form-row-2col">
                <div className="sa2-form-row">
                  <label>Limite propriétés</label>
                  <input type="number" className="sa2-input" value={form.props} onChange={e=>setForm(p=>({...p,props:Number(e.target.value)}))}/>
                </div>
                <div className="sa2-form-row">
                  <label>Jours d'essai</label>
                  <input type="number" className="sa2-input" value={form.trial} onChange={e=>setForm(p=>({...p,trial:Number(e.target.value)}))}/>
                </div>
              </div>
              <div className="sa2-form-row">
                <label>Fonctionnalités incluses</label>
                <div className="sa2-feat-toggles">
                  {FEATURES.map(f=>(
                    <button key={f.id} className={`sa2-feat-toggle ${form.feat?.includes(f.id)?'active':''}`} onClick={()=>toggleFeat(f.id)}>
                      <f.Icon size={12}/> {f.lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="sa2-modal-footer">
              <button className="sa2-btn sa2-btn-ghost" onClick={()=>setEditing(null)}>Annuler</button>
              <button className="sa2-btn sa2-btn-primary" onClick={saveEdit} disabled={saving}>
                <Save size={13}/> {saving?'Sauvegarde…':'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
