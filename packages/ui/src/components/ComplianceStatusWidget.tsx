import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
} from 'lucide-react';
import * as React from 'react';
import { cn } from '../utils/cn';
import { Badge } from './Badge';
import { Button } from './Button';

export type ComplianceStatus =
  | 'compliant'
  | 'warning'
  | 'non_compliant'
  | 'pending'
  | 'unknown';

export type ComplianceCheck = {
  id: string;
  name: string;
  description: string;
  status: ComplianceStatus;
  lastChecked: Date;
  nextCheck?: Date;
  details?: string;
  actionRequired?: boolean;
  documentationUrl?: string;
};

export type ComplianceStatusWidgetProps = {
  /**
   * LGPD compliance checks
   */
  lgpdChecks: ComplianceCheck[];
  /**
   * ANVISA regulatory compliance checks
   */
  anvisaChecks: ComplianceCheck[];
  /**
   * CFM professional standards checks
   */
  cfmChecks: ComplianceCheck[];
  /**
   * Overall compliance score (0-100)
   */
  overallScore: number;
  /**
   * Last audit date
   */
  lastAuditDate?: Date;
  /**
   * Next audit date
   */
  nextAuditDate?: Date;
  /**
   * Callback when user wants to view detailed compliance report
   */
  onViewReport?: () => void;
  /**
   * Callback when user wants to address specific compliance issue
   */
  onAddressIssue?: (checkId: string) => void;
  /**
   * Constitutional transparency - show detailed compliance information
   */
  showDetails?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
};

const getStatusIcon = (status: ComplianceStatus) => {
  switch (status) {
    case 'compliant':
      return <CheckCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'non_compliant':
      return <AlertCircle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
};

const getStatusBadgeVariant = (status: ComplianceStatus) => {
  switch (status) {
    case 'compliant':
      return 'confirmed';
    case 'warning':
      return 'medium';
    case 'non_compliant':
      return 'urgent';
    case 'pending':
      return 'pending';
    default:
      return 'inactive';
  }
};

const getStatusText = (status: ComplianceStatus) => {
  switch (status) {
    case 'compliant':
      return 'Conforme';
    case 'warning':
      return 'Atenção';
    case 'non_compliant':
      return 'Não Conforme';
    case 'pending':
      return 'Pendente';
    default:
      return 'Desconhecido';
  }
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const ComplianceSection: React.FC<{
  title: string;
  checks: ComplianceCheck[];
  onAddressIssue?: (checkId: string) => void;
  showDetails?: boolean;
}> = ({ title, checks, onAddressIssue, showDetails = false }) => {
  const overallStatus = checks.every((check) => check.status === 'compliant')
    ? 'compliant'
    : checks.some((check) => check.status === 'non_compliant')
      ? 'non_compliant'
      : 'warning';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{title}</h4>
        <Badge
          icon={getStatusIcon(overallStatus)}
          size="sm"
          variant={getStatusBadgeVariant(overallStatus)}
        >
          {getStatusText(overallStatus)}
        </Badge>
      </div>

      {showDetails && (
        <div className="space-y-2">
          {checks.map((check) => (
            <div
              aria-describedby={`check-${check.id}-description`}
              aria-labelledby={`check-${check.id}-name`}
              className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm"
              key={check.id}
              role="listitem"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium" id={`check-${check.id}-name`}>
                    {check.name}
                  </span>
                  <Badge
                    icon={getStatusIcon(check.status)}
                    size="sm"
                    variant={getStatusBadgeVariant(check.status)}
                  >
                    {getStatusText(check.status)}
                  </Badge>
                </div>
                <p
                  className="mt-1 text-muted-foreground"
                  id={`check-${check.id}-description`}
                >
                  {check.description}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  Última verificação: {formatDate(check.lastChecked)}
                </p>
                {check.details && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    {check.details}
                  </p>
                )}
              </div>

              {check.actionRequired && onAddressIssue && (
                <Button
                  aria-label={`Resolver problema de conformidade: ${check.name}`}
                  onClick={() => onAddressIssue(check.id)}
                  size="sm"
                  variant="outline"
                >
                  Resolver
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ComplianceStatusWidget = React.forwardRef<
  HTMLDivElement,
  ComplianceStatusWidgetProps
>(
  (
    {
      lgpdChecks,
      anvisaChecks,
      cfmChecks,
      overallScore,
      lastAuditDate,
      nextAuditDate,
      onViewReport,
      onAddressIssue,
      showDetails = false,
      className,
      ...props
    },
    ref
  ) => {
    const getScoreVariant = (score: number) => {
      if (score >= 90) {
        return 'confirmed';
      }
      if (score >= 70) {
        return 'medium';
      }
      return 'urgent';
    };

    const getScoreIcon = (score: number) => {
      if (score >= 90) {
        return <CheckCircle className="h-5 w-5" />;
      }
      if (score >= 70) {
        return <AlertTriangle className="h-5 w-5" />;
      }
      return <AlertCircle className="h-5 w-5" />;
    };

    return (
      <div
        className={cn(
          'rounded-lg border bg-card p-6 text-card-foreground shadow-sm',
          className
        )}
        ref={ref}
        {...props}
        aria-describedby="compliance-status-description"
        aria-labelledby="compliance-status-title"
        role="region"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg" id="compliance-status-title">
              Status de Conformidade
            </h3>
            <p
              className="text-muted-foreground text-sm"
              id="compliance-status-description"
            >
              Monitoramento constitucional de conformidade healthcare
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2">
              <Badge
                icon={getScoreIcon(overallScore)}
                size="lg"
                variant={getScoreVariant(overallScore)}
              >
                {overallScore}% Conforme
              </Badge>
            </div>
            {lastAuditDate && (
              <p className="mt-1 text-muted-foreground text-xs">
                Última auditoria: {formatDate(lastAuditDate)}
              </p>
            )}
          </div>
        </div>

        {/* Compliance Sections */}
        <div
          aria-label="Seções de conformidade"
          className="space-y-6"
          role="list"
        >
          <ComplianceSection
            checks={lgpdChecks}
            onAddressIssue={onAddressIssue}
            showDetails={showDetails}
            title="LGPD - Lei Geral de Proteção de Dados"
          />

          <ComplianceSection
            checks={anvisaChecks}
            onAddressIssue={onAddressIssue}
            showDetails={showDetails}
            title="ANVISA - Agência Nacional de Vigilância Sanitária"
          />

          <ComplianceSection
            checks={cfmChecks}
            onAddressIssue={onAddressIssue}
            showDetails={showDetails}
            title="CFM - Conselho Federal de Medicina"
          />
        </div>

        {/* Next Audit */}
        {nextAuditDate && (
          <div className="mt-6 rounded-lg bg-muted p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Próxima Auditoria</span>
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              Agendada para {formatDate(nextAuditDate)}
            </p>
          </div>
        )}

        {/* Actions */}
        {onViewReport && (
          <div className="mt-6 border-t pt-4">
            <Button
              aria-label="Ver relatório detalhado de conformidade"
              className="w-full"
              onClick={onViewReport}
              size="sm"
              variant="outline"
            >
              <Shield className="mr-2 h-4 w-4" />
              Ver Relatório Completo
            </Button>
          </div>
        )}
      </div>
    );
  }
);

ComplianceStatusWidget.displayName = 'ComplianceStatusWidget';
