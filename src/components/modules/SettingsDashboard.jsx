import React, { useState } from 'react';
import { Building2, CreditCard, Users, Globe, ShieldCheck, Check, Save, Camera, Lock, Home, RefreshCw } from 'lucide-react';
import './SettingsDashboard.css';

const SettingsDashboard = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="settings-container-unique animate-in fade-in duration-500 hide-scrollbar">
      
      {/* HERO SECTION */}
      <div className="settings-hero">
         <h1>Paramètres Système</h1>
         <p>Gérez vos configurations essentielles, la facturation et les accès à votre environnement HosFlow.</p>
      </div>

      {/* FLOATING NAV PILL */}
      <div className="floating-nav">
         <div className="floating-nav-pill">
            <button className="nav-pill-btn" onClick={() => scrollToSection('property')}><Building2 size={16}/> Établissement</button>
            <button className="nav-pill-btn" onClick={() => scrollToSection('team')}><Users size={16}/> Équipe</button>
            <button className="nav-pill-btn" onClick={() => scrollToSection('properties')}><Home size={16}/> Propriétés & Prix</button>
            <button className="nav-pill-btn" onClick={() => scrollToSection('finance')}><CreditCard size={16}/> Finances</button>
            <button className="nav-pill-btn" onClick={() => scrollToSection('api')}><Globe size={16}/> Intégrations</button>
            <button className="nav-pill-btn" onClick={() => scrollToSection('security')}><ShieldCheck size={16}/> Sécurité</button>
         </div>
      </div>

      <div className="settings-blocks">
         
         {/* BLOCK 1: PROPERTY */}
         <div id="property" className="settings-block-card">
            <div className="block-header">
               <div className="block-icon-wrapper text-indigo-600"><Building2 size={32} /></div>
               <div>
                  <h2>Établissement & Marque</h2>
                  <p>Configurez l'identité visuelle de votre moteur de réservation et vos contacts.</p>
               </div>
            </div>
            
            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Informations Générales</h3>
                  <p>Le nom et l'adresse email principale qui seront affichés à vos clients.</p>
               </div>
               <div className="bento-input-group">
                  <input type="text" defaultValue="Villa Océan Atlantique" className="bento-input" />
                  <input type="email" defaultValue="direction@ocean-atlantique.ma" className="bento-input" />
               </div>
            </div>

            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Identité Visuelle</h3>
                  <p>Votre logo officiel et la couleur d'accentuation utilisée sur les factures et emails.</p>
               </div>
               <div className="bento-input-group !flex-row items-center gap-4">
                  <div className="bento-upload-box w-28 h-28">
                     <Camera size={24} className="mb-2 text-indigo-400" />
                     <span className="text-[10px] font-bold uppercase tracking-wider">Uploader</span>
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3">
                        <input type="color" defaultValue="#0f172a" className="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 shadow-sm" />
                        <input type="text" defaultValue="#0f172a" className="bento-input font-mono w-32" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Domaine (White-label)</h3>
                  <p>Utilisez votre propre nom de domaine pour le moteur de réservation direct.</p>
               </div>
               <div className="bento-input-group">
                  <input type="text" defaultValue="reservation.ocean-atlantique.ma" className="bento-input" />
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full mt-2">Connecté : CNAME vérifié</span>
               </div>
            </div>
         </div>

         {/* BLOCK 2: PROPERTIES & OTA PRICING */}
         <div id="properties" className="settings-block-card">
            <div className="block-header">
               <div className="block-icon-wrapper text-rose-600"><Home size={32} /></div>
               <div>
                  <h2>Propriétés & Prix OTA</h2>
                  <p>Gérez la synchronisation de vos annonces et les majorations tarifaires.</p>
               </div>
            </div>
            
            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Noms des propriétés</h3>
                  <p>Ceci réinitialisera le nom de toutes les propriétés HosFlow pour utiliser leur nom officiel sur Airbnb/Vrbo.</p>
               </div>
               <div className="bento-input-group !flex-row items-center">
                  <button className="bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold py-2 px-4 rounded-xl text-sm transition shadow-sm w-fit flex items-center gap-2"><RefreshCw size={16}/> Réinitialiser les noms</button>
               </div>
            </div>

            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Plateforme Principale</h3>
                  <p>Pour les propriétés sur plusieurs OTA, détermine quelle plateforme est la source prioritaire (Lead platform).</p>
               </div>
               <div className="bento-input-group">
                  <div className="flex gap-4 p-4 border border-slate-200 bg-slate-50 rounded-2xl">
                     <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                        <input type="radio" name="lead-platform" defaultChecked className="w-4 h-4 text-indigo-600" /> Airbnb
                     </label>
                     <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                        <input type="radio" name="lead-platform" className="w-4 h-4 text-indigo-600" /> Vrbo
                     </label>
                     <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer">
                        <input type="radio" name="lead-platform" className="w-4 h-4 text-indigo-600" /> Booking.com
                     </label>
                  </div>
               </div>
            </div>

            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Majorations (Markup Rates)</h3>
                  <p>Définissez le taux de majoration pour chaque OTA. Nous utiliserons ce taux pour calculer le prix final envoyé depuis le calendrier.</p>
               </div>
               <div className="bento-input-group">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center justify-between p-3 border border-slate-200 bg-white rounded-xl shadow-sm">
                        <div className="text-sm font-bold text-slate-800">Airbnb</div>
                        <div className="flex items-center gap-2"><input type="number" defaultValue="15" className="bento-input !w-20 !py-1 !px-2 text-center" /> %</div>
                     </div>
                     <div className="flex items-center justify-between p-3 border border-slate-200 bg-white rounded-xl shadow-sm">
                        <div className="text-sm font-bold text-slate-800">Booking.com</div>
                        <div className="flex items-center gap-2"><input type="number" defaultValue="18" className="bento-input !w-20 !py-1 !px-2 text-center" /> %</div>
                     </div>
                     <div className="flex items-center justify-between p-3 border border-slate-200 bg-white rounded-xl shadow-sm">
                        <div className="text-sm font-bold text-slate-800">Vrbo</div>
                        <div className="flex items-center gap-2"><input type="number" defaultValue="12" className="bento-input !w-20 !py-1 !px-2 text-center" /> %</div>
                     </div>
                     <div className="flex items-center justify-between p-3 border border-slate-200 bg-white rounded-xl shadow-sm">
                        <div className="text-sm font-bold text-slate-800">Agoda</div>
                        <div className="flex items-center gap-2"><input type="number" defaultValue="20" className="bento-input !w-20 !py-1 !px-2 text-center" /> %</div>
                     </div>
                     <div className="flex items-center justify-between p-3 border border-slate-200 bg-indigo-50 border-indigo-100 rounded-xl shadow-sm col-span-2">
                        <div className="text-sm font-bold text-indigo-900 flex items-center gap-2">Réservation Directe (Moteur)</div>
                        <div className="flex items-center gap-2"><input type="number" defaultValue="0" className="bento-input !w-20 !py-1 !px-2 text-center border-indigo-200" /> %</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* BLOCK 3: TEAM */}
         <div id="team" className="settings-block-card">
            <div className="block-header">
               <div className="block-icon-wrapper text-blue-600"><Users size={32} /></div>
               <div>
                  <h2>Opérations & Équipe</h2>
                  <p>Gérez les accès de votre personnel et les préférences d'interface.</p>
               </div>
            </div>
            
            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Page d'accueil par défaut</h3>
                  <p>Choisissez l'écran affiché lors de la connexion au PMS.</p>
               </div>
               <div className="bento-input-group">
                  <select defaultValue="timeline" className="bento-input">
                     <option value="dashboard">Aperçu Global (Tableau de Bord)</option>
                     <option value="timeline">Calendrier des Réservations</option>
                     <option value="inbox">Boîte de réception Unifiée</option>
                  </select>
               </div>
            </div>

            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Membres de l'équipe</h3>
                  <p>Ajoutez du personnel et assignez-leur des rôles stricts.</p>
                  <button className="mt-4 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold py-2 px-4 rounded-xl text-sm transition shadow-sm w-fit">+ Inviter un membre</button>
               </div>
               <div className="bento-input-group">
                  {[
                     { name: 'Directeur Général', role: 'Super Admin', bg: 'bg-slate-800 text-white', initials: 'DG' },
                     { name: 'Mehdi Tazi', role: 'Réceptionniste', bg: 'bg-emerald-100 text-emerald-700', initials: 'MT' },
                  ].map((user, idx) => (
                     <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${user.bg}`}>{user.initials}</div>
                           <div>
                              <div className="font-bold text-slate-800 text-sm flex items-center gap-2">{user.name} <span className="w-2 h-2 rounded-full bg-emerald-500"></span></div>
                           </div>
                        </div>
                        <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">{user.role}</div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* BLOCK 3: FINANCE */}
         <div id="finance" className="settings-block-card">
            <div className="block-header">
               <div className="block-icon-wrapper text-emerald-600"><CreditCard size={32} /></div>
               <div>
                  <h2>Finances & Facturation</h2>
                  <p>Votre abonnement HosFlow et vos comptes de reversement bancaire.</p>
               </div>
            </div>
            
            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Abonnement HosFlow</h3>
                  <p>Détails de votre plan actuel.</p>
               </div>
               <div className="bento-input-group">
                  <div className="p-5 border-2 border-slate-900 bg-slate-900 rounded-2xl text-white">
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="font-black text-lg">Plan PRO</h3>
                        <span className="bg-emerald-500 text-emerald-950 text-xs font-bold px-2 py-1 rounded">Actif</span>
                     </div>
                     <p className="text-sm text-slate-300 mb-4">299 MAD / mois par propriété. Prochain prélèvement le 01 Mai.</p>
                     <button className="text-sm font-bold bg-white text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition w-full">Gérer la facturation</button>
                  </div>
               </div>
            </div>

            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Compte Bancaire (Payout)</h3>
                  <p>Ce compte sera utilisé pour vous virer les encaissements en ligne.</p>
               </div>
               <div className="bento-input-group">
                  <input type="text" defaultValue="MA59 007 012 0000001234567890" className="bento-input font-mono" placeholder="IBAN / RIB" />
                  <input type="text" defaultValue="BCMAMAMC" className="bento-input font-mono" placeholder="Code SWIFT/BIC" />
               </div>
            </div>
         </div>

         {/* BLOCK 4: API */}
         <div id="api" className="settings-block-card">
            <div className="block-header">
               <div className="block-icon-wrapper text-rose-500"><Globe size={32} /></div>
               <div>
                  <h2>Intégrations & API</h2>
                  <p>Connectez HosFlow à vos outils et services tiers préférés.</p>
               </div>
            </div>

            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Région & Devises</h3>
                  <p>Définit comment les prix et les dates sont formatés dans le PMS.</p>
               </div>
               <div className="bento-input-group flex-row gap-4">
                  <select defaultValue="MAD" className="bento-input flex-1">
                     <option value="EUR">Euro (€)</option>
                     <option value="USD">Dollar ($)</option>
                     <option value="MAD">Dirham (MAD)</option>
                  </select>
                  <select defaultValue="Africa/Casablanca" className="bento-input flex-1">
                     <option value="Europe/Paris">Paris (UTC+1)</option>
                     <option value="Africa/Casablanca">Casablanca (UTC+1)</option>
                  </select>
               </div>
            </div>
            
            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Plateforme de Paiement</h3>
                  <p>Acceptez les cartes de crédit en connectant votre compte Stripe.</p>
               </div>
               <div className="bento-input-group">
                  <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">S</div>
                           <h3 className="font-bold text-slate-800">Stripe Live</h3>
                        </div>
                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">Connecté</span>
                     </div>
                     <input type="password" defaultValue="sk_live_1234567890abcdef" className="bento-input text-sm" />
                  </div>
               </div>
            </div>

            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Channel Manager</h3>
                  <p>Synchronisez les calendriers avec Airbnb, Booking.com, etc.</p>
               </div>
               <div className="bento-input-group">
                  <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center font-black">CX</div>
                        <h3 className="font-bold text-slate-800">Channex.io</h3>
                     </div>
                     <button className="text-xs font-bold bg-slate-800 text-white px-4 py-2 rounded-xl hover:bg-slate-900">Connecter</button>
                  </div>
               </div>
            </div>
         </div>

         {/* BLOCK 5: SECURITY */}
         <div id="security" className="settings-block-card">
            <div className="block-header">
               <div className="block-icon-wrapper text-amber-500"><Lock size={32} /></div>
               <div>
                  <h2>Sécurité du Système</h2>
                  <p>Protégez vos données sensibles contre les accès non autorisés.</p>
               </div>
            </div>
            
            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Authentification 2FA</h3>
                  <p>Ajoutez une couche de sécurité via une application comme Google Authenticator.</p>
               </div>
               <div className="bento-input-group">
                  <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl">
                     <h3 className="font-bold text-amber-900 text-sm mb-2">Non configuré</h3>
                     <p className="text-xs text-amber-700 mb-4 leading-relaxed">Nous recommandons fortement l'activation du 2FA pour tous les comptes administrateurs afin d'éviter les fuites de données clients.</p>
                     <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition w-fit">Activer 2FA</button>
                  </div>
               </div>
            </div>

            <div className="bento-form-row">
               <div className="bento-label-group">
                  <h3>Mot de passe</h3>
                  <p>Mettez à jour régulièrement votre mot de passe d'accès.</p>
               </div>
               <div className="bento-input-group">
                  <input type="password" placeholder="Mot de passe actuel" className="bento-input" />
                  <input type="password" placeholder="Nouveau mot de passe" className="bento-input" />
               </div>
            </div>
         </div>

      </div>

      {/* FLOATING SAVE BUTTON */}
      <button 
         className={`save-fab ${saved ? 'saved' : ''}`}
         onClick={handleSave}
         disabled={isSaving}
      >
         {isSaving ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sauvegarde...</>
         ) : saved ? (
            <><Check size={20} /> Terminé</>
         ) : (
            <><Save size={20} /> Enregistrer les modifications</>
         )}
      </button>

    </div>
  );
};

export default SettingsDashboard;

