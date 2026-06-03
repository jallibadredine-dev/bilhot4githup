import React, { useState, useCallback, useRef } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  addEdge, 
  applyEdgeChanges, 
  applyNodeChanges,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Plus, Calendar, ShieldCheck, MessageSquare, Key, Settings,
  Zap, Layout, Smartphone, Brain, Sparkles, ChevronDown, X,
  Copy, Check, Play, RefreshCw, Globe2, WifiOff, BrainCircuit,
  ArrowRight, Lock, Bot, AlertCircle, FlaskConical, Bell
} from 'lucide-react';
import './WorkflowBuilder.css';

/* ─── AI Models ─── */
const AI_MODELS = [
  { id: 'gpt4', name: 'OpenAI GPT-4o', color: '#10A37F', logo: '🤖', badge: 'Premium' },
  { id: 'gemini', name: 'Google Gemini', color: '#4285F4', logo: '✨', badge: 'Fast' },
  { id: 'nano', name: 'Nano Banana', color: '#F59E0B', logo: '🍌', badge: 'Lite' },
];

/* ─── Variable Tags ─── */
const VARIABLE_TAGS = [
  { tag: '{{guest_name}}', label: 'Prénom hôte' },
  { tag: '{{check_in_date}}', label: 'Check-in' },
  { tag: '{{check_out_date}}', label: 'Check-out' },
  { tag: '{{last_message}}', label: 'Dernier message' },
  { tag: '{{room_number}}', label: 'N° chambre' },
  { tag: '{{lang}}', label: 'Langue client' },
  { tag: '{{lock_code}}', label: 'Code serrure' },
  { tag: '{{property_name}}', label: 'Propriété' },
];

/* ─── Workflow Templates ─── */
const TEMPLATES = [
  {
    id: 'checkin-auto',
    name: 'Check-in Automatisé (WhatsApp)',
    icon: '🤖',
    color: '#10B981',
    description: 'ID Verification → Lock Code → Notification Manager',
    prompt: 'Dès que la réservation {{property_name}} arrive, envoie le lien de vérification ID à {{guest_name}}. Dès validation, génère le code {{lock_code}} et notifie le Manager.',
    trigger: 'Nouvelle réservation reçue',
  },
  {
    id: 'auto-reply',
    name: 'Réponse Auto IA',
    icon: '💬',
    color: '#3B82F6',
    description: 'Répond automatiquement aux questions des voyageurs',
    prompt: 'Tu es le concierge IA de {{property_name}}. Réponds à la question de {{guest_name}} en {{lang}} de façon chaleureuse et professionnelle. Message du client : {{last_message}}',
    trigger: 'Nouveau message reçu',
  },
  {
    id: 'lock-assign',
    name: 'Gestion Accès IoT',
    icon: '🔐',
    color: '#8B5CF6',
    description: 'Génération de codes permanents et temporaires via TTLock/Salto',
    prompt: 'Génère un code d\'accès pour la chambre {{room_number}} valide du {{check_in_date}} au {{check_out_date}}. Envoie par WhatsApp.',
    trigger: 'Après validation du paiement',
  }
];

/* ─── Custom Nodes ─── */
const CustomNode = ({ data, selected, type }) => {
  const Icon = data.icon || Settings;
  return (
    <div className={`custom-node ${selected ? 'selected' : ''} node-${type}`}>
      <Handle type="target" position={Position.Top} />
      <div className="node-title">
        <Icon size={18} color={data.color || '#3B82F6'} />
        <span>{data.label}</span>
        {data.aiEnabled && (
          <span className="node-ai-badge">
            <Brain size={10} />
            IA
          </span>
        )}
      </div>
      <div className="node-desc">{data.description}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const AINode = ({ data, selected }) => (
  <div className={`custom-node ai-node ${selected ? 'selected' : ''}`}>
    <Handle type="target" position={Position.Top} />
    <div className="node-title">
      <BrainCircuit size={18} color="#8B5CF6" />
      <span>{data.label}</span>
      <span className="node-ai-badge ai-badge-active">
        <Sparkles size={10} />
        {data.model || 'IA'}
      </span>
    </div>
    <div className="node-desc">{data.description}</div>
    <div className="ai-node-footer">
      <span className="ai-model-chip">{data.modelName || 'GPT-4o'}</span>
    </div>
    <Handle type="source" position={Position.Bottom} />
  </div>
);

/* ─── Initial Graph ─── */
const makeInitialNodes = () => [
  {
    id: '1', type: 'trigger', position: { x: 250, y: 0 },
    data: { label: 'Réservation Reçue', description: 'Airbnb / Booking / Direct', icon: Calendar, color: '#F59E0B' },
  },
  {
    id: '2', type: 'action', position: { x: 250, y: 130 },
    data: { label: 'Envoi Lien ID (WhatsApp)', description: 'Lien Aura Check-in sécurisé', icon: MessageSquare, color: '#25D366' },
  },
  {
    id: '3', type: 'verify', position: { x: 250, y: 260 },
    data: { label: 'Vérification ID Guest', description: 'OCR & Selfie Match (DGSN)', icon: ShieldCheck, color: '#10B981' },
  },
  {
    id: '4', type: 'security', position: { x: 50, y: 390 },
    data: { label: 'Générer Code Lock', description: 'API TTLock / Nuki Auto', icon: Key, color: '#EF4444' },
  },
  {
    id: '5', type: 'action', position: { x: 50, y: 520 },
    data: { label: 'Envoi Code au Guest', description: 'Message WhatsApp de bienvenue', icon: Smartphone, color: '#25D366' },
  },
  {
    id: '6', type: 'action', position: { x: 450, y: 390 },
    data: { label: 'Notif Manager', description: 'Alerte App & Email Proprio', icon: Bell, color: '#6366F1' },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e3-6', source: '3', target: '6', animated: true, label: 'Success' },
];

const nodeTypes = {
  trigger: (props) => <CustomNode {...props} type="trigger" />,
  verify:  (props) => <CustomNode {...props} type="verify" />,
  action:  (props) => <CustomNode {...props} type="action" />,
  security:(props) => <CustomNode {...props} type="security" />,
  ai:      (props) => <AINode {...props} />,
};

/* ─── MAIN COMPONENT ─── */
const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState(makeInitialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [globalModel, setGlobalModel] = useState('gpt4');
  const [showModelPicker, setShowModelPicker] = useState(false);

  // AI Preview simulation
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiPreview, setAiPreview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Channel config
  const [authConfig, setAuthConfig] = useState({
    active_channel: 'whatsapp',
    config: {
      sms: { provider: 'Twilio', enabled: false, phoneNumber: '+33 6 00 00 00 00' },
      whatsapp: { provider: 'Meta Cloud API', enabled: true, businessId: '80921734551' },
      email: { provider: 'SendGrid (SMTP)', enabled: true, subject: 'Votre code de connexion' },
    },
    template: { body: 'Bonjour {{guest_name}}, votre code d\'accès est {{lock_code}}. Bienvenue !' },
  });

  const properties = [
    { id: 'p1', name: 'Appt #102', brand: 'Tuya Smart', icon: <Layout size={16}/> },
    { id: 'p2', name: 'Villa Royale', brand: 'Nuki', icon: <Smartphone size={16}/> },
    { id: 'p3', name: 'Loft Paris', brand: 'TTLock', icon: <Layout size={16}/> },
    { id: 'p4', name: 'Studio Ocean', brand: 'TTHotel', icon: <Layout size={16}/> },
  ];

  /* ─── Simulate AI Preview ─── */
  const simulateAI = () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiPreview(null);
    setTimeout(() => {
      const model = AI_MODELS.find(m => m.id === globalModel);
      const resolved = aiPrompt
        .replace('{{guest_name}}', 'Sophie Martin')
        .replace('{{property_name}}', 'Villa Royale')
        .replace('{{lang}}', 'Français')
        .replace('{{last_message}}', 'Quelle est l\'heure du check-in ?')
        .replace('{{check_in_date}}', '25 mars à 15h00')
        .replace('{{lock_code}}', '4892')
        .replace('{{room_number}}', '204');
      setAiPreview({
        model: model?.name || 'IA',
        output: `[${model?.logo} ${model?.name}] Bonjour Sophie ! 🌟\n\nVotre check-in à la Villa Royale est prévu le 25 mars à partir de 15h00. Je serai ravie de vous accueillir !\n\nVotre code d'accès unique : 4892.\n\nN'hésitez pas si vous avez d'autres questions. À très bientôt ! 🏡`
      });
      setAiLoading(false);
    }, 1400);
  };

  /* ─── Load Template ─── */
  const loadTemplate = (template) => {
    const newNode = {
      id: String(Date.now()),
      type: 'ai',
      position: { x: 150 + Math.random() * 200, y: 450 },
      data: {
        label: template.name,
        description: template.description,
        icon: BrainCircuit,
        color: template.color,
        aiEnabled: true,
        model: globalModel,
        modelName: AI_MODELS.find(m => m.id === globalModel)?.name || 'IA',
        prompt: template.prompt,
      },
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
    setAiPrompt(template.prompt);
    setAiPreview(null);
  };

  /* ─── React Flow handlers ─── */
  const onNodesChange = useCallback((changes) => setNodes(nds => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges(eds => applyEdgeChanges(changes, eds)), []);
  const onConnect    = useCallback((params) => setEdges(eds => addEdge({ ...params, animated: true }, eds)), []);
  const onNodeClick  = useCallback((_, node) => {
    setSelectedNode(node);
    setAiPrompt(node.data?.prompt || '');
    setAiPreview(null);
  }, []);
  const onPaneClick  = useCallback(() => setSelectedNode(null), []);

  /* ─── Insert variable into textarea ─── */
  const textAreaRef = useRef(null);
  const insertVariable = (tag) => {
    const ta = textAreaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newVal = aiPrompt.substring(0, start) + tag + aiPrompt.substring(end);
    setAiPrompt(newVal);
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + tag.length;
      ta.focus();
    }, 0);
  };

  /* ─── Helpers ─── */
  const currentModel = AI_MODELS.find(m => m.id === globalModel) || AI_MODELS[0];
  const isAiNode = selectedNode?.type === 'ai';
  const isActionNode = selectedNode?.type === 'action';
  const isSecurityNode = selectedNode?.type === 'security';
  const isTriggerNode = selectedNode?.type === 'trigger';

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Sync prompt into node data
    if (selectedNode) {
      setNodes(prev => prev.map(n => n.id === selectedNode.id
        ? { ...n, data: { ...n.data, prompt: aiPrompt } } : n));
    }
  };

  const updateChannelConfig = (ch, key, val) => setAuthConfig(prev => ({
    ...prev, config: { ...prev.config, [ch]: { ...prev.config[ch], [key]: val } }
  }));
  const setEnabled = (ch, enabled) => updateChannelConfig(ch, 'enabled', enabled);
  const updateTemplate = (key, val) => setAuthConfig(prev => ({
    ...prev, template: { ...prev.template, [key]: val }
  }));

  return (
    <div className="workflow-builder-container">

      {/* ─── Left Sidebar ─── */}
      <aside className="workflow-sidebar">
        <div className="sidebar-header">
          <h3>Mes Actifs</h3>
        </div>
        <div className="asset-list">
          {properties.map(p => (
            <div key={p.id} className="asset-item" draggable>
              <div className="asset-icon">{p.icon}</div>
              <div className="asset-info">
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{p.brand}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── AI Templates ─── */}
        <div className="sidebar-header" style={{ marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
          <h3>
            <Brain size={14} style={{ display: 'inline', marginRight: '6px', color: '#8B5CF6' }}/>
            Templates IA
          </h3>
        </div>
        <div className="template-list">
          {TEMPLATES.map(t => (
            <div key={t.id} className="template-item" onClick={() => loadTemplate(t)}>
              <span className="template-emoji">{t.icon}</span>
              <div>
                <div className="template-name">{t.name}</div>
                <div className="template-desc">{t.description}</div>
              </div>
              <ArrowRight size={14} className="template-arrow" />
            </div>
          ))}
        </div>
      </aside>

      {/* ─── Center: Canvas ─── */}
      <main className="workflow-canvas">
        {/* Top bar */}
        <div className="workflow-topbar">
          <div className="wf-topbar-left">
            <Zap size={16} style={{ color: '#F59E0B' }} />
            <span className="wf-topbar-title">Workflow Automation</span>
          </div>
          <div className="wf-topbar-right">
            {/* Model Picker */}
            <div className="model-picker-wrap">
              <button className="model-picker-btn" onClick={() => setShowModelPicker(!showModelPicker)}>
                <span>{currentModel.logo}</span>
                <span className="model-picker-name">{currentModel.name}</span>
                <span className="model-badge" style={{ background: currentModel.color + '20', color: currentModel.color }}>
                  {currentModel.badge}
                </span>
                <ChevronDown size={14} />
              </button>
              {showModelPicker && (
                <div className="model-dropdown">
                  <div className="model-dropdown-title">Sélectionner le modèle IA global</div>
                  {AI_MODELS.map(m => (
                    <div
                      key={m.id}
                      className={`model-option ${globalModel === m.id ? 'active' : ''}`}
                      onClick={() => { setGlobalModel(m.id); setShowModelPicker(false); }}
                    >
                      <span>{m.logo}</span>
                      <div>
                        <div className="model-opt-name">{m.name}</div>
                      </div>
                      {globalModel === m.id && <Check size={14} style={{ color: m.color, marginLeft: 'auto' }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="wf-btn-save" onClick={handleSave}>
              {saved ? <><Check size={14}/> Sauvegardé</> : <><Play size={14}/> Activer</>}
            </button>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
        >
          <Background color="#E2E8F0" gap={20} variant="dots" />
          <Controls />
          <MiniMap
            nodeColor={(n) => n.type === 'ai' ? '#8B5CF6' : (n.data?.color || '#3B82F6')}
            maskColor="rgba(255,255,255,0.6)"
            style={{ borderRadius: '12px' }}
          />
        </ReactFlow>
      </main>

      {/* ─── Right Sidebar: Config Panel ─── */}
      <aside className="workflow-config-panel">
        <div className="config-header">
          <h3>Configuration</h3>
          <p>{selectedNode ? selectedNode.data.label : 'Sélectionnez un bloc'}</p>
        </div>

        {!selectedNode && (
          <div className="config-empty">
            <BrainCircuit size={36} strokeWidth={1} />
            <p>Cliquez sur un bloc du canvas pour le configurer</p>
          </div>
        )}

        {selectedNode && (
          <div className="config-content">

            {/* ══════ AI NODE CONFIG ══════ */}
            {isAiNode && (
              <>
                {/* AI Badge */}
                <div className="ai-powered-banner">
                  <Sparkles size={14} />
                  <span>Propulsé par l'Intelligence Artificielle</span>
                </div>

                {/* Model Selection */}
                <div className="config-group">
                  <label>Modèle IA</label>
                  <div className="model-grid">
                    {AI_MODELS.map(m => (
                      <button
                        key={m.id}
                        className={`model-card ${globalModel === m.id ? 'active' : ''}`}
                        style={{ '--mc': m.color }}
                        onClick={() => setGlobalModel(m.id)}
                      >
                        <span>{m.logo}</span>
                        <span>{m.name.split(' ').slice(-1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Prompt Builder */}
                <div className="config-group">
                  <label>
                    <BrainCircuit size={13} style={{ display: 'inline', marginRight: '4px', color: '#8B5CF6' }}/>
                    Instruction IA (Prompt)
                  </label>
                  <textarea
                    ref={textAreaRef}
                    className="config-input config-textarea ai-textarea"
                    rows="5"
                    placeholder="Ex: Tu es le concierge IA de {{property_name}}. Réponds à {{guest_name}} en {{lang}}..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>

                {/* Variable Tags */}
                <div className="config-group">
                  <label>Variables dynamiques</label>
                  <div className="variable-tags-grid">
                    {VARIABLE_TAGS.map(v => (
                      <button key={v.tag} className="var-tag-btn" onClick={() => insertVariable(v.tag)} title={v.label}>
                        {v.tag.replace('{{', '').replace('}}', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fallback mode */}
                <div className="config-group">
                  <label>En cas d'échec IA</label>
                  <select className="config-input">
                    <option>Basculer sur template standard</option>
                    <option>Notifier l'équipe</option>
                    <option>Ignorer et continuer</option>
                  </select>
                </div>

                {/* AI Preview button */}
                <div className="config-group">
                  <button className="btn-ai-preview" onClick={simulateAI} disabled={aiLoading || !aiPrompt.trim()}>
                    {aiLoading
                      ? <><RefreshCw size={14} className="spin"/> Génération en cours...</>
                      : <><FlaskConical size={14}/> Prévisualiser la réponse IA</>
                    }
                  </button>
                </div>

                {/* AI Output Preview */}
                {aiPreview && (
                  <div className="ai-preview-box">
                    <div className="ai-preview-header">
                      <Bot size={14} />
                      <span>{aiPreview.model}</span>
                      <Check size={12} style={{ color: '#10B981', marginLeft: 'auto' }} />
                    </div>
                    <pre className="ai-preview-output">{aiPreview.output}</pre>
                  </div>
                )}
              </>
            )}

            {/* ══════ ACTION NODE CONFIG ══════ */}
            {isActionNode && (
              <>
                {/* Optionally enable AI on this node */}
                <div className="ai-upgrade-hint" onClick={() => {
                  setNodes(prev => prev.map(n => n.id === selectedNode.id
                    ? { ...n, type: 'ai', data: { ...n.data, aiEnabled: true, prompt: '', modelName: currentModel.name } }
                    : n
                  ));
                  setSelectedNode(prev => ({ ...prev, type: 'ai' }));
                }}>
                  <Brain size={14} />
                  <span>Passer à la réponse IA automatique →</span>
                </div>

                <div className="config-group">
                  <label>Canal de destination</label>
                  <div className="channel-selector">
                    {['sms', 'whatsapp', 'email'].map(c => (
                      <div
                        key={c}
                        className={`channel-option ${authConfig.active_channel === c ? 'active' : ''}`}
                        onClick={() => setAuthConfig(prev => ({ ...prev, active_channel: c }))}
                      >
                        {c.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="channel-config-box">
                  <div className="toggle-group">
                    <span className="toggle-label">Activer ce canal</span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={authConfig.config[authConfig.active_channel].enabled}
                        onChange={(e) => setEnabled(authConfig.active_channel, e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  {authConfig.config[authConfig.active_channel].enabled && (
                    <div className="channel-fields animate-fade-in">
                      <div className="config-group">
                        <label>Provider</label>
                        <select className="config-input" value={authConfig.config[authConfig.active_channel].provider} onChange={(e) => updateChannelConfig(authConfig.active_channel, 'provider', e.target.value)}>
                          {authConfig.active_channel === 'sms' && <><option>Twilio</option><option>MessageBird</option><option>Infobip</option></>}
                          {authConfig.active_channel === 'whatsapp' && <><option>Meta Cloud API</option><option>Twilio for WA</option><option>360dialog</option></>}
                          {authConfig.active_channel === 'email' && <><option>SendGrid (SMTP)</option><option>Amazon SES</option><option>Postmark</option></>}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="config-group">
                  <label>Contenu du message</label>
                  <textarea
                    className="config-input config-textarea"
                    rows="3"
                    value={authConfig.template.body}
                    onChange={(e) => updateTemplate('body', e.target.value)}
                  />
                  <div className="variable-tags-grid" style={{ marginTop: '8px' }}>
                    {VARIABLE_TAGS.slice(0, 4).map(v => (
                      <button key={v.tag} className="var-tag-btn" onClick={() => updateTemplate('body', authConfig.template.body + ' ' + v.tag)}>
                        {v.tag.replace('{{', '').replace('}}', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ══════ SECURITY NODE CONFIG ══════ */}
            {isSecurityNode && (
              <div className="config-group">
                <label>Fournisseur Serrure</label>
                <select className="config-input">
                  <option>TTLock (Standard)</option>
                  <option>TTHotel</option>
                  <option>Tuya Smart</option>
                  <option>Nuki Web API</option>
                </select>
                <div style={{ marginTop: '16px' }}>
                  <label>Délai d'envoi (heures avant)</label>
                  <input type="number" className="config-input" defaultValue="24" />
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label>Durée validité code (h)</label>
                  <input type="number" className="config-input" defaultValue="48" />
                </div>
              </div>
            )}

            {/* ══════ TRIGGER NODE CONFIG ══════ */}
            {isTriggerNode && (
              <div className="config-group">
                <label>Source de Réservation</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Airbnb', 'Booking.com', 'Vrbo', 'Direct Booking', 'TTLock Event'].map(src => (
                    <label key={src} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={['Airbnb', 'Booking.com', 'Direct Booking'].includes(src)} />
                      <span>{src}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ══════ SAVE BUTTON ══════ */}
            <div className="config-group" style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <button className="btn-save-config" onClick={handleSave}>
                {saved ? <><Check size={14}/> Sauvegardé !</> : 'Sauvegarder la configuration'}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default WorkflowBuilder;
