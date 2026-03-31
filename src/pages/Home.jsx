import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import FadeImage from "@/components/FadeImage";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import PullToRefreshWrapper from "@/components/PullToRefreshWrapper";
import { toast } from "sonner";
import PromptInput from "@/components/PromptInput";

// Inlined to avoid eagerly loading the lazy ImageSettings chunk
const RESOLUTION_COSTS = { "512": 2, "1024": 4 };
const getCost = (resolution) => RESOLUTION_COSTS[resolution] ?? 0;

const ImageSettings = lazy(() => import("@/components/ImageSettings"));

const DEFAULT_CREDITS = 40;

export default function Home() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [lastPrompt, setLastPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [realCredits, setRealCredits] = useState(null);
  const [credits, setCredits] = useState(null);

  const runOptimisticCredits = useCallback(async (nextValue, asyncFn) => {
    setCredits(nextValue);
    try {
      await asyncFn();
    } catch (err) {
      setCredits(realCredits);
      throw err;
    }
  }, [realCredits]);
  const [settings, setSettings] = useState({
    orientation: "Portrait",
    format: "1:1",
    resolution: "1024",
  });
  const liveRegionRef = useRef(null);

  // Load credits from DB on mount
  useEffect(() => {
    base44.auth.me().then(async (user) => {
      if (user.credits === undefined || user.credits === null) {
        await base44.auth.updateMe({ credits: DEFAULT_CREDITS });
        setRealCredits(DEFAULT_CREDITS);
        setCredits(DEFAULT_CREDITS);
      } else {
        setRealCredits(user.credits);
        setCredits(user.credits);
      }
    }).catch(() => { setRealCredits(DEFAULT_CREDITS); setCredits(DEFAULT_CREDITS); });
  }, []);

  const handleRefresh = () => {
    setPrompt("");
    setLastPrompt("");
    return new Promise((resolve) => setTimeout(resolve, 600));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    // Secret admin trigger
    if (prompt.trim() === "/theodorfl@gmail.com") {
      navigate("/AdminPanel");
      return;
    }
    const cost = getCost(settings.resolution);
    if (credits === null || credits < cost) {
      toast.error("Not enough credits.");
      return;
    }
    const newCredits = Math.max(0, credits - cost);
    setIsLoading(true);
    setLastPrompt(prompt);
    // Announce generation start to screen readers
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Starting image generation: ${prompt}`;
    }
    try {
      await runOptimisticCredits(newCredits, async () => {
        const result = await base44.integrations.Core.GenerateImage({ prompt });
        if (!result?.url) throw new Error("No image returned");
        await base44.auth.updateMe({ credits: newCredits });
        setRealCredits(newCredits);
        setIsLoading(false);
        // Announce success before navigation
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = "Image generated successfully. Navigating to result.";
        }
        await base44.entities.GeneratedImage.create({ user_email: (await base44.auth.me()).email, image_url: result.url, prompt });
        navigate(`/ImageResult?url=${encodeURIComponent(result.url)}&prompt=${encodeURIComponent(prompt)}`);
      });
    } catch {
      toast.error("Image generation failed. Credits restored.");
      setIsLoading(false);
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = "Image generation failed. Credits restored.";
      }
    }
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
    <div className="min-h-screen bg-background dark:bg-none dark:bg-slate-950"
      role="region"
      aria-label="Image generation"
    >
      {/* Screen reader announcements */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 py-4 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 overflow-hidden shadow-lg">
              <FadeImage src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995fb83472e84f2aaa7251a/77a5e07ff_lefi_logo.png" alt="Lefi Logo" className="w-full h-full object-cover" skeletonClassName="w-12 h-12" aspectRatio="1/1" />
            </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight dark:text-white mb-2" style={{color: '#cccccc'}}>
            Generate Images
          </h1>
        </motion.div>

        {/* Prompt Input */}
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />

        {/* Image Settings */}
        <Suspense fallback={<div className="w-full max-w-2xl mx-auto mt-3 h-[76px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />}>
          <ImageSettings settings={settings} setSettings={setSettings} credits={credits} />
        </Suspense>

        {/* No Credits — Buy Credits */}
        {credits === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto mt-6"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/40 px-5 py-5">
              <p className="text-sm font-semibold text-red-500 mb-4 text-center">You've run out of credits. Top up to keep generating!</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: "Bronze", credits: 40, price: "$2.9", border: "border-2 border-amber-400 dark:border-amber-600", plan: "bronze", img: "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/88cf9d6c2_lefi_logo_bronze.png" },
                  { name: "Silver", credits: 88, price: "$5.9", border: "border-2 border-slate-200 dark:border-slate-700", plan: "silver", img: "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/451aba21c_lefi_logo_silver.png" },
                  { name: "Gold", credits: 180, price: "$9.9", border: "border-2 border-yellow-200 dark:border-yellow-200", plan: "gold", img: "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/91cafad47_lefi_logo_gold.png" },
                ].map(({ name, credits: c, price, border, plan, img }) => (
                  <a
                    key={plan}
                    href={plan === 'bronze' ? `https://buy.stripe.com/cNi7sM0gq2zM7n9bwB3wQ02?client_reference_id=${encodeURIComponent(window.location.origin + '/payment-success?plan=bronze')}` : plan === 'silver' ? `https://buy.stripe.com/9B614o6EOfmy6j51W13wQ01?client_reference_id=${encodeURIComponent(window.location.origin + '/payment-success?plan=silver')}` : `https://buy.stripe.com/9B63cw7IS2zM5f1eIN3wQ00?client_reference_id=${encodeURIComponent(window.location.origin + '/payment-success?plan=gold')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Buy ${name} plan – ${c} credits for ${price}`}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border ${border} p-4 min-h-[44px] flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <FadeImage src={img} alt={name} className="w-12 h-12 rounded-xl object-contain" skeletonClassName="w-12 h-12 rounded-xl" aspectRatio="1/1" />
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{name}</p>
                    <p className="text-violet-600 dark:text-violet-400 font-bold text-xs">{c} 🪙</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{price}</p>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}

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
    </PullToRefreshWrapper>
  );
}