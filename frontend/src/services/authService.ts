import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
 return config;
});

export const authService = {
  async login(username: string, password: string) {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  async register(username: string, email: string, password: string, confirmPassword: string) {
    const response = await api.post('/auth/register', { username, email, password, confirmPassword });
    return response.data;
  },

  async getProfile(token: string) {
    // Use the configured api instance instead of direct axios call
    const response = await api.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
 },

  async logout() {
    // In a real app, you might want to notify the server about logout
    // For now, we just remove the token
    localStorage.removeItem('token');
  },
};