
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@riviggy.com', password: 'admin123' });
    else setForm({ email: 'user@riviggy.com', password: 'user123' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'radial-gradient(ellipse at 30% 50%, rgba(132,204,22,0.06) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #FF8C42, #FF8C42)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '0 auto 16px', color: 'white', fontFamily: 'Syne', fontWeight: 800 }}>R</div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: '#1F2937', margin: '0 0 8px' }}>Welcome back</h1>
          <p style={{ color: '#6B7280', margin: 0 }}>Sign in to your riviggy account</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#6B7280', fontSize: 13, fontFamily: 'Syne', fontWeight: 600, marginBottom: 8 }}>EMAIL</label>
              <input className="input-field" style={{ width: '100%', padding: '12px 16px', fontSize: 15 }} type="email" placeholder="you@university.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#6B7280', fontSize: 13, fontFamily: 'Syne', fontWeight: 600, marginBottom: 8 }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" style={{ width: '100%', padding: '12px 48px 12px 16px', fontSize: 15 }} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280', fontSize: 16, lineHeight: 1 }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16 }}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Demo buttons */}
          <div style={{ marginTop: 20, padding: 16, background: '#FFFFFF', borderRadius: 12 }}>
            <p style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Syne', fontWeight: 600, margin: '0 0 10px' }}>DEMO ACCOUNTS</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => fillDemo('user')} style={{ flex: 1, padding: '8px', background: 'rgba(255,140,66,0.1)', border: '1px solid rgba(255,140,66,0.3)', borderRadius: 8, color: '#FF8C42', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 12 }}>User Demo</button>
              <button onClick={() => fillDemo('admin')} style={{ flex: 1, padding: '8px', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: 8, color: '#EC4899', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 600, fontSize: 12 }}>Admin Demo</button>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: '#6B7280', marginTop: 20, margin: '20px 0 0' }}>
            Don't have an account? <Link to="/register" style={{ color: '#FF8C42', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
