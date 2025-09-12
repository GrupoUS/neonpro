/**
 * @neonpro/ui - NeonPro UI Components Library
 * 
 * This package contains only the KokonutUI Gradient Button and Aceternity Hover-Border Gradient Button
 * components as reusable UI elements for the NeonPro aesthetic clinic management platform.
 * 
 * Built with:
 * - React 19+ with TypeScript strict mode
 * - Tailwind CSS for styling
 * - NeonPro Pantone color palette
 * - class-variance-authority for variant management
 * - Motion/React for animations
 * 
 * @author NeonPro Development Team
 * @version 0.1.0
 */

// Export utility functions
export { cn } from "./utils";

// Export KokonutUI Gradient Button
export { 
  KokonutGradientButton, 
  kokonutGradientButtonVariants,
  type KokonutGradientButtonProps 
} from "./KokonutGradientButton";

// Export Aceternity Hover-Border Gradient Button  
export { 
  AceternityHoverBorderGradientButton,
  type AceternityHoverBorderGradientButtonProps 
} from "./AceternityHoverBorderGradientButton";