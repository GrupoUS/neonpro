// UI Components Index - NeonPro Aesthetic Clinic
// This index provides backward compatibility for the reorganized component structure
// Components are now organized in atomic design: atoms/ molecules/ organisms/ healthcare/

// Export all components from new atomic structure
export * from '../atoms';
export * from '../molecules';

// Specific re-exports for backward compatibility
export { Button } from '../atoms/button';
export { Badge } from '../atoms/badge';
export { Input } from '../atoms/input';
export { Label } from '../atoms/label';

export { Alert, AlertDescription, AlertTitle } from '../atoms/alert';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../molecules/table';

// Remaining UI components (not yet reorganized)
export * from './card';
export * from './dialog';
export * from './progress';
export * from './scroll-area';
export * from './select';
export * from './separator';
export * from './skeleton';
export * from './sonner';
export * from './switch';
// export * from './table'; // removed to avoid duplicate re-exports via molecules index
export * from './avatar';
export * from './tabs';
export * from './textarea';
export * from './tooltip';

// Custom Advanced Components
export * from './advanced-button';
export * from './beams-background';
export * from './hover-border-gradient';
export * from './shine-border';
export * from './sidebar';

// Demo Components removed from public API (moved to _deprecated)
// If needed for local demos, import directly from the file path under _deprecated.

// AI Chat Components (NeonPro Custom)
export * from './ai-chat';

// Bento Grid Components (NeonPro Custom)
export * from './bento-grid';

// Toaster (special case)
export { Toaster } from './toaster';

// NOTE: All button components are now available locally
// Import buttons using: import { KokonutGradientButton, AceternityHoverBorderGradientButton } from '../atoms/button';
