import React, { useState } from 'react';
import { Database, Globe, Link, Settings, Server, CheckCircle2, ArrowRight, RefreshCcw, Home, Plus, Calendar } from 'lucide-react';

const OTAS = [
  { id: 'airbnb', name: 'Airbnb', color: 'bg-rose-500', icon: 'A', desc: 'Locations Courte Durée.' },
  { id: 'booking', name: 'Booking.com', color: 'bg-blue-900', icon: 'B', desc: 'Standard Hôtelier Mondial.' },
  { id: 'expedia', name: 'Expedia', color: 'bg-yellow-500', icon: 'E', desc: 'Vols & Hébergements.' },
  { id: 'vrbo', name: 'Vrbo / Abritel', color: 'bg-indigo-900', icon: 'V', desc: 'Villas & Grandes Familles.' },
];

const MOCK_LISTINGS = [
  { id: 'l1', name: 'Appartement Vue Mer #102', ota: 'airbnb', type: 'Appartement', status: 'Sync', price: '120€' },
  { id: 'l2', name: 'Villa Royale Palmeraie', ota: 'booking', type: 'Villa', status: 'Sync', price: '450€' },
  { id: 'l3', name: 'Suite Medina Authentique', ota: 'airbnb', type: 'Suite', status: 'Sync', price: '90€' },
];

const ChannelManager = () => {
  const [provider, setProvider] = useState('beds24'); // 'beds24' | 'siteminder'
  const [step, setStep] = useState(1); // 1: Provider API, 2: OTA Connect & Listings
  
  // OTA Flow State
  const [loadingOTA, setLoadingOTA] = useState(null);
  const [connectedOTAs, setConnectedOTAs] = useState([]);
  const [listings, setListings] = useState([]);

  const handleProviderConnect = () => {
     setStep(2);
  };

  const handleOTAConnect = (otaId) => {
     setLoadingOTA(otaId);
     // Simulate API Connection & Import
     setTimeout(() => {
        setConnectedOTAs([...connectedOTAs, otaId]);
        const newProps = MOCK_LISTINGS.filter(l => l.ota === otaId || otaId === 'booking');
        
        // Add props that aren't already in list (simple deduplication for demo)
        const updatedListings = [...listings];
        newProps.forEach(p => {
           if (!updatedListings.find(existing => existing.id === p.id)) {
              updatedListings.push(p);
           }
        });
        
        setListings(updatedListings);
        setLoadingOTA(null);
     }, 1500);
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto font-sans bg-[#F8FAFC] min-h-[calc(100vh-80px)]">
      
      {/* Header Pipeline */}
      <div className="mb-12 flex items-center justify-between">
        <div>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight">Channel Manager Sync</h1>
           <p className="text-lg font-medium text-slate-500 mt-2">Connectez et centralisez vos canaux de distribution.</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>1. Fournisseur (PMS)</div>
           <ArrowRight size={16} className="text-slate-300"/>
           <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>2. Connexion Centrales & Import</div>
        </div>
      </div>

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div onClick={() => setProvider('beds24')} className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 relative ${provider === 'beds24' ? 'border-indigo-600 bg-white shadow-xl scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}`}>
              {provider === 'beds24' && <div className="absolute top-6 right-6 text-indigo-600"><CheckCircle2 size={28} /></div>}
              <div className={`p-4 rounded-2xl inline-block mb-6 transition-colors shadow-sm ${provider === 'beds24' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                <Database size={36} />
              </div>
              <h3 className="font-extrabold text-2xl text-slate-800">Beds24 Core</h3>
              <p className="text-slate-500 mt-3 leading-relaxed font-medium">Solution API V2 optimisée. Idéale pour la gestion granulaire et l'automatisation d'appartements et villas privées.</p>
            </div>

            <div onClick={() => setProvider('siteminder')} className={`cursor-pointer p-8 rounded-3xl border-2 transition-all duration-300 relative ${provider === 'siteminder' ? 'border-indigo-600 bg-white shadow-xl scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-md'}`}>
              {provider === 'siteminder' && <div className="absolute top-6 right-6 text-indigo-600"><CheckCircle2 size={28} /></div>}
              <div className={`p-4 rounded-2xl inline-block mb-6 transition-colors shadow-sm ${provider === 'siteminder' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                <Globe size={36} />
              </div>
              <h3 className="font-extrabold text-2xl text-slate-800">SiteMinder Exchange</h3>
              <p className="text-slate-500 mt-3 leading-relaxed font-medium">Standard hôtelier mondial. Conçu pour le gros volume, l'importation massive des Hôtels et Riads.</p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-70 pointer-events-none"></div>
            <div className="flex items-center space-x-4 mb-10 relative z-10">
              <div className="p-3 bg-indigo-50 rounded-xl"><Settings className="text-indigo-600" size={24} /></div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">Configuration API <span className="text-indigo-600">{provider === 'beds24' ? 'Beds24' : 'SiteMinder'}</span></h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Liaison Sécurisée</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl relative z-10">
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider ml-1">{provider === 'beds24' ? 'Clé API / Token' : 'Clé X-API-Key'}</label>
                <input type="password" placeholder="••••••••••••••••" className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all bg-slate-50 font-medium text-slate-800"/>
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wider ml-1">{provider === 'beds24' ? 'Invite Token' : 'ID Établissement (Hotel Code)'}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Server size={20} /></div>
                  <input type="text" placeholder={provider === 'beds24' ? "pms-alpha-2026" : "SM-HOTEL-99"} className="w-full p-4 pl-12 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all bg-slate-50 font-medium text-slate-800"/>
                </div>
              </div>
            </div>

            <div className="mt-10 relative z-10">
              <button 
                onClick={handleProviderConnect}
                className="bg-[#1E293B] hover:bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95 inline-flex items-center gap-3 text-sm tracking-wide uppercase"
              >
                <Link size={18} /><span>Connecter {provider === 'beds24' ? 'Beds24' : 'SiteMinder'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
         <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="bg-green-50 border border-green-200 rounded-3xl p-6 mb-12 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-4">
                 <div className="bg-green-500 text-white p-3 rounded-2xl shadow-inner"><CheckCircle2 size={24}/></div>
                 <div>
                    <h3 className="font-bold text-green-900 text-xl tracking-tight">Hub {provider === 'beds24' ? 'Beds24' : 'SiteMinder'} Connecté</h3>
                    <p className="text-green-700 font-medium text-sm mt-1">Flux XML/JSON bidirectionnel activé avec succès.</p>
                 </div>
               </div>
               <button onClick={() => setStep(1)} className="text-sm font-bold text-green-700 bg-green-100/50 hover:bg-green-200 px-4 py-2 rounded-xl transition">Modifier IP/API</button>
            </div>

            <div className="mb-12">
               <h2 className="text-3xl font-black text-slate-800 mb-2">Centrales de Réservation (OTAs)</h2>
               <p className="text-slate-500 font-medium text-lg mb-8">Connectez vos comptes pour importer automatiquement vos annonces et calendriers.</p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {OTAS.map(ota => {
                    const isConnected = connectedOTAs.includes(ota.id);
                    const isLoading = loadingOTA === ota.id;
                    
                    return (
                      <div key={ota.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition flex flex-col items-center text-center relative overflow-hidden group">
                         {isConnected && <div className="absolute inset-0 bg-indigo-50/50 pointer-events-none"></div>}
                         
                         <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl text-white shadow-lg mb-4 z-10 ${ota.color}`}>
                           {ota.icon}
                         </div>
                         <h4 className="font-extrabold text-slate-800 text-xl z-10">{ota.name}</h4>
                         <p className="text-xs font-bold text-slate-400 mt-2 mb-6 z-10">{ota.desc}</p>
                         
                         <div className="mt-auto w-full z-10">
                            {isConnected ? (
                              <button disabled className="w-full bg-indigo-100 text-indigo-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm uppercase">
                                <CheckCircle2 size={16}/> Connecté
                              </button>
                            ) : isLoading ? (
                              <button disabled className="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm uppercase">
                                <RefreshCcw size={16} className="animate-spin"/> Connexion...
                              </button>
                            ) : (
                              <button onClick={() => handleOTAConnect(ota.id)} className="w-full bg-white border-2 border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 font-bold py-3 rounded-xl transition shadow-sm text-sm uppercase">
                                Lier le compte
                              </button>
                            )}
                         </div>
                      </div>
                    )
                 })}
               </div>
            </div>

            {/* Imported Listings Section */}
            {connectedOTAs.length > 0 && (
               <div className="animate-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h2 className="text-3xl font-black text-slate-800">Propriétés Importées (Logements)</h2>
                        <p className="text-slate-500 font-medium text-lg mt-1">{listings.length} logements synchronisés via vos canaux.</p>
                     </div>
                     <button className="bg-[#1E293B] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition shadow-lg text-sm">
                       <Plus size={18}/> Créer Manuellement
                     </button>
                  </div>

                  <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                           <tr>
                              <th className="p-5 text-xs font-black uppercase text-slate-500 tracking-wider">Logement</th>
                              <th className="p-5 text-xs font-black uppercase text-slate-500 tracking-wider">Type</th>
                              <th className="p-5 text-xs font-black uppercase text-slate-500 tracking-wider">Source (OTA)</th>
                              <th className="p-5 text-xs font-black uppercase text-slate-500 tracking-wider">Tarif Base</th>
                              <th className="p-5 text-xs font-black uppercase text-slate-500 tracking-wider text-right">Statut Sync</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {listings.map(item => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition cursor-pointer group">
                                 <td className="p-5">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition"><Home size={20}/></div>
                                       <div>
                                          <div className="font-bold text-slate-800 text-base">{item.name}</div>
                                          <div className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5"><Calendar size={12}/> Cal. Lié</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="p-5 font-bold text-slate-600">{item.type}</td>
                                 <td className="p-5">
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg ${
                                       item.ota === 'airbnb' ? 'bg-rose-100 text-rose-700' : 
                                       item.ota === 'booking' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                       {item.ota}
                                    </span>
                                 </td>
                                 <td className="p-5 font-black text-slate-800">{item.price} <span className="text-xs font-medium text-slate-400">/ nuit</span></td>
                                 <td className="p-5 text-right">
                                    <div className="inline-flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                       <span className="text-xs font-bold text-green-700 uppercase">Actif</span>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                           {listings.length === 0 && (
                              <tr>
                                 <td colSpan="5" className="p-12 text-center text-slate-400 font-bold">
                                    Importation en cours ou aucun logement trouvé...
                                 </td>
                              </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}
         </div>
      )}

    </div>
  );
};

export default ChannelManager;
