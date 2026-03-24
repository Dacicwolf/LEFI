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

  // On Android: always follow system preference. On other platforms: allow manual toggle.
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
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Navigation direction for animation
  const [direction, setDirection] = useState(1);
  const prevPageRef = useRef(currentPageName);

  // Sync nav stack + animation direction on every location change
  useEffect(() => {
    const prev = prevPageRef.current;
    const prevIdx = getTabIndex(prev);
    const currIdx = getTabIndex(currentPageName);
    if (currentPageName !== prev) {
      setDirection(currIdx >= prevIdx ? 1 : -1);
    }
    const tab = TAB_ORDER.find((t) => t === currentPageName) ?? TAB_ORDER[0];
    pushToStack(tab, location.pathname);
    prevPageRef.current = currentPageName;
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
      // Restore scroll of entering tab
      const saved = getScroll(currentPageName);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = saved;
      }
      prevTabRef.current = currentPageName;
    }
  }, [currentPageName]);

  const activeTab = TAB_ORDER.find((t) => t === currentPageName) ?? TAB_ORDER[0];

  // Unified Android hardware back button support
  useAndroidBack(activeTab);
  // Use RR6-managed history index: idx === 0 means we're at the stack root.
  const isRootPage = !(window.history.state?.idx > 0);
  const pageTitle = PAGE_TITLES[currentPageName] || currentPageName || "ImagineAI";

  // Android back button is fully handled by useAndroidBack hook above.

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
    >
      <style>{`
        body { overscroll-behavior: none; background-color: transparent; }
        html.dark body { background-color: #020617; }
        /* Hide scrollbars globally while keeping functionality */
        * { scrollbar-width: none; -ms-overflow-style: none; }
        *::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center h-14 gap-3" style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden pb-20 relative">
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
      </div>

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
              aria-label={label}
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