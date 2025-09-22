import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../index';
import { createTestClient, generateTestCPF } from '../helpers/auth';
import { cleanupTestDatabase, setupTestDatabase } from '../helpers/database';

describe('Patients Mobile Integration API', () => {
  let testClient: any;
  let patientId: string;

  beforeEach(async () => {
    await setupTestDatabase();
    testClient = await createTestClient({ _role: 'admin' });

    // Create a test patient first
    const patientData = {
      name: 'Mobile Integration Test Patient',
      email: 'mobile.test@email.com',
      phone: '+5511999999999',
      cpf: generateTestCPF(),
      birth_date: '1985-03-15',
      gender: 'M',
      blood_type: 'A+',
      address: {
        street: 'Rua dos Dispositivos Móveis',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01001000',
      },
      emergency_contact: {
        name: 'Maria Mobile',
        phone: '+5511888888888',
        relationship: 'spouse',
      },
      health_insurance: {
        provider: 'Unimed',
        plan_type: 'comprehensive',
        policy_number: 'UNIMOB123456',
        valid_until: '2025-12-31',
      },
      lgpd_consent: {
        data_processing: true,
        communication: true,
        storage: true,
        mobile_notifications: true,
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

  describe('GET /api/v2/patients/{id}/mobile-data', () => {
    it('should return 200 with mobile-optimized patient data', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-data`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
            'X-Mobile-OS': 'iOS',
            'X-Mobile-Version': '2.1.0',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        mobile_data: expect.objectContaining({
          patient_id: patientId,
          summary: expect.objectContaining({
            name: expect.any(String),
            age: expect.any(Number),
            primary_diagnosis: expect.any(String),
            upcoming_appointments: expect.any(Array),
            last_visit: expect.any(String),
          }),
          quick_actions: expect.any(Array),
          offline_available: expect.any(Boolean),
          data_compressed: expect.any(Boolean),
        }),
      });
    });

    it('should optimize data payload for mobile bandwidth', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-data`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
            'X-Mobile-Network': '4G',
          },
        },
      );

      expect(response.status).toBe(200);
      expect(response.headers.get('content-encoding')).toMatch(/gzip/);

      const data = await response.json();
      expect(data.mobile_data).toMatchObject({
        optimization: expect.objectContaining({
          compression_ratio: expect.any(Number),
          payload_size_bytes: expect.any(Number),
          images_compressed: expect.any(Boolean),
          videos_optimized: expect.any(Boolean),
        }),
      });
    });

    it('should include mobile-specific UI preferences', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-data?include_ui_preferences=true`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.mobile_data).toMatchObject({
        ui_preferences: expect.objectContaining({
          theme: expect.any(String),
          font_size: expect.any(String),
          language: expect.any(String),
          accessibility_settings: expect.objectContaining({
            high_contrast: expect.any(Boolean),
            screen_reader: expect.any(Boolean),
            large_text: expect.any(Boolean),
          }),
        }),
      });
    });

    it('should support offline data synchronization', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-data?offline_mode=true`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
            'X-Offline-Capable': 'true',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.mobile_data).toMatchObject({
        offline_sync: expect.objectContaining({
          sync_id: expect.any(String),
          last_sync_timestamp: expect.any(String),
          offline_expiration: expect.any(String),
          critical_data_only: expect.any(Boolean),
          data_hash: expect.any(String),
        }),
      });
    });

    it('should validate mobile client version compatibility', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-data`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
            'X-Mobile-Version': '1.0.0', // Outdated version
          },
        },
      );

      if (response.status === 200) {
        const data = await response.json();
        expect(data.mobile_data).toMatchObject({
          version_compatibility: expect.objectContaining({
            compatible: expect.any(Boolean),
            upgrade_required: expect.any(Boolean),
            upgrade_message: expect.any(String),
            minimum_version: expect.any(String),
          }),
        });
      }
    });
  });

  describe('POST /api/v2/patients/{id}/mobile-sync', () => {
    it('should return 200 for successful mobile sync', async () => {
      const syncRequest = {
        sync_id: 'mobile-sync-123',
        device_info: {
          device_id: 'ios-device-123',
          device_type: 'iPhone',
          os_version: '16.0',
          app_version: '2.1.0',
          storage_available: true,
        },
        sync_data: {
          patient_preferences: {
            notification_preferences: {
              appointment_reminders: true,
              medication_reminders: true,
              health_tips: false,
            },
            language: 'pt-BR',
            timezone: 'America/Sao_Paulo',
          },
          offline_actions: [
            {
              action: 'appointment_confirmed',
              timestamp: new Date().toISOString(),
              appointment_id: '550e8400-e29b-41d4-a716-446655440001',
            },
          ],
        },
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
          body: JSON.stringify(syncRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        sync_result: expect.objectContaining({
          sync_id: 'mobile-sync-123',
          patient_id: patientId,
          sync_timestamp: expect.any(String),
          processed_actions: expect.any(Number),
          conflicts_resolved: expect.any(Number),
          new_data_available: expect.any(Boolean),
        }),
      });
    });

    it('should handle sync conflicts resolution', async () => {
      const conflictRequest = {
        sync_id: 'mobile-sync-conflict-123',
        device_info: {
          device_id: 'android-device-456',
          app_version: '2.1.0',
        },
        sync_data: {
          conflicts: [
            {
              field: 'phone',
              device_value: '+5511999999998',
              server_value: '+5511999999999',
              last_updated_device: '2023-12-01T10:00:00Z',
              last_updated_server: '2023-12-01T10:30:00Z',
            },
          ],
        },
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
          body: JSON.stringify(conflictRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.sync_result).toMatchObject({
        conflicts_resolved: expect.any(Number),
        resolution_strategy: expect.any(String),
        resolution_details: expect.any(Array),
      });
    });

    it('should validate sync data integrity', async () => {
      const invalidSyncRequest = {
        sync_id: 'invalid-sync-123',
        device_info: {
          device_id: 'test-device',
          app_version: '2.1.0',
        },
        sync_data: {
          invalid_field: 'this should not be here',
        },
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-sync`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
          body: JSON.stringify(invalidSyncRequest),
        },
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining('validation'),
        sync_errors: expect.any(Array),
      });
    });
  });

  describe('GET /api/v2/patients/{id}/mobile-notifications', () => {
    it('should return 200 with mobile notification settings', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-notifications`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        notifications: expect.objectContaining({
          patient_id: patientId,
          enabled: expect.any(Boolean),
          preferences: expect.objectContaining({
            appointment_reminders: expect.any(Boolean),
            medication_reminders: expect.any(Boolean),
            test_results: expect.any(Boolean),
            health_tips: expect.any(Boolean),
            emergency_alerts: expect.any(Boolean),
          }),
          delivery_methods: expect.objectContaining({
            push_notifications: expect.any(Boolean),
            sms: expect.any(Boolean),
            email: expect.any(Boolean),
            in_app: expect.any(Boolean),
          }),
          quiet_hours: expect.objectContaining({
            enabled: expect.any(Boolean),
            start_time: expect.any(String),
            end_time: expect.any(String),
            timezone: expect.any(String),
          }),
        }),
      });
    });

    it('should include notification history for mobile devices', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-notifications?include_history=true&limit=10`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.notifications).toMatchObject({
        history: expect.any(Array),
        unread_count: expect.any(Number),
        delivery_stats: expect.objectContaining({
          delivered: expect.any(Number),
          read: expect.any(Number),
          failed: expect.any(Number),
        }),
      });
    });
  });

  describe('PUT /api/v2/patients/{id}/mobile-notifications', () => {
    it('should return 200 for successful notification preferences update', async () => {
      const updateRequest = {
        preferences: {
          appointment_reminders: true,
          medication_reminders: true,
          test_results: false,
          health_tips: false,
          emergency_alerts: true,
        },
        delivery_methods: {
          push_notifications: true,
          sms: false,
          email: true,
          in_app: true,
        },
        quiet_hours: {
          enabled: true,
          start_time: '22:00',
          end_time: '08:00',
          timezone: 'America/Sao_Paulo',
        },
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-notifications`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
          body: JSON.stringify(updateRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        updated_preferences: expect.objectContaining({
          patient_id: patientId,
          updated_at: expect.any(String),
          effective_immediately: expect.any(Boolean),
        }),
      });
    });

    it('should validate notification preference conflicts', async () => {
      const conflictingRequest = {
        preferences: {
          emergency_alerts: true,
          quiet_hours: {
            enabled: true,
            block_emergency: true, // Conflict with emergency alerts
          },
        },
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-notifications`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
          body: JSON.stringify(conflictingRequest),
        },
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining('conflict'),
        conflicts: expect.any(Array),
      });
    });
  });

  describe('POST /api/v2/patients/{id}/mobile-actions', () => {
    it('should return 200 for successful mobile action processing', async () => {
      const actionRequest = {
        actions: [
          {
            action_type: 'appointment_confirmation',
            appointment_id: '550e8400-e29b-41d4-a716-446655440001',
            confirmed: true,
            reason: 'Patient confirmed via mobile app',
          },
          {
            action_type: 'medication_logging',
            medication_id: '550e8400-e29b-41d4-a716-446655440002',
            taken: true,
            taken_at: new Date().toISOString(),
            notes: 'Taken with breakfast',
          },
        ],
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-actions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
          body: JSON.stringify(actionRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        action_results: expect.objectContaining({
          patient_id: patientId,
          processed_actions: expect.any(Number),
          successful_actions: expect.any(Number),
          failed_actions: expect.any(Number),
          results: expect.any(Array),
        }),
      });
    });

    it('should validate mobile action permissions', async () => {
      const unauthorizedAction = {
        actions: [
          {
            action_type: 'prescription_modification', // Should require higher permissions
            prescription_id: '550e8400-e29b-41d4-a716-446655440003',
            new_dosage: 'unauthorized_change',
          },
        ],
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-actions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
          body: JSON.stringify(unauthorizedAction),
        },
      );

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining('unauthorized'),
        unauthorized_actions: expect.any(Array),
      });
    });

    it('should handle offline mobile actions with conflict resolution', async () => {
      const offlineActionRequest = {
        offline_sync: true,
        sync_id: 'offline-actions-123',
        device_timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        actions: [
          {
            action_type: 'appointment_cancellation',
            appointment_id: '550e8400-e29b-41d4-a716-446655440001',
            reason: 'Patient cancelled via offline mode',
          },
        ],
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-actions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
            'X-Offline-Sync': 'true',
          },
          body: JSON.stringify(offlineActionRequest),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.action_results).toMatchObject({
        offline_sync_processed: expect.any(Boolean),
        conflicts_detected: expect.any(Boolean),
        conflict_resolution: expect.any(Array),
      });
    });
  });

  describe('Mobile Security and Performance', () => {
    it('should enforce mobile device security checks', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-security-check`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
            'X-Device-ID': 'test-device-123',
            'X-Device-Fingerprint': 'device-fingerprint-hash',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        security_check: expect.objectContaining({
          device_secure: expect.any(Boolean),
          jailbroken_detected: expect.any(Boolean),
          encryption_enabled: expect.any(Boolean),
          passcode_set: expect.any(Boolean),
          biometrics_available: expect.any(Boolean),
          security_score: expect.any(Number),
        }),
      });
    });

    it('should optimize API responses for mobile networks', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-data`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
            'X-Mobile-Network': '3G', // Slow network
            'X-Device-Memory': '1GB', // Low memory device
          },
        },
      );

      expect(response.status).toBe(200);
      expect(Number(response.headers.get('content-length'))).toBeLessThan(
        50000,
      ); // Should be small

      const data = await response.json();
      expect(data.mobile_data).toMatchObject({
        optimization_applied: expect.any(Boolean),
        images_optimized: expect.any(Boolean),
        data_minified: expect.any(Boolean),
      });
    });

    it('should support progressive data loading for mobile', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-data?progressive_load=true`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Mobile-Client': 'true',
          },
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.mobile_data).toMatchObject({
        progressive_loading: expect.objectContaining({
          initial_load_complete: expect.any(Boolean),
          chunks_available: expect.any(Number),
          current_chunk: expect.any(Number),
          next_chunk_url: expect.any(String),
        }),
      });
    });
  });

  describe('Mobile Device Management', () => {
    it('should register and manage mobile devices', async () => {
      const deviceRegistration = {
        device_info: {
          device_id: 'new-mobile-device-123',
          device_type: 'smartphone',
          manufacturer: 'Apple',
          model: 'iPhone 14',
          os_version: '16.0',
          app_version: '2.1.0',
          push_token: 'expo-push-token-123',
        },
        capabilities: {
          biometrics: true,
          nfc: true,
          location: true,
          camera: true,
          offline_storage: true,
        },
      };

      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-devices`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deviceRegistration),
        },
      );

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        device_registered: expect.objectContaining({
          patient_id: patientId,
          device_id: 'new-mobile-device-123',
          registered_at: expect.any(String),
          status: 'active',
        }),
      });
    });

    it('should list registered mobile devices', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-devices`,
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
        devices: expect.any(Array),
        total_devices: expect.any(Number),
        active_devices: expect.any(Number),
      });
    });

    it('should handle device revocation for security', async () => {
      const response = await app.request(
        `/api/v2/patients/${patientId}/mobile-devices/test-device-123/revoke`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: 'security_concern',
            immediate_revoke: true,
          }),
        },
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        device_revoked: expect.objectContaining({
          device_id: 'test-device-123',
          revocation_reason: 'security_concern',
          revoked_at: expect.any(String),
        }),
      });
    });
  });
});
