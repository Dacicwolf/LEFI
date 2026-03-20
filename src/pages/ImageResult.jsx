import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Download, Copy, Check, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ImageResult() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const imageUrl = params.get("url");
  const prompt = params.get("prompt");
  const [copied, setCopied] = useState(false);

  // Zoom state
  const [scale, setScale] = useState(1);
  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

  // Pinch-to-zoom refs
  const lastDist = useRef(null);
  const imgRef = useRef(null);

  const clampScale = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((s) => clampScale(s + delta));
  };

  // Pinch zoom (touch)
  const handleTouchMove = (e) => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (lastDist.current !== null) {
      const delta = (dist - lastDist.current) * 0.01;
      setScale((s) => clampScale(s + delta));
    }
    lastDist.current = dist;
  };

  const handleTouchEnd = () => { lastDist.current = null; };

  // Attach non-passive wheel listener
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.target = "_blank";
    link.download = "generated-image.png";
    link.click();
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:bg-none dark:bg-slate-950"
      style={{ height: "100dvh" }}>

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 shrink-0">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium hover:opacity-70 transition-opacity min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </motion.button>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => clampScale(s - 0.25))}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => clampScale(s + 0.25))}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image area — fills remaining space, image fits smallest dimension */}
      {imageUrl ? (
        <div
          ref={imgRef}
          className="relative z-10 flex-1 flex items-center justify-center overflow-hidden cursor-zoom-in"
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.img
            src={imageUrl}
            alt={prompt}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              transition: "transform 0.1s ease",
              // Fit the smallest window dimension
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: "1rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">No image to display.</div>
      )}

      {/* Bottom actions */}
      <div className="relative z-10 px-4 py-4 shrink-0">
        {prompt && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-3 line-clamp-2 leading-relaxed">
            {prompt}
          </p>
        )}
        <div className="flex gap-3 max-w-sm mx-auto">
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="flex-1 gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            onClick={handleDownload}
            className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}