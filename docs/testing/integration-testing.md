---
title: "Integration Testing Guide with Healthcare & LGPD Compliance"
last_updated: 2025-09-16
form: how-to
tags: [integration, testing, healthcare, lgpd, compliance, agents]
related:
  - ./AGENTS.md
  - ../agents/code-review/architect-review.md
  - ../agents/code-review/security-auditor.md
  - ./supabase-testing-guide.md
agent_coordination:
  primary: architect-review
  support: [security-auditor, code-reviewer]
  validation: [lgpd-compliance, healthcare-patterns, api-contracts]
---

# Integration Testing Guide with Healthcare & LGPD Compliance — Version: 2.0.0

## Overview

Comprehensive integration testing strategy coordinated by **architect-review** agent with security-auditor validation for healthcare applications. Ensures API contracts, database integration, and external service validation while maintaining LGPD/GDPR compliance and healthcare regulatory requirements.

**Target Audience**: Developers, QA engineers, DevOps, Compliance teams
**Agent Coordinator**: `architect-review.md` with `security-auditor.md` compliance validation

## Principles & Agent Coordination

### Testing Philosophy
- **architect-review**: Validates contracts between modules/packages and external systems
- **security-auditor**: Ensures LGPD compliance and healthcare data protection
- **code-reviewer**: Validates integration code quality and performance
- Use real infrastructure where safe (local DB), mock third‑party/network for determinism
- Security & compliance first: auth, RLS (Supabase), data privacy (LGPD)

### Agent Workflows
```yaml
integration_testing_workflow:
  phase_1_planning:
    agent: architect-review
    tasks: ["Define integration boundaries", "Validate API contracts", "Plan test architecture"]
  
  phase_2_security:
    agent: security-auditor
    tasks: ["LGPD compliance validation", "Healthcare data protection", "Auth/RLS testing"]
  
  phase_3_execution:
    coordination: parallel
    agents: [architect-review, security-auditor, code-reviewer]
    tasks: ["Execute integration tests", "Validate performance", "Ensure compliance"]
```

## Stack Overview (Agent-Validated)

- **Test Runner**: Vitest (node + browser environments)
- **API**: Hono.dev (edge/server) — validated by `architect-review.md`
- **Database**: Supabase Postgres — secured by `security-auditor.md`
- **Realtime**: Supabase Realtime — performance validated by `code-reviewer.md`
- **AI**: Mock providers for deterministic outputs — patterns by `architect-review.md`

## LGPD Compliance Requirements (Security-Auditor Coordinated)

### Key LGPD Principles for Integration Testing

#### 1. Lawful, Fair, and Transparent Processing
- **Agent Validation**: `security-auditor.md` ensures legal basis documentation
- Ensure all test data processing has valid legal basis
- Document all data processing activities during testing
- Implement transparency mechanisms in test environments

#### 2. Data Minimization & Purpose Limitation
- **Agent Validation**: `architect-review.md` validates minimal data exposure
- Use only minimum necessary data for testing
- Implement data masking techniques for sensitive fields
- Create synthetic test data when possible

#### 3. Healthcare Data Security
- **Agent Validation**: `security-auditor.md` enforces healthcare-specific protection
- Implement enhanced security controls for health information
- Document all processing of special category data
- Consider additional healthcare regulations beyond LGPD

### LGPD Integration Testing Requirements

```typescript
// Example: LGPD-compliant integration test with agent validation
// Coordinated by security-auditor.md

describe('Patient Data Integration - LGPD Compliant', () => {
  let testClient: SupabaseClient;
  
  beforeAll(async () => {
    // security-auditor validation: Use test-only environment
    testClient = createTestSupabaseClient({
      anonymizeData: true,
      lgpdCompliant: true,
      auditTrail: true
    });
  });

  describe('Data Subject Rights Testing', () => {
    it('should handle patient data access requests', async () => {
      // architect-review validation: Contract compliance
      const accessRequest = await testClient
        .from('patient_data_requests')
        .insert({
          patient_id: SYNTHETIC_PATIENT_ID,
          request_type: 'access',
          request_date: new Date()
        });
      
      // security-auditor validation: Compliance verification
      expect(accessRequest.error).toBeNull();
      expect(accessRequest.data).toMatchLGPDRequirements();
    });

    it('should process data correction requests', async () => {
      // Implementation with agent validation
      const correctionRequest = await testClient
        .from('patient_data_corrections')
        .insert({
          patient_id: SYNTHETIC_PATIENT_ID,
          field_to_correct: 'email',
          new_value: 'corrected@example.com'
        });
      
      expect(correctionRequest.data).toHaveProperty('audit_trail');
    });
  });
});
```

## Healthcare Integration Testing (Multi-Agent Coordination)

### EHR Integration Testing
**Primary Agent**: `architect-review.md`
**Support Agent**: `security-auditor.md`

```typescript
// EHR integration with architectural validation
describe('EHR Integration - Architect Review Coordinated', () => {
  describe('Data Exchange Validation', () => {
    it('should maintain data integrity during EHR sync', async () => {
      // architect-review: Validate integration patterns
      const ehrData = await syncPatientData({
        patient_id: TEST_PATIENT_ID,
        data_source: 'primary_ehr',
        validation_rules: HEALTHCARE_VALIDATION_RULES
      });
      
      // security-auditor: Compliance check
      expect(ehrData).toComplyWithHealthcareStandards();
      expect(ehrData.audit_trail).toBeDefined();
    });
  });
});
```

### API Contract Testing
**Primary Agent**: `architect-review.md`
**Quality Agent**: `code-reviewer.md`

```typescript
// API contract testing with architectural validation
describe('Healthcare API Contracts', () => {
  it('should validate patient API endpoints', async () => {
    // architect-review: Contract validation
    const response = await testApiContract({
      endpoint: '/api/patients',
      method: 'POST',
      schema: PATIENT_SCHEMA,
      compliance: ['LGPD', 'HIPAA']
    });
    
    // code-reviewer: Performance validation
    expect(response.time).toBeLessThan(100); // ≤100ms requirement
    expect(response.contract).toBeValid();
  });
});
```

## Project Structure (Agent-Organized)

```
apps/
  api/                           # Hono.dev routes (architect-review)
    src/
      __tests__/
        integration/             # API integration tests
          lgpd-compliance/       # security-auditor coordinated
          healthcare-apis/       # architect-review patterns
          performance/           # code-reviewer metrics
  
  web/                           # React 19 + TanStack Router
    src/
      test/
        integration/             # Frontend integration tests
          auth-flows/            # security-auditor validation
          patient-workflows/     # healthcare-specific tests

tools/
  tests/
    integration/                 # Cross-cutting integration tests
      api/                       # architect-review coordinated
      database/                  # security-auditor RLS validation
      auth/                      # security-auditor compliance
      healthcare/                # multi-agent coordination
      lgpd-compliance/           # security-auditor primary
```

## Supabase Integration Patterns (Security-Auditor Coordinated)

### Database Integration with RLS Testing
```typescript
// RLS testing with security validation
describe('Supabase RLS Integration - Security Auditor Coordinated', () => {
  let supabase: SupabaseClient<Database>;
  
  beforeAll(async () => {
    // security-auditor: Ensure test isolation
    supabase = createClient<Database>(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_ANON_KEY!
    );
  });

  describe('Patient Data RLS', () => {
    it('should enforce row-level security for patient data', async () => {
      // security-auditor: RLS validation
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('organization_id', TEST_ORG_ID);
      
      // Ensure RLS is working
      expect(data).toBeInstanceOf(Array);
      expect(data?.length).toBeGreaterThan(0);
      expect(error).toBeNull();
      
      // security-auditor: Validate data isolation
      expect(data).not.toContainDataFromOtherOrganizations();
    });

    it('should deny access without proper authentication', async () => {
      const unauthenticatedClient = createClient(
        process.env.SUPABASE_TEST_URL!,
        process.env.SUPABASE_TEST_ANON_KEY!
      );
      
      const { data, error } = await unauthenticatedClient
        .from('patients')
        .select('*');
      
      // security-auditor: Access denial validation
      expect(error).toBeTruthy();
      expect(data).toBeNull();
    });
  });
});
```

### Authentication Flow Testing
**Primary Agent**: `security-auditor.md`
**Support Agent**: `architect-review.md`

```typescript
describe('Authentication Integration - Security Auditor Primary', () => {
  describe('LGPD-Compliant Authentication', () => {
    it('should handle user registration with consent', async () => {
      // security-auditor: Consent validation
      const registrationData = {
        email: 'test@example.com',
        password: 'SecurePassword123!',
        consent: {
          data_processing: true,
          marketing: false,
          lgpd_acknowledged: true,
          consent_date: new Date()
        }
      };
      
      const { data, error } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          data: {
            consent_record: registrationData.consent
          }
        }
      });
      
      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      
      // security-auditor: Consent storage validation
      expect(data.user?.user_metadata).toHaveProperty('consent_record');
    });

    it('should handle consent withdrawal', async () => {
      // Implementation with compliance validation
      const consentWithdrawal = await withdrawConsent({
        user_id: TEST_USER_ID,
        consent_types: ['marketing', 'data_processing'],
        withdrawal_date: new Date()
      });
      
      // security-auditor: Compliance verification
      expect(consentWithdrawal).toComplyWithLGPD();
    });
  });
});
```

## Healthcare API Integration (Architect-Review Coordinated)

### Hono API Testing Patterns
```typescript
// Hono API integration with architectural validation
describe('Hono Healthcare APIs - Architect Review Coordinated', () => {
  let app: Hono;
  
  beforeAll(() => {
    app = new Hono();
    
    // architect-review: Middleware validation
    app.use('*', healthcareAuthMiddleware);
    app.use('*', lgpdComplianceMiddleware);
    app.use('*', auditTrailMiddleware);
    
    // Healthcare-specific routes
    app.get('/api/patients/:id', getPatient);
    app.post('/api/patients', createPatient);
    app.put('/api/patients/:id', updatePatient);
  });

  describe('Patient Management APIs', () => {
    it('should validate patient creation with LGPD compliance', async () => {
      const patientData = {
        full_name: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao@example.com',
        consent: {
          data_processing: true,
          marketing: false
        }
      };
      
      // architect-review: API contract validation
      const response = await app.request('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        body: JSON.stringify(patientData)
      });
      
      expect(response.status).toBe(201);
      
      const responseData = await response.json();
      // security-auditor: Sensitive data masking
      expect(responseData.cpf).toBeMasked();
      expect(responseData.audit_trail).toBeDefined();
    });
  });
});
```

## AI Integration Testing (Multi-Agent)

### AI Service Mocking
**Coordination**: `architect-review.md` + `code-reviewer.md`

```typescript
// AI integration with deterministic testing
describe('AI Integration - Multi-Agent Coordination', () => {
  let mockAIService: MockAIService;
  
  beforeAll(() => {
    // architect-review: Service boundary validation
    mockAIService = createMockAIService({
      deterministic: true,
      healthcare_compliant: true,
      lgpd_safe: true
    });
  });

  describe('Clinical Decision Support', () => {
    it('should provide consistent AI recommendations', async () => {
      const patientData = {
        symptoms: ['fever', 'cough', 'fatigue'],
        medical_history: ['hypertension'],
        age: 45
      };
      
      // architect-review: Service contract validation
      const aiRecommendation = await mockAIService.getClinicalRecommendation(patientData);
      
      // code-reviewer: Response validation
      expect(aiRecommendation).toHaveProperty('recommendation');
      expect(aiRecommendation).toHaveProperty('confidence_score');
      expect(aiRecommendation.confidence_score).toBeGreaterThan(0.8);
      
      // security-auditor: Compliance check
      expect(aiRecommendation).not.toContainSensitiveData();
    });
  });
});
```

## Test Data Management (Security-Auditor Coordinated)

### Synthetic Data Generation
```typescript
// LGPD-compliant test data generation
class HealthcareSyntheticDataGenerator {
  // security-auditor: Ensure no real data exposure
  generatePatient(): SyntheticPatient {
    return {
      id: faker.datatype.uuid(),
      full_name: faker.name.fullName(),
      cpf: generateSyntheticCPF(), // Not a real CPF
      email: faker.internet.email(),
      birth_date: faker.date.birthdate(),
      created_at: new Date(),
      // security-auditor: Mark as synthetic
      _synthetic: true,
      _lgpd_compliant: true
    };
  }
  
  // architect-review: Validate data relationships
  generatePatientWithHistory(): SyntheticPatientWithHistory {
    const patient = this.generatePatient();
    return {
      ...patient,
      medical_history: this.generateMedicalHistory(patient.id),
      consultations: this.generateConsultations(patient.id)
    };
  }
}
```

### Test Environment Configuration
```typescript
// Environment setup with agent coordination
export const setupIntegrationTestEnvironment = async () => {
  // security-auditor: Secure test environment
  const testConfig = {
    database: {
      url: process.env.SUPABASE_TEST_URL,
      key: process.env.SUPABASE_TEST_ANON_KEY,
      rls_enabled: true,
      audit_trail: true
    },
    
    // architect-review: Service configuration
    services: {
      ai_service: 'mock',
      payment_service: 'mock',
      notification_service: 'mock'
    },
    
    // code-reviewer: Performance monitoring
    monitoring: {
      response_time_threshold: 100, // ms
      memory_limit: '512MB',
      cpu_limit: '200m'
    }
  };
  
  return initializeTestEnvironment(testConfig);
};
```

## Performance Integration Testing (Code-Reviewer Coordinated)

### Healthcare Performance Requirements
```typescript
describe('Healthcare Performance Integration - Code Reviewer Coordinated', () => {
  describe('Patient Data Operations', () => {
    it('should meet healthcare response time requirements', async () => {
      const startTime = performance.now();
      
      // code-reviewer: Performance validation
      const patientData = await fetchPatientData(TEST_PATIENT_ID);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Healthcare requirement: ≤100ms for patient data access
      expect(responseTime).toBeLessThan(100);
      expect(patientData).toBeDefined();
    });

    it('should handle concurrent patient data requests', async () => {
      const concurrentRequests = Array.from({ length: 100 }, (_, i) => 
        fetchPatientData(`patient_${i}`)
      );
      
      // code-reviewer: Concurrent load validation
      const results = await Promise.allSettled(concurrentRequests);
      const successfulRequests = results.filter(result => result.status === 'fulfilled');
      
      expect(successfulRequests.length).toBeGreaterThan(95); // 95% success rate
    });
  });
});
```

## CI/CD Integration (Multi-Agent Orchestrated)

### GitHub Actions Integration Testing
```yaml
# .github/workflows/integration-tests.yml
name: Healthcare Integration Tests

on:
  pull_request:
    paths: ['apps/**', 'packages/**']

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: supabase/postgres
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      # architect-review: Service setup validation
      - name: Setup Integration Environment
        run: |
          npm run test:integration:setup
          npm run test:integration:migrate
      
      # security-auditor: LGPD compliance validation
      - name: Run LGPD Compliance Tests
        run: npm run test:integration:lgpd
        env:
          LGPD_COMPLIANCE_MODE: strict
      
      # code-reviewer: Performance validation
      - name: Run Performance Integration Tests
        run: npm run test:integration:performance
        env:
          PERFORMANCE_THRESHOLD: 100
      
      # Multi-agent: Comprehensive integration testing
      - name: Run Full Integration Test Suite
        run: npm run test:integration
        env:
          AGENT_COORDINATION: enabled
          HEALTHCARE_MODE: true
```

## Best Practices (Agent-Enforced)

### Data Protection (Security-Auditor)
- Use synthetic data for all test scenarios
- Implement automatic data cleanup after tests
- Never use production data in test environments
- Maintain audit trails for all test data operations

### Architecture Validation (Architect-Review)
- Validate API contracts before implementation
- Test service boundaries and integration points
- Ensure proper error handling and recovery
- Validate data consistency across services

### Quality Assurance (Code-Reviewer)
- Monitor response times and performance metrics
- Validate code quality in integration scenarios
- Ensure maintainable test code structure
- Implement comprehensive error scenario testing

### Compliance Monitoring (Multi-Agent)
- Regular compliance audits of test environments
- Documentation of all data processing activities
- Continuous monitoring of regulatory changes
- Training for development teams on compliance requirements

## Quality Gates & Enforcement

### Integration Test Quality Gates
```yaml
QUALITY_GATES:
  architect_review:
    - "API contract compliance ≥95%"
    - "Service boundary validation ≥90%"
    - "Integration pattern adherence ≥85%"
  
  security_auditor:
    - "LGPD compliance validation ≥100%"
    - "Healthcare data protection ≥100%"
    - "Authentication/authorization ≥95%"
  
  code_reviewer:
    - "Performance thresholds met ≥90%"
    - "Code quality metrics ≥85%"
    - "Error handling coverage ≥80%"
```

## Troubleshooting & Support

### Common Integration Issues
| Issue | Primary Agent | Solution |
|-------|---------------|----------|
| **API Contract Violations** | `architect-review` | Validate service contracts and boundaries |
| **LGPD Compliance Failures** | `security-auditor` | Review data processing and consent mechanisms |
| **Performance Degradation** | `code-reviewer` | Analyze response times and optimize queries |
| **Authentication Failures** | `security-auditor` | Validate auth flows and RLS policies |

### Debug Commands
```bash
# Integration test debugging with agents
npm run test:integration:debug --agent=architect-review
npm run test:integration:trace --compliance=lgpd
npm run test:integration:performance --threshold=100
```

## See Also

- **[AGENTS.md](./AGENTS.md)** - Testing orchestration framework
- **[Supabase Testing Guide](./supabase-testing-guide.md)** - Database integration patterns
- **[Coverage Policy](./coverage-policy.md)** - Coverage requirements
- **[Security Auditor Agent](../agents/code-review/security-auditor.md)** - Security validation
- **[Architect Review Agent](../agents/code-review/architect-review.md)** - Architecture validation