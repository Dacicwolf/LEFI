import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = [
  "#818cf8", // indigo-400
  "#a78bfa", // violet-400
  "#c084fc", // purple-400
  "#f472b6", // pink-400
  "#60a5fa", // blue-400
  "#818cf8", // back to indigo
];

export default function SplashScreen({ visible }) {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((i) => (i + 1) % COLORS.length);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950"
        >
          {/* Glow blobs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-700/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
            className="relative"
          >
            {/* Pulsing glow ring */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-3xl bg-violet-500/30 blur-xl"
            />
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995fb83472e84f2aaa7251a/77a5e07ff_lefi_logo.png"
              alt="Lefi Logo"
              className="w-32 h-32 rounded-3xl object-contain relative z-10 shadow-2xl"
            />
          </motion.div>

          {/* LEFI text cu culori schimbătoare */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              color: COLORS[colorIndex],
            }}
            transition={{
              opacity: { delay: 0.3, duration: 0.4 },
              y: { delay: 0.3, duration: 0.4 },
              color: { duration: 0.6, ease: "easeInOut" },
            }}
            className="mt-6 text-5xl font-black tracking-[0.3em]"
            style={{ color: COLORS[colorIndex] }}
          >
            LEFI
          </motion.p>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-2 text-sm text-slate-400 tracking-widest uppercase"
          >
            AI Image Generator
          </motion.p>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                className="w-2 h-2 rounded-full bg-violet-400"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}