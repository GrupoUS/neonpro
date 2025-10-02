import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
