import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Search, User, Package, 
  Users, Star, GitFork, 
  TrendingUp, Sparkles, BookOpen, ExternalLink,
  ChevronRight, Terminal, Globe
} from 'lucide-react';
import { analyzeGitHubProfile } from '../engines/githubEngine';

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

import { useApp } from '../App';

export default function GitHubPage() {
  const { parsedResume } = useApp();
  const [username, setUsername] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!username.trim()) return;
    setLoading(true); setError(''); setData(null);
    try {
      const result = await analyzeGitHubProfile(
        username.trim(), 
        parsedResume?.skills || [], 
        parsedResume?.primary_domain || ''
      );
      setData(result);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const scoreItems = [
    { label: 'Repositories', key: 'repositories', icon: <Package size={14} /> },
    { label: 'Language Diversity', key: 'diversity', icon: <Code2 size={14} /> },
    { label: 'Community Impact', key: 'stars', icon: <Star size={14} /> },
    { label: 'Documentation', key: 'documentation', icon: <BookOpen size={14} /> },
    { label: 'Sustain Velocity', key: 'activity', icon: <TrendingUp size={14} /> },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="github-container"
    >
      <div className="page-header">
        <motion.h1 variants={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Code2 size={32} /> Open Source Intelligence
        </motion.h1>
        <motion.p variants={item} style={{ fontSize: '1rem' }}>
          Deep-layer analysis of developer strength, language proficiency, and technical contribution impact.
        </motion.p>
      </div>

      <motion.div variants={item} className="glass glass-glow" style={{ padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Terminal size={14} /> Target GitHub Handle
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              <input 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && analyze()}
                placeholder="Enter handle (e.g. torvalds)" 
                style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px 12px 42px', color: 'var(--text)', fontFamily: 'var(--font-b)', fontSize: '.95rem', outline: 'none' }} 
              />
            </div>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={analyze} 
            disabled={!username.trim() || loading} 
            style={{ height: 48, padding: '0 32px', borderRadius: 12 }}
          >
            {loading ? <><span className="spinner" /> Sequencing...</> : 'Analyze Developer Potential'}
          </button>
        </div>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: 16, color: 'var(--red)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Terminal size={14} /> ⚠️ Error: {error}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            {/* Profile Executive Summary */}
            <div className="glass glass-glow" style={{ padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap', position: 'relative', z_index: 2 }}>
                <div style={{ position: 'relative' }}>
                  <img src={data.avatar} alt="avatar" style={{ width: 100, height: 100, borderRadius: '24px', border: '4px solid var(--bg2)', boxShadow: '0 0 20px rgba(0,0,0,0.3)' }} />
                  <div style={{ position: 'absolute', bottom: -5, right: -5, width: 32, height: 32, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--bg)' }}>
                    <Code2 size={16} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 2 }}>{data.name}</div>
                  <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1rem', marginBottom: 12 }}>@{data.username}</div>
                  {data.bio && <div style={{ fontSize: '.95rem', color: 'var(--text2)', lineHeight: 1.6, maxWidth: 600 }}>{data.bio}</div>}
                  <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '.85rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}><Package size={14} /> <strong>{data.publicRepos}</strong> Repositories</span>
                    <span style={{ fontSize: '.85rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> <strong>{data.followers}</strong> Followers</span>
                    <span style={{ fontSize: '.85rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}><Star size={14} /> <strong>{data.stats.totalStars}</strong> Stars</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px 32px', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-h)', fontSize: '3.5rem', fontWeight: 800, color: scoreColor(data.scores.overall), lineHeight: 1 }}>{data.scores.overall}</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--text3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>Developer IQ Score</div>
                </div>
              </div>
              {/* Background accent */}
              <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: `radial-gradient(circle, ${scoreColor(data.scores.overall)}11 0%, transparent 70%)`, z_index: 0 }} />
            </div>

            <div className="grid-2" style={{ marginBottom: 24, gap: 24 }}>
              {/* Score Dimensional Analysis */}
              <div className="glass" style={{ padding: 24 }}>
                <div className="section-header" style={{ marginBottom: 20 }}>
                  <div className="section-title"><TrendingUp size={18} className="text-indigo-400" /> Multi-Factor Breakdown</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {scoreItems.map(item => {
                    const s = data.scores[item.key] || 0;
                    const col = scoreColor(s);
                    return (
                      <div key={item.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '.9rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                            <span style={{ color: 'var(--text3)' }}>{item.icon}</span>
                            {item.label}
                          </span>
                          <span style={{ fontWeight: 800, color: col }}>{s}%</span>
                        </div>
                        <div className="progress-track" style={{ height: 6 }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${s}%` }}
                            transition={{ duration: 1 }}
                            className="progress-fill" 
                            style={{ background: col, boxShadow: `0 0 10px ${col}44` }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Language DNA */}
              <div className="glass" style={{ padding: 24 }}>
                <div className="section-header" style={{ marginBottom: 20 }}>
                  <div className="section-title"><Code2 size={18} className="text-emerald-400" /> Technology DNA</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {data.languages.slice(0, 6).map((l, i) => (
                    <div key={l.lang} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '.9rem', fontWeight: 500 }}>{l.lang}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 120, height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${l.pct}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            style={{ width: `${l.pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} 
                          />
                        </div>
                        <span style={{ fontSize: '.8rem', color: 'var(--text3)', fontWeight: 700, width: 40, textAlign: 'right' }}>{l.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ margin: '24px 0 12px', fontSize: '.75rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎯 Expertise Segments</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.detectedDomains.map(d => <span className="tag tag-cyan" key={d} style={{ background: 'rgba(6,182,212,0.08)', padding: '6px 12px' }}>{d}</span>)}
                </div>
              </div>
            </div>

            {/* Profile Optimization Vector */}
            <div className="glass" style={{ padding: 24, marginBottom: 24 }}>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <div className="section-title"><Sparkles size={18} className="text-amber-400" /> Strategic Optimization Recommendations</div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                {data.suggestions.map((s, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      display: 'flex', gap: 12, padding: 16, 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 12, fontSize: '.9rem', 
                      color: 'var(--text2)', lineHeight: 1.6,
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} />
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* High-Impact Repositories */}
            <div className="glass" style={{ padding: 24 }}>
              <div className="section-header" style={{ marginBottom: 20 }}>
                <div className="section-title"><Package size={18} className="text-indigo-400" /> High-Impact Repositories</div>
              </div>
              <div className="grid-2" style={{ gap: 16 }}>
                {data.repos.slice(0, 6).map(r => (
                  <motion.a 
                    key={r.name} 
                    href={r.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    whileHover={{ y: -5, borderColor: 'var(--accent)' }}
                    className="glass repo-card" 
                    style={{ textDecoration: 'none', display: 'block', padding: 20, background: 'rgba(255,255,255,0.01)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>{r.name}</h4>
                      <ExternalLink size={14} opacity={0.3} />
                    </div>
                    {r.description && <p style={{ fontSize: '0.85rem', color: 'var(--text3)', lineHeight: 1.5, marginBottom: 16 }}>{r.description.slice(0, 100)}{r.description.length > 100 ? '...' : ''}</p>}
                    
                    {r.provenSkills?.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent2)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em' }}>Skill Evidence</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {r.provenSkills.slice(0, 3).map(skill => (
                            <span key={skill} style={{ fontSize: '0.65rem', background: 'rgba(6,182,212,0.1)', color: 'var(--accent2)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      {r.language && (
                        <span style={{ fontSize: '.8rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} /> {r.language}
                        </span>
                      )}
                      <span style={{ fontSize: '.8rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} /> {r.stars}</span>
                      <span style={{ fontSize: '.8rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 4 }}><GitFork size={14} /> {r.forks}</span>
                    </div>
                    {r.topics?.length > 0 && (
                      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {r.topics.slice(0, 3).map(t => <span className="tag" key={t} style={{ fontSize: '.65rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>{t}</span>)}
                      </div>
                    )}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
