import React from 'react';

/**
 * ErrorBoundary - Catches runtime exceptions and logs them.
 * Prevents white-screen crashes and provides user feedback.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Optional: Send to external logging service here
    // Example: logToSentry(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950 z-[9999]">
          <div className="bg-slate-900 rounded-2xl border border-red-800 p-8 max-w-md text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-slate-300 text-sm mb-6">An unexpected error occurred. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-6 py-2 font-medium transition-colors"
            >
              Refresh Page
            </button>
            <p className="text-slate-500 text-xs mt-4 font-mono break-all">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}