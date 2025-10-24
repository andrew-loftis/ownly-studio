import React, { forwardRef, ReactNode } from "react";

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  className?: string;
  variant?: "glass" | "panel" | "solid";
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  as?: React.ElementType;
  interactive?: boolean;
}

const Card = forwardRef<HTMLElement, CardProps>(({
  children,
  className = "",
  variant = "glass",
  rounded = "xl",
  as: Component = "div",
  interactive = false,
  ...props
}, ref) => {
  const baseStyles = "relative overflow-hidden transition-all duration-200";
  
  const variantStyles = {
    glass: "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg",
    panel: "bg-[var(--bg-3)] border border-white/5",
    solid: "bg-[var(--bg-2)] border border-white/10"
  };

  const roundedStyles = {
    sm: "rounded-sm",
    md: "rounded-md", 
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full"
  };

  const focusStyles = interactive ? [
    "focus:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--mint)]/40",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-[var(--bg-1)]",
    "cursor-pointer",
    "hover:border-white/20",
    `focus-rounded-${rounded}`
  ].join(" ") : "";

  const interactiveStyles = interactive ? "hover:scale-[1.02] active:scale-[0.98]" : "";

  const combinedClassName = [
    baseStyles,
    variantStyles[variant],
    roundedStyles[rounded],
    focusStyles,
    interactiveStyles,
    className
  ].filter(Boolean).join(" ");

  return (
    <Component
      ref={ref}
      className={combinedClassName}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = "Card";

export default Card;
