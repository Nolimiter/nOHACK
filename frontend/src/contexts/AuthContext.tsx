import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../services/authService';

interface AuthContextType {
  user: any;
  token: string | null;
 isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on initial load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Verify token and get user info
        const userData = await authService.getProfile(token);
        setUser(userData.user);
        setToken(token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      // Token is invalid or expired, clear it
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login(username, password);
      const { user: userData, token: newToken } = response;

      // Store token in localStorage
      localStorage.setItem('token', newToken);

      // Update state
      setUser(userData);
      setToken(newToken);
      setIsAuthenticated(true);

      // Redirect to dashboard
      router.push('/game/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authService.register(username, email, password);
      const { user: userData, token: newToken } = response;

      // Store token in localStorage
      localStorage.setItem('token', newToken);

      // Update state
      setUser(userData);
      setToken(newToken);
      setIsAuthenticated(true);

      // Redirect to dashboard
      router.push('/game/dashboard');
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
 };

  const logout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');

    // Update state
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);

    // Redirect to home page
    router.push('/');
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}