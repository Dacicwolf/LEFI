import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Wand2, Settings } from "lucide-react";

const tabs = [
  { name: "Home", label: "Generate", icon: Wand2 },
  { name: "SettingsPage", label: "Settings", icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:bg-none dark:bg-slate-950 flex flex-col select-none"
      style={{ paddingTop: "env(safe-area-inset-top)", overscrollBehavior: "none" }}
    >
      <style>{`
        body { overscroll-behavior: none; background-color: transparent; }
        @media (prefers-color-scheme: dark) {
          body { background-color: #020617; }
        }
      `}</style>

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
            <Link
              key={name}
              to={createPageUrl(name)}
              className={`flex-1 flex flex-col items-center justify-center min-h-[56px] gap-0.5 transition-colors duration-200 select-none ${
                active
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}