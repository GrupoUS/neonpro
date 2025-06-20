"use client";

import { useTheme } from "@/contexts/theme";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  color?: "blue" | "green" | "purple" | "red" | "gold";
  className?: string;
  animate?: boolean;
  animationDuration?: number;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  showPercentage = true,
  color = "blue",
  className,
  animate = true,
  animationDuration = 1.5,
}: ProgressRingProps) {
  const { theme } = useTheme();
  const controls = useAnimation();
  const [displayValue, setDisplayValue] = useState(0);

  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    blue: "rgb(59, 130, 246)",
    green: "rgb(34, 197, 94)",
    purple: "rgb(168, 85, 247)",
    red: "rgb(239, 68, 68)",
    gold: "rgb(172, 148, 105)",
  };

  const gradientId = `progress-gradient-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  useEffect(() => {
    if (animate) {
      controls.start({
        strokeDashoffset: strokeDashoffset,
        transition: { duration: animationDuration, ease: "easeOut" },
      });

      // Animate the number display
      const timer = setInterval(() => {
        setDisplayValue((prev) => {
          const increment = percentage / (animationDuration * 60);
          const newValue = Math.min(prev + increment, percentage);
          if (newValue >= percentage) {
            clearInterval(timer);
          }
          return newValue;
        });
      }, 1000 / 60);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, strokeDashoffset, controls, animate, animationDuration]);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      {/* Glass background */}
      <div className="absolute inset-0 rounded-full bg-glass-light/30 dark:bg-glass-dark/30 backdrop-blur-sm" />

      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[color]} stopOpacity="0.8" />
            <stop offset="100%" stopColor={colors[color]} stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700 opacity-20"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={controls}
          filter="url(#glow)"
          className="drop-shadow-lg"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {Math.round(displayValue)}%
          </motion.div>
        )}
        {label && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-gray-600 dark:text-gray-400 mt-1"
          >
            {label}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Multiple Progress Rings Component
export interface MultiProgressRingProps {
  rings: Array<{
    value: number;
    max?: number;
    label: string;
    color?: "blue" | "green" | "purple" | "red" | "gold";
  }>;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function MultiProgressRing({
  rings,
  size = 160,
  strokeWidth = 6,
  className,
}: MultiProgressRingProps) {
  const gap = strokeWidth + 4;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      {rings.map((ring, index) => {
        const ringSize = size - index * gap * 2;
        return (
          <div
            key={index}
            className="absolute inset-0 flex items-center justify-center"
          >
            <ProgressRing
              value={ring.value}
              max={ring.max}
              size={ringSize}
              strokeWidth={strokeWidth}
              color={ring.color}
              showPercentage={index === 0}
              animate
            />
          </div>
        );
      })}

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 mt-4">
        {rings.map((ring, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                ring.color === "blue" && "bg-blue-500",
                ring.color === "green" && "bg-green-500",
                ring.color === "purple" && "bg-purple-500",
                ring.color === "red" && "bg-red-500",
                ring.color === "gold" && "bg-gold"
              )}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {ring.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
