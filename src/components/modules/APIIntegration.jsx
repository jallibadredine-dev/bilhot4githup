import React, { useState } from 'react';
import { 
  Terminal, Globe, Shield, Zap, Copy, Check, 
  Settings, Key, Database, Server, ExternalLink, 
  Code, Activity, Share2, ArrowRight, Lock, Play, BookOpen
} from 'lucide-react';

const APIIntegrationPage = () => {
  const [apiKey, setApiKey] = useState('hf_live_882k991jzo0p22mx001q');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 md:p-12 max-w-screen-2xl mx-auto font-sans bg-[#F8FAFC] min-h-screen text-slate-900">
      
      {/* --- Premium Header --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Server size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">API REST Integration</h1>
            <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter">Connected</span>
          </div>
          <p className="text-slate-500 font-medium max-w-xl">
            Integrate HosFlow logic into your third-party applications. Manage properties, bookings, and pricing via our RESTful multi-tenant API.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm shadow-sm hover:bg-slate-50 transition flex items-center gap-2">
            <ExternalLink size={18}/> Documentation
          </button>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center gap-2">
            <Play size={18}/> API Playground
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: Credentials & Auth --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* API Key Manager */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Authentification Automatisée</h3>
              <p className="text-slate-400 font-medium text-sm mb-8">Utilisez cette clé secrète pour authentifier vos requêtes vers l'API HosFlow.</p>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Production API Key</label>
                  <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-2 pl-6 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300">
                    <div className="flex-1 font-mono text-sm text-slate-600 truncate">
                      {showKey ? apiKey : '••••••••••••••••••••••••••••••••'}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowKey(!showKey)}
                        className="p-3 text-slate-400 hover:text-indigo-600 transition"
                      >
                        {showKey ? <Lock size={18}/> : <Terminal size={18}/>}
                      </button>
                      <button 
                        onClick={handleCopy}
                        className="bg-white border border-slate-200 p-3 rounded-xl text-slate-600 hover:text-indigo-600 shadow-sm transition"
                      >
                        {copied ? <Check size={18} className="text-emerald-500"/> : <Copy size={18}/>}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <Shield className="text-amber-500 shrink-0" size={24} />
                  <div>
                    <div className="font-black text-amber-900 text-sm">Security Warning</div>
                    <p className="text-amber-700 text-xs font-medium leading-relaxed">
                      This key allows full access to your PMS data. Never use it in client-side code. Use it only in secure server-to-server integrations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
          </div>

          {/* Implementation Guide */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Code size={24} className="text-indigo-400"/> Quick Integration
            </h3>
            <div className="space-y-6">
              <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node.js / Axios Example</span>
                  <button className="text-indigo-400 hover:text-white transition font-bold text-xs">Copy</button>
                </div>
                <pre className="font-mono text-xs text-indigo-200 leading-relaxed overflow-x-auto">
{`const axios = require('axios');

const createBooking = async () => {
  const response = await axios.post('https://api.hosflow.com/v1/bookings', {
    property_id: "prop_99",
    check_in: "2026-05-20",
    check_out: "2026-05-25"
  }, {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'X-Tenant-ID': 'your_client_id'
    }
  });
  console.log(response.data);
};`}
                </pre>
              </div>
            </div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Stats & Webhooks --- */}
        <div className="space-y-8">
          
          {/* API Health */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <h4 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2"><Activity size={20} className="text-emerald-500"/> API Health</h4>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-500">Global Uptime</span>
                   <span className="text-xs font-black text-emerald-600">99.98%</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-500">Avg. Latency</span>
                   <span className="text-xs font-black text-indigo-600">124ms</span>
                </div>
                <div className="pt-4 border-t border-slate-50">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Usage this month</div>
                   <div className="flex justify-between text-[10px] font-black text-slate-800 mb-1">
                      <span>42,109 requests</span>
                      <span>84%</span>
                   </div>
                   <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[84%]"></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Webhook Configuration */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-slate-800 text-lg flex items-center gap-2"><Share2 size={20} className="text-indigo-600"/> Webhooks</h4>
                <button className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg transition"><Settings size={18}/></button>
             </div>
             <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">Recevez des notifications en temps réel lors de nouveaux bookings ou de paiements.</p>
             
             <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Production URL</span>
                      <span className="text-xs font-bold text-slate-600 truncate max-w-[140px]">https://partner.com/hooks</span>
                   </div>
                   <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Active</span>
                </div>
                <button className="w-full border-2 border-dashed border-slate-100 hover:border-indigo-100 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest py-3 rounded-2xl transition">
                   + Add New Endpoint
                </button>
             </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
             <button className="w-full bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-lg transition group">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition"><BookOpen size={18}/></div>
                   <span className="text-sm font-black text-slate-800">API Documentation</span>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition" />
             </button>
             <button className="w-full bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-lg transition group">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition"><Database size={18}/></div>
                   <span className="text-sm font-black text-slate-800">Schemas & Models</span>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition" />
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default APIIntegrationPage;
