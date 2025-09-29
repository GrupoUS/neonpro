/**
 * Gradient Button Component
 * 
 * Beautiful gradient button with NEONPRO branding
 * Aesthetic clinic optimized with accessibility features
 */

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export function GradientButton({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  disabled,
  ...props
}: GradientButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neonpro-primary disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2 text-base gap-2",
    lg: "px-6 py-3 text-lg gap-2.5"
  };

  const variantClasses = {
    primary: "bg-gradient-to-r from-neonpro-primary to-neonpro-accent text-white shadow-lg hover:shadow-xl hover:shadow-neonpro-primary/25 border border-neonpro-primary/20",
    secondary: "bg-gradient-to-r from-neonpro-accent to-neonpro-neutral text-neonpro-deep-blue shadow-md hover:shadow-lg border border-neonpro-accent/30",
    outline: "border-2 border-neonpro-primary text-neonpro-primary bg-transparent hover:bg-neonpro-primary hover:text-white",
    ghost: "text-neonpro-primary hover:bg-neonpro-primary/10 hover:text-neonpro-deep-blue"
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      y: -1,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <motion.button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled && !loading ? "hover" : "initial"}
      whileTap={!disabled && !loading ? "tap" : "initial"}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <motion.div
          className="absolute left-1/2 top-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </motion.div>
      )}

      {/* Content container */}
      <motion.div
        className={cn(
          "flex items-center gap-2",
          loading && "opacity-0"
        )}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Left icon */}
        {icon && iconPosition === "left" && (
          <motion.span
            className="flex-shrink-0"
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}

        {/* Button text */}
        <span>{children}</span>

        {/* Right icon */}
        {icon && iconPosition === "right" && (
          <motion.span
            className="flex-shrink-0"
            whileHover={{ rotate: -5 }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.span>
        )}
      </motion.div>

      {/* Ripple effect overlay */}
      <motion.div
        className="absolute inset-0 rounded-md bg-white/20 opacity-0"
        whileTap={{
          opacity: [0, 0.3, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Gradient shine effect */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0"
          whileHover={{
            opacity: [0, 1, 0],
            x: ["-100%", "100%"]
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}

export default GradientButton;