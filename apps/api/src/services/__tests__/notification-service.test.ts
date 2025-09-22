/**
 * Tests for Real-time Notification Service (T042)
 * Following TDD methodology - MUST FAIL FIRST
 * CRITICAL: All notification data must be persisted to Supabase PostgreSQL
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Real-time Notification Service (T042)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it(_'should export NotificationService class',async () => {
    const module = await import('../notification-service');
    expect(module.NotificationService).toBeDefined();
  });

  describe(_'Multi-channel Notification Delivery'), () => {
    it(_'should send email notification',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.sendNotification({
        recipientId: 'patient-123',
        channel: 'email',
        templateId: 'appointment_reminder',
        data: {
          patientName: 'João Silva',
          appointmentDate: '2024-02-15',
          appointmentTime: '14:30',
          doctorName: 'Dr. Maria Santos',
        },
        priority: 'high',
        scheduledFor: new Date(Date.now() + 3600000), // 1 hour from now
      });

      expect(result.success).toBe(true);
      expect(result.data.notificationId).toBeDefined();
      expect(result.data.channel).toBe('email');
      expect(result.data.status).toBe('queued');
      expect(result.data.persisted).toBe(true);
    });

    it(_'should send SMS notification',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.sendNotification({
        recipientId: 'patient-123',
        channel: 'sms',
        templateId: 'appointment_confirmation',
        data: {
          patientName: 'João Silva',
          appointmentDate: '15/02/2024',
          clinicName: 'NeonPro Estética',
        },
        priority: 'medium',
        lgpdConsent: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.channel).toBe('sms');
      expect(result.data.lgpdCompliant).toBe(true);
      expect(result.data.persisted).toBe(true);
    });

    it(_'should send WhatsApp notification',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.sendNotification({
        recipientId: 'patient-123',
        channel: 'whatsapp',
        templateId: 'treatment_followup',
        data: {
          patientName: 'João Silva',
          treatmentName: 'Limpeza de Pele',
          followupInstructions: 'Evitar exposição solar por 48h',
        },
        priority: 'low',
        metadata: {
          treatmentId: 'treatment-456',
          doctorId: 'doctor-123',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data.channel).toBe('whatsapp');
      expect(result.data.metadata).toBeDefined();
      expect(result.data.persisted).toBe(true);
    });

    it(_'should send push notification',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.sendNotification({
        recipientId: 'patient-123',
        channel: 'push',
        templateId: 'appointment_reminder_push',
        data: {
          title: 'Lembrete de Consulta',
          body: 'Sua consulta é amanhã às 14:30',
          icon: 'appointment-icon',
          clickAction: '/appointments/123',
        },
        priority: 'high',
        deviceTokens: ['token1', 'token2'],
      });

      expect(result.success).toBe(true);
      expect(result.data.channel).toBe('push');
      expect(result.data.deviceCount).toBe(2);
      expect(result.data.persisted).toBe(true);
    });
  });

  describe(_'Real-time Notification Streaming'), () => {
    it(_'should start notification stream',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.startNotificationStream({
        streamId: 'stream-123',
        recipientId: 'patient-123',
        channels: ['email', 'sms', 'push'],
        filters: {
          priority: ['high', 'critical'],
          categories: ['appointment', 'treatment'],
        },
      });

      expect(result.success).toBe(true);
      expect(result.data.streamId).toBe('stream-123');
      expect(result.data.isActive).toBe(true);
      expect(result.data.channelCount).toBe(3);
    });

    it(_'should stop notification stream',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.stopNotificationStream('stream-123');

      expect(result.success).toBe(true);
      expect(result.data.streamId).toBe('stream-123');
      expect(result.data.isActive).toBe(false);
      expect(result.data.finalNotificationCount).toBeGreaterThanOrEqual(0);
    });

    it(_'should get real-time notification status',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.getNotificationStatus('notification-123');

      expect(result.success).toBe(true);
      expect(result.data.notificationId).toBe('notification-123');
      expect(result.data.status).toBeDefined();
      expect(result.data.deliveryAttempts).toBeGreaterThanOrEqual(0);
      expect(result.data.lastUpdated).toBeDefined();
    });

    it(_'should list active notification streams',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.listActiveStreams();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.streams)).toBe(true);
      expect(result.data.totalActive).toBeGreaterThanOrEqual(0);
    });
  });

  describe(_'Brazilian Healthcare Context'), () => {
    it(_'should send LGPD compliant notification',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.sendNotification({
        recipientId: 'patient-123',
        channel: 'email',
        templateId: 'lgpd_consent_update',
        data: {
          patientName: 'João Silva',
          consentType: 'marketing',
          updateReason: 'Solicitação do titular dos dados',
          rightsInformation: 'Você pode revogar este consentimento a qualquer momento',
        },
        lgpdContext: {
          legalBasis: 'consent',
          dataCategories: ['personal_data'],
          retentionPeriod: '5 years',
        },
        priority: 'high',
      });

      expect(result.success).toBe(true);
      expect(result.data.lgpdCompliant).toBe(true);
      expect(result.data.legalBasis).toBe('consent');
      expect(result.data.auditLogged).toBe(true);
    });

    it(_'should send ANVISA compliant medical notification',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.sendNotification({
        recipientId: 'patient-123',
        channel: 'sms',
        templateId: 'medical_device_alert',
        data: {
          deviceName: 'Laser CO2 Fracionado',
          alertType: 'maintenance_required',
          complianceCode: 'ANVISA-2024-001',
          actionRequired: 'Agendar manutenção preventiva',
        },
        anvisaContext: {
          deviceRegistration: 'REG-12345',
          complianceLevel: 'high',
          reportingRequired: true,
        },
        priority: 'critical',
      });

      expect(result.success).toBe(true);
      expect(result.data.anvisaCompliant).toBe(true);
      expect(result.data.complianceReported).toBe(true);
      expect(result.data.priority).toBe('critical');
    });

    it(_'should send CFM compliant professional notification',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.sendNotification({
        recipientId: 'doctor-123',
        channel: 'email',
        templateId: 'cfm_professional_update',
        data: {
          doctorName: 'Dr. Maria Santos',
          crmNumber: 'CRM-SP 123456',
          updateType: 'continuing_education',
          requirement: 'Atualização em Dermatologia Estética',
          deadline: '31/12/2024',
        },
        cfmContext: {
          professionalCategory: 'dermatologist',
          specialtyCode: 'DER-001',
          complianceRequired: true,
        },
        priority: 'medium',
      });

      expect(result.success).toBe(true);
      expect(result.data.cfmCompliant).toBe(true);
      expect(result.data.professionalStandards).toBe(true);
      expect(result.data.specialtyValidated).toBe(true);
    });

    it(_'should validate Brazilian phone number format',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.validateRecipientContact({
        recipientId: 'patient-123',
        channel: 'sms',
        contactInfo: {
          phone: '(11) 99999-9999',
          countryCode: '+55',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data.isValid).toBe(true);
      expect(result.data.format).toBe('brazilian_mobile');
      expect(result.data.carrier).toBeDefined();
    });
  });

  describe(_'Template Management'), () => {
    it(_'should create notification template',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.createTemplate({
        templateId: 'custom_reminder',
        name: 'Lembrete Personalizado',
        description: 'Template para lembretes personalizados',
        channel: 'email',
        language: 'pt-BR',
        subject: 'Lembrete: {{appointmentType}} em {{clinicName}}',
        content: `
          Olá {{patientName}},
          
          Este é um lembrete sobre seu(sua) {{appointmentType}} agendado(a) para:
          Data: {{appointmentDate}}
          Horário: {{appointmentTime}}
          Local: {{clinicName}}
          
          Em caso de dúvidas, entre em contato conosco.
          
          Atenciosamente,
          Equipe {{clinicName}}
        `,
        variables: [
          'patientName',
          'appointmentType',
          'appointmentDate',
          'appointmentTime',
          'clinicName',
        ],
        category: 'appointment',
      });

      expect(result.success).toBe(true);
      expect(result.data.templateId).toBe('custom_reminder');
      expect(result.data.language).toBe('pt-BR');
      expect(result.data.variableCount).toBe(5);
      expect(result.data.persisted).toBe(true);
    });

    it(_'should render template with dynamic content',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.renderTemplate({
        templateId: 'appointment_reminder',
        data: {
          patientName: 'João Silva',
          appointmentType: 'Consulta Dermatológica',
          appointmentDate: '15/02/2024',
          appointmentTime: '14:30',
          clinicName: 'NeonPro Estética',
          doctorName: 'Dr. Maria Santos',
        },
        language: 'pt-BR',
      });

      expect(result.success).toBe(true);
      expect(result.data.renderedSubject).toContain('João Silva');
      expect(result.data.renderedContent).toContain('Consulta Dermatológica');
      expect(result.data.renderedContent).toContain('15/02/2024');
      expect(result.data.missingVariables).toEqual([]);
    });

    it(_'should update notification template',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.updateTemplate('custom_reminder', {
        subject: 'ATUALIZADO: {{appointmentType}} em {{clinicName}}',
        content: 'Conteúdo atualizado do template...',
        variables: ['patientName', 'appointmentType', 'clinicName'],
        lastModifiedBy: 'admin-123',
      });

      expect(result.success).toBe(true);
      expect(result.data.templateId).toBe('custom_reminder');
      expect(result.data.subject).toContain('ATUALIZADO:');
      expect(result.data.lastModifiedBy).toBe('admin-123');
      expect(result.data.version).toBeGreaterThan(1);
    });

    it(_'should list available templates',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.listTemplates({
        channel: 'email',
        language: 'pt-BR',
        category: 'appointment',
        includeInactive: false,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.templates)).toBe(true);
      expect(result.data.totalCount).toBeGreaterThanOrEqual(0);
      expect(result.data.filteredCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe(_'Delivery Tracking and Status Monitoring'), () => {
    it(_'should track notification delivery',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.trackDelivery('notification-123');

      expect(result.success).toBe(true);
      expect(result.data.notificationId).toBe('notification-123');
      expect(result.data.deliveryStatus).toBeDefined();
      expect(result.data.deliveryAttempts).toBeGreaterThanOrEqual(0);
      expect(result.data.lastAttempt).toBeDefined();
      expect(result.data.nextRetry).toBeDefined();
    });

    it(_'should retry failed notification',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.retryNotification('notification-123', {
        reason: 'Temporary delivery failure',
        maxRetries: 3,
        retryDelay: 300, // 5 minutes
        escalateAfter: 3,
      });

      expect(result.success).toBe(true);
      expect(result.data.notificationId).toBe('notification-123');
      expect(result.data.retryScheduled).toBe(true);
      expect(result.data.nextRetryAt).toBeDefined();
      expect(result.data.remainingRetries).toBeLessThanOrEqual(3);
    });

    it(_'should get delivery statistics',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.getDeliveryStatistics({
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        channels: ['email', 'sms', 'whatsapp'],
        groupBy: 'channel',
      });

      expect(result.success).toBe(true);
      expect(result.data.totalSent).toBeGreaterThanOrEqual(0);
      expect(result.data.totalDelivered).toBeGreaterThanOrEqual(0);
      expect(result.data.deliveryRate).toBeGreaterThanOrEqual(0);
      expect(result.data.byChannel).toBeDefined();
    });

    it(_'should update notification status',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.updateNotificationStatus(
        'notification-123',
        {
          status: 'delivered',
          deliveredAt: new Date(),
          providerResponse: {
            messageId: 'msg-456',
            status: 'delivered',
            timestamp: new Date(),
          },
          metadata: {
            deliveryTime: 1500, // ms
            provider: 'twilio',
          },
        },
      );

      expect(result.success).toBe(true);
      expect(result.data.notificationId).toBe('notification-123');
      expect(result.data.status).toBe('delivered');
      expect(result.data.deliveredAt).toBeDefined();
      expect(result.data.updated).toBe(true);
    });
  });

  describe(_'Priority-based Queuing and Rate Limiting'), () => {
    it(_'should queue high priority notification',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.queueNotification({
        recipientId: 'patient-123',
        channel: 'sms',
        templateId: 'emergency_alert',
        priority: 'critical',
        data: {
          alertType: 'Emergência Médica',
          message: 'Procure atendimento médico imediatamente',
        },
        bypassRateLimit: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.queuePosition).toBe(1); // Critical priority goes first
      expect(result.data.estimatedDelivery).toBeDefined();
      expect(result.data.rateLimitBypassed).toBe(true);
    });

    it(_'should apply rate limiting',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.checkRateLimit({
        recipientId: 'patient-123',
        channel: 'sms',
        timeWindow: '1 hour',
      });

      expect(result.success).toBe(true);
      expect(result.data.allowed).toBeDefined();
      expect(result.data.remaining).toBeGreaterThanOrEqual(0);
      expect(result.data.resetTime).toBeDefined();
      expect(result.data.currentCount).toBeGreaterThanOrEqual(0);
    });

    it(_'should process notification queue',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.processNotificationQueue({
        batchSize: 10,
        priorityOrder: ['critical', 'high', 'medium', 'low'],
        respectRateLimits: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.processed).toBeGreaterThanOrEqual(0);
      expect(result.data.failed).toBeGreaterThanOrEqual(0);
      expect(result.data.remaining).toBeGreaterThanOrEqual(0);
      expect(result.data.nextProcessAt).toBeDefined();
    });

    it(_'should get queue status',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.getQueueStatus();

      expect(result.success).toBe(true);
      expect(result.data.totalQueued).toBeGreaterThanOrEqual(0);
      expect(result.data.byPriority).toBeDefined();
      expect(result.data.byChannel).toBeDefined();
      expect(result.data.processingRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe(_'Integration with Existing Data Models'), () => {
    it(_'should integrate with Patient model',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.sendPatientNotification({
        patientId: 'patient-123',
        notificationType: 'appointment_reminder',
        appointmentId: 'appointment-456',
        preferredChannels: ['email', 'sms'],
        urgency: 'high',
      });

      expect(result.success).toBe(true);
      expect(result.data.patientId).toBe('patient-123');
      expect(result.data.channelsUsed).toContain('email');
      expect(result.data.lgpdValidated).toBe(true);
      expect(result.data.auditLogged).toBe(true);
    });

    it(_'should validate LGPD consent before sending',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.validateLGPDConsent({
        patientId: 'patient-123',
        channel: 'email',
        purpose: 'marketing',
        dataCategories: ['personal_data', 'contact_data'],
      });

      expect(result.success).toBe(true);
      expect(result.data.consentValid).toBeDefined();
      expect(result.data.legalBasis).toBeDefined();
      expect(result.data.consentDate).toBeDefined();
      expect(result.data.canSend).toBeDefined();
    });

    it(_'should log notification to audit trail',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.logNotificationToAudit({
        notificationId: 'notification-123',
        recipientId: 'patient-123',
        channel: 'email',
        templateId: 'appointment_reminder',
        status: 'delivered',
        auditContext: {
          _userId: 'system',
          action: 'notification_sent',
          ipAddress: '127.0.0.1',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data.auditId).toBeDefined();
      expect(result.data.logged).toBe(true);
      expect(result.data.complianceFlags).toContain('notification_delivery');
    });

    it(_'should sync with notification preferences',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.syncNotificationPreferences('patient-123');

      expect(result.success).toBe(true);
      expect(result.data.patientId).toBe('patient-123');
      expect(result.data.preferences).toBeDefined();
      expect(result.data.enabledChannels).toBeDefined();
      expect(result.data.lastSynced).toBeDefined();
    });
  });

  describe(_'Database Integration'), () => {
    it(_'should handle database connection errors gracefully',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.sendNotification({
        recipientId: 'patient-123',
        channel: 'email',
        templateId: 'test_template',
        data: { test: 'data' },
        simulateDbError: true,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Erro de conexão com banco de dados');
    });

    it(_'should validate database schema',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.validateDatabaseSchema();

      expect(result.success).toBe(true);
      expect(result.data.schemaValid).toBe(true);
      expect(result.data.tablesExist).toBeDefined();
      expect(result.data.indexesOptimal).toBeDefined();
    });

    it(_'should perform database maintenance',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.performDatabaseMaintenance({
        operation: 'cleanup_old_notifications',
        retentionDays: 90,
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.data.recordsToDelete).toBeGreaterThanOrEqual(0);
      expect(result.data.spaceToReclaim).toBeDefined();
    });
  });

  describe(_'Error Handling and Validation'), () => {
    it(_'should handle invalid notification parameters',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const result = await service.sendNotification({
        recipientId: '',
        channel: '',
        templateId: '',
        data: {},
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it(_'should validate service configuration',async () => {
      const { NotificationService } = await import('../notification-service');
      const service = new NotificationService();

      const config = service.getServiceConfiguration();

      expect(config.databaseConnection).toBeDefined();
      expect(config.supportedChannels).toBeDefined();
      expect(config.rateLimits).toBeDefined();
      expect(config.templateEngine).toBeDefined();
      expect(config.complianceSettings).toBeDefined();
    });
  });
});
