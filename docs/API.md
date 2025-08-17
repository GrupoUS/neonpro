# 🔌 API Reference - NeonPro Healthcare Platform

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Autenticação](#-autenticação)
3. [Endpoints Principais](#-endpoints-principais)
4. [Modelos de Dados](#-modelos-de-dados)
5. [Códigos de Status](#-códigos-de-status)
6. [Rate Limiting](#-rate-limiting)
7. [Exemplos de Uso](#-exemplos-de-uso)

## 🌟 Visão Geral

A API do NeonPro é RESTful e segue padrões de mercado para integração healthcare, com foco em compliance LGPD/ANVISA/CFM.

### Base URL

```
# Desenvolvimento
https://localhost:3000/api

# Produção
https://neonpro.vercel.app/api
```

### Formato de Dados

- **Request**: JSON (Content-Type: application/json)
- **Response**: JSON com estrutura padronizada
- **Encoding**: UTF-8
- **Timezone**: America/Sao_Paulo

### Versionamento

```
/api/v1/...  # Versão atual
```

## 🔐 Autenticação

### Bearer Token (JWT)

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@clinica.com.br",
  "password": "senha_segura"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "usuario@clinica.com.br",
      "role": "DOCTOR",
      "permissions": ["READ_PATIENTS", "WRITE_RECORDS"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer [token]
```

## 👥 Endpoints - Usuários

### Listar Usuários

```http
GET /api/v1/users
Authorization: Bearer [token]
```

**Query Parameters:**

- `page`: Página (default: 1)
- `limit`: Itens por página (default: 20, max: 100)
- `role`: Filtrar por função (DOCTOR, NURSE, etc.)
- `status`: Filtrar por status (ACTIVE, INACTIVE)
- `search`: Busca por nome/email

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "dr.silva@clinica.com.br",
        "firstName": "João",
        "lastName": "Silva",
        "role": "DOCTOR",
        "status": "ACTIVE",
        "professionalId": "CRM123456",
        "createdAt": "2025-01-14T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### Criar Usuário

```http
POST /api/v1/users
Authorization: Bearer [token]
Content-Type: application/json

{
  "email": "novo@clinica.com.br",
  "firstName": "Maria",
  "lastName": "Santos",
  "role": "NURSE",
  "professionalId": "COREN654321",
  "phone": "+5511999999999"
}
```

## 🏥 Endpoints - Pacientes

### Listar Pacientes

```http
GET /api/v1/patients
Authorization: Bearer [token]
```

**Query Parameters:**

- `page`, `limit`: Paginação
- `search`: Busca por nome/email/CPF
- `status`: Status do paciente
- `birthDateFrom`, `birthDateTo`: Filtro por data de nascimento

### Detalhes do Paciente

```http
GET /api/v1/patients/{patientId}
Authorization: Bearer [token]
```

**Response:**

```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "patient_456",
      "user": {
        "firstName": "Ana",
        "lastName": "Costa",
        "email": "ana@email.com",
        "phone": "+5511988776655"
      },
      "medicalRecordNumber": "MR001234",
      "cpf": "123.456.789-00",
      "birthDate": "1985-06-15",
      "address": {
        "street": "Rua das Flores",
        "number": "123",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zipcode": "01234-567"
      },
      "emergencyContact": {
        "name": "João Costa",
        "phone": "+5511987654321",
        "relationship": "Cônjuge"
      },
      "allergies": ["Dipirona", "Iodo"],
      "medications": ["Losartana 50mg"],
      "medicalConditions": ["Hipertensão"],
      "insurance": {
        "provider": "Unimed",
        "number": "1234567890"
      }
    }
  }
}
```

### Criar Paciente

```http
POST /api/v1/patients
Authorization: Bearer [token]
Content-Type: application/json

{
  "firstName": "Carlos",
  "lastName": "Oliveira",
  "email": "carlos@email.com",
  "phone": "+5511999888777",
  "cpf": "987.654.321-00",
  "birthDate": "1990-03-20",
  "gender": "M",
  "address": {
    "street": "Av. Paulista",
    "number": "1000",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zipcode": "01310-100"
  },
  "lgpdConsent": true
}
```

## 📋 Endpoints - Prontuários Médicos

### Listar Prontuários

```http
GET /api/v1/medical-records
Authorization: Bearer [token]
```

**Query Parameters:**

- `patientId`: ID do paciente
- `providerId`: ID do profissional
- `recordType`: Tipo de registro (CONSULTATION, PROCEDURE, etc.)
- `dateFrom`, `dateTo`: Filtro por data
- `status`: Status do registro

### Criar Prontuário

```http
POST /api/v1/medical-records
Authorization: Bearer [token]
Content-Type: application/json

{
  "patientId": "patient_456",
  "appointmentId": "appointment_789",
  "recordType": "CONSULTATION",
  "title": "Consulta de Rotina",
  "description": "Paciente compareceu para consulta de rotina...",
  "diagnosis": "Pele saudável, sem alterações significativas",
  "treatmentPlan": "Manter rotina de cuidados, retorno em 6 meses",
  "vitalSigns": {
    "bloodPressure": "120/80",
    "heartRate": 72,
    "temperature": 36.5,
    "weight": 70.5,
    "height": 175
  },
  "attachments": [
    {
      "filename": "foto_antes.jpg",
      "url": "https://storage.supabase.co/...",
      "type": "IMAGE"
    }
  ]
}
```

## 📅 Endpoints - Agendamentos

### Listar Agendamentos

```http
GET /api/v1/appointments
Authorization: Bearer [token]
```

**Query Parameters:**

- `patientId`: Agendamentos de um paciente específico
- `providerId`: Agendamentos de um profissional específico
- `date`: Data específica (YYYY-MM-DD)
- `dateFrom`, `dateTo`: Intervalo de datas
- `status`: Status do agendamento
- `type`: Tipo de agendamento

### Criar Agendamento

```http
POST /api/v1/appointments
Authorization: Bearer [token]
Content-Type: application/json

{
  "patientId": "patient_456",
  "providerId": "provider_789",
  "appointmentDate": "2025-01-20T14:30:00.000Z",
  "durationMinutes": 60,
  "appointmentType": "CONSULTATION",
  "chiefComplaint": "Avaliação para preenchimento facial",
  "notes": "Primeira consulta, paciente interessada em ácido hialurônico"
}
```

### Atualizar Status do Agendamento

```http
PATCH /api/v1/appointments/{appointmentId}/status
Authorization: Bearer [token]
Content-Type: application/json

{
  "status": "CONFIRMED",
  "notes": "Confirmado por telefone"
}
```

## 📦 Endpoints - Inventário

### Listar Itens do Inventário

```http
GET /api/v1/inventory
Authorization: Bearer [token]
```

**Query Parameters:**

- `category`: produtos, equipamentos, consumiveis, medicamentos
- `status`: active, inactive, expired
- `lowStock`: true/false (apenas itens com estoque baixo)
- `expiringDays`: número de dias para vencimento (ex: 30)

### Detalhes do Item

```http
GET /api/v1/inventory/{itemId}
Authorization: Bearer [token]
```

### Atualizar Estoque

```http
PATCH /api/v1/inventory/{itemId}/stock
Authorization: Bearer [token]
Content-Type: application/json

{
  "quantity": 50,
  "operation": "ADD", // ADD, REMOVE, SET
  "reason": "Compra - Nota fiscal 12345",
  "batchNumber": "LOT2025001",
  "expiryDate": "2026-12-31"
}
```

## 📊 Endpoints - Estatísticas

### Dashboard Geral

```http
GET /api/v1/analytics/dashboard
Authorization: Bearer [token]
```

**Response:**

```json
{
  "success": true,
  "data": {
    "patients": {
      "total": 1250,
      "new": 45,
      "growth": 12.5
    },
    "appointments": {
      "today": 18,
      "thisWeek": 89,
      "thisMonth": 356
    },
    "revenue": {
      "today": 4500.0,
      "thisMonth": 89750.0,
      "growth": 8.3
    },
    "satisfaction": {
      "average": 4.7,
      "responses": 234
    }
  }
}
```

### Relatórios

```http
GET /api/v1/analytics/reports
Authorization: Bearer [token]
```

**Query Parameters:**

- `type`: revenue, appointments, patients, inventory
- `period`: daily, weekly, monthly, yearly
- `startDate`, `endDate`: Período específico
- `providerId`: Filtrar por profissional

## 🔍 Endpoints - Auditoria

### Logs de Auditoria

```http
GET /api/v1/audit/logs
Authorization: Bearer [token]
```

**Query Parameters:**

- `userId`: Logs de usuário específico
- `action`: Tipo de ação (CREATE, READ, UPDATE, DELETE)
- `resourceType`: Tipo de recurso (PATIENT, APPOINTMENT, etc.)
- `dateFrom`, `dateTo`: Período
- `riskLevel`: Nível de risco (LOW, MEDIUM, HIGH, CRITICAL)

## 📋 Modelos de Dados

### User

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  professionalId?: string;
  specialty?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  lgpdConsentDate?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}
```

### Patient

```typescript
interface Patient {
  id: string;
  userId: string;
  medicalRecordNumber: string;
  patientId: string;
  address?: Address;
  emergencyContact?: EmergencyContact;
  allergies: string[];
  medications: string[];
  medicalConditions: string[];
  insurance?: Insurance;
  createdAt: string;
  updatedAt: string;
}
```

### Appointment

```typescript
interface Appointment {
  id: string;
  patientId: string;
  providerId?: string;
  appointmentDate: string;
  durationMinutes: number;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  chiefComplaint?: string;
  notes?: string;
  diagnosis: string[];
  treatmentPlan?: string;
  insuranceAuthorized: boolean;
  copayAmount?: number;
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  completedAt?: string;
}
```

## ⚠️ Códigos de Status

### Sucesso

- `200` - OK
- `201` - Criado
- `204` - Sem conteúdo

### Cliente

- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `409` - Conflito
- `422` - Entidade não processável
- `429` - Muitas requisições

### Servidor

- `500` - Erro interno do servidor
- `502` - Bad Gateway
- `503` - Serviço indisponível

### Estrutura de Erro

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos fornecidos",
    "details": [
      {
        "field": "email",
        "message": "Email é obrigatório"
      }
    ]
  }
}
```

## 🚦 Rate Limiting

### Limites

- **Autenticação**: 10 tentativas por 15 minutos por IP
- **API Geral**: 1000 requisições por hora por usuário
- **Upload**: 10 uploads por minuto por usuário
- **Relatórios**: 50 requisições por hora por usuário

### Headers de Rate Limiting

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 956
X-RateLimit-Reset: 1642608000
```

## 📝 Exemplos de Uso

### Fluxo Completo: Criar Paciente e Agendar Consulta

#### 1. Autenticar

```bash
curl -X POST https://api.neonpro.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recepcionista@clinica.com.br",
    "password": "senha_segura"
  }'
```

#### 2. Criar Paciente

```bash
curl -X POST https://api.neonpro.com.br/api/v1/patients \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Maria",
    "lastName": "Silva",
    "email": "maria@email.com",
    "phone": "+5511999888777",
    "cpf": "123.456.789-00",
    "birthDate": "1985-06-15",
    "lgpdConsent": true,
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "city": "São Paulo",
      "state": "SP",
      "zipcode": "01234-567"
    }
  }'
```

#### 3. Buscar Profissionais Disponíveis

```bash
curl -X GET "https://api.neonpro.com.br/api/v1/users?role=DOCTOR&status=ACTIVE" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

#### 4. Criar Agendamento

```bash
curl -X POST https://api.neonpro.com.br/api/v1/appointments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient_123",
    "providerId": "provider_456",
    "appointmentDate": "2025-01-20T14:30:00.000Z",
    "durationMinutes": 60,
    "appointmentType": "CONSULTATION",
    "chiefComplaint": "Consulta de avaliação"
  }'
```

### SDK JavaScript (Exemplo)

```javascript
// Instalar SDK
// npm install @neonpro/api-client

import { NeonProAPI } from '@neonpro/api-client';

const api = new NeonProAPI({
  baseURL: 'https://api.neonpro.com.br',
  token: 'your-jwt-token',
});

// Listar pacientes
const patients = await api.patients.list({
  page: 1,
  limit: 20,
  search: 'Maria',
});

// Criar agendamento
const appointment = await api.appointments.create({
  patientId: 'patient_123',
  providerId: 'provider_456',
  appointmentDate: new Date('2025-01-20T14:30:00.000Z'),
  appointmentType: 'CONSULTATION',
});

// Obter estatísticas
const dashboard = await api.analytics.dashboard();
```

## 🔒 Compliance e Segurança

### LGPD

- Todos os endpoints que manipulam dados pessoais requerem consentimento
- Logs de auditoria para todas as operações
- Possibilidade de exportar/deletar dados do usuário

### ANVISA

- Rastreabilidade completa para produtos e medicamentos
- Controle de lotes e validade
- Relatórios de compliance automáticos

### Criptografia

- Dados sensíveis criptografados em repouso
- Comunicação via HTTPS (TLS 1.3)
- Tokens JWT com expiração

---

📚 **Para mais informações**, consulte:

- [README.md](./README.md) - Visão geral
- [INSTALL.md](./INSTALL.md) - Guia de instalação
- [docs/security/](./docs/security/) - Documentação de segurança
