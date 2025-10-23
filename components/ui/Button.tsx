import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "pill";
  size?: "sm" | "md" | "lg";
};

export default function Button({ 
  className, 
  variant = "primary", 
  size = "md",
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles - tactile stone surface
        "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 disabled:opacity-50 disabled:pointer-events-none tactile",
        
        // Size variants
        size === "sm" && "px-3 py-1.5 text-sm rounded-md",
        size === "md" && "px-4 py-2 text-sm rounded-md",
        size === "lg" && "px-6 py-3 text-base rounded-lg",
        
        // Primary variant - mint to cyan gradient with glass edge
        variant === "primary" && "bg-gradient-to-r from-[#22e4c4] to-[#5de0e6] text-black font-semibold border-0 shadow-[0_0_20px_rgba(34,228,196,0.25)] hover:shadow-[0_0_25px_rgba(34,228,196,0.35)] hover:scale-[1.02] active:scale-[0.98]",
        
        // Ghost variant - thin glass border
        variant === "ghost" && "bg-transparent text-[#e8eaed] border border-[rgba(255,255,255,0.08)] hover:border-white/20 hover:bg-white/5 active:bg-white/10",
        
        // Pill variant - rounded full
        variant === "pill" && "rounded-full bg-[#111318] text-[#e8eaed] border border-white/10 hover:border-white/20 hover:bg-[#0f1117]",
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
