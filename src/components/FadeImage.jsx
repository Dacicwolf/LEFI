import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * FadeImage - renders an image with blur-up placeholder for high performance.
 * Uses low-quality placeholder blur during loading, fades to sharp image on load.
 * Prevents layout shifts by preserving dimensions via className.
 */
export default function FadeImage({ src, alt, className, skeletonClassName, aspectRatio, blurDataUrl, ...props }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden", skeletonClassName)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Blur-up placeholder: low-quality image or solid color with animation */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse"
          style={blurDataUrl ? { backgroundImage: `url(${blurDataUrl})`, backgroundSize: "cover" } : undefined}
        />
      )}
      {/* Main image with fade transition */}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading="lazy"
        {...props}
      />
    </div>
  );
}