import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const doLogout = () => {
  try {
    // Stergem tokenul manual
    localStorage.removeItem('base44_access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('base44_from_url');
    localStorage.removeItem('base44_from__url');
    sessionStorage.clear();
  } catch(e) {}
  // Redirect curat la root — SDK-ul va detecta ca nu esti autentificat
  // si va face redirect la login cu from_url=https://lefi.base44.app/ (corect)
  window.location.replace('https://lefi.base44.app/');
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

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const currentUser = await base44.auth.me();

        if (currentUser) {
          setUser(currentUser);
          setIsLoadingAuth(false);
          return;
        }

        break;

      } catch (err) {
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }

    if (!isRedirectingRef.current) {
      isRedirectingRef.current = true;
      setAuthError({ type: 'auth_required' });
      base44.auth.redirectToLogin('/');
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