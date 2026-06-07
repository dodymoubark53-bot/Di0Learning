import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext, AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard';
import MyCards from './components/MyCards';
import NewCard from './components/NewCard';
import Schedule from './components/Schedule';
import QuizMode from './components/QuizMode';
import WordSearch from './components/WordSearch';
import Translator from './components/Translator';
import Settings from './components/Settings';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import Account from './components/Account';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './lib/supabase';

import { 
  Home, 
  BookOpen, 
  Plus, 
  Calendar, 
  Brain, 
  Video, 
  Languages, 
  Settings as SettingsIcon,
  Sparkles,
  X,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';

// 1B. Create Navbar Component with user prop
function Navbar({ user, activeTab, t, lang, toggleLang, theme, toggleTheme }) {
  const navigate = useNavigate();

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    navigate('/login');
  }

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
      <h2 style={{ textTransform: 'capitalize', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
        {t(activeTab)}
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* AUTH SECTION — always visible top right */}
        <div className="nav-auth" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user ? (
            <>
              <span className="nav-user-email" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                👤 {user.email}
              </span>
              <button className="nav-logout-btn btn btn-secondary" onClick={handleLogout} style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--accent-danger)' }}>
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <button className="nav-login-btn btn btn-secondary" onClick={() => navigate('/login')} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                👤 Login
              </button>
              <button className="nav-signup-btn btn btn-secondary" onClick={() => navigate('/register')} style={{ padding: '6px 12px', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                ✏️ Sign Up
              </button>
            </>
          )}
        </div>

        {/* Language Switcher */}
        <button 
          className="btn btn-secondary" 
          onClick={toggleLang}
          style={{ padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', minWidth: '70px' }}
        >
          🌐 {lang === 'en' ? 'AR' : 'EN'}
        </button>
        {/* Theme Toggle */}
        <button 
          className="btn btn-secondary btn-icon" 
          onClick={toggleTheme}
          style={{ width: '36px', height: '36px' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </nav>
  );
}

function AppContent() {
  const { 
    activeTab, 
    setActiveTab, 
    lang, 
    toggleLang, 
    t, 
    theme, 
    toggleTheme, 
    showOnboarding, 
    setShowOnboarding, 
    toasts, 
    removeToast,
    isDataLoading,
    setUser: setContextUser
  } = useContext(AppContext);

  // 1A. Create the Supabase auth listener state in AppContent (which runs inside Router / AppProvider)
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setContextUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setContextUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setContextUser]);

  const navigate = useNavigate();
  const location = useLocation();

  // Synchronize location path with activeTab state
  useEffect(() => {
    const path = location.pathname.substring(1);
    if (!path) {
      setActiveTab('home');
    } else if (['home', 'cards', 'new-card', 'schedule', 'quiz', 'ai-assistant', 'word-search', 'translator', 'settings', 'account'].includes(path)) {
      setActiveTab(path);
    }
  }, [location, setActiveTab]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();
        const routes = {
          h: '/',
          c: '/cards',
          n: '/new-card',
          q: '/quiz',
          a: '/ai-assistant',
          s: '/schedule',
          w: '/word-search',
          t: '/translator',
          k: '/settings'
        };
        if (routes[key]) {
          e.preventDefault();
          navigate(routes[key]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const navLinks = [
    { id: 'home', icon: <Home size={18} /> },
    { id: 'cards', icon: <BookOpen size={18} /> },
    { id: 'new-card', icon: <Plus size={18} /> },
    { id: 'schedule', icon: <Calendar size={18} /> },
    { id: 'quiz', icon: <Brain size={18} /> },
    { id: 'ai-assistant', icon: <Sparkles size={18} /> },
    { id: 'word-search', icon: <Video size={18} /> },
    { id: 'translator', icon: <Languages size={18} /> },
    { id: 'settings', icon: <SettingsIcon size={18} /> }
  ];

  if (isDataLoading) {
    return (
      <div className="crop-overlay-container" style={{ position: 'fixed', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-violet)', animation: 'spin 1s linear infinite' }} />
          <h3 style={{ color: 'var(--accent-cyan)' }}>{lang === 'ar' ? 'جاري تحميل البيانات...' : 'Loading Cloud Sync...'}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
            <button 
              className="btn btn-secondary btn-icon" 
              style={{ width: '20px', height: '20px', background: 'transparent', border: 'none', color: 'inherit' }}
              onClick={() => removeToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <Routes>
        {/* 1E. Add login and register routes in the router */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard/App routes wrapper */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div style={{ display: 'flex', width: '100%' }}>
              {/* 1. Desktop Sidebar Navigation */}
              <aside className="app-sidebar">
                <div className="sidebar-logo">
                  <div style={{
                    background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 800
                  }}>d0</div>
                  <span className="gradient-text">Di0 Learning</span>
                </div>

                <nav style={{ flex: 1 }}>
                  <ul className="nav-links">
                    {navLinks.map(link => (
                      <li key={link.id}>
                        <Link 
                          to={link.id === 'home' ? '/' : `/${link.id}`}
                          className={`nav-item ${activeTab === link.id ? 'active' : ''}`}
                        >
                          {link.icon}
                          <span>{t(link.id)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>

              {/* 2. Mobile Navigation Bottom Tab Bar */}
              <nav className="bottom-bar">
                {navLinks.slice(0, 5).map(link => (
                  <Link
                    key={link.id}
                    to={link.id === 'home' ? '/' : `/${link.id}`}
                    className={`bottom-nav-item ${activeTab === link.id ? 'active' : ''}`}
                  >
                    {link.icon}
                    <span>{t(link.id).split(' ')[0]}</span>
                  </Link>
                ))}
                <Link
                  to="/ai-assistant"
                  className={`bottom-nav-item ${activeTab === 'ai-assistant' ? 'active' : ''}`}
                >
                  <Sparkles size={18} />
                  <span>{lang === 'ar' ? 'ذكاء' : 'AI'}</span>
                </Link>
              </nav>

              {/* 3. Main content viewport wrapper */}
              <main className="app-content" style={{ width: '100%' }}>
                {/* 1B. Pass user to Navbar */}
                <Navbar 
                  user={user} 
                  activeTab={activeTab} 
                  t={t} 
                  lang={lang} 
                  toggleLang={toggleLang} 
                  theme={theme} 
                  toggleTheme={toggleTheme} 
                />

                {/* Subroutes within App Shell */}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                  <Route path="/cards" element={<MyCards />} />
                  <Route path="/new-card" element={<NewCard />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/quiz" element={<QuizMode />} />
                  <Route path="/ai-assistant" element={<AIAssistantWrapper />} />
                  <Route path="/word-search" element={<WordSearch />} />
                  <Route path="/translator" element={<Translator />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/account" element={<Account />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Persistent Floating AI Button */}
                {activeTab !== 'ai-assistant' && (
                  <Link 
                    to="/ai-assistant"
                    className="btn btn-primary"
                    style={{
                      position: 'fixed',
                      bottom: '24px',
                      right: lang === 'en' ? '24px' : 'auto',
                      left: lang === 'ar' ? '24px' : 'auto',
                      borderRadius: '50px',
                      padding: '12px 24px',
                      boxShadow: '0 8px 30px rgba(0, 242, 254, 0.3)',
                      zIndex: 90,
                      textDecoration: 'none'
                    }}
                  >
                    <Sparkles size={18} /> {t('ask_ai')}
                  </Link>
                )}
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>

      {/* 4. Onboarding Guide Overlay */}
      {showOnboarding && user && (
        <div className="crop-overlay-container" style={{ padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '540px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={28} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.6rem' }}>{t('onboarding_title')}</h2>
              </div>
              <button className="btn btn-secondary btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => setShowOnboarding(false)}>
                <X size={14} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {t('onboarding_desc')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '10px 0' }}>
              {[
                { icon: '🤖', title: t('ai-assistant'), desc: lang === 'en' ? 'Ask complex educational questions and receive clear explanations instantly.' : 'طرح أسئلة تعليمية معقدة وتلقي تفسيرات واضحة فوراً.' },
                { icon: '🗂️', title: t('cards'), desc: lang === 'en' ? 'Create Flashcards, Multiple Choice, True/False, or Free Notes organized in Folders.' : 'إنشاء بطاقات الفلاش كارد، الخيارات، صح أم خطأ، أو الملاحظات الحرة داخل مجلدات.' },
                { icon: '🎤', title: lang === 'en' ? 'Smart Inputs' : 'المدخلات الذكية', desc: lang === 'en' ? 'Insert data via typing, microphone speech transcribing, camera capture, or document uploads.' : 'إدخال البيانات بالكتابة، تحويل الكلام لنصوص، التقاط الكاميرا، أو رفع الملفات.' },
                { icon: '🌍', title: t('word-search'), desc: lang === 'en' ? 'Hear how any vocabulary term is pronounced in context in real YouTube clips.' : 'سماع كيف يتم نطق أي مصطلح في سياقه الواقعي عبر مقاطع اليوتيوب.' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" onClick={() => setShowOnboarding(false)} style={{ marginTop: '10px', width: '100%' }}>
              {t('onboarding_btn')} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AIAssistantWrapper() {
  const AIAssistant = React.lazy(() => import('./components/AIAssistant'));
  return (
    <React.Suspense fallback={<div className="glass-card" style={{ height: '300px' }}>Loading...</div>}>
      <AIAssistant />
    </React.Suspense>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
