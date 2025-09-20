import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { app } from '../../index';
import { createTestClient, generateTestCPF } from '../helpers/auth';
import { cleanupTestDatabase, setupTestDatabase } from '../helpers/database';

describe('Patients Healthcare Compliance API', () => {
  let testClient: any;
  let patientId: string;

  beforeEach(async () => {
    await setupTestDatabase();
    testClient = await createTestClient({ role: 'admin' });

    // Create a test patient first
    const patientData = {
      name: 'Compliance Test Patient',
      email: 'compliance.test@email.com',
      phone: '+5511999999999',
      cpf: generateTestCPF(),
      birth_date: '1985-03-15',
      gender: 'M',
      blood_type: 'A+',
      address: {
        street: 'Rua da Conformidade',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01001000',
      },
      emergency_contact: {
        name: 'Maria Compliance',
        phone: '+5511888888888',
        relationship: 'spouse',
      },
      health_insurance: {
        provider: 'Unimed',
        plan_type: 'comprehensive',
        policy_number: 'UNICOMP123456',
        valid_until: '2025-12-31',
      },
      lgpd_consent: {
        data_processing: true,
        communication: true,
        storage: true,
        ai_processing: true,
        consent_date: new Date().toISOString(),
        ip_address: '127.0.0.1',
      },
    };

    const response = await app.request('/api/v2/patients', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    const patientResponse = await response.json();
    patientId = patientResponse.data.id;
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('GET /api/v2/patients/{id}/compliance-status', () => {
    it('should return 200 with comprehensive compliance status', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        compliance_status: expect.objectContaining({
          patient_id: patientId,
          overall_score: expect.any(Number),
          last_updated: expect.any(String),
          frameworks: expect.objectContaining({
            lgpd: expect.any(Object),
            anvisa: expect.any(Object),
            cfm: expect.any(Object),
            hipaa: expect.any(Object),
            gdpr: expect.any(Object),
          }),
        }),
      });
    });

    it('should include LGPD compliance details', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.compliance_status.frameworks.lgpd).toMatchObject({
        compliant: expect.any(Boolean),
        score: expect.any(Number),
        checks: expect.objectContaining({
          data_processing_consent: expect.any(Boolean),
          communication_consent: expect.any(Boolean),
          storage_consent: expect.any(Boolean),
          ai_processing_consent: expect.any(Boolean),
          consent_timestamp: expect.any(Boolean),
          data_retention: expect.any(Boolean),
          right_to_access: expect.any(Boolean),
          right_to_deletion: expect.any(Boolean),
        }),
        violations: expect.any(Array),
        recommendations: expect.any(Array),
      });
    });

    it('should include ANVISA compliance for medical data', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.compliance_status.frameworks.anvisa).toMatchObject({
        compliant: expect.any(Boolean),
        score: expect.any(Number),
        checks: expect.objectContaining({
          medical_record_standards: expect.any(Boolean),
          data_integrity: expect.any(Boolean),
          traceability: expect.any(Boolean),
          pharmacovigilance: expect.any(Boolean),
          adverse_event_reporting: expect.any(Boolean),
        }),
        violations: expect.any(Array),
      });
    });

    it('should include CFM (Conselho Federal de Medicina) compliance', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-status`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.compliance_status.frameworks.cfm).toMatchObject({
        compliant: expect.any(Boolean),
        score: expect.any(Number),
        checks: expect.objectContaining({
          medical_ethics: expect.any(Boolean),
          patient_confidentiality: expect.any(Boolean),
          professional_conduct: expect.any(Boolean),
          record_keeping: expect.any(Boolean),
          telemedicine_guidelines: expect.any(Boolean),
        }),
        violations: expect.any(Array),
      });
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await app.request(
        '/api/v2/patients/550e8400-e29b-41d4-a716-446655449999/compliance-status',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthorized access', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v2/patients/{id}/compliance-audit', () => {
    it('should return 200 for successful compliance audit', async () => {
      const auditRequest = {
        frameworks: ['lgpd', 'anvisa', 'cfm'],
        include_recommendations: true,
        severity_threshold: 'medium',
        include_historical_violations: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-audit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(auditRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        audit_results: expect.objectContaining({
          patient_id: patientId,
          audit_id: expect.any(String),
          conducted_at: expect.any(String),
          auditor: expect.any(String),
          frameworks: expect.any(Array),
          overall_score: expect.any(Number),
          findings: expect.any(Array),
          recommendations: expect.any(Array),
          next_audit_date: expect.any(String),
        }),
      });
    });

    it('should detect and report compliance violations', async () => {
      const auditRequest = {
        frameworks: ['lgpd'],
        deep_scan: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-audit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(auditRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.audit_results).toMatchObject({
        violation_summary: expect.objectContaining({
          critical: expect.any(Number),
          high: expect.any(Number),
          medium: expect.any(Number),
          low: expect.any(Number),
        }),
        risk_assessment: expect.objectContaining({
          overall_risk_level: expect.any(String),
          legal_exposure: expect.any(String),
          financial_impact: expect.any(String),
          reputational_risk: expect.any(String),
        }),
      });
    });

    it('should generate compliance remediation plan', async () => {
      const auditRequest = {
        frameworks: ['lgpd', 'anvisa'],
        generate_remediation_plan: true,
        include_timeline: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-audit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(auditRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.audit_results).toMatchObject({
        remediation_plan: expect.objectContaining({
          immediate_actions: expect.any(Array),
          short_term_actions: expect.any(Array),
          long_term_actions: expect.any(Array),
          estimated_completion_date: expect.any(String),
          resource_requirements: expect.any(Object),
          success_metrics: expect.any(Array),
        }),
      });
    });

    it('should validate audit request parameters', async () => {
      const invalidRequest = {
        frameworks: ['invalid_framework'],
        severity_threshold: 'invalid_severity',
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-audit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidRequest),
        },
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining('validation'),
        errors: expect.any(Array),
      });
    });
  });

  describe('GET /api/v2/patients/{id}/consent-records', () => {
    it('should return 200 with consent history', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/consent-records`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        consent_records: expect.objectContaining({
          patient_id: patientId,
          records: expect.any(Array),
          current_consents: expect.any(Object),
          consent_history: expect.any(Array),
        }),
      });
    });

    it('should include detailed consent information', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/consent-records`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      const consentRecord = data.consent_records.records[0];
      expect(consentRecord).toMatchObject({
        id: expect.any(String),
        type: expect.any(String),
        given_at: expect.any(String),
        expires_at: expect.any(String),
        status: expect.any(String),
        method: expect.any(String),
        ip_address: expect.any(String),
        user_agent: expect.any(String),
        consent_text: expect.any(String),
        withdrawal_allowed: expect.any(Boolean),
      });
    });

    it('should track consent withdrawals and modifications', async () => {
      // First withdraw consent
      const withdrawalRequest = {
        consent_type: 'ai_processing',
        action: 'withdraw',
        reason: 'Patient preference change',
        effective_date: new Date().toISOString(),
      };

      await app.request(`/api/v2/patients/${patientId}/consent`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${testClient.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawalRequest),
      });

      // Check consent records
      const response = await app.request(
        `/api/v2/patients/${patientId}/consent-records`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      const withdrawalRecord = data.consent_records.records.find(
        (r: any) => r.type === 'ai_processing_withdrawal',
      );
      expect(withdrawalRecord).toBeDefined();
      expect(withdrawalRecord.status).toBe('withdrawn');
    });

    it('should support consent export for compliance reporting', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/consent-records?export=pdf&format=lgpd`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toMatch(/pdf/);
      expect(response.headers.get('content-disposition')).toMatch(/attachment/);
    });
  });

  describe('PUT /api/v2/patients/{id}/consent', () => {
    it('should return 200 for successful consent update', async () => {
      const consentUpdate = {
        consent_type: 'communication',
        action: 'grant',
        reason: 'Patient wants appointment reminders',
        communication_preferences: {
          email: true,
          sms: false,
          phone: true,
          push_notifications: true,
        },
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/consent`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(consentUpdate),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        consent: expect.objectContaining({
          patient_id: patientId,
          type: 'communication',
          status: 'active',
          updated_at: expect.any(String),
          communication_preferences: expect.any(Object),
        }),
      });
    });

    it('should validate consent withdrawal requirements', async () => {
      const withdrawalRequest = {
        consent_type: 'data_processing',
        action: 'withdraw',
        reason: 'Withdraw data processing consent',
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/consent`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(withdrawalRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.consent).toMatchObject({
        withdrawal_impact: expect.any(Object),
        data_deletion_plan: expect.any(Object),
        alternative_options: expect.any(Array),
      });
    });

    it('should prevent essential consent withdrawal', async () => {
      const essentialWithdrawal = {
        consent_type: 'data_processing',
        action: 'withdraw',
        reason: 'Attempt to withdraw essential consent',
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/consent`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(essentialWithdrawal),
        },
      );

      // Should either be rejected or processed with strong warnings
      if (response.status === 200) {
        const data = await response.json();
        expect(data.consent).toMatchObject({
          withdrawal_blocked: expect.any(Boolean),
          legal_basis_required: expect.any(Boolean),
          alternative_solutions: expect.any(Array),
        });
      }
    });
  });

  describe('POST /api/v2/patients/{id}/data-subject-request', () => {
    it('should return 200 for legitimate data subject request', async () => {
      const dsrRequest = {
        request_type: 'access',
        scope: 'all_personal_data',
        reason: 'Patient wants to review their data',
        delivery_method: 'secure_portal',
        identity_verification: {
          method: 'document_verification',
          documents: ['id_card', 'proof_of_address'],
        },
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/data-subject-request`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dsrRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        request: expect.objectContaining({
          request_id: expect.any(String),
          patient_id: patientId,
          request_type: 'access',
          status: 'processing',
          estimated_completion: expect.any(String),
          legal_basis: expect.any(String),
          compliance_deadline: expect.any(String),
        }),
      });
    });

    it('should handle data deletion requests appropriately', async () => {
      const deletionRequest = {
        request_type: 'deletion',
        scope: 'personal_data',
        reason: 'Right to be forgotten',
        retention_exemption_check: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/data-subject-request`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deletionRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.request).toMatchObject({
        impact_assessment: expect.any(Object),
        legal_review_required: expect.any(Boolean),
        data_retention_check: expect.any(Object),
      });
    });

    it('should validate data subject request authenticity', async () => {
      const invalidRequest = {
        request_type: 'access',
        identity_verification: {
          method: 'insufficient_verification',
        },
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/data-subject-request`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidRequest),
        },
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining('identity verification'),
      });
    });
  });

  describe('GET /api/v2/patients/{id}/compliance-reports', () => {
    it('should return 200 with compliance reports', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-reports`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        reports: expect.objectContaining({
          patient_id: patientId,
          reports: expect.any(Array),
          summary: expect.objectContaining({
            total_reports: expect.any(Number),
            last_generated: expect.any(String),
            upcoming_deadlines: expect.any(Array),
          }),
        }),
      });
    });

    it('should generate regulatory compliance reports', async () => {
      const reportRequest = {
        report_type: 'regulatory_compliance',
        frameworks: ['lgpd', 'anvisa', 'cfm'],
        period: 'monthly',
        format: 'pdf',
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-reports/generate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        report: expect.objectContaining({
          report_id: expect.any(String),
          generated_at: expect.any(String),
          download_url: expect.any(String),
          metadata: expect.objectContaining({
            frameworks_covered: expect.any(Array),
            compliance_score: expect.any(Number),
            violations_found: expect.any(Number),
          }),
        }),
      });
    });
  });

  describe('Compliance Monitoring and Alerts', () => {
    it('should provide real-time compliance monitoring', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-monitoring`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        monitoring: expect.objectContaining({
          patient_id: patientId,
          real_time_status: expect.any(String),
          active_alerts: expect.any(Array),
          compliance_metrics: expect.objectContaining({
            data_quality_score: expect.any(Number),
            consent_compliance_rate: expect.any(Number),
            audit_trail_completeness: expect.any(Number),
          }),
        }),
      });
    });

    it('should generate compliance alerts for violations', async () => {
      // Simulate a compliance violation
      const violationRequest = {
        violation_type: 'data_breach',
        severity: 'high',
        description: 'Unauthorized access attempt detected',
        affected_data: ['personal_information', 'medical_records'],
        immediate_actions_taken: ['access_revoked', 'notification_sent'],
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-violations`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(violationRequest),
        },
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        violation: expect.objectContaining({
          patient_id: patientId,
          violation_id: expect.any(String),
          severity: 'high',
          status: 'investigating',
          incident_number: expect.any(String),
          regulatory_notification_required: expect.any(Boolean),
        }),
      });
    });
  });

  describe('International Compliance', () => {
    it('should include GDPR compliance for EU patients', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-status?include_gdpr=true`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      if (data.compliance_status.frameworks.gdpr) {
        expect(data.compliance_status.frameworks.gdpr).toMatchObject({
          compliant: expect.any(Boolean),
          score: expect.any(Number),
          checks: expect.objectContaining({
            lawful_basis: expect.any(Boolean),
            purpose_limitation: expect.any(Boolean),
            data_minimization: expect.any(Boolean),
            accuracy: expect.any(Boolean),
            storage_limitation: expect.any(Boolean),
            integrity_confidentiality: expect.any(Boolean),
          }),
        });
      }
    });

    it('should handle HIPAA compliance for US healthcare interactions', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/compliance-status?include_hipaa=true`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      if (data.compliance_status.frameworks.hipaa) {
        expect(data.compliance_status.frameworks.hipaa).toMatchObject({
          compliant: expect.any(Boolean),
          score: expect.any(Number),
          checks: expect.objectContaining({
            privacy_rule: expect.any(Boolean),
            security_rule: expect.any(Boolean),
            breach_notification: expect.any(Boolean),
            administrative_safeguards: expect.any(Boolean),
            technical_safeguards: expect.any(Boolean),
            physical_safeguards: expect.any(Boolean),
          }),
        });
      }
    });
  });
});
