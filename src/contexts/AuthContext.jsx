import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // If we had a /me endpoint, we'd fetch the user profile here.
          // Since the login returns user, we can either extract from JWT or require a new login if refreshed
          // For now, assume if token exists, we are authenticated, but normally we'd decode token or fetch /me

          // Basic mock user restoration: (Ideally we decode jwt to get ID, or we store user object in localstorage)
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            // Decoding or fetching would go here
            setUser({ id: "restored" });
          }
        } catch (err) {
          console.error("Failed to restore session", err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for custom logout events from Axios Interceptor
    const handleLogoutEvent = () => logout();
    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => window.removeEventListener('auth-logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      const { accessToken, refreshToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

      // Update API defaults for the current session
      api.defaults.headers.common['authorization'] = `Bearer ${accessToken}`;
      api.defaults.headers.common['accesstoken'] = accessToken;

      return { success: true };
    } catch (err) {
      console.error('Login error', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
