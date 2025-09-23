# Aesthetic Clinic API Documentation - NeonPro tRPC Endpoints

## Overview

This document provides comprehensive documentation for all tRPC procedures in the NeonPro aesthetic clinic platform, with specific focus on Brazilian aesthetic clinic compliance (LGPD, Professional Councils, ANVISA) and international standards.

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
  "X-Aesthetic-Platform": "neonpro",
  "X-Compliance-Version": "v1.0",
  "X-Clinic-ID": "<clinic_uuid>",
  "Content-Type": "application/json"
}
```

## Brazilian Aesthetic Clinic Compliance Framework

### LGPD (Lei Geral de Proteção de Dados) Compliance

- **Article 7º**: Legal basis for personal data processing
- **Article 11º**: Enhanced protection for sensitive aesthetic client data
- **Right to be forgotten**: Automatic anonymization on consent withdrawal
- **Data minimization**: Role-based data filtering
- **Audit trails**: Comprehensive logging for all client data operations

### Professional Council Compliance

- **CNEP, COREN, CFF**: Virtual consultation and aesthetic procedure standards
- **Real-time license validation**: Portal integration with respective council portals
- **ICP-Brasil certificates**: Digital signature validation
- **Professional standards**: Ethical guidelines for aesthetic procedures

### ANVISA (Agência Nacional de Vigilância Sanitária) Compliance

- **Cosmetic regulations**: Product safety and labeling requirements
- **Equipment compliance**: Aesthetic device regulations
- **Product registration**: Cosmetic product tracking
- **Safety monitoring**: Adverse reaction reporting

---

## 👥 Clients Router

### Overview

LGPD-compliant client data management with cryptographic consent and audit trails.

### Base Path: `/clients`

### 1. Create Client

**Endpoint**: `clients.create`
**Method**: `Mutation`
**Middleware**: `aestheticProcedure` (RLS + Auth + Professional Council + LGPD audit)

#### Input Schema

```typescript
interface CreateClientInput {
  fullName: string;
  cpf: string; // Brazilian individual taxpayer ID
  rg?: string; // Brazilian identity document
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
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
  skinType?: "oily" | "dry" | "combination" | "sensitive" | "normal";
  concerns?: string[]; // acne, aging, pigmentation, etc.
  previousTreatments?: string[];
  productPreferences?: string[];
  contraindications?: string[];
}
```

#### Response

```typescript
interface CreateClientResponse {
  id: string;
  fullName: string;
  clientRecordNumber: string;
  consentStatus: "active" | "inactive";
  consentProof: string; // SHA-256 cryptographic proof
  createdAt: Date;
  updatedAt: Date;
}
```

#### LGPD Compliance Features

- ✅ Cryptographic consent verification (SHA-256)
- ✅ Automatic audit trail generation
- ✅ Legal basis documentation (legitimate aesthetic service interest)
- ✅ Data category classification
- ✅ Consent version tracking

#### Code Example

```typescript
const newClient = await trpc.clients.create.mutate({
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
    zipCode: "01234-567",
  },
  emergencyContact: {
    name: "João Santos",
    relationship: "spouse",
    phone: "+55 11 98765-4322",
  },
  lgpdConsentGiven: true,
  lgpdConsentVersion: "v2.1",
  skinType: "combination",
  concerns: ["acne", "aging"],
  previousTreatments: ["chemical_peel"],
});
```

### 2. Get Client

**Endpoint**: `clients.get`
**Method**: `Query`
**Middleware**: `clientProcedure` (RLS + Auth + LGPD audit + Consent)

#### LGPD Data Minimization

- **Basic User**: Name, client record number only
- **Aesthetic Professional**: Full aesthetic data
- **Administrator**: All data including audit information

### 3. Withdraw LGPD Consent

**Endpoint**: `clients.withdrawConsent`
**Method**: `Mutation`
**Middleware**: `clientProcedure`

#### LGPD "Right to be Forgotten" Implementation

- Implements LGPD Article 18 (Right to be Forgotten)
- Automatic data anonymization
- Cryptographic proof of withdrawal
- Irreversible process with audit trail

---

## 📅 Appointments Router

### Overview

AI-powered appointment management with no-show prediction, professional council validation, and multi-channel reminders.

### Base Path: `/appointments`

### 1. Create Appointment

**Endpoint**: `appointments.create`
**Method**: `Mutation`
**Middleware**: `aestheticProcedure`

#### AI-Powered Features

- **No-show risk prediction**: Brazilian behavior pattern analysis
- **Professional council license validation**: Real-time verification with council portals
- **Adaptive reminders**: Multi-channel scheduling based on risk level

### 2. AI No-Show Risk Prediction

**Endpoint**: `appointments.predictNoShowRisk`
**Method**: `Query`

#### Brazilian Behavior Factors

- **Cultural factors**: Carnival season, regional holidays
- **Socioeconomic patterns**: Transportation access, work schedules
- **Weather impact**: Rain, heat wave effects
- **Urban mobility**: Traffic patterns, public transport

---

## 🤖 AI Router

### Overview

Multi-provider AI routing with Portuguese aesthetic terminology support and client data anonymization.

### Base Path: `/ai`

### 1. Aesthetic Consultation Chat

**Endpoint**: `ai.chat`
**Method**: `Mutation`

#### Portuguese Aesthetic Terminology Support

- **50+ aesthetic terms**: Automatic translation and validation
- **Brazilian aesthetic context**: Professional councils, ANVISA cosmetic integration
- **Client data anonymization**: Automatic before AI processing

#### Multi-Provider Routing

- **Primary**: OpenAI GPT-4 (conversational excellence)
- **Fallback**: Anthropic Claude (cost optimization)
- **Performance monitoring**: Provider performance tracking

---

## 💆 Aesthetic Services Router

### Base Path: `/aestheticServices`

### 1. LGPD Data Lifecycle Management

- `createConsent`: Generate new LGPD consent
- `revokeConsent`: Withdraw consent with anonymization
- `generateComplianceReport`: Full LGPD audit report

### 2. Virtual Consultation Session Management

- `createSession`: Initialize secure virtual consultation session
- `validateCertificate`: ICP-Brasil certificate validation
- `monitorQuality`: Real-time session quality metrics

---

## 📡 Real-Time Virtual Consultation Router

### Base Path: `/realtimeVirtualConsultation`

### 1. Session Subscriptions

**Method**: `Subscription`
**Protocol**: `WebSocket`

#### Aesthetic Consultation Quality Standards

- **Video quality**: 720p minimum, consultation grade
- **Audio quality**: 48kHz consultation grade
- **Latency**: <150ms for critical operations

---

## 🔒 Security & Compliance

### Row-Level Security (RLS)

- **Clinic-based isolation**: Multi-tenant data separation
- **Role-based access**: Granular permission control
- **Emergency override**: Audit-logged emergency access

### LGPD Data Subject Rights

1. **Right to Access** (Art. 9º): `clients.get` with data export
2. **Right to Rectification** (Art. 16º): `clients.update`
3. **Right to Erasure** (Art. 18º): `clients.withdrawConsent`
4. **Right to Portability** (Art. 20º): Data export functionality

---

## 📊 Performance Targets

### Response Time Requirements

- **Critical operations**: <100ms (client lookup, consultation)
- **Standard operations**: <500ms (appointments, updates)
- **AI operations**: <2s (predictions, insights)

### Mobile Aesthetic Clinic Users

- **3G networks**: <2s page load time
- **Cache optimization**: 85%+ hit rate

---

## 🌍 Brazilian Localization

### Time Zone Support

- **14 Brazilian time zones**: America/Sao_Paulo default
- **Regional holidays**: Calendar integration

### Aesthetic Terminology

- **Procedure codes**: Aesthetic procedure billing codes
- **Professional council specialties**: Aesthetic specialty validation
- **Product catalog**: Cosmetic product integration

---

**Last Updated**: 2025-09-23  
**API Version**: v1.0  
**Compliance Version**: LGPD v2.1, Professional Council Standards, ANVISA Cosmetic Regulations
