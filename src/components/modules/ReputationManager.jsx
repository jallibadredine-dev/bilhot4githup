import React, { useState } from 'react';
import { Star, MessageSquare, Bot, CheckCircle2, Search, Filter, Sparkles, Send, Globe, ChevronRight } from 'lucide-react';
import './ReputationManager.css';

const REVIEWS_DATA = [
  {
    id: 1,
    guest: "Sophie Martin",
    channel: "Airbnb",
    channelColor: "bg-rose-100 text-rose-600",
    rating: 5,
    date: "12 Oct 2026",
    text: "Séjour incroyable ! La villa était parfaitement propre et la vue est à couper le souffle. Le système d'accès par code est très pratique. Nous reviendrons avec grand plaisir.",
    status: "replied",
    reply: "Chère Sophie, merci infiniment pour votre retour élogieux ! Nous sommes ravis que la propreté de la villa et la vue vous aient séduite. La satisfaction de nos clients est notre priorité. Au plaisir de vous accueillir à nouveau !",
  },
  {
    id: 2,
    guest: "Thomas Dubois",
    channel: "Booking.com",
    channelColor: "bg-blue-100 text-blue-800",
    rating: 3,
    date: "10 Oct 2026",
    text: "L'appartement est bien situé mais il y avait un peu de bruit la nuit et la climatisation faisait un bruit étrange. La literie était en revanche très confortable.",
    status: "pending",
  },
  {
    id: 3,
    guest: "Elena Rodriguez",
    channel: "TripAdvisor",
    channelColor: "bg-green-100 text-green-700",
    rating: 5,
    date: "08 Oct 2026",
    text: "Perfect location, amazing amenities. The smart locks made check-in seamless. Highly recommended for anyone visiting Agadir!",
    status: "pending",
  },
  {
    id: 4,
    guest: "Marc Leroy",
    channel: "Expedia",
    channelColor: "bg-yellow-100 text-yellow-700",
    rating: 4,
    date: "05 Oct 2026",
    text: "Bon séjour dans l'ensemble. L'équipe de la conciergerie a été très réactive pour notre demande de transfert aéroport. Seul bémol, le wifi parfois un peu lent.",
    status: "replied",
    reply: "Cher Marc, merci d'avoir partagé votre expérience. Nous sommes ravis que notre équipe de conciergerie ait pu faciliter votre séjour. Nous prenons bonne note de votre remarque concernant le Wifi et allons vérifier la connexion avec notre fournisseur. À très bientôt !",
  }
];

const STATS = {
  average: 4.8,
  total: 124,
  pending: 2,
  positive: 92
};

const ReputationManager = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviews, setReviews] = useState(REVIEWS_DATA);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = (review) => {
    setIsGenerating(true);
    setReplyText('');
    
    // Simulate AI Generation
    setTimeout(() => {
      let aiResponse = "";
      if (review.rating >= 4) {
         aiResponse = `Cher(e) ${review.guest},\n\nMerci beaucoup pour votre superbe note et votre commentaire chaleureux ! Nous sommes enchantés que vous ayez apprécié votre séjour parmi nous. \n\nAu plaisir de vous revoir bientôt.\n\nCordialement,\nL'Équipe de Direction`;
      } else {
         aiResponse = `Cher(e) ${review.guest},\n\nNous vous remercions d'avoir pris le temps de partager votre avis. Nous sommes sincèrement désolés que certains aspects de votre séjour n'aient pas été à la hauteur de vos attentes.\n\nNous prenons vos remarques très au sérieux et allons y remédier rapidement. Nous espérons avoir l'opportunité de vous accueillir à nouveau pour vous offrir une expérience parfaite.\n\nCordialement,\nL'Équipe de Direction`;
      }
      setReplyText(aiResponse);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSubmitReply = (id) => {
    const updatedReviews = reviews.map(r => {
      if (r.id === id) {
        return { ...r, status: 'replied', reply: replyText };
      }
      return r;
    });
    setReviews(updatedReviews);
    setActiveReplyId(null);
    setReplyText('');
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
       stars.push(
         <Star key={i} size={16} className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-200"} />
       );
    }
    return <div className="flex gap-1">{stars}</div>;
  };

  const filteredReviews = reviews.filter(r => {
    if (activeTab === 'pending' && r.status !== 'pending') return false;
    if (activeTab === 'replied' && r.status !== 'replied') return false;
    if (searchQuery && !r.guest.toLowerCase().includes(searchQuery.toLowerCase()) && !r.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="rep-container animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <header className="rep-header">
        <div className="rep-header-title">
          <div className="icon-wrapper">
             <MessageSquare size={28} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">E-Réputation & Avis</h1>
            <p className="text-slate-500 font-medium">Répondez professionnellement aux commentaires de vos clients (Airbnb, Booking...)</p>
          </div>
        </div>
        
        <div className="rep-kpi-grid">
           <div className="rep-kpi-card">
              <span className="kpi-label">Note Globale</span>
              <div className="kpi-value-wrap">
                 <span className="kpi-value">{STATS.average}</span>
                 <span className="kpi-max">/ 5</span>
              </div>
              {renderStars(Math.round(STATS.average))}
           </div>
           <div className="rep-kpi-card">
              <span className="kpi-label">Avis en attente</span>
              <div className="kpi-value-wrap">
                 <span className="kpi-value text-rose-500">{reviews.filter(r => r.status === 'pending').length}</span>
              </div>
              <span className="kpi-subtext">Nécessitent une réponse</span>
           </div>
        </div>
      </header>

      {/* FILTER BAR SECTION */}
      <div className="rep-filters-bar">
         <div className="rep-tabs">
            <button className={`rep-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Tous les avis</button>
            <button className={`rep-tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
               À répondre <span className="tab-badge bg-rose-100 text-rose-600">{reviews.filter(r => r.status === 'pending').length}</span>
            </button>
            <button className={`rep-tab ${activeTab === 'replied' ? 'active' : ''}`} onClick={() => setActiveTab('replied')}>Traités</button>
         </div>
         <div className="rep-search">
            <Search size={18} className="text-slate-400" />
            <input 
               type="text" 
               placeholder="Rechercher par nom, mot-clé..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      {/* REVIEWS FEED */}
      <div className="rep-feed space-y-6 pb-12">
        {filteredReviews.length === 0 && (
           <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
              <Filter size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">Aucun avis trouvé</h3>
              <p className="text-slate-500 mt-2">Vous êtes à jour ou les filtres ne correspondent à aucun résultat.</p>
           </div>
        )}

        {filteredReviews.map(review => (
          <div key={review.id} className="rep-review-card bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-8 flex gap-6 hover:shadow-lg transition-shadow duration-300">
            
            {/* Guest Meta Block */}
            <div className="w-48 shrink-0 border-r border-slate-100 pr-6 hidden md:block">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg mb-4">
                  {review.guest.charAt(0)}
               </div>
               <h4 className="font-bold text-slate-800 text-sm">{review.guest}</h4>
               <p className="text-xs text-slate-400 font-medium mb-4">{review.date}</p>
               
               <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${review.channelColor}`}>
                  <Globe size={12} /> {review.channel}
               </div>
            </div>

            {/* Review Content Area */}
            <div className="flex-1">
               {/* Mobile Meta (visible only on small screens) */}
               <div className="md:hidden flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {review.guest.charAt(0)}
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-800 text-sm">{review.guest}</h4>
                        <p className="text-xs text-slate-400">{review.date}</p>
                     </div>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${review.channelColor}`}>
                     {review.channel}
                  </div>
               </div>

               {/* Score & Text */}
               <div className="mb-4 flex items-center gap-3">
                 {renderStars(review.rating)}
                 <span className="text-sm font-bold text-slate-700">{review.rating} / 5</span>
               </div>
               <p className="text-slate-600 leading-relaxed font-medium">"{review.text}"</p>

               {/* Divider */}
               <div className="w-full h-px bg-slate-100 my-6"></div>

               {/* Reply Status / Action */}
               {review.status === 'replied' ? (
                 <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative">
                   <div className="absolute top-5 right-5 text-green-500" title="Réponse envoyée">
                      <CheckCircle2 size={20} />
                   </div>
                   <h5 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                     Votre réponse
                   </h5>
                   <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{review.reply}</p>
                 </div>
               ) : (
                 <div>
                   {activeReplyId !== review.id ? (
                      <button 
                        onClick={() => setActiveReplyId(review.id)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-5 py-2.5 rounded-xl transition text-sm flex items-center gap-2"
                      >
                         <MessageSquare size={16} /> Répondre à ce commentaire
                      </button>
                   ) : (
                      <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 animate-in fade-in zoom-in-95 duration-200">
                         <div className="flex items-center justify-between mb-4">
                            <h5 className="font-bold text-indigo-900 text-sm flex items-center gap-2">Rédiger une réponse</h5>
                            <button 
                               onClick={() => handleGenerateAI(review)}
                               disabled={isGenerating}
                               className="bg-white border border-indigo-200 hover:border-indigo-400 text-indigo-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                            >
                               {isGenerating ? <Sparkles size={14} className="animate-spin" /> : <Bot size={14} />}
                               Générer avec l'IA
                            </button>
                         </div>
                         <textarea 
                           className="w-full border-2 border-white bg-white rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:border-indigo-400 min-h-[120px] shadow-sm mb-4 leading-relaxed"
                           placeholder="Écrivez votre réponse professionnellement ici..."
                           value={replyText}
                           onChange={(e) => setReplyText(e.target.value)}
                         ></textarea>
                         <div className="flex items-center gap-3 justify-end">
                            <button 
                              onClick={() => { setActiveReplyId(null); setReplyText(''); }}
                              className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-100 rounded-xl text-sm transition"
                            >
                               Annuler
                            </button>
                            <button 
                              onClick={() => handleSubmitReply(review.id)}
                              disabled={!replyText.trim()}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                               <Send size={16} /> Envoyer la réponse
                            </button>
                         </div>
                      </div>
                   )}
                 </div>
               )}
            </div>
          </div>
        ))}

      </div>

    </div>
  );
};

export default ReputationManager;
