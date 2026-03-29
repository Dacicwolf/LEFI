import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

// Sterge tot si du-te la login FARA from_url
const doLogout = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch(e) {}
  // Mergem direct la pagina de login a Base44 fara niciun from_url
  // Astfel dupa login, Base44 va trimite la root-ul app-ului (default)
  window.location.replace('https://lefi.base44.app/login');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    // Daca suntem pe pagina /login, nu facem nimic — lasam login-ul sa lucreze
    if (window.location.pathname.includes('/login')) {
      setIsLoadingAuth(false);
      return;
    }
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

    if (currentUser) {
      setUser(currentUser);
      setIsLoadingAuth(false);
    } else {
      isRedirectingRef.current = true;
      // Nu facem setIsLoadingAuth(false) — ramanem pe spinner pana se face redirect
      doLogout();
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