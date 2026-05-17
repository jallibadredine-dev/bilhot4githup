import React, { useState, useEffect } from 'react';
import { 
  Database, Globe, Link as LinkIcon, Settings, Server, CheckCircle2, 
  ArrowRight, RefreshCcw, Home, Plus, Calendar, Activity,
  MessageSquare, Star, LayoutDashboard, Share2, ShieldCheck, 
  AlertCircle, ChevronRight, DownloadCloud, XCircle, Tag,
  Zap, Key, Shield, UserPlus, FileText, Bell, Lock, Unlock, Eye,
  CreditCard, Search, Filter, Monitor, Smartphone, Tablet
} from 'lucide-react';
import './ChannelManager.css';

const OTAS = [
  { id: 'airbnb', name: 'Airbnb', color: 'bg-rose-500', icon: 'A', desc: 'Short-Term Rentals', sync: ['Availability', 'Rates', 'Messages', 'Reviews'] },
  { id: 'booking', name: 'Booking.com', color: 'bg-blue-900', icon: 'B', desc: 'Global Hotel Standard', sync: ['Availability', 'Rates', 'Messages'] },
  { id: 'expedia', name: 'Expedia', color: 'bg-yellow-500', icon: 'E', desc: 'Flights & Stays', sync: ['Availability', 'Rates'] },
  { id: 'tripadvisor', name: 'TripAdvisor', color: 'bg-green-600', icon: 'T', desc: 'Reviews & Bookings', sync: ['Availability', 'Reviews'] },
  { id: 'vrbo', name: 'Vrbo / Abritel', color: 'bg-indigo-900', icon: 'V', desc: 'Villas & Large Stays', sync: ['Availability', 'Rates', 'Messages'] },
  { id: 'agoda', name: 'Agoda', color: 'bg-pink-600', icon: 'Ag', desc: 'Asian Market & Hotels', sync: ['Availability', 'Rates'] },
  { id: 'google', name: 'Google Hotels', color: 'bg-red-500', icon: 'G', desc: 'Search Engine', sync: ['Rates'] },
];

const MOCK_PROPERTIES_HOT = [
  { id: 'l1', name: 'Appartement Vue Mer #102', otas: ['airbnb', 'booking'], type: 'Appartement', status: 'Sync', price: '120€' },
  { id: 'l2', name: 'Villa Royale Palmeraie', otas: ['booking', 'expedia', 'vrbo'], type: 'Villa', status: 'Sync', price: '450€' },
  { id: 'l3', name: 'Riad Medina Authentique', otas: ['airbnb', 'tripadvisor'], type: 'Riad', status: 'Sync', price: '90€' },
  { id: 'l4', name: 'Premium Loft Guéliz', otas: ['airbnb'], type: 'Appartement', status: 'Sync', price: '110€' }
];

const ChannelManager = ({ pmsMode = 'pro' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [channexToken, setChannexToken] = useState(localStorage.getItem('channex_token') || '');
  const [channexGroupId, setChannexGroupId] = useState(localStorage.getItem('channex_group_id') || '');
  const [channexProperties, setChannexProperties] = useState([]);
  const [channexBookings, setChannexBookings] = useState([]);
  const [channexLoading, setChannexLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Disconnected');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [automationActive, setAutomationActive] = useState(true);
  const [activeChannelConfig, setActiveChannelConfig] = useState(null);
  const [tempChannelId, setTempChannelId] = useState('');

  useEffect(() => {
    if (channexToken) fetchChannexData();
  }, []);

  const fetchChannexData = async () => {
    if (!channexToken) return;
    setChannexLoading(true);
    setSyncStatus('Connecting API...');
    try {
      const headers = { 'user-api-key': channexToken };
      const [propRes, bookRes] = await Promise.all([
        fetch('https://staging.channex.io/api/v1/properties', { headers }).catch(() => null),
        fetch('https://staging.channex.io/api/v1/bookings', { headers }).catch(() => null)
      ]);
      
      if (propRes) {
        const data = await propRes.json();
        if (data?.data) {
          setChannexProperties(data.data);
          setSyncStatus(`Connected (${data.data.length} properties)`);
        }
      }
      if (bookRes) {
        const bData = await bookRes.json();
        if (bData?.data) setChannexBookings(bData.data);
      }
    } catch (e) {
      setSyncStatus('Network Error');
    }
    setChannexLoading(false);
  };

  const saveChannexCredentials = () => {
    localStorage.setItem('channex_token', channexToken);
    localStorage.setItem('channex_group_id', channexGroupId);
    fetchChannexData();
  };

  const MetricCard = ({ title, value, sub, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition duration-500 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${color}`}>
        <Icon size={20} />
      </div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</div>
      <div className="text-3xl font-black text-slate-900 mb-1">{value}</div>
      <div className="text-xs font-bold text-slate-400">{sub}</div>
    </div>
  );

  return (
    <div className="p-8 md:p-12 max-w-screen-2xl mx-auto font-sans bg-[#F8FAFC] min-h-screen text-slate-900">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                 <Share2 size={24} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Channel Manager</h1>
              <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter">v2.5 PRO</span>
           </div>
           <p className="text-slate-500 font-medium max-w-xl">Centralize your global distribution. Sync rates, availability, and messages across all OTAs in real-time via Channex.io.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm">
           <button onClick={() => fetchChannexData()} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
              <RefreshCcw size={20} className={channexLoading ? 'animate-spin' : ''} />
           </button>
           <div className="h-8 w-px bg-slate-100"></div>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 transition flex items-center gap-2">
              <Plus size={18}/> New Channel
           </button>
        </div>
      </div>

      {/* Tabs Navigation - Expanded with all options */}
      <div className="flex items-center gap-2 mb-8 bg-slate-100/50 p-1.5 rounded-2xl w-full overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', label: 'Dashboard', icon: Activity },
          { id: 'channels', label: 'OTAs & Hub', icon: Globe },
          { id: 'reservations', label: 'Bookings', icon: Calendar },
          { id: 'messenger', label: 'Inbox', icon: MessageSquare },
          { id: 'reviews', label: 'Reviews', icon: Star },
          { id: 'listing', label: 'Listings', icon: Home },
          { id: 'pricing', label: 'Pricing Rules', icon: Tag },
          { id: 'automation', label: 'Automation', icon: Zap },
          { id: 'reports', label: 'Analytics', icon: FileText },
          { id: 'config', label: 'API Setup', icon: Settings }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <MetricCard title="Active Channels" value="4" sub="of 12 connected" icon={Share2} color="bg-indigo-50 text-indigo-600" />
               <MetricCard title="Properties Sync" value={channexProperties.length} sub="Protected by Guard" icon={ShieldCheck} color="bg-emerald-50 text-emerald-600" />
               <MetricCard title="Bookings (24h)" value={channexBookings.length} sub="+12% from last week" icon={Calendar} color="bg-amber-50 text-amber-600" />
               <MetricCard title="API Health" value="100%" sub="Last sync 2m ago" icon={Activity} color="bg-blue-50 text-blue-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                   <h3 className="font-black text-slate-800 flex items-center gap-3"><RefreshCcw size={20} className="text-indigo-600"/> Live Channel Status</h3>
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Real-time bi-directional sync</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {OTAS.slice(0, 4).map(ota => (
                    <div key={ota.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition">
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl ${ota.color} text-white flex items-center justify-center font-black text-xl shadow-md`}>{ota.icon}</div>
                          <div>
                             <h4 className="font-black text-slate-800">{ota.name}</h4>
                             <div className="flex gap-2 mt-1">
                                {ota.sync.map(s => <span key={s} className="text-[9px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-tighter">{s}</span>)}
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end">
                             <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active</span>
                             <span className="text-[10px] font-bold text-slate-300">Syncing 4m ago</span>
                          </div>
                          <button className="p-2 text-slate-300 hover:text-slate-600 transition"><Settings size={18}/></button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
                 <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6"><Zap size={24} className="text-amber-400" /></div>
                    <h3 className="text-2xl font-black mb-2">Omnichannel AI Autopilot</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">AI is currently handling guest inquiries and optimizing rates across your connected channels.</p>
                 </div>
                 <div className="relative z-10 mt-12 space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                       <span className="text-xs font-bold text-slate-300">AI Response Rate</span>
                       <span className="text-lg font-black text-emerald-400">92%</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                       <span className="text-xs font-bold text-slate-300">Rate Optimizations</span>
                       <span className="text-lg font-black text-amber-400">142</span>
                    </div>
                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-2xl shadow-indigo-900/50">Configure Autopilot</button>
                 </div>
                 <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: REVIEWS --- */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Guest Reputation</h2>
                <p className="text-slate-500 font-medium mt-2">Monitor and respond to guest feedback across all connected channels.</p>
              </div>
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="text-sm font-black text-slate-800">Global Score: 4.8/5.0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                { guest: 'Jean Dupont', ota: 'airbnb', score: '5.0', comment: "Incroyable séjour ! L'appartement est parfaitement situé et l'hôte est très réactif.", date: '2h ago', status: 'Pending' },
                { guest: 'Sarah Miller', ota: 'booking', score: '4.8', comment: "Very clean and modern. The self check-in was seamless. Will definitely come back.", date: 'Yesterday', status: 'Replied' },
                { guest: 'Marc Laroche', ota: 'expedia', score: '4.5', comment: "Great value for money. A bit noisy in the morning but overall excellent experience.", date: '2 days ago', status: 'Pending' }
              ].map((review, i) => (
                <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition duration-500 group">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl border border-slate-100 shadow-inner">
                            {review.guest[0]}
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 text-lg">{review.guest}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`w-5 h-5 rounded-full ${OTAS.find(o => o.id === review.ota)?.color} text-white flex items-center justify-center text-[8px] font-black`}>
                                {OTAS.find(o => o.id === review.ota)?.icon}
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{review.ota} • {review.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 px-4 py-2 rounded-xl text-amber-600 font-black">
                           <Star size={16} className="fill-amber-500" /> {review.score}
                        </div>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed italic text-lg mb-8">"{review.comment}"</p>
                      <div className="flex items-center gap-4">
                         <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${review.status === 'Replied' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            {review.status}
                         </span>
                         <div className="h-4 w-px bg-slate-100"></div>
                         <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition">Translate Review</button>
                      </div>
                    </div>

                    <div className="w-full md:w-96 bg-slate-50/50 rounded-[2.5rem] p-8 flex flex-col justify-between border border-slate-100">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14} className="text-amber-500"/> AI Draft</span>
                             <button onClick={() => setIsAiGenerating(true)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Regenerate</button>
                          </div>
                          <div className="bg-white p-4 rounded-2xl text-xs font-medium text-slate-500 border border-slate-100 leading-relaxed">
                             {review.status === 'Replied' ? "Thank you Sarah! We're thrilled you enjoyed the seamless check-in. Looking forward to your next visit!" : "Drafting professional response based on guest sentiment..."}
                          </div>
                       </div>
                       <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest mt-6 hover:bg-black transition">
                          {review.status === 'Replied' ? 'Edit Response' : 'Post AI Reply'}
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: LISTING --- */}
        {activeTab === 'listing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                 <h2 className="text-3xl font-black text-slate-900">Listing Manager</h2>
                 <p className="text-slate-500 font-medium mt-1">Push content updates (photos, descriptions) to all OTAs simultaneously.</p>
              </div>
              <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-200 transition flex items-center gap-2">
                 <Plus size={18}/> New Listing
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {MOCK_PROPERTIES_HOT.map(item => (
                 <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-200 transition group">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition shadow-inner">
                          <Home size={28}/>
                       </div>
                       <div>
                          <div className="flex items-center gap-3">
                             <h4 className="font-black text-slate-800 text-xl">{item.name}</h4>
                             <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-2 py-1 rounded-lg">SYNCED</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                             <div className="flex -space-x-2">
                               {item.otas.map(ota => (
                                 <div key={ota} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black ${OTAS.find(o => o.id === ota)?.color}`}>
                                    {OTAS.find(o => o.id === ota)?.icon}
                                 </div>
                               ))}
                             </div>
                             <span className="text-slate-400 text-xs font-bold">{item.type} • {item.price}/night</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-indigo-600 transition"><Eye size={20}/></button>
                       <button className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"><Settings size={20}/></button>
                    </div>
                 </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: PRICING --- */}
        {activeTab === 'pricing' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                 <h2 className="text-3xl font-black text-slate-900">Pricing & Rate Rules</h2>
                 <p className="text-slate-500 font-medium mt-2">Set dynamic adjustments and map rate plans to Channex identifiers.</p>
              </div>
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition flex items-center gap-2">
                 <Tag size={18}/> New Pricing Rule
              </button>
            </div>

            <div className="bg-white rounded-[3rem] p-12 border-2 border-dashed border-slate-100 text-center">
               <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CreditCard size={40}/></div>
               <h3 className="text-2xl font-black text-slate-800 mb-2">No Active Pricing Rules</h3>
               <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8">Establish dynamic pricing logic that automatically pushes to Channex based on occupancy or seasonal demand.</p>
               <div className="flex justify-center gap-4">
                  <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl">Setup Base Rates</button>
                  <button className="bg-white border border-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-black text-sm shadow-sm">Sync from PMS</button>
               </div>
            </div>
          </div>
        )}

        {/* --- TAB: AUTOMATION --- */}
        {activeTab === 'automation' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-3xl font-black text-slate-900">Automated Workflows</h2>
               <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs transition-all ${automationActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${automationActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                  {automationActive ? 'SYSTEM OPERATIONAL' : 'SYSTEM PAUSED'}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: 'Smart Check-In', desc: 'Send codes 24h before arrival', icon: Key, color: 'bg-indigo-50 text-indigo-600' },
                { title: 'Review Collector', desc: 'Request review 2h after checkout', icon: Star, color: 'bg-amber-50 text-amber-600' },
                { title: 'Rate Optimizer', desc: 'Boost prices for high demand', icon: Activity, color: 'bg-rose-50 text-rose-600' }
              ].map((auto, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition duration-500">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${auto.color}`}><auto.icon size={28}/></div>
                  <h4 className="text-xl font-black text-slate-800 mb-2">{auto.title}</h4>
                  <p className="text-slate-500 font-medium mb-8">{auto.desc}</p>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
                     <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: ANALYTICS --- */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-black text-slate-900">Market Intelligence</h2>
               <div className="flex items-center gap-4">
                  <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-500">April 2026</div>
                  <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest">Download PDF</button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                  <h4 className="font-black text-slate-800 text-lg mb-8 flex items-center gap-2"><Smartphone size={20} className="text-indigo-600"/> Booking Sources</h4>
                  <div className="space-y-6">
                     {OTAS.slice(0,4).map(ota => (
                       <div key={ota.id} className="space-y-2">
                          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                             <span>{ota.name}</span>
                             <span className="text-slate-800">25%</span>
                          </div>
                          <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden">
                             <div className={`h-full ${ota.color}`} style={{width: '25%'}}></div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="bg-indigo-600 p-10 rounded-[3rem] text-white relative overflow-hidden flex flex-col justify-between">
                  <h4 className="font-black text-xl mb-4 relative z-10">Revenue Insights</h4>
                  <div className="text-6xl font-black mb-4 relative z-10">$12,490.00</div>
                  <p className="text-indigo-100 font-medium relative z-10">+18.5% compared to previous period</p>
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
               </div>
            </div>
          </div>
        )}

        {/* --- TAB: API CONFIG --- */}
        {activeTab === 'config' && (
          <div className="max-w-3xl mx-auto w-full space-y-8 py-12">
             <div className="text-center mb-12">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                   <Server size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Channex.io Integration Hub</h2>
                <p className="text-slate-500 font-medium">Configure your enterprise API credentials to enable global distribution.</p>
             </div>

             <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-2xl space-y-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Channex API Token</label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-6 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition">
                         <Key size={20} />
                      </div>
                      <input 
                        type="password" 
                        value={channexToken}
                        onChange={e => setChannexToken(e.target.value)}
                        placeholder="sk_live_..." 
                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-16 py-5 text-slate-800 font-mono text-sm outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                      {channexToken && (
                        <div className="absolute inset-y-0 right-6 flex items-center text-emerald-500">
                           <CheckCircle2 size={20} />
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Property Group ID</label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-6 flex items-center text-slate-300 group-focus-within:text-indigo-600 transition">
                         <Database size={20} />
                      </div>
                      <input 
                        type="text" 
                        value={channexGroupId}
                        onChange={e => setChannexGroupId(e.target.value)}
                        placeholder="88f28c11-..." 
                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] px-16 py-5 text-slate-800 font-mono text-sm outline-none focus:border-indigo-500 focus:bg-white transition"
                      />
                   </div>
                </div>

                <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                         <ShieldCheck size={24} />
                      </div>
                      <div>
                         <div className="font-black text-emerald-800 text-sm">Real-time Sync Active</div>
                         <div className="text-emerald-600 text-xs font-medium">Latency: 142ms • Status: Operational</div>
                      </div>
                   </div>
                   <button className="text-emerald-700 font-black text-[10px] uppercase tracking-widest hover:underline">Test Latency</button>
                </div>

                <button 
                  onClick={saveChannexCredentials}
                  className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-slate-200 transition active:scale-[0.98]"
                >
                   {channexLoading ? 'Establishing Connection...' : 'Save & Sync API Credentials'}
                </button>
             </div>
          </div>
        )}

        {/* --- TAB: RESERVATIONS --- */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Synchronized Bookings</h2>
              <div className="flex gap-2">
                 <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm transition"><DownloadCloud size={20}/></button>
                 <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm transition"><Filter size={20}/></button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {channexBookings.length > 0 ? channexBookings.map(booking => (
                <div key={booking.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition duration-300 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 border border-slate-100 text-xl">
                      {booking.attributes?.customer?.name?.[0] || 'G'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-800 text-lg">{booking.attributes?.customer?.name || 'Guest'}</h4>
                        <span className="text-[10px] font-black text-slate-300 uppercase">#{booking.id}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter"><Calendar size={12}/> {booking.attributes?.arrival_date} - {booking.attributes?.departure_date}</div>
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{booking.attributes?.channel_name || 'Channel'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                    <div className="text-right">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</div>
                       <div className="text-2xl font-black text-slate-900">{booking.attributes?.amount} <span className="text-sm font-bold text-slate-400">{booking.attributes?.currency}</span></div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${booking.attributes?.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {booking.attributes?.status || 'Confirmed'}
                       </span>
                       <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-xl transition"><ChevronRight size={20}/></button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-slate-100">
                   <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><Calendar size={48}/></div>
                   <h3 className="text-2xl font-black text-slate-800 mb-2">No Bookings Found</h3>
                   <p className="text-slate-400 font-medium max-w-xs mx-auto mb-8">Connect your Channex API to start receiving real-time reservations from all OTAs.</p>
                   <button onClick={() => setActiveTab('config')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm transition shadow-xl shadow-indigo-100 hover:bg-indigo-700">Configure API</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: MESSENGER (MODERN INBOX) --- */}
        {activeTab === 'messenger' && (
           <div className="h-[750px] bg-white rounded-[3rem] border border-slate-100 shadow-2xl flex overflow-hidden">
              {/* Sidebar List */}
              <div className="w-96 border-r border-slate-50 flex flex-col bg-slate-50/20">
                 <div className="p-8 pb-4">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">Unified Inbox</h3>
                    <div className="relative">
                       <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                       <input type="text" placeholder="Search guests..." className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-indigo-500 transition" />
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {[
                      { id: 1, name: 'Alice Smith', platform: 'booking', lastMsg: 'Is late check-in possible?', time: '10:30', unread: true },
                      { id: 2, name: 'Bob Johnson', platform: 'airbnb', lastMsg: 'Thanks for the instructions!', time: '09:15', unread: false },
                      { id: 3, name: 'Claire Dubois', platform: 'expedia', lastMsg: 'Are towels provided?', time: 'Yesterday', unread: false }
                    ].map(conv => (
                       <div key={conv.id} onClick={() => setSelectedConversation(conv)} className={`p-5 rounded-[2rem] cursor-pointer transition-all duration-300 flex items-center gap-4 group ${selectedConversation?.id === conv.id ? 'bg-white shadow-xl ring-1 ring-slate-100 scale-[1.02]' : 'hover:bg-white hover:shadow-lg'}`}>
                          <div className="relative">
                             <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-500 text-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                                {conv.name[0]}
                             </div>
                             <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-black ${OTAS.find(o => o.id === conv.platform)?.color}`}>
                                {OTAS.find(o => o.id === conv.platform)?.icon}
                             </div>
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-center mb-1">
                                <span className="font-black text-slate-800 text-sm truncate">{conv.name}</span>
                                <span className="text-[10px] font-bold text-slate-400">{conv.time}</span>
                             </div>
                             <p className="text-xs text-slate-400 font-medium truncate">{conv.lastMsg}</p>
                          </div>
                          {conv.unread && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"></div>}
                       </div>
                    ))}
                 </div>
              </div>

              {/* Chat View */}
              <div className="flex-1 flex flex-col bg-white">
                 {selectedConversation ? (
                   <>
                      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 border border-slate-100">
                               {selectedConversation.name[0]}
                            </div>
                            <div>
                               <h4 className="font-black text-slate-800">{selectedConversation.name}</h4>
                               <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                  {selectedConversation.platform} Reservation <div className="w-1 h-1 bg-emerald-500 rounded-full"></div> <span className="text-emerald-500">Online</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"><Star size={20}/></button>
                            <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"><XCircle size={20}/></button>
                         </div>
                      </div>

                      <div className="flex-1 p-12 overflow-y-auto space-y-8 bg-slate-50/10">
                         <div className="flex justify-start">
                            <div className="bg-white p-6 rounded-[2.5rem] rounded-tl-none border border-slate-100 shadow-sm max-w-[70%]">
                               <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedConversation.lastMsg}</p>
                               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4 block">{selectedConversation.time} • Received via Channel Hub</span>
                            </div>
                         </div>
                         <div className="flex justify-end">
                            <div className="bg-indigo-600 p-6 rounded-[2.5rem] rounded-tr-none text-white shadow-2xl shadow-indigo-100 max-w-[70%]">
                               <p className="text-sm font-bold leading-relaxed">Bonjour {selectedConversation.name.split(' ')[0]}, yes absolutely! We can arrange a late check-in for you. Are you arriving by plane?</p>
                               <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-4 block">10:45 • Read</span>
                            </div>
                         </div>
                      </div>

                      <div className="p-8">
                         <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-6 mb-4 flex flex-col gap-4 relative overflow-hidden group">
                            <div className="flex items-center justify-between relative z-10">
                               <div className="flex items-center gap-2 text-indigo-700 text-xs font-black uppercase tracking-widest">
                                  <Zap size={14} className={isAiGenerating ? 'animate-spin' : ''}/> AI Smart Reply
                               </div>
                               <button onClick={() => setIsAiGenerating(true)} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">Draft with IA</button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl group-hover:scale-150 transition duration-700"></div>
                         </div>

                         <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-[2.5rem] p-3 pl-8 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300">
                            <input type="text" placeholder="Type your message..." className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-3 text-slate-800" />
                            <button className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-90">
                               <ArrowRight size={24} />
                            </button>
                         </div>
                      </div>
                   </>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-200 p-12">
                      <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner"><MessageSquare size={64}/></div>
                      <h3 className="text-3xl font-black text-slate-300">Omnichannel Messenger</h3>
                      <p className="text-slate-400 font-bold mt-4 max-w-sm text-center">Select a conversation from your connected channels to start chatting with your guests.</p>
                   </div>
                 )}
              </div>
           </div>
        )}

        {/* --- TAB: CHANNELS (HUB) --- */}
        {activeTab === 'channels' && (
          <div className="space-y-12">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   <h2 className="text-3xl font-black text-slate-900">Distribution Network</h2>
                   <p className="text-slate-500 font-medium mt-2">Manage your active OTA connections and discover new opportunities.</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-6 py-3 rounded-full border border-slate-100">
                   Active Connections: <span className="text-indigo-600 ml-2">4 / 24</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {OTAS.map(ota => (
                   <div key={ota.id} className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition duration-500 group flex flex-col justify-between">
                      <div>
                         <div className="flex items-start justify-between mb-8">
                            <div className={`w-16 h-16 rounded-[1.5rem] ${ota.color} text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-${ota.color.split('-')[1]}-200/50`}>{ota.icon}</div>
                            <div className="flex flex-col items-end">
                               <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter mb-2">Available</span>
                               <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-100 group-hover:bg-indigo-100 transition"></div>)}
                               </div>
                            </div>
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 mb-2">{ota.name}</h3>
                         <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">{ota.desc}</p>
                         <div className="flex flex-wrap gap-2 mb-10">
                            {ota.sync.map(s => <span key={s} className="bg-slate-50 text-slate-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{s}</span>)}
                         </div>
                      </div>
                      
                      {activeChannelConfig === ota.id ? (
                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                           <input 
                             type="text" 
                             placeholder="Channel Property ID" 
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 transition"
                             value={tempChannelId}
                             onChange={e => setTempChannelId(e.target.value)}
                           />
                           <div className="flex gap-2">
                              <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg" onClick={() => { alert('Channel Linked'); setActiveChannelConfig(null); setTempChannelId(''); }}>Connect</button>
                              <button className="flex-1 bg-slate-100 text-slate-400 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => setActiveChannelConfig(null)}>Cancel</button>
                           </div>
                        </div>
                      ) : (
                        <button className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-xl group-hover:shadow-indigo-100" onClick={() => setActiveChannelConfig(ota.id)}>
                           Connect {ota.name}
                        </button>
                      )}
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChannelManager;
