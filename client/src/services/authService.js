// Frontend Service Layer - API Calls
import { API_BASE_URL } from '../constants/appConstants';

class AuthService {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getStoredToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }
}

export default new AuthService();
