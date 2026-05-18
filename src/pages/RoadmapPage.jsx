import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Map, MapPin, Target, Zap, 
  CheckCircle2, Circle, ArrowRight, 
  Award, Lightbulb, TrendingUp, Sparkles,
  GraduationCap, BookOpen, ExternalLink, Loader2
} from 'lucide-react';
import { useApp } from '../App';
import Skeleton from '../components/Skeleton';
import { extractResponseText } from '../services/puterAI';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function RoadmapPage() {
  const { parsedResume } = useApp();
  const [roadmap, setRoadmap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [targetRole, setTargetRole] = useState('');
  const [activeTarget, setActiveTarget] = useState('');

  useEffect(() => {
    async function fetchRoadmap() {
      if (!parsedResume) return;
      setIsLoading(true);
      
      try {
        if (!window.puter?.ai?.chat) {
          throw new Error("Puter AI not available");
        }
        
        const targetInstruction = activeTarget 
          ? `User wants to completely transition from their current role to: "${activeTarget}". Build a roadmap specifically for bridging their current skills to this new role.` 
          : `Target Role: Next logical promotion in their current domain.`;

        const prompt = `
          Analyze this professional profile and generate a highly personalized career roadmap in strict JSON format. Do not use markdown blocks, just return raw JSON.
          
          Domain: ${parsedResume.primary_domain}
          Years Exp: ${parsedResume.years_experience}
          Skills: ${(parsedResume.skills || []).slice(0, 15).join(', ')}
          
          ${targetInstruction}
          
          Return exactly this structure:
          {
            "domain": "${activeTarget || 'Exact Specific Sub-domain'}",
            "transitionTime": "Estimated time to achieve this transition (e.g. 6-8 months, 1-2 years). Return 'N/A' if just a normal promotion.",
            "previousLevel": { "title": "Previous/Junior Title", "years": "Past", "skills": ["skill1", "skill2"], "icon": "🌱" },
            "currentLevel": { "title": "Current Status / Bridge Phase", "years": "${parsedResume.years_experience}", "skills": ["skill3", "skill4"], "icon": "🚀" },
            "nextLevel": { "title": "${activeTarget || 'Next Logical Promotion'}", "years": "Future Target", "skills": ["skill5", "skill6"], "icon": "⭐" },
            "pivotOptions": ["Pivot 1", "Pivot 2", "Pivot 3"],
            "projectIdeas": ["Specific Idea 1 bridging current and target", "Specific Idea 2", "Specific Idea 3"],
            "certifications": ["Cert 1", "Cert 2"],
            "courses": [
              { "name": "Exact Course Name", "platform": "Platform", "price": "Free/Paid", "type": "Core", "url": "https://coursera.org" },
              { "name": "Exact Course Name", "platform": "Platform", "price": "Free/Paid", "type": "Advanced", "url": "https://edx.org" }
            ]
          }
        `;

        const response = await window.puter.ai.chat(prompt);
        let text = response;
        if (typeof response === 'object') {
          text = response.message?.content || response.text || response.content || JSON.stringify(response);
        }
        
        // Clean JSON
        const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        setRoadmap(data);
      } catch (err) {
        console.error("AI Roadmap Gen Error:", err);
        // Fallback to static if AI fails
        import('../engines/roadmapEngine').then(({ generateRoadmap }) => {
          setRoadmap(generateRoadmap(parsedResume));
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchRoadmap();
  }, [parsedResume, activeTarget]);

  if (!parsedResume) return <div className="empty-state"><div className="empty-icon"><Map size={64} opacity={0.3} /></div><div className="empty-title">No Resume Loaded</div></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="roadmap-container">
      <div className="page-header">
        <motion.h1 variants={item}>🗺️ AI Career Roadmap</motion.h1>
        <motion.p variants={item} style={{ fontSize: '1rem' }}>
          Neural-generated trajectory tailored exclusively to your resume footprint.
        </motion.p>
      </div>

      {/* Target Transition Input */}
      <motion.div variants={item} className="glass glass-glow" style={{ padding: 24, marginBottom: 24 }}>
        <label style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <Target size={14} className="text-amber-400" /> Career Transition Target (Optional)
        </label>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setActiveTarget(targetRole); }}
            placeholder="e.g. Product Manager, Data Scientist, Full Stack Developer..."
            style={{ flex: 1, minWidth: 250, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', color: 'var(--text)', outline: 'none' }}
          />
          <button onClick={() => setActiveTarget(targetRole)} className="btn btn-primary" style={{ padding: '0 24px', borderRadius: 12, height: 48 }}>
            <Sparkles size={18} style={{ marginRight: 8 }} />
            Generate Transition Plan
          </button>
        </div>
      </motion.div>

      {isLoading ? (
        <div style={{ padding: '64px 20px', textAlign: 'center', color: 'var(--text3)' }}>
          <Loader2 size={32} className="spin text-indigo-400" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)' }}>AI Architecting Your Roadmap...</div>
          <div style={{ fontSize: '0.9rem', marginTop: 8 }}>Synthesizing domain intelligence and mapping skill vectors</div>
        </div>
      ) : !roadmap ? (
        <div style={{ color: 'var(--red)' }}>Failed to generate roadmap.</div>
      ) : (
        <>
          <div className="grid-2" style={{ marginBottom: 32, gap: 24 }}>
            <motion.div variants={item} className="glass glass-glow" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <MapPin size={18} className="text-indigo-400" />
                <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Benchmark</div>
              </div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{roadmap.currentLevel?.title}</div>
              <div style={{ color: 'var(--text2)', fontSize: '0.95rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={14} /> {roadmap.currentLevel?.years} Years Exp
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {roadmap.currentLevel?.skills?.map(s => <span className="tag tag-blue" key={s} style={{ background: 'rgba(79,70,229,0.08)', padding: '6px 12px' }}>{s}</span>)}
              </div>
            </motion.div>
            
            <motion.div variants={item} className="glass" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Target size={18} className="text-amber-400" />
                  <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next Milestone / Target Role</div>
                </div>
                {roadmap.transitionTime && roadmap.transitionTime !== 'N/A' && (
                  <span className="badge badge-amber" style={{ fontSize: '0.75rem', fontWeight: 700 }}>⏱️ Est. Transition: {roadmap.transitionTime}</span>
                )}
              </div>
              <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>{roadmap.nextLevel?.title}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {roadmap.nextLevel?.skills?.map(s => <span className="tag tag-amber" key={s} style={{ background: 'rgba(245,158,11,0.08)', padding: '6px 12px' }}>{s}</span>)}
              </div>
              <div style={{ fontSize: '.85rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                Domain Alignment: <strong style={{ color: 'var(--text2)', fontWeight: 600 }}>{roadmap.domain}</strong>
              </div>
            </motion.div>
          </div>

          {/* Timeline Section */}
          <motion.div variants={item} className="glass" style={{ padding: 32, marginBottom: 32 }}>
            <div className="section-header" style={{ marginBottom: 32 }}>
              <div className="section-title"><Sparkles size={20} className="text-purple-400" /> Career Evolution Timeline</div>
            </div>
            
            <div className="timeline-container" style={{ position: 'relative', paddingLeft: 20 }}>
              <div style={{ position: 'absolute', left: 24, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, var(--accent) 0%, rgba(255,255,255,0.05) 100%)', zIndex: 0 }} />
              
              <div className="timeline-items" style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {[
                  { ...roadmap.previousLevel, status: 'completed' },
                  { ...roadmap.currentLevel, status: 'current' },
                  { ...roadmap.nextLevel, status: 'upcoming' }
                ].filter(Boolean).map((level, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} style={{ position: 'relative', paddingLeft: 40, zIndex: 1 }}>
                    {/* Dot */}
                    <div style={{ 
                      position: 'absolute', left: -5, top: 4, width: 14, height: 14, 
                      borderRadius: '50%', background: level.status === 'completed' ? 'var(--green)' : level.status === 'current' ? 'var(--accent)' : 'var(--bg2)',
                      border: `3px solid ${level.status === 'upcoming' ? 'var(--border)' : 'var(--bg)'}`,
                      boxShadow: level.status === 'current' ? '0 0 15px var(--accent)aa' : 'none'
                    }}>
                      {level.status === 'completed' && <CheckCircle2 size={10} style={{ position: 'absolute', top: -1, left: -1, color: 'white' }} />}
                    </div>

                    <div className={`glass ${level.status === 'current' ? 'glass-glow' : ''}`} style={{ padding: 20, background: level.status === 'completed' ? 'rgba(16,185,129,0.02)' : 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                            <span style={{ fontSize: '1.2rem' }}>{level.icon || "✨"}</span>
                            {level.title || "Foundation Stage"}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text3)', fontWeight: 500 }}>Target: {level.years}</div>
                        </div>
                        {level.status === 'current' ? (
                          <span className="badge badge-purple" style={{ padding: '4px 12px', fontSize: '0.65rem' }}>Current Professional Status</span>
                        ) : level.status === 'completed' ? (
                          <span className="badge badge-green" style={{ padding: '4px 12px', fontSize: '0.65rem' }}>Verified Achievement</span>
                        ) : (
                          <span className="badge" style={{ background: 'var(--bg2)', color: 'var(--text3)', padding: '4px 12px', fontSize: '0.65rem' }}>Future Objective</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {level.skills?.map(s => (
                          <span key={s} className="tag" style={{ 
                            fontSize: '0.75rem', padding: '4px 10px', 
                            background: level.status === 'completed' ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)',
                            borderColor: level.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'var(--border)'
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid-2" style={{ marginBottom: 32, gap: 24 }}>
            {/* Career Pivots */}
            <motion.div variants={item} className="glass" style={{ padding: 24 }}>
              <div className="section-header" style={{ marginBottom: 20 }}>
                <div className="section-title"><Zap size={18} className="text-indigo-400" /> Strategic Pivot Vectors</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {roadmap.pivotOptions?.map(p => (
                  <motion.div 
                    key={p} whileHover={{ x: 5 }}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', 
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', 
                      borderRadius: 12, fontSize: '0.92rem', color: 'var(--text2)', fontWeight: 500
                    }}
                  >
                    <ArrowRight size={16} className="text-indigo-400" />
                    {p}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Project Ideas */}
            <motion.div variants={item} className="glass" style={{ padding: 24 }}>
              <div className="section-header" style={{ marginBottom: 20 }}>
                <div className="section-title"><Lightbulb size={18} className="text-amber-400" /> Capstone Project Proposals</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {roadmap.projectIdeas?.map((p, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '14px 16px', background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border)', borderRadius: 12, 
                      fontSize: '0.88rem', color: 'var(--text2)', lineHeight: 1.6,
                      position: 'relative'
                    }}
                  >
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--amber)', borderRadius: '3px 0 0 3px' }} />
                    {p}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Personalized Learning Pathway with Clickable Links */}
          <motion.div variants={item} className="glass" style={{ padding: 32, marginBottom: 32, background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, transparent 100%)' }}>
            <div className="section-header" style={{ marginBottom: 32 }}>
              <div className="section-title"><GraduationCap size={20} className="text-indigo-400" /> AI Recommended Courses</div>
            </div>
            <div className="grid-2" style={{ gap: 24 }}>
              {roadmap.courses?.map((c, i) => (
                <a 
                  key={i}
                  href={c.url || `https://www.coursera.org/search?query=${encodeURIComponent(c.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div 
                    whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.04)', borderColor: 'var(--accent)' }}
                    style={{ 
                      padding: 24, background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border)', borderRadius: 20,
                      display: 'flex', gap: 20, alignItems: 'center', height: '100%',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                      <BookOpen size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.platform}</span>
                        <span className={`badge ${c.price?.toLowerCase() === 'free' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.6rem' }}>{c.price}</span>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {c.name} <ExternalLink size={14} style={{ opacity: 0.5 }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--accent)' }}>
                        <Zap size={12} /> {c.type} Focus
                      </div>
                    </div>
                  </motion.div>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div variants={item} className="glass" style={{ padding: 32 }}>
            <div className="section-header" style={{ marginBottom: 24 }}>
              <div className="section-title"><Award size={20} className="text-emerald-400" /> Industry Certifications & Credentials</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {roadmap.certifications?.map(c => (
                <motion.div 
                  key={c} whileHover={{ y: -5 }}
                  style={{ 
                    padding: '16px 20px', background: 'rgba(16,185,129,0.03)', 
                    border: '1px solid rgba(16,185,129,0.1)', borderRadius: 12, 
                    display: 'flex', alignItems: 'center', gap: 12,
                    fontSize: '0.95rem', fontWeight: 600, color: 'var(--text2)'
                  }}
                >
                  <Award size={20} className="text-emerald-400" />
                  {c}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
