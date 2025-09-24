# Analytics Module

## Overview

The Analytics Module provides comprehensive healthcare analytics capabilities for NeonPro, designed specifically for Brazilian healthcare environments with built-in compliance for LGPD, ANVISA, CFM, and ANS regulations.

## Features

- **Clinical KPI Tracking**: Patient safety, quality of care, outcomes, and satisfaction metrics
- **Financial Analytics**: Revenue cycle, profitability, claims management, and cost analysis
- **Real-time Data Ingestion**: Flexible adapters for database, API, and stream data sources
- **Compliance Validation**: Built-in validation for Brazilian healthcare regulations
- **Data Quality Assessment**: Automated quality scoring and issue detection
- **Brazilian Healthcare Standards**: Native support for SUS, ANS, and CFM requirements

## Architecture

```
packages/core-services/src/analytics/
├── types/
│   ├── base-metrics.ts       # Core metric interfaces and utilities
│   ├── clinical-kpis.ts      # Clinical performance indicators
│   ├── financial-kpis.ts     # Financial performance indicators
│   └── ingestion.ts          # Data ingestion configuration types
├── adapters/
│   └── ingestion-adapter.ts  # Data ingestion adapters
├── __tests__/
│   ├── base-metrics.test.ts
│   ├── clinical-kpis.test.ts
│   ├── financial-kpis.test.ts
│   └── ingestion.test.ts
└── index.ts                  # Main module exports
```

## Quick Start

### Basic Metric Creation

```typescript
import { createMockMetric, createPatientSafetyKPI } from '@neonpro/core-services';

// Create a basic metric
const metric = createMockMetric({
  name: 'patient_satisfaction',
  value: 4.5,
  dataType: 'number',
  complianceFrameworks: ['LGPD'],
});

// Create a clinical KPI
const safetyKPI = createPatientSafetyKPI({
  name: 'medication_error_rate',
  value: 2.1,
  clinicId: 'clinic_123',
  safetyCategory: 'medication_safety',
  incidentCount: 5,
  totalEvents: 240,
});
```

### Financial Analytics

```typescript
import {
  calculateFinancialHealthScore,
  createRevenueCycleKPI,
  validateBrazilianFinancialCompliance,
} from '@neonpro/core-services';

// Create revenue cycle KPI
const revenueKPI = createRevenueCycleKPI({
  name: 'monthly_revenue',
  value: 150000.5,
  currency: 'BRL',
  clinicId: 'clinic_123',
  stage: 'collection',
});

// Calculate financial health
const healthScore = calculateFinancialHealthScore([revenueKPI]);
console.log(
  `Financial Health: ${healthScore.score}/100 (${healthScore.level})`,
);

// Validate compliance
const compliance = validateBrazilianFinancialCompliance(revenueKPI);
if (!compliance.compliant) {
  console.log('Compliance issues:', compliance.requirements);
}
```

### Data Ingestion

```typescript
import { DatabaseIngestionAdapter, IngestionConfig } from '@neonpro/core-services';

// Configure ingestion
const config: IngestionConfig = {
  sourceId: 'patient_data_db',
  sourceType: 'database',
  processing: {
    batchSize: 1000,
    frequency: 'hourly',
    validation: true,
    transformation: true,
    deduplication: true,
  },
  security: {
    encryption: true,
    anonymization: true,
    auditTrail: true,
    complianceFrameworks: ['LGPD', 'ANVISA'],
  },
  errorHandling: {
    retryAttempts: 3,
    failureNotification: true,
    deadLetterQueue: true,
  },
};

// Create and use adapter
const adapter = new DatabaseIngestionAdapter('db_adapter', config);
await adapter.connect();

const result = await adapter.ingestBatch(patientData);
console.log(`Processed ${result.summary.processedRecords} records`);
```

## Compliance Features

### LGPD (Lei Geral de Proteção de Dados)

- **Data Anonymization**: Automatic PII removal and anonymization
- **Consent Tracking**: Built-in consent validation for patient data
- **Data Retention**: Configurable retention policies
- **Audit Trail**: Complete data processing audit logs

```typescript
import { anonymizeMetric, validateMetricCompliance } from '@neonpro/core-services';

// Anonymize metric for analytics
const anonymizedMetric = anonymizeMetric(originalMetric);

// Validate LGPD compliance
const validation = validateMetricCompliance(metric);
if (validation.violations.length > 0) {
  console.log('LGPD violations found:', validation.violations);
}
```

### ANVISA Compliance

- **Clinical Data Validation**: Ensures clinical metrics meet ANVISA standards
- **Adverse Event Tracking**: Built-in support for adverse event reporting
- **Quality Indicators**: Pre-defined ANVISA quality metrics

### CFM (Conselho Federal de Medicina)

- **Medical Practice Standards**: Validation against CFM ethical guidelines
- **Professional Responsibility**: Clear tracking of medical decision responsibility
- **Clinical Effectiveness**: CFM-aligned quality measurements

### ANS (Agência Nacional de Saúde Suplementar)

- **Supplementary Health Metrics**: ANS quality indicators
- **Reimbursement Tracking**: ANS-compliant claims and reimbursement metrics
- **Quality Benchmarks**: Industry benchmarks for private insurance

## Clinical KPIs

### Patient Safety

```typescript
import { createPatientSafetyKPI } from '@neonpro/core-services';

const fallRateKPI = createPatientSafetyKPI({
  name: 'patient_fall_rate',
  value: 1.2,
  clinicId: 'clinic_123',
  safetyCategory: 'patient_falls',
  incidentCount: 3,
  totalEvents: 250,
});
```

### Quality of Care

```typescript
import { createQualityOfCareKPI } from '@neonpro/core-services';

const careQualityKPI = createQualityOfCareKPI({
  name: 'care_coordination_score',
  value: 4.3,
  clinicId: 'clinic_123',
  qualityDimension: 'care_coordination',
  measurementStandard: 'CFM',
});
```

### Patient Outcomes

```typescript
import { createPatientOutcomeKPI } from '@neonpro/core-services';

const outcomeKPI = createPatientOutcomeKPI({
  name: 'recovery_rate',
  value: 92.5,
  clinicId: 'clinic_123',
  outcomeType: 'clinical_outcome',
  measurement: {
    baseline: 85.0,
    target: 95.0,
    current: 92.5,
    trend: 'improving',
  },
});
```

### Clinical Quality Score

```typescript
import { calculateClinicalQualityScore } from '@neonpro/core-services';

const clinicalKPIs = [safetyKPI, qualityKPI, outcomeKPI];
const qualityScore = calculateClinicalQualityScore(clinicalKPIs);

console.log(`Clinical Quality: ${qualityScore.score}/100`);
console.log(`Level: ${qualityScore.level}`);
console.log(`Key areas:`, qualityScore.dimensions);
```

## Financial KPIs

### Revenue Cycle Management

```typescript
import { createRevenueCycleKPI } from '@neonpro/core-services';

const revenueKPI = createRevenueCycleKPI({
  name: 'net_patient_revenue',
  value: 125000.75,
  currency: 'BRL',
  clinicId: 'clinic_123',
  stage: 'collection',
});
```

### Insurance Claims

```typescript
import { createInsuranceClaimsKPI } from '@neonpro/core-services';

const claimsKPI = createInsuranceClaimsKPI({
  name: 'claims_approval_rate',
  value: 94.2,
  clinicId: 'clinic_123',
  payerType: 'private_insurance',
  denialRate: 5.8,
});
```

### Brazilian Payer Mix Analysis

```typescript
import { calculatePayerMixDiversity } from '@neonpro/core-services';

const payerMix = {
  sus: 45000, // SUS (public health system)
  private_insurance: 30000, // Private insurance
  out_of_pocket: 15000, // Direct payment
  employer_insurance: 10000, // Employer-sponsored insurance
};

const diversity = calculatePayerMixDiversity(payerMix);
console.log(`Payer diversity: ${diversity.diversityScore}/100`);
console.log(`Dominant payer: ${diversity.dominantPayer}`);
console.log(`Risk level: ${diversity.riskLevel}`);
```

## Data Ingestion

### Database Adapter

```typescript
import { DatabaseIngestionAdapter } from '@neonpro/core-services';

const dbAdapter = new DatabaseIngestionAdapter('patient_db', config);

// Event handling
dbAdapter.addEventListener('data_received', event => {
  console.log(`Received ${event.source.recordCount} records`);
});

dbAdapter.addEventListener('validation_failed', event => {
  console.log('Validation errors:', event.processing.errors);
});

// Batch ingestion
const result = await dbAdapter.ingestBatch(patientRecords);
```

### API Adapter

```typescript
import { APIIngestionAdapter } from '@neonpro/core-services';

const apiAdapter = new APIIngestionAdapter('external_api', config);

// Stream ingestion
const stream = new ReadableStream(/* API stream */);
const result = await apiAdapter.ingestStream(stream);
```

### Validation Rules

```typescript
// Add custom validation
await adapter.addValidationRule({
  ruleId: 'patient_id_format',
  description: 'Patient ID must follow Brazilian CPF format',
  field: 'patientId',
  type: 'format',
  parameters: {
    pattern: '^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$',
  },
  onError: 'reject',
  complianceFramework: 'LGPD',
});

// Add transformation rule
await adapter.addTransformationRule({
  transformId: 'anonymize_cpf',
  description: 'Anonymize CPF for analytics',
  sourceField: 'patientCPF',
  targetField: 'patientId',
  type: 'anonymize',
  logic: { method: 'hash' },
});
```

## Monitoring and Quality

### Data Quality Assessment

```typescript
import { IngestionMonitoringMetrics } from '@neonpro/core-services';

const metrics = await adapter.getMetrics();

console.log('Throughput:', metrics.throughput.recordsPerSecond, 'records/sec');
console.log('Quality Score:', metrics.quality.dataQualityScore, '/100');
console.log('Compliance Score:', metrics.quality.complianceScore, '/100');
console.log('Uptime:', metrics.performance.uptime, '%');
```

### Health Monitoring

```typescript
const health = await adapter.getHealthStatus();

if (health.status !== 'healthy') {
  console.log('Adapter issues:', health.errors);
  console.log('Component status:', health.details);
}
```

## Testing

The module includes comprehensive test suites:

```bash
# Run analytics tests
pnpm --filter @neonpro/core-services test analytics

# Run specific test files
pnpm --filter @neonpro/core-services test base-metrics.test.ts
pnpm --filter @neonpro/core-services test clinical-kpis.test.ts
pnpm --filter @neonpro/core-services test financial-kpis.test.ts
pnpm --filter @neonpro/core-services test ingestion.test.ts
```

### Test Coverage

- **Base Metrics**: Type guards, validation, anonymization, compliance checking
- **Clinical KPIs**: All KPI types, quality scoring, Brazilian compliance
- **Financial KPIs**: Revenue cycle, claims, health scoring, payer mix analysis
- **Ingestion**: Adapters, validation rules, transformation, error handling

## Configuration

### Environment Variables

```bash
# Analytics configuration
ANALYTICS_RETENTION_DAYS=2555  # 7 years for Brazilian compliance
ANALYTICS_ENCRYPTION_ENABLED=true
ANALYTICS_ANONYMIZATION_ENABLED=true
ANALYTICS_AUDIT_TRAIL_ENABLED=true

# Compliance frameworks
COMPLIANCE_FRAMEWORKS=LGPD,ANVISA,CFM,ANS

# Ingestion settings
INGESTION_BATCH_SIZE=1000
INGESTION_RETRY_ATTEMPTS=3
INGESTION_TIMEOUT_MS=30000
```

### Default Configuration

```typescript
import { createAnalyticsConfig } from '@neonpro/core-services';

const config = createAnalyticsConfig({
  clinicId: 'my-clinic',
  complianceFrameworks: ['LGPD', 'ANVISA', 'CFM'],
  enableEncryption: true,
  enableAnonymization: true,
  retentionDays: 2555, // 7 years
});
```

## Best Practices

### Data Privacy

1. **Always anonymize patient data** for analytics
2. **Use explicit consent tracking** for all patient metrics
3. **Implement data retention policies** according to Brazilian law
4. **Enable audit trails** for all data processing

### Performance

1. **Use batch processing** for large datasets
2. **Implement proper error handling** with retry logic
3. **Monitor data quality** continuously
4. **Cache frequently accessed metrics**

### Compliance

1. **Validate compliance** before storing metrics
2. **Document data lineage** for audit purposes
3. **Regular compliance assessments**
4. **Stay updated** with Brazilian healthcare regulations

## Brazilian Healthcare Context

### SUS (Sistema Único de Saúde)

- Public health system metrics and reporting
- Ministry of Health compliance requirements
- SIGTAP procedure coding validation

### ANS (Agência Nacional de Saúde Suplementar)

- Supplementary health insurance quality indicators
- Reimbursement rate monitoring
- Patient satisfaction tracking for private insurance

### CFM (Conselho Federal de Medicina)

- Medical practice ethical guidelines
- Professional responsibility tracking
- Clinical effectiveness measurements

### ANVISA (Agência Nacional de Vigilância Sanitária)

- Clinical data validation standards
- Adverse event reporting requirements
- Quality indicators for healthcare services

## Troubleshooting

### Common Issues

1. **Validation Failures**: Check field formats and required data
2. **Compliance Errors**: Ensure proper consent and anonymization
3. **Performance Issues**: Adjust batch sizes and processing frequency
4. **Connection Problems**: Verify adapter configuration and credentials

### Debug Mode

```typescript
// Enable debug logging
const adapter = new DatabaseIngestionAdapter('debug_adapter', {
  ...config,
  debug: true,
});

// Listen to all events
adapter.addEventListener('error_occurred', event => {
  console.error('Ingestion error:', event);
});
```

## Support

For questions or issues:

1. Check the test files for usage examples
2. Review compliance documentation in `/docs/compliance/`
3. Consult Brazilian healthcare regulation guides
4. Contact the development team for architecture questions

## Version History

- **v1.0.0**: Initial release with clinical/financial KPIs and ingestion adapters
- Comprehensive Brazilian healthcare compliance support
- Full test coverage and documentation
