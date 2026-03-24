import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Trash2, LogOut, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleDeleteAccount = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }
    setDeleting(true);
    await base44.auth.updateMe({ deleted: true });
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:bg-none dark:bg-slate-950">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">

        {/* ITonAI Branding + Email Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.02 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-5 mb-6 flex items-center gap-4"
          style={{ boxShadow: "0 4px 24px 0 rgba(80, 80, 180, 0.12)" }}
        >
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995fb83472e84f2aaa7251a/81138c58f_ITonAI.png"
            alt="ITonAI Logo"
            className="w-14 h-14 rounded-xl object-contain"
          />
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">ITonAI</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">office@itonai.ro</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">www.itonai.ro</p>
          </div>
        </motion.div>

        {/* Buy Credits */}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4 overflow-hidden"
        >
          <button
            onClick={() => base44.auth.logout()}
            className="w-full flex items-center gap-3 px-5 py-4 min-h-[56px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 select-none"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Log Out</span>
          </button>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/40 overflow-hidden"
        >
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full flex items-center gap-3 px-5 py-4 min-h-[56px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors duration-150 select-none disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
            <span className="font-medium">
              {deleting ? "Processing..." : showConfirm ? "Tap again to confirm deletion" : "Delete Account"}
            </span>
          </button>
        </motion.div>

        {showConfirm && !deleting && (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-3">
            This action is irreversible. Tap the button again to confirm.
          </p>
        )}
      </div>
    </div>
  );
}