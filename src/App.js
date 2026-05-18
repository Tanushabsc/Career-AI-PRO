import { useState, createContext, useContext, useEffect } from 'react';
import './App.css';
import { 
  LayoutDashboard, Target, Puzzle, Briefcase, 
  Map, FileEdit, MessageSquare, Mic, 
  Code2, Sparkles, Globe, Link, LogOut, User as UserIcon
} from 'lucide-react';
import { LinkedInLogo, GitHubLogo } from './components/Icons';
import { puterService } from './services/puterService';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ATSPage from './pages/ATSPage';
import SkillGapPage from './pages/SkillGapPage';
import JobMatchPage from './pages/JobMatchPage';
import RoadmapPage from './pages/RoadmapPage';
import ResumePage from './pages/ResumePage';
import MentorPage from './pages/MentorPage';
import InterviewPage from './pages/InterviewPage';
import GitHubPage from './pages/GitHubPage';
import BrandingPage from './pages/BrandingPage';
import LinkedInPage from './pages/LinkedInPage';

export const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const NAV = [
  { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { id: 'ats', icon: <Target size={18} />, label: 'ATS Score' },
  { id: 'skills', icon: <Puzzle size={18} />, label: 'Skill Gap' },
  { id: 'jobs', icon: <Briefcase size={18} />, label: 'Job Match' },
  { id: 'roadmap', icon: <Map size={18} />, label: 'Career Roadmap' },
  { id: 'resume', icon: <FileEdit size={18} />, label: 'Resume Improve' },
  { id: 'mentor', icon: <MessageSquare size={18} />, label: 'AI Mentor' },
  { id: 'interview', icon: <Mic size={18} />, label: 'Interview Prep' },
  { id: 'github', icon: <GitHubLogo size={18} />, label: 'GitHub Analyzer' },
  { id: 'linkedin', icon: <LinkedInLogo size={18} />, label: 'LinkedIn Pro' },
  { id: 'branding', icon: <Sparkles size={18} />, label: 'Branding' },
];

export default function App() {
  const [page, setPage] = useState('landing');
  const [resumeText, setResumeText] = useState('');
  const [parsedResume, setParsedResume] = useState(null);
  const [file, setFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Puter.js Initialization & Sync
  useEffect(() => {
    const initPuter = async () => {
      try {
        if (puterService.isSignedIn()) {
          const puterUser = await puterService.getUser();
          setUser(puterUser);
          
          // Hydrate from Cloud
          const savedData = await puterService.getMetadata('career_profile');
          if (savedData) {
            setParsedResume(savedData.parsedResume);
            setResumeText(savedData.resumeText);
            setPage('dashboard');
          }
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    initPuter();
  }, []);

  // Persistence Hook
  useEffect(() => {
    if (parsedResume && user) {
      puterService.saveMetadata('career_profile', { parsedResume, resumeText });
    }
  }, [parsedResume, resumeText, user]);

  const login = async () => {
    const puterUser = await puterService.signIn();
    setUser(puterUser);
  };

  const logout = () => {
    puterService.signOut();
    setUser(null);
    setParsedResume(null);
    setPage('landing');
  };

  const ctx = { page, setPage, resumeText, setResumeText, parsedResume, setParsedResume, file, setFile, user, login, logout };

  if (isInitializing) return <div className="neural-loader"><div className="processing-orb" /></div>;

  if (page === 'landing' && !parsedResume) {
    return <AppContext.Provider value={ctx}><LandingPage /></AppContext.Provider>;
  }
  const PAGES = {
    landing: <DashboardPage />, dashboard: <DashboardPage />,
    ats: <ATSPage />, skills: <SkillGapPage />, jobs: <JobMatchPage />,
    roadmap: <RoadmapPage />, resume: <ResumePage />, mentor: <MentorPage />,
    interview: <InterviewPage />, github: <GitHubPage />, branding: <BrandingPage />,
    linkedin: <LinkedInPage />,
  };

  return (
    <AppContext.Provider value={ctx}>
      <div className="app-shell">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(s => !s)}>☰</button>
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="sidebar-logo">
            <span>🚀</span><span>Career<span style={{color:'var(--accent)'}}>AI</span> Pro</span>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">Analytics</div>
            {NAV.slice(0, 4).map(n => (
              <div key={n.id} className={`nav-item${page === n.id ? ' active' : ''}`} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                <span className="nav-icon">{n.icon}</span>{n.label}
              </div>
            ))}
            <div className="nav-section">Growth</div>
            {NAV.slice(4, 7).map(n => (
              <div key={n.id} className={`nav-item${page === n.id ? ' active' : ''}`} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                <span className="nav-icon">{n.icon}</span>{n.label}
              </div>
            ))}
            <div className="nav-section">Tools</div>
            {NAV.slice(7).map(n => (
              <div key={n.id} className={`nav-item${page === n.id ? ' active' : ''}`} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                <span className="nav-icon">{n.icon}</span>{n.label}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            {user && (
              <div style={{ marginBottom: 16, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text3)' }}>Puter.js Cloud</div>
                  </div>
                </div>
                <button onClick={logout} style={{ width: '100%', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '6px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <LogOut size={12} /> Sign Out
                </button>
              </div>
            )}
            <div style={{marginBottom:4, fontSize: '0.65rem'}}>Puter.js Intelligence Engine</div>
            <div style={{fontSize: '0.65rem', opacity: 0.5}}>© 2026 CareerAI Pro</div>
          </div>
        </aside>
        <main className="main-content">
          <div className="topbar">
            <div className="topbar-title">{NAV.find(n => n.id === page)?.icon} {NAV.find(n => n.id === page)?.label || 'Dashboard'}</div>
            <div className="topbar-badges">
              <span className="badge badge-green">AI Powered</span>
              <span className="badge badge-purple">Free</span>
            </div>
          </div>
          <div className="page">{PAGES[page] || <DashboardPage />}</div>
        </main>
      </div>
    </AppContext.Provider>
  );
}
