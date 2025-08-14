# Webhook & Event System

**Story 7.3: Webhook & Event System Implementation**

Sistema completo de webhooks e eventos em tempo real para o NeonPro, fornecendo notificações automáticas e integração com sistemas externos.

## 📋 Visão Geral

O sistema de webhooks e eventos permite:

- **Eventos em Tempo Real**: Publicação e streaming de eventos do sistema
- **Webhooks Automáticos**: Entrega automática de eventos para endpoints externos
- **Retry Inteligente**: Mecanismos de retry com backoff exponencial
- **Rate Limiting**: Controle de taxa para evitar sobrecarga
- **Segurança**: Assinatura HMAC e validação de endpoints
- **Monitoramento**: Análise de performance e saúde do sistema
- **Conformidade**: Suporte a LGPD e sanitização de dados

## 🏗️ Arquitetura

```
src/lib/webhooks/
├── types.ts              # Definições de tipos e interfaces
├── event-system.ts       # Core do sistema de eventos
├── webhook-manager.ts    # Gerenciamento de webhooks
├── utils.ts             # Utilitários e helpers
├── index.ts             # Integração e API principal
└── __tests__/           # Testes unitários
    ├── event-system.test.ts
    ├── webhook-manager.test.ts
    └── utils.test.ts
```

## 🚀 Uso Básico

### Inicialização

```typescript
import { WebhookEventSystem } from '@/lib/webhooks'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)
const webhookSystem = new WebhookEventSystem({
  supabase,
  enableRealtime: true,
  enableAnalytics: true,
  defaultRetryStrategy: {
    strategy: 'exponential',
    maxAttempts: 3,
    delayMs: 1000
  }
})

// Inicializar o sistema
await webhookSystem.initialize()
```

### Publicação de Eventos

```typescript
// Evento de paciente criado
await webhookSystem.publishEvent({
  type: 'patient.created',
  source: 'patient-service',
  data: {
    patientId: 'pat_123',
    name: 'João Silva',
    email: 'joao@email.com',
    clinicId: 'clinic_456'
  },
  metadata: {
    clinicId: 'clinic_456',
    userId: 'user_789'
  },
  priority: 'normal'
})

// Evento de agendamento
await webhookSystem.publishEvent({
  type: 'appointment.scheduled',
  source: 'scheduling-service',
  data: {
    appointmentId: 'apt_123',
    patientId: 'pat_123',
    doctorId: 'doc_456',
    scheduledAt: '2024-01-15T10:00:00Z',
    clinicId: 'clinic_456'
  },
  metadata: {
    clinicId: 'clinic_456'
  },
  priority: 'high'
})
```

### Registro de Webhooks

```typescript
// Registrar webhook para eventos de paciente
const webhook = await webhookSystem.registerWebhook({
  name: 'Sistema CRM - Pacientes',
  url: 'https://crm.clinica.com/webhooks/patients',
  clinicId: 'clinic_456',
  eventTypes: ['patient.created', 'patient.updated', 'patient.deleted'],
  secret: 'webhook-secret-key',
  headers: {
    'Authorization': 'Bearer token123',
    'X-API-Version': 'v1'
  },
  timeoutMs: 15000,
  retryStrategy: {
    strategy: 'exponential',
    maxAttempts: 5,
    delayMs: 2000
  },
  rateLimit: {
    requestsPerMinute: 120
  }
})

console.log('Webhook registrado:', webhook.id)
```

### Streaming em Tempo Real

```typescript
// Subscrever a eventos em tempo real
const subscription = webhookSystem.subscribeToEvents({
  eventTypes: ['appointment.scheduled', 'appointment.cancelled'],
  clinicId: 'clinic_456'
}, (event) => {
  console.log('Evento recebido:', event)
  // Atualizar UI em tempo real
  updateAppointmentUI(event)
})

// Cancelar subscrição
subscription.unsubscribe()
```

## 📊 Monitoramento e Análise

### Métricas de Performance

```typescript
// Obter métricas de webhook
const metrics = await webhookSystem.getWebhookMetrics('webhook_123', {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
})

console.log('Métricas:', {
  totalDeliveries: metrics.totalDeliveries,
  successRate: metrics.successRate,
  averageResponseTime: metrics.averageResponseTime,
  p95ResponseTime: metrics.p95ResponseTime
})
```

### Análise de Eventos

```typescript
// Análise de eventos por tipo
const analytics = await webhookSystem.getEventAnalytics({
  clinicId: 'clinic_456',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  groupBy: 'eventType'
})

console.log('Eventos por tipo:', analytics.eventsByType)
console.log('Volume por dia:', analytics.volumeByDay)
```

### Saúde do Sistema

```typescript
// Verificar saúde do sistema
const health = await webhookSystem.getSystemHealth()

console.log('Status do sistema:', {
  status: health.status, // 'healthy' | 'degraded' | 'unhealthy'
  eventQueueSize: health.eventQueueSize,
  activeWebhooks: health.activeWebhooks,
  failedDeliveries: health.failedDeliveries,
  averageProcessingTime: health.averageProcessingTime
})
```

## 🔒 Segurança

### Validação de Assinatura

```typescript
import { WebhookUtils } from '@/lib/webhooks/utils'

// No endpoint receptor do webhook
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature']
  const payload = JSON.stringify(req.body)
  const secret = 'webhook-secret-key'
  
  // Validar assinatura
  const isValid = WebhookUtils.verifySignature(payload, signature, secret)
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  // Processar evento
  const event = req.body
  console.log('Evento válido recebido:', event)
  
  res.status(200).json({ received: true })
})
```

### Sanitização de Dados

```typescript
// Dados são automaticamente sanitizados antes do envio
// Campos sensíveis são removidos ou mascarados:
// - password -> [REDACTED]
// - creditCard -> [REDACTED]
// - cpf -> [REDACTED]
// - Metadados internos são removidos
```

## 🔄 Tipos de Eventos Suportados

### Pacientes
- `patient.created` - Paciente criado
- `patient.updated` - Paciente atualizado
- `patient.deleted` - Paciente removido
- `patient.archived` - Paciente arquivado

### Agendamentos
- `appointment.scheduled` - Agendamento criado
- `appointment.updated` - Agendamento atualizado
- `appointment.cancelled` - Agendamento cancelado
- `appointment.completed` - Consulta finalizada
- `appointment.no_show` - Paciente faltou

### Pagamentos
- `payment.received` - Pagamento recebido
- `payment.failed` - Pagamento falhou
- `payment.refunded` - Pagamento estornado
- `payment.pending` - Pagamento pendente

### Faturas
- `invoice.generated` - Fatura gerada
- `invoice.sent` - Fatura enviada
- `invoice.paid` - Fatura paga
- `invoice.overdue` - Fatura vencida
- `invoice.cancelled` - Fatura cancelada

### Sistema
- `system.maintenance` - Manutenção programada
- `system.alert` - Alerta do sistema
- `system.backup_completed` - Backup concluído

## ⚙️ Configuração Avançada

### Estratégias de Retry

```typescript
// Exponencial (padrão)
{
  strategy: 'exponential',
  maxAttempts: 5,
  delayMs: 1000 // 1s, 2s, 4s, 8s, 16s
}

// Linear
{
  strategy: 'linear',
  maxAttempts: 3,
  delayMs: 2000 // 2s, 4s, 6s
}

// Fixo
{
  strategy: 'fixed',
  maxAttempts: 3,
  delayMs: 5000 // 5s, 5s, 5s
}
```

### Rate Limiting

```typescript
// Por webhook
{
  requestsPerMinute: 60, // Máximo 60 requests por minuto
  burstLimit: 10 // Máximo 10 requests em rajada
}

// Global (por clínica)
{
  requestsPerMinute: 300,
  burstLimit: 50
}
```

### Filtros de Eventos

```typescript
// Filtrar por prioridade
const subscription = webhookSystem.subscribeToEvents({
  eventTypes: ['*'], // Todos os tipos
  clinicId: 'clinic_456',
  filters: {
    priority: ['high', 'critical'],
    source: ['patient-service', 'scheduling-service']
  }
}, handleEvent)

// Filtrar por metadados
const subscription = webhookSystem.subscribeToEvents({
  eventTypes: ['patient.*'],
  clinicId: 'clinic_456',
  filters: {
    metadata: {
      department: 'cardiology'
    }
  }
}, handleEvent)
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

```sql
-- Eventos
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  metadata JSONB NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  version VARCHAR(20) DEFAULT '1.0.0',
  fingerprint VARCHAR(64) UNIQUE,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'pending'
);

-- Webhooks
CREATE TABLE webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  clinic_id UUID NOT NULL,
  event_types TEXT[] NOT NULL,
  secret VARCHAR(255),
  headers JSONB DEFAULT '{}',
  timeout_ms INTEGER DEFAULT 15000,
  retry_strategy JSONB,
  rate_limit JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Entregas
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES webhook_events(id),
  webhook_id UUID REFERENCES webhook_endpoints(id),
  attempt_number INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE
);
```

### Índices para Performance

```sql
-- Eventos
CREATE INDEX idx_webhook_events_type ON webhook_events(type);
CREATE INDEX idx_webhook_events_clinic ON webhook_events((metadata->>'clinicId'));
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);

-- Webhooks
CREATE INDEX idx_webhook_endpoints_clinic ON webhook_endpoints(clinic_id);
CREATE INDEX idx_webhook_endpoints_active ON webhook_endpoints(is_active);

-- Entregas
CREATE INDEX idx_webhook_deliveries_event ON webhook_deliveries(event_id);
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_retry ON webhook_deliveries(next_retry_at) WHERE status = 'pending';
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test src/lib/webhooks

# Executar testes específicos
npm test src/lib/webhooks/__tests__/event-system.test.ts
npm test src/lib/webhooks/__tests__/webhook-manager.test.ts
npm test src/lib/webhooks/__tests__/utils.test.ts

# Executar com coverage
npm test -- --coverage src/lib/webhooks
```

## 📈 Performance

### Otimizações Implementadas

- **Batch Processing**: Eventos são processados em lotes para melhor throughput
- **Connection Pooling**: Pool de conexões para webhooks HTTP
- **Caching**: Cache de configurações de webhook e rate limits
- **Indexação**: Índices otimizados para consultas frequentes
- **Streaming**: Processamento em stream para grandes volumes
- **Compression**: Compressão de payloads grandes

### Limites Recomendados

- **Eventos por segundo**: 1000+ (com batch processing)
- **Webhooks simultâneos**: 100+ (com connection pooling)
- **Payload máximo**: 1MB (com compressão)
- **Timeout máximo**: 30 segundos
- **Rate limit máximo**: 1000 req/min por webhook

## 🔧 Troubleshooting

### Problemas Comuns

1. **Webhook não recebe eventos**
   - Verificar se o webhook está ativo
   - Validar URL e conectividade
   - Verificar filtros de evento

2. **Falhas de entrega**
   - Verificar logs de erro
   - Validar assinatura no receptor
   - Verificar rate limits

3. **Performance lenta**
   - Verificar índices do banco
   - Monitorar queue size
   - Otimizar filtros de evento

### Logs e Debugging

```typescript
// Habilitar logs detalhados
const webhookSystem = new WebhookEventSystem({
  supabase,
  enableDebugLogs: true,
  logLevel: 'debug'
})

// Monitorar eventos de debug
webhookSystem.on('debug', (message) => {
  console.log('[WEBHOOK DEBUG]', message)
})

// Monitorar erros
webhookSystem.on('error', (error) => {
  console.error('[WEBHOOK ERROR]', error)
})
```

## 📚 Referências

- [Webhook Best Practices](https://webhooks.fyi/best-practices)
- [HTTP Status Codes](https://httpstatuses.com/)
- [HMAC Signature Validation](https://en.wikipedia.org/wiki/HMAC)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)

---

**Implementado como parte da Story 7.3: Webhook & Event System**

*Sistema completo de webhooks e eventos em tempo real com segurança, performance e monitoramento avançados.*