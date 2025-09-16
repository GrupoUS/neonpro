---
title: "Code Review & Audit Fix Guide - Quality, Coverage & Compliance"
last_updated: 2025-09-16
form: how-to
tags: [code-review, audit, quality, coverage, compliance, healthcare, tdd]
agent_coordination:
  primary: tdd-orchestrator
  support: [code-reviewer, security-auditor, architect-review]
  validation: [quality-gates, coverage-thresholds, compliance-checks]
related:
  - ./AGENTS.md
  - ./front-end-testing.md
  - ./backend-architecture-testing.md
  - ./database-security-testing.md
  - ../agents/code-review/tdd-orchestrator.md
---

# Code Review & Audit Fix Guide - Quality, Coverage & Compliance — Version: 3.0.0

## Overview

Comprehensive code review and audit framework coordinated by **tdd-orchestrator** agent with quality gates, coverage enforcement, and healthcare compliance validation. Consolidates review checklists, coverage policies, responsibility matrices, and CI/CD integration for systematic quality assurance.

**Target Audience**: Tech leads, Senior developers, QA engineers, Compliance officers
**Agent Coordinator**: `tdd-orchestrator.md` with multi-agent quality validation

## Prerequisites

- TDD Orchestrator agent setup and coordination
- Code review tools and CI/CD pipeline integration
- Coverage reporting tools (Vitest, c8, nyc)
- Healthcare compliance frameworks (LGPD, ANVISA, CFM)
- Static analysis tools (ESLint, TypeScript, SonarQube)

## Quick Start

### Basic Code Review Workflow
```bash
# Automated pre-review checks
bun run quality:check

# Generate coverage report
bun run test:coverage

# Run TDD orchestrator for comprehensive review
bun run tdd:orchestrate --feature=patient-management --agents=all

# Compliance audit
bun run audit:healthcare-compliance
```

## Code Review Checklist Framework

### 1. Funcionalidade & Lógica de Negócio

#### ✅ Requirements Validation
- [ ] **tdd-orchestrator**: O código implementa corretamente os requisitos especificados
- [ ] **architect-review**: A lógica de negócio está clara e bem estruturada
- [ ] **code-reviewer**: Casos extremos (edge cases) são tratados adequadamente
- [ ] **security-auditor**: Validações de entrada estão implementadas e são seguras
- [ ] **code-reviewer**: Tratamento de erros está presente e apropriado

#### ✅ Healthcare Business Logic
- [ ] **security-auditor**: Dados de pacientes são tratados conforme LGPD
- [ ] **architect-review**: Fluxos médicos seguem protocolos CFM/ANVISA
- [ ] **code-reviewer**: Cálculos de dosagem/medicação são precisos
- [ ] **security-auditor**: Auditoria automática de acesso a dados sensíveis
- [ ] **tdd-orchestrator**: Testes cobrem cenários críticos de saúde

### 2. Performance & Otimização

#### ✅ Code Performance
- [ ] **architect-review**: Não há loops desnecessários ou ineficientes
- [ ] **code-reviewer**: Consultas ao banco de dados são otimizadas
- [ ] **architect-review**: Uso de memória é adequado para aplicações healthcare
- [ ] **code-reviewer**: Não há vazamentos de memória potenciais
- [ ] **architect-review**: Operações assíncronas são utilizadas quando apropriado

#### ✅ Healthcare Performance SLAs
- [ ] **architect-review**: APIs críticas respondem em < 500ms
- [ ] **code-reviewer**: Queries de dados de paciente < 200ms
- [ ] **architect-review**: Real-time notifications < 100ms
- [ ] **security-auditor**: Autenticação/autorização < 300ms
- [ ] **tdd-orchestrator**: Performance tests validam SLAs

### 3. Qualidade & Estrutura do Código

#### ✅ Code Structure
- [ ] **architect-review**: Código segue os padrões de arquitetura definidos
- [ ] **code-reviewer**: Funções/métodos têm tamanho apropriado (< 50 linhas)
- [ ] **code-reviewer**: Nomes de variáveis e funções são descritivos
- [ ] **architect-review**: Responsabilidades estão bem separadas (SRP)
- [ ] **code-reviewer**: Não há duplicação desnecessária de código

#### ✅ Healthcare Code Standards
- [ ] **security-auditor**: Dados sensíveis nunca aparecem em logs
- [ ] **code-reviewer**: Comentários explicam lógica médica complexa
- [ ] **architect-review**: Integrações com sistemas médicos são resilientes
- [ ] **security-auditor**: Todas as APIs seguem padrões de segurança healthcare
- [ ] **tdd-orchestrator**: Código está coberto por testes apropriados

### 4. Segurança & Compliance

#### ✅ Security Validation
- [ ] **security-auditor**: Não há vulnerabilidades de segurança conhecidas
- [ ] **security-auditor**: Entrada de dados é validada e sanitizada
- [ ] **security-auditor**: Autenticação e autorização estão corretas
- [ ] **security-auditor**: Dados sensíveis são criptografados
- [ ] **security-auditor**: Logs não contêm informações sensíveis

#### ✅ Healthcare Compliance
- [ ] **security-auditor**: Conformidade com LGPD é mantida
- [ ] **security-auditor**: Requisitos ANVISA são atendidos
- [ ] **security-auditor**: Padrões CFM são seguidos
- [ ] **security-auditor**: Auditoria de acesso está implementada
- [ ] **security-auditor**: Consentimento do paciente é respeitado

## Coverage Policy Framework

### 1. Coverage Targets por Criticidade

```typescript
// Coverage configuration for healthcare application
export const coveragePolicy = {
  // 🔥 Critical (≥ 95% coverage)
  critical: {
    paths: [
      'src/services/patient/**',
      'src/services/billing/**',
      'src/services/medication/**',
      'src/services/ai-agents/**',
      'src/auth/**',
      'src/api/patients/**',
      'src/api/appointments/**'
    ],
    thresholds: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },

  // ⚡ Important (≥ 85% coverage)
  important: {
    paths: [
      'src/hooks/patient/**',
      'src/components/forms/**',
      'src/utils/validation/**',
      'src/services/notifications/**',
      'src/middleware/**'
    ],
    thresholds: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },

  // ✅ Useful (≥ 75% coverage)
  useful: {
    paths: [
      'src/components/ui/**',
      'src/utils/formatting/**',
      'src/utils/helpers/**'
    ],
    thresholds: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  }
};
```

### 2. Enforcement & Reporting

```typescript
// Coverage enforcement script
export class CoverageEnforcer {
  static async validateCoverage(): Promise<CoverageReport> {
    const report = await this.generateCoverageReport();
    const violations: CoverageViolation[] = [];

    // Check critical path coverage
    for (const [category, config] of Object.entries(coveragePolicy)) {
      const categoryReport = this.filterReportByPaths(report, config.paths);
      const violations = this.checkThresholds(categoryReport, config.thresholds);
      
      if (violations.length > 0) {
        violations.forEach(violation => {
          violations.push({
            category,
            severity: category === 'critical' ? 'blocker' : 'major',
            file: violation.file,
            metric: violation.metric,
            actual: violation.actual,
            expected: violation.expected
          });
        });
      }
    }

    return {
      overall: report,
      violations,
      passed: violations.length === 0
    };
  }

  static async enforceCoverageGates(): Promise<void> {
    const report = await this.validateCoverage();
    
    if (!report.passed) {
      const criticalViolations = report.violations.filter(v => v.severity === 'blocker');
      
      if (criticalViolations.length > 0) {
        throw new Error(
          `Critical coverage violations found:\n${
            criticalViolations.map(v => 
              `- ${v.file}: ${v.metric} coverage ${v.actual}% < ${v.expected}%`
            ).join('\n')
          }`
        );
      }
    }
  }
}
```

### 3. CI/CD Integration

```yaml
# .github/workflows/coverage-enforcement.yml
name: Coverage Enforcement
on: [push, pull_request]

jobs:
  coverage-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'bun'
      
      - run: bun install
      
      - name: Run Tests with Coverage
        run: bun run test:coverage
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      
      - name: Enforce Coverage Gates
        run: bun run coverage:enforce
      
      - name: Upload Coverage Reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
      
      - name: Generate Coverage Badge
        run: bun run coverage:badge
      
      - name: Comment PR with Coverage Report
        if: github.event_name == 'pull_request'
        uses: marocchino/sticky-pull-request-comment@v2
        with:
          message: |
            ## 📊 Coverage Report
            
            | Category | Coverage | Status |
            |----------|----------|--------|
            | Critical | ${{ env.CRITICAL_COVERAGE }}% | ${{ env.CRITICAL_STATUS }} |
            | Important | ${{ env.IMPORTANT_COVERAGE }}% | ${{ env.IMPORTANT_STATUS }} |
            | Useful | ${{ env.USEFUL_COVERAGE }}% | ${{ env.USEFUL_STATUS }} |
            
            **Overall Coverage**: ${{ env.OVERALL_COVERAGE }}%
```## Testing Responsibility Matrix (RACI)

### Core Responsibilities

| Role | Unit Tests | Integration Tests | E2E Tests | Security Audits | Code Review | Compliance Check |
|------|------------|-------------------|-----------|---------------|-------------|------------------|
| **Developer** | R | R | C | C | C | C |
| **Tech Lead** | A | A | R | R | R | A |
| **Security Engineer** | C | C | A | R | R | R |
| **QA Engineer** | C | R | R | C | C | C |
| **DevOps Engineer** | C | A | A | C | C | C |
| **Compliance Officer** | I | I | I | A | A | R |

**Legend**: R=Responsible, A=Accountable, C=Consulted, I=Informed

### Healthcare-Specific Assignments

```typescript
export const healthcareRACIMatrix = {
  patientDataHandling: {
    responsible: ['developer', 'security-engineer'],
    accountable: ['tech-lead', 'compliance-officer'],
    consulted: ['legal-team', 'privacy-officer'],
    informed: ['stakeholders', 'audit-team']
  },
  
  lgpdCompliance: {
    responsible: ['security-engineer', 'compliance-officer'],
    accountable: ['tech-lead'],
    consulted: ['legal-team', 'developer'],
    informed: ['management', 'audit-team']
  }
};
```

## TDD Orchestrator Coordination

### Agent Coordination Matrix

```typescript
export const agentCoordination = {
  codeReview: {
    primary: 'senior-developer-agent',
    secondary: ['security-auditor', 'compliance-checker'],
    escalation: 'tech-lead-agent',
    
    workflow: {
      trigger: 'pull-request-created',
      steps: [
        'automated-static-analysis',
        'security-vulnerability-scan',
        'compliance-validation',
        'peer-review-assignment',
        'final-approval-check'
      ]
    }
  }
};
```### Review Gates and Escalation

```typescript
export const reviewGates = {
  automatic: {
    linting: { blocking: true, timeout: '2m' },
    typeCheck: { blocking: true, timeout: '3m' },
    unitTests: { blocking: true, coverage: 90 }
  },
  
  manual: {
    codeReview: { 
      required: true, 
      minApprovals: 2,
      roles: ['senior-developer', 'tech-lead'] 
    },
    securityReview: { 
      required: 'patient-data-changes',
      approvers: ['security-engineer', 'compliance-officer']
    }
  },
  
  escalation: {
    criticalPath: ['src/services/patient/**', 'src/middleware/auth/**'],
    escalateTo: 'tech-lead-agent',
    notificationChannels: ['slack', 'email', 'dashboard']
  }
};
```

## Audit Fix Procedures

### Critical Issue Response (Healthcare)

```bash
# 1. Immediate Response Protocol
bun run audit:critical --component=patient-data
bun run security:scan --deep --compliance=lgpd

# 2. Isolation and Assessment  
git checkout -b hotfix/critical-security-$(date +%Y%m%d)
bun run test:security --affected-only
bun run compliance:validate --strict

# 3. Fix Implementation
bun run generate:fix --template=security-patch
bun run test:security:comprehensive
bun run audit:verify --post-fix
```### Standard Audit Fix Workflow

```typescript
export const auditFixWorkflow = {
  detection: {
    automated: ['sonarqube', 'eslint-security', 'audit-ci'],
    manual: ['peer-review', 'security-review', 'compliance-check']
  },
  
  categorization: {
    critical: { sla: '4h', escalation: 'immediate' },
    high: { sla: '24h', escalation: '8h' },
    medium: { sla: '1w', escalation: '3d' },
    low: { sla: '1m', escalation: '1w' }
  },
  
  remediation: {
    steps: [
      'issue-triage',
      'impact-assessment', 
      'fix-planning',
      'implementation',
      'testing-validation',
      'deployment-verification'
    ]
  }
};
```

### Fix Validation Framework

```typescript
describe('Audit Fix Validation', () => {
  describe('Security Vulnerability Fixes', () => {
    it('validates SQL injection prevention', async () => {
      // security-auditor: Test parameterized queries
      const maliciousInput = "'; DROP TABLE patients; --";
      expect(() => queryPatients(maliciousInput))
        .not.toThrow();
    });
    
    it('validates XSS prevention in patient forms', () => {
      // security-auditor: Test input sanitization  
      const xssPayload = '<script>alert("xss")</script>';
      render(<PatientForm initialData={{ name: xssPayload }} />);
      expect(screen.queryByRole('script')).not.toBeInTheDocument();
    });
  });
});
```## Troubleshooting

### Common Code Review Issues

| Issue | Symptom | Solution | Prevention |
|-------|---------|----------|------------|
| **Coverage Gaps** | Tests pass but coverage <90% | Add missing test cases for uncovered branches | Use coverage-guided development |
| **Flaky Tests** | Intermittent test failures | Fix race conditions, add proper waits | Use deterministic test data |
| **Security Gaps** | Static analysis warnings | Implement secure coding patterns | Regular security training |
| **Compliance Violations** | LGPD audit failures | Add data protection safeguards | Use compliance-first design |

### Escalation Procedures

```typescript
export const escalationMatrix = {
  level1: {
    trigger: 'automated-check-failure',
    response: 'developer-self-fix',
    timeout: '30m'
  },
  
  level2: {
    trigger: 'repeated-failures-or-security-issue',
    response: 'senior-developer-intervention',
    timeout: '2h'
  },
  
  level3: {
    trigger: 'patient-data-risk-or-compliance-violation',
    response: 'tech-lead-and-security-team',
    timeout: '4h'
  }
};
```

## Examples

### Healthcare Compliance Review Checklist

```typescript
export const healthcareComplianceChecklist = {
  patientDataAccess: [
    '✅ Row Level Security (RLS) policies active',
    '✅ Audit logging for all patient data access',
    '✅ Data anonymization in non-production environments',
    '✅ LGPD consent tracking implementation'
  ],
  
  apiSecurity: [
    '✅ Authentication required for all endpoints',
    '✅ Input validation and sanitization',
    '✅ Rate limiting configured',
    '✅ CORS policies restrictive'
  ]
};
```### Practical Review Scenario

```typescript
// ❌ BAD: Potential security vulnerability
export async function getPatientData(patientId: string) {
  const query = `SELECT * FROM patients WHERE id = '${patientId}'`;
  return await db.query(query);
}

// ✅ GOOD: Secure implementation with proper validation
export async function getPatientData(patientId: string, userId: string) {
  // Input validation
  if (!isValidUUID(patientId)) {
    throw new ValidationError('Invalid patient ID format');
  }
  
  // Parameterized query with RLS
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .eq('clinic_id', await getUserClinicId(userId))
    .single();
    
  if (error) {
    logger.warn('Patient access denied', { patientId, userId });
    throw new AuthorizationError('Access denied');
  }
  
  // Audit logging
  await auditLog.record({
    action: 'patient_data_access',
    userId,
    patientId,
    timestamp: new Date()
  });
  
  return data;
}
```

## See Also

- [Front-end Testing Guide](./front-end-testing.md) - React and UI testing patterns
- [Backend Architecture Testing](./backend-architecture-testing.md) - API and service testing
- [Database Security Testing](./database-security-testing.md) - Supabase and RLS testing  
- [TDD Orchestration AGENTS](./AGENTS.md) - LLM testing coordination guide
- [Healthcare Compliance Documentation](../rules/healthcare-compliance.md)
- [Security Best Practices](../rules/security-standards.md)
- [Coding Standards](../rules/coding-standards.md)

---

**Last Updated**: 2025-09-16  
**Version**: 1.0.0  
**Maintainer**: TDD Orchestration Framework