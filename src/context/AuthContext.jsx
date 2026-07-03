import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { hashPassword } from '../lib/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authConfig, setAuthConfig] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const config = await api.getAuthConfig();
        setAuthConfig(config);

        const authenticated = localStorage.getItem('auth_authenticated') === 'true';
        const rememberMe = localStorage.getItem('auth_remember_me') === 'true';
        const lastLogin = localStorage.getItem('auth_last_login');

        if (authenticated && lastLogin) {
          const now = Date.now();
          const loginTime = parseInt(lastLogin, 10);
          const hoursElapsed = (now - loginTime) / (1000 * 60 * 60);

          // If requireLoginEveryTime is true (or rememberMe is false), timeout is 4 hours
          // Otherwise, timeout is 48 hours (2 days)
          const timeoutHours = config?.requireLoginEveryTime || !rememberMe ? 4 : 48;

          if (hoursElapsed < timeoutHours) {
            setIsAuthenticated(true);
          } else {
            // Session expired
            logout();
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (password) => {
    if (!authConfig) return false;
    
    // If there is no password hash configured yet, accept any login and set it (first time setup)
    if (!authConfig.passwordHash) {
      const hash = await hashPassword(password);
      await updateConfig({ passwordHash: hash });
      completeLogin();
      return true;
    }

    const inputHash = await hashPassword(password);
    if (inputHash === authConfig.passwordHash) {
      completeLogin();
      return true;
    }
    return false;
  };

  const completeLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('auth_authenticated', 'true');
    localStorage.setItem('auth_last_login', Date.now().toString());
    
    // Sync local storage remember_me with config
    if (authConfig) {
      localStorage.setItem('auth_remember_me', (!authConfig.requireLoginEveryTime).toString());
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('auth_authenticated');
    localStorage.removeItem('auth_last_login');
  };

  const updateConfig = async (updates) => {
    try {
      const newConfig = { ...authConfig, ...updates };
      await api.updateAuthConfig(newConfig);
      setAuthConfig(newConfig);
      
      // Update local preference
      if (updates.requireLoginEveryTime !== undefined) {
        localStorage.setItem('auth_remember_me', (!updates.requireLoginEveryTime).toString());
      }
    } catch (err) {
      console.error("Failed to update auth config", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        authConfig,
        login,
        logout,
        updateConfig
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
