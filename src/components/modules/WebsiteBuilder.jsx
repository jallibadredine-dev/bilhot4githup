import React, { useState } from 'react';
import { 
  Plus, Search, Wand2, Monitor, Smartphone, Tablet, LayoutTemplate, 
  Settings, Layers, Type, ArrowLeft, ArrowRight, Image as ImageIcon,
  MousePointer2, Upload, Box, Undo, Redo, Play, CheckCircle, CheckCircle2, GripHorizontal,
  Menu, Sparkles, Heart, Globe, RefreshCcw, X, Calendar, ChevronRight, Layout,
  CreditCard, ShieldCheck, Zap, History, ExternalLink, ArrowDownLeft,
  CalendarDays, Users, Star, MapPin
} from 'lucide-react';
import './WebsiteBuilder.css'; // Minimal CSS for specific things if needed

/* ─── PROFESSIONAL BLOCK COMPONENTS ─── */

const BookingEngineBlock = ({ block, isSelected, onSelect, globalFont }) => {
  return (
    <div 
      onClick={onSelect}
      className={`p-12 md:p-24 m-2 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center bg-white ${isSelected ? 'border-indigo-500 ring-8 ring-indigo-50 shadow-2xl' : 'border-transparent hover:border-slate-100 shadow-xl'}`}
    >
       <div className="max-w-5xl w-full text-center">
          <h2 className={`text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight ${globalFont}`}>{block.title || 'Reserver votre séjour'}</h2>
          <p className="text-slate-500 text-lg mb-16 max-w-2xl mx-auto">{block.subtitle || 'Vérifiez la disponibilité en temps réel et obtenez la confirmation instantanée.'}</p>
          
          <div className="bg-white border border-slate-100 shadow-2xl rounded-[3rem] p-4 flex flex-col md:flex-row gap-4 items-center relative z-20">
             <div className="flex-1 w-full bg-slate-50 hover:bg-slate-100 transition p-6 rounded-[2rem] border border-slate-100 text-left group">
                <div className="flex items-center gap-3 text-slate-400 mb-2 font-black text-[10px] uppercase tracking-widest group-hover:text-indigo-600 transition">
                   <CalendarDays size={14} /> Dates de séjour
                </div>
                <div className="text-slate-800 font-bold text-lg">24 Oct - 26 Oct</div>
             </div>
             <div className="flex-1 w-full bg-slate-50 hover:bg-slate-100 transition p-6 rounded-[2rem] border border-slate-100 text-left group">
                <div className="flex items-center gap-3 text-slate-400 mb-2 font-black text-[10px] uppercase tracking-widest group-hover:text-indigo-600 transition">
                   <Users size={14} /> Occupants
                </div>
                <div className="text-slate-800 font-bold text-lg">2 Adultes, 1 Enfant</div>
             </div>
             <button className="bg-indigo-600 hover:bg-indigo-700 text-white h-full px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-200 transition active:scale-95 flex items-center gap-3 w-full md:w-auto justify-center">
                Réserver <ArrowRight size={18}/>
             </button>
          </div>
          
          <div className="mt-16 flex items-center justify-center gap-8 text-slate-400 opacity-60">
             <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"><ShieldCheck size={14}/> Paiement Sécurisé</div>
             <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"><Star size={14}/> Meilleur prix</div>
             <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest"><CreditCard size={14}/> Instantané</div>
          </div>
       </div>
       
       <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none"></div>
    </div>
  );
};

const RoomListingBlock = ({ block, isSelected, onSelect, globalFont }) => {
  return (
    <div 
      onClick={onSelect}
      className={`p-12 md:p-24 m-2 rounded-[2.5rem] border-2 transition-all cursor-pointer bg-slate-50 ${isSelected ? 'border-indigo-500 ring-8 ring-indigo-50 shadow-2xl' : 'border-transparent hover:border-slate-200 shadow-inner'}`}
    >
       <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
             <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-4">Our Residences</h3>
                <h2 className={`text-4xl md:text-6xl font-black text-slate-900 tracking-tight ${globalFont}`}>{block.title || 'Exclusive Room Collection'}</h2>
             </div>
             <p className="text-slate-500 max-w-md md:text-right font-medium">Découvrez une sélection de suites haut de gamme alliant confort moderne et design intemporel.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
             {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition duration-500 group flex flex-col">
                   <div className="aspect-[4/5] relative overflow-hidden">
                      <img 
                        src={block.image || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80"} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                        alt="Room"
                      />
                      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                         <Star size={14} className="text-amber-500 fill-amber-500" />
                         <span className="font-bold text-xs">4.9/5</span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition duration-500">
                         <div className="text-white font-black text-2xl mb-1">Deluxe Suite {i}</div>
                         <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest"><MapPin size={12}/> Garden View</div>
                      </div>
                   </div>
                   <div className="p-8 flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-6">
                         <div className="flex gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400" title="Wifi"><Globe size={12}/></span>
                            <span className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400" title="Breakfast"><Heart size={12}/></span>
                         </div>
                         <div className="text-right">
                            <div className="text-[10px] font-black uppercase text-slate-400 leading-none">Starting from</div>
                            <div className="text-2xl font-black text-indigo-600">{block.price || '250€'}<span className="text-xs font-bold text-slate-400">/night</span></div>
                         </div>
                      </div>
                      <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-black transition active:scale-95 mt-auto">Book This Room</button>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

const GalleryGridBlock = ({ block, isSelected, onSelect, globalFont }) => {
   const images = block.images || [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1548835154-8e100dcac04b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80"
   ];
   
   return (
      <div 
        onClick={onSelect}
        className={`p-12 md:p-24 m-2 rounded-[2.5rem] border-2 transition-all cursor-pointer bg-white ${isSelected ? 'border-indigo-500 ring-8 ring-indigo-50 shadow-2xl' : 'border-transparent hover:border-slate-100'}`}
      >
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">Gallery Showcase</h3>
               <h2 className={`text-4xl md:text-6xl font-black text-slate-900 tracking-tight ${globalFont}`}>{block.title || 'Capturing the Essence'}</h2>
            </div>
            
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
               {images.map((img, idx) => (
                  <div key={idx} className="break-inside-avoid rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition duration-500 border border-slate-100 group relative">
                     <img src={img} className="w-full h-auto object-cover" alt="Gallery" />
                     <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl scale-90 group-hover:scale-100 transition duration-500"><ImageIcon size={20}/></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

/* ─── DUMMY DATA ─── */
const CONTENT_BLOCKS = [
  { id: 'hero', name: 'Premium Hero', icon: <Sparkles size={16} /> },
  { id: 'booking_engine', name: 'Booking Engine', icon: <CalendarDays size={16} />, pro: true },
  { id: 'room_list', name: 'Room Gallery', icon: <Box size={16} />, pro: true },
  { id: 'features', name: 'Icon Features', icon: <ShieldCheck size={16} /> },
  { id: 'gallery', name: 'Masonry Gallery', icon: <ImageIcon size={16} /> },
  { id: 'contact', name: 'Contact Form', icon: <LayoutTemplate size={16} /> },
];

/* ─── 1. AI PROMPT HERO SCREEN (PRO & MODERN) ─── */
const AIPromptPhase = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      onGenerate(prompt);
      setIsGenerating(false);
    }, 2800); // more realistic AI generation time
  };

  const examples = [
    "Luxury Boutique Riad in Marrakech", 
    "Modern Beachfront Resort in Bali", 
    "Eco-friendly Glamping Safari",
    "Heritage Hotel in Paris with Spa"
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-[#FDFDFD] relative overflow-hidden font-sans w-full">
      {/* BACKGROUND DECORATIONS (Concentric subtle dashed rings) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-dashed border-slate-200/50 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-dashed border-slate-200/30 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-dashed border-slate-200/20 pointer-events-none"></div>
      
      {/* Soft gradient orb in the middle behind text */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 text-center w-full px-6 flex flex-col items-center mt-[-10vh]">
        
        <div className="flex items-center gap-2 mb-6 animate-bounce">
           <div className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-indigo-200">Pro Studio V2</div>
        </div>
        <h1 className="text-[52px] md:text-[68px] font-black text-[#1E293B] leading-[1.1] tracking-[-0.03em] mb-12 drop-shadow-sm">
          Generate your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Professional Site</span>
        </h1>

        {/* INPUT PILL */}
        <div className="w-full max-w-3xl relative group">
           {/* Glowing background outline behind input */}
           <div className="absolute -inset-[3px] bg-gradient-to-r from-blue-100 via-indigo-300 to-purple-300 rounded-[32px] blur-sm opacity-50 group-hover:opacity-70 transition duration-500 pointer-events-none"></div>
           
           <div className="relative bg-white rounded-full p-2 flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/80 transition-all duration-300">
             <input 
               value={prompt}
               onChange={e => setPrompt(e.target.value)}
               placeholder="I need a website for my..."
               className="flex-1 bg-transparent border-none outline-none px-8 py-2 text-[19px] text-slate-700 placeholder-slate-400 font-medium h-[64px]"
               onKeyDown={e => e.key === 'Enter' && handleGenerate()}
             />
             <button 
               onClick={handleGenerate}
               disabled={!prompt || isGenerating}
               className="bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-slate-300 text-white px-10 h-[64px] rounded-full font-bold text-[18px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(139,92,246,0.4)] transition-all active:scale-95"
             >
               {isGenerating ? <Sparkles size={20} className="animate-spin" /> : 'Generate ✨'}
             </button>
           </div>
        </div>

        {/* EXAMPLE PROMPTS */}
        <div className="mt-20 w-full max-w-2xl flex flex-col items-center relative">
          <div className="relative w-full text-center">
            <span className="text-[13px] font-semibold text-slate-400 mb-6 bg-[#FDFDFD] px-4 relative z-10 uppercase tracking-widest">Example Prompts</span>
            <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-slate-200/80 z-0"></div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6 relative z-10 w-full">
            {examples.slice(0, 2).map(ex => (
              <button 
                key={ex} 
                onClick={() => setPrompt(ex)}
                className="bg-[#F8FAFC] border border-slate-200/60 text-slate-500 px-6 py-2.5 rounded-full text-[14px] font-medium hover:bg-white hover:text-[#8B5CF6] hover:border-indigo-100 transition-all shadow-sm hover:shadow-md"
              >
                {ex}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4 relative z-10 w-full">
            {examples.slice(2, 4).map(ex => (
              <button 
                key={ex} 
                onClick={() => setPrompt(ex)}
                className="bg-[#F8FAFC] border border-slate-200/60 text-slate-500 px-6 py-2.5 rounded-full text-[14px] font-medium hover:bg-white hover:text-[#8B5CF6] hover:border-indigo-100 transition-all shadow-sm hover:shadow-md"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── 2. BUILDER INTERFACE REPLACED BELOW ─── */

/* ─── REALISTIC DOMAIN PUBLISH MODAL ─── */
const DomainPublishModal = ({ onClose, onProceed }) => {
  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState('');

  const handleVerify = () => {
    setStep(2);
    setTimeout(() => setStep(3), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <div className="p-10 text-center">
            {step === 1 && (
             <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                   <Globe size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Publish your Site</h2>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">Connect your custom domain to go live and start accepting direct bookings.</p>
                <div className="space-y-6 text-left">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Custom Web Domain</label>
                    <div className="flex bg-slate-50 rounded-xl border-2 border-slate-100 overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition">
                       <span className="px-4 py-4 text-slate-400 bg-slate-100/50 font-medium">https://</span>
                       <input value={domain} onChange={e=>setDomain(e.target.value)} type="text" placeholder="www.myhotel.com" className="w-full bg-transparent px-4 py-4 outline-none text-slate-800 font-bold" />
                    </div>
                  </div>
                  <button onClick={handleVerify} disabled={!domain} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg shadow-indigo-200">Verify DNS & Connect</button>
                </div>
             </div>
           )}

           {step === 2 && (
              <div className="py-8 animate-in fade-in">
                <RefreshCcw className="animate-spin text-indigo-600 mx-auto mb-6" size={48} />
                <h3 className="font-bold text-xl text-slate-800">Verifying Records...</h3>
                <p className="text-sm text-slate-500 mt-3 max-w-xs mx-auto">Checking A and CNAME records for <strong className="text-indigo-600">{domain}</strong> globally.</p>
              </div>
           )}

           {step === 3 && (
              <div className="py-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
                   <CheckCircle size={40} />
                </div>
                <h3 className="font-black text-2xl text-slate-800">Domain Connected!</h3>
                <p className="text-sm text-slate-500 mt-3 mb-10 max-w-xs mx-auto">SSL Certificate generated successfully. Your site is now secure and ready.</p>
                <button onClick={() => onProceed(domain)} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition shadow-xl shadow-slate-200">Launch Website Live</button>
              </div>
           )}
        </div>
        {step === 1 && <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><Plus className="rotate-45" size={24}/></button>}
      </div>
    </div>
  )
}

/* ─── 3. BUILDER PHASE ─── */
const DEFAULT_BLOCKS = [
  { id: 'hero', type: 'hero', title: 'Experience the Art of Modern Travel', subtitle: 'Book Your Stay', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', titleColor: 'text-slate-900', bgColor: 'bg-white' },
  { id: 'booking_engine', type: 'booking_engine', title: 'Find Your Perfect Sanctuary', subtitle: 'Real-time availability for exclusive residences.' },
  { id: 'room_list', type: 'room_list', title: 'Exquisite Living Spaces', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80', price: '250€' },
  { id: 'features', type: 'features', title: 'World-Class Hospitality', items: ['Concierge Service', 'Infinity Pool', 'Gastronomic Restaurant', 'Holistic Spa'] },
  { id: 'footer', type: 'footer', bgColor: 'bg-slate-900', brandInfo: 'HosFlow Collections', contactInfo: '+1 (555) 123-4567 | hospitality@hosflow.com' }
];

const TEMPLATES = [
  {
     id: 'luxury_hotel',
     name: 'Ultra-Luxury Hotel & Spa',
     category: 'Luxe',
     thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80',
     blocks: [
       { id: 'hero', type: 'hero', title: 'Where Luxury Meets Limitless Serenity', subtitle: 'Experience the Divine', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', titleColor: 'text-slate-900', bgColor: 'bg-white' },
       { id: 'booking_engine', type: 'booking_engine', title: 'Book Your Master Suite', subtitle: 'Direct booking for the most exclusive experiences.' },
       { id: 'features', type: 'features', title: 'Unparalleled Services', items: ['Private Butler', 'Michelin-star Dining', 'Full-service Wellness Spa', 'Helicopter Transfers'] },
       { id: 'room_list', type: 'room_list', title: 'Prestigious Room Collection' },
       { id: 'gallery', type: 'gallery', title: 'Glimpse into Paradise' },
       { id: 'footer', type: 'footer', bgColor: 'bg-slate-900', brandInfo: 'The Grand HosFlow Hotel', contactInfo: 'reservations@grandhosflow.com' }
     ]
  },
  {
     id: 'modern_villa',
     name: 'Boutique Mountain Chalet',
     category: 'Nature',
     thumbnail: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?auto=format&fit=crop&w=400&q=80',
     blocks: [
       { id: 'hero', type: 'hero', title: 'Chic Living in the Heart of the Alps', subtitle: 'Winter Season Open', image: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?auto=format&fit=crop&w=1200&q=80', titleColor: 'text-slate-900', bgColor: 'bg-slate-50' },
       { id: 'booking_engine', type: 'booking_engine', title: 'Find Your Basecamp', subtitle: 'Exclusive mountain retreats for the modern adventurer.' },
       { id: 'features', type: 'features', title: 'Mountain Highlights', items: ['Ski-in / Ski-out Access', 'Grand Fireplace Lounge', 'Outdoor Hot Tub', 'Private Ski Valet'] },
       { id: 'gallery', type: 'gallery', title: 'The Alpine Experience' },
       { id: 'footer', type: 'footer', bgColor: 'bg-black', brandInfo: 'Peak Point Chalets', contactInfo: 'ski@peakpoint.com' }
     ]
  },
  {
     id: 'riad_boutique',
     name: 'Authentic Moroccan Riad',
     category: 'Culture',
     thumbnail: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80',
     blocks: [
       { id: 'hero', type: 'hero', title: 'Ancient Soul, Modern Comfort', subtitle: 'Discover the Medina', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', titleColor: 'text-orange-950', bgColor: 'bg-orange-50' },
       { id: 'booking_engine', type: 'booking_engine', title: 'Reserve Your Sanctuary', subtitle: 'Immerse yourself in the tranquility of our traditional courtyard.' },
       { id: 'room_list', type: 'room_list', title: 'Artisan Suites', image: 'https://images.unsplash.com/photo-1548835154-8e100dcac04b?auto=format&fit=crop&w=600&q=80', price: '180€' },
       { id: 'gallery', type: 'gallery', title: 'Moroccan Textures', images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1548835154-8e100dcac04b?auto=format&fit=crop&w=600&q=80'] },
       { id: 'footer', type: 'footer', bgColor: 'bg-stone-900', brandInfo: 'Riad Al Nour', contactInfo: 'contact@riadalnour.com' }
     ]
  }
];

const REAL_DEMOS = [
  {
    id: 'demo-hotel',
    name: 'The Azure Grand Hotel',
    type: 'Hotel',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    status: 'Published',
    domain: 'azure-grand.hosflow.site',
    visits: '1.2k',
    conversion: '4.8%',
    blocks: [
      { id: 'hero', type: 'hero', title: 'Sophistication Meets Serenity', subtitle: 'Experience Grandeur', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80', bgColor: 'bg-slate-50' },
      { id: 'booking_engine', type: 'booking_engine', title: 'Find Your Suite', subtitle: 'Check live availability for the upcoming season.' },
      { id: 'features', type: 'features', title: 'World-Class Amenities', items: ['Michelin Star Dining', 'Infinity Rooftop Pool', 'Luxury Spa & Wellness', '24/7 Concierge'] },
      { id: 'room_list', type: 'room_list', title: 'Our Prestigious Suites', price: '450€' },
      { id: 'footer', type: 'footer', bgColor: 'bg-slate-900', brandInfo: 'Azure Grand Hotel Group', contactInfo: 'reservations@azuregrand.com' }
    ]
  },
  {
    id: 'demo-villa',
    name: 'Villa Serena Santorini',
    type: 'Villa',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
    status: 'Published',
    domain: 'serena-santorini.hosflow.site',
    visits: '850',
    conversion: '6.2%',
    blocks: [
      { id: 'hero', type: 'hero', title: 'Your Private Island Escape', subtitle: 'Reserve Villa', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', bgColor: 'bg-sky-50' },
      { id: 'booking_engine', type: 'booking_engine', title: 'Secure Your Stay', subtitle: 'Exclusive direct booking for our private collection.' },
      { id: 'gallery', type: 'gallery', title: 'The Property', images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80', 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80'] },
      { id: 'footer', type: 'footer', bgColor: 'bg-slate-900', brandInfo: 'Serena Villa Collection', contactInfo: 'vip@serenavilla.com' }
    ]
  }
];

const TemplateLibraryModal = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 lg:p-12">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl h-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
         <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
            <div>
               <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3"><LayoutTemplate className="text-indigo-600"/> Bibliothèque de Templates</h2>
               <p className="text-slate-500 font-medium mt-1">Choisissez une structure professionnelle générée par l'IA ou sélectionnez un thème métier.</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 transition"><X size={20}/></button>
         </div>
         <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {TEMPLATES.map(t => (
                  <div key={t.id} onClick={() => onSelect(t.blocks)} className="bg-white rounded-3xl p-4 border-2 border-transparent hover:border-indigo-500 shadow-sm hover:shadow-xl transition duration-300 cursor-pointer group hover:-translate-y-1">
                     <div className="aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden mb-5 relative group-hover:ring-4 group-hover:ring-indigo-100 transition">
                        <img src={t.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-700"/>
                        <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/50 transition duration-300 flex items-center justify-center">
                           <button className="bg-white text-indigo-700 font-black px-6 py-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300">Utiliser ce Template</button>
                        </div>
                     </div>
                     <div className="px-2">
                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 inline-block px-2.5 py-1 rounded-lg mb-2">{t.category}</div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{t.name}</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">{t.blocks.length} sections premium incluses.</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  )
}

const BuilderPhase = ({ siteContext, onPublish, initialBlocks, initialTheme }) => {
  const [device, setDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Real Dynamic State
  const [blocks, setBlocks] = useState(() => {
    if (initialBlocks) return initialBlocks;
    if (!siteContext) return DEFAULT_BLOCKS;
    
    // Improved AI mapping logic
    const context = siteContext.toLowerCase();
    let template = [...DEFAULT_BLOCKS];

    // Basic heuristic to pick a template based on prompt
    if (context.includes('riad')) {
      template = TEMPLATES.find(t => t.id === 'riad_boutique')?.blocks || template;
    } else if (context.includes('villa') || context.includes('beach')) {
      template = TEMPLATES.find(t => t.id === 'luxury_hotel')?.blocks || template;
    } else if (context.includes('mountain') || context.includes('chalet') || context.includes('ski')) {
      template = TEMPLATES.find(t => t.id === 'mountain_chalet')?.blocks || template;
    }

    return template.map(block => {
      if (block.id === 'hero') {
        return { 
          ...block, 
          title: siteContext.length > 30 ? siteContext : `Experience the Ultimate ${siteContext}`,
          subtitle: `Explore ${siteContext.split(' ')[0]}`
        };
      }
      if (block.id === 'footer') {
        return { ...block, brandInfo: `${siteContext.split(' ')[0]} Collections` };
      }
      return block;
    });
  });

  const [selectedBlockId, setSelectedBlockId] = useState('hero');
  const [showTemplates, setShowTemplates] = useState(false);
  const [globalFont, setGlobalFont] = useState(siteContext?.toLowerCase().includes('villa') ? 'font-serif' : 'font-sans');
  const [activeTab, setActiveTab] = useState('design'); 
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [themeOptions, setThemeOptions] = useState(initialTheme || {
     primaryColor: 'indigo-600',
     borderRadius: 'xl',
     glassmorphism: true
  });
  const [seoData, setSeoData] = useState({
     title: siteContext || 'Mon Magnifique Établissement',
     description: 'Réservez votre séjour inoubliable avec nous. Meilleur prix garanti.',
     keywords: 'hôtel, réservation, luxe, voyage'
  });

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const updateBlock = (id, key, value) => {
     setBlocks(blocks.map(b => b.id === id ? { ...b, [key]: value } : b));
  };

  const handleTemplateSelect = (selectedBlocks) => {
     setBlocks(selectedBlocks);
     setShowTemplates(false);
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50 flex flex-col font-sans">
      
      {/* BUILDER HEADER */}
      <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 relative shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
           <div className="w-9 h-9 bg-slate-900 rounded-xl flex flex-col justify-center items-center gap-0.5 shadow-md">
             <div className="w-3.5 h-0.5 bg-white rounded-full"></div>
             <div className="w-4.5 h-1 bg-white rounded-full"></div>
             <div className="w-2.5 h-0.5 bg-white rounded-full"></div>
           </div>
           <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">Antigravity <span className="font-medium text-slate-400">Builder</span></span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">Professional V2</span>
           </div>
        </div>

        <div className="flex items-center gap-8 md:absolute md:left-1/2 md:-translate-x-1/2">
           <div className="flex gap-8 text-[13px] font-bold text-slate-500">
             <button className="text-slate-900 relative">Web Design <div className="absolute -bottom-6 left-0 w-full h-0.5 bg-indigo-600"></div></button>
             <button onClick={() => setShowTemplates(true)} className="hover:text-indigo-600 transition flex items-center gap-1.5 group">
                <Layers size={14} className="group-hover:-translate-y-0.5 transition"/> Library
             </button>
             <button onClick={() => setActiveTab('seo')} className={`hover:text-slate-900 transition ${activeTab === 'seo' ? 'text-indigo-600 font-bold underline' : ''}`}>Pages & SEO</button>
             <button onClick={() => setActiveTab('theme')} className={`hover:text-slate-900 transition ${activeTab === 'theme' ? 'text-indigo-600 font-bold underline' : ''}`}>Theme Settings</button>
           </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setDevice('desktop')} className={`p-2 rounded-lg text-slate-500 transition-all ${device === 'desktop' ? 'bg-white shadow relative z-10 text-slate-900' : 'hover:bg-slate-200 hover:text-slate-700'}`}><Monitor size={16}/></button>
              <button onClick={() => setDevice('tablet')} className={`p-2 rounded-lg text-slate-500 transition-all ${device === 'tablet' ? 'bg-white shadow relative z-10 text-slate-900' : 'hover:bg-slate-200 hover:text-slate-700'}`}><Tablet size={16}/></button>
              <button onClick={() => setDevice('mobile')} className={`p-2 rounded-lg text-slate-500 transition-all ${device === 'mobile' ? 'bg-white shadow relative z-10 text-slate-900' : 'hover:bg-slate-200 hover:text-slate-700'}`}><Smartphone size={16}/></button>
           </div>
           
           <div className="h-8 w-px bg-slate-200"></div>
           
           <div className="flex items-center gap-3">
              <button onClick={() => setShowLivePreview(true)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"><Play size={14} className="fill-slate-500"/> Preview</button>
              <button onClick={() => setIsPublishing(true)} className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition active:scale-95 flex items-center gap-2">Publish Domain <ArrowRight size={14}/></button>
           </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
         
         {/* SIDEBAR NAVIGATION (Thin) */}
         <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 shrink-0 z-20">
            <button className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shadow-sm"><Layers size={20}/></button>
            <button className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition"><LayoutTemplate size={20}/></button>
            <button className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition"><ImageIcon size={20}/></button>
            <button className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition"><Settings size={20}/></button>
         </div>

         {/* MAIN CANVAS AREA (Dynamic Render) */}
         <div className="flex-1 bg-slate-50 p-4 md:p-12 overflow-y-auto flex justify-center relative shadow-inner [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:2rem_2rem]">
            
            <div className={`transition-all duration-500 origin-top flex flex-col min-h-[800px] relative
               ${device === 'desktop' ? 'w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5' : 
                 device === 'tablet' ? 'w-[768px] bg-white rounded-[2.5rem] border-[16px] border-slate-900 overflow-hidden outline outline-1 outline-slate-300 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]' : 
                 'w-[375px] bg-white rounded-[3.5rem] border-[14px] border-slate-900 overflow-hidden outline outline-1 outline-slate-300 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]'}
            `}>
               {/* Device Bezels/Notches */}
               {device === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-3xl z-50"></div>}
               {device === 'tablet' && <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-1.5 h-16 bg-slate-800 rounded-l-full z-50"></div>}
               
               {/* Site Header */}
               <div className={`h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white shrink-0 hover:bg-slate-50 transition border-[1px] m-1 rounded-t-[20px] ${selectedBlockId === 'header' ? 'border-indigo-500 shadow-md ring-4 ring-indigo-50 relative z-20' : 'border-transparent'}`} onClick={() => setSelectedBlockId('header')}>
                  <div className={`font-black text-2xl text-slate-800 flex items-center gap-2 ${globalFont}`}>
                     <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white"><span className="text-sm">B</span></div> 
                     {siteContext ? siteContext.split(' ')[0] : 'BRAND'}
                  </div>
                  <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600 uppercase tracking-widest text-[10px]">
                     <span className="text-slate-900 border-b-2 border-slate-900 pb-1 cursor-pointer transition">Home</span>
                     <span className="cursor-pointer hover:text-slate-900 transition pb-1">Rooms</span>
                     <span className="cursor-pointer hover:text-slate-900 transition pb-1">Contact</span>
                  </div>
               </div>

               {/* Dynamic Blocks Mapper */}
               {blocks.map(block => {
                 const isSelected = selectedBlockId === block.id;

                 // Professional Blocks Integration
                 if (block.type === 'booking_engine') {
                   return <BookingEngineBlock key={block.id} block={block} isSelected={isSelected} onSelect={() => setSelectedBlockId(block.id)} globalFont={globalFont} />;
                 }
                 if (block.type === 'room_list') {
                   return <RoomListingBlock key={block.id} block={block} isSelected={isSelected} onSelect={() => setSelectedBlockId(block.id)} globalFont={globalFont} />;
                 }
                 if (block.type === 'gallery' || block.type === 'gallery_grid') {
                   return <GalleryGridBlock key={block.id} block={block} isSelected={isSelected} onSelect={() => setSelectedBlockId(block.id)} globalFont={globalFont} />;
                 }

                 if (block.type === 'hero') {
                    const [currentSlide, setCurrentSlide] = useState(0);
                    const slides = block.slides || [block.image];
                    
                    return (
                      <div 
                         key={block.id} 
                         onClick={() => setSelectedBlockId(block.id)}
                         className={`${block.bgColor || 'bg-slate-50'} p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden cursor-pointer transition-all duration-300 m-2 rounded-2xl border-2 ${isSelected ? 'border-indigo-500 shadow-md ring-4 ring-indigo-50' : 'border-transparent hover:border-indigo-300/50 hover:bg-indigo-50/10'}`}
                      >
                         <div className={`absolute top-4 right-4 z-20 transition-all ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                            <div className="bg-indigo-600 flex text-white rounded-lg shadow-xl overflow-hidden backdrop-blur-sm">
                               <button className="p-2 hover:bg-indigo-700 transition"><GripHorizontal size={14}/></button>
                            </div>
                         </div>
                         
                         <div className="flex-1 order-2 md:order-1 relative z-10 text-center md:text-left">
                            <h1 className={`text-4xl md:text-6xl ${globalFont} ${block.titleColor || 'text-slate-900'} leading-[1.1] mb-8 font-medium animate-in slide-in-from-left duration-700`}>
                              {block.title}
                            </h1>
                            <button className={`bg-${themeOptions.primaryColor} text-white px-8 py-4 rounded-${themeOptions.borderRadius} font-bold shadow-lg shadow-indigo-200 hover:-translate-y-1 transition`}>{block.subtitle}</button>
                         </div>
                         <div className="flex-1 order-1 md:order-2 h-[450px] relative group/slider">
                            {slides.map((s, idx) => (
                               <img 
                                 key={idx}
                                 src={s} 
                                 className={`absolute inset-0 rounded-[2rem] shadow-2xl object-cover w-full h-full transition-opacity duration-1000 ${currentSlide === idx ? 'opacity-100' : 'opacity-0'}`} 
                                 alt="Hero" 
                               />
                            ))}
                            {slides.length > 1 && (
                               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                  {slides.map((_, idx) => (
                                     <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }} className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-6' : 'bg-white/40'}`}></button>
                                  ))}
                               </div>
                            )}
                         </div>
                      </div>
                    )
                 }

                 if (block.type === 'booking_bar') {
                    return (
                      <div 
                         key={block.id} 
                         onClick={() => setSelectedBlockId(block.id)}
                         className={`mx-8 -mt-10 mb-8 relative z-20 cursor-pointer transition-all duration-300 rounded-2xl border-2 ${isSelected ? 'border-indigo-500 shadow-xl ring-4 ring-indigo-50 scale-[1.02]' : 'border-transparent shadow-lg hover:border-indigo-300/50 hover:shadow-xl hover:-translate-y-1'}`}
                      >
                         <div className={`p-4 md:p-6 ${block.bgColor} rounded-xl flex flex-col md:flex-row items-center gap-4`}>
                            <div className="flex-1 w-full bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                               <label className={`text-[10px] font-black uppercase tracking-wider ${block.textColor} opacity-70 block mb-1`}>Check in - Check out</label>
                               <div className={`font-medium ${block.textColor}`}>24 Oct - 26 Oct</div>
                            </div>
                            <div className="flex-1 w-full bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                               <label className={`text-[10px] font-black uppercase tracking-wider ${block.textColor} opacity-70 block mb-1`}>Guests</label>
                               <div className={`font-medium ${block.textColor}`}>2 Adults, 0 Children</div>
                            </div>
                            <button className="w-full md:w-auto bg-white text-slate-900 px-8 py-4 rounded-xl font-bold shadow-md hover:scale-105 transition mt-2 md:mt-0 whitespace-nowrap">
                               {block.buttonText}
                            </button>
                         </div>
                      </div>
                    )
                 }

                 if (block.type === 'products') {
                    return (
                      <div 
                         key={block.id} 
                         onClick={() => setSelectedBlockId(block.id)}
                         className={`p-8 md:p-16 relative cursor-pointer m-2 rounded-2xl border-2 transition-all duration-300 ${isSelected ? 'border-indigo-500/50 bg-indigo-50/20 shadow-sm ring-2 ring-indigo-50' : 'border-transparent hover:border-indigo-200'}`}
                      >
                         <h2 className={`text-4xl ${globalFont} text-slate-900 mb-12 text-center relative z-20 text-balance pointer-events-none`}>{block.title}</h2>
                         
                         <div className={`grid grid-cols-2 lg:grid-cols-${block.itemsCount >= 4 ? '4' : block.itemsCount} gap-8 relative z-20 pointer-events-none`}>
                            {Array.from({ length: block.itemsCount }).map((_, i) => (
                               <div key={i} className="flex flex-col gap-4 group">
                                  <div className="bg-slate-100 rounded-[24px] aspect-[4/5] overflow-hidden shadow-sm relative">
                                     <img src={block.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700"/>
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                  </div>
                                  <div className="flex justify-between items-center px-1">
                                     <span className={`font-bold text-slate-800 text-lg ${globalFont}`}>Listing Suite {i+1}</span>
                                     <span className="font-bold text-slate-500 text-sm border border-slate-200 px-3 py-1 rounded-full">{block.price}</span>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    )
                 }

                 if (block.type === 'features') {
                    return (
                      <div key={block.id} onClick={() => setSelectedBlockId(block.id)} className={`p-8 md:p-16 m-2 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-indigo-500/50 bg-white ring-2 ring-indigo-50' : 'border-transparent hover:border-slate-200'}`}>
                         <h3 className={`text-center text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-12 ${globalFont}`}>{block.title}</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {block.items.map((item, idx) => (
                               <div key={idx} className="flex flex-col items-center text-center gap-3">
                                 <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300"><CheckCircle2 size={24}/></div>
                                 <span className="font-semibold text-slate-700 text-sm">{item}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                    )
                 }

                 if (block.type === 'gallery') {
                    const [activeIndex, setActiveIndex] = useState(0);
                    const isCarousel = block.variant === 'carousel';

                    return (
                      <div key={block.id} onClick={() => setSelectedBlockId(block.id)} className={`p-4 md:p-8 m-2 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? 'border-indigo-500/50 bg-white ring-2 ring-indigo-50 shadow-lg' : 'border-transparent hover:border-slate-200'}`}>
                         <h2 className={`text-4xl ${globalFont} text-slate-900 mb-8 text-center`}>{block.title}</h2>
                         
                         {isCarousel ? (
                            <div className="relative group/carousel overflow-hidden rounded-[2.5rem]">
                               <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                                  {block.images.map((img, idx) => (
                                     <div key={idx} className="w-full shrink-0 aspect-[16/9] relative">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
                                           <div className="text-sm font-black uppercase tracking-widest text-lime-400 mb-2">Featured Property</div>
                                           <div className="text-3xl font-bold">{block.captions?.[idx] || 'Paradise Collection'}</div>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                               {/* Navigation Arrows */}
                               <button onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => (prev > 0 ? prev - 1 : block.images.length - 1)); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition"><ArrowLeft size={24}/></button>
                               <button onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => (prev < block.images.length - 1 ? prev + 1 : 0)); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover/carousel:opacity-100 transition"><ArrowRight size={24}/></button>
                               {/* Dots */}
                               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                  {block.images.map((_, idx) => (
                                     <div key={idx} className={`w-2 h-2 rounded-full transition-all ${activeIndex === idx ? 'bg-white w-8' : 'bg-white/40'}`}></div>
                                  ))}
                               </div>
                            </div>
                         ) : (
                            <div className="grid grid-cols-3 gap-4">
                               {block.images.map((img, idx) => (
                                  <div key={idx} className={`rounded-3xl overflow-hidden aspect-square ${idx === 0 ? 'col-span-2 row-span-2 aspect-auto shadow-xl' : 'shadow-md'}`}>
                                     <img src={img} className="w-full h-full object-cover hover:scale-110 transition duration-700" />
                                  </div>
                               ))}
                            </div>
                         )}
                      </div>
                    )
                 }

                 if (block.type === 'footer') {
                    return (
                      <div key={block.id} onClick={() => setSelectedBlockId(block.id)} className={`p-12 md:p-16 m-2 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8 ${block.bgColor} ${isSelected ? 'border-indigo-500 shadow-xl' : 'border-transparent'}`}>
                         <div>
                            <div className={`text-2xl font-bold text-white mb-2 ${globalFont}`}>{block.brandInfo}</div>
                            <div className="text-slate-400 text-sm">{block.contactInfo}</div>
                         </div>
                         <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold shadow-md hover:scale-105 transition">Contact Us</button>
                      </div>
                    )
                  }

                  if (block.type === 'map') {
                     return (
                        <div key={block.id} onClick={() => setSelectedBlockId(block.id)} className={`p-8 md:p-16 m-2 rounded-2xl border-2 transition-all cursor-pointer bg-slate-100 flex flex-col items-center ${isSelected ? 'border-indigo-500' : 'border-transparent'}`}>
                           <div className="w-full h-[400px] bg-slate-200 rounded-3xl relative overflow-hidden flex items-center justify-center">
                              <Globe size={60} className="text-slate-300 animate-pulse" />
                              <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+0000ff(-74.006,40.7128)/-74.006,40.7128,13/800x400?access_token=pk.fake')] bg-cover opacity-50"></div>
                              <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 max-w-xs">
                                 <div className="font-bold text-slate-800">{block.title || 'Visit Us'}</div>
                                 <div className="text-xs text-slate-500 mt-1">{block.address || 'Loading location...'}</div>
                              </div>
                           </div>
                        </div>
                     )
                  }

                  if (block.type === 'contact') {
                     return (
                        <div key={block.id} onClick={() => setSelectedBlockId(block.id)} className={`p-8 md:p-16 m-2 rounded-2xl border-2 transition-all cursor-pointer ${block.bgColor || 'bg-white'} ${isSelected ? 'border-indigo-500' : 'border-transparent'}`}>
                           <div className="max-w-2xl mx-auto text-center md:text-left">
                              <h2 className={`text-4xl ${globalFont} ${block.bgColor?.includes('slate-900') ? 'text-white' : 'text-slate-800'} mb-8`}>{block.title || 'Contact us'}</h2>
                              <div className="space-y-4">
                                 <input type="text" placeholder="Your Name" className="w-full bg-black/5 border-2 border-transparent p-4 rounded-xl outline-none focus:border-indigo-500 transition" />
                                 <input type="email" placeholder="Your Email" className="w-full bg-black/5 border-2 border-transparent p-4 rounded-xl outline-none focus:border-indigo-500 transition" />
                                 <textarea placeholder="Tell us about your trip..." className="w-full bg-black/5 border-2 border-transparent p-4 rounded-xl outline-none focus:border-indigo-500 transition h-32"></textarea>
                                 <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200">Send Message</button>
                              </div>
                           </div>
                        </div>
                     )
                  }

                  if (block.type === 'siteminder_features') {
                     return (
                        <div key={block.id} onClick={() => setSelectedBlockId(block.id)} className={`p-8 md:p-24 m-2 rounded-3xl border-2 transition-all cursor-pointer bg-white ${isSelected ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-transparent hover:border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.03)]'}`}>
                           <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20">
                              <div className="lg:w-1/2">
                                 <h2 className={`text-6xl font-bold text-slate-900 leading-[1.1] mb-8 ${globalFont}`}>{block.title.split(' ').slice(0, -1).join(' ')} <span className="text-indigo-600">{block.title.split(' ').pop()}</span></h2>
                                 <div className="flex gap-4">
                                    <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-indigo-100 hover:-translate-y-0.5 transition">{block.ctaPrimary}</button>
                                    <button className="bg-white border-2 border-slate-200 text-slate-800 px-8 py-3.5 rounded-lg font-bold hover:bg-slate-50 transition">{block.ctaSecondary}</button>
                                 </div>
                              </div>
                              <div className="lg:w-1/2 space-y-4">
                                 {(block.features || []).map(feat => (
                                    <div key={feat.id} className="group p-6 rounded-2xl bg-white border border-slate-100 flex items-center gap-6 hover:shadow-xl hover:scale-[1.02] transition duration-300">
                                       <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center text-lime-600 group-hover:scale-110 transition">
                                          {feat.icon === 'shield' ? <ShieldCheck size={24}/> : feat.icon === 'zap' ? <Zap size={24}/> : <Menu size={24}/>}
                                       </div>
                                       <span className="font-bold text-slate-800 text-lg">{feat.text}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                           {/* Compliance Footer Bar */}
                           <div className="mt-20 p-8 bg-slate-50 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-100 shadow-inner">
                              <div className="flex items-center gap-4">
                                 <div className="text-[10px] font-black uppercase text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">Security</div>
                                 <div className="font-bold text-slate-800">PCI certified and GDPR compliant</div>
                              </div>
                              <div className="flex gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition duration-500">
                                 <div className="flex items-center gap-2 font-black text-xl text-slate-400 italic"><ShieldCheck size={20}/> PCI <span className="text-xs non-italic font-bold ml-1 text-slate-300">DSS COMPLIANT</span></div>
                                 <div className="flex items-center gap-2 font-black text-xl text-slate-400"><CheckCircle2 size={20} className="text-green-500"/> SSL <span className="text-xs font-bold text-slate-300">SECURE</span></div>
                                 <div className="flex items-center gap-2 font-black text-xl text-slate-400 underline decoration-green-400 decoration-4 underline-offset-4 tracking-tighter">GDPR</div>
                              </div>
                           </div>
                        </div>
                     )
                  }

                  if (block.type === 'siteminder_testimonials') {
                     return (
                        <div key={block.id} onClick={() => setSelectedBlockId(block.id)} className={`p-8 md:p-24 m-2 rounded-3xl border-2 transition-all cursor-pointer bg-slate-50 relative overflow-hidden ${isSelected ? 'border-indigo-500' : 'border-transparent'}`}>
                           <div className="absolute top-0 right-0 w-96 h-96 bg-lime-200/20 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
                           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 relative">Customer Stories</h3>
                           <h2 className={`text-5xl font-bold text-slate-900 mb-16 relative ${globalFont}`}>{block.title}</h2>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                              {(block.items || []).map(item => (
                                 <div key={item.id} className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white shadow-xl flex flex-col gap-8 hover:-translate-y-2 transition duration-500">
                                    <div className="text-slate-700 text-lg leading-relaxed font-medium line-clamp-4 italic">{item.text}</div>
                                    <div className="flex items-center gap-3">
                                       <div className="w-1 h-8 bg-lime-400 rounded-full"></div>
                                       <div className="text-sm font-black text-slate-400 uppercase tracking-widest">{item.author}</div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )
                  }
                 return null;
               })}

               {/* Add Section Button */}
               <div className="p-8 flex justify-center mt-auto">
                  <button className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 px-6 py-3 rounded-xl transition border-2 border-indigo-100 border-dashed">
                     <Plus size={18}/> Add New Section
                  </button>
               </div>

            </div>
         </div>

         {/* RIGHT SIDEBAR INSPECTOR */}
         <div className="w-80 bg-white border-l border-slate-200 flex flex-col z-10 shrink-0 relative shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)]">
            
            {activeTab === 'seo' && (
               <div className="flex-1 flex flex-col overflow-y-auto">
                  <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10 flex justify-between items-center">
                     <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2"><Globe size={14} className="text-indigo-600"/> Pages & SEO</h3>
                     <button onClick={() => setActiveTab('design')} className="text-slate-400 hover:text-slate-800"><X size={16}/></button>
                  </div>
                  <div className="p-6 space-y-6">
                     <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <div className="text-[10px] font-black text-indigo-700 uppercase mb-2">Google Preview</div>
                        <div className="text-blue-700 font-medium text-sm truncate">{seoData.title}</div>
                        <div className="text-green-700 text-[10px] truncate">https://votre-site.antigravity.live</div>
                        <div className="text-slate-500 text-[10px] mt-1 line-clamp-2">{seoData.description}</div>
                     </div>
                     <div className="space-y-4">
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Meta Title</label>
                           <input value={seoData.title} onChange={e => setSeoData({...seoData, title: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Meta Description</label>
                           <textarea value={seoData.description} onChange={e => setSeoData({...seoData, description: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-indigo-500 h-24 resize-none" />
                        </div>
                        <button className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-xs hover:bg-slate-200 transition">+ Add New Page</button>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'theme' && (
               <div className="flex-1 flex flex-col overflow-y-auto">
                  <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10 flex justify-between items-center">
                     <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2"><Settings size={14} className="text-indigo-600"/> Theme Settings</h3>
                     <button onClick={() => setActiveTab('design')} className="text-slate-400 hover:text-slate-800"><X size={16}/></button>
                  </div>
                  <div className="p-6 space-y-8">
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-tighter">Color Palette</label>
                        <div className="grid grid-cols-4 gap-3">
                           {['indigo-600', 'rose-500', 'emerald-600', 'amber-500', 'sky-500', 'slate-900', 'violet-600', 'orange-600'].map(color => (
                              <button 
                                 key={color} 
                                 onClick={() => setThemeOptions({...themeOptions, primaryColor: color})}
                                 className={`w-full aspect-square rounded-full border-2 transition ${themeOptions.primaryColor === color ? 'border-slate-800 ring-4 ring-slate-100' : 'border-transparent'}`}
                                 style={{ backgroundColor: `var(--tw-color-${color.replace('-', ' ')})` }}
                              >
                                 <div className={`w-full h-full bg-${color} rounded-full`}></div>
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-bold text-slate-600">Glassmorphism UI</span>
                           <button onClick={() => setThemeOptions({...themeOptions, glassmorphism: !themeOptions.glassmorphism})} className={`w-10 h-5 rounded-full relative transition ${themeOptions.glassmorphism ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${themeOptions.glassmorphism ? 'right-0.5' : 'left-0.5 shadow-sm'}`}></div>
                           </button>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Global Border Radius</label>
                           <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                              {['none', 'md', 'xl', '3xl'].map(r => (
                                 <button key={r} onClick={() => setThemeOptions({...themeOptions, borderRadius: r})} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${themeOptions.borderRadius === r ? 'bg-white shadow text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>{r.toUpperCase()}</button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'design' && (
               selectedBlock ? (
              <div className="flex-1 flex flex-col overflow-y-auto w-full">
                 <div className="p-5 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-10 flex items-center justify-between">
                    <div>
                       <div className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-1">Editor <ChevronRight size={10} className="inline opacity-50"/> {selectedBlock ? selectedBlock.type : 'general'}</div>
                       <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm flex items-center gap-2">
                          {selectedBlockId === 'header' ? <Layout size={16}/> : selectedBlock?.type === 'hero' ? <ImageIcon size={16}/> : selectedBlock?.type === 'booking_bar' ? <Calendar size={16}/> : <Box size={16}/>}
                          {selectedBlockId === 'header' ? 'Header Settings' : selectedBlock?.type}
                       </h3>
                    </div>
                    <button onClick={() => setSelectedBlockId(null)} className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-lg transition"><X size={16}/></button>
                 </div>

                 <div className="p-6 space-y-8">
                   
                   {/* Typography Settings (Global) -> Show on header or hero for demo */}
                   {(selectedBlockId === 'header' || selectedBlock?.type === 'hero') && (
                      <div>
                         <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">Global Typography</h4>
                         <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">Heading Typeface</label>
                            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                               <button onClick={() => setGlobalFont('font-serif')} className={`py-2 text-sm rounded-lg transition font-serif ${globalFont === 'font-serif' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>Playfair (Villa)</button>
                               <button onClick={() => setGlobalFont('font-sans')} className={`py-2 text-sm rounded-lg transition font-sans font-bold ${globalFont === 'font-sans' ? 'bg-white shadow text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-100'}`}>Inter (Modern)</button>
                            </div>
                         </div>
                      </div>
                   )}

                   {/* Contextual Settings based on Block Type */}
                   {selectedBlock && selectedBlockId !== 'header' && (
                     <>
                   <div>
                      <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">Content</h4>
                   <div className="space-y-4">
                      <div>
                         <label className="text-xs font-bold text-slate-500 mb-1.5 block">Heading Text</label>
                         <textarea 
                           value={selectedBlock.title || ''} 
                           onChange={e => updateBlock(selectedBlock.id, 'title', e.target.value)} 
                           className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none h-20 shadow-sm"
                         />
                      </div>
                      
                      {selectedBlock.type === 'hero' && (
                         <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">Button Action Text</label>
                            <input 
                              type="text" 
                              value={selectedBlock.subtitle || ''} 
                              onChange={e => updateBlock(selectedBlock.id, 'subtitle', e.target.value)} 
                              className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition shadow-sm"
                            />
                         </div>
                       )}

                       {selectedBlock.type === 'booking_engine' && (
                         <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3">
                               <CalendarDays size={18} className="text-amber-600"/>
                               <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Channex API Integration Active</span>
                            </div>
                            <div>
                               <label className="text-xs font-bold text-slate-500 mb-1.5 block">Engine Subtitle</label>
                               <input 
                                 type="text" 
                                 value={selectedBlock.subtitle || ''} 
                                 onChange={e => updateBlock(selectedBlock.id, 'subtitle', e.target.value)} 
                                 className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-medium focus:border-indigo-500 transition shadow-sm outline-none"
                               />
                            </div>
                         </div>
                       )}

                       {selectedBlock.type === 'room_list' && (
                         <div className="space-y-4">
                            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center gap-3">
                               <Layout size={18} className="text-indigo-600"/>
                               <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest">Auto-Syncing with PMS Inventory</span>
                            </div>
                            <div>
                               <label className="text-xs font-bold text-slate-500 mb-1.5 block">Price Display</label>
                               <input 
                                 type="text" 
                                 value={selectedBlock.price || 'From 150€'} 
                                 onChange={e => updateBlock(selectedBlock.id, 'price', e.target.value)} 
                                 className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-medium focus:border-indigo-500 transition shadow-sm outline-none"
                               />
                            </div>
                         </div>
                       )}


                      {selectedBlock.type === 'booking_bar' && (
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">Search Button Text</label>
                           <input 
                             type="text" 
                             value={selectedBlock.buttonText || ''} 
                             onChange={e => updateBlock(selectedBlock.id, 'buttonText', e.target.value)} 
                             className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition shadow-sm"
                           />
                        </div>
                      )}

                      {selectedBlock.type === 'products' && (
                        <>
                           <div>
                              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Item Price / Tag</label>
                              <input 
                                type="text" 
                                value={selectedBlock.price || ''} 
                                onChange={e => updateBlock(selectedBlock.id, 'price', e.target.value)} 
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition shadow-sm"
                              />
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-500 text-xs">Number of Items</span>
                              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                <button onClick={() => updateBlock(selectedBlock.id, 'itemsCount', Math.max(1, selectedBlock.itemsCount - 1))} className="px-3 py-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition">-</button>
                                <span className="px-3 py-1 font-bold border-x border-slate-200 bg-white text-slate-800">{selectedBlock.itemsCount}</span>
                                <button onClick={() => updateBlock(selectedBlock.id, 'itemsCount', Math.min(8, selectedBlock.itemsCount + 1))} className="px-3 py-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition">+</button>
                              </div>
                           </div>
                           <div className="pt-2">
                              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between">
                                 <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight">Channel Manager Sync</span>
                                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                              </div>
                           </div>
                        </>
                      )}

                      {selectedBlock.type === 'features' && (
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1.5 block">Feature Items (comma separated)</label>
                           <textarea 
                             value={(selectedBlock.items || []).join(', ')} 
                             onChange={e => updateBlock(selectedBlock.id, 'items', e.target.value.split(',').map(item => item.trim()))} 
                             className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none h-20 shadow-sm"
                           />
                        </div>
                      )}

                      {selectedBlock.type === 'siteminder_features' && (
                        <div className="space-y-6">
                           <div>
                              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Section Tagline</label>
                              <input value={selectedBlock.tagline} onChange={e => updateBlock(selectedBlock.id, 'tagline', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-indigo-500 outline-none transition shadow-sm font-medium"/>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-tighter">Features Stack</label>
                              {(selectedBlock.features || []).map((feat, idx) => (
                                 <div key={feat.id} className="flex gap-2 mb-3">
                                    <input value={feat.text} onChange={e => {
                                       const nf = [...selectedBlock.features];
                                       nf[idx].text = e.target.value;
                                       updateBlock(selectedBlock.id, 'features', nf);
                                    }} className="flex-1 border border-slate-200 rounded-lg p-2 text-xs focus:border-indigo-500 outline-none font-medium"/>
                                    <button onClick={() => {
                                       const nf = selectedBlock.features.filter((_, i) => i !== idx);
                                       updateBlock(selectedBlock.id, 'features', nf);
                                    }} className="p-2 text-slate-400 hover:text-red-500"><X size={14}/></button>
                                 </div>
                              ))}
                              <button onClick={() => {
                                 const nf = [...(selectedBlock.features || []), { id: Date.now(), text: 'New feature...', icon: 'zap' }];
                                 updateBlock(selectedBlock.id, 'features', nf);
                              }} className="w-full py-2 bg-indigo-50 text-indigo-600 font-bold text-[10px] rounded-lg border border-dashed border-indigo-200 hover:bg-indigo-100 transition mt-2">+ Add Feature Item</button>
                           </div>
                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Primary CTA</label>
                                 <input value={selectedBlock.ctaPrimary} onChange={e => updateBlock(selectedBlock.id, 'ctaPrimary', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-indigo-600"/>
                              </div>
                              <div>
                                 <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Secondary CTA</label>
                                 <input value={selectedBlock.ctaSecondary} onChange={e => updateBlock(selectedBlock.id, 'ctaSecondary', e.target.value)} className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-600"/>
                              </div>
                           </div>
                        </div>
                      )}

                      {selectedBlock.type === 'siteminder_testimonials' && (
                        <div className="space-y-6">
                           <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-tighter">Testimonials</label>
                           {(selectedBlock.items || []).map((item, idx) => (
                              <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group">
                                 <button onClick={() => {
                                    const ni = selectedBlock.items.filter((_, i) => i !== idx);
                                    updateBlock(selectedBlock.id, 'items', ni);
                                 }} className="absolute -top-2 -right-2 w-6 h-6 bg-white shadow-md border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
                                 <textarea value={item.text} onChange={e => {
                                    const ni = [...selectedBlock.items];
                                    ni[idx].text = e.target.value;
                                    updateBlock(selectedBlock.id, 'items', ni);
                                 }} className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:border-indigo-500 outline-none h-24 resize-none font-medium text-slate-700 shadow-inner"/>
                                 <input value={item.author} onChange={e => {
                                    const ni = [...selectedBlock.items];
                                    ni[idx].author = e.target.value;
                                    updateBlock(selectedBlock.id, 'items', ni);
                                 }} className="w-full border border-slate-200 rounded-lg p-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white"/>
                              </div>
                           ))}
                           <button onClick={() => {
                              const ni = [...(selectedBlock.items || []), { id: Date.now(), text: 'New story...', author: 'Customer' }];
                              updateBlock(selectedBlock.id, 'items', ni);
                           }} className="w-full py-2 bg-indigo-50 text-indigo-600 font-bold text-[10px] rounded-lg border border-dashed border-indigo-200 hover:bg-indigo-100 transition">+ Add Testimonial</button>
                        </div>
                      )}

                      {selectedBlock.type === 'footer' && (
                        <>
                           <div>
                              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Brand Info</label>
                              <input 
                                type="text" 
                                value={selectedBlock.brandInfo || ''} 
                                onChange={e => updateBlock(selectedBlock.id, 'brandInfo', e.target.value)} 
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition shadow-sm"
                              />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Contact Info</label>
                              <input 
                                type="text" 
                                value={selectedBlock.contactInfo || ''} 
                                onChange={e => updateBlock(selectedBlock.id, 'contactInfo', e.target.value)} 
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm text-slate-800 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition shadow-sm"
                              />
                           </div>
                        </>
                      )}
                   </div>
                 </div>

                 {/* Universal Media Settings */}
                 <div>
                   <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider border-b border-slate-100 pb-2">Styling & Background</h4>
                   <div className="space-y-4">
                      {(selectedBlock.image !== undefined || (selectedBlock.type === 'gallery' && selectedBlock.images)) && (
                        <div>
                           <label className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">Image Source (URL) <Upload size={12} className="text-indigo-500"/></label>
                           {selectedBlock.type === 'gallery' ? (
                             <>
                                <textarea 
                                  value={(selectedBlock.images || []).join('\n')} 
                                  onChange={e => updateBlock(selectedBlock.id, 'images', e.target.value.split('\n').map(url => url.trim()))} 
                                  className="w-full border border-slate-200 rounded-lg p-2 text-[10px] text-slate-600 bg-slate-50 outline-none focus:border-indigo-400 transition resize-none h-24"
                                />
                                <div className="mt-4 flex items-center justify-between bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                   <div className="flex items-center gap-2">
                                      <Layout size={14} className="text-indigo-600"/>
                                      <span className="text-[10px] font-black uppercase text-indigo-700">Full Carousel Mode</span>
                                   </div>
                                   <button 
                                     onClick={() => updateBlock(selectedBlock.id, 'variant', selectedBlock.variant === 'carousel' ? 'grid' : 'carousel')}
                                     className={`w-10 h-5 rounded-full relative transition ${selectedBlock.variant === 'carousel' ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                   >
                                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${selectedBlock.variant === 'carousel' ? 'right-0.5' : 'left-0.5'}`}></div>
                                   </button>
                                </div>
                             </>
                           ) : (
                             <input 
                               type="text" 
                               value={selectedBlock.image || ''} 
                               onChange={e => updateBlock(selectedBlock.id, 'image', e.target.value)} 
                               className="w-full border border-slate-200 rounded-lg p-2 text-[10px] text-slate-600 bg-slate-50 outline-none focus:border-indigo-400 transition"
                             />
                           )}
                           
                           {selectedBlock.type !== 'gallery' && selectedBlock.image && (
                             <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm relative group">
                                <img src={selectedBlock.image} className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                                   <button className="bg-white text-slate-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg">Change Image</button>
                                </div>
                             </div>
                           )}
                           {selectedBlock.type === 'gallery' && selectedBlock.images && selectedBlock.images.length > 0 && (
                             <div className="mt-3 grid grid-cols-2 gap-2">
                               {selectedBlock.images.slice(0, 4).map((img, idx) => (
                                 <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                   <img src={img} className="w-full h-full object-cover"/>
                                 </div>
                               ))}
                             </div>
                           )}
                        </div>
                      )}

                      {(selectedBlock.type === 'hero' || selectedBlock.type === 'booking_bar' || selectedBlock.type === 'footer') && (
                         <div>
                            <label className="text-xs font-bold text-slate-500 mb-2 block">Background Palette / Color</label>
                            <select 
                              value={selectedBlock.bgColor || 'bg-slate-50'}
                              onChange={e => updateBlock(selectedBlock.id, 'bgColor', e.target.value)}
                              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-500 cursor-pointer bg-white"
                            >
                               <option value="bg-slate-50">Light Pearl (Default)</option>
                               <option value="bg-orange-50">Warm Desert (Riad)</option>
                               <option value="bg-sky-50">Ocean Blue (Villa)</option>
                               <option value="bg-slate-900 text-white">Dark Mode (Premium)</option>
                               <option value="bg-orange-600 text-white">Terracotta Accent</option>
                            </select>
                         </div>
                      )}
                   </div>
                </div>
                      {/* Advanced Settings Placeholders for Realism */}
                      <div className="mt-8 pt-8 border-t border-slate-100">
                         <h4 className="font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider">Advanced Settings</h4>
                         <div className="space-y-3">
                            <label className="flex items-center justify-between text-sm text-slate-600 font-medium">Enable Parallax effect <div className="w-8 h-4 bg-indigo-500 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute right-0.5 top-0.5"></div></div></label>
                            <label className="flex items-center justify-between text-sm text-slate-600 font-medium">SEO Indexing <div className="w-8 h-4 bg-slate-200 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div></div></label>
                            <label className="flex items-center justify-between text-sm text-slate-600 font-medium">Custom CSS <ChevronRight size={14}/></label>
                         </div>
                      </div>

                     </>
                   )}
                 </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 text-center gap-4">
                 <MousePointer2 size={32} className="text-slate-300 opacity-50"/>
                 <h3 className="text-slate-800 font-bold block mb-[-8px]">No Block Selected</h3>
                 <p className="text-sm font-medium leading-relaxed">Select any block on the canvas to inspect its settings, or click on the Header to change typography.</p>
              </div>
               )
            )}
         </div>

      </div>

      {showTemplates && <TemplateLibraryModal onSelect={handleTemplateSelect} onClose={() => setShowTemplates(false)} />}
      {isPublishing && <DomainPublishModal onClose={() => setIsPublishing(false)} onProceed={(domainStr) => onPublish(domainStr, blocks, themeOptions)} />}
      {showLivePreview && (
         <div className="fixed inset-0 bg-white z-[100] flex flex-col font-sans animate-in fade-in duration-300">
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-50">
               <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 text-white p-2 rounded-lg"><Play size={16} fill="white"/></div>
                  <span className="font-bold text-slate-800">Live Preview: <span className="text-slate-400 font-medium">{seoData.title}</span></span>
               </div>
               <div className="flex items-center gap-6">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                     <button onClick={() => setDevice('desktop')} className={`p-1.5 rounded-lg transition ${device === 'desktop' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}><Monitor size={14}/></button>
                     <button onClick={() => setDevice('tablet')} className={`p-1.5 rounded-lg transition ${device === 'tablet' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}><Tablet size={14}/></button>
                     <button onClick={() => setDevice('mobile')} className={`p-1.5 rounded-lg transition ${device === 'mobile' ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}><Smartphone size={14}/></button>
                  </div>
                  <button onClick={() => setShowLivePreview(false)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-black transition flex items-center gap-2"><X size={16}/> Close Preview</button>
               </div>
            </div>
            <div className={`flex-1 overflow-y-auto bg-slate-50 flex justify-center py-12 transition-all duration-700`}>
               <div className={`transition-all duration-700 h-fit bg-white shadow-2xl overflow-hidden
                  ${device === 'desktop' ? 'w-full max-w-7xl' : device === 'tablet' ? 'w-[768px] rounded-[3rem] border-[12px] border-slate-900' : 'w-[375px] rounded-[3.5rem] border-[14px] border-slate-900'}
               `}>
                  {/* Re-using the same block rendering logic but without editor wrappers */}
                  <div className={`h-20 flex items-center justify-between px-8 bg-white border-b border-slate-50 ${globalFont}`}>
                     <div className="font-black text-2xl text-slate-800 flex items-center gap-2">
                        <div className={`w-8 h-8 bg-${themeOptions.primaryColor} rounded-full flex items-center justify-center text-white text-sm`}>B</div>
                        {siteContext?.split(' ')[0] || 'BRAND'}
                     </div>
                  </div>
                  {blocks.map(block => (
                     <div key={block.id} className="relative">
                        {block.type === 'booking_engine' && <BookingEngineBlock block={block} globalFont={globalFont} />}
                        {block.type === 'room_list' && <RoomListingBlock block={block} globalFont={globalFont} />}
                        {block.type === 'gallery' && <GalleryGridBlock block={block} globalFont={globalFont} />}
                        
                        {block.type === 'hero' && (
                           <div className={`${block.bgColor || 'bg-slate-50'} py-20 px-12 flex flex-col md:flex-row items-center gap-12`}>
                              <div className="flex-1 text-center md:text-left">
                                 <h1 className={`text-5xl md:text-7xl ${globalFont} ${block.titleColor || 'text-slate-900'} leading-tight mb-8`}>{block.title}</h1>
                                 <button className={`bg-${themeOptions.primaryColor} text-white px-10 py-5 rounded-${themeOptions.borderRadius} font-bold text-lg shadow-xl`}>{block.subtitle}</button>
                              </div>
                              <div className="flex-1 h-[500px]">
                                 <img src={block.image} className={`w-full h-full object-cover rounded-${themeOptions.borderRadius === 'none' ? 'none' : '3xl'} shadow-2xl`} />
                              </div>
                           </div>
                        )}
                        {block.type === 'booking_bar' && (
                           <div className="px-12 -mt-12 mb-12 relative z-10">
                              <div className={`${block.bgColor || 'bg-white'} p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-4 items-center border border-slate-100`}>
                                 <div className="flex-1 w-full bg-slate-50 p-3 rounded-xl"><div className="text-[10px] font-black uppercase text-slate-400">Dates</div><div className="font-bold">24 Oct - 26 Oct</div></div>
                                 <div className="flex-1 w-full bg-slate-50 p-3 rounded-xl"><div className="text-[10px] font-black uppercase text-slate-400">Guests</div><div className="font-bold">2 Adults</div></div>
                                 <button className={`bg-${themeOptions.primaryColor} text-white px-12 py-4 rounded-${themeOptions.borderRadius} font-bold`}>{block.buttonText}</button>
                              </div>
                           </div>
                        )}
                        {block.type === 'products' && (
                           <div className="py-20 px-12 text-center">
                              <h2 className={`text-4xl ${globalFont} mb-12`}>{block.title}</h2>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                 {[1,2,3].map(i => (
                                    <div key={i} className="group">
                                       <div className={`aspect-[4/5] bg-slate-100 rounded-${themeOptions.borderRadius === 'none' ? 'none' : '3xl'} overflow-hidden mb-4 shadow-md`}>
                                          <img src={block.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                                       </div>
                                       <div className="flex justify-between items-center"><span className="font-bold">{block.title} {i}</span><span className="text-slate-500 font-bold">{block.price}</span></div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
                        {block.type === 'features' && (
                           <div className="py-20 px-12 bg-slate-50 text-center">
                              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-12">{block.title}</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                                 {block.items.map((it, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-4">
                                       <div className={`w-16 h-16 bg-${themeOptions.primaryColor}/10 text-${themeOptions.primaryColor} rounded-2xl flex items-center justify-center`}><CheckCircle2 size={32}/></div>
                                       <div className="font-bold text-slate-700">{it}</div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}
                        {block.type === 'contact' && (
                           <div className={`py-20 px-12 ${block.bgColor || 'bg-white'}`}>
                              <div className="max-w-xl mx-auto text-center">
                                 <h2 className={`text-4xl ${globalFont} mb-8`}>{block.title}</h2>
                                 <div className="space-y-4">
                                    <input placeholder="Name" className="w-full p-4 rounded-xl bg-slate-100 border-none outline-none" />
                                    <button className={`w-full bg-${themeOptions.primaryColor} text-white font-bold py-4 rounded-${themeOptions.borderRadius}`}>Send Message</button>
                                 </div>
                              </div>
                           </div>
                        )}
                        {block.type === 'footer' && (
                           <div className={`${block.bgColor} py-16 px-12 text-center text-white`}>
                              <div className={`text-3xl font-bold mb-4 ${globalFont}`}>{block.brandInfo}</div>
                              <div className="text-slate-400">{block.contactInfo}</div>
                              <div className="mt-8 pt-8 border-t border-white/10 text-xs text-white/30">© 2026 Powered by Antigravity HosFlow</div>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

/* ─── DOMAIN SEARCH & PURCHASE MODAL ─── */
const DomainSearchModal = ({ onPurchase, onClose }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [purchaseStep, setPurchaseStep] = useState('search'); // 'search' | 'checkout' | 'success'
  const [selectedDomain, setSelectedDomain] = useState(null);

  const handleSearch = () => {
    if (!query) return;
    setIsSearching(true);
    // Simulate API delay
    setTimeout(() => {
      const tlds = ['.com', '.net', '.org', '.io', '.me'];
      const mocks = tlds.map(tld => ({
        name: query.split('.')[0] + tld,
        price: tld === '.io' ? '49.99' : tld === '.com' ? '14.99' : '9.99',
        available: Math.random() > 0.3
      }));
      setResults(mocks);
      setIsSearching(false);
    }, 1200);
  };

  if (purchaseStep === 'success') {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-12 text-center shadow-2xl animate-in zoom-in-95">
           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} />
           </div>
           <h2 className="text-3xl font-black text-slate-800 mb-4">Domaine Réservé !</h2>
           <p className="text-slate-500 mb-8">Félicitations, <strong>{selectedDomain.name}</strong> vous appartient désormais. Nous configurons les serveurs DNS et le certificat SSL automatiquement.</p>
           <button 
             onClick={() => onPurchase(selectedDomain.name)}
             className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition shadow-xl"
           >
             Accéder au Builder
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Globe size={24} className="text-indigo-600"/> Antigravity Registrar</h2>
              <p className="text-sm text-slate-500 mt-1">Trouvez le nom de domaine parfait pour votre établissement.</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-800 focus:outline-none"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
           {purchaseStep === 'search' ? (
             <>
               <div className="relative mb-8">
                  <input 
                    type="text" 
                    placeholder="ex: villaparis, hotel-luxe..." 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 pr-32 text-lg font-bold text-slate-800 focus:border-indigo-500 transition outline-none shadow-sm"
                  />
                  <button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-8 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {isSearching ? <RefreshCcw size={18} className="animate-spin" /> : <Search size={20} />} Rechercher
                  </button>
               </div>

               {results && (
                 <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Résultats de recherche</h3>
                    {results.map((res, i) => (
                      <div key={i} className={`p-5 rounded-[1.5rem] border-2 flex items-center justify-between transition ${res.available ? 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md' : 'bg-slate-50 border-transparent opacity-60'}`}>
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${res.available ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                               <Globe size={18}/>
                            </div>
                            <div>
                               <div className="font-bold text-slate-800 text-lg">{res.name}</div>
                               <div className={`text-xs font-bold uppercase ${res.available ? 'text-green-500' : 'text-slate-400'}`}>{res.available ? 'Disponible' : 'Déjà pris'}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <div className="font-black text-slate-900">€{res.price}</div>
                               <div className="text-[10px] text-slate-400 font-bold uppercase">/ an</div>
                            </div>
                            {res.available && (
                              <button 
                                onClick={() => { setSelectedDomain(res); setPurchaseStep('checkout'); }}
                                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition"
                              >
                                Réserver
                              </button>
                            )}
                         </div>
                      </div>
                    ))}
                 </div>
               )}
             </>
           ) : (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><Globe size={120}/></div>
                   <div className="relative z-10">
                      <div className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-2">Domaine Sélectionné</div>
                      <div className="text-4xl font-black mb-1 tracking-tight">{selectedDomain.name}</div>
                      <div className="flex items-center gap-2 text-indigo-100 font-medium">
                         <ShieldCheck size={16}/> Protection WHOIS incluse • SSL Offert
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="font-bold text-slate-800">Détails de facturation</h3>
                   <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                         <span className="text-slate-500 font-medium">Abonnement annuel</span>
                         <span className="font-bold text-slate-800">€{selectedDomain.price}</span>
                      </div>
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                         <span className="text-slate-500 font-medium">Frais ICANN</span>
                         <span className="font-bold text-slate-800">€0.18</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                         <span className="text-slate-800 font-black text-lg">Total à payer</span>
                         <div className="text-right">
                            <span className="text-2xl font-black text-indigo-600">€{(parseFloat(selectedDomain.price) + 0.18).toFixed(2)}</span>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Facturation annuelle automatique</div>
                         </div>
                      </div>
                   </div>
                </div>

                <button 
                   onClick={() => setPurchaseStep('success')}
                   className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-3"
                >
                   <CreditCard size={24}/> Confirmer l'Achat
                </button>
                <p className="text-center text-[11px] text-slate-400 px-12">
                   En cliquant sur confirmer, vous acceptez les conditions de vente de Antigravity Registrar. Votre domaine sera activé dans quelques minutes.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};


/* ─── DNS SETTINGS MODAL ─── */
const DnsSettingsModal = ({ site, onClose }) => {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'records' | 'security'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [propagationStatus, setPropagationStatus] = useState(100);

  const refreshDns = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><Globe size={24} className="text-indigo-600"/> DNS Manager</h2>
              <p className="text-sm text-slate-500 mt-1">Domaine : <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-600 font-bold">{site.domain}</span></p>
           </div>
           <button onClick={onClose} className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 text-slate-400 transition hover:text-red-500"><X size={20}/></button>
        </div>

        <div className="flex border-b border-slate-100 px-8 bg-white overflow-x-auto gap-8">
           {[
             { id: 'summary', label: 'Vue d\'ensemble', icon: <Box size={16}/> },
             { id: 'records', label: 'Enregistrements', icon: <Layers size={16}/> },
             { id: 'security', label: 'Sécurité & SSL', icon: <ShieldCheck size={16}/> },
             { id: 'history', label: 'Historique', icon: <History size={16}/> },
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`py-4 text-sm font-bold flex items-center gap-2 whitespace-nowrap transition relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {tab.icon} {tab.label}
               {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
             </button>
           ))}
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
           {activeTab === 'summary' && (
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Propagation Mondiale</div>
                      <div className="flex items-end gap-3">
                         <div className="text-3xl font-black text-slate-800">{propagationStatus}%</div>
                         <div className="mb-1 text-green-500 font-bold text-xs">Propagé</div>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
                         <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                      <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Serveurs DNS</div>
                      <div className="space-y-1 font-mono text-[11px] text-slate-600">
                         <div>ns1.antigravity.live</div>
                         <div>ns2.antigravity.live</div>
                      </div>
                      <button className="text-indigo-600 font-bold text-[10px] uppercase mt-4 flex items-center gap-1 hover:underline">Modifier les NS <ExternalLink size={10}/></button>
                   </div>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-[1.5rem] p-6 flex gap-4">
                   <div className="text-green-500 bg-white p-3 rounded-2xl shadow-sm h-fit"><CheckCircle size={24}/></div>
                   <div>
                      <h3 className="font-bold text-green-800">Services Connectés</h3>
                      <p className="text-green-600 text-sm mt-1">Le site est correctement relié aux serveurs de réservation. Temps de réponse moyen : 42ms.</p>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'records' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="font-bold text-slate-800">Zone DNS</h3>
                   <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition flex items-center gap-2"><Plus size={14}/> Ajouter un record</button>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                         <tr><th className="p-4">Type</th><th className="p-4">Host</th><th className="p-4">Value</th><th className="p-4">TTL</th><th className="p-4"></th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[13px]">
                         {[
                           { type: 'A', host: '@', value: '76.223.105.230', ttl: '3600' },
                           { type: 'CNAME', host: 'www', value: 'proxy.antigravity.live', ttl: '3600' },
                           { type: 'MX', host: '@', value: 'mail.google.com', ttl: '14400' },
                         ].map((rec, i) => (
                           <tr key={i} className="hover:bg-slate-50 transition group">
                              <td className="p-4 font-bold text-indigo-600">{rec.type}</td>
                              <td className="p-4 text-slate-700">{rec.host}</td>
                              <td className="p-4 text-slate-500">{rec.value}</td>
                              <td className="p-4 text-slate-400">{rec.ttl}</td>
                              <td className="p-4 text-right">
                                 <button className="p-2 text-slate-300 hover:text-slate-600 transition"><Settings size={14}/></button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}

           {activeTab === 'security' && (
             <div className="space-y-6">
                <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                   <ShieldCheck className="absolute top-0 right-0 p-8 opacity-10" size={100}/>
                   <div className="relative z-10">
                      <h3 className="text-xl font-bold mb-2">Certificat SSL (HSTS)</h3>
                      <div className="flex items-center gap-2 text-green-400 font-bold text-sm mb-6">
                         <Zap size={16} fill="currentColor"/> Actif & Sécurisé
                      </div>
                      <div className="grid grid-cols-2 gap-8 mb-4">
                         <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Émetteur</div>
                            <div className="font-bold text-sm">Let's Encrypt / Antigravity</div>
                         </div>
                         <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Expiration</div>
                            <div className="font-bold text-sm">24 Juin 2026 (Auto-renouvellement)</div>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 flex justify-between items-center">
                   <div>
                      <div className="font-bold text-slate-800">Redirection HTTPS forcée</div>
                      <div className="text-xs text-slate-500">Rediriger automatiquement tout le trafic HTTP vers HTTPS.</div>
                   </div>
                   <div className="w-12 h-6 bg-indigo-600 rounded-full relative shadow-inner cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition shadow-md"></div>
                   </div>
                </div>
             </div>
           )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <button onClick={refreshDns} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition">
              <RefreshCcw size={16} className={isRefreshing ? 'animate-spin text-indigo-600' : ''}/> Rafraîchir le statut
           </button>
           <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-black transition">Sauvegarder les modifications</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ORCHESTRATOR ─── */
const WebsiteBuilder = () => {
  const [phase, setPhase] = useState('dashboard'); // 'dashboard' | 'hero' | 'builder' | 'published'
  const [siteContext, setSiteContext] = useState('');
  const [activeDomain, setActiveDomain] = useState('');
  const [sites, setSites] = useState([]);
  const [editingSiteId, setEditingSiteId] = useState(null);
  const [showDnsModal, setShowDnsModal] = useState(null);
  const [showDomainSearch, setShowDomainSearch] = useState(false);

  const handleGenerate = (prompt) => {
    setSiteContext(prompt);
    setPhase('builder');
  };

  const handlePublish = (domainStr, currentBlocks, currentTheme) => {
    setActiveDomain(domainStr);
    
    // Add or update site in dashboard
    const newSite = {
       id: editingSiteId || Date.now().toString(),
       name: siteContext || 'Mon Site Web',
       domain: domainStr,
       publishDate: new Date().toLocaleDateString(),
       status: 'live',
       blocks: currentBlocks,
       themeOptions: currentTheme
    };

    if (editingSiteId) {
       setSites(sites.map(s => s.id === editingSiteId ? newSite : s));
    } else {
       setSites([...sites, newSite]);
    }

    setEditingSiteId(null);
    setPhase('published');
  };

  // 1. Dashboard Phase
  if (phase === 'dashboard') {
     return (
        <div className="p-8 md:p-12 min-h-[calc(100vh-80px)] font-sans relative overflow-hidden bg-slate-50 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:2.5rem_2.5rem]">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
           <div className="max-w-6xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                 <div>
                    <div className="flex items-center gap-2 mb-3">
                       <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Pro Studio</div>
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-800 tracking-tight">Website Manager</h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Gérez vos sites de réservation et connectez vos domaines en direct.</p>
                 </div>
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setShowDomainSearch(true)}
                      className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-6 py-4 rounded-xl font-bold transition flex items-center gap-2"
                    >
                      <Globe size={20}/> Acheter un Domaine
                    </button>
                    <button 
                      onClick={() => { setSiteContext(''); setPhase('hero'); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold shadow-xl shadow-indigo-200 transition active:scale-95 flex items-center gap-2"
                    >
                      <Wand2 size={20}/> Créer un Site via IA
                    </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                 {[
                   { label: 'Total Bookings', value: '1,284', icon: <Sparkles className="text-indigo-600"/>, trend: '+12%' },
                   { label: 'Total Revenue', value: '€42,500', icon: <Heart className="text-pink-500"/>, trend: '+8%' },
                   { label: 'Active Sites', value: sites.length, icon: <Globe className="text-blue-500"/>, trend: 'Stable' },
                   { label: 'Sync Status', value: 'Direct', icon: <RefreshCcw className="text-green-500"/>, trend: 'Online' },
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                         <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
                         <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{stat.trend}</span>
                      </div>
                      <div className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                   </div>
                 ))}
              </div>

              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold text-slate-800">Your Active Channels</h2>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Featured</button>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition">All Sites</button>
                 </div>
              </div>

              {sites.length === 0 ? (
                 <div className="bg-white/70 backdrop-blur-xl border-2 border-slate-100 rounded-[3rem] p-20 text-center shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner group-hover:scale-110 transition duration-500">
                       <Sparkles size={48} className="animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Bienvenue dans Antigravity Pro Studio</h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-12 text-lg font-medium leading-relaxed">Prêt à transformer votre établissement ? Laissez l'IA générer un site de réservation professionnel, sécurisé et synchronisé en quelques secondes.</p>
                    <button 
                      onClick={() => { setSiteContext(''); setPhase('hero'); }}
                      className="bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-bold transition shadow-2xl shadow-indigo-100 inline-flex items-center gap-3 group/btn active:scale-95"
                    >
                      <Wand2 size={24} className="group-hover/btn:rotate-12 transition" /> Générer mon premier site Pro
                    </button>
                    <div className="mt-12 flex items-center justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition duration-1000">
                       <div className="flex items-center gap-2 font-black text-slate-400">SiteMinder <span className="text-[8px] font-bold border border-slate-300 px-1 rounded">INSPIRED</span></div>
                       <div className="flex items-center gap-2 font-black text-slate-400">SSL <span className="text-[8px] font-bold border border-slate-300 px-1 rounded">SECURE</span></div>
                    </div>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map(site => (
                       <div key={site.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition duration-300 group">
                          <div className="aspect-video bg-slate-100 rounded-2xl mb-6 relative overflow-hidden group-hover:ring-2 group-hover:ring-indigo-500/50 transition">
                             {/* Mock Thumbnail using the site's hero image if available */}
                             <img src={site.blocks?.find(b => b.type === 'hero')?.image || "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=400&q=80"} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-500" />
                             <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> {site.status}
                             </div>
                          </div>
                          <h3 className="font-bold text-xl text-slate-800 truncate">{site.name}</h3>
                          <a href={`https://${site.domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 text-sm font-medium mt-1 mb-6 hover:underline"><Globe size={14}/> {site.domain}</a>
                          
                          <div className="flex items-center gap-3">
                             <button 
                               onClick={() => { 
                                 setEditingSiteId(site.id); 
                                 setSiteContext(site.name); 
                                 setPhase('builder'); 
                               }}
                               className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm transition border border-slate-200 shadow-sm active:scale-[0.98]"
                             >
                               Éditer le site
                             </button>
                             <button 
                               onClick={() => setShowDnsModal(site)}
                               className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200 outline-none"
                               title="Paramètres DNS"
                             >
                               <Settings size={20}/>
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>

            {showDnsModal && <DnsSettingsModal site={showDnsModal} onClose={() => setShowDnsModal(null)} />}
            {showDomainSearch && <DomainSearchModal onClose={() => setShowDomainSearch(false)} onPurchase={(domain) => {
               setPhase('hero');
               setActiveDomain(domain);
               setShowDomainSearch(false);
            }} />}
         </div>
     );
  }

  // 2. AI Prompt Phase
  if (phase === 'hero') {
    return <AIPromptPhase onGenerate={handleGenerate} />;
  }

  // 3. Published Success Flow
  if (phase === 'published') {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-[#F8FAFC] p-6 font-sans">
         <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-xl text-center border border-slate-100 animate-in zoom-in-95 duration-500">
            <div className="relative mb-8 inline-block">
               <div className="absolute inset-0 bg-green-500 blur-2xl opacity-30 rounded-full animate-pulse"></div>
               <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center relative shadow-lg shadow-green-200">
                 <CheckCircle size={48} className="text-white" />
               </div>
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Site en Ligne !</h2>
            <p className="text-slate-500 mb-8 text-lg leading-relaxed font-medium">
              Félicitations ! Le site <span className="font-bold text-slate-800 shrink-0 mx-1">{siteContext}</span> est maintenant lié au domaine <strong className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">{activeDomain}</strong>. Il est sécurisé (SSL) et prêt à recevoir des réservations.
            </p>
            <div className="space-y-3">
               <button 
                 onClick={() => setPhase('dashboard')}
                 className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 active:scale-95 w-full uppercase tracking-widest text-sm"
               >
                 Retour au Dashboard (Manager)
               </button>
               <button 
                 onClick={() => { setPhase('dashboard'); setShowDnsModal({name: siteContext, domain: activeDomain}); }}
                 className="bg-transparent text-slate-500 hover:text-slate-800 px-8 py-4 rounded-xl font-bold transition w-full text-sm"
               >
                 Voir les paramètres DNS
               </button>
            </div>
         </div>
      </div>
    );
  }

  // 4. Editor Phase
  const editingSite = sites.find(s => s.id === editingSiteId);
  return (
    <BuilderPhase 
      siteContext={siteContext} 
      onPublish={(domain, blocks, theme) => handlePublish(domain, blocks, theme)} 
      initialBlocks={editingSite?.blocks}
      initialTheme={editingSite?.themeOptions}
    />
  );
};

export default WebsiteBuilder;
