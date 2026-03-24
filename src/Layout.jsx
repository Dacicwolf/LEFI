import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Wand2, Settings, Sun, Moon, ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { AnimatePresence, motion } from "framer-motion";
import { pushToStack, popFromStack, resetStack, canGoBack, saveScroll, getScroll } from "@/lib/navStore";
import { useAndroidBack } from "@/hooks/useAndroidBack";
// Icon is used via the `tabs` array below — no extra import needed.

const ROOT_PAGES = {
  Home: "/",
  SettingsPage: "/SettingsPage",
};

const tabs = [
  { name: "Home", label: "Generate", icon: Wand2 },
  { name: "SettingsPage", label: "Settings", icon: Settings },
];

const PAGE_TITLES = {
  Home: "Lefi (text-to-image)",
  SettingsPage: "Settings",
};

// Determine which tab owns a given page name
const TAB_ORDER = ["Home", "SettingsPage"];

function getTabIndex(pageName) {
  const tab = TAB_ORDER.find((t) => t === pageName);
  return TAB_ORDER.indexOf(tab ?? "Home");
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
    base44.auth.isAuthenticated().then((auth) => {
      if (!auth) base44.auth.redirectToLogin(window.location.pathname);
    });
  }, []);

  const isAndroid = /android/i.test(navigator.userAgent);

  // On Android: always follow system preference (WebView context — ignore localStorage).
  // On other platforms: honour saved user preference, then fall back to system.
  const [dark, setDark] = useState(() => {
    if (isAndroid) return window.matchMedia("(prefers-color-scheme: dark)").matches;
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // On Android, keep in sync with system preference changes
  useEffect(() => {
    if (!isAndroid) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [isAndroid]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    // Never persist theme preference on Android — system setting is the source of truth.
    if (!isAndroid) localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Navigation direction for animation
  const [direction, setDirection] = useState(1);
  const prevPageRef = useRef(currentPageName);
  // Track RR6 history index reactively so isRootPage updates on every nav
  const [rrIdx, setRrIdx] = useState(() => window.history.state?.idx ?? 0);
  const prevIdxRef = useRef(window.history.state?.idx ?? 0);

  // Sync nav stack + animation direction on every location change
  useEffect(() => {
    const currentRrIdx = window.history.state?.idx ?? 0;
    const prev = prevPageRef.current;
    const prevTabIdx = getTabIndex(prev);
    const currTabIdx = getTabIndex(currentPageName);

    if (currentPageName !== prev) {
      setDirection(currTabIdx >= prevTabIdx ? 1 : -1);
    }

    const tab = TAB_ORDER.find((t) => t === currentPageName) ?? TAB_ORDER[0];
    // Detect direction: if RR6 idx decreased we went back — pop; otherwise push.
    if (currentRrIdx < prevIdxRef.current) {
      popFromStack(tab);
    } else {
      pushToStack(tab, location.pathname);
    }

    prevIdxRef.current = currentRrIdx;
    prevPageRef.current = currentPageName;
    setRrIdx(currentRrIdx);
  }, [location.pathname, currentPageName]);

  // Scroll container ref for per-tab scroll save/restore
  const scrollContainerRef = useRef(null);

  // Save scroll on tab leave, restore on tab enter
  const prevTabRef = useRef(currentPageName);
  useEffect(() => {
    const prev = prevTabRef.current;
    if (prev !== currentPageName) {
      // Save scroll of leaving tab
      if (scrollContainerRef.current) {
        saveScroll(prev, scrollContainerRef.current.scrollTop);
      }
      // Restore scroll of entering tab via rAF for smooth perf on low-end devices
      const saved = getScroll(currentPageName);
      if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        requestAnimationFrame(() => { el.scrollTop = saved; });
      }
      prevTabRef.current = currentPageName;
    }
  }, [currentPageName]);

  const activeTab = TAB_ORDER.find((t) => t === currentPageName) ?? TAB_ORDER[0];

  // Update meta theme-color for status bar sync on theme toggle
  useEffect(() => {
    const themeColor = dark ? "#020617" : "#ffffff";
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'theme-color';
      document.head.appendChild(metaTag);
    }
    metaTag.content = themeColor;
  }, [dark]);

  // Unified Android hardware back button support
  useAndroidBack(activeTab);
  // Show back button if RR6 has history OR if we're on a child page (deep-linked).
  // Non-tab pages (e.g. ImageResult) are always children, even when rrIdx === 0.
  const isTabPage = TAB_ORDER.includes(currentPageName);
  const isRootPage = rrIdx <= 0 && isTabPage;
  const pageTitle = PAGE_TITLES[currentPageName] || currentPageName || "ImagineAI";

  // Android back button is fully handled by useAndroidBack hook above.

  // Delegate asset preloading to service worker for intelligent caching
  useEffect(() => {
    const preloadAssets = () => {
      const urls = [
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995fb83472e84f2aaa7251a/77a5e07ff_lefi_logo.png",
        "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/88cf9d6c2_lefi_logo_bronze.png",
        "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/451aba21c_lefi_logo_silver.png",
        "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/91cafad47_lefi_logo_gold.png",
        "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995fb83472e84f2aaa7251a/81138c58f_ITonAI.png",
      ];
      // Delegate to service worker for caching if available
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "PRELOAD_ASSETS",
          urls,
        });
      } else {
        // Fallback: preload locally if service worker unavailable
        urls.forEach((url) => { const img = new Image(); img.src = url; });
      }
    };
    const t = setTimeout(preloadAssets, 400);
    return () => clearTimeout(t);
  }, []);

  const handleTabClick = (tabName) => {
    if (currentPageName === tabName) {
      resetStack(tabName, ROOT_PAGES[tabName]);
      navigate(ROOT_PAGES[tabName], { replace: true });
    } else {
      navigate(ROOT_PAGES[tabName]);
    }
  };

  const pageVariants = {
    initial: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0, willChange: "transform" }),
    animate: { x: 0, opacity: 1, willChange: "transform", transition: { type: "tween", duration: 0.28, ease: "easeOut" } },
    exit: (dir) => ({
      x: dir > 0 ? "-40%" : "40%",
      opacity: 0,
      willChange: "transform",
      transition: { type: "tween", duration: 0.22, ease: "easeIn" },
    }),
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:bg-none dark:bg-slate-950 flex flex-col select-none overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)", overscrollBehavior: "none" }}
      role="application"
      aria-label="Lefi AI Image Generator Application"
    >
      <style>{`
        body { overscroll-behavior: none; background-color: transparent; }
        html.dark body { background-color: #020617; }
        /* Hide scrollbars globally while keeping functionality */
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center h-14 gap-3" style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }} role="banner">
        {!isRootPage && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 text-violet-600 dark:text-violet-400 select-none"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-base font-semibold flex-1">
          {currentPageName === "Home" ? (
            <span className="text-indigo-600">Lefi</span>
          ) : (
            <span className="text-slate-900 dark:text-white">{pageTitle}</span>
          )}
        </h1>
        <button
          onClick={() => setDark((d) => !d)}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:scale-110 active:scale-95 transition-all duration-200 select-none"
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Page content with transition animations */}
      <main ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden pb-20 relative" role="main">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPageName}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}
      >
        {tabs.map(({ name, label, icon: Icon }) => {
          const active = currentPageName === name;
          return (
            <button
              key={name}
              onClick={() => handleTabClick(name)}
              aria-label={`Navigate to ${label}`}
              aria-current={active ? "page" : undefined}
              className={`flex-1 flex flex-col items-center justify-center min-h-[56px] gap-0.5 transition-all duration-200 select-none ${
                active
                  ? "text-violet-600 dark:text-violet-400 scale-110"
                  : "text-slate-400 dark:text-slate-500 hover:text-violet-500 dark:hover:text-violet-400 hover:scale-110 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}