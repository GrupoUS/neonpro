"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import {
  useShineBorderAnimation,
  type HoverGradientTheme,
} from "../../hooks/useShineBorderAnimation";

interface HoverBorderGradientProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  as?: React.ElementType;
  duration?: number;
  clockwise?: boolean;
  theme?: HoverGradientTheme;
  customColors?: {
    moving?: string;
    highlight?: string;
  };
}

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  theme = "blue",
  customColors,
  ...props
}: HoverBorderGradientProps) {
  const { handlers, hoverGradient } = useShineBorderAnimation({
    enabled: false, // Disable shine border, only use hover gradient
    enableHoverGradient: true,
    hoverGradientTheme: theme,
    hoverClockwise: clockwise,
    hoverDuration: duration,
    hoverGradientColors: customColors,
  });

  return (
    <Tag
      onMouseEnter={handlers.onMouseEnter}
      onMouseLeave={handlers.onMouseLeave}
      className={cn(hoverGradient.containerClassName, containerClassName)}
      {...props}
    >
      <div
        className={cn(
          "w-auto text-white z-10 bg-black px-4 py-2 rounded-[inherit]",
          className,
        )}
      >
        {children}
      </div>

      {/* Animated gradient background */}
      <div
        className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
          background: hoverGradient.backgroundStyle,
          transition: `background ${duration}s linear`,
        }}
      />

      {/* Inner background */}
      <div className="bg-black absolute z-1 flex-none inset-[2px] rounded-[100px]" />
    </Tag>
  );
}

export type { HoverBorderGradientProps };
