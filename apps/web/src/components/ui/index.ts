// UI Components Index - NeonPro Aesthetic Clinic
// This index provides backward compatibility for the reorganized component structure
// Components are now organized in atomic design: atoms/ molecules/ organisms/ healthcare/

// Export all components from new atomic structure
export * from "../atoms";
export * from "../molecules";
export * from "../organisms";
export * from "../healthcare";

// Specific re-exports for backward compatibility
export { Button } from "../atoms/button";
export { Badge } from "../atoms/badge";
export { Input } from "../atoms/input";
export { Label } from "../atoms/label";

export { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../molecules/card";
export { Alert, AlertDescription, AlertTitle } from "../molecules/alert";
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../molecules/table";

// Remaining UI components (not yet reorganized)
export * from "./progress";
export * from "./select";
export * from "./sonner";
export * from "./tooltip";

// Custom Background Components
export * from "./background-gradient";
export * from "./beams-background";

// Custom Advanced Components  
export * from "./liquid-glass-card";
export * from "./sidebar";

// Demo Components (for testing and examples)
export * from "./sidebar-demo";
export * from "./signup-form-demo";
export * from "./ai-chat-demo";

// AI Chat Components (NeonPro Custom)
export * from "./ai-chat";

// Toaster (special case)
export { Toaster } from "./toaster";

// NOTE: All button components have been moved to @neonpro/ui package
// Import buttons using: import { KokonutGradientButton, AceternityHoverBorderGradientButton } from "@neonpro/ui";