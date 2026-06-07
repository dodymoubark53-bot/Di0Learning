import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Settings as SettingsIcon, LogOut, Sun, Moon, Languages, Key, Database, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const { 
    theme, 
    toggleTheme, 
    lang, 
    toggleLang, 
    addToast,
    t,
    user
  } = useContext(AppContext);

  const navigate = useNavigate();

  // Load API keys from localStorage
  const [ytKey, setYtKey] = useState(() => localStorage.getItem('youtube_api_key') || '');
  const [ttsKey, setTtsKey] = useState(() => localStorage.getItem('google_tts_key') || '');

  // Supabase credentials info
  const rawSupUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || '';
  const maskedSupUrl = rawSupUrl ? rawSupUrl.replace(/(https?:\/\/)([^.]+)(.*)/, '$1****$3') : 'Not Configured';

  const [showYtKey, setShowYtKey] = useState(false);
  const [showTtsKey, setShowTtsKey] = useState(false);

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

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      addToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح!' : 'Signed out successfully!', 'success');
      navigate('/login');
    }
  };

  const handleReconnect = () => {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
    addToast(lang === 'ar' ? 'إعادة ضبط الاتصال... جاري التحميل' : 'Resetting connection... reloading', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <SettingsIcon size={32} className="gradient-text" />
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{lang === 'ar' ? 'الإعدادات العامة' : 'Application Settings'}</h1>
      </div>

      {/* Section 1: Account Info */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          👤 {lang === 'ar' ? 'معلومات الحساب' : 'Account Info'}
        </h3>
        {user ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              {lang === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'} <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong>
            </span>
            <button className="btn btn-danger" onClick={handleSignOut} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}>
              <LogOut size={14} /> {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            </button>
          </div>
        ) : (
          <p style={{ color: 'var(--accent-danger)', fontSize: '0.9rem' }}>
            {lang === 'ar' ? 'لم يتم العثور على مستخدم نشط.' : 'No active user found.'}
          </p>
        )}
      </div>

      {/* Section 2: Appearance */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

      {/* Section 5: Supabase Connection */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🔌 {lang === 'ar' ? 'اتصال قاعدة البيانات' : 'Supabase Connection'}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {lang === 'ar' ? 'رابط خادم Supabase الحالي' : 'Current Project URL'}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {maskedSupUrl}
            </span>
          </div>
          <button className="btn btn-secondary" onClick={handleReconnect} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Database size={14} color="var(--accent-cyan)" /> {lang === 'ar' ? 'إعادة الاتصال' : 'Reconnect'}
          </button>
        </div>
      </div>

    </div>
  );
}
