import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Settings as SettingsIcon, Sun, Moon, Languages, Key, Database, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const { 
    theme, 
    toggleTheme, 
    lang, 
    toggleLang, 
    addToast,
    t
  } = useContext(AppContext);

  const navigate = useNavigate();

  // Load API keys from localStorage
  const [ytKey, setYtKey] = useState(() => localStorage.getItem('youtube_api_key') || '');
  const [ttsKey, setTtsKey] = useState(() => localStorage.getItem('google_tts_key') || '');

  const [showTtsKey, setShowTtsKey] = useState(false);
  const [showYtKey, setShowYtKey] = useState(false);

  // Sync state with Context and appLanguage localStorage
  const handleLanguageToggle = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en';
    toggleLang(); // updates context
    localStorage.setItem('appLanguage', nextLang);
    addToast(nextLang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English', 'success');
  };

  const handleThemeToggle = () => {
    toggleTheme(); // updates context
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    addToast(lang === 'ar' ? 'تم تغيير المظهر' : 'Theme updated successfully', 'success');
  };

  const handleSaveYtKey = (e) => {
    e.preventDefault();
    localStorage.setItem('youtube_api_key', ytKey.trim());
    addToast(lang === 'ar' ? 'تم حفظ مفتاح YouTube API' : 'YouTube API Key saved successfully!', 'success');
  };

  const handleSaveTtsKey = (e) => {
    e.preventDefault();
    localStorage.setItem('google_tts_key', ttsKey.trim());
    addToast(lang === 'ar' ? 'تم حفظ مفتاح Google TTS API' : 'Google TTS API Key saved successfully!', 'success');
  };

  return (
    <div className="page-enter" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px' }}>
      
      {/* Page Hero */}
      <div className="page-hero" style={{ '--hero-glow': 'rgba(16,185,129,0.15)', '--hero-gradient': 'linear-gradient(135deg, #10b981, #34d399)' }}>
        <div className="page-hero-content">
          <div className="page-hero-icon-wrapper">
            <SettingsIcon size={32} color="#fff" />
          </div>
          <h1 className="page-hero-title">{lang === 'ar' ? 'الإعدادات العامة' : 'Application Settings'}</h1>
          <p className="page-hero-subtitle">
            {lang === 'ar' ? 'تخصيص المظهر، إعدادات اللغات، ومفاتيح الواجهة البرمجية (API).' : 'Customize appearance, languages, and API keys.'}
          </p>
        </div>
      </div>

      {/* Section 1: Account Info (Removed because local mode) */}

      {/* Section 2: Appearance */}
      <div className="glass-card flex-mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            🎨 {lang === 'ar' ? 'المظهر والسمة' : 'Appearance'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {lang === 'ar' ? 'التبديل بين الوضع الداكن والوضع المضيء.' : 'Toggle dark mode or light mode settings.'}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleThemeToggle} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' }}>
          {theme === 'dark' ? (
            <>
              <Moon size={16} color="var(--accent-cyan)" /> {lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode'}
            </>
          ) : (
            <>
              <Sun size={16} color="var(--accent-amber)" /> {lang === 'ar' ? 'الوضع المضيء' : 'Light Mode'}
            </>
          )}
        </button>
      </div>

      {/* Section 3: Language */}
      <div className="glass-card flex-mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            🌐 {lang === 'ar' ? 'لغة التطبيق' : 'Language'}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {lang === 'ar' ? 'تغيير لغة واجهة المستخدم الرسومية.' : 'Change interface language.'}
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleLanguageToggle} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px', fontWeight: 'bold' }}>
          <Languages size={16} /> {lang === 'en' ? 'ARABIC (AR)' : 'ENGLISH (EN)'}
        </button>
      </div>

      {/* Section 4: API Keys */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔑 {lang === 'ar' ? 'مفاتيح واجهة البرمجة (API)' : 'API Keys'}
        </h3>
        
        {/* YouTube API Key */}
        <form onSubmit={handleSaveYtKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="form-label" style={{ margin: 0, fontSize: '0.8rem' }}>
            {lang === 'ar' ? 'مفتاح واجهة YouTube API v3' : 'YouTube API Key'}
          </label>
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <input
              type={showYtKey ? 'text' : 'password'}
              className="form-input"
              placeholder="AIzaSy..."
              value={ytKey}
              onChange={(e) => setYtKey(e.target.value)}
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              style={{ position: 'absolute', right: '4px', top: '4px', border: 'none', background: 'transparent', width: '32px', height: '32px' }}
              onClick={() => setShowYtKey(!showYtKey)}
            >
              {showYtKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', fontSize: '0.85rem' }}>
              {lang === 'ar' ? 'حفظ' : 'Save'}
            </button>
          </div>
        </form>

        {/* Google TTS API Key */}
        <form onSubmit={handleSaveTtsKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="form-label" style={{ margin: 0, fontSize: '0.8rem' }}>
            {lang === 'ar' ? 'مفتاح واجهة Google TTS API' : 'Google TTS API Key'}
          </label>
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <input
              type={showTtsKey ? 'text' : 'password'}
              className="form-input"
              placeholder="AIzaSy..."
              value={ttsKey}
              onChange={(e) => setTtsKey(e.target.value)}
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              style={{ position: 'absolute', right: '4px', top: '4px', border: 'none', background: 'transparent', width: '32px', height: '32px' }}
              onClick={() => setShowTtsKey(!showTtsKey)}
            >
              {showTtsKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 16px', fontSize: '0.85rem' }}>
              {lang === 'ar' ? 'حفظ' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 5: Supabase Connection Removed */}

    </div>
  );
}
