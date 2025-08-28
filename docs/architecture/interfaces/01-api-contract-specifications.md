# NeonPro Healthcare API Contract Specifications

## 📋 Overview

This document defines the complete API contract specifications for the NeonPro Healthcare Platform, ensuring compliance with Brazilian healthcare regulations (ANVISA, CFM) and LGPD data protection requirements.

### API Base Information

```yaml
openapi: 3.0.3
info:
  title: NeonPro Healthcare API
  version: 1.0.0
  description: Complete healthcare management API with Brazilian regulatory compliance
  contact:
    name: NeonPro API Support
    url: https://neonpro.com.br/api-support
    email: api-support@neonpro.com.br
  license:
    name: Proprietary
    url: https://neonpro.com.br/license

servers:
  - url: https://api.neonpro.com.br/v1
    description: Production API
  - url: https://staging-api.neonpro.com.br/v1
    description: Staging API
  - url: http://localhost:3001/api/v1
    description: Development API

# Security Schemes
securitySchemes:
  BearerAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
    description: JWT Bearer token for authentication
```

### Core Principles

1. **LGPD Compliance**: All endpoints handling personal data include privacy controls
2. **Healthcare Security**: Professional license validation and role-based access
3. **Brazilian Regulations**: ANVISA and CFM compliance built-in
4. **Consistent Response Format**: Standardized success/error response structure
5. **Comprehensive Validation**: Input validation with detailed error messages

---

## 🔐 Authentication & Authorization API

### Base Path: `/auth`

#### POST /login

**Description**: Authenticate user and obtain access tokens

**Request Body**:

```json
{
  "email": "string", // Required, valid email format
  "password": "string" // Required, minimum 8 characters
}
```

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "fullName": "string",
      "role": "admin|emergency_physician|healthcare_provider|clinic_manager|clinic_staff|patient",
      "isActive": true,
      "isVerified": true,
      "isMFAEnabled": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "permissions": ["read:patients", "write:patients"]
    },
    "tokens": {
      "accessToken": "jwt-string",
      "refreshToken": "jwt-string",
      "tokenType": "Bearer",
      "expiresIn": 3600
    }
  },
  "message": "Login realizado com sucesso"
}
```

**Error Responses**:

- `401 INVALID_CREDENTIALS`: Email ou senha incorretos
- `429 RATE_LIMIT_EXCEEDED`: Muitas tentativas de login
- `500 INTERNAL_ERROR`: Erro interno do servidor

#### POST /register

**Description**: Register new user account

**Request Body**:

```json
{
  "email": "string", // Required, valid email
  "password": "string", // Required, min 8 chars, 1 upper, 1 number, 1 special
  "fullName": "string", // Required, 2-100 characters
  "role": "healthcare_provider|clinic_staff|patient", // Required
  "licenseNumber": "string", // Required for healthcare_provider
  "profession": "dermatologist|plastic_surgeon|esthetician|nurse|administrator"
}
```

**Success Response (201)**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "string",
      "fullName": "string",
      "role": "string",
      "isActive": true,
      "isVerified": false,
      "permissions": []
    },
    "requiresVerification": true
  },
  "message": "Cadastro realizado com sucesso. Verifique seu email."
}
```

#### POST /refresh

**Description**: Refresh access token using refresh token

**Request Body**:

```json
{
  "refreshToken": "string" // Required, valid refresh token
}
```

#### GET /profile

**Description**: Get current user profile (requires authentication)

**Headers**:

```
Authorization: Bearer <access-token>
```

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "string",
    "fullName": "string",
    "role": "string",
    "isActive": true,
    "isVerified": true,
    "isMFAEnabled": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "permissions": ["read:patients", "write:patients"]
  },
  "message": "Perfil recuperado com sucesso"
}
```

#### POST /logout

**Description**: Logout and invalidate tokens

#### POST /forgot-password

**Description**: Request password reset link

**Request Body**:

```json
{
  "email": "string" // Required, registered email address
}
```

#### POST /reset-password

**Description**: Reset password using reset token

**Request Body**:

```json
{
  "token": "string", // Required, valid reset token
  "password": "string" // Required, new password meeting requirements
}
```

#### POST /change-password

**Description**: Change password for authenticated user

**Request Body**:

```json
{
  "currentPassword": "string", // Required
  "newPassword": "string" // Required, meeting password requirements
}
```

---

## 👨‍⚕️ Healthcare Professionals API

### Base Path: `/professionals`

### Authentication: Required for all endpoints

#### GET /

**Description**: List healthcare professionals with filtering and pagination

**Query Parameters**:

```yaml
page: integer (default: 1, min: 1)
    limit: integer (default: 10, min: 1, max: 100)
          search: string (optional, name search)
          profession: enum [dermatologist, plastic_surgeon, esthetician, nurse, administrator]
          isActive: boolean (optional)
```

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "professionals": [
      {
        "id": "uuid",
        "fullName": "Dra. Ana Silva",
        "email": "ana.silva@neonpro.com",
        "phone": "+5511999999999",
        "profession": "dermatologist",
        "specialization": "Dermatologia Estética",
        "registrationNumber": "CRM 12345",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  },
  "message": "Profissionais listados com sucesso"
}
```

#### GET /:id

**Description**: Get professional by ID with complete profile

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Dra. Ana Silva",
    "email": "ana.silva@neonpro.com",
    "phone": "+5511999999999",
    "profession": "dermatologist",
    "specialization": "Dermatologia Estética",
    "registrationNumber": "CRM 12345",
    "isActive": true,
    "workingHours": {
      "monday": ["09:00", "18:00"],
      "tuesday": ["09:00", "18:00"],
      "wednesday": ["09:00", "18:00"],
      "thursday": ["09:00", "18:00"],
      "friday": ["09:00", "17:00"]
    },
    "permissions": ["read:patients", "write:patients"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Profissional encontrado"
}
```

#### POST /

**Description**: Create new healthcare professional

**Request Body**:

```json
{
  "fullName": "string", // Required, 2-100 characters
  "email": "string", // Required, valid email format
  "phone": "string", // Required, Brazilian phone format
  "profession": "dermatologist|plastic_surgeon|esthetician|nurse|administrator",
  "specialization": "string", // Optional
  "registrationNumber": "string", // Required for licensed professionals
  "workingHours": {
    "monday": ["09:00", "18:00"],
    "tuesday": ["09:00", "18:00"]
  },
  "isActive": true
}
```

#### PUT /:id

**Description**: Update healthcare professional

**Request Body**: Same as POST / with all fields optional

#### DELETE /:id

**Description**: Soft delete healthcare professional

#### GET /:id/stats

**Description**: Get professional performance statistics

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "totalAppointments": 156,
    "completedAppointments": 142,
    "cancelledAppointments": 14,
    "totalPatients": 89,
    "averageRating": 4.8,
    "monthlyRevenue": 12500.50,
    "upcomingAppointments": 8
  },
  "message": "Estatísticas do profissional"
}
```

#### GET /:id/availability

**Description**: Get professional availability for specific date

**Query Parameters**:

```yaml
date: string (YYYY-MM-DD format, default: today)
```

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "date": "2024-01-01",
    "availableSlots": ["09:00", "09:30", "10:00", "10:30"],
    "bookedSlots": ["11:00", "11:30", "16:30", "17:00"]
  },
  "message": "Disponibilidade do profissional"
}
```

---

## 🏥 Patients API

### Base Path: `/patients`

### Authentication: Required for all endpoints

#### GET /

**Description**: List patients with LGPD privacy controls

**Query Parameters**:

```yaml
page: integer (default: 1)
  limit: integer (default: 10, max: 100)
      search: string (optional, encrypted search)
      cpf: string (optional, encrypted CPF search)
      isActive: boolean (optional)
```

**Success Response (200)**:

```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "uuid",
        "fullName": "João Silva", // Encrypted field
        "email": "j***@email.com", // Masked field
        "phone": "+55119****9999", // Masked field
        "cpf": "***.***.***-**", // Masked field
        "dateOfBirth": "1990-01-01", // May be masked based on permissions
        "isActive": true,
        "consentStatus": {
          "dataProcessing": true,
          "marketing": false,
          "thirdPartySharing": false
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  },
  "message": "Pacientes listados com sucesso"
}
```

#### POST /

**Description**: Create new patient record with LGPD consent

**Request Body**:

```json
{
  "fullName": "string", // Required, will be encrypted
  "email": "string", // Required, will be encrypted
  "phone": "string", // Required, Brazilian format
  "cpf": "string", // Required, valid Brazilian CPF
  "dateOfBirth": "1990-01-01", // Required, ISO date
  "address": {
    "street": "string",
    "number": "string",
    "complement": "string",
    "neighborhood": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  },
  "emergencyContact": {
    "name": "string",
    "phone": "string",
    "relationship": "string"
  },
  "consent": {
    "dataProcessing": true, // Required, LGPD consent
    "marketing": false,
    "thirdPartySharing": false
  }
}
```

#### GET /:id

**Description**: Get patient by ID (full access requires specific permissions)

#### PUT /:id

**Description**: Update patient record with audit trail

---

## 📅 Appointments API

### Base Path: `/appointments`

### Authentication: Required for all endpoints

#### GET /

**Description**: List appointments with filtering

**Query Parameters**:

```yaml
page: integer (default: 1)
  limit: integer (default: 10, max: 100)
      professionalId: uuid (optional)
      patientId: uuid (optional)
      status: enum [scheduled, confirmed, in_progress, completed, cancelled]
      date: string (YYYY-MM-DD format)
      startDate: string (range start)
      endDate: string (range end)
```

#### POST /

**Description**: Schedule new appointment

**Request Body**:

```json
{
  "patientId": "uuid", // Required
  "professionalId": "uuid", // Required
  "serviceId": "uuid", // Required
  "scheduledDate": "2024-01-01T09:00:00.000Z", // Required
  "duration": 60, // Minutes
  "notes": "string", // Optional
  "status": "scheduled" // Default
}
```

#### GET /:id

**Description**: Get appointment details

#### PUT /:id

**Description**: Update appointment

#### DELETE /:id

**Description**: Cancel appointment

---

## 🏥 Services API

### Base Path: `/services`

### Authentication: Required for all endpoints

#### GET /

**Description**: List available services

#### POST /

**Description**: Create new service

#### GET /:id

**Description**: Get service details

#### PUT /:id

**Description**: Update service

#### DELETE /:id

**Description**: Remove service

---

## 🏢 Clinics API

### Base Path: `/clinics`

### Authentication: Required for all endpoints

#### GET /

**Description**: List clinics

#### POST /

**Description**: Create new clinic

#### GET /:id

**Description**: Get clinic details

#### PUT /:id

**Description**: Update clinic

---

## ⚖️ Compliance API

### Base Path: `/compliance`

### Authentication: Required for all endpoints

### Special: Healthcare regulatory compliance endpoints

#### GET /audit-logs

**Description**: Retrieve audit logs for compliance reporting

**Query Parameters**:

```yaml
startDate: string (ISO date)
endDate: string (ISO date)
action: string (optional, filter by action type)
userId: uuid (optional, filter by user)
resourceType: string (optional, patients|appointments|professionals)
page: integer (default: 1)
  limit: integer (default: 50, max: 1000)
```

#### POST /anvisa-report

**Description**: Generate ANVISA compliance report

**Request Body**:

```json
{
  "reportType": "adverse_events|medication_tracking|facility_inspection",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "includeDetails": true
}
```

#### GET /lgpd-requests

**Description**: List LGPD data subject requests

#### POST /lgpd-requests

**Description**: Process LGPD data subject request

**Request Body**:

```json
{
  "requestType": "access|rectification|erasure|portability|restriction",
  "subjectCpf": "string", // Encrypted
  "description": "string",
  "requestorEmail": "string"
}
```

#### PUT /consent/:patientId

**Description**: Update patient consent preferences

**Request Body**:

```json
{
  "dataProcessing": true,
  "marketing": false,
  "thirdPartySharing": false,
  "consentDate": "2024-01-01T00:00:00.000Z"
}
```

---

## 🩺 Health Check API

### Base Path: `/health`

### Authentication: Not required for basic health check

#### GET /

**Description**: Basic API health check

**Success Response (200)**:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 12345
}
```

#### GET /deep

**Description**: Comprehensive health check (requires authentication)

**Success Response (200)**:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 12345,
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "storage": "healthy",
    "encryption": "healthy",
    "external_apis": "healthy"
  },
  "metrics": {
    "totalUsers": 150,
    "activeUsers": 89,
    "totalAppointments": 1250,
    "systemLoad": "low"
  }
}
```

---

## 🤖 AI & Analytics API

### Base Path: `/ai`

### Authentication: Required for all endpoints

### Special: AI-powered features with healthcare context

#### POST /analyze-appointment

**Description**: AI analysis for appointment optimization

#### POST /risk-assessment

**Description**: Patient risk assessment using AI

#### GET /insights/dashboard

**Description**: AI-powered dashboard insights

---

## 📊 Common Response Patterns

### Success Response Format

```json
{
  "success": true,
  "data": {}, // Response data
  "message": "Operation completed successfully",
  "metadata": {} // Optional additional metadata
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {}, // Optional error details
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `UNAUTHORIZED`: Authentication required or invalid
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict (duplicate, etc.)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable
- `LGPD_VIOLATION`: LGPD compliance violation detected
- `INVALID_LICENSE`: Professional license validation failed

### Pagination Format

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 250,
    "pages": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🔒 Security Headers

All API responses include standard security headers:

```yaml
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
X-Request-ID: uuid (for request tracking)
```

---

## 📝 Rate Limiting

Default rate limits per endpoint category:

- **Authentication**: 5 requests/minute per IP
- **Read Operations**: 100 requests/minute per user
- **Write Operations**: 50 requests/minute per user
- **Compliance Reports**: 10 requests/hour per user
- **AI Analytics**: 20 requests/hour per user

Rate limit headers included in responses:

```yaml
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🌟 API Versioning

- Current Version: `v1`
- Version specified in URL: `/api/v1/`
- Backward compatibility maintained for 2 major versions
- Deprecation notices provided 6 months in advance
- Version header supported: `API-Version: 1.0`

---

This specification ensures complete API contract definition with Brazilian healthcare compliance, LGPD privacy controls, and comprehensive security measures.
