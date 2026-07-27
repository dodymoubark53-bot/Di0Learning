import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { Key, Mail, Lock, Sparkles, Database, Eye, EyeOff, Loader } from 'lucide-react';

export default function Auth({ initialMode = 'login' }) {
  const { lang, t, addToast, loginUser, registerUser, user, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  // Tab: 'login' | 'register'
  const [authMode, setAuthMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Credentials state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local translations
  const authT = {
    en: {
      loginTitle: 'Sign In to Your Account',
      registerTitle: 'Create New Account',
      nameLabel: 'Full Name / Display Name',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      confirmPasswordLabel: 'Confirm Password',
      loginBtn: 'Sign In',
      registerBtn: 'Create Account',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      switchToRegister: 'Create one here',
      switchToLogin: 'Sign in here',
      passwordsMismatch: 'Passwords do not match.',
      loginSuccess: 'Signed in successfully!',
      registerSuccess: 'Account created successfully!',
      authError: 'Authentication failed: '
    },
    ar: {
      loginTitle: 'تسجيل الدخول إلى حسابك',
      registerTitle: 'إنشاء حساب جديد',
      nameLabel: 'الاسم بالكامل / الاسم المستعار',
      emailLabel: 'البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      confirmPasswordLabel: 'تأكيد كلمة المرور',
      loginBtn: 'دخول',
      registerBtn: 'إنشاء الحساب',
      noAccount: 'ليس لديك حساب؟',
      hasAccount: 'لديك حساب بالفعل؟',
      switchToRegister: 'أنشئ حساباً جديداً',
      switchToLogin: 'سجل دخولك هنا',
      passwordsMismatch: 'كلمتا المرور غير متطابقتين.',
      loginSuccess: 'تم تسجيل الدخول بنجاح!',
      registerSuccess: 'تم إنشاء الحساب بنجاح!',
      authError: 'فشل المصادقة: '
    }
  };

  const getT = (key) => authT[lang]?.[key] || authT['en']?.[key] || key;

  // Handle Log In / Register
  const handleAuth = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      addToast(lang === 'ar' ? 'يرجى ملء البريد الإلكتروني وكلمة المرور.' : 'Please fill in email and password.', 'error');
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

        const success = await registerUser(name || email.split('@')[0], email, password);
        if (success) {
          navigate('/');
        }
      } else {
        const success = await loginUser(email, password);
        if (success) {
          navigate('/');
        }
      }
    } catch (err) {
      console.error(err);
      addToast(getT('authError') + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, show Account Profile status screen with Sign Out option
  if (user) {
    return (
      <div className="crop-overlay-container" style={{ position: 'fixed', padding: '20px', background: 'var(--bg-primary)' }}>
        <div className="glass-card" style={{ maxWidth: '460px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', padding: '36px', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.8rem',
            margin: '0 auto'
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{user.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</p>
            <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.75rem', background: 'rgba(0,242,254,0.15)', color: 'var(--accent-cyan)', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>
              {lang === 'ar' ? 'مساحة بيانات خاصة بالمعرف: ' : 'Isolated Account Space: '} {user.id}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              {lang === 'ar' ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
            </button>
            <button className="btn btn-danger" onClick={logoutUser}>
              {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            </button>
          </div>
        </div>
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
          {authMode === 'register' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">{getT('nameLabel')}</label>
              <input
                type="text"
                className="form-input"
                placeholder={lang === 'ar' ? 'أدخل اسمك هنا' : 'Your name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

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
