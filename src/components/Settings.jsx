import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { clearAllMedia } from '../utils/db';
import { 
  Settings as SettingsIcon, 
  Sun, 
  Moon, 
  Trash2, 
  Keyboard, 
  Key, 
  RefreshCw, 
  Eye, 
  EyeOff,
  BookOpen
} from 'lucide-react';

export default function Settings() {
  const { 
    theme, 
    toggleTheme, 
    settings, 
    setSettings, 
    setShowOnboarding, 
    addToast 
  } = useContext(AppContext);

  // API Key visual visibility states
  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showYoutubeKey, setShowYoutubeKey] = useState(false);

  // Temporary inputs
  const [claudeKey, setClaudeKey] = useState(settings.anthropicKey || '');
  const [ytKey, setYtKey] = useState(settings.youtubeKey || '');

  const saveApiKeys = (e) => {
    e.preventDefault();
    setSettings(prev => ({
      ...prev,
      anthropicKey: claudeKey.trim(),
      youtubeKey: ytKey.trim()
    }));
    addToast('API settings saved successfully!', 'success');
  };

  const clearAllData = async () => {
    if (window.confirm('CAUTION: This will delete ALL study cards, schedule planner, files, and media recordings. This action cannot be undone. Do you wish to proceed?')) {
      localStorage.clear();
      await clearAllMedia();
      addToast('All local storage data and media cleared.', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SettingsIcon size={28} /> Application Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Configure API integrations, customize themes, clean data files, and inspect system hotkeys.
        </p>
      </div>

      {/* Grid container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section: Theme Control */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Interface Theme</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Toggle between high-contrast light or dark environments.</p>
          </div>
          <button className="btn btn-secondary" onClick={toggleTheme} style={{ gap: '10px', minWidth: '130px' }}>
            {theme === 'dark' ? (
              <>
                <Moon size={16} color="var(--accent-cyan)" /> Dark Mode
              </>
            ) : (
              <>
                <Sun size={16} color="var(--accent-amber)" /> Light Mode
              </>
            )}
          </button>
        </div>

        {/* Section: API Keys Integrations */}
        <form onSubmit={saveApiKeys} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--accent-cyan)" /> Third-Party Integrations
          </h3>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Anthropic Claude API Key</label>
            <div style={{ display: 'flex', position: 'relative' }}>
              <input
                type={showClaudeKey ? 'text' : 'password'}
                className="form-input"
                placeholder="sk-ant-..."
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                style={{ position: 'absolute', right: '4px', top: '4px', border: 'none', background: 'transparent' }}
                onClick={() => setShowClaudeKey(!showClaudeKey)}
              >
                {showClaudeKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              Used to query the AI Study Assistant chatbot and auto-generate tests from card notes.
            </span>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">YouTube Data API v3 Key</label>
            <div style={{ display: 'flex', position: 'relative' }}>
              <input
                type={showYoutubeKey ? 'text' : 'password'}
                className="form-input"
                placeholder="AIzaSy..."
                value={ytKey}
                onChange={(e) => setYtKey(e.target.value)}
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                style={{ position: 'absolute', right: '4px', top: '4px', border: 'none', background: 'transparent' }}
                onClick={() => setShowYoutubeKey(!showYoutubeKey)}
              >
                {showYoutubeKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              Enables YouGlish pronunciation searching to display educational video examples inline.
            </span>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            Save API Settings
          </button>
        </form>

        {/* Section: Keyboard Shortcuts */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Keyboard size={18} color="var(--accent-violet)" /> Power User Hotkeys
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { key: 'Alt + H', desc: 'Jump to Home Dashboard' },
              { key: 'Alt + C', desc: 'Jump to My Cards Decks' },
              { key: 'Alt + N', desc: 'Jump to New Card Editor' },
              { key: 'Alt + Q', desc: 'Start Quiz Mode' },
              { key: 'Alt + A', desc: 'Ask AI Study Assistant' },
              { key: 'Alt + S', desc: 'Check Planner Schedule' },
              { key: 'Alt + W', desc: 'Search Context Word Video' },
              { key: 'Alt + T', desc: 'Open Document Translator' },
              { key: 'Alt + K', desc: 'Open Settings Panel' },
              { key: 'Space', desc: 'Flip flashcard back/front in Quiz' }
            ].map(item => (
              <div 
                key={item.key} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '8px 12px', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: '6px',
                  fontSize: '0.85rem'
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>{item.desc}</span>
                <kbd style={{ 
                  background: 'var(--bg-tertiary)', 
                  padding: '2px 8px', 
                  borderRadius: '4px', 
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-cyan)'
                }}>
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Diagnostics & Clean-up */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--accent-danger)' }}>Danger Zone</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Wipe all local settings, cards metadata, event planners, and media recordings.</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => { setShowOnboarding(true); addToast('Onboarding reset. Reload page to see it.', 'info'); }} style={{ fontSize: '0.85rem' }}>
              <RefreshCw size={14} /> Reset Onboarding
            </button>
            <button className="btn btn-danger" onClick={clearAllData} style={{ fontSize: '0.85rem' }}>
              <Trash2 size={14} /> Clear Database
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
