import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, CheckCircle2, Sparkles, 
  TrendingUp, Info, Award, Globe, AlertTriangle
} from 'lucide-react';
import { useApp } from '../App';
import { LinkedInLogo } from '../components/Icons';
import { analyzeProfessionalProfile } from '../engines/scraperEngine';

export default function LinkedInPage() {
  const { parsedResume } = useApp();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');

  const scanSteps = [
    "Establishing Secure Web Crawler Link...",
    "Bypassing CORS & Extracting DOM...",
    "Parsing Semantic Profile Data...",
    "Neural Engine Analyzing Competitiveness...",
    "Generating Strategic Vectors..."
  ];

  const analyze = async () => {
    if (!url.trim()) return;
    setLoading(true); setData(null); setError(''); setStep(0);

    try {
      // Simulate steps for UI feedback while the real engine works in the background
      const stepInterval = setInterval(() => {
        setStep(s => (s < 4 ? s + 1 : s));
      }, 1500);

      const result = await analyzeProfessionalProfile(url.trim(), parsedResume);
      
      clearInterval(stepInterval);
      setStep(4);
      setData(result);
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to analyze the profile URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      initial="hidden"
      animate="show"
      style={{ maxWidth: 1000, margin: '0 auto' }}
    >
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
           <LinkedInLogo size={40} className="text-blue-500" />
           <h1 style={{ margin: 0 }}>Digital Presence Scraper</h1>
        </div>
        <p style={{ fontSize: '1.1rem', color: 'var(--text2)' }}>
          Real-time web scraping and neural analysis for your LinkedIn, GitHub, or Portfolio URLs.
        </p>
      </div>

      <div className="glass glass-glow" style={{ padding: 40, marginBottom: 40 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={14} /> Enter Profile URL to Scrape
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
           <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
              <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input 
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && analyze()}
                placeholder="https://linkedin.com/in/... or https://your-portfolio.com"
                style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 20px 16px 52px', color: '#fff', fontSize: '1rem', outline: 'none' }}
              />
           </div>
           <button 
             className="btn btn-primary" 
             style={{ padding: '0 32px', borderRadius: 16, height: 56 }}
             onClick={analyze}
             disabled={loading}
           >
             {loading ? <span className="spinner" /> : "Scrape & Analyze"}
           </button>
        </div>
        {error && <div style={{ color: 'var(--red)', marginTop: 16, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} /> {error}</div>}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass"
            style={{ padding: 60, textAlign: 'center', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
             <div className="processing-orb" style={{ width: 100, height: 100, marginBottom: 40 }} />
             <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>{scanSteps[step]}</div>
             <div style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>The engine is attempting to scrape and parse the requested URL...</div>
             <div style={{ width: '100%', maxWidth: 400, marginTop: 32 }}>
                <div className="progress-track" style={{ height: 4 }}>
                   <motion.div className="progress-fill" animate={{ width: `${(step + 1) * 20}%` }} style={{ background: 'var(--accent)', height: '100%' }} />
                </div>
             </div>
          </motion.div>
        ) : data ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {data.isSimulated && (
              <div style={{ padding: 16, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 12, color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle size={20} />
                <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                  <strong>Aggressive Anti-Scraping Detected.</strong> The target URL (likely LinkedIn) blocked our direct scraping bots. The AI has fallen back to generating a highly probable gap-analysis projection based on your uploaded resume data and standard industry benchmarks.
                </div>
              </div>
            )}

            <div className="grid-2" style={{ gap: 24 }}>
              <div className="glass glass-glow" style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', width: 160, height: 160 }}>
                    <svg viewBox="0 0 36 36" width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                      <motion.circle 
                        cx="18" cy="18" r="16" fill="none" 
                        stroke="var(--accent)" strokeWidth="2" 
                        strokeDasharray="100, 100"
                        initial={{ strokeDashoffset: 100 }}
                        animate={{ strokeDashoffset: 100 - (data.score || 80) }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{data.score || 80}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Neural Rank</div>
                    </div>
                </div>
                <div style={{ marginTop: 40, width: '100%' }}>
                    {(data.optimization || []).map(opt => (
                      <div key={opt.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{opt.label}</span>
                        <span style={{ color: opt.color || 'var(--text)', fontWeight: 800 }}>{opt.val}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="glass" style={{ padding: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <Sparkles size={20} className="text-purple-400" />
                      <h3 style={{ margin: 0 }}>Strategic Scraped Insights</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {(data.insights || []).map((insight, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{ marginTop: 4 }}><CheckCircle2 size={16} className="text-green-500" /></div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text2)', lineHeight: 1.6 }}>{insight}</div>
                        </div>
                      ))}
                    </div>
                </div>

                <div className="glass" style={{ padding: 32, background: 'rgba(99,102,241,0.03)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <TrendingUp size={20} className="text-indigo-400" />
                      <h3 style={{ margin: 0 }}>Market Positioning</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Searchability</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>{data.searchability || 70}%</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Engagement</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent2)' }}>{data.engagement || 65}%</div>
                      </div>
                    </div>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: 32 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <Award size={20} className="text-blue-400" />
                  <h3 style={{ margin: 0 }}>AI-Generated High-Conversion Headlines</h3>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {(data.headlineIdeas || []).map((h, i) => (
                    <div 
                      key={i} 
                      className="glass" 
                      style={{ padding: 20, background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}
                      onClick={() => { navigator.clipboard.writeText(h); }}
                    >
                       <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text2)' }}>{h}</div>
                       <div style={{ marginTop: 12, fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>Click to Copy</div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass"
            style={{ padding: 40, textAlign: 'center', opacity: 0.6 }}
          >
             <div style={{ marginBottom: 16 }}><Info size={40} opacity={0.2} style={{ margin: '0 auto' }} /></div>
             <div>Awaiting profile synchronization to begin web scraping process.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
