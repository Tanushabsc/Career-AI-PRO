import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Puzzle, Award, Map, 
  ChevronRight, Brain, Zap, Briefcase, 
  MessageSquare, FileEdit, Mic, Code2, Sparkles
} from 'lucide-react';
import { useApp } from '../App';
import Skeleton from '../components/Skeleton';
import { calculateATSScore } from '../engines/atsEngine';
import { analyzeSkillGap, getSkillRadarData } from '../engines/skillEngine';
import { generateRoadmap } from '../engines/roadmapEngine';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#db2777', '#7c3aed'];
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

export default function DashboardPage() {
  const { parsedResume, resumeText, setPage } = useApp();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (parsedResume) {
      const timer = setTimeout(() => setLoading(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [parsedResume]);

  if (!parsedResume) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Briefcase size={64} opacity={0.3} /></div>
        <div className="empty-title">No Intelligence Detected</div>
        <div className="empty-sub">Synchronize your professional DNA by uploading a resume to begin your career evolution.</div>
      </div>
    );
  }

  const ats = useMemo(() => calculateATSScore(resumeText, parsedResume), [resumeText, parsedResume]);
  const skills = useMemo(() => analyzeSkillGap(parsedResume), [parsedResume]);
  const radar = useMemo(() => getSkillRadarData(parsedResume), [parsedResume]);
  
  const domainData = skills.domainStrengths.slice(0, 6).map((d, i) => ({ 
    name: d.domain.split('/')[0].trim().slice(0, 12), 
    value: d.percentage, 
    fill: COLORS[i % COLORS.length] 
  }));

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ marginBottom: 40 }}>
          <Skeleton variant="title" width="400px" height="48px" />
          <Skeleton variant="text" width="250px" />
        </div>
        <div className="grid-3" style={{ marginBottom: 32 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rect" height="180px" />)}
        </div>
        <div className="grid-2" style={{ marginBottom: 32 }}>
          <Skeleton variant="rect" height="400px" />
          <Skeleton variant="rect" height="400px" />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="dashboard-container">
      {/* Cinematic Header */}
      <div className="page-header" style={{ marginBottom: 48 }}>
        <motion.div variants={item} className="badge badge-purple" style={{ marginBottom: 16 }}>CAREER OPERATING SYSTEM v2.0</motion.div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <motion.h1 variants={item} style={{ fontSize: '2.5rem', letterSpacing: '-0.04em', fontWeight: 800 }}>
              System Ready, <span style={{ color: 'var(--accent)' }}>{parsedResume.name.split(' ')[0]}</span>.
            </motion.h1>
            <motion.p variants={item} style={{ fontSize: '1.1rem', color: 'var(--text2)', marginTop: 8 }}>
              Analyzing professional trajectory in <strong style={{ color: 'var(--text)' }}>{parsedResume.primary_domain}</strong>.
            </motion.p>
          </div>
          <motion.div variants={item} style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 4 }}>Neural Status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontWeight: 700, fontSize: '0.9rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)' }} />
              Synchronized
            </div>
          </motion.div>
        </div>
      </div>

      {/* Primary Intelligence Grid */}
      <div className="grid-3" style={{ marginBottom: 32, gap: 24 }}>
        <motion.div variants={item} className="glass glass-glow" style={{ padding: 32, position: 'relative' }} onClick={() => setPage('ats')}>
          <div style={{ position: 'absolute', top: 24, right: 24, color: 'var(--accent)', opacity: 0.3 }}><Target size={24} /></div>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: scoreColor(ats.total), lineHeight: 1 }}>{ats.total}</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 12 }}>ATS Intelligence Score</div>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
               <motion.div initial={{ width: 0 }} animate={{ width: `${ats.total}%` }} style={{ height: '100%', background: scoreColor(ats.total), borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{ats.grade.letter}</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass glass-glow" style={{ padding: 32, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 24, right: 24, color: 'var(--accent2)', opacity: 0.3 }}><Zap size={24} /></div>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--accent2)', lineHeight: 1 }}>{ats.potential}%</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 12 }}>Career Growth Potential</div>
          <div style={{ marginTop: 24, color: 'var(--text2)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            Based on skill density and {parsedResume.years_experience} years of industry immersion.
          </div>
        </motion.div>

        <motion.div variants={item} className="glass glass-glow" style={{ padding: 32, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 24, right: 24, color: 'var(--green)', opacity: 0.3 }}><Award size={24} /></div>
          <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--green)', lineHeight: 1 }}>{ats.readiness}%</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 12 }}>Recruiter Readiness</div>
          <div style={{ marginTop: 24, display: 'flex', gap: 6 }}>
             <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Verified</span>
             <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>High Impact</span>
          </div>
        </motion.div>
      </div>

      {/* AI Insights Bar */}
      <motion.div variants={item} className="glass" style={{ padding: '24px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24, background: 'rgba(99,102,241,0.03)', borderColor: 'rgba(99,102,241,0.1)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Sparkles size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>AI Executive Summary</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text2)', marginTop: 4 }}>
            Your profile shows strong <strong>{parsedResume.skills?.[0]}</strong> depth but requires <strong>quantified metrics</strong> in recent roles to hit the 90+ ATS tier.
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setPage('mentor')} style={{ padding: '10px 24px', fontSize: '0.85rem' }}>Ask Mentor <ChevronRight size={14} /></button>
      </motion.div>

      <div className="grid-2" style={{ marginBottom: 32, gap: 32 }}>
        {/* Domain DNA */}
        <motion.div variants={item} className="glass" style={{ padding: 32 }}>
          <div className="section-header" style={{ marginBottom: 24 }}>
            <div className="section-title"><Brain size={18} style={{ color: 'var(--accent)' }} /> Technology DNA Radar</div>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text3)', fontSize: 10, fontWeight: 700 }} />
                <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} strokeWidth={3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Next Strategic Moves */}
        <motion.div variants={item} className="glass" style={{ padding: 32 }}>
          <div className="section-header" style={{ marginBottom: 24 }}>
            <div className="section-title"><Zap size={18} style={{ color: 'var(--amber)' }} /> Next Strategic Actions</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ats.suggestions.slice(0, 3).map((s, i) => (
              <div key={i} className="glass-glow" style={{ padding: 20, background: 'rgba(255,255,255,0.01)', borderRadius: 16, border: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ marginTop: 4, width: 8, height: 8, borderRadius: '50%', background: s.priority === 'high' ? 'var(--red)' : 'var(--amber)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{s.text}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 4, fontWeight: 700, textTransform: 'uppercase' }}>Impact: {s.impact}</div>
                </div>
                <ChevronRight size={16} opacity={0.3} style={{ alignSelf: 'center' }} />
              </div>
            ))}
            <button className="btn btn-secondary" style={{ marginTop: 8, justifyContent: 'center' }} onClick={() => setPage('resume')}>
              Optimize Full Profile
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
