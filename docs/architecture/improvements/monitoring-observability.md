# Monitoring & Observability Integration

## Overview

This guide covers the comprehensive monitoring and observability system implemented for the NeonPro aesthetic clinic platform, including Sentry error tracking and OpenTelemetry distributed tracing with aesthetic clinic-specific compliance features.

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Sentry Middleware  │  OpenTelemetry Spans  │  Health Checks │
├─────────────────────────────────────────────────────────────┤
│           Aesthetic Clinic PII Redaction Layer            │
├─────────────────────────────────────────────────────────────┤
│  Supabase Telemetry │   Performance Metrics │  Error Context│
├─────────────────────────────────────────────────────────────┤
│              External Services Integration                   │
│   Sentry.io SaaS    │    OpenTelemetry Collector           │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Application Events** → Aesthetic Clinic PII Redaction → Telemetry Processing
2. **Error Events** → Sentry Middleware → Context Enrichment → Sentry SaaS
3. **Database Operations** → OpenTelemetry Spans → Trace Collection → Monitoring Dashboard
4. **Performance Metrics** → Real-time Processing → Alert Generation

## Sentry Integration (T043)

### Configuration

**File**: `apps/api/src/lib/sentry.ts`

```typescript
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function initializeSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",

    // Aesthetic clinic compliance settings
    beforeSend: (event, hint) => {
      // Redact PII from aesthetic clinic data
      return redactAestheticClinicPII(event);
    },

    beforeSendTransaction: (event) => {
      // Sanitize transaction data for aesthetic clinic compliance
      return sanitizeTransactionData(event);
    },

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Integrations
    integrations: [
      nodeProfilingIntegration(),
      Sentry.httpIntegration({
        tracing: {
          shouldCreateSpanForRequest: (url) => {
            // Skip health check endpoints from tracing
            return !url.includes("/health");
          },
        },
      }),
      Sentry.prismaIntegration(),
    ],

    // Release tracking
    release: process.env.SENTRY_RELEASE,

    // Error filtering
    ignoreErrors: [
      "Non-Error promise rejection captured",
      "ResizeObserver loop limit exceeded",
      "AbortError",
    ],
  });
}
```

### Healthcare PII Redaction

**File**: `apps/api/src/lib/sentry-aesthetic-clinic.ts`

```typescript
interface AestheticClinicPIIPatterns {
  cpf: RegExp;
  phone: RegExp;
  email: RegExp;
  clientRecord: RegExp;
  clientId: RegExp;
}

const PII_PATTERNS: AestheticClinicPIIPatterns = {
  cpf: /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
  phone: /\(\d{2}\)\s*\d{4,5}-?\d{4}/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  clientRecord: /CR-\d{6,10}/g,
  clientId: /CLI-[A-Z0-9]{8,12}/g,
};

export function redactAestheticClinicPII(event: Sentry.Event): Sentry.Event | null {
  try {
    // Redact from message
    if (event.message) {
      event.message = redactString(event.message);
    }

    // Redact from exception messages
    if (event.exception?.values) {
      event.exception.values = event.exception.values.map((exception) => ({
        ...exception,
        value: exception.value
          ? redactString(exception.value)
          : exception.value,
      }));
    }

    // Redact from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => ({
        ...breadcrumb,
        message: breadcrumb.message
          ? redactString(breadcrumb.message)
          : breadcrumb.message,
        data: breadcrumb.data ? redactObject(breadcrumb.data) : breadcrumb.data,
      }));
    }

    // Redact from extra context
    if (event.extra) {
      event.extra = redactObject(event.extra);
    }

    // Add aesthetic clinic compliance tags
    event.tags = {
      ...event.tags,
      "aesthetic_clinic.pii_redacted": "true",
      "compliance.lgpd": "compliant",
      "aesthetic_clinic.data_classification": "redacted",
    };

    return event;
  } catch (error) {
    console.error("Error redacting PII from Sentry event:", error);
    // Return null to drop the event if redaction fails
    return null;
  }
}

function redactString(text: string): string {
  let redactedText = text;

  Object.entries(PII_PATTERNS).forEach(([type, pattern]) => {
    redactedText = redactedText.replace(
      pattern,
      `[REDACTED_${type.toUpperCase()}]`,
    );
  });

  return redactedText;
}

function redactObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return typeof obj === "string" ? redactString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item));
  }

  const redactedObj: any = {};
  Object.keys(obj).forEach((key) => {
    if (isPIIField(key)) {
      redactedObj[key] = "[REDACTED_PII]";
    } else {
      redactedObj[key] = redactObject(obj[key]);
    }
  });

  return redactedObj;
}

function isPIIField(fieldName: string): boolean {
  const piiFields = [
    "cpf",
    "email",
    "phone",
    "address",
    "client_record",
    "client_id",
    "full_name",
    "birth_date",
    "social_security",
  ];

  return piiFields.some((field) =>
    fieldName.toLowerCase().includes(field.toLowerCase()),
  );
}
```

### Middleware Integration

**File**: `apps/api/src/app.ts`

```typescript
import { initializeSentry, sentryMiddleware } from "./lib/sentry";
import { Hono } from "hono";

// Initialize Sentry before app creation
initializeSentry();

const app = new Hono();

// Sentry middleware for error tracking and performance monitoring
app.use("*", sentryMiddleware());

// Aesthetic clinic context middleware
app.use("*", async (c, next) => {
  // Add aesthetic clinic context to Sentry scope
  Sentry.withScope((scope) => {
    scope.setTag("aesthetic_clinic.app", "neonpro");
    scope.setTag("aesthetic_clinic.environment", process.env.NODE_ENV);

    if (c.get("user")) {
      scope.setUser({
        id: c.get("user").id,
        // Don't include PII in user context
        role: c.get("user").role,
      });
      scope.setTag("aesthetic_clinic.user_type", c.get("user").role);
    }

    return next();
  });
});
```

## OpenTelemetry Integration (T044)

### Supabase Telemetry Client

**File**: `apps/api/src/lib/supabase-telemetry.ts`

```typescript
import { trace, SpanStatusCode, SpanKind } from "@opentelemetry/api";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

export interface SupabaseTelemetryContext {
  operation: string;
  table?: string;
  dataClassification: "public" | "internal" | "confidential" | "restricted";
  patientId?: string;
  professionalId?: string;
  complianceRequired?: boolean;
}

export class TelemetryEnabledSupabaseClient {
  private client: SupabaseClient;
  private tracer = trace.getTracer("supabase-aesthetic-clinic");

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  async executeWithTelemetry<T>(
    queryFn: () => Promise<T>,
    context: SupabaseTelemetryContext,
  ): Promise<T> {
    const span = this.tracer.startSpan(`supabase.${context.operation}`, {
      kind: SpanKind.CLIENT,
      attributes: {
        "db.system": "postgresql",
        "db.name": "supabase",
        "db.operation": context.operation,
        "db.sql.table": context.table || "unknown",

        // Aesthetic clinic-specific attributes
        "aesthetic_clinic.data_classification": context.dataClassification,
        "aesthetic_clinic.compliance_required": context.complianceRequired || false,

        // Privacy-compliant identifiers (hashed)
        ...(context.patientId && {
          "aesthetic_clinic.client_context": this.hashIdentifier(context.patientId),
        }),
        ...(context.professionalId && {
          "healthcare.professional_id": context.professionalId,
        }),
      },
    });

    const startTime = Date.now();

    try {
      const result = await queryFn();

      const duration = Date.now() - startTime;
      span.setAttributes({
        "db.duration_ms": duration,
        "aesthetic_clinic.operation_success": true,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      span.setAttributes({
        "db.duration_ms": duration,
        "aesthetic_clinic.operation_success": false,
        "error.type": (error as Error).constructor.name,
        "error.message": this.sanitizeErrorMessage((error as Error).message),
      });

      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: "Database operation failed",
      });

      throw error;
    } finally {
      span.end();
    }
  }

  // Convenience methods for common operations
  async selectWithTelemetry<T>(
    table: string,
    query: any,
    context: Partial<SupabaseTelemetryContext> = {},
  ): Promise<T> {
    return this.executeWithTelemetry(
      () => this.client.from(table).select(query),
      {
        operation: "select",
        table,
        dataClassification: "confidential",
        ...context,
      },
    );
  }

  async insertWithTelemetry<T>(
    table: string,
    data: any,
    context: Partial<SupabaseTelemetryContext> = {},
  ): Promise<T> {
    return this.executeWithTelemetry(
      () => this.client.from(table).insert(data),
      {
        operation: "insert",
        table,
        dataClassification: "confidential",
        complianceRequired: true,
        ...context,
      },
    );
  }

  async updateWithTelemetry<T>(
    table: string,
    data: any,
    filter: any,
    context: Partial<SupabaseTelemetryContext> = {},
  ): Promise<T> {
    return this.executeWithTelemetry(
      () => this.client.from(table).update(data).match(filter),
      {
        operation: "update",
        table,
        dataClassification: "confidential",
        complianceRequired: true,
        ...context,
      },
    );
  }

  private hashIdentifier(identifier: string): string {
    return createHash("sha256")
      .update(identifier)
      .digest("hex")
      .substring(0, 16); // First 16 chars for brevity
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove potential PII from error messages
    return message
      .replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, "[REDACTED_CPF]")
      .replace(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        "[REDACTED_EMAIL]",
      )
      .replace(/\(\d{2}\)\s*\d{4,5}-?\d{4}/g, "[REDACTED_PHONE]");
  }
}

// Factory function for creating telemetry-enabled client
export function createTelemetrySupabaseClient(): TelemetryEnabledSupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_ANON_KEY!;

  return new TelemetryEnabledSupabaseClient(supabaseUrl, supabaseKey);
}
```

### Service Integration Example

**File**: `packages/database/src/services/client.service.ts`

```typescript
import { createTelemetrySupabaseClient } from "../lib/supabase-telemetry";

export class ClientService {
  private supabase = createTelemetrySupabaseClient();

  async getClient(
    clientId: string,
    professionalId: string,
  ): Promise<Client> {
    return this.supabase.selectWithTelemetry(
      "clients",
      "*, aesthetic_records(*)",
      {
        operation: "get_client",
        table: "clients",
        dataClassification: "restricted",
        patientId: clientId,
        professionalId,
        complianceRequired: true,
      },
    );
  }

  async updateClientRecord(
    clientId: string,
    updates: Partial<Client>,
    professionalId: string,
  ): Promise<Client> {
    return this.supabase.updateWithTelemetry(
      "clients",
      updates,
      { id: clientId },
      {
        operation: "update_client",
        table: "clients",
        dataClassification: "restricted",
        patientId: clientId,
        professionalId,
        complianceRequired: true,
      },
    );
  }
}
```

## Configuration

### Environment Variables

```bash
# Sentry Configuration
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_RELEASE=v1.0.0
SENTRY_ENVIRONMENT=production

# OpenTelemetry Configuration
OTEL_SERVICE_NAME=neonpro-aesthetic-clinic-api
OTEL_SERVICE_VERSION=1.0.0
OTEL_EXPORTER_OTLP_ENDPOINT=https://your-otel-collector
OTEL_RESOURCE_ATTRIBUTES=service.namespace=aesthetic_clinic,deployment.environment=production

# Aesthetic Clinic Compliance
AESTHETIC_CLINIC_PII_REDACTION_ENABLED=true
AESTHETIC_CLINIC_AUDIT_LOG_RETENTION_DAYS=2555  # 7 years as per LGPD
AESTHETIC_CLINIC_COMPLIANCE_MODE=strict
```

### Docker Compose Integration

```yaml
# docker-compose.yml
services:
  api:
    environment:
      - SENTRY_DSN=${SENTRY_DSN}
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
      - HEALTHCARE_PII_REDACTION_ENABLED=true

  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    ports:
      - "4317:4317" # OTLP gRPC receiver
      - "4318:4318" # OTLP HTTP receiver
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    command: ["--config=/etc/otel-collector-config.yaml"]
```

## Monitoring & Alerting

### Performance Dashboards

Create Sentry dashboards for:

- **Error Rate**: Monitor error rates by healthcare module
- **Response Time**: Track API response times for critical healthcare operations
- **User Experience**: Monitor real user performance for healthcare interfaces
- **Compliance Metrics**: Track PII redaction effectiveness and audit log coverage

### Alert Configuration

```typescript
// Example alert rules for Sentry
const alertRules = {
  highErrorRate: {
    condition: "error_rate > 1%",
    timeWindow: "5m",
    channels: ["slack", "email"],
    severity: "critical",
  },
  slowHealthcareAPI: {
    condition: "avg_response_time > 2s",
    filter: "transaction:/api/healthcare/*",
    timeWindow: "10m",
    channels: ["slack"],
    severity: "warning",
  },
  piiRedactionFailure: {
    condition: "tag:healthcare.pii_redacted != true",
    timeWindow: "1m",
    channels: ["security-team", "compliance-team"],
    severity: "critical",
  },
};
```

## Testing

### Unit Tests

**File**: `apps/api/tests/monitoring/sentry.test.ts`

```typescript
describe("Sentry Healthcare Integration", () => {
  describe("PII Redaction", () => {
    it("should redact CPF from error messages", () => {
      const event = {
        message: "Error processing patient 123.456.789-01",
      };

      const redacted = redactHealthcarePII(event);
      expect(redacted.message).toBe("Error processing patient [REDACTED_CPF]");
    });

    it("should redact email addresses from breadcrumbs", () => {
      const event = {
        breadcrumbs: [
          {
            message: "User login: patient@hospital.com",
            data: { email: "patient@hospital.com" },
          },
        ],
      };

      const redacted = redactHealthcarePII(event);
      expect(redacted.breadcrumbs[0].message).toBe(
        "User login: [REDACTED_EMAIL]",
      );
      expect(redacted.breadcrumbs[0].data.email).toBe("[REDACTED_PII]");
    });
  });
});
```

### Integration Tests

**File**: `apps/api/tests/monitoring/telemetry.test.ts`

```typescript
describe("OpenTelemetry Supabase Integration", () => {
  let telemetryClient: TelemetryEnabledSupabaseClient;
  let mockTracer: any;

  beforeEach(() => {
    telemetryClient = createTelemetrySupabaseClient();
    mockTracer = createMockTracer();
  });

  it("should create spans for database operations", async () => {
    await telemetryClient.selectWithTelemetry("patients", "*", {
      operation: "test_select",
      dataClassification: "confidential",
      patientId: "test-patient-123",
    });

    expect(mockTracer.startSpan).toHaveBeenCalledWith(
      "supabase.test_select",
      expect.objectContaining({
        attributes: expect.objectContaining({
          "healthcare.data_classification": "confidential",
          "healthcare.patient_context": expect.any(String),
        }),
      }),
    );
  });
});
```

## Troubleshooting

### Common Issues

**1. PII Not Being Redacted**

```bash
# Check Sentry configuration
curl -H "Authorization: Bearer ${SENTRY_AUTH_TOKEN}" \
  "https://sentry.io/api/0/projects/${ORG}/${PROJECT}/keys/"

# Verify beforeSend hook is active
grep -r "beforeSend" apps/api/src/lib/sentry.ts
```

**2. Missing Telemetry Data**

```bash
# Check OpenTelemetry configuration
export OTEL_LOG_LEVEL=debug
npm run start:api

# Verify collector connectivity
curl -X POST ${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces \
  -H "Content-Type: application/json" \
  -d '{"test": "connectivity"}'
```

**3. High Memory Usage**

```typescript
// Monitor telemetry overhead
const memUsage = process.memoryUsage();
console.log("Telemetry memory usage:", {
  rss: memUsage.rss / 1024 / 1024,
  heapUsed: memUsage.heapUsed / 1024 / 1024,
  external: memUsage.external / 1024 / 1024,
});
```

### Debugging Commands

```bash
# Check Sentry events
sentry-cli events list --project=neonpro-healthcare

# Validate OpenTelemetry spans
otel-cli span list --service=neonpro-healthcare-api

# Test PII redaction
curl -X POST http://localhost:3000/api/test/pii \
  -H "Content-Type: application/json" \
  -d '{"cpf": "123.456.789-01", "email": "test@test.com"}'
```

## Maintenance

### Regular Tasks

1. **Weekly**: Review error trends and adjust alert thresholds
2. **Monthly**: Audit PII redaction effectiveness
3. **Quarterly**: Review telemetry data retention and costs
4. **Annually**: Update healthcare compliance configurations

### Performance Optimization

```typescript
// Optimize telemetry for high-traffic operations
const telemetryConfig = {
  // Sample 10% of read operations, 100% of writes
  sampleRate: operation.includes("select") ? 0.1 : 1.0,

  // Batch spans for better performance
  batchSize: 100,
  batchTimeout: 5000,

  // Reduce attribute verbosity for frequent operations
  verboseAttributes: !operation.includes("health_check"),
};
```

This comprehensive monitoring and observability system ensures that the NeonPro aesthetic clinic platform maintains high reliability while complying with strict aesthetic clinic data protection requirements.
