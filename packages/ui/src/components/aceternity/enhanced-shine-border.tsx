"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
import { 
  useShineBorderAnimation, 
  type HoverGradientTheme,
  type ShinePattern,
  type ShineIntensity,
  type ShineTheme,
  type ShineSpeed,
} from "../../hooks/useShineBorderAnimation";

interface EnhancedShineBorderProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  as?: React.ElementType;
  
  // Shine Border options
  enableShine?: boolean;
  pattern?: ShinePattern;
  intensity?: ShineIntensity;
  theme?: ShineTheme;
  speed?: ShineSpeed;
  borderWidth?: number;
  color?: string;
  duration?: number;
  blur?: number;
  autoStart?: boolean;
  hoverOnly?: boolean;
  
  // Aceternity Hover Border Gradient options
  enableHoverGradient?: boolean;
  hoverGradientTheme?: HoverGradientTheme;
  hoverClockwise?: boolean;
  hoverDuration?: number;
  hoverGradientColors?: {
    moving?: string;
    highlight?: string;
  };
}

export function EnhancedShineBorder({
  children,
  containerClassName,
  className,
  as: Tag = "div",
  
  // Shine Border props
  enableShine = true,
  pattern = "linear",
  intensity = "normal",
  theme = "gold",
  speed = "normal",
  borderWidth = 1,
  color,
  duration,
  blur,
  autoStart = true,
  hoverOnly = false,
  
  // Hover Gradient props
  enableHoverGradient = false,
  hoverGradientTheme = "blue",
  hoverClockwise = true,
  hoverDuration = 1,
  hoverGradientColors,
  
  ...props
}: EnhancedShineBorderProps) {
  const {
    classNames,
    style,
    handlers,
    hoverGradient,
  } = useShineBorderAnimation({
    enabled: enableShine,
    pattern,
    intensity,
    theme,
    speed,
    borderWidth,
    color,
    duration,
    blur,
    autoStart,
    hoverOnly,
    enableHoverGradient,
    hoverGradientTheme,
    hoverClockwise,
    hoverDuration,
    hoverGradientColors,
  });

  // Combine container classes for both effects
  const combinedContainerClassName = cn(
    enableHoverGradient && hoverGradient.containerClassName,
    containerClassName
  );

  return (
    <Tag
      onMouseEnter={handlers.onMouseEnter}
      onMouseLeave={handlers.onMouseLeave}
      className={cn(
        combinedContainerClassName,
        classNames
      )}
      style={style}
      {...props}
    >
      {/* Content */}
      <div
        className={cn(
          enableHoverGradient 
            ? "w-auto text-white z-10 bg-black px-4 py-2 rounded-[inherit]"
            : "w-full h-full",
          className
        )}
      >
        {children}
      </div>
      
      {/* Aceternity Hover Border Gradient Background */}
      {enableHoverGradient && (
        <>
          <div
            className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
            style={{
              filter: "blur(2px)",
              position: "absolute",
              width: "100%",
              height: "100%",
              background: hoverGradient.backgroundStyle,
              transition: `background ${hoverDuration}s linear`,
            }}
          />
          <div className="bg-black absolute z-1 flex-none inset-[2px] rounded-[100px]" />
        </>
      )}
    </Tag>
  );
}

export type { EnhancedShineBorderProps };