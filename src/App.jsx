import React, { useContext, useEffect } from 'react';
import { AppContext, AppProvider } from './context/AppContext';
import Dashboard from './components/Dashboard';
import MyCards from './components/MyCards';
import NewCard from './components/NewCard';
import Schedule from './components/Schedule';
import QuizMode from './components/QuizMode';
import WordSearch from './components/WordSearch';
import Translator from './components/Translator';
import Settings from './components/Settings';

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
  Volume2,
  ChevronRight
} from 'lucide-react';

function AppContent() {
  const { 
    activeTab, 
    setActiveTab, 
    showOnboarding, 
    setShowOnboarding, 
    toasts, 
    removeToast 
  } = useContext(AppContext);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();
        const routes = {
          h: 'home',
          c: 'cards',
          n: 'new-card',
          q: 'quiz',
          a: 'ai-assistant',
          s: 'schedule',
          w: 'word-search',
          t: 'translator',
          k: 'settings'
        };
        if (routes[key]) {
          e.preventDefault();
          setActiveTab(routes[key]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  // Page switcher routing
  const renderActivePage = () => {
    switch (activeTab) {
      case 'home': return <Dashboard />;
      case 'cards': return <MyCards />;
      case 'new-card': return <NewCard />;
      case 'schedule': return <Schedule />;
      case 'quiz': return <QuizMode />;
      case 'ai-assistant': return <AIAssistantWrapper />;
      case 'word-search': return <WordSearch />;
      case 'translator': return <Translator />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home Dashboard', icon: <Home size={18} /> },
    { id: 'cards', label: 'My Cards', icon: <BookOpen size={18} /> },
    { id: 'new-card', label: 'Create Card', icon: <Plus size={18} /> },
    { id: 'schedule', label: 'Schedule Planner', icon: <Calendar size={18} /> },
    { id: 'quiz', label: 'Quiz Mode', icon: <Brain size={18} /> },
    { id: 'ai-assistant', label: 'AI Study Assistant', icon: <Sparkles size={18} /> },
    { id: 'word-search', label: 'Word Video Search', icon: <Video size={18} /> },
    { id: 'translator', label: 'Translator', icon: <Languages size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> }
  ];

  return (
    <div className="app-container">
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
                <a 
                  className={`nav-item ${activeTab === link.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(link.id)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* 2. Mobile Navigation Bottom Tab Bar */}
      <nav className="bottom-bar">
        {navLinks.slice(0, 5).map(link => (
          <a
            key={link.id}
            className={`bottom-nav-item ${activeTab === link.id ? 'active' : ''}`}
            onClick={() => setActiveTab(link.id)}
          >
            {link.icon}
            <span>{link.label.split(' ')[0]}</span>
          </a>
        ))}
        <a
          className={`bottom-nav-item ${activeTab === 'ai-assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-assistant')}
        >
          <Sparkles size={18} />
          <span>Ask AI</span>
        </a>
      </nav>

      {/* 3. Main content viewport wrapper */}
      <main className="app-content">
        {renderActivePage()}

        {/* Persistent Floating AI Button */}
        {activeTab !== 'ai-assistant' && (
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('ai-assistant')}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              borderRadius: '50px',
              padding: '12px 24px',
              boxShadow: '0 8px 30px rgba(0, 242, 254, 0.3)',
              zIndex: 90
            }}
          >
            <Sparkles size={18} /> Ask AI Tutor
          </button>
        )}
      </main>

      {/* 4. Onboarding Guide Overlay */}
      {showOnboarding && (
        <div className="crop-overlay-container" style={{ padding: '20px' }}>
          <div className="glass-card" style={{ maxWidth: '540px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={28} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.6rem' }}>Getting Started with Di0 Learning</h2>
              </div>
              <button className="btn btn-secondary btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => setShowOnboarding(false)}>
                <X size={14} />
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Welcome to the future of educational success! **Di0 Learning** is built to supercharge your grades with AI assistance, flashcard review decks, calendar study logs, and instant translations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '10px 0' }}>
              {[
                { icon: '🤖', title: 'AI Assistant', desc: 'Ask complex educational questions and receive clear explanations instantly.' },
                { icon: '🗂️', title: 'Four-Template Study Cards', desc: 'Create Flashcards, Multiple Choice, True/False, or Free Notes.' },
                { icon: '🎤', title: 'Smart Inputs', desc: 'Insert data via typing, microphone speech transcribing, camera capture, or document uploads.' },
                { icon: '🌍', title: 'YouGlish Word Search', desc: 'Hear how any vocabulary term is pronounced in context in real YouTube clips.' }
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
              Let's Study! <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 5. Global Toast Notification Container */}
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
    </div>
  );
}

// Simple wrapper so we can import files cleanly
function AIAssistantWrapper() {
  const AIAssistant = React.lazy(() => import('./components/AIAssistant'));
  return (
    <React.Suspense fallback={<div className="glass-card" style={{ height: '300px' }}>Loading Assistant...</div>}>
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
