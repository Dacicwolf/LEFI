import React from "react";
import { motion } from "framer-motion";

/**
 * High-quality skeleton loader for images during load.
 * Mimics the final image dimensions with animated gradient pulse.
 */
export default function ImageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "tween", duration: 0.1 }}
      className="flex items-center justify-center w-full h-full"
    >
      <div className="relative rounded-2xl overflow-hidden w-72 h-72 sm:w-96 sm:h-96 bg-slate-200 dark:bg-slate-700">
        {/* Animated gradient pulse */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-shimmer" />
        
        {/* Subtle center highlight */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <div className="w-16 h-16 rounded-full bg-slate-300 dark:bg-slate-600 blur-xl" />
        </div>
      </div>
    </motion.div>
  );
}