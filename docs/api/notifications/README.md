# Sistema de Notificações - Documentação da API

## Visão Geral

O Sistema de Notificações do NeonPro oferece uma API completa para envio, monitoramento e análise de notificações multi-canal com otimização inteligente via Machine Learning e validação automática de compliance (LGPD, ANVISA, CFM).

### Características Principais

- **Multi-canal**: Email, SMS, WhatsApp, Push, In-App
- **Otimização ML**: Algoritmos inteligentes para melhor engajamento
- **Compliance Automático**: Validação LGPD, ANVISA e CFM
- **Analytics Avançado**: Métricas detalhadas de performance
- **Scheduling Inteligente**: Agendamento otimizado por IA
- **Templates Dinâmicos**: Sistema de templates personalizáveis

## Endpoints da API

### 📤 Envio de Notificações

#### POST `/api/notifications/send`
Envia notificação única com otimização inteligente.

**Request Body:**
```json
{
  "userId": "uuid",
  "clinicId": "uuid", 
  "type": "appointment_reminder",
  "channels": ["email", "sms"],
  "title": "Lembrete de Consulta",
  "content": "Sua consulta está agendada para amanhã às 14h",
  "priority": "normal",
  "enableMLOptimization": true,
  "scheduledFor": "2024-01-15T14:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "notificationId": "uuid",
  "optimizations": {
    "applied": true,
    "confidence": {
      "channel": 0.92,
      "timing": 0.87,
      "content": 0.94
    }
  },
  "compliance": {
    "validated": true,
    "warnings": [],
    "recommendations": []
  }
}
```

#### PUT `/api/notifications/send`
Envio em lote (bulk) para múltiplos destinatários.

**Request Body:**
```json
{
  "clinicId": "uuid",
  "notifications": [
    {
      "userId": "uuid1",
      "type": "promotional",
      "title": "Promoção Especial",
      "content": "20% de desconto em todos os tratamentos",
      "channels": ["email", "whatsapp"]
    }
  ],
  "batchOptions": {
    "delay": 1000,
    "stopOnError": false,
    "enableProgressTracking": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 100,
    "processed": 100,
    "successful": 98,
    "failed": 2
  },
  "results": [...],
  "errors": [...]
}
```

### 📊 Status e Histórico

#### GET `/api/notifications/status`
Consulta status e histórico de notificações.

**Query Parameters:**
- `id`: UUID da notificação específica
- `userId`: Filtrar por usuário
- `type`: Filtrar por tipo
- `status`: pending, sent, delivered, failed, cancelled
- `dateFrom`: Data inicial (ISO string)
- `dateTo`: Data final (ISO string)
- `limit`: Limite de resultados (1-1000, padrão: 50)
- `offset`: Offset para paginação

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "appointment_reminder",
      "status": "delivered",
      "title": "Lembrete de Consulta",
      "channels": ["email"],
      "sent_at": "2024-01-15T10:00:00Z",
      "delivered_at": "2024-01-15T10:01:30Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### 📈 Analytics e Métricas

#### GET `/api/notifications/analytics`
Métricas detalhadas e relatórios de performance.

**Query Parameters:**
- `metric`: overview, performance, engagement, channels, trends
- `period`: hour, day, week, month, quarter, year
- `dateFrom`: Data inicial
- `dateTo`: Data final
- `groupBy`: type, channel, status, user

**Response (metric=overview):**
```json
{
  "success": true,
  "metric": "overview",
  "period": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-07T23:59:59Z",
    "duration": "week"
  },
  "data": {
    "total": 1250,
    "sent": 1200,
    "delivered": 1150,
    "failed": 50,
    "pending": 50,
    "deliveryRate": 95.8,
    "engagementRate": 87.3,
    "channelBreakdown": {
      "email": 45.2,
      "sms": 23.8,
      "whatsapp": 18.7,
      "push": 8.9,
      "in_app": 3.4
    }
  }
}
```

## Tipos de Notificação

### Tipos Suportados
- `appointment_reminder`: Lembretes de consulta
- `promotional`: Ofertas e promoções
- `informational`: Informações gerais
- `urgent`: Notificações urgentes
- `system`: Notificações do sistema

### Canais Disponíveis
- `email`: E-mail tradicional
- `sms`: Mensagens SMS
- `whatsapp`: WhatsApp Business
- `push`: Notificações push (PWA)
- `in_app`: Notificações in-app

### Níveis de Prioridade
- `low`: Baixa prioridade
- `normal`: Prioridade normal (padrão)
- `high`: Alta prioridade
- `urgent`: Urgente (bypass de alguns filtros)

## Otimização via Machine Learning

### Recursos de IA

#### 1. Otimização de Canal
- Análise do histórico de engajamento por usuário
- Seleção automática do canal mais efetivo
- Confiança estatística das recomendações

#### 2. Otimização de Timing
- Análise de padrões de atividade do usuário
- Identificação de horários ótimos de envio
- Ajuste automático de fuso horário

#### 3. Personalização de Conteúdo
- Adaptação do tom e linguagem
- Personalização baseada em preferências
- A/B testing automático

### Configuração de ML

Para habilitar otimização ML, defina `enableMLOptimization: true` na requisição:

```json
{
  "enableMLOptimization": true,
  "metadata": {
    "mlPreferences": {
      "channelPriority": ["whatsapp", "email"],
      "timingFlexibility": "high",
      "contentPersonalization": true
    }
  }
}
```

## Compliance e Segurança

### Validação LGPD

O sistema automaticamente valida:
- ✅ Consentimento para comunicações
- ✅ Finalidade específica da notificação
- ✅ Direito de opt-out
- ✅ Minimização de dados
- ✅ Auditoria completa

### Validação Médica (ANVISA/CFM)

Para notificações médicas:
- ✅ Conformidade com diretrizes do CFM
- ✅ Proteção de dados sensíveis de saúde
- ✅ Rastreabilidade de comunicações médicas
- ✅ Validação de conteúdo médico

### Configuração de Compliance

```json
{
  "skipComplianceCheck": false,
  "complianceLevel": "strict",
  "auditMetadata": {
    "medicalContext": true,
    "sensitiveData": false,
    "consentSource": "patient_portal"
  }
}
```

## Rate Limits e Quotas

### Limites por Endpoint

| Endpoint | Rate Limit | Quota Diária |
|----------|------------|--------------|
| POST /send | 100/min | 10,000 |
| PUT /send (bulk) | 10/min | 100,000 |
| GET /status | 1000/min | Ilimitado |
| GET /analytics | 100/min | Ilimitado |

### Limites por Tipo

| Tipo de Notificação | Limite por Usuário/Dia |
|-------------------|------------------------|
| appointment_reminder | 10 |
| promotional | 3 |
| informational | 5 |
| urgent | 20 |
| system | Ilimitado |

## Códigos de Erro

### Erros Comuns

| Código | Descrição |
|--------|-----------|
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 422 | Falha na validação de compliance |
| 429 | Rate limit excedido |
| 500 | Erro interno do servidor |

### Exemplo de Resposta de Erro

```json
{
  "error": "Falha na validação de compliance",
  "violations": [
    {
      "rule": "LGPD_CONSENT",
      "severity": "critical",
      "message": "Usuário não possui consentimento ativo para comunicações",
      "remediation": "Solicitar consentimento antes do envio"
    }
  ]
}
```

## Webhooks

### Configuração de Webhooks

Configure webhooks para receber atualizações em tempo real:

```json
{
  "webhookUrl": "https://sua-api.com/webhooks/notifications",
  "events": ["sent", "delivered", "failed", "clicked", "unsubscribed"],
  "authentication": {
    "type": "bearer",
    "token": "seu-token-webhook"
  }
}
```

### Payload do Webhook

```json
{
  "event": "delivered",
  "notificationId": "uuid",
  "userId": "uuid",
  "clinicId": "uuid",
  "timestamp": "2024-01-15T10:01:30Z",
  "channel": "email",
  "metadata": {
    "deliveryTime": 90,
    "attempts": 1
  }
}
```

## SDK e Integrações

### JavaScript/TypeScript

```typescript
import { NotificationClient } from '@neonpro/notifications';

const client = new NotificationClient({
  apiKey: 'sua-api-key',
  baseUrl: 'https://api.neonpro.com'
});

// Enviar notificação
const result = await client.send({
  userId: 'user-uuid',
  type: 'appointment_reminder',
  title: 'Lembrete de Consulta',
  content: 'Sua consulta é amanhã às 14h',
  channels: ['email', 'sms']
});

// Consultar status
const status = await client.getStatus(result.notificationId);

// Analytics
const analytics = await client.getAnalytics({
  metric: 'overview',
  period: 'week'
});
```

## Monitoramento e Observabilidade

### Métricas Disponíveis

- **Delivery Rate**: Taxa de entrega por canal
- **Engagement Rate**: Taxa de engajamento (cliques, aberturas)
- **Response Time**: Tempo de resposta da API
- **Error Rate**: Taxa de erro por tipo
- **ML Performance**: Eficácia das otimizações de IA

### Logs Estruturados

Todos os eventos são logados com estrutura padronizada:

```json
{
  "timestamp": "2024-01-15T10:00:00Z",
  "level": "info",
  "service": "notification-system",
  "event": "notification_sent",
  "notificationId": "uuid",
  "userId": "uuid",
  "clinicId": "uuid",
  "channel": "email",
  "duration": 250,
  "mlOptimized": true,
  "complianceValidated": true
}
```

## Roadmap

### Próximas Funcionalidades

- 🔄 **Rich Media**: Suporte a imagens e vídeos
- 🌐 **Internacionalização**: Suporte a múltiplos idiomas
- 🤖 **ChatBot Integration**: Integração com chatbots
- 📱 **App Nativo**: SDK para apps mobile nativos
- 🔍 **Advanced Analytics**: ML para predição de engajamento
- 🔐 **Zero Trust**: Arquitetura de segurança zero trust

## Suporte

Para suporte técnico e dúvidas sobre a API:

- 📧 **Email**: dev@neonpro.com
- 📚 **Documentação**: https://docs.neonpro.com/notifications
- 🐛 **Issues**: https://github.com/neonpro/notifications/issues
- 💬 **Discord**: https://discord.gg/neonpro-dev