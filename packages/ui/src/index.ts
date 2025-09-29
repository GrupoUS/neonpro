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

// Export working shadcn/ui components
export { Label } from "./components/ui/label";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
} from "./components/ui/select";
export { Checkbox } from "./components/ui/checkbox";
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField
} from "./components/ui/form";
export { Switch } from "./components/ui/switch";

// Real component exports
export { Calendar } from './components/ui/calendar'
export { Command } from './components/ui/command'
export { Dialog } from './components/ui/dialog'
export { DropdownMenu } from './components/ui/dropdown-menu'
export { Popover } from './components/ui/popover'
export { RadioGroup } from './components/ui/radio-group'
export { ScrollArea } from './components/ui/scroll-area'
export { Separator } from './components/ui/separator'
export { Table } from './components/ui/table'
export { Textarea } from './components/ui/textarea'
export { Pagination } from './components/ui/pagination'

export { MobileHealthcareButton } from './components/ui/mobile-healthcare-button'
export { AccessibilityInput } from './components/ui/accessibility-input'
