// Export UI components that are working correctly
export { Button, buttonVariants } from "./components/ui/button";
export type { ButtonProps } from "./components/ui/button";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card";

// Export basic components that are confirmed working
export { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
export { Badge } from "./components/ui/badge";
export { Input } from "./components/ui/input";
export { Progress } from "./components/ui/progress";

// Export utility functions
export { cn } from "./lib/utils";

// Export only enhanced components that don't have external dependency issues
export { DashboardLayout, DashboardCard } from "./components/ui/dashboard-layout";

// Temporary placeholders for components that need fixing
export const Label = () => null;
export const Select = () => null;
export const SelectContent = () => null;
export const SelectItem = () => null; 
export const SelectTrigger = () => null;
export const SelectValue = () => null;
export const Textarea = () => null;
export const Separator = () => null;
export const Switch = () => null;
export const Checkbox = () => null;
export const RadioGroup = () => null;
export const Calendar = () => null;
export const Command = () => null;
export const Dialog = () => null;
export const DropdownMenu = () => null;
export const Form = () => null;
export const Popover = () => null;
export const ScrollArea = () => null;
export const Table = () => null;
export const Pagination = () => null;