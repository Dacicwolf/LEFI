import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ShieldCheck, RefreshCw, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ADMIN_EMAIL = "theodorfl@gmail.com";
const MAX_CREDITS = 50;

export default function AdminPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
    });
  }, []);

  const handleReset = async () => {
    setLoading(true);
    await base44.auth.updateMe({ credits: MAX_CREDITS });
    setUser((u) => ({ ...u, credits: MAX_CREDITS }));
    toast.success(`Credits reset to ${MAX_CREDITS}!`);
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:bg-none dark:bg-slate-950">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 py-10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium mb-8 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center gap-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
          </div>

          <div className="w-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-xl px-6 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Current Credits</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-violet-700 dark:text-violet-300">{user.credits ?? 0}</span>
              <span className="text-lg">🪙</span>
            </div>
          </div>

          <Button
            onClick={handleReset}
            disabled={loading || user.credits >= MAX_CREDITS}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl min-h-[48px] font-medium shadow-lg shadow-violet-500/25 disabled:opacity-40"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Reset to {MAX_CREDITS} Credits
          </Button>

          {user.credits >= MAX_CREDITS && (
            <p className="text-xs text-slate-400 dark:text-slate-500">Credits are already at maximum.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}