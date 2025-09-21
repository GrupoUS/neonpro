import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import type { Integration } from '@sentry/types';

type NodeEnvironment = 'development' | 'test' | 'staging' | 'production';

type SecurityLevel = 'public' | 'internal' | 'confidential' | 'restricted';
type DataSensitivity = 'low' | 'medium' | 'high' | 'critical';

type HealthcareContext =
  | 'consultation'
  | 'emergency'
  | 'routine'
  | 'administrative'
  | 'ai';

export interface HealthcareErrorContext {
  clinicId?: string;
  patientId?: string;
  medicalContext?: HealthcareContext;
  workflowStep?: string;
  complianceRequirements?: string[];
  securityLevel?: SecurityLevel;
  dataSensitivity?: DataSensitivity;
  feature?: string;
  userRole?: 'patient' | 'doctor' | 'nurse' | 'admin' | 'guest';
  patientDataInvolved?: boolean;
}

export const HEALTHCARE_ERROR_CATEGORIES = {
  PATIENT_DATA: 'patient_data_error',
  MEDICAL_WORKFLOW: 'medical_workflow_error',
  COMPLIANCE_VIOLATION: 'compliance_violation',
  SECURITY_INCIDENT: 'security_incident',
  AI_MODEL_ERROR: 'ai_model_error',
  PERFORMANCE_DEGRADATION: 'performance_degradation',
  SYSTEM_UNAVAILABLE: 'system_unavailable',
  DATA_INTEGRITY_ERROR: 'data_integrity_error',
} as const;

export type HealthcareErrorCategory =
  (typeof HEALTHCARE_ERROR_CATEGORIES)[keyof typeof HEALTHCARE_ERROR_CATEGORIES];

interface SentryOptionsOverrides {
  dsn?: string;
  environment?: NodeEnvironment;
  release?: string;
  enableInDev?: boolean;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  extraIntegrations?: Integration[];
}

const SENSITIVE_FIELDS = [
  'cpf',
  'cnpj',
  'rg',
  'email',
  'phone',
  'telefone',
  'celular',
  'address',
  'endereco',
  'patient',
  'paciente',
  'medical',
  'prontuario',
  'diagnosis',
  'prescription',
  'ai_result',
  'token',
  'authorization',
  'session',
];

const STRING_PATTERNS: Array<[RegExp, string]> = [
  [/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF_REDACTED]'],
  [/\b\d{11}\b/g, '[CPF_REDACTED]'],
  [/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[CNPJ_REDACTED]'],
  [/\b\d{14}\b/g, '[CNPJ_REDACTED]'],
  [/\(\d{2}\)\s?\d{4,5}-\d{4}/g, '[PHONE_REDACTED]'],
  [/\b\d{2}\s?\d{4,5}-\d{4}\b/g, '[PHONE_REDACTED]'],
  [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]'],
  [
    /\b(prontuario|registro|paciente)\s*:?\s*\d+/gi,
    '[MEDICAL_RECORD_REDACTED]',
  ],
  [/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]'],
  [
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    '[UUID_REDACTED]',
  ],
];

const DEFAULT_ALLOW_URLS = [
  /https:\/\/neonpro\.com\.br/,
  /https:\/\/app\.neonpro\.com\.br/,
  /http:\/\/localhost/,
  /http:\/\/127\.0\.0\.1/,
];

const DEFAULT_DENY_URLS = [
  /extensions\//i,
  /^chrome:\/\//i,
  /^moz-extension:\/\//i,
];

let initialized = false;

function readEnv(key: string): string | undefined {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = (import.meta.env as Record<string, string | undefined>)[key];
    if (value) return value;
  }
  return process.env[key];
}

function resolveEnvironment(): NodeEnvironment {
  const modeFromMeta = typeof import.meta !== 'undefined'
    ? (import.meta.env?.MODE as string | undefined)
    : undefined;
  const resolved = readEnv('VITE_APP_ENV')
    ?? modeFromMeta
    ?? process.env.NODE_ENV
    ?? 'development';

  return resolved as NodeEnvironment;
}

function sanitizeString(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return STRING_PATTERNS.reduce(_(current,_[pattern,_replacement]) => current.replace(pattern, replacement),
    value,
  );
}

function sanitizeData<T>(data: T): T {
  if (!data || typeof data !== 'object') {
    return sanitizeString(data) as T;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item)) as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED_HEALTHCARE_DATA]';
      continue;
    }
    sanitized[key] = sanitizeData(value as unknown);
  }
  return sanitized as unknown as T;
}

function sanitizeBreadcrumb(breadcrumb: Sentry.Breadcrumb): Sentry.Breadcrumb {
  const clone: Sentry.Breadcrumb = { ...breadcrumb };
  if (clone.data) clone.data = sanitizeData(clone.data);
  if (clone.message) clone.message = sanitizeString(clone.message) as string;

  if (clone.category === 'navigation' && clone.data) {
    const data = clone.data as Record<string, unknown>;
    if (typeof data.to === 'string') {
      data.to = (data.to as string).replace(
        /\/patient\/[a-zA-Z0-9-]+/g,
        '/patient/[ID]',
      );
    }
    if (typeof data.from === 'string') {
      data.from = (data.from as string).replace(
        /\/patient\/[a-zA-Z0-9-]+/g,
        '/patient/[ID]',
      );
    }
  }
  return clone;
}

function buildIntegrations(extra: Integration[] = []): Integration[] {
  return [new BrowserTracing(), ...extra];
}

function getConfig(overrides: SentryOptionsOverrides = {}) {
  const environment = overrides.environment ?? resolveEnvironment();
  const release = overrides.release
    ?? readEnv('VITE_APP_VERSION')
    ?? readEnv('COMMIT_SHA')
    ?? 'development';
  const dsn = overrides.dsn ?? readEnv('VITE_SENTRY_DSN') ?? readEnv('SENTRY_DSN') ?? '';
  const tracesSampleRate = overrides.tracesSampleRate ?? (environment === 'production' ? 0.15 : 1);
  const profilesSampleRate = overrides.profilesSampleRate
    ?? (environment === 'production' ? 0.1 : 1);

  return {
    dsn,
    environment,
    release,
    tracesSampleRate,
    profilesSampleRate,
    enableInDev: overrides.enableInDev ?? readEnv('VITE_ENABLE_SENTRY') === 'true',
    extraIntegrations: overrides.extraIntegrations ?? [],
  };
}

export function getHealthcareSentryConfig(
  overrides: SentryOptionsOverrides = {},
): Sentry.BrowserOptions {
  const resolved = getConfig(overrides);

  return {
    dsn: resolved.dsn,
    environment: resolved.environment,
    release: resolved.release,
    tracesSampleRate: resolved.tracesSampleRate,
    integrations: buildIntegrations(resolved.extraIntegrations),
    beforeSend(event) {
      if (event.extra) event.extra = sanitizeData(event.extra);
      if (event.contexts) event.contexts = sanitizeData(event.contexts);
      if (event.request?.data) {
        event.request.data = sanitizeData(event.request.data);
      }
      return event;
    },
    beforeBreadcrumb: sanitizeBreadcrumb,
    allowUrls: DEFAULT_ALLOW_URLS,
    denyUrls: DEFAULT_DENY_URLS,
    maxBreadcrumbs: 50,
    captureUnhandledRejections: true,
  } satisfies Sentry.BrowserOptions;
}

export function initializeHealthcareErrorTracking(
  overrides?: SentryOptionsOverrides,
) {
  if (initialized) return;

  const config = getConfig(overrides);
  const browserConfig = getHealthcareSentryConfig(overrides);

  const shouldRun = config.environment === 'production'
    || config.environment === 'staging'
    || config.enableInDev;

  if (!shouldRun) {
    console.info(
      '[Sentry] Skipping initialization for environment',
      config.environment,
    );
    return;
  }

  if (!browserConfig.dsn) {
    console.warn('[Sentry] Skipping initialization – DSN not provided');
    return;
  }

  Sentry.init({
    ...browserConfig,
    profilesSampleRate: config.profilesSampleRate,
    debug: config.environment !== 'production'
      && readEnv('VITE_SENTRY_DEBUG') === 'true',
  });

  Sentry.getCurrentScope().addEventProcessor(event => {
    if (event.user) {
      event.user = event.user.id ? { id: String(event.user.id) } : undefined;
    }
    return event;
  });
  Sentry.setTag('platform', 'neonpro-web');
  Sentry.setTag('healthcare.compliance', 'lgpd');

  initialized = true;
}

export const _initializeSentry = initializeHealthcareErrorTracking;

function ensureInitialized() {
  if (!initialized) {
    initializeHealthcareErrorTracking();
  }
}

function categorizeError(
  error: Error,
  _context?: HealthcareErrorContext,
): HealthcareErrorCategory {
  const message = error.message.toLowerCase();
  const stack = (error.stack ?? '').toLowerCase();
  const haystack = `${message} ${stack}`;

  if (context?.medicalContext === 'emergency' || haystack.includes('patient')) {
    return HEALTHCARE_ERROR_CATEGORIES.PATIENT_DATA;
  }
  if (
    haystack.includes('compliance')
    || haystack.includes('lgpd')
    || context?.complianceRequirements?.length
  ) {
    return HEALTHCARE_ERROR_CATEGORIES.COMPLIANCE_VIOLATION;
  }
  if (
    haystack.includes('security')
    || haystack.includes('auth')
    || context?.securityLevel === 'restricted'
  ) {
    return HEALTHCARE_ERROR_CATEGORIES.SECURITY_INCIDENT;
  }
  if (haystack.includes('timeout') || haystack.includes('slow')) {
    return HEALTHCARE_ERROR_CATEGORIES.PERFORMANCE_DEGRADATION;
  }
  if (haystack.includes('ai') || context?.medicalContext === 'ai') {
    return HEALTHCARE_ERROR_CATEGORIES.AI_MODEL_ERROR;
  }
  return HEALTHCARE_ERROR_CATEGORIES.MEDICAL_WORKFLOW;
}

export function trackHealthcareError(
  error: Error,
  _context: HealthcareErrorContext = {},
) {
  ensureInitialized();

  const category = categorizeError(error, _context);

  Sentry.withScope(scope => {
    scope.setTag('healthcare.error.category', category);
    scope.setTag('healthcare.compliance.lgpd', 'true');
    scope.setTag(
      'healthcare.data.sensitivity',
      context.dataSensitivity ?? 'high',
    );

    if (context.securityLevel) {
      scope.setTag('healthcare.security.level', context.securityLevel);
    }
    if (context.medicalContext) {
      scope.setTag('healthcare.medical.context', context.medicalContext);
    }
    if (context.feature) scope.setTag('healthcare.feature', context.feature);

    scope.setContext(
      'healthcare',
      sanitizeData({
        clinicId: context.clinicId ? '[CLINIC_ID]' : undefined,
        patientId: context.patientId ? '[PATIENT_ID]' : undefined,
        medicalContext: context.medicalContext,
        workflowStep: context.workflowStep,
        complianceRequirements: context.complianceRequirements,
        userRole: context.userRole,
        timestamp: new Date().toISOString(),
      }),
    );

    Sentry.captureException(error, {
      tags: {
        healthcare_context: 'true',
        compliance_level: context.securityLevel ?? 'internal',
      },
      extra: sanitizeData({
        clinicId: context.clinicId,
        patientDataInvolved: context.patientDataInvolved ?? false,
      }),
      level: context.patientDataInvolved ? 'error' : 'warning',
    });
  });
}

export async function trackHealthcarePerformance<T>(
  operationName: string,
  operation: () => Promise<T>,
  _context: HealthcareErrorContext = {},
): Promise<T> {
  ensureInitialized();

  return await Sentry.startSpan(
    {
      name: operationName,
      op: 'healthcare_operation',
      attributes: {
        healthcare_context: 'true',
        medical_context: context.medicalContext ?? 'unknown',_},_},_async () => {
      try {
        const result = await operation();
        Sentry.withScope(scope => {
          scope.setContext(
            'performance',
            sanitizeData({
              medicalContext: context.medicalContext,
              workflowStep: context.workflowStep,
              timestamp: new Date().toISOString(),
            }),
          );
          Sentry.captureMessage(
            `Healthcare operation '${operationName}' completed`,
            'info',
          );
        });
        return result;
      } catch (_error) {
        trackHealthcareError(error as Error, {
          ...context,
          feature: operationName,
        });
        throw error;
      }
    },
  );
}

export function captureHealthcareError(
  error: Error,
  _context: HealthcareErrorContext = {},
) {
  trackHealthcareError(error, _context);
}
