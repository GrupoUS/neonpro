/**
 * NeonPro Notification System - Main Export
 * Story 1.7: Sistema de Notificações
 *
 * Sistema completo de notificações para NeonPro
 * Suporte a múltiplos canais, templates, automação e analytics
 */

// ============================================================================
// CORE EXPORTS
// ============================================================================

// Automation
export { AutomationEngine } from './automation/automation-engine';
// Channels
export { NotificationChannelManager } from './channels';
export { EmailProvider } from './channels/email-provider';
export { InAppProvider } from './channels/in-app-provider';
export { PushProvider } from './channels/push-provider';
export { SMSProvider } from './channels/sms-provider';
// Core Manager
export { NotificationManager } from './notification-manager';
export { TemplateEngine } from './template-engine';
// Types
export * from './types';

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

import { AutomationEngine } from './automation/automation-engine';
import { NotificationChannelManager } from './channels';
import { EmailProvider } from './channels/email-provider';
import { InAppProvider } from './channels/in-app-provider';
import { PushProvider } from './channels/push-provider';
import { SMSProvider } from './channels/sms-provider';
import { NotificationManager } from './notification-manager';
import { TemplateEngine } from './template-engine';
import {
  type ChannelConfig,
  NotificationChannel,
  NotificationType,
} from './types';

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Cria instância completa do sistema de notificações
 */
export async function createNotificationSystem(config: {
  email?: ChannelConfig;
  sms?: ChannelConfig;
  push?: ChannelConfig;
  inApp?: ChannelConfig;
  enableAutomation?: boolean;
}) {
  // Criar template engine
  const templateEngine = new TemplateEngine();

  // Criar gerenciador de canais
  const channelManager = new NotificationChannelManager();

  // Registrar provedores de canal
  if (config.email) {
    const emailProvider = new EmailProvider();
    await emailProvider.initialize(config.email);
    channelManager.registerProvider(emailProvider);
  }

  if (config.sms) {
    const smsProvider = new SMSProvider();
    await smsProvider.initialize(config.sms);
    channelManager.registerProvider(smsProvider);
  }

  if (config.push) {
    const pushProvider = new PushProvider();
    await pushProvider.initialize(config.push);
    channelManager.registerProvider(pushProvider);
  }

  if (config.inApp) {
    const inAppProvider = new InAppProvider();
    await inAppProvider.initialize(config.inApp);
    channelManager.registerProvider(inAppProvider);
  }

  // Criar gerenciador principal
  const notificationManager = new NotificationManager(
    channelManager,
    templateEngine
  );

  // Criar motor de automação se habilitado
  let automationEngine: AutomationEngine | undefined;
  if (config.enableAutomation) {
    automationEngine = new AutomationEngine(
      notificationManager,
      templateEngine
    );
    automationEngine.start();
  }

  return {
    notificationManager,
    templateEngine,
    channelManager,
    automationEngine,
  };
}

/**
 * Cria configuração padrão para desenvolvimento
 */
export function createDefaultConfig(): {
  email: ChannelConfig;
  sms: ChannelConfig;
  push: ChannelConfig;
  inApp: ChannelConfig;
  enableAutomation: boolean;
} {
  return {
    email: {
      id: 'default-email',
      name: 'Email Padrão',
      channel: NotificationChannel.EMAIL,
      isEnabled: true,
      settings: {
        apiKey: process.env.RESEND_API_KEY || 'mock-key',
        fromEmail: process.env.FROM_EMAIL || 'noreply@neonpro.com.br',
        fromName: process.env.FROM_NAME || 'NeonPro',
        replyTo: process.env.REPLY_TO_EMAIL,
      },
      rateLimits: {
        perMinute: 60,
        perHour: 1000,
        perDay: 10_000,
      },
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelay: 1000,
      },
    },
    sms: {
      id: 'default-sms',
      name: 'SMS Padrão',
      channel: NotificationChannel.SMS,
      isEnabled: true,
      settings: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || 'mock-sid',
        authToken: process.env.TWILIO_AUTH_TOKEN || 'mock-token',
        fromNumber: process.env.TWILIO_FROM_NUMBER || '+5511999999999',
      },
      rateLimits: {
        perMinute: 10,
        perHour: 100,
        perDay: 1000,
      },
      retryPolicy: {
        maxAttempts: 2,
        backoffMultiplier: 2,
        initialDelay: 2000,
      },
    },
    push: {
      id: 'default-push',
      name: 'Push Padrão',
      channel: NotificationChannel.PUSH,
      isEnabled: true,
      settings: {
        serverKey: process.env.FIREBASE_SERVER_KEY || 'mock-key',
        projectId: process.env.FIREBASE_PROJECT_ID || 'neonpro-dev',
        senderId: process.env.FIREBASE_SENDER_ID,
        vapidKey: process.env.FIREBASE_VAPID_KEY,
      },
      rateLimits: {
        perMinute: 100,
        perHour: 5000,
        perDay: 50_000,
      },
      retryPolicy: {
        maxAttempts: 3,
        backoffMultiplier: 1.5,
        initialDelay: 500,
      },
    },
    inApp: {
      id: 'default-inapp',
      name: 'In-App Padrão',
      channel: NotificationChannel.IN_APP,
      isEnabled: true,
      settings: {
        websocketUrl: process.env.WEBSOCKET_URL,
        enableRealTime: true,
        maxNotifications: 100,
        autoMarkAsRead: false,
        soundEnabled: true,
        persistNotifications: true,
      },
      rateLimits: {
        perMinute: 200,
        perHour: 10_000,
        perDay: 100_000,
      },
      retryPolicy: {
        maxAttempts: 1,
        backoffMultiplier: 1,
        initialDelay: 0,
      },
    },
    enableAutomation: true,
  };
}

/**
 * Cria templates padrão do sistema
 */
export function createDefaultTemplates() {
  return [
    {
      id: 'welcome',
      name: 'Boas-vindas',
      description: 'Template de boas-vindas para novos usuários',
      type: NotificationType.SYSTEM,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      subject: 'Bem-vindo ao NeonPro, {{user.firstName}}!',
      content: `
        <h1>Bem-vindo ao NeonPro!</h1>
        <p>Olá {{user.firstName}},</p>
        <p>É um prazer tê-lo conosco! Sua conta foi criada com sucesso.</p>
        <p>Agora você pode:</p>
        <ul>
          <li>Gerenciar seus pacientes</li>
          <li>Agendar consultas</li>
          <li>Acessar relatórios</li>
          <li>E muito mais!</li>
        </ul>
        <p>Se precisar de ajuda, nossa equipe está sempre disponível.</p>
        <p>Atenciosamente,<br>Equipe NeonPro</p>
      `,
      variables: ['user.firstName', 'user.email', 'clinic.name'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'appointment-reminder',
      name: 'Lembrete de Consulta',
      description: 'Lembrete de consulta agendada',
      type: NotificationType.APPOINTMENT,
      channels: [
        NotificationChannel.SMS,
        NotificationChannel.PUSH,
        NotificationChannel.IN_APP,
      ],
      subject: 'Lembrete: Consulta amanhã às {{appointment.time}}',
      content: `
        Olá {{patient.firstName}},
        
        Este é um lembrete da sua consulta:
        
        📅 Data: {{formatDate appointment.date}}
        🕐 Horário: {{appointment.time}}
        👨‍⚕️ Profissional: {{doctor.name}}
        🏥 Local: {{clinic.name}}
        📍 Endereço: {{clinic.address}}
        
        Por favor, chegue 15 minutos antes do horário agendado.
        
        Em caso de dúvidas, entre em contato: {{clinic.phone}}
      `,
      variables: [
        'patient.firstName',
        'appointment.date',
        'appointment.time',
        'doctor.name',
        'clinic.name',
        'clinic.address',
        'clinic.phone',
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'payment-confirmation',
      name: 'Confirmação de Pagamento',
      description: 'Confirmação de pagamento recebido',
      type: NotificationType.PAYMENT,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      subject: 'Pagamento confirmado - {{formatCurrency payment.amount}}',
      content: `
        <h2>Pagamento Confirmado</h2>
        <p>Olá {{patient.firstName}},</p>
        <p>Confirmamos o recebimento do seu pagamento:</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <strong>Valor:</strong> {{formatCurrency payment.amount}}<br>
          <strong>Método:</strong> {{payment.method}}<br>
          <strong>Data:</strong> {{formatDate payment.date}}<br>
          <strong>Referência:</strong> {{payment.reference}}
        </div>
        
        <p>Obrigado por escolher nossos serviços!</p>
        <p>Atenciosamente,<br>{{clinic.name}}</p>
      `,
      variables: [
        'patient.firstName',
        'payment.amount',
        'payment.method',
        'payment.date',
        'payment.reference',
        'clinic.name',
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'system-alert',
      name: 'Alerta do Sistema',
      description: 'Alerta importante do sistema',
      type: NotificationType.SYSTEM,
      channels: [
        NotificationChannel.EMAIL,
        NotificationChannel.PUSH,
        NotificationChannel.IN_APP,
      ],
      subject: '⚠️ Alerta: {{alert.title}}',
      content: `
        <div style="border-left: 4px solid #ff6b6b; padding: 15px; background: #fff5f5;">
          <h3 style="color: #c92a2a; margin: 0 0 10px 0;">{{alert.title}}</h3>
          <p>{{alert.message}}</p>
          
          {{#if alert.action}}
          <p><strong>Ação necessária:</strong> {{alert.action}}</p>
          {{/if}}
          
          <p><small>Horário: {{formatDateTime now}}</small></p>
        </div>
      `,
      variables: ['alert.title', 'alert.message', 'alert.action'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Valida configuração do sistema
 */
export function validateSystemConfig(config: any): string[] {
  const errors: string[] = [];

  if (!(config.email || config.sms || config.push || config.inApp)) {
    errors.push('Pelo menos um canal deve ser configurado');
  }

  // Validar configurações específicas de cada canal
  if (config.email && !config.email.settings?.fromEmail) {
    errors.push('Email de origem é obrigatório para canal de email');
  }

  if (config.sms && !config.sms.settings?.fromNumber) {
    errors.push('Número de origem é obrigatório para canal SMS');
  }

  if (config.push && !config.push.settings?.projectId) {
    errors.push('Project ID é obrigatório para canal push');
  }

  return errors;
}

/**
 * Obtém informações do sistema
 */
export function getSystemInfo() {
  return {
    name: 'NeonPro Notification System',
    version: '1.0.0',
    description: 'Sistema completo de notificações para NeonPro',
    features: [
      'Múltiplos canais (Email, SMS, Push, In-App)',
      'Sistema de templates com variáveis',
      'Automação baseada em eventos',
      'Rate limiting e retry policies',
      'Analytics e monitoramento',
      'Integração com audit trail',
    ],
    supportedChannels: [
      NotificationChannel.EMAIL,
      NotificationChannel.SMS,
      NotificationChannel.PUSH,
      NotificationChannel.IN_APP,
    ],
    supportedTypes: [
      NotificationType.APPOINTMENT,
      NotificationType.PAYMENT,
      NotificationType.REMINDER,
      NotificationType.ALERT,
      NotificationType.MARKETING,
      NotificationType.SYSTEM,
    ],
  };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  createNotificationSystem,
  createDefaultConfig,
  createDefaultTemplates,
  validateSystemConfig,
  getSystemInfo,
  NotificationManager,
  TemplateEngine,
  NotificationChannelManager,
  AutomationEngine,
};
