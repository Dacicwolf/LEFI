import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NEW_LOGO = "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/9d4b68198_lefi_logo_clean.png";

const COLORS = [
  "#facc15", // yellow
  "#fb923c", // orange
  "#f472b6", // pink
  "#22d3ee", // cyan
  "#4ade80", // green
  "#818cf8", // indigo
  "#c084fc", // purple
  "#facc15", // back to yellow
];

export default function SplashScreen({ visible }) {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((i) => (i + 1) % COLORS.length);
    }, 350);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950"
        >
          {/* Glow blobs */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/30 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"
          />

          {/* Logo container with rotation + scale pulse */}
          <motion.div
            initial={{ scale: 0.3, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.1 }}
            className="relative"
          >

            {/* Slow continuous rotation on the logo */}
            <motion.img
              src={NEW_LOGO}
              alt="Lefi Logo"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="w-40 h-40 rounded-full object-contain relative z-10 shadow-2xl"
            />
          </motion.div>

          {/* LEFI text cu culori schimbătoare */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <p
              className="mt-7 text-6xl font-black tracking-[0.35em]"
              style={{
                color: COLORS[colorIndex],
                textShadow: `0 0 40px ${COLORS[colorIndex]}cc, 0 0 80px ${COLORS[colorIndex]}66`,
                transition: "color 0.4s ease, text-shadow 0.4s ease",
              }}
            >
              LEFI
            </p>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-2 text-sm text-slate-400 tracking-widest uppercase"
          >
            AI Image Generator
          </motion.p>

          {/* Animated color bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 w-32 h-1 rounded-full overflow-hidden"
            style={{
              background: `linear-gradient(90deg, ${COLORS[colorIndex]}, ${COLORS[(colorIndex + 2) % COLORS.length]}, ${COLORS[(colorIndex + 4) % COLORS.length]})`,
              transition: "background 0.5s ease",
              boxShadow: `0 0 12px ${COLORS[colorIndex]}88`,
            }}
          />

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex gap-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  backgroundColor: COLORS[(colorIndex + i) % COLORS.length],
                }}
                transition={{
                  y: { duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" },
                  backgroundColor: { duration: 0.5, ease: "easeInOut" },
                }}
                className="w-2.5 h-2.5 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}