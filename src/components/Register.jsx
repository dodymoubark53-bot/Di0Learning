import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister() {
    if (!email || !password) { setError('Please fill all fields'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    // Auto login after register
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (!loginError) navigate('/');
    setLoading(false);
  }

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}>
      <div style={{ background:'#1a2744', padding:'2rem', borderRadius:'1rem', width:'100%', maxWidth:'400px' }}>
        <h2 style={{ textAlign:'center', color:'#00BCD4' }}>✨ Create Account</h2>
        {error && <p style={{ color:'red', textAlign:'center' }}>{error}</p>}
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width:'100%', padding:'0.75rem', marginBottom:'1rem', borderRadius:'0.5rem', border:'1px solid #00BCD4', background:'#0f1729', color:'white' }}
        />
        <input type="password" placeholder="Password (min 6 chars)" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width:'100%', padding:'0.75rem', marginBottom:'1rem', borderRadius:'0.5rem', border:'1px solid #00BCD4', background:'#0f1729', color:'white' }}
        />
        <input type="password" placeholder="Confirm password" value={confirm}
          onChange={e => setConfirm(e.target.value)}
          style={{ width:'100%', padding:'0.75rem', marginBottom:'1rem', borderRadius:'0.5rem', border:'1px solid #00BCD4', background:'#0f1729', color:'white' }}
        />
        <button onClick={handleRegister} disabled={loading}
          style={{ width:'100%', padding:'0.75rem', background:'#00BCD4', color:'white', border:'none', borderRadius:'0.5rem', cursor:'pointer', fontSize:'1rem' }}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
        <p style={{ textAlign:'center', marginTop:'1rem', color:'#aaa' }}>
          Have an account? <a href="/login" style={{ color:'#00BCD4' }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
