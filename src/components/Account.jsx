import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, LogOut, Loader } from 'lucide-react';

export default function Account() {
  const { lang, addToast } = useContext(AppContext);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = {
    en: {
      title: 'Account Management',
      email: 'Email Address',
      memberSince: 'Member Since',
      signOut: 'Sign Out',
      loading: 'Loading profile...',
      noUser: 'No user found. Please sign in.',
      profileSection: 'User Profile Summary'
    },
    ar: {
      title: 'إدارة الحساب',
      email: 'البريد الإلكتروني',
      memberSince: 'عضو منذ',
      signOut: 'تسجيل الخروج',
      loading: 'جاري تحميل الملف الشخصي...',
      noUser: 'لم يتم العثور على مستخدم. يرجى تسجيل الدخول.',
      profileSection: 'ملخص الملف الشخصي'
    }
  };

  const getT = (key) => t[lang]?.[key] || t['en']?.[key] || key;

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setCurrentUser(user);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      addToast(lang === 'ar' ? 'تم تسجيل الخروج بنجاح!' : 'Signed out successfully!', 'info');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-cyan)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>{getT('loading')}</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--accent-danger)', marginBottom: '20px' }}>{getT('noUser')}</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</button>
      </div>
    );
  }

  // Generate avatar initial
  const avatarLetter = currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U';
  const joinDate = currentUser.created_at 
    ? new Date(currentUser.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', animation: 'fadeIn 0.4s ease-out' }}>
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '40px' }}>
        
        {/* Avatar */}
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          fontWeight: 800,
          color: '#ffffff',
          boxShadow: 'var(--shadow-glow), var(--shadow-premium)',
          border: '3px solid var(--border-color)'
        }}>
          {avatarLetter}
        </div>

        {/* User details */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-secondary)' }}>
            {getT('profileSection')}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <Mail size={20} color="var(--accent-cyan)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                {getT('email')}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentUser.email}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <Calendar size={20} color="var(--accent-violet)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                {getT('memberSince')}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {joinDate}
              </span>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button 
          className="btn btn-danger" 
          onClick={handleSignOut} 
          style={{ width: '100%', gap: '10px', height: '46px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <LogOut size={18} /> {getT('signOut')}
        </button>

      </div>
    </div>
  );
}
