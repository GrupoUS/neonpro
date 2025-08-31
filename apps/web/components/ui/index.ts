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

// Internal AI Assistant Panel Components (T2.2)
export { 
  InternalAssistantPanel,
  type UserRole,
  type QuerySuggestion,
  type QueryResult,
  type InternalAssistantPanelProps 
} from "./internal-assistant-panel";

export { 
  PerformanceInsights,
  type PerformanceMetric,
  type PerformanceInsightsProps 
} from "./performance-insights";

export { 
  ComplianceMonitor,
  type ComplianceItem,
  type DataProcessingActivity,
  type ComplianceMonitorProps 
} from "./compliance-monitor";

export { 
  ResultsVisualization,
  type DataPoint,
  type ChartData,
  type TableData,
  type QueryResult as VizQueryResult,
  type ResultsVisualizationProps 
} from "./results-visualization";

// AI-First Component Patterns (T2.4) - Loading States
export { 
  AILoadingStates,
  PatientAnalysisLoading,
  MedicalQueryLoading,
  VoiceProcessingLoading,
  useAILoadingState
} from "./ai-loading-states";

// AI-First Component Patterns (T2.4) - Confidence Visualization
export { 
  ConfidencePatterns,
  DiagnosisConfidence,
  TreatmentConfidence,
  RiskAssessmentConfidence,
  VoiceRecognitionConfidence,
  MultiConfidence,
  ConfidenceTrend,
  getConfidenceLevel,
  ConfidenceThresholds,
  HealthcareConfidenceCategories,
  type ConfidenceCategory
} from "./confidence-patterns";

// AI-First Component Patterns (T2.4) - Error Boundaries
export { 
  AIErrorBoundary,
  withAIErrorBoundary,
  classifyAIError,
  AIErrorType,
  AIErrorClassification,
  RecoveryActions
} from "./error-boundary-ai";

// AI-First Component Patterns (T2.4) - Context Switching
export { 
  ContextSwitching,
  useContextSwitching,
  ContextSwitchingProvider,
  useContextSwitchingContext,
  QuickContextSwitcher,
  ContextType,
  Department,
  UserRole,
  SwitchReason,
  type ContextState
} from "./context-switching";

// AI-First Component Patterns (T2.4) - Voice Interaction
export { 
  VoiceInteractionUX,
  useVoiceInteraction,
  VoiceMode,
  VoiceContext,
  VoiceState
} from "./voice-interaction-ux";

// Advanced Accessibility e Assistive Technology Integration (T4.3)
export { 
  SwitchNavigationProvider, 
  SwitchNavigationSettings, 
  SwitchNavigationDemo,
  useSwitchNavigation
} from "../accessibility/switch-navigation-controller";

export { 
  EyeTrackingProvider, 
  EyeTrackingSettings, 
  EyeTrackingDemo,
  useEyeTracking
} from "../accessibility/eye-tracking-interaction";

export { 
  TremorFriendlyProvider, 
  TremorFriendlySettings, 
  TremorFriendlyDemo,
  useTremorFriendly
} from "../accessibility/tremor-friendly-controls";

export { 
  VoiceMedicalProvider, 
  VoiceMedicalSettings, 
  VoiceMedicalDemo,
  useVoiceMedical
} from "../accessibility/voice-medical-controller";

export { 
  OneHandedOperationProvider, 
  OneHandedOperationSettings, 
  OneHandedOperationDemo,
  useOneHandedOperation
} from "../accessibility/one-handed-operation-mode";

export { 
  CognitiveAccessibilityProvider, 
  CognitiveAccessibilitySettings, 
  CognitiveAccessibilityDemo,
  useCognitiveAccessibility
} from "../accessibility/cognitive-accessibility-helper";

export { 
  VisualAccessibilityProvider, 
  VisualAccessibilitySettings, 
  VisualAccessibilityDemo,
  useVisualAccessibility
} from "../accessibility/visual-accessibility-enhancer";

export { 
  AssistiveTechnologyAPIProvider, 
  AssistiveTechnologyAPISettings, 
  AssistiveTechnologyAPIDemo,
  useAssistiveTechnologyAPI
} from "../accessibility/assistive-technology-api";

export { 
  AccessibilityIntegrationExample,
  IndividualComponentsDemos
} from "../accessibility/accessibility-integration-example";

// Hooks
export { useChatHandoff } from "../../hooks/use-chat-handoff";

// Types
export type {
  HandoffConfig,
  HandoffState,
  ChatMessage
} from "../../hooks/use-chat-handoff";