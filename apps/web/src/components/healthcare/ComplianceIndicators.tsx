"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Lock,
  Shield,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

// CFM License Status Types
export type CFMLicenseStatus = "active" | "expired" | "suspended" | "pending" | "invalid";

export interface CFMLicenseIndicatorProps {
  licenseNumber: string;
  status: CFMLicenseStatus;
  expiryDate?: string;
  doctorName: string;
  specialty?: string;
  className?: string;
  onVerify?: () => void;
  showDetails?: boolean;
}

// LGPD Consent Status Types
export type LGPDConsentStatus = "granted" | "denied" | "pending" | "expired" | "revoked";

export interface LGPDConsentIndicatorProps {
  patientId: string;
  consentTypes: {
    personal: LGPDConsentStatus;
    sensitive: LGPDConsentStatus;
    medical: LGPDConsentStatus;
    sharing: LGPDConsentStatus;
  };
  lastUpdated: string;
  className?: string;
  onUpdateConsent?: (type: keyof LGPDConsentIndicatorProps['consentTypes']) => void;
  showDetails?: boolean;
}

// Compliance Dashboard Props
export interface ComplianceDashboardProps {
  cfmCompliance: number; // 0-100
  lgpdCompliance: number; // 0-100
  anvisaCompliance: number; // 0-100
  overallScore: number; // 0-100
  lastAudit: string;
  nextAudit: string;
  criticalIssues: number;
  className?: string;
  onViewDetails?: () => void;
}

// Status configurations
const cfmStatusConfig = {
  active: {
    color: "bg-green-50 border-green-200 text-green-800",
    icon: ShieldCheck,
    label: "Ativo",
    badgeVariant: "default" as const,
  },
  expired: {
    color: "bg-red-50 border-red-200 text-red-800",
    icon: XCircle,
    label: "Expirado",
    badgeVariant: "destructive" as const,
  },
  suspended: {
    color: "bg-amber-50 border-amber-200 text-amber-800",
    icon: AlertTriangle,
    label: "Suspenso",
    badgeVariant: "secondary" as const,
  },
  pending: {
    color: "bg-blue-50 border-blue-200 text-blue-800",
    icon: Clock,
    label: "Pendente",
    badgeVariant: "outline" as const,
  },
  invalid: {
    color: "bg-gray-50 border-gray-200 text-gray-800",
    icon: XCircle,
    label: "Inválido",
    badgeVariant: "secondary" as const,
  },
};

const lgpdStatusConfig = {
  granted: {
    color: "text-green-600",
    icon: CheckCircle,
    label: "Concedido",
  },
  denied: {
    color: "text-red-600",
    icon: XCircle,
    label: "Negado",
  },
  pending: {
    color: "text-amber-600",
    icon: Clock,
    label: "Pendente",
  },
  expired: {
    color: "text-gray-600",
    icon: AlertTriangle,
    label: "Expirado",
  },
  revoked: {
    color: "text-red-600",
    icon: XCircle,
    label: "Revogado",
  },
};

// CFM License Indicator Component
export function CFMLicenseIndicator({
  licenseNumber,
  status,
  expiryDate,
  doctorName,
  specialty,
  className,
  onVerify,
  showDetails = true,
}: CFMLicenseIndicatorProps) {
  const config = cfmStatusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className={cn("transition-all duration-200", config.color, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <StatusIcon className="h-4 w-4 mr-2" />
          CFM {licenseNumber}
        </CardTitle>
        <Badge variant={config.badgeVariant}>{config.label}</Badge>
      </CardHeader>
      {showDetails && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <User className="h-3 w-3 mr-2" />
              <span className="font-medium">{doctorName}</span>
            </div>
            {specialty && (
              <div className="text-xs text-muted-foreground">
                Especialidade: {specialty}
              </div>
            )}
            {expiryDate && (
              <div className="text-xs text-muted-foreground">
                Validade: {expiryDate}
              </div>
            )}
            {onVerify && (
              <Button
                variant="outline"
                size="sm"
                onClick={onVerify}
                className="w-full mt-2"
              >
                Verificar no CFM
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// LGPD Consent Indicator Component
export function LGPDConsentIndicator({
  patientId,
  consentTypes,
  lastUpdated,
  className,
  onUpdateConsent,
  showDetails = true,
}: LGPDConsentIndicatorProps) {
  const consentEntries = Object.entries(consentTypes);
  const grantedCount = consentEntries.filter(([, status]) => status === "granted").length;
  const totalCount = consentEntries.length;
  const compliancePercentage = (grantedCount / totalCount) * 100;

  const consentLabels = {
    personal: "Dados Pessoais",
    sensitive: "Dados Sensíveis",
    medical: "Dados Médicos",
    sharing: "Compartilhamento",
  };

  return (
    <Card className={cn("transition-all duration-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          LGPD Compliance
        </CardTitle>
        <Badge
          variant={compliancePercentage === 100 ? "default" : "secondary"}
          className={compliancePercentage === 100 ? "bg-green-100 text-green-800" : ""}
        >
          {compliancePercentage.toFixed(0)}%
        </Badge>
      </CardHeader>
      {showDetails && (
        <CardContent>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Paciente: {patientId}
            </div>
            <Progress value={compliancePercentage} className="h-2" />
            <div className="space-y-2">
              {consentEntries.map(([type, status]) => {
                const config = lgpdStatusConfig[status];
                const StatusIcon = config.icon;
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center">
                      <StatusIcon className={cn("h-3 w-3 mr-2", config.color)} />
                      <span>{consentLabels[type as keyof typeof consentLabels]}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={config.color}>{config.label}</span>
                      {onUpdateConsent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => onUpdateConsent(type as keyof LGPDConsentIndicatorProps['consentTypes'])}
                        >
                          Atualizar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Última atualização: {lastUpdated}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Compliance Dashboard Component
export function ComplianceDashboard({
  cfmCompliance,
  lgpdCompliance,
  anvisaCompliance,
  overallScore,
  lastAudit,
  nextAudit,
  criticalIssues,
  className,
  onViewDetails,
}: ComplianceDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) {return "text-green-600";}
    if (score >= 70) {return "text-amber-600";}
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) {return "bg-green-50 border-green-200";}
    if (score >= 70) {return "bg-amber-50 border-amber-200";}
    return "bg-red-50 border-red-200";
  };

  return (
    <Card className={cn("transition-all duration-200", getScoreBg(overallScore), className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <ShieldCheck className="h-5 w-5 mr-2" />
          Dashboard de Conformidade
        </CardTitle>
        <div className="text-right">
          <div className={cn("text-2xl font-bold", getScoreColor(overallScore))}>
            {overallScore}%
          </div>
          <div className="text-xs text-muted-foreground">Score Geral</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Individual Compliance Scores */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className={cn("text-lg font-semibold", getScoreColor(cfmCompliance))}>
                {cfmCompliance}%
              </div>
              <div className="text-xs text-muted-foreground">CFM</div>
              <Progress value={cfmCompliance} className="h-1 mt-1" />
            </div>
            <div className="text-center">
              <div className={cn("text-lg font-semibold", getScoreColor(lgpdCompliance))}>
                {lgpdCompliance}%
              </div>
              <div className="text-xs text-muted-foreground">LGPD</div>
              <Progress value={lgpdCompliance} className="h-1 mt-1" />
            </div>
            <div className="text-center">
              <div className={cn("text-lg font-semibold", getScoreColor(anvisaCompliance))}>
                {anvisaCompliance}%
              </div>
              <div className="text-xs text-muted-foreground">ANVISA</div>
              <Progress value={anvisaCompliance} className="h-1 mt-1" />
            </div>
          </div>

          {/* Critical Issues Alert */}
          {criticalIssues > 0 && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">
                {criticalIssues} {criticalIssues === 1 ? 'questão crítica' : 'questões críticas'} {criticalIssues === 1 ? 'requer' : 'requerem'} atenção imediata
              </span>
            </div>
          )}

          {/* Audit Information */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <div className="text-xs text-muted-foreground">Última Auditoria</div>
              <div className="text-sm font-medium">{lastAudit}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Próxima Auditoria</div>
              <div className="text-sm font-medium">{nextAudit}</div>
            </div>
          </div>

          {/* Action Button */}
          {onViewDetails && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={onViewDetails}
            >
              <FileText className="h-4 w-4 mr-2" />
              Ver Detalhes Completos
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}