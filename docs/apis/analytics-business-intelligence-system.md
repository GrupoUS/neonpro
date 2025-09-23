# Analytics and Business Intelligence System API Documentation

## Overview

The Analytics and Business Intelligence System provides comprehensive data aggregation, analytics, and business intelligence capabilities for Brazilian aesthetic clinics. This system enables data-driven decision making through real-time dashboards, predictive analytics, and automated reporting.

## Base URL

```
/api/v1/analytics
```

## Authentication

All endpoints require JWT authentication with the `Bearer` token in the Authorization header.

## Response Format

All responses follow the standard format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
```

## Endpoints

### 1. Analytics Configuration

#### 1.1 Create Analytics Configuration

**POST** `/configurations`

Creates a new analytics configuration.

**Request Body:**
```typescript
interface CreateAnalyticsConfigurationInput {
  clinicId: string;
  configType: 'data_warehouse' | 'predictive' | 'reporting' | 'alerting';
  name: string;
  description?: string;
  configuration: Record<string, any>;
  isActive?: boolean;
}
```

**Response:**
```typescript
interface AnalyticsConfiguration {
  id: string;
  clinicId: string;
  configType: string;
  name: string;
  description?: string;
  configuration: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Example:**
```json
{
  "success": true,
  "message": "Configuração de analytics criada com sucesso",
  "data": {
    "id": "config_123",
    "clinicId": "clinic_456",
    "configType": "data_warehouse",
    "name": "Configuração Principal",
    "description": "Configuração principal do data warehouse",
    "configuration": {
      "refreshInterval": 3600,
      "dataRetention": 365
    },
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 1.2 Get Analytics Configuration

**GET** `/configurations/:id`

Retrieves an analytics configuration by ID.

**Response:** Same as create response.

#### 1.3 Update Analytics Configuration

**PUT** `/configurations/:id`

Updates an analytics configuration.

**Request Body:** Same as create request.

#### 1.4 Delete Analytics Configuration

**DELETE** `/configurations/:id`

Deletes an analytics configuration.

#### 1.5 List Analytics Configurations

**GET** `/configurations`

Lists analytics configurations with filtering and pagination.

**Query Parameters:**
- `clinicId` (string, optional): Filter by clinic ID
- `configType` (string, optional): Filter by configuration type
- `isActive` (boolean, optional): Filter by active status
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response:**
```typescript
interface PaginatedResponse<AnalyticsConfiguration> {
  success: boolean;
  message: string;
  data: AnalyticsConfiguration[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 2. KPI Management

#### 2.1 Create KPI Definition

**POST** `/kpis`

Creates a new KPI definition.

**Request Body:**
```typescript
interface CreateKpiDefinitionInput {
  clinicId: string;
  name: string;
  description: string;
  category: 'financial' | 'clinical' | 'operational' | 'patient';
  metricType: 'count' | 'percentage' | 'currency' | 'rating' | 'time';
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  calculationMethod: string;
  aggregationType: 'sum' | 'average' | 'max' | 'min' | 'count';
  refreshInterval: number;
  isActive: boolean;
}
```

**Response:**
```typescript
interface KpiDefinition {
  id: string;
  clinicId: string;
  name: string;
  description: string;
  category: string;
  metricType: string;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  calculationMethod: string;
  aggregationType: string;
  refreshInterval: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### 2.2 Get KPI Definition

**GET** `/kpis/:id`

Retrieves a KPI definition by ID.

#### 2.3 Update KPI Definition

**PUT** `/kpis/:id`

Updates a KPI definition.

#### 2.4 Delete KPI Definition

**DELETE** `/kpis/:id`

Deletes a KPI definition.

#### 2.5 List KPI Definitions

**GET** `/kpis`

Lists KPI definitions with filtering and pagination.

**Query Parameters:**
- `clinicId` (string, optional): Filter by clinic ID
- `category` (string, optional): Filter by category
- `isActive` (boolean, optional): Filter by active status
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

### 3. Data Warehouse Management

#### 3.1 Get Data Warehouse Metrics

**GET** `/data-warehouse/metrics`

Retrieves data warehouse metrics with filtering.

**Query Parameters:**
- `clinicId` (string, required): Clinic ID
- `startDate` (string, optional): Start date (ISO format)
- `endDate` (string, optional): End date (ISO format)
- `metricName` (string, optional): Filter by metric name
- `category` (string, optional): Filter by category
- `dimension1` (string, optional): Filter by dimension 1
- `dimension2` (string, optional): Filter by dimension 2

**Response:**
```typescript
interface DataWarehouseMetric {
  id: string;
  clinicId: string;
  date: string;
  hour?: number;
  metricName: string;
  metricValue: number;
  metricCategory: string;
  dimension1?: string;
  dimension2?: string;
  dimension3?: string;
  sourceSystem: string;
  createdAt: string;
}
```

#### 3.2 Aggregate Data Warehouse Metrics

**POST** `/data-warehouse/aggregate`

Aggregates data warehouse metrics with custom criteria.

**Request Body:**
```typescript
interface AggregateDataWarehouseInput {
  clinicId: string;
  metrics: string[];
  aggregationType: 'sum' | 'average' | 'max' | 'min' | 'count';
  groupBy: string[];
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
}
```

**Response:**
```typescript
interface AggregatedMetric {
  group: Record<string, any>;
  metrics: Record<string, number>;
}
```

#### 3.3 Get Data Warehouse Summary

**GET** `/data-warehouse/summary`

Retrieves data warehouse summary statistics.

**Query Parameters:**
- `clinicId` (string, required): Clinic ID
- `period` (string, optional): 'day' | 'week' | 'month' | 'year'

**Response:**
```typescript
interface DataWarehouseSummary {
  totalRecords: number;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    total: number;
    byCategory: Record<string, number>;
  };
  dataQuality: {
    completeness: number;
    accuracy: number;
    timeliness: number;
  };
}
```

### 4. Dashboard Management

#### 4.1 Create Dashboard

**POST** `/dashboards`

Creates a new BI dashboard.

**Request Body:**
```typescript
interface CreateDashboardInput {
  clinicId: string;
  name: string;
  description?: string;
  layout: 'grid' | 'freeform';
  widgets: DashboardWidgetInput[];
  filters?: Record<string, any>;
  refreshInterval?: number;
  isPublic: boolean;
  isActive: boolean;
}

interface DashboardWidgetInput {
  type: string;
  title: string;
  description?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  configuration: Record<string, any>;
  dataSource: {
    type: string;
    query?: string;
    kpiId?: string;
  };
}
```

**Response:**
```typescript
interface Dashboard {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  layout: string;
  widgets: DashboardWidget[];
  filters: Record<string, any>;
  refreshInterval?: number;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  description?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  configuration: Record<string, any>;
  dataSource: {
    type: string;
    query?: string;
    kpiId?: string;
  };
}
```

#### 4.2 Get Dashboard

**GET** `/dashboards/:id`

Retrieves a dashboard by ID.

#### 4.3 Update Dashboard

**PUT** `/dashboards/:id`

Updates a dashboard.

#### 4.4 Delete Dashboard

**DELETE** `/dashboards/:id`

Deletes a dashboard.

#### 4.5 List Dashboards

**GET** `/dashboards`

Lists dashboards with filtering.

**Query Parameters:**
- `clinicId` (string, optional): Filter by clinic ID
- `isPublic` (boolean, optional): Filter by public status
- `isActive` (boolean, optional): Filter by active status

### 5. Widget Management

#### 5.1 Create Widget

**POST** `/widgets`

Creates a new dashboard widget.

**Request Body:** Same as DashboardWidgetInput.

#### 5.2 Get Widget

**GET** `/widgets/:id`

Retrieves a widget by ID.

#### 5.3 Update Widget

**PUT** `/widgets/:id`

Updates a widget.

#### 5.4 Delete Widget

**DELETE** `/widgets/:id`

Deletes a widget.

### 6. Scheduled Reports

#### 6.1 Create Scheduled Report

**POST** `/scheduled-reports`

Creates a new scheduled report.

**Request Body:**
```typescript
interface CreateScheduledReportInput {
  clinicId: string;
  name: string;
  description?: string;
  reportType: 'kpi' | 'dashboard' | 'custom';
  configuration: Record<string, any>;
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval?: number;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    time?: string;
  };
  delivery: {
    method: 'email' | 'download' | 'webhook';
    recipients?: string[];
    format: 'pdf' | 'excel' | 'csv' | 'json';
  };
  isActive: boolean;
}
```

**Response:**
```typescript
interface ScheduledReport {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  reportType: string;
  configuration: Record<string, any>;
  schedule: {
    type: string;
    interval?: number;
    daysOfWeek?: number[];
    daysOfMonth?: number[];
    time?: string;
  };
  delivery: {
    method: string;
    recipients?: string[];
    format: string;
  };
  isActive: boolean;
  lastRunAt?: string;
  nextRunAt: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 6.2 Get Scheduled Report

**GET** `/scheduled-reports/:id`

Retrieves a scheduled report by ID.

#### 6.3 Update Scheduled Report

**PUT** `/scheduled-reports/:id`

Updates a scheduled report.

#### 6.4 Delete Scheduled Report

**DELETE** `/scheduled-reports/:id`

Deletes a scheduled report.

#### 6.5 List Scheduled Reports

**GET** `/scheduled-reports`

Lists scheduled reports with filtering.

### 7. Predictive Models

#### 7.1 Create Predictive Model

**POST** `/predictive-models`

Creates a new predictive model.

**Request Body:**
```typescript
interface CreatePredictiveModelInput {
  clinicId: string;
  name: string;
  description?: string;
  modelType: 'no_show' | 'revenue' | 'patient_behavior' | 'treatment_outcome' | 'resource_optimization';
  algorithm: string;
  features: string[];
  targetVariable: string;
  hyperparameters?: Record<string, any>;
  trainingConfig?: {
    testSize?: number;
    validationSize?: number;
    crossValidation?: number;
  };
  isActive: boolean;
}
```

**Response:**
```typescript
interface PredictiveModel {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  modelType: string;
  algorithm: string;
  features: string[];
  targetVariable: string;
  hyperparameters?: Record<string, any>;
  trainingConfig?: {
    testSize?: number;
    validationSize?: number;
    crossValidation?: number;
  };
  modelMetrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    roc_auc?: number;
  };
  isActive: boolean;
  trainedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### 7.2 Train Predictive Model

**POST** `/predictive-models/:id/train`

Trains a predictive model.

**Response:**
```typescript
interface TrainingResult {
  modelId: string;
  status: 'training' | 'completed' | 'failed';
  metrics?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    roc_auc?: number;
  };
  message: string;
}
```

#### 7.3 Make Prediction

**POST** `/predictive-models/:id/predict`

Makes predictions using a trained model.

**Request Body:**
```typescript
interface PredictionInput {
  data: Record<string, any>[];
  modelVersion?: string;
}
```

**Response:**
```typescript
interface PredictionResult {
  predictions: any[];
  confidence?: number[];
  modelVersion: string;
  timestamp: string;
}
```

### 8. Analytics Alerts

#### 8.1 Create Alert

**POST** `/alerts`

Creates a new analytics alert.

**Request Body:**
```typescript
interface CreateAlertInput {
  clinicId: string;
  name: string;
  description?: string;
  kpiId?: string;
  condition: {
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
    value: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification: {
    channels: ('email' | 'sms' | 'webhook' | 'push')[];
    recipients?: string[];
    message?: string;
  };
  isActive: boolean;
}
```

**Response:**
```typescript
interface AnalyticsAlert {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  kpiId?: string;
  condition: {
    operator: string;
    value: number;
  };
  severity: string;
  notification: {
    channels: string[];
    recipients?: string[];
    message?: string;
  };
  isActive: boolean;
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### 8.2 Get Alert

**GET** `/alerts/:id`

Retrieves an alert by ID.

#### 8.3 Update Alert

**PUT** `/alerts/:id`

Updates an alert.

#### 8.4 Delete Alert

**DELETE** `/alerts/:id`

Deletes an alert.

#### 8.5 List Alerts

**GET** `/alerts`

Lists alerts with filtering.

#### 8.6 Get Alert History

**GET** `/alerts/:id/history`

Retrieves alert trigger history.

### 9. Data Export

#### 9.1 Create Export Request

**POST** `/export`

Creates a new data export request.

**Request Body:**
```typescript
interface CreateExportRequestInput {
  clinicId: string;
  name: string;
  description?: string;
  dataSource: {
    type: 'kpi' | 'dashboard' | 'custom_query' | 'data_warehouse';
    parameters: Record<string, any>;
  };
  format: 'csv' | 'excel' | 'json' | 'pdf';
  filters?: Record<string, any>;
  columns?: string[];
  schedule?: {
    type: 'once' | 'daily' | 'weekly' | 'monthly';
    configuration: Record<string, any>;
  };
}
```

**Response:**
```typescript
interface DataExportRequest {
  id: string;
  clinicId: string;
  name: string;
  description?: string;
  dataSource: {
    type: string;
    parameters: Record<string, any>;
  };
  format: string;
  filters?: Record<string, any>;
  columns?: string[];
  schedule?: {
    type: string;
    configuration: Record<string, any>;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  fileMetadata?: {
    size: number;
    recordCount: number;
    generatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

#### 9.2 Get Export Request

**GET** `/export/:id`

Retrieves an export request by ID.

#### 9.3 List Export Requests

**GET** `/export`

Lists export requests with filtering.

### 10. Analytics Events

#### 10.1 Track Event

**POST** `/events`

Tracks an analytics event.

**Request Body:**
```typescript
interface TrackEventInput {
  clinicId: string;
  eventType: string;
  eventCategory: string;
  eventData: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}
```

#### 10.2 Get Events

**GET** `/events`

Retrieves analytics events with filtering.

**Query Parameters:**
- `clinicId` (string, required): Clinic ID
- `eventType` (string, optional): Filter by event type
- `eventCategory` (string, optional): Filter by event category
- `startDate` (string, optional): Start date
- `endDate` (string, optional): End date
- `userId` (string, optional): Filter by user ID
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

### 11. Performance Metrics

#### 11.1 Get Performance Metrics

**GET** `/performance`

Retrieves system performance metrics.

**Query Parameters:**
- `clinicId` (string, required): Clinic ID
- `startDate` (string, optional): Start date
- `endDate` (string, optional): End date
- `metricTypes` (string[], optional): Filter by metric types

**Response:**
```typescript
interface PerformanceMetric {
  id: string;
  clinicId: string;
  metricType: string;
  metricName: string;
  metricValue: number;
  unit: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
```

#### 11.2 Get Performance Summary

**GET** `/performance/summary`

Retrieves performance metrics summary.

### 12. Comparative Analytics

#### 12.1 Get Comparative Data

**GET** `/comparative`

Retrieves comparative analytics data.

**Query Parameters:**
- `clinicId` (string, required): Clinic ID
- `benchmarkType` (string, optional): 'industry' | 'region' | 'size'
- `metrics` (string[], optional): Metrics to compare
- `period` (string, optional): Comparison period

**Response:**
```typescript
interface ComparativeData {
  clinic: Record<string, number>;
  benchmark: Record<string, number>;
  variance: Record<string, number>;
  percentiles: Record<string, number>;
  insights: {
    strengths: string[];
    opportunities: string[];
    recommendations: string[];
  };
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Standard endpoints**: 100 requests per minute
- **Data export endpoints**: 10 requests per minute
- **Predictive model training**: 1 request per hour

## WebSockets

Real-time analytics updates are available through WebSocket connections:

```
wss://api.neonpro.com/analytics/ws
```

### WebSocket Events

- **metrics_update**: Real-time metric updates
- **alert_triggered**: Alert notifications
- **dashboard_update**: Dashboard data updates
- **export_completed**: Export completion notifications

## Examples

### Creating a KPI with Alert

```bash
# Create KPI
curl -X POST https://api.neonpro.com/analytics/kpis \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "clinic_123",
    "name": "Taxa de No-Show",
    "description": "Percentual de pacientes que não comparecem às consultas",
    "category": "operational",
    "metricType": "percentage",
    "targetValue": 10,
    "warningThreshold": 15,
    "criticalThreshold": 20,
    "calculationMethod": "no_show_appointments / total_appointments * 100",
    "aggregationType": "average",
    "refreshInterval": 3600,
    "isActive": true
  }'

# Create Alert for KPI
curl -X POST https://api.neonpro.com/analytics/alerts \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "clinic_123",
    "name": "Alerta de No-Show Alto",
    "description": "Notificar quando taxa de no-show exceder 20%",
    "kpiId": "kpi_456",
    "condition": {
      "operator": "greater_than",
      "value": 20
    },
    "severity": "high",
    "notification": {
      "channels": ["email", "sms"],
      "recipients": ["admin@clinic.com"],
      "message": "Taxa de no-show elevada detectada"
    },
    "isActive": true
  }'
```

### Exporting Analytics Data

```bash
# Create export request
curl -X POST https://api.neonpro.com/analytics/export \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "clinic_123",
    "name": "Relatório Mensal de Desempenho",
    "description": "Relatório completo de métricas mensais",
    "dataSource": {
      "type": "data_warehouse",
      "parameters": {
        "metrics": ["revenue", "appointments", "patient_satisfaction"],
        "period": "month"
      }
    },
    "format": "excel",
    "filters": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    }
  }'
```

### Training a Predictive Model

```bash
# Create predictive model
curl -X POST https://api.neonpro.com/analytics/predictive-models \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "clinicId": "clinic_123",
    "name": "Previsão de No-Show",
    "description": "Modelo para prever probabilidade de no-show",
    "modelType": "no_show",
    "algorithm": "random_forest",
    "features": ["appointment_time", "patient_age", "procedure_type", "history", "weather"],
    "targetVariable": "no_show",
    "hyperparameters": {
      "n_estimators": 100,
      "max_depth": 10
    },
    "trainingConfig": {
      "testSize": 0.2,
      "validationSize": 0.1,
      "crossValidation": 5
    },
    "isActive": true
  }'

# Train the model
curl -X POST https://api.neonpro.com/analytics/predictive-models/model_123/train \
  -H "Authorization: Bearer your_jwt_token"
```

## Best Practices

1. **Use WebSockets for real-time updates**: Subscribe to WebSocket connections for live analytics data
2. **Implement proper error handling**: Handle rate limits and API errors gracefully
3. **Use appropriate aggregation**: Aggregate data at the right level to avoid overwhelming responses
4. **Cache frequently accessed data**: Implement client-side caching for dashboard data
5. **Monitor alert thresholds**: Set appropriate alert thresholds to avoid notification fatigue
6. **Validate data quality**: Ensure data quality before making business decisions
7. **Use comparative analytics**: Leverage benchmarking data for performance improvement
8. **Secure sensitive data**: Implement proper access controls for sensitive financial data

## Support

For API support and documentation updates, please contact our development team at [api-support@neonpro.com](mailto:api-support@neonpro.com).