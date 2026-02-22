import React, { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, RefreshCw } from "lucide-react";
import PromptInput from "@/components/PromptInput";
import ImageDisplay from "@/components/ImageDisplay";
import ImageSettings, { getCost } from "@/components/ImageSettings";

const PULL_THRESHOLD = 70;

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(50);
  const [settings, setSettings] = useState({
    orientation: "Portrait",
    format: "1:1",
    resolution: "1024",
  });

  // Pull-to-refresh
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(null);
  const scrollRef = useRef(null);

  const handleTouchStart = (e) => {
    if (scrollRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullY(Math.min(delta, PULL_THRESHOLD * 1.5));
  };

  const handleTouchEnd = () => {
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPrompt("");
      setImageUrl(null);
      setLastPrompt("");
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
    setPullY(0);
    touchStartY.current = null;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const cost = getCost(settings.resolution);
    if (credits <= 0) return;
    setIsLoading(true);
    setLastPrompt(prompt);
    const result = await base44.integrations.Core.GenerateImage({ prompt });
    setImageUrl(result.url);
    setCredits((c) => Math.max(0, c - cost));
    setIsLoading(false);
  };

  const pullProgress = Math.min(pullY / PULL_THRESHOLD, 1);

  return (
    <div
      ref={scrollRef}
      className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:bg-none dark:bg-slate-950 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pullY > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: pullProgress }}
            exit={{ opacity: 0 }}
            className="flex justify-center pt-4"
            style={{ height: refreshing ? 48 : pullY * 0.6 }}
          >
            <RefreshCw
              className={`w-5 h-5 text-violet-500 ${refreshing ? "animate-spin" : ""}`}
              style={{ transform: `rotate(${pullProgress * 360}deg)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 px-4 py-12 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/30 mb-6">
            <Wand2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Generate Images
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Describe what you want to see and let AI create it for you.
          </p>
        </motion.div>

        {/* Prompt Input */}
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />

        {/* Image Settings */}
        <ImageSettings settings={settings} setSettings={setSettings} credits={credits} />

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center mt-16 gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
              <div
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  className="w-8 h-8 rounded-full border-2 border-indigo-200 border-b-indigo-600 animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
                />
              </div>
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500 animate-pulse">
              Creating your image...
            </p>
          </motion.div>
        )}

        {/* Generated Image */}
        {!isLoading && <ImageDisplay imageUrl={imageUrl} prompt={lastPrompt} />}

        {/* Empty state suggestions */}
        {!imageUrl && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-16"
          >
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {["Ocean sunset 🌅", "Astronaut cat 🐱", "Medieval castle 🏰"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(suggestion)}
                  className="px-4 min-h-[44px] rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm text-slate-600 dark:text-slate-300 transition-colors duration-200 select-none"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}