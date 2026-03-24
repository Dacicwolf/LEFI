import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * FadeImage - renders an image with a skeleton placeholder that fades out once loaded.
 * Prevents layout shifts by preserving dimensions via className.
 */
export default function FadeImage({ src, alt, className, skeletonClassName, aspectRatio, ...props }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden", skeletonClassName)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-inherit" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  );
}