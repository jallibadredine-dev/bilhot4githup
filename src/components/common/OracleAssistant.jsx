import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  TrendingUp, 
  AlertCircle,
  Command,
  Mic,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './OracleAssistant.css';

const OracleAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I am Oracle, your AI hospitality agent. How can I help you optimize your property today?', time: 'Now' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text: inputValue, time: 'Just now' };
    setMessages([...messages, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulated AI Processing logic
    setTimeout(() => {
      let botResponse = "I'm analyzing that request for you...";
      const query = userMsg.text.toLowerCase();

      if (query.includes('occupancy') || query.includes('taux')) {
        botResponse = "Your occupancy for the next 7 days is forecasted at 82%. I recommend increasing rates for the Saturday peak.";
      } else if (query.includes('block') || query.includes('bloque')) {
        botResponse = "Understood. I've initiated a block of 10 rooms for the group. Shall I send the quotation email now?";
      } else if (query.includes('revenue') || query.includes('chiffre')) {
        botResponse = "Revenue is up 15% WoW. The RevPAR has hit €142.50 today, a record for this season.";
      } else {
        botResponse = "I've logged your request. I'm searching your PMS data for the best answer...";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botResponse, time: 'Just now' }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="oracle-wrapper">
      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button 
          className="oracle-fab"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="fab-icon-glow"></div>
          <Bot size={28} />
          <span className="fab-label">Oracle AI</span>
        </motion.button>
      )}

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="oracle-panel glass-panel"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
          >
            {/* Header */}
            <header className="oracle-header">
              <div className="oracle-identity">
                <div className="oracle-avatar">
                   <Sparkles size={16} />
                </div>
                <div>
                   <h4>Oracle Assistant</h4>
                   <span className="online-status">● En ligne & Intelligent</span>
                </div>
              </div>
              <div className="header-actions">
                 <button className="icon-btn"><Settings size={16} /></button>
                 <button className="icon-btn" onClick={() => setIsOpen(false)}><X size={18} /></button>
              </div>
            </header>

            {/* Suggestions Chips */}
            <div className="oracle-suggestions">
               <button className="chip" onClick={() => setInputValue('Forecast occupancy for next week')}>
                 <TrendingUp size={12} /> Forecast
               </button>
               <button className="chip" onClick={() => setInputValue('Check maintenance alerts')}>
                 <AlertCircle size={12} /> Alerts
               </button>
            </div>

            {/* Chat History */}
            <div className="oracle-history hide-scrollbar" ref={scrollRef}>
               {messages.map(msg => (
                 <div key={msg.id} className={`msg-row ${msg.type === 'user' ? 'msg-user' : 'msg-bot'}`}>
                    <div className="msg-content">
                       <p>{msg.text}</p>
                       <span className="msg-time">{msg.time}</span>
                    </div>
                 </div>
               ))}
               {isTyping && (
                 <div className="msg-row msg-bot typing">
                    <div className="typing-indicator">
                       <span></span><span></span><span></span>
                    </div>
                 </div>
               )}
            </div>

            {/* Footer / Input */}
            <footer className="oracle-footer">
               <div className="input-wrap">
                  <Command size={14} className="cmd-icon" />
                  <input 
                    type="text" 
                    placeholder="Ask Oracle or type / for commands..." 
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                  />
                  <div className="input-actions">
                    <button className="icon-btn"><Mic size={16} /></button>
                    <button className="send-btn" onClick={handleSend} disabled={!inputValue.trim()}><Send size={16} /></button>
                  </div>
               </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OracleAssistant;
