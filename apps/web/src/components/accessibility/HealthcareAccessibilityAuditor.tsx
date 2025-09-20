/**
 * Healthcare Accessibility Auditor Component
 *
 * Developer tool for healthcare accessibility auditing with
 * Brazilian regulatory compliance validation and real-time monitoring
 *
 * @package NeonPro Healthcare Accessibility
 */

import React, { useEffect, useRef, useState } from "react";
import {
  useEmergencyAccessibilityAudit,
  useHealthcareAccessibilityAudit,
} from "../../hooks/useHealthcareAccessibilityAudit";
import {
  AccessibilityAuditResult,
  HealthcareAccessibilityAuditResult,
  HealthcareAccessibilityRecommendation,
} from "../../utils/healthcare-accessibility-audit";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface HealthcareAccessibilityAuditorProps {
  targetElement?: HTMLElement | null;
  className?: string;
  showInProduction?: boolean;
  autoRun?: boolean;
  enableEmergencyMonitoring?: boolean;
  onAuditComplete?: (result: HealthcareAccessibilityAuditResult) => void;
}

/**
 * Healthcare Accessibility Auditor Component
 *
 * Provides comprehensive accessibility auditing interface for healthcare applications
 * with Brazilian regulatory compliance validation (LGPD/ANVISA/CFM)
 */
export function HealthcareAccessibilityAuditor({
  targetElement,
  className = "",
  showInProduction = false,
  autoRun = true,
  enableEmergencyMonitoring = false,
  onAuditComplete,
}: HealthcareAccessibilityAuditorProps) {
  const [selectedJourney, setSelectedJourney] = useState<
    "registration" | "appointment" | "treatment" | "follow-up" | "emergency"
  >("registration");
  const [showDetails, setShowDetails] = useState(false);
  const [exportData, setExportData] = useState<any>(null);

  // Use emergency audit if emergency monitoring is enabled
  const audit = enableEmergencyMonitoring
    ? useEmergencyAccessibilityAudit(targetElement, { autoRun })
    : useHealthcareAccessibilityAudit(targetElement, { autoRun });

  const {
    result,
    isLoading,
    error,
    lastRun,
    auditCount,
    isMonitoring,
    runAudit,
    startMonitoring,
    stopMonitoring,
    getComplianceStatus,
    getCriticalIssuesCount,
    getEmergencyIssuesCount,
    getRecommendationsByPriority,
    isStandardCompliant,
    generateComplianceReport,
    exportAuditData,
    simulateDisabilityProfile,
    simulateEmergencyScenario,
    complianceStatus,
    criticalIssuesCount,
    emergencyIssuesCount,
    isCompliant,
    hasCriticalIssues,
    hasEmergencyIssues,
  } = audit;

  const reportRef = useRef<HTMLDivElement>(null);

  // Handle audit completion
  useEffect(() => {
    if (result && onAuditComplete) {
      onAuditComplete(result);
    }
  }, [result, onAuditComplete]);

  // Export audit data
  const handleExport = () => {
    const data = exportAuditData();
    setExportData(data);

    // Create downloadable file
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `healthcare-accessibility-audit-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Copy report to clipboard
  const handleCopyReport = () => {
    const report = generateComplianceReport();
    if (report) {
      navigator.clipboard.writeText(report);
    }
  };

  // Don't show in production unless explicitly requested
  if (process.env.NODE_ENV === "production" && !showInProduction) {
    return null;
  }

  // Compliance status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-green-400";
      case "fair":
        return "bg-yellow-500";
      case "poor":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Priority badge colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "immediate":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className={`healthcare-accessibility-auditor space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🏥 Healthcare Accessibility Auditor</span>
            <div className="flex items-center gap-2">
              <Badge variant={isCompliant ? "default" : "destructive"}>
                {isCompliant ? "Compliant" : "Non-Compliant"}
              </Badge>
              {isMonitoring && <Badge variant="secondary">Monitoring</Badge>}
            </div>
          </CardTitle>
          <CardDescription>
            WCAG 2.1 AA+ accessibility audit with Brazilian healthcare
            compliance (LGPD/ANVISA/CFM)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <Button onClick={() => runAudit()} disabled={isLoading}>
              {isLoading ? "Running Audit..." : "Run Audit"}
            </Button>
            <Button
              variant="outline"
              onClick={() => simulateDisabilityProfile("visual")}
              disabled={isLoading}
            >
              Simulate Visual Impairment
            </Button>
            <Button
              variant="outline"
              onClick={() => simulateEmergencyScenario()}
              disabled={isLoading}
            >
              Simulate Emergency
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={!result}>
              Export Data
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyReport}
              disabled={!result}
            >
              Copy Report
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {result?.accessibilityScore || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Accessibility</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {result?.healthcareSpecificScore || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Healthcare</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {result?.complianceScore || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Compliance</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${getStatusColor(
                  complianceStatus,
                )} text-white rounded px-2 py-1`}
              >
                {complianceStatus}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Audit Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Running healthcare accessibility audit...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">
              Issues ({result.issues.length})
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              Recommendations ({result.recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audit Overview</CardTitle>
                <CardDescription>
                  Last run: {lastRun?.toLocaleString("pt-BR")} | Audit #
                  {auditCount}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Context Information */}
                  <div>
                    <h4 className="font-semibold mb-2">Audit Context</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      <div>
                        <strong>Patient Journey:</strong>{" "}
                        {result.context.patientJourney}
                      </div>
                      <div>
                        <strong>Data Sensitivity:</strong>{" "}
                        {result.context.dataSensitivity}
                      </div>
                      <div>
                        <strong>Emergency Context:</strong>{" "}
                        {result.context.emergencyContext ? "Yes" : "No"}
                      </div>
                      <div>
                        <strong>User Disability:</strong>{" "}
                        {result.context.userDisabilityProfile || "General"}
                      </div>
                      <div>
                        <strong>Critical Issues:</strong> {criticalIssuesCount}
                      </div>
                      <div>
                        <strong>Emergency Issues:</strong>{" "}
                        {emergencyIssuesCount}
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div>
                    <h4 className="font-semibold mb-2">Score Breakdown</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Overall Accessibility</span>
                          <span>{result.accessibilityScore}%</span>
                        </div>
                        <Progress
                          value={result.accessibilityScore}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Healthcare-Specific</span>
                          <span>{result.healthcareSpecificScore}%</span>
                        </div>
                        <Progress
                          value={result.healthcareSpecificScore}
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Regulatory Compliance</span>
                          <span>{result.complianceScore}%</span>
                        </div>
                        <Progress
                          value={result.complianceScore}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Regulatory Standards */}
                  <div>
                    <h4 className="font-semibold mb-2">
                      Regulatory Compliance
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {result.context.regulatoryRequirements.map((standard) => (
                        <Badge
                          key={standard.id}
                          variant={
                            isStandardCompliant(standard.id)
                              ? "default"
                              : "destructive"
                          }
                          className="justify-start"
                        >
                          {standard.name} ({standard.regulatoryBody})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Issues</CardTitle>
                <CardDescription>
                  {result.issues.length} issues found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {result.issues.map((issue, index) => (
                      <Card
                        key={index}
                        className={
                          issue.impact === "critical" ? "border-red-500" : ""
                        }
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold">
                                {issue.healthcareRuleId}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {issue.description}
                              </p>
                            </div>
                            <Badge
                              variant={getPriorityColor(
                                issue.remediationPriority,
                              )}
                            >
                              {issue.remediationPriority}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline">{issue.impact}</Badge>
                            {issue.emergencyRelevant && (
                              <Badge variant="destructive">Emergency</Badge>
                            )}
                            {issue.lgpdRelevant && (
                              <Badge variant="outline">LGPD</Badge>
                            )}
                          </div>

                          <div className="text-sm space-y-1">
                            <div>
                              <strong>Patient Impact:</strong>{" "}
                              {issue.patientImpact}
                            </div>
                            <div>
                              <strong>Affected Flows:</strong>{" "}
                              {issue.affectedPatientFlows.join(", ")}
                            </div>
                            <div>
                              <strong>Compliance Standards:</strong>{" "}
                              {issue.complianceStandards
                                .map((s) => s.name)
                                .join(", ")}
                            </div>
                          </div>

                          {issue.helpUrl && (
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() =>
                                window.open(issue.helpUrl, "_blank")
                              }
                            >
                              Learn More
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  {result.recommendations.length} recommendations for
                  improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {result.recommendations.map((rec, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold">{rec.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {rec.description}
                              </p>
                            </div>
                            <Badge variant={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                          </div>

                          <div className="text-sm space-y-2">
                            <div>
                              <strong>Healthcare Relevance:</strong>
                              <p className="text-muted-foreground">
                                {rec.healthcareRelevance}
                              </p>
                            </div>

                            <div>
                              <strong>Implementation Steps:</strong>
                              <ul className="list-disc list-inside text-muted-foreground">
                                {rec.implementationSteps.map(
                                  (step, stepIndex) => (
                                    <li key={stepIndex}>{step}</li>
                                  ),
                                )}
                              </ul>
                            </div>

                            <div>
                              <strong>Compliance Standards:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rec.complianceStandards.map((standard) => (
                                  <Badge
                                    key={standard.id}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {standard.regulatoryBody}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Effort: {rec.estimatedEffort}</span>
                              <span>
                                Validation: {rec.validationCriteria.length}{" "}
                                criteria
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Compliance</CardTitle>
                <CardDescription>
                  Brazilian healthcare regulatory compliance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {result.context.regulatoryRequirements.map((standard) => (
                    <div key={standard.id}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{standard.name}</h4>
                        <Badge
                          variant={
                            isStandardCompliant(standard.id)
                              ? "default"
                              : "destructive"
                          }
                        >
                          {isStandardCompliant(standard.id)
                            ? "Compliant"
                            : "Non-Compliant"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {standard.description}
                      </p>
                      <div className="text-xs space-y-1">
                        <div>
                          <strong>Regulatory Body:</strong>{" "}
                          {standard.regulatoryBody}
                        </div>
                        <div>
                          <strong>Severity:</strong> {standard.severity}
                        </div>
                        <div>
                          <strong>Requirements:</strong>
                          <ul className="list-disc list-inside ml-2">
                            {standard.accessibilityRequirements.map(
                              (req, reqIndex) => (
                                <li key={reqIndex}>{req}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generated Report */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Report</CardTitle>
                <CardDescription>
                  Generated compliance report for documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={handleCopyReport} variant="outline">
                    Copy Report to Clipboard
                  </Button>
                  <ScrollArea className="h-96">
                    <pre
                      ref={reportRef}
                      className="text-xs bg-muted p-4 rounded overflow-auto"
                    >
                      {generateComplianceReport()}
                    </pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default HealthcareAccessibilityAuditor;
