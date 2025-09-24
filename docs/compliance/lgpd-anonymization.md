# LGPD Anonymization and Data Privacy Utilities

## Overview

This module provides comprehensive utilities for data anonymization and masking in compliance with Brazil's **Lei Geral de Proteção de Dados (LGPD)**. It offers healthcare-specific anonymization functions designed to protect patient privacy while maintaining data utility for analytics and research purposes.

## Key Features

### 🔒 **LGPD-Compliant Data Masking**

- CPF/CNPJ masking with format preservation
- Email and phone number anonymization
- Name and address masking with configurable visibility
- Healthcare data protection for patient records

### 📊 **Three Compliance Levels**

- **Basic**: Partial masking, keeps some data visible for operational needs
- **Enhanced**: Aggressive masking with limited visible information
- **Full Anonymization**: Complete anonymization for research/analytics

### 🏥 **Healthcare-Specific Features**

- Patient data anonymization with medical data protection
- Age group classification for demographic analysis
- Privacy compliance reporting and audit trails
- Anonymization metadata for compliance documentation

## Quick Start

```typescript
import { anonymizePersonalData, maskPatientData } from '@neonpro/security/anonymization'

// Basic patient data masking
const patient = {
  name: 'João Silva Santos',
  cpf: '12345678901',
  email: 'joao@hospital.com',
  phone: '11987654321',
}

const { data, metadata } = maskPatientData(patient, 'enhanced')
console.log(data.name) // "**** ***** ******"
console.log(data.cpf) // "***.***.***.** "
```

## Individual Masking Functions

### Document Masking

```typescript
import { maskCNPJ, maskCPF } from '@neonpro/security/anonymization'

maskCPF('123.456.789-01') // "***.***.***.** "
maskCNPJ('12.345.678/0001-95') // "**.***.***/****-**"
```

### Contact Information

```typescript
import { maskEmail, maskPhone } from '@neonpro/security/anonymization'

maskEmail('joao@hospital.com') // "j***@hospital.com"
maskPhone('11987654321') // "(11) 9****-****"
```

### Personal Information

```typescript
import { maskAddress, maskName } from '@neonpro/security/anonymization'

maskName('João Silva Santos') // "J*** S**** S******"
maskAddress({
  street: 'Rua das Flores, 123',
  city: 'São Paulo',
}) // { street: '**********', city: 'São Paulo' }
```

## Compliance Levels

### Basic Compliance

```typescript
const result = maskPatientData(patient, 'basic')
// - Masks direct identifiers (CPF, email, phone)
// - Partially masks name (first letter visible)
// - Preserves birth date and address for operational use
```

### Enhanced Compliance

```typescript
const result = maskPatientData(patient, 'enhanced')
// - Fully masks names and addresses
// - Converts birth date to year only
// - Suitable for internal analytics
```

### Full Anonymization

```typescript
const result = maskPatientData(patient, 'full_anonymization')
// - Replaces names with "ANONIMIZADO"
// - Converts dates to age groups (e.g., "1970-1990")
// - Removes all direct identifiers
// - Suitable for research and public datasets
```

## Privacy Compliance Reporting

```typescript
import { generatePrivacyReport } from '@neonpro/security/anonymization'

const original = { name: 'João Silva', cpf: '12345678901' }
const anonymized = maskPatientData(original)

const report = generatePrivacyReport(original, anonymized)
console.log(report.lgpdCompliant) // true/false
console.log(report.complianceScore) // 0-100
console.log(report.risks) // Array of identified risks
console.log(report.recommendations) // Improvement suggestions
```

## Configuration Options

### Masking Options

```typescript
interface MaskingOptions {
  maskChar?: string // Default: '*'
  visibleStart?: number // Characters visible at start
  visibleEnd?: number // Characters visible at end
  preserveFormat?: boolean // Keep formatting (dots, dashes)
  customPattern?: string // Custom masking pattern
}
```

### Default Configurations

```typescript
import { DEFAULT_MASKING_OPTIONS } from '@neonpro/security/anonymization'

// Pre-configured options for each compliance level
DEFAULT_MASKING_OPTIONS.basic // Conservative masking
DEFAULT_MASKING_OPTIONS.enhanced // Aggressive masking
DEFAULT_MASKING_OPTIONS.full_anonymization // Complete anonymization
```

## LGPD Compliance Guidelines

### ✅ **What This Module Provides:**

- **Article 12 Compliance**: Anonymized data handling according to LGPD
- **Healthcare Data Protection**: Article 13 compliance for health research
- **Audit Trail**: Complete anonymization metadata for compliance documentation
- **Risk Assessment**: Automated privacy risk analysis

### ⚖️ **Legal Considerations:**

- Anonymized data is **outside LGPD scope** when properly implemented
- **Pseudonymization** maintains additional security controls
- **Healthcare research** requires specific anonymization protocols
- **Data subject rights** don't apply to properly anonymized data

### 🔍 **Best Practices:**

1. **Choose appropriate compliance level** based on data use case
2. **Regular privacy assessments** using the reporting functions
3. **Maintain anonymization metadata** for audit purposes
4. **Test anonymization quality** before production use
5. **Review and update** anonymization rules regularly

## Integration Examples

### Express.js Middleware

```typescript
import { maskPatientData } from '@neonpro/security/anonymization'
import express from 'express'

app.use('/api/patients', (req, res, next) => {
  if (req.user.role !== 'admin') {
    const { data } = maskPatientData(req.body, 'basic')
    req.body = data
  }
  next()
})
```

### Database Query Anonymization

```typescript
import { anonymizePersonalData } from '@neonpro/security/anonymization'

const patients = await db.patients.findMany()
const anonymizedPatients = patients.map((patient) =>
  anonymizePersonalData(patient, ['name', 'cpf', 'email'])
)
```

## Error Handling

The module handles edge cases gracefully:

- Invalid input formats return original values
- Null/undefined inputs return appropriate defaults
- Short strings are masked proportionally
- Non-string values are replaced with placeholders

## Support and Compliance

For LGPD compliance questions or technical support:

- Review the automated privacy reports
- Consult with legal team for specific use cases
- Follow healthcare data protection guidelines (CFM/ANVISA)
- Maintain proper documentation and audit trails

---

**⚠️ Important**: This module provides technical tools for anonymization. Legal compliance requires proper implementation, regular audits, and consultation with privacy professionals.
