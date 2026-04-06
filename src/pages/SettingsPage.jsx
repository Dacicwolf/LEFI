import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import FadeImage from "@/components/FadeImage";
import { motion } from "framer-motion";
import { Trash2, LogOut, Loader2, FileText, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await base44.auth.updateMe({ deleted: true });
    base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-background dark:bg-none dark:bg-slate-950" role="region" aria-label="Settings page">
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status" />

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
          transition={{ delay: 0.05 }} className="bg-white mb-6 px-4 py-4 rounded-2xl dark:bg-slate-900 shadow-lg shadow-violet-500/10 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
          
          
          {/* Left: LEFI branding */}
          <div className="flex items-center gap-3">
            <FadeImage
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995fb83472e84f2aaa7251a/77a5e07ff_lefi_logo.png"
              alt="Lefi Logo"
              className="w-14 h-14 rounded-xl object-contain"
              skeletonClassName="w-14 h-14 rounded-xl"
              aspectRatio="1/1" />
            
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-widest">LEFI</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">V 1.33</p>
            </div>
          </div>

          {/* Right: ITonAI branding */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right">
              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">ITonAI</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">lefi.itonai.ro</p>
            </div>
            <FadeImage
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6995fb83472e84f2aaa7251a/81138c58f_ITonAI.png"
              alt="ITonAI Logo"
              className="w-14 h-14 rounded-xl object-contain"
              skeletonClassName="w-14 h-14 rounded-xl"
              aspectRatio="1/1" />
            
          </div>
        </motion.div>

        {/* Buy Credits */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mb-6">
          
          <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">CREDIT PLANS</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
            { name: "Bronze", credits: 40, price: "$2.9", borderColor: "#b45309", plan: "bronze", img: "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/88cf9d6c2_lefi_logo_bronze.png" },
            { name: "Silver", credits: 88, price: "$5.9", borderColor: "#94a3b8", plan: "silver", img: "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/451aba21c_lefi_logo_silver.png" },
            { name: "Gold", credits: 180, price: "$9.9", borderColor: "#eab308", plan: "gold", img: "https://media.base44.com/images/public/6995fb83472e84f2aaa7251a/91cafad47_lefi_logo_gold.png" }].
            map(({ name, credits, price, borderColor, plan, img }) => {
              const isLoading = purchasingPlan === plan;
              return (
                <button
                  key={plan}
                  onClick={() => {
                    setPurchasingPlan(plan);
                    const href = plan === 'bronze' ? `https://buy.stripe.com/cNi7sM0gq2zM7n9bwB3wQ02?client_reference_id=${user?.email}&success_url=${encodeURIComponent(window.location.origin + '/payment-success?plan=bronze')}` : plan === 'silver' ? `https://buy.stripe.com/9B614o6EOfmy6j51W13wQ01?client_reference_id=${user?.email}&success_url=${encodeURIComponent(window.location.origin + '/payment-success?plan=silver')}` : `https://buy.stripe.com/9B63cw7IS2zM5f1eIN3wQ00?client_reference_id=${user?.email}&success_url=${encodeURIComponent(window.location.origin + '/payment-success?plan=gold')}`;
                    window.open(href, '_blank', 'noopener,noreferrer');
                  }}
                  disabled={isLoading}
                  aria-label={`Buy ${name} plan – ${credits} credits for ${price}`}
                  style={{ borderColor }}
                  className="bg-white py-2 rounded-2xl dark:bg-slate-900 border-2 min-h-[44px] flex flex-col items-center gap-2 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:hover:shadow-sm disabled:hover:scale-100">
                  
                  
                  {isLoading ?
                  <div className="w-12 h-12 flex items-center justify-center"><div className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div> :

                  <FadeImage src={img} alt={name} className="transition-opacity duration-300 opacity-100 w-12 h-12 rounded-xl object-contain" skeletonClassName="w-12 h-12 rounded-xl" aspectRatio="1/1" />
                  }
                  <p className="text-slate-900 text-base font-semibold dark:text-white">{name}</p>
                  <p className="text-violet-600 text-base font-bold dark:text-violet-400">{credits} 🪙</p>
                  <p className="text-slate-500 text-sm dark:text-slate-400">{isLoading ? 'Opening...' : price}</p>
                </button>);

            })}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200">
          
          <button
            onClick={async () => {try {await base44.auth.logout('/');} catch (e) {localStorage.clear();sessionStorage.clear();window.location.replace('/');}}}
            aria-label="Log out of your account"
            className="w-full flex items-center gap-3 px-5 py-4 min-h-[56px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 select-none">
            
            <LogOut className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Log Out</span>
            {user?.email && <span className="text-xs text-slate-400 ml-1">({user.email})</span>}
          </button>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/40 mb-4 overflow-hidden">
          <button
            disabled={deleting}
            aria-label="Delete your account permanently"
            onClick={() => setDeleteDialogOpen(true)}
            className="w-full flex items-center gap-3 px-5 py-4 min-h-[56px] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors duration-150 select-none disabled:opacity-60">
            {deleting ?
            <Loader2 className="w-5 h-5 animate-spin" /> :
            <Trash2 className="w-5 h-5" />
            }
            <span className="font-medium">{deleting ? "Processing..." : "Delete Account"}</span>
          </button>
        </motion.div>

        {/* Terms and Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200">
          <button
            onClick={() => navigate("/terms")}
            aria-label="View Terms and Conditions"
            className="w-full flex items-center gap-3 px-5 py-4 min-h-[56px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 select-none">
            <FileText className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Terms and conditions of use</span>
          </button>
        </motion.div>

        {/* Privacy Policy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.19 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mb-4 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200">
          <button
            onClick={() => navigate("/privacy")}
            aria-label="View Privacy Policy"
            className="w-full flex items-center gap-3 px-5 py-4 min-h-[56px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150 select-none">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Privacy Policy</span>
          </button>
        </motion.div>

        {/* Delete Confirm Modal */}
        {deleteDialogOpen &&
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-red-100 dark:border-red-900/40">
              <h2 className="text-lg font-bold text-red-600 mb-2">Delete Account?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                This action is <strong>permanent and irreversible</strong>. All your data, including credits and generated images, will be lost.
              </p>
              <div className="flex gap-3">
                <button
                onClick={() => setDeleteDialogOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px] font-medium">
                
                  Cancel
                </button>
                <button
                onClick={() => {handleDeleteAccount();setDeleteDialogOpen(false);}}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors min-h-[44px] font-medium">
                
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>);

}