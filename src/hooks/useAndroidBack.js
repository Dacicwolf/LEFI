import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { canGoBack, popFromStack } from "@/lib/navStore";

const isAndroid = /android/i.test(navigator.userAgent);

/**
 * useAndroidBack — Android hardware back button support.
 *
 * Strategy (no sentinel, fully RR6-compatible):
 *
 * React Router 6 sets `window.history.state.idx` on every navigation.
 * When idx > 0, RR6 owns the history stack and its own popstate listener
 * will fire `navigate(-1)` — we do nothing.
 *
 * When idx === 0 (RR6 thinks we're at the root) but our navStore still has
 * entries (e.g. the user deep-linked in), we intercept popstate and
 * navigate to the previous navStore path directly, keeping RR6 in sync.
 *
 * When both are exhausted the event goes unhandled and the WebView exits — correct.
 *
 * Non-Android: complete no-op.
 */
export function useAndroidBack(currentTab) {
  const navigate = useNavigate();
  // Use a ref to snapshot the idx at listener-bind time, avoiding stale
  // closures and async race conditions on rapid back-button presses.
  const idxRef = useRef(window.history.state?.idx ?? 0);

  useEffect(() => {
    if (!isAndroid) return;

    const handlePopState = () => {
      const rrIdx = window.history.state?.idx ?? 0;
      // Always keep ref current so subsequent presses have accurate baseline.
      idxRef.current = rrIdx;

      // RR6 has history — let it handle this popstate naturally.
      if (rrIdx > 0) return;

      // RR6 is at root but our stack has entries — navigate manually.
      if (canGoBack(currentTab)) {
        const prev = popFromStack(currentTab);
        if (prev) navigate(prev, { replace: true });
      }
      // Both exhausted — WebView exits naturally. No action needed.
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentTab, navigate]);
}