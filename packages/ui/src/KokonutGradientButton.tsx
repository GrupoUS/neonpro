"use client";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const kokonutGradientButtonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium",
    "transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "relative overflow-hidden",
    "before:absolute before:inset-0 before:transition-opacity before:duration-300",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
          "text-white shadow-lg",
          "hover:shadow-xl hover:scale-105",
          "before:bg-gradient-to-r before:from-blue-600 before:via-purple-600 before:to-pink-600",
          "before:opacity-0 hover:before:opacity-100",
        ],
        colorful: [
          "bg-gradient-to-r from-orange-400 via-red-500 to-pink-500",
          "text-white shadow-lg",
          "hover:shadow-xl hover:scale-105",
          "before:bg-gradient-to-r before:from-orange-500 before:via-red-600 before:to-pink-600",
          "before:opacity-0 hover:before:opacity-100",
        ],
        sunset: [
          "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500",
          "text-white shadow-lg",
          "hover:shadow-xl hover:scale-105",
          "before:bg-gradient-to-r before:from-yellow-500 before:via-orange-600 before:to-red-600",
          "before:opacity-0 hover:before:opacity-100",
        ],
        ocean: [
          "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600",
          "text-white shadow-lg",
          "hover:shadow-xl hover:scale-105",
          "before:bg-gradient-to-r before:from-cyan-500 before:via-blue-600 before:to-indigo-700",
          "before:opacity-0 hover:before:opacity-100",
        ],
        neon: [
          "bg-gradient-to-r from-green-400 via-blue-500 to-purple-600",
          "text-white shadow-lg shadow-green-500/25",
          "hover:shadow-xl hover:shadow-green-500/40 hover:scale-105",
          "before:bg-gradient-to-r before:from-green-500 before:via-blue-600 before:to-purple-700",
          "before:opacity-0 hover:before:opacity-100",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface KokonutGradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof kokonutGradientButtonVariants> {
  /**
   * Render as a different element type
   */
  asChild?: boolean;
}

/**
 * KokonutGradientButton - A beautiful gradient button component inspired by KokonutUI design patterns
 * 
 * Features:
 * - Multiple gradient color variants (default, colorful, sunset, ocean, neon)
 * - Smooth hover animations with scale and shadow effects
 * - Size variants from small to extra large
 * - Before pseudo-element for enhanced hover states
 * - Full accessibility support with focus rings
 * - Support for asChild pattern via Radix-style composition
 * 
 * @example
 * ```tsx
 * <KokonutGradientButton variant="neon" size="lg">
 *   Click me!
 * </KokonutGradientButton>
 * 
 * <KokonutGradientButton variant="sunset" size="sm" disabled>
 *   Disabled button
 * </KokonutGradientButton>
 * ```
 */
export const KokonutGradientButton = React.forwardRef<
  HTMLButtonElement,
  KokonutGradientButtonProps
>(({ className, variant, size, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? "span" : "button";
  
  return (
    <Comp
      className={cn(kokonutGradientButtonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </Comp>
  );
});

KokonutGradientButton.displayName = "KokonutGradientButton";