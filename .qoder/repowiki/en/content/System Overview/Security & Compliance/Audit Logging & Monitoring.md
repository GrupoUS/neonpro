# Audit Logging & Monitoring

<cite>
**Referenced Files in This Document **
- [audit-log.ts](file://apps/api/src/middleware/audit-log.ts)
- [opentelemetry-config.ts](file://packages/shared/src/telemetry/opentelemetry-config.ts)
- [init.ts](file://packages/monitoring/src/init.ts)
</cite>

## Table of Contents

1. [Introduction](#introduction)
2. [Audit Log Implementation](#audit-log-implementation)
3. [Structured Logging Formats](#structured-logging-formats)
4. [Real-time Monitoring Capabilities](#real-time-monitoring-capabilities)
5. [Domain Models for Audit Events](#domain-models-for-audit-events)
6. [Integration with Observability Systems](#integration-with-observability-systems)
7. [Compliance and Regulatory Requirements](#compliance-and-regulatory-requirements)
8. [Common Issues and Solutions](#common-issues-and-solutions)
9. [Conclusion](#conclusion)

## Introduction

The neonpro platform implements a comprehensive audit logging and monitoring infrastructure designed to ensure data integrity, regulatory compliance, and operational visibility across clinical, financial, and administrative workflows. The system captures immutable audit trails for all critical operations while providing real-time monitoring capabilities through integrated observability tools.

## Audit Log Implementation

The audit logging system is implemented as middleware that intercepts requests and generates audit entries for significant operations. The core implementation provides automatic event capture for CRUD operations on patient data, appointments, and financial transactions.

```mermaid
sequenceDiagram
participant Client
participant Middleware
participant Logger
participant Storage
Client->>Middleware : HTTP Request
Middleware->>Middleware : Extract request details
Middleware->>Middleware : Sanitize sensitive data
Middleware->>Logger : Create audit entry
Logger->>Storage : Store audit record
Logger-->>Middleware : Confirmation
Middleware-->>Client : Response
```

**Diagram sources **

- [audit-log.ts](file://apps/api/src/middleware/audit-log.ts#L0-L330)

**Section sources**

- [audit-log.ts](file://apps/api/src/middleware/audit-log.ts#L0-L330)

## Structured Logging Formats

The platform uses structured JSON logging with consistent field naming and data types. Each log entry contains contextual information including timestamps, user identifiers, IP addresses, and request metadata. Sensitive fields are automatically redacted based on configurable patterns.

```mermaid
classDiagram
class AuditLogEntry {
+Date timestamp
+string _userId
+string clinicId
+string action
+string resource
+string resourceId
+string method
+string path
+string ip
+string userAgent
+string sessionId
+string requestId
+number statusCode
+number duration
+Record<string, any> metadata
}
class AuditLogConfig {
+boolean includeRequestBody
+boolean includeResponseBody
+string[] sensitiveFields
+string logLevel
}
class DEFAULT_SENSITIVE_FIELDS {
+string[] password
+string[] token
+string[] secret
+string[] key
+string[] authorization
+string[] cpf
+string[] rg
+string[] ssn
+string[] credit_card
+string[] medical_record
}
AuditLogEntry --> AuditLogConfig : "uses"
AuditLogEntry --> DEFAULT_SENSITIVE_FIELDS : "references"
```

**Diagram sources **

- [audit-log.ts](file://apps/api/src/middleware/audit-log.ts#L6-L22)

**Section sources**

- [audit-log.ts](file://apps/api/src/middleware/audit-log.ts#L6-L22)

## Real-time Monitoring Capabilities

The monitoring infrastructure provides real-time visibility into system performance, error rates, and security events. It integrates with OpenTelemetry for distributed tracing, Prometheus for metrics collection, and Vercel analytics for frontend performance monitoring.

```mermaid
flowchart TD
A[Application] --> B{Monitoring System}
B --> C[OpenTelemetry Tracing]
B --> D[Prometheus Metrics]
B --> E[Vercel Analytics]
B --> F[Health Checks]
C --> G[Jaeger UI]
D --> H[Grafana Dashboard]
E --> I[Vercel Insights]
F --> J[Alerting System]
```

**Diagram sources **

- [init.ts](file://packages/monitoring/src/init.ts#L0-L101)

**Section sources**

- [init.ts](file://packages/monitoring/src/init.ts#L0-L101)

## Domain Models for Audit Events

The system defines specific audit middleware configurations for different domains, each with appropriate sensitivity settings and logging requirements. These domain-specific implementations ensure compliance with relevant regulations while capturing necessary operational context.

### Healthcare Audit Model

```mermaid
classDiagram
class healthcareAuditMiddleware {
+includeRequestBody : true
+includeResponseBody : false
+sensitiveFields : string[]
+logLevel : 'info'
}
class SensitiveHealthcareFields {
+cpf
+rg
+cns
+medical_record
+diagnosis
+medication
+treatment
+patient_data
+health_data
}
healthcareAuditMiddleware --> SensitiveHealthcareFields : "includes"
```

**Diagram sources **

- [audit-log.ts](file://apps/api/src/middleware/audit-log.ts#L265-L283)

### Financial Audit Model

```mermaid
classDiagram
class financialAuditMiddleware {
+includeRequestBody : true
+includeResponseBody : false
+sensitiveFields : string[]
+logLevel : 'info'
}
class SensitiveFinancialFields {
+credit_card
+debit_card
+bank_account
+pix_key
+payment_method
+card_number
+cvv
+expiry
}
financialAuditMiddleware --> SensitiveFinancialFields : "includes"
```

**Diagram sources **

- [audit-log.ts](file://apps/api/src/middleware/audit-log.ts#L288-L305)

### Authentication Audit Model

```mermaid
classDiagram
class authAuditMiddleware {
+includeRequestBody : false
+includeResponseBody : false
+sensitiveFields : string[]
+logLevel : 'info'
}
class SensitiveAuthFields {
+password
+old_password
+new_password
+confirm_password
}
authAuditMiddleware --> SensitiveAuthFields : "includes"
```

**Diagram sources **

- [audit-log.ts](file://apps/api/src/middleware/audit-log.ts#L310-L323)

## Integration with Observability Systems

The platform integrates with multiple observability systems to provide comprehensive monitoring and analysis capabilities. OpenTelemetry serves as the primary instrumentation framework, exporting traces and metrics to various backends.

```mermaid
graph TB
subgraph Application
A[HealthcareTelemetryManager]
end
subgraph Exporters
B[Console Exporter]
C[Jaeger Exporter]
D[Prometheus Exporter]
end
subgraph Backends
E[Logging System]
F[Tracing UI]
G[Metrics Dashboard]
end
A --> B --> E
A --> C --> F
A --> D --> G
```

**Diagram sources **

- [opentelemetry-config.ts](file://packages/shared/src/telemetry/opentelemetry-config.ts#L0-L363)

**Section sources**

- [opentelemetry-config.ts](file://packages/shared/src/telemetry/opentelemetry-config.ts#L0-L363)

## Compliance and Regulatory Requirements

The audit logging system is designed to meet strict regulatory requirements, particularly Brazil's LGPD (Lei Geral de Proteção de Dados). The configuration includes data retention policies, anonymization settings, and explicit consent requirements.

```mermaid
erDiagram
AUDIT_LOG ||--o{ COMPLIANCE_POLICY : "follows"
AUDIT_LOG {
string id PK
datetime timestamp
string _userId FK
string action
string resource
json metadata
string ip
string userAgent
boolean lgpd_compliant
}
COMPLIANCE_POLICY {
string id PK
number dataRetentionDays
boolean requireExplicitConsent
boolean anonymizeByDefault
boolean enableDataMinimization
}
USER ||--o{ AUDIT_LOG : "generates"
USER {
string id PK
string anonymizedId
string role
}
```

**Section sources**

- [opentelemetry-config.ts](file://packages/shared/src/telemetry/opentelemetry-config.ts#L346-L393)

## Common Issues and Solutions

### Log Volume Management

High-volume operations can generate excessive log data. The system addresses this through sampling strategies and tiered logging levels, allowing detailed logging for critical operations while minimizing overhead for routine activities.

### Audit Integrity

To ensure audit trail integrity, the system implements write-once storage for audit records and cryptographic hashing to detect tampering. Each audit entry is timestamped and linked to the originating session and request.

### Regulatory Retention

The platform enforces configurable retention periods aligned with regulatory requirements. Automated purging removes records beyond their required retention period while maintaining chain-of-custody documentation for compliance audits.

**Section sources**

- [opentelemetry-config.ts](file://packages/shared/src/telemetry/opentelemetry-config.ts#L346-L393)

## Conclusion

The neonpro platform's audit logging and monitoring infrastructure provides a robust foundation for ensuring data security, regulatory compliance, and operational excellence. By implementing domain-specific audit policies, structured logging formats, and comprehensive observability integrations, the system enables both automated compliance and proactive issue detection across clinical, financial, and administrative workflows.
