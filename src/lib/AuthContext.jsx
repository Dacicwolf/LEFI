import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const doLogout = () => {
  try {
    localStorage.removeItem('base44_access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('base44_from_url');
    localStorage.removeItem('base44_from__url');
    sessionStorage.clear();
  } catch(e) {}
  window.location.href = 'https://lefi.base44.app/';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // true pana stim sigur
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    if (isRedirectingRef.current) return;

    // Verificam imediat daca exista token in localStorage
    // Daca nu e token, nu are rost sa apelam me() — facem redirect direct
    const hasToken = !!localStorage.getItem('base44_access_token') || !!localStorage.getItem('token');
    if (!hasToken) {
      isRedirectingRef.current = true;
      // Ramanem pe spinner (isLoadingAuth=true) si facem redirect
      doLogout();
      return;
    }

    setIsLoadingAuth(true);
    setAuthError(null);

    let currentUser = null;
    try {
      currentUser = await base44.auth.me();
    } catch (err) {
      currentUser = null;
    }

    if (currentUser) {
      setUser(currentUser);
      setIsLoadingAuth(false);
    } else {
      // Token exista dar invalid — stergem si redirectam
      if (!isRedirectingRef.current) {
        isRedirectingRef.current = true;
        doLogout();
      }
    }
  };

  const logout = () => {
    if (isRedirectingRef.current) return;
    isRedirectingRef.current = true;
    setUser(null);
    doLogout();
  };

  const navigateToLogin = () => {
    if (isRedirectingRef.current) return;
    isRedirectingRef.current = true;
    doLogout();
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