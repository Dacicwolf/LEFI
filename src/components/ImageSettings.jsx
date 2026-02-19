import React from "react";
import { motion } from "framer-motion";

const COSTS = {
  "512": { "1:1": 2, "4:3": 1.5, "9:16": 1 },
  "1024": { "1:1": 4, "4:3": 3, "9:16": 2 },
};

export function getCost(resolution, format) {
  return COSTS[resolution]?.[format] ?? 0;
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

export default function ImageSettings({ settings, setSettings }) {
  const { orientation, format, resolution } = settings;
  const cost = getCost(resolution, format);

  const toggle = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const Chip = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-4 flex flex-wrap gap-5 items-center justify-between">
        {/* Orientation */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Orientation</span>
          <div className="flex gap-2">
            {["Portrait", "Landscape"].map((o) => (
              <Chip key={o} active={orientation === o} onClick={() => toggle("orientation", o)}>
                {o === "Portrait" ? "⬆ Portrait" : "⬅ Landscape"}
              </Chip>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Format</span>
          <div className="flex gap-2">
            {["1:1", "4:3", "9:16"].map((f) => (
              <Chip key={f} active={format === f} onClick={() => toggle("format", f)}>
                {f}
              </Chip>
            ))}
          </div>
        </div>

        {/* Resolution */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolution</span>
          <div className="flex gap-2">
            {["512", "1024"].map((r) => (
              <Chip key={r} active={resolution === r} onClick={() => toggle("resolution", r)}>
                {r}px
              </Chip>
            ))}
          </div>
        </div>

        {/* Cost */}
        <div className="flex flex-col gap-1.5 items-end ml-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost</span>
          <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-xl px-3 py-1.5">
            <span className="text-sm font-bold text-violet-700">{cost}</span>
            <span className="text-sm">🪙</span>
            <span className="text-xs text-slate-500 ml-1">credits</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}