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
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg shadow-violet-500/10 border border-slate-100 dark:border-slate-800 p-5 mb-6 flex items-center gap-4"
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Buy Credits</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "Bronze", credits: 40, price: "$2.9", border: "border-amber-200 dark:border-amber-800", plan: "bronze", img: "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/88cf9d6c2_lefi_logo_bronze.png" },
              { name: "Silver", credits: 88, price: "$5.9", border: "border-slate-200 dark:border-slate-700", plan: "silver", img: "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/451aba21c_lefi_logo_silver.png" },
              { name: "Gold", credits: 180, price: "$9.9", border: "border-yellow-200 dark:border-yellow-800", plan: "gold", img: "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/91cafad47_lefi_logo_gold.png" },
            ].map(({ name, credits, price, border, plan, img }) => (
              <a
                key={plan}
                href={plan === 'bronze' ? `https://buy.stripe.com/cNi7sM0gq2zM7n9bwB3wQ02?client_reference_id=${user?.email}&success_url=${encodeURIComponent(window.location.origin + '/payment-success?plan=bronze')}` : plan === 'silver' ? `https://buy.stripe.com/9B614o6EOfmy6j51W13wQ01?client_reference_id=${user?.email}&success_url=${encodeURIComponent(window.location.origin + '/payment-success?plan=silver')}` : `https://buy.stripe.com/9B63cw7IS2zM5f1eIN3wQ00?client_reference_id=${user?.email}&success_url=${encodeURIComponent(window.location.origin + '/payment-success?plan=gold')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Buy ${name} plan – ${credits} credits for ${price}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl border ${border} p-4 min-h-[44px] flex flex-col items-center gap-2 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200`}
              >
                <img src={img} alt={name} className="w-12 h-12 rounded-xl object-contain" />
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{name}</p>
                <p className="text-violet-600 dark:text-violet-400 font-bold text-xs">{credits} 🪙</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">{price}</p>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200"
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
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200"
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