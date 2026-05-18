import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, AlertCircle, CheckCircle2, 
  BarChart3, Hash, FileText, Layout, 
  Search, ShieldCheck, Sparkles, TrendingUp
} from 'lucide-react';
import { useApp } from '../App';
import { calculateATSScore } from '../engines/atsEngine';

const scoreColor = s => s >= 70 ? 'var(--green)' : s >= 45 ? 'var(--amber)' : 'var(--red)';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ATSPage() {
  const { parsedResume, resumeText } = useApp();
  if (!parsedResume) return <div className="empty-state"><div className="empty-icon"><Target size={64} opacity={0.3} /></div><div className="empty-title">No Resume Loaded</div></div>;

  const ats = useMemo(() => calculateATSScore(resumeText, parsedResume), [resumeText, parsedResume]);
  const col = scoreColor(ats.total);

  const breakdownItems = [
    { label: 'Keyword Density', key: 'keywords', icon: <Hash size={16} />, weight: '30%', desc: 'Matching against industry standard skill clusters' },
    { label: 'Section Integrity', key: 'sections', icon: <Layout size={16} />, weight: '20%', desc: 'Ensuring core structural components are present' },
    { label: 'Structural Formatting', key: 'formatting', icon: <FileText size={16} />, weight: '15%', desc: 'Evaluation of document parsing efficiency' },
    { label: 'Skill Depth Analysis', key: 'skills', icon: <TrendingUp size={16} />, weight: '15%', desc: 'Quantifying experience vs skill mentions' },
    { label: 'Chronology Match', key: 'experience', icon: <ShieldCheck size={16} />, weight: '10%', desc: 'Validation of professional timeline' },
    { label: 'Linguistic Impact', key: 'readability', icon: <Sparkles size={16} />, weight: '10%', desc: 'Measuring action verbs and quantitative impact' },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="ats-container"
    >
      <div className="page-header">
        <motion.h1 variants={item}>🎯 ATS Intelligence Analysis</motion.h1>
        <motion.p variants={item} style={{ fontSize: '1rem' }}>
          Deep-layer simulation of modern Applicant Tracking Systems to optimize your resume visibility.
        </motion.p>
      </div>

      <div className="grid-2" style={{ marginBottom: 32, gap: 24 }}>
        {/* Score Gauge */}
        <motion.div variants={item} className="glass glass-glow" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', width: 220, height: 220, z_index: 2 }}>
            <svg viewBox="0 0 200 200" width="220" height="220" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <motion.circle 
                cx="100" cy="100" r="85" fill="none" 
                stroke={col} strokeWidth="12"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 534" }}
                animate={{ strokeDasharray: `${(ats.total / 100) * 534} 534` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ filter: `drop-shadow(0 0 8px ${col}44)` }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                style={{ fontFamily: 'var(--font-h)', fontSize: '4rem', fontWeight: 800, color: col, lineHeight: 1 }}
              >
                {ats.total}
              </motion.div>
              <div style={{ fontSize: '.75rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Score Potential</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 800, color: col }}>Grade {ats.grade.letter}</div>
            <div style={{ color: 'var(--text2)', fontSize: '1rem', fontWeight: 500 }}>{ats.grade.label}</div>
          </div>
          <div style={{ marginTop: 20 }}>
            <span className="tag tag-cyan" style={{ padding: '6px 16px' }}>Domain: {ats.breakdown.keywords.domain}</span>
          </div>
          {/* Decorative background element */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: `radial-gradient(circle, ${col}11 0%, transparent 70%)`, z_index: 0 }} />
        </motion.div>

        {/* Strategic Suggestions */}
        <motion.div variants={item} className="glass" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 20 }}>
            <div className="section-title"><Sparkles size={18} className="text-amber-400" /> Improvement Vector</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ats.suggestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--green)' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <div style={{ fontWeight: 600 }}>Maximum Optimization Achieved</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Your resume meets all critical ATS criteria.</div>
              </div>
            ) : (
              ats.suggestions.map((s, i) => (
                <div 
                  className="suggestion-card" 
                  key={i} 
                  style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    borderRadius: 12, 
                    padding: 16,
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div className={`suggestion-priority ${s.priority}`} style={{ marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.7rem', color: 'var(--accent2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 800 }}>{s.category}</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text)', marginBottom: 6 }}>{s.text}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}><strong>Impact:</strong> {s.impact}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Multi-Factor Breakdown */}
      <motion.div variants={item} className="glass" style={{ padding: 32, marginBottom: 32 }}>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <div className="section-title"><BarChart3 size={20} className="text-indigo-400" /> Core Analysis Breakdown</div>
        </div>
        <div className="grid-2" style={{ gap: 40 }}>
          {breakdownItems.map(item => {
            const d = ats.breakdown[item.key];
            const s = d?.score || 0;
            const c = scoreColor(s);
            return (
              <div key={item.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontWeight: 700, marginBottom: 2 }}>
                      <span style={{ color: 'var(--text3)' }}>{item.icon}</span>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{item.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: c }}>{s}%</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text3)', fontWeight: 700 }}>WEIGHT: {item.weight}</div>
                  </div>
                </div>
                <div className="progress-track" style={{ height: 6, background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${s}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="progress-fill" 
                    style={{ background: c, boxShadow: `0 0 10px ${c}44` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid-2" style={{ marginBottom: 32, gap: 24 }}>
        {/* Keywords matched */}
        <motion.div variants={item} className="glass" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title"><CheckCircle2 size={18} className="text-green-400" /> Industry Keywords Found ({ats.breakdown.keywords.found})</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ats.breakdown.keywords.matched.map(k => (
              <span className="tag tag-green" key={k} style={{ background: 'rgba(16,185,129,0.08)', padding: '6px 12px' }}>{k}</span>
            ))}
          </div>
        </motion.div>

        {/* Missing keywords */}
        <motion.div variants={item} className="glass" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title"><AlertCircle size={18} className="text-red-400" /> Missing High-Impact Terms</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ats.breakdown.keywords.missing.length === 0 ? (
              <div style={{ fontSize: '0.9rem', color: 'var(--text3)', fontStyle: 'italic' }}>None detected. Your keyword coverage is excellent.</div>
            ) : (
              ats.breakdown.keywords.missing.map(k => (
                <span className="tag tag-red" key={k} style={{ background: 'rgba(220,38,38,0.08)', padding: '6px 12px' }}>{k}</span>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Sections Integrity */}
        <motion.div variants={item} className="glass" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title"><Layout size={18} className="text-indigo-400" /> Critical Sections Matrix</div>
          </div>
          <div className="grid-2" style={{ gap: 16 }}>
            <div>
              <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginBottom: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified Present</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ats.breakdown.sections.found.map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--green)' }}>
                    <CheckCircle2 size={14} /> {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '.7rem', color: 'var(--text3)', marginBottom: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action Required</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ats.breakdown.sections.missing.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', fontStyle: 'italic' }}>All core sections found.</div>
                ) : (
                  ats.breakdown.sections.missing.map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--red)' }}>
                      <AlertCircle size={14} /> {s}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Formatting & Parsing */}
        <motion.div variants={item} className="glass" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title"><Search size={18} className="text-blue-400" /> Technical Formatting Audit</div>
          </div>
          <div className="grid-3" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: '16px 8px', marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent2)' }}>{ats.breakdown.formatting.bulletCount}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase' }}>Bullets</div>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent2)' }}>{ats.breakdown.formatting.lineCount}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase' }}>Lines</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent2)' }}>{ats.breakdown.readability.wordCount}</div>
              <div style={{ fontSize: '.65rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase' }}>Words</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ats.breakdown.formatting.issues?.map(issue => (
              <div key={issue} style={{ padding: '8px 12px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, fontSize: '.8rem', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={14} /> {issue}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
