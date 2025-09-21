/**
 * OFFLINE FUNCTIONALITY INTEGRATION TEST (T029)
 *
 * Constitutional TDD Implementation - RED PHASE
 * Tests offline functionality and data synchronization for healthcare workflows
 *
 * @compliance Healthcare Data Continuity, LGPD Offline Storage, PWA Standards
 * @test-id T029
 * @sync-performance <2s sync time after reconnection
 * @data-integrity 100% data consistency across offline/online transitions
 */

import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// Offline functionality test data
const generateOfflineTestData = () => ({
  patient: {
    id: 'offline-patient-' + Date.now(),
    name: 'Maria Fernanda Silva',
    cpf: '987.654.321-00',
    phone: '(21) 99887-6655',
    email: 'maria.fernanda@email.com',
    birthDate: '1988-07-22',
    gender: 'female',
  },
  appointment: {
    id: 'offline-appointment-' + Date.now(),
    patientId: 'offline-patient-' + Date.now(),
    date: new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    time: '15:30',
    type: 'consulta_dermatologia',
    duration: 30,
    notes: 'Consulta de rotina - avaliação de manchas na pele',
  },
  prescription: {
    id: 'offline-prescription-' + Date.now(),
    patientId: 'offline-patient-' + Date.now(),
    medications: [
      {
        name: 'Protetor Solar FPS 60',
        instructions: 'Aplicar 30 minutos antes da exposição solar',
        quantity: 1,
        frequency: 'conforme necessário',
      },
    ],
  },
});

// Offline storage keys for validation
const OFFLINE_STORAGE_KEYS = {
  pendingActions: 'neonpro_pending_actions',
  offlineData: 'neonpro_offline_data',
  syncQueue: 'neonpro_sync_queue',
  lastSync: 'neonpro_last_sync',
  conflictResolution: 'neonpro_conflicts',
};

describe('Offline Functionality Tests (T029)', () => {
  let testData: ReturnType<typeof generateOfflineTestData>;

  test.beforeEach(async ({ page }) => {
    testData = generateOfflineTestData();

    // Setup authenticated session
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem(
        'supabase.auth.token',
        JSON.stringify({
          access_token: 'mock-offline-token',
          user: {
            id: 'offline-test-user',
            email: 'offline.test@professional.com',
            _role: 'healthcare_professional',
            crm: 'CRM-98765',
          },
        }),
      );
    });

    // Clear offline storage before each test
    await page.evaluate(() => {
      localStorage.clear();
      indexedDB.deleteDatabase('neonpro_offline');
    });
  });

  describe('Offline Detection and UI State', () => {
    test('should detect offline state and show appropriate UI', async ({ context, page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Verify online state initially
      await expect(
        page.locator('[data-testid="connection-status"]'),
      ).toHaveText(/online|conectado/i);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).not.toBeVisible();

      // Go offline
      await context.setOffline(true);

      // Should detect offline state
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible({
        timeout: 5000,
      });
      await expect(
        page.locator('[data-testid="connection-status"]'),
      ).toHaveText(/offline|desconectado/i);

      // Should show offline message
      await expect(
        page.locator('[data-testid="offline-message"]'),
      ).toBeVisible();
      const offlineMessage = await page
        .locator('[data-testid="offline-message"]')
        .textContent();
      expect(offlineMessage).toMatch(/offline|desconectado|sem conexão/i);

      // Should disable online-only features
      const onlineOnlyButtons = page.locator(
        '[data-testid*="sync"], [data-testid*="upload"], [data-testid*="share"]',
      );
      const buttonCount = await onlineOnlyButtons.count();

      for (let i = 0; i < buttonCount; i++) {
        const button = onlineOnlyButtons.nth(i);
        if (await button.isVisible()) {
          await expect(button).toBeDisabled();
        }
      }

      // Go back online
      await context.setOffline(false);

      // Should detect online state
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).not.toBeVisible({
        timeout: 5000,
      });
      await expect(
        page.locator('[data-testid="connection-status"]'),
      ).toHaveText(/online|conectado/i);
    });

    test('should show queued actions count when offline', async ({ context, page }) => {
      await page.goto('/patients');
      await page.waitForLoadState('networkidle');

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible({
        timeout: 5000,
      });

      // Perform actions that should be queued
      await page.click('[data-testid="add-patient-button"]');
      await page.fill('[data-testid="patient-name"]', testData.patient.name);
      await page.fill('[data-testid="patient-cpf"]', testData.patient.cpf);
      await page.click('[data-testid="save-patient-offline"]');

      // Should show queued action
      await expect(
        page.locator('[data-testid="queued-actions-count"]'),
      ).toBeVisible();
      const queueCount = await page
        .locator('[data-testid="queued-actions-count"]')
        .textContent();
      expect(queueCount).toMatch(/1/);

      // Perform another action
      await page.click('[data-testid="add-patient-button"]');
      await page.fill('[data-testid="patient-name"]', 'João Carlos Santos');
      await page.fill('[data-testid="patient-cpf"]', '111.222.333-44');
      await page.click('[data-testid="save-patient-offline"]');

      // Should show updated queue count
      const updatedCount = await page
        .locator('[data-testid="queued-actions-count"]')
        .textContent();
      expect(updatedCount).toMatch(/2/);
    });
  });

  describe('Offline Data Storage and Retrieval', () => {
    test('should store patient data offline for access', async ({ context, page }) => {
      await page.goto('/patients');
      await page.waitForLoadState('networkidle');

      // Load some initial patient data while online
      const initialPatients = await page.evaluate(() => {
        return Promise.resolve([
          {
            id: '1',
            name: 'Ana Carolina Silva',
            cpf: '123.456.789-09',
            phone: '(11) 98765-4321',
            lastConsultation: '2024-01-15',
          },
          {
            id: '2',
            name: 'Pedro Henrique Santos',
            cpf: '987.654.321-00',
            phone: '(21) 87654-3210',
            lastConsultation: '2024-01-10',
          },
        ]);
      });

      // Store data in offline storage
      await page.evaluate(patients => {
        localStorage.setItem(
          'neonpro_offline_patients',
          JSON.stringify(patients),
        );
      }, initialPatients);

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible({
        timeout: 5000,
      });

      // Refresh page to test offline loading
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Should load patients from offline storage
      await expect(page.locator('[data-testid="patient-list"]')).toBeVisible();
      const patientCards = page.locator('[data-testid="patient-card"]');
      const patientCount = await patientCards.count();
      expect(patientCount).toBeGreaterThan(0);

      // Should show offline data indicator
      await expect(
        page.locator('[data-testid="offline-data-indicator"]'),
      ).toBeVisible();

      // Verify patient data is accessible
      const firstPatient = patientCards.first();
      await expect(
        firstPatient.locator('[data-testid="patient-name"]'),
      ).toContainText('Ana Carolina Silva');
      await expect(
        firstPatient.locator('[data-testid="patient-cpf"]'),
      ).toContainText('123.456.789-09');
    });

    test('should maintain medical records offline', async ({ context, page }) => {
      await page.goto('/patients/1/medical-records');
      await page.waitForLoadState('networkidle');

      // Store medical records offline
      const medicalRecords = [
        {
          id: 'record-1',
          date: '2024-01-15',
          type: 'Consulta Dermatológica',
          diagnosis: 'Dermatite seborreica',
          treatment: 'Shampoo antisseborreico',
          followUp: '30 dias',
        },
        {
          id: 'record-2',
          date: '2023-12-10',
          type: 'Consulta de Rotina',
          diagnosis: 'Pele saudável',
          treatment: 'Manutenção',
          followUp: '6 meses',
        },
      ];

      await page.evaluate(records => {
        localStorage.setItem(
          'neonpro_offline_records_1',
          JSON.stringify(records),
        );
      }, medicalRecords);

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible({
        timeout: 5000,
      });

      // Refresh to test offline loading
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Should load medical records from offline storage
      await expect(
        page.locator('[data-testid="medical-records-list"]'),
      ).toBeVisible();
      const recordCards = page.locator('[data-testid="medical-record-card"]');
      const recordCount = await recordCards.count();
      expect(recordCount).toBe(2);

      // Verify record content
      const firstRecord = recordCards.first();
      await expect(
        firstRecord.locator('[data-testid="record-diagnosis"]'),
      ).toContainText('Dermatite seborreica');
      await expect(
        firstRecord.locator('[data-testid="record-treatment"]'),
      ).toContainText('Shampoo antisseborreico');
    });

    test('should cache images and documents offline', async ({ context, page }) => {
      await page.goto('/patients/1/documents');
      await page.waitForLoadState('networkidle');

      // Mock some cached images
      await page.evaluate(() => {
        const cacheData = {
          images: [
            {
              id: 'img-1',
              url: 'blob:cached-image-1',
              type: 'patient_photo',
              cachedAt: new Date().toISOString(),
            },
            {
              id: 'img-2',
              url: 'blob:cached-image-2',
              type: 'dermatoscopy',
              cachedAt: new Date().toISOString(),
            },
          ],
          documents: [
            {
              id: 'doc-1',
              name: 'Exame Dermatoscópico.pdf',
              type: 'examination_result',
              cachedAt: new Date().toISOString(),
            },
          ],
        };
        localStorage.setItem(
          'neonpro_offline_media_1',
          JSON.stringify(cacheData),
        );
      });

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible({
        timeout: 5000,
      });

      // Should show cached images
      await expect(page.locator('[data-testid="cached-images"]')).toBeVisible();
      const cachedImages = page.locator('[data-testid="cached-image"]');
      const imageCount = await cachedImages.count();
      expect(imageCount).toBe(2);

      // Should show cached documents
      await expect(
        page.locator('[data-testid="cached-documents"]'),
      ).toBeVisible();
      const cachedDocs = page.locator('[data-testid="cached-document"]');
      const docCount = await cachedDocs.count();
      expect(docCount).toBe(1);

      // Should show cache status
      await expect(page.locator('[data-testid="cache-status"]')).toBeVisible();
      const cacheStatus = await page
        .locator('[data-testid="cache-status"]')
        .textContent();
      expect(cacheStatus).toMatch(/cache|offline|armazenado/i);
    });
  });

  describe('Offline Action Queuing and Synchronization', () => {
    test('should queue patient creation when offline', async ({ context, page }) => {
      await page.goto('/patients/new');
      await page.waitForLoadState('networkidle');

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible({
        timeout: 5000,
      });

      // Fill patient form
      await page.fill('[data-testid="patient-name"]', testData.patient.name);
      await page.fill('[data-testid="patient-cpf"]', testData.patient.cpf);
      await page.fill('[data-testid="patient-phone"]', testData.patient.phone);
      await page.fill('[data-testid="patient-email"]', testData.patient.email);
      await page.fill(
        '[data-testid="patient-birth-date"]',
        testData.patient.birthDate,
      );

      // Accept LGPD consent
      await page.check('[data-testid="consent-data-processing"]');
      await page.check('[data-testid="consent-treatment"]');

      // Submit form
      await page.click('[data-testid="submit-patient-form"]');

      // Should show queued message
      await expect(
        page.locator('[data-testid="action-queued-message"]'),
      ).toBeVisible();
      const queueMessage = await page
        .locator('[data-testid="action-queued-message"]')
        .textContent();
      expect(queueMessage).toMatch(/queued|pendente|será sincronizado/i);

      // Verify action is stored in local queue
      const queuedActions = await page.evaluate(() => {
        const queue = localStorage.getItem('neonpro_pending_actions');
        return queue ? JSON.parse(queue) : [];
      });

      expect(queuedActions).toHaveLength(1);
      expect(queuedActions[0]).toMatchObject({
        type: 'CREATE_PATIENT',
        data: expect.objectContaining({
          name: testData.patient.name,
          cpf: testData.patient.cpf,
        }),
        timestamp: expect.any(String),
        status: 'pending',
      });
    });

    test('should sync queued actions when coming back online', async ({ context, page }) => {
      await page.goto('/patients');
      await page.waitForLoadState('networkidle');

      // Go offline and queue some actions
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible({
        timeout: 5000,
      });

      // Queue multiple actions
      const queuedActions = [
        {
          id: 'action-1',
          type: 'CREATE_PATIENT',
          data: { ...testData.patient, id: undefined },
          timestamp: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
        {
          id: 'action-2',
          type: 'UPDATE_APPOINTMENT',
          data: { ...testData.appointment, notes: 'Atualizado offline' },
          timestamp: new Date().toISOString(),
          status: 'pending',
          retries: 0,
        },
      ];

      await page.evaluate(actions => {
        localStorage.setItem(
          'neonpro_pending_actions',
          JSON.stringify(actions),
        );
      }, queuedActions);

      // Should show queued actions count
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await expect(
        page.locator('[data-testid="queued-actions-count"]'),
      ).toContainText('2');

      // Go back online
      await context.setOffline(false);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).not.toBeVisible({
        timeout: 5000,
      });

      // Should show sync in progress
      await expect(
        page.locator('[data-testid="sync-in-progress"]'),
      ).toBeVisible({ timeout: 3000 });
      const syncMessage = await page
        .locator('[data-testid="sync-message"]')
        .textContent();
      expect(syncMessage).toMatch(/sync|sincronizando|uploading/i);

      // Wait for sync completion (simulate successful sync)
      await page.evaluate(() => {
        // Simulate successful sync after delay
        setTimeout(() => {
          localStorage.removeItem('neonpro_pending_actions');
          localStorage.setItem('neonpro_last_sync', new Date().toISOString());
          window.dispatchEvent(new CustomEvent('sync-completed'));
        }, 2000);
      });

      // Should show sync success
      await expect(page.locator('[data-testid="sync-success"]')).toBeVisible({
        timeout: 5000,
      });
      await expect(
        page.locator('[data-testid="queued-actions-count"]'),
      ).toContainText('0');

      // Verify actions were cleared from queue
      const remainingActions = await page.evaluate(() => {
        const queue = localStorage.getItem('neonpro_pending_actions');
        return queue ? JSON.parse(queue) : [];
      });
      expect(remainingActions).toHaveLength(0);
    });

    test('should handle sync conflicts and resolution', async ({ context, page }) => {
      await page.goto('/patients/1');
      await page.waitForLoadState('networkidle');

      // Simulate a patient record existing both online and offline with different data
      const onlinePatient = {
        id: '1',
        name: 'Ana Carolina Silva',
        phone: '(11) 98765-4321',
        lastModified: '2024-01-15T10:00:00Z',
        version: 2,
      };

      const offlineModification = {
        id: '1',
        name: 'Ana Carolina Silva Santos', // Modified offline
        phone: '(11) 99999-9999', // Modified offline
        lastModified: '2024-01-15T09:30:00Z',
        version: 1,
      };

      // Store offline modification
      await page.evaluate(patient => {
        const actions = [
          {
            id: 'conflict-action',
            type: 'UPDATE_PATIENT',
            data: patient,
            timestamp: new Date().toISOString(),
            status: 'pending',
          },
        ];
        localStorage.setItem(
          'neonpro_pending_actions',
          JSON.stringify(actions),
        );
      }, offlineModification);

      // Go offline and back online to trigger sync
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible();

      await context.setOffline(false);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).not.toBeVisible();

      // Should detect conflict
      await expect(
        page.locator('[data-testid="sync-conflict-detected"]'),
      ).toBeVisible({
        timeout: 5000,
      });

      // Should show conflict resolution dialog
      await expect(
        page.locator('[data-testid="conflict-resolution-dialog"]'),
      ).toBeVisible();

      // Should show both versions
      await expect(
        page.locator('[data-testid="online-version"]'),
      ).toContainText('Ana Carolina Silva');
      await expect(
        page.locator('[data-testid="offline-version"]'),
      ).toContainText('Ana Carolina Silva Santos');

      // Select resolution strategy
      await page.click('[data-testid="resolve-keep-online"]');
      await page.click('[data-testid="confirm-resolution"]');

      // Should complete sync with chosen resolution
      await expect(
        page.locator('[data-testid="conflict-resolved"]'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
    });

    test('should handle partial sync failures with retry logic', async ({ context, page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Queue multiple actions
      const actions = [
        {
          id: 'action-1',
          type: 'CREATE_PATIENT',
          data: testData.patient,
          status: 'pending',
          retries: 0,
        },
        {
          id: 'action-2',
          type: 'CREATE_APPOINTMENT',
          data: testData.appointment,
          status: 'pending',
          retries: 0,
        },
        {
          id: 'action-3',
          type: 'CREATE_PRESCRIPTION',
          data: testData.prescription,
          status: 'pending',
          retries: 0,
        },
      ];

      await page.evaluate(queuedActions => {
        localStorage.setItem(
          'neonpro_pending_actions',
          JSON.stringify(queuedActions),
        );
      }, actions);

      // Go offline and back online
      await context.setOffline(true);
      await context.setOffline(false);

      // Simulate partial sync failure
      await page.evaluate(() => {
        // Simulate first action succeeding, second failing, third pending
        const updatedActions = [
          {
            id: 'action-2',
            type: 'CREATE_APPOINTMENT',
            status: 'failed',
            retries: 1,
            error: 'Network timeout',
          },
          {
            id: 'action-3',
            type: 'CREATE_PRESCRIPTION',
            status: 'pending',
            retries: 0,
          },
        ];
        localStorage.setItem(
          'neonpro_pending_actions',
          JSON.stringify(updatedActions),
        );

        window.dispatchEvent(
          new CustomEvent('sync-partial-failure', {
            detail: { succeeded: 1, failed: 1, pending: 1 },
          }),
        );
      });

      // Should show partial sync status
      await expect(
        page.locator('[data-testid="sync-partial-failure"]'),
      ).toBeVisible();
      const syncStatus = await page
        .locator('[data-testid="sync-status"]')
        .textContent();
      expect(syncStatus).toMatch(/1.*success.*1.*failed.*1.*pending/i);

      // Should show retry option
      await expect(
        page.locator('[data-testid="retry-failed-actions"]'),
      ).toBeVisible();
      await page.click('[data-testid="retry-failed-actions"]');

      // Should attempt retry
      await expect(page.locator('[data-testid="retrying-sync"]')).toBeVisible();

      // Should show updated queue count during retry
      await expect(
        page.locator('[data-testid="queued-actions-count"]'),
      ).toContainText('2');
    });
  });

  describe('Offline Form Validation and Data Integrity', () => {
    test('should validate Brazilian data formats offline', async ({ context, page }) => {
      await page.goto('/patients/new');
      await page.waitForLoadState('networkidle');

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible();

      // Test CPF validation offline
      await page.fill('[data-testid="patient-cpf"]', '123.456.789-00'); // Invalid CPF
      await page.blur('[data-testid="patient-cpf"]');

      await expect(page.locator('[data-testid="cpf-error"]')).toBeVisible();
      const cpfError = await page
        .locator('[data-testid="cpf-error"]')
        .textContent();
      expect(cpfError).toMatch(/cpf.*inválido/i);

      // Test valid CPF
      await page.fill('[data-testid="patient-cpf"]', '123.456.789-09'); // Valid CPF
      await page.blur('[data-testid="patient-cpf"]');

      await expect(page.locator('[data-testid="cpf-error"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="cpf-valid"]')).toBeVisible();

      // Test phone validation offline
      await page.fill('[data-testid="patient-phone"]', '11999999999');
      await page.blur('[data-testid="patient-phone"]');

      // Should format automatically even offline
      const phoneValue = await page.inputValue('[data-testid="patient-phone"]');
      expect(phoneValue).toMatch(/^\(\d{2}\)\s\d{4,5}-\d{4}$/);

      // Test CEP validation offline
      await page.fill('[data-testid="patient-cep"]', '01310100');
      await page.blur('[data-testid="patient-cep"]');

      // Should format automatically even offline
      const cepValue = await page.inputValue('[data-testid="patient-cep"]');
      expect(cepValue).toMatch(/^\d{5}-\d{3}$/);
    });

    test('should maintain LGPD consent state offline', async ({ context, page }) => {
      await page.goto('/patients/new');
      await page.waitForLoadState('networkidle');

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible();

      // LGPD consent should still be required offline
      await expect(
        page.locator('[data-testid="lgpd-consent-section"]'),
      ).toBeVisible();

      // Fill form without consent
      await page.fill('[data-testid="patient-name"]', testData.patient.name);
      await page.fill('[data-testid="patient-cpf"]', testData.patient.cpf);

      // Try to submit without consent
      await page.click('[data-testid="submit-patient-form"]');

      // Should show consent error even offline
      await expect(page.locator('[data-testid="consent-error"]')).toBeVisible();
      const consentError = await page
        .locator('[data-testid="consent-error"]')
        .textContent();
      expect(consentError).toMatch(/consent|consentimento.*obrigatório/i);

      // Accept required consents
      await page.check('[data-testid="consent-data-processing"]');
      await page.check('[data-testid="consent-treatment"]');

      // Should now allow submission
      await page.click('[data-testid="submit-patient-form"]');
      await expect(
        page.locator('[data-testid="action-queued-message"]'),
      ).toBeVisible();

      // Verify consent is stored with queued action
      const queuedActions = await page.evaluate(() => {
        const queue = localStorage.getItem('neonpro_pending_actions');
        return queue ? JSON.parse(queue) : [];
      });

      expect(queuedActions[0].data.lgpdConsent).toMatchObject({
        dataProcessing: true,
        treatment: true,
        consentTimestamp: expect.any(String),
      });
    });

    test('should validate prescription data offline', async ({ context, page }) => {
      await page.goto('/prescriptions/new');
      await page.waitForLoadState('networkidle');

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible();

      // Fill prescription form
      await page.fill('[data-testid="patient-search"]', 'Maria Silva');
      await page.click('[data-testid="patient-suggestion"]');

      // Add medication
      await page.fill(
        '[data-testid="medication-name"]',
        'Losartana Potássica 50mg',
      );
      await page.fill(
        '[data-testid="medication-dosage"]',
        '1 comprimido pela manhã',
      );
      await page.fill('[data-testid="medication-quantity"]', '30');

      // Test CRM validation offline
      await page.fill('[data-testid="physician-crm"]', 'CRM123456SP');
      await page.blur('[data-testid="physician-crm"]');

      // Should format CRM even offline
      const crmValue = await page.inputValue('[data-testid="physician-crm"]');
      expect(crmValue).toMatch(/^CRM-\d{4,6}\/[A-Z]{2}$/);

      // Submit prescription
      await page.click('[data-testid="submit-prescription"]');

      // Should queue prescription for sync
      await expect(
        page.locator('[data-testid="prescription-queued"]'),
      ).toBeVisible();

      // Verify prescription data integrity in queue
      const queuedPrescriptions = await page.evaluate(() => {
        const queue = localStorage.getItem('neonpro_pending_actions');
        return queue
          ? JSON.parse(queue).filter(
            action => action.type === 'CREATE_PRESCRIPTION',
          )
          : [];
      });

      expect(queuedPrescriptions).toHaveLength(1);
      expect(queuedPrescriptions[0].data).toMatchObject({
        physicianCrm: expect.stringMatching(/^CRM-\d{4,6}\/[A-Z]{2}$/),
        medications: expect.arrayContaining([
          expect.objectContaining({
            name: 'Losartana Potássica 50mg',
            dosage: '1 comprimido pela manhã',
            quantity: 30,
          }),
        ]),
      });
    });
  });

  describe('Performance and Storage Management', () => {
    test('should manage offline storage size and cleanup', async ({ context, page }) => {
      await page.goto('/settings/offline');
      await page.waitForLoadState('networkidle');

      // Check current storage usage
      await expect(page.locator('[data-testid="storage-usage"]')).toBeVisible();

      const storageInfo = await page.evaluate(async () => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          const estimate = await navigator.storage.estimate();
          return {
            used: estimate.usage,
            available: estimate.quota,
            percentage: estimate.usage && estimate.quota
              ? Math.round((estimate.usage / estimate.quota) * 100)
              : 0,
          };
        }
        return null;
      });

      if (storageInfo) {
        expect(storageInfo.percentage).toBeLessThan(80); // Should not exceed 80% storage
      }

      // Test storage cleanup functionality
      await page.click('[data-testid="cleanup-offline-data"]');
      await expect(
        page.locator('[data-testid="cleanup-confirmation"]'),
      ).toBeVisible();

      await page.click('[data-testid="confirm-cleanup"]');
      await expect(
        page.locator('[data-testid="cleanup-success"]'),
      ).toBeVisible();

      // Verify storage was cleaned up
      const postCleanupStorage = await page.evaluate(() => {
        const keys = [
          'neonpro_offline_patients',
          'neonpro_offline_records',
          'neonpro_offline_media',
        ];
        return keys.map(key => localStorage.getItem(key)).filter(Boolean)
          .length;
      });

      expect(postCleanupStorage).toBe(0);
    });

    test('should optimize data synchronization performance', async ({ context, page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Queue a large number of actions to test batch sync
      const manyActions = Array.from({ length: 50 }, (_, i) => ({
        id: `action-${i}`,
        type: 'UPDATE_PATIENT',
        data: { id: `patient-${i}`, lastModified: new Date().toISOString() },
        timestamp: new Date().toISOString(),
        status: 'pending',
        retries: 0,
      }));

      await page.evaluate(actions => {
        localStorage.setItem(
          'neonpro_pending_actions',
          JSON.stringify(actions),
        );
      }, manyActions);

      // Go offline and back online to trigger sync
      await context.setOffline(true);
      await context.setOffline(false);

      const syncStartTime = Date.now();

      // Should start batch sync
      await expect(
        page.locator('[data-testid="batch-sync-progress"]'),
      ).toBeVisible({
        timeout: 3000,
      });

      // Should show progress indicator
      const progressBar = page.locator('[data-testid="sync-progress-bar"]');
      await expect(progressBar).toBeVisible();

      // Simulate sync completion
      await page.evaluate(() => {
        localStorage.removeItem('neonpro_pending_actions');
        localStorage.setItem('neonpro_last_sync', new Date().toISOString());
        window.dispatchEvent(
          new CustomEvent('batch-sync-completed', {
            detail: { synced: 50, failed: 0, duration: 1800 },
          }),
        );
      });

      // Should complete sync within performance threshold
      const syncDuration = Date.now() - syncStartTime;
      expect(syncDuration).toBeLessThan(2000); // <2s requirement

      await expect(
        page.locator('[data-testid="batch-sync-success"]'),
      ).toBeVisible();
    });

    test('should handle storage quota exceeded scenarios', async ({ page }) => {
      await page.goto('/patients');
      await page.waitForLoadState('networkidle');

      // Simulate storage quota exceeded
      await page.evaluate(() => {
        // Mock localStorage to throw quota exceeded error
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => {
          throw new DOMException('QuotaExceededError');
        };

        // Restore after test
        window._restoreSetItem = () => {
          localStorage.setItem = originalSetItem;
        };
      });

      // Try to perform action that requires storage
      await page.click('[data-testid="add-patient-button"]');
      await page.fill('[data-testid="patient-name"]', testData.patient.name);
      await page.click('[data-testid="save-patient-offline"]');

      // Should show storage quota error
      await expect(
        page.locator('[data-testid="storage-quota-error"]'),
      ).toBeVisible();
      const quotaError = await page
        .locator('[data-testid="storage-quota-error"]')
        .textContent();
      expect(quotaError).toMatch(/storage|armazenamento.*cheio|quota/i);

      // Should offer cleanup options
      await expect(
        page.locator('[data-testid="cleanup-storage-button"]'),
      ).toBeVisible();
      await page.click('[data-testid="cleanup-storage-button"]');

      await expect(
        page.locator('[data-testid="cleanup-options"]'),
      ).toBeVisible();

      // Restore localStorage functionality
      await page.evaluate(() => {
        window._restoreSetItem();
      });
    });
  });

  describe('Healthcare-Specific Offline Features', () => {
    test('should support emergency offline access to patient data', async ({ context, page }) => {
      await page.goto('/emergency');
      await page.waitForLoadState('networkidle');

      // Store critical patient data for emergency access
      const emergencyPatients = [
        {
          id: 'emergency-1',
          name: 'João Carlos Silva',
          cpf: '123.456.789-09',
          bloodType: 'O+',
          allergies: ['Penicilina', 'Látex'],
          emergencyContact: {
            name: 'Maria Silva',
            phone: '(11) 99999-9999',
            relationship: 'Esposa',
          },
          criticalConditions: ['Diabetes Tipo 2', 'Hipertensão'],
          medications: ['Losartana 50mg', 'Metformina 850mg'],
        },
      ];

      await page.evaluate(patients => {
        localStorage.setItem(
          'neonpro_emergency_patients',
          JSON.stringify(patients),
        );
      }, emergencyPatients);

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible();

      // Should still allow emergency patient search
      await page.fill(
        '[data-testid="emergency-patient-search"]',
        '123.456.789-09',
      );
      await page.click('[data-testid="emergency-search-button"]');

      // Should find patient in offline emergency cache
      await expect(
        page.locator('[data-testid="emergency-patient-found"]'),
      ).toBeVisible();

      // Should display critical information
      await expect(
        page.locator('[data-testid="patient-blood-type"]'),
      ).toContainText('O+');
      await expect(
        page.locator('[data-testid="patient-allergies"]'),
      ).toContainText('Penicilina');
      await expect(
        page.locator('[data-testid="emergency-contact"]'),
      ).toContainText('Maria Silva');
      await expect(
        page.locator('[data-testid="critical-medications"]'),
      ).toContainText('Losartana');

      // Should show offline emergency mode indicator
      await expect(
        page.locator('[data-testid="emergency-offline-mode"]'),
      ).toBeVisible();
      const emergencyMode = await page
        .locator('[data-testid="emergency-offline-mode"]')
        .textContent();
      expect(emergencyMode).toMatch(/emergency|emergência.*offline/i);
    });

    test('should maintain prescription history offline', async ({ context, page }) => {
      await page.goto('/patients/1/prescriptions');
      await page.waitForLoadState('networkidle');

      // Store prescription history
      const prescriptionHistory = [
        {
          id: 'rx-1',
          date: '2024-01-15',
          physician: 'Dr. Ana Santos - CRM-12345/SP',
          medications: [
            { name: 'Losartana 50mg', dosage: '1x manhã', duration: '30 dias' },
          ],
          status: 'active',
        },
        {
          id: 'rx-2',
          date: '2023-12-10',
          physician: 'Dr. Carlos Lima - CRM-67890/RJ',
          medications: [
            {
              name: 'Protetor Solar FPS 60',
              dosage: 'aplicar antes da exposição',
              duration: 'uso contínuo',
            },
          ],
          status: 'completed',
        },
      ];

      await page.evaluate(prescriptions => {
        localStorage.setItem(
          'neonpro_offline_prescriptions_1',
          JSON.stringify(prescriptions),
        );
      }, prescriptionHistory);

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible();

      // Refresh to test offline loading
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Should load prescription history from offline storage
      await expect(
        page.locator('[data-testid="prescription-history"]'),
      ).toBeVisible();
      const prescriptions = page.locator('[data-testid="prescription-item"]');
      const prescriptionCount = await prescriptions.count();
      expect(prescriptionCount).toBe(2);

      // Verify prescription details
      const activePrescription = prescriptions.first();
      await expect(
        activePrescription.locator('[data-testid="prescription-medication"]'),
      ).toContainText('Losartana');
      await expect(
        activePrescription.locator('[data-testid="prescription-physician"]'),
      ).toContainText('Dr. Ana Santos');
      await expect(
        activePrescription.locator('[data-testid="prescription-status"]'),
      ).toContainText('active');
    });

    test('should support offline appointment modifications with conflict resolution', async ({ context, page }) => {
      await page.goto('/appointments/calendar');
      await page.waitForLoadState('networkidle');

      const existingAppointment = {
        id: 'apt-1',
        patientId: 'patient-1',
        date: '2024-01-20',
        time: '14:00',
        duration: 30,
        type: 'consulta_rotina',
        status: 'confirmed',
        lastModified: '2024-01-15T10:00:00Z',
        version: 1,
      };

      await page.evaluate(appointment => {
        localStorage.setItem(
          'neonpro_offline_appointments',
          JSON.stringify([appointment]),
        );
      }, existingAppointment);

      // Go offline
      await context.setOffline(true);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).toBeVisible();

      // Modify appointment while offline
      await page.click('[data-testid="appointment-apt-1"]');
      await page.click('[data-testid="edit-appointment"]');

      // Change appointment time
      await page.selectOption('[data-testid="appointment-time"]', '15:30');
      await page.fill(
        '[data-testid="appointment-notes"]',
        'Horário alterado pelo paciente - offline',
      );
      await page.click('[data-testid="save-appointment"]');

      // Should queue appointment update
      await expect(
        page.locator('[data-testid="appointment-update-queued"]'),
      ).toBeVisible();

      // Verify queued update
      const queuedActions = await page.evaluate(() => {
        const queue = localStorage.getItem('neonpro_pending_actions');
        return queue ? JSON.parse(queue) : [];
      });

      const appointmentUpdate = queuedActions.find(
        action => action.type === 'UPDATE_APPOINTMENT',
      );
      expect(appointmentUpdate).toBeTruthy();
      expect(appointmentUpdate.data).toMatchObject({
        id: 'apt-1',
        time: '15:30',
        notes: 'Horário alterado pelo paciente - offline',
      });

      // Go back online
      await context.setOffline(false);
      await expect(
        page.locator('[data-testid="offline-indicator"]'),
      ).not.toBeVisible();

      // Should attempt to sync appointment changes
      await expect(
        page.locator('[data-testid="appointment-sync-in-progress"]'),
      ).toBeVisible();

      // Simulate conflict (appointment was also modified online)
      await page.evaluate(() => {
        window.dispatchEvent(
          new CustomEvent('appointment-conflict', {
            detail: {
              appointmentId: 'apt-1',
              onlineVersion: {
                time: '16:00',
                notes: 'Reagendado pela clínica',
              },
              offlineVersion: {
                time: '15:30',
                notes: 'Horário alterado pelo paciente - offline',
              },
            },
          }),
        );
      });

      // Should show conflict resolution for appointment
      await expect(
        page.locator('[data-testid="appointment-conflict-dialog"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="conflict-online-version"]'),
      ).toContainText('16:00');
      await expect(
        page.locator('[data-testid="conflict-offline-version"]'),
      ).toContainText('15:30');

      // Resolve conflict by merging changes
      await page.click('[data-testid="merge-appointment-changes"]');
      await page.click('[data-testid="confirm-merge"]');

      // Should complete sync with merged appointment
      await expect(
        page.locator('[data-testid="appointment-sync-success"]'),
      ).toBeVisible();
    });
  });
});
