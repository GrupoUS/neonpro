/**
 * @neonpro/ui - Premium UI Components for NeonPro Aesthetic Clinic Platform
 * 
 * This package exports only two button components as per project requirements:
 * - KokonutGradientButton: Beautiful gradient buttons inspired by KokonutUI
 * - AceternityHoverBorderGradientButton: Animated border gradient buttons from Aceternity UI
 * 
 * All other button components have been removed to eliminate conflicts and ambiguity.
 */

export { KokonutGradientButton } from "./KokonutGradientButton";
export type { KokonutGradientButtonProps } from "./KokonutGradientButton";

export { AceternityHoverBorderGradientButton } from "./AceternityHoverBorderGradientButton";
export type { AceternityHoverBorderGradientButtonProps } from "./AceternityHoverBorderGradientButton";

// Re-export utilities that might be needed
export { cn } from "./lib/utils";