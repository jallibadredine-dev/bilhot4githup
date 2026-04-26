import React, { useState } from 'react';
import { 
  Database, Globe, Link as LinkIcon, Settings, Server, CheckCircle2, 
  ArrowRight, RefreshCcw, Home, Plus, Calendar, Activity,
  MessageSquare, Star, LayoutDashboard, Share2, ShieldCheck, 
  AlertCircle, ChevronRight, DownloadCloud, XCircle
} from 'lucide-react';

const OTAS = [
  { id: 'airbnb', name: 'Airbnb', color: 'bg-rose-500', icon: 'A', desc: 'Locations Courte Durée', sync: ['Dispos', 'Tarifs', 'Messages', 'Avis'] },
  { id: 'booking', name: 'Booking.com', color: 'bg-blue-900', icon: 'B', desc: 'Standard Hôtelier Mondial', sync: ['Dispos', 'Tarifs', 'Messages'] },
  { id: 'expedia', name: 'Expedia', color: 'bg-yellow-500', icon: 'E', desc: 'Vols & Hébergements', sync: ['Dispos', 'Tarifs'] },
  { id: 'tripadvisor', name: 'TripAdvisor', color: 'bg-green-600', icon: 'T', desc: 'Avis & Réservations', sync: ['Dispos', 'Avis'] },
  { id: 'vrbo', name: 'Vrbo / Abritel', color: 'bg-indigo-900', icon: 'V', desc: 'Villas & Grandes Familles', sync: ['Dispos', 'Tarifs', 'Messages'] },
  { id: 'agoda', name: 'Agoda', color: 'bg-pink-600', icon: 'Ag', desc: 'Marché Asiatique & Hôtels', sync: ['Dispos', 'Tarifs'] },
  { id: 'google', name: 'Google Hotels', color: 'bg-red-500', icon: 'G', desc: 'Moteur de Recherche', sync: ['Tarifs'] },
  { id: 'hostelworld', name: 'Hostelworld', color: 'bg-orange-600', icon: 'H', desc: 'Auberges & Lits', sync: ['Dispos', 'Tarifs'] },
];

const MOCK_PROPERTIES_HOT = [
  { id: 'l1', name: 'Appartement Vue Mer #102', otas: ['airbnb', 'booking'], type: 'Appartement', status: 'Sync', price: '120€' },
  { id: 'l2', name: 'Villa Royale Palmeraie', otas: ['booking', 'expedia', 'vrbo'], type: 'Villa', status: 'Sync', price: '450€' },
  { id: 'l3', name: 'Riad Medina Authentique', otas: ['airbnb', 'tripadvisor'], type: 'Riad', status: 'Sync', price: '90€' },
  { id: 'l4', name: 'Premium Loft Guéliz', otas: ['airbnb'], type: 'Appartement', status: 'Sync', price: '110€' }
];

const MOCK_HOTELS_PRO = [
  {
    id: 'h1', name: 'Atlas Suites Resort & Spa', location: 'Marrakech',
    rooms: [
      { id: 'r1', name: 'Chambre Standard (Double)', qty: 24, otas: ['booking', 'expedia'], price: '80€' },
      { id: 'r2', name: 'Chambre Supérieure (Twin)', qty: 15, otas: ['booking', 'expedia', 'airbnb'], price: '110€' },
      { id: 'r3', name: 'Suite Deluxe Vue Jardin', qty: 8, otas: ['booking', 'tripadvisor'], price: '180€' },
      { id: 'r4', name: 'Suite Familiale (4 pers.)', qty: 4, otas: ['airbnb', 'vrbo'], price: '250€' },
      { id: 'r5', name: 'Suite Exécutive Balcon', qty: 3, otas: ['booking', 'expedia'], price: '320€' },
      { id: 'r6', name: 'Chambre PMR Access', qty: 2, otas: ['booking'], price: '90€' },
      { id: 'r7', name: 'Penthouse Royal Top Floor', qty: 1, otas: ['airbnb', 'tripadvisor', 'booking'], price: '850€' }
    ]
  },
  {
    id: 'h2', name: 'Le Pearl Business Casablanca', location: 'Casablanca',
    rooms: [
      { id: 'r8', name: 'Chambre Classique Affaires', qty: 50, otas: ['booking', 'expedia'], price: '95€' },
      { id: 'r9', name: 'Suite Junior Affaires', qty: 12, otas: ['booking', 'expedia'], price: '160€' }
    ]
  }
];

const ChannelManager = ({ pmsMode = 'pro', setActiveView }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'channels', 'messenger', 'reviews'
  const [hubConnected, setHubConnected] = useState(true);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [showConfig, setShowConfig] = useState(null); // ID of OTA being configured
  
  // OTA Flow State
  const [loadingOTA, setLoadingOTA] = useState(null);
  const [connectedOTAs, setConnectedOTAs] = useState(['airbnb', 'booking', 'expedia', 'google']);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [automationActive, setAutomationActive] = useState(true);

  const handleAiAssist = () => {
    if (!selectedConversation) return;
    setIsAiGenerating(true);
    setTimeout(() => {
      const responses = {
        'airbnb': "Bonjour ! Merci pour votre message. Oui, l'appartement est prêt pour votre arrivée. Les instructions de self-check-in vous seront envoyées 24h avant.",
        'booking': "Hello! Thank you for your inquiry. Late check-in is indeed possible for a small fee of 20€. Would you like me to book this for you?",
        'expedia': "Bonjour, nous fournissons effectivement des serviettes fraîches et des articles de toilette de luxe pour chaque séjour. À bientôt !"
      };
      setMessageText(responses[selectedConversation.platform] || "Bonjour ! Comment puis-je vous aider aujourd'hui ?");
      setIsAiGenerating(false);
    }, 1200);
  };

  const handleTranslateMessage = () => {
    setIsTranslating(true);
    setTimeout(() => setIsTranslating(false), 800);
  };

  const handleOTAConnect = (otaId) => {
    setLoadingOTA(otaId);
    // Simulate OAuth/Login Flow
    setTimeout(() => {
      if (!connectedOTAs.includes(otaId)) {
        setConnectedOTAs([...connectedOTAs, otaId]);
      }
      setLoadingOTA(null);
    }, 1500);
  };

  const renderTabNav = () => (
    <div className="flex space-x-8 mb-8 border-b border-slate-200 overflow-x-auto hide-scrollbar">
      <button 
        onClick={() => setActiveTab('overview')}
        className={`pb-4 text-sm font-bold tracking-wide transition-all whitespace-nowrap ${activeTab === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className="flex items-center gap-2"><LayoutDashboard size={16}/> Vue d'ensemble</div>
      </button>
      <button 
        onClick={() => setActiveTab('channels')}
        className={`pb-4 text-sm font-bold tracking-wide transition-all whitespace-nowrap ${activeTab === 'channels' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className="flex items-center gap-2"><Share2 size={16}/> Connecter mes Plateformes</div>
      </button>
      <button 
        onClick={() => setActiveTab('messenger')}
        className={`pb-4 text-sm font-bold tracking-wide transition-all whitespace-nowrap ${activeTab === 'messenger' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className="flex items-center gap-2"><MessageSquare size={16}/> Messenger Omnicanal</div>
      </button>
      <button 
        onClick={() => setActiveTab('reviews')}
        className={`pb-4 text-sm font-bold tracking-wide transition-all whitespace-nowrap ${activeTab === 'reviews' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        <div className="flex items-center gap-2"><Star size={16}/> Avis & E-Réputation</div>
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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSandboxMode(!sandboxMode)}
            className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 border ${sandboxMode ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
          >
            <Activity size={16} /> 
            {sandboxMode ? 'Mode Sandbox (Test API)' : 'Mode Production'}
          </button>
        </div>
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
                <div className="text-3xl font-black text-slate-800">
                  {pmsMode === 'hot' ? MOCK_PROPERTIES_HOT.length : MOCK_HOTELS_PRO.reduce((acc, h) => acc + h.rooms.length, 0)}
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mt-1">
                  {pmsMode === 'hot' ? 'Logements Sync.' : 'Types Chambres'}
                </div>
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
                 <h2 className="text-xl font-black text-slate-800">{pmsMode === 'hot' ? 'Unités Indépendantes (Listings)' : 'Cartographie des Chambres'}</h2>
                 <p className="text-sm font-medium text-slate-500">{pmsMode === 'hot' ? 'Logements complets mappés de 1-à-1 vers vos OTAs.' : 'Groupes d\'inventaire mappés vers les Room Types des OTA.'}</p>
               </div>
               <button className="bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 flex items-center gap-2 rounded-xl font-bold text-sm transition-all shadow-sm">
                 <DownloadCloud size={16}/> {pmsMode === 'hot' ? 'Importer Annonce' : 'Lier Room Type'}
               </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider ">{pmsMode === 'hot' ? 'Logement' : 'Type de Chambre'}</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider">Distribution</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider">Prix Base</th>
                  <th className="p-5 text-xs font-black uppercase text-slate-400 tracking-wider text-right">Statut Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pmsMode === 'hot' ? (
                  MOCK_PROPERTIES_HOT.map(item => (
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
                  ))
                ) : (
                  MOCK_HOTELS_PRO.map(hotel => (
                    <React.Fragment key={hotel.id}>
                      <tr className="bg-slate-100/50">
                        <td colSpan="4" className="p-4 border-b border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white"><Activity size={14}/></div>
                              <div>
                                <div className="font-black text-slate-800 tracking-tight text-sm uppercase">{hotel.name}</div>
                                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">{hotel.location} • Configuré pour l'API Hub</div>
                              </div>
                            </div>
                            <div className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold uppercase rounded-md flex items-center gap-1">
                               <CheckCircle2 size={12}/> Actif {hotel.rooms.length}/7 mapping complet
                            </div>
                          </div>
                        </td>
                      </tr>
                      {hotel.rooms.map(room => (
                         <tr key={room.id} className="hover:bg-slate-50 transition cursor-pointer group">
                           <td className="p-4 pl-14 border-b border-slate-50">
                             <div className="flex flex-col">
                               <div className="font-bold text-slate-700">{room.name}</div>
                               <div className="text-[11px] font-bold text-indigo-500 mt-1 flex items-center gap-1">
                                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                 Lot de {room.qty} ch. physiques (Inventaire unifié)
                               </div>
                             </div>
                           </td>
                           <td className="p-4 border-b border-slate-50">
                             <div className="flex -space-x-2">
                               {room.otas.map(ota => {
                                  const otaInfo = OTAS.find(o => o.id === ota);
                                  return otaInfo ? (
                                    <div key={ota} className={`w-8 h-8 rounded-full ${otaInfo.color} text-white flex items-center justify-center text-xs font-black border-2 border-white`} title={otaInfo.name}>
                                      {otaInfo.icon}
                                    </div>
                                  ) : null;
                               })}
                             </div>
                           </td>
                           <td className="p-4 font-black text-slate-800 border-b border-slate-50">{room.price} <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">/ Base Rate</span></td>
                           <td className="p-4 text-right border-b border-slate-50">
                              <span className="text-xs font-bold text-emerald-600 bg-emerald-50/50 px-2.5 py-1 rounded-md border border-emerald-100/50">Flux Synchro.</span>
                           </td>
                         </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB: CHANNELS & OTAs --- */}
      {activeTab === 'channels' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                             disabled={isLoading}
                             onClick={() => handleOTAConnect(ota.id)} 
                             className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 bg-[#1E293B] text-white hover:bg-black shadow-md`}
                           >
                              {isLoading ? <RefreshCcw size={16} className="animate-spin"/> : <LinkIcon size={16}/>}
                              {isLoading ? 'Liaison...' : `Connexion via ${ota.name}`}
                           </button>
                        ) : (
                           <>
                             <button 
                                onClick={() => setShowConfig(ota.id)}
                                className="bg-white border border-slate-200 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm"
                             >
                               <Settings size={16}/> Configurer
                             </button>
                             {/* Seamless integrations with SaaS tools */}
                             {ota.sync.includes('Messages') && (
                               <button 
                                 onClick={() => setActiveView('unified-inbox')}
                                 className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 border border-blue-100"
                               >
                                 <MessageSquare size={16}/> Inbox
                               </button>
                             )}
                             {ota.sync.includes('Avis') && (
                               <button 
                                 onClick={() => setActiveView('reputation')}
                                 className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 border border-amber-100"
                               >
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

      {/* --- TAB: MESSENGER OMNICANAL --- */}
      {activeTab === 'messenger' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-4 rounded-3xl text-white flex items-center justify-between shadow-lg">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><Activity size={20}/></div>
                <div>
                   <h3 className="font-black tracking-tight text-sm uppercase">Pilote Automatique IA</h3>
                   <p className="text-[10px] font-bold text-indigo-100 opacity-80">Répond automatiquement aux questions fréquentes (Check-in, Wi-Fi, etc.)</p>
                </div>
             </div>
             <button 
                onClick={() => setAutomationActive(!automationActive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${automationActive ? 'bg-emerald-400 text-emerald-950' : 'bg-white/20 text-white'}`}
             >
                {automationActive ? <CheckCircle2 size={14}/> : <ArrowRight size={14}/>}
                {automationActive ? 'AUTOPILOT ACTIF' : 'ACTIVER PILOTE'}
             </button>
          </div>

          <div className="flex h-[600px] bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            {/* Conversation List */}
            <div className="w-80 border-r border-slate-100 flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <input type="text" placeholder="Rechercher..." className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition"><Plus size={18}/></button>
              </div>
              <div className="flex-1 overflow-y-auto hide-scrollbar">
                {[
                  { id: 1, name: 'Alice Smith', platform: 'booking', lastMsg: 'Is late check-in possible?', time: '10:30', unread: true },
                  { id: 2, name: 'Bob Johnson', platform: 'airbnb', lastMsg: 'Thanks for the instructions!', time: '09:15', unread: false },
                  { id: 3, name: 'Claire Dubois', platform: 'expedia', lastMsg: 'Are towels provided?', time: 'Yesterday', unread: false },
                  { id: 4, name: 'David Wilson', platform: 'booking', lastMsg: 'Looking forward to our stay.', time: 'Yesterday', unread: false }
                ].map(conv => (
                  <div 
                    key={conv.id} 
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b border-slate-50 cursor-pointer transition relative hover:bg-slate-50 ${selectedConversation?.id === conv.id ? 'bg-indigo-50/50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">{conv.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-sm truncate">{conv.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{conv.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${OTAS.find(o => o.id === conv.platform)?.color} flex items-center justify-center text-[6px] text-white font-black`}>
                             {OTAS.find(o => o.id === conv.platform)?.icon}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{conv.lastMsg}</p>
                        </div>
                      </div>
                    </div>
                    {conv.unread && <div className="absolute right-4 bottom-4 w-2 h-2 bg-indigo-600 rounded-full"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30 relative">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">{selectedConversation.name.charAt(0)}</div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{selectedConversation.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Client {selectedConversation.platform.toUpperCase()}</span>
                          <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                          <span className="text-[10px] text-emerald-600 font-bold uppercase">En ligne</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleTranslateMessage}
                        className={`p-2 rounded-lg transition text-slate-400 flex items-center gap-2 text-xs font-bold ${isTranslating ? 'animate-pulse text-indigo-600 bg-indigo-50' : 'hover:bg-slate-100'}`}
                      >
                         <Globe size={18}/> Traduire
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-400"><Calendar size={18}/></button>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                     <div className="flex justify-start">
                       <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm max-w-[80%]">
                         <p className="text-sm text-slate-700">{selectedConversation.lastMsg}</p>
                         <span className="text-[10px] text-slate-400 mt-1 block tracking-tight uppercase font-bold">{selectedConversation.time} • Reçu via Channex.co</span>
                       </div>
                     </div>
                     <div className="flex justify-end">
                       <div className="bg-indigo-600 p-3 rounded-2xl rounded-tr-none text-white shadow-lg max-w-[80%]">
                         <p className="text-sm">Bonjour {selectedConversation.name.split(' ')[0]}, bien sûr ! Nous pouvons organiser cela pour vous.</p>
                         <span className="text-[10px] text-indigo-100 mt-1 block font-bold uppercase tracking-widest">10:45 • Lu</span>
                       </div>
                     </div>
                  </div>

                  <div className="p-4 bg-white border-t border-slate-100">
                    <div className="flex flex-col gap-3">
                       {/* AI Tooltip for quick reply */}
                       <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 text-indigo-700 text-xs font-black uppercase tracking-wider">
                                <Activity size={14} className={isAiGenerating ? 'animate-spin' : ''}/> 
                                {isAiGenerating ? 'L\'IA prépare une réponse...' : 'Assistant Intelligent IA'}
                             </div>
                             {!isAiGenerating && (
                                <button onClick={handleAiAssist} className="text-indigo-600 hover:text-indigo-800 text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4 decoration-indigo-200">
                                   Rédiger brouillon IA
                                </button>
                             )}
                          </div>
                          {messageText && (
                            <div className="text-[13px] text-slate-600 font-medium leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                               {messageText}
                            </div>
                          )}
                       </div>

                       <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2 px-4 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                        <input 
                          type="text" 
                          placeholder="Écrire votre réponse..." 
                          className="flex-1 bg-transparent border-none outline-none text-sm py-2 text-slate-800"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                        />
                        <button 
                          className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md flex items-center justify-center disabled:opacity-50"
                          onClick={() => setMessageText('')}
                          disabled={!messageText}
                        >
                          <ArrowRight size={18}/>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                   <div className="p-8 bg-slate-100 rounded-full mb-6">
                    <MessageSquare size={80} strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-black text-slate-400">Centre de Communication</h3>
                  <p className="text-sm font-bold text-slate-400 mt-2">Sélectionnez un invité pour commencer la conversation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: REVIEWS & FEEDBACK --- */}
      {activeTab === 'reviews' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-black text-slate-800">Réputation & Avis Clients</h2>
                   <p className="text-slate-500 font-medium mt-1">Gérez tous les feedbacks de vos listings synchronisés via Channex.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100 font-bold text-sm">
                   <ShieldCheck size={16}/> Protection de Marque Active
                </div>
              </div>

              <div className="space-y-6">
                {[
                  { guest: 'Jean Dupont', ota: 'airbnb', score: '5.0', comment: 'Séjour incroyable, l\'appartement est parfaitement situé et la vue est à couper le souffle.', date: 'Hier' },
                  { guest: 'Sarah Miller', ota: 'booking', score: '4.8', comment: 'Very clean and professionnal staff. Highly recommended for business trips.', date: 'Il y a 2 jours' },
                  { guest: 'Marc Laroche', ota: 'expedia', score: '4.5', comment: 'Bon rapport qualité prix. Un peu de bruit le matin mais globalement très bien.', date: 'La semaine dernière' },
                ].map((review, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-black text-slate-400 border border-slate-200">{review.guest.charAt(0)}</div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-slate-800">{review.guest}</span>
                            <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                               <Star size={14} fill="currentColor"/> {review.score}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                             <div className={`w-5 h-5 rounded-full ${OTAS.find(o => o.id === review.ota)?.color} text-white flex items-center justify-center text-[8px] font-black`}>
                               {OTAS.find(o => o.id === review.ota)?.icon}
                             </div>
                             <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{OTAS.find(o => o.id === review.ota)?.name}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{review.date}</span>
                    </div>
                    <p className="mt-4 text-slate-600 font-medium leading-relaxed italic">"{review.comment}"</p>
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                          <button className="hover:text-indigo-600">Répondre avec l'IA</button>
                          <button className="hover:text-indigo-600">Traduire</button>
                          <button className="hover:text-indigo-600">Partager</button>
                       </div>
                       <button className="text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-1">
                          Source: {OTAS.find(o => o.id === review.ota)?.name} <ArrowRight size={12}/>
                       </button>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* --- CONFIG MODAL --- */}
      {showConfig && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-6 ${OTAS.find(o => o.id === showConfig)?.color} text-white flex justify-between items-center`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-black text-2xl">
                  {OTAS.find(o => o.id === showConfig)?.icon}
                </div>
                <div>
                  <h3 className="font-black text-xl">Configuration {OTAS.find(o => o.id === showConfig)?.name}</h3>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Paramètres de synchronisation avancés</p>
                </div>
              </div>
              <button onClick={() => setShowConfig(null)} className="p-2 hover:bg-white/20 rounded-full transition">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Identifiant Connexion</label>
                  <input type="text" readOnly value={`${showConfig}_user_882`} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Statut API</label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-bold">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Opérationnel
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-slate-800 text-sm border-b border-slate-100 pb-2">Options de Synchronisation</h4>
                {[
                  { label: 'Disponibilités en temps réel', desc: 'Mise à jour instantanée des calendriers.', checked: true },
                  { label: 'Prix & Promotions', desc: 'Synchronisation des tarifs de base et offres.', checked: true },
                  { label: 'Messages Invités', desc: 'Importation auto dans Messenger Omnicanal.', checked: true },
                  { label: 'Avis & Commentaires', desc: 'Récupération des avis pour IA Reputation.', checked: false },
                ].map((opt, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{opt.label}</div>
                      <p className="text-xs text-slate-500 font-medium">{opt.desc}</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${opt.checked ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${opt.checked ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  <strong>Note importante :</strong> Toute modification des tarifs sur {OTAS.find(o => o.id === showConfig)?.name} sera écrasée par HosFlow lors de la prochaine synchronisation automatique (toutes les 5 minutes).
                </p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowConfig(null)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition">Annuler</button>
              <button onClick={() => setShowConfig(null)} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Enregistrer les réglages</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelManager;
