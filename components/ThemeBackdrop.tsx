"use client";
import { AnimatePresence, motion } from "framer-motion";

export default function ThemeBackdrop() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="global-theme"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="pointer-events-none fixed inset-0 -z-10"
      >
        {/* dotted grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:14px_14px]" />
        {/* ambient top wash */}
        <div
          className="absolute inset-x-0 top-0 h-1/2 opacity-30"
          style={{ backgroundImage: 'linear-gradient(180deg, var(--cyan), transparent 60%)' }}
        />
        {/* animated liquid orbs (very subtle) */}
        <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full blur-3xl opacity-25 animate-[orb_16s_ease_infinite]" style={{ background: 'radial-gradient(closest-side, var(--cyan), transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-28 w-[520px] h-[520px] rounded-full blur-3xl opacity-20 animate-[orb_18s_ease_infinite]" style={{ background: 'radial-gradient(closest-side, var(--mint), transparent 70%)' }} />

        <style jsx global>{`
          @keyframes orb {
            0% { transform: translate3d(0,0,0) scale(1); }
            50% { transform: translate3d(10px, -6px, 0) scale(1.03); }
            100% { transform: translate3d(0,0,0) scale(1); }
          }
          @media (prefers-reduced-motion: reduce) {
            [class*="animate-[orb_"] { animation: none !important; }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}
