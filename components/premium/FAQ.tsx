"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
  className?: string;
}

export default function FAQ({ 
  items, 
  title = "Frequently Asked Questions",
  className = "" 
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={`space-y-6 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-[var(--txt)] text-center">
          {title}
        </h3>
      )}
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="glass rounded-xl overflow-hidden"
            initial={false}
            animate={{
              backgroundColor: openIndex === index ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)"
            }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="w-full p-4 text-left flex items-center justify-between group"
              onClick={() => toggleItem(index)}
            >
              <span className="text-[var(--txt)] font-medium group-hover:text-[var(--mint)] transition-colors duration-200">
                {item.question}
              </span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-[var(--muted)] group-hover:text-[var(--mint)] transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-[var(--muted)] text-sm leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}