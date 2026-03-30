import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const doLogout = async () => {
  try {
    await base44.auth.logout('/');
  } catch(e) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('/');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    if (isRedirectingRef.current) return;

    setIsLoadingAuth(true);
    setAuthError(null);

    let currentUser = null;
    try {
      currentUser = await base44.auth.me();
    } catch (err) {
      currentUser = null;
    }
 AuthContext.jsx
    if (currentUser) {
      setUser(currentUser);
      setIsLoadingAuth(false);
    } else {
      isRedirectingRef.current = true;
      await doLogout();
    }
  };

  const logout = async () => {
    if (isRedirectingRef.current) return;
    isRedirectingRef.current = true;
    setUser(null);
    await doLogout();
  };

  const navigateToLogin = async () => {
    if (isRedirectingRef.current) return;
    isRedirectingRef.current = true;
    await doLogout();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState: checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
