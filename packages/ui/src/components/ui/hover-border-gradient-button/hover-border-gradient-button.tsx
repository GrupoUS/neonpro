/**
 * Hover Border Gradient Button Component
 * 
 * Button with animated gradient border on hover
 * NEONPRO aesthetic clinic optimized design
 */

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HoverBorderGradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  borderWidth?: number;
  animationDuration?: number;
  glowIntensity?: "low" | "medium" | "high";
}

export function HoverBorderGradientButton({
  children,
  className,
  variant = "primary",
  size = "md",
  borderWidth = 2,
  animationDuration = 2,
  glowIntensity = "medium",
  disabled,
  ...props
}: HoverBorderGradientButtonProps) {
  // Separate form props from other props to avoid TypeScript conflicts
  const { formAction, form, formEncType, formMethod, formNoValidate, formTarget, ...otherProps } = props;
  
  const baseClasses = "relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neonpro-primary disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  const variantClasses = {
    primary: "bg-neonpro-primary text-white hover:bg-neonpro-primary/90",
    secondary: "bg-neonpro-accent text-neonpro-deep-blue hover:bg-neonpro-accent/90",
    outline: "bg-transparent border border-neonpro-primary text-neonpro-primary hover:bg-neonpro-primary hover:text-white"
  };

  const glowIntensities = {
    low: "0 0 10px",
    medium: "0 0 20px",
    high: "0 0 30px"
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      {...props}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute inset-0 opacity-0 hover:opacity-100"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute inset-0 rounded-md"
          style={{
            background: `conic-gradient(from 0deg, 
              oklch(var(--neonpro-primary)), 
              oklch(var(--neonpro-accent)), 
              oklch(var(--neonpro-deep-blue)), 
              oklch(var(--neonpro-primary))
            )`,
            padding: `${borderWidth}px`,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="h-full w-full rounded-md bg-card" />
        </motion.div>
      </motion.div>

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-md opacity-0"
        whileHover={{
          opacity: 1,
          boxShadow: `${glowIntensities[glowIntensity]} oklch(var(--neonpro-primary))`
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Button content */}
      <span className="relative z-10">
        {children}
      </span>
    </motion.button>
  );
}

export default HoverBorderGradientButton;n;