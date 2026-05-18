import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Code2, Users, Layout, 
  UserCircle, MessageSquare, Lightbulb,
  ChevronRight, Brain, Sparkles, CheckCircle2,
  TrendingUp, Star, Info
} from 'lucide-react';
import { useApp } from '../App';
import { generateInterviewQuestions } from '../engines/interviewEngine';

const TABS = [
  { id: 'Technical', icon: <Code2 size={14} />, label: 'Technical' },
  { id: 'Behavioral', icon: <Users size={14} />, label: 'Behavioral' },
  { id: 'System Design', icon: <Layout size={14} />, label: 'System Design' },
  { id: 'HR', icon: <UserCircle size={14} />, label: 'HR Strategy' },
  { id: 'Project Viva', icon: <MessageSquare size={14} />, label: 'Project Viva' },
  { id: 'Personalized', icon: <Brain size={14} />, label: 'Personalized' },
  { id: 'Tips', icon: <Lightbulb size={14} />, label: 'Pro Tips' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function InterviewPage() {
  const { parsedResume } = useApp();
  const [activeTab, setActiveTab] = useState('Technical');
  const [revealed, setRevealed] = useState({});

  if (!parsedResume) return <div className="empty-state"><div className="empty-icon"><Mic size={64} opacity={0.3} /></div><div className="empty-title">No Resume Loaded</div></div>;

  const data = useMemo(() => generateInterviewQuestions(parsedResume), [parsedResume]);

  const qMap = {
    Technical: data.technical,
    Behavioral: data.behavioral,
    'System Design': data.systemDesign,
    HR: data.hr,
    'Project Viva': data.projectViva,
    Personalized: data.personalized,
    Tips: data.confidenceTips,
  };

  const questions = qMap[activeTab] || [];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="interview-container"
    >
      <div className="page-header">
        <motion.h1 variants={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mic size={32} className="text-rose-400" /> Interview Intelligence Bank
        </motion.h1>
        <motion.p variants={item} style={{ fontSize: '1rem' }}>
          Domain-optimized question matrix for <strong className="text-rose-400">{data.domain}</strong> roles · {data.totalQuestions} Curated Scenarios.
        </motion.p>
      </div>

      <motion.div variants={item} style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 32 }} className="hide-scrollbar">
        {TABS.map(t => (
          <motion.button 
            key={t.id} 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(t.id)} 
            style={{ 
              padding: '10px 18px', borderRadius: 12, fontSize: '.85rem', fontWeight: 700, 
              border: '1px solid',
              borderColor: activeTab === t.id ? 'var(--accent)' : 'var(--border)',
              background: activeTab === t.id ? 'var(--accent)' : 'rgba(255,255,255,0.02)', 
              color: activeTab === t.id ? '#fff' : 'var(--text3)', 
              cursor: 'pointer', fontFamily: 'var(--font-b)',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
              boxShadow: activeTab === t.id ? '0 10px 20px var(--accent)44' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            {t.icon} {t.label} {qMap[t.id]?.length > 0 && <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>({qMap[t.id].length})</span>}
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'Tips' ? (
          <motion.div 
            key="tips"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass" 
            style={{ padding: 32 }}
          >
            <div className="section-header" style={{ marginBottom: 24 }}>
              <div className="section-title"><Sparkles size={18} className="text-rose-400" /> Behavioral Mastery & Confidence Tips</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {questions.map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: '.9rem', color: 'var(--text2)', lineHeight: 1.6 }}>{tip}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {questions.length === 0
              ? <div className="empty-state"><div className="empty-icon"><Mic size={48} opacity={0.2} /></div><div className="empty-title">Context matrix empty for this category</div></div>
              : questions.map((q, i) => {
                const isOpen = revealed[`${activeTab}-${i}`];
                return (
                  <motion.div 
                    layout
                    className="glass" 
                    key={i} 
                    style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', position: 'relative', z_index: 2 }}>
                      <div style={{ 
                        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, 
                        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.85rem', fontWeight: 800, color: 'var(--text3)', flexShrink: 0
                      }}>
                        Q{i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.5, marginBottom: 16 }}>{q}</div>
                        
                        <AnimatePresence>
                          {!isOpen ? (
                            <motion.button 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="btn btn-ghost btn-sm" 
                              onClick={() => setRevealed(r => ({ ...r, [`${activeTab}-${i}`]: true }))}
                              style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <Lightbulb size={14} className="text-amber-400" /> Synthesize Answer Strategy
                            </motion.button>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              style={{ 
                                background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', 
                                borderRadius: 14, padding: 20, fontSize: '0.9rem', color: 'var(--text2)', 
                                lineHeight: 1.7, position: 'relative'
                              }}
                            >
                              <div style={{ position: 'absolute', top: 12, right: 12, opacity: 0.1 }}><Sparkles size={24} /></div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                                <TrendingUp size={12} /> Strategic Framework: STAR+ Method
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                Construct your response using the <strong>Situation, Task, Action, and Result</strong> framework. Enhance with <strong>Specific Metrics</strong> and <strong>Lessons Learned</strong> for maximum impact.
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <span className="tag" style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: 'none' }}>Target: 90-120s</span>
                                <span className="tag" style={{ fontSize: '0.65rem', background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', border: 'none' }}>High Confidence</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            }
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={item} className="glass" style={{ padding: 24, marginTop: 32, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
          <Info size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Simulation Protocol</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Try recording yourself answering these questions. Focus on steady eye contact, concise articulation, and strategic pausing.</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
