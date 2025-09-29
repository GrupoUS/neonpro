/**
 * Animated Theme Toggler Component
 * 
 * Beautiful animated toggle for switching between light/dark modes
 * Integrated with NEONPRO theme and constitutional compliance
 */

import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps {
  theme: "light" | "dark";
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
}

export function AnimatedThemeToggler({
  theme,
  onToggle,
  className,
  size = "md",
  ariaLabel = "Toggle theme",
}: AnimatedThemeTogglerProps) {
  const sizeClasses = {
    sm: "h-6 w-11",
    md: "h-8 w-14", 
    lg: "h-10 w-18"
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  const toggleVariants = {
    light: { 
      x: 2,
      rotate: 0,
      scale: 1
    },
    dark: { 
      x: size === "sm" ? 20 : size === "md" ? 24 : 32,
      rotate: 180,
      scale: 1.1
    }
  };

  const backgroundVariants = {
    light: {
      backgroundColor: "oklch(var(--neonpro-accent))",
      borderColor: "oklch(var(--neonpro-primary))"
    },
    dark: {
      backgroundColor: "oklch(var(--neonpro-deep-blue))",
      borderColor: "oklch(var(--neonpro-primary))"
    }
  };

  return (
    <motion.button
      className={cn(
        "relative flex items-center rounded-full border-2 p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neonpro-primary focus:ring-offset-2",
        "hover:shadow-lg hover:shadow-neonpro-primary/20",
        sizeClasses[size],
        className
      )}
      onClick={onToggle}
      variants={backgroundVariants}
      animate={theme}
      aria-label={ariaLabel}
      role="switch"
      aria-checked={theme === "dark"}
      data-testid="theme-toggler"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* Animated toggle circle */}
      <motion.div
        className="flex items-center justify-center rounded-full bg-white shadow-sm"
        style={{
          width: size === "sm" ? 20 : size === "md" ? 24 : 32,
          height: size === "sm" ? 20 : size === "md" ? 24 : 32,
        }}
        variants={toggleVariants}
        animate={theme}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        {/* Icon with rotation animation */}
        <motion.div
          initial={false}
          animate={{ 
            rotate: theme === "dark" ? 360 : 0,
            opacity: 1
          }}
          transition={{ duration: 0.3 }}
        >
          {theme === "light" ? (
            <Sun 
              size={iconSizes[size]} 
              className="text-neonpro-primary"
              aria-hidden="true"
            />
          ) : (
            <Moon 
              size={iconSizes[size]} 
              className="text-neonpro-deep-blue"
              aria-hidden="true"
            />
          )}
        </motion.div>
      </motion.div>

      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0"
        animate={{
          opacity: theme === "dark" ? 0.1 : 0,
          boxShadow: theme === "dark" 
            ? "0 0 20px oklch(var(--neonpro-primary))" 
            : "none"
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Accessibility indicator */}
      <span className="sr-only">
        {theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      </span>
    </motion.button>
  );
}

export default AnimatedThemeToggler;