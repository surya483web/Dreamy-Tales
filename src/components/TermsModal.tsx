import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Shield, FileText, Lock, Scale } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandName?: string;
}

export default function TermsModal({ isOpen, onClose, brandName = "DTSTUDIO" }: TermsModalProps) {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-3xl h-[85vh] sm:h-[80vh] bg-[#0E0E0E] border border-zinc-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-zinc-100 font-sans"
          >
            {/* Elegant Top Bar */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                <span className="font-serif text-sm uppercase tracking-[0.2em] text-zinc-300">
                  {brandName} Legal Guidelines
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 flex items-center justify-center transition-all duration-300 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 space-y-8 scrollbar-none">
              {/* Header */}
              <div className="text-center pb-6 border-b border-zinc-900">
                <h2 className="font-serif text-2xl sm:text-3xl text-white tracking-wide leading-tight">
                  Terms of Service &amp; Privacy Policy
                </h2>
                <p className="font-mono text-[9px] uppercase text-zinc-500 tracking-[0.2em] mt-3">
                  Last Updated: July 2026 &bull; Version 4.2
                </p>
              </div>

              {/* Section 1: Introduction */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5 text-zinc-400">
                  <FileText className="w-4 h-4" />
                  <h3 className="font-serif text-base uppercase tracking-wider text-white">
                    1. Scope of Engagement
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                  By engaging with {brandName} ("the Studio"), you agree to these legal frameworks. The Studio provides premium cinematic filmmaking, high-art photography, and unscripted storytelling. These services are custom tailored to luxury matrimonial celebrations, private commissions, and editorial events.
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                  A binding contract is established only upon the execution of a bespoke Service Agreement and the receipt of the designated initial deposit.
                </p>
              </div>

              {/* Section 2: Creative Control */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5 text-zinc-400">
                  <Scale className="w-4 h-4" />
                  <h3 className="font-serif text-base uppercase tracking-wider text-white">
                    2. Artistic Direction &amp; Creative Control
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                  {brandName} retains absolute creative discretion over the selection, processing, and artistic style of all delivered media. Every wedding and celebration is a live canvas of light, shadow, and unscripted sentiment. Raw human emotion meets architectural composition.
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                  No guarantee is made to capture specific individuals or fleeting moments due to the unpredictable nature of live event coverage. Color grading, soundscapes, and editorial sequencing are proprietary hallmarks of the Studio's design standards.
                </p>
              </div>

              {/* Section 3: Copyright & Ownership */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5 text-zinc-400">
                  <Shield className="w-4 h-4" />
                  <h3 className="font-serif text-base uppercase tracking-wider text-white">
                    3. Intellectual Property Rights
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                  The copyright and all creative ownership of all footage, photographs, and drafts remain permanently vested with the Studio. Clients receive an exclusive, non-transferable, personal-use license to share, print, and display the final delivered assets for private enjoyment.
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                  Any commercial reproduction, third-party vendor usage, or sub-licensing requires express written permission from {brandName}. The Studio reserves the right to showcase curated visual archives on its digital portfolios, editorials, and branding spaces.
                </p>
              </div>

              {/* Section 4: Privacy & Protection */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5 text-zinc-400">
                  <Lock className="w-4 h-4" />
                  <h3 className="font-serif text-base uppercase tracking-wider text-white">
                    4. Privacy and Personal Data Policy
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                  Your trust is our absolute currency. The Studio collects only necessary, secure coordinates, dates, and communication details to facilitate logistics and deliver tailored art direction. No private data is ever shared with, or sold to, unaffiliated third parties.
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                  All personal archives and high-resolution master copies are held on encrypted, private servers to preserve the ultimate confidentiality of our elite clientele.
                </p>
              </div>

              {/* Section 5: Cancellations & Limits */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5 text-zinc-400">
                  <Scale className="w-4 h-4" />
                  <h3 className="font-serif text-base uppercase tracking-wider text-white">
                    5. Cancellation and Force Majeure
                  </h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed pl-6">
                  Deposits are strictly non-refundable as they guarantee the exclusive commitment of the Studio's lead crew and equipment to your private reservation. In extreme circumstances of force majeure (acts of God, sudden natural disruptions, civil restrictions), engagements can be rescheduled subject to calendar availability and revised pricing terms.
                </p>
              </div>
            </div>

            {/* Bottom Bar Close Button */}
            <div className="px-6 py-4 bg-[#0A0A0A] border-t border-zinc-900 flex items-center justify-between shrink-0 text-zinc-500 text-[10px] sm:text-xs">
              <span>&copy; {new Date().getFullYear()} {brandName} Services Pvt. Ltd.</span>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-white text-black font-semibold uppercase tracking-wider rounded text-[10px] hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
