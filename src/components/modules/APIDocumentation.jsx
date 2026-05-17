import React, { useState } from 'react';
import { 
  Book, Code, Terminal, Copy, Check, Globe, Lock, Zap, 
  ChevronRight, Search, Play, FileJson, Shield, Webhook 
} from 'lucide-react';

const APIDocumentation = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ code, language = 'bash', id }) => (
    <div className="relative group my-4">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
        <button 
          onClick={() => copyToClipboard(code, id)}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition backdrop-blur-sm"
        >
          {copied === id ? <Check size={14} className="text-emerald-400"/> : <Copy size={14}/>}
        </button>
      </div>
      <pre className="bg-[#0B1121] p-6 rounded-2xl overflow-x-auto text-indigo-300 font-mono text-sm border border-slate-800 shadow-2xl">
        <code>{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- Sidebar Navigation --- */}
      <aside className="w-80 border-r border-slate-100 bg-slate-50/30 flex flex-col fixed h-screen overflow-y-auto">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Zap size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight">Antigravity API</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium outline-none focus:border-indigo-500 transition shadow-sm"
            />
          </div>
        </div>

        <nav className="p-6 space-y-8">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Introduction</h3>
            <div className="space-y-1">
              {[
                { id: 'intro', label: 'Bienvenue', icon: Book },
                { id: 'auth', label: 'Authentification', icon: Lock },
                { id: 'errors', label: 'Gestion des erreurs', icon: Shield },
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeSection === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <item.icon size={16} /> {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-4">Endpoints PMS</h3>
            <div className="space-y-1">
              {[
                { id: 'inventory', label: 'Inventaire & Dispo', icon: Globe },
                { id: 'bookings', label: 'Réservations', icon: Terminal },
                { id: 'pricing', label: 'Tarification IA', icon: Zap },
                { id: 'webhooks', label: 'Webhooks', icon: Webhook },
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeSection === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <item.icon size={16} /> {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* --- Main Content --- */}
      <main className="ml-80 flex-1 p-12 max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            Documentation <ChevronRight size={12}/> API <ChevronRight size={12}/> {activeSection}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-500 text-[10px] font-black uppercase flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> API Status: v1.0.4-live
            </span>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition">Try API Sandbox</button>
          </div>
        </div>

        {/* --- SECTION: INTRODUCTION --- */}
        {activeSection === 'intro' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Introduction à l'API Antigravity</h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">
              L'API Antigravity permet aux développeurs tiers d'intégrer toute la puissance de notre système de gestion hôtelière dans leurs propres applications. 
              Grâce à notre architecture multi-tenant, vous pouvez gérer l'inventaire, les prix et les réservations en temps réel.
            </p>
            
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                <h4 className="font-black text-indigo-900 text-lg mb-2">Base URL</h4>
                <p className="text-indigo-700 text-sm font-medium">L'URL de base pour toutes les requêtes API est :</p>
                <div className="mt-4 bg-white p-4 rounded-2xl font-mono text-indigo-600 text-sm border border-indigo-200">
                  https://api.antigravity-pms.com/v1
                </div>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <h4 className="font-black text-slate-900 text-lg mb-2">Multi-Tenancy</h4>
                <p className="text-slate-600 text-sm font-medium">Chaque requête doit inclure votre identifiant client unique.</p>
                <div className="mt-4 bg-white p-4 rounded-2xl font-mono text-slate-500 text-sm border border-slate-200">
                  X-Tenant-ID: your_tenant_id
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- SECTION: AUTH --- */}
        {activeSection === 'auth' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Authentification</h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">
              Nous utilisons des clés d'API (Bearer Tokens) pour sécuriser chaque accès. Vos clés peuvent être générées dans votre tableau de bord Super Admin.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl mb-8 flex gap-4">
              <Shield className="text-amber-500 shrink-0" size={24} />
              <p className="text-sm text-amber-800 font-medium">
                Ne partagez jamais vos clés secrètes. Si une clé est compromise, révoquez-la immédiatement dans les paramètres de sécurité.
              </p>
            </div>

            <h4 className="text-xl font-black text-slate-800 mb-4">Exemple de Header</h4>
            <CodeBlock 
              id="curl-auth"
              code={`curl -X GET "https://api.antigravity-pms.com/v1/lodgings" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "X-Tenant-ID: tenant_882k9"`}
            />
          </div>
        )}

        {/* --- SECTION: BOOKINGS --- */}
        {activeSection === 'bookings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Réservations</h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">
              Créez et gérez des réservations avec calcul automatique des prix via le moteur Antigravity.
            </p>

            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">POST</span>
                  <span className="font-mono text-lg text-slate-800">/bookings</span>
                </div>
                <p className="text-slate-600 font-medium mb-6">Crée une nouvelle réservation et déclenche les webhooks configurés.</p>
                
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Request Body</h4>
                <CodeBlock 
                  id="json-booking"
                  language="json"
                  code={`{
  "property_id": "prop_991",
  "room_id": "room_A4",
  "check_in": "2026-05-12",
  "check_out": "2026-05-15",
  "guest": {
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com"
  }
}`}
                />

                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 mt-8">Response Example</h4>
                <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-slate-100 font-mono text-sm text-slate-700">
                  <div className="flex items-center justify-between text-emerald-600 font-black mb-4">
                    <span>201 Created</span>
                    <FileJson size={16}/>
                  </div>
                  {`{
  "id": "res_8872k",
  "status": "confirmed",
  "total_price": 450.00,
  "currency": "EUR"
}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- SECTION: ERRORS --- */}
        {activeSection === 'errors' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Gestion des erreurs</h2>
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8">
              L'API Antigravity renvoie des codes d'erreur standards HTTP ainsi que des codes métiers spécifiques au PMS.
            </p>

            <div className="overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code HTTP</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">PMS Code</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { http: '400', pms: 'ROOM_NOT_AVAILABLE', desc: 'La chambre est déjà occupée sur cette période.' },
                    { http: '401', pms: 'INVALID_AUTH', desc: 'Bearer token manquant ou invalide.' },
                    { http: '403', pms: 'TENANT_MISMATCH', desc: 'Accès refusé pour ce Tenant-ID.' },
                    { http: '404', pms: 'PROPERTY_NOT_FOUND', desc: "L'identifiant de propriété n'existe pas." },
                    { http: '422', pms: 'INVALID_DATE_RANGE', desc: 'La date de sortie est antérieure à la date d\'entrée.' },
                  ].map((err, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition">
                      <td className="p-6 font-black text-slate-800">{err.http}</td>
                      <td className="p-6"><code className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-xs font-bold">{err.pms}</code></td>
                      <td className="p-6 text-sm text-slate-500 font-medium">{err.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Global Footer (Visible on all sections) */}
        <footer className="mt-24 pt-12 border-t border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-400">© 2026 Antigravity PMS. All rights reserved.</p>
          <div className="flex gap-6">
            <button className="text-sm font-black text-indigo-600 hover:underline">Support</button>
            <button className="text-sm font-black text-indigo-600 hover:underline">Discord Community</button>
            <button className="text-sm font-black text-indigo-600 hover:underline">GitHub Samples</button>
          </div>
        </footer>

      </main>
    </div>
  );
};

export default APIDocumentation;
