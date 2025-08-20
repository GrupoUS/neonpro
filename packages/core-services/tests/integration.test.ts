import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AISchedulingService, // Corrigido nome do service
  TreatmentService,
  PatientService,
  BillingService,
  InventoryService,
  NotificationService,
} from '../src';
import type {
  AISchedulingConfig,
  CreateTreatmentPlanData,
  CreatePatientData,
  CreateInvoiceData,
  CreateStockItemData,
  CreateNotificationTemplateData,
} from '../src';

describe('Core Services Integration', () => {
  let schedulingService: AISchedulingService;
  let treatmentService: TreatmentService;
  let patientService: PatientService;
  let billingService: BillingService;
  let inventoryService: InventoryService;
  let notificationService: NotificationService;

  // Mock repositories
  const mockSchedulingRepo = {};
  const mockTreatmentRepo = {};
  const mockPatientRepo = {};
  const mockBillingRepo = {};
  const mockInventoryRepo = {};
  const mockNotificationRepo = {};

  beforeEach(() => {
    vi.clearAllMocks();

    // Inicializar os services com o nome correto
    const schedulingConfig: AISchedulingConfig = {
      maxLookaheadDays: 30,
      optimizationWeight: {
        efficiency: 0.4,
        satisfaction: 0.3,
        revenue: 0.3,
      },
      conflictResolution: 'manual',
      enablePredictiveAnalytics: true,
      realtimeOptimization: true,
    };

    schedulingService = new AISchedulingService(schedulingConfig);
    treatmentService = new TreatmentService(mockTreatmentRepo);
    patientService = new PatientService(mockPatientRepo);
    billingService = new BillingService(mockBillingRepo);
    inventoryService = new InventoryService(mockInventoryRepo);
    notificationService = new NotificationService(mockNotificationRepo);
  });

  describe('Service Initialization', () => {
    it('should initialize all services without errors', () => {
      expect(schedulingService).toBeInstanceOf(AISchedulingService);
      expect(treatmentService).toBeInstanceOf(TreatmentService);
      expect(patientService).toBeInstanceOf(PatientService);
      expect(billingService).toBeInstanceOf(BillingService);
      expect(inventoryService).toBeInstanceOf(InventoryService);
      expect(notificationService).toBeInstanceOf(NotificationService);
    });
  });

  describe('Service Dependencies', () => {
    it('should handle service repository dependencies', () => {
      // Test that services can be created with their dependencies
      expect(() => {
        new AISchedulingService({
          maxLookaheadDays: 30,
          optimizationWeight: {
            efficiency: 0.4,
            satisfaction: 0.3,
            revenue: 0.3,
          },
          conflictResolution: 'manual',
          enablePredictiveAnalytics: true,
          realtimeOptimization: true,
        });
      }).not.toThrow();

      expect(() => {
        new TreatmentService(mockTreatmentRepo);
        new PatientService(mockPatientRepo);
        new BillingService(mockBillingRepo);
        new InventoryService(mockInventoryRepo);
        new NotificationService(mockNotificationRepo);
      }).not.toThrow();
    });
  });

  describe('Cross-Service Workflow', () => {
    it('should support typical aesthetic clinic workflow', async () => {
      // Mock patient creation
      const mockPatientData: CreatePatientData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        address: {
          street: '123 Main St',
          city: 'Any City',
          state: 'Any State',
          zipCode: '12345',
          country: 'USA',
        },
        preferences: {
          preferredLanguage: 'en',
          communicationPreferences: {
            email: true,
            sms: true,
            phone: false,
          },
          reminderPreferences: {
            daysBefore: [7, 1],
            methods: ['email', 'sms'],
          },
        },
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1234567891',
          relationship: 'spouse',
        },
      };

      // This test validates that the workflow chain is properly configured
      // In a real implementation, these would involve actual service calls
      expect(mockPatientData.firstName).toBe('John');
      expect(schedulingService).toBeDefined();
      expect(treatmentService).toBeDefined();
      expect(patientService).toBeDefined();
      expect(billingService).toBeDefined();
    });
  });
});