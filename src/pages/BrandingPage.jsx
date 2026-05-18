import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Copy, Check, Globe, 
  Mail, FileText, User,
  ChevronRight, Bookmark, Share2, Rocket
} from 'lucide-react';
import { useApp } from '../App';
import { generateBranding } from '../engines/brandingEngine';

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

export default function BrandingPage() {
  const { parsedResume } = useApp();
  const [copied, setCopied] = useState('');
  const [activeHeadline, setActiveHeadline] = useState(0);

  if (!parsedResume) return <div className="empty-state"><div className="empty-icon"><Sparkles size={64} opacity={0.3} /></div><div className="empty-title">No Resume Loaded</div></div>;

  const branding = useMemo(() => generateBranding(parsedResume), [parsedResume]);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const BrandingBlock = ({ label, content, copyKey, icon: Icon, description }) => (
    <motion.div variants={item} className="glass" style={{ padding: 24, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Icon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</div>
            <div style={{ fontSize: '.8rem', color: 'var(--text3)', marginTop: 2 }}>{description}</div>
          </div>
        </div>
        <button 
          onClick={() => copy(content, copyKey)}
          style={{ 
            background: copied === copyKey ? 'var(--green)' : 'rgba(255,255,255,0.05)', 
            border: 'none', borderRadius: 8, padding: '8px 16px', 
            fontSize: '0.75rem', fontWeight: 700, color: '#fff', 
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          {copied === copyKey ? <Check size={14} /> : <Copy size={14} />}
          {copied === copyKey ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, fontSize: '.95rem', color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
        {content}
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="branding-container"
    >
      <div className="page-header">
        <motion.h1 variants={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Sparkles size={32} className="text-cyan-400" /> AI Personal Brand Architect
        </motion.h1>
        <motion.p variants={item} style={{ fontSize: '1rem' }}>
          Neural-crafted professional narratives for LinkedIn, portfolio assets, and strategic outreach.
        </motion.p>
      </div>

      {/* LinkedIn Headlines */}
      <motion.div variants={item} className="glass glass-glow" style={{ padding: 32, marginBottom: 32 }}>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <div className="section-title"><Globe size={18} className="text-blue-400" /> High-Conversion Headlines</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {branding.headlines.map((h, i) => (
            <motion.div 
              key={i} 
              whileHover={{ x: 5 }}
              onClick={() => setActiveHeadline(i)} 
              style={{ 
                padding: '20px 24px', borderRadius: 16, 
                border: '1px solid',
                borderColor: activeHeadline === i ? 'var(--accent)' : 'var(--border)',
                background: activeHeadline === i ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)', 
                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', 
                alignItems: 'center', gap: 20, transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '1rem', lineHeight: 1.5, flex: 1, color: activeHeadline === i ? 'var(--text)' : 'var(--text2)', fontWeight: activeHeadline === i ? 600 : 400 }}>{h}</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <AnimatePresence>
                  {activeHeadline === i && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="badge badge-purple" 
                      style={{ fontSize: '.65rem' }}
                    >
                      Optimized Choice
                    </motion.span>
                  )}
                </AnimatePresence>
                <button 
                  onClick={e => { e.stopPropagation(); copy(h, `h${i}`); }}
                  style={{ 
                    background: copied === `h${i}` ? 'var(--green)' : 'transparent', 
                    border: '1px solid', borderColor: copied === `h${i}` ? 'var(--green)' : 'var(--border)',
                    borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {copied === `h${i}` ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid-2" style={{ marginBottom: 32, gap: 24 }}>
        <BrandingBlock 
          label="Executive Bio" 
          description="Synthesized summary for profiles (2-3 lines)"
          content={branding.shortBio} 
          copyKey="short" 
          icon={User}
        />
        <BrandingBlock 
          label="Professional Signature" 
          description="Polished email footer with strategic links"
          content={branding.emailSignature} 
          copyKey="sig" 
          icon={Mail}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <BrandingBlock 
          label="LinkedIn 'About' Narrative" 
          description="Detailed career storytelling optimized for semantic search"
          content={branding.longBio} 
          copyKey="long" 
          icon={FileText}
        />
        <BrandingBlock 
          label="Portfolio Identity" 
          description="Engaging introduction for your personal website"
          content={branding.portfolioIntro} 
          copyKey="portfolio" 
          icon={Globe}
        />
      </div>

      <motion.div variants={item} className="glass" style={{ padding: 24, marginTop: 32, display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(99,102,241,0.02)' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
          <Rocket size={20} />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>Brand Evolution Logic</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>These narratives are generated based on your top technical competencies and high-impact keywords found in your resume to ensure maximum discoverability.</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
