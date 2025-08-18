import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SchedulingService,
  TreatmentService,
  PatientService,
  InventoryService,
  BillingService,
  NotificationService,
  AppointmentStatus,
  TreatmentType,
  PatientStatus,
  ProductCategory,
  PaymentMethod,
  NotificationChannel
} from '../src';

// Mock repositories for testing
const mockSchedulingRepo = {
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
  deleteAppointment: vi.fn(),
  getAppointment: vi.fn(),
  getAppointmentsByProvider: vi.fn(),
  getAppointmentsByPatient: vi.fn(),
  getAppointmentsByDateRange: vi.fn(),
  createProvider: vi.fn(),
  updateProvider: vi.fn(),
  getProvider: vi.fn(),
  getProviders: vi.fn(),
  getActiveProviders: vi.fn()
};

const mockTreatmentRepo = {
  createTreatmentPlan: vi.fn(),
  updateTreatmentPlan: vi.fn(),
  getTreatmentPlan: vi.fn(),
  getTreatmentPlansByPatient: vi.fn(),
  getTreatmentPlansByProvider: vi.fn(),
  createTreatmentSession: vi.fn(),
  updateTreatmentSession: vi.fn(),
  getTreatmentSession: vi.fn(),
  getTreatmentSessionsByPlan: vi.fn(),
  completeTreatmentSession: vi.fn()
};

const mockPatientRepo = {
  createPatient: vi.fn(),
  updatePatient: vi.fn(),
  getPatient: vi.fn(),
  getPatientByEmail: vi.fn(),
  getPatients: vi.fn(),
  deletePatient: vi.fn(),
  updateMedicalHistory: vi.fn(),
  updateAestheticHistory: vi.fn(),
  updateSkinAssessment: vi.fn(),
  addConsentForm: vi.fn(),
  getConsentForms: vi.fn(),
  searchPatients: vi.fn(),
  getPatientStats: vi.fn()
};

const mockInventoryRepo = {
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  getProduct: vi.fn(),
  getProducts: vi.fn(),
  getProductBySku: vi.fn(),
  createStockItem: vi.fn(),
  updateStockItem: vi.fn(),
  getStockItem: vi.fn(),
  getStockItems: vi.fn(),
  createStockMovement: vi.fn(),
  getStockMovements: vi.fn(),
  createSupplier: vi.fn(),
  updateSupplier: vi.fn(),
  getSupplier: vi.fn(),
  getSuppliers: vi.fn(),
  createPurchaseOrder: vi.fn(),
  updatePurchaseOrder: vi.fn(),
  getPurchaseOrder: vi.fn(),
  getPurchaseOrders: vi.fn(),
  createAlert: vi.fn(),
  getAlerts: vi.fn(),
  acknowledgeAlert: vi.fn()
};const mockBillingRepo = {
  createInvoice: vi.fn(),
  updateInvoice: vi.fn(),
  getInvoice: vi.fn(),
  getInvoicesByPatient: vi.fn(),
  getInvoicesByStatus: vi.fn(),
  getInvoicesByDateRange: vi.fn(),
  createPayment: vi.fn(),
  updatePayment: vi.fn(),
  getPayment: vi.fn(),
  getPaymentsByInvoice: vi.fn(),
  getPaymentsByPatient: vi.fn(),
  createPaymentPlan: vi.fn(),
  updatePaymentPlan: vi.fn(),
  getPaymentPlan: vi.fn(),
  getPaymentPlansByPatient: vi.fn(),
  createTreatmentPackage: vi.fn(),
  updateTreatmentPackage: vi.fn(),
  getTreatmentPackage: vi.fn(),
  getTreatmentPackages: vi.fn(),
  createDiscount: vi.fn(),
  updateDiscount: vi.fn(),
  getDiscount: vi.fn(),
  getDiscountByCode: vi.fn(),
  getDiscounts: vi.fn(),
  createRefund: vi.fn(),
  updateRefund: vi.fn(),
  getRefund: vi.fn(),
  getRefundsByPatient: vi.fn()
};

const mockNotificationRepo = {
  createNotification: vi.fn(),
  updateNotification: vi.fn(),
  getNotification: vi.fn(),
  getNotificationsByRecipient: vi.fn(),
  getNotificationsByStatus: vi.fn(),
  getScheduledNotifications: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  getTemplate: vi.fn(),
  getTemplates: vi.fn(),
  createCampaign: vi.fn(),
  updateCampaign: vi.fn(),
  getCampaign: vi.fn(),
  getCampaigns: vi.fn(),
  createOrUpdatePreferences: vi.fn(),
  getPreferences: vi.fn(),
  createLog: vi.fn(),
  getLogs: vi.fn(),
  getPatients: vi.fn(),
  getPatient: vi.fn(),
  getAppointment: vi.fn(),
  getTreatmentPlan: vi.fn()
};

const mockExternalProvider = {
  sendEmail: vi.fn().mockResolvedValue('email-123'),
  sendSMS: vi.fn().mockResolvedValue('sms-456'),
  sendWhatsApp: vi.fn().mockResolvedValue('wa-789'),
  sendPush: vi.fn().mockResolvedValue('push-000')
};

describe('Core Services Integration', () => {
  let schedulingService: SchedulingService;
  let treatmentService: TreatmentService;
  let patientService: PatientService;
  let inventoryService: InventoryService;
  let billingService: BillingService;
  let notificationService: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    schedulingService = new SchedulingService(mockSchedulingRepo);
    treatmentService = new TreatmentService(mockTreatmentRepo);
    patientService = new PatientService(mockPatientRepo);
    inventoryService = new InventoryService(mockInventoryRepo);
    billingService = new BillingService(mockBillingRepo);
    notificationService = new NotificationService(mockNotificationRepo, mockExternalProvider);
  });

  describe('Service Initialization', () => {
    it('should initialize all services without errors', () => {
      expect(schedulingService).toBeInstanceOf(SchedulingService);
      expect(treatmentService).toBeInstanceOf(TreatmentService);
      expect(patientService).toBeInstanceOf(PatientService);
      expect(inventoryService).toBeInstanceOf(InventoryService);
      expect(billingService).toBeInstanceOf(BillingService);
      expect(notificationService).toBeInstanceOf(NotificationService);
    });
  });

  describe('Service Dependencies', () => {
    it('should handle service repository dependencies', () => {
      expect(schedulingService['repository']).toBe(mockSchedulingRepo);
      expect(treatmentService['repository']).toBe(mockTreatmentRepo);
      expect(patientService['repository']).toBe(mockPatientRepo);
      expect(inventoryService['repository']).toBe(mockInventoryRepo);
      expect(billingService['repository']).toBe(mockBillingRepo);
      expect(notificationService['repository']).toBe(mockNotificationRepo);
    });
  });

  describe('Cross-Service Workflow', () => {
    it('should support typical aesthetic clinic workflow', async () => {
      // This is a basic workflow test - in real implementation,
      // services would interact through shared data layer
      
      // 1. Patient creation
      const patientData = {
        firstName: 'Maria',
        lastName: 'Silva',
        email: 'maria@example.com',
        phone: '+5511999999999',
        dateOfBirth: new Date('1990-01-01'),
        gender: 'female' as any,
        address: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000',
          country: 'Brasil'
        },
        emergencyContact: {
          name: 'João Silva',
          relationship: 'Spouse',
          phone: '+5511888888888'
        },
        allergies: [],
        medications: [],
        photoConsent: true,
        marketingConsent: true,
        lgpdConsent: true,
        tags: ['new-patient']
      };

      mockPatientRepo.createPatient.mockResolvedValue({
        id: 'patient-123',
        ...patientData,
        status: PatientStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const patient = await patientService.createPatient(patientData);
      expect(patient.id).toBe('patient-123');
      expect(mockPatientRepo.createPatient).toHaveBeenCalledWith(patientData);
    });
  });
});