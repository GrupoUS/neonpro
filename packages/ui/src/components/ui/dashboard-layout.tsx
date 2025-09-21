"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePersistedDashboardLayout } from "../../hooks/use-persisted-dashboard-layout";
import { Button } from "./button";
import { TiltedCard } from "./tilted-card";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  enableTilt?: boolean;
  cardId?: string;
}

export function DashboardCard({
  children,
  className = "",
  enableTilt = true,
  cardId = `card-${Math.random()}`,
}: DashboardCardProps) {
  const { updateCardPosition, getCardPosition, gridConfig } =
    usePersistedDashboardLayout();

  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const position = getCardPosition(cardId);

  const handleDragEnd = useCallback(_() => {
    setIsDragging(false);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const containerRect =
        cardRef.current.offsetParent?.getBoundingClientRect();

      if (containerRect) {
        const relativeX = rect.left - containerRect.left;
        const relativeY = rect.top - containerRect.top;

        updateCardPosition(
          cardId,
          { x: relativeX, y: relativeY },
          { width: rect.width, height: rect.height },
        );
      }
    }
  }, [cardId, updateCardPosition]);

  return (
    <motion.div
      ref={cardRef}
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      animate={{
        x: position.x,
        y: position.y,_}}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 1.05,
        rotate: 2,
        zIndex: 10,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className={`cursor-grab active:cursor-grabbing ${className} ${isDragging ? "z-50" : "z-10"}`}
      style={{
        position: "absolute",
      }}
    >
      {/* Snap grid visual feedback (only during drag) */}
      {isDragging && (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ac9469 1px, transparent 1px),
              linear-gradient(to bottom, #ac9469 1px, transparent 1px)
            `,
            backgroundSize: `${gridConfig.snapSize}px ${gridConfig.snapSize}px`,
          }}
        />
      )}

      {enableTilt ? (
        <TiltedCard className="h-full w-full">{children}</TiltedCard>
      ) : (
        <div className="h-full w-full">{children}</div>
      )}
    </motion.div>
  );
}
interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({
  children,
  className = "",
}: DashboardLayoutProps) {
  const { resetLayout, updateContainerSize, autoDistributeCards, gridConfig } =
    usePersistedDashboardLayout();
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract card IDs from children
  const cardIds = React.Children.toArray(children).map(_(child,_index) => {
    if (React.isValidElement(child)) {
      return (
        child.key?.toString() ||
        (child.props as any)?.id ||
        `dashboard-card-${index}`
      );
    }
    return `dashboard-card-${index}`;
  });

  // Update container size on mount and resize
  useEffect(_() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        updateContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, [updateContainerSize]);

  // Auto-distribute cards when container size is available and children change
  useEffect(_() => {
    if (cardIds.length > 0) {
      // Small delay to ensure container size is updated
      const timer = setTimeout(_() => {
        autoDistributeCards(cardIds);
      }, 100);

      return () => clearTimeout(timer);
    }
    // Explicitly return undefined to satisfy noImplicitReturns in strict DTS builds
    return undefined;
  }, [cardIds.join(","), autoDistributeCards]);

  return (
    <div className={`relative min-h-[600px] ${className}`} ref={containerRef}>
      {/* Reset button */}
      <div className="absolute top-0 right-0 z-20 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={resetLayout}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Resetar Layout
        </Button>
      </div>

      {/* Dashboard Content - Cards with absolute positioning */}
      <div className="relative w-full h-full pt-14">
        {React.Children.map(children,_(child,_index) => {
          if (React.isValidElement(child)) {
            // Generate consistent ID for each card
            const cardId =
              child.key?.toString() ||
              (child.props as any)?.id ||
              `dashboard-card-${index}`;

            return React.cloneElement(child as any, {
              key: cardId,
              cardId: cardId,
              className: `${(child.props as any)?.className || ""} w-80 h-64`, // Fixed size for consistent layout
            });
          }
          return child;
        })}
      </div>

      {/* Helpful hints */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground text-center">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 border">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>
              Arraste os cards para reorganizar • Snap grid:{" "}
              {gridConfig.snapSize}px
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
