import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Download, Copy, Check, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageSkeleton from "@/components/ImageSkeleton";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const clamp = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

const ImageResult = memo(function ImageResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const imageUrl = params.get("url");
  const prompt = params.get("prompt");
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const liveRegionRef = useRef(null);

  // Zoom + pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const imgWrapRef = useRef(null);

  // Track pinch and pan gestures
  const lastDist = useRef(null);
  const lastMidpoint = useRef(null);
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  // Reset offset when scale goes back to 1
  const setScaleSafe = useCallback((fn) => {
    setScale((prev) => {
      const next = clamp(typeof fn === "function" ? fn(prev) : fn);
      if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Clamp offset so image never goes out of bounds
  const clampOffset = useCallback((ox, oy, currentScale) => {
    const container = containerRef.current;
    const img = imgWrapRef.current;
    if (!container || !img) return { x: ox, y: oy };

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const iw = img.clientWidth * currentScale;
    const ih = img.clientHeight * currentScale;

    const maxX = Math.max(0, (iw - cw) / 2);
    const maxY = Math.max(0, (ih - ch) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    };
  }, []);

  // Touch: pinch zoom + single finger pan
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.sqrt(dx * dx + dy * dy);
      lastMidpoint.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1) {
      isPanning.current = true;
      lastPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastDist.current !== null) {
        const delta = (dist - lastDist.current) * 0.012;
        setScale((prev) => {
          const next = clamp(prev + delta);
          if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
          return next;
        });
      }
      lastDist.current = dist;
    } else if (e.touches.length === 1 && isPanning.current) {
      setScale((currentScale) => {
        if (currentScale <= MIN_SCALE) return currentScale;
        e.preventDefault();
        const dx = e.touches[0].clientX - lastPan.current.x;
        const dy = e.touches[0].clientY - lastPan.current.y;
        lastPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setOffset((prev) => clampOffset(prev.x + dx, prev.y + dy, currentScale));
        return currentScale;
      });
    }
  }, [clampOffset]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) lastDist.current = null;
    if (e.touches.length === 0) isPanning.current = false;
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScaleSafe((s) => s + (e.deltaY > 0 ? -0.15 : 0.15));
  }, [setScaleSafe]);

  // Mouse drag pan
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    setScale((currentScale) => {
      if (currentScale <= MIN_SCALE) return currentScale;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setOffset((prev) => clampOffset(prev.x + dx, prev.y + dy, currentScale));
      return currentScale;
    });
  }, [clampOffset]);

  const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

  // Register non-passive listeners
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp]);

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
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = "Image link copied to clipboard";
    }
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (imgLoaded && liveRegionRef.current) {
      liveRegionRef.current.textContent = prompt
        ? `Image generated: ${prompt}`
        : "Image loaded";
    }
  }, [imgLoaded, prompt]);

  return (
    <div
      className="flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:bg-none dark:bg-slate-950"
      style={{ height: "100dvh" }}
      role="region"
      aria-label="Image generation result"
    >
      {/* Screen reader announcements */}
      <div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true" />

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
          transition={{ type: "tween", duration: 0.1 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium hover:opacity-70 transition-opacity min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </motion.button>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScaleSafe((s) => s - 0.5)}
            aria-label="Zoom out"
            disabled={scale <= MIN_SCALE}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScaleSafe((s) => s + 0.5)}
            aria-label="Zoom in"
            disabled={scale >= MAX_SCALE}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image area */}
      {imageUrl ? (
        <div
          ref={containerRef}
          className="relative z-10 flex-1 flex items-center justify-center overflow-hidden select-none"
          style={{
            minHeight: 0,
            cursor: scale > 1 ? "grab" : "default",
            touchAction: scale > 1 ? "none" : "auto",
          }}
        >
          <AnimatePresence mode="wait">
            {!imgLoaded && <ImageSkeleton key="skeleton" />}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: imgLoaded ? 1 : 0, scale: imgLoaded ? 1 : 0.95 }}
            transition={{ type: "tween", duration: 0.15 }}
            ref={imgWrapRef}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: "center center",
              transition: lastDist.current || isDragging.current ? "none" : "transform 0.15s ease",
              willChange: "transform",
              maxWidth: "100%",
              maxHeight: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={imageUrl}
              alt={prompt ? `AI-generated image: ${prompt}` : "AI-generated image"}
              onLoad={() => setImgLoaded(true)}
              draggable={false}
              className="rounded-2xl shadow-2xl"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                userSelect: "none",
                WebkitUserSelect: "none",
                pointerEvents: "none",
              }}
            />
          </motion.div>
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
          <Button onClick={handleCopyLink} variant="outline" className="flex-1 gap-2">
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
});

export default ImageResult;
