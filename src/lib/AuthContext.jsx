import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    base44.auth.me()
      .then((currentUser) => {
        if (currentUser) {
          setUser(currentUser);
        } else {
          setAuthError({ type: 'auth_required' });
        }
      })
      .catch(() => {
        setAuthError({ type: 'auth_required' });
      })
      .finally(() => {
        setIsLoadingAuth(false);
      });
  }, []);

  const logout = () => {
    setUser(null);
    // Clear stored tokens before redirecting
    try {
      localStorage.removeItem('base44_access_token');
      localStorage.removeItem('token');
    } catch(e) {}
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin: () => { window.location.href = '/'; },
      checkAppState: () => {},
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