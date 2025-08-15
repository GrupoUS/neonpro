/**
 * LGPD Automation System - Exemplo Prático de Implementação
 *
 * Este arquivo demonstra como implementar e usar o sistema de automação LGPD
 * em uma aplicação real, incluindo configuração, inicialização e uso dos módulos.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { LGPDComplianceManager } from '../LGPDComplianceManager';
import {
  getLGPDAutomationConfig,
  type LGPDAutomationConfig,
  LGPDAutomationOrchestrator,
} from './index';

// Configuração do ambiente
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const ENVIRONMENT =
  (process.env.NODE_ENV as 'development' | 'production') || 'development';

/**
 * Classe principal para gerenciar a automação LGPD na aplicação
 */
export class LGPDAutomationService {
  private readonly supabase: ReturnType<typeof createClient<Database>>;
  private readonly complianceManager: LGPDComplianceManager;
  private readonly orchestrator: LGPDAutomationOrchestrator;
  private readonly isInitialized = false;

  constructor() {
    // Inicializar cliente Supabase
    this.supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Inicializar gerenciador de conformidade
    this.complianceManager = new LGPDComplianceManager(this.supabase);
  }

  /**
   * Inicializar o sistema de automação LGPD
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando sistema de automação LGPD...');

      // Obter configuração baseada no ambiente
      const config = this.getEnvironmentConfig();

      // Criar orquestrador
      this.orchestrator = new LGPDAutomationOrchestrator(
        this.supabase,
        this.complianceManager,
        config
      );

      // Configurar callbacks de monitoramento
      this.setupMonitoringCallbacks();

      // Iniciar todos os módulos de automação
      const result = await this.orchestrator.startAllAutomation();

      if (result.success) {
        console.log('✅ Sistema de automação LGPD iniciado com sucesso!');
        console.log('📊 Módulos iniciados:', result.started_modules);
      } else {
        console.warn('⚠️ Alguns módulos falharam ao iniciar:');
        console.log('✅ Iniciados:', result.started_modules);
        console.log('❌ Falharam:', result.failed_modules);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Erro ao inicializar sistema de automação LGPD:', error);
      throw error;
    }
  }

  /**
   * Parar o sistema de automação
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    try {
      console.log('🛑 Parando sistema de automação LGPD...');

      const result = await this.orchestrator.stopAllAutomation();

      console.log('✅ Sistema parado com sucesso!');
      console.log('📊 Módulos parados:', result.stopped_modules);

      this.isInitialized = false;
    } catch (error) {
      console.error('❌ Erro ao parar sistema de automação LGPD:', error);
      throw error;
    }
  }

  /**
   * Obter configuração baseada no ambiente
   */
  private getEnvironmentConfig(): LGPDAutomationConfig {
    const baseConfig = getLGPDAutomationConfig(ENVIRONMENT);

    // Personalizar configuração se necessário
    if (ENVIRONMENT === 'production') {
      return {
        ...baseConfig,
        // Configurações específicas de produção
        breach_detection: {
          ...baseConfig.breach_detection,
          notification_settings: {
            ...baseConfig.breach_detection.notification_settings,
            anpd_notification_enabled: true, // Habilitar notificação ANPD em produção
          },
        },
      };
    }

    return baseConfig;
  }

  /**
   * Configurar callbacks de monitoramento
   */
  private setupMonitoringCallbacks(): void {
    // Callback para alertas
    this.orchestrator.onAlert((alert) => {
      console.log(
        `🚨 Alerta ${alert.alert_type.toUpperCase()}: ${alert.title}`
      );
      console.log(`📍 Módulo: ${alert.module}`);
      console.log(`📝 Mensagem: ${alert.message}`);

      // Enviar para sistema de monitoramento externo se necessário
      if (alert.alert_type === 'critical') {
        this.sendCriticalAlert(alert);
      }
    });

    // Callback para mudanças de status
    this.orchestrator.onStatusChange((statuses) => {
      const errorModules = statuses.filter((s) => s.status === 'error');
      if (errorModules.length > 0) {
        console.warn(
          '⚠️ Módulos com erro:',
          errorModules.map((m) => m.module)
        );
      }
    });
  }

  /**
   * Enviar alerta crítico para sistema de monitoramento
   */
  private async sendCriticalAlert(alert: any): Promise<void> {
    // Implementar integração com sistema de monitoramento
    // (ex: Slack, Discord, email, etc.)
    console.log('🚨 ALERTA CRÍTICO - Enviando notificação...', alert);
  }

  /**
   * Obter dashboard de conformidade
   */
  async getDashboard() {
    if (!this.isInitialized) {
      throw new Error('Sistema não inicializado');
    }

    return await this.orchestrator.getUnifiedDashboard();
  }

  /**
   * Obter métricas de automação
   */
  async getMetrics() {
    if (!this.isInitialized) {
      throw new Error('Sistema não inicializado');
    }

    return await this.orchestrator.getAutomationMetrics();
  }

  /**
   * Obter módulos para uso direto
   */
  getModules() {
    if (!this.isInitialized) {
      throw new Error('Sistema não inicializado');
    }

    return this.orchestrator.getModules();
  }
}

// Instância singleton do serviço
let lgpdService: LGPDAutomationService | null = null;

/**
 * Obter instância singleton do serviço LGPD
 */
export function getLGPDService(): LGPDAutomationService {
  if (!lgpdService) {
    lgpdService = new LGPDAutomationService();
  }
  return lgpdService;
}

/**
 * Exemplos de uso dos módulos de automação
 */
export class LGPDUsageExamples {
  private readonly service: LGPDAutomationService;

  constructor() {
    this.service = getLGPDService();
  }

  /**
   * Exemplo: Coletar consentimento de usuário
   */
  async collectUserConsent(
    userId: string,
    purpose: string,
    ipAddress: string,
    userAgent: string
  ) {
    const modules = this.service.getModules();

    try {
      const consent =
        await modules.consentAutomation.collectConsentWithTracking({
          user_id: userId,
          purpose: purpose as any,
          consent_given: true,
          collection_method: 'web_form',
          ip_address: ipAddress,
          user_agent: userAgent,
          consent_text: `Eu concordo com o uso dos meus dados para ${purpose}`,
          legal_basis: 'consent',
          data_categories: ['personal', 'contact'],
          retention_period_months: 24,
          third_party_sharing: false,
        });

      console.log('✅ Consentimento coletado:', consent.consent_id);
      return consent;
    } catch (error) {
      console.error('❌ Erro ao coletar consentimento:', error);
      throw error;
    }
  }

  /**
   * Exemplo: Processar solicitação de acesso a dados
   */
  async processDataAccessRequest(userId: string, email: string) {
    const modules = this.service.getModules();

    try {
      const request = await modules.dataSubjectRights.processAccessRequest({
        user_id: userId,
        request_type: 'access',
        contact_email: email,
        identity_verified: true,
        requested_data_categories: ['personal', 'usage', 'preferences'],
        delivery_method: 'secure_download',
      });

      console.log('✅ Solicitação de acesso processada:', request.request_id);
      return request;
    } catch (error) {
      console.error('❌ Erro ao processar solicitação de acesso:', error);
      throw error;
    }
  }

  /**
   * Exemplo: Processar solicitação de exclusão de dados
   */
  async processDataDeletionRequest(userId: string, email: string) {
    const modules = this.service.getModules();

    try {
      const request = await modules.dataSubjectRights.processDeletionRequest({
        user_id: userId,
        request_type: 'deletion',
        contact_email: email,
        identity_verified: true,
        deletion_scope: 'all_data',
        reason: 'user_request',
      });

      console.log('✅ Solicitação de exclusão processada:', request.request_id);
      return request;
    } catch (error) {
      console.error('❌ Erro ao processar solicitação de exclusão:', error);
      throw error;
    }
  }

  /**
   * Exemplo: Criar política de retenção de dados
   */
  async createRetentionPolicy(tableName: string, retentionMonths: number) {
    const modules = this.service.getModules();

    try {
      const policy = await modules.dataRetention.createRetentionPolicy({
        name: `Política ${tableName}`,
        description: `Retenção automática para tabela ${tableName}`,
        table_name: tableName,
        retention_period_months: retentionMonths,
        retention_type: 'soft_delete',
        conditions: {
          date_column: 'created_at',
          additional_conditions: [],
        },
        approval_required: true,
        backup_before_deletion: true,
        notification_before_days: 7,
      });

      console.log('✅ Política de retenção criada:', policy.policy_id);
      return policy;
    } catch (error) {
      console.error('❌ Erro ao criar política de retenção:', error);
      throw error;
    }
  }

  /**
   * Exemplo: Registrar fornecedor terceiro
   */
  async registerThirdPartyProvider(providerData: any) {
    const modules = this.service.getModules();

    try {
      const provider = await modules.thirdPartyCompliance.registerProvider({
        name: providerData.name,
        contact_email: providerData.email,
        data_processing_agreement_url: providerData.agreementUrl,
        data_categories_shared: providerData.dataCategories,
        processing_purposes: providerData.purposes,
        data_retention_period_months: providerData.retentionMonths,
        international_transfer: providerData.internationalTransfer,
        adequacy_decision: providerData.adequacyDecision,
        safeguards_implemented: providerData.safeguards || [],
        compliance_certifications: providerData.certifications || [],
      });

      console.log('✅ Fornecedor registrado:', provider.provider_id);
      return provider;
    } catch (error) {
      console.error('❌ Erro ao registrar fornecedor:', error);
      throw error;
    }
  }

  /**
   * Exemplo: Gerar relatório de conformidade
   */
  async generateComplianceReport(
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  ) {
    const modules = this.service.getModules();

    try {
      const report = await modules.auditReporting.generateComplianceReport({
        report_type: reportType,
        include_metrics: true,
        include_incidents: true,
        include_requests: true,
        include_consents: true,
        format: 'pdf',
        language: 'pt-BR',
      });

      console.log('✅ Relatório gerado:', report.report_id);
      return report;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      throw error;
    }
  }
}

/**
 * Exemplo de inicialização em uma aplicação Next.js
 */
export async function initializeLGPDInNextJS() {
  const service = getLGPDService();

  try {
    await service.initialize();

    // Configurar shutdown graceful
    process.on('SIGTERM', async () => {
      console.log('📡 Recebido SIGTERM, parando sistema LGPD...');
      await service.shutdown();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('📡 Recebido SIGINT, parando sistema LGPD...');
      await service.shutdown();
      process.exit(0);
    });

    return service;
  } catch (error) {
    console.error('❌ Falha ao inicializar LGPD:', error);
    throw error;
  }
}

/**
 * Exemplo de uso em API Routes do Next.js
 */
export const lgpdApiExamples = {
  // POST /api/lgpd/consent
  async collectConsent(req: any, res: any) {
    try {
      const { userId, purpose, ipAddress, userAgent } = req.body;

      const examples = new LGPDUsageExamples();
      const consent = await examples.collectUserConsent(
        userId,
        purpose,
        ipAddress,
        userAgent
      );

      res.status(200).json({ success: true, consent });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // POST /api/lgpd/data-request
  async handleDataRequest(req: any, res: any) {
    try {
      const { userId, email, requestType } = req.body;

      const examples = new LGPDUsageExamples();

      let result;
      if (requestType === 'access') {
        result = await examples.processDataAccessRequest(userId, email);
      } else if (requestType === 'deletion') {
        result = await examples.processDataDeletionRequest(userId, email);
      } else {
        throw new Error('Tipo de solicitação inválido');
      }

      res.status(200).json({ success: true, request: result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/lgpd/dashboard
  async getDashboard(_req: any, res: any) {
    try {
      const service = getLGPDService();
      const dashboard = await service.getDashboard();

      res.status(200).json({ success: true, dashboard });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/lgpd/metrics
  async getMetrics(_req: any, res: any) {
    try {
      const service = getLGPDService();
      const metrics = await service.getMetrics();

      res.status(200).json({ success: true, metrics });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

/**
 * Exemplo de middleware para verificação de consentimento
 */
export function lgpdConsentMiddleware(requiredPurpose: string) {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id; // Assumindo que o usuário está autenticado

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const service = getLGPDService();
      const modules = service.getModules();

      // Verificar se o usuário tem consentimento válido
      const consents = await modules.consentAutomation.getConsents({
        user_id: userId,
        purpose: requiredPurpose as any,
        active_only: true,
      });

      if (consents.consents.length === 0) {
        return res.status(403).json({
          error: 'Consentimento necessário',
          required_purpose: requiredPurpose,
          consent_url: `/consent?purpose=${requiredPurpose}`,
        });
      }

      // Adicionar informações de consentimento ao request
      req.lgpd = {
        consents: consents.consents,
        purpose: requiredPurpose,
      };

      next();
    } catch (error) {
      console.error('Erro no middleware LGPD:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}

// Exportar instância singleton
export default getLGPDService;
