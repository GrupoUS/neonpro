/**
 * Executive Report Generator Component
 *
 * Advanced report generation system for executive dashboard with
 * customizable templates, automated scheduling, and multiple export formats.
 * Implements Story 7.1 reporting requirements.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  Textarea,
  Switch,
  Progress,
  Alert,
  AlertDescription,
  Separator,
  ScrollArea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import type {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  Calendar,
  CalendarDays,
  Download,
  FileText,
  Mail,
  Settings,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Eye,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Save,
  Send,
} from "lucide-react";

import type {
  KPIMetric,
  DateRangeFilter,
  DashboardAlert,
  ExecutiveSummary,
  ReportTemplate,
  ReportSchedule,
  ReportFormat,
  ReportStatus,
  KPICategory,
} from "@/lib/dashboard/types";
import type { executiveDashboardEngine } from "@/lib/dashboard/executive-dashboard-engine";
import type { formatters } from "@/lib/dashboard/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ExecutiveReportGeneratorProps {
  clinicId: string;
  userId: string;
  kpis: KPIMetric[];
  alerts: DashboardAlert[];
  summary: ExecutiveSummary;
  onReportGenerated?: (report: GeneratedReport) => void;
  onScheduleCreated?: (schedule: ReportSchedule) => void;
  className?: string;
}

interface GeneratedReport {
  id: string;
  name: string;
  template: ReportTemplate;
  format: ReportFormat;
  data: any;
  generatedAt: Date;
  size: number;
  downloadUrl: string;
  status: ReportStatus;
}

interface ReportGenerationConfig {
  template: ReportTemplate;
  format: ReportFormat;
  dateRange: DateRangeFilter;
  includeKPIs: string[];
  includeCharts: boolean;
  includeAlerts: boolean;
  includeSummary: boolean;
  includeRecommendations: boolean;
  customSections: CustomSection[];
  branding: BrandingConfig;
  recipients: string[];
}

interface CustomSection {
  id: string;
  title: string;
  content: string;
  type: "text" | "chart" | "table" | "kpi";
  order: number;
  enabled: boolean;
}

interface BrandingConfig {
  logo: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  footer: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "executive" | "financial" | "operational" | "clinical";
  sections: TemplateSection[];
  defaultFormat: ReportFormat;
  isCustom: boolean;
  createdBy: string;
  createdAt: Date;
}

interface TemplateSection {
  id: string;
  title: string;
  type: "summary" | "kpis" | "charts" | "alerts" | "recommendations" | "custom";
  required: boolean;
  order: number;
  config: any;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ExecutiveReportGenerator: React.FC<ExecutiveReportGeneratorProps> = ({
  clinicId,
  userId,
  kpis,
  alerts,
  summary,
  onReportGenerated,
  onScheduleCreated,
  className,
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [activeTab, setActiveTab] = useState<"generate" | "templates" | "schedules" | "history">(
    "generate",
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);

  // Generation configuration state
  const [config, setConfig] = useState<ReportGenerationConfig>({
    template: null as any,
    format: "pdf",
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    includeKPIs: [],
    includeCharts: true,
    includeAlerts: true,
    includeSummary: true,
    includeRecommendations: true,
    customSections: [],
    branding: {
      logo: "",
      colors: {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#059669",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
      footer: "© 2024 NeonPro Healthcare. All rights reserved.",
    },
    recipients: [],
  });

  // Dialog states
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);

  // Form states
  const [templateForm, setTemplateForm] = useState<Partial<ReportTemplate>>({});
  const [scheduleForm, setScheduleForm] = useState<Partial<ReportSchedule>>({});

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadReportTemplates();
    loadReportSchedules();
    loadReportHistory();
  }, [clinicId]);

  useEffect(() => {
    if (reportTemplates.length > 0 && !config.template) {
      setConfig((prev) => ({
        ...prev,
        template: reportTemplates.find((t) => t.category === "executive") || reportTemplates[0],
      }));
    }
  }, [reportTemplates]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadReportTemplates = useCallback(async () => {
    try {
      // Mock data - in real implementation, this would fetch from API
      const templates: ReportTemplate[] = [
        {
          id: "exec-summary",
          name: "Executive Summary",
          description: "Comprehensive executive dashboard summary with key metrics and insights",
          category: "executive",
          sections: [
            {
              id: "summary",
              title: "Executive Summary",
              type: "summary",
              required: true,
              order: 1,
              config: {},
            },
            {
              id: "kpis",
              title: "Key Performance Indicators",
              type: "kpis",
              required: true,
              order: 2,
              config: {},
            },
            {
              id: "charts",
              title: "Performance Charts",
              type: "charts",
              required: false,
              order: 3,
              config: {},
            },
            {
              id: "alerts",
              title: "Active Alerts",
              type: "alerts",
              required: false,
              order: 4,
              config: {},
            },
            {
              id: "recommendations",
              title: "Recommendations",
              type: "recommendations",
              required: false,
              order: 5,
              config: {},
            },
          ],
          defaultFormat: "pdf",
          isCustom: false,
          createdBy: "system",
          createdAt: new Date(),
        },
        {
          id: "financial-report",
          name: "Financial Performance Report",
          description: "Detailed financial analysis with revenue, costs, and profitability metrics",
          category: "financial",
          sections: [
            {
              id: "financial-summary",
              title: "Financial Summary",
              type: "summary",
              required: true,
              order: 1,
              config: {},
            },
            {
              id: "revenue-kpis",
              title: "Revenue Metrics",
              type: "kpis",
              required: true,
              order: 2,
              config: { category: "financial" },
            },
            {
              id: "financial-charts",
              title: "Financial Charts",
              type: "charts",
              required: true,
              order: 3,
              config: {},
            },
          ],
          defaultFormat: "excel",
          isCustom: false,
          createdBy: "system",
          createdAt: new Date(),
        },
        {
          id: "operational-report",
          name: "Operational Efficiency Report",
          description: "Operational metrics including utilization, productivity, and efficiency",
          category: "operational",
          sections: [
            {
              id: "operational-summary",
              title: "Operational Overview",
              type: "summary",
              required: true,
              order: 1,
              config: {},
            },
            {
              id: "operational-kpis",
              title: "Operational KPIs",
              type: "kpis",
              required: true,
              order: 2,
              config: { category: "operational" },
            },
            {
              id: "efficiency-charts",
              title: "Efficiency Trends",
              type: "charts",
              required: false,
              order: 3,
              config: {},
            },
          ],
          defaultFormat: "pdf",
          isCustom: false,
          createdBy: "system",
          createdAt: new Date(),
        },
      ];

      setReportTemplates(templates);
    } catch (error) {
      console.error("Failed to load report templates:", error);
    }
  }, []);

  const loadReportSchedules = useCallback(async () => {
    try {
      // Mock data - in real implementation, this would fetch from API
      const schedules: ReportSchedule[] = [
        {
          id: "weekly-exec",
          name: "Weekly Executive Summary",
          frequency: "weekly",
          template: "exec-summary",
          recipients: ["ceo@clinic.com", "cfo@clinic.com"],
          enabled: true,
        },
        {
          id: "monthly-financial",
          name: "Monthly Financial Report",
          frequency: "monthly",
          template: "financial-report",
          recipients: ["finance@clinic.com"],
          enabled: true,
        },
      ];

      setReportSchedules(schedules);
    } catch (error) {
      console.error("Failed to load report schedules:", error);
    }
  }, []);

  const loadReportHistory = useCallback(async () => {
    try {
      // Mock data - in real implementation, this would fetch from API
      const reports: GeneratedReport[] = [
        {
          id: "report-1",
          name: "Executive Summary - December 2024",
          template: reportTemplates[0],
          format: "pdf",
          data: {},
          generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          size: 2.5 * 1024 * 1024, // 2.5 MB
          downloadUrl: "/reports/exec-summary-dec-2024.pdf",
          status: "completed",
        },
        {
          id: "report-2",
          name: "Financial Report - November 2024",
          template: reportTemplates[1],
          format: "excel",
          data: {},
          generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          size: 1.8 * 1024 * 1024, // 1.8 MB
          downloadUrl: "/reports/financial-nov-2024.xlsx",
          status: "completed",
        },
      ];

      setGeneratedReports(reports);
    } catch (error) {
      console.error("Failed to load report history:", error);
    }
  }, [reportTemplates]);

  // ============================================================================
  // REPORT GENERATION
  // ============================================================================

  const generateReport = useCallback(async () => {
    if (!config.template) {
      alert("Please select a report template");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate report generation progress
      const progressSteps = [
        { step: "Collecting data...", progress: 20 },
        { step: "Processing KPIs...", progress: 40 },
        { step: "Generating charts...", progress: 60 },
        { step: "Formatting report...", progress: 80 },
        { step: "Finalizing...", progress: 100 },
      ];

      for (const { step, progress } of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setGenerationProgress(progress);
      }

      // Create the generated report
      const newReport: GeneratedReport = {
        id: `report-${Date.now()}`,
        name: `${config.template.name} - ${formatters.date(new Date())}`,
        template: config.template,
        format: config.format,
        data: {
          kpis:
            config.includeKPIs.length > 0
              ? kpis.filter((kpi) => config.includeKPIs.includes(kpi.id))
              : kpis,
          alerts: config.includeAlerts ? alerts : [],
          summary: config.includeSummary ? summary : null,
          dateRange: config.dateRange,
          customSections: config.customSections,
        },
        generatedAt: new Date(),
        size: Math.random() * 3 * 1024 * 1024, // Random size between 0-3MB
        downloadUrl: `/reports/${config.template.id}-${Date.now()}.${config.format}`,
        status: "completed",
      };

      setGeneratedReports((prev) => [newReport, ...prev]);
      onReportGenerated?.(newReport);

      // Send email if recipients are specified
      if (config.recipients.length > 0) {
        await sendReportEmail(newReport, config.recipients);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [config, kpis, alerts, summary, onReportGenerated]);

  const sendReportEmail = async (report: GeneratedReport, recipients: string[]) => {
    try {
      // Mock email sending - in real implementation, this would call an API
      console.log(`Sending report ${report.name} to:`, recipients);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to send report email:", error);
    }
  };

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  const createTemplate = useCallback(async () => {
    if (!templateForm.name || !templateForm.description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const newTemplate: ReportTemplate = {
        id: `template-${Date.now()}`,
        name: templateForm.name,
        description: templateForm.description,
        category: templateForm.category || "executive",
        sections: templateForm.sections || [],
        defaultFormat: templateForm.defaultFormat || "pdf",
        isCustom: true,
        createdBy: userId,
        createdAt: new Date(),
      };

      setReportTemplates((prev) => [...prev, newTemplate]);
      setTemplateForm({});
      setShowTemplateDialog(false);
    } catch (error) {
      console.error("Failed to create template:", error);
      alert("Failed to create template. Please try again.");
    }
  }, [templateForm, userId]);

  // ============================================================================
  // SCHEDULE MANAGEMENT
  // ============================================================================

  const createSchedule = useCallback(async () => {
    if (!scheduleForm.name || !scheduleForm.template || !scheduleForm.frequency) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const newSchedule: ReportSchedule = {
        id: `schedule-${Date.now()}`,
        name: scheduleForm.name,
        frequency: scheduleForm.frequency,
        template: scheduleForm.template,
        recipients: scheduleForm.recipients || [],
        enabled: scheduleForm.enabled !== false,
      };

      setReportSchedules((prev) => [...prev, newSchedule]);
      setScheduleForm({});
      setShowScheduleDialog(false);
      onScheduleCreated?.(newSchedule);
    } catch (error) {
      console.error("Failed to create schedule:", error);
      alert("Failed to create schedule. Please try again.");
    }
  }, [scheduleForm, onScheduleCreated]);

  const toggleSchedule = useCallback(async (scheduleId: string) => {
    try {
      setReportSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId ? { ...schedule, enabled: !schedule.enabled } : schedule,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle schedule:", error);
    }
  }, []);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "generating":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: "bg-blue-100 text-blue-800",
      weekly: "bg-green-100 text-green-800",
      monthly: "bg-purple-100 text-purple-800",
      quarterly: "bg-orange-100 text-orange-800",
    };

    return (
      <Badge className={colors[frequency as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
      </Badge>
    );
  };

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const availableKPIs = useMemo(() => {
    return kpis.map((kpi) => ({
      id: kpi.id,
      name: kpi.name,
      category: kpi.category,
    }));
  }, [kpis]);

  const filteredTemplates = useMemo(() => {
    return reportTemplates.filter(
      (template) => template.category === "executive" || template.isCustom,
    );
  }, [reportTemplates]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Report Generator</h2>
          <p className="text-muted-foreground">
            Generate comprehensive executive reports with customizable templates and automated
            scheduling.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={generateReport}
            disabled={isGenerating || !config.template}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating report...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>
                  Configure your report settings and content options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>Report Template</Label>
                  <Select
                    value={config.template?.id || ""}
                    onValueChange={(value) => {
                      const template = reportTemplates.find((t) => t.id === value);
                      if (template) {
                        setConfig((prev) => ({ ...prev, template }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center space-x-2">
                            <span>{template.name}</span>
                            {template.isCustom && (
                              <Badge variant="outline" className="text-xs">
                                Custom
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Format Selection */}
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={config.format}
                    onValueChange={(value: ReportFormat) =>
                      setConfig((prev) => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="word">Word Document</SelectItem>
                      <SelectItem value="powerpoint">PowerPoint Presentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={config.dateRange.start.toISOString().split("T")[0]}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        setConfig((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: date },
                        }));
                      }}
                    />
                    <Input
                      type="date"
                      value={config.dateRange.end.toISOString().split("T")[0]}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        setConfig((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: date },
                        }));
                      }}
                    />
                  </div>
                </div>

                {/* Content Options */}
                <div className="space-y-3">
                  <Label>Content Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-charts" className="text-sm font-normal">
                        Include Charts
                      </Label>
                      <Switch
                        id="include-charts"
                        checked={config.includeCharts}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({ ...prev, includeCharts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-alerts" className="text-sm font-normal">
                        Include Alerts
                      </Label>
                      <Switch
                        id="include-alerts"
                        checked={config.includeAlerts}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({ ...prev, includeAlerts: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-summary" className="text-sm font-normal">
                        Include Executive Summary
                      </Label>
                      <Switch
                        id="include-summary"
                        checked={config.includeSummary}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({ ...prev, includeSummary: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-recommendations" className="text-sm font-normal">
                        Include Recommendations
                      </Label>
                      <Switch
                        id="include-recommendations"
                        checked={config.includeRecommendations}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({ ...prev, includeRecommendations: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Email Recipients */}
                <div className="space-y-2">
                  <Label>Email Recipients (Optional)</Label>
                  <Textarea
                    placeholder="Enter email addresses separated by commas"
                    value={config.recipients.join(", ")}
                    onChange={(e) => {
                      const emails = e.target.value
                        .split(",")
                        .map((email) => email.trim())
                        .filter((email) => email.length > 0);
                      setConfig((prev) => ({ ...prev, recipients: emails }));
                    }}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>
                  Preview of the selected template and configuration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {config.template ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-semibold">{config.template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {config.template.description}
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Sections:</span>
                          <ul className="mt-1 space-y-1">
                            {config.template.sections.map((section) => (
                              <li key={section.id} className="flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-xs">{section.title}</span>
                                {section.required && (
                                  <Badge variant="outline" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Format:</span>
                        <p className="text-muted-foreground">{config.format.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="font-medium">Period:</span>
                        <p className="text-muted-foreground">
                          {formatters.dateRange(config.dateRange)}
                        </p>
                      </div>
                    </div>

                    {config.recipients.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Recipients:</span>
                        <p className="text-muted-foreground">
                          {config.recipients.length} recipient(s)
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a template to see preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Report Templates</h3>
              <p className="text-sm text-muted-foreground">
                Manage and customize report templates for different use cases.
              </p>
            </div>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Report Template</DialogTitle>
                  <DialogDescription>
                    Create a custom report template with your preferred sections and layout.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template Name</Label>
                      <Input
                        placeholder="Enter template name"
                        value={templateForm.name || ""}
                        onChange={(e) =>
                          setTemplateForm((prev) => ({ ...prev, name: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={templateForm.category || "executive"}
                        onValueChange={(value: any) =>
                          setTemplateForm((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="executive">Executive</SelectItem>
                          <SelectItem value="financial">Financial</SelectItem>
                          <SelectItem value="operational">Operational</SelectItem>
                          <SelectItem value="clinical">Clinical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the purpose and content of this template"
                      value={templateForm.description || ""}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createTemplate}>Create Template</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {template.isCustom && (
                          <>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline">
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sections:</span>
                      <span>{template.sections.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Default Format:</span>
                      <span className="uppercase">{template.defaultFormat}</span>
                    </div>
                    {template.isCustom && (
                      <Badge className="w-full justify-center">Custom Template</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Report Schedules</h3>
              <p className="text-sm text-muted-foreground">
                Automate report generation and delivery with scheduled reports.
              </p>
            </div>
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Report Schedule</DialogTitle>
                  <DialogDescription>
                    Set up automated report generation and delivery.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Schedule Name</Label>
                    <Input
                      placeholder="Enter schedule name"
                      value={scheduleForm.name || ""}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select
                        value={scheduleForm.template || ""}
                        onValueChange={(value) =>
                          setScheduleForm((prev) => ({ ...prev, template: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={scheduleForm.frequency || ""}
                        onValueChange={(value: any) =>
                          setScheduleForm((prev) => ({ ...prev, frequency: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <Textarea
                      placeholder="Enter email addresses separated by commas"
                      value={scheduleForm.recipients?.join(", ") || ""}
                      onChange={(e) => {
                        const emails = e.target.value
                          .split(",")
                          .map((email) => email.trim())
                          .filter((email) => email.length > 0);
                        setScheduleForm((prev) => ({ ...prev, recipients: emails }));
                      }}
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="schedule-enabled"
                      checked={scheduleForm.enabled !== false}
                      onCheckedChange={(checked) =>
                        setScheduleForm((prev) => ({ ...prev, enabled: checked }))
                      }
                    />
                    <Label htmlFor="schedule-enabled">Enable schedule</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createSchedule}>Create Schedule</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {reportSchedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{schedule.name}</h4>
                        {getFrequencyBadge(schedule.frequency)}
                        <Badge
                          variant={schedule.enabled ? "default" : "secondary"}
                          className={schedule.enabled ? "bg-green-100 text-green-800" : ""}
                        >
                          {schedule.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          Template: {reportTemplates.find((t) => t.id === schedule.template)?.name}
                        </span>
                        <span>Recipients: {schedule.recipients.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSchedule(schedule.id)}
                      >
                        {schedule.enabled ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Report History</h3>
              <p className="text-sm text-muted-foreground">
                View and download previously generated reports.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {generatedReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        <h4 className="font-semibold">{report.name}</h4>
                        <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Generated: {formatters.dateTime(report.generatedAt)}</span>
                        <span>Size: {formatFileSize(report.size)}</span>
                        <span>Template: {report.template.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveReportGenerator;
