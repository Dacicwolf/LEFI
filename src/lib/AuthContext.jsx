import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

const clearStorage = () => {
  try {
    localStorage.removeItem('base44_access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('base44_from_url');
    localStorage.removeItem('base44_from__url');
    sessionStorage.clear();
  } catch(e) {}
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

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        currentUser = await base44.auth.me();
        if (currentUser) break;
        // me() a returnat null — nu are rost sa reincercam
        break;
      } catch (err) {
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }

    if (currentUser) {
      setUser(currentUser);
      setIsLoadingAuth(false);
    } else {
      // Nu e autentificat — redirect la login
      if (!isRedirectingRef.current) {
        isRedirectingRef.current = true;
        setAuthError({ type: 'auth_required' });
        base44.auth.redirectToLogin('/');
      }
    }
  };

  const logout = () => {
    if (isRedirectingRef.current) return;
    isRedirectingRef.current = true;
    setUser(null);
    clearStorage();
    base44.auth.redirectToLogin('/');
  };

  const navigateToLogin = () => {
    if (isRedirectingRef.current) return;
    isRedirectingRef.current = true;
    clearStorage();
    base44.auth.redirectToLogin('/');
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