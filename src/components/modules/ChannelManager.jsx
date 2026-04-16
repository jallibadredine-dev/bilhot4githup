import React, { useState } from 'react';
import { 
  Database, Globe, Link as LinkIcon, Settings, Server, CheckCircle2, 
  ArrowRight, RefreshCcw, Home, Plus, Calendar, Activity,
  MessageSquare, Star, LayoutDashboard, Share2, ShieldCheck, 
  AlertCircle, ChevronRight, DownloadCloud
} from 'lucide-react';

const OTAS = [
  { id: 'airbnb', name: 'Airbnb', color: 'bg-rose-500', icon: 'A', desc: 'Locations Courte Durée', sync: ['Dispos', 'Tarifs', 'Messages', 'Avis'] },
  { id: 'booking', name: 'Booking.com', color: 'bg-blue-900', icon: 'B', desc: 'Standard Hôtelier Mondial', sync: ['Dispos', 'Tarifs', 'Messages'] },
  { id: 'expedia', name: 'Expedia', color: 'bg-yellow-500', icon: 'E', desc: 'Vols & Hébergements', sync: ['Dispos', 'Tarifs'] },
  { id: 'tripadvisor', name: 'TripAdvisor', color: 'bg-green-600', icon: 'T', desc: 'Avis & Réservations', sync: ['Dispos', 'Avis'] },
  { id: 'vrbo', name: 'Vrbo / Abritel', color: 'bg-indigo-900', icon: 'V', desc: 'Villas & Grandes Familles', sync: ['Dispos', 'Tarifs', 'Messages'] },
];

const MOCK_LISTINGS = [
  { id: 'l1', name: 'Appartement Vue Mer #102', otas: ['airbnb', 'booking'], type: 'Appartement', status: 'Sync', price: '120€' },
  { id: 'l2', name: 'Villa Royale Palmeraie', otas: ['booking', 'expedia', 'vrbo'], type: 'Villa', status: 'Sync', price: '450€' },
  { id: 'l3', name: 'Suite Medina Authentique', otas: ['airbnb', 'tripadvisor'], type: 'Suite', status: 'Sync', price: '90€' },
];

const ChannelManager = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'channels', 'api-hub'
  const [provider, setProvider] = useState('channex'); // 'beds24' | 'siteminder' | 'channex'
  const [hubConnected, setHubConnected] = useState(false);
  
  // OTA Flow State
  const [loadingOTA, setLoadingOTA] = useState(null);
  const [connectedOTAs, setConnectedOTAs] = useState(['airbnb', 'booking']); // Some pre-connected internally for demonstration
  
  const handleHubConnect = () => {
    setHubConnected(true);
    setActiveTab('channels');
  };

  const handleOTAConnect = (otaId) => {
    setLoadingOTA(otaId);
    setTimeout(() => {
      setConnectedOTAs([...connectedOTAs, otaId]);
      setLoadingOTA(null);
    }, 1500);
  };

  const renderTabNav = () => (
    <div className="flex space-x-8 mb-8 border-b border-slate-200">
      <button 
        onClick={() => setActiveTab('overview')}
        className={`pb-4 text-sm font-bold tracking-wide transition-all ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className="flex items-center gap-2"><LayoutDashboard size={16}/> Vue d'ensemble</div>
      </button>
      <button 
        onClick={() => setActiveTab('channels')}
        className={`pb-4 text-sm font-bold tracking-wide transition-all ${activeTab === 'channels' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className="flex items-center gap-2"><Share2 size={16}/> Canaux & OTAs</div>
      </button>
      <button 
        onClick={() => setActiveTab('api-hub')}
        className={`pb-4 text-sm font-bold tracking-wide transition-all ${activeTab === 'api-hub' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className="flex items-center gap-2"><Server size={16}/> Hub API Moteur</div>
      </button>
    </div>
  );

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto font-sans bg-[#F8FAFC] min-h-[calc(100vh-80px)]">
      
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight">Channel Manager Sync</h1>
           <p className="text-lg font-medium text-slate-500 mt-2">Centralisez vos réservations, messages et avis depuis une plateforme unique.</p>
        </div>
        {!hubConnected ? (
           <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
             <AlertCircle size={16} className="text-amber-500"/> Hub Moteur Non Connecté
           </div>
        ) : (
           <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-sm">
             <ShieldCheck size={16} className="text-emerald-500"/> Synchronisation Active ({provider.toUpperCase()})
           </div>
        )}
      </div>

      {renderTabNav()}

      {/* --- TAB: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Share2 size={24}/></div>
              <div>
                <div className="text-3xl font-black text-slate-800">{connectedOTAs.length}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mt-1">Canaux Actifs</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Home size={24}/></div>
              <div>
                <div className="text-3xl font-black text-slate-800">{MOCK_LISTINGS.length}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mt-1">Logements Sync.</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center"><RefreshCcw size={24}/></div>
              <div>
                <div className="text-3xl font-black text-slate-800">100%</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mt-1">Santé API</div>
              </div>
            </div>
          </div>

          {/* Connected Listings */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                 <h2 className="text-xl font-black text-slate-800">Propriétés Déployées</h2>
                 <p className="text-sm font-medium text-slate-500">Logements actuellement mappés vers vos OTAs.</p>
               </div>
               <button className="bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 flex items-center gap-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                 <DownloadCloud size={16}/> Importer Logements
               </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider">Logement</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider">Distribution</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider">Prix Base</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider text-right">Statut Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_LISTINGS.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition cursor-pointer group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Home size={16}/></div>
                        <div>
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-xs font-bold text-slate-400">{item.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex -space-x-2">
                         {item.otas.map(ota => {
                           const otaInfo = OTAS.find(o => o.id === ota);
                           return otaInfo ? (
                             <div key={ota} className={`w-8 h-8 rounded-full ${otaInfo.color} text-white flex items-center justify-center text-xs font-black border-2 border-white`} title={otaInfo.name}>
                               {otaInfo.icon}
                             </div>
                           ) : null;
                         })}
                      </div>
                    </td>
                    <td className="p-5 font-black text-slate-800">{item.price} <span className="text-xs font-medium text-slate-400">/ nuit</span></td>
                    <td className="p-5 text-right">
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Connecté</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB: CHANNELS & OTAs --- */}
      {activeTab === 'channels' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {!hubConnected && (
             <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
               <div className="flex items-center gap-4">
                 <Server size={32} className="text-indigo-600"/>
                 <div>
                   <h3 className="font-bold text-indigo-900 text-lg">Moteur Hub non configuré</h3>
                   <p className="text-indigo-700 font-medium text-sm">Veuillez connecter votre fournisseur (Channex, Beds24, etc.) pour interagir avec les OTAs.</p>
                 </div>
               </div>
               <button onClick={() => setActiveTab('api-hub')} className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl text-sm shadow-md hover:bg-indigo-700">Configurer Hub</button>
             </div>
           )}

           <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <h2 className="text-2xl font-black text-slate-800">Catalogue des Canaux</h2>
               <p className="text-slate-500 font-medium mt-1">Connectez les OTAs pour contrôler tarifs, dispos, messages et avis depuis HosFlow.</p>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {OTAS.map(ota => {
               const isConnected = connectedOTAs.includes(ota.id);
               const isLoading = loadingOTA === ota.id;
               
               return (
                 <div key={ota.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition relative flex flex-col md:flex-row items-start md:items-center gap-6 group">
                   
                   <div className={`shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center font-black text-4xl text-white shadow-lg ${ota.color}`}>
                     {ota.icon}
                   </div>

                   <div className="flex-1">
                     <div className="flex items-center justify-between mb-1">
                       <h4 className="font-extrabold text-slate-800 text-xl">{ota.name}</h4>
                       {isConnected && (
                         <span className="bg-emerald-100 text-emerald-700 text-[10px] uppercase font-black px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
                           <CheckCircle2 size={12}/> Actif
                         </span>
                       )}
                     </div>
                     <p className="text-sm font-medium text-slate-500 mb-3">{ota.desc}</p>
                     
                     <div className="flex flex-wrap gap-2 mb-4">
                       {ota.sync.map(s => (
                         <span key={s} className="bg-slate-50 text-slate-500 text-xs font-bold px-2 py-1 rounded-md border border-slate-100">{s}</span>
                       ))}
                     </div>

                     <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                       {!isConnected ? (
                          <button 
                            disabled={!hubConnected || isLoading}
                            onClick={() => handleOTAConnect(ota.id)} 
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${!hubConnected ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#1E293B] text-white hover:bg-black shadow-md'}`}
                          >
                             {isLoading ? <RefreshCcw size={16} className="animate-spin"/> : <LinkIcon size={16}/>}
                             {isLoading ? 'Liaison...' : 'Connecter Canal'}
                          </button>
                       ) : (
                          <>
                            <button className="bg-white border border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm">
                              <Settings size={16}/> Configurer
                            </button>
                            {/* Seamless integrations with SaaS tools */}
                            {ota.sync.includes('Messages') && (
                              <button className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 border border-blue-100">
                                <MessageSquare size={16}/> Inbox
                              </button>
                            )}
                            {ota.sync.includes('Avis') && (
                              <button className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 border border-amber-100">
                                <Star size={16}/> Avis
                              </button>
                            )}
                          </>
                       )}
                     </div>
                   </div>
                 </div>
               )
             })}
           </div>
        </div>
      )}

      {/* --- TAB: API HUB --- */}
      {activeTab === 'api-hub' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-800 mb-4">Le Moteur de Distribution</h2>
            <p className="text-lg text-slate-500 font-medium">Choisissez un moteur Channel Manager (Hub API) pour propulser vos disponibilités vers le monde entier.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Channex */}
            <div onClick={() => setProvider('channex')} className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 relative ${provider === 'channex' ? 'border-indigo-600 bg-white shadow-2xl scale-[1.02] ring-4 ring-indigo-50/50' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}`}>
              {provider === 'channex' && <div className="absolute top-6 right-6 text-indigo-600"><CheckCircle2 size={28} /></div>}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-sm ${provider === 'channex' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                <Activity size={32} />
              </div>
              <h3 className="font-extrabold text-2xl text-slate-800">Channex.io</h3>
              <div className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2 py-1 inline-block rounded mb-3">Recommandé</div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Plateforme OpenAPI nouvelle génération. Synchronisation ultra-rapide et écosystème ouvert idéal pour les SaaS et agences.</p>
            </div>

            {/* Beds24 */}
            <div onClick={() => setProvider('beds24')} className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 relative ${provider === 'beds24' ? 'border-indigo-600 bg-white shadow-2xl scale-[1.02] ring-4 ring-indigo-50/50' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}`}>
              {provider === 'beds24' && <div className="absolute top-6 right-6 text-indigo-600"><CheckCircle2 size={28} /></div>}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-sm ${provider === 'beds24' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                <Database size={32} />
              </div>
              <h3 className="font-extrabold text-2xl text-slate-800">Beds24 Core</h3>
              <div className="h-6 mb-3"></div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Solution API V2 optimisée. Idéale pour la gestion très granulaire, les règles tarifaires complexes et les locations courtes durées.</p>
            </div>

            {/* SiteMinder */}
            <div onClick={() => setProvider('siteminder')} className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 relative ${provider === 'siteminder' ? 'border-indigo-600 bg-white shadow-2xl scale-[1.02] ring-4 ring-indigo-50/50' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}`}>
              {provider === 'siteminder' && <div className="absolute top-6 right-6 text-indigo-600"><CheckCircle2 size={28} /></div>}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors shadow-sm ${provider === 'siteminder' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                <Globe size={32} />
              </div>
              <h3 className="font-extrabold text-2xl text-slate-800">SiteMinder</h3>
              <div className="h-6 mb-3"></div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">Standard hôtelier mondial. Conçu pour le gros volume, l'importation massive et structurée pour les Hôtels et Riads.</p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden max-w-4xl mx-auto">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
            
            <div className="flex items-center space-x-4 mb-10 relative z-10">
              <div className="p-3 bg-indigo-50 rounded-xl"><Settings className="text-indigo-600" size={24} /></div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Configuration <span className="text-indigo-600">{provider === 'channex' ? 'Channex.io' : provider === 'beds24' ? 'Beds24' : 'SiteMinder'}</span></h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Liaison Sécurisée OAuth / Token</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider ml-1">
                  {provider === 'channex' ? 'User API Token (Channex)' : provider === 'beds24' ? 'Clé API / Invite Token' : 'Clé X-API-Key'}
                </label>
                <input type="password" placeholder="••••••••••••••••" className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all bg-slate-50 font-medium text-slate-800"/>
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider ml-1">
                  {provider === 'channex' ? 'Group / Property ID' : provider === 'beds24' ? 'Account Name ID' : 'Hotel Code (ID)'}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Server size={20} /></div>
                  <input type="text" placeholder={provider === 'channex' ? "UUID-XXXX-XXXX" : "CODE-123"} className="w-full p-4 pl-12 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all bg-slate-50 font-medium text-slate-800"/>
                </div>
              </div>
            </div>

            <div className="mt-10 relative z-10 flex items-center gap-4">
              <button 
                onClick={handleHubConnect}
                className="bg-[#1E293B] hover:bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 inline-flex items-center gap-3 text-sm tracking-wide uppercase"
              >
                <Server size={18} /><span>{hubConnected ? 'Mettre à jour la connexion' : 'Connecter le Hub Moteur'}</span>
              </button>
              
              {hubConnected && (
                 <div className="text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-200 font-bold text-sm tracking-wide flex items-center gap-2">
                   <ShieldCheck size={18}/> Hub Actif
                 </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default ChannelManager;
