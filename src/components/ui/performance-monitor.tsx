"use client";

import { usePerformanceMonitor } from "@/hooks/use-performance";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Cpu, Zap } from "lucide-react";
import React from "react";

interface PerformanceMonitorProps {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export function PerformanceMonitor({
  className,
  position = "bottom-right",
}: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const metrics = usePerformanceMonitor(isVisible);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return "text-green-500";
    if (fps >= 30) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          "fixed z-50 p-2 rounded-lg",
          "glass-subtle hover:glass transition-all",
          "group",
          positionClasses[position],
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Activity className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
      </motion.button>

      {/* Monitor Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              "fixed z-40 p-4 rounded-xl min-w-[200px]",
              "glass-card border border-white/20",
              positionClasses[position],
              "mt-12",
              className
            )}
          >
            <h3 className="text-sm font-semibold mb-3 text-foreground/80">
              Performance Monitor
            </h3>

            <div className="space-y-2">
              {/* FPS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">FPS</span>
                </div>
                <span
                  className={cn(
                    "text-sm font-mono font-semibold",
                    getFPSColor(metrics.fps)
                  )}
                >
                  {metrics.fps}
                </span>
              </div>

              {/* Render Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Frame</span>
                </div>
                <span className="text-sm font-mono text-foreground">
                  {(1000 / metrics.fps).toFixed(1)}ms
                </span>
              </div>

              {/* Memory Usage */}
              {metrics.memoryUsage !== undefined && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Memory
                    </span>
                  </div>
                  <span className="text-sm font-mono text-foreground">
                    {metrics.memoryUsage}MB
                  </span>
                </div>
              )}
            </div>

            {/* Performance Bar */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  Performance
                </span>
                <span className="text-xs text-muted-foreground">
                  {metrics.fps >= 55
                    ? "Excellent"
                    : metrics.fps >= 30
                    ? "Good"
                    : "Poor"}
                </span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    metrics.fps >= 55
                      ? "bg-green-500"
                      : metrics.fps >= 30
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  )}
                  animate={{
                    width: `${Math.min((metrics.fps / 60) * 100, 100)}%`,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
