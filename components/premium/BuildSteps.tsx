"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";

interface BuildStepsProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

const steps = [
  { number: 1, title: "Select", subtitle: "Features & Bundles" },
  { number: 2, title: "Preview", subtitle: "Review Build" },
  { number: 3, title: "Checkout", subtitle: "Complete Order" }
];

export default function BuildSteps({ currentStep, completedSteps, onStepClick }: BuildStepsProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = completedSteps.includes(step.number);
        const isClickable = step.number <= Math.max(currentStep, ...completedSteps) + 1;

        return (
          <div key={step.number} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick?.(step.number)}
              disabled={!isClickable}
              className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isClickable ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-not-allowed opacity-50'}
                ${isActive ? 'glass-strong ring-1 ring-white/20' : 'glass'}
              `}
            >
              {/* Step Number/Check */}
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-lg font-semibold transition-all
                ${isCompleted 
                  ? 'bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] text-black' 
                  : isActive 
                    ? 'bg-white/10 text-[var(--txt)] ring-1 ring-white/20' 
                    : 'bg-white/5 text-[var(--muted)]'
                }
              `}>
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", duration: 0.3 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="number"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="text-sm"
                    >
                      {step.number}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Step Text */}
              <div className="text-left">
                <div className={`font-semibold text-sm ${isActive ? 'text-[var(--txt)]' : 'text-[var(--muted)]'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  {step.subtitle}
                </div>
              </div>

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--mint)]/10 to-[var(--cyan)]/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>

            {/* Arrow Separator */}
            {index < steps.length - 1 && (
              <ChevronRight className={`w-4 h-4 mx-2 ${
                currentStep > step.number ? 'text-[var(--mint)]' : 'text-[var(--muted)]'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}