"use client";
import { AnimatePresence, motion } from "framer-motion";
import DotField from "@/components/background/DotField";

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
        {/* site-wide interactive dot grid */}
        <DotField fixed density={28} radius={250} baseAlpha={0.035} peakAlpha={0.65} color="#f2fffb" />
        {/* softer mixed accents instead of a solid top wash */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-24 left-[10%] w-[420px] h-[420px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(closest-side, var(--cyan), transparent 70%)' }}
          />
          <div
            className="absolute -top-40 right-[8%] w-[380px] h-[380px] rounded-full blur-3xl opacity-8"
            style={{ background: 'radial-gradient(closest-side, var(--mint), transparent 70%)' }}
          />
        </div>
        {/* animated liquid orb (extra subtle) */}
        <div className="absolute -bottom-48 -left-28 w-[420px] h-[420px] rounded-full blur-3xl opacity-8 animate-[orb_18s_ease_infinite]" style={{ background: 'radial-gradient(closest-side, var(--mint), transparent 70%)' }} />

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
