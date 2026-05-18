import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, User, Send, Sparkles, 
  RefreshCw, GraduationCap, Briefcase, 
  Terminal, ShieldCheck, Zap, 
  MessageSquare, Info, ChevronRight,
  TrendingUp, Star, Mic, MicOff,
  CheckCheck, Paperclip, Smile, X, Circle
} from 'lucide-react';
import { useApp } from '../App';
import { chatWithAI } from '../services/puterAI';

const SUGGESTIONS = [
  "Which skills should I learn next?",
  "How do I improve my resume?",
  "How can I switch to Data Science?",
  "Suggest portfolio project ideas",
  "How to prepare for interviews?",
  "What salary should I negotiate?",
];

const TRANSITION_TARGETS = [
  { label: "🧠 AI & Data Science", value: "Data Science" },
  { label: "🎓 Academic Pivot", value: "academia" },
  { label: "☁️ Cloud Engineering", value: "DevOps Cloud" },
  { label: "📦 Product Strategy", value: "product management" },
  { label: "🔒 Cybersecurity", value: "cybersecurity" },
  { label: "🎨 UI/UX Design", value: "UI UX design" },
  { label: "⛓️ Web3 & Blockchain", value: "blockchain" },
];

export default function MentorPage() {
  const { parsedResume } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const bottomRef = useRef();
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = () => stopRecording();
      recognitionRef.current.onend = () => {
        if (isListening) stopRecording();
      };
    }
    return () => stopRecording();
  }, [isListening]);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (e) { console.error(e); }
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize welcome message
  useEffect(() => {
    const profileType = parsedResume?.profile_type || 'professional';
    const domain = parsedResume?.primary_domain || 'tech';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages([{ 
      role: 'ai', 
      id: Date.now(), 
      content: `Hi! I'm your **Career Intelligence Mentor** 🤖\n\nI've analyzed your profile as a **${profileType}** in **${domain}**. How can I help you today?`, 
      time 
    }]);
  }, [parsedResume]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const ctx = {
    skills: parsedResume?.skills,
    domain: parsedResume?.primary_domain,
    years: parsedResume?.years_experience,
    isFresher: parsedResume?.is_fresher || false,
    profileType: parsedResume?.profile_type,
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) {
      if (isListening) stopRecording();
      return;
    }
    setInput('');
    if (isListening) stopRecording();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { role: 'user', id: Date.now(), content: msg, time }]);
    setLoading(true);
    try {
      const reply = await chatWithAI(msg, ctx);
      setMessages(m => [...m, { 
        role: 'ai', 
        id: Date.now() + 1, 
        content: reply || 'I apologize, but my neural link is experiencing a temporary disruption. Please try asking again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'ai', id: Date.now() + 2, content: '⚠️ Neural link interrupted. Please retry.', time: 'Error' }]);
    }
    setLoading(false);
  };

  const formatMsg = (text) => {
    const str = String(text || '');
    return str
      .replace(/## (.*?)(\n|$)/g, '<div style="font-family:var(--font-h);font-weight:700;font-size:1.1rem;margin:8px 0;color:var(--accent)">$1</div>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mentor-container" style={{ padding: '20px', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div className="glass glass-glow" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', borderRadius: 32 }}>
        {/* WhatsApp Header */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Bot size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '.95rem' }}>Mentor Core-v3</div>
              <div style={{ fontSize: '.7rem', color: 'var(--green)' }}>online</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 15, opacity: 0.7 }}>
             <MessageSquare size={18} />
             <Info size={18} />
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-messages" style={{ 
          flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12, 
          background: 'rgba(0,0,0,0.2)',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div key={m.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ alignSelf: m.role === 'ai' ? 'flex-start' : 'flex-end', maxWidth: '75%', position: 'relative' }}>
                <div style={{ 
                  padding: '10px 14px 24px', borderRadius: 12,
                  background: m.role === 'ai' ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.2)',
                  border: '1px solid', borderColor: m.role === 'ai' ? 'var(--border)' : 'rgba(99,102,241,0.3)',
                  color: 'var(--text2)', fontSize: '0.92rem', lineHeight: 1.5, position: 'relative', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div dangerouslySetInnerHTML={{ __html: formatMsg(m.content) }} />
                  <div style={{ position: 'absolute', bottom: 4, right: 8, fontSize: '0.65rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {m.time}
                    {m.role === 'user' && <CheckCheck size={12} style={{ color: 'var(--accent)' }} />}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div style={{ alignSelf: 'flex-start', padding: '10px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
              <div className="flex gap-1">
                {[0,1,2].map(i => <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Action Panel */}
        <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            
            <div style={{ display: 'flex', gap: 15, opacity: 0.6 }}>
              <Smile size={24} />
              <Paperclip size={24} />
            </div>
            
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
                placeholder="Type a message"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 24, padding: '12px 20px', color: 'var(--text)', outline: 'none' }}
              />
              
              <AnimatePresence>
                {isListening && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ 
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                      background: '#13131a', borderRadius: 24, padding: '0 20px', 
                      display: 'flex', alignItems: 'center', gap: 16, 
                      border: '1px solid rgba(255,59,48,0.4)', zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff3b30' }}>
                      <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Circle size={12} fill="#ff3b30" />
                      </motion.div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', width: 40 }}>{formatTime(recordingTime)}</span>
                    </div>
                    <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text3)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {input ? `"${input}"` : "Recording your query..."}
                    </div>
                    <button onClick={stopRecording} style={{ background: 'transparent', border: 'none', color: '#ff3b30', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <X size={20} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              {!isListening && (
                <motion.button 
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={startRecording}
                  style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', cursor: 'pointer', flexShrink: 0 }}
                >
                  <Mic size={20} />
                </motion.button>
              )}
              <motion.button 
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => send()}
                disabled={!input.trim() && !isListening}
                style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', flexShrink: 0 }}
              >
                <Send size={20} />
              </motion.button>
            </div>
          </div>
          
          <div style={{ marginTop: 12, display: 'flex', gap: 8, overflowX: 'auto' }} className="hide-scrollbar">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} style={{ whiteSpace: 'nowrap', padding: '6px 14px', fontSize: '0.75rem', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text3)', cursor: 'pointer' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
