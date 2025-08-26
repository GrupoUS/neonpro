# 🔔 NeonPro Notification System

**Story 1.7: Sistema de Notificações**

Sistema completo de notificações multi-canal para o NeonPro, suportando Email, SMS, Push e In-App
notifications com automação, templates e analytics.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso Básico](#uso-básico)
- [Canais Suportados](#canais-suportados)
- [Templates](#templates)
- [Automação](#automação)
- [Analytics](#analytics)
- [API Reference](#api-reference)
- [Exemplos](#exemplos)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O Sistema de Notificações do NeonPro é uma solução robusta e escalável que permite:

- **Multi-canal**: Email, SMS, Push e In-App
- **Templates dinâmicos**: Sistema flexível de templates com variáveis
- **Automação**: Regras baseadas em eventos e condições
- **Analytics**: Métricas detalhadas de entrega e engajamento
- **Escalabilidade**: Suporte a alto volume com rate limiting
- **Segurança**: Autenticação, autorização e auditoria completa

## ✨ Funcionalidades

### 🚀 Core Features

- ✅ Notificações multi-canal (Email, SMS, Push, In-App)
- ✅ Sistema de templates com variáveis dinâmicas
- ✅ Agendamento de notificações
- ✅ Rate limiting por canal
- ✅ Retry automático com backoff
- ✅ Tracking de entrega e eventos
- ✅ Preferências de usuário
- ✅ Modo silencioso (quiet hours)

### 🤖 Automação

- ✅ Triggers baseados em eventos
- ✅ Condições customizáveis
- ✅ Ações em cadeia
- ✅ Delays e agendamentos
- ✅ Webhooks

### 📊 Analytics

- ✅ Métricas de entrega por canal
- ✅ Taxa de abertura e cliques
- ✅ Relatórios diários/mensais
- ✅ Dashboard em tempo real
- ✅ Exportação de dados

### 🔧 Administração

- ✅ Dashboard de gerenciamento
- ✅ Configuração de canais
- ✅ Gerenciamento de templates
- ✅ Monitoramento de saúde
- ✅ Logs e auditoria

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───▶│ Notification    │───▶│   Channels      │
│                 │    │   Manager       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Template Engine │    │   Providers     │
                       └─────────────────┘    │  • Email (Resend)│
                                │              │  • SMS (Twilio) │
                                ▼              │  • Push (FCM)   │
                       ┌─────────────────┐    │  • In-App (WS)  │
                       │ Automation      │    └─────────────────┘
                       │ Engine          │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │  (Supabase)     │
                       └─────────────────┘
```

## 📦 Instalação

### 1. Dependências

```bash
npm install @supabase/supabase-js
npm install resend twilio firebase-admin
npm install ws
```

### 2. Banco de Dados

Execute o schema SQL no Supabase:

```bash
psql -h your-supabase-host -U postgres -d postgres -f lib/notifications/database/schema.sql
```

### 3. Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Email (Resend)
EMAIL_PROVIDER=resend
EMAIL_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@neonpro.com.br
EMAIL_FROM_NAME=NeonPro

# SMS (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
SMS_FROM_NUMBER=+5511999999999

# Push (FCM)
PUSH_PROVIDER=fcm
FCM_PROJECT_ID=your_fcm_project_id
FCM_PRIVATE_KEY=your_fcm_private_key
FCM_CLIENT_EMAIL=your_fcm_client_email

# Features
WEBSOCKET_ENABLED=true
PERSISTENCE_ENABLED=true
```

## ⚙️ Configuração

### Configuração Básica

```typescript
import { createNotificationSystem } from "@/lib/notifications";

const notifications = createNotificationSystem({
  features: {
    analytics: true,
    automation: true,
    templates: true,
    scheduling: true,
  },
});
```

### Configuração Avançada

```typescript
import { NotificationSystemConfig } from "@/lib/notifications/config";

const config: NotificationSystemConfig = {
  email: {
    provider: "resend",
    apiKey: process.env.EMAIL_API_KEY!,
    fromEmail: "noreply@neonpro.com.br",
    fromName: "NeonPro",
  },
  rateLimits: {
    EMAIL: { perMinute: 100, perHour: 1000, perDay: 10000 },
    SMS: { perMinute: 10, perHour: 100, perDay: 1000 },
  },
};
```

## 🚀 Uso Básico

### Enviar Notificação Simples

```typescript
import { notificationManager } from "@/lib/notifications";

// Notificação simples
await notificationManager.send({
  type: NotificationType.APPOINTMENT,
  channel: NotificationChannel.EMAIL,
  recipient: {
    id: "user-123",
    email: "user@example.com",
  },
  subject: "Lembrete de Consulta",
  content: "Sua consulta é amanhã às 14:00",
});
```

### Usar Template

```typescript
// Com template
await notificationManager.sendFromTemplate({
  templateId: "appointment-reminder",
  channel: NotificationChannel.SMS,
  recipient: {
    id: "patient-456",
    phone: "+5511999999999",
  },
  variables: {
    "patient.firstName": "João",
    "appointment.time": "14:00",
    "appointment.date": "2024-01-15",
    "doctor.name": "Dr. Silva",
  },
});
```

### Notificação Multi-canal

```typescript
// Enviar para múltiplos canais
await notificationManager.sendMultiChannel({
  templateId: "payment-confirmation",
  channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
  recipient: {
    id: "user-789",
    email: "user@example.com",
    phone: "+5511888888888",
  },
  variables: {
    "payment.amount": "R$ 150,00",
    "payment.reference": "PAY-123456",
  },
});
```

## 📱 Canais Suportados

### 📧 Email (Resend)

```typescript
// Configuração
const emailConfig = {
  provider: 'resend',
  apiKey: 'your_api_key',
  fromEmail: 'noreply@neonpro.com.br',
  fromName: 'NeonPro'
};

// Recursos
- ✅ Templates HTML
- ✅ Anexos
- ✅ Tracking de abertura
- ✅ Tracking de cliques
- ✅ Webhooks
```

### 📱 SMS (Twilio)

```typescript
// Configuração
const smsConfig = {
  provider: 'twilio',
  accountSid: 'your_account_sid',
  authToken: 'your_auth_token',
  fromNumber: '+5511999999999'
};

// Recursos
- ✅ Mensagens de texto
- ✅ Validação de número
- ✅ Status de entrega
- ✅ Webhooks
```

### 🔔 Push (FCM)

```typescript
// Configuração
const pushConfig = {
  provider: 'fcm',
  projectId: 'your_project_id',
  privateKey: 'your_private_key',
  clientEmail: 'your_client_email'
};

// Recursos
- ✅ iOS e Android
- ✅ Notificações ricas
- ✅ Targeting por tópicos
- ✅ Analytics
```

### 💬 In-App (WebSocket)

```typescript
// Configuração
const inAppConfig = {
  websocketEnabled: true,
  persistenceEnabled: true,
  maxNotifications: 100
};

// Recursos
- ✅ Tempo real
- ✅ Persistência
- ✅ Marcação como lida
- ✅ Arquivamento
```

## 📝 Templates

### Criar Template

```typescript
import { templateEngine } from "@/lib/notifications";

const template = await templateEngine.createTemplate({
  name: "welcome",
  description: "Boas-vindas para novos usuários",
  type: NotificationType.SYSTEM,
  channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
  subject: "Bem-vindo ao NeonPro!",
  content: `
    Olá {{user.firstName}},
    
    Bem-vindo ao NeonPro! Estamos felizes em tê-lo conosco.
    
    {{#if user.isFirstTime}}
    Como este é seu primeiro acesso, preparamos um guia rápido para você.
    {{/if}}
    
    Atenciosamente,
    Equipe NeonPro
  `,
  variables: ["user.firstName", "user.isFirstTime"],
});
```

### Variáveis Disponíveis

```typescript
// Usuário
{{user.firstName}}     // Nome
{{user.lastName}}      // Sobrenome
{{user.email}}         // Email
{{user.phone}}         // Telefone

// Paciente
{{patient.firstName}}  // Nome do paciente
{{patient.birthDate}}  // Data de nascimento

// Consulta
{{appointment.date}}   // Data da consulta
{{appointment.time}}   // Horário
{{appointment.doctor}} // Médico

// Pagamento
{{payment.amount}}     // Valor
{{payment.reference}}  // Referência
{{payment.date}}       // Data

// Funções
{{formatDate appointment.date 'DD/MM/YYYY'}}
{{formatCurrency payment.amount}}
{{formatPhone user.phone}}
```

## 🤖 Automação

### Criar Regra de Automação

```typescript
import { automationEngine } from "@/lib/notifications";

const rule = await automationEngine.createRule({
  name: "Lembrete de Consulta",
  description: "Enviar lembrete 24h antes da consulta",
  trigger: {
    type: "SCHEDULE",
    config: {
      event: "appointment.created",
      delay: "-24h", // 24 horas antes
    },
  },
  conditions: [
    {
      field: "appointment.status",
      operator: "equals",
      value: "confirmed",
    },
  ],
  actions: [
    {
      type: "SEND_NOTIFICATION",
      config: {
        templateId: "appointment-reminder",
        channels: ["SMS", "PUSH"],
      },
    },
  ],
});
```

### Triggers Disponíveis

```typescript
// Eventos do sistema
"user.created"; // Usuário criado
"appointment.created"; // Consulta agendada
"appointment.updated"; // Consulta alterada
"payment.completed"; // Pagamento confirmado
"alert.triggered"; // Alerta disparado

// Agendamentos
"schedule.daily"; // Diário
"schedule.weekly"; // Semanal
"schedule.monthly"; // Mensal
"schedule.custom"; // Personalizado
```

## 📊 Analytics

### Dashboard de Métricas

```typescript
import { NotificationDashboard } from '@/components/notifications';

// Componente React
<NotificationDashboard />;
```

### Métricas Programáticas

```typescript
import { notificationManager } from "@/lib/notifications";

// Estatísticas gerais
const stats = await notificationManager.getStats({
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  groupBy: "channel",
});

// Métricas por canal
const channelStats = await notificationManager.getChannelStats("EMAIL");

// Taxa de entrega
const deliveryRate = await notificationManager.getDeliveryRate({
  channel: "SMS",
  period: "last_30_days",
});
```

## 📚 API Reference

### NotificationManager

```typescript
class NotificationManager {
  // Enviar notificação
  async send(notification: NotificationRequest): Promise<NotificationDelivery>;

  // Enviar com template
  async sendFromTemplate(
    request: TemplateNotificationRequest,
  ): Promise<NotificationDelivery>;

  // Enviar multi-canal
  async sendMultiChannel(
    request: MultiChannelRequest,
  ): Promise<NotificationDelivery[]>;

  // Agendar notificação
  async schedule(
    notification: NotificationRequest,
    scheduledFor: Date,
  ): Promise<string>;

  // Cancelar notificação
  async cancel(notificationId: string): Promise<void>;

  // Obter estatísticas
  async getStats(options: StatsOptions): Promise<NotificationStats>;
}
```

### TemplateEngine

```typescript
class TemplateEngine {
  // Criar template
  async createTemplate(
    template: NotificationTemplate,
  ): Promise<NotificationTemplate>;

  // Renderizar template
  async render(
    templateId: string,
    variables: Record<string, any>,
  ): Promise<RenderedTemplate>;

  // Listar templates
  async listTemplates(filter?: TemplateFilter): Promise<NotificationTemplate[]>;

  // Atualizar template
  async updateTemplate(
    id: string,
    updates: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate>;
}
```

## 💡 Exemplos

### Exemplo Completo: Sistema de Lembretes

```typescript
import {
  automationEngine,
  notificationManager,
  templateEngine,
} from "@/lib/notifications";

// 1. Criar template
const reminderTemplate = await templateEngine.createTemplate({
  name: "appointment-reminder-24h",
  type: NotificationType.APPOINTMENT,
  channels: [NotificationChannel.SMS, NotificationChannel.PUSH],
  subject: "Lembrete: Consulta amanhã",
  content: `
    Olá {{patient.firstName}},
    
    Lembre-se da sua consulta amanhã:
    📅 Data: {{formatDate appointment.date 'DD/MM/YYYY'}}
    🕐 Horário: {{appointment.time}}
    👨‍⚕️ Médico: {{doctor.name}}
    📍 Local: {{appointment.location}}
    
    Em caso de dúvidas, entre em contato conosco.
  `,
  variables: [
    "patient.firstName",
    "appointment.date",
    "appointment.time",
    "doctor.name",
    "appointment.location",
  ],
});

// 2. Criar regra de automação
const reminderRule = await automationEngine.createRule({
  name: "Lembrete 24h Antes",
  trigger: {
    type: "EVENT",
    config: {
      event: "appointment.confirmed",
      delay: "-24h",
    },
  },
  conditions: [
    {
      field: "appointment.status",
      operator: "equals",
      value: "confirmed",
    },
    {
      field: "patient.preferences.reminders",
      operator: "equals",
      value: true,
    },
  ],
  actions: [
    {
      type: "SEND_NOTIFICATION",
      config: {
        templateId: reminderTemplate.id,
        channels: ["SMS", "PUSH"],
        priority: "HIGH",
      },
    },
  ],
});

// 3. Simular evento de consulta confirmada
const appointment = {
  id: "apt-123",
  patientId: "patient-456",
  doctorId: "doctor-789",
  date: "2024-01-16",
  time: "14:00",
  status: "confirmed",
  location: "Consultório 1",
};

// Disparar automação
await automationEngine.trigger("appointment.confirmed", {
  appointment,
  patient: {
    id: "patient-456",
    firstName: "João",
    preferences: { reminders: true },
  },
  doctor: {
    id: "doctor-789",
    name: "Dr. Silva",
  },
});
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Notificações não sendo enviadas

```bash
# Verificar configuração
const isEmailEnabled = isChannelEnabled(config, NotificationChannel.EMAIL);
console.log('Email habilitado:', isEmailEnabled);

# Verificar logs
const logs = await notificationManager.getLogs({
  level: 'error',
  limit: 10
});
```

#### 2. Templates não renderizando

```typescript
// Testar template
const result = await templateEngine.render("template-id", {
  "user.firstName": "João",
});
console.log("Template renderizado:", result);
```

#### 3. Rate limiting

```typescript
// Verificar limites
const limit = getRateLimit(config, NotificationChannel.EMAIL, "minute");
console.log("Limite por minuto:", limit);

// Verificar uso atual
const usage = await notificationManager.getRateLimitUsage("EMAIL");
console.log("Uso atual:", usage);
```

### Logs e Debugging

```typescript
// Habilitar logs detalhados
process.env.LOG_LEVEL = "debug";

// Modo de teste
process.env.NODE_ENV = "test";

// Mock providers
process.env.MOCK_PROVIDERS = "true";
```

### Monitoramento de Saúde

```typescript
// Verificar saúde dos canais
const health = await notificationManager.getChannelHealth();
console.log("Saúde dos canais:", health);

// Verificar conectividade
const connectivity = await notificationManager.testConnectivity();
console.log("Conectividade:", connectivity);
```

## 🚀 Próximos Passos

- [ ] Implementar mais provedores (SendGrid, AWS SES, etc.)
- [ ] Adicionar suporte a notificações ricas (imagens, botões)
- [ ] Implementar A/B testing para templates
- [ ] Adicionar machine learning para otimização de horários
- [ ] Implementar notificações por geolocalização
- [ ] Adicionar suporte a notificações em lote
- [ ] Implementar sistema de feedback automático

## 📄 Licença

Este projeto é parte do NeonPro e está sob a licença proprietária da empresa.

---

**Desenvolvido com ❤️ pela equipe NeonPro**
