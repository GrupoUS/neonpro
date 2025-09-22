/**
 * Billing Service Unit Test
 *
 * Tests the core functionality of BillingService without
 * HTTP dependencies for faster validation.
 */

import { randomUUID } from 'crypto';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  BillingService,
  BillingType,
  PaymentMethod,
  PaymentStatus,
} from '../../services/billing-service';

<<<<<<< HEAD
describe('BillingService',() => {
=======
describe(_'BillingService',() => {
>>>>>>> origin/main
  let _service: BillingService;

  beforeAll(() => {
    service = new BillingService(

<<<<<<< HEAD
  describe('Service Initialization',() => {
    it('should initialize without errors',() => {
      expect(service).toBeDefined(
      expect(service).toBeInstanceOf(BillingService

    it('should have required methods',() => {
      expect(typeof service.createBilling).toBe('function')
      expect(typeof service.getBilling).toBe('function')
      expect(typeof service.searchBillings).toBe('function')
      expect(typeof service.processPayment).toBe('function')
      expect(typeof service.getFinancialSummary).toBe('function')

  describe('createBilling',() => {
    it('should create a billing successfully',async () => {
=======
  describe(_'Service Initialization',() => {
    it(_'should initialize without errors',() => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(BillingService);
    });

    it(_'should have required methods',() => {
      expect(typeof service.createBilling).toBe('function');
      expect(typeof service.getBilling).toBe('function');
      expect(typeof service.searchBillings).toBe('function');
      expect(typeof service.processPayment).toBe('function');
      expect(typeof service.getFinancialSummary).toBe('function');
    });
  });

  describe(_'createBilling',() => {
    it(_'should create a billing successfully',async () => {
>>>>>>> origin/main
      const billingData = {
        patientId: randomUUID(),
        clinicId: randomUUID(),
        professionalId: randomUUID(),
        items: [
          {
            id: randomUUID(),
            procedureCode: {
              cbhpmCode: '10101012',
              description: 'Consulta médica especializada',
              value: 150.0,
              category: 'Consulta',
            },
            quantity: 1,
            unitValue: 150.0,
            totalValue: 150.0,
            date: new Date().toISOString(),
            professionalId: randomUUID(),
          },
        ],
        billingType: BillingType.PRIVATE,
      };

      const result = await service.createBilling(billingData

      if (!result.success) {
        console.log('Create billing failed:', result.error, result.errors
      }

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined(
      expect(result.data?.patientId).toBe(billingData.patientId
      expect(result.data?.total).toBe(157.5); // 150 + 5% ISS tax

<<<<<<< HEAD
    it('should fail when required fields are missing',async () => {
=======
    it(_'should fail when required fields are missing',async () => {
>>>>>>> origin/main
      const invalidData = {
        // Missing required fields
        items: [],
      };

      const result = await service.createBilling(invalidData

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined(

<<<<<<< HEAD
  describe('getBilling',() => {
    it('should return billing by ID',async () => {
=======
  describe(_'getBilling',() => {
    it(_'should return billing by ID',async () => {
>>>>>>> origin/main
      // First create a billing
      const billingData = {
        patientId: randomUUID(),
        clinicId: randomUUID(),
        professionalId: randomUUID(),
        items: [
          {
            id: randomUUID(),
            procedureCode: {
              cbhpmCode: '10101012',
              description: 'Consulta médica especializada',
              value: 100.0,
              category: 'Consulta',
            },
            quantity: 1,
            unitValue: 100.0,
            totalValue: 100.0,
            date: new Date().toISOString(),
            professionalId: randomUUID(),
          },
        ],
        billingType: BillingType.PRIVATE,
      };

      const createResult = await service.createBilling(billingData
      expect(createResult.success).toBe(true);

      // Then retrieve it
      const result = await service.getBilling(createResult.data!.id

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined(
      expect(result.data?.id).toBe(createResult.data!.id

<<<<<<< HEAD
    it('should return error for non-existent billing',async () => {
      const result = await service.getBilling('non-existent-id')
=======
    it(_'should return error for non-existent billing',async () => {
      const result = await service.getBilling('non-existent-id');
>>>>>>> origin/main

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined(

<<<<<<< HEAD
  describe('searchBillings',() => {
    it('should search billings with filters',async () => {
=======
  describe(_'searchBillings',() => {
    it(_'should search billings with filters',async () => {
>>>>>>> origin/main
      const result = await service.searchBillings({
        patientId: randomUUID(),
        page: 1,
        limit: 10,

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined(
      expect(result.data?.billings).toBeInstanceOf(Array
      expect(result.data?.pagination).toBeDefined(

<<<<<<< HEAD
  describe('processPayment',() => {
    it('should process payment successfully',async () => {
=======
  describe(_'processPayment',() => {
    it(_'should process payment successfully',async () => {
>>>>>>> origin/main
      // First create a billing
      const billingData = {
        patientId: randomUUID(),
        clinicId: randomUUID(),
        professionalId: randomUUID(),
        items: [
          {
            id: randomUUID(),
            procedureCode: {
              cbhpmCode: '10101012',
              description: 'Consulta médica especializada',
              value: 200.0,
              category: 'Consulta',
            },
            quantity: 1,
            unitValue: 200.0,
            totalValue: 200.0,
            date: new Date().toISOString(),
            professionalId: randomUUID(),
          },
        ],
        billingType: BillingType.PRIVATE,
      };

      const createResult = await service.createBilling(billingData
      expect(createResult.success).toBe(true);

      // Process payment
      const paymentRequest = {
        billingId: createResult.data!.id,
        paymentMethod: PaymentMethod.PIX,
        amount: 200.0,
      };

      const result = await service.processPayment(paymentRequest

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined(
      expect(result.data?.paymentId).toBeDefined(
      expect(result.data?.status).toBe(PaymentStatus.PAID); // PIX is instant

<<<<<<< HEAD
  describe('getFinancialSummary',() => {
    it('should generate financial summary',async () => {
      const result = await service.getFinancialSummary(randomUUID()
=======
  describe(_'getFinancialSummary',() => {
    it(_'should generate financial summary',async () => {
      const result = await service.getFinancialSummary(randomUUID());
>>>>>>> origin/main

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined(
      expect(result.data?.totalRevenue).toBeDefined(
      expect(result.data?.totalPending).toBeDefined(
      expect(result.data?.revenueByType).toBeDefined(

<<<<<<< HEAD
  describe('Enums',() => {
    it('should have all required payment statuses',() => {
=======
  describe(_'Enums',() => {
    it(_'should have all required payment statuses',() => {
>>>>>>> origin/main
      const expectedStatuses = [
        'pending',
        'authorized',
        'paid',
        'cancelled',
        'refunded',
        'partially_paid',
        'overdue',
      ];

      expectedStatuses.forEach(status => {
        expect(Object.values(PaymentStatus)).toContain(status

<<<<<<< HEAD
    it('should have all required payment methods',() => {
=======
    it(_'should have all required payment methods',() => {
>>>>>>> origin/main
      const expectedMethods = [
        'cash',
        'debit_card',
        'credit_card',
        'pix',
        'bank_transfer',
        'health_plan',
        'sus',
        'installment',
      ];

      expectedMethods.forEach(method => {
        expect(Object.values(PaymentMethod)).toContain(method

<<<<<<< HEAD
    it('should have all required billing types',() => {
=======
    it(_'should have all required billing types',() => {
>>>>>>> origin/main
      const expectedTypes = ['sus', 'health_plan', 'private', 'mixed'];

      expectedTypes.forEach(type => {
        expect(Object.values(BillingType)).toContain(type
