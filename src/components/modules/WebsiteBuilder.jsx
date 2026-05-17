import React, { useState, useRef, useCallback } from 'react';
import {
  Plus, Search, Wand2, Monitor, Smartphone, Tablet, LayoutTemplate,
  Settings, Layers, ArrowLeft, ArrowRight, Image as ImageIcon,
  Upload, Sparkles, Globe, RefreshCcw, X, Calendar,
  ChevronRight, CreditCard, ShieldCheck, Zap, ExternalLink,
  CalendarDays, Users, Star, MapPin, Play, Check, Eye,
  Trash2, GripVertical, ChevronDown, ChevronUp, Send,
  Palette, Type, AlignLeft, Lock, Unlock, Copy, Move,
  Home, Bed, Coffee, Wifi, Car, Dumbbell, Waves, UtensilsCrossed,
  Phone, Mail, MessageCircle, CheckCircle, ArrowUpRight, Edit3,
  ToggleLeft, ToggleRight, Bold, Italic, Link, Bot, Cpu
} from 'lucide-react';

/* ═══════════════════════════════════════════════
   DATA — TEMPLATES & DEMO SITES
═══════════════════════════════════════════════ */

const HOTEL_TEMPLATES = [
  {
    id: 'lumiere', name: 'Grand Lumière Palace', category: 'Luxe 5★',
    desc: 'Élégance intemporelle, or & marbre, pour hôtels haut de gamme.',
    palette: ['#0a0a0a', '#c9a84c', '#f5f0e8'], accent: '#c9a84c', bg: '#0a0a0a',
    thumb: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'azure', name: 'Azure Sea Resort', category: 'Resort Balnéaire',
    desc: 'Tropical, lumineux, piscine infinity & bungalows sur l\'eau.',
    palette: ['#0077b6', '#00b4d8', '#caf0f8'], accent: '#00b4d8', bg: '#0077b6',
    thumb: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kasbah', name: 'Riad Kasbah', category: 'Riad Marocain',
    desc: 'Authenticité orientale, patio en zellige, ambiance médina.',
    palette: ['#8B2500', '#c9a84c', '#fdf0e3'], accent: '#c9a84c', bg: '#8B2500',
    thumb: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'urbane', name: 'Urbane Boutique', category: 'City Hotel',
    desc: 'Design contemporain, rooftop bar, cœur de ville.',
    palette: ['#1a1a2e', '#e94560', '#f0f0f0'], accent: '#e94560', bg: '#1a1a2e',
    thumb: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'greensoul', name: 'Green Soul Lodge', category: 'Éco-Lodge',
    desc: 'Nature, durabilité, cabanes dans les arbres & yoga.',
    palette: ['#2d6a4f', '#74c69d', '#f0f7f4'], accent: '#74c69d', bg: '#2d6a4f',
    thumb: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'alpine', name: 'Chalet Alpin', category: 'Montagne',
    desc: 'Ski-in/out, cheminée, jacuzzi extérieur, ambiance montagne.',
    palette: ['#2c3e50', '#e67e22', '#ecf0f1'], accent: '#e67e22', bg: '#2c3e50',
    thumb: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?auto=format&fit=crop&w=600&q=80',
  },
];

const DEMO_HOTEL_SITES = [
  {
    id: 'demo-luxury', name: 'Le Grand Lumière Palace', type: 'Hôtel 5★',
    domain: 'grand-lumiere.hova.site', visits: '2.4k', conversion: '5.8%', revenue: '€124,500',
    accent: '#c9a84c', bg: '#0a0a0a', status: 'live',
    heroImg: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { name: 'Suite Royale', img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80', price: '750€', tags: ['King Bed', 'Vue Panoramique', 'Spa Privé'] },
      { name: 'Chambre Prestige', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80', price: '350€', tags: ['King Bed', 'Vue Jardin'] },
      { name: 'Suite Junior', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80', price: '250€', tags: ['Queen Bed', 'Terrasse'] },
    ],
    amenities: ['🍽️ Restaurant Étoilé', '♾️ Piscine Infinity', '💆 Spa 5★', '🏋️ Fitness', '🚗 Voiturier', '✈️ Navette'],
    reviews: [
      { author: 'Sophie M.', flag: '🇫🇷', text: 'Une expérience inoubliable. Le spa est paradisiaque.' },
      { author: 'James K.', flag: '🇬🇧', text: 'Best hotel in the city. The suite was immaculate.' },
    ]
  },
  {
    id: 'demo-riad', name: 'Riad Kasbah Marrakech', type: 'Riad Boutique',
    domain: 'riad-kasbah.hova.site', visits: '1.8k', conversion: '7.2%', revenue: '€38,200',
    accent: '#c9a84c', bg: '#8B2500', status: 'live',
    heroImg: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { name: 'Suite Berbère', img: 'https://images.unsplash.com/photo-1548835154-8e100dcac04b?auto=format&fit=crop&w=600&q=80', price: '280€', tags: ['Patio Privé', 'Hammam'] },
      { name: 'Chambre Zellige', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80', price: '180€', tags: ['Décor Artisanal'] },
      { name: 'Suite Patio', img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80', price: '220€', tags: ['Vue Patio', 'Breakfast'] },
    ],
    amenities: ['🫗 Thé Menthe', '🛁 Hammam', '🌿 Jardin', '🍊 Petit-déj', '🧖 Massages', '🛵 Excursions'],
    reviews: [
      { author: 'Camille B.', flag: '🇫🇷', text: 'Un riad magnifique, patio superbe.' },
      { author: 'Ahmed R.', flag: '🇲🇦', text: 'Le meilleur riad de Marrakech.' },
    ]
  },
  {
    id: 'demo-beach', name: 'Azure Sea Resort & Spa', type: 'Resort Balnéaire',
    domain: 'azure-sea.hova.site', visits: '3.1k', conversion: '4.5%', revenue: '€89,700',
    accent: '#00b4d8', bg: '#0077b6', status: 'live',
    heroImg: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { name: "Villa sur l'Eau", img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80', price: '850€', tags: ['Accès Mer', 'Piscine Privée'] },
      { name: 'Bungalow Plage', img: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80', price: '420€', tags: ['Vue Mer', 'Beach Club'] },
      { name: 'Suite Garden', img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80', price: '280€', tags: ['Jardin Tropical'] },
    ],
    amenities: ['🏊 Infinity Pool', '🤿 Plongée', '🍹 Beach Bar', '💆 Thalasso', '⛵ Nautique', '🎾 Tennis'],
    reviews: [
      { author: 'Marie-Claire L.', flag: '🇫🇷', text: 'La villa sur l\'eau est un rêve.' },
      { author: 'David & Emma', flag: '🇬🇧', text: 'Honeymoon perfection. Stunning sunsets.' },
    ]
  },
];

/* ═══════════════════════════════════════════════
   DEFAULT BLOCKS PER TEMPLATE
═══════════════════════════════════════════════ */
const makeBlocks = (tpl, hotelName) => [
  { id: 'nav', type: 'nav', brand: hotelName || tpl.name, links: ['Chambres', 'Services', 'Galerie', 'Contact'], cta: 'Réserver', bg: tpl.bg, accent: tpl.accent },
  { id: 'hero', type: 'hero', title: `Bienvenue au ${hotelName || tpl.name}`, subtitle: 'Vivez une expérience unique & inoubliable', cta: 'Découvrir nos suites', img: tpl.thumb, bg: tpl.bg, accent: tpl.accent },
  { id: 'booking', type: 'booking', title: 'Réservez votre Séjour', subtitle: 'Meilleur prix garanti · Confirmation instantanée', accent: tpl.accent },
  { id: 'rooms', type: 'rooms', title: 'Nos Chambres & Suites', items: [
    { name: 'Suite Deluxe', price: '250€', img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80', tags: ['King Bed', 'Vue Panoramique', 'Mini-bar'] },
    { name: 'Chambre Classic', price: '150€', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80', tags: ['Queen Bed', 'Climatisation', 'Wifi'] },
    { name: 'Junior Suite', price: '320€', img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80', tags: ['Salon Privé', 'Terrasse', 'Coffre-fort'] },
  ]},
  { id: 'amenities', type: 'amenities', title: 'Nos Services Premium', items: ['🍽️ Restaurant Gastronomique', '🏊 Piscine Chauffée', '💆 Spa & Bien-être', '🏋️ Fitness Center', '🚗 Service Voiturier', '✈️ Transferts Aéroport', '🛎️ Conciergerie 24/7', '🍳 Petit-déjeuner Inclus'], accent: tpl.accent, bg: tpl.bg },
  { id: 'gallery', type: 'gallery', title: 'Notre Établissement', imgs: [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=600&q=80',
  ]},
  { id: 'reviews', type: 'reviews', title: 'Avis de nos Hôtes', items: [
    { author: 'Marie D.', flag: '🇫🇷', stars: 5, text: 'Un séjour absolument exceptionnel. Le personnel est aux petits soins, la chambre magnifique et la vue imprenable.' },
    { author: 'James R.', flag: '🇬🇧', stars: 5, text: 'Outstanding service and beautiful property. Will definitely return for our anniversary next year.' },
    { author: 'Ahmed K.', flag: '🇲🇦', stars: 5, text: 'Parfait en tout point. Le restaurant est excellent et le spa est un véritable havre de paix.' },
  ]},
  { id: 'contact', type: 'contact', title: 'Nous Contacter', subtitle: 'Notre équipe répond sous 2 heures', phone: '+212 5XX-XXX-XXX', email: 'contact@hotel.com', address: '123 Avenue de l\'Hôtel, Marrakech' },
  { id: 'footer', type: 'footer', brand: hotelName || tpl.name, links: ['Accueil', 'Chambres', 'Services', 'Galerie', 'Contact', 'CGV', 'Politique de confidentialité'], bg: tpl.bg, accent: tpl.accent },
];

/* ═══════════════════════════════════════════════
   AVAILABLE SECTION TYPES TO ADD
═══════════════════════════════════════════════ */
const SECTION_TYPES = [
  { type: 'hero', name: 'Hero Principal', icon: <Home size={16}/>, desc: 'En-tête avec image & CTA' },
  { type: 'booking', name: 'Moteur de Réservation', icon: <CalendarDays size={16}/>, desc: 'Widget dates + voyageurs' },
  { type: 'rooms', name: 'Chambres & Suites', icon: <Bed size={16}/>, desc: 'Grille de chambres avec prix' },
  { type: 'amenities', name: 'Services & Équipements', icon: <Coffee size={16}/>, desc: 'Liste des services premium' },
  { type: 'gallery', name: 'Galerie Photos', icon: <ImageIcon size={16}/>, desc: 'Grille ou carousel photos' },
  { type: 'reviews', name: 'Avis Clients', icon: <Star size={16}/>, desc: 'Témoignages & notes' },
  { type: 'contact', name: 'Contact & Localisation', icon: <Phone size={16}/>, desc: 'Formulaire + coordonnées' },
];

/* ═══════════════════════════════════════════════
   DEMO HOTEL SITE PREVIEW (Full-screen)
═══════════════════════════════════════════════ */
const DemoHotelSite = ({ site, onClose, onUse }) => {
  const [checkin, setCheckin] = useState('2025-07-10');
  const [checkout, setCheckout] = useState('2025-07-13');
  const [guests, setGuests] = useState(2);
  const [device, setDevice] = useState('desktop');
  const rooms = site.rooms || [];
  const amenities = site.amenities || [];
  const reviews = site.reviews || [];

  return (
    <div className="fixed inset-0 z-[500] flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .demo-site-wrap { background: #f8f9fa; }
        .demo-nav-links { display: flex; gap: 2rem; align-items: center; }
        .demo-hero { position: relative; height: 580px; overflow: hidden; }
        .demo-booking-widget { position: absolute; bottom: -36px; left: 50%; transform: translateX(-50%); width: min(880px,92%); background: white; border-radius: 20px; padding: 1.25rem 1.5rem; box-shadow: 0 20px 60px rgba(0,0,0,0.25); display: flex; gap: .75rem; align-items: center; }
        .demo-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
        .demo-rooms-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
        .demo-amenities-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 1rem; }
        .demo-reviews-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 1.25rem; }
        @media(max-width:900px){
          .demo-nav-links { display: none; }
          .demo-hero { height: 420px; }
          .demo-booking-widget { flex-direction: column; bottom: -80px; padding: 1rem; gap: .5rem; }
          .demo-booking-widget > div { width: 100%; }
          .demo-booking-widget > button { width: 100%; }
          .demo-stats-grid { grid-template-columns: repeat(2,1fr); }
          .demo-rooms-grid { grid-template-columns: 1fr; }
          .demo-amenities-grid { grid-template-columns: repeat(3,1fr); }
          .demo-reviews-grid { grid-template-columns: 1fr; }
        }
        @media(max-width:480px){
          .demo-amenities-grid { grid-template-columns: repeat(2,1fr); }
          .demo-stats-grid { grid-template-columns: 1fr 1fr; }
        }
        .demo-frame-tablet { max-width: 768px; margin: 0 auto; }
        .demo-frame-mobile { max-width: 390px; margin: 0 auto; border-radius: 2rem; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.4); border: 8px solid #1e293b; }
      `}</style>
      {/* Demo bar */}
      <div className="h-11 bg-zinc-900 flex items-center justify-between px-4 shrink-0 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="text-white/50 text-xs font-mono bg-zinc-800 px-3 py-1 rounded-md">{site.domain}</div>
          <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">● En Ligne</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-zinc-800 p-1 rounded-lg">
            {[['desktop',Monitor],['tablet',Tablet],['mobile',Smartphone]].map(([d,Icon])=>(
              <button key={d} onClick={()=>setDevice(d)} className={`p-1.5 rounded-md transition ${device===d ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}><Icon size={13}/></button>
            ))}
          </div>
          <button onClick={onUse} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition flex items-center gap-1.5"><Wand2 size={12}/> Utiliser ce template</button>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"><X size={16}/></button>
        </div>
      </div>

      {/* Website content */}
      <div className={`flex-1 overflow-y-auto demo-site-wrap ${device !== 'desktop' ? 'bg-slate-200 p-4' : ''}`}>
        <div className={device === 'mobile' ? 'demo-frame-mobile' : device === 'tablet' ? 'demo-frame-tablet' : ''}>
        {/* NAV */}
        <nav style={{ background: site.bg, color: '#fff', padding: '0 1.5rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', background: site.accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: site.bg, fontSize: '16px' }}>H</div>
            <span style={{ fontWeight: '800', fontSize: '16px' }}>{site.name}</span>
          </div>
          <div className="demo-nav-links">
            {['Chambres', 'Services', 'Galerie', 'Contact'].map(n => (
              <span key={n} style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>{n}</span>
            ))}
            <button style={{ background: site.accent, color: site.bg, padding: '8px 18px', borderRadius: '100px', fontWeight: '800', fontSize: '12px', border: 'none', cursor: 'pointer' }}>Réserver</button>
          </div>
          <button style={{ display: 'none' }} className="demo-mobile-menu">☰</button>
        </nav>

        {/* HERO */}
        <div className="demo-hero">
          <img src={site.heroImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white', padding: '0 2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 16px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>{site.type}</div>
            <h1 style={{ fontSize: 'clamp(2rem,4.5vw,3.5rem)', fontWeight: '900', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.75rem' }}>{site.name}</h1>
            <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '480px', lineHeight: 1.6, marginBottom: '2rem' }}>Vivez une expérience unique & inoubliable</p>
          </div>

          {/* BOOKING WIDGET */}
          <div style={{ position: 'absolute', bottom: '-36px', left: '50%', transform: 'translateX(-50%)', width: 'min(880px,92%)', background: 'white', borderRadius: '20px', padding: '1.25rem 1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {[{ label: 'Arrivée', val: checkin, set: setCheckin, type: 'date' }, { label: 'Départ', val: checkout, set: setCheckout, type: 'date' }].map(f => (
              <div key={f.label} style={{ flex: 1, background: '#f8fafc', borderRadius: '12px', padding: '12px 16px', border: '1.5px solid #e2e8f0' }}>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '3px' }}>{f.label}</div>
                <input type="date" value={f.val} onChange={e => f.set(e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '700', color: '#0f172a', width: '100%', outline: 'none' }} />
              </div>
            ))}
            <div style={{ flex: 1, background: '#f8fafc', borderRadius: '12px', padding: '12px 16px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '9px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '3px' }}>Voyageurs</div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{guests} adulte{guests > 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setGuests(Math.max(1, guests - 1))} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '14px', lineHeight: 1 }}>-</button>
                <button onClick={() => setGuests(Math.min(10, guests + 1))} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '14px', lineHeight: 1 }}>+</button>
              </div>
            </div>
            <button style={{ background: site.bg, color: 'white', padding: '16px 28px', borderRadius: '14px', fontWeight: '800', fontSize: '13px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: `0 8px 20px ${site.bg}50` }}>Vérifier disponibilité</button>
          </div>
        </div>

        {/* STATS */}
        <div style={{ paddingTop: '70px', background: 'white', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.25rem 2rem' }}>
            <div className="demo-stats-grid">
              {[{ icon: '⭐', val: '4.9/5', label: 'Note Clients' }, { icon: '🏆', val: site.visits || '—', label: 'Visites/mois' }, { icon: '💳', val: site.conversion || '—', label: 'Conversion' }, { icon: '💰', val: 'Prix Direct', label: 'Meilleur tarif' }].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '1rem', borderRadius: '14px', background: '#f8fafc' }}>
                  <div style={{ fontSize: '22px', marginBottom: '5px' }}>{s.icon}</div>
                  <div style={{ fontWeight: '800', fontSize: '18px', color: '#0f172a', letterSpacing: '-0.02em' }}>{s.val}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROOMS */}
        {rooms.length > 0 && (
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '5rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '10px', fontWeight: '800', color: site.bg, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '10px' }}>Hébergements</div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#0f172a' }}>Nos Chambres & Suites</h2>
            </div>
            <div className="demo-rooms-grid">
              {rooms.map((room, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
                    <img src={room.img} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: 'white', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '700' }}>{room.price}<span style={{ fontSize: '9px', opacity: 0.7 }}>/nuit</span></div>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <h3 style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '8px', color: '#0f172a' }}>{room.name}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1rem' }}>
                      {(room.tags || []).map((t, j) => <span key={j} style={{ background: '#f1f5f9', color: '#64748b', fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '100px' }}>{t}</span>)}
                    </div>
                    <button style={{ width: '100%', background: site.bg, color: 'white', padding: '10px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}>Réserver</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AMENITIES */}
        {amenities.length > 0 && (
          <div style={{ background: site.bg, padding: '5rem 2rem' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.03em', color: 'white', marginBottom: '2.5rem' }}>Services Premium</h2>
              <div className="demo-amenities-grid">
                {amenities.map((a, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1.25rem 0.75rem', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <div style={{ fontSize: '26px', marginBottom: '8px' }}>{a.split(' ')[0]}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontWeight: '600', lineHeight: 1.3 }}>{a.split(' ').slice(1).join(' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {reviews.length > 0 && (
          <div style={{ padding: '5rem 2rem', background: '#f8fafc' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#0f172a', marginBottom: '2.5rem' }}>Avis de nos Hôtes</h2>
              <div className="demo-reviews-grid">
                {reviews.map((r, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>{'★★★★★'.split('').map((s, j) => <span key={j} style={{ color: '#f59e0b', fontSize: '16px' }}>{s}</span>)}</div>
                    <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1.25rem', fontStyle: 'italic' }}>"{r.text}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: site.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{r.flag}</div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{r.author}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ background: '#0f172a', color: 'white', padding: '2.5rem 2rem' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px' }}>{site.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{site.domain} · Propulsé par Hova PMS</div>
            </div>
            <button style={{ background: site.accent, color: site.bg, padding: '10px 24px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', border: 'none', cursor: 'pointer' }}>Réserver maintenant</button>
          </div>
        </div>
        </div>{/* end device frame wrapper */}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   AI SECTION EDITOR PANEL
═══════════════════════════════════════════════ */
const AI_SUGGESTIONS = {
  hero: ['Rends le titre plus luxueux', 'Ajoute une touche marocaine', 'Version plage et soleil', 'Style montagne et nature'],
  booking: ['Simplifie le widget', 'Ajoute la sélection de type de chambre', 'Version plus colorée'],
  rooms: ['Ajoute une chambre familiale', 'Mets en avant les prix', 'Ajoute des icônes d\'équipements'],
  amenities: ['Ajoute le restaurant', 'Mets en avant le spa', 'Version icônes colorées'],
  gallery: ['Réorganise en carousel', 'Ajoute des légendes', 'Version grille serrée'],
  reviews: ['Ajoute plus d\'avis', 'Affiche la note moyenne', 'Version carrousel'],
  contact: ['Ajoute une carte Google Maps', 'Simplifie le formulaire', 'Ajoute les réseaux sociaux'],
};

const AI_RESPONSES = {
  'Rends le titre plus luxueux': { title: 'Une Expérience de Prestige Inégalée', subtitle: 'L\'art de l\'hospitalité élevé à son sommet d\'excellence' },
  'Version plage et soleil': { title: 'Votre Évasion Tropicale Vous Attend', subtitle: 'Sable blanc, eau turquoise & couchers de soleil inoubliables' },
  'Style montagne et nature': { title: 'Au Cœur des Sommets, La Paix Intérieure', subtitle: 'Randonnées, air pur et cabanes au-dessus des nuages' },
  'Ajoute une touche marocaine': { title: 'Âme Ancestrale, Confort Absolu', subtitle: 'Zellige, arganier et patio fleuri au cœur de la médina' },
};

const AISectionPanel = ({ block, onApply, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const suggestions = AI_SUGGESTIONS[block?.type] || ['Améliore le design', 'Rends plus professionnel', 'Simplifie le contenu'];

  const handleApply = useCallback((text) => {
    const finalPrompt = text || prompt;
    if (!finalPrompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      const preset = AI_RESPONSES[finalPrompt];
      let updated = { ...block };
      if (preset) {
        updated = { ...block, ...preset };
      } else {
        // Smart generic transformations
        if (finalPrompt.toLowerCase().includes('luxueux') || finalPrompt.toLowerCase().includes('prestige')) {
          updated.title = updated.title ? `Prestige · ${updated.title}` : updated.title;
        }
        if (finalPrompt.toLowerCase().includes('restaurant')) {
          updated.items = [...(updated.items || []), '🍽️ Restaurant Gastronomique'];
        }
        if (finalPrompt.toLowerCase().includes('spa')) {
          updated.items = [...(updated.items || []), '💆 Spa & Soins'];
        }
        if (finalPrompt.toLowerCase().includes('carte') || finalPrompt.toLowerCase().includes('map')) {
          updated.showMap = true;
        }
      }
      setLastResult(updated);
      setIsGenerating(false);
      setPrompt('');
    }, 1400);
  }, [block, prompt]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center"><Cpu size={14} className="text-white"/></div>
          <span className="font-bold text-slate-800 text-sm">IA — Modifier la section</span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition"><X size={14}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Suggestions rapides */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Suggestions rapides</div>
          <div className="flex flex-col gap-1.5">
            {suggestions.map(s => (
              <button key={s} onClick={() => handleApply(s)}
                className="text-left text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition border border-indigo-100 flex items-center gap-2">
                <Sparkles size={11}/> {s}
              </button>
            ))}
          </div>
        </div>

        {/* Custom prompt */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Instruction personnalisée</div>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleApply()}
            placeholder="Ex: Rends le texte plus chaleureux, ajoute un sous-titre romantique, change la palette..."
            className="w-full text-xs border border-slate-200 rounded-xl p-3 resize-none h-20 outline-none focus:border-indigo-400 transition text-slate-700 placeholder-slate-300 bg-slate-50"
          />
          <button onClick={() => handleApply()}
            disabled={!prompt || isGenerating}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2">
            {isGenerating ? <><RefreshCcw size={12} className="animate-spin"/>Génération...</> : <><Send size={12}/>Appliquer</>}
          </button>
        </div>

        {/* Last result preview */}
        {lastResult && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wide flex items-center gap-1"><Check size={11}/>Modifié avec succès</span>
              <button onClick={() => { onApply(lastResult); setLastResult(null); }} className="text-[10px] font-bold text-green-700 bg-green-200 hover:bg-green-300 px-2 py-1 rounded-lg transition">Appliquer ↗</button>
            </div>
            {lastResult.title && <div className="text-xs text-green-800 font-medium">"{lastResult.title}"</div>}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   BLOCK RENDERER (in-editor display)
═══════════════════════════════════════════════ */
const BlockRenderer = ({ block, isSelected, onSelect, themeAccent }) => {
  const accent = themeAccent || '#6366f1';
  const cls = `relative cursor-pointer transition-all group ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 rounded-xl' : 'hover:ring-1 hover:ring-slate-300 hover:ring-offset-1 rounded-xl'}`;

  if (block.type === 'nav') {
    return (
      <div onClick={onSelect} className={cls} style={{ background: block.bg || '#0a0a0a', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: block.accent || accent, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: block.bg || '#0a0a0a', fontSize: '14px' }}>H</div>
          <span style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>{block.brand}</span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {(block.links || []).map(l => <span key={l} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600' }}>{l}</span>)}
          <div style={{ background: block.accent || accent, color: block.bg || '#0a0a0a', padding: '6px 14px', borderRadius: '100px', fontWeight: '800', fontSize: '11px' }}>{block.cta || 'Réserver'}</div>
        </div>
      </div>
    );
  }

  if (block.type === 'hero') {
    return (
      <div onClick={onSelect} className={cls} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', minHeight: '280px' }}>
        <img src={block.img} alt="" style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.55), rgba(0,0,0,0.3))' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', color: 'white' }}>
          <h1 style={{ fontSize: 'clamp(1.25rem,3vw,2rem)', fontWeight: '900', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>{block.title}</h1>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1.25rem' }}>{block.subtitle}</p>
          <button style={{ background: block.accent || accent, color: block.bg || '#0a0a0a', padding: '10px 20px', borderRadius: '10px', fontWeight: '800', fontSize: '12px', border: 'none', cursor: 'pointer', width: 'fit-content' }}>{block.cta}</button>
        </div>
      </div>
    );
  }

  if (block.type === 'booking') {
    return (
      <div onClick={onSelect} className={cls} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em' }}>{block.title}</h2>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{block.subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {['Arrivée', 'Départ', 'Voyageurs'].map((f, i) => (
            <div key={f} style={{ flex: 1, background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', border: '1.5px solid #e2e8f0' }}>
              <div style={{ fontSize: '8px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{f}</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{i === 0 ? '15 Juil' : i === 1 ? '18 Juil' : '2 adultes'}</div>
            </div>
          ))}
          <button style={{ background: block.accent || accent, color: 'white', padding: '12px 18px', borderRadius: '10px', fontWeight: '800', fontSize: '12px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>Vérifier →</button>
        </div>
      </div>
    );
  }

  if (block.type === 'rooms') {
    return (
      <div onClick={onSelect} className={cls} style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>{block.title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
          {(block.items || []).map((r, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ height: '90px', overflow: 'hidden' }}>
                <img src={r.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '0.75rem' }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: '#0f172a', marginBottom: '3px' }}>{r.name}</div>
                <div style={{ fontWeight: '800', fontSize: '13px', color: accent }}>{r.price}<span style={{ fontWeight: '500', fontSize: '9px', color: '#94a3b8' }}>/nuit</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === 'amenities') {
    return (
      <div onClick={onSelect} className={cls} style={{ background: block.bg || '#0f172a', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ fontWeight: '800', fontSize: '1.25rem', color: 'white', marginBottom: '1rem', letterSpacing: '-0.02em' }}>{block.title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem' }}>
          {(block.items || []).map((a, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.6rem 0.5rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '18px', marginBottom: '3px' }}>{a.split(' ')[0]}</div>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', lineHeight: 1.2 }}>{a.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === 'gallery') {
    return (
      <div onClick={onSelect} className={cls} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>{block.title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.5rem' }}>
          {(block.imgs || []).map((img, i) => (
            <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', height: '70px' }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === 'reviews') {
    return (
      <div onClick={onSelect} className={cls} style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.02em' }}>{block.title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
          {(block.items || []).map((r, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: '1px', marginBottom: '6px' }}>{'★★★★★'.split('').map((s, j) => <span key={j} style={{ color: '#f59e0b', fontSize: '11px' }}>{s}</span>)}</div>
              <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5, marginBottom: '8px', fontStyle: 'italic' }}>{r.text?.substring(0, 80)}...</p>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#0f172a' }}>{r.flag} {r.author}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === 'contact') {
    return (
      <div onClick={onSelect} className={cls} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontWeight: '800', fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{block.title}</h2>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '1rem' }}>{block.subtitle}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}><Phone size={14} style={{ color: accent }}/><span style={{ fontSize: '11px', color: '#0f172a', fontWeight: '600' }}>{block.phone}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px' }}><Mail size={14} style={{ color: accent }}/><span style={{ fontSize: '11px', color: '#0f172a', fontWeight: '600' }}>{block.email}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', gridColumn: 'span 2' }}><MapPin size={14} style={{ color: accent }}/><span style={{ fontSize: '11px', color: '#0f172a', fontWeight: '600' }}>{block.address}</span></div>
        </div>
      </div>
    );
  }

  if (block.type === 'footer') {
    return (
      <div onClick={onSelect} className={cls} style={{ background: block.bg || '#0f172a', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ color: 'white', fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>{block.brand}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Propulsé par Hova PMS</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(block.links || []).slice(0, 4).map(l => <span key={l} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: '600' }}>{l}</span>)}
        </div>
      </div>
    );
  }

  return (
    <div onClick={onSelect} className={cls} style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', border: '1px dashed #e2e8f0', textAlign: 'center' }}>
      <div className="text-slate-400 text-sm font-medium capitalize">{block.type} section</div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   BLOCK INSPECTOR — RIGHT PANEL
═══════════════════════════════════════════════ */
const BlockInspector = ({ block, onUpdate, themeAccent, setThemeAccent, activeAI, setActiveAI }) => {
  if (!block) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><Settings size={20} className="text-slate-400"/></div>
          <div className="text-slate-500 text-sm font-medium">Sélectionnez une section</div>
          <div className="text-slate-400 text-xs mt-1">Cliquez sur une section pour la modifier</div>
        </div>
      </div>
    );
  }

  if (activeAI) {
    return <AISectionPanel block={block} onApply={updated => { onUpdate(updated); setActiveAI(false); }} onClose={() => setActiveAI(false)} />;
  }

  const field = (label, key, type = 'text', opts = {}) => (
    <div key={key}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">{label}</label>
      {type === 'textarea' ? (
        <textarea value={block[key] || ''} onChange={e => onUpdate({ ...block, [key]: e.target.value })}
          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-400 transition resize-none h-16 bg-slate-50 font-medium" />
      ) : type === 'color' ? (
        <div className="flex items-center gap-2">
          <input type="color" value={block[key] || '#6366f1'} onChange={e => onUpdate({ ...block, [key]: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200" />
          <input type="text" value={block[key] || ''} onChange={e => onUpdate({ ...block, [key]: e.target.value })}
            className="flex-1 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 outline-none focus:border-indigo-400 transition font-mono" />
        </div>
      ) : (
        <input type={type} value={block[key] || ''} onChange={e => onUpdate({ ...block, [key]: e.target.value })}
          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-indigo-400 transition bg-slate-50 font-medium" />
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className="font-bold text-slate-800 text-sm capitalize">{block.type === 'nav' ? 'Navigation' : block.type === 'hero' ? 'Section Hero' : block.type === 'booking' ? 'Réservation' : block.type === 'rooms' ? 'Chambres' : block.type === 'amenities' ? 'Services' : block.type === 'gallery' ? 'Galerie' : block.type === 'reviews' ? 'Avis' : block.type === 'contact' ? 'Contact' : block.type === 'footer' ? 'Footer' : block.type}</span>
          </div>
          <button onClick={() => setActiveAI(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition">
            <Sparkles size={11}/> IA
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Theme color */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Couleur du site</label>
          <div className="flex gap-2 flex-wrap">
            {['#6366f1','#0077b6','#8B2500','#1a1a2e','#2d6a4f','#2c3e50','#c9a84c','#e94560'].map(c => (
              <button key={c} onClick={() => setThemeAccent(c)} style={{ background: c, width: '24px', height: '24px', borderRadius: '6px', border: themeAccent === c ? '2px solid #000' : '2px solid transparent', boxShadow: themeAccent === c ? '0 0 0 2px white, 0 0 0 4px ' + c : 'none' }} />
            ))}
            <input type="color" value={themeAccent} onChange={e => setThemeAccent(e.target.value)} className="w-6 h-6 rounded-md cursor-pointer border border-slate-200" />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3"></div>

        {/* Dynamic fields based on block type */}
        {block.type === 'nav' && <>{field('Nom de l\'établissement', 'brand')}{field('Texte du bouton', 'cta')}{field('Couleur fond', 'bg', 'color')}{field('Couleur accent', 'accent', 'color')}</>}
        {block.type === 'hero' && <>{field('Titre principal', 'title')}{field('Sous-titre', 'subtitle', 'textarea')}{field('Texte du bouton', 'cta')}{field('Image (URL)', 'img')}</>}
        {block.type === 'booking' && <>{field('Titre', 'title')}{field('Sous-titre', 'subtitle')}</>}
        {block.type === 'rooms' && <>{field('Titre de section', 'title')}<div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center"><div className="text-xs text-slate-500 font-medium">💡 Gestion des chambres via l'onglet IA</div></div></>}
        {block.type === 'amenities' && <>{field('Titre', 'title')}{field('Couleur fond', 'bg', 'color')}</>}
        {block.type === 'gallery' && <>{field('Titre', 'title')}</>}
        {block.type === 'reviews' && <>{field('Titre', 'title')}</>}
        {block.type === 'contact' && <>{field('Titre', 'title')}{field('Sous-titre', 'subtitle')}{field('Téléphone', 'phone')}{field('Email', 'email')}{field('Adresse', 'address')}</>}
        {block.type === 'footer' && <>{field('Nom de marque', 'brand')}{field('Couleur fond', 'bg', 'color')}</>}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   DNS COPY BUTTON HELPER
═══════════════════════════════════════════════ */
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className={`text-[9px] font-bold px-2 py-1 rounded-md transition ml-2 ${copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}>
      {copied ? '✓ Copié' : 'Copier'}
    </button>
  );
};

const DnsRecordRow = ({ type, host, value, ttl }) => (
  <div className="grid grid-cols-[60px_80px_1fr_60px] gap-2 items-center py-2.5 border-b border-slate-100 last:border-0 text-xs">
    <span className={`font-black px-2 py-0.5 rounded text-center ${type === 'A' ? 'bg-blue-100 text-blue-700' : type === 'CNAME' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>{type}</span>
    <code className="font-mono text-slate-700 font-bold">{host}</code>
    <div className="flex items-center min-w-0">
      <code className="font-mono text-slate-800 truncate text-[11px]">{value}</code>
      <CopyBtn text={value} />
    </div>
    <span className="text-slate-400 font-medium text-center">{ttl}</span>
  </div>
);

/* ═══════════════════════════════════════════════
   PUBLISH MODAL — Professional DNS Setup
═══════════════════════════════════════════════ */
const PublishModal = ({ siteName, onPublish, onClose }) => {
  const [tab, setTab] = useState('free');
  const [dnsMode, setDnsMode] = useState('arecord');
  const [customDomain, setCustomDomain] = useState('');
  const [subdomain, setSubdomain] = useState(
    siteName?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'mon-hotel'
  );
  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(false);
  const [dnsStatus, setDnsStatus] = useState(null);

  const freeUrl = `${subdomain}.hova.site`;
  const HOVA_IP = '76.223.105.230';
  const HOVA_IP6 = '2600:1f14:7ef:5200::1';

  const checkDns = () => {
    if (!customDomain) return;
    setChecking(true);
    setDnsStatus(null);
    setTimeout(() => {
      setChecking(false);
      setDnsStatus(Math.random() > 0.4 ? 'propagated' : 'pending');
    }, 2200);
  };

  const handlePublish = () => {
    setStep(2);
    const steps = [
      'Allocation de l\'espace serveur...',
      'Génération du certificat SSL...',
      'Configuration du CDN...',
      'Mise en ligne du site...',
    ];
    let i = 0;
    const iv = setInterval(() => {
      i++;
      if (i >= steps.length) {
        clearInterval(iv);
        setStep(3);
        setTimeout(() => onPublish(tab === 'free' ? freeUrl : customDomain || freeUrl), 1200);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">

        {step === 1 && (
          <>
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Globe size={20} className="text-indigo-600"/> Publier le site</h2>
                <p className="text-slate-500 text-xs mt-0.5">Configurez votre domaine et mettez votre site en ligne.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition"><X size={18}/></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Tabs */}
              <div className="px-8 pt-6">
                <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
                  {[
                    { id: 'free', label: '🟢 Sous-domaine Gratuit', sub: 'Prêt en 30 sec' },
                    { id: 'custom', label: '🌐 Domaine Personnalisé', sub: 'Configuration DNS' },
                  ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`flex-1 py-3 px-4 rounded-xl text-left transition ${tab === t.id ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
                      <div className="text-sm font-bold">{t.label}</div>
                      <div className="text-[10px] font-medium opacity-60 mt-0.5">{t.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-8 py-6 space-y-5">
                {/* ── FREE SUBDOMAIN ── */}
                {tab === 'free' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Votre URL gratuite</label>
                      <div className="flex bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition">
                        <input value={subdomain}
                          onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className="flex-1 px-5 py-3.5 bg-transparent outline-none text-slate-800 font-bold text-base" />
                        <span className="px-5 py-3.5 bg-indigo-50 text-indigo-600 font-bold text-sm border-l-2 border-slate-200 flex items-center">.hova.site</span>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-green-700 font-bold text-sm"><Check size={16}/> {freeUrl} — disponible</div>
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[{ icon: '🔒', label: 'SSL / HTTPS', val: 'Inclus & auto' }, { icon: '⚡', label: 'CDN Global', val: '30+ PoP' }, { icon: '💰', label: 'Prix', val: '0€ / mois' }].map((f, i) => (
                          <div key={i} className="bg-white rounded-xl p-3 text-center border border-green-100">
                            <div className="text-lg">{f.icon}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">{f.label}</div>
                            <div className="text-xs font-bold text-slate-700 mt-0.5">{f.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CUSTOM DOMAIN ── */}
                {tab === 'custom' && (
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Votre domaine</label>
                      <div className="flex bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-indigo-500 transition">
                        <span className="px-4 py-3.5 text-slate-400 bg-slate-100 border-r-2 border-slate-200 text-sm font-medium">https://</span>
                        <input value={customDomain} onChange={e => setCustomDomain(e.target.value.toLowerCase())}
                          placeholder="www.mon-hotel.com"
                          className="flex-1 px-4 py-3.5 bg-transparent outline-none text-slate-800 font-bold text-sm" />
                        <button onClick={checkDns} disabled={!customDomain || checking}
                          className="px-4 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition disabled:opacity-40 flex items-center gap-1.5">
                          {checking ? <RefreshCcw size={12} className="animate-spin"/> : <Search size={12}/>} Vérifier
                        </button>
                      </div>
                      {dnsStatus === 'propagated' && <div className="mt-2 flex items-center gap-2 text-green-600 text-xs font-bold"><Check size={12}/> DNS propagé — domaine prêt à être connecté</div>}
                      {dnsStatus === 'pending' && <div className="mt-2 flex items-center gap-2 text-amber-600 text-xs font-bold"><RefreshCcw size={12}/> DNS en cours de propagation (peut prendre jusqu'à 48h)</div>}
                    </div>

                    {/* DNS Method selector */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Méthode de configuration</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'arecord', label: 'Enregistrements A', icon: '📋', desc: 'Config chez votre registrar' },
                          { id: 'nameservers', label: 'Nameservers Hova', icon: '🔄', desc: 'DNS entièrement géré' },
                        ].map(m => (
                          <button key={m.id} onClick={() => setDnsMode(m.id)}
                            className={`flex-1 p-3 rounded-xl border-2 text-left transition ${dnsMode === m.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className="text-lg mb-1">{m.icon}</div>
                            <div className="font-bold text-xs text-slate-800">{m.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* A Records method */}
                    {dnsMode === 'arecord' && (
                      <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Enregistrements DNS à configurer</span>
                          <span className="text-[10px] text-slate-400 font-medium">Chez votre registrar (OVH, Namecheap, GoDaddy...)</span>
                        </div>
                        <div className="px-4">
                          <div className="grid grid-cols-[60px_80px_1fr_60px] gap-2 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">
                            <span>Type</span><span>Hôte</span><span>Valeur</span><span>TTL</span>
                          </div>
                          <DnsRecordRow type="A" host="@" value={HOVA_IP} ttl="Auto" />
                          <DnsRecordRow type="A" host="www" value={HOVA_IP} ttl="Auto" />
                          <DnsRecordRow type="AAAA" host="@" value={HOVA_IP6} ttl="Auto" />
                          <DnsRecordRow type="CNAME" host="www" value="sites.hova.site" ttl="Auto" />
                        </div>
                        <div className="px-4 py-3 bg-blue-50 border-t border-blue-100 text-xs text-blue-700 font-medium flex items-start gap-2">
                          <span className="text-lg leading-none">💡</span>
                          <span>Utilisez soit les enregistrements A + AAAA, soit le CNAME pour <code className="font-mono bg-blue-100 px-1 rounded">www</code>. La propagation DNS prend entre 1 et 48h.</span>
                        </div>
                      </div>
                    )}

                    {/* Nameservers method */}
                    {dnsMode === 'nameservers' && (
                      <div className="space-y-3">
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                          <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Nameservers Hova à configurer</span>
                          </div>
                          <div className="p-4 space-y-2">
                            {['ns1.hova.site', 'ns2.hova.site', 'ns3.hova.site'].map((ns, i) => (
                              <div key={ns} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5">
                                <div>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide mr-2">NS {i + 1}</span>
                                  <code className="font-mono font-bold text-slate-800 text-sm">{ns}</code>
                                </div>
                                <CopyBtn text={ns} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-4 text-xs text-indigo-700 font-medium space-y-1">
                          <div className="font-black text-indigo-800 flex items-center gap-1.5"><Check size={13}/> Avantages de la méthode Nameservers</div>
                          <div>• DNS entièrement géré par Hova (zero config)</div>
                          <div>• Renouvellement SSL automatique</div>
                          <div>• Protection DDoS incluse</div>
                          <div>• Redirections & sous-domaines via dashboard</div>
                        </div>
                      </div>
                    )}

                    {/* SSL Badge */}
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
                      <ShieldCheck size={20} className="text-green-600 shrink-0"/>
                      <div>
                        <div className="font-bold text-green-800 text-sm">SSL/TLS automatique</div>
                        <div className="text-green-600 text-xs mt-0.5">Certificat Let's Encrypt renouvelé automatiquement · HSTS activé · TLS 1.3</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 flex gap-3 shrink-0">
              <button onClick={onClose} className="flex-1 border-2 border-slate-200 text-slate-600 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition">Annuler</button>
              <button onClick={handlePublish}
                disabled={tab === 'custom' && !customDomain}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 transition active:scale-[0.98] flex items-center justify-center gap-2">
                <Globe size={15}/> Publier sur {tab === 'free' ? freeUrl : (customDomain || 'votre domaine')}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="p-14 text-center">
            <div className="relative mb-6 inline-block">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto"><Globe size={28} className="text-indigo-600 animate-spin" style={{ animationDuration: '3s' }}/></div>
              <div className="absolute -inset-2 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="font-black text-xl text-slate-800 mb-3">Déploiement en cours...</h3>
            <div className="space-y-2 max-w-xs mx-auto">
              {['Allocation du serveur', 'Certificat SSL', 'CDN & cache', 'Mise en ligne'].map((s, i) => (
                <div key={s} className="flex items-center gap-3 text-sm">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                    <Check size={10} className="text-white"/>
                  </div>
                  <span className="text-slate-600 font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-14 text-center">
            <div className="relative mb-6 inline-block">
              <div className="absolute inset-0 bg-green-400 blur-xl opacity-30 animate-pulse rounded-full"></div>
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center relative"><Check size={32} className="text-white"/></div>
            </div>
            <h3 className="font-black text-xl text-slate-800 mb-2">Votre site est en ligne !</h3>
            <p className="text-slate-500 text-sm">Redirection vers le dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   VISUAL EDITOR — Main 3-panel layout
═══════════════════════════════════════════════ */
const VisualEditor = ({ initialBlocks, siteContext, template, onPublish, onBack }) => {
  const [blocks, setBlocks] = useState(initialBlocks || makeBlocks(template || HOTEL_TEMPLATES[0], siteContext));
  const [selectedId, setSelectedId] = useState(null);
  const [device, setDevice] = useState('desktop');
  const [themeAccent, setThemeAccent] = useState(template?.accent || '#6366f1');
  const [showAddSection, setShowAddSection] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [activeAI, setActiveAI] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedBlock = blocks.find(b => b.id === selectedId);

  const updateBlock = useCallback((updated) => {
    setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b));
  }, []);

  const removeBlock = useCallback((id) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    setSelectedId(null);
  }, []);

  const moveBlock = useCallback((id, dir) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if ((dir === -1 && idx === 0) || (dir === 1 && idx === prev.length - 1)) return prev;
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next;
    });
  }, []);

  const addSection = useCallback((type) => {
    const newBlock = {
      id: `${type}_${Date.now()}`, type,
      title: SECTION_TYPES.find(s => s.type === type)?.name || type,
      ...(type === 'rooms' ? { items: [] } : {}),
      ...(type === 'amenities' ? { items: [], bg: template?.bg || '#0f172a' } : {}),
      ...(type === 'gallery' ? { imgs: [] } : {}),
      ...(type === 'reviews' ? { items: [] } : {}),
      ...(type === 'contact' ? { phone: '', email: '', address: '' } : {}),
      accent: themeAccent,
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedId(newBlock.id);
    setShowAddSection(false);
  }, [template, themeAccent]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const canvasWidth = device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '390px';

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── TOP TOOLBAR ── */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"><ArrowLeft size={18}/></button>
          <div className="h-5 w-px bg-slate-200"></div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm leading-none">{siteContext || template?.name || 'Mon Site Hôtelier'}</span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Éditeur visuel</span>
          </div>
        </div>

        {/* Device switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]].map(([d, Icon]) => (
            <button key={d} onClick={() => setDevice(d)}
              className={`p-2 rounded-lg transition ${device === d ? 'bg-white shadow text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
              <Icon size={15}/>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleSave}
            className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition ${saved ? 'bg-green-100 text-green-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}>
            {saved ? <><Check size={14}/>Sauvegardé</> : <><Upload size={14}/>Sauvegarder</>}
          </button>
          <button onClick={() => setShowPublish(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition active:scale-95 flex items-center gap-2">
            <Globe size={14}/> Publier
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL — SECTION LIST ── */}
        <div className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sections</span>
            <span className="text-[10px] font-bold text-slate-400">{blocks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {blocks.map((block, idx) => {
              const isActive = selectedId === block.id;
              const ICONS = { nav: Home, hero: ImageIcon, booking: CalendarDays, rooms: Bed, amenities: Coffee, gallery: ImageIcon, reviews: Star, contact: Phone, footer: AlignLeft };
              const Icon = ICONS[block.type] || Settings;
              return (
                <div key={block.id}
                  onClick={() => setSelectedId(block.id)}
                  className={`mx-2 mb-1 px-3 py-2.5 rounded-xl cursor-pointer transition group flex items-center gap-2 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                  <Icon size={13} className={isActive ? 'text-indigo-500' : 'text-slate-400'}/>
                  <span className="text-xs font-semibold truncate flex-1 capitalize">{block.type === 'nav' ? 'Navigation' : block.type === 'booking' ? 'Réservation' : block.type === 'amenities' ? 'Services' : block.type === 'reviews' ? 'Avis' : block.type === 'contact' ? 'Contact' : block.type === 'footer' ? 'Footer' : block.title || block.type}</span>
                  <div className={`flex gap-0.5 opacity-0 group-hover:opacity-100 transition ${isActive ? 'opacity-100' : ''}`}>
                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, -1); }} className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700"><ChevronUp size={10}/></button>
                    <button onClick={e => { e.stopPropagation(); moveBlock(block.id, 1); }} className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700"><ChevronDown size={10}/></button>
                    <button onClick={e => { e.stopPropagation(); removeBlock(block.id); }} className="p-0.5 hover:bg-red-100 rounded text-slate-400 hover:text-red-500"><Trash2 size={10}/></button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Add Section */}
          <div className="p-3 border-t border-slate-100 shrink-0">
            {showAddSection ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ajouter une section</span>
                  <button onClick={() => setShowAddSection(false)} className="text-slate-400 hover:text-slate-600"><X size={12}/></button>
                </div>
                <div className="p-1.5 max-h-48 overflow-y-auto">
                  {SECTION_TYPES.map(s => (
                    <button key={s.type} onClick={() => addSection(s.type)}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white text-slate-600 text-xs font-semibold flex items-center gap-2 transition group">
                      <span className="text-indigo-500">{s.icon}</span>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddSection(true)}
                className="w-full py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border-2 border-dashed border-slate-200 hover:border-indigo-300 transition flex items-center justify-center gap-1.5">
                <Plus size={13}/> Ajouter une section
              </button>
            )}
          </div>
        </div>

        {/* ── CENTER — CANVAS ── */}
        <div className="flex-1 bg-slate-100 overflow-y-auto p-6 flex justify-center [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:1.5rem_1.5rem]">
          <div style={{ width: canvasWidth, maxWidth: '100%', transition: 'width 0.3s' }}>
            {/* Device frame */}
            {device !== 'desktop' && (
              <div className={`mx-auto bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-8 ${device === 'tablet' ? 'border-slate-800 w-[768px]' : 'border-slate-900 w-[390px]'}`}>
                {device === 'mobile' && <div className="bg-slate-900 h-6 flex justify-center items-center"><div className="w-20 h-1.5 bg-slate-700 rounded-full"></div></div>}
              </div>
            )}
            <div className={`bg-white space-y-2 ${device !== 'desktop' ? 'rounded-[2rem] overflow-hidden shadow-2xl' : 'rounded-2xl shadow-2xl'}`} style={{ minHeight: '600px', padding: '0.5rem' }}>
              {blocks.map(block => (
                <div key={block.id} className="relative group/block">
                  <BlockRenderer
                    block={{ ...block, accent: block.accent || themeAccent }}
                    isSelected={selectedId === block.id}
                    onSelect={() => setSelectedId(block.id)}
                    themeAccent={themeAccent}
                  />
                  {/* AI quick button on hover */}
                  {selectedId === block.id && (
                    <button
                      onClick={() => setActiveAI(true)}
                      className="absolute top-2 right-10 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 transition z-10 hover:bg-indigo-700"
                    >
                      <Sparkles size={10}/> Modifier avec IA
                    </button>
                  )}
                </div>
              ))}
              {blocks.length === 0 && (
                <div className="py-20 text-center text-slate-400">
                  <Layers size={32} className="mx-auto mb-3 opacity-30"/>
                  <div className="text-sm font-medium">Ajoutez des sections depuis le panneau gauche</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — INSPECTOR ── */}
        <div className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0 z-10">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex gap-1">
              {[{id:false,label:'Propriétés'},{id:true,label:'IA'}].map(t=>(
                <button key={t.label} onClick={()=>setActiveAI(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${activeAI===t.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100'}`}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <BlockInspector
              block={selectedBlock}
              onUpdate={updateBlock}
              themeAccent={themeAccent}
              setThemeAccent={setThemeAccent}
              activeAI={activeAI}
              setActiveAI={setActiveAI}
            />
          </div>
        </div>
      </div>

      {showPublish && (
        <PublishModal
          siteName={siteContext || template?.name || 'mon-hotel'}
          onPublish={(domain) => { onPublish(domain, blocks); setShowPublish(false); }}
          onClose={() => setShowPublish(false)}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TEMPLATE GALLERY
═══════════════════════════════════════════════ */
const TemplateGallery = ({ onSelect, onBack }) => {
  const [filter, setFilter] = useState('all');
  const [hovered, setHovered] = useState(null);

  const cats = ['all', ...new Set(HOTEL_TEMPLATES.map(t => t.category))];
  const filtered = filter === 'all' ? HOTEL_TEMPLATES : HOTEL_TEMPLATES.filter(t => t.category === filter);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"><ArrowLeft size={18}/></button>
          <div>
            <h1 className="text-xl font-black text-slate-900">Choisissez un template</h1>
            <p className="text-slate-500 text-xs font-medium mt-0.5">6 designs professionnels pour hôtels, riads et resorts</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {cats.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filter === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
              {cat === 'all' ? 'Tous' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => (
            <div key={t.id}
              onMouseEnter={() => setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              className="bg-white rounded-2xl overflow-hidden border-2 border-transparent hover:border-indigo-500 shadow-sm hover:shadow-2xl transition duration-300 cursor-pointer group"
              onClick={() => onSelect(t)}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={t.thumb} className="w-full h-full object-cover group-hover:scale-105 transition duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                {/* Color palette */}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {t.palette.map((c, i) => (
                    <div key={i} style={{ background: c, width: '18px', height: '18px' }} className="rounded-full border-2 border-white shadow-md"></div>
                  ))}
                </div>
                {hovered === t.id && (
                  <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center animate-in fade-in duration-200">
                    <button className="bg-white text-indigo-700 font-black text-sm px-6 py-3 rounded-full shadow-xl flex items-center gap-2">
                      <Play size={14} fill="currentColor"/> Utiliser ce template
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-lg">{t.category}</span>
                  <span className="text-[10px] text-slate-400 font-bold">8 sections</span>
                </div>
                <h3 className="font-black text-slate-900 text-lg tracking-tight mb-1">{t.name}</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   AI WIZARD — Setup
═══════════════════════════════════════════════ */
const AIWizard = ({ selectedTemplate, onGenerate, onBack }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [brief, setBrief] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const tpl = selectedTemplate || HOTEL_TEMPLATES[0];

  const exampleBriefs = [
    'Hôtel de luxe avec spa, piscine infinity et restaurant gastronomique',
    'Riad authentique avec patio, hammam et terrasse panoramique',
    'Resort balnéaire avec bungalows sur l\'eau et plage privée',
    'Éco-lodge avec cabanes dans les arbres et cours de yoga',
  ];

  const handleGenerate = () => {
    if (!name) return;
    setIsGenerating(true);
    setTimeout(() => {
      onGenerate(name, location, brief, tpl);
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-50 p-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-xl text-slate-500 transition"><ArrowLeft size={18}/></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md"><img src={tpl.thumb} className="w-full h-full object-cover"/></div>
            <div>
              <div className="font-bold text-slate-900 text-sm">{tpl.name}</div>
              <div className="text-slate-500 text-xs">{tpl.category}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Progress */}
          <div className="h-1 bg-slate-100">
            <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-black">{step}</div>
              <span className="text-slate-500 text-xs font-medium">Étape {step} / 3</span>
            </div>

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-1">Nom de votre établissement</h2>
                  <p className="text-slate-500 text-sm">Comment s'appelle votre hôtel, riad ou resort ?</p>
                </div>
                <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && name && setStep(2)}
                  placeholder="Ex: Riad Al Nour, The Azure Grand, Villa Serena..."
                  className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold text-slate-800 placeholder-slate-300 outline-none focus:border-indigo-500 transition bg-slate-50"
                  autoFocus />
                <button onClick={() => name && setStep(2)} disabled={!name}
                  className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-2xl font-bold transition active:scale-98">
                  Continuer →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-1">Où êtes-vous situé ?</h2>
                  <p className="text-slate-500 text-sm">Ville, pays ou région (facultatif)</p>
                </div>
                <input value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && setStep(3)}
                  placeholder="Ex: Marrakech, Maroc · Paris, France · Bali, Indonésie..."
                  className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-lg font-bold text-slate-800 placeholder-slate-300 outline-none focus:border-indigo-500 transition bg-slate-50"
                  autoFocus />
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition">← Retour</button>
                  <button onClick={() => setStep(3)} className="flex-2 flex-[2] bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold transition active:scale-98">Continuer →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-1">Décrivez votre établissement</h2>
                  <p className="text-slate-500 text-sm">L'IA va personnaliser votre site en fonction</p>
                </div>
                <textarea value={brief} onChange={e => setBrief(e.target.value)}
                  placeholder="Décrivez vos services, l'ambiance, les points forts..."
                  className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 placeholder-slate-300 outline-none focus:border-indigo-500 transition bg-slate-50 resize-none h-28" />
                <div className="flex flex-wrap gap-2">
                  {exampleBriefs.map(ex => (
                    <button key={ex} onClick={() => setBrief(ex)}
                      className="text-[11px] bg-slate-50 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition font-medium">
                      {ex.substring(0, 40)}...
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="flex-1 border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition">← Retour</button>
                  <button onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-4 rounded-2xl font-bold transition active:scale-98 flex items-center justify-center gap-2">
                    {isGenerating ? <><RefreshCcw size={16} className="animate-spin"/> Génération IA...</> : <><Wand2 size={16}/> Générer mon site ✨</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
const Dashboard = ({ sites, onNewSite, onEditSite, onViewDemo, onBuyDomain }) => {
  const [tab, setTab] = useState('sites');
  const [demoSite, setDemoSite] = useState(null);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 [background-image:linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:2rem_2rem]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-6xl mx-auto p-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Booking Engine Studio</div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sites de Réservation</h1>
            <p className="text-slate-500 mt-1 font-medium">Créez, gérez et publiez vos sites hôteliers en quelques minutes.</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button onClick={onBuyDomain} className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm transition flex items-center gap-2 shadow-sm">
              <Globe size={16}/> Acheter un domaine
            </button>
            <button onClick={onNewSite} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-xl shadow-indigo-200 transition active:scale-95 flex items-center gap-2">
              <Wand2 size={16}/> Créer avec l'IA
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Réservations', val: '1,284', icon: CalendarDays, color: 'indigo', trend: '+12%' },
            { label: 'Revenus', val: '€42,500', icon: Star, color: 'amber', trend: '+8%' },
            { label: 'Sites actifs', val: String(sites.length || 0), icon: Globe, color: 'sky', trend: sites.length > 0 ? 'actif' : 'créer' },
            { label: 'Conversion', val: '5.2%', icon: Zap, color: 'green', trend: '+0.8%' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 bg-${s.color}-50 rounded-xl`}><s.icon size={18} className={`text-${s.color}-500`}/></div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${s.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{s.trend}</span>
              </div>
              <div className="text-2xl font-black text-slate-800 tracking-tight">{s.val}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-200 p-1 rounded-2xl mb-8 w-fit">
          {[{ id: 'sites', label: 'Mes Sites' }, { id: 'demos', label: 'Démos Hôteliers' }, { id: 'templates', label: 'Templates' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* My Sites */}
        {tab === 'sites' && (
          sites.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-100 rounded-3xl p-16 text-center shadow-xl">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner"><Sparkles size={40} className="animate-pulse"/></div>
              <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Aucun site créé</h2>
              <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium leading-relaxed">Créez votre premier site hôtelier professionnel avec l'IA en moins de 2 minutes.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={onNewSite} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold transition shadow-xl flex items-center gap-2 justify-center active:scale-95"><Wand2 size={18}/> Générer avec l'IA</button>
                <button onClick={() => setTab('demos')} className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-3.5 rounded-2xl font-bold transition hover:border-indigo-300 flex items-center gap-2 justify-center"><Play size={18}/> Voir les démos</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sites.map(site => (
                <div key={site.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition duration-300 overflow-hidden group">
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    <img src={site.heroImg || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80'} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/>
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> En ligne
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-slate-800 truncate mb-1">{site.name}</h3>
                    <a href={`https://${site.domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold mb-4 hover:underline"><Globe size={12}/>{site.domain}</a>
                    <div className="flex gap-2">
                      <button onClick={() => onEditSite(site)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition border border-slate-200 active:scale-[0.98] flex items-center justify-center gap-1.5"><Edit3 size={14}/> Éditer</button>
                      <button onClick={() => setDemoSite({...site, heroImg: site.heroImg || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'})} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition border border-slate-200"><Eye size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Demo Sites */}
        {tab === 'demos' && (
          <div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <Bot size={20} className="text-indigo-600 shrink-0"/>
              <div><div className="font-bold text-indigo-900 text-sm">Sites démo en production</div><div className="text-indigo-600 text-xs mt-0.5">Découvrez ce que votre site pourrait ressembler — cliquez "Aperçu" pour voir le site complet, puis "Utiliser" pour partir de ce template.</div></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {DEMO_HOTEL_SITES.map(demo => (
                <div key={demo.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition duration-300 group">
                  <div className="aspect-video relative overflow-hidden">
                    <img src={demo.heroImg} className="w-full h-full object-cover group-hover:scale-105 transition duration-700"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                      <div className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{demo.type}</div>
                      <h3 className="text-white font-black text-base tracking-tight">{demo.name}</h3>
                    </div>
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> En ligne
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold mb-3"><Globe size={11}/>{demo.domain}</div>
                    <div className="grid grid-cols-3 gap-1.5 mb-4">
                      {[{ l: 'Visites', v: demo.visits }, { l: 'Conversion', v: demo.conversion }, { l: 'Revenus', v: demo.revenue }].map((s, i) => (
                        <div key={i} className="bg-slate-50 rounded-xl p-2 text-center">
                          <div className="font-black text-xs text-slate-800">{s.v}</div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setDemoSite(demo)} className="flex-1 bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"><Eye size={12}/>Aperçu</button>
                      <button onClick={() => onNewSite(HOTEL_TEMPLATES.find(t => t.bg === demo.bg) || HOTEL_TEMPLATES[0])} className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"><Wand2 size={12}/>Utiliser</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates */}
        {tab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {HOTEL_TEMPLATES.map(t => (
              <div key={t.id} onClick={() => onNewSite(t)}
                className="bg-white rounded-2xl overflow-hidden border-2 border-transparent hover:border-indigo-500 shadow-sm hover:shadow-xl transition duration-300 cursor-pointer group">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img src={t.thumb} className="w-full h-full object-cover group-hover:scale-105 transition duration-700"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {t.palette.map((c, i) => <div key={i} style={{ background: c }} className="w-4 h-4 rounded-full border border-white shadow"/>)}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition">
                    <button className="bg-white text-indigo-700 font-black text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition"><Play size={11} fill="currentColor"/>Commencer</button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg">{t.category}</span>
                    <span className="text-[10px] text-slate-400 font-bold">8 sections</span>
                  </div>
                  <h3 className="font-black text-slate-900 tracking-tight">{t.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Demo preview */}
      {demoSite && <DemoHotelSite site={demoSite} onClose={() => setDemoSite(null)} onUse={() => { onNewSite(HOTEL_TEMPLATES.find(t => t.bg === demoSite.bg) || HOTEL_TEMPLATES[0]); setDemoSite(null); }} />}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   DOMAIN PURCHASE MODAL
═══════════════════════════════════════════════ */
const DomainSearchModal = ({ onClose, onPurchase }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [bought, setBought] = useState(null);

  const handleSearch = () => {
    if (!query) return;
    setSearching(true);
    setTimeout(() => {
      const base = query.split('.')[0].toLowerCase();
      setResults([
        { name: `${base}.com`, price: '14.99', available: Math.random() > 0.3 },
        { name: `${base}.net`, price: '9.99', available: true },
        { name: `${base}.fr`, price: '11.99', available: Math.random() > 0.2 },
        { name: `${base}.hotel`, price: '39.99', available: true },
        { name: `${base}.io`, price: '49.99', available: Math.random() > 0.5 },
      ]);
      setSearching(false);
    }, 1200);
  };

  if (bought) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl w-full max-w-md p-10 text-center shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle size={32}/></div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Domaine Réservé !</h2>
          <p className="text-slate-500 mb-6 text-sm"><strong className="text-slate-800">{bought}</strong> vous appartient. Configuration DNS & SSL automatique.</p>
          <button onClick={() => { onPurchase(bought); onClose(); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition">Créer mon site →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div><h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Globe className="text-indigo-600" size={20}/> Acheter un Domaine</h2><p className="text-slate-500 text-xs mt-1">Trouvez le nom parfait pour votre établissement.</p></div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition"><X size={18}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative mb-6">
            <input type="text" placeholder="Ex: villaparis, hotelmarrakech..."
              value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-4 pr-32 text-base font-bold text-slate-800 focus:border-indigo-500 transition outline-none"/>
            <button onClick={handleSearch} disabled={searching}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50">
              {searching ? <RefreshCcw size={14} className="animate-spin"/> : <Search size={14}/>} Rechercher
            </button>
          </div>
          {results && (
            <div className="space-y-2">
              {results.map(r => (
                <div key={r.name} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition ${r.available ? 'border-slate-200 hover:border-indigo-300 bg-white' : 'border-slate-100 bg-slate-50 opacity-50'}`}>
                  <div>
                    <span className="font-bold text-slate-800">{r.name}</span>
                    {!r.available && <span className="ml-2 text-xs text-slate-400 font-medium">Non disponible</span>}
                  </div>
                  {r.available && (
                    <button onClick={() => setBought(r.name)} className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl font-bold text-xs transition">
                      {r.price}€/an →
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN ORCHESTRATOR
═══════════════════════════════════════════════ */
const WebsiteBuilder = () => {
  const [phase, setPhase] = useState('dashboard');
  const [sites, setSites] = useState([]);
  const [editingSite, setEditingSite] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [siteContext, setSiteContext] = useState('');
  const [activeDomain, setActiveDomain] = useState('');
  const [showDomainSearch, setShowDomainSearch] = useState(false);

  const handleNewSite = (template = null) => {
    setSelectedTemplate(template);
    if (template) {
      setPhase('wizard');
    } else {
      setPhase('gallery');
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setPhase('wizard');
  };

  const handleGenerate = (name, location, brief, template) => {
    setSiteContext(name);
    setSelectedTemplate(template);
    setPhase('editor');
  };

  const handlePublish = (domain, blocks) => {
    const newSite = {
      id: editingSite?.id || Date.now().toString(),
      name: siteContext || selectedTemplate?.name || 'Mon Site',
      domain,
      heroImg: selectedTemplate?.thumb || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
      blocks,
      status: 'live',
      publishDate: new Date().toLocaleDateString('fr-FR'),
    };
    if (editingSite) {
      setSites(prev => prev.map(s => s.id === editingSite.id ? newSite : s));
    } else {
      setSites(prev => [...prev, newSite]);
    }
    setActiveDomain(domain);
    setEditingSite(null);
    setPhase('published');
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setSiteContext(site.name);
    setSelectedTemplate(HOTEL_TEMPLATES.find(t => t.thumb === site.heroImg) || HOTEL_TEMPLATES[0]);
    setPhase('editor');
  };

  // ── PHASES ──

  if (phase === 'gallery') {
    return <TemplateGallery onSelect={handleTemplateSelect} onBack={() => setPhase('dashboard')} />;
  }

  if (phase === 'wizard') {
    return <AIWizard selectedTemplate={selectedTemplate} onGenerate={handleGenerate} onBack={() => setPhase(selectedTemplate ? 'gallery' : 'dashboard')} />;
  }

  if (phase === 'editor') {
    return (
      <VisualEditor
        initialBlocks={editingSite?.blocks}
        siteContext={siteContext}
        template={selectedTemplate}
        onPublish={handlePublish}
        onBack={() => setPhase('dashboard')}
      />
    );
  }

  if (phase === 'published') {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center bg-slate-50 p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md text-center border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="relative mb-7 inline-block">
            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-30 rounded-full animate-pulse"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center relative shadow-lg shadow-green-200">
              <CheckCircle size={40} className="text-white"/>
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Site en Ligne !</h2>
          <p className="text-slate-500 mb-6 leading-relaxed text-sm">
            <strong className="text-slate-800">{siteContext}</strong> est maintenant accessible sur{' '}
            <a href={`https://${activeDomain}`} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">{activeDomain}</a>
          </p>
          <div className="space-y-3">
            <button onClick={() => setPhase('dashboard')} className="w-full bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"><Home size={16}/> Retour au Dashboard</button>
            <button onClick={() => setPhase('editor')} className="w-full bg-slate-100 text-slate-700 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2"><Edit3 size={16}/> Continuer à éditer</button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <>
      <Dashboard
        sites={sites}
        onNewSite={handleNewSite}
        onEditSite={handleEditSite}
        onBuyDomain={() => setShowDomainSearch(true)}
      />
      {showDomainSearch && (
        <DomainSearchModal
          onClose={() => setShowDomainSearch(false)}
          onPurchase={(domain) => { setActiveDomain(domain); setPhase('wizard'); setShowDomainSearch(false); }}
        />
      )}
    </>
  );
};

export default WebsiteBuilder;
