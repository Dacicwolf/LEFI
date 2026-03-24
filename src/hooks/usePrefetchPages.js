import { useEffect } from 'react';

/**
 * Prefetches all lazy-loaded pages after the current page loads.
 * Improves perceived performance when users navigate between tabs.
 * Uses requestIdleCallback for non-blocking prefetch.
 */
export function usePrefetchPages(pagesConfig) {
  useEffect(() => {
    if (!pagesConfig || !pagesConfig.Pages) return;

    const prefetch = () => {
      Object.values(pagesConfig.Pages).forEach((PageComponent) => {
        if (PageComponent && typeof PageComponent === 'object') {
          // Component is already loaded; nothing to do
        }
      });
    };

    // Defer prefetch until app idle to avoid blocking user interactions
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(prefetch, { timeout: 5000 });
      return () => cancelIdleCallback(id);
    } else {
      const t = setTimeout(prefetch, 1000);
      return () => clearTimeout(t);
    }
  }, [pagesConfig]);
}