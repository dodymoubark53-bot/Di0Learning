import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Key, Mail, Lock, Sparkles, Database, Eye, EyeOff, Loader } from 'lucide-react';

export default function Auth() {
  const { lang, t, addToast } = useContext(AppContext);
  
  // Tab: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Connection config state (if supabase is null)
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  // Credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local translations
  const authT = {
    en: {
      setupTitle: 'Connect Supabase',
      setupDesc: 'To use cloud synchronization, please enter your Supabase Project credentials. You can find these in your Supabase Dashboard under Project Settings > API.',
      urlLabel: 'Supabase URL',
      keyLabel: 'Supabase Anon Key',
      connectBtn: 'Initialize Connection',
      loginTitle: 'Sign In',
      registerTitle: 'Create Account',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm Password',
      loginBtn: 'Log In',
      registerBtn: 'Sign Up',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      switchToRegister: 'Create one here',
      switchToLogin: 'Sign in here',
      passwordsMismatch: 'Passwords do not match.',
      successConfig: 'Supabase credentials saved! Reconnecting...',
      loginSuccess: 'Signed in successfully!',
      registerSuccess: 'Account created! Please check your email for confirmation.',
      authError: 'Authentication failed: '
    },
    ar: {
      setupTitle: 'ربط Supabase',
      setupDesc: 'لاستخدام المزامنة السحابية، يرجى إدخال بيانات مشروع Supabase الخاصة بك. يمكنك العثور عليها في لوحة تحكم Supabase ضمن إعدادات المشروع > واجهة برمجة التطبيقات (API).',
      urlLabel: 'رابط Supabase URL',
      keyLabel: 'مفتاح Anon Key الخاص بـ Supabase',
      connectBtn: 'تهيئة الاتصال بالخادم',
      loginTitle: 'تسجيل الدخول',
      registerTitle: 'إنشاء حساب جديد',
      emailLabel: 'البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      confirmPasswordLabel: 'تأكيد كلمة المرور',
      loginBtn: 'دخول',
      registerBtn: 'إنشاء الحساب',
      noAccount: 'ليس لديك حساب؟',
      hasAccount: 'لديك حساب بالفعل؟',
      switchToRegister: 'أنشئ حساباً هنا',
      switchToLogin: 'سجل دخولك هنا',
      passwordsMismatch: 'كلمتا المرور غير متطابقتين.',
      successConfig: 'تم حفظ إعدادات Supabase بنجاح! جاري الاتصال...',
      loginSuccess: 'تم تسجيل الدخول بنجاح!',
      registerSuccess: 'تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.',
      authError: 'فشل المصادقة: '
    }
  };

  const getT = (key) => authT[lang]?.[key] || authT['en']?.[key] || key;

  // Handle Supabase Project URL/Key Configuration
  const handleSetup = (e) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      addToast(lang === 'ar' ? 'يرجى ملء جميع الحقول.' : 'Please fill in all fields.', 'error');
      return;
    }
    localStorage.setItem('supabase_url', supabaseUrl.trim());
    localStorage.setItem('supabase_anon_key', supabaseKey.trim());
    addToast(getT('successConfig'), 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  // Handle Log In / Register
  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) {
      addToast(lang === 'ar' ? 'مكتبة Supabase غير مهيأة.' : 'Supabase is not initialized.', 'error');
      return;
    }

    if (!email.trim() || !password) {
      addToast(lang === 'ar' ? 'يرجى ملء البريد وكلمة المرور.' : 'Please fill in email and password.', 'error');
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'register') {
        if (password !== confirmPassword) {
          addToast(getT('passwordsMismatch'), 'error');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;
        
        addToast(getT('registerSuccess'), 'success');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        addToast(getT('loginSuccess'), 'success');
      }
    } catch (err) {
      console.error(err);
      addToast(getT('authError') + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1. If Supabase client is not configured (missing URL/Anon key), show Connection Setup Form
  if (!supabase) {
    return (
      <div className="crop-overlay-container" style={{ position: 'fixed', padding: '20px', background: 'var(--bg-primary)' }}>
        <form onSubmit={handleSetup} className="glass-card" style={{ maxWidth: '480px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
              <Database size={36} />
            </div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }} className="gradient-text">
              {getT('setupTitle')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {getT('setupDesc')}
            </p>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{getT('urlLabel')}</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://your-project.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{getT('keyLabel')}</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              required
              style={{ resize: 'none', fontFamily: 'monospace', fontSize: '0.8rem' }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', height: '46px' }}>
            <Sparkles size={16} /> {getT('connectBtn')}
          </button>
        </form>
      </div>
    );
  }

  // 2. Otherwise, Supabase is configured; render standard Login / Register Form
  return (
    <div className="crop-overlay-container" style={{ position: 'fixed', padding: '20px', background: 'var(--bg-primary)' }}>
      <div className="glass-card" style={{ maxWidth: '440px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', padding: '36px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.4rem',
            marginBottom: '14px'
          }}>d0</div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>
            {authMode === 'login' ? getT('loginTitle') : getT('registerTitle')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {lang === 'ar' ? 'بوابة التعلم الذكي السحابي' : 'Cloud Smart Study Portal'}
          </p>
        </div>

        {/* Input Forms */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{getT('emailLabel')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: lang === 'en' ? '40px' : '16px', paddingRight: lang === 'ar' ? '40px' : '16px' }}
              />
              <Mail size={16} style={{ position: 'absolute', left: lang === 'en' ? '14px' : 'auto', right: lang === 'ar' ? '14px' : 'auto', top: '15px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{getT('passwordLabel')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  paddingLeft: lang === 'en' ? '40px' : '16px', 
                  paddingRight: lang === 'ar' ? '40px' : '48px',
                  paddingRight: lang === 'en' ? '48px' : '16px'
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: lang === 'en' ? '14px' : 'auto', right: lang === 'ar' ? '14px' : 'auto', top: '15px', color: 'var(--text-muted)' }} />
              
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                style={{ position: 'absolute', right: lang === 'en' ? '4px' : 'auto', left: lang === 'ar' ? '4px' : 'auto', top: '4px', border: 'none', background: 'transparent', width: '32px', height: '32px' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {authMode === 'register' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{getT('confirmPasswordLabel')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ paddingLeft: lang === 'en' ? '40px' : '16px', paddingRight: lang === 'ar' ? '40px' : '16px' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: lang === 'en' ? '14px' : 'auto', right: lang === 'ar' ? '14px' : 'auto', top: '15px', color: 'var(--text-muted)' }} />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px', height: '46px' }}>
            {loading ? (
              <Loader size={18} className="pulsing-mic" style={{ animation: 'spin 1s linear infinite', background: 'none' }} />
            ) : (
              authMode === 'login' ? getT('loginBtn') : getT('registerBtn')
            )}
          </button>
        </form>

        {/* Toggle between modes */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
          {authMode === 'login' ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              {getT('noAccount')}{' '}
              <button onClick={() => setAuthMode('register')} className="gradient-text" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                {getT('switchToRegister')}
              </button>
            </p>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>
              {getT('hasAccount')}{' '}
              <button onClick={() => setAuthMode('login')} className="gradient-text" style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                {getT('switchToLogin')}
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
