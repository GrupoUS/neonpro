"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function Loading({
  size = "md",
  text = "Loading...",
  className,
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const dotSizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-4",
    fullScreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
    className
  );

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Glass morphism background */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-white/10 backdrop-blur-md",
            "border border-white/20",
            sizeClasses[size]
          )}
          animate={{
            rotate: 360,
            borderColor: [
              "rgba(255,255,255,0.2)",
              "rgba(172,148,105,0.3)",
              "rgba(255,255,255,0.2)",
            ],
          }}
          transition={{
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            },
            borderColor: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />

        {/* Loading dots */}
        <div
          className={cn(
            "relative flex items-center justify-center",
            sizeClasses[size]
          )}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={cn(
                "absolute rounded-full bg-primary",
                dotSizeClasses[size]
              )}
              animate={{
                y: [0, -8, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.15,
                ease: "easeInOut",
              }}
              style={{
                left: `${30 + index * 20}%`,
              }}
            />
          ))}
        </div>
      </div>

      {text && (
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Skeleton loader with glass morphism
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg",
        "bg-white/5 backdrop-blur-sm",
        "border border-white/10",
        className
      )}
    />
  );
}

// Page loading component
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" text="Loading page..." />
    </div>
  );
}
