"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail, Calendar, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";

interface SupportStripProps {
  onContactSupport?: () => void;
  onScheduleCall?: () => void;
  onEmailSupport?: () => void;
}

export default function SupportStrip({ onContactSupport, onScheduleCall, onEmailSupport }: SupportStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 bg-gradient-to-r from-[var(--mint)]/5 to-[var(--cyan)]/5 border border-[var(--mint)]/20"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-[var(--txt)] mb-2">Need Help?</h3>
        <p className="text-[var(--muted)]">
          Our team is here to support you every step of the way
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Live Chat */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContactSupport}
          className="flex items-center gap-3 p-4 rounded-xl glass hover:glass-strong transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-[var(--txt)] text-sm">Live Chat</div>
            <div className="text-xs text-[var(--muted)]">Instant responses</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--muted)]" />
        </motion.button>

        {/* Schedule Call */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onScheduleCall}
          className="flex items-center gap-3 p-4 rounded-xl glass hover:glass-strong transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-[var(--txt)] text-sm">Schedule Call</div>
            <div className="text-xs text-[var(--muted)]">15-min consultation</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--muted)]" />
        </motion.button>

        {/* Email Support */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEmailSupport}
          className="flex items-center gap-3 p-4 rounded-xl glass hover:glass-strong transition-all text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-[var(--txt)] text-sm">Email Support</div>
            <div className="text-xs text-[var(--muted)]">Detailed assistance</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--muted)]" />
        </motion.button>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10 text-center">
        <p className="text-xs text-[var(--muted)]">
          Typical response time: <span className="text-[var(--mint)]">Under 2 hours</span> during business hours
        </p>
      </div>
    </motion.div>
  );
}