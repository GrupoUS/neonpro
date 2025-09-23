# Compliance Management API Documentation

## Overview

The Compliance Management API provides comprehensive functionality for managing regulatory compliance in Brazilian aesthetic clinics. It supports LGPD (Lei Geral de Proteção de Dados), ANVISA (Agência Nacional de Vigilância Sanitária), and Professional Council (CFM, COREN, CFF, CNEP) compliance requirements.

## Base URL

```
/api/v1/compliance-management
```

## Authentication

All endpoints require authentication using Bearer tokens. The authenticated user must have appropriate permissions to access compliance data.

## Response Format

All endpoints return responses in the following format:

```typescript
{
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

## Endpoints

### Compliance Categories and Requirements

#### Get Compliance Categories

Retrieves compliance categories, optionally filtered by regulatory body.

**Endpoint:** `GET /getComplianceCategories`

**Input:**
```typescript
{
  regulatoryBody?: string; // 'LGPD', 'ANVISA', 'CFM', 'COREN', 'CFF', 'CNEP'
}
```

**Response:**
```typescript
{
  success: true;
  message: "Categorias de compliance obtidas com sucesso";
  data: ComplianceCategory[];
}
```

**Example:**
```bash
curl -X GET "https://api.neonpro.com/api/v1/compliance-management/getComplianceCategories?regulatoryBody=LGPD" \
  -H "Authorization: Bearer your-token-here"
```

#### Get Compliance Requirements

Retrieves compliance requirements, optionally filtered by category.

**Endpoint:** `GET /getComplianceRequirements`

**Input:**
```typescript
{
  categoryId?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Requisitos de compliance obtidos com sucesso";
  data: ComplianceRequirement[];
}
```

### Compliance Assessments

#### Create Compliance Assessment

Creates a new compliance assessment.

**Endpoint:** `POST /createComplianceAssessment`

**Input:**
```typescript
{
  requirementId: string;
  clinicId: string;
  assessmentType: "automated" | "manual" | "external_audit";
  findings?: string[];
  recommendations?: string[];
  evidenceUrls?: string[];
  assessedBy?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Avaliação de compliance criada com sucesso";
  data: ComplianceAssessment;
}
```

#### Get Compliance Assessments

Retrieves compliance assessments for a clinic, with optional filtering and pagination.

**Endpoint:** `GET /getComplianceAssessments`

**Input:**
```typescript
{
  clinicId: string;
  status?: string;
  page?: number; // default: 1
  pageSize?: number; // default: 20, max: 100
}
```

**Response:**
```typescript
{
  success: true;
  message: "Avaliações de compliance obtidas com sucesso";
  data: ComplianceAssessment[];
  pagination: {
    page: 1,
    pageSize: 20,
    total: 45,
    totalPages: 3
  };
}
```

#### Update Assessment Status

Updates the status and score of a compliance assessment.

**Endpoint:** `POST /updateAssessmentStatus`

**Input:**
```typescript
{
  assessmentId: string;
  status: "pending" | "in_progress" | "passed" | "failed" | "requires_action";
  score?: number; // 0-100
}
```

**Response:**
```typescript
{
  success: true;
  message: "Status da avaliação atualizado com sucesso";
  data: ComplianceAssessment;
}
```

### Data Consent Management

#### Create Data Consent

Creates a new data consent record.

**Endpoint:** `POST /createDataConsent`

**Input:**
```typescript
{
  clientId: string;
  clinicId: string;
  consentType: "data_processing" | "marketing" | "photos" | "treatment_sharing";
  consentVersion: string;
  consentDocumentUrl?: string;
  ipAddress?: string;
  userAgent?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Registro de consentimento criado com sucesso";
  data: DataConsentRecord;
}
```

#### Get Client Consents

Retrieves all consent records for a specific client.

**Endpoint:** `GET /getClientConsents`

**Input:**
```typescript
{
  clientId: string;
  clinicId: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Consentimentos do cliente obtidos com sucesso";
  data: DataConsentRecord[];
}
```

#### Withdraw Consent

Withdraws a client's consent.

**Endpoint:** `POST /withdrawConsent`

**Input:**
```typescript
{
  consentId: string;
  withdrawalReason?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Consentimento revogado com sucesso";
  data: DataConsentRecord;
}
```

### Data Subject Rights Management

#### Create Data Subject Request

Creates a new data subject rights request (LGPD).

**Endpoint:** `POST /createDataSubjectRequest`

**Input:**
```typescript
{
  clientId: string;
  clinicId: string;
  requestType: "access" | "rectification" | "erasure" | "portability" | "objection";
  requestDescription?: string;
  requestedData?: string[];
}
```

**Response:**
```typescript
{
  success: true;
  message: "Solicitação de titular criada com sucesso";
  data: DataSubjectRequest;
}
```

#### Get Data Subject Requests

Retrieves data subject requests for a clinic.

**Endpoint:** `GET /getDataSubjectRequests`

**Input:**
```typescript
{
  clinicId: string;
  status?: string;
  page?: number;
  pageSize?: number;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Solicitações de titulares obtidas com sucesso";
  data: DataSubjectRequest[];
  pagination: { /* ... */ };
}
```

#### Process Data Subject Request

Processes a data subject request.

**Endpoint:** `POST /processDataSubjectRequest`

**Input:**
```typescript
{
  requestId: string;
  status: "pending" | "in_progress" | "completed" | "rejected";
  responseText?: string;
  processedBy?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Solicitação de titular processada com sucesso";
  data: DataSubjectRequest;
}
```

### Data Breach Management

#### Create Data Breach Incident

Creates a new data breach incident record.

**Endpoint:** `POST /createDataBreachIncident`

**Input:**
```typescript
{
  clinicId: string;
  breachType: "unauthorized_access" | "data_loss" | "theft" | "disclosure";
  severityLevel: "low" | "medium" | "high" | "critical";
  description: string;
  affectedDataTypes?: string[];
  affectedClientsCount?: number;
  reportedBy?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Incidente de vazamento de dados criado com sucesso";
  data: DataBreachIncident;
}
```

#### Get Data Breach Incidents

Retrieves data breach incidents for a clinic.

**Endpoint:** `GET /getDataBreachIncidents`

**Input:**
```typescript
{
  clinicId: string;
  page?: number;
  pageSize?: number;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Incidentes de vazamento obtidos com sucesso";
  data: DataBreachIncident[];
  pagination: { /* ... */ };
}
```

#### Update Data Breach Incident

Updates a data breach incident.

**Endpoint:** `POST /updateDataBreachIncident`

**Input:**
```typescript
{
  incidentId: string;
  updates: {
    breachStartDate?: string;
    containmentDate?: string;
    resolutionDate?: string;
    mitigationActions?: string[];
    notificationSentToAuthority?: boolean;
    notificationSentToClients?: boolean;
  };
}
```

**Response:**
```typescript
{
  success: true;
  message: "Incidente de vazamento atualizado com sucesso";
  data: DataBreachIncident;
}
```

### ANVISA Compliance Management

#### Update ANVISA Compliance

Updates ANVISA compliance information for a product.

**Endpoint:** `POST /updateAnvisaCompliance`

**Input:**
```typescript
{
  productId: string;
  anvisaRegistrationNumber?: string;
  registrationStatus?: "active" | "expired" | "suspended" | "cancelled";
  registrationDate?: string;
  expiryDate?: string;
  lastVerificationDate?: string;
  isCompliant?: boolean;
  complianceNotes?: string;
  alertThresholdDays?: number;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Compliance ANVISA atualizado com sucesso";
  data: AnvisaProductCompliance;
}
```

#### Get ANVISA Compliance Status

Retrieves ANVISA compliance status for all products in a clinic.

**Endpoint:** `GET /getAnvisaComplianceStatus`

**Input:**
```typescript
{
  clinicId: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Status ANVISA obtido com sucesso";
  data: AnvisaProductCompliance[];
}
```

### Professional License Compliance

#### Update Professional License Compliance

Updates professional license compliance information.

**Endpoint:** `POST /updateProfessionalLicenseCompliance`

**Input:**
```typescript
{
  professionalId: string;
  licenseType: "CRM" | "COREN" | "CFF" | "CNEP";
  licenseNumber: string;
  issuingCouncil: string;
  licenseStatus: "active" | "expired" | "suspended" | "cancelled";
  expiryDate: string;
  renewalDate?: string;
  isVerified?: boolean;
  verificationDocumentUrl?: string;
  lastVerificationDate?: string;
  alertThresholdDays?: number;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Compliance de licença profissional atualizado com sucesso";
  data: ProfessionalLicenseCompliance;
}
```

#### Get Professional License Compliance

Retrieves professional license compliance status for all professionals in a clinic.

**Endpoint:** `GET /getProfessionalLicenseCompliance`

**Input:**
```typescript
{
  clinicId: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Compliance de licenças profissionais obtido com sucesso";
  data: ProfessionalLicenseCompliance[];
}
```

### Compliance Reports

#### Generate Compliance Report

Generates a compliance report asynchronously.

**Endpoint:** `POST /generateComplianceReport`

**Input:**
```typescript
{
  clinicId: string;
  reportType: "lgpd_summary" | "anvisa_compliance" | "license_status" | "data_breach" | "assessment_summary";
  reportPeriodStart: string;
  reportPeriodEnd: string;
  generatedBy?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Relatório de compliance gerado com sucesso";
  data: ComplianceReport;
}
```

#### Get Compliance Reports

Retrieves compliance reports for a clinic.

**Endpoint:** `GET /getComplianceReports`

**Input:**
```typescript
{
  clinicId: string;
  reportType?: string;
  page?: number;
  pageSize?: number;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Relatórios de compliance obtidos com sucesso";
  data: ComplianceReport[];
  pagination: { /* ... */ };
}
```

### Compliance Alerts

#### Get Compliance Alerts

Retrieves compliance alerts for a clinic.

**Endpoint:** `GET /getComplianceAlerts`

**Input:**
```typescript
{
  clinicId: string;
  unresolvedOnly?: boolean;
  page?: number;
  pageSize?: number;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Alertas de compliance obtidos com sucesso";
  data: ComplianceAlert[];
  pagination: { /* ... */ };
}
```

#### Create Compliance Alert

Creates a new compliance alert.

**Endpoint:** `POST /createComplianceAlert`

**Input:**
```typescript
{
  clinicId: string;
  alertType: "consent_expiry" | "license_expiry" | "assessment_due" | "data_breach" | "compliance_violation";
  severityLevel: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Alerta de compliance criado com sucesso";
  data: ComplianceAlert;
}
```

#### Resolve Alert

Resolves a compliance alert.

**Endpoint:** `POST /resolveAlert`

**Input:**
```typescript
{
  alertId: string;
  resolvedBy: string;
  resolutionNotes?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Alerta de compliance resolvido com sucesso";
  data: ComplianceAlert;
}
```

### Automated Compliance Checks

#### Run Automated Compliance Checks

Executes automated compliance checks for a clinic.

**Endpoint:** `POST /runAutomatedComplianceChecks`

**Input:**
```typescript
{
  clinicId: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Verificações automáticas de compliance executadas com sucesso";
}
```

### Data Retention Management

#### Process Scheduled Data Retention

Processes scheduled data retention policies.

**Endpoint:** `POST /processScheduledDataRetention`

**Input:**
```typescript
{
  clinicId?: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Processamento de retenção de dados agendado com sucesso";
}
```

### Dashboard Data

#### Get Compliance Dashboard

Retrieves dashboard data for compliance overview.

**Endpoint:** `GET /getComplianceDashboard`

**Input:**
```typescript
{
  clinicId: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Dados do dashboard de compliance obtidos com sucesso";
  data: {
    complianceScore: number;
    totalAlerts: number;
    totalAssessments: number;
    alertBreakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    complianceStatus: {
      anvisaActive: number;
      anvisaExpired: number;
      anvisaExpiringSoon: number;
      licensesActive: number;
      licensesExpired: number;
      licensesExpiringSoon: number;
    };
    recentAlerts: ComplianceAlert[];
    recentAssessments: ComplianceAssessment[];
  };
}
```

#### Get Compliance by Regulatory Body

Retrieves compliance data grouped by regulatory body.

**Endpoint:** `GET /getComplianceByRegulatoryBody`

**Input:**
```typescript
{
  clinicId: string;
}
```

**Response:**
```typescript
{
  success: true;
  message: "Compliance por órgão regulador obtido com sucesso";
  data: {
    [regulatoryBody: string]: {
      categoryName: string;
      totalRequirements: number;
      completedAssessments: number;
      pendingAssessments: number;
      failedAssessments: number;
      complianceScore: number;
    };
  };
}
```

## Data Types

### ComplianceCategory
```typescript
interface ComplianceCategory {
  id: string;
  name: string;
  description?: string;
  regulatoryBody: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### ComplianceRequirement
```typescript
interface ComplianceRequirement {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  requirementType: string;
  frequency: string;
  isMandatory: boolean;
  penaltyDescription?: string;
  implementationGuide?: string;
  createdAt: string;
  updatedAt: string;
}
```

### ComplianceAssessment
```typescript
interface ComplianceAssessment {
  id: string;
  requirementId: string;
  clinicId: string;
  assessmentDate: string;
  assessmentType: string;
  status: string;
  score?: number;
  findings?: string[];
  recommendations?: string[];
  evidenceUrls?: string[];
  assessedBy?: string;
  nextAssessmentDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

### DataConsentRecord
```typescript
interface DataConsentRecord {
  id: string;
  clientId: string;
  clinicId: string;
  consentType: string;
  consentVersion: string;
  isActive: boolean;
  consentDate: string;
  withdrawalDate?: string;
  withdrawalReason?: string;
  consentDocumentUrl?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}
```

### DataSubjectRequest
```typescript
interface DataSubjectRequest {
  id: string;
  clientId: string;
  clinicId: string;
  requestType: string;
  requestDescription?: string;
  status: string;
  requestedData?: string[];
  processedData?: any;
  responseText?: string;
  processedBy?: string;
  processedAt?: string;
  resolutionDeadline: string;
  createdAt: string;
  updatedAt: string;
}
```

### DataBreachIncident
```typescript
interface DataBreachIncident {
  id: string;
  clinicId: string;
  breachType: string;
  severityLevel: string;
  description: string;
  affectedDataTypes?: string[];
  affectedClientsCount?: number;
  discoveryDate: string;
  breachStartDate?: string;
  containmentDate?: string;
  resolutionDate?: string;
  mitigationActions?: string[];
  notificationSentToAuthority: boolean;
  notificationSentToClients: boolean;
  reportedBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

### ComplianceAlert
```typescript
interface ComplianceAlert {
  id: string;
  clinicId: string;
  alertType: string;
  severityLevel: string;
  title: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **200 OK**: Successful request
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Error Response Format
```typescript
{
  success: false;
  message: "Error description";
  error: "Detailed error information";
}
```

## Rate Limiting

API endpoints are subject to rate limiting:
- **Default**: 100 requests per minute per API key
- **Burst**: 200 requests per minute per API key

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Requests allowed per minute
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets (Unix timestamp)

## Webhooks

The API supports webhooks for real-time notifications:

### Webhook Events
- `compliance.assessment.created`: New compliance assessment created
- `compliance.assessment.updated`: Assessment status updated
- `compliance.consent.created`: New consent record created
- `compliance.consent.withdrawn`: Consent withdrawn
- `compliance.alert.created`: New compliance alert created
- `compliance.breach.reported`: Data breach incident reported

### Webhook Setup
Contact your account manager to configure webhooks for your clinic.

## Best Practices

### 1. Authentication
- Always use HTTPS for API calls
- Store tokens securely and rotate them regularly
- Use the least privileged access necessary

### 2. Data Handling
- Validate all input data before sending
- Use appropriate data types and formats
- Handle sensitive data according to LGPD requirements

### 3. Error Handling
- Implement proper error handling in your application
- Log errors for debugging purposes
- Provide user-friendly error messages

### 4. Performance
- Use pagination for large datasets
- Cache frequently accessed data
- Implement retry logic for transient errors

### 5. Compliance
- Keep detailed audit logs of all API interactions
- Process data subject requests promptly (within 15 days)
- Report data breaches to authorities within 72 hours

## Support

For technical support or compliance questions:
- **Email**: compliance@neonpro.com
- **Phone**: +55 11 9999-9999
- **Documentation**: [docs.neonpro.com](https://docs.neonpro.com)
- **Status Page**: [status.neonpro.com](https://status.neonpro.com)

## Changelog

### Version 1.0.0 (2025-09-23)
- Initial release of Compliance Management API
- Support for LGPD, ANVISA, and Professional Council compliance
- Automated compliance checks and alerting
- Comprehensive audit trail and reporting