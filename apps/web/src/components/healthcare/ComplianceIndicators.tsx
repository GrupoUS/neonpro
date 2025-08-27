'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  ShieldAlert, 
  Clock, 
  User, 
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * TweakCN NEONPRO Brazilian Healthcare Compliance Indicators
 * LGPD, CFM, and ANVISA compliance visual components
 * Professional medical compliance monitoring with Brazilian regulations
 */

// LGPD Consent Status Types
export type LGPDConsentStatus = 'granted' | 'pending' | 'denied' | 'expired';

export interface LGPDConsentIndicatorProps {
  status: LGPDConsentStatus;
  patientName: string;
  consentDate?: Date;
  expiryDate?: Date;
  purposes: string[];
  className?: string;
  showDetails?: boolean;
}

// CFM License Status Types  
export type CFMLicenseStatus = 'active' | 'suspended' | 'revoked' | 'pending';

export interface CFMLicenseIndicatorProps {
  status: CFMLicenseStatus;
  professionalName: string;
  licenseNumber: string;
  specialties: string[];
  validUntil?: Date;
  className?: string;
  showDetails?: boolean;
}

const lgpdStatusConfig = {
  granted: {
    label: 'Consentimento Ativo',
    icon: CheckCircle2,
    className: 'lgpd-consent-granted',
    bgClass: 'bg-lgpd-consent-granted/10',
    textClass: 'text-lgpd-consent-granted',
    borderClass: 'border-lgpd-consent-granted/20',
  },
  pending: {
    label: 'Aguardando Consentimento',
    icon: Clock,
    className: 'lgpd-consent-pending',
    bgClass: 'bg-lgpd-consent-pending/10',
    textClass: 'text-lgpd-consent-pending',
    borderClass: 'border-lgpd-consent-pending/20',
  },
  denied: {
    label: 'Consentimento Negado',
    icon: XCircle,
    className: 'lgpd-consent-denied',
    bgClass: 'bg-lgpd-consent-denied/10',
    textClass: 'text-lgpd-consent-denied',
    borderClass: 'border-lgpd-consent-denied/20',
  },
  expired: {
    label: 'Consentimento Expirado',
    icon: AlertTriangle,
    className: 'lgpd-consent-expired',
    bgClass: 'bg-lgpd-consent-expired/10',
    textClass: 'text-lgpd-consent-expired',
    borderClass: 'border-lgpd-consent-expired/20',
  },
};

const cfmStatusConfig = {
  active: {
    label: 'Licença Ativa',
    icon: ShieldCheck,
    className: 'cfm-license-active',
    bgClass: 'bg-cfm-license-active/10',
    textClass: 'text-cfm-license-active',
    borderClass: 'border-cfm-license-active/20',
  },
  suspended: {
    label: 'Licença Suspensa',
    icon: ShieldAlert,
    className: 'cfm-license-suspended', 
    bgClass: 'bg-cfm-license-suspended/10',
    textClass: 'text-cfm-license-suspended',
    borderClass: 'border-cfm-license-suspended/20',
  },
  revoked: {
    label: 'Licença Cassada',
    icon: ShieldX,
    className: 'cfm-license-revoked',
    bgClass: 'bg-cfm-license-revoked/10',
    textClass: 'text-cfm-license-revoked',
    borderClass: 'border-cfm-license-revoked/20',
  },
  pending: {
    label: 'Licença Pendente',
    icon: Shield,
    className: 'cfm-license-suspended', // Use suspended styling for pending
    bgClass: 'bg-cfm-license-suspended/10',
    textClass: 'text-cfm-license-suspended',
    borderClass: 'border-cfm-license-suspended/20',
  },
};

/**
 * LGPD Consent Indicator Component
 * Visual indicator for patient data consent status
 */
export function LGPDConsentIndicator({
  status,
  patientName,
  consentDate,
  expiryDate,
  purposes,
  className,
  showDetails = false,
}: LGPDConsentIndicatorProps) {
  const config = lgpdStatusConfig[status];
  const IconComponent = config.icon;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isNearExpiry = () => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (showDetails) {
    return (
      <Card className={cn("healthcare-transition", config.borderClass, className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <IconComponent className="h-4 w-4" />
            LGPD - Consentimento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Paciente:</span>
            <span className="text-sm text-muted-foreground">{patientName}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={cn("text-xs", config.className)}>
              <IconComponent className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          {consentDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data do Consentimento:</span>
              <span className="text-sm text-muted-foreground">{formatDate(consentDate)}</span>
            </div>
          )}

          {expiryDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Válido até:</span>
              <span className={cn(
                "text-sm",
                isNearExpiry() ? "text-healthcare-warning font-medium" : "text-muted-foreground"
              )}>
                {formatDate(expiryDate)}
                {isNearExpiry() && " ⚠️"}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-sm font-medium">Finalidades:</span>
            <div className="flex flex-wrap gap-1">
              {purposes.map((purpose, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {purpose}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Badge className={cn("lgpd-consent-indicator", config.className, className)}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.label}
      {isNearExpiry() && <AlertTriangle className="h-3 w-3 ml-1" />}
    </Badge>
  );
}

/**
 * CFM License Indicator Component
 * Visual indicator for medical professional license status
 */
export function CFMLicenseIndicator({
  status,
  professionalName,
  licenseNumber,
  specialties,
  validUntil,
  className,
  showDetails = false,
}: CFMLicenseIndicatorProps) {
  const config = cfmStatusConfig[status];
  const IconComponent = config.icon;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
    });
  };

  if (showDetails) {
    return (
      <Card className={cn("healthcare-transition", config.borderClass, className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            CFM - Licença Profissional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Profissional:</span>
            <span className="text-sm text-muted-foreground">{professionalName}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">CRM:</span>
            <span className="text-sm font-mono text-muted-foreground">{licenseNumber}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={cn("text-xs", config.className)}>
              <IconComponent className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
          </div>

          {validUntil && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Válido até:</span>
              <span className="text-sm text-muted-foreground">{formatDate(validUntil)}</span>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-sm font-medium">Especialidades:</span>
            <div className="flex flex-wrap gap-1">
              {specialties.map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Badge className={cn("cfm-license-badge", config.className, className)}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

/**
 * Compliance Dashboard Component
 * Overview of all compliance indicators for a clinic/professional
 */
export interface ComplianceDashboardProps {
  lgpdConsents: Array<{
    patientId: string;
    patientName: string;
    status: LGPDConsentStatus;
    consentDate?: Date;
    expiryDate?: Date;
    purposes: string[];
  }>;
  cfmLicenses: Array<{
    professionalId: string;
    professionalName: string;
    licenseNumber: string;
    status: CFMLicenseStatus;
    specialties: string[];
    validUntil?: Date;
  }>;
  className?: string;
}

export function ComplianceDashboard({
  lgpdConsents,
  cfmLicenses,
  className,
}: ComplianceDashboardProps) {
  const lgpdStats = {
    granted: lgpdConsents.filter(c => c.status === 'granted').length,
    pending: lgpdConsents.filter(c => c.status === 'pending').length,
    denied: lgpdConsents.filter(c => c.status === 'denied').length,
    expired: lgpdConsents.filter(c => c.status === 'expired').length,
  };

  const cfmStats = {
    active: cfmLicenses.filter(l => l.status === 'active').length,
    suspended: cfmLicenses.filter(l => l.status === 'suspended').length,
    revoked: cfmLicenses.filter(l => l.status === 'revoked').length,
    pending: cfmLicenses.filter(l => l.status === 'pending').length,
  };

  const totalCompliance = lgpdStats.granted + cfmStats.active;
  const totalIssues = lgpdStats.denied + lgpdStats.expired + cfmStats.suspended + cfmStats.revoked;

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            LGPD - Consentimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-lgpd-consent-granted">{lgpdStats.granted}</div>
              <div className="text-xs text-muted-foreground">Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-lgpd-consent-pending">{lgpdStats.pending}</div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
          </div>
          
          {(lgpdStats.denied > 0 || lgpdStats.expired > 0) && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-lgpd-consent-denied">{lgpdStats.denied}</div>
                <div className="text-xs text-muted-foreground">Negados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-lgpd-consent-expired">{lgpdStats.expired}</div>
                <div className="text-xs text-muted-foreground">Expirados</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            CFM - Licenças
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cfm-license-active">{cfmStats.active}</div>
              <div className="text-xs text-muted-foreground">Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cfm-license-suspended">{cfmStats.pending}</div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
          </div>
          
          {(cfmStats.suspended > 0 || cfmStats.revoked > 0) && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-cfm-license-suspended">{cfmStats.suspended}</div>
                <div className="text-xs text-muted-foreground">Suspensas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cfm-license-revoked">{cfmStats.revoked}</div>
                <div className="text-xs text-muted-foreground">Cassadas</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}