import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background dark:bg-none dark:bg-slate-950" role="region" aria-label="Terms and Conditions">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100/40 dark:bg-violet-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium mb-6 hover:opacity-70 transition-opacity min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-6 space-y-5"
        >
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Terms and conditions of use – LEFI</h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            By downloading, installing or using the LEFI application, you automatically accept these Terms and Conditions. We recommend that you read them carefully before use. LEFI is the property of ITonAI.
          </p>

          {[
            {
              title: "1. Using the application",
              content: "LEFI offers users the ability to generate images using artificial intelligence. The application must only be used for lawful purposes and in accordance with these terms.",
              bullets: [
                "copying, modifying or distributing the application or parts thereof",
                "trying to extract source code",
                "creating derivative versions or adaptations of the application",
              ],
              bulletPrefix: "It is not allowed:",
              footer: "All intellectual property rights to the application belong to the developer ITonAI.",
            },
            {
              title: "2. Changes and availability",
              content: "We reserve the right to modify, update or discontinue the application (in whole or in part) at any time without prior notice. It is possible that certain functionalities will become subject to a fee. In this case, you will be clearly informed before any payment is made.",
            },
            {
              title: "3. User responsibility",
              content: "You are responsible for:",
              bullets: [
                "device and application access security",
                "maintaining account confidentiality (if applicable)",
                "compliance with the conditions imposed by the internet provider or mobile operator and the application hosting provider, Base44.com.",
              ],
              footer: "Using the application on modified devices (e.g. root/jailbreak) may lead to improper operation and security risks.",
            },
            {
              title: "4. Connectivity and costs",
              content: "Certain features require internet connection. ITonAI is not responsible for:",
              bullets: [
                "lack of functionality in the absence of connection",
                "mobile data or roaming costs charged by your operator.",
              ],
            },
            {
              title: "5. Third-party services",
              content: "The application may integrate external services (e.g. analytics or advertising), which have their own terms and policies. Their use is subject to those terms.",
            },
            {
              title: "6. Limitation of liability",
              content: "Although we strive to keep the application functional and up-to-date, we do not guarantee:",
              bullets: [
                "error-free operation",
                "permanent compatibility with all devices",
                "continuous availability of the service",
              ],
              footer: "We are not liable for any direct or indirect losses resulting from the use of the application.",
            },
            {
              title: "7. Rights to generated content",
              content: "Images created by users through LEFI belong to them, including usage rights, to the extent permitted by law. However, users are responsible for how they use the generated content.",
            },
            {
              title: "8. Rules regarding generated content",
              content: "To maintain a safe environment, it is prohibited to generate content that:",
              bullets: [
                "is sexually explicit, violent, or offensive",
                "promotes hatred, discrimination, or illegal activities",
                "violates the rights of others (e.g. copyright, image, privacy)",
                "harasses or threatens other people",
              ],
              footer: "We reserve the right to remove inappropriate content and restrict access to users who violate these rules.",
            },
            {
              title: "9. Purchases and subscriptions",
              content: "LEFI may offer additional functionality or content for a fee (subscriptions or in-app purchases). These are:",
              bullets: [
                "intended for personal, non-commercial use",
                "non-transferable and revocable",
                "available according to the conditions displayed at the time of purchase",
              ],
              footer: "Within the limits of applicable law, payments made are non-refundable, except in cases provided for by the distribution platforms (e.g. Google Play or App Store). For issues related to payments or refunds, it is necessary to contact the platform provider through which the purchase was made directly.",
            },
            {
              title: "10. Updates",
              content: "To continue using the application, it may be necessary to install updates. Refusing them may result in limited functionality or the inability to use the application.",
            },
            {
              title: "11. Termination of use",
              content: "We may suspend or terminate access to the application at any time. In the event of termination:",
              bullets: [
                "the granted usage rights cease",
                "you must stop using the application and, if necessary, delete it",
              ],
            },
            {
              title: "12. Modification of terms",
              content: "These Terms may be updated from time to time. Your continued use of the application after changes constitute your acceptance of the new terms.",
            },
            {
              title: "13. Applicable law",
              content: "These Terms are governed by the applicable laws of the European Union and the user's country of residence, unless the law provides otherwise.",
            },
          ].map(({ title, content, bullets, bulletPrefix, footer }) => (
            <div key={title} className="space-y-2">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{content}</p>
              {bulletPrefix && <p className="text-sm text-slate-600 dark:text-slate-300">{bulletPrefix}</p>}
              {bullets && (
                <ul className="list-disc list-inside space-y-1 pl-2">
                  {bullets.map((b) => (
                    <li key={b} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{b}</li>
                  ))}
                </ul>
              )}
              {footer && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{footer}</p>}
            </div>
          ))}

          <div className="space-y-2">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">14. Contact</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              For questions regarding these Terms and Conditions, you can contact us at:
            </p>
            <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">E-mail: office@itonai.ro</p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 italic leading-relaxed">
              By using the LEFI application, you confirm that you have read and accepted these Terms and Conditions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}