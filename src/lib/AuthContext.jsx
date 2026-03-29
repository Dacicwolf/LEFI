import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 800;

// Helper: wait for the SDK to process any OAuth callback params in the URL
// On Android WebView, the redirect happens inside the same WebView, so we need
// to give the SDK a tick to handle the hash/search params before calling me().
function waitForSDKReady() {
  return new Promise((resolve) => {
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    const hasOAuthParams =
      search.includes('code=') ||
      search.includes('token=') ||
      search.includes('access_token=') ||
      hash.includes('access_token=') ||
      hash.includes('token=');

    if (hasOAuthParams) {
      setTimeout(resolve, 600);
    } else {
      resolve();
    }
  });
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const isRedirectingRef = useRef(false);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    if (isRedirectingRef.current) return;
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    setIsLoadingAuth(true);
    setAuthError(null);

    await waitForSDKReady();

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