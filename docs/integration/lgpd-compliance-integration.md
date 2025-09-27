# LGPD Compliance Integration Guide

## Overview

This guide provides comprehensive integration instructions for the LGPD (Lei Geral de Proteção de Dados) compliance system in the NeonPro platform. The system includes granular consent management, withdrawal mechanisms, audit trails, and compliance reporting.

## Architecture

### Core Components

1. **Consent Management Engine** (`packages/security/src/consent-manager.ts`)
   - Handles granular consent creation and validation
   - Manages healthcare-specific consent categories
   - Provides consent lifecycle management

2. **Withdrawal Service** (`packages/security/src/consent-withdrawal.ts`)
   - Immediate effect withdrawal mechanisms
   - Emergency override capabilities
   - Impact analysis and processing

3. **Audit System** (`packages/security/src/consent-audit.ts`)
   - Complete audit trail with blockchain verification
   - Cryptographic proof generation
   - Real-time compliance monitoring

4. **Compliance Service** (`packages/security/src/compliance-service.ts`)
   - Metrics generation and analysis
   - Report generation
   - Data subject rights processing

5. **API Endpoints** (`apps/api/src/routes/consent.ts` & `apps/api/src/routes/compliance.ts`)
   - RESTful APIs for all consent operations
   - Authentication and authorization middleware
   - Compliance validation and logging

6. **UI Components** (`apps/web/src/components/consent/` & `apps/web/src/components/compliance/`)
   - React components for consent management
   - Compliance dashboard
   - Administrative interfaces

## Healthcare-Specific Consent Categories

The system implements 11 healthcare-specific consent categories:

1. **Dados Médicos Básicos** - Basic medical information
2. **Histórico de Tratamentos** - Treatment history
3. **Dados Sensíveis (Biométricos/Genéticos)** - Sensitive biometric/genetic data
4. **Imagens Médicas** - Medical imaging
5. **Informações de Pagamento** - Payment information
6. **Recomendações de IA** - AI treatment recommendations
7. **Dados de Emergência** - Emergency contact and medical data
8. **Pesquisa Clínica** - Clinical research participation
9. **Marketing e Comunicação** - Marketing communications
10. **Compartilhamento com Profissionais** - Professional data sharing
11. **Dados de Dispositivos** - Medical device data

## Integration Steps

### 1. Database Setup

Ensure your database schema includes the LGPD compliance fields:

```sql
-- Patient table with Brazilian identity fields
ALTER TABLE patients ADD COLUMN cpf VARCHAR(14) UNIQUE;
ALTER TABLE patients ADD COLUMN rg VARCHAR(20);
ALTER TABLE patients ADD COLUMN cns VARCHAR(15);
ALTER TABLE patients ADD COLUMN passport_number VARCHAR(20);
ALTER TABLE patients ADD COLUMN nationality VARCHAR(50) DEFAULT 'BRASILEIRA';

-- LGPD consent tracking
CREATE TABLE lgpd_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    consent_type VARCHAR(50) NOT NULL,
    consent_data JSONB NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trail
CREATE TABLE consent_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    performed_by UUID,
    ip_address INET,
    user_agent TEXT,
    blockchain_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Backend Integration

#### Initialize Services

```typescript
// In your application startup
import { LGPDConsentManager } from '@neonpro/security/consent-manager';
import { ConsentWithdrawalService } from '@neonpro/security/consent-withdrawal';
import { ConsentAuditService } from '@neonpro/security/consent-audit';
import { ComplianceService } from '@neonpro/security/compliance-service';

const consentManager = new LGPDConsentManager();
const withdrawalService = new ConsentWithdrawalService();
const auditService = new ConsentAuditService();
const complianceService = new ComplianceService();
```

#### API Route Integration

```typescript
// apps/api/src/routes/consent.ts
import { Hono } from 'hono';
import { jwt } from 'hono/jwt';
import { consentRoutes } from '@neonpro/security/consent-routes';

const app = new Hono();

// Apply authentication middleware
app.use('/consent/*', jwt({ secret: process.env.JWT_SECRET! }));

// Mount consent routes
app.route('/consent', consentRoutes);

// Mount compliance routes
app.route('/compliance', complianceRoutes);
```

### 3. Frontend Integration

#### Component Usage

```typescript
// apps/web/src/components/PatientConsentForm.tsx
import { useState } from 'react';
import { ConsentManager } from '@/components/consent/ConsentManager';
import { ComplianceDashboard } from '@/components/compliance/ComplianceDashboard';

const PatientConsentForm = ({ patientId }: { patientId: string }) => {
  const [activeTab, setActiveTab] = useState<'consent' | 'compliance'>('consent');

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('consent')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'consent'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Consentimentos
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'compliance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Compliance LGPD
          </button>
        </nav>
      </div>

      {activeTab === 'consent' && <ConsentManager patientId={patientId} />}
      {activeTab === 'compliance' && <ComplianceDashboard clinicId="clinic-id" />}
    </div>
  );
};
```

## Usage Examples

### Creating Patient Consent

```typescript
const consent = await consentManager.createConsent({
  patientId: 'patient-uuid',
  categories: [
    {
      category: 'Dados Médicos Básicos',
      purpose: 'Tratamento médico e diagnóstico',
      retentionPeriod: 365, // days
      automatedProcessing: false
    },
    {
      category: 'Recomendações de IA',
      purpose: 'Análise e sugestões de tratamento',
      retentionPeriod: 180,
      automatedProcessing: true
    }
  ],
  consentMetadata: {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    location: 'São Paulo, BR'
  }
});
```

### Processing Withdrawal Request

```typescript
const withdrawal = await withdrawalService.processWithdrawal({
  patientId: 'patient-uuid',
  categories: ['Recomendações de IA'],
  reason: 'Não desejo mais receber recomendações automáticas',
  immediateEffect: true,
  emergencyOverride: false
});
```

### Generating Compliance Report

```typescript
const report = await complianceService.generateReport('clinic-uuid', {
  format: 'pdf',
  period: 'monthly',
  includeAudit: true,
  includeMetrics: true
});
```

## Key Features

### 1. Granular Consent Management
- 11 healthcare-specific categories
- Detailed purpose specification
- Configurable retention periods
- Automated processing controls

### 2. Immediate Effect Withdrawal
- Real-time consent revocation
- Emergency override capabilities
- Impact analysis before processing
- Comprehensive audit logging

### 3. Blockchain-Verified Audit Trail
- Immutable audit records
- Cryptographic proof generation
- Real-time compliance monitoring
- Complete traceability

### 4. Comprehensive Reporting
- Automated report generation
- Multiple export formats (PDF, JSON, CSV)
- Regulatory compliance scoring
- Customizable report periods

### 5. Data Subject Rights Implementation
- Access requests
- Correction requests
- Deletion requests (right to be forgotten)
- Data portability
- Automated decision objection

## Security Features

### 1. Encryption
- AES-256 encryption for data at rest
- TLS 1.3 for data in transit
- End-to-end encryption for sensitive data

### 2. Access Control
- Role-based access control (RBAC)
- Principle of least privilege
- Granular permission system

### 3. Audit Trail
- Complete activity logging
- Blockchain verification
- Immutable records
- Real-time monitoring

### 4. Compliance Validation
- Automated compliance checks
- Regulatory requirement tracking
- Real-time scoring
- Alert system for violations

## Deployment Considerations

### Environment Variables
```bash
# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/neonpro

# Blockchain Configuration
BLOCKCHAIN_PROVIDER_URL=https://blockchain-provider.com
BLOCKCHAIN_API_KEY=your-blockchain-api-key

# Compliance Configuration
COMPLIANCE_AUTO_REPORT=true
COMPLIANCE_REPORT_FREQUENCY=monthly
COMPLIANCE_RETENTION_DAYS=2555 # 7 years for LGPD compliance
```

### Monitoring
- Compliance score monitoring
- Audit trail monitoring
- Performance metrics
- Error tracking and alerting

### Backup and Recovery
- Regular database backups
- Audit trail backups
- Disaster recovery procedures
- Data restoration procedures

## Support and Maintenance

### Regular Updates
- Regulatory changes monitoring
- System updates and patches
- Security audits
- Performance optimization

### Documentation
- API documentation
- Integration guides
- User manuals
- Troubleshooting guides

### Training
- Administrator training
- User training
- Compliance officer training
- Developer training

## Conclusion

The LGPD compliance system provides a comprehensive solution for Brazilian healthcare data protection requirements. With granular consent management, immediate withdrawal capabilities, blockchain-verified audit trails, and comprehensive reporting, the system ensures full compliance with LGPD, ANVISA, and CFM regulations.

The modular architecture allows for easy integration with existing systems, while the robust security features ensure data protection and regulatory compliance. Regular updates and monitoring ensure continued compliance with evolving regulations.