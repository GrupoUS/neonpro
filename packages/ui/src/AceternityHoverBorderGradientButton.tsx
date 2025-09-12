"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export interface AceternityHoverBorderGradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The content to be displayed inside the hover gradient component.
   */
  children: React.ReactNode;
  /**
   * Additional CSS class for the container.
   */
  containerClassName?: string;
  /**
   * Additional CSS class for the inner content.
   */
  className?: string;
  /**
   * The component type that will be used as the container.
   * @default "button"
   */
  as?: React.ElementType;
  /**
   * Duration of the animation cycle in seconds.
   * @default 1
   */
  duration?: number;
  /**
   * Determines the direction of the gradient rotation.
   * @default true
   */
  clockwise?: boolean;
}/**
 * AceternityHoverBorderGradientButton - A button component with animated gradient border that rotates around the button
 * and has special hover effects. Customized with NeonPro aesthetic clinic branding.
 * 
 * Features:
 * - Animated gradient border that rotates continuously
 * - Hover effect that triggers NeonPro Pantone palette highlight
 * - Configurable rotation direction and animation duration
 * - Customizable styling via className props
 * - Supports any HTML element via the 'as' prop
 * 
 * @example
 * ```tsx
 * <AceternityHoverBorderGradientButton 
 *   duration={2} 
 *   clockwise={false}
 *   className="px-6 py-3"
 * >
 *   Consulta Estética
 * </AceternityHoverBorderGradientButton>
 * ```
 */
export function AceternityHoverBorderGradientButton({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: AceternityHoverBorderGradientButtonProps) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    
    // Fallback to TOP if currentDirection is not found
    if (currentIndex === -1) {
      return "TOP";
    }
    
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  // NeonPro Pantone palette gradient mappings
  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, #AC9469 0%, rgba(172, 148, 105, 0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, #294359 0%, rgba(41, 67, 89, 0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, #B4AC9C 0%, rgba(180, 172, 156, 0) 100%)",
    RIGHT: "radial-gradient(16.2% 41.199999999999996% at 100% 50%, #112031 0%, rgba(17, 32, 49, 0) 100%)",
  };

  // NeonPro highlight with primary accent color
  const highlight =
    "radial-gradient(75% 181.15942028985506% at 50% 50%, #AC9469 0%, rgba(172, 148, 105, 0) 100%)";

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
    // Return undefined explicitly for TypeScript
    return undefined;
  }, [hovered, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-full border content-center bg-[#112031]/20 hover:bg-[#112031]/10 transition duration-500 dark:bg-[#D2D0C8]/20 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-auto text-[#D2D0C8] z-10 bg-[#112031] px-4 py-2 rounded-[inherit]",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        )}
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="bg-[#112031] absolute z-1 flex-none inset-[2px] rounded-[100px]" />
    </Tag>
  );
}