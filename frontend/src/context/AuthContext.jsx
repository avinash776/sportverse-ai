// ==================================================
// SportVerse AI - Authentication Context
// ==================================================
// Provides authentication state (user, token, login, logout)
// to all components throughout the app via React Context.
// ==================================================

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { checkGoogleRedirectResult, signInWithGoogle } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('sportverse_token'));

  // Load user on mount if token exists, and check for Google redirect result
  useEffect(() => {
    const loadUser = async () => {
      // Check if returning from a Google redirect sign-in (with 5s timeout)
      try {
        const redirectPromise = checkGoogleRedirectResult();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firebase redirect check timed out')), 5000)
        );
        const redirectResult = await Promise.race([redirectPromise, timeoutPromise]);
        if (redirectResult) {
          const res = await api.post('/auth/google/firebase', {
            idToken: redirectResult.idToken,
            name: redirectResult.user.name,
            email: redirectResult.user.email,
            photo: redirectResult.user.photo,
          });
          const { token: newToken, user: newUser } = res.data;
          localStorage.setItem('sportverse_token', newToken);
          localStorage.setItem('sportverse_user', JSON.stringify(newUser));
          setToken(newToken);
          setUser(newUser);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Google redirect check error:', err);
      }

      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch {
          // Token invalid, clear it
          localStorage.removeItem('sportverse_token');
          localStorage.removeItem('sportverse_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Register with email/password
  const register = useCallback(async (email, password, name, role = 'player') => {
    try {
      const res = await api.post('/auth/register', { email, password, name, role });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('sportverse_token', newToken);
      localStorage.setItem('sportverse_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      toast.success('Registration successful! Welcome to SportVerse AI! 🎉');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Login with email/password
  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('sportverse_token', newToken);
      localStorage.setItem('sportverse_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      toast.success(`Welcome back, ${newUser.name}! 👋`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Handle Google OAuth callback (legacy — kept for URL-based flow)
  const handleGoogleCallback = useCallback(async (newToken) => {
    try {
      localStorage.setItem('sportverse_token', newToken);
      setToken(newToken);
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      localStorage.setItem('sportverse_user', JSON.stringify(res.data.user));
      toast.success(`Welcome, ${res.data.user.name}! 🎉`);
      return { success: true };
    } catch (error) {
      toast.error('Google login failed');
      return { success: false };
    }
  }, []);

  // Firebase Google Sign-In (popup-based)
  const loginWithGoogle = useCallback(async () => {
    try {
      const googleResult = await signInWithGoogle();
      // If null, redirect flow was triggered — page will reload
      if (!googleResult) return { success: true };
      const { idToken, user: googleUser } = googleResult;
      // Send Firebase ID token to backend to get SportVerse JWT
      const res = await api.post('/auth/google/firebase', {
        idToken,
        name: googleUser.name,
        email: googleUser.email,
        photo: googleUser.photo,
      });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('sportverse_token', newToken);
      localStorage.setItem('sportverse_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      toast.success(`Welcome, ${newUser.name}! 🎉`);
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.error || error.message || 'Google sign-in failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('sportverse_token');
    localStorage.removeItem('sportverse_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  // Update user profile in context
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('sportverse_user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user, token, loading,
    login, register, logout,
    loginWithGoogle, handleGoogleCallback, updateUser,
    isAuthenticated: !!user,
    isCoach: user?.role === 'coach' || user?.role === 'admin',
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
