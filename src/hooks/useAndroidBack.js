import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { canGoBack } from "@/lib/navStore";

const isAndroid = /android/i.test(navigator.userAgent);

/**
 * useAndroidBack — unified hook for Android hardware back button support.
 *
 * Strategy:
 *  1. On Android, keep a sentinel history entry at the top of the browser stack
 *     so the hardware back button fires `popstate` instead of exiting the WebView.
 *  2. When `popstate` fires and our navStore stack has entries, we consume the event,
 *     navigate(-1) via React Router, and immediately re-push the sentinel so the
 *     next back press is also intercepted.
 *  3. When the navStore stack is exhausted, we do NOT re-push the sentinel —
 *     the next hardware back press exits the WebView naturally (correct behaviour).
 *
 * On non-Android platforms this hook is a no-op, so browser navigation is unaffected.
 */
export function useAndroidBack(currentTab) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAndroid) return;

    // Push the sentinel so the hardware back button has something to pop.
    window.history.pushState({ sentinel: true }, "");

    const handlePopState = (e) => {
      if (canGoBack(currentTab)) {
        // Consume this pop: navigate back inside the app and re-arm the sentinel.
        navigate(-1);
        window.history.pushState({ sentinel: true }, "");
      }
      // If stack is empty — don't re-push, hardware back will close WebView.
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentTab, navigate]);
}