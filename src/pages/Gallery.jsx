import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FadeImage from "@/components/FadeImage";
import { ImageIcon } from "lucide-react";

export default function Gallery() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      const results = await base44.entities.GeneratedImage.filter(
        { user_email: user.email },
        "-created_date",
        50
      );
      setImages(results);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-none dark:bg-slate-950" role="region" aria-label="Gallery">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 py-6 max-w-2xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-4 text-slate-400">
            <ImageIcon className="w-12 h-12 opacity-40" />
            <p className="text-sm">No images yet. Start generating!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/ImageResult?url=${encodeURIComponent(img.image_url)}&prompt=${encodeURIComponent(img.prompt)}`)}
                className="rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md active:scale-95 transition-all flex flex-col"
              >
                <div className="aspect-square w-full overflow-hidden">
                  <FadeImage
                    src={img.image_url}
                    alt={img.prompt}
                    className="w-full h-full object-cover"
                    skeletonClassName="w-full h-full"
                    aspectRatio="1/1"
                  />
                </div>
                {img.prompt && (
                  <p className="px-2 py-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                    {img.prompt}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}