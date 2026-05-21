
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavLink = ({ to, children }) => {
    const active = location.pathname === to;
    return (
      <Link to={to} className={`text-sm font-display font-600 transition-colors ${active ? 'text-orange-DEFAULT' : 'text-gray-400 hover:text-white'}`}>
        {children}
      </Link>
    );
  };

  return (
    <nav style={{ background: '#FFFFFF', borderBottom: '1px solid #D9C9AE', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, overflow: 'visible' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 80 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', width: 160, height: 80, overflow: 'hidden' }}>
          <img
            src="/logo.jpeg"
            alt="Riviggy logo"
            style={{
              width: 160,
              height: 80,
              objectFit: 'cover',
              objectPosition: 'center 58%',
              display: 'block',
              mixBlendMode: 'multiply'
            }}
          />
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {user && (
            <>
              <Link to="/" style={{ color: location.pathname === '/' ? '#FF8C42' : '#6B7280', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 600, fontSize: 20 }}>Home</Link>
              <Link to="/orders" style={{ color: location.pathname === '/orders' ? '#FF8C42' : '#6B7280', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 600, fontSize: 20 }}>Orders</Link>
              <Link to="/group-orders" style={{ color: location.pathname.startsWith('/group') ? '#FF8C42' : '#6B7280', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 600, fontSize: 20 }}>Group Order</Link>
              <a href="http://localhost:5000/api/dineout" style={{ color: location.pathname === '/dineout' ? '#FF8C42' : '#6B7280', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 600, fontSize: 20 }}>🍽️ Dineout</a>
            </>
          )}
        </div>

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user ? (
            <>
              {/* Cart button */}
              <Link to="/cart" style={{ position: 'relative', background: '#FFFDF8', border: '1px solid #D9C9AE', borderRadius: 12, padding: '8px 16px', color: '#1F2937', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontFamily: 'Syne', fontWeight: 600, transition: 'all 0.2s' }}>
                <span>🛒 Cart</span>
                {totalItems > 0 && (
                  <span style={{ background: '#FF8C42', color: 'white', borderRadius: 10, padding: '1px 7px', fontSize: 12, fontWeight: 700 }}>{totalItems}</span>
                )}
              </Link>

              {/* User menu */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFFDF8', border: '1px solid #D9C9AE', borderRadius: 12, padding: '6px 12px', cursor: 'pointer' }}>
                  <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ color: '#1F2937', fontFamily: 'Syne', fontWeight: 600, fontSize: 14 }}>{user.name.split(' ')[0]}</span>
                  <span style={{ color: '#6B7280', fontSize: 10 }}>▼</span>
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: '#FFFDF8', border: '1px solid #D9C9AE', borderRadius: 12, padding: 8, minWidth: 180, zIndex: 200 }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #D9C9AE', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{user.email}</div>
                      {user.role === 'admin' && <span className="badge badge-orange" style={{ marginTop: 4 }}>Admin</span>}
                    </div>
                    <button onClick={() => { navigate('/orders'); setMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', borderRadius: 8, fontSize: 14, fontFamily: 'Syne' }}>My Orders</button>
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', borderRadius: 8, fontSize: 14, fontFamily: 'Syne', fontWeight: 700 }}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid #D9C9AE', color: '#1F2937', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 600, fontSize: 14 }}>Login</Link>
              <Link to="/register" style={{ padding: '8px 20px', borderRadius: 10, background: '#FF8C42', color: 'white', textDecoration: 'none', fontFamily: 'Syne', fontWeight: 600, fontSize: 14 }}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
