import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ImageResult() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const imageUrl = params.get("url");
  const prompt = params.get("prompt");
  const [copied, setCopied] = React.useState(false);

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
    <div className="h-screen overflow-y-scroll bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:bg-none dark:bg-slate-950 pb-24" style={{scrollbarWidth: "thin", overflowY: "scroll"}}>
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 py-6 max-w-2xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium mb-6 hover:opacity-70 transition-opacity min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Generate
        </motion.button>

        {/* Image */}
        {imageUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/60 dark:shadow-black/40">
                <img
                  src={imageUrl}
                  alt={prompt}
                  className="w-full object-cover"
                />
                <div className="p-5">
                  {prompt && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {prompt}
                    </p>
                  )}
                  <div className="flex gap-3">
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
            </div>
          </motion.div>
        ) : (
          <div className="text-center text-slate-400 mt-20">No image to display.</div>
        )}
      </div>
    </div>
  );
}