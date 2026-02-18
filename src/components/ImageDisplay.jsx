import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ImageDisplay({ imageUrl, prompt }) {
  const [copied, setCopied] = React.useState(false);

  if (!imageUrl) return null;

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
    toast.success("Link copiat!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={imageUrl}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto mt-10"
      >
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-xl transition-opacity duration-500" />
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/60">
            <div className="relative overflow-hidden">
              <img
                src={imageUrl}
                alt={prompt}
                className="w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleCopyLink}
                  className="h-9 w-9 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-700" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleDownload}
                  className="h-9 w-9 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                >
                  <Download className="w-4 h-4 text-slate-700" />
                </Button>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                {prompt}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}