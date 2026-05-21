
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'radial-gradient(ellipse at 70% 30%, rgba(255,140,66,0.06) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #FF8C42, #FF8C42)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '0 auto 16px', color: 'white', fontFamily: 'Syne', fontWeight: 800 }}>R</div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: '#1F2937', margin: '0 0 8px' }}>Join riviggy</h1>
          <p style={{ color: '#6B7280', margin: 0 }}>Create your account and start craving</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'FULL NAME', type: 'text', placeholder: 'Your name' },
              { key: 'email', label: 'EMAIL', type: 'email', placeholder: 'you@university.edu' },
              { key: 'password', label: 'PASSWORD', type: 'password', placeholder: '••••••••' },
              { key: 'confirm', label: 'CONFIRM PASSWORD', type: 'password', placeholder: '••••••••' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', color: '#6B7280', fontSize: 13, fontFamily: 'Syne', fontWeight: 600, marginBottom: 8 }}>{field.label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field"
                    style={{ width: '100%', padding: field.key === 'password' || field.key === 'confirm' ? '12px 48px 12px 16px' : '12px 16px', fontSize: 15 }}
                    type={field.key === 'password' ? (showPassword ? 'text' : 'password') : field.key === 'confirm' ? (showConfirm ? 'text' : 'password') : field.type}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm({...form, [field.key]: e.target.value})}
                    required
                  />
                  {(field.key === 'password' || field.key === 'confirm') && (
                    <button
                      type="button"
                      onClick={() => field.key === 'password' ? setShowPassword((prev) => !prev) : setShowConfirm((prev) => !prev)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7280', fontSize: 16, lineHeight: 1 }}
                      aria-label={field.key === 'password' ? (showPassword ? 'Hide password' : 'Show password') : (showConfirm ? 'Hide confirm password' : 'Show confirm password')}
                    >
                      {(field.key === 'password' ? showPassword : showConfirm) ? '🙈' : '👁'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, marginTop: 6 }}>
              {loading ? '⏳ Creating account...' : 'Create Account →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', color: '#6B7280', marginTop: 20, margin: '20px 0 0' }}>
            Already have an account? <Link to="/login" style={{ color: '#FF8C42', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
