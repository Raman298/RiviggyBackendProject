
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Optionally verify token
      authAPI.getMe()
        .then(res => setUser(res.data.user))
        .catch(() => { sessionStorage.clear(); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    toast.success(`Welcome back, ${user.name}!`);
    return user;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token, user } = res.data;
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    toast.success(`Welcome to riviggy, ${user.name}!`);
    return user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (_error) {
      // Continue clearing local auth state even if server logout fails.
    }
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
