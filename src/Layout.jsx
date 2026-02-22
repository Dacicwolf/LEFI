import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Wand2, Settings, Sun, Moon, ChevronLeft } from "lucide-react";

const ROOT_PAGES = {
  Home: createPageUrl("Home"),
  SettingsPage: createPageUrl("SettingsPage"),
};

const tabs = [
  { name: "Home", label: "Generate", icon: Wand2 },
  { name: "SettingsPage", label: "Settings", icon: Settings },
];

const PAGE_TITLES = {
  Home: "Generate",
  SettingsPage: "Settings",
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Track history stacks per tab
  const tabStacks = useRef({ Home: [ROOT_PAGES.Home], SettingsPage: [ROOT_PAGES.SettingsPage] });

  const isRootPage = Object.values(ROOT_PAGES).includes(location.pathname) || location.pathname === "/";
  const pageTitle = PAGE_TITLES[currentPageName] || currentPageName || "ImagineAI";

  const handleTabClick = (tabName) => {
    if (currentPageName === tabName) {
      // Reset to root of that tab
      tabStacks.current[tabName] = [ROOT_PAGES[tabName]];
      navigate(ROOT_PAGES[tabName], { replace: true });
    } else {
      navigate(ROOT_PAGES[tabName]);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:bg-none dark:bg-slate-950 flex flex-col select-none"
      style={{ paddingTop: "env(safe-area-inset-top)", overscrollBehavior: "none" }}
    >
      <style>{`
        body { overscroll-behavior: none; background-color: transparent; }
        html.dark body { background-color: #020617; }
      `}</style>

      {/* Global Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center px-4 h-14 gap-3">
        {!isRootPage && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-2 text-violet-600 dark:text-violet-400 select-none"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-base font-semibold text-slate-900 dark:text-white flex-1">
          {pageTitle}
        </h1>
        <button
          onClick={() => setDark((d) => !d)}
          className="flex items-center justify-center min-w-[44px] min-h-[44px] text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors select-none"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map(({ name, label, icon: Icon }) => {
          const active = currentPageName === name;
          return (
            <button
              key={name}
              onClick={() => handleTabClick(name)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[56px] gap-0.5 transition-colors duration-200 select-none ${
                active
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
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