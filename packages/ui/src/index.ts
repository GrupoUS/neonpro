// Export theme utilities
export * from './utils';

// Re-export theme APIs at the root to avoid subpath resolution issues in some bundlers/test runners
export { installThemeStyles, themeCss } from './theme';
export { ThemeProviderBridge, useThemeBridge } from './theme/ThemeContext';

// Export UI components - only components that actually exist
export { Alert, AlertDescription, AlertTitle } from './components/ui/alert';
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './components/ui/alert-dialog';
export { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
export { Badge, badgeVariants } from './components/ui/badge';
export { Button, buttonVariants } from './components/ui/button';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from './components/ui/form';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Progress } from './components/ui/progress';
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
export { Separator } from './components/ui/separator';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

// Export hooks
export * from './hooks';

// Export Aceternity components (from single file)
export { EnhancedShineBorder, HoverBorderGradient } from './components/aceternity';
export type { EnhancedShineBorderProps, HoverBorderGradientProps } from './components/aceternity';

// Export MagicUI components (from single file)
export { ShineBorder } from './components/magicui';
export type { ShineBorderProps } from './components/magicui';
