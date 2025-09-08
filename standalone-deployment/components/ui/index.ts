// Base UI Components
export { Avatar, AvatarFallback, AvatarImage } from "./avatar";
export { Badge } from "./badge";
export { Button } from "./button";
export { Calendar } from "./calendar";
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
export { Checkbox } from "./checkbox";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
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
export { Toaster } from "./toaster";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
export { useToast } from "./use-toast";
export { toast } from "./use-toast";

// Alert Components
export { Alert } from "./alert";

// Loading & State Components
export { EmptyState } from "./empty-state";
export { LoadingSpinner } from "./loading-spinner";
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
export { ExternalChatWidget } from "./external-chat-widget";
export { type Message, MessageRenderer } from "./message-renderer";
export { VoiceInput } from "./voice-input";

// Internal AI Assistant Panel Components (T2.2)
export {
  InternalAssistantPanel,
  type InternalAssistantPanelProps,
  type QueryResult,
  type QuerySuggestion,
  type UserRole,
} from "./internal-assistant-panel";

export {
  PerformanceInsights,
  type PerformanceInsightsProps,
  type PerformanceMetric,
} from "./performance-insights";

export {
  type ComplianceItem,
  ComplianceMonitor,
  type ComplianceMonitorProps,
  type DataProcessingActivity,
} from "./compliance-monitor";

export {
  type ChartData,
  type DataPoint,
  type QueryResult as VizQueryResult,
  ResultsVisualization,
  type ResultsVisualizationProps,
  type TableData,
} from "./results-visualization";

// AI-First Component Patterns (T2.4) - Loading States
export {
  AILoadingStates,
  MedicalQueryLoading,
  PatientAnalysisLoading,
  useAILoadingState,
  VoiceProcessingLoading,
} from "./ai-loading-states";

// AI-First Component Patterns (T2.4) - Confidence Visualization
export {
  type ConfidenceCategory,
  ConfidencePatterns,
  ConfidenceThresholds,
  ConfidenceTrend,
  DiagnosisConfidence,
  getConfidenceLevel,
  HealthcareConfidenceCategories,
  MultiConfidence,
  RiskAssessmentConfidence,
  TreatmentConfidence,
  VoiceRecognitionConfidence,
} from "./confidence-patterns";

// AI-First Component Patterns (T2.4) - Error Boundaries
export {
  AIErrorBoundary,
  AIErrorClassification,
  AIErrorType,
  classifyAIError,
  RecoveryActions,
  withAIErrorBoundary,
} from "./error-boundary-ai";

// AI-First Component Patterns (T2.4) - Context Switching
export {
  type ContextState,
  ContextSwitching,
  ContextSwitchingProvider,
  ContextType,
  Department,
  QuickContextSwitcher,
  SwitchReason,
  useContextSwitching,
  useContextSwitchingContext,
  UserRole,
} from "./context-switching";

// AI-First Component Patterns (T2.4) - Voice Interaction
export {
  useVoiceInteraction,
  VoiceContext,
  VoiceInteractionUX,
  VoiceMode,
  VoiceState,
} from "./voice-interaction-ux";

// Advanced Accessibility e Assistive Technology Integration (T4.3)
export {
  SwitchNavigationDemo,
  SwitchNavigationProvider,
  SwitchNavigationSettings,
  useSwitchNavigation,
} from "../accessibility/switch-navigation-controller";

export {
  EyeTrackingDemo,
  EyeTrackingProvider,
  EyeTrackingSettings,
  useEyeTracking,
} from "../accessibility/eye-tracking-interaction";

export {
  TremorFriendlyDemo,
  TremorFriendlyProvider,
  TremorFriendlySettings,
  useTremorFriendly,
} from "../accessibility/tremor-friendly-controls";

export {
  useVoiceMedical,
  VoiceMedicalDemo,
  VoiceMedicalProvider,
  VoiceMedicalSettings,
} from "../accessibility/voice-medical-controller";

export {
  OneHandedOperationDemo,
  OneHandedOperationProvider,
  OneHandedOperationSettings,
  useOneHandedOperation,
} from "../accessibility/one-handed-operation-mode";

export {
  CognitiveAccessibilityDemo,
  CognitiveAccessibilityProvider,
  CognitiveAccessibilitySettings,
  useCognitiveAccessibility,
} from "../accessibility/cognitive-accessibility-helper";

export {
  useVisualAccessibility,
  VisualAccessibilityDemo,
  VisualAccessibilityProvider,
  VisualAccessibilitySettings,
} from "../accessibility/visual-accessibility-enhancer";

export {
  AssistiveTechnologyAPIDemo,
  AssistiveTechnologyAPIProvider,
  AssistiveTechnologyAPISettings,
  useAssistiveTechnologyAPI,
} from "../accessibility/assistive-technology-api";

export {
  AccessibilityIntegrationExample,
  IndividualComponentsDemos,
} from "../accessibility/accessibility-integration-example";

// Hooks
export { useChatHandoff } from "../../hooks/use-chat-handoff";

// Types
export type { ChatMessage, HandoffConfig, HandoffState } from "../../hooks/use-chat-handoff";
