import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/ErrorBoundary';
import React, { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));

const ImageResult = lazy(() => import('./pages/ImageResult'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));


const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
  </div>
);

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Use effect to redirect — never call navigateToLogin during render to avoid loops
  React.useEffect(() => {
    if (!isLoadingAuth && !isLoadingPublicSettings && authError?.type === 'auth_required') {
      navigateToLogin();
    }
  }, [isLoadingAuth, isLoadingPublicSettings, authError]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      return null; // useEffect above handles redirect
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<PageLoader />}>
          <LayoutWrapper currentPageName="Home">
            <Home />
          </LayoutWrapper>
        </Suspense>
      } />
      {Object.entries(Pages).filter(([path]) => path !== 'Home').map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <Suspense fallback={<PageLoader />}>
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            </Suspense>
          }
        />
      ))}
      <Route path="/ImageResult" element={<Suspense fallback={<PageLoader />}><LayoutWrapper currentPageName="ImageResult"><ImageResult /></LayoutWrapper></Suspense>} />
      <Route path="/AdminPanel" element={<Suspense fallback={<PageLoader />}><LayoutWrapper currentPageName="AdminPanel"><AdminPanel /></LayoutWrapper></Suspense>} />
      <Route path="/payment-success" element={<Suspense fallback={<PageLoader />}><LayoutWrapper currentPageName="PaymentSuccess"><PaymentSuccess /></LayoutWrapper></Suspense>} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } }
  }));

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <NavigationTracker />
          <ErrorBoundary>
            <AuthenticatedApp />
          </ErrorBoundary>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App