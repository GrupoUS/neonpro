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

describe('BillingService',() => {
  let _service: BillingService;

  beforeAll(() => {
    service = new BillingService(

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

    it('should fail when required fields are missing',async () => {
      const invalidData = {
        // Missing required fields
        items: [],
      };

      const result = await service.createBilling(invalidData

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined(

  describe('getBilling',() => {
    it('should return billing by ID',async () => {
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

    it('should return error for non-existent billing',async () => {
      const result = await service.getBilling('non-existent-id')

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined(

  describe('searchBillings',() => {
    it('should search billings with filters',async () => {
      const result = await service.searchBillings({
        patientId: randomUUID(),
        page: 1,
        limit: 10,

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined(
      expect(result.data?.billings).toBeInstanceOf(Array
      expect(result.data?.pagination).toBeDefined(

  describe('processPayment',() => {
    it('should process payment successfully',async () => {
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

  describe('getFinancialSummary',() => {
    it('should generate financial summary',async () => {
      const result = await service.getFinancialSummary(randomUUID()

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined(
      expect(result.data?.totalRevenue).toBeDefined(
      expect(result.data?.totalPending).toBeDefined(
      expect(result.data?.revenueByType).toBeDefined(

  describe('Enums',() => {
    it('should have all required payment statuses',() => {
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

    it('should have all required payment methods',() => {
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

    it('should have all required billing types',() => {
      const expectedTypes = ['sus', 'health_plan', 'private', 'mixed'];

      expectedTypes.forEach(type => {
        expect(Object.values(BillingType)).toContain(type
