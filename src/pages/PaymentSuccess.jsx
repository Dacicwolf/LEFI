import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLAN_CREDITS = {
  bronze: 40,
  silver: 88,
  gold: 180,
};

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const plan = params.get("plan");
  const creditsToAdd = PLAN_CREDITS[plan] ?? 0;

  const [status, setStatus] = useState("loading"); // loading | done | error | no_plan

  useEffect(() => {
    if (!creditsToAdd) {
      setStatus("no_plan");
      return;
    }
    base44.auth.me().then(async (user) => {
      const current = user.credits ?? 0;
      await base44.auth.updateMe({ credits: current + creditsToAdd });
      setStatus("done");
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  return (
    <div className="min-h-screen bg-background dark:bg-none dark:bg-slate-950 flex items-center justify-center px-4" role="region" aria-label="Payment confirmation page">
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status" />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-10 flex flex-col items-center gap-5 max-w-sm w-full text-center"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">Adding your credits...</p>
          </>
        )}

        {status === "done" && (
          <>
            <CheckCircle className="w-14 h-14 text-green-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h1>
            <p className="text-slate-500 dark:text-slate-400">
              <span className="font-bold text-violet-600 dark:text-violet-400">{creditsToAdd} credits</span> have been added to your account.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl min-h-[48px] font-medium"
            >
              Start Generating
            </Button>
          </>
        )}

        {status === "no_plan" && (
          <>
            <CheckCircle className="w-14 h-14 text-green-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Successful!</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Your payment was received. Credits will be added to your account shortly.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl min-h-[48px] font-medium"
            >
              Start Generating
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-red-500 font-medium">Something went wrong adding your credits. Please contact support.</p>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full min-h-[44px]">
              Go Home
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}