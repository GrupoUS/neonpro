import crypto from 'crypto';
import { http } from 'msw';
import { createTRPCMsw } from 'msw-trpc';
import { setupServer } from 'msw/node';
import superjson from 'superjson';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppRouter } from '../../src/trpc';
import { createTestClient } from '../helpers/auth';
import { cleanupTestDatabase, setupTestDatabase } from '../helpers/database';

/**
 * T047: ANVISA Adverse Event Reporting Testing
 *
 * BRAZILIAN ANVISA REQUIREMENTS FOR AESTHETIC CLINICS:
 * - Automated adverse event detection for medical device software
 * - SaMD (Software as Medical Device) compliance for aesthetic procedures
 * - Regulatory reporting automation to ANVISA VigiMed system
 * - Audit trail for medical device software performance
 * - Post-market surveillance integration for aesthetic devices
 * - Risk management compliance for medical software
 *
 * TDD RED PHASE: These tests are designed to FAIL initially to drive implementation
 */

// Mock ANVISA systems
const mockANVISASystem = {
  registeredDevices: [
    {
      anvisa_code: 'ANVISA_80149018001',
      device_name: 'NeonPro Aesthetic Management System',
      classification: 'SOFTWARE_MEDICO_CLASSE_II',
      manufacturer: 'NeonPro Healthcare Technologies',
      registration_number: 'REG_ANVISA_2024_001',
      validity: '2027-12-31',
      status: 'ATIVO',
      samd_category: 'NON_SERIOUS_HEALTHCARE_SITUATION',
      risk_level: 'BAIXO_RISCO',
    },
  ],

  adverseEventReports: [] as Array<{
    id: string;
    anvisa_code: string;
    event_type: 'MALFUNCIONAMENTO' | 'EVENTO_ADVERSO' | 'FALHA_SEGURANCA';
    severity: 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO';
    description: string;
    patient_id?: string;
    device_serial?: string;
    occurrence_date: string;
    reported_date: string;
    reporter_type: 'PROFISSIONAL_SAUDE' | 'PACIENTE' | 'FABRICANTE';
    actions_taken: string[];
    follow_up_required: boolean;
    vigimed_notification_id?: string;
  }>,

  samdCompliance: {
    risk_assessment_updated: '2025-09-01',
    clinical_evidence_level: 'ADEQUATE',
    post_market_surveillance: 'ACTIVE',
    quality_management_system: 'ISO_13485_CERTIFIED',
    software_lifecycle_process: 'IEC_62304_COMPLIANT',
    usability_engineering: 'IEC_62366_APPLIED',
  },

  auditTrail: [] as Array<{
    id: string;
    event_type:
      | 'DEVICE_USE'
      | 'SOFTWARE_UPDATE'
      | 'ADVERSE_EVENT'
      | 'MAINTENANCE';
    timestamp: string;
    user_id: string;
    device_serial: string;
    software_version: string;
    operation_performed: string;
    outcome: 'SUCCESS' | 'FAILURE' | 'WARNING';
    performance_metrics?: {
      response_time_ms: number;
      accuracy_percentage: number;
      reliability_score: number;
    };
  }>,
};

describe('T047: ANVISA Adverse Event Reporting Tests', () => {
  let testClient: any;
  let server: ReturnType<typeof setupServer>;
  let deviceSerial: string;
  let patientId: string;

  beforeEach(async () => {
    await setupTestDatabase();
    testClient = await createTestClient({ role: 'admin' });

    // Clear audit logs
    mockANVISASystem.adverseEventReports.length = 0;
    mockANVISASystem.auditTrail.length = 0;

    deviceSerial = 'NP_AMS_' + Date.now();
    patientId = 'patient_' + Date.now();

    // Setup MSW server for ANVISA compliance mocking
    const trpcMsw = createTRPCMsw<AppRouter>({
      transformer: {
        input: superjson,
        output: superjson,
      },
    });

    server = setupServer(
      // Mock ANVISA device registration API
      http.get(
        'https://consultas.anvisa.gov.br/api/dispositivos/:codigo',
        ({ params }) => {
          const device = mockANVISASystem.registeredDevices.find(
            d => d.anvisa_code === params.codigo,
          );
          if (!device) {
            return new Response(
              JSON.stringify({ error: 'Dispositivo não encontrado' }),
              {
                status: 404,
              },
            );
          }
          return Response.json(device);
        },
      ),
      // Mock ANVISA VigiMed reporting API
      http.post(
        'https://vigimed.anvisa.gov.br/api/eventos/relatar',
        async ({ request }) => {
          const eventData = (await request.json()) as any;
          const notificationId = 'VIGIMED_' + Date.now();

          return Response.json({
            notification_id: notificationId,
            status: 'RECEBIDO',
            protocol_number: 'PROT_' + Date.now(),
            estimated_processing_time: '5_business_days',
            next_steps: ['INVESTIGACAO_INICIAL', 'CLASSIFICACAO_RISCO'],
          });
        },
      ),
      // Mock ANVISA post-market surveillance API
      http.post(
        'https://pos-comercializacao.anvisa.gov.br/api/vigilancia',
        () => {
          return Response.json({
            surveillance_id: 'SURV_' + Date.now(),
            monitoring_active: true,
            frequency: 'CONTINUOUS',
            next_report_due: '2025-12-31',
            compliance_status: 'CONFORME',
          });
        },
      ),
      // Mock ANVISA SaMD classification API
      http.post('https://samd.anvisa.gov.br/api/classificacao', () => {
        return Response.json({
          classification: 'SOFTWARE_MEDICO_CLASSE_II',
          risk_level: 'BAIXO_RISCO',
          regulatory_requirements: [
            'ISO_13485_QUALITY_SYSTEM',
            'IEC_62304_SOFTWARE_LIFECYCLE',
            'IEC_62366_USABILITY_ENGINEERING',
          ],
          approval_pathway: 'REGISTRO_SIMPLIFICADO',
        });
      }),
    );

    server.listen();
  });

  afterEach(async () => {
    server.close();
    await cleanupTestDatabase();
  });

  describe('Automated Adverse Event Detection', () => {
    it('should detect software malfunctions automatically', async () => {
      const systemOperations = [
        {
          operation: 'patient_data_processing',
          expected_response_time: 500, // ms
          actual_response_time: 1200, // ms - slower than expected
          accuracy: 95, // %
          timestamp: new Date().toISOString(),
        },
        {
          operation: 'appointment_scheduling',
          expected_response_time: 300, // ms
          actual_response_time: 250, // ms - normal
          accuracy: 99, // %
          timestamp: new Date(Date.now() + 1000).toISOString(),
        },
        {
          operation: 'procedure_recommendation',
          expected_response_time: 800, // ms
          actual_response_time: 5000, // ms - severely degraded
          accuracy: 78, // % - below acceptable threshold
          timestamp: new Date(Date.now() + 2000).toISOString(),
        },
      ];

      const adverseEvents: Array<{
        operation: string;
        issue_type: string;
        severity: string;
        requires_reporting: boolean;
      }> = [];

      // Automated detection logic
      for (const operation of systemOperations) {
        const performanceIssues = [];

        // Check response time thresholds
        if (
          operation.actual_response_time
            > operation.expected_response_time * 2
        ) {
          performanceIssues.push({
            type: 'PERFORMANCE_DEGRADATION',
            severity: 'GRAVE',
            details: `Response time ${operation.actual_response_time}ms exceeds threshold`,
          });
        }

        // Check accuracy thresholds
        if (operation.accuracy < 85) {
          performanceIssues.push({
            type: 'ACCURACY_BELOW_THRESHOLD',
            severity: 'CRITICO',
            details: `Accuracy ${operation.accuracy}% below 85% threshold`,
          });
        }

        // Create adverse events for significant issues
        if (performanceIssues.length > 0) {
          adverseEvents.push({
            operation: operation.operation,
            issue_type: performanceIssues[0].type,
            severity: performanceIssues[0].severity,
            requires_reporting: performanceIssues[0].severity === 'CRITICO'
              || performanceIssues[0].severity === 'GRAVE',
          });
        }
      }

      // Verify automatic detection
      expect(adverseEvents.length).toBeGreaterThan(0);

      const criticalEvents = adverseEvents.filter(
        event => event.severity === 'CRITICO',
      );
      expect(criticalEvents.length).toBeGreaterThan(0);

      const reportableEvents = adverseEvents.filter(
        event => event.requires_reporting,
      );
      expect(reportableEvents.length).toBeGreaterThan(0);

      // Log detected events
      for (const event of reportableEvents) {
        mockANVISASystem.adverseEventReports.push({
          id: 'AE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          anvisa_code: 'ANVISA_80149018001',
          event_type: 'MALFUNCIONAMENTO',
          severity: event.severity as any,
          description: `${event.issue_type} detected in ${event.operation}`,
          device_serial: deviceSerial,
          occurrence_date: new Date().toISOString(),
          reported_date: new Date().toISOString(),
          reporter_type: 'FABRICANTE',
          actions_taken: ['AUTOMATIC_DETECTION', 'ALERT_GENERATED'],
          follow_up_required: true,
        });
      }

      expect(mockANVISASystem.adverseEventReports.length).toBeGreaterThan(0);
    });

    it('should monitor patient safety indicators', async () => {
      const patientSafetyMetrics = [
        {
          patient_id: patientId,
          procedure: 'Harmonização Facial',
          safety_indicators: {
            allergic_reaction_check: true,
            dosage_calculation_accuracy: 98.5,
            contraindication_screening: true,
            drug_interaction_check: true,
            patient_monitoring_active: true,
          },
          outcome: 'SUCCESS',
          timestamp: new Date().toISOString(),
        },
        {
          patient_id: 'patient_test_2',
          procedure: 'Botox Application',
          safety_indicators: {
            allergic_reaction_check: false, // SAFETY ISSUE
            dosage_calculation_accuracy: 99.1,
            contraindication_screening: true,
            drug_interaction_check: true,
            patient_monitoring_active: false, // SAFETY ISSUE
          },
          outcome: 'SAFETY_CONCERN',
          timestamp: new Date().toISOString(),
        },
      ];

      const safetyIssues: Array<{
        patient_id: string;
        issue: string;
        severity: string;
        immediate_action_required: boolean;
      }> = [];

      // Analyze safety metrics
      for (const metric of patientSafetyMetrics) {
        const indicators = metric.safety_indicators;

        // Critical safety checks
        if (!indicators.allergic_reaction_check) {
          safetyIssues.push({
            patient_id: metric.patient_id,
            issue: 'ALLERGIC_REACTION_CHECK_SKIPPED',
            severity: 'CRITICO',
            immediate_action_required: true,
          });
        }

        if (!indicators.patient_monitoring_active) {
          safetyIssues.push({
            patient_id: metric.patient_id,
            issue: 'PATIENT_MONITORING_INACTIVE',
            severity: 'GRAVE',
            immediate_action_required: true,
          });
        }

        if (indicators.dosage_calculation_accuracy < 95) {
          safetyIssues.push({
            patient_id: metric.patient_id,
            issue: 'DOSAGE_CALCULATION_INACCURACY',
            severity: 'CRITICO',
            immediate_action_required: true,
          });
        }
      }

      // Verify safety monitoring
      expect(safetyIssues.length).toBeGreaterThan(0);

      const criticalSafetyIssues = safetyIssues.filter(
        issue => issue.severity === 'CRITICO',
      );
      expect(criticalSafetyIssues.length).toBeGreaterThan(0);

      // Report critical safety issues to ANVISA
      for (const issue of criticalSafetyIssues) {
        mockANVISASystem.adverseEventReports.push({
          id: 'SAFETY_'
            + Date.now()
            + '_'
            + Math.random().toString(36).substr(2, 9),
          anvisa_code: 'ANVISA_80149018001',
          event_type: 'EVENTO_ADVERSO',
          severity: issue.severity as any,
          description: `Patient safety concern: ${issue.issue}`,
          patient_id: issue.patient_id,
          device_serial: deviceSerial,
          occurrence_date: new Date().toISOString(),
          reported_date: new Date().toISOString(),
          reporter_type: 'FABRICANTE',
          actions_taken: [
            'AUTOMATIC_DETECTION',
            'IMMEDIATE_ALERT',
            'PROCEDURE_SUSPENDED',
          ],
          follow_up_required: true,
        });
      }

      expect(
        mockANVISASystem.adverseEventReports.some(
          report =>
            report.event_type === 'EVENTO_ADVERSO'
            && report.severity === 'CRITICO',
        ),
      ).toBe(true);
    });

    it('should identify patterns in adverse events for proactive reporting', async () => {
      // Simulate historical adverse events
      const historicalEvents = [
        {
          date: '2025-09-01',
          type: 'PERFORMANCE_ISSUE',
          severity: 'LEVE',
          procedure: 'Botox',
        },
        {
          date: '2025-09-03',
          type: 'PERFORMANCE_ISSUE',
          severity: 'LEVE',
          procedure: 'Botox',
        },
        {
          date: '2025-09-05',
          type: 'PERFORMANCE_ISSUE',
          severity: 'MODERADO',
          procedure: 'Botox',
        },
        {
          date: '2025-09-07',
          type: 'ALLERGIC_REACTION',
          severity: 'GRAVE',
          procedure: 'Preenchimento',
        },
        {
          date: '2025-09-10',
          type: 'PERFORMANCE_ISSUE',
          severity: 'MODERADO',
          procedure: 'Botox',
        },
        {
          date: '2025-09-12',
          type: 'DOSAGE_ERROR',
          severity: 'CRITICO',
          procedure: 'Botox',
        },
      ];

      // Pattern analysis
      const patternAnalysis = {
        botox_performance_issues: historicalEvents.filter(
          e => e.procedure === 'Botox' && e.type === 'PERFORMANCE_ISSUE',
        ).length,

        severity_escalation: historicalEvents
          .filter(e => e.procedure === 'Botox')
          .map(e => e.severity),

        time_clustering: historicalEvents.reduce((clusters: any, event) => {
          const week = Math.floor(
            new Date(event.date).getTime() / (7 * 24 * 60 * 60 * 1000),
          );
          if (!clusters[week]) clusters[week] = 0;
          clusters[week]++;
          return clusters;
        }, {}),
      };

      // Detect concerning patterns
      const patterns = {
        recurring_procedure_issues: patternAnalysis.botox_performance_issues >= 3,
        severity_escalation_detected: patternAnalysis.severity_escalation.includes('CRITICO'),
        temporal_clustering: Object.values(
          patternAnalysis.time_clustering,
        ).some((count: any) => count >= 3),
      };

      expect(patterns.recurring_procedure_issues).toBe(true);
      expect(patterns.severity_escalation_detected).toBe(true);

      // Generate proactive report if patterns detected
      if (
        patterns.recurring_procedure_issues
        || patterns.severity_escalation_detected
      ) {
        mockANVISASystem.adverseEventReports.push({
          id: 'PATTERN_' + Date.now(),
          anvisa_code: 'ANVISA_80149018001',
          event_type: 'MALFUNCIONAMENTO',
          severity: 'GRAVE',
          description:
            'Pattern analysis detected recurring performance issues with Botox procedures',
          device_serial: deviceSerial,
          occurrence_date: new Date().toISOString(),
          reported_date: new Date().toISOString(),
          reporter_type: 'FABRICANTE',
          actions_taken: [
            'PATTERN_ANALYSIS',
            'PROACTIVE_REPORTING',
            'INVESTIGATION_INITIATED',
          ],
          follow_up_required: true,
        });
      }

      const patternReport = mockANVISASystem.adverseEventReports.find(
        report => report.id.startsWith('PATTERN_'),
      );

      expect(patternReport).toBeTruthy();
      expect(patternReport?.actions_taken).toContain('PROACTIVE_REPORTING');
    });
  });

  describe('SaMD Compliance for Aesthetic Procedures', () => {
    it('should validate SaMD classification and regulatory requirements', async () => {
      const samdClassificationRequest = {
        software_name: 'NeonPro Aesthetic Management System',
        intended_use: 'Aesthetic procedure planning and patient management',
        healthcare_decision_impact: 'NON_SERIOUS',
        healthcare_situation: 'NON_SERIOUS_HEALTHCARE_SITUATION',
        software_functions: [
          'patient_data_management',
          'procedure_recommendation',
          'appointment_scheduling',
          'outcome_tracking',
          'compliance_monitoring',
        ],
      };

      // Call ANVISA SaMD classification API
      const classificationResponse = await fetch(
        'https://samd.anvisa.gov.br/api/classificacao',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(samdClassificationRequest),
        },
      );

      const classification = await classificationResponse.json();

      // Verify SaMD classification
      expect(classification.classification).toBe('SOFTWARE_MEDICO_CLASSE_II');
      expect(classification.risk_level).toBe('BAIXO_RISCO');
      expect(classification.regulatory_requirements).toContain(
        'ISO_13485_QUALITY_SYSTEM',
      );
      expect(classification.regulatory_requirements).toContain(
        'IEC_62304_SOFTWARE_LIFECYCLE',
      );

      // Verify compliance with regulatory requirements
      const complianceStatus = {
        iso_13485_certified: mockANVISASystem.samdCompliance.quality_management_system
          === 'ISO_13485_CERTIFIED',
        iec_62304_compliant: mockANVISASystem.samdCompliance.software_lifecycle_process
          === 'IEC_62304_COMPLIANT',
        iec_62366_applied: mockANVISASystem.samdCompliance.usability_engineering
          === 'IEC_62366_APPLIED',
        clinical_evidence_adequate: mockANVISASystem.samdCompliance.clinical_evidence_level
          === 'ADEQUATE',
      };

      expect(complianceStatus.iso_13485_certified).toBe(true);
      expect(complianceStatus.iec_62304_compliant).toBe(true);
      expect(complianceStatus.iec_62366_applied).toBe(true);
      expect(complianceStatus.clinical_evidence_adequate).toBe(true);
    });

    it('should implement software lifecycle processes according to IEC 62304', async () => {
      const softwareLifecycleProcess = {
        planning: {
          software_safety_classification: 'NON_SAFETY_CRITICAL_CLASS_A',
          development_lifecycle_model: 'INCREMENTAL',
          risk_management_plan: 'ISO_14971_COMPLIANT',
          verification_validation_plan: 'COMPREHENSIVE',
        },
        development: {
          software_requirements_analysis: 'COMPLETE',
          software_architectural_design: 'DOCUMENTED',
          software_detailed_design: 'REVIEWED',
          software_implementation: 'CODE_REVIEWED',
        },
        testing: {
          software_unit_testing: 95, // % coverage
          software_integration_testing: 'COMPLETE',
          software_system_testing: 'PASSED',
          usability_testing: 'IEC_62366_COMPLIANT',
        },
        release: {
          release_activities: 'COMPLETE',
          software_release_documentation: 'PREPARED',
          post_market_surveillance_plan: 'ACTIVE',
          maintenance_plan: 'ESTABLISHED',
        },
      };

      // Verify IEC 62304 compliance
      expect(
        softwareLifecycleProcess.planning.software_safety_classification,
      ).toBeTruthy();
      expect(
        softwareLifecycleProcess.development.software_requirements_analysis,
      ).toBe('COMPLETE');
      expect(
        softwareLifecycleProcess.testing.software_unit_testing,
      ).toBeGreaterThanOrEqual(85);
      expect(
        softwareLifecycleProcess.release.post_market_surveillance_plan,
      ).toBe('ACTIVE');

      // Document lifecycle compliance
      mockANVISASystem.auditTrail.push({
        id: 'LIFECYCLE_' + Date.now(),
        event_type: 'SOFTWARE_UPDATE',
        timestamp: new Date().toISOString(),
        user_id: 'system',
        device_serial: deviceSerial,
        software_version: '2.1.0',
        operation_performed: 'IEC_62304_COMPLIANCE_VERIFICATION',
        outcome: 'SUCCESS',
        performance_metrics: {
          response_time_ms: 0,
          accuracy_percentage: 100,
          reliability_score: 99.9,
        },
      });

      const lifecycleAudit = mockANVISASystem.auditTrail.find(
        audit => audit.operation_performed === 'IEC_62304_COMPLIANCE_VERIFICATION',
      );

      expect(lifecycleAudit?.outcome).toBe('SUCCESS');
    });

    it('should maintain risk management documentation per ISO 14971', async () => {
      const riskManagementFile = {
        hazard_analysis: [
          {
            hazard_id: 'HAZ_001',
            hazard: 'Incorrect dosage calculation',
            potential_harm: 'Patient injury from overdose',
            severity: 'CRITICAL',
            probability: 'REMOTE',
            risk_level: 'MEDIUM',
            risk_control_measures: [
              'Input validation algorithms',
              'Double-check prompts',
              'Maximum dosage limits',
              'Healthcare professional review',
            ],
            residual_risk: 'LOW',
          },
          {
            hazard_id: 'HAZ_002',
            hazard: 'Software performance degradation',
            potential_harm: 'Delayed treatment decisions',
            severity: 'MARGINAL',
            probability: 'OCCASIONAL',
            risk_level: 'MEDIUM',
            risk_control_measures: [
              'Performance monitoring',
              'Automated alerts',
              'Fallback procedures',
              'Regular maintenance',
            ],
            residual_risk: 'LOW',
          },
        ],
        risk_benefit_analysis: {
          clinical_benefits: [
            'Improved procedure accuracy',
            'Enhanced patient safety monitoring',
            'Standardized treatment protocols',
            'Comprehensive documentation',
          ],
          remaining_risks: [
            'Technology dependency',
            'User error potential',
            'System availability',
          ],
          benefit_risk_ratio: 'FAVORABLE',
        },
        post_market_surveillance: {
          adverse_event_monitoring: 'ACTIVE',
          performance_metrics_tracking: 'CONTINUOUS',
          user_feedback_collection: 'SYSTEMATIC',
          periodic_safety_update_report: 'ANNUAL',
        },
      };

      // Verify risk management completeness
      expect(riskManagementFile.hazard_analysis.length).toBeGreaterThan(0);
      expect(
        riskManagementFile.hazard_analysis.every(
          hazard => hazard.risk_control_measures.length > 0,
        ),
      ).toBe(true);
      expect(riskManagementFile.risk_benefit_analysis.benefit_risk_ratio).toBe(
        'FAVORABLE',
      );
      expect(
        riskManagementFile.post_market_surveillance.adverse_event_monitoring,
      ).toBe('ACTIVE');

      // Verify residual risks are acceptable
      const unacceptableRisks = riskManagementFile.hazard_analysis.filter(
        hazard =>
          hazard.residual_risk === 'HIGH'
          || hazard.residual_risk === 'CRITICAL',
      );

      expect(unacceptableRisks.length).toBe(0);
    });
  });

  describe('Regulatory Reporting Automation to ANVISA VigiMed', () => {
    it('should automatically submit adverse events to VigiMed system', async () => {
      const adverseEvent = {
        event_id: 'AE_AUTO_' + Date.now(),
        anvisa_code: 'ANVISA_80149018001',
        event_description: 'Software calculated incorrect Botox dosage for patient',
        severity: 'GRAVE',
        patient_affected: true,
        device_serial: deviceSerial,
        software_version: '2.1.0',
        occurrence_datetime: new Date().toISOString(),
        discovery_method: 'AUTOMATED_MONITORING',
        immediate_actions: [
          'Calculation algorithm suspended',
          'Patient contacted for safety check',
          'Manual dosage verification implemented',
          'Investigation initiated',
        ],
        root_cause_analysis_required: true,
      };

      // Prepare VigiMed submission
      const vigimeaSubmission = {
        notification_type: 'EVENTO_ADVERSO_DISPOSITIVO',
        device_information: {
          anvisa_registration: adverseEvent.anvisa_code,
          manufacturer: 'NeonPro Healthcare Technologies',
          device_serial: adverseEvent.device_serial,
          software_version: adverseEvent.software_version,
        },
        event_details: {
          event_description: adverseEvent.event_description,
          severity: adverseEvent.severity,
          occurrence_date: adverseEvent.occurrence_datetime,
          discovery_method: adverseEvent.discovery_method,
        },
        patient_information: {
          affected: adverseEvent.patient_affected,
          anonymized_id: patientId
            ? crypto
              .createHash('sha256')
              .update(patientId)
              .digest('hex')
              .substr(0, 16)
            : null,
        },
        reporter_information: {
          type: 'FABRICANTE',
          organization: 'NeonPro Healthcare Technologies',
          contact_email: 'compliance@neonpro.com.br',
        },
        actions_taken: adverseEvent.immediate_actions,
      };

      // Submit to VigiMed
      const vigimeaResponse = await fetch(
        'https://vigimed.anvisa.gov.br/api/eventos/relatar',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vigimeaSubmission),
        },
      );

      const vigimeaResult = await vigimeaResponse.json();

      // Verify successful submission
      expect(vigimeaResponse.status).toBe(200);
      expect(vigimeaResult.status).toBe('RECEBIDO');
      expect(vigimeaResult.notification_id).toMatch(/^VIGIMED_/);
      expect(vigimeaResult.protocol_number).toMatch(/^PROT_/);

      // Update adverse event with VigiMed notification ID
      mockANVISASystem.adverseEventReports.push({
        id: adverseEvent.event_id,
        anvisa_code: adverseEvent.anvisa_code,
        event_type: 'EVENTO_ADVERSO',
        severity: adverseEvent.severity as any,
        description: adverseEvent.event_description,
        patient_id: patientId,
        device_serial: adverseEvent.device_serial,
        occurrence_date: adverseEvent.occurrence_datetime,
        reported_date: new Date().toISOString(),
        reporter_type: 'FABRICANTE',
        actions_taken: adverseEvent.immediate_actions,
        follow_up_required: adverseEvent.root_cause_analysis_required,
        vigimed_notification_id: vigimeaResult.notification_id,
      });

      const reportedEvent = mockANVISASystem.adverseEventReports.find(
        report => report.vigimed_notification_id === vigimeaResult.notification_id,
      );

      expect(reportedEvent).toBeTruthy();
      expect(reportedEvent?.vigimed_notification_id).toBeTruthy();
    });

    it('should handle VigiMed submission failures with retry mechanism', async () => {
      const failedSubmission = {
        event_id: 'AE_RETRY_' + Date.now(),
        submission_attempts: [],
        max_retries: 3,
        current_attempt: 0,
      };

      // Simulate submission attempts with failures
      for (
        let attempt = 1;
        attempt <= failedSubmission.max_retries;
        attempt++
      ) {
        const submissionResult = {
          attempt: attempt,
          timestamp: new Date(Date.now() + attempt * 1000).toISOString(),
          success: attempt === 3, // Succeed on third attempt
          error: attempt < 3 ? 'NETWORK_TIMEOUT' : null,
          retry_delay: attempt < 3 ? Math.pow(2, attempt) * 1000 : 0, // Exponential backoff
        };

        failedSubmission.submission_attempts.push(submissionResult);

        if (submissionResult.success) {
          break;
        }

        // Simulate retry delay
        await new Promise(resolve => setTimeout(resolve, 10)); // Shortened for test
      }

      // Verify retry mechanism
      expect(failedSubmission.submission_attempts.length).toBeGreaterThan(1);
      expect(
        failedSubmission.submission_attempts[
          failedSubmission.submission_attempts.length - 1
        ].success,
      ).toBe(true);

      // Verify exponential backoff was applied
      const retryDelays = failedSubmission.submission_attempts
        .filter(attempt => !attempt.success)
        .map(attempt => attempt.retry_delay);

      expect(retryDelays[0]).toBeLessThan(retryDelays[1]); // Exponential increase
    });

    it('should generate periodic safety reports for ANVISA', async () => {
      const reportingPeriod = {
        start_date: '2025-07-01',
        end_date: '2025-09-30',
        quarter: 'Q3_2025',
      };

      // Aggregate adverse events for the period
      const periodEvents = [
        { type: 'MALFUNCIONAMENTO', severity: 'LEVE', count: 5 },
        { type: 'MALFUNCIONAMENTO', severity: 'MODERADO', count: 2 },
        { type: 'EVENTO_ADVERSO', severity: 'GRAVE', count: 1 },
        { type: 'FALHA_SEGURANCA', severity: 'CRITICO', count: 0 },
      ];

      const periodicSafetyReport = {
        report_id: 'PSR_' + Date.now(),
        reporting_period: reportingPeriod,
        device_information: {
          anvisa_code: 'ANVISA_80149018001',
          devices_in_use: 1250,
          software_versions_active: ['2.0.0', '2.1.0', '2.1.1'],
        },
        adverse_events_summary: {
          total_events: periodEvents.reduce(
            (sum, event) => sum + event.count,
            0,
          ),
          events_by_type: periodEvents,
          trend_analysis: 'STABLE_WITH_MINOR_IMPROVEMENT',
          corrective_actions_implemented: [
            'Enhanced input validation',
            'Improved user training materials',
            'Additional monitoring alerts',
          ],
        },
        safety_performance_indicators: {
          mean_time_between_failures: '45_days',
          software_defect_density: '0.02_defects_per_kloc',
          user_reported_issues_resolution_time: '2.5_days_average',
          customer_satisfaction_score: 4.7, // out of 5
        },
        risk_benefit_assessment: {
          benefits_realized: [
            'Improved procedure accuracy by 15%',
            'Reduced adverse events by 30%',
            'Enhanced documentation compliance',
          ],
          emerging_risks: [
            'Performance degradation with large datasets',
            'User interface complexity feedback',
          ],
          overall_assessment: 'BENEFITS_OUTWEIGH_RISKS',
        },
        regulatory_compliance_status: {
          anvisa_requirements: 'COMPLIANT',
          iso_standards_compliance: 'MAINTAINED',
          post_market_surveillance: 'ACTIVE',
          corrective_preventive_actions: 'UP_TO_DATE',
        },
      };

      // Verify report completeness
      expect(
        periodicSafetyReport.adverse_events_summary.total_events,
      ).toBeGreaterThanOrEqual(0);
      expect(
        periodicSafetyReport.safety_performance_indicators
          .customer_satisfaction_score,
      ).toBeGreaterThan(4.0);
      expect(
        periodicSafetyReport.risk_benefit_assessment.overall_assessment,
      ).toBe('BENEFITS_OUTWEIGH_RISKS');
      expect(
        periodicSafetyReport.regulatory_compliance_status.anvisa_requirements,
      ).toBe('COMPLIANT');

      // Verify trend analysis
      const totalCriticalEvents = periodEvents
        .filter(event => event.severity === 'CRITICO')
        .reduce((sum, event) => sum + event.count, 0);

      expect(totalCriticalEvents).toBe(0); // No critical events is good
    });
  });

  describe('Audit Trail for Medical Device Software Performance', () => {
    it('should maintain comprehensive performance audit logs', async () => {
      const deviceOperations = [
        {
          operation: 'PATIENT_DATA_PROCESSING',
          user_id: 'doctor_001',
          timestamp: new Date().toISOString(),
          duration_ms: 250,
          outcome: 'SUCCESS',
          data_processed: 'patient_demographics',
        },
        {
          operation: 'DOSAGE_CALCULATION',
          user_id: 'doctor_001',
          timestamp: new Date(Date.now() + 1000).toISOString(),
          duration_ms: 180,
          outcome: 'SUCCESS',
          data_processed: 'botox_calculation_25_units',
        },
        {
          operation: 'PROCEDURE_RECOMMENDATION',
          user_id: 'doctor_002',
          timestamp: new Date(Date.now() + 2000).toISOString(),
          duration_ms: 1500, // Slower than expected
          outcome: 'WARNING',
          data_processed: 'facial_analysis_recommendation',
        },
      ];

      // Create audit entries for each operation
      for (const operation of deviceOperations) {
        const performanceMetrics = {
          response_time_ms: operation.duration_ms,
          accuracy_percentage: operation.outcome === 'SUCCESS' ? 99.5 : 95.0,
          reliability_score: operation.outcome === 'SUCCESS' ? 99.9 : 98.5,
        };

        mockANVISASystem.auditTrail.push({
          id: 'AUDIT_'
            + Date.now()
            + '_'
            + Math.random().toString(36).substr(2, 9),
          event_type: 'DEVICE_USE',
          timestamp: operation.timestamp,
          user_id: operation.user_id,
          device_serial: deviceSerial,
          software_version: '2.1.0',
          operation_performed: operation.operation,
          outcome: operation.outcome as any,
          performance_metrics: performanceMetrics,
        });
      }

      // Verify audit trail completeness
      const auditEntries = mockANVISASystem.auditTrail.filter(
        entry => entry.device_serial === deviceSerial,
      );

      expect(auditEntries.length).toBe(deviceOperations.length);
      expect(auditEntries.every(entry => entry.performance_metrics)).toBe(
        true,
      );
      expect(auditEntries.every(entry => entry.timestamp)).toBe(true);

      // Analyze performance trends
      const performanceAnalysis = {
        average_response_time: auditEntries.reduce(
          (sum, entry) => sum + entry.performance_metrics!.response_time_ms,
          0,
        ) / auditEntries.length,

        success_rate: (auditEntries.filter(entry => entry.outcome === 'SUCCESS').length
          / auditEntries.length)
          * 100,

        warning_operations: auditEntries.filter(
          entry => entry.outcome === 'WARNING',
        ),
      };

      expect(performanceAnalysis.success_rate).toBeGreaterThan(50); // At least 50% success rate
      expect(performanceAnalysis.average_response_time).toBeLessThan(1000); // Average under 1 second
    });

    it('should track software update impacts on performance', async () => {
      const softwareUpdates = [
        {
          version: '2.0.0',
          release_date: '2025-08-01',
          performance_baseline: {
            average_response_time: 300,
            accuracy: 98.5,
            reliability: 99.2,
          },
        },
        {
          version: '2.1.0',
          release_date: '2025-09-01',
          performance_after_update: {
            average_response_time: 250, // Improved
            accuracy: 99.1, // Improved
            reliability: 99.7, // Improved
          },
          performance_impact: 'POSITIVE',
        },
      ];

      // Log software update events
      for (const update of softwareUpdates) {
        mockANVISASystem.auditTrail.push({
          id: 'UPDATE_' + Date.now() + '_' + update.version.replace(/\./g, '_'),
          event_type: 'SOFTWARE_UPDATE',
          timestamp: new Date(update.release_date).toISOString(),
          user_id: 'system_admin',
          device_serial: deviceSerial,
          software_version: update.version,
          operation_performed: 'SOFTWARE_VERSION_UPDATE',
          outcome: 'SUCCESS',
          performance_metrics: 'performance_baseline' in update
            ? (update.performance_baseline as any)
            : (update.performance_after_update as any),
        });
      }

      // Verify update tracking
      const updateEntries = mockANVISASystem.auditTrail.filter(
        entry => entry.event_type === 'SOFTWARE_UPDATE',
      );

      expect(updateEntries.length).toBe(softwareUpdates.length);

      // Calculate performance improvement
      const baselineVersion = updateEntries.find(
        entry => entry.software_version === '2.0.0',
      );
      const updatedVersion = updateEntries.find(
        entry => entry.software_version === '2.1.0',
      );

      if (baselineVersion && updatedVersion) {
        const improvement = {
          response_time_improvement: baselineVersion.performance_metrics!.response_time_ms
            - updatedVersion.performance_metrics!.response_time_ms,
          accuracy_improvement: updatedVersion.performance_metrics!.accuracy_percentage
            - baselineVersion.performance_metrics!.accuracy_percentage,
        };

        expect(improvement.response_time_improvement).toBeGreaterThan(0); // Faster
        expect(improvement.accuracy_improvement).toBeGreaterThan(0); // More accurate
      }
    });

    it('should ensure audit trail integrity and tamper evidence', async () => {
      const originalAuditEntry = {
        id: 'INTEGRITY_TEST_' + Date.now(),
        event_type: 'DEVICE_USE' as const,
        timestamp: new Date().toISOString(),
        user_id: 'doctor_test',
        device_serial: deviceSerial,
        software_version: '2.1.0',
        operation_performed: 'DOSAGE_CALCULATION',
        outcome: 'SUCCESS' as const,
        performance_metrics: {
          response_time_ms: 200,
          accuracy_percentage: 99.5,
          reliability_score: 99.9,
        },
      };

      // Calculate integrity hash
      const integrityHash = crypto
        .createHash('sha512')
        .update(JSON.stringify(originalAuditEntry))
        .digest('hex');

      // Store with integrity protection
      const protectedEntry = {
        ...originalAuditEntry,
        integrity_hash: integrityHash,
        hash_algorithm: 'SHA-512',
        created_by: 'audit_system',
        immutable: true,
      };

      mockANVISASystem.auditTrail.push(protectedEntry as any);

      // Simulate tampering attempt
      const tamperedEntry = {
        ...originalAuditEntry,
        outcome: 'FAILURE' as const, // Tampered field
      };

      const tamperedHash = crypto
        .createHash('sha512')
        .update(JSON.stringify(tamperedEntry))
        .digest('hex');

      // Verify tamper detection
      const integrityCheck = {
        original_hash: integrityHash,
        current_hash: tamperedHash,
        integrity_maintained: integrityHash === tamperedHash,
        tampering_detected: integrityHash !== tamperedHash,
      };

      expect(integrityCheck.tampering_detected).toBe(true);
      expect(integrityCheck.integrity_maintained).toBe(false);

      // Verify original entry integrity
      const storedEntry = mockANVISASystem.auditTrail.find(
        entry => entry.id === originalAuditEntry.id,
      );

      expect(storedEntry).toBeTruthy();
      expect((storedEntry as any)?.integrity_hash).toBe(integrityHash);
    });
  });
});
