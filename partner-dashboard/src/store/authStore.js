import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');

      localStorage.setItem('token', data.token);
      set({ token: data.token, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  register: async (partnerData) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('http://localhost:5000/api/auth/register/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Registration failed');

      localStorage.setItem('token', data.token);
      set({ token: data.token, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'x-auth-token': token },
      });
      const data = await res.json();
      if (!res.ok) {
        localStorage.removeItem('token');
        set({ token: null, isAuthenticated: false, user: null });
        return;
      }
      set({ user: data, isAuthenticated: true });
    } catch (err) {
      console.error(err);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false, user: null });
  },
}));
