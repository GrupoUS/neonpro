// Event logger utility for governance services observability
// Console JSON logging for development; replace with structured logging in production

import { governanceLogger, logHealthcareError } from '@neonpro/shared';

export interface GovernanceEvent {
  timestamp: Date;
  _service: string;
  action: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'warn' | 'error';
}

export interface EventLogger {
  log(event: Omit<GovernanceEvent, 'timestamp'>): void;
  logKPIEvaluated(
    kpiId: string,
    value?: number,
    status?: string,
    metadata?: Record<string, any>,
  ): void;
  logEscalationTriggered(
    escalationId: string,
    pathId: string,
    kpiId: string,
    reason: string,
  ): void;
  logPriorityScored(
    featureId: string,
    score: number,
    priority: string,
    factors: Record<string, number>,
  ): void;
  logPolicyEvaluated(
    policyId: string,
    status: string,
    passed: number,
    total: number,
  ): void;
}

export class ConsoleEventLogger implements EventLogger {
  log(event: Omit<GovernanceEvent, 'timestamp'>): void {
    const fullEvent: GovernanceEvent = {
      ...event,
      timestamp: new Date(),
    };
    // Log governance event with structured logging
    governanceLogger.info('governance_event', {
      event: fullEvent,
      service: fullEvent.service,
      action: fullEvent.action,
      severity: fullEvent.severity || 'info',
      timestamp: fullEvent.timestamp,
    });
  }

  logKPIEvaluated(
    kpiId: string,
    value?: number,
    status?: string,
    metadata?: Record<string, any>,
  ): void {
    this.log({
      _service: 'KPIService',
      action: 'kpi.evaluated',
      resourceId: kpiId,
      metadata: { value, status, ...metadata },
      severity: status === 'breach' ? 'warn' : 'info',
    });
  }

  logEscalationTriggered(
    escalationId: string,
    pathId: string,
    kpiId: string,
    reason: string,
  ): void {
    this.log({
      _service: 'EscalationService',
      action: 'escalation.triggered',
      resourceId: escalationId,
      metadata: { pathId, kpiId, reason },
      severity: 'warn',
    });
  }

  logPriorityScored(
    featureId: string,
    score: number,
    priority: string,
    factors: Record<string, number>,
  ): void {
    this.log({
      _service: 'PrioritizationService',
      action: 'priority.scored',
      resourceId: featureId,
      metadata: { score, priority, factors },
      severity: 'info',
    });
  }

  logPolicyEvaluated(
    policyId: string,
    status: string,
    passed: number,
    total: number,
  ): void {
    this.log({
      _service: 'PolicyService',
      action: 'policy.evaluated',
      resourceId: policyId,
      metadata: { status, passed, total },
      severity: status === 'fail' ? 'warn' : 'info',
    });
  }
}

// Default instance for convenience
export const eventLogger = new ConsoleEventLogger();
