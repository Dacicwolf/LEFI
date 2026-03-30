import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function PromptInput({ prompt, setPrompt, onGenerate, isLoading }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isLoading && prompt.trim()) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl opacity-20 group-hover:opacity-30 blur transition-opacity duration-500" />
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
          <Textarea
            placeholder="Describe what you want to see and let AI create it for you..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            inputMode="text"
            aria-label="Image generation prompt"
            aria-multiline="true"
            className="min-h-[120px] bg-slate-50/50 dark:bg-slate-800/50 rounded-xl text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-[#cccccc] focus-visible:ring-0 focus-visible:ring-offset-0 resize-none p-4"
          />
          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            <p className="text-xs text-slate-400 dark:text-slate-500 pl-2 leading-relaxed">
              Press Enter or button to Generate<br />
              Complex images may take up to 60s
            </p>
            <Button
              onClick={onGenerate}
              disabled={isLoading || !prompt.trim()}
              aria-label={isLoading ? "Generating image" : "Generate image"}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl px-6 min-h-[44px] font-medium shadow-lg shadow-violet-500/25 transition-all duration-300 disabled:opacity-40 select-none"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}