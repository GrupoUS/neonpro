# NeonPro Healthcare API

> 🏥 **Sistema de Gestão para Clínicas Estéticas Brasileiras**  
> API RESTful completa com conformidade LGPD, ANVISA e CFM

[![Healthcare Compliant](https://img.shields.io/badge/Healthcare-Compliant-green.svg)](https://www.anvisa.gov.br/)
[![LGPD Compliant](https://img.shields.io/badge/LGPD-Compliant-blue.svg)](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
[![Brazilian Taxes](https://img.shields.io/badge/Brazilian-Taxes-yellow.svg)](https://www.receita.fazenda.gov.br/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-black.svg)](https://www.fastify.io/)

## 🌟 Características Principais

### 🏥 **Sistema de Saúde Completo**
- **Gestão de Pacientes**: Prontuários eletrônicos seguros e completos
- **Agendamento**: Sistema inteligente de consultas e procedimentos
- **Cobrança**: Faturamento automático com impostos brasileiros (ISS, IR)
- **Pagamentos**: PIX, cartão, parcelamento e planos de saúde
- **Monitoramento**: Sinais vitais em tempo real e alertas críticos

### 🇧🇷 **Conformidade Brasileira**
- **LGPD**: Lei Geral de Proteção de Dados - direitos do titular
- **ANVISA**: Rastreabilidade e auditoria completa
- **CFM**: Validação de registros médicos (CRM, COREN, etc.)
- **Receita Federal**: Cálculo automático de ISS e IR por município
- **Padrões Brasileiros**: CPF, CNPJ, CEP, telefone, endereços

### ⚡ **Performance e Segurança**
- **Rate Limiting**: Proteção contra abuso com override de emergência
- **Autenticação JWT**: Multi-tenant com controle de acesso granular
- **Criptografia**: Dados sensíveis mascarados e protegidos
- **Auditoria**: Log completo de todas as operações críticas
- **Monitoramento**: Métricas em tempo real e alertas automáticos

## 🚀 **Início Rápido**

### **Pré-requisitos**
```bash
# Node.js 18+ e npm
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# Supabase Project (ou PostgreSQL)
# Conta Supabase em https://supabase.com
```

### **Instalação**
```bash
# Clone do repositório
git clone https://github.com/neonpro/neonpro-api.git
cd neonpro-api

# Instalação de dependências
npm install

# Configuração do ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### **Configuração do Ambiente**
```bash
# .env
NODE_ENV=development
PORT=4000
HOST=0.0.0.0

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=24h

# Brazilian Tax Configuration
ISS_DEFAULT_RATE=0.05
IR_THRESHOLD=20000
DEFAULT_MUNICIPALITY=São Paulo

# Compliance
LGPD_AUDIT_ENABLED=true
ANVISA_REPORTING_ENABLED=true
DATA_RETENTION_YEARS=7

# External Services (opcional)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
SENDGRID_API_KEY=your-sendgrid-key
```

### **Execução**
```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start

# Testes
npm test
npm run test:coverage

# Linting e Type Check
npm run lint
npm run type-check
```

### **Setup do Banco de Dados**
```bash
# Aplicar políticas RLS (Row Level Security)
psql -f src/database/rls-policies.sql

# Ou através do Supabase Dashboard:
# 1. Vá para SQL Editor
# 2. Cole o conteúdo de src/database/rls-policies.sql
# 3. Execute o script
```

## 📚 **Documentação da API**

### **Autenticação**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "doctor@clinica.com.br",
  "password": "senha123",
  "tenantId": "clinica-uuid"
}

# Resposta
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "email": "doctor@clinica.com.br",
    "role": "doctor",
    "tenantId": "clinica-uuid"
  }
}
```

### **Gestão de Pacientes**
```http
# Criar paciente
POST /api/patients
Authorization: Bearer {token}
X-Tenant-ID: {tenant-id}
Content-Type: application/json

{
  "fullName": "Maria Silva Santos",
  "cpf": "12345678901",
  "email": "maria@email.com",
  "phone": "+5511987654321",
  "dateOfBirth": "1985-05-15",
  "address": {
    "street": "Rua das Flores, 123",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "medicalHistory": {
    "allergies": ["Penicilina"],
    "chronicConditions": [],
    "medications": []
  }
}

# Listar pacientes
GET /api/patients?page=1&limit=20&search=Maria
Authorization: Bearer {token}
X-Tenant-ID: {tenant-id}

# Exportar dados (LGPD)
GET /api/patients/{id}/export
Authorization: Bearer {token}
X-Tenant-ID: {tenant-id}
```

### **Sistema de Cobrança**
```http
# Criar fatura
POST /api/billing/invoices
Authorization: Bearer {token}
X-Tenant-ID: {tenant-id}
Content-Type: application/json

{
  "patientId": "patient-uuid",
  "services": [
    {
      "serviceId": "botox-001",
      "serviceName": "Aplicação de Botox",
      "quantity": 1,
      "unitPrice": 800.00,
      "discount": 10
    }
  ],
  "paymentMethod": "credit_card",
  "taxes": {
    "includeISS": true,
    "municipality": "São Paulo"
  },
  "dueDate": "2024-02-15T10:00:00Z"
}

# Gerar PIX
POST /api/billing/pix/generate
Authorization: Bearer {token}
X-Tenant-ID: {tenant-id}
Content-Type: application/json

{
  "invoiceId": "invoice-uuid",
  "amount": 840.00,
  "expirationMinutes": 60
}
```

### **Agendamento**
```http
# Agendar consulta
POST /api/appointments
Authorization: Bearer {token}
X-Tenant-ID: {tenant-id}
Content-Type: application/json

{
  "patientId": "patient-uuid",
  "providerId": "doctor-uuid",
  "scheduledAt": "2024-02-10T14:30:00Z",
  "duration": 60,
  "type": "consultation",
  "notes": "Primeira consulta"
}
```

## 🏗️ **Arquitetura**

### **Stack Tecnológico**
```
Frontend: React 19 + Next.js 15 + TypeScript
Backend: Fastify + TypeScript + Zod
Database: Supabase (PostgreSQL) + RLS
Cache: Redis (opcional)
Queue: Bull/BullMQ (opcional)
Monitoring: Prometheus + Grafana
Testing: Jest + Supertest
```

### **Arquitetura Híbrida**
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Edge Services │
│   React + Vite  │    │   Hono Workers  │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
            ┌────────▼────────┐
            │   Main API      │
            │   Fastify       │
            └────────┬────────┘
                     │
            ┌────────▼────────┐
            │   Database      │
            │   Supabase      │
            └─────────────────┘
```

### **Padrões de Código**
- **Clean Architecture**: Separação clara de responsabilidades
- **Domain-Driven Design**: Modelagem baseada no domínio médico
- **SOLID Principles**: Código mantível e extensível
- **Schema Validation**: Zod para garantir integridade dos dados
- **Error Handling**: Tratamento unificado e logging structured

## 🔒 **Segurança e Conformidade**

### **LGPD (Lei Geral de Proteção de Dados)**
```typescript
// Mascaramento automático de dados sensíveis
const maskedCPF = maskSensitiveData(patient.cpf, 'cpf');
// Output: "***.***.***-01"

// Exportação de dados (Art. 15 LGPD)
GET /api/patients/{id}/export

// Exclusão de dados (Art. 18 LGPD)
DELETE /api/patients/{id}
```

### **ANVISA (Vigilância Sanitária)**
```typescript
// Auditoria automática de todas as operações
await fastify.auditLog({
  action: 'patient_viewed',
  userId: 'doctor-uuid',
  resourceId: 'patient-uuid',
  metadata: { timestamp, ipAddress, userAgent }
});

// Rastreabilidade completa
// Retenção de 7 anos conforme RDC 301/2019
```

### **Segurança Multi-Camadas**
- **Rate Limiting**: Proteção contra DDoS e abuso
- **Row Level Security**: Isolamento de dados por tenant
- **JWT Authentication**: Tokens seguros com refresh
- **Data Encryption**: Dados sensíveis criptografados
- **Audit Trail**: Log completo de todas as operações

## 📊 **Monitoramento**

### **Health Checks**
```http
# Basic health check
GET /health

# Detailed health (admin only)
GET /health/detailed
Authorization: Bearer {admin-token}

# Prometheus metrics
GET /metrics
```

### **Métricas de Sistema**
- **Performance**: Tempo de resposta, throughput, erro rate
- **Healthcare**: Pacientes registrados, consultas agendadas, pagamentos
- **Compliance**: Logs de auditoria, requests LGPD, relatórios ANVISA
- **Security**: Tentativas de login, rate limits atingidos, alertas

### **Alertas Automáticos**
```javascript
// Configuração de alertas
const alerts = {
  responseTime: { threshold: 1000, severity: 'warning' },
  errorRate: { threshold: 5, severity: 'critical' },
  memoryUsage: { threshold: 90, severity: 'critical' },
  failedLogins: { threshold: 10, severity: 'security' }
};
```

## 🧪 **Testes**

### **Estrutura de Testes**
```
tests/
├── unit/                 # Testes unitários
│   ├── utils/            # Funções utilitárias
│   └── services/         # Lógica de negócio
├── integration/          # Testes de integração
│   ├── patients.test.ts  # API de pacientes
│   ├── billing.test.ts   # Sistema de cobrança
│   └── auth.test.ts      # Autenticação
└── setup.ts              # Configuração global
```

### **Execução de Testes**
```bash
# Todos os testes
npm test

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração  
npm run test:integration

# Coverage report
npm run test:coverage

# Watch mode para desenvolvimento
npm run test:watch
```

### **Cobertura de Testes**
- **Mínimo**: 80% de cobertura em branches, functions, lines, statements
- **Healthcare Critical**: 95% de cobertura em funções médicas críticas
- **LGPD Functions**: 100% de cobertura em funções de conformidade

## 🚀 **Deploy**

### **Ambiente de Desenvolvimento**
```bash
# Executar localmente
npm run dev

# Com Docker
docker-compose up -d
```

### **Ambiente de Produção**
```bash
# Build para produção
npm run build

# Deploy script
./scripts/deploy.sh latest production

# Docker deployment
docker build -t neonpro/healthcare-api .
docker run -p 4000:4000 neonpro/healthcare-api
```

### **Variáveis de Ambiente por Ambiente**

**Development:**
```bash
NODE_ENV=development
LOG_LEVEL=debug
RATE_LIMIT_ENABLED=false
```

**Staging:**
```bash
NODE_ENV=staging
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true
```

**Production:**
```bash
NODE_ENV=production
LOG_LEVEL=warn
RATE_LIMIT_ENABLED=true
MONITORING_ENABLED=true
```

## 🤝 **Contribuição**

### **Processo de Desenvolvimento**
1. **Fork** do repositório
2. **Branch** para sua feature: `git checkout -b feature/nova-funcionalidade`
3. **Commit** suas mudanças: `git commit -m 'feat: adicionar nova funcionalidade'`
4. **Push** para a branch: `git push origin feature/nova-funcionalidade`
5. **Pull Request** com descrição detalhada

### **Padrões de Commit**
```bash
feat: nova funcionalidade
fix: correção de bug
docs: atualização de documentação
style: formatação de código
refactor: refatoração sem mudança de funcionalidade
test: adição ou correção de testes
chore: tarefas de build ou dependências
```

### **Code Review**
- ✅ Testes passando
- ✅ Cobertura mantida ou melhorada
- ✅ Documentação atualizada
- ✅ Conformidade LGPD/ANVISA verificada
- ✅ Performance não degradada

## 📄 **Licença**

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🆘 **Suporte**

### **Documentação**
- [API Reference](./docs/api-reference.md)
- [Database Schema](./docs/database-schema.md)
- [Deployment Guide](./docs/deployment.md)
- [LGPD Compliance](./docs/lgpd-compliance.md)

### **Contato**
- **Email**: dev@neonpro.com.br
- **Issues**: [GitHub Issues](https://github.com/neonpro/neonpro-api/issues)
- **Slack**: #neonpro-dev

### **Links Úteis**
- [LGPD - Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [ANVISA - RDC 301/2019](https://www.in.gov.br/web/dou/-/resolucao-rdc-n-301-de-21-de-agosto-de-2019-211914064)
- [CFM - Código de Ética](https://portal.cfm.org.br/images/PDF/cem2019.pdf)
- [Receita Federal - Tabela ISS](https://www.receita.fazenda.gov.br/legislacao/leis-complementares/2003/leicp116.htm)

---

<div align="center">

**🏥 NeonPro Healthcare API**  
*Transformando a gestão de clínicas estéticas no Brasil*

[![Healthcare](https://img.shields.io/badge/Made%20for-Healthcare-red.svg)](https://neonpro.com.br)
[![Brazil](https://img.shields.io/badge/Made%20in-Brazil-green.svg)](https://brasil.gov.br)
[![LGPD](https://img.shields.io/badge/LGPD-Compliant-blue.svg)](https://www.gov.br/cidadania/pt-br/assuntos/protecao-de-dados)

</div>