import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Download, Copy, Check, ZoomIn, ZoomOut, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageSkeleton from "@/components/ImageSkeleton";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.5;
const isMobileDevice = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const ImageResult = memo(function ImageResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const imageUrl = params.get("url");
  const prompt = params.get("prompt");
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Save prompt to sessionStorage so Home restores it on back navigation
  useEffect(() => {
    if (prompt) sessionStorage.setItem('lastPrompt', prompt);
  }, [prompt]);
  const [contextMenu, setContextMenu] = useState(null);
  const liveRegionRef = useRef(null);
  const longPressTimer = useRef(null);

  const [scale, setScale] = useState(1);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);

  const containerRef = useRef(null);
  const lastDist = useRef(null);
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Dismiss context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const dismiss = () => setContextMenu(null);
    window.addEventListener("click", dismiss);
    return () => window.removeEventListener("click", dismiss);
  }, [contextMenu]);

  const zoomIn = () => setScale(prev => clamp(prev + ZOOM_STEP, MIN_SCALE, MAX_SCALE));
  const zoomOut = () => {
    setScale(prev => {
      const next = clamp(prev - ZOOM_STEP, MIN_SCALE, MAX_SCALE);
      if (next === MIN_SCALE) { setOx(0); setOy(0); }
      return next;
    });
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.sqrt(dx * dx + dy * dy);
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
      if (lastDist.current !== null) {
        const ratio = dist / lastDist.current;
        setScale(prev => {
          const next = clamp(prev * ratio, MIN_SCALE, MAX_SCALE);
          if (next === MIN_SCALE) { setOx(0); setOy(0); }
          return next;
        });
      }
      lastDist.current = dist;
    } else if (e.touches.length === 1 && isPanning.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - lastPan.current.x;
      const dy = e.touches[0].clientY - lastPan.current.y;
      lastPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setScale(currentScale => {
        if (currentScale <= MIN_SCALE) return currentScale;
        setOx(prev => prev + dx);
        setOy(prev => prev + dy);
        return currentScale;
      });
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) lastDist.current = null;
    if (e.touches.length === 0) isPanning.current = false;
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale(prev => {
      const next = clamp(prev + delta, MIN_SCALE, MAX_SCALE);
      if (next === MIN_SCALE) { setOx(0); setOy(0); }
      return next;
    });
  }, []);

  const handleMouseDown = useCallback((e) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    setScale(currentScale => {
      if (currentScale <= MIN_SCALE) return currentScale;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      setOx(prev => prev + dx);
      setOy(prev => prev + dy);
      return currentScale;
    });
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

  const handleDownload = async () => {
    setContextMenu(null);
    if (isMobileDevice) {
      // On mobile/Android WebView: open image in new tab so user can long-press save
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
      toast.success('Image opened — long press to save!');
      return;
    }
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'lefi-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      toast.success('Image saved!');
    } catch (e) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
      toast.success('Image opened in browser!');
    }
  };

  const handleShare = async () => {
    setContextMenu(null);
    try {
      // Fetch image server-side to avoid CORS
      const res = await base44.functions.invoke('proxyImage', { url: imageUrl });
      const { base64, contentType } = res.data;
      const byteChars = atob(base64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: contentType });
      const file = new File([blob], 'lefi-image.png', { type: contentType });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Lefi Image' });
      } else if (navigator.share) {
        await navigator.share({ url: imageUrl, title: 'Lefi Image' });
      } else {
        toast.error('Sharing not supported on this device.');
      }
    } catch (e) {
      if (e.name !== 'AbortError') toast.error('Share failed. Try Save instead.');
    }
  };

  const handleCopyLink = async () => {
    setContextMenu(null);
    await navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    toast.success("Link copied!");
    if (liveRegionRef.current) liveRegionRef.current.textContent = "Image link copied to clipboard";
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleImageLongPressStart = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      longPressTimer.current = setTimeout(() => {
        setContextMenu({ x: t.clientX, y: t.clientY });
      }, 600);
    }
  };

  const handleImageLongPressEnd = () => clearTimeout(longPressTimer.current);

  useEffect(() => {
    if (imgLoaded && liveRegionRef.current) {
      liveRegionRef.current.textContent = prompt ? `Image generated: ${prompt}` : "Image loaded";
    }
  }, [imgLoaded, prompt]);

  return (
    <div
      className="flex flex-col bg-background dark:bg-none dark:bg-slate-950"
      style={{ height: "100dvh" }}
      role="region"
      aria-label="Image generation result"
    >
      <div ref={liveRegionRef} className="sr-only" aria-live="polite" aria-atomic="true" />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDownload}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Save Image
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </button>
        </div>
      )}

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

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
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
            onClick={zoomIn}
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
            touchAction: scale > 1 ? "none" : "auto",
          }}
        >
          <AnimatePresence>
            {!imgLoaded && <ImageSkeleton key="skeleton" />}
          </AnimatePresence>

          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${scale}) translate(${ox / scale}px, ${oy / scale}px)`,
              transformOrigin: "center center",
              willChange: "transform",
              transition: "none",
            }}
            onContextMenu={handleImageContextMenu}
            onTouchStart={handleImageLongPressStart}
            onTouchEnd={handleImageLongPressEnd}
            onTouchMove={handleImageLongPressEnd}
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
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.25s ease",
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">No image to display.</div>
      )}

      {/* Bottom bar */}
      <div className="relative z-10 px-4 py-4 shrink-0 flex gap-3">
        <Button
          onClick={handleDownload}
          className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
        >
          <Download className="w-4 h-4" />
          Save
        </Button>
        {isMobileDevice && (
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 gap-2 border-violet-200 dark:border-slate-700 text-violet-600 dark:text-violet-400"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}
      </div>
    </div>
  );
});

export default ImageResult;