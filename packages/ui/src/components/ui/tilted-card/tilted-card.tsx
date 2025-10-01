/**
 * Tilted Card Component
 * 
 * 3D tilted card with interactive hover effects
 * Manual implementation optimized for NEONPRO aesthetic clinics
 */

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  tiltAmount?: number;
  scaleOnHover?: boolean;
  glowEffect?: boolean;
  backgroundGradient?: boolean;
}

export function TiltedCard({
  children,
  className,
  tiltAmount = 15,
  scaleOnHover = true,
  glowEffect = true,
  backgroundGradient = false,
}: TiltedCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm cursor-pointer",
        backgroundGradient && "bg-gradient-to-br from-card via-card to-neonpro-accent/5",
        className
      )}
      whileHover={{
        rotateX: tiltAmount,
        rotateY: tiltAmount,
        scale: scaleOnHover ? 1.02 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* Glow effect */}
      {glowEffect && (
        <motion.div
          className="absolute -inset-1 rounded-xl bg-gradient-to-r from-neonpro-primary/20 via-neonpro-accent/20 to-neonpro-primary/20 opacity-0 blur-sm"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Main card content */}
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0"
        whileHover={{
          opacity: [0, 1, 0],
          x: ["-100%", "100%"]
        }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

export default TiltedCard;