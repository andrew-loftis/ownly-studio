"use client";

import { motion } from "framer-motion";

interface FeatureChecklistProps {
  items: string[];
  title?: string;
  className?: string;
}

export default function FeatureChecklist({ 
  items, 
  title,
  className = "" 
}: FeatureChecklistProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <h4 className="text-sm font-medium text-[var(--txt-primary)] uppercase tracking-wide">
          {title}
        </h4>
      )}
      <ul className="space-y-2">
        {items.map((item, index) => (
          <motion.li
            key={index}
            className="flex items-center text-sm text-[var(--txt-secondary)] group"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              ease: "easeOut" 
            }}
          >
            <motion.div
              className="w-4 h-4 rounded-full bg-gradient-to-br from-mint-500 to-cyan-400 flex items-center justify-center mr-3 flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.15 }}
            >
              <svg className="w-2.5 h-2.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <span className="group-hover:text-mint-400 transition-colors duration-200">
              {item}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}