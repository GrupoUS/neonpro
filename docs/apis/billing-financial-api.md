---
title: "Billing & Financial API"
last_updated: 2025-09-24
form: reference
tags: [billing, financial, sus, health-plan, taxes]
priority: HIGH
related:
  - ./AGENTS.md
  - ./healthcare-compliance-api.md
---

# Billing & Financial API — Essential Endpoints

## Billing Management

### Core Endpoints

```bash
POST /api/billing/create           # Create new billing
GET  /api/billing/:id              # Get billing details
PUT  /api/billing/:id              # Update billing
GET  /api/billing/search           # Search billings
```

### Payment Processing

```bash
POST /api/billing/payment/process  # Process payment
POST /api/billing/payment/pix      # PIX payment
POST /api/billing/payment/card     # Card payment
GET  /api/billing/payment/status   # Payment status
```

## Brazilian Healthcare Billing

### SUS Integration

```bash
POST /api/billing/sus/submit       # Submit SUS billing
GET  /api/billing/sus/status       # SUS approval status
GET  /api/billing/sus/procedures   # SUS procedure codes
```

### Health Plan Processing

```bash
POST /api/billing/health-plan      # Process health plan billing
GET  /api/billing/health-plan/ans  # ANS plan validation
POST /api/billing/preauth          # Pre-authorization request
```

## CBHPM Procedures

### Procedure Management

```bash
GET  /api/procedures/cbhpm         # List CBHPM codes
GET  /api/procedures/cbhpm/:code   # Get procedure details
POST /api/procedures/calculate     # Calculate procedure value
```

## Tax Calculations

### Brazilian Taxes

```bash
POST /api/taxes/calculate          # Calculate all taxes
GET  /api/taxes/iss                # ISS calculation
GET  /api/taxes/pis-cofins         # PIS/COFINS calculation
POST /api/taxes/nfse               # Generate NFSe
```

## Implementation Examples

### Create Billing

```typescript
interface CreateBillingRequest {
  patientId: string
  clinicId: string
  professionalId: string
  billingType: 'sus' | 'health_plan' | 'private' | 'mixed'
  items: BillingItem[]
  healthPlan?: {
    planId: string
    ansNumber: string
    cardNumber: string
    coveragePercentage: number
    preAuthRequired: boolean
  }
  paymentMethod?: 'cash' | 'pix' | 'credit_card' | 'health_plan'
}

const billing = await fetch('/api/billing/create', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(billingData),
})
```

### Process PIX Payment

```typescript
const pixPayment = await fetch('/api/billing/payment/pix', {
  method: 'POST',
  body: JSON.stringify({
    billingId: 'billing_123',
    amount: 150.00,
    pixKey: '+5511999999999',
  }),
})
```

### CBHPM Procedure Lookup

```typescript
const procedure = await fetch('/api/procedures/cbhpm/12345678', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response
{
  cbhpmCode: "12345678",
  description: "Consulta médica em consultório",
  value: 75.00,
  category: "consultation",
  specialtyRequired: "dermatology"
}
```

## Financial Reports

### Revenue Analytics

```bash
GET /api/financial/summary         # Financial summary
GET /api/financial/revenue/monthly # Monthly revenue
GET /api/financial/procedures/top  # Top procedures by revenue
GET /api/financial/aging           # Accounts receivable aging
```

### Tax Reports

```bash
GET /api/financial/taxes/summary   # Tax summary
GET /api/financial/nfse/list       # NFSe list
GET /api/financial/retention       # Tax retention report
```

## Payment Methods

### Supported Methods

- **Cash** (Dinheiro)
- **PIX** (Instant payment)
- **Credit Card** (Cartão de crédito)
- **Debit Card** (Cartão de débito)
- **Bank Transfer** (Transferência bancária)
- **Health Plan** (Plano de saúde)
- **SUS** (Sistema Único de Saúde)
- **Installments** (Parcelamento)

### Brazilian Tax Rates

- **ISS**: 2% - 5% (varies by municipality)
- **PIS**: 1.65%
- **COFINS**: 7.6%
- **CSLL**: 1% - 2.88%
- **IR**: 1.5% - 4.8%

## Compliance Features

- **LGPD**: All billing data encrypted and audited
- **ANVISA**: Medical device billing compliance
- **CFM**: Professional validation for billing
- **ANS**: Health plan validation and processing
- **RFB**: Tax calculation and reporting

## See Also

- [API Control Hub](./AGENTS.md)
- [Healthcare Compliance API](./healthcare-compliance-api.md)
- [Core API Reference](./core-api.md)
