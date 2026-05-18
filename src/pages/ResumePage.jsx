import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileEdit, Sparkles, AlertTriangle, 
  CheckCircle2, Rocket, Zap, 
  Copy, Check, ArrowRight,
  ShieldCheck, Info, Terminal
} from 'lucide-react';
import { useApp } from '../App';
import { analyzeResumeBullets, getImprovedBullets, generateSummary } from '../engines/resumeEngine';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function ResumePage() {
  const { parsedResume, resumeText } = useApp();
  const [copied, setCopied] = useState('');

  if (!parsedResume) return <div className="empty-state"><div className="empty-icon"><FileEdit size={64} opacity={0.3} /></div><div className="empty-title">No Resume Loaded</div></div>;

  const issues = useMemo(() => analyzeResumeBullets(resumeText), [resumeText]);
  const templates = useMemo(() => getImprovedBullets(parsedResume), [parsedResume]);
  const summary = useMemo(() => generateSummary(parsedResume), [parsedResume]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="resume-engine-container"
    >
      <div className="page-header">
        <motion.h1 variants={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FileEdit size={32} className="text-amber-400" /> Resume Refinement Engine
        </motion.h1>
        <motion.p variants={item} style={{ fontSize: '1rem' }}>
          Deep-layer diagnostic analysis and structural optimization for professional impact.
        </motion.p>
      </div>

      {/* Professional Summary Module */}
      <motion.div variants={item} className="glass glass-glow" style={{ padding: 32, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div className="section-title"><Sparkles size={18} className="text-amber-400" /> Neural-Generated Professional Summary</div>
          <button 
            className="btn btn-ghost" 
            onClick={() => copy(summary, 'summary')}
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: '0.75rem', fontWeight: 700 }}
          >
            {copied === 'summary' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied === 'summary' ? ' Copied!' : ' Copy'}
          </button>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, fontSize: '1rem', color: 'var(--text2)', lineHeight: 1.8, fontStyle: 'italic', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -10, left: 20, background: 'var(--bg)', padding: '0 10px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase' }}>Optimized Profile Archetype</div>
          "{summary}"
        </div>
      </motion.div>

      {/* Diagnostic Analysis Section */}
      <motion.div variants={item} className="glass" style={{ padding: 32, marginBottom: 32 }}>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <div className="section-title">
            <AlertTriangle size={18} className="text-red-400" /> Linguistic Diagnostic Analysis
            {issues.length === 0 && <span className="badge badge-green" style={{ marginLeft: 16, fontSize: '0.65rem' }}>✓ System Clear</span>}
          </div>
        </div>
        
        {issues.length === 0 ? (
          <div style={{ color: 'var(--green)', fontSize: '.95rem', padding: 24, background: 'rgba(16,185,129,0.03)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 size={20} /> Exceptional! No linguistic bottlenecks or weak descriptors detected.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {issues.map((issue, i) => (
              <div key={i} style={{ padding: 20, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                   <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
                      <span style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--red)', padding: '6px 14px', borderRadius: 10, fontSize: '.85rem', fontWeight: 800, border: '1px solid rgba(239,68,68,0.1)', fontFamily: 'monospace' }}>"{issue.found}"</span>
                      <ArrowRight size={14} className="text-white opacity-20" />
                      <span style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--green)', padding: '6px 14px', borderRadius: 10, fontSize: '.85rem', fontWeight: 800, border: '1px solid rgba(16,185,129,0.1)' }}>{issue.suggestion}</span>
                    </div>
                    <div style={{ fontSize: '.85rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Info size={14} /> {issue.reason}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Structural Power Bullets */}
      <motion.div variants={item} className="glass" style={{ padding: 32, marginBottom: 32 }}>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <div className="section-title"><Rocket size={18} className="text-indigo-400" /> High-Impact Structural Templates</div>
          <div style={{ fontSize: '.8rem', color: 'var(--text3)', marginTop: 4 }}>Neural-optimized bullets designed for maximum quantification and impact.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {templates.map((t, i) => (
            <motion.div 
              key={i} 
              whileHover={{ x: 5, background: 'rgba(255,255,255,0.03)' }}
              style={{ display: 'flex', gap: 20, alignItems: 'center', padding: 20, border: '1px solid var(--border)', borderRadius: 16, transition: 'all 0.2s' }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: '.9rem', color: 'var(--text2)', lineHeight: 1.6 }}>{t}</div>
              <button 
                className="btn btn-ghost" 
                onClick={() => copy(t, `t${i}`)}
                style={{ width: 40, height: 40, borderRadius: 10, padding: 0 }}
              >
                {copied === `t${i}` ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Verb & Metric Analysis */}
      <motion.div variants={item} className="glass" style={{ padding: 32 }}>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <div className="section-title"><Zap size={18} className="text-amber-400" /> Strategic Action Vocabulary</div>
        </div>
        
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Currently Synchronized Verbs</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {parsedResume.action_verbs?.strong?.length > 0
              ? parsedResume.action_verbs.strong.map(v => <span className="tag" key={v} style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.1)', padding: '6px 14px' }}>✓ {v}</span>)
              : <span className="tag" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.1)', padding: '6px 14px' }}>Diagnostic Null: No strong verbs detected</span>}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Recommended Strategic Verbs</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {["Led","Developed","Architected","Optimized","Delivered","Engineered","Launched","Scaled","Transformed","Mentored"].map(v => (
              <motion.span 
                key={v} 
                whileHover={{ y: -2, background: 'rgba(99,102,241,0.1)' }}
                className="tag" 
                style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '6px 14px' }} 
                onClick={() => copy(v, `v${v}`)}
              >
                {copied === `v${v}` ? <Check size={12} /> : v}
              </motion.span>
            ))}
          </div>
        </div>

        {parsedResume.quantification?.count > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ padding: '20px 24px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: 16, display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)', flexShrink: 0 }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>Quantification Integrity: Verified</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>We detected <strong>{parsedResume.quantification.count}</strong> high-value metrics. This significantly improves your semantic discoverability.</div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
