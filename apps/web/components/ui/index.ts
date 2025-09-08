// Test-only UI barrel: export only primitives used by unit tests
export { Button } from "./button";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";

// Export existing UI components
export { Alert, AlertDescription, AlertIcon, AlertTitle } from "./alert";
export { LoadingSpinner, PageLoader } from "./loading-spinner";

// Export additional UI components
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
export { Badge } from "./badge";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
export { Input } from "./input";
export { Label } from "./label";
// Note: Re-enabling components needed for dashboard
export { Progress } from "./progress";
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
export { Separator } from "./separator";
export { Switch } from "./switch";
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export { Textarea } from "./textarea";

// Sidebar components
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";

// Dropdown menu components
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
