import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin() {
    if (!email || !password) { setError('Please fill all fields'); return; }
    if (!supabase) {
      setError('Supabase connection error. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/');
    setLoading(false);
  }

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}>
      <div style={{ background:'#1a2744', padding:'2rem', borderRadius:'1rem', width:'100%', maxWidth:'400px' }}>
        <h2 style={{ textAlign:'center', color:'#00BCD4' }}>👤 Sign In</h2>
        {error && <p style={{ color:'red', textAlign:'center' }}>{error}</p>}
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width:'100%', padding:'0.75rem', marginBottom:'1rem', borderRadius:'0.5rem', border:'1px solid #00BCD4', background:'#0f1729', color:'white' }}
        />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width:'100%', padding:'0.75rem', marginBottom:'1rem', borderRadius:'0.5rem', border:'1px solid #00BCD4', background:'#0f1729', color:'white' }}
        />
        <button onClick={handleLogin} disabled={loading}
          style={{ width:'100%', padding:'0.75rem', background:'#00BCD4', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontSize:'1rem' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={{ textAlign:'center', marginTop:'1rem', color:'#aaa' }}>
          No account? <a href="/register" style={{ color:'#00BCD4' }}>Create one</a>
        </p>
      </div>
    </div>
  );
}
