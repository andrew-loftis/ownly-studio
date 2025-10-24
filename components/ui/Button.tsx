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
        // Base styles with improved contrast and matching focus radius
        "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-1)] disabled:opacity-50 disabled:pointer-events-none",
        
        // Size variants with matching focus radius
        size === "sm" && "px-3 py-2 text-sm rounded-lg btn-focus-lg",
        size === "md" && "px-5 py-2.5 text-sm rounded-lg btn-focus-lg", 
        size === "lg" && "px-7 py-3.5 text-base rounded-xl btn-focus-xl",
        
        // Primary variant - enhanced mint to cyan gradient
        variant === "primary" && "bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] text-black font-semibold border-0 shadow-[0_4px_12px_rgba(16,242,200,0.2)] hover:shadow-[0_8px_24px_rgba(16,242,200,0.3)] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 before:absolute before:inset-0 before:rounded-[inherit] before:bg-gradient-to-r before:from-white/10 before:to-transparent before:pointer-events-none",
        
        // Ghost variant - enhanced glass effect
        variant === "ghost" && "bg-[var(--glass-bg)] backdrop-blur-sm text-[var(--txt-secondary)] border border-[var(--border-1)] hover:border-[var(--border-2)] hover:bg-[var(--glass-strong-bg)] hover:text-[var(--txt-primary)] hover:-translate-y-0.5 active:translate-y-0",
        
        // Pill variant - tactile surface with full radius focus
        variant === "pill" && "rounded-full btn-focus-full bg-[var(--bg-3)] text-[var(--txt-secondary)] border border-[var(--border-1)] hover:border-[var(--border-2)] hover:bg-[var(--bg-4)] hover:text-[var(--txt-primary)]",
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
