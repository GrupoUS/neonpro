# Monitoring & Analytics

<cite>
**Referenced Files in This Document**   
- [performance-middleware.ts](file://apps/api/src/middleware/performance-middleware.ts)
- [error-tracking.ts](file://apps/api/src/middleware/error-tracking.ts)
- [health/checks.ts](file://packages/monitoring/src/health/checks.ts)
- [metrics/prometheus.ts](file://packages/monitoring/src/metrics/prometheus.ts)
- [logging/winston.ts](file://packages/monitoring/src/logging/winston.ts)
- [tracing/tracer.ts](file://packages/monitoring/src/tracing/tracer.ts)
- [monitoring-config.ts](file://config/vercel/monitoring-config.ts)
- [healthcare-alerts.json](file://tools/monitoring/alerts/healthcare-alerts.json)
- [performance-monitoring.json](file://tools/monitoring/dashboards/performance-monitoring.json)
- [compliance-monitoring.json](file://tools/monitoring/dashboards/compliance-monitoring.json)
- [init.ts](file://packages/monitoring/src/init.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
The neonpro application implements a comprehensive monitoring and analytics system designed to ensure high reliability, optimal performance, and strict compliance with healthcare regulations. This documentation details the architectural design of the observability framework, focusing on health checks, performance instrumentation, error tracking, compliance reporting, and alerting mechanisms. The system integrates multiple telemetry data types—metrics, logs, traces, and alerts—across distributed components while maintaining scalability and regulatory compliance.

## Project Structure

```mermaid
graph TD
subgraph "Monitoring Core"
M[packages/monitoring]
Health[health/]
Metrics[metrics/]
Logging[logging/]
Tracing[tracing/]
Performance[performance/]
end
subgraph "API Layer"
API[apps/api]
PMW[performance-middleware.ts]
ET[error-tracking.ts]
end
subgraph "Configuration"
CFG[config/vercel]
MC[monitoring-config.ts]
end
subgraph "Observability Assets"
TOOLS[tools/monitoring]
ALERTS[alerts/]
DASHBOARDS[dashboards/]
end
M --> API
MC --> M
M --> TOOLS
PMW --> Metrics
ET --> Logging
```

**Diagram sources**
- [packages/monitoring](file://packages/monitoring)
- [apps/api/src/middleware](file://apps/api/src/middleware)
- [config/vercel](file://config/vercel)
- [tools/monitoring](file://tools/monitoring)

**Section sources**
- [packages/monitoring](file://packages/monitoring)
- [apps/api/src/middleware](file://apps/api/src/middleware)

## Core Components

The monitoring architecture is built around several core components that handle different aspects of observability:

- **Health Check System**: Implements endpoint-level and system-wide health verification
- **Metrics Collection**: Captures performance counters, gauges, and histograms using Prometheus
- **Distributed Tracing**: Provides request-level visibility across service boundaries
- **Error Tracking**: Centralizes exception reporting with context enrichment
- **Log Aggregation**: Standardizes structured logging with Winston
- **Alert Management**: Defines threshold-based alerting rules for critical conditions
- **Compliance Monitoring**: Ensures adherence to healthcare data handling regulations

These components work together to provide full-stack observability while meeting stringent healthcare compliance requirements.

**Section sources**
- [packages/monitoring/src](file://packages/monitoring/src)
- [apps/api/src/middleware](file://apps/api/src/middleware)

## Architecture Overview

```mermaid
graph LR
A[Application Instances] --> B[Monitoring Middleware]
B --> C{Telemetry Data}
C --> D[Metrics Collector]
C --> E[Log Aggregator]
C --> F[Distributed Tracer]
C --> G[Error Tracker]
D --> H[Prometheus Server]
E --> I[Elasticsearch]
F --> J[Jaeger]
G --> K[Sentry]
H --> L[Grafana Dashboards]
I --> L
J --> L
K --> L
L --> M[Operations Team]
L --> N[Compliance Officers]
O[Alert Manager] --> P[Slack/Email/SMS]
H --> O
I --> O
J --> O
K --> O
Q[Compliance Rules] --> O
R[Performance Budgets] --> O
style A fill:#f9f,stroke:#333
style M fill:#bbf,stroke:#333
style N fill:#bbf,stroke:#333
style P fill:#f96,stroke:#333
```

**Diagram sources**
- [packages/monitoring/src/init.ts](file://packages/monitoring/src/init.ts)
- [tools/monitoring/alerts/healthcare-alerts.json](file://tools/monitoring/alerts/healthcare-alerts.json)
- [tools/monitoring/dashboards/performance-monitoring.json](file://tools/monitoring/dashboards/performance-monitoring.json)

## Detailed Component Analysis

### Health Check System Analysis

The health check system provides both basic liveness probes and comprehensive readiness checks that validate external dependencies.

```mermaid
classDiagram
class HealthCheck {
+name : string
+timeout : number
+execute() : Promise~HealthCheckResult~
+getMetadata() : object
}
class HealthCheckResult {
+status : 'healthy'|'degraded'|'unhealthy'
+details : object
+timestamp : Date
+duration : number
}
class HealthService {
-checks : Map~string, HealthCheck~
+registerCheck(check : HealthCheck) : void
+runAllChecks() : Promise~HealthCheckResult[]~
+getOverallStatus() : 'healthy'|'degraded'|'unhealthy'
+getHealthReport() : HealthReport
}
class HealthReport {
+status : string
+timestamp : Date
+checks : HealthCheckResult[]
+systemInfo : object
}
HealthService --> HealthCheck : "manages"
HealthService --> HealthReport : "generates"
HealthCheck --> HealthCheckResult : "produces"
```

**Diagram sources**
- [packages/monitoring/src/health/checks.ts](file://packages/monitoring/src/health/checks.ts)
- [packages/monitoring/src/health/index.ts](file://packages/monitoring/src/health/index.ts)

**Section sources**
- [packages/monitoring/src/health](file://packages/monitoring/src/health)

### Performance Monitoring Instrumentation

Performance monitoring is implemented through middleware that captures key metrics for every request.

```mermaid
sequenceDiagram
participant Client
participant API as "API Endpoint"
participant PMW as "PerformanceMiddleware"
participant Metrics as "Metrics Service"
participant Prometheus as "Prometheus Exporter"
Client->>API : HTTP Request
API->>PMW : onRequestStart()
PMW->>Metrics : incrementCounter('requests_total')
PMW->>Metrics : startTimer('request_duration')
API->>API : Process Request
API->>PMW : onRequestEnd()
PMW->>Metrics : observeHistogram('request_duration', value)
PMW->>Metrics : updateGauge('active_requests', delta)
Metrics->>Prometheus : Collect metrics
Prometheus-->>ScrapingService : Expose /metrics endpoint
PMW-->>API : Continue processing
API-->>Client : HTTP Response
```

**Diagram sources**
- [apps/api/src/middleware/performance-middleware.ts](file://apps/api/src/middleware/performance-middleware.ts)
- [packages/monitoring/src/metrics](file://packages/monitoring/src/metrics)

**Section sources**
- [apps/api/src/middleware/performance-middleware.ts](file://apps/api/src/middleware/performance-middleware.ts)

### Error Tracking Integration

The error tracking system captures exceptions and enriches them with contextual information before forwarding to external services.

```mermaid
flowchart TD
Start([Error Occurs]) --> Capture["Capture Exception"]
Capture --> Enrich["Enrich with Context<br>(User, Session, Request)"]
Enrich --> Sanitize["Sanitize Sensitive Data<br>(PHI Protection)"]
Sanitize --> Classify["Classify Error Type<br>(Business vs System)"]
Classify --> Store["Store Locally<br>(Temporary Buffer)"]
Store --> Forward["Forward to Sentry"]
Forward --> Alert["Trigger Alerts if Critical"]
Alert --> Notify["Notify On-Call Team"]
Notify --> Dashboard["Update Dashboards"]
Dashboard --> End([Completed])
style Sanitize fill:#ffcccc,stroke:#f00
style Classify fill:#ffcccc,stroke:#f00
```

**Diagram sources**
- [apps/api/src/middleware/error-tracking.ts](file://apps/api/src/middleware/error-tracking.ts)
- [packages/monitoring/src/logging/winston.ts](file://packages/monitoring/src/logging/winston.ts)

**Section sources**
- [apps/api/src/middleware/error-tracking.ts](file://apps/api/src/middleware/error-tracking.ts)

### Compliance Reporting Mechanisms

Compliance monitoring ensures adherence to healthcare regulations through automated checks and audit trails.

```mermaid
flowchart LR
A[Regulatory Requirements] --> B[Compliance Rules Engine]
B --> C[Data Access Monitoring]
B --> D[Audit Log Generation]
B --> E[Consent Verification]
B --> F[Data Retention Checks]
C --> G[Real-time Policy Enforcement]
D --> H[Immutable Audit Trail]
E --> I[Patient Consent Status]
F --> J[Automatic Data Purging]
G --> K[Alerts for Policy Violations]
H --> L[Compliance Dashboards]
I --> M[Reporting for Audits]
J --> N[Retention Compliance]
K --> O[Security Team]
L --> P[Compliance Officers]
M --> Q[Auditors]
N --> R[Data Governance]
style A fill:#f9f,stroke:#333
style O fill:#f96,stroke:#333
style P fill:#bbf,stroke:#333
style Q fill:#bbf,stroke:#333
style R fill:#bbf,stroke:#333
```

**Diagram sources**
- [tools/monitoring/dashboards/compliance-monitoring.json](file://tools/monitoring/dashboards/compliance-monitoring.json)
- [config/vercel/healthcare-compliance-config.ts](file://config/vercel/healthcare-compliance-config.ts)

**Section sources**
- [tools/monitoring/dashboards/compliance-monitoring.json](file://tools/monitoring/dashboards/compliance-monitoring.json)

### Alerting System Configuration

The alerting system uses predefined thresholds and machine learning baselines to detect anomalies.

```mermaid
stateDiagram-v2
[*] --> Idle
Idle --> Evaluating : "Check interval"
state Evaluating {
[*] --> QueryMetrics
QueryMetrics --> AnalyzeTrend
AnalyzeTrend --> CheckThresholds
CheckThresholds --> DetermineSeverity
DetermineSeverity --> Critical : "Critical breach"
DetermineSeverity --> Warning : "Warning condition"
DetermineSeverity --> Normal : "Within limits"
}
Critical --> TriggerAlert
Warning --> TriggerAlert
Normal --> Idle
TriggerAlert --> NotifyChannels
NotifyChannels --> Escalate : "No acknowledgment"
Escalate --> PageOnCall
PageOnCall --> Resolve : "Incident resolved"
Resolve --> Idle
TriggerAlert --> Resolve : "False positive"
Resolve --> Idle
note right of Critical
Includes : response time > 5s,
error rate > 5%, system down
end note
note right of Warning
Includes : CPU > 80%,
memory > 75%, slow queries
end note
```

**Diagram sources**
- [tools/monitoring/alerts/healthcare-alerts.json](file://tools/monitoring/alerts/healthcare-alerts.json)
- [packages/monitoring/src/init.ts](file://packages/monitoring/src/init.ts)

**Section sources**
- [tools/monitoring/alerts/healthcare-alerts.json](file://tools/monitoring/alerts/healthcare-alerts.json)

## Dependency Analysis

```mermaid
graph TD
A[apps/api] --> B[packages/monitoring]
B --> C[Prometheus Client]
B --> D[Winston Logger]
B --> E[OpenTelemetry]
B --> F[Sentry SDK]
G[tools/monitoring] --> H[Grafana]
G --> I[Alertmanager]
H --> J[Dashboard Templates]
I --> K[Notification Services]
L[config/vercel] --> M[Monitoring Configuration]
M --> B
M --> H
M --> I
N[Supabase Functions] --> O[healthcare-performance-monitor]
O --> B
P[AI Agents] --> Q[Agent-Specific Monitoring]
Q --> B
style A fill:#f9f,stroke:#333
style B fill:#0af,stroke:#333,color:#fff
style H fill:#f60,stroke:#333,color:#fff
style I fill:#c0c,stroke:#333,color:#fff
```

**Diagram sources**
- [package.json](file://package.json)
- [packages/monitoring/package.json](file://packages/monitoring/package.json)
- [config/vercel/monitoring-config.ts](file://config/vercel/monitoring-config.ts)

**Section sources**
- [package.json](file://package.json)
- [packages/monitoring/package.json](file://packages/monitoring/package.json)

## Performance Considerations

The monitoring system is designed with performance optimization as a primary concern:

- **Low Overhead Instrumentation**: Metrics collection adds minimal latency (<1ms) to requests
- **Asynchronous Processing**: Log writing and metric export occur off the main thread
- **Batched Transmission**: Telemetry data is sent in batches to reduce network overhead
- **Memory-Efficient Counters**: Gauges and counters use optimized data structures
- **Sampling Strategies**: Distributed tracing uses adaptive sampling to balance detail and performance
- **Metric Granularity Control**: Configurable resolution based on metric importance
- **Circuit Breakers**: Prevent monitoring system from impacting application performance during outages

The system maintains performance even under peak load conditions, ensuring observability doesn't compromise application responsiveness.

## Troubleshooting Guide

Common monitoring issues and their resolutions:

**Section sources**
- [packages/monitoring/src/logging](file://packages/monitoring/src/logging)
- [packages/monitoring/src/health](file://packages/monitoring/src/health)

### High Memory Usage in Monitoring Service
- Check for unbounded label cardinality in metrics
- Verify proper cleanup of completed traces
- Review log retention settings
- Monitor for memory leaks in long-running processes

### Missing Metrics in Dashboard
- Validate Prometheus scraping configuration
- Check application health endpoint status
- Verify network connectivity between components
- Confirm metric registration in code

### False Positive Alerts
- Review threshold configurations
- Adjust for legitimate traffic patterns
- Implement dynamic baselines
- Fine-tune alert conditions

### Slow Dashboard Rendering
- Optimize query complexity
- Implement appropriate time ranges
- Use summary metrics for historical data
- Enable dashboard caching

### Compliance Report Gaps
- Verify audit log completeness
- Check data retention policies
- Validate consent tracking implementation
- Ensure all regulated operations are logged

## Conclusion

The monitoring and analytics system in neonpro provides comprehensive observability while meeting the stringent requirements of healthcare applications. By integrating health checks, performance metrics, distributed tracing, error tracking, and compliance monitoring, the system enables proactive issue detection, rapid incident response, and regulatory compliance. The architecture balances detailed telemetry collection with performance efficiency and data security, ensuring reliable operation across distributed environments. Through well-defined alerting rules, customizable dashboards, and automated compliance reporting, the system supports both operational excellence and regulatory requirements in the healthcare domain.