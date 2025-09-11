"use client";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

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
        // NeonPro Aesthetic Clinic Pantone Palette Variants
        primary: [
          "bg-gradient-to-r from-[#112031] via-[#294359] to-[#112031]",
          "text-white shadow-lg",
          "hover:shadow-xl hover:scale-105",
          "before:bg-gradient-to-r before:from-[#294359] before:via-[#AC9469] before:to-[#294359]",
          "before:opacity-0 hover:before:opacity-100",
        ],
        secondary: [
          "bg-gradient-to-r from-[#AC9469] via-[#B4AC9C] to-[#AC9469]",
          "text-[#112031] shadow-lg",
          "hover:shadow-xl hover:scale-105",
          "before:bg-gradient-to-r before:from-[#B4AC9C] before:via-[#D2D0C8] before:to-[#B4AC9C]",
          "before:opacity-0 hover:before:opacity-100",
        ],
        accent: [
          "bg-gradient-to-r from-[#294359] via-[#AC9469] to-[#294359]",
          "text-white shadow-lg",
          "hover:shadow-xl hover:scale-105",
          "before:bg-gradient-to-r before:from-[#AC9469] before:via-[#112031] before:to-[#AC9469]",
          "before:opacity-0 hover:before:opacity-100",
        ],
        neutral: [
          "bg-gradient-to-r from-[#B4AC9C] via-[#D2D0C8] to-[#B4AC9C]",
          "text-[#112031] shadow-lg",
          "hover:shadow-xl hover:scale-105",
          "before:bg-gradient-to-r before:from-[#D2D0C8] before:via-[#B4AC9C] before:to-[#D2D0C8]",
          "before:opacity-0 hover:before:opacity-100",
        ],
        elegant: [
          "bg-gradient-to-r from-[#112031] via-[#AC9469] to-[#112031]",
          "text-white shadow-lg shadow-[#AC9469]/25",
          "hover:shadow-xl hover:shadow-[#AC9469]/40 hover:scale-105",
          "before:bg-gradient-to-r before:from-[#294359] before:via-[#D2D0C8] before:to-[#294359]",
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
      variant: "primary",
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
 * KokonutGradientButton - A beautiful gradient button component with NeonPro aesthetic clinic branding
 * 
 * Features:
 * - NeonPro Pantone palette gradient variants (primary, secondary, accent, neutral, elegant)
 * - Smooth hover animations with scale and shadow effects
 * - Size variants from small to extra large
 * - Before pseudo-element for enhanced hover states
 * - Full accessibility support with focus rings
 * - Support for asChild pattern via Radix-style composition
 * 
 * @example
 * ```tsx
 * <KokonutGradientButton variant="elegant" size="lg">
 *   Agendar Tratamento
 * </KokonutGradientButton>
 * 
 * <KokonutGradientButton variant="secondary" size="sm" disabled>
 *   Indisponível
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