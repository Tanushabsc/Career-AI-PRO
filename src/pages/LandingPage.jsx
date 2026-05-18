import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Brain, Puzzle, Map, MessageSquare, 
  FileEdit, Mic, Code2, Sparkles, LayoutDashboard,
  Upload, FileText, CheckCircle2, X, ChevronRight,
  ShieldCheck, Zap, Globe, Cpu
} from 'lucide-react';
import { useApp } from '../App';
import { parseResume } from '../engines/nlpEngine';

function fileToBase64(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
}
function fileToText(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsText(file); });
}
async function extractPDFText(base64) {
  const data = atob(base64);
  const bytes = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) bytes[i] = data.charCodeAt(i);
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + '\n';
  }
  return text.trim();
}

const FEATURES = [
  { icon: <Target className="text-indigo-400" />, title: "ATS Intelligence", desc: "Multi-factor scoring against 120+ domain-specific ATS vectors." },
  { icon: <Brain className="text-cyan-400" />, title: "Neural Matching", desc: "Advanced semantic mapping between your DNA and global opportunities." },
  { icon: <Zap className="text-amber-400" />, title: "Career Velocity", desc: "Instant detection of high-impact growth trajectories and skill gaps." },
];

export default function LandingPage() {
  const { setResumeText, setParsedResume, setFile, setPage, login } = useApp();
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('');
  const [pct, setPct] = useState(0);
  const [error, setError] = useState('');
  const [localFile, setLocalFile] = useState(null);
  const [showIdentity, setShowIdentity] = useState(false);
  const [identityData, setIdentityData] = useState(null);
  const inputRef = useRef();

  const handleFile = useCallback(async (f) => {
    if (!f) return;
    setLocalFile(f); setError('');
  }, []);

  const analyse = async () => {
    if (!localFile) return;
    setLoading(true); setError(''); setPct(0);
    try {
      setStep('Establishing Secure Neural Link...'); setPct(15);
      await new Promise(r => setTimeout(r, 800));

      setStep('Decrypting Professional DNA...'); setPct(35);
      let text;
      if (localFile.type === 'application/pdf') {
        text = await extractPDFText(await fileToBase64(localFile));
      } else {
        text = await fileToText(localFile);
      }
      setResumeText(text); 
      
      setStep('Mapping Technical Semantic Space...'); setPct(65);
      await new Promise(r => setTimeout(r, 1000));
      
      setStep('Simulating Recruiter Bias Vectors...'); setPct(85);
      const parsed = parseResume(text);
      setIdentityData(parsed);
      await new Promise(r => setTimeout(r, 800));

      setPct(100);
      setStep('Finalizing Career Trajectory...');
      setTimeout(() => { setShowIdentity(true); setLoading(false); }, 1000);
    } catch (e) { setError(e.message); setLoading(false); }
  };

  const activateProfile = async () => {
    try {
      // Trigger Puter.js Auth
      await login();
      
      setParsedResume(identityData);
      setFile(localFile);
      setPage('dashboard');
    } catch (e) {
      setError("Cloud synchronization interrupted. Please try again.");
    }
  };

  return (
    <div className="landing-page" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1, overflow: 'hidden', opacity: 0.4 }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [-20, 1000], opacity: [0, 0.5, 0] }}
            transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
            style={{ position: 'absolute', left: `${Math.random() * 100}%`, width: 2, height: 2, background: 'var(--accent)', borderRadius: '50%' }}
          />
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 100px' }}>
        <AnimatePresence mode="wait">
          {!loading && !showIdentity ? (
            <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="hero" style={{ padding: '60px 0 80px', textAlign: 'center' }}>
                <div className="hero-tag" style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)', color: '#a5b4fc', display: 'inline-flex', marginBottom: 24, padding: '6px 16px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                  <Sparkles size={14} style={{ marginRight: 8 }} />
                  NEXT-GEN CAREER INTELLIGENCE v2.0
                </div>
                <h1 style={{ letterSpacing: '-0.05em', fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 0.9, fontWeight: 900 }}>
                  Your Career.<br />
                  <span style={{ background: 'linear-gradient(to right, #6366f1, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Sovereign & Intelligent.
                  </span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text2)', maxWidth: 800, margin: '32px auto 60px', lineHeight: 1.6 }}>
                  The AI Operating System for your professional growth. Private-by-design, 
                  driven by local NLP, and engineered to bridge the gap between where you are 
                  and where you belong.
                </p>

                <div className="glass glass-glow" style={{ padding: 40, maxWidth: 800, margin: '0 auto', textAlign: 'left' }}>
                  <div
                    className={`upload-zone${drag ? ' drag-over' : ''}${localFile ? ' has-file' : ''}`}
                    onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onClick={() => !localFile && inputRef.current?.click()}
                  >
                    <input ref={inputRef} type="file" accept=".pdf,.txt" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
                    {localFile ? (
                      <div className="upload-loaded" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                        <div className="upload-icon-wrap" style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={32} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="upload-filename" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{localFile.name}</div>
                          <div style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Professional DNA detected and ready for synthesis.</div>
                        </div>
                        <button className="upload-clear" onClick={e => { e.stopPropagation(); setLocalFile(null); }} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ padding: '40px 0', textAlign: 'center' }}>
                        <div className="upload-icon-wrap" style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                          <Upload size={32} color="#fff" />
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>Drop your resume here</div>
                        <div style={{ color: 'var(--text3)', marginTop: 8 }}>Securely sync your identity (PDF/TXT)</div>
                      </div>
                    )}
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%', padding: '24px', fontSize: '1.1rem', marginTop: 32, justifyContent: 'center', gap: 12 }} disabled={!localFile} onClick={analyse}>
                    Initialize Synthesis <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div className="grid-3" style={{ gap: 32, marginTop: 100 }}>
                {FEATURES.map((f, i) => (
                  <div key={i} className="glass" style={{ padding: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                      {f.icon}
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 12 }}>{f.title}</h3>
                    <p style={{ color: 'var(--text3)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="processing-orb" style={{ width: 120, height: 120, marginBottom: 40 }} />
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: 24, textAlign: 'center' }}>{step}</div>
              <div style={{ width: '100%', maxWidth: 500 }}>
                <div className="progress-track" style={{ height: 4, background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.3 }} style={{ height: '100%', background: 'var(--accent)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                   <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text3)' }}>{pct}% COMPLETE</span>
                   <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)' }}>AI CORE ACTIVE</span>
                </div>
              </div>
            </motion.div>
          ) : showIdentity && (
            <motion.div key="identity" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <div className="badge badge-green" style={{ marginBottom: 24 }}>IDENTITY SYNTHESIS COMPLETE</div>
               <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 48, letterSpacing: '-0.04em' }}>We've built your AI Identity.</h2>
               
               <div className="glass" style={{ padding: 48, width: '100%', maxWidth: 600, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32 }}>
                     <div style={{ width: 80, height: 80, borderRadius: 24, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900 }}>
                        {identityData.name.charAt(0)}
                     </div>
                     <div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{identityData.name}</div>
                        <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{identityData.profile_type}</div>
                     </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
                     <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Primary Domain</div>
                        <div style={{ fontWeight: 700 }}>{identityData.primary_domain}</div>
                     </div>
                     <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 8 }}>Experience</div>
                        <div style={{ fontWeight: 700 }}>{identityData.years_experience} Years</div>
                     </div>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 40, padding: '20px', justifyContent: 'center', gap: 12 }} onClick={activateProfile}>
                    Activate Career Terminal <ChevronRight size={20} />
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
