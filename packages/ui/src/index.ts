// Export theme utilities
export * from './utils';

// Re-export theme APIs at the root to avoid subpath resolution issues in some bundlers/test runners
export { installThemeStyles, themeCss } from './theme';
export { ThemeProviderBridge, useThemeBridge } from './theme/ThemeContext';

// Export UI components
export { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
export { Badge, badgeVariants } from './components/ui/badge';
export { Button, buttonVariants } from './components/ui/button';
export { Calendar } from './components/ui/calendar';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/ui/card';
export { Checkbox } from './components/ui/checkbox';
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './components/ui/popover';
export {
  RadioGroup,
  RadioGroupItem,
} from './components/ui/radio-group';
export { ScrollArea } from './components/ui/scroll-area';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
export { Textarea } from './components/ui/textarea';
export { UniversalButton, universalButtonVariants } from './components/ui/universal-button';
export type {
  AdvancedAnimationProps,
  UniversalButtonProps,
} from './components/ui/universal-button';

// Export hooks
export * from './hooks';

// Export MagicUI components
export { ShineBorder } from './components/magicui/shine-border';
export type { ShineBorderProps } from './components/magicui/shine-border';

// Export Aceternity components
export { EnhancedShineBorder, HoverBorderGradient } from './components/aceternity';
export type { EnhancedShineBorderProps, HoverBorderGradientProps } from './components/aceternity';
export { SharedAnimatedList } from './components/magicui';
export type { SharedAnimatedListProps, SharedAnimatedListItem } from './components/magicui';
