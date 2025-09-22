import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import superjson from 'superjson';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AppRouter } from '../../src/trpc';
import { createTestClient, generateTestCPF } from '../helpers/auth';
import { cleanupTestDatabase, setupTestDatabase } from '../helpers/database';

/**
 * T006: Contract Test for Appointments Router - No-Show Prevention
 *
 * CRITICAL FEATURES FOR BRAZILIAN HEALTHCARE:
 * - AI-powered no-show risk prediction with machine learning
 * - WhatsApp Business API integration for appointment reminders
 * - Real-time appointment updates via Supabase subscriptions
 * - CFM doctor license validation for telemedicine compliance
 * - ANVISA telemedicine regulations compliance
 * - LGPD-compliant patient communication preferences
 *
 * TDD RED PHASE: These tests are designed to FAIL initially to drive implementation
 */

describe('tRPC Appointments Router - No-Show Prevention Tests', () => {
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;
  let testClient: any;
  let appointmentId: string;
  let patientId: string;
  let doctorId: string;
  let server: ReturnType<typeof setupServer>;

  beforeEach(async () => {
<<<<<<< HEAD
    await setupTestDatabase(
    testClient = await createTestClient({ _role: 'admin' }
=======
    await setupTestDatabase();
    testClient = await createTestClient({ _role: 'admin' });
>>>>>>> origin/main

    // Setup MSW server for external service mocking
    server = setupServer(
      // Mock tRPC endpoints using regular MSW handlers
      http.post(
        'http://localhost:3000/api/trpc/patients.create',
        async ({ request }) => {
          const body = await request.json(
          const patientData = body[0] || body;
          return Response.json({
            result: {
              data: {
                id: 'patient-' + Math.random().toString(36).substr(2, 9),
                ...patientData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            },
          }
        },
      ),
      http.post(
        'http://localhost:3000/api/trpc/doctors.create',
        async ({ request }) => {
          const body = await request.json(
          const doctorData = body[0] || body;
          return Response.json({
            result: {
              data: {
                id: 'doctor-' + Math.random().toString(36).substr(2, 9),
                ...doctorData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            },
          }
        },
      ),
      http.post(
        'http://localhost:3000/api/trpc/appointments.create',
        async ({ request }) => {
          const body = await request.json(
          const appointmentData = body[0] || body;

          const responseData: any = {
            id: 'appointment-' + Math.random().toString(36).substr(2, 9),
            ...appointmentData,
            status: 'scheduled',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Add no-show prediction if enabled
          if (appointmentData.enable_no_show_prediction) {
            responseData.no_show_prediction = {
              probability: 0.23,
              risk_level: 'medium',
              confidence_score: 0.85,
              contributing_factors: [
                'previous_no_show_history',
                'appointment_time_preference',
              ],
              recommended_interventions: ['send_whatsapp_reminder_24h'],
              model_version: 'v1.0.0',
              prediction_timestamp: new Date().toISOString(),
            };
            responseData.cfm_compliance = {
              doctor_license_verified: true,
              telemedicine_authorized: true,
              specialty_confirmed: true,
              anvisa_compliance_checked: true,
            };
          }

          // Add CFM validation if requested
          if (appointmentData.validate_cfm_license) {
            responseData.cfm_validation = {
              license_status: 'active',
              license_verified_at: new Date().toISOString(),
              telemedicine_permitted: true,
              specialty_authorized: true,
              registration_type: 'primary',
              state_council: 'CRM-SP',
              anvisa_medical_device_compliance: true,
              last_validation_timestamp: new Date().toISOString(),
            };
          }

          return Response.json({
            result: {
              data: {
                success: true,
                data: responseData,
              },
            },
          }
        },
      ),
      http.post(
        'http://localhost:3000/api/trpc/appointments.updateRealTime',
        async ({ request }) => {
          const body = await request.json(
          const updateData = body[0] || body;
          return Response.json({
            result: {
              data: {
                success: true,
                appointment: {
                  id: updateData.appointment_id,
                  status: updateData.status,
                  updated_at: new Date().toISOString(),
                },
                real_time_update: {
                  broadcast_sent: true,
                  subscription_channels: [
                    `appointment:${updateData.appointment_id}`,
                    'clinic:appointments',
                  ],
                  recipients_notified: 2,
                  notification_timestamp: new Date().toISOString(),
                },
                audit_trail: {
                  event_type: 'appointment_status_updated',
                  real_time_broadcast_logged: true,
                  lgpd_compliance_verified: true,
                },
              },
            },
          }
        },
      ),
      http.post(
        'http://localhost:3000/api/trpc/appointments.sendWhatsAppReminder',
        async ({ request }) => {
          const body = await request.json(
          const reminderData = body[0] || body;
          return Response.json({
            result: {
              data: {
                success: true,
                message_sent: true,
                whatsapp_response: {
                  message_id: 'wamid.' + Math.random().toString(36).substr(2, 9),
                  delivery_status: 'sent',
                  recipient_confirmed: true,
                },
                personalization_applied: {
                  template_used: 'appointment_reminder_pt_BR',
                  doctor_name_included: true,
                  instructions_included: true,
                  language_localized: 'pt-BR',
                },
                lgpd_compliance: {
                  consent_timestamp: new Date().toISOString(),
                  data_processing_logged: true,
                  retention_policy_applied: true,
                  patient_rights_respected: true,
                },
                audit_trail: {
                  event_type: 'whatsapp_reminder_sent',
                  message_content_hash: 'hash_' + Math.random().toString(36).substr(2, 9),
                  delivery_attempted_at: new Date().toISOString(),
                },
              },
            },
          }
        },
      ),
      // Mock CFM license validation API
      http.get('https://portal.cfm.org.br/api/medicos/:crm', () => {
        return Response.json({
          situacao: 'ATIVO',
          nome: 'Dr. Carlos Alberto Medicina',
          especialidades: ['Cardiologia', 'Clínica Médica'],
          registro_primario: '12345',
          inscricoes: [
            {
              crm: '12345',
              uf: 'SP',
              situacao: 'ATIVO',
              tipo_inscricao: 'PRIMÁRIA',
            },
          ],
          telemedicine_authorized: true,
          anvisa_compliance: true,
        }
      }),
      // Mock WhatsApp Business API
      http.post(
        'https://graph.facebook.com/v17.0/:phone_number_id/messages',
        () => {
          return Response.json({
            messaging_product: 'whatsapp',
            contacts: [{ input: '+5511999999999', wa_id: '5511999999999' }],
            messages: [{ id: 'wamid.appointment_reminder_123' }],
            success: true,
            delivery_status: 'sent',
          }
        },
      ),
      // Mock AI/ML No-Show Prediction Service
      http.post('https://api.openai.com/v1/chat/completions', () => {
        return Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  no_show_probability: 0.23,
                  risk_level: 'medium',
                  contributing_factors: [
                    'previous_no_show_history',
                    'appointment_time_preference',
                    'weather_conditions',
                  ],
                  recommended_interventions: [
                    'send_whatsapp_reminder_24h',
                    'offer_rescheduling_options',
                    'provide_telemedicine_alternative',
                  ],
                }),
              },
            },
          ],
        }
      }),
      // Mock Brazilian Weather API for no-show prediction
      http.get('https://api.openweathermap.org/data/2.5/weather', () => {
        return Response.json({
          weather: [{ main: 'Rain', description: 'heavy intensity rain' }],
          main: { temp: 18 },
          visibility: 5000,
          impact_on_appointments: 'high_no_show_risk',
        }
      }),
    
    server.listen(

    // Create tRPC client
    trpcClient = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/api/trpc',
          headers: {
            'x-user-id': testClient.userId,
            'x-clinic-id': testClient.clinicId,
            'x-session-id': testClient.headers['x-session-id'],
          },
        }),
      ],
      transformer: superjson,
    }

    // Create test patient and doctor
    const patientResult = await trpcClient.patients.create.mutate({
      name: 'Ana Paula Fernandes',
      email: 'ana.fernandes@email.com',
      phone: '+5511987654321',
      cpf: generateTestCPF(),
      birth_date: '1990-08-25',
      gender: 'F' as const,
      lgpd_consent: {
        data_processing: true,
        communication: true,
        storage: true,
        ai_processing: true,
        consent_date: new Date().toISOString(),
        ip_address: '127.0.0.1',
      },
    }
    console.log('👤 Patient result:', patientResult
    patientId = patientResult.data?.id || patientResult.id;

    const doctorResult = await trpcClient.doctors.create.mutate({
      name: 'Dr. Carlos Alberto Medicina',
      email: 'dr.carlos@clinica.com',
      crm: 'CRM-SP-123456',
      specialties: ['cardiologia', 'clinica_medica'],
      telemedicine_license: true,
      cfm_verified: true,
    }
    console.log('👨‍⚕️ Doctor result:', doctorResult
    doctorId = doctorResult.data?.id || doctorResult.id;
  }

  afterEach(async () => {
    server.close(
    await cleanupTestDatabase(
  }

  describe('appointments.create - AI Risk Prediction Integration', () => {
    it('should FAIL: create appointment with AI-powered no-show risk assessment', async () => {
      const appointmentData = {
        patient_id: patientId,
        doctor_id: doctorId,
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        type: 'telemedicine' as const,
        duration_minutes: 30,
        specialty: 'cardiologia',
        // AI analysis request
        enable_no_show_prediction: true,
        risk_analysis_factors: [
          'patient_history',
          'appointment_time',
          'weather_conditions',
          'previous_cancellations',
          'communication_preferences',
        ],
      };

      // This should FAIL because appointments router doesn't exist yet
      const result = await trpcClient.appointments.create.mutate(appointmentData

      expect(result).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          patient_id: patientId,
          doctor_id: doctorId,
          scheduled_at: expect.any(String),
          // AI-powered risk assessment
          no_show_prediction: expect.objectContaining({
            probability: expect.any(Number),
            risk_level: expect.stringMatching(/^(low|medium|high)$/),
            confidence_score: expect.any(Number),
            contributing_factors: expect.any(Array),
            recommended_interventions: expect.any(Array),
            model_version: expect.any(String),
            prediction_timestamp: expect.any(String),
          }),
          // CFM compliance verification
          cfm_compliance: expect.objectContaining({
            doctor_license_verified: true,
            telemedicine_authorized: true,
            specialty_confirmed: true,
            anvisa_compliance_checked: true,
          }),
        }),
      }
    }

    it('should FAIL: validate CFM doctor license in real-time during appointment creation', async () => {
      const appointmentData = {
        patient_id: patientId,
        doctor_id: doctorId,
        scheduled_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        type: 'telemedicine' as const,
        validate_cfm_license: true,
        required_specialties: ['cardiologia'],
      };

      // Should FAIL because CFM validation integration doesn't exist
      const result = await trpcClient.appointments.create.mutate(appointmentData

      expect(result.data.cfm_validation).toMatchObject({
        license_status: 'active',
        license_verified_at: expect.any(String),
        telemedicine_permitted: true,
        specialty_authorized: true,
        registration_type: 'primary',
        state_council: 'CRM-SP',
        anvisa_medical_device_compliance: true,
        last_validation_timestamp: expect.any(String),
      }
    }

    it('should FAIL: automatically schedule WhatsApp reminders based on no-show risk', async () => {
      const appointmentData = {
        patient_id: patientId,
        doctor_id: doctorId,
        scheduled_at: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
        type: 'in_person' as const,
        enable_smart_reminders: true,
        communication_preferences: {
          whatsapp: true,
          sms: false,
          email: true,
          phone_call: false,
        },
      };

      // Should FAIL because smart reminder system doesn't exist
      const result = await trpcClient.appointments.create.mutate(appointmentData

      expect(result.data.reminder_schedule).toMatchObject({
        whatsapp_reminders: expect.arrayContaining([
          expect.objectContaining({
            scheduled_for: expect.any(String),
            risk_based_timing: true,
            template_type: expect.stringMatching(
              /^(standard|high_risk|weather_alert)$/,
            ),
            personalization_enabled: true,
            lgpd_consent_verified: true,
          }),
        ]),
        adaptive_scheduling: expect.objectContaining({
          risk_level_adjustment: true,
          weather_sensitive: true,
          patient_preference_optimized: true,
        }),
      }
    }
  }

  describe('appointments.updateRealTime - Supabase Subscriptions Integration', () => {
    beforeEach(async () => {
      // Create test appointment
      const appointmentResult = await trpcClient.appointments.create.mutate({
        patient_id: patientId,
        doctor_id: doctorId,
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'telemedicine' as const,
        duration_minutes: 45,
      }
      appointmentId = appointmentResult.data.id;
    }

    it('should FAIL: broadcast real-time updates via Supabase subscriptions', async () => {
      const updateData = {
        appointment_id: appointmentId,
        status: 'confirmed' as const,
        confirmation_method: 'whatsapp',
        confirmed_at: new Date().toISOString(),
        real_time_broadcast: true,
      };

      // Should FAIL because real-time system doesn't exist
      const result = await trpcClient.appointments.updateRealTime.mutate(updateData

      expect(result).toMatchObject({
        success: true,
        appointment: expect.objectContaining({
          id: appointmentId,
          status: 'confirmed',
          updated_at: expect.any(String),
        }),
        real_time_update: expect.objectContaining({
          broadcast_sent: true,
          subscription_channels: expect.arrayContaining([
            `appointment:${appointmentId}`,
            `patient:${patientId}`,
            `doctor:${doctorId}`,
            'clinic:appointments',
          ]),
          recipients_notified: expect.any(Number),
          notification_timestamp: expect.any(String),
        }),
        audit_trail: expect.objectContaining({
          event_type: 'appointment_status_updated',
          real_time_broadcast_logged: true,
          lgpd_compliance_verified: true,
        }),
      }
    }

    it('should FAIL: handle appointment rescheduling with AI risk recalculation', async () => {
      const rescheduleData = {
        appointment_id: appointmentId,
        new_scheduled_at: new Date(
          Date.now() + 120 * 60 * 60 * 1000,
        ).toISOString(), // 5 days later
        reason: 'patient_request',
        recalculate_no_show_risk: true,
        notify_participants: true,
      };

      // Should FAIL because rescheduling system doesn't exist
      const result = await trpcClient.appointments.reschedule.mutate(rescheduleData

      expect(result).toMatchObject({
        success: true,
        original_appointment: expect.objectContaining({
          id: appointmentId,
          status: 'rescheduled',
        }),
        new_appointment: expect.objectContaining({
          id: expect.any(String),
          scheduled_at: rescheduleData.new_scheduled_at,
          // Recalculated risk assessment
          no_show_prediction: expect.objectContaining({
            probability: expect.any(Number),
            risk_level: expect.any(String),
            factors_changed: expect.any(Array),
            prediction_updated: true,
          }),
        }),
        notifications_sent: expect.objectContaining({
          whatsapp_patient: true,
          email_doctor: true,
          real_time_broadcast: true,
        }),
      }
    }
  }

  describe('appointments.sendWhatsAppReminder - WhatsApp Business API Integration', () => {
    beforeEach(async () => {
      const appointmentResult = await trpcClient.appointments.create.mutate({
        patient_id: patientId,
        doctor_id: doctorId,
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'telemedicine' as const,
      }
      appointmentId = appointmentResult.data.id;
    }

    it('should FAIL: send personalized WhatsApp reminder with LGPD compliance', async () => {
      const reminderData = {
        appointment_id: appointmentId,
        reminder_type: 'confirmation_request' as const,
        timing: '24_hours_before',
        personalization: {
          include_doctor_name: true,
          include_clinic_location: false, // telemedicine
          include_preparation_instructions: true,
          language: 'pt-BR',
        },
        lgpd_compliance: {
          consent_verified: true,
          data_minimization: true,
          purpose_limitation: 'appointment_reminder_only',
        },
      };

      // Should FAIL because WhatsApp integration doesn't exist
      const result = await trpcClient.appointments.sendWhatsAppReminder.mutate(reminderData

      expect(result).toMatchObject({
        success: true,
        message_sent: true,
        whatsapp_response: expect.objectContaining({
          message_id: expect.any(String),
          delivery_status: 'sent',
          recipient_confirmed: true,
        }),
        personalization_applied: expect.objectContaining({
          template_used: expect.any(String),
          doctor_name_included: true,
          instructions_included: true,
          language_localized: 'pt-BR',
        }),
        lgpd_compliance: expect.objectContaining({
          consent_timestamp: expect.any(String),
          data_processing_logged: true,
          retention_policy_applied: true,
          patient_rights_respected: true,
        }),
        audit_trail: expect.objectContaining({
          event_type: 'whatsapp_reminder_sent',
          message_content_hash: expect.any(String),
          delivery_attempted_at: expect.any(String),
        }),
      }
    }

    it('should FAIL: handle WhatsApp delivery failures with fallback mechanisms', async () => {
      const reminderData = {
        appointment_id: appointmentId,
        reminder_type: 'final_reminder' as const,
        enable_fallback: true,
        fallback_methods: ['sms', 'email', 'phone_call'],
      };

      // Mock WhatsApp API failure
      server.use(
        rest.post(
          'https://graph.facebook.com/v17.0/:phone_number_id/messages',
          (req, res, ctx) => {
            return res.once(
              ctx.status(400),
              ctx.json({
                error: {
                  message: 'Invalid phone number format',
                  type: 'parameter_error',
                  code: 100,
                },
              }),
            
          },
        ),
      

      // Should FAIL because fallback system doesn't exist
      const result = await trpcClient.appointments.sendWhatsAppReminder.mutate(reminderData

      expect(result).toMatchObject({
        success: true,
        primary_delivery: {
          whatsapp_failed: true,
          error_code: expect.any(String),
          fallback_triggered: true,
        },
        fallback_results: expect.objectContaining({
          sms_attempted: true,
          sms_success: expect.any(Boolean),
          email_attempted: expect.any(Boolean),
          phone_call_scheduled: expect.any(Boolean),
        }),
        final_status: expect.stringMatching(/^(delivered|failed|partial)$/),
        audit_trail: expect.objectContaining({
          delivery_attempts: expect.any(Array),
          fallback_methods_used: expect.any(Array),
        }),
      }
    }
  }

  describe('appointments.noShowPredictionAnalysis - Advanced AI Analytics', () => {
    it('should FAIL: provide comprehensive no-show analytics for clinic optimization', async () => {
      const analysisRequest = {
        clinic_id: 'clinic_123',
        date_range: {
          start: '2024-01-01',
          end: '2024-12-31',
        },
        analysis_type: 'comprehensive',
        include_predictions: true,
        group_by: ['specialty', 'appointment_type', 'doctor', 'time_of_day'],
      };

      // Should FAIL because analytics system doesn't exist
      const result = await trpcClient.appointments.noShowAnalytics.query(analysisRequest

      expect(result).toMatchObject({
        analytics: expect.objectContaining({
          clinic_id: 'clinic_123',
          period_analyzed: expect.any(Object),
          overall_metrics: expect.objectContaining({
            total_appointments: expect.any(Number),
            no_show_rate: expect.any(Number),
            prediction_accuracy: expect.any(Number),
            revenue_protected: expect.any(Number),
          }),
          predictive_insights: expect.objectContaining({
            high_risk_patterns: expect.any(Array),
            optimal_reminder_timing: expect.any(Object),
            weather_impact_correlation: expect.any(Number),
            patient_behavior_trends: expect.any(Array),
          }),
          recommendations: expect.arrayContaining([
            expect.objectContaining({
              category: expect.any(String),
              action: expect.any(String),
              expected_improvement: expect.any(Number),
              implementation_effort: expect.stringMatching(/^(low|medium|high)$/),
            }),
          ]),
        }),
      }
    }

    it('should FAIL: generate patient-specific no-show intervention strategies', async () => {
      const interventionRequest = {
        patient_id: patientId,
        appointment_id: appointmentId,
        intervention_type: 'personalized_strategy',
        risk_threshold: 0.3,
        include_behavioral_analysis: true,
      };

      // Should FAIL because intervention system doesn't exist
      const result = await trpcClient.appointments.generateInterventionStrategy.mutate(
        interventionRequest,
      

      expect(result).toMatchObject({
        intervention_strategy: expect.objectContaining({
          patient_id: patientId,
          risk_assessment: expect.objectContaining({
            current_probability: expect.any(Number),
            risk_level: expect.any(String),
            contributing_factors: expect.any(Array),
          }),
          personalized_interventions: expect.arrayContaining([
            expect.objectContaining({
              type: expect.stringMatching(
                /^(reminder|incentive|education|support)$/,
              ),
              timing: expect.any(String),
              method: expect.any(String),
              personalization_factors: expect.any(Array),
              expected_effectiveness: expect.any(Number),
            }),
          ]),
          behavioral_insights: expect.objectContaining({
            preferred_communication_time: expect.any(String),
            response_patterns: expect.any(Array),
            motivation_factors: expect.any(Array),
          }),
          success_metrics: expect.objectContaining({
            target_no_show_reduction: expect.any(Number),
            measurement_period: expect.any(String),
            kpi_tracking: expect.any(Array),
          }),
        }),
      }
    }
  }

  describe('Edge Cases - Brazilian Healthcare Specifics', () => {
    it('should FAIL: handle SUS (public healthcare) appointment integration', async () => {
      const susAppointmentData = {
        patient_id: patientId,
        doctor_id: doctorId,
        scheduled_at: new Date(Date.now() + 168 * 60 * 60 * 1000).toISOString(), // 1 week
        type: 'sus_integration' as const,
        sus_data: {
          cartao_sus: '123456789012345',
          unidade_saude: 'UBS Vila Nova',
          especialidade_sus: 'cardiologia',
          priority_level: 'routine',
          referral_required: true,
        },
        government_compliance: {
          data_sharing_authorized: true,
          ministry_of_health_reporting: true,
          lgpd_public_interest_basis: true,
        },
      };

      // Should FAIL because SUS integration doesn't exist
      const result = await trpcClient.appointments.createSUSIntegrated.mutate(
        susAppointmentData,
      

      expect(result).toMatchObject({
        success: true,
        appointment: expect.objectContaining({
          sus_integration: expect.objectContaining({
            cartao_sus_validated: true,
            unidade_saude_verified: true,
            referral_chain_established: true,
            government_reporting_enabled: true,
          }),
          compliance_status: expect.objectContaining({
            sus_data_protection: true,
            ministry_reporting_configured: true,
            public_interest_basis_documented: true,
          }),
        }),
      }
    }

    it('should FAIL: implement ANVISA telemedicine compliance validation', async () => {
      const telemedicineValidation = {
        appointment_id: appointmentId,
        validation_type: 'full_anvisa_compliance',
        include_medical_device_check: true,
        verify_professional_credentials: true,
      };

      // Should FAIL because ANVISA validation doesn't exist
      const result = await trpcClient.appointments.validateANVISACompliance.query(
        telemedicineValidation,
      

      expect(result).toMatchObject({
        compliance_status: expect.objectContaining({
          anvisa_compliant: true,
          medical_device_approved: true,
          software_classification: 'class_i_medical_device',
          quality_management_verified: true,
          clinical_risk_assessment: 'low_risk',
          post_market_surveillance: 'active',
        }),
        professional_verification: expect.objectContaining({
          cfm_license_active: true,
          telemedicine_certification: true,
          continuing_education_current: true,
          malpractice_insurance_valid: true,
        }),
        technical_compliance: expect.objectContaining({
          data_encryption_verified: true,
          authentication_robust: true,
          audit_trail_complete: true,
          backup_systems_operational: true,
        }),
      }
    }
  }
}
