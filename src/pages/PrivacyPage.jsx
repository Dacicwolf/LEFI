import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. General information",
      content: "LEFI is an application dedicated to generating images based on user commands. We are committed to respecting the confidentiality of data and using it exclusively for the provision and improvement of the service.",
    },
    {
      title: "2. What information do we collect?",
      content: "For the optimal functioning of the application, we may collect certain types of information, including:",
      bullets: [
        "technical data about the device (model, operating system, application version)",
        "information about the use of the application (functions accessed, usage time)",
        "automatically generated data in case of errors (logs)",
      ],
      footer: "LEFI does not request access to unnecessary functions for the purpose of the application and does not collect more data than necessary.",
    },
    {
      title: "3. Use of information",
      content: "The collected data is used for:",
      bullets: [
        "providing application functionalities",
        "improving performance and user experience",
        "diagnosing technical problems",
      ],
      footer: "We do not sell or distribute personal information to third parties, except as required by law or necessary for the operation of the service.",
    },
    {
      title: "4. Permissions and notifications",
      content: "The app may require certain device permissions to function properly. These can be managed or withdrawn at any time from your phone's settings. LEFI may also send notifications (push notifications). These can be disabled at any time in the device settings.",
    },
    {
      title: "5. User rights",
      content: "In accordance with applicable data protection legislation (GDPR), you have the right:",
      bullets: [
        "to request access to personal data",
        "to request their correction or deletion",
        "to restrict or object to processing",
        "request data portability (where applicable)",
      ],
      footer: "To exercise these rights, you can contact us using the details below. If you have given your consent to data processing, you can withdraw it at any time.",
    },
    {
      title: "6. Third-party services",
      content: "LEFI may use external services for analysis and operation (for example, statistics or advertising delivery). These services may collect data according to their own privacy policies. The application may use third-party data analysis services (Google), in which case their privacy policy applies.",
      link: { text: "Google Privacy Policy", url: "https://policies.google.com/privacy?hl=en" },
    },
    {
      title: "7. Log data",
      content: "In the event of errors, the application may automatically collect technical information (such as device type or time of use) to identify and resolve problems.",
    },
    {
      title: "8. Cookies and similar technologies",
      content: "The application does not directly use cookies, but certain integrated third-party services may use similar technologies for analysis and optimization. You can control these preferences in your device or app settings.",
    },
    {
      title: "9. Data security",
      content: "Data is transferred over a secure connection as we strive to protect user information. However, please note that no data transmission or storage system can be guaranteed to be 100% secure.",
    },
    {
      title: "10. External links",
      content: "The application may contain links to external sites or services. We recommend that you consult their privacy policy when accessing those links. We are not responsible for their content or privacy policies.",
    },
    {
      title: "11. Policy changes",
      content: "This policy may be updated periodically. Any changes will be posted in this section, and continued use of the application constitutes acceptance of the new terms.",
    },
    {
      title: "12. Effective date",
      content: "This version of the policy is valid from the date of publication in the application.",
    },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-none dark:bg-slate-950" role="region" aria-label="Privacy Policy">
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy – LEFI</h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            This Privacy Policy explains how the LEFI app collects, uses, and protects user information. By using the app, you consent to the practices described below.
          </p>

          {sections.map(({ title, content, bullets, footer, link }) => (
            <div key={title} className="space-y-2">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {content}
                {link && (
                  <> <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 underline">{link.text}</a>.</>
                )}
              </p>
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
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">13. Contact</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              For questions, requests or suggestions related to this Privacy Policy, you can contact us at:
            </p>
            <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">Email: office@itonai.ro</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}