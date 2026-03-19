import React from "react";
import { motion } from "framer-motion";

const COSTS = {
  "512": 2,
  "1024": 4,
};

export function getCost(resolution) {
  return COSTS[resolution] ?? 0;
}

export function getDimensions(orientation, format, resolution) {
  const res = parseInt(resolution);
  const ratios = {
    "1:1": [1, 1],
    "4:3": [4, 3],
    "9:16": [9, 16],
  };
  const [w, h] = ratios[format];
  let width, height;

  if (w >= h) {
    // landscape ratio
    width = res;
    height = Math.round((res * h) / w);
  } else {
    // portrait ratio
    width = Math.round((res * w) / h);
    height = res;
  }

  if (orientation === "Landscape") {
    return { width: Math.max(width, height), height: Math.min(width, height) };
  } else {
    return { width: Math.min(width, height), height: Math.max(width, height) };
  }
}

export default function ImageSettings({ settings, setSettings, credits }) {
  const { resolution } = settings;
  const cost = getCost(resolution);

  const toggle = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const Chip = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 select-none ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full max-w-2xl mx-auto mt-3 px-1"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 px-5 py-4 flex flex-wrap gap-5 items-center justify-between">
        {/* Resolution */}
        <div className="flex flex-col gap-1.5 items-center">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Resolution</span>
          <div className="flex gap-2">
            {["512", "1024"].map((r) => (
              <Chip key={r} active={resolution === r} onClick={() => toggle("resolution", r)}>
                {r}px
              </Chip>
            ))}
          </div>
        </div>

        {/* Cost */}
        <div className="flex flex-col gap-1.5 items-center">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cost</span>
          <div className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl px-3 py-1.5">
            <span className="text-sm font-bold text-violet-700 dark:text-violet-300">{cost}</span>
            <span className="text-sm">🪙</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">credits</span>
          </div>
        </div>

        {/* Credits */}
        <div className="flex flex-col gap-1.5 items-center">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Credits</span>
          {credits === null ? (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
              <span className="text-sm text-slate-400">Loading...</span>
            </div>
          ) : credits === 0 ? (
            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-1.5">
              <span className="text-sm font-semibold text-red-500 dark:text-red-400">No credits left</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl px-3 py-1.5">
              <span className="text-sm font-bold text-violet-700 dark:text-violet-300">{credits}</span>
              <span className="text-sm">🪙</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}