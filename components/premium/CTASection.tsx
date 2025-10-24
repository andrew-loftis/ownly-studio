"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface CTASectionProps {
  title: string;
  description?: string;
  primaryAction: {
    text: string;
    href: string;
  };
  secondaryAction?: {
    text: string;
    href: string;
  };
  gradient?: string;
  className?: string;
}

export default function CTASection({ 
  title, 
  description, 
  primaryAction, 
  secondaryAction,
  gradient = "from-[var(--mint)]/10 to-[var(--cyan)]/5",
  className = "" 
}: CTASectionProps) {
  return (
    <section className={`py-16 ${className}`}>
      <motion.div
        className={`glass-strong rounded-2xl p-8 md:p-12 text-center bg-gradient-to-br ${gradient} relative overflow-hidden`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        {/* Ambient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--mint)]/5 via-transparent to-[var(--cyan)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
          <motion.h2
            className="text-2xl md:text-3xl font-bold text-[var(--txt)]"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>
          
          {description && (
            <motion.p
              className="text-[var(--muted)] text-lg leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {description}
            </motion.p>
          )}
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link href={primaryAction.href}>
              <Button variant="primary" size="lg">
                {primaryAction.text}
              </Button>
            </Link>
            
            {secondaryAction && (
              <Link href={secondaryAction.href}>
                <Button variant="ghost" size="lg">
                  {secondaryAction.text}
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}