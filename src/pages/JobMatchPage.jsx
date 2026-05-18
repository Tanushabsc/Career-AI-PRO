import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Search, Filter, ChevronDown, 
  ChevronUp, ExternalLink, Target, Zap, 
  Award, AlertCircle, Sparkles, Globe, MapPin,
  X, CheckCircle2, Info, Brain, Clock, Activity, DownloadCloud
} from 'lucide-react';
import { useApp } from '../App';
import Skeleton from '../components/Skeleton';
import { LinkedInLogo, NaukriLogo } from '../components/Icons';
import { scrapeLiveLinkedInJobs, scrapeLiveNaukriJobs, analyzeRealJobsWithAI, generateSmartSearchKeyword } from '../engines/jobScraperEngine';

const scoreColor = s => s >= 70 ? 'var(--green)' : s >= 45 ? 'var(--amber)' : 'var(--red)';

const PIVOT_CATEGORIES = [
  { label: "🧠 Data Science / AI", value: "Data Science AI machine learning python" },
  { label: "🎓 Teaching / Academia", value: "teaching professor faculty university academia" },
  { label: "☁️ DevOps / Cloud", value: "devops cloud aws docker kubernetes" },
  { label: "📦 Product Management", value: "product manager roadmap stakeholder strategy" },
  { label: "🔒 Cybersecurity", value: "security penetration firewall ethical hacking soc" },
  { label: "🌐 Web Development", value: "javascript react html css frontend web developer" },
  { label: "📱 Mobile Development", value: "android ios flutter react native mobile kotlin" },
  { label: "🎨 UI/UX Design", value: "figma wireframe ui ux user research design prototype" },
  { label: "📊 Data Engineering", value: "etl data pipeline spark sql hadoop airflow" },
  { label: "🏋️ Training / L&D", value: "training instructor workshop bootcamp mentor teaching" },
  { label: "💼 Consulting", value: "consulting advisory strategy digital transformation architecture" },
  { label: "🔬 Research", value: "research publication analysis phd thesis computational" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function JobMatchPage() {
  const { parsedResume, resumeText } = useApp();
  const [pivot, setPivot] = useState('');
  const [activePivot, setActivePivot] = useState('');
  const [pivotLabel, setPivotLabel] = useState('');
  const [location, setLocation] = useState('India');
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [showPivotPanel, setShowPivotPanel] = useState(false);
  const [matches, setMatches] = useState([]);
  const [smartKeyword, setSmartKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');

  useEffect(() => {
    async function fetchJobs() {
      if (!parsedResume) return;
      setLoading(true); setError(''); setWarning('');
      
      try {
        if (!window.puter?.ai?.chat) throw new Error("Puter AI not available");
        
        setLoadingMsg('🧠 AI analyzing your resume to find the best matching roles...');
        const manualTarget = activePivot || '';
        const smartKeyword = await generateSmartSearchKeyword(parsedResume, manualTarget);
        console.log(`[JobMatch] Smart keyword: "${smartKeyword}"`);
        setSmartKeyword(smartKeyword);

        setLoadingMsg(`🔍 Scraping live Naukri jobs: "${smartKeyword}" in ${location}...`);
        const rawJobs = await scrapeLiveNaukriJobs(smartKeyword, location);
        
        if (rawJobs.length > 0 && rawJobs[0].platform === 'Remotive') {
          setWarning('Local node server is down. Showing fallback job data.');
        }

        setLoadingMsg('📊 AI ranking jobs by profile suitability & experience...');
        const analyzed = await analyzeRealJobsWithAI(rawJobs, parsedResume, location, smartKeyword);
        const ranked = [...analyzed].sort((a, b) => (b.hybrid_score || 0) - (a.hybrid_score || 0));
        setMatches(ranked);

      } catch (err) {
        console.error("Jobs Error:", err);
        setError(err.message);
        
        // Ultimate fallback to local embedded database if everything completely fails
        import('../engines/embeddingEngine').then(({ hybridJobMatch }) => {
          import('../jobDatabase').then(({ JOB_DATABASE }) => {
            setMatches(hybridJobMatch(resumeText, parsedResume, JOB_DATABASE, pivot).slice(0, 6));
          });
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, [parsedResume, activePivot, location, resumeText]);

  if (!parsedResume) return <div className="empty-state"><div className="empty-icon"><Briefcase size={64} opacity={0.3} /></div><div className="empty-title">No Resume Loaded</div></div>;

  const isFresher = parsedResume.is_fresher || false;
  const filtered = filter === 'All' ? matches : matches.filter(j => j.type === filter || j.type === "Remote/Hybrid");

  const handlePivotSelect = (p) => { setPivot(p.value); setActivePivot(p.value); setPivotLabel(p.label); setShowPivotPanel(false); };
  const clearPivot = () => { setPivot(''); setActivePivot(''); setPivotLabel(''); };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="job-match-container">
      <div className="page-header">
        <motion.h1 variants={item}>💼 AI Semantic Job Matching</motion.h1>
        <motion.p variants={item} style={{ fontSize: '1rem' }}>
          Neural-generated career opportunities and live market scraping tailored specifically to your exact skills.
          {isFresher && <span className="tag tag-cyan" style={{ marginLeft: 12 }}>🎓 Fresher-optimized</span>}
        </motion.p>
      </div>

      {/* Controls Panel */}
      <motion.div variants={item} className="glass glass-glow" style={{ padding: 24, marginBottom: 24, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Sparkles size={14} className="text-purple-400" /> Define Career Target
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input
                  value={pivot}
                  onChange={e => { setPivot(e.target.value); setPivotLabel(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') { setPivotLabel(e.target.value); setShowPivotPanel(false); setActivePivot(e.target.value); } }}
                  placeholder={isFresher ? "Explore domains like AI, Product, Marketing..." : "Target field: HR Tech, Data Scientist, Product Manager..."}
                  style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px 12px 42px', color: 'var(--text)', fontFamily: 'var(--font-b)', fontSize: '.95rem', outline: 'none', transition: 'border-color .2s' }}
                />
              </div>
              <button onClick={() => setShowPivotPanel(p => !p)} className={`btn ${showPivotPanel ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0 20px', height: 48, borderRadius: 12, fontSize: '0.9rem' }}>
                {showPivotPanel ? <X size={18} /> : <Filter size={18} />}
                <span style={{ marginLeft: 8 }}>{showPivotPanel ? 'Close' : 'Browse'}</span>
              </button>
            </div>
          </div>
          <div style={{ width: 180 }}>
            <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <MapPin size={14} /> Location
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                list="city-options"
                placeholder="City, e.g. Bangalore"
                style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px 12px 32px', color: 'var(--text)', fontFamily: 'var(--font-b)', fontSize: '.85rem', outline: 'none', height: 48, boxSizing: 'border-box' }}
              />
              <datalist id="city-options">
                {['India','Bangalore','Mumbai','Delhi','Hyderabad','Pune','Chennai','Kolkata','Noida','Gurgaon','Ahmedabad','Remote'].map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>
          <div style={{ width: 140 }}>
            <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Globe size={14} /> Workspace
            </label>
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', color: 'var(--text)', fontFamily: 'var(--font-b)', fontSize: '.9rem', outline: 'none', height: 48, cursor: 'pointer' }}>
              {['All','Onsite','Hybrid','Remote'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {showPivotPanel && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>{isFresher ? '🎓 Popular Career Pathways for New Graduates:' : '🔄 Strategic Career Transition Domains:'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                  {PIVOT_CATEGORIES.map(p => (
                    <button key={p.label} onClick={() => handlePivotSelect(p)} style={{ padding: '10px 14px', background: pivot === p.value ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.02)', border: `1px solid ${pivot === p.value ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, color: pivot === p.value ? 'var(--text)' : 'var(--text2)', cursor: 'pointer', fontFamily: 'var(--font-b)', fontSize: '.82rem', textAlign: 'left', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {p.label} {pivot === p.value && <CheckCircle2 size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Active Filters Bar */}
      <motion.div variants={item} style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text3)', fontWeight: 600, marginRight: 8 }}>INTELLIGENCE:</div>
        <span className="tag tag-cyan" style={{ padding: '6px 12px' }}>{filtered.length} Live Scraped Roles</span>
        <span className="tag tag-blue" style={{ padding: '6px 12px' }}>Base: {parsedResume.primary_domain}</span>
        {smartKeyword && (
          <span className="tag" style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--green)', fontSize: '0.78rem' }}>
            🔍 Searched: "{smartKeyword}"
          </span>
        )}
        <span className="tag" style={{ padding: '6px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--amber)', fontSize: '0.78rem' }}>📊 Ranked by Fit</span>
        {pivot && (
          <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="tag tag-amber" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px' }} onClick={clearPivot}>
            <Sparkles size={12} /> Target: {pivotLabel || pivot} <X size={12} />
          </motion.span>
        )}
      </motion.div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: 16, borderRadius: 12, border: '1px solid rgba(239,68,68,0.2)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}><AlertCircle size={20} /> {error}</div>}
      {warning && <div style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--amber)', padding: 16, borderRadius: 12, border: '1px solid rgba(245,158,11,0.2)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}><AlertCircle size={20} /> {warning}</div>}

      {/* Job Matches Grid/List */}
      {loading ? (
        <div className="matches-list">
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--accent)', fontWeight: 700, fontSize: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div className="processing-orb" style={{ width: 64, height: 64 }}></div>
            {loadingMsg}
          </div>
          {[1, 2, 3].map(i => (
            <div key={i} className="glass" style={{ marginBottom: 16, padding: 32 }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div className="spin" style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid rgba(79,70,229,0.2)', borderTopColor: 'var(--accent)' }}></div>
                <div style={{ flex: 1 }}>
                  <Skeleton variant="title" width="40%" />
                  <Skeleton variant="text" width="60%" />
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <Skeleton width="80px" height="24px" />
                    <Skeleton width="80px" height="24px" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={container} className="matches-list">
        {filtered.map((job) => {
          const isExp = expanded === job.id;
          const matchColor = scoreColor(job.hybrid_score);
          
          return (
            <motion.div 
              variants={item}
              className="glass" 
              key={job.id} 
              style={{ 
                marginBottom: 16, 
                padding: 0, 
                overflow: 'hidden',
                borderColor: isExp ? 'var(--accent)' : 'var(--border)',
                background: isExp ? 'rgba(79,70,229,0.03)' : 'var(--surface)'
              }}
            >
              <div style={{ padding: 24, cursor: 'pointer' }} onClick={() => setExpanded(isExp ? null : job.id)}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                    <svg viewBox="0 0 36 36" width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                      <motion.circle cx="18" cy="18" r="16" fill="none" stroke={matchColor} strokeWidth="3" strokeLinecap="round" initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${job.hybrid_score || 85}, 100` }} transition={{ duration: 1, ease: "easeOut" }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                      <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.05rem', fontWeight: 800, color: matchColor }}>{job.hybrid_score || 85}%</span>
                      <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>Match</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{job.title}</h3>
                      {(job.hybrid_score || 0) > 85 && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>High Fit</span>}
                      {job.isLive && <span className="badge badge-purple" style={{ fontSize: '0.65rem', display: 'flex', gap: 4, alignItems: 'center' }}><DownloadCloud size={10} /> LIVE</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text2)', fontSize: '.88rem', marginBottom: 12, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={14} className="text-indigo-400" /> {job.company}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {job.type}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={14} /> {job.category}</span>
                    </div>
                    {job.description_summary && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text3)', fontStyle: 'italic', marginBottom: 12, borderLeft: '2px solid var(--accent)', paddingLeft: 12 }}>
                        "{job.description_summary}"
                      </div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span className="tag" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: '0.75rem' }}>💰 {job.salary}</span>
                      {(job.keywords || []).slice(0, 4).map(k => (
                        <span key={k} className="tag" style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.1)', color: 'var(--text2)', fontSize: '0.75rem' }}>{k}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase' }}>Domain Affinity</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: (job.domain_affinity || 0) >= 60 ? 'var(--green)' : 'var(--amber)' }}>{job.domain_affinity || 80}%</div>
                    </div>
                    {isExp ? <ChevronUp size={20} opacity={0.5} /> : <ChevronDown size={20} opacity={0.5} />}
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              <AnimatePresence>
                {isExp && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
                    <div style={{ padding: 24, background: 'rgba(0,0,0,0.1)' }}>
                      <div className="grid-2" style={{ gap: 32 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Info size={16} className="text-indigo-400" />
                            <span style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text3)', letterSpacing: '0.05em' }}>Matching Intelligence</span>
                          </div>
                          <div style={{ background: 'var(--bg2)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text2)', marginBottom: 20 }}>
                            {job.match_reason}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <Target size={16} className="text-purple-400" />
                            <span style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text3)', letterSpacing: '0.05em' }}>Strategic Advice</span>
                          </div>
                          <div style={{ color: 'var(--text)', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: 4 }}>
                            {job.tip}
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                            <div style={{ flex: 1, padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }}>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={12}/> Transition Time</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{job.transition_time || "Ready Now"}</div>
                            </div>
                            <div style={{ flex: 1, padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 12 }}>
                              <div style={{ fontSize: '0.65rem', color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={12}/> Market Demand</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--green)' }}>{job.market_demand || "High"}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <AlertCircle size={16} className="text-red-400" />
                            <span style={{ fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text3)', letterSpacing: '0.05em' }}>Detected Skill Gaps</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                            {!job.skill_gap || job.skill_gap.length === 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontSize: '0.9rem', fontWeight: 600 }}><CheckCircle2 size={16} /> Strong technical alignment!</div>
                            ) : (
                              job.skill_gap.map(s => <span key={s} className="tag tag-red" style={{ background: 'rgba(220,38,38,0.08)', padding: '6px 12px' }}>{s}</span>)
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                        <a href={job.link || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title || 'Job')}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ExternalLink size={16} /> {job.isLive ? 'Apply for Real Job' : 'Search on Platform'}
                        </a>
                        <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title || 'Job')}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, background: '#0a66c2', color: 'white', borderColor: '#0a66c2' }}>
                          <LinkedInLogo size={18} /> View on LinkedIn
                        </a>
                        <a href={`https://www.naukri.com/${(job.title || 'job').toLowerCase().replace(/\s+/g, '-')}-jobs`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, background: '#275df5', color: 'white', borderColor: '#275df5' }}>
                          <NaukriLogo size={18} /> View on Naukri
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={32} opacity={0.2} />
              </div>
            </div>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>No Precision Matches Found</h3>
            <p style={{ color: 'var(--text3)', fontSize: '1rem', maxWidth: 450, margin: '0 auto' }}>
              We couldn't find exact semantic matches for this specific filter. Try broadening your career pivot target or removing workspace filters.
            </p>
            <button className="btn btn-secondary" style={{ marginTop: 24 }} onClick={() => { setFilter('All'); setPivot(''); setPivotLabel(''); }}>Reset All Filters</button>
          </motion.div>
        )}
      </motion.div>
      )}

      {/* Algorithm Intelligence Section */}
      <motion.div variants={item} style={{ marginTop: 100, paddingTop: 80, borderTop: '1px solid var(--border)', maxWidth: 1000, margin: '100px auto 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="badge badge-purple" style={{ marginBottom: 16, letterSpacing: '0.2em' }}>NEURAL ARCHITECTURE</div>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>The Intelligence Layer</h2>
          <p style={{ color: 'var(--text3)', maxWidth: 650, margin: '20px auto 0', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Our engine leverages high-dimensional vector space modeling to bridge the gap between human experience and corporate requirements.
          </p>
        </div>

        <div className="grid-2" style={{ gap: 40 }}>
          {/* TF-IDF Component */}
          <div className="glass glass-glow" style={{ padding: 40, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, fontSize: '8rem', opacity: 0.02, fontWeight: 900, fontStyle: 'italic' }}>Σ</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={20} className="text-indigo-400" /></div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Strategic Term Weighting</h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text2)', marginBottom: 32, lineHeight: 1.7 }}>
              We isolate rare, high-value technical signals (TF-IDF) to ensure your unique expertise isn't buried by generic professional buzzwords.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '32px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', fontFamily: '"Times New Roman", serif', fontSize: '1.6rem', textAlign: 'center', color: 'var(--text)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: 20, fontSize: '0.65rem', fontFamily: 'var(--font-b)', fontWeight: 800, opacity: 0.4, letterSpacing: '0.1em' }}>FORMULA: TF-IDF</div>
              <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>W(t,d)</span> = <span style={{ margin: '0 10px', opacity: 0.9 }}>tf(t,d)</span> × log(<span style={{ borderTop: '1px solid var(--text)', padding: '0 6px', display: 'inline-block', opacity: 0.9 }}>N / df(t)</span>)
            </div>
          </div>

          {/* Cosine Similarity Component */}
          <div className="glass glass-glow" style={{ padding: 40, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -30, right: -30, fontSize: '8rem', opacity: 0.02, fontWeight: 900, fontStyle: 'italic' }}>θ</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={20} className="text-emerald-400" /></div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Angular Vector Alignment</h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text2)', marginBottom: 32, lineHeight: 1.7 }}>
              By mapping your profile as a vector in 5,000+ dimensions, we calculate the precise mathematical angle between you and the role.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '32px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', fontFamily: '"Times New Roman", serif', fontSize: '1.6rem', textAlign: 'center', color: 'var(--text)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)', position: 'relative', marginBottom: 0 }}>
              <div style={{ position: 'absolute', top: 12, left: 20, fontSize: '0.65rem', fontFamily: 'var(--font-b)', fontWeight: 800, opacity: 0.4, letterSpacing: '0.1em' }}>FORMULA: COSINE</div>
              cos(θ) = <span style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 12px' }}><div style={{ borderBottom: '1px solid var(--text)', padding: '0 12px', color: 'var(--green)' }}>A · B</div><div style={{ padding: '0 12px', opacity: 0.7 }}>||A|| ||B||</div></span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
