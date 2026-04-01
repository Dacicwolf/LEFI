import React from "react";
import { Button } from "@/components/ui/button";
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
      className="w-full max-w-2xl mx-auto">
      
      <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/30 rounded-2xl overflow-hidden">
        <div className="m-3 rounded-xl overflow-hidden">
        <textarea
            placeholder="Describe what you want to see and let AI create it for you..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            inputMode="text"
            aria-label="Image generation prompt"
            rows={4}
            style={{ resize: "none", outline: "none", boxShadow: "none" }}
            className="w-full bg-slate-50 dark:bg-slate-950 text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-transparent focus:border-[#cccccc] rounded-xl p-4 transition-colors" />
          
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            <span className="block">Enter -or button to Generate</span>
            <span className="block">Complex images may take up to 60s</span>
          </div>
          <Button
            onClick={onGenerate}
            disabled={isLoading || !prompt.trim()}
            aria-label={isLoading ? "Generating image" : "Generate image"}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl px-6 min-h-[44px] font-medium shadow-lg shadow-violet-500/25 transition-all duration-300 disabled:opacity-40 select-none">
            
            {isLoading ?
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> :

            <Sparkles className="w-4 h-4 mr-2" />
            }
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </div>
      </div>
    </motion.div>);

}