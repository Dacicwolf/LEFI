import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Wand2 } from "lucide-react";
import PromptInput from "@/components/PromptInput";
import ImageDisplay from "@/components/ImageDisplay";
import ImageSettings, { getDimensions } from "@/components/ImageSettings";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [lastPrompt, setLastPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    orientation: "Portrait",
    format: "1:1",
    resolution: "1024",
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setLastPrompt(prompt);
    const result = await base44.integrations.Core.GenerateImage({
      prompt: prompt,
    });
    setImageUrl(result.url);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 py-16 sm:py-24">
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
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            Generate Images
          </h1>
          <p className="text-lg text-slate-500 max-w-md mx-auto">
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

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center mt-16 gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-b-indigo-600 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
              </div>
            </div>
            <p className="text-sm text-slate-400 animate-pulse">
              Creating your image...
            </p>
          </motion.div>
        )}

        {/* Generated Image */}
        {!isLoading && (
          <ImageDisplay imageUrl={imageUrl} prompt={lastPrompt} />
        )}

        {/* Empty state hint */}
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
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-sm text-slate-600 transition-colors duration-200"
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