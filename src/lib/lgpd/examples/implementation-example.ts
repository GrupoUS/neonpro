/**
 * LGPD Compliance Automation System - Implementation Example
 * Story 1.5: LGPD Compliance Automation
 * 
 * Este arquivo demonstra como implementar o sistema LGPD
 * em uma aplicação real do NeonPro.
 */

import { LGPDComplianceSystem } from '../index';
import { createLGPDSupabaseClient } from '../database/supabase-config';
import type { 
  ConsentRecord, 
  DataSubjectRequest, 
  BreachIncident,
  RetentionPolicy,
  LGPDAssessment 
} from '../types';

// =====================================================
// CONFIGURAÇÃO INICIAL
// =====================================================

/**
 * Exemplo de configuração inicial do sistema LGPD
 */
export async function initializeLGPDSystem(clinicId: string) {
  try {
    // 1. Criar cliente Supabase
    const supabase = createLGPDSupabaseClient();
    
    // 2. Configurar sistema LGPD
    const lgpdSystem = new LGPDComplianceSystem({
      supabase,
      clinicId,
      enableMonitoring: true,
      enableAuditLogging: true,
      config: {
        monitoring: {
          interval: 60000, // 1 minuto
          alertThresholds: {
            consentExpiration: 30, // 30 dias antes do vencimento
            dsrOverdue: 15, // 15 dias de atraso
            complianceScore: 85 // score mínimo de 85%
          }
        },
        auditLogging: {
          logLevel: 'info',
          retentionDays: 2555 // 7 anos conforme LGPD
        },
        breachDetection: {
          rules: {
            multipleFailedLogins: {
              threshold: 5,
              timeWindow: 300000 // 5 minutos
            },
            massDataExport: {
              threshold: 1000,
              timeWindow: 3600000 // 1 hora
            }
          }
        }
      }
    });
    
    // 3. Inicializar sistema
    await lgpdSystem.initialize();
    
    // 4. Configurar event listeners
    setupEventListeners(lgpdSystem);
    
    console.log('✅ Sistema LGPD inicializado com sucesso');
    return lgpdSystem;
    
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema LGPD:', error);
    throw error;
  }
}

/**
 * Configuração de event listeners para monitoramento
 */
function setupEventListeners(lgpdSystem: LGPDComplianceSystem) {
  // Consentimentos
  lgpdSystem.eventEmitter.on('consent.collected', (consent: ConsentRecord) => {
    console.log(`📝 Novo consentimento coletado: ${consent.consentType}`);
    // Enviar notificação para equipe de compliance
  });
  
  lgpdSystem.eventEmitter.on('consent.withdrawn', (consent: ConsentRecord) => {
    console.log(`🚫 Consentimento retirado: ${consent.consentType}`);
    // Iniciar processo de exclusão de dados se necessário
  });
  
  lgpdSystem.eventEmitter.on('consent.expired', (consent: ConsentRecord) => {
    console.log(`⏰ Consentimento expirado: ${consent.consentType}`);
    // Solicitar renovação do consentimento
  });
  
  // Direitos do titular
  lgpdSystem.eventEmitter.on('dsr.submitted', (request: DataSubjectRequest) => {
    console.log(`📨 Nova solicitação DSR: ${request.requestType}`);
    // Notificar equipe responsável
  });
  
  lgpdSystem.eventEmitter.on('dsr.overdue', (request: DataSubjectRequest) => {
    console.log(`⚠️ Solicitação DSR em atraso: ${request.id}`);
    // Escalar para supervisão
  });
  
  // Violações de dados
  lgpdSystem.eventEmitter.on('breach.detected', (incident: BreachIncident) => {
    console.log(`🚨 Violação detectada: ${incident.incidentType}`);
    // Notificação urgente para DPO
    if (incident.severity === 'critical') {
      // Iniciar protocolo de emergência
    }
  });
  
  // Alertas de conformidade
  lgpdSystem.eventEmitter.on('compliance.alert', (alert) => {
    console.log(`📊 Alerta de conformidade: ${alert.alertType}`);
    // Dashboard de conformidade
  });
}

// =====================================================
// EXEMPLOS DE USO - CONSENTIMENTOS
// =====================================================

/**
 * Exemplo: Coletar consentimento durante cadastro de paciente
 */
export async function collectPatientConsent(
  lgpdSystem: LGPDComplianceSystem,
  patientId: string,
  consentData: {
    treatmentConsent: boolean;
    marketingConsent: boolean;
    dataProcessingConsent: boolean;
  }
) {
  try {
    const consents: ConsentRecord[] = [];
    
    // Consentimento para tratamento médico (obrigatório)
    if (consentData.treatmentConsent) {
      const treatmentConsent = await lgpdSystem.consentManager.collectConsent({
        dataSubjectId: patientId,
        consentType: 'medical_treatment',
        processingPurpose: 'Prestação de cuidados médicos e manutenção de prontuário',
        dataCategories: ['health_data', 'personal_data'],
        legalBasis: 'consent',
        collectionContext: {
          channel: 'patient_registration',
          location: 'clinic_system',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          userAgent: 'NeonPro/1.0'
        },
        consentEvidence: {
          method: 'digital_signature',
          documentVersion: '1.0',
          witnessId: 'staff-123'
        }
      });
      consents.push(treatmentConsent);
    }
    
    // Consentimento para marketing (opcional)
    if (consentData.marketingConsent) {
      const marketingConsent = await lgpdSystem.consentManager.collectConsent({
        dataSubjectId: patientId,
        consentType: 'marketing_communications',
        processingPurpose: 'Envio de comunicações promocionais e informativos de saúde',
        dataCategories: ['contact_data', 'preference_data'],
        legalBasis: 'consent',
        collectionContext: {
          channel: 'patient_registration',
          location: 'marketing_section'
        }
      });
      consents.push(marketingConsent);
    }
    
    // Consentimento para processamento de dados (analytics)
    if (consentData.dataProcessingConsent) {
      const analyticsConsent = await lgpdSystem.consentManager.collectConsent({
        dataSubjectId: patientId,
        consentType: 'data_analytics',
        processingPurpose: 'Análise de dados para melhoria dos serviços médicos',
        dataCategories: ['usage_data', 'anonymized_health_data'],
        legalBasis: 'consent',
        collectionContext: {
          channel: 'patient_registration',
          location: 'analytics_section'
        }
      });
      consents.push(analyticsConsent);
    }
    
    console.log(`✅ ${consents.length} consentimentos coletados para paciente ${patientId}`);
    return consents;
    
  } catch (error) {
    console.error('❌ Erro ao coletar consentimentos:', error);
    throw error;
  }
}

/**
 * Exemplo: Verificar consentimentos antes de processar dados
 */
export async function checkConsentBeforeProcessing(
  lgpdSystem: LGPDComplianceSystem,
  patientId: string,
  processingPurpose: string
): Promise<boolean> {
  try {
    const consentMap = {
      'medical_treatment': 'medical_treatment',
      'marketing_email': 'marketing_communications',
      'data_analytics': 'data_analytics',
      'telemedicine': 'telemedicine_services'
    };
    
    const consentType = consentMap[processingPurpose as keyof typeof consentMap];
    
    if (!consentType) {
      console.warn(`⚠️ Tipo de consentimento não mapeado: ${processingPurpose}`);
      return false;
    }
    
    const status = await lgpdSystem.consentManager.getConsentStatus(
      patientId,
      consentType
    );
    
    const isValid = status.isValid && status.status === 'active';
    
    if (!isValid) {
      console.log(`🚫 Consentimento inválido para ${processingPurpose}: ${status.status}`);
      
      // Se expirado, solicitar renovação
      if (status.status === 'expired') {
        await requestConsentRenewal(lgpdSystem, patientId, consentType);
      }
    }
    
    return isValid;
    
  } catch (error) {
    console.error('❌ Erro ao verificar consentimento:', error);
    return false;
  }
}

/**
 * Exemplo: Solicitar renovação de consentimento
 */
async function requestConsentRenewal(
  lgpdSystem: LGPDComplianceSystem,
  patientId: string,
  consentType: string
) {
  try {
    // Agendar renovação
    await lgpdSystem.consentManager.scheduleConsentRenewal(
      patientId,
      consentType,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    );
    
    // Enviar notificação para o paciente
    console.log(`📧 Solicitação de renovação enviada para paciente ${patientId}`);
    
    // Aqui você integraria com sistema de email/SMS
    // await sendConsentRenewalNotification(patientId, consentType);
    
  } catch (error) {
    console.error('❌ Erro ao solicitar renovação:', error);
  }
}

// =====================================================
// EXEMPLOS DE USO - DIREITOS DO TITULAR
// =====================================================

/**
 * Exemplo: Processar solicitação de acesso aos dados
 */
export async function handleDataAccessRequest(
  lgpdSystem: LGPDComplianceSystem,
  patientId: string,
  requestDetails: {
    email: string;
    specificData?: string[];
    reason?: string;
  }
) {
  try {
    // 1. Submeter solicitação
    const request = await lgpdSystem.dataSubjectRights.submitRequest({
      dataSubjectId: patientId,
      requestType: 'access',
      description: requestDetails.reason || 'Solicitação de acesso aos dados pessoais',
      specificDataRequested: requestDetails.specificData || [
        'personal_info',
        'medical_records',
        'appointment_history',
        'consent_records'
      ],
      contactInfo: {
        email: requestDetails.email
      }
    });
    
    console.log(`📨 Solicitação de acesso criada: ${request.id}`);
    
    // 2. Processar automaticamente se possível
    const accessData = await lgpdSystem.dataSubjectRights.processAccessRequest(
      request.id
    );
    
    console.log(`✅ Dados de acesso preparados para paciente ${patientId}`);
    
    // 3. Enviar dados para o paciente (implementar integração)
    // await sendDataAccessResponse(requestDetails.email, accessData);
    
    return { request, accessData };
    
  } catch (error) {
    console.error('❌ Erro ao processar solicitação de acesso:', error);
    throw error;
  }
}

/**
 * Exemplo: Processar solicitação de exclusão de dados
 */
export async function handleDataErasureRequest(
  lgpdSystem: LGPDComplianceSystem,
  patientId: string,
  reason: string
) {
  try {
    // 1. Submeter solicitação
    const request = await lgpdSystem.dataSubjectRights.submitRequest({
      dataSubjectId: patientId,
      requestType: 'erasure',
      description: `Solicitação de exclusão: ${reason}`,
      legalBasisForProcessing: 'consent'
    });
    
    console.log(`🗑️ Solicitação de exclusão criada: ${request.id}`);
    
    // 2. Verificar se exclusão é possível
    const canErase = await checkErasureEligibility(lgpdSystem, patientId);
    
    if (!canErase.eligible) {
      console.log(`⚠️ Exclusão não permitida: ${canErase.reason}`);
      
      // Atualizar solicitação com rejeição
      await lgpdSystem.dataSubjectRights.updateRequestStatus(
        request.id,
        'rejected',
        canErase.reason
      );
      
      return { request, status: 'rejected', reason: canErase.reason };
    }
    
    // 3. Processar exclusão
    const erasureResult = await lgpdSystem.dataSubjectRights.processErasureRequest(
      request.id,
      {
        verifyLegalBasis: true,
        checkRetentionRequirements: true,
        notifyThirdParties: true
      }
    );
    
    console.log(`✅ Exclusão processada para paciente ${patientId}`);
    
    return { request, status: 'completed', result: erasureResult };
    
  } catch (error) {
    console.error('❌ Erro ao processar exclusão:', error);
    throw error;
  }
}

/**
 * Verificar elegibilidade para exclusão de dados
 */
async function checkErasureEligibility(
  lgpdSystem: LGPDComplianceSystem,
  patientId: string
): Promise<{ eligible: boolean; reason?: string }> {
  try {
    // Verificar se há obrigações legais de retenção
    const retentionPolicies = await lgpdSystem.dataRetention.getRetentionPolicies({
      dataCategory: 'health_data'
    });
    
    const medicalRetention = retentionPolicies.find(
      p => p.legalBasis === 'legal_obligation' && p.processingPurpose === 'medical_care'
    );
    
    if (medicalRetention) {
      // Verificar se ainda está dentro do período de retenção obrigatória
      const patientCreatedAt = await getPatientCreationDate(patientId);
      const retentionEndDate = new Date(
        patientCreatedAt.getTime() + (medicalRetention.retentionPeriodMonths * 30 * 24 * 60 * 60 * 1000)
      );
      
      if (new Date() < retentionEndDate) {
        return {
          eligible: false,
          reason: `Dados médicos devem ser mantidos até ${retentionEndDate.toLocaleDateString()} conforme CFM`
        };
      }
    }
    
    // Verificar se há processos legais em andamento
    const hasLegalProceedings = await checkLegalProceedings(patientId);
    if (hasLegalProceedings) {
      return {
        eligible: false,
        reason: 'Dados não podem ser excluídos devido a processos legais em andamento'
      };
    }
    
    return { eligible: true };
    
  } catch (error) {
    console.error('❌ Erro ao verificar elegibilidade:', error);
    return {
      eligible: false,
      reason: 'Erro interno ao verificar elegibilidade para exclusão'
    };
  }
}

// =====================================================
// EXEMPLOS DE USO - MONITORAMENTO E ALERTAS
// =====================================================

/**
 * Exemplo: Configurar dashboard de conformidade
 */
export async function setupComplianceDashboard(
  lgpdSystem: LGPDComplianceSystem
) {
  try {
    // 1. Obter métricas atuais
    const metrics = await lgpdSystem.complianceMonitor.getComplianceMetrics();
    
    console.log('📊 Métricas de Conformidade:');
    console.log(`- Score Geral: ${metrics.overallScore}%`);
    console.log(`- Consentimentos Ativos: ${metrics.activeConsents}`);
    console.log(`- Solicitações DSR Pendentes: ${metrics.pendingDSRRequests}`);
    console.log(`- Alertas Ativos: ${metrics.activeAlerts}`);
    
    // 2. Verificar alertas críticos
    const criticalAlerts = await lgpdSystem.complianceMonitor.getActiveAlerts({
      severity: 'critical'
    });
    
    if (criticalAlerts.length > 0) {
      console.log('🚨 Alertas Críticos:');
      criticalAlerts.forEach(alert => {
        console.log(`- ${alert.title}: ${alert.description}`);
      });
    }
    
    // 3. Gerar relatório de conformidade
    const report = await lgpdSystem.complianceMonitor.generateComplianceReport({
      period: 'monthly',
      includeRecommendations: true,
      includeMetrics: true
    });
    
    console.log('📋 Relatório de conformidade gerado');
    
    return {
      metrics,
      criticalAlerts,
      report
    };
    
  } catch (error) {
    console.error('❌ Erro ao configurar dashboard:', error);
    throw error;
  }
}

/**
 * Exemplo: Configurar políticas de retenção automática
 */
export async function setupAutomaticRetention(
  lgpdSystem: LGPDComplianceSystem
) {
  try {
    // Política para dados médicos (CFM - 20 anos)
    const medicalPolicy = await lgpdSystem.dataRetention.createRetentionPolicy({
      policyName: 'Prontuários Médicos - CFM',
      dataCategory: 'health_data',
      retentionPeriodMonths: 240, // 20 anos
      legalBasis: 'legal_obligation',
      processingPurpose: 'medical_care',
      retentionAction: 'archive',
      policyRules: {
        exceptions: [
          'ongoing_treatment',
          'legal_proceedings',
          'research_consent'
        ],
        archiveLocation: 'secure_archive',
        encryptionRequired: true
      }
    });
    
    // Política para dados de marketing (2 anos)
    const marketingPolicy = await lgpdSystem.dataRetention.createRetentionPolicy({
      policyName: 'Dados de Marketing',
      dataCategory: 'marketing_data',
      retentionPeriodMonths: 24, // 2 anos
      legalBasis: 'consent',
      processingPurpose: 'marketing',
      retentionAction: 'delete',
      policyRules: {
        autoExecute: true,
        notifyBeforeDeletion: true,
        gracePeriodDays: 30
      }
    });
    
    // Política para logs de auditoria (7 anos)
    const auditPolicy = await lgpdSystem.dataRetention.createRetentionPolicy({
      policyName: 'Logs de Auditoria - LGPD',
      dataCategory: 'audit_logs',
      retentionPeriodMonths: 84, // 7 anos
      legalBasis: 'legal_obligation',
      processingPurpose: 'compliance_monitoring',
      retentionAction: 'archive',
      policyRules: {
        compressionEnabled: true,
        readOnlyAfterMonths: 12
      }
    });
    
    console.log('✅ Políticas de retenção configuradas:');
    console.log(`- ${medicalPolicy.policyName}`);
    console.log(`- ${marketingPolicy.policyName}`);
    console.log(`- ${auditPolicy.policyName}`);
    
    // Iniciar monitoramento de retenção
    await lgpdSystem.dataRetention.startRetentionMonitoring();
    
    return {
      medicalPolicy,
      marketingPolicy,
      auditPolicy
    };
    
  } catch (error) {
    console.error('❌ Erro ao configurar retenção:', error);
    throw error;
  }
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

/**
 * Simula obtenção da data de criação do paciente
 */
async function getPatientCreationDate(patientId: string): Promise<Date> {
  // Implementar consulta real ao banco de dados
  // const { data } = await supabase
  //   .from('patients')
  //   .select('created_at')
  //   .eq('id', patientId)
  //   .single();
  // return new Date(data.created_at);
  
  // Simulação para exemplo
  return new Date('2023-01-01');
}

/**
 * Simula verificação de processos legais
 */
async function checkLegalProceedings(patientId: string): Promise<boolean> {
  // Implementar verificação real
  // const { data } = await supabase
  //   .from('legal_proceedings')
  //   .select('id')
  //   .eq('patient_id', patientId)
  //   .eq('status', 'active');
  // return data && data.length > 0;
  
  // Simulação para exemplo
  return false;
}

/**
 * Exemplo de uso completo do sistema
 */
export async function fullLGPDImplementationExample() {
  const clinicId = 'clinic-123';
  const patientId = 'patient-456';
  
  try {
    console.log('🚀 Iniciando exemplo completo do sistema LGPD...');
    
    // 1. Inicializar sistema
    const lgpdSystem = await initializeLGPDSystem(clinicId);
    
    // 2. Coletar consentimentos
    await collectPatientConsent(lgpdSystem, patientId, {
      treatmentConsent: true,
      marketingConsent: true,
      dataProcessingConsent: false
    });
    
    // 3. Verificar consentimento antes de processar
    const canProcess = await checkConsentBeforeProcessing(
      lgpdSystem,
      patientId,
      'medical_treatment'
    );
    
    if (canProcess) {
      console.log('✅ Processamento autorizado');
    }
    
    // 4. Configurar políticas de retenção
    await setupAutomaticRetention(lgpdSystem);
    
    // 5. Configurar dashboard
    await setupComplianceDashboard(lgpdSystem);
    
    // 6. Simular solicitação de acesso
    await handleDataAccessRequest(lgpdSystem, patientId, {
      email: 'paciente@email.com',
      reason: 'Solicitação de cópia dos dados pessoais'
    });
    
    console.log('✅ Exemplo completo executado com sucesso!');
    
    return lgpdSystem;
    
  } catch (error) {
    console.error('❌ Erro no exemplo completo:', error);
    throw error;
  }
}

// Export para uso em outros módulos
export {
  initializeLGPDSystem,
  setupEventListeners,
  collectPatientConsent,
  checkConsentBeforeProcessing,
  handleDataAccessRequest,
  handleDataErasureRequest,
  setupComplianceDashboard,
  setupAutomaticRetention
};