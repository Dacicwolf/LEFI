import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { lazy, Suspense, useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';

const ImageResult = lazy(() => import('./pages/ImageResult'));
const Gallery = lazy(() => import('./pages/Gallery'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin" />
  </div>
);

const { Pages, Layout } = pagesConfig;
const Home = Pages['Home'];

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

const AuthenticatedApp = () => {
  const { isLoadingAuth, user } = useAuth();
  const [showSplash, setShowSplash] = useState(isMobile);

  useEffect(() => {
    if (!isLoadingAuth) {
      // Minim 1.8s splash pe mobil pentru experiență completă
      const timer = setTimeout(() => setShowSplash(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isLoadingAuth]);

  if (isMobile && showSplash) {
    return <SplashScreen visible={showSplash} />;
  }

  if (isLoadingAuth) {
    return <PageLoader />;
  }

  if (!user) {
    // SDK-ul va face redirect — nu facem nimic noi
    return <PageLoader />;
  }

  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<PageLoader />}>
          <LayoutWrapper currentPageName="Home"><Home /></LayoutWrapper>
        </Suspense>
      } />
      {Object.entries(Pages).filter(([path]) => path !== 'Home').map(([path, Page]) => (
        <Route key={path} path={`/${path}`} element={
          <Suspense fallback={<PageLoader />}>
            <LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>
          </Suspense>
        } />
      ))}
      <Route path="/ImageResult" element={<Suspense fallback={<PageLoader />}><ImageResult /></Suspense>} />
      <Route path="/AdminPanel" element={<Suspense fallback={<PageLoader />}><LayoutWrapper currentPageName="AdminPanel"><AdminPanel /></LayoutWrapper></Suspense>} />
      <Route path="/payment-success" element={<Suspense fallback={<PageLoader />}><LayoutWrapper currentPageName="PaymentSuccess"><PaymentSuccess /></LayoutWrapper></Suspense>} />
      <Route path="/Gallery" element={<Suspense fallback={<PageLoader />}><LayoutWrapper currentPageName="Gallery"><Gallery /></LayoutWrapper></Suspense>} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
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