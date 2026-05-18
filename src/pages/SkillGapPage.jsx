import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Puzzle, Brain, Target, Zap, 
  CheckCircle2, AlertTriangle, BookOpen, 
  Rocket, Award, Sparkles, TrendingUp
} from 'lucide-react';
import { useApp } from '../App';
import { analyzeSkillGap, getSkillRadarData } from '../engines/skillEngine';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

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

export default function SkillGapPage() {
  const { parsedResume } = useApp();
  if (!parsedResume) return <div className="empty-state"><div className="empty-icon"><Puzzle size={64} opacity={0.3} /></div><div className="empty-title">No Resume Loaded</div></div>;

  const gap = useMemo(() => analyzeSkillGap(parsedResume), [parsedResume]);
  const radar = useMemo(() => getSkillRadarData(parsedResume), [parsedResume]);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="skill-gap-container"
    >
      <div className="page-header">
        <motion.h1 variants={item}>🧩 Professional Skill Matrix</motion.h1>
        <motion.p variants={item} style={{ fontSize: '1rem' }}>
          Deep-dive into your technical competencies and identified growth opportunities.
        </motion.p>
      </div>

      <div className="grid-3" style={{ marginBottom: 32 }}>
        {[
          { label: 'Skills Matched', value: gap.matched.length, color: 'var(--green)', icon: <CheckCircle2 size={16} /> },
          { label: 'Skills Missing', value: gap.missing.length, color: 'var(--red)', icon: <AlertTriangle size={16} /> },
          { label: 'Domain Coverage', value: `${gap.score}%`, color: 'var(--accent)', icon: <Target size={16} /> },
        ].map((m, i) => (
          <motion.div 
            key={i}
            variants={item}
            className="glass metric-card"
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, opacity: 0.5 }}>{m.icon}</div>
            <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
            <div className="metric-label" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 32, gap: 24 }}>
        <motion.div variants={item} className="glass" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title"><Brain size={18} className="text-indigo-400" /> Skill Radar</div>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text3)', fontSize: 10 }} />
                <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        <motion.div variants={item} className="glass" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title"><TrendingUp size={18} className="text-emerald-400" /> Domain Proficiency</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {gap.domainStrengths.slice(0, 6).map((d, i) => (
              <div key={d.domain}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '.9rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text2)' }}>{d.domain.split('/')[0].trim()}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{d.percentage}%</span>
                </div>
                <div className="progress-track" style={{ height: 6 }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${d.percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="progress-fill" 
                    style={{ background: i === 0 ? 'var(--accent)' : 'var(--accent2)' }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid-2" style={{ marginBottom: 32, gap: 24 }}>
        <motion.div variants={item} className="glass" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title"><CheckCircle2 size={18} className="text-green-400" /> Competencies Found ({gap.matched.length})</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {gap.matched.map(s => <span className="tag tag-green" key={s} style={{ background: 'rgba(16,185,129,0.08)', padding: '6px 12px' }}>{s}</span>)}
          </div>
          {gap.bonusSkills.length > 0 && (
            <>
              <div style={{ margin: '24px 0 12px', fontSize: '.75rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎁 Strategic Bonus Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {gap.bonusSkills.map(s => <span className="tag tag-cyan" key={s} style={{ background: 'rgba(6,182,212,0.08)', padding: '6px 12px' }}>{s}</span>)}
              </div>
            </>
          )}
        </motion.div>
        
        <motion.div variants={item} className="glass" style={{ padding: 24 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title"><Zap size={18} className="text-amber-400" /> Skill Expansion Map</div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '.7rem', color: 'var(--red)', fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔥 Critical Path (Learn Next)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {gap.highPriority.map(s => <span className="tag tag-red" key={s} style={{ background: 'rgba(220,38,38,0.08)', padding: '6px 12px' }}>{s}</span>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '.7rem', color: 'var(--amber)', fontWeight: 800, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>📌 Recommended Growth</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {gap.medPriority.map(s => <span className="tag tag-amber" key={s} style={{ background: 'rgba(245,158,11,0.08)', padding: '6px 12px' }}>{s}</span>)}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item} className="glass" style={{ padding: 32 }}>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <div className="section-title"><Rocket size={20} className="text-purple-400" /> Personalized Learning Pathway</div>
        </div>
        <div className="grid-2" style={{ gap: 20 }}>
          {gap.suggestions.map((s, i) => (
            <motion.div 
              key={i} 
              whileHover={{ x: 5 }}
              style={{ 
                display: 'flex', gap: 16, padding: 20, 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--border)', 
                borderRadius: 12,
                alignItems: 'center'
              }}
            >
              <div style={{ 
                width: 44, height: 44, borderRadius: 10, 
                background: 'var(--bg2)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', 
                color: s.priority === 'high' ? 'var(--red)' : 'var(--amber)',
                flexShrink: 0
              }}>
                {s.type === 'course' ? <BookOpen size={20} /> : s.type === 'project' ? <Sparkles size={20} /> : <Award size={20} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{s.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: s.priority === 'high' ? 'var(--red)' : 'var(--amber)' }}>{s.priority} Priority</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text3)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'capitalize' }}>{s.type}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
