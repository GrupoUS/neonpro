# API Documentation

## Overview

The NeonPro Healthcare Platform API is built with tRPC to provide end-to-end type safety and a great developer experience. The API is organized into routers that handle different aspects of the platform.

## Architecture

### tRPC

tRPC is used to build end-to-end type-safe APIs. It provides:

- Type safety from the database to the frontend
- Autocompletion in the IDE
- Automatic API documentation
- Great developer experience

### Routers

The API is organized into routers that handle different aspects of the platform:

- **Architecture Router**: Manages architecture configuration
- **Migration Router**: Manages migration state
- **Performance Metrics Router**: Manages performance metrics
- **Compliance Status Router**: Manages compliance status

## API Endpoints

### Architecture Router

#### GET /api/trpc/architecture.getConfig

Get the architecture configuration for a specific environment.

**Parameters**

- `environment` (optional): The environment to get the configuration for (development, staging, production)

**Response**

```typescript
{
  id: string;
  name: string;
  environment: "development" | "staging" | "production";
  edgeEnabled: boolean;
  supabaseFunctionsEnabled: boolean;
  bunEnabled: boolean;
  performanceMetrics: {
    edgeTTFB: number;
    realtimeUIPatch: number;
    copilotToolRoundtrip: number;
    buildTime: number;
    bundleSize: {
      main: number;
      vendor: number;
      total: number;
    };
    uptime: number;
    timestamp: Date;
  };
  complianceStatus: {
    lgpd: {
      compliant: boolean;
      lastAudit: Date;
      nextAudit: Date;
      issues: string[];
    };
    anvisa: {
      compliant: boolean;
      lastAudit: Date;
      nextAudit: Date;
      issues: string[];
    };
    cfm: {
      compliant: boolean;
      lastAudit: Date;
      nextAudit: Date;
      issues: string[];
    };
    wcag: {
      level: "2.1 AA+";
      compliant: boolean;
      lastAudit: Date;
      issues: string[];
    };
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### POST /api/trpc/architecture.createConfig

Create a new architecture configuration.

**Parameters**

- `config`: The architecture configuration to create

**Response**

The created architecture configuration.

#### POST /api/trpc/architecture.updateConfig

Update an existing architecture configuration.

**Parameters**

- `id`: The ID of the configuration to update
- `update`: The updates to apply to the configuration

**Response**

The updated architecture configuration.

#### POST /api/trpc/architecture.deleteConfig

Delete an existing architecture configuration.

**Parameters**

- `id`: The ID of the configuration to delete

**Response**

A boolean indicating whether the configuration was deleted successfully.

### Migration Router

#### GET /api/trpc/migration.getState

Get the migration state for a specific environment.

**Parameters**

- `environment` (optional): The environment to get the migration state for (development, staging, production)

**Response**

```typescript
{
  id: string;
  name: string;
  environment: "development" | "staging" | "production";
  phase: "setup" | "tests" | "implementation" | "integration" | "polish";
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: number;
  startTime: Date;
  endTime?: Date;
  tasks: {
    id: string;
    name: string;
    status: "pending" | "in_progress" | "completed" | "failed";
    startTime?: Date;
    endTime?: Date;
    error?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### POST /api/trpc/migration.createState

Create a new migration state.

**Parameters**

- `state`: The migration state to create

**Response**

The created migration state.

#### POST /api/trpc/migration.updateState

Update an existing migration state.

**Parameters**

- `id`: The ID of the state to update
- `update`: The updates to apply to the state

**Response**

The updated migration state.

#### POST /api/trpc/migration.deleteState

Delete an existing migration state.

**Parameters**

- `id`: The ID of the state to delete

**Response**

A boolean indicating whether the state was deleted successfully.

### Performance Metrics Router

#### GET /api/trpc/performanceMetrics.getState

Get the performance metrics for a specific environment.

**Parameters**

- `environment` (optional): The environment to get the performance metrics for (development, staging, production)

**Response**

```typescript
{
  id: string;
  name: string;
  environment: "development" | "staging" | "production";
  edgePerformance: {
    ttfb: number;
    cacheHitRate: number;
    coldStartFrequency: number;
    timestamp: Date;
  };
  realtimePerformance: {
    uiPatchTime: number;
    connectionLatency: number;
    messageDeliveryTime: number;
    timestamp: Date;
  };
  aiPerformance: {
    copilotToolRoundtrip: number;
    modelInferenceTime: number;
    responseGenerationTime: number;
    timestamp: Date;
  };
  buildPerformance: {
    buildTime: number;
    bundleSize: {
      main: number;
      vendor: number;
      total: number;
    };
    timestamp: Date;
  };
  systemPerformance: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### POST /api/trpc/performanceMetrics.createState

Create a new performance metrics state.

**Parameters**

- `metrics`: The performance metrics to create

**Response**

The created performance metrics state.

#### POST /api/trpc/performanceMetrics.updateState

Update an existing performance metrics state.

**Parameters**

- `id`: The ID of the state to update
- `update`: The updates to apply to the state

**Response**

The updated performance metrics state.

#### POST /api/trpc/performanceMetrics.deleteState

Delete an existing performance metrics state.

**Parameters**

- `id`: The ID of the state to delete

**Response**

A boolean indicating whether the state was deleted successfully.

#### POST /api/trpc/performanceMetrics.recordMetric

Record a performance metric.

**Parameters**

- `metricsId`: The ID of the metrics state to record the metric for
- `metricType`: The type of metric to record (edgePerformance, realtimePerformance, aiPerformance, buildPerformance, systemPerformance)
- `metric`: The metric to record

**Response**

A boolean indicating whether the metric was recorded successfully.

#### GET /api/trpc/performanceMetrics.getMetricsHistory

Get the history of performance metrics.

**Parameters**

- `metricsId`: The ID of the metrics state to get the history for
- `metricType`: The type of metric to get the history for (edgePerformance, realtimePerformance, aiPerformance, buildPerformance, systemPerformance)
- `limit` (optional): The maximum number of metrics to return

**Response**

An array of performance metrics.

#### GET /api/trpc/performanceMetrics.validateTTFBTarget

Validate the TTFB target.

**Parameters**

- `metricsId`: The ID of the metrics state to validate
- `target`: The TTFB target to validate against

**Response**

```typescript
{
  isValid: boolean;
  actualTTFB: number;
  targetTTFB: number;
  improvement: number;
}
```

#### GET /api/trpc/performanceMetrics.validateColdStartTarget

Validate the cold start target.

**Parameters**

- `metricsId`: The ID of the metrics state to validate
- `target`: The cold start target to validate against

**Response**

```typescript
{
  isValid: boolean;
  actualColdStartFrequency: number;
  targetColdStartFrequency: number;
  improvement: number;
}
```

#### GET /api/trpc/performanceMetrics.validateRealtimePerformance

Validate the real-time performance targets.

**Parameters**

- `metricsId`: The ID of the metrics state to validate
- `targets`: The real-time performance targets to validate against

**Response**

```typescript
{
  isValid: boolean;
  uiPatchTime: {
    isValid: boolean;
    actual: number;
    target: number;
    improvement: number;
  };
  connectionLatency: {
    isValid: boolean;
    actual: number;
    target: number;
    improvement: number;
  };
  messageDeliveryTime: {
    isValid: boolean;
    actual: number;
    target: number;
    improvement: number;
  };
  subscriptionSetupTime: {
    isValid: boolean;
    actual: number;
    target: number;
    improvement: number;
  };
}
```

### Compliance Status Router

#### GET /api/trpc/complianceStatus.getState

Get the compliance status for a specific environment.

**Parameters**

- `environment` (optional): The environment to get the compliance status for (development, staging, production)

**Response**

```typescript
{
  id: string;
  name: string;
  environment: "development" | "staging" | "production";
  lgpd: {
    framework: "LGPD";
    compliant: boolean;
    lastAudit: Date;
    nextAudit: Date;
    score: number;
    checks: {
      id: string;
      checkType: "audit_trail" | "data_encryption" | "access_control" | "data_minimization" | "consent_management";
      framework: "LGPD";
      status: "compliant" | "non_compliant" | "pending";
      severity: "low" | "medium" | "high" | "critical";
      score: number;
      lastChecked: Date;
      nextCheck: Date;
      issuesFound: number;
      issuesResolved: number;
      description: string;
      recommendations: string[];
      tags: string[];
      assignee: string;
    }[];
    issues: {
      id: string;
      regulation: "LGPD";
      requirement: string;
      description: string;
      severity: "low" | "medium" | "high" | "critical";
      status: "open" | "in_progress" | "resolved";
      createdAt: Date;
      resolvedAt?: Date;
    }[];
  };
  anvisa: {
    framework: "ANVISA";
    compliant: boolean;
    lastAudit: Date;
    nextAudit: Date;
    score: number;
    checks: {
      id: string;
      checkType: "documentation" | "quality_management" | "clinical_evaluation" | "post_market_surveillance";
      framework: "ANVISA";
      status: "compliant" | "non_compliant" | "pending";
      severity: "low" | "medium" | "high" | "critical";
      score: number;
      lastChecked: Date;
      nextCheck: Date;
      issuesFound: number;
      issuesResolved: number;
      description: string;
      recommendations: string[];
      tags: string[];
      assignee: string;
    }[];
    issues: {
      id: string;
      regulation: "ANVISA";
      requirement: string;
      description: string;
      severity: "low" | "medium" | "high" | "critical";
      status: "open" | "in_progress" | "resolved";
      createdAt: Date;
      resolvedAt?: Date;
    }[];
  };
  cfm: {
    framework: "CFM";
    compliant: boolean;
    lastAudit: Date;
    nextAudit: Date;
    score: number;
    checks: {
      id: string;
      checkType: "risk_assessment" | "professional_conduct" | "patient_safety" | "medical_records";
      framework: "CFM";
      status: "compliant" | "non_compliant" | "pending";
      severity: "low" | "medium" | "high" | "critical";
      score: number;
      lastChecked: Date;
      nextCheck: Date;
      issuesFound: number;
      issuesResolved: number;
      description: string;
      recommendations: string[];
      tags: string[];
      assignee: string;
    }[];
    issues: {
      id: string;
      regulation: "CFM";
      requirement: string;
      description: string;
      severity: "low" | "medium" | "high" | "critical";
      status: "open" | "in_progress" | "resolved";
      createdAt: Date;
      resolvedAt?: Date;
    }[];
  };
  wcag: {
    level: "2.1 AA+";
    compliant: boolean;
    lastAudit: Date;
    score: number;
    checks: {
      id: string;
      checkType: "accessibility" | "keyboard_navigation" | "screen_reader" | "color_contrast";
      framework: "LGPD";
      status: "compliant" | "non_compliant" | "pending";
      severity: "low" | "medium" | "high" | "critical";
      score: number;
      lastChecked: Date;
      nextCheck: Date;
      issuesFound: number;
      issuesResolved: number;
      description: string;
      recommendations: string[];
      tags: string[];
      assignee: string;
    }[];
    issues: {
      id: string;
      regulation: "WCAG";
      requirement: string;
      description: string;
      severity: "low" | "medium" | "high" | "critical";
      status: "open" | "in_progress" | "resolved";
      createdAt: Date;
      resolvedAt?: Date;
    }[];
  };
  overallScore: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### POST /api/trpc/complianceStatus.createState

Create a new compliance status state.

**Parameters**

- `status`: The compliance status to create

**Response**

The created compliance status state.

#### POST /api/trpc/complianceStatus.updateState

Update an existing compliance status state.

**Parameters**

- `id`: The ID of the state to update
- `update`: The updates to apply to the state

**Response**

The updated compliance status state.

#### POST /api/trpc/complianceStatus.deleteState

Delete an existing compliance status state.

**Parameters**

- `id`: The ID of the state to delete

**Response**

A boolean indicating whether the state was deleted successfully.

#### POST /api/trpc/complianceStatus.runComplianceCheck

Run a compliance check.

**Parameters**

- `statusId`: The ID of the status state to run the check for
- `framework`: The framework to run the check for (LGPD, ANVISA, CFM, WCAG)
- `checkType`: The type of check to run

**Response**

```typescript
{
  success: boolean;
  check: {
    id: string;
    checkType: string;
    framework: string;
    status: "compliant" | "non_compliant" | "pending";
    severity: "low" | "medium" | "high" | "critical";
    score: number;
    lastChecked: Date;
    nextCheck: Date;
    issuesFound: number;
    issuesResolved: number;
    description: string;
    recommendations: string[];
    tags: string[];
    assignee: string;
  };
}
```

#### GET /api/trpc/complianceStatus.getComplianceChecks

Get the compliance checks.

**Parameters**

- `statusId`: The ID of the status state to get the checks for
- `framework`: The framework to get the checks for (LGPD, ANVISA, CFM, WCAG)
- `limit` (optional): The maximum number of checks to return

**Response**

An array of compliance checks.

#### GET /api/trpc/complianceStatus.getComplianceIssues

Get the compliance issues.

**Parameters**

- `statusId`: The ID of the status state to get the issues for
- `framework`: The framework to get the issues for (LGPD, ANVISA, CFM, WCAG)
- `severity` (optional): The severity of issues to get
- `limit` (optional): The maximum number of issues to return

**Response**

An array of compliance issues.

#### GET /api/trpc/complianceStatus.getComplianceScore

Get the compliance score.

**Parameters**

- `statusId`: The ID of the status state to get the score for
- `framework`: The framework to get the score for (LGPD, ANVISA, CFM, WCAG)

**Response**

```typescript
{
  score: number;
  framework: string;
  lastCalculated: Date;
}
```

#### GET /api/trpc/complianceStatus.isComplianceReviewNeeded

Check if a compliance review is needed.

**Parameters**

- `statusId`: The ID of the status state to check

**Response**

```typescript
{
  reviewNeeded: boolean;
  reason: string;
  lastReview: Date;
  nextReview: Date;
}
```

## Authentication

All API endpoints require authentication. The API uses Supabase Auth for authentication with JWT tokens.

## Authorization

All API endpoints require authorization. The API uses role-based access control (RBAC) with row-level security (RLS) for fine-grained access control.

## Error Handling

The API uses standard HTTP status codes for error handling. Errors are returned in the following format:

```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Rate Limiting

The API uses rate limiting to protect against abuse. The rate limits are:

- 100 requests per minute per IP address
- 1000 requests per hour per user

## Pagination

List endpoints support pagination using the `limit` and `offset` parameters.

## Filtering

List endpoints support filtering using various parameters.

## Sorting

List endpoints support sorting using the `sort` and `order` parameters.

## Versioning

The API is versioned using the URL path. The current version is v1.

## Documentation

The API documentation is automatically generated from the tRPC schema and is available at `/api/trpc/docs`.

## Testing

The API is tested using contract tests, unit tests, and integration tests. The tests are located in the `tests/` directory.

## Monitoring

The API is monitored using performance metrics, error tracking, and uptime monitoring. The monitoring data is available in the performance metrics router.

## Security

The API is secured using authentication, authorization, encryption, and other security measures. The security documentation is available in the security documentation.

## Compliance

The API is compliant with LGPD, ANVISA, CFM, and WCAG standards. The compliance documentation is available in the compliance documentation.
