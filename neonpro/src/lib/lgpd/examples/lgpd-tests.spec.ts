/**
 * LGPD Compliance Automation System - Unit Tests
 * Story 1.5: LGPD Compliance Automation
 * 
 * Testes unitários para validar o funcionamento do sistema LGPD
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LGPDComplianceSystem } from '../index';
import { createLGPDSupabaseClient } from '../database/supabase-config';
import type { ConsentRecord, DataSubjectRequest } from '../types';

// Mock do Supabase
vi.mock('../database/supabase-config', () => ({
  createLGPDSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      then: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
}));

describe('LGPD Compliance System', () => {
  let lgpdSystem: LGPDComplianceSystem;
  const mockClinicId = 'test-clinic-123';
  const mockPatientId = 'test-patient-456';

  beforeEach(async () => {
    const supabase = createLGPDSupabaseClient();
    lgpdSystem = new LGPDComplianceSystem({
      supabase,
      clinicId: mockClinicId,
      enableMonitoring: false, // Desabilitar para testes
      enableAuditLogging: true
    });
    
    await lgpdSystem.initialize();
  });

  afterEach(async () => {
    await lgpdSystem.shutdown();
  });

  describe('Consent Manager', () => {
    it('should collect consent successfully', async () => {
      const consentData = {
        dataSubjectId: mockPatientId,
        consentType: 'medical_treatment',
        processingPurpose: 'Prestação de cuidados médicos',
        dataCategories: ['health_data', 'personal_data'],
        legalBasis: 'consent' as const,
        collectionContext: {
          channel: 'patient_registration',
          location: 'clinic_system',
          timestamp: new Date().toISOString()
        }
      };

      const consent = await lgpdSystem.consentManager.collectConsent(consentData);

      expect(consent).toBeDefined();
      expect(consent.dataSubjectId).toBe(mockPatientId);
      expect(consent.consentType).toBe('medical_treatment');
      expect(consent.status).toBe('active');
      expect(consent.isValid).toBe(true);
    });

    it('should validate consent status correctly', async () => {
      // Primeiro, coletar um consentimento
      await lgpdSystem.consentManager.collectConsent({
        dataSubjectId: mockPatientId,
        consentType: 'marketing_communications',
        processingPurpose: 'Marketing',
        dataCategories: ['contact_data'],
        legalBasis: 'consent'
      });

      // Verificar status
      const status = await lgpdSystem.consentManager.getConsentStatus(
        mockPatientId,
        'marketing_communications'
      );

      expect(status.isValid).toBe(true);
      expect(status.status).toBe('active');
    });

    it('should withdraw consent successfully', async () => {
      // Coletar consentimento
      const consent = await lgpdSystem.consentManager.collectConsent({
        dataSubjectId: mockPatientId,
        consentType: 'data_analytics',
        processingPurpose: 'Analytics',
        dataCategories: ['usage_data'],
        legalBasis: 'consent'
      });

      // Retirar consentimento
      const withdrawnConsent = await lgpdSystem.consentManager.withdrawConsent(
        consent.id,
        'Solicitação do titular'
      );

      expect(withdrawnConsent.status).toBe('withdrawn');
      expect(withdrawnConsent.withdrawalReason).toBe('Solicitação do titular');
    });

    it('should handle consent expiration', async () => {
      // Criar consentimento com data de expiração no passado
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const consent = await lgpdSystem.consentManager.collectConsent({
        dataSubjectId: mockPatientId,
        consentType: 'temporary_consent',
        processingPurpose: 'Teste',
        dataCategories: ['test_data'],
        legalBasis: 'consent',
        expirationDate: expiredDate
      });

      const status = await lgpdSystem.consentManager.getConsentStatus(
        mockPatientId,
        'temporary_consent'
      );

      expect(status.status).toBe('expired');
      expect(status.isValid).toBe(false);
    });
  });

  describe('Data Subject Rights', () => {
    it('should submit access request successfully', async () => {
      const requestData = {
        dataSubjectId: mockPatientId,
        requestType: 'access' as const,
        description: 'Solicitação de acesso aos dados',
        specificDataRequested: ['personal_info', 'medical_records'],
        contactInfo: {
          email: 'test@example.com'
        }
      };

      const request = await lgpdSystem.dataSubjectRights.submitRequest(requestData);

      expect(request).toBeDefined();
      expect(request.dataSubjectId).toBe(mockPatientId);
      expect(request.requestType).toBe('access');
      expect(request.status).toBe('pending');
    });

    it('should process access request', async () => {
      // Submeter solicitação
      const request = await lgpdSystem.dataSubjectRights.submitRequest({
        dataSubjectId: mockPatientId,
        requestType: 'access',
        description: 'Teste de acesso'
      });

      // Processar solicitação
      const accessData = await lgpdSystem.dataSubjectRights.processAccessRequest(
        request.id
      );

      expect(accessData).toBeDefined();
      expect(accessData.dataSubjectId).toBe(mockPatientId);
      expect(accessData.requestId).toBe(request.id);
    });

    it('should handle erasure request', async () => {
      const request = await lgpdSystem.dataSubjectRights.submitRequest({
        dataSubjectId: mockPatientId,
        requestType: 'erasure',
        description: 'Solicitação de exclusão',
        legalBasisForProcessing: 'consent'
      });

      const result = await lgpdSystem.dataSubjectRights.processErasureRequest(
        request.id,
        {
          verifyLegalBasis: true,
          checkRetentionRequirements: true
        }
      );

      expect(result).toBeDefined();
      expect(result.requestId).toBe(request.id);
    });

    it('should update request status', async () => {
      const request = await lgpdSystem.dataSubjectRights.submitRequest({
        dataSubjectId: mockPatientId,
        requestType: 'portability',
        description: 'Teste de portabilidade'
      });

      const updatedRequest = await lgpdSystem.dataSubjectRights.updateRequestStatus(
        request.id,
        'in_progress',
        'Processando solicitação'
      );

      expect(updatedRequest.status).toBe('in_progress');
      expect(updatedRequest.statusReason).toBe('Processando solicitação');
    });
  });

  describe('Compliance Monitor', () => {
    it('should get compliance metrics', async () => {
      const metrics = await lgpdSystem.complianceMonitor.getComplianceMetrics();

      expect(metrics).toBeDefined();
      expect(typeof metrics.overallScore).toBe('number');
      expect(metrics.overallScore).toBeGreaterThanOrEqual(0);
      expect(metrics.overallScore).toBeLessThanOrEqual(100);
      expect(typeof metrics.activeConsents).toBe('number');
      expect(typeof metrics.pendingDSRRequests).toBe('number');
    });

    it('should assess compliance', async () => {
      const assessment = await lgpdSystem.complianceMonitor.assessCompliance();

      expect(assessment).toBeDefined();
      expect(typeof assessment.score).toBe('number');
      expect(Array.isArray(assessment.issues)).toBe(true);
      expect(Array.isArray(assessment.recommendations)).toBe(true);
    });

    it('should generate compliance report', async () => {
      const report = await lgpdSystem.complianceMonitor.generateComplianceReport({
        period: 'monthly',
        includeMetrics: true,
        includeRecommendations: true
      });

      expect(report).toBeDefined();
      expect(report.period).toBe('monthly');
      expect(report.generatedAt).toBeDefined();
      expect(report.metrics).toBeDefined();
    });

    it('should create and resolve alerts', async () => {
      // Criar alerta
      const alert = await lgpdSystem.complianceMonitor.createAlert({
        alertType: 'consent_expiration',
        severity: 'medium',
        title: 'Consentimento próximo ao vencimento',
        description: 'Consentimento expira em 5 dias',
        relatedEntityId: mockPatientId,
        relatedEntityType: 'consent'
      });

      expect(alert).toBeDefined();
      expect(alert.alertType).toBe('consent_expiration');
      expect(alert.status).toBe('active');

      // Resolver alerta
      const resolvedAlert = await lgpdSystem.complianceMonitor.resolveAlert(
        alert.id,
        'Consentimento renovado'
      );

      expect(resolvedAlert.status).toBe('resolved');
      expect(resolvedAlert.resolution).toBe('Consentimento renovado');
    });
  });

  describe('Breach Detector', () => {
    it('should report breach incident', async () => {
      const incidentData = {
        incidentType: 'unauthorized_access',
        severity: 'high' as const,
        description: 'Tentativa de acesso não autorizado detectada',
        affectedDataSubjects: [mockPatientId],
        dataCategories: ['personal_data'],
        detectionMethod: 'automated_monitoring',
        potentialImpact: 'Possível exposição de dados pessoais'
      };

      const incident = await lgpdSystem.breachDetector.reportIncident(incidentData);

      expect(incident).toBeDefined();
      expect(incident.incidentType).toBe('unauthorized_access');
      expect(incident.severity).toBe('high');
      expect(incident.status).toBe('reported');
    });

    it('should update incident status', async () => {
      // Reportar incidente
      const incident = await lgpdSystem.breachDetector.reportIncident({
        incidentType: 'data_loss',
        severity: 'critical',
        description: 'Perda de dados detectada'
      });

      // Atualizar status
      const updatedIncident = await lgpdSystem.breachDetector.updateIncident(
        incident.id,
        {
          status: 'investigating',
          investigationNotes: 'Iniciada investigação interna'
        }
      );

      expect(updatedIncident.status).toBe('investigating');
      expect(updatedIncident.investigationNotes).toBe('Iniciada investigação interna');
    });

    it('should generate ANPD report', async () => {
      // Reportar incidente crítico
      const incident = await lgpdSystem.breachDetector.reportIncident({
        incidentType: 'massive_data_breach',
        severity: 'critical',
        description: 'Violação massiva de dados',
        affectedDataSubjects: [mockPatientId],
        dataCategories: ['health_data', 'personal_data'],
        requiresANPDNotification: true
      });

      // Gerar relatório ANPD
      const report = await lgpdSystem.breachDetector.generateANPDReport(incident.id);

      expect(report).toBeDefined();
      expect(report.incidentId).toBe(incident.id);
      expect(report.reportType).toBe('anpd_notification');
      expect(report.severity).toBe('critical');
    });
  });

  describe('Data Retention', () => {
    it('should create retention policy', async () => {
      const policyData = {
        policyName: 'Teste - Dados Médicos',
        dataCategory: 'health_data',
        retentionPeriodMonths: 240, // 20 anos
        legalBasis: 'legal_obligation' as const,
        processingPurpose: 'medical_care',
        retentionAction: 'archive' as const
      };

      const policy = await lgpdSystem.dataRetention.createRetentionPolicy(policyData);

      expect(policy).toBeDefined();
      expect(policy.policyName).toBe('Teste - Dados Médicos');
      expect(policy.retentionPeriodMonths).toBe(240);
      expect(policy.isActive).toBe(true);
    });

    it('should execute retention policy', async () => {
      // Criar política
      const policy = await lgpdSystem.dataRetention.createRetentionPolicy({
        policyName: 'Teste - Execução',
        dataCategory: 'test_data',
        retentionPeriodMonths: 1,
        legalBasis: 'consent',
        processingPurpose: 'testing',
        retentionAction: 'delete'
      });

      // Executar política
      const execution = await lgpdSystem.dataRetention.executeRetentionPolicy(
        policy.id
      );

      expect(execution).toBeDefined();
      expect(execution.policyId).toBe(policy.id);
      expect(execution.status).toBe('completed');
    });

    it('should generate retention compliance report', async () => {
      const report = await lgpdSystem.dataRetention.generateRetentionComplianceReport({
        period: 'monthly'
      });

      expect(report).toBeDefined();
      expect(report.period).toBe('monthly');
      expect(Array.isArray(report.policies)).toBe(true);
      expect(typeof report.complianceScore).toBe('number');
    });
  });

  describe('Data Minimization', () => {
    it('should create minimization rule', async () => {
      const ruleData = {
        ruleName: 'Teste - Coleta Mínima',
        processingPurpose: 'medical_treatment',
        allowedDataCategories: ['health_data', 'personal_data'],
        requiredFields: ['name', 'cpf', 'medical_condition'],
        optionalFields: ['phone', 'email'],
        prohibitedFields: ['political_opinion', 'religious_belief']
      };

      const rule = await lgpdSystem.dataMinimization.createMinimizationRule(ruleData);

      expect(rule).toBeDefined();
      expect(rule.ruleName).toBe('Teste - Coleta Mínima');
      expect(rule.processingPurpose).toBe('medical_treatment');
      expect(rule.isActive).toBe(true);
    });

    it('should validate data collection', async () => {
      // Criar regra
      await lgpdSystem.dataMinimization.createMinimizationRule({
        ruleName: 'Validação Teste',
        processingPurpose: 'test_purpose',
        allowedDataCategories: ['personal_data'],
        requiredFields: ['name', 'email'],
        optionalFields: ['phone'],
        prohibitedFields: ['sensitive_data']
      });

      // Validar coleta válida
      const validData = {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999'
      };

      const validationResult = await lgpdSystem.dataMinimization.validateDataCollection(
        'test_purpose',
        validData
      );

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.violations).toHaveLength(0);

      // Validar coleta inválida
      const invalidData = {
        name: 'João Silva',
        sensitive_data: 'dados sensíveis'
        // email obrigatório ausente
      };

      const invalidValidation = await lgpdSystem.dataMinimization.validateDataCollection(
        'test_purpose',
        invalidData
      );

      expect(invalidValidation.isValid).toBe(false);
      expect(invalidValidation.violations.length).toBeGreaterThan(0);
    });

    it('should apply minimization to dataset', async () => {
      // Criar regra
      await lgpdSystem.dataMinimization.createMinimizationRule({
        ruleName: 'Minimização Teste',
        processingPurpose: 'analytics',
        allowedDataCategories: ['usage_data'],
        requiredFields: ['user_id', 'action'],
        optionalFields: ['timestamp'],
        prohibitedFields: ['personal_info']
      });

      // Dataset com dados desnecessários
      const dataset = [
        {
          user_id: '123',
          action: 'login',
          timestamp: '2024-01-01',
          personal_info: 'dados pessoais',
          unnecessary_field: 'campo desnecessário'
        }
      ];

      const minimizedData = await lgpdSystem.dataMinimization.applyMinimization(
        'analytics',
        dataset
      );

      expect(minimizedData.processedData).toBeDefined();
      expect(minimizedData.removedFields.length).toBeGreaterThan(0);
      expect(minimizedData.processedData[0]).not.toHaveProperty('personal_info');
      expect(minimizedData.processedData[0]).not.toHaveProperty('unnecessary_field');
    });
  });

  describe('LGPD Assessment (DPIA)', () => {
    it('should create LGPD assessment', async () => {
      const assessmentData = {
        projectName: 'Teste - Nova Funcionalidade',
        projectDescription: 'Implementação de nova funcionalidade de telemedicina',
        dataCategories: ['health_data', 'personal_data'],
        processingPurposes: ['medical_treatment', 'telemedicine'],
        dataSubjectCategories: ['patients'],
        legalBasis: ['consent', 'vital_interests'] as const,
        thirdPartyInvolvement: false,
        internationalTransfers: false
      };

      const assessment = await lgpdSystem.lgpdAssessment.createAssessment(assessmentData);

      expect(assessment).toBeDefined();
      expect(assessment.projectName).toBe('Teste - Nova Funcionalidade');
      expect(assessment.status).toBe('draft');
      expect(typeof assessment.riskScore).toBe('number');
    });

    it('should update assessment', async () => {
      // Criar assessment
      const assessment = await lgpdSystem.lgpdAssessment.createAssessment({
        projectName: 'Teste Update',
        projectDescription: 'Teste de atualização',
        dataCategories: ['personal_data'],
        processingPurposes: ['testing'],
        dataSubjectCategories: ['test_subjects'],
        legalBasis: ['consent']
      });

      // Atualizar assessment
      const updatedAssessment = await lgpdSystem.lgpdAssessment.updateAssessment(
        assessment.id,
        {
          status: 'completed',
          mitigationMeasures: [
            {
              riskCategory: 'data_security',
              measure: 'Implementar criptografia end-to-end',
              priority: 'high',
              responsible: 'Equipe de TI',
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          ]
        }
      );

      expect(updatedAssessment.status).toBe('completed');
      expect(updatedAssessment.mitigationMeasures).toHaveLength(1);
    });

    it('should generate assessment report', async () => {
      // Criar assessment
      const assessment = await lgpdSystem.lgpdAssessment.createAssessment({
        projectName: 'Teste Relatório',
        projectDescription: 'Teste de geração de relatório',
        dataCategories: ['health_data'],
        processingPurposes: ['medical_treatment'],
        dataSubjectCategories: ['patients'],
        legalBasis: ['consent']
      });

      // Gerar relatório
      const report = await lgpdSystem.lgpdAssessment.generateAssessmentReport(
        assessment.id
      );

      expect(report).toBeDefined();
      expect(report.assessmentId).toBe(assessment.id);
      expect(report.projectName).toBe('Teste Relatório');
      expect(typeof report.riskScore).toBe('number');
      expect(Array.isArray(report.riskFactors)).toBe(true);
    });
  });

  describe('Legal Documentation', () => {
    it('should generate privacy policy', async () => {
      const policyData = {
        documentType: 'privacy_policy' as const,
        clinicInfo: {
          name: 'Clínica Teste',
          cnpj: '12.345.678/0001-90',
          address: 'Rua Teste, 123',
          dpoContact: 'dpo@clinicateste.com'
        },
        dataProcessingInfo: {
          purposes: ['medical_treatment', 'appointment_scheduling'],
          dataCategories: ['health_data', 'personal_data'],
          legalBasis: ['consent', 'vital_interests'],
          retentionPeriods: {
            health_data: '20 anos',
            personal_data: '5 anos'
          }
        }
      };

      const document = await lgpdSystem.legalDocumentation.generateDocument(policyData);

      expect(document).toBeDefined();
      expect(document.documentType).toBe('privacy_policy');
      expect(document.status).toBe('active');
      expect(document.content).toContain('Clínica Teste');
    });

    it('should generate consent form', async () => {
      const consentData = {
        documentType: 'consent_form' as const,
        consentInfo: {
          consentType: 'medical_treatment',
          processingPurpose: 'Prestação de cuidados médicos',
          dataCategories: ['health_data', 'personal_data'],
          retentionPeriod: '20 anos',
          thirdPartySharing: false,
          withdrawalProcess: 'Solicitação por email ou presencialmente'
        }
      };

      const document = await lgpdSystem.legalDocumentation.generateDocument(consentData);

      expect(document).toBeDefined();
      expect(document.documentType).toBe('consent_form');
      expect(document.content).toContain('medical_treatment');
    });

    it('should update document', async () => {
      // Gerar documento
      const document = await lgpdSystem.legalDocumentation.generateDocument({
        documentType: 'privacy_policy',
        clinicInfo: {
          name: 'Clínica Update Teste',
          cnpj: '12.345.678/0001-90'
        }
      });

      // Atualizar documento
      const updatedDocument = await lgpdSystem.legalDocumentation.updateDocument(
        document.id,
        {
          clinicInfo: {
            name: 'Clínica Update Teste - Atualizada',
            cnpj: '12.345.678/0001-90',
            address: 'Nova Rua, 456'
          }
        }
      );

      expect(updatedDocument.version).toBeGreaterThan(document.version);
      expect(updatedDocument.content).toContain('Clínica Update Teste - Atualizada');
    });

    it('should generate compliance package', async () => {
      const packageData = {
        clinicInfo: {
          name: 'Clínica Pacote Teste',
          cnpj: '12.345.678/0001-90',
          address: 'Rua Pacote, 789',
          dpoContact: 'dpo@clinicapacote.com'
        },
        includeDocuments: [
          'privacy_policy',
          'consent_form',
          'data_processing_record'
        ]
      };

      const compliancePackage = await lgpdSystem.legalDocumentation.generateCompliancePackage(
        packageData
      );

      expect(compliancePackage).toBeDefined();
      expect(compliancePackage.documents.length).toBeGreaterThan(0);
      expect(compliancePackage.packageId).toBeDefined();
    });
  });

  describe('System Integration', () => {
    it('should get system status', async () => {
      const status = await lgpdSystem.getSystemStatus();

      expect(status).toBeDefined();
      expect(status.isInitialized).toBe(true);
      expect(typeof status.uptime).toBe('number');
      expect(Array.isArray(status.activeModules)).toBe(true);
    });

    it('should perform compliance check', async () => {
      const complianceCheck = await lgpdSystem.performComplianceCheck();

      expect(complianceCheck).toBeDefined();
      expect(typeof complianceCheck.overallScore).toBe('number');
      expect(Array.isArray(complianceCheck.moduleScores)).toBe(true);
      expect(Array.isArray(complianceCheck.criticalIssues)).toBe(true);
    });

    it('should generate system report', async () => {
      const report = await lgpdSystem.generateSystemReport({
        includeMetrics: true,
        includeAlerts: true,
        includeRecommendations: true,
        period: 'monthly'
      });

      expect(report).toBeDefined();
      expect(report.period).toBe('monthly');
      expect(report.generatedAt).toBeDefined();
      expect(report.modules).toBeDefined();
    });
  });

  describe('Event System', () => {
    it('should emit and handle events', (done) => {
      const testData = { test: 'data' };
      
      // Configurar listener
      lgpdSystem.eventEmitter.on('test.event', (data) => {
        expect(data).toEqual(testData);
        done();
      });
      
      // Emitir evento
      lgpdSystem.eventEmitter.emit('test.event', testData);
    });

    it('should handle multiple listeners', () => {
      let count = 0;
      const increment = () => count++;
      
      // Adicionar múltiplos listeners
      lgpdSystem.eventEmitter.on('count.event', increment);
      lgpdSystem.eventEmitter.on('count.event', increment);
      lgpdSystem.eventEmitter.on('count.event', increment);
      
      // Emitir evento
      lgpdSystem.eventEmitter.emit('count.event');
      
      expect(count).toBe(3);
    });

    it('should remove listeners', () => {
      let called = false;
      const listener = () => { called = true; };
      
      // Adicionar listener
      lgpdSystem.eventEmitter.on('remove.event', listener);
      
      // Remover listener
      lgpdSystem.eventEmitter.off('remove.event', listener);
      
      // Emitir evento
      lgpdSystem.eventEmitter.emit('remove.event');
      
      expect(called).toBe(false);
    });
  });
});

// =====================================================
// TESTES DE INTEGRAÇÃO
// =====================================================

describe('LGPD Integration Tests', () => {
  let lgpdSystem: LGPDComplianceSystem;
  const mockClinicId = 'integration-clinic-123';
  const mockPatientId = 'integration-patient-456';

  beforeEach(async () => {
    const supabase = createLGPDSupabaseClient();
    lgpdSystem = new LGPDComplianceSystem({
      supabase,
      clinicId: mockClinicId,
      enableMonitoring: true,
      enableAuditLogging: true
    });
    
    await lgpdSystem.initialize();
  });

  afterEach(async () => {
    await lgpdSystem.shutdown();
  });

  it('should handle complete patient lifecycle', async () => {
    // 1. Coletar consentimento
    const consent = await lgpdSystem.consentManager.collectConsent({
      dataSubjectId: mockPatientId,
      consentType: 'medical_treatment',
      processingPurpose: 'Cuidados médicos',
      dataCategories: ['health_data'],
      legalBasis: 'consent'
    });

    expect(consent.status).toBe('active');

    // 2. Processar dados (verificar consentimento)
    const canProcess = await lgpdSystem.consentManager.getConsentStatus(
      mockPatientId,
      'medical_treatment'
    );

    expect(canProcess.isValid).toBe(true);

    // 3. Solicitação de acesso
    const accessRequest = await lgpdSystem.dataSubjectRights.submitRequest({
      dataSubjectId: mockPatientId,
      requestType: 'access',
      description: 'Solicitação de acesso aos dados'
    });

    expect(accessRequest.status).toBe('pending');

    // 4. Processar solicitação
    const accessData = await lgpdSystem.dataSubjectRights.processAccessRequest(
      accessRequest.id
    );

    expect(accessData.dataSubjectId).toBe(mockPatientId);

    // 5. Retirar consentimento
    const withdrawnConsent = await lgpdSystem.consentManager.withdrawConsent(
      consent.id,
      'Solicitação do paciente'
    );

    expect(withdrawnConsent.status).toBe('withdrawn');

    // 6. Verificar que processamento não é mais permitido
    const canProcessAfterWithdrawal = await lgpdSystem.consentManager.getConsentStatus(
      mockPatientId,
      'medical_treatment'
    );

    expect(canProcessAfterWithdrawal.isValid).toBe(false);
  });

  it('should handle breach detection and reporting workflow', async () => {
    // 1. Detectar violação
    const incident = await lgpdSystem.breachDetector.reportIncident({
      incidentType: 'unauthorized_access',
      severity: 'high',
      description: 'Acesso não autorizado detectado',
      affectedDataSubjects: [mockPatientId],
      dataCategories: ['health_data']
    });

    expect(incident.status).toBe('reported');

    // 2. Criar alerta de conformidade
    const alert = await lgpdSystem.complianceMonitor.createAlert({
      alertType: 'security_breach',
      severity: 'high',
      title: 'Violação de Segurança',
      description: `Incidente reportado: ${incident.id}`,
      relatedEntityId: incident.id,
      relatedEntityType: 'breach_incident'
    });

    expect(alert.status).toBe('active');

    // 3. Investigar incidente
    const updatedIncident = await lgpdSystem.breachDetector.updateIncident(
      incident.id,
      {
        status: 'investigating',
        investigationNotes: 'Investigação iniciada'
      }
    );

    expect(updatedIncident.status).toBe('investigating');

    // 4. Resolver incidente
    const resolvedIncident = await lgpdSystem.breachDetector.updateIncident(
      incident.id,
      {
        status: 'resolved',
        resolutionNotes: 'Vulnerabilidade corrigida'
      }
    );

    expect(resolvedIncident.status).toBe('resolved');

    // 5. Resolver alerta
    const resolvedAlert = await lgpdSystem.complianceMonitor.resolveAlert(
      alert.id,
      'Incidente resolvido'
    );

    expect(resolvedAlert.status).toBe('resolved');
  });

  it('should handle data retention lifecycle', async () => {
    // 1. Criar política de retenção
    const policy = await lgpdSystem.dataRetention.createRetentionPolicy({
      policyName: 'Teste - Retenção Integração',
      dataCategory: 'test_data',
      retentionPeriodMonths: 1,
      legalBasis: 'consent',
      processingPurpose: 'testing',
      retentionAction: 'delete'
    });

    expect(policy.isActive).toBe(true);

    // 2. Executar política
    const execution = await lgpdSystem.dataRetention.executeRetentionPolicy(
      policy.id
    );

    expect(execution.status).toBe('completed');

    // 3. Gerar relatório de conformidade
    const report = await lgpdSystem.dataRetention.generateRetentionComplianceReport({
      period: 'monthly'
    });

    expect(report.policies.length).toBeGreaterThan(0);
    expect(typeof report.complianceScore).toBe('number');
  });
});

// =====================================================
// TESTES DE PERFORMANCE
// =====================================================

describe('LGPD Performance Tests', () => {
  let lgpdSystem: LGPDComplianceSystem;
  const mockClinicId = 'perf-clinic-123';

  beforeEach(async () => {
    const supabase = createLGPDSupabaseClient();
    lgpdSystem = new LGPDComplianceSystem({
      supabase,
      clinicId: mockClinicId,
      enableMonitoring: false, // Desabilitar para testes de performance
      enableAuditLogging: false
    });
    
    await lgpdSystem.initialize();
  });

  afterEach(async () => {
    await lgpdSystem.shutdown();
  });

  it('should handle multiple consent collections efficiently', async () => {
    const startTime = Date.now();
    const promises = [];

    // Coletar 100 consentimentos simultaneamente
    for (let i = 0; i < 100; i++) {
      promises.push(
        lgpdSystem.consentManager.collectConsent({
          dataSubjectId: `patient-${i}`,
          consentType: 'medical_treatment',
          processingPurpose: 'Cuidados médicos',
          dataCategories: ['health_data'],
          legalBasis: 'consent'
        })
      );
    }

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(results).toHaveLength(100);
    expect(duration).toBeLessThan(5000); // Menos de 5 segundos
    
    console.log(`✅ 100 consentimentos coletados em ${duration}ms`);
  });

  it('should handle bulk data subject requests efficiently', async () => {
    const startTime = Date.now();
    const promises = [];

    // Submeter 50 solicitações simultaneamente
    for (let i = 0; i < 50; i++) {
      promises.push(
        lgpdSystem.dataSubjectRights.submitRequest({
          dataSubjectId: `patient-${i}`,
          requestType: 'access',
          description: `Solicitação de acesso ${i}`
        })
      );
    }

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(results).toHaveLength(50);
    expect(duration).toBeLessThan(3000); // Menos de 3 segundos
    
    console.log(`✅ 50 solicitações DSR criadas em ${duration}ms`);
  });

  it('should generate reports efficiently', async () => {
    const startTime = Date.now();

    // Gerar múltiplos relatórios simultaneamente
    const [complianceReport, retentionReport, systemReport] = await Promise.all([
      lgpdSystem.complianceMonitor.generateComplianceReport({ period: 'monthly' }),
      lgpdSystem.dataRetention.generateRetentionComplianceReport({ period: 'monthly' }),
      lgpdSystem.generateSystemReport({ period: 'monthly' })
    ]);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(complianceReport).toBeDefined();
    expect(retentionReport).toBeDefined();
    expect(systemReport).toBeDefined();
    expect(duration).toBeLessThan(2000); // Menos de 2 segundos
    
    console.log(`✅ 3 relatórios gerados em ${duration}ms`);
  });
});

export {
  lgpdSystem as testLGPDSystem
};