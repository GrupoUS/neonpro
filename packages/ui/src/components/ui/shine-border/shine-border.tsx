/**
 * Shine Border Component
 * 
 * Animated border with shinning effect
 * NEONPRO theme optimized for aesthetic clinic branding
 */

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShineBorderProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  borderRadius?: number;
  duration?: number;
  shineColor?: string;
  theme?: "gold" | "blue" | "accent" | "custom";
}

export function ShineBorder({
  children,
  className,
  borderWidth = 1,
  borderRadius = 8,
  duration = 14,
  shineColor,
  theme = "gold",
}: ShineBorderProps) {
  const themeColors = {
    gold: "oklch(var(--neonpro-primary))",
    blue: "oklch(var(--neonpro-deep-blue))", 
    accent: "oklch(var(--neonpro-accent))",
    custom: shineColor || "oklch(var(--neonpro-primary))"
  };

  const selectedColor = themeColors[theme];

  return (
    <div
      className={cn(
        "relative flex overflow-hidden",
        className
      )}
      style={{
        borderRadius: `${borderRadius}px`,
        padding: `${borderWidth}px`,
      }}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${selectedColor}, transparent, ${selectedColor}, transparent)`,
          borderRadius: `${borderRadius}px`,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Inner content container */}
      <div
        className="relative flex-1 overflow-hidden bg-card"
        style={{
          borderRadius: `${borderRadius - borderWidth}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ShineBorder;