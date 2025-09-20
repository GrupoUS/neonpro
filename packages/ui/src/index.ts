// Export theme utilities
export * from "./utils";

// Re-export theme APIs at the root to avoid subpath resolution issues in some bundlers/test runners
export { installThemeStyles, themeCss } from "./theme";
export { ThemeProviderBridge, useThemeBridge } from "./theme/ThemeContext";

// Export UI components
export { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
export { Badge, badgeVariants } from "./components/ui/badge";
export { Button, buttonVariants } from "./components/ui/button";
export { Calendar } from "./components/ui/calendar";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
export { Checkbox } from "./components/ui/checkbox";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
export { EnhancedTable } from "./components/ui/enhanced-table";
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "./components/ui/form";
export { Input } from "./components/ui/input";
export { Label } from "./components/ui/label";
export {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "./components/ui/pagination";
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";
export { Progress } from "./components/ui/progress";
export { RadioGroup, RadioGroupItem } from "./components/ui/radio-group";
export { ScrollArea } from "./components/ui/scroll-area";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
export { Separator } from "./components/ui/separator";
export {
  SmoothDrawer,
  SmoothDrawerClose,
  SmoothDrawerContent,
  SmoothDrawerDescription,
  SmoothDrawerHeader,
  SmoothDrawerTitle,
  SmoothDrawerTrigger,
} from "./components/ui/smooth-drawer";
export { Switch } from "./components/ui/switch";
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";

export { Textarea } from "./components/ui/textarea";
export { TimeSlotPicker } from "./components/ui/time-slot-picker";
export {
  UniversalButton,
  universalButtonVariants,
} from "./components/ui/universal-button";
export type {
  AdvancedAnimationProps,
  UniversalButtonProps,
} from "./components/ui/universal-button";

// Export hooks
export * from "./hooks";
export { usePersistedDashboardLayout } from "./hooks/use-persisted-dashboard-layout";

// Export MagicUI components
export { ShineBorder } from "./components/magicui/shine-border";
export type { ShineBorderProps } from "./components/magicui/shine-border";

// Export Aceternity components
export {
  EnhancedShineBorder,
  HoverBorderGradient,
} from "./components/aceternity";
export type {
  EnhancedShineBorderProps,
  HoverBorderGradientProps,
} from "./components/aceternity";
export { SharedAnimatedList } from "./components/magicui";
export type {
  SharedAnimatedListItem,
  SharedAnimatedListProps,
} from "./components/magicui";

// Export Enhanced Card components
export {
  DashboardCard,
  DashboardLayout,
} from "./components/ui/dashboard-layout";
export {
  DraggableCardBody,
  DraggableCardContainer,
} from "./components/ui/draggable-card";
export {
  ExpandableCard,
  ExpandableCardProvider,
  useExpandableCard,
} from "./components/ui/expandable-card";
export { FocusCards } from "./components/ui/focus-cards";
export { TiltedCard } from "./components/ui/tilted-card";

// Export Healthcare components
export * from "./components/healthcare";
export * from "./components/forms";
export * from "./utils";
