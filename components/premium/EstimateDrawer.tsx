"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Zap } from "lucide-react";
import { formatUSD } from "@/lib/pricing";
import Button from "@/components/ui/Button";

interface EstimateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: {
    setup: number;
    monthly: number;
  };
  timeline: string;
  features: string[];
  onCheckout: () => void;
  loading?: boolean;
}

export default function EstimateDrawer({ 
  isOpen, 
  onClose, 
  estimate, 
  timeline, 
  features, 
  onCheckout,
  loading = false 
}: EstimateDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--bg)] border-l border-white/10 z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[var(--txt)]">Build Estimate</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Timeline Chip */}
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-[var(--mint)]/20 to-[var(--cyan)]/20 border border-[var(--mint)]/30">
                <Clock className="w-4 h-4 text-[var(--mint)]" />
                <span className="text-sm font-medium text-[var(--txt)]">
                  {timeline} delivery
                </span>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-[var(--txt)] text-sm uppercase tracking-wide">
                  Selected Features
                </h3>
                <div className="space-y-2">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 glass rounded-lg"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)]" />
                      <span className="text-[var(--txt)] text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[var(--txt)] text-sm uppercase tracking-wide">
                  Investment
                </h3>
                
                <div className="glass-strong rounded-xl p-4 space-y-4">
                  {/* Setup Cost */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[var(--txt)] font-medium">One-time Setup</div>
                      <div className="text-[var(--muted)] text-sm">Development & Launch</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-[var(--txt)]">
                        {formatUSD(estimate.setup)}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Monthly Cost */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[var(--txt)] font-medium">Monthly</div>
                      <div className="text-[var(--muted)] text-sm">Hosting & Maintenance</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold text-[var(--txt)]">
                        {formatUSD(estimate.monthly)}<span className="text-sm text-[var(--muted)]">/mo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Props */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Zap className="w-4 h-4" />
                  <span>60fps animations & micro-interactions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Calendar className="w-4 h-4" />
                  <span>Dedicated project manager</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Zap className="w-4 h-4" />
                  <span>Premium glass/stone aesthetic</span>
                </div>
              </div>

              {/* CTA */}
              <div className="pt-4 border-t border-white/10">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={onCheckout}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Start Project"}
                </Button>
                <p className="text-center text-xs text-[var(--muted)] mt-3">
                  No upfront payment • Start with discovery call
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}