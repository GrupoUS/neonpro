# Financial Management API Documentation

## Overview

The Financial Management API provides comprehensive financial operations for Brazilian aesthetic clinics, including billing, payment processing, commission tracking, and financial analytics with full Brazilian tax compliance support.

## Base URL

```
https://api.neonpro.com.br/financial-management/v1
```

## Authentication

All endpoints require authentication using Bearer tokens:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **Default**: 100 requests per minute
- **Burst**: 150 requests per minute
- Headers included: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "error": null
}
```

## Error Handling

```json
{
  "success": false,
  "message": "Detailed error message in Portuguese",
  "data": null,
  "error": "error_type"
}
```

### Common Error Codes

- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Invalid or missing authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `422`: Validation Error - Input validation failed
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server-side error

## Core Endpoints

### 1. Financial Account Management

#### Create Financial Account
```http
POST /financial-accounts
```

**Request Body:**
```json
{
  "clinicId": "uuid",
  "name": "Conta Principal - Itaú",
  "accountType": "checking",
  "accountNumber": "12345-6",
  "bankName": "Itaú Unibanco",
  "bankBranch": "1234",
  "currency": "BRL",
  "openingBalance": 5000.00,
  "isActive": true,
  "isDefault": true,
  "metadata": {
    "account_manager": "João Silva",
    "agency_phone": "(11) 1234-5678"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conta financeira criada com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "name": "Conta Principal - Itaú",
    "account_type": "checking",
    "account_number": "12345-6",
    "bank_name": "Itaú Unibanco",
    "bank_branch": "1234",
    "currency": "BRL",
    "opening_balance": 5000.00,
    "current_balance": 5000.00,
    "is_active": true,
    "is_default": true,
    "metadata": { ... },
    "created_at": "2024-01-17T10:30:00Z",
    "updated_at": "2024-01-17T10:30:00Z"
  }
}
```

#### Get Financial Accounts
```http
GET /financial-accounts?clinicId=uuid
```

**Response:**
```json
{
  "success": true,
  "message": "Contas financeiras recuperadas com sucesso",
  "data": [
    {
      "id": "uuid",
      "clinic_id": "uuid",
      "name": "Conta Principal - Itaú",
      "account_type": "checking",
      "currency": "BRL",
      "current_balance": 5000.00,
      "is_active": true,
      "is_default": true
    }
  ]
}
```

#### Update Financial Account
```http
PUT /financial-accounts/{id}
```

**Request Body:**
```json
{
  "updates": {
    "name": "Conta Principal - Itaú (Atualizada)",
    "isActive": true,
    "metadata": {
      "account_manager": "Maria Oliveira"
    }
  }
}
```

### 2. Service Pricing Management

#### Create Service Price
```http
POST /service-prices
```

**Request Body:**
```json
{
  "clinicId": "uuid",
  "serviceId": "uuid",
  "professionalCouncilType": "CFM",
  "basePrice": 2500.00,
  "durationMinutes": 60,
  "costOfMaterials": 800.00,
  "professionalCommissionRate": 60.00,
  "clinicRevenueRate": 40.00,
  "isActive": true,
  "effectiveDate": "2024-01-01",
  "notes": "Preço padrão para aplicação de botox"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preço de serviço criado com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "service_id": "uuid",
    "professional_council_type": "CFM",
    "base_price": 2500.00,
    "duration_minutes": 60,
    "cost_of_materials": 800.00,
    "professional_commission_rate": 60.00,
    "clinic_revenue_rate": 40.00,
    "is_active": true,
    "effective_date": "2024-01-01",
    "created_at": "2024-01-17T10:30:00Z"
  }
}
```

#### Get Service Prices
```http
GET /service-prices?clinicId=uuid&serviceId=uuid
```

**Response:**
```json
{
  "success": true,
  "message": "Preços de serviços recuperados com sucesso",
  "data": [
    {
      "id": "uuid",
      "service_id": "uuid",
      "professional_council_type": "CFM",
      "base_price": 2500.00,
      "duration_minutes": 60,
      "professional_commission_rate": 60.00,
      "clinic_revenue_rate": 40.00,
      "is_active": true
    }
  ]
}
```

### 3. Treatment Package Management

#### Create Treatment Package
```http
POST /treatment-packages
```

**Request Body:**
```json
{
  "clinicId": "uuid",
  "name": "Pacote Harmonização Facial",
  "description": "Pacote completo com 3 sessões de harmonização facial",
  "packageType": "session_bundle",
  "totalSessions": 3,
  "validityDays": 90,
  "originalPrice": 7500.00,
  "packagePrice": 6750.00,
  "discountPercentage": 10.00,
  "isActive": true,
  "maxPackagesPerPatient": 2,
  "requirements": ["Avaliação prévia obrigatória"],
  "benefits": ["15% de desconto em procedimentos adicionais"],
  "termsConditions": "Válido por 90 dias após a primeira sessão"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pacote de tratamento criado com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "name": "Pacote Harmonização Facial",
    "description": "Pacote completo com 3 sessões de harmonização facial",
    "package_type": "session_bundle",
    "total_sessions": 3,
    "validity_days": 90,
    "original_price": 7500.00,
    "package_price": 6750.00,
    "discount_percentage": 10.00,
    "is_active": true,
    "max_packages_per_patient": 2,
    "created_at": "2024-01-17T10:30:00Z"
  }
}
```

#### Get Treatment Packages
```http
GET /treatment-packages?clinicId=uuid
```

### 4. Invoice Management

#### Create Invoice
```http
POST /invoices
```

**Request Body:**
```json
{
  "clinicId": "uuid",
  "patientId": "uuid",
  "invoiceType": "service",
  "issueDate": "2024-01-17",
  "dueDate": "2024-01-24",
  "paymentTerms": "Pagamento à vista",
  "notes": "Fatura referente a procedimentos estéticos",
  "items": [
    {
      "itemType": "service",
      "description": "Aplicação de Botox",
      "quantity": 1,
      "unitPrice": 2500.00,
      "taxRate": 9.25,
      "discountPercentage": 0,
      "referenceId": "service-uuid"
    },
    {
      "itemType": "product",
      "description": "Ácido Hialurônico",
      "quantity": 2,
      "unitPrice": 800.00,
      "taxRate": 18.00,
      "discountPercentage": 5,
      "referenceId": "product-uuid"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fatura criada com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "patient_id": "uuid",
    "invoice_number": "INV-000123",
    "invoice_type": "service",
    "status": "draft",
    "issue_date": "2024-01-17",
    "due_date": "2024-01-24",
    "subtotal": 4100.00,
    "discount_amount": 80.00,
    "tax_amount": 378.25,
    "total_amount": 4398.25,
    "paid_amount": 0.00,
    "balance_due": 4398.25,
    "items": [
      {
        "id": "uuid",
        "item_type": "service",
        "description": "Aplicação de Botox",
        "quantity": 1,
        "unit_price": 2500.00,
        "total_price": 2500.00,
        "tax_rate": 9.25,
        "tax_amount": 231.25,
        "discount_amount": 0,
        "net_amount": 2731.25
      }
    ]
  }
}
```

#### Get Invoice
```http
GET /invoices/{id}
```

#### Get Invoices
```http
GET /invoices?clinicId=uuid&status=paid&patientId=uuid&startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**
- `clinicId` (required): UUID da clínica
- `status` (optional): Status da fatura (draft, pending, paid, partial, overdue, cancelled, refunded)
- `patientId` (optional): UUID do paciente
- `startDate` (optional): Data inicial (YYYY-MM-DD)
- `endDate` (optional): Data final (YYYY-MM-DD)

### 5. Payment Management

#### Create Payment Transaction
```http
POST /payment-transactions
```

**Request Body:**
```json
{
  "clinicId": "uuid",
  "invoiceId": "uuid",
  "patientId": "uuid",
  "transactionId": "pix_123456789",
  "paymentMethod": "pix",
  "paymentProvider": "manual",
  "amount": 4398.25,
  "currency": "BRL",
  "installments": 1,
  "installmentNumber": 1,
  "totalInstallments": 1,
  "feeAmount": 0.00,
  "metadata": {
    "pix_id": "pix_123456789",
    "payment_proof_url": "https://example.com/proof.pdf"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transação de pagamento criada com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "invoice_id": "uuid",
    "patient_id": "uuid",
    "transaction_id": "pix_123456789",
    "payment_method": "pix",
    "payment_provider": "manual",
    "status": "succeeded",
    "amount": 4398.25,
    "currency": "BRL",
    "net_amount": 4398.25,
    "transaction_date": "2024-01-17T10:30:00Z",
    "metadata": { ... }
  }
}
```

#### Get Payment Transactions
```http
GET /payment-transactions?clinicId=uuid&status=succeeded&patientId=uuid&startDate=2024-01-01&endDate=2024-01-31
```

### 6. Professional Commission Management

#### Create Professional Commission
```http
POST /professional-commissions
```

**Request Body:**
```json
{
  "clinicId": "uuid",
  "professionalId": "uuid",
  "invoiceId": "uuid",
  "appointmentId": "uuid",
  "commissionType": "service",
  "baseAmount": 2500.00,
  "commissionRate": 60.00,
  "notes": "Comissão por aplicação de botox",
  "metadata": {
    "service_category": "injectables",
    "patient_type": "returning"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comissão profissional criada com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "professional_id": "uuid",
    "invoice_id": "uuid",
    "appointment_id": "uuid",
    "commission_type": "service",
    "base_amount": 2500.00,
    "commission_rate": 60.00,
    "commission_amount": 1500.00,
    "status": "pending",
    "created_at": "2024-01-17T10:30:00Z"
  }
}
```

#### Get Professional Commissions
```http
GET /professional-commissions?clinicId=uuid&professionalId=uuid
```

### 7. Financial Goals Management

#### Create Financial Goal
```http
POST /financial-goals
```

**Request Body:**
```json
{
  "clinicId": "uuid",
  "name": "Meta de Faturamento - Janeiro 2024",
  "goalType": "revenue",
  "targetValue": 180000.00,
  "period": "monthly",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "notes": "Meta baseada no crescimento de 20% em relação ao mês anterior"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meta financeira criada com sucesso",
  "data": {
    "id": "uuid",
    "clinic_id": "uuid",
    "name": "Meta de Faturamento - Janeiro 2024",
    "goal_type": "revenue",
    "target_value": 180000.00,
    "current_value": 0.00,
    "period": "monthly",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "status": "active",
    "progress_percentage": 0.00,
    "created_at": "2024-01-17T10:30:00Z"
  }
}
```

#### Update Financial Goal Progress
```http
PUT /financial-goals/{id}/progress
```

**Request Body:**
```json
{
  "currentValue": 156890.00
}
```

#### Get Financial Goals
```http
GET /financial-goals?clinicId=uuid
```

### 8. Financial Analytics and Reports

#### Generate Financial Report
```http
GET /financial-reports?clinicId=uuid&reportDate=2024-01-17
```

**Response:**
```json
{
  "success": true,
  "message": "Relatório financeiro gerado com sucesso",
  "data": {
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "month": 1,
      "year": 2024
    },
    "revenue": 156890.00,
    "expenses": 89450.00,
    "appointments": 67,
    "new_patients": 12,
    "average_ticket": 2341.64,
    "payment_methods": {
      "credit_card": 45,
      "pix": 35,
      "debit_card": 15,
      "cash": 5
    }
  }
}
```

#### Get Financial Dashboard
```http
GET /financial-dashboard?clinicId=uuid
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard financeiro recuperado com sucesso",
  "data": {
    "totalRevenue": 156890.00,
    "totalExpenses": 89450.00,
    "netProfit": 67440.00,
    "pendingInvoices": 24,
    "overdueInvoices": 5,
    "upcomingAppointments": 18,
    "monthlyGrowth": 23.50,
    "averageTicket": 2341.64,
    "topServices": [
      {
        "service_name": "Botox",
        "revenue": 45200.00,
        "count": 18
      },
      {
        "service_name": "Preenchimento",
        "revenue": 38900.00,
        "count": 15
      }
    ]
  }
}
```

### 9. Brazilian Financial Operations

#### Generate NFSe (Nota Fiscal de Serviços Eletrônica)
```http
POST /nfs-e/{invoiceId}
```

**Response:**
```json
{
  "success": true,
  "message": "NFSe gerada com sucesso",
  "data": {
    "nfse_number": "NFSe-123456789",
    "verification_code": "ABC123",
    "issuance_date": "2024-01-17",
    "pdf_url": "https://api.neonpro.com.br/nfse/NFSe-123456789.pdf"
  }
}
```

#### Process PIX Payment
```http
POST /pix-payments
```

**Request Body:**
```json
{
  "amount": 4398.25,
  "patientId": "uuid",
  "invoiceId": "uuid",
  "clinicId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pagamento PIX processado com sucesso",
  "data": {
    "id": "uuid",
    "transaction_id": "pix_123456789",
    "payment_method": "pix",
    "status": "succeeded",
    "amount": 4398.25,
    "metadata": {
      "pix_id": "pix_123456789",
      "created_at": "2024-01-17T10:30:00Z"
    }
  }
}
```

#### Calculate Boleto
```http
POST /boletos/{invoiceId}
```

**Request Body:**
```json
{
  "dueDays": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Boleto calculado com sucesso",
  "data": {
    "barcode": "00190000090123456789012345678901234567890123",
    "digitable_line": "00190.00009 01234.567890 12345.678901 2 34567890123",
    "due_date": "2024-01-22",
    "amount": 4398.25,
    "pdf_url": "https://api.neonpro.com.br/boletos/123456789.pdf"
  }
}
```

### 10. Tax Configuration Management

#### Get Tax Configurations
```http
GET /tax-configurations?clinicId=uuid
```

**Response:**
```json
{
  "success": true,
  "message": "Configurações fiscais recuperadas com sucesso",
  "data": [
    {
      "id": "uuid",
      "tax_type": "iss",
      "tax_rate": 5.00,
      "is_active": true,
      "effective_date": "2024-01-01",
      "description": "Imposto Sobre Serviços"
    },
    {
      "id": "uuid",
      "tax_type": "pis",
      "tax_rate": 1.65,
      "is_active": true,
      "effective_date": "2024-01-01",
      "description": "Programa de Integração Social"
    }
  ]
}
```

## Webhooks

The API supports webhooks for real-time notifications:

### Webhook Events

- `invoice.created`: Nova fatura criada
- `invoice.paid`: Fatura paga
- `invoice.overdue`: Fatura vencida
- `payment.succeeded`: Pagamento processado com sucesso
- `payment.failed`: Pagamento falhou
- `commission.created`: Nova comissão criada
- `goal.achieved`: Meta financeira alcançada

### Webhook Configuration

Webhooks can be configured in the clinic settings:

```json
{
  "url": "https://your-clinic.com/webhooks/financial",
  "events": ["invoice.paid", "payment.succeeded"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload Example

```json
{
  "event": "invoice.paid",
  "timestamp": "2024-01-17T10:30:00Z",
  "data": {
    "invoice_id": "uuid",
    "invoice_number": "INV-000123",
    "patient_id": "uuid",
    "amount": 4398.25,
    "payment_method": "pix"
  }
}
```

## Data Validation

### Input Validation Rules

1. **Financial Accounts**
   - `name`: Required, max 100 characters
   - `accountType`: Required, must be valid account type
   - `currency`: Required, valid currency code
   - `openingBalance`: Required, non-negative number

2. **Service Prices**
   - `basePrice`: Required, positive number
   - `durationMinutes`: Required, positive integer
   - `professionalCommissionRate + clinicRevenueRate`: Must sum ≤ 100%

3. **Invoices**
   - `dueDate`: Must be ≥ `issueDate`
   - `items`: Required, at least one item
   - `quantity`: Required, positive integer

4. **Payments**
   - `installmentNumber`: Must be ≤ `totalInstallments`
   - `amount`: Required, positive number

## Brazilian Compliance Features

### Tax Calculation

The system automatically calculates Brazilian taxes:
- **ISS**: Imposto Sobre Serviços (typically 2-5%)
- **PIS**: Programa de Integração Social (1.65%)
- **COFINS**: Contribuição para o Financiamento da Seguridade Social (7.85%)
- **CSLL**: Contribuição Social sobre o Lucro Líquido (2.88%)
- **IRPJ**: Imposto de Renda Pessoa Jurídica (15%)

### Payment Methods

Supported Brazilian payment methods:
- **PIX**: Instant payment system
- **Boleto Bancário**: Bank slip payment
- **Cartão de Crédito**: Credit card
- **Cartão de Débito**: Debit card
- **Transferência Bancária**: Bank transfer
- **Dinheiro**: Cash

### Document Generation

- **NFSe**: Nota Fiscal de Serviços Eletrônica
- **Boleto**: Bank slip with barcode and digitable line
- **Recibo**: Receipt generation
- **Relatório Fiscal**: Tax reports

## Best Practices

### 1. Error Handling
- Always check `success` field before processing responses
- Implement retry logic for failed payments
- Use Brazilian Portuguese error messages for user-facing applications

### 2. Data Consistency
- Use `clinicId` in all requests to ensure data isolation
- Implement proper transaction handling for financial operations
- Keep audit trails for all financial transactions

### 3. Performance
- Cache frequently accessed financial data
- Use pagination for large datasets
- Implement background processing for report generation

### 4. Security
- Use HTTPS for all API calls
- Validate all input data
- Implement proper authentication and authorization
- Encrypt sensitive financial data

### 5. Compliance
- Keep updated with Brazilian tax regulations
- Implement proper data retention policies
- Generate required fiscal documents
- Maintain audit logs for compliance purposes

## Support

For technical support:
- **Email**: financeiro@neonpro.com.br
- **Phone**: (11) 1234-5678
- **Documentation**: https://docs.neonpro.com.br
- **Status Page**: https://status.neonpro.com.br

## Rate Limits and Quotas

- **Free Tier**: 100 requests/minute
- **Professional Tier**: 500 requests/minute
- **Enterprise Tier**: Custom limits

## SDKs

Available SDKs:
- **JavaScript/TypeScript**: `@neonpro/financial-sdk`
- **Python**: `neonpro-financial-python`
- **Java**: `com.neonpro.financial`

## Changelog

### v1.0.0 (2024-01-17)
- Initial release
- Core financial management features
- Brazilian payment methods support
- Tax compliance features
- Commission management
- Financial analytics and reporting