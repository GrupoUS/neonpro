// UI Components Index - NeonPro Aesthetic Clinic
// This index provides backward compatibility for the reorganized component structure
// Components are now organized in atomic design: atoms/ molecules/ organisms/ healthcare/

// Export all components from new atomic structure
export * from '../atoms';
export * from '../molecules';

// Specific re-exports for backward compatibility
export { Button, NeumorphButton } from '@neonpro/ui'; // Use Neumorph Button from UI package
export { Badge } from '../atoms/badge';
export { Input } from '../atoms/input';
export { Label } from '../atoms/label';

export { Alert, AlertDescription, AlertTitle } from '../molecules/alert';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../molecules/table';

// Remaining UI components (not yet reorganized)
export * from './progress';
export * from './select';
export * from './sonner';
export * from './tooltip';

// Custom Advanced Components
export * from './beams-background';
export * from './shine-border';
export * from './sidebar';
export * from './universal-button';
export * from './hover-border-gradient';

// Demo Components removed from public API (moved to _deprecated)
// If needed for local demos, import directly from the file path under _deprecated.

// AI Chat Components (NeonPro Custom)
export * from './ai-chat';

// Bento Grid Components (NeonPro Custom)
export * from './bento-grid';

// Toaster (special case)
export { Toaster } from './toaster';

// NOTE: All button components have been moved to @neonpro/ui package
// Import buttons using: import { KokonutGradientButton, AceternityHoverBorderGradientButton } from "@neonpro/ui";
