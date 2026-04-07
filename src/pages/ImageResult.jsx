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
const UIButton = /** @type {any} */ (Button);

// Fetches the image as a Blob via proxyImage backend (returns base64 JSON)
async function fetchImageBlob(imageUrl) {
  const res = await base44.functions.invoke('proxyImage', { url: imageUrl });
  const { base64, contentType } = res.data;
  if (!base64) throw new Error('No base64 data returned');
  const byteChars = atob(base64);
  const byteArr = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
  return new Blob([byteArr], { type: contentType || 'image/png' });
}

function buildImageFile(blob) {
  return new File([blob], 'lefi-image.png', { type: blob.type || 'image/png' });
}

async function shareImageFile({ file, prompt }) {
  if (!navigator.share) return false;
  const shareData = { files: [file], title: 'Lefi Image', text: prompt || '' };
  if (navigator.canShare && navigator.canShare(shareData)) {
    await navigator.share(shareData);
    return true;
  }
  return false;
}

const ImageResult = memo(function ImageResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const imageUrl = params.get("url");
  const prompt = params.get("prompt");
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imageBlob, setImageBlob] = useState(null);
  const [blobReady, setBlobReady] = useState(false);

  useEffect(() => {
    if (prompt) sessionStorage.setItem('lastPrompt', prompt);
  }, [prompt]);

  // Prefetch image blob in background so file-share can run directly on tap.
  useEffect(() => {
    let cancelled = false;
    if (!imageUrl) {
      setImageBlob(null);
      setBlobReady(false);
      return;
    }

    setBlobReady(false);
    fetchImageBlob(imageUrl)
      .then((blob) => {
        if (cancelled) return;
        setImageBlob(blob);
        setBlobReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Blob prefetch failed:', err);
        setImageBlob(null);
        setBlobReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

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

  // SAVE: uses navigator.canShare+share for Android (saves to gallery), fallback to <a> download
  const handleDownload = async () => {
    setContextMenu(null);
    try {
      // Mobile-first: share file to native sheet so users can save the real image file.
      if (isMobileDevice && imageBlob && navigator.share) {
        try {
          const shared = await shareImageFile({ file: buildImageFile(imageBlob), prompt });
          if (shared) {
            toast.success('Share menu opened for file save.');
            return;
          }
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
        }
      }

      const blob = imageBlob || await fetchImageBlob(imageUrl);

      // Desktop / browsers that support <a download>
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'lefi-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      toast.success('Image downloaded!');
    } catch (e) {
      console.error('Download error:', e);
      if (isMobileDevice && navigator.share) {
        toast.error('File is still preparing. Try again in a moment.');
      } else {
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
        toast.info('Image opened in browser. Long-press to save.');
      }
    }
  };

  // SHARE: opens native share sheet with the image file.
  const handleShare = async () => {
    setContextMenu(null);
    if (!isMobileDevice) return;
    try {
      if (imageBlob) {
        const shared = await shareImageFile({ file: buildImageFile(imageBlob), prompt });
        if (shared) return;
      }

      if (!blobReady) {
        toast.info('Image file is still preparing. Try again in 1-2 seconds.');
        return;
      }

      await navigator.clipboard.writeText(imageUrl);
      toast.success('File share unsupported. Link copied to clipboard.');
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Share error:', e);
        toast.error('Share failed. Could not share image file.');
      }
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
          {isMobileDevice && (
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share Image
            </button>
          )}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            Copy Link
          </button>
        </div>
      )}

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <UIButton
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </UIButton>
        <div className="flex items-center gap-1">
          <UIButton variant="ghost" size="icon" onClick={zoomOut} className="rounded-full" aria-label="Zoom out">
            <ZoomOut className="w-4 h-4" />
          </UIButton>
          <UIButton variant="ghost" size="icon" onClick={zoomIn} className="rounded-full" aria-label="Zoom in">
            <ZoomIn className="w-4 h-4" />
          </UIButton>
        </div>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative select-none"
        style={{ touchAction: scale > 1 ? 'none' : 'pan-y', cursor: scale > 1 ? 'grab' : 'default' }}
        onContextMenu={handleImageContextMenu}
        onTouchStart={handleImageLongPressStart}
        onTouchEnd={handleImageLongPressEnd}
        onTouchMove={handleImageLongPressEnd}
      >
        <AnimatePresence>
          {!imgLoaded && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <ImageSkeleton />
            </motion.div>
          )}
        </AnimatePresence>
        <motion.img
          src={imageUrl}
          alt={prompt || "Generated image"}
          onLoad={() => setImgLoaded(true)}
          style={{
            transform: `translate(${ox}px, ${oy}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: scale === 1 ? 'transform 0.2s ease' : 'none',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            display: imgLoaded ? 'block' : 'none',
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
          draggable={false}
        />
      </div>

      {/* Bottom Actions */}
      {imgLoaded && (
        <div className="relative z-10 px-4 pb-6 pt-3 shrink-0">
          {prompt && (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 px-2">
              {prompt}
            </p>
          )}
          <div className="flex gap-3">
            <UIButton
              onClick={handleDownload}
              className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            >
              <Download className="w-4 h-4" />
              Save Image
            </UIButton>
            {isMobileDevice && (
              <UIButton
                onClick={handleShare}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </UIButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default ImageResult;
