// UI Components Index - NeonPro Aesthetic Clinic
// This index provides backward compatibility for the reorganized component structure
// Components are now organized in atomic design: atoms/ molecules/ organisms/ healthcare/

// Export all components from new atomic structure
export * from '../atoms';
export * from '../molecules';

// Specific re-exports for backward compatibility
export { Badge } from '../atoms/badge';
export { Button } from '../atoms/button';
export { Input } from '../atoms/input';
export { Label } from '../atoms/label';

export { Alert, AlertDescription, AlertTitle } from '../molecules/alert';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../molecules/card';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../molecules/table';

// Remaining UI components (not yet reorganized)
export * from './progress';
export * from './select';
export * from './sonner';
export * from './tooltip';

// Custom Background Components
export * from './beams-background';

// Custom Advanced Components
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

// NOTE: All button components have been moved to @neonpro/ui package
// Import buttons using: import { KokonutGradientButton, AceternityHoverBorderGradientButton } from "@neonpro/ui";
