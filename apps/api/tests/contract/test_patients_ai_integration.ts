import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { app } from '../../index';
import { createTestClient, generateTestCPF } from '../helpers/auth';
import { cleanupTestDatabase, setupTestDatabase } from '../helpers/database';

describe('Patients AI Integration API', () => {
  let testClient: any;
  let patientId: string;

  beforeEach(async () => {
    await setupTestDatabase();
    testClient = await createTestClient({ role: 'admin' });

    // Create a test patient first
    const patientData = {
      name: 'AI Integration Test Patient',
      email: 'ai.test@email.com',
      phone: '+5511999999999',
      cpf: generateTestCPF(),
      birth_date: '1985-03-15',
      gender: 'M',
      blood_type: 'A+',
      address: {
        street: 'Rua da Inteligência Artificial',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01001000',
      },
      emergency_contact: {
        name: 'Maria IA',
        phone: '+5511888888888',
        relationship: 'spouse',
      },
      health_insurance: {
        provider: 'Unimed',
        plan_type: 'comprehensive',
        policy_number: 'UNIAI123456',
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

  describe('POST /api/v2/patients/{id}/ai-insights', () => {
    it('should return 200 for successful AI insights generation', async () => {
      const insightsRequest = {
        analysis_type: 'risk_assessment',
        data_sources: ['medical_history', 'demographics', 'lifestyle'],
        models: ['risk_prediction', 'compliance_scoring'],
        include_recommendations: true,
        include_confidence_scores: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-insights`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(insightsRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        insights: expect.objectContaining({
          patient_id: patientId,
          analysis_type: 'risk_assessment',
          generated_at: expect.any(String),
          model_version: expect.any(String),
          insights: expect.any(Array),
          confidence_scores: expect.any(Object),
          recommendations: expect.any(Array),
        }),
      });
    });

    it('should require AI processing consent', async () => {
      // Create patient without AI consent
      const patientNoAIConsent = {
        name: 'No AI Consent Patient',
        email: 'no.ai.consent@email.com',
        cpf: generateTestCPF(),
        birth_date: '1990-01-01',
        gender: 'M',
        lgpd_consent: {
          data_processing: true,
          communication: true,
          storage: true,
          ai_processing: false, // No AI consent
          consent_date: new Date().toISOString(),
          ip_address: '127.0.0.1',
        },
      };

      const createResponse = await app.request('/api/v2/patients', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${testClient.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientNoAIConsent),
      });

      const patientData = await createResponse.json();
      const patientWithoutAIConsentId = patientData.data.id;

      const insightsRequest = {
        analysis_type: 'risk_assessment',
      };

      const response = await app.request(
        `/api/v2/patients/${patientWithoutAIConsentId}/ai-insights`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(insightsRequest),
        },
      );

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining('AI processing consent'),
      });
    });

    it('should validate AI insights request parameters', async () => {
      const invalidRequest = {
        analysis_type: 'invalid_analysis_type',
        data_sources: ['invalid_source'],
        models: ['invalid_model'],
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-insights`,
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

    it('should include compliance validation in AI insights', async () => {
      const insightsRequest = {
        analysis_type: 'compliance_assessment',
        include_compliance_validation: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-insights`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(insightsRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.insights).toMatchObject({
        compliance_validation: expect.objectContaining({
          lgpd_compliant: expect.any(Boolean),
          anvisa_guidelines_followed: expect.any(Boolean),
          cfm_standards_met: expect.any(Boolean),
          data_classification: expect.any(String),
          risk_level: expect.any(String),
        }),
      });
    });

    it('should enforce rate limiting on AI insights requests', async () => {
      const insightsRequest = {
        analysis_type: 'risk_assessment',
      };

      // Make multiple rapid requests
      const requests = Array.from(
        { length: 6 },
        () =>
          app.request(`/api/v2/patients/${patientId}/ai-insights`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${testClient.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(insightsRequest),
          }),
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses.find(r => r.status === 429);

      expect(rateLimitedResponse).toBeDefined();
    });

    it('should include audit trail for AI processing', async () => {
      const insightsRequest = {
        analysis_type: 'risk_assessment',
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-insights`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Request-ID': 'ai-insights-test-123',
          },
          body: JSON.stringify(insightsRequest),
        },
      );

      expect(response.status).toBe(200);

      // Check audit trail was created
      const auditResponse = await app.request(
        `/api/v2/patients/${patientId}/audit-trail`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const auditData = await auditResponse.json();
      const aiProcessingEntry = auditData.data.audit_trail.find(
        (entry: any) => entry.action === 'ai_insights_generated',
      );
      expect(aiProcessingEntry).toBeDefined();
    });
  });

  describe('POST /api/v2/patients/{id}/ai-predictions', () => {
    it('should return 200 for successful AI predictions', async () => {
      const predictionRequest = {
        prediction_types: [
          'no_show_risk',
          'readmission_risk',
          'medication_adherence',
        ],
        timeframe_days: 30,
        include_confidence_intervals: true,
        include_explanations: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-predictions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(predictionRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        predictions: expect.objectContaining({
          patient_id: patientId,
          generated_at: expect.any(String),
          model_version: expect.any(String),
          timeframe_days: 30,
          predictions: expect.any(Array),
        }),
      });

      // Validate specific prediction types
      expect(data.predictions.predictions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'no_show_risk',
            risk_score: expect.any(Number),
            confidence_interval: expect.any(Array),
            explanation: expect.any(String),
          }),
          expect.objectContaining({
            type: 'readmission_risk',
            risk_score: expect.any(Number),
            confidence_interval: expect.any(Array),
            explanation: expect.any(String),
          }),
          expect.objectContaining({
            type: 'medication_adherence',
            adherence_score: expect.any(Number),
            confidence_interval: expect.any(Array),
            explanation: expect.any(String),
          }),
        ]),
      );
    });

    it('should validate prediction timeframes and parameters', async () => {
      const invalidRequest = {
        prediction_types: ['invalid_prediction'],
        timeframe_days: -1, // Invalid timeframe
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-predictions`,
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
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'timeframe_days',
            message: expect.stringContaining('positive'),
          }),
        ]),
      );
    });

    it('should include ethical considerations in predictions', async () => {
      const predictionRequest = {
        prediction_types: ['treatment_recommendation'],
        include_ethical_assessment: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-predictions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(predictionRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      const prediction = data.predictions.predictions.find(
        (p: any) => p.type === 'treatment_recommendation',
      );
      expect(prediction).toMatchObject({
        ethical_assessment: expect.objectContaining({
          bias_detected: expect.any(Boolean),
          fairness_score: expect.any(Number),
          transparency_level: expect.any(String),
          human_overrides_required: expect.any(Boolean),
        }),
      });
    });

    it('should enforce prediction usage limits', async () => {
      const predictionRequest = {
        prediction_types: [
          'no_show_risk',
          'readmission_risk',
          'medication_adherence',
        ],
      };

      // Make multiple requests to test usage limits
      const requests = Array.from(
        { length: 15 },
        () =>
          app.request(`/api/v2/patients/${patientId}/ai-predictions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${testClient.token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(predictionRequest),
          }),
      );

      const responses = await Promise.all(requests);
      const limitedResponse = responses.find(r => r.status === 429);

      expect(limitedResponse).toBeDefined();
    });
  });

  describe('POST /api/v2/patients/{id}/ai-recommendations', () => {
    it('should return 200 for successful AI recommendations', async () => {
      const recommendationRequest = {
        context: 'appointment_scheduling',
        preferences: {
          time_slots: ['morning', 'afternoon'],
          location_preference: 'nearby',
          language: 'pt-BR',
        },
        constraints: {
          mobility_limitations: false,
          transportation_needs: 'none',
          accessibility_requirements: ['wheelchair_accessible'],
        },
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-recommendations`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recommendationRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        recommendations: expect.objectContaining({
          patient_id: patientId,
          context: 'appointment_scheduling',
          generated_at: expect.any(String),
          recommendations: expect.any(Array),
          reasoning: expect.any(Object),
        }),
      });
    });

    it('should provide personalized recommendations based on patient history', async () => {
      const recommendationRequest = {
        context: 'treatment_adherence',
        include_historical_data: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-recommendations`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recommendationRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.recommendations).toMatchObject({
        personalization_factors: expect.objectContaining({
          age_group: expect.any(String),
          location: expect.any(String),
          insurance_type: expect.any(String),
          historical_patterns: expect.any(Array),
        }),
      });
    });

    it('should include cultural and regional adaptations for Brazilian patients', async () => {
      const recommendationRequest = {
        context: 'health_education',
        target_demographic: 'brazilian_adult',
        cultural_context: 'urban_sao_paulo',
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-recommendations`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recommendationRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.recommendations).toMatchObject({
        cultural_adaptations: expect.objectContaining({
          language: 'pt-BR',
          health_system_context: expect.stringContaining('SUS'),
          regional_considerations: expect.any(Array),
          cultural_sensitivity_score: expect.any(Number),
        }),
      });
    });

    it('should validate recommendation safety and appropriateness', async () => {
      const recommendationRequest = {
        context: 'treatment_planning',
        include_safety_validation: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-recommendations`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recommendationRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.recommendations).toMatchObject({
        safety_validation: expect.objectContaining({
          contraindications_checked: expect.any(Boolean),
          drug_interactions_screened: expect.any(Boolean),
          age_appropriate: expect.any(Boolean),
          emergency_warnings: expect.any(Array),
        }),
      });
    });
  });

  describe('POST /api/v2/patients/{id}/ai-chat', () => {
    it('should return 200 for successful AI chat interaction', async () => {
      const chatRequest = {
        message: 'Qual é o horário de funcionamento da clínica?',
        context: 'general_inquiry',
        include_medical_context: false,
        language: 'pt-BR',
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-chat`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chatRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        response: expect.objectContaining({
          patient_id: patientId,
          message_id: expect.any(String),
          response_text: expect.any(String),
          confidence_score: expect.any(Number),
          sources: expect.any(Array),
          requires_human_followup: expect.any(Boolean),
        }),
      });
    });

    it('should handle medical inquiries with appropriate disclaimers', async () => {
      const medicalInquiryRequest = {
        message: 'Estes sintomas indicam algo grave?',
        context: 'medical_inquiry',
        include_medical_context: true,
        language: 'pt-BR',
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-chat`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(medicalInquiryRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.response).toMatchObject({
        medical_disclaimer: expect.stringContaining(
          'não substitui aconselhamento',
        ),
        urgency_assessment: expect.any(String),
        recommended_actions: expect.any(Array),
        requires_human_followup: expect.any(Boolean),
      });
    });

    it('should prevent inappropriate AI chat usage', async () => {
      const inappropriateRequest = {
        message: 'Como falsificar receita médica?',
        context: 'malicious_request',
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-chat`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inappropriateRequest),
        },
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining('inappropriate'),
        content_policy_violation: expect.any(Boolean),
      });
    });

    it('should maintain chat history with proper consent', async () => {
      // First message
      const firstMessage = {
        message: 'Oi, preciso de ajuda',
        context: 'general_inquiry',
        save_to_history: true,
      };

      const firstResponse = await app.request(
        `/api/v2/patients/${patientId}/ai-chat`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(firstMessage),
        },
      );

      expect(firstResponse.status).toBe(200);

      // Second message referencing history
      const secondMessage = {
        message: 'Você pode repetir o que disse antes?',
        context: 'follow_up',
        reference_previous: true,
      };

      const secondResponse = await app.request(
        `/api/v2/patients/${patientId}/ai-chat`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(secondMessage),
        },
      );

      expect(secondResponse.status).toBe(200);
      const secondData = await secondResponse.json();

      expect(secondData.response).toMatchObject({
        context_aware: expect.any(Boolean),
        previous_messages_referenced: expect.any(Number),
      });
    });

    it('should provide real-time chat for urgent inquiries', async () => {
      const urgentRequest = {
        message: 'Estou sentindo dor no peito',
        context: 'urgent_medical',
        priority: 'high',
        include_emergency_guidance: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-chat`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(urgentRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.response).toMatchObject({
        emergency_guidance: expect.any(Array),
        immediate_actions: expect.any(Array),
        escalation_triggered: expect.any(Boolean),
        response_time_ms: expect.any(Number),
      });
    });
  });

  describe('AI Model Management', () => {
    it('should provide model information and capabilities', async () => {
      const response = await app.request('/api/v2/patients/ai/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testClient.token}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        models: expect.any(Array),
        capabilities: expect.objectContaining({
          risk_prediction: expect.any(Boolean),
          treatment_recommendation: expect.any(Boolean),
          chat_interaction: expect.any(Boolean),
          compliance_validation: expect.any(Boolean),
        }),
      });
    });

    it('should validate model health and performance', async () => {
      const response = await app.request('/api/v2/patients/ai/health', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${testClient.token}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        health_status: expect.objectContaining({
          overall: expect.any(String),
          models: expect.any(Array),
          latency_ms: expect.any(Number),
          error_rate: expect.any(Number),
        }),
      });
    });
  });

  describe('Security and Compliance', () => {
    it('should enforce data privacy in AI processing', async () => {
      const privacyCheckRequest = {
        analysis_type: 'privacy_audit',
        include_data_minimization: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-insights`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(privacyCheckRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.insights).toMatchObject({
        privacy_compliance: expect.objectContaining({
          data_minimization_applied: expect.any(Boolean),
          anonymization_level: expect.any(String),
          purpose_limitation: expect.any(Boolean),
          retention_compliance: expect.any(Boolean),
        }),
      });
    });

    it('should provide explainable AI outcomes', async () => {
      const explainabilityRequest = {
        prediction_types: ['no_show_risk'],
        include_explainability: true,
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/ai-predictions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(explainabilityRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      const prediction = data.predictions.predictions[0];
      expect(prediction).toMatchObject({
        explainability: expect.objectContaining({
          feature_importance: expect.any(Array),
          decision_path: expect.any(Array),
          confidence_factors: expect.any(Array),
          model_interpretability: expect.any(String),
        }),
      });
    });
  });
});
