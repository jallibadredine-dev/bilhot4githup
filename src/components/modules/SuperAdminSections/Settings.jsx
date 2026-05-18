import React, { useState } from 'react';
import { Settings, Shield, Mail, Bell, Server, Wrench, Save, RefreshCw, AlertTriangle, CheckCircle, ToggleLeft, ToggleRight, Trash2, Download, Upload, Globe, Lock } from 'lucide-react';
import { useAppStore } from '../../../store/appStore';

const TABS_DEF = [
  {id:'general',  lbl:'Général',      Icon:Settings},
  {id:'security', lbl:'Sécurité',     Icon:Shield},
  {id:'email',    lbl:'Emails',       Icon:Mail},
  {id:'notifs',   lbl:'Notifications',Icon:Bell},
  {id:'system',   lbl:'Système',      Icon:Server},
];

const Toggle = ({on,onToggle}) => (
  <button onClick={onToggle} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
    {on?<ToggleRight size={22} style={{color:'#10B981'}}/>:<ToggleLeft size={22} style={{color:'#94A3B8'}}/>}
  </button>
);

export default function SystemSettings() {
  // Centralized settings store — persisted via realtime and mergeSetting
  const storeSettings  = useAppStore(s => s.settings);
  const mergeSetting   = useAppStore(s => s.mergeSetting);

  const [tab,setTab]=useState('general');
  const [saved,setSaved]=useState(false);

  // Initialize from store with sensible defaults
  const [general,setGeneral]=useState(() => storeSettings.general || {name:'Hova PMS',url:'https://app.hova.io',supportEmail:'support@hova.io',timezone:'Africa/Casablanca',lang:'fr',currency:'MAD'});
  const [security,setSecurity]=useState(() => storeSettings.security || {twofa:false,sessionTimeout:30,maxLoginAttempts:5,ipWhitelist:false,auditLogs:true});
  const [email,setEmail]=useState(() => storeSettings.email || {provider:'emailjs',fromName:'Hova PMS',fromEmail:'noreply@hova.io',smtpHost:'',smtpPort:587,smtpUser:'',smtpPass:''});
  const [notifs,setNotifs]=useState(() => storeSettings.notifs || {newClient:true,payment:true,apiError:true,systemAlert:true,weeklyReport:false,slackWebhook:''});

  const save=async()=>{
    // Persist all settings sections to the centralized store
    mergeSetting('general',  general);
    mergeSetting('security', security);
    mergeSetting('email',    email);
    mergeSetting('notifs',   notifs);
    setSaved(true);
    await new Promise(r=>setTimeout(r,700));
    setSaved(false);
  };

  const Row=({label,sub,children})=>(
    <div className="sa2-settings-row">
      <div><div className="sa2-settings-label">{label}</div>{sub&&<div className="sa2-settings-sub">{sub}</div>}</div>
      <div className="sa2-settings-control">{children}</div>
    </div>
  );

  return (
    <div className="sa2-section">
      <div className="sa2-section-header">
        <div><h2 className="sa2-section-title">Paramètres Système</h2><p className="sa2-section-desc">Configuration globale de la plateforme Hova</p></div>
        <button className="sa2-btn sa2-btn-primary" onClick={save} disabled={saved}>
          <Save size={13}/> {saved?'Sauvegardé ✓':'Sauvegarder'}
        </button>
      </div>

      <div className="sa2-tabs">
        {TABS_DEF.map(t=>(
          <button key={t.id} className={`sa2-tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
            <t.Icon size={13}/> {t.lbl}
          </button>
        ))}
      </div>

      <div className="sa2-tab-content">

        {tab==='general'&&(
          <div className="sa2-settings-block">
            <h3 className="sa2-subsection-title">Informations de la plateforme</h3>
            <div className="sa2-form-row-2col">
              <div className="sa2-form-row"><label>Nom de la plateforme</label><input className="sa2-input" value={general.name} onChange={e=>setGeneral(p=>({...p,name:e.target.value}))}/></div>
              <div className="sa2-form-row"><label>URL du site</label><input className="sa2-input" value={general.url} onChange={e=>setGeneral(p=>({...p,url:e.target.value}))}/></div>
            </div>
            <div className="sa2-form-row-2col">
              <div className="sa2-form-row"><label>Email de support</label><input className="sa2-input" value={general.supportEmail} onChange={e=>setGeneral(p=>({...p,supportEmail:e.target.value}))}/></div>
              <div className="sa2-form-row"><label>Fuseau horaire</label>
                <select className="sa2-input" value={general.timezone} onChange={e=>setGeneral(p=>({...p,timezone:e.target.value}))}>
                  <option>Africa/Casablanca</option><option>Europe/Paris</option><option>UTC</option>
                </select>
              </div>
            </div>
            <div className="sa2-form-row-2col">
              <div className="sa2-form-row"><label>Langue par défaut</label>
                <select className="sa2-input" value={general.lang} onChange={e=>setGeneral(p=>({...p,lang:e.target.value}))}>
                  <option value="fr">Français</option><option value="en">English</option><option value="ar">العربية</option>
                </select>
              </div>
              <div className="sa2-form-row"><label>Devise</label>
                <select className="sa2-input" value={general.currency} onChange={e=>setGeneral(p=>({...p,currency:e.target.value}))}>
                  <option>MAD</option><option>EUR</option><option>USD</option>
                </select>
              </div>
            </div>
            <div className="sa2-info-box"><Globe size={14}/> Version de la plateforme : <strong>Hova PMS v2.0.0</strong> · Build 2026.05.18</div>
          </div>
        )}

        {tab==='security'&&(
          <div className="sa2-settings-block">
            <h3 className="sa2-subsection-title">Sécurité & Accès</h3>
            <Row label="Authentification 2FA" sub="Exiger 2FA pour tous les comptes admin">
              <Toggle on={security.twofa} onToggle={()=>setSecurity(p=>({...p,twofa:!p.twofa}))}/>
            </Row>
            <Row label="Timeout de session" sub="Durée d'inactivité avant déconnexion automatique">
              <select className="sa2-input" style={{width:120}} value={security.sessionTimeout} onChange={e=>setSecurity(p=>({...p,sessionTimeout:Number(e.target.value)}))}>
                <option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>1 heure</option><option value={240}>4 heures</option>
              </select>
            </Row>
            <Row label="Tentatives de connexion max" sub="Blocage après N tentatives échouées">
              <select className="sa2-input" style={{width:80}} value={security.maxLoginAttempts} onChange={e=>setSecurity(p=>({...p,maxLoginAttempts:Number(e.target.value)}))}>
                <option value={3}>3</option><option value={5}>5</option><option value={10}>10</option>
              </select>
            </Row>
            <Row label="Whitelist IP" sub="Restreindre l'accès à des IPs autorisées">
              <Toggle on={security.ipWhitelist} onToggle={()=>setSecurity(p=>({...p,ipWhitelist:!p.ipWhitelist}))}/>
            </Row>
            <Row label="Journal d'audit" sub="Enregistrer toutes les actions admin">
              <Toggle on={security.auditLogs} onToggle={()=>setSecurity(p=>({...p,auditLogs:!p.auditLogs}))}/>
            </Row>
            <div className="sa2-info-box" style={{background:'#EF444412',border:'1px solid #EF444430',color:'#EF4444'}}>
              <AlertTriangle size={13}/> La modification des paramètres de sécurité affecte tous les utilisateurs de la plateforme.
            </div>
          </div>
        )}

        {tab==='email'&&(
          <div className="sa2-settings-block">
            <h3 className="sa2-subsection-title">Configuration Email</h3>
            <Row label="Fournisseur" sub="Service d'envoi d'emails">
              <select className="sa2-input" style={{width:160}} value={email.provider} onChange={e=>setEmail(p=>({...p,provider:e.target.value}))}>
                <option value="emailjs">EmailJS</option><option value="smtp">SMTP Custom</option><option value="sendgrid">SendGrid</option><option value="mailgun">Mailgun</option>
              </select>
            </Row>
            <div className="sa2-form-row-2col">
              <div className="sa2-form-row"><label>Nom expéditeur</label><input className="sa2-input" value={email.fromName} onChange={e=>setEmail(p=>({...p,fromName:e.target.value}))}/></div>
              <div className="sa2-form-row"><label>Email expéditeur</label><input className="sa2-input" value={email.fromEmail} onChange={e=>setEmail(p=>({...p,fromEmail:e.target.value}))}/></div>
            </div>
            {email.provider==='smtp'&&(
              <div className="sa2-form-row-2col">
                <div className="sa2-form-row"><label>SMTP Host</label><input className="sa2-input" value={email.smtpHost} onChange={e=>setEmail(p=>({...p,smtpHost:e.target.value}))}/></div>
                <div className="sa2-form-row"><label>SMTP Port</label><input type="number" className="sa2-input" value={email.smtpPort} onChange={e=>setEmail(p=>({...p,smtpPort:Number(e.target.value)}))}/></div>
              </div>
            )}
            <button className="sa2-btn sa2-btn-ghost sa2-btn-sm" style={{marginTop:8}}><Mail size={12}/> Envoyer un email de test</button>
          </div>
        )}

        {tab==='notifs'&&(
          <div className="sa2-settings-block">
            <h3 className="sa2-subsection-title">Notifications Admin</h3>
            <Row label="Nouveau client inscrit"  sub="Email à chaque nouvel enregistrement"><Toggle on={notifs.newClient}   onToggle={()=>setNotifs(p=>({...p,newClient:!p.newClient}))}/></Row>
            <Row label="Paiement reçu"           sub="Email à chaque transaction Stripe">  <Toggle on={notifs.payment}     onToggle={()=>setNotifs(p=>({...p,payment:!p.payment}))}/></Row>
            <Row label="Erreur API critique"     sub="Alerte si une API dépasse 5% d'erreurs"><Toggle on={notifs.apiError} onToggle={()=>setNotifs(p=>({...p,apiError:!p.apiError}))}/></Row>
            <Row label="Alerte système"          sub="Alertes de performance et de sécurité"><Toggle on={notifs.systemAlert} onToggle={()=>setNotifs(p=>({...p,systemAlert:!p.systemAlert}))}/></Row>
            <Row label="Rapport hebdomadaire"    sub="Récapitulatif chaque lundi matin">    <Toggle on={notifs.weeklyReport} onToggle={()=>setNotifs(p=>({...p,weeklyReport:!p.weeklyReport}))}/></Row>
            <div className="sa2-form-row" style={{marginTop:16}}><label>Webhook Slack (optionnel)</label><input className="sa2-input" placeholder="https://hooks.slack.com/…" value={notifs.slackWebhook} onChange={e=>setNotifs(p=>({...p,slackWebhook:e.target.value}))}/></div>
          </div>
        )}

        {tab==='system'&&(
          <div className="sa2-settings-block">
            <h3 className="sa2-subsection-title">Maintenance & Outils</h3>
            <div className="sa2-maintenance-grid">
              <div className="sa2-maint-card">
                <Download size={18} style={{color:'#5B5BA6'}}/>
                <div><strong>Backup Base de Données</strong><span>Dernier backup : aujourd'hui 03:00</span></div>
                <button className="sa2-btn sa2-btn-ghost sa2-btn-sm"><Download size={12}/> Télécharger</button>
              </div>
              <div className="sa2-maint-card">
                <RefreshCw size={18} style={{color:'#3B82F6'}}/>
                <div><strong>Vider le cache</strong><span>Cache serveur et CDN</span></div>
                <button className="sa2-btn sa2-btn-ghost sa2-btn-sm"><RefreshCw size={12}/> Vider</button>
              </div>
              <div className="sa2-maint-card">
                <Upload size={18} style={{color:'#10B981'}}/>
                <div><strong>Restaurer un backup</strong><span>Importer une sauvegarde</span></div>
                <button className="sa2-btn sa2-btn-ghost sa2-btn-sm"><Upload size={12}/> Importer</button>
              </div>
              <div className="sa2-maint-card">
                <Wrench size={18} style={{color:'#F59E0B'}}/>
                <div><strong>Mode Maintenance</strong><span>Afficher une page de maintenance</span></div>
                <Toggle on={false} onToggle={()=>{}}/>
              </div>
              <div className="sa2-maint-card" style={{borderColor:'#EF444430'}}>
                <Trash2 size={18} style={{color:'#EF4444'}}/>
                <div><strong>Nettoyer les logs anciens</strong><span>Supprimer les logs de plus de 90 jours</span></div>
                <button className="sa2-btn sa2-btn-ghost sa2-btn-sm" style={{color:'#EF4444'}}><Trash2 size={12}/> Nettoyer</button>
              </div>
              <div className="sa2-maint-card">
                <Lock size={18} style={{color:'#8B5CF6'}}/>
                <div><strong>Réinitialiser les sessions</strong><span>Déconnecter tous les utilisateurs</span></div>
                <button className="sa2-btn sa2-btn-ghost sa2-btn-sm"><Lock size={12}/> Réinitialiser</button>
              </div>
            </div>
            <div className="sa2-info-box"><CheckCircle size={13} style={{color:'#10B981'}}/> Système opérationnel · Version Hova v2.0.0 · Node.js 20.x · Supabase connecté</div>
          </div>
        )}

      </div>
    </div>
  );
}
