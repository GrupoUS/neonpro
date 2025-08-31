// Base UI Components
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
export { Badge } from "./badge";
export { Button } from "./button";
export { Calendar } from "./calendar";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
export { Checkbox } from "./checkbox";
export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
export { Form } from "./form";
export { Input } from "./input";
export { Label } from "./label";
export { Popover, PopoverContent, PopoverTrigger } from "./popover";
export { Progress } from "./progress";
export { ScrollArea } from "./scroll-area";
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
export { Separator } from "./separator";
export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";
export { Skeleton } from "./skeleton";
export { Slider } from "./slider";
export { Switch } from "./switch";
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export { Textarea } from "./textarea";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
export { useToast } from "./use-toast";
export { toast } from "./use-toast";
export { Toaster } from "./toaster";

// Alert Components
export { Alert } from "./alert";

// Loading & State Components
export { LoadingSpinner } from "./loading-spinner";
export { EmptyState } from "./empty-state";
export { NotFound } from "./not-found";

// Error Handling
export { ErrorBoundary } from "./error-boundary";
export { RouterError } from "./router-error";
export { RouterLoading } from "./router-loading";

// Date & Time
export { DateRangePicker } from "./date-range-picker";

// Navigation
export { Sidebar } from "./sidebar";

// Custom Effects
export { CosmicGlowButton } from "./CosmicGlowButton";
export { NeonGradientCard } from "./NeonGradientCard";

// Specialized Components
export { ComplianceDashboard } from "./compliance-dashboard";
export { FinancialAnalyticsDashboard } from "./financial-analytics-dashboard";

// Icons
export * from "./icons";

// External AI Chat Widget Components
export { ConfidenceIndicator } from "./confidence-indicator";
export { VoiceInput } from "./voice-input";
export { MessageRenderer, type Message } from "./message-renderer";
export { ExternalChatWidget } from "./external-chat-widget";

// Hooks
export { useChatHandoff } from "../../hooks/use-chat-handoff";

// Types
export type {
  HandoffConfig,
  HandoffState,
  ChatMessage
} from "../../hooks/use-chat-handoff";