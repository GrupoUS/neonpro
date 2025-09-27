import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for combining classes (shadcn/ui requirement)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// NeonPro Brand Utility Functions from @apex-ui-ux-designer.md
export function getNeonProVariantClasses(variant: 'primary' | 'secondary' | 'accent' | 'medical' = 'primary') {
  const variants = {
    primary: 'bg-neonpro-primary hover:bg-neonpro-primary/90 text-white',
    secondary: 'bg-neonpro-neutral hover:bg-neonpro-neutral/90 text-neonpro-deep-blue',
    accent: 'bg-neonpro-accent hover:bg-neonpro-accent/90 text-neonpro-deep-blue',
    medical: 'bg-neonpro-deep-blue hover:bg-neonpro-deep-blue/90 text-white'
  }

  return variants[variant]
}

// General helpers
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Re-exports
export * from './date';
export * from './validation';

