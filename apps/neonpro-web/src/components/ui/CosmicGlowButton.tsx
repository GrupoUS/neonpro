"use client";

import type { motion } from "framer-motion";
import type React from "react";
import type { cn } from "@/lib/utils";

interface CosmicGlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "accent" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantClasses = {
  primary: {
    bg: "from-primary to-primary/80",
    hover: "hover:from-primary/80 hover:to-primary",
    shadow: "shadow-primary/25",
    border: "border-primary/50",
  },
  secondary: {
    bg: "from-secondary to-secondary/80",
    hover: "hover:from-secondary/80 hover:to-secondary",
    shadow: "shadow-secondary/25",
    border: "border-secondary/50",
  },
  accent: {
    bg: "from-accent to-accent/80",
    hover: "hover:from-accent/80 hover:to-accent",
    shadow: "shadow-accent/25",
    border: "border-accent/50",
  },
  success: {
    bg: "from-success to-success/80",
    hover: "hover:from-success/80 hover:to-success",
    shadow: "shadow-success/25",
    border: "border-success/50",
  },
  warning: {
    bg: "from-warning to-warning/80",
    hover: "hover:from-warning/80 hover:to-warning",
    shadow: "shadow-warning/25",
    border: "border-warning/50",
  },
  danger: {
    bg: "from-danger to-danger/80",
    hover: "hover:from-danger/80 hover:to-danger",
    shadow: "shadow-danger/25",
    border: "border-danger/50",
  },
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export const CosmicGlowButton: React.FC<CosmicGlowButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className,
  type = "button",
}) => {
  const variantStyle = variantClasses[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        !disabled
          ? {
              scale: 1.02,
              y: -2,
              transition: {
                duration: 0.2,
                type: "spring",
                stiffness: 400,
                damping: 17,
              },
            }
          : undefined
      }
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={cn(
        "relative overflow-hidden rounded-lg font-semibold",
        "bg-gradient-to-r",
        variantStyle.bg,
        "border",
        variantStyle.border,
        "shadow-lg",
        variantStyle.shadow,
        "transition-all duration-300",
        variantStyle.hover,
        sizeClasses[size],
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:shadow-xl active:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent",
        "animate-glow-scale",
        className,
      )}
    >
      {/* Cosmic glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-glow-slide" />

      {/* Content */}
      <span className="relative z-10 text-white font-medium">{children}</span>
    </motion.button>
  );
};
