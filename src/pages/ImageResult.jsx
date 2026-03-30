import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Download, Copy, Check, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageSkeleton from "@/components/ImageSkeleton";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.5;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const ImageResult = memo(function ImageResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const imageUrl = params.get("url");
  const prompt = params.get("prompt");
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const liveRegionRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Keep refs in sync
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  const applyScale = useCallback((newScale, centerX, centerY) => {
    const container = containerRef.current;
    if (!container) return;

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const cx = centerX !== undefined ? centerX : cw / 2;
    const cy = centerY !== undefined ? centerY : ch / 2;

    const clamped = clamp(newScale, MIN_SCALE, MAX_SCALE);
    const prevScale = scaleRef.current;

    if (clamped === prevScale) return;

    // Adjust offset so zoom is centered on the pinch/wheel point
    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;
    const ratio = clamped / prevScale;

    let newOx = cx - ratio * (cx - ox);
    let newOy = cy - ratio * (cy - oy);

    if (clamped === MIN_SCALE) {
      newOx = 0;
      newOy = 0;
    }

    scaleRef.current = clamped;
    offsetRef.current = { x: newOx, y: newOy };
    setScale(clamped);
    setOffset({ x: newOx, y: newOy });
  }, []);

  // Pinch zoom
  const lastDist = useRef(null);
  const lastPinchMid = useRef(null);

  // Single finger pan
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.sqrt(dx * dx + dy * dy);
      lastPinchMid.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      isPanning.current = false;
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
      const mid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      if (lastDist.current !== null) {
        const newScale = scaleRef.current * (dist / lastDist.current);
        applyScale(newScale, mid.x, mid.y);
      }
      lastDist.current = dist;
      lastPinchMid.current = mid;
    } else if (e.touches.length === 1 && isPanning.current) {
      if (scaleRef.current <= MIN_SCALE) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - lastPan.current.x;
      const dy = e.touches[0].clientY - lastPan.current.y;
      lastPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const newOffset = {
        x: offsetRef.current.x + dx,
        y: offsetRef.current.y + dy,
      };
      offsetRef.current = newOffset;
      setOffset(newOffset);
    }
  }, [applyScale]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) lastDist.current = null;
    if (e.touches.length === 0) isPanning.current = false;
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    applyScale(scaleRef.current + delta, cx, cy);
  }, [applyScale]);

  // Mouse drag pan
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    if (scaleRef.current <= MIN_SCALE) return;
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    const newOffset = {
      x: offsetRef.current.x + dx,
      y: offsetRef.current.y + dy,
    };
    offsetRef.current = newOffset;
    setOffset(newOffset);
  }, []);

  const handleMouseUp = useCallback(() => { isDragging.current = false; }, []);

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
      <div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true" />

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
            onClick={() => applyScale(scale - ZOOM_STEP)}
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
            onClick={() => applyScale(scale + ZOOM_STEP)}
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
          className="relative z-10 flex-1 overflow-hidden select-none"
          style={{
            minHeight: 0,
            cursor: scale > 1 ? "grab" : "default",
            touchAction: scale > 1 ? "none" : "pan-x pan-y",
          }}
        >
          <AnimatePresence mode="wait">
            {!imgLoaded && <ImageSkeleton key="skeleton" />}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: imgLoaded ? 1 : 0, scale: imgLoaded ? 1 : 0.97 }}
            transition={{ duration: 0.25 }}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: "center center",
              transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
              willChange: "transform",
            }}
          >
            <img
              src={imageUrl}
              alt={prompt || "Generated image"}
              onLoad={() => setImgLoaded(true)}
              draggable={false}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "12px",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">No image to display.</div>
      )}

      {/* Bottom action bar */}
      <div className="relative z-10 px-4 py-4 shrink-0 flex gap-3">
        <Button onClick={handleCopyLink} variant="outline" className="flex-1 gap-2">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
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
  );
});

export default ImageResult;
