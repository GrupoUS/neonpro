/**
 * Magic Card Component
 * 
 * Animated card component with magical hover effects
 * Integrated with NEONPRO theme for aesthetic clinic branding
 */

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#AC9469", // NEONPRO primary color
  gradientOpacity = 0.8,
}: MagicCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg transition-all duration-300",
        "hover:border-neonpro-primary/20 hover:shadow-neonpro-primary/10 hover:shadow-xl",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ scale: 1, rotateX: 0, rotateY: 0 }}
      whileHover={{ 
        scale: 1.02,
        rotateX: 2,
        rotateY: 2,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
    >
      {/* Magic gradient overlay */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovering
            ? `radial-gradient(${gradientSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${gradientColor}${Math.round(gradientOpacity * 255).toString(16)}, transparent 80%)`
            : 'none',
        }}
      />
      
      {/* NEONPRO brand accent */}
      <div className="absolute -top-px -left-px h-full w-full rounded-xl border border-neonpro-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
      
      {/* Bottom glow effect */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-neonpro-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-60" />
    </motion.div>
  );
}

export default MagicCard;