# 🔌 NeonPro API Documentation

**Documentação completa das APIs do sistema de gestão em saúde**

## 📋 **Estrutura de Documentação**

Cada endpoint deve ter sua documentação individual seguindo o padrão:

```
docs/apis/
├── README.md                    # Este arquivo - índice geral
├── auth/                        # Endpoints de autenticação
│   ├── login.md
│   ├── register.md
│   └── refresh-token.md
├── patients/                    # Gestão de pacientes
│   ├── create-patient.md
│   ├── get-patient.md
│   ├── update-patient.md
│   └── list-patients.md
├── appointments/                # Gestão de consultas
│   ├── create-appointment.md
│   ├── get-appointment.md
│   └── list-appointments.md
└── compliance/                  # Compliance e auditoria
    ├── audit-logs.md
    └── lgpd-consent.md
```

## 📝 **Template de Documentação**

### **Formato Padrão para Cada Endpoint**

````markdown
# [METHOD] /api/endpoint

## Descrição

Breve descrição do que o endpoint faz

## Autenticação

- [ ] Requer autenticação
- [ ] Requer permissões específicas

## Parâmetros

### Path Parameters

- `id` (string, required) - Descrição

### Query Parameters

- `limit` (number, optional) - Descrição
- `offset` (number, optional) - Descrição

### Request Body

```json
{
  "field": "value",
  "requiredField": "string"
}
```
````

## Respostas

### Sucesso (200)

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### Erro (400/404/500)

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Exemplos

### cURL

```bash
curl -X GET \
  'http://localhost:3000/api/endpoint' \
  -H 'Authorization: Bearer token'
```

## Localização do Código

- **Arquivo**: `apps/api/src/routes/endpoint.ts`
- **Função**: `handlerFunction`

````
## 🏥 **APIs por Categoria**

### **🔐 Autenticação** 
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de novo usuário  
- `POST /api/auth/refresh` - Renovar token de acesso
- `POST /api/auth/logout` - Logout de usuário

### **👥 Gestão de Pacientes**
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Criar novo paciente
- `GET /api/patients/:id` - Obter detalhes do paciente
- `PUT /api/patients/:id` - Atualizar dados do paciente
- `DELETE /api/patients/:id` - Remover paciente (soft delete)

### **📅 Gestão de Consultas**
- `GET /api/appointments` - Listar consultas
- `POST /api/appointments` - Agendar nova consulta
- `GET /api/appointments/:id` - Obter detalhes da consulta
- `PUT /api/appointments/:id` - Atualizar consulta
- `DELETE /api/appointments/:id` - Cancelar consulta

### **🏥 Gestão de Clínicas**
- `GET /api/clinics/:id` - Dados da clínica
- `PUT /api/clinics/:id` - Atualizar dados da clínica
- `GET /api/clinics/:id/professionals` - Profissionais da clínica
- `GET /api/clinics/:id/services` - Serviços oferecidos

### **👨‍⚕️ Gestão de Profissionais**
- `GET /api/professionals` - Listar profissionais
- `POST /api/professionals` - Cadastrar profissional
- `GET /api/professionals/:id` - Detalhes do profissional
- `PUT /api/professionals/:id` - Atualizar profissional

### **🛡️ Compliance & Auditoria**
- `GET /api/audit/logs` - Logs de auditoria
- `POST /api/compliance/consent` - Registrar consentimento LGPD
- `GET /api/compliance/reports` - Relatórios de compliance
- `GET /api/security/health` - Status de segurança do sistema

### **📊 Analytics & Relatórios**
- `GET /api/analytics/dashboard` - Métricas do dashboard
- `GET /api/analytics/reports` - Relatórios customizados
- `GET /api/analytics/performance` - Métricas de performance

## 🔧 **Padrões de Resposta**

### **Sucesso**
```typescript
interface ApiResponse<T> {
  success: true
  data: T
  meta?: {
    pagination?: PaginationInfo
    requestId: string
    timestamp: string
  }
}
````

### **Erro**

```typescript
interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    healthcareContext?: {
      patientId?: string
      appointmentId?: string
      action?: string
    }
  }
}
```

## 📊 **Status dos Endpoints**

| Categoria     | Total | Implementados | Documentados | Status          |
| ------------- | ----- | ------------- | ------------ | --------------- |
| Auth          | 4     | ✅ 4          | ⏳ 0         | 🟡 Em Progresso |
| Patients      | 5     | ✅ 5          | ⏳ 0         | 🟡 Em Progresso |
| Appointments  | 5     | ✅ 5          | ⏳ 0         | 🟡 Em Progresso |
| Professionals | 4     | ✅ 4          | ⏳ 0         | 🟡 Em Progresso |
| Compliance    | 4     | ✅ 4          | ⏳ 0         | 🟡 Em Progresso |
| Analytics     | 3     | ✅ 3          | ⏳ 0         | 🟡 Em Progresso |

## 🚀 **Como Contribuir**

1. **Para novos endpoints**: Criar arquivo na categoria apropriada
2. **Para atualizações**: Atualizar arquivo existente + este README
3. **Para mudanças breaking**: Documentar migração e versioning
4. **Testar endpoints**: Garantir que exemplos funcionam

---

**Status**: ✅ **ATIVO** - Estrutura criada, documentação individual pendente\
**Última Atualização**: 2025-01-08\
**Próximos Passos**: Documentar endpoints individuais
