import React, { useState } from 'react';
import { Layout, Type, Image, Megaphone, Target, Calendar, Plus, Edit3, Trash2, Eye, Save, Upload, Move, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, Video, Link2, Tag, Star } from 'lucide-react';

const SECS_DEF = [
  {id:'hero',       lbl:'Hero / Bannière principale', Icon:Layout,   on:true, ord:1},
  {id:'features',   lbl:'Fonctionnalités',            Icon:Star,     on:true, ord:2},
  {id:'how',        lbl:'Comment ça marche',          Icon:Target,   on:true, ord:3},
  {id:'pricing',    lbl:'Tarifs',                     Icon:Tag,      on:true, ord:4},
  {id:'testimony',  lbl:'Témoignages & Avis',         Icon:Star,     on:true, ord:5},
  {id:'cta',        lbl:'Appel à l\'action',          Icon:Megaphone,on:true, ord:6},
  {id:'footer',     lbl:'Pied de page',               Icon:Layout,   on:true, ord:7},
];
const BANNERS = [
  {id:1,title:'Offre Ramadan — 30% de réduction',type:'promotion',st:'active', from:'2026-03-01',to:'2026-04-15'},
  {id:2,title:'Nouveau: Gestion RFID disponible', type:'feature',  st:'active', from:'2026-05-01',to:'2026-06-30'},
  {id:3,title:'Webinaire PMS — 22 Mai 2026',      type:'event',    st:'draft',  from:'2026-05-18',to:'2026-05-22'},
];
const CAMPS = [
  {id:1,name:'Launch Summer 2026', type:'email',st:'scheduled',sent:0,   opens:0,  clicks:0},
  {id:2,name:'Onboarding Welcome', type:'email',st:'active',   sent:1240,opens:892,clicks:341},
  {id:3,name:'Upgrade to Gold',    type:'push', st:'active',   sent:340, opens:210,clicks:87},
];
const TABS = [{id:'structure',lbl:'Structure',Icon:Layout},{id:'hero',lbl:'Hero & Contenu',Icon:Type},{id:'banners',lbl:'Bannières',Icon:Megaphone},{id:'campaigns',lbl:'Campagnes',Icon:Target},{id:'media',lbl:'Médiathèque',Icon:Image}];

export default function CMSEditor() {
  const [tab,setTab]=useState('structure');
  const [secs,setSecs]=useState(SECS_DEF);
  const [saving,setSaving]=useState(false);
  const [hero,setHero]=useState({
    title:'Gérez vos propriétés\nen mode pilote automatique.',
    sub:'Le PMS nouvelle génération qui connecte vos canaux, vos serrures et vos clients.',
    cta1:'Essayer Hova Gratuitement',cta2:'Voir la démo',badge:'+2,500 établissements',
  });

  const save=async()=>{setSaving(true);await new Promise(r=>setTimeout(r,700));setSaving(false);};
  const toggle=id=>setSecs(s=>s.map(x=>x.id===id?{...x,on:!x.on}:x));
  const move=(id,dir)=>setSecs(s=>{
    const a=[...s].sort((a,b)=>a.ord-b.ord);
    const i=a.findIndex(x=>x.id===id);
    const j=i+dir;
    if(j>=0&&j<a.length){const tmp=a[j].ord;a[j].ord=a[i].ord;a[i].ord=tmp;}
    return [...a];
  });

  return (
    <div className="sa2-section">
      <div className="sa2-section-header">
        <div><h2 className="sa2-section-title">CMS — Site Web</h2><p className="sa2-section-desc">Contenu de la page publique, bannières et campagnes marketing</p></div>
        <div style={{display:'flex',gap:8}}>
          <button className="sa2-btn sa2-btn-ghost"><Eye size={13}/> Prévisualiser</button>
          <button className="sa2-btn sa2-btn-primary" onClick={save} disabled={saving}><Save size={13}/> {saving?'Sauvegarde…':'Publier'}</button>
        </div>
      </div>
      <div className="sa2-tabs">
        {TABS.map(t=><button key={t.id} className={`sa2-tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}><t.Icon size={12}/> {t.lbl}</button>)}
      </div>
      <div className="sa2-tab-content">

        {tab==='structure'&&(
          <div>
            <p className="sa2-hint">Activez ou réorganisez les sections de la page d'accueil.</p>
            <div className="sa2-cms-sections-list">
              {[...secs].sort((a,b)=>a.ord-b.ord).map((sec,i,arr)=>(
                <div key={sec.id} className={`sa2-cms-section-item${!sec.on?' inactive':''}`}>
                  <div className="sa2-cms-section-drag"><Move size={12}/></div>
                  <div className="sa2-cms-section-icon"><sec.Icon size={13}/></div>
                  <div className="sa2-cms-section-info"><strong>{sec.lbl}</strong><span>#{sec.ord}</span></div>
                  <div className="sa2-cms-section-controls">
                    <button className="sa2-icon-btn" disabled={i===0} onClick={()=>move(sec.id,-1)}><ChevronUp size={11}/></button>
                    <button className="sa2-icon-btn" disabled={i===arr.length-1} onClick={()=>move(sec.id,1)}><ChevronDown size={11}/></button>
                    <button className="sa2-icon-btn"><Edit3 size={11}/></button>
                    <button style={{background:'none',border:'none',cursor:'pointer',padding:0}} onClick={()=>toggle(sec.id)}>
                      {sec.on?<ToggleRight size={17} style={{color:'#10B981'}}/>:<ToggleLeft size={17} style={{color:'#94A3B8'}}/>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='hero'&&(
          <div className="sa2-cms-editor">
            <div className="sa2-cms-form">
              <h3 className="sa2-subsection-title">Contenu Hero</h3>
              <div className="sa2-form-row"><label>Titre principal</label><textarea className="sa2-input sa2-textarea" rows={3} value={hero.title} onChange={e=>setHero(p=>({...p,title:e.target.value}))}/></div>
              <div className="sa2-form-row"><label>Sous-titre</label><textarea className="sa2-input sa2-textarea" rows={2} value={hero.sub} onChange={e=>setHero(p=>({...p,sub:e.target.value}))}/></div>
              <div className="sa2-form-row-2col">
                <div className="sa2-form-row"><label>Bouton principal</label><input type="text" className="sa2-input" value={hero.cta1} onChange={e=>setHero(p=>({...p,cta1:e.target.value}))}/></div>
                <div className="sa2-form-row"><label>Bouton secondaire</label><input type="text" className="sa2-input" value={hero.cta2} onChange={e=>setHero(p=>({...p,cta2:e.target.value}))}/></div>
              </div>
              <div className="sa2-form-row"><label>Badge social proof</label><input type="text" className="sa2-input" value={hero.badge} onChange={e=>setHero(p=>({...p,badge:e.target.value}))}/></div>
              <div className="sa2-form-row"><label>Image de fond</label><div className="sa2-upload-zone"><Upload size={18}/><span>Glisser une image ou <strong>parcourir</strong></span><span style={{fontSize:'0.7rem',color:'var(--sa2-text-muted)'}}>PNG, JPG, WebP — max 5 MB</span></div></div>
            </div>
            <div className="sa2-cms-preview">
              <h3 className="sa2-subsection-title">Aperçu</h3>
              <div className="sa2-hero-preview">
                <div className="sa2-hero-preview-badge">⭐ {hero.badge}</div>
                <div className="sa2-hero-preview-title">{hero.title}</div>
                <div className="sa2-hero-preview-sub">{hero.sub}</div>
                <div className="sa2-hero-preview-ctas">
                  <span className="sa2-hero-btn-primary">{hero.cta1}</span>
                  <span className="sa2-hero-btn-ghost">{hero.cta2}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==='banners'&&(
          <div>
            <div className="sa2-toolbar"><div/><button className="sa2-btn sa2-btn-primary"><Plus size={13}/> Nouvelle bannière</button></div>
            <div className="sa2-banners-grid">
              {BANNERS.map(b=>(
                <div key={b.id} className="sa2-banner-card">
                  <div className="sa2-banner-type"><span className="sa2-tag">{b.type}</span><span style={{width:7,height:7,borderRadius:'50%',display:'inline-block',background:b.st==='active'?'#10B981':'#F59E0B',marginLeft:6}}/></div>
                  <div className="sa2-banner-title">{b.title}</div>
                  <div className="sa2-banner-dates"><Calendar size={10}/> {b.from} → {b.to}</div>
                  <div className="sa2-int-actions"><button className="sa2-icon-btn"><Edit3 size={11}/></button><button className="sa2-icon-btn"><Eye size={11}/></button><button className="sa2-icon-btn danger"><Trash2 size={11}/></button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='campaigns'&&(
          <div>
            <div className="sa2-toolbar"><div/><button className="sa2-btn sa2-btn-primary"><Plus size={13}/> Nouvelle campagne</button></div>
            <div className="sa2-table-wrap">
              <table className="sa2-table">
                <thead><tr><th>Campagne</th><th>Type</th><th>Statut</th><th>Envoyé</th><th>Ouvertures</th><th>Clics</th><th/></tr></thead>
                <tbody>
                  {CAMPS.map(c=>(
                    <tr key={c.id}>
                      <td><div className="sa2-cell-primary">{c.name}</div></td>
                      <td><span className="sa2-tag">{c.type}</span></td>
                      <td><span style={{color:c.st==='active'?'#10B981':c.st==='scheduled'?'#3B82F6':'#94A3B8',fontWeight:700,fontSize:'0.7rem',textTransform:'uppercase'}}>● {c.st}</span></td>
                      <td>{c.sent.toLocaleString()}</td>
                      <td>{c.sent>0?`${Math.round(c.opens/c.sent*100)}%`:'—'}</td>
                      <td>{c.sent>0?`${Math.round(c.clicks/c.sent*100)}%`:'—'}</td>
                      <td><div className="sa2-row-actions"><button className="sa2-icon-btn"><Eye size={11}/></button><button className="sa2-icon-btn"><Edit3 size={11}/></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='media'&&(
          <div>
            <div className="sa2-upload-zone" style={{marginBottom:18}}><Upload size={20}/><span>Glisser des fichiers ici</span><span style={{fontSize:'0.7rem',color:'var(--sa2-text-muted)'}}>Images, vidéos, PDF — max 50 MB</span></div>
            <div className="sa2-media-grid">
              {[{n:'hero-bg.jpg',t:'image',s:'2.4 MB'},{n:'hova-logo.png',t:'image',s:'124 KB'},{n:'demo.mp4',t:'video',s:'18 MB'}].map(m=>(
                <div key={m.n} className="sa2-media-card">
                  <div className="sa2-media-thumb">{m.t==='image'?<Image size={24} style={{color:'var(--sa2-text-muted)'}}/>:<Video size={24} style={{color:'var(--sa2-text-muted)'}}/>}</div>
                  <div className="sa2-media-info"><div className="sa2-media-name">{m.n}</div><div className="sa2-media-meta">{m.s}</div></div>
                  <div className="sa2-row-actions"><button className="sa2-icon-btn"><Eye size={11}/></button><button className="sa2-icon-btn"><Link2 size={11}/></button><button className="sa2-icon-btn danger"><Trash2 size={11}/></button></div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
