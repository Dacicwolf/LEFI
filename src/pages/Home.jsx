import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import PromptInput from "@/components/PromptInput";
import ImageSettings, { getCost } from "@/components/ImageSettings";

const PULL_THRESHOLD = 70;
const DEFAULT_CREDITS = 50;

export default function Home() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState(null); // null = loading
  const [settings, setSettings] = useState({
    orientation: "Portrait",
    format: "1:1",
    resolution: "1024",
  });

  // Load credits from DB on mount
  useEffect(() => {
    base44.auth.me().then(async (user) => {
      if (user.credits === undefined || user.credits === null) {
        // First time: initialize credits
        await base44.auth.updateMe({ credits: DEFAULT_CREDITS });
        setCredits(DEFAULT_CREDITS);
      } else {
        setCredits(user.credits);
      }
    }).catch(() => setCredits(DEFAULT_CREDITS));
  }, []);

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
    if (credits === null || credits < cost) {
      toast.error("Not enough credits.");
      return;
    }
    const newCredits = Math.max(0, credits - cost);
    // Optimistic update
    setCredits(newCredits);
    setIsLoading(true);
    setLastPrompt(prompt);
    const result = await base44.integrations.Core.GenerateImage({ prompt });
    if (!result?.url) {
      // Rollback credits
      setCredits(credits);
      toast.error("Image generation failed. Credits restored.");
      setIsLoading(false);
      return;
    }
    // Save new credit balance to DB
    await base44.auth.updateMe({ credits: newCredits });
    setIsLoading(false);
    navigate(`/ImageResult?url=${encodeURIComponent(result.url)}&prompt=${encodeURIComponent(prompt)}`);
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

      <div className="relative z-10 px-4 py-4 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 overflow-hidden shadow-lg">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995fb83472e84f2aaa7251a/77a5e07ff_lefi_logo.png" alt="Graphos Logo" className="w-full h-full object-cover" />
            </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Generate Images
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
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
            className="flex flex-col items-center mt-8 gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
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


      </div>
    </div>
  );
}