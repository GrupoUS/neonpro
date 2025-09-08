"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Archive,
  Calendar,
  Clock,
  Download,
  Edit,
  Eye,
  FileDown,
  FileText,
  Mail,
  Pause,
  Play,
  Plus,
  Settings,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { ComplianceFramework } from "../types";
import type { GeneratedReport, ReportGenerationConfig } from "./ComplianceReportGenerator";
import type { ReportSchedule } from "./ReportScheduler";

interface ComplianceReportManagerProps {
  className?: string;
}

// Mock data (would be fetched from API)
const mockReports: GeneratedReport[] = [
  {
    id: "report_1",
    title: "Executive Summary - WCAG, LGPD Compliance",
    type: "executive_summary",
    frameworks: ["WCAG", "LGPD"],
    generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    format: "pdf",
    filePath: "/reports/report_1.pdf",
    fileSize: 524_288, // 512KB
    metadata: {
      totalPages: 12,
      dataPointsAnalyzed: 1547,
      reportingPeriod: "Current Status",
      generationTime: 3500,
      complianceScore: 87,
      criticalViolations: 2,
      recommendations: 8,
    },
  },
  {
    id: "report_2",
    title: "Technical Analysis Report - All Frameworks",
    type: "detailed_technical",
    frameworks: ["WCAG", "LGPD", "ANVISA", "CFM"],
    generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    format: "html",
    filePath: "/reports/report_2.html",
    fileSize: 1_048_576, // 1MB
    metadata: {
      dataPointsAnalyzed: 2134,
      reportingPeriod: "2024-01-01 to 2024-01-31",
      generationTime: 7200,
      complianceScore: 82,
      criticalViolations: 5,
      recommendations: 15,
    },
  },
];

const mockSchedules: ReportSchedule[] = [
  {
    id: "schedule_1",
    name: "Weekly Compliance Summary",
    description: "Weekly executive summary for management review",
    enabled: true,
    frequency: "weekly",
    reportConfig: {
      frameworks: ["WCAG", "LGPD", "ANVISA", "CFM"],
      reportType: "executive_summary",
      outputFormat: "pdf",
      includeRecommendations: true,
      includeVisualizations: true,
    },
    distribution: {
      email: {
        enabled: true,
        recipients: ["management@clinic.com", "compliance@clinic.com"],
        includeAttachment: true,
        embedCharts: true,
      },
      dashboard: {
        enabled: true,
        notify: true,
      },
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    isRunning: false,
  },
  {
    id: "schedule_2",
    name: "Monthly Audit Report",
    description: "Comprehensive monthly report for audit preparation",
    enabled: false,
    frequency: "monthly",
    reportConfig: {
      frameworks: ["WCAG", "LGPD", "ANVISA"],
      reportType: "audit_preparation",
      outputFormat: "pdf",
      includeViolationDetails: true,
      includeRecommendations: true,
    },
    distribution: {
      email: {
        enabled: true,
        recipients: ["audit@clinic.com"],
        includeAttachment: true,
        embedCharts: false,
      },
      storage: {
        enabled: true,
        location: "s3://compliance-reports/",
        retention: 2555, // 7 years
      },
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    isRunning: false,
  },
];

const ReportTypeIcon = ({ type }: { type: string; }) => {
  const iconClass = "w-4 h-4";
  switch (type) {
    case "executive_summary":
      return <FileText className={iconClass} />;
    case "detailed_technical":
      return <Settings className={iconClass} />;
    case "audit_preparation":
      return <Archive className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
};

const FormatBadge = ({ format }: { format: string; }) => {
  const formatColors = {
    pdf: "bg-red-100 text-red-800",
    html: "bg-blue-100 text-blue-800",
    json: "bg-green-100 text-green-800",
    csv: "bg-yellow-100 text-yellow-800",
    xlsx: "bg-purple-100 text-purple-800",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs", formatColors[format as keyof typeof formatColors])}
    >
      {format.toUpperCase()}
    </Badge>
  );
};

const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) return "Há poucos minutos";
  if (diffInHours < 24) return `Há ${Math.floor(diffInHours)} horas`;
  if (diffInHours < 48) return "Ontem";
  return `Há ${Math.floor(diffInHours / 24)} dias`;
};

export const ComplianceReportManager: React.FC<ComplianceReportManagerProps> = ({ className }) => {
  const [reports, setReports] = useState<GeneratedReport[]>(mockReports);
  const [schedules, setSchedules] = useState<ReportSchedule[]>(mockSchedules);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFrameworks, setSelectedFrameworks] = useState<ComplianceFramework[]>([
    "WCAG",
    "LGPD",
  ]);
  const [reportType, setReportType] = useState<ReportGenerationConfig["reportType"]>(
    "executive_summary",
  );
  const [outputFormat, setOutputFormat] = useState<ReportGenerationConfig["outputFormat"]>("pdf");

  // Generate report on demand
  const handleGenerateReport = async () => {
    setIsGenerating(true);

    try {
      // Mock report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newReport: GeneratedReport = {
        id: `report_${Date.now()}`,
        title: `${reportType.replace("_", " ")} - ${selectedFrameworks.join(", ")} Compliance`,
        type: reportType,
        frameworks: selectedFrameworks,
        generatedAt: new Date(),
        format: outputFormat,
        filePath: `/reports/report_${Date.now()}.${outputFormat}`,
        fileSize: Math.floor(Math.random() * 1_000_000) + 100_000,
        metadata: {
          totalPages: outputFormat === "pdf" ? Math.floor(Math.random() * 30) + 5 : undefined,
          dataPointsAnalyzed: Math.floor(Math.random() * 2000) + 500,
          reportingPeriod: "Current Status",
          generationTime: Math.floor(Math.random() * 5000) + 1000,
          complianceScore: Math.floor(Math.random() * 40) + 60,
          criticalViolations: Math.floor(Math.random() * 10),
          recommendations: Math.floor(Math.random() * 20) + 5,
        },
      };

      setReports(prev => [newReport, ...prev]);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle schedule enabled status
  const handleToggleSchedule = async (scheduleId: string) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
  };

  // Execute schedule immediately
  const handleExecuteSchedule = async (scheduleId: string) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.id === scheduleId
          ? { ...schedule, isRunning: true }
          : schedule
      )
    );

    // Mock execution
    setTimeout(() => {
      setSchedules(prev =>
        prev.map(schedule =>
          schedule.id === scheduleId
            ? { ...schedule, isRunning: false, lastRun: new Date() }
            : schedule
        )
      );
    }, 3000);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios de Compliance</h2>
          <p className="text-muted-foreground">
            Gere e gerencie relatórios de compliance automatizados
          </p>
        </div>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="schedules">Agendamentos</TabsTrigger>
          <TabsTrigger value="generate">Gerar Novo</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Relatórios Gerados
              </CardTitle>
              <CardDescription>
                Histórico de relatórios de compliance gerados automaticamente e sob demanda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <ReportTypeIcon type={report.type} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{report.title}</h4>
                          <FormatBadge format={report.format} />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatRelativeTime(report.generatedAt)}</span>
                          <span>{formatFileSize(report.fileSize)}</span>
                          {report.metadata.totalPages && (
                            <span>{report.metadata.totalPages} páginas</span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Score: {report.metadata.complianceScore}%</span>
                          <span>Violações Críticas: {report.metadata.criticalViolations}</span>
                          <span>Recomendações: {report.metadata.recommendations}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}

                {reports.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum relatório gerado ainda</p>
                    <p className="text-sm">
                      Gere seu primeiro relatório na aba &quot;Gerar Novo&quot;
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Agendamentos Automáticos
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
              </CardTitle>
              <CardDescription>
                Configure relatórios automáticos recorrentes com distribuição personalizada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Clock className="w-4 h-4" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{schedule.name}</h4>
                          <Badge variant={schedule.enabled ? "default" : "secondary"}>
                            {schedule.enabled ? "Ativo" : "Inativo"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {schedule.frequency}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {schedule.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Frameworks: {schedule.reportConfig.frameworks.join(", ")}</span>
                          <span>Formato: {schedule.reportConfig.outputFormat.toUpperCase()}</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {schedule.lastRun && (
                            <span>Última execução: {formatRelativeTime(schedule.lastRun)}</span>
                          )}
                          {schedule.nextRun && (
                            <span>Próxima: {schedule.nextRun.toLocaleDateString()}</span>
                          )}
                          {schedule.distribution.email?.enabled && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {schedule.distribution.email.recipients.length} destinatários
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecuteSchedule(schedule.id)}
                        disabled={schedule.isRunning}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {schedule.isRunning ? "Executando..." : "Executar Agora"}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSchedule(schedule.id)}
                      >
                        {schedule.enabled
                          ? <Pause className="w-4 h-4 mr-2" />
                          : <Play className="w-4 h-4 mr-2" />}
                        {schedule.enabled ? "Desativar" : "Ativar"}
                      </Button>

                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {schedules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum agendamento configurado</p>
                    <p className="text-sm">
                      Configure relatórios automáticos para economia de tempo
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Gerar Novo Relatório
              </CardTitle>
              <CardDescription>
                Configure e gere um relatório de compliance personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Framework Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Frameworks de Compliance</Label>
                <div className="flex flex-wrap gap-3">
                  {(["WCAG", "LGPD", "ANVISA", "CFM"] as ComplianceFramework[]).map((framework) => (
                    <div key={framework} className="flex items-center space-x-2">
                      <Checkbox
                        id={framework}
                        checked={selectedFrameworks.includes(framework)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedFrameworks(prev => [...prev, framework]);
                          } else {
                            setSelectedFrameworks(prev => prev.filter(f => f !== framework));
                          }
                        }}
                      />
                      <Label htmlFor={framework} className="text-sm font-normal">
                        {framework}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Type */}
              <div className="space-y-3">
                <Label htmlFor="report-type" className="text-sm font-medium">
                  Tipo de Relatório
                </Label>
                <Select value={reportType} onValueChange={(value: unknown) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive_summary">Resumo Executivo</SelectItem>
                    <SelectItem value="detailed_technical">Análise Técnica Detalhada</SelectItem>
                    <SelectItem value="audit_preparation">Preparação para Auditoria</SelectItem>
                    <SelectItem value="trend_analysis">Análise de Tendências</SelectItem>
                    <SelectItem value="violation_analysis">Análise de Violações</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Output Format */}
              <div className="space-y-3">
                <Label htmlFor="output-format" className="text-sm font-medium">
                  Formato de Saída
                </Label>
                <Select
                  value={outputFormat}
                  onValueChange={(value: unknown) => setOutputFormat(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Opções Adicionais</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-recommendations" defaultChecked />
                    <Label htmlFor="include-recommendations" className="text-sm font-normal">
                      Incluir Recomendações
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-visualizations" defaultChecked />
                    <Label htmlFor="include-visualizations" className="text-sm font-normal">
                      Incluir Gráficos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-trends" />
                    <Label htmlFor="include-trends" className="text-sm font-normal">
                      Incluir Análise de Tendências
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-violations" />
                    <Label htmlFor="include-violations" className="text-sm font-normal">
                      Detalhes de Violações
                    </Label>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || selectedFrameworks.length === 0}
                  className="w-full"
                >
                  {isGenerating
                    ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Gerando Relatório...
                      </>
                    )
                    : (
                      <>
                        <FileDown className="w-4 h-4 mr-2" />
                        Gerar Relatório
                      </>
                    )}
                </Button>
              </div>

              {selectedFrameworks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Selecione pelo menos um framework para continuar
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceReportManager;
