import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

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

    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const currentUser = await [base44.auth.me](https://base44.auth.me)();

        if (currentUser) {
          setUser(currentUser);
          setIsLoadingAuth(false);
          return;
        }

        break;

      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }

    if (!isRedirectingRef.current) {
      isRedirectingRef.current = true;
      setAuthError({ type: 'auth_required' });
      base44.auth.redirectToLogin();
    }
  };

  const logout = () => {
    if (isRedirectingRef.current) return;
    isRedirectingRef.current = true;
    setUser(null);
    base44.auth.redirectToLogin();
  };

  const navigateToLogin = () => {
    if (isRedirectingRef.current) return;
    isRedirectingRef.current = true;
    base44.auth.redirectToLogin();
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
