import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { clearAllMedia } from '../utils/db';
import { supabase } from '../lib/supabase';
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
  Database,
  LogOut
} from 'lucide-react';

export default function Settings() {
  const { 
    theme, 
    toggleTheme, 
    settings, 
    setSettings, 
    setShowOnboarding, 
    addToast,
    t,
    lang,
    user
  } = useContext(AppContext);

  const [showClaudeKey, setShowClaudeKey] = useState(false);
  const [showYoutubeKey, setShowYoutubeKey] = useState(false);

  const [claudeKey, setClaudeKey] = useState(settings.anthropicKey || '');
  const [ytKey, setYtKey] = useState(settings.youtubeKey || '');

  // Supabase connections config state
  const isEnvConfigured = !!import.meta.env.VITE_SUPABASE_URL;
  const [supUrl, setSupUrl] = useState(import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || '');
  const [supKey, setSupKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '');
  const [showSupKey, setShowSupKey] = useState(false);

  const saveSupabaseConfig = (e) => {
    e.preventDefault();
    if (isEnvConfigured) return;
    localStorage.setItem('supabase_url', supUrl.trim());
    localStorage.setItem('supabase_anon_key', supKey.trim());
    addToast(lang === 'ar' ? 'تم حفظ إعدادات الاتصال بنجاح! جاري التوصيل...' : 'Connection settings saved! Reconnecting...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const disconnectSupabase = async () => {
    const confirmMsg = lang === 'ar'
      ? 'هل أنت متأكد من رغبتك في قطع الاتصال وحذف بيانات خادم Supabase الحالية؟ سيؤدي هذا لتسجيل خروجك.'
      : 'Are you sure you want to disconnect and clear Supabase credentials? This will sign you out.';
    
    if (window.confirm(confirmMsg)) {
      localStorage.removeItem('supabase_url');
      localStorage.removeItem('supabase_anon_key');
      if (supabase) {
        await supabase.auth.signOut();
      }
      addToast(lang === 'ar' ? 'تم قطع الاتصال بالخادم.' : 'Disconnected from Supabase project.', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      addToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح.' : 'Logged out successfully.', 'info');
    }
  };

  const saveApiKeys = (e) => {
    e.preventDefault();
    setSettings(prev => ({
      ...prev,
      anthropicKey: claudeKey.trim(),
      youtubeKey: ytKey.trim()
    }));
    addToast(lang === 'ar' ? 'تم حفظ إعدادات API بنجاح!' : 'API settings saved successfully!', 'success');
  };

  const clearAllData = async () => {
    const confirmMsg = lang === 'ar' 
      ? 'تنبيه: سيؤدي هذا إلى حذف جميع البطاقات التعليمية وجدول الدراسة ومقاطع الصوت والصور. لا يمكن التراجع عن هذا الإجراء. هل تريد الاستمرار؟'
      : 'CAUTION: This will delete ALL study cards, schedule planner, files, and media recordings. This action cannot be undone. Do you wish to proceed?';
    
    if (window.confirm(confirmMsg)) {
      localStorage.clear();
      await clearAllMedia();
      addToast(lang === 'ar' ? 'تم مسح جميع البيانات المحلية بنجاح.' : 'All local storage data and media cleared.', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const hotkeysList = [
    { key: 'Alt + H', desc: lang === 'ar' ? 'الذهاب للوحة التحكم الرئيسية' : 'Jump to Home Dashboard' },
    { key: 'Alt + C', desc: lang === 'ar' ? 'الذهاب لقائمة مجلدات المناهج' : 'Jump to My Cards Decks' },
    { key: 'Alt + N', desc: lang === 'ar' ? 'الذهاب لقالب إنشاء بطاقة جديدة' : 'Jump to New Card Editor' },
    { key: 'Alt + Q', desc: lang === 'ar' ? 'بدء وضع الاختبار والمراجعة' : 'Start Quiz Mode' },
    { key: 'Alt + A', desc: lang === 'ar' ? 'التحدث مع معلم الذكاء الاصطناعي' : 'Ask AI Study Assistant' },
    { key: 'Alt + S', desc: lang === 'ar' ? 'فتح جدول ومفكرة الدراسة' : 'Check Planner Schedule' },
    { key: 'Alt + W', desc: lang === 'ar' ? 'البحث عن نطق الكلمات في يوتيوب' : 'Search Context Word Video' },
    { key: 'Alt + T', desc: lang === 'ar' ? 'فتح لوحة الترجمة الفورية' : 'Open Document Translator' },
    { key: 'Alt + K', desc: lang === 'ar' ? 'فتح إعدادات التطبيق' : 'Open Settings Panel' },
    { key: 'Space', desc: lang === 'ar' ? 'كشف / قلب البطاقة في وضع الاختبار' : 'Flip flashcard back/front in Quiz' }
  ];

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SettingsIcon size={28} /> {t('settings_title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('settings_desc')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Account Profile Control */}
        {user && (
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="var(--accent-cyan)" /> {lang === 'ar' ? 'حساب المستخدم السحابي' : 'Cloud User Profile'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {lang === 'ar' ? `مسجل الدخول كـ: ${user.email}` : `Logged in as: ${user.email}`}
              </p>
            </div>
            <button className="btn btn-danger" onClick={handleLogout} style={{ gap: '8px', minWidth: '140px' }}>
              <LogOut size={16} /> {lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
            </button>
          </div>
        )}

        {/* Supabase Connection Settings */}
        <form onSubmit={saveSupabaseConfig} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="var(--accent-cyan)" /> {lang === 'ar' ? 'إعدادات اتصال Supabase' : 'Supabase Connection Settings'}
          </h3>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{lang === 'ar' ? 'رابط المشروع (URL)' : 'Project URL'}</label>
            <input
              type="url"
              className="form-input"
              value={supUrl}
              onChange={(e) => setSupUrl(e.target.value)}
              disabled={isEnvConfigured}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{lang === 'ar' ? 'المفتاح العام (Anon Key)' : 'Public Anon Key'}</label>
            <div style={{ display: 'flex', position: 'relative' }}>
              <input
                type={showSupKey ? 'text' : 'password'}
                className="form-input"
                value={supKey}
                onChange={(e) => setSupKey(e.target.value)}
                disabled={isEnvConfigured}
                required
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                style={{ position: 'absolute', right: lang === 'en' ? '4px' : 'auto', left: lang === 'ar' ? '4px' : 'auto', top: '4px', border: 'none', background: 'transparent' }}
                onClick={() => setShowSupKey(!showSupKey)}
              >
                {showSupKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {isEnvConfigured && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'block', marginTop: '6px' }}>
                {lang === 'ar' ? 'تمت التهيئة عبر ملف البيئة (.env)' : 'Configured via .env environment file.'}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {!isEnvConfigured && (
              <button type="submit" className="btn btn-primary">
                {lang === 'ar' ? 'حفظ إعدادات الاتصال' : 'Save Connection'}
              </button>
            )}
            {!isEnvConfigured && (localStorage.getItem('supabase_url') || localStorage.getItem('supabase_anon_key')) && (
              <button type="button" className="btn btn-danger" onClick={disconnectSupabase}>
                {lang === 'ar' ? 'قطع الاتصال' : 'Disconnect'}
              </button>
            )}
          </div>
        </form>
        
        {/* Theme Control */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{t('interface_theme')}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {lang === 'ar' ? 'التبديل بين أوضاع المظهر الفاتح والداكن.' : 'Toggle between high-contrast light or dark environments.'}
            </p>
          </div>
          <button className="btn btn-secondary" onClick={toggleTheme} style={{ gap: '10px', minWidth: '130px' }}>
            {theme === 'dark' ? (
              <>
                <Moon size={16} color="var(--accent-cyan)" /> {t('dark_mode')}
              </>
            ) : (
              <>
                <Sun size={16} color="var(--accent-amber)" /> {t('light_mode')}
              </>
            )}
          </button>
        </div>

        {/* API Keys Integrations */}
        <form onSubmit={saveApiKeys} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--accent-cyan)" /> {t('third_party')}
          </h3>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('claude_api')}</label>
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
                style={{ position: 'absolute', right: lang === 'en' ? '4px' : 'auto', left: lang === 'ar' ? '4px' : 'auto', top: '4px', border: 'none', background: 'transparent' }}
                onClick={() => setShowClaudeKey(!showClaudeKey)}
              >
                {showClaudeKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              {lang === 'ar' 
                ? 'يستخدم للاستعلام الفوري من معلم الذكاء الاصطناعي وإنشاء أسئلة المراجعة تلقائياً.' 
                : 'Used to query the AI Study Assistant chatbot and auto-generate tests from card notes.'}
            </span>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t('youtube_api')}</label>
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
                style={{ position: 'absolute', right: lang === 'en' ? '4px' : 'auto', left: lang === 'ar' ? '4px' : 'auto', top: '4px', border: 'none', background: 'transparent' }}
                onClick={() => setShowYoutubeKey(!showYoutubeKey)}
              >
                {showYoutubeKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
              {lang === 'ar'
                ? 'يستخدم للبحث عن نطق المصطلحات وعرض الفيديوهات التعليمية الواقعية في نفس الصفحة.'
                : 'Enables YouGlish pronunciation searching to display educational video examples inline.'}
            </span>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            {t('save_api_btn')}
          </button>
        </form>


        {/* Keyboard Shortcuts */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Keyboard size={18} color="var(--accent-violet)" /> {t('shortcuts')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {hotkeysList.map(item => (
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

        {/* Danger Zone wipes */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--accent-danger)' }}>{t('danger_zone')}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {lang === 'ar' ? 'حذف كافة البيانات والإعدادات المحلية، المجلدات والملفات التعليمية نهائياً.' : 'Wipe all local settings, cards metadata, event planners, and media recordings.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => { setShowOnboarding(true); addToast('Onboarding reset.', 'info'); }} style={{ fontSize: '0.85rem' }}>
              <RefreshCw size={14} /> {t('reset_onboarding')}
            </button>
            <button className="btn btn-danger" onClick={clearAllData} style={{ fontSize: '0.85rem' }}>
              <Trash2 size={14} /> {t('clear_database')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
