# Healthcare API Documentation - NeonPro tRPC Endpoints

## Overview

This document provides comprehensive documentation for all tRPC procedures in the NeonPro healthcare platform, with specific focus on Brazilian healthcare compliance (LGPD, CFM, ANVISA) and international standards.

## Base URL & Authentication

```
Production: https://neonpro.vercel.app/api/trpc
Staging: https://neonpro-staging.vercel.app/api/trpc
Development: http://localhost:3000/api/trpc
```

### Authentication Headers
```typescript
{
  "Authorization": "Bearer <jwt_token>",
  "X-Healthcare-Platform": "neonpro",
  "X-Compliance-Version": "v1.0",
  "X-Clinic-ID": "<clinic_uuid>",
  "Content-Type": "application/json"
}
```

## Brazilian Healthcare Compliance Framework

### LGPD (Lei Geral de Proteção de Dados) Compliance
- **Article 7º**: Legal basis for personal data processing
- **Article 11º**: Enhanced protection for sensitive health data
- **Right to be forgotten**: Automatic anonymization on consent withdrawal
- **Data minimization**: Role-based data filtering
- **Audit trails**: Comprehensive logging for all patient data operations

### CFM (Conselho Federal de Medicina) Compliance
- **Resolution 2,314/2022**: Telemedicine standards
- **Real-time license validation**: Portal integration with portal.cfm.org.br
- **ICP-Brasil certificates**: Digital signature validation
- **NGS2 security standards**: Government-level security requirements

### ANVISA (Agência Nacional de Vigilância Sanitária) Compliance
- **RDC 657/2022**: Medical device software classification
- **SaMD compliance**: Software as Medical Device regulations
- **Adverse event reporting**: Automated detection and reporting
- **Post-market surveillance**: Continuous monitoring requirements

---

## 🏥 Patients Router

### Overview
LGPD-compliant patient data management with cryptographic consent and audit trails.

### Base Path: `/patients`

### 1. Create Patient

**Endpoint**: `patients.create`
**Method**: `Mutation`
**Middleware**: `healthcareProcedure` (RLS + Auth + CFM + LGPD audit)

#### Input Schema
```typescript
interface CreatePatientInput {
  fullName: string;
  cpf: string; // Brazilian individual taxpayer ID
  rg?: string; // Brazilian identity document
  cns?: string; // Brazilian health card (SUS)
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  lgpdConsentGiven: boolean; // Required for LGPD compliance
  lgpdConsentVersion: string; // Consent form version
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
}
```

#### Response
```typescript
interface CreatePatientResponse {
  id: string;
  fullName: string;
  medicalRecordNumber: string;
  consentStatus: 'active' | 'inactive';
  consentProof: string; // SHA-256 cryptographic proof
  createdAt: Date;
  updatedAt: Date;
}
```

#### LGPD Compliance Features
- ✅ Cryptographic consent verification (SHA-256)
- ✅ Automatic audit trail generation
- ✅ Legal basis documentation (legitimate healthcare interest)
- ✅ Data category classification
- ✅ Consent version tracking

#### Code Example
```typescript
const newPatient = await trpc.patients.create.mutate({
  fullName: "Maria Silva Santos",
  cpf: "123.456.789-00",
  email: "maria@example.com",
  phone: "+55 11 98765-4321",
  dateOfBirth: new Date("1985-06-15"),
  gender: "female",
  address: {
    street: "Rua das Flores",
    number: "123",
    district: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  },
  emergencyContact: {
    name: "João Santos",
    relationship: "spouse",
    phone: "+55 11 98765-4322"
  },
  lgpdConsentGiven: true,
  lgpdConsentVersion: "v2.1",
  allergies: ["penicillin"],
  chronicConditions: ["diabetes_type_2"]
});
```

### 2. Get Patient

**Endpoint**: `patients.get`
**Method**: `Query`
**Middleware**: `patientProcedure` (RLS + Auth + LGPD audit + Consent)

#### LGPD Data Minimization
- **Basic User**: Name, medical record number only
- **Healthcare Professional**: Full medical data
- **Administrator**: All data including audit information

### 3. Withdraw LGPD Consent

**Endpoint**: `patients.withdrawConsent`
**Method**: `Mutation`
**Middleware**: `patientProcedure`

#### LGPD "Right to be Forgotten" Implementation
- Implements LGPD Article 18 (Right to be Forgotten)
- Automatic data anonymization
- Cryptographic proof of withdrawal
- Irreversible process with audit trail

---

## 📅 Appointments Router

### Overview
AI-powered appointment management with no-show prediction, CFM validation, and multi-channel reminders.

### Base Path: `/appointments`

### 1. Create Appointment

**Endpoint**: `appointments.create`
**Method**: `Mutation`
**Middleware**: `healthcareProcedure`

#### AI-Powered Features
- **No-show risk prediction**: Brazilian behavior pattern analysis
- **CFM license validation**: Real-time verification with CFM portal
- **Adaptive reminders**: Multi-channel scheduling based on risk level

### 2. AI No-Show Risk Prediction

**Endpoint**: `appointments.predictNoShowRisk`
**Method**: `Query`

#### Brazilian Behavior Factors
- **Cultural factors**: Carnival season, regional holidays
- **Socioeconomic patterns**: SUS dependency, transportation
- **Weather impact**: Rain, heat wave effects
- **Urban mobility**: Traffic patterns, public transport

---

## 🤖 AI Router

### Overview
Multi-provider AI routing with Portuguese healthcare support and patient data anonymization.

### Base Path: `/ai`

### 1. Healthcare Chat

**Endpoint**: `ai.chat`
**Method**: `Mutation`

#### Portuguese Medical Terminology Support
- **50+ medical terms**: Automatic translation and validation
- **Brazilian healthcare context**: CFM, ANVISA, SUS integration
- **Patient data anonymization**: Automatic before AI processing

#### Multi-Provider Routing
- **Primary**: OpenAI GPT-4 (conversational excellence)
- **Fallback**: Anthropic Claude (cost optimization)
- **Health monitoring**: Provider performance tracking

---

## 🏥 Healthcare Services Router

### Base Path: `/healthcareServices`

### 1. LGPD Data Lifecycle Management
- `createConsent`: Generate new LGPD consent
- `revokeConsent`: Withdraw consent with anonymization
- `generateComplianceReport`: Full LGPD audit report

### 2. Telemedicine Session Management
- `createSession`: Initialize secure telemedicine session
- `validateCertificate`: ICP-Brasil certificate validation
- `monitorQuality`: Real-time session quality metrics

---

## 📡 Real-Time Telemedicine Router

### Base Path: `/realtimeTelemedicine`

### 1. Session Subscriptions
**Method**: `Subscription`
**Protocol**: `WebSocket`

#### Healthcare Quality Standards
- **Video quality**: 720p minimum, medical grade
- **Audio quality**: 48kHz medical grade
- **Latency**: <150ms for critical operations

---

## 🔒 Security & Compliance

### Row-Level Security (RLS)
- **Clinic-based isolation**: Multi-tenant data separation
- **Role-based access**: Granular permission control
- **Emergency override**: Audit-logged emergency access

### LGPD Data Subject Rights
1. **Right to Access** (Art. 9º): `patients.get` with data export
2. **Right to Rectification** (Art. 16º): `patients.update`
3. **Right to Erasure** (Art. 18º): `patients.withdrawConsent`
4. **Right to Portability** (Art. 20º): Data export functionality

---

## 📊 Performance Targets

### Response Time Requirements
- **Critical operations**: <100ms (patient lookup, emergency)
- **Standard operations**: <500ms (appointments, updates)
- **AI operations**: <2s (predictions, insights)

### Mobile Healthcare Users
- **3G networks**: <2s page load time
- **Cache optimization**: 85%+ hit rate

---

## 🌍 Brazilian Localization

### Time Zone Support
- **14 Brazilian time zones**: America/Sao_Paulo default
- **Regional holidays**: Calendar integration

### Healthcare Terminology
- **TUSS codes**: Procedure billing codes
- **CFM specialties**: Medical specialty validation
- **SUS integration**: Public healthcare compatibility

---

**Last Updated**: 2025-09-18  
**API Version**: v1.0  
**Compliance Version**: LGPD v2.1, CFM 2,314/2022, ANVISA RDC 657/2022