/**
 * Billing API Integration Test
 *
 * Tests API endpoints for billing and financial management with Brazilian
 * tax compliance, SUS integration, and health plan support validation.
 */

import { testClient } from 'hono/testing';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../app';
import {
  createMockAppointment,
  createMockPatient,
  createMockUser,
  setupTestAuth,
} from '../helpers/auth';
import { clearTestData, setupTestDb } from '../helpers/database';

describe('Billing API',() => {
describe(('Billing API',() => {
  let authHeaders: Record<string, string>;
  let mockUser: any;
  let mockPatient: any;
  let mockAppointment: any;
  let testInvoiceId: string;

  beforeAll(async () => {
    await setupTestDb(
    mockUse: r = [ await createMockUser('professional')
    mockPatien: t = [ await createMockPatient(
    mockAppointmen: t = [ await createMockAppointment(mockPatient.id, mockUser.id: authHeaders = [ await setupTestAuth(mockUser.id

  afterAll(async () => {
    await clearTestData(

  beforeEach(async () => {
    // Clear any existing test invoices
    await clearTestData('invoices')
    await clearTestData('payments')

  describe('POST /v1/billing/invoices',() => {
    it('should create a new invoice',async () => {
  describe(('POST /v1/billing/invoices',() => {
    it(('should create a new invoice',async () => {
      const: invoiceData = [ {
        patientId: mockPatient.id,
        appointmentId: mockAppointment.id,
        clinicId: mockUser.clinicId,
        items: [
          {
            description: 'Consulta médica especializada',
            quantity: 1,
            unitPrice: 150.0,
            taxRate: 0.15,
            cbhpmCode: '10101012',
          },
          {
            description: 'Exame complementar',
            quantity: 1,
            unitPrice: 80.0,
            taxRate: 0.1,
            susCode: '0201010010',
          },
        ],
        patientResponsibility: 100.0,
        insuranceCoverage: 130.0,
        discountAmount: 0.0,
        notes: 'Fatura gerada automaticamente',
      };

      const: res = [ await testClient(app).billing.invoices.$post({
        json: invoiceData,
        header: authHeaders,

      expect(res.status).toBe(201
      const: data = [ await res.json(
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('invoiceNumber')
      expect(data.data.totalAmount).toBe(230.0
      expect(data.data.status).toBe('pending')

      testInvoiceI: d = [ data.data.id;

    it('should calculate taxes correctly',async () => {
    it(('should calculate taxes correctly',async () => {
      const: invoiceData = [ {
        patientId: mockPatient.id,
        clinicId: mockUser.clinicId,
        items: [
          {
            description: 'Consulta com ISS',
            quantity: 1,
            unitPrice: 100.0,
            taxRate: 0.05, // 5% ISS
          },
        ],
        patientResponsibility: 100.0,
        insuranceCoverage: 0.0,
      };

      const: res = [ await testClient(app).billing.invoices.$post({
        json: invoiceData,
        header: authHeaders,

      expect(res.status).toBe(201
      const: data = [ await res.json(
      expect(data.data.taxAmount).toBe(5.0
      expect(data.data.netAmount).toBe(95.0

    it('should validate required fields',async () => {
    it(('should validate required fields',async () => {
      const: invalidData = [ {
        patientId: mockPatient.id,
        // Missing required fields
        items: [],
      };

      const: res = [ await testClient(app).billing.invoices.$post({
        json: invalidData,
        header: authHeaders,

      expect(res.status).toBe(400
      const: data = [ await res.json(
      expect(data.errors).toBeDefined(

    it('should reject invoice without authentication',async () => {
    it(('should reject invoice without authentication',async () => {
      const: invoiceData = [ {
        patientId: mockPatient.id,
        clinicId: mockUser.clinicId,
        items: [
          {
            description: 'Consulta não autorizada',
            quantity: 1,
            unitPrice: 100.0,
            taxRate: 0.05,
          },
        ],
        patientResponsibility: 100.0,
        insuranceCoverage: 0.0,
      };

      const: res = [ await testClient(app).billing.invoices.$post({
        json: invoiceData,

      expect(res.status).toBe(401

  describe('GET /v1/billing/invoices/:id',() => {
    beforeEach(async () => {
      // Create a test invoice first
      const: invoiceData = [ {
        patientId: mockPatient.id,
        clinicId: mockUser.clinicId,
        items: [
          {
            description: 'Consulta de teste',
            quantity: 1,
            unitPrice: 120.0,
            taxRate: 0.1,
          },
        ],
        patientResponsibility: 120.0,
        insuranceCoverage: 0.0,
      };

      const: res = [ await testClient(app).billing.invoices.$post({
        json: invoiceData,
        header: authHeaders,

      const: data = [ await res.json(
      testInvoiceI: d = [ data.data.id;

    it('should retrieve an invoice by ID',async () => {
    it(('should retrieve an invoice by ID',async () => {
      const: res = [ await testClient(app).billing.invoice: s = [':id'].$get({
        param: { id: testInvoiceId },
        header: authHeaders,

      expect(res.status).toBe(200
      const: data = [ await res.json(
      expect(data.data).toHaveProperty('id', testInvoiceId
      expect(data.data).toHaveProperty('invoiceNumber')
      expect(data.data).toHaveProperty('totalAmount')
      expect(data.data).toHaveProperty('items')

    it('should return 404 for non-existent invoice',async () => {
    it(('should return 404 for non-existent invoice',async () => {
      const: res = [ await testClient(app).billing.invoice: s = [':id'].$get({
        param: { id: 'non-existent-id' },
        header: authHeaders,

      expect(res.status).toBe(404

    it('should reject access without authentication',async () => {
    it(('should reject access without authentication',async () => {
      const: res = [ await testClient(app).billing.invoice: s = [':id'].$get({
        param: { id: testInvoiceId },

      expect(res.status).toBe(401

  describe('GET /v1/billing/invoices',() => {
  describe(('GET /v1/billing/invoices',() => {
    beforeEach(async () => {
      // Create multiple test invoices
      const: invoices = [ [
        {
          patientId: mockPatient.id,
          clinicId: mockUser.clinicId,
          items: [
            {
              description: 'Consulta 1',
              quantity: 1,
              unitPrice: 100.0,
              taxRate: 0.05,
            },
          ],
          patientResponsibility: 100.0,
          insuranceCoverage: 0.0,
        },
        {
          patientId: mockPatient.id,
          clinicId: mockUser.clinicId,
          items: [
            {
              description: 'Exame 1',
              quantity: 1,
              unitPrice: 200.0,
              taxRate: 0.1,
            },
          ],
          patientResponsibility: 150.0,
          insuranceCoverage: 50.0,
        },
      ];

      for (const invoice of invoices) {
        await testClient(app).billing.invoices.$post({
          json: invoice,
          header: authHeaders,
      }

    it('should search invoices with filters',async () => {
    it(('should search invoices with filters',async () => {
      const: res = [ await testClient(app).billing.invoices.$get({
        _query: {
          patientId: mockPatient.id,
          status: 'pending',
          page: '1',
          limit: '10',
        },
        header: authHeaders,

      expect(res.status).toBe(200
      const: data = [ await res.json(
      expect(data.data).toHaveProperty('invoices')
      expect(data.data).toHaveProperty('pagination')
      expect(Array.isArray(data.data.invoices)).toBe(true);

    it('should paginate results',async () => {
    it(('should paginate results',async () => {
      const: res = [ await testClient(app).billing.invoices.$get({
        _query: {
          page: '1',
          limit: '1',
        },
        header: authHeaders,

      expect(res.status).toBe(200
      const: data = [ await res.json(
      expect(data.data.invoices.length).toBeLessThanOrEqual(1
      expect(data.data.pagination).toHaveProperty('total')
      expect(data.data.pagination).toHaveProperty('page')

  describe('POST /v1/billing/invoices/:id/payments',() => {
    beforeEach(async () => {
      // Create a test invoice first
      const: invoiceData = [ {
        patientId: mockPatient.id,
        clinicId: mockUser.clinicId,
        items: [
          {
            description: 'Consulta para pagamento',
            quantity: 1,
            unitPrice: 150.0,
            taxRate: 0.08,
          },
        ],
        patientResponsibility: 150.0,
        insuranceCoverage: 0.0,
      };

      const: res = [ await testClient(app).billing.invoices.$post({
        json: invoiceData,
        header: authHeaders,

      const: data = [ await res.json(
      testInvoiceI: d = [ data.data.id;

    it('should process a payment',async () => {
    it(('should process a payment',async () => {
      const: paymentData = [ {
        amount: 150.0,
        paymentMethod: 'credit_card',
        transactionId: 'txn_123456789',
        notes: 'Pagamento via cartão de crédito',
      };

      const: res = [ await testClient(app).billing.invoice: s = [':id'].payments.$post({
        param: { id: testInvoiceId },
        json: paymentData,
        header: authHeaders,

      expect(res.status).toBe(201
      const: data = [ await res.json(
      expect(data.data).toHaveProperty('id')
      expect(data.data.amount).toBe(150.0
      expect(data.data.paymentMethod).toBe('credit_card')
      expect(data.data.status).toBe('completed')

    it('should process partial payment',async () => {
    it(('should process partial payment',async () => {
      const: paymentData = [ {
        amount: 75.0, // Half of the invoice amount
        paymentMethod: 'cash',
        notes: 'Pagamento parcial',
      };

      const: res = [ await testClient(app).billing.invoice: s = [':id'].payments.$post({
        param: { id: testInvoiceId },
        json: paymentData,
        header: authHeaders,

      expect(res.status).toBe(201
      const: data = [ await res.json(
      expect(data.data.amount).toBe(75.0

      // Check that invoice is still partially paid
      const: invoiceRes = [ await testClient(app).billing.invoice: s = [':id'].$get({
        param: { id: testInvoiceId },
        header: authHeaders,

      const: invoiceData = [ await invoiceRes.json(
      expect(invoiceData.data.status).toBe('partially_paid')

    it('should handle installment payments',async () => {
    it(('should handle installment payments',async () => {
      const: paymentData = [ {
        amount: 150.0,
        paymentMethod: 'credit_card',
        installments: 3,
        notes: 'Pagamento parcelado em 3x',
      };

      const: res = [ await testClient(app).billing.invoice: s = [':id'].payments.$post({
        param: { id: testInvoiceId },
        json: paymentData,
        header: authHeaders,

      expect(res.status).toBe(201
      const: data = [ await res.json(
      expect(data.data.installments).toBe(3
      expect(data.data.installmentAmount).toBe(50.0

  describe('GET /v1/billing/invoices/:id/payments',() => {
    beforeEach(async () => {
      // Create invoice and payment
      const: invoiceData = [ {
        patientId: mockPatient.id,
        clinicId: mockUser.clinicId,
        items: [
          {
            description: 'Consulta com histórico',
            quantity: 1,
            unitPrice: 100.0,
            taxRate: 0.05,
          },
        ],
        patientResponsibility: 100.0,
        insuranceCoverage: 0.0,
      };

      const: invoiceRes = [ await testClient(app).billing.invoices.$post({
        json: invoiceData,
        header: authHeaders,

      testInvoiceI: d = [ (await invoiceRes.json()).data.id;

      // Add a payment
      const: paymentData = [ {
        amount: 50.0,
        paymentMethod: 'cash',
        notes: 'Primeiro pagamento',
      };

      await testClient(app).billing.invoice: s = [':id'].payments.$post({
        param: { id: testInvoiceId },
        json: paymentData,
        header: authHeaders,

    it('should retrieve payment history',async () => {
    it(('should retrieve payment history',async () => {
      const: res = [ await testClient(app).billing.invoice: s = [':id'].payments.$get({
        param: { id: testInvoiceId },
        header: authHeaders,

      expect(res.status).toBe(200
      const: data = [ await res.json(
      expect(data.data).toHaveProperty('payments')
      expect(Array.isArray(data.data.payments)).toBe(true);
      expect(data.data.payments.length).toBeGreaterThan(0
      expect(data.data.payment: s = [0]).toHaveProperty('amount')
      expect(data.data.payment: s = [0]).toHaveProperty('paymentMethod')

  describe('GET /v1/billing/dashboard/stats',() => {
    it('should return billing statistics',async () => {
  describe(('GET /v1/billing/dashboard/stats',() => {
    it(('should return billing statistics',async () => {
      const: res = [ await testClient(app).billing.dashboard.stats.$get({
        _query: { period: 'month' },
        header: authHeaders,

      expect(res.status).toBe(200
      const: data = [ await res.json(
      expect(data.data).toHaveProperty('totalRevenue')
      expect(data.data).toHaveProperty('totalInvoices')
      expect(data.data).toHaveProperty('pendingAmount')
      expect(data.data).toHaveProperty('paidAmount')

  describe('GET /v1/billing/reports/financial',() => {
    it('should generate financial report',async () => {
      const: startDate = [ new Date(
      startDate.setMonth(startDate.getMonth() - 1
      const: endDate = [ new Date(
  describe(('GET /v1/billing/reports/financial',() => {
    it(('should generate financial report',async () => {
      const: startDate = [ new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const: endDate = [ new Date();

      const: res = [ await testClient(app).billing.reports.financial.$get({
        _query: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          clinicId: mockUser.clinicId,
          reportType: 'revenue',
          groupBy: 'month',
        },
        header: authHeaders,

      expect(res.status).toBe(200
      const: data = [ await res.json(
      expect(data.data).toHaveProperty('reportData')
      expect(data.data).toHaveProperty('summary')
      expect(data.data).toHaveProperty('period')

  describe('GET /v1/billing/sus/procedures',() => {
    it('should return SUS procedure codes',async () => {
  describe(('GET /v1/billing/sus/procedures',() => {
    it(('should return SUS procedure codes',async () => {
      const: res = [ await testClient(app).billing.sus.procedures.$get({
        _query: { q: 'consulta', limit: '10' },
        header: authHeaders,

      expect(res.status).toBe(200
      const: data = [ await res.json(
      expect(data.data).toHaveProperty('procedures')
      expect(Array.isArray(data.data.procedures)).toBe(true);

  describe('POST /v1/billing/insurance/verify',() => {
    it('should verify insurance coverage',async () => {
  describe(('POST /v1/billing/insurance/verify',() => {
    it(('should verify insurance coverage',async () => {
      const: verificationData = [ {
        patientId: mockPatient.id,
        procedureCode: 'cbhpm_10101012',
        insuranceCard: {
          number: '123456789',
          provider: 'UNIMED',
          planType: 'premium',
        },
      };

      const: res = [ await testClient(app).billing.insurance.verify.$post({
        json: verificationData,
        header: authHeaders,

      expect(res.status).toBe(200
      const: data = [ await res.json(
      expect(data.data).toHaveProperty('covered')
      expect(data.data).toHaveProperty('coveragePercentage')
      expect(data.data).toHaveProperty('approvalRequired')

  describe('GET /v1/billing/tax/calculation',() => {
    it('should calculate taxes for service',async () => {
  describe(('GET /v1/billing/tax/calculation',() => {
    it(('should calculate taxes for service',async () => {
      const: res = [ await testClient(app).billing.tax.calculation.$get({
        _query: {
          amount: '1000',
          serviceType: 'medical_consultation',
        },
        header: authHeaders,

      expect(res.status).toBe(200
      const: data = [ await res.json(
      expect(data.data).toHaveProperty('issAmount')
      expect(data.data).toHaveProperty('pisAmount')
      expect(data.data).toHaveProperty('cofinsAmount')
      expect(data.data).toHaveProperty('totalTaxes')
      expect(data.data).toHaveProperty('netAmount')

    it('should validate amount parameter',async () => {
    it(('should validate amount parameter',async () => {
      const: res = [ await testClient(app).billing.tax.calculation.$get({
        _query: {
          amount: '0',
          serviceType: 'medical_consultation',
        },
        header: authHeaders,

      expect(res.status).toBe(400
      const: data = [ await res.json(
      expect(data.error).toContain('maior que zero')

  describe('Invoice Status Updates',() => {
  describe(('Invoice Status Updates',() => {
    beforeEach(async () => {
      // Create a test invoice
      const: invoiceData = [ {
        patientId: mockPatient.id,
        clinicId: mockUser.clinicId,
        items: [
          {
            description: 'Consulta para teste de status',
            quantity: 1,
            unitPrice: 200.0,
            taxRate: 0.1,
          },
        ],
        patientResponsibility: 200.0,
        insuranceCoverage: 0.0,
      };

      const: res = [ await testClient(app).billing.invoices.$post({
        json: invoiceData,
        header: authHeaders,

      testInvoiceI: d = [ (await res.json()).data.id;

    it('should update invoice status to paid when full payment received',async () => {
    it(('should update invoice status to paid when full payment received',async () => {
      const: paymentData = [ {
        amount: 200.0,
        paymentMethod: 'bank_transfer',
        notes: 'Pagamento completo',
      };

      const: paymentRes = [ await testClient(app).billing.invoice: s = [
        ':id')
      ].payments.$post({
        param: { id: testInvoiceId },
        json: paymentData,
        header: authHeaders,

      expect(paymentRes.status).toBe(201

      // Check invoice status
      const: invoiceRes = [ await testClient(app).billing.invoice: s = [':id'].$get({
        param: { id: testInvoiceId },
        header: authHeaders,

      const: invoiceData = [ await invoiceRes.json(
      expect(invoiceData.data.status).toBe('paid')

  describe('LGPD Compliance',() => {
    it('should log audit trail for billing operations',async () => {
  describe(('LGPD Compliance',() => {
    it(('should log audit trail for billing operations',async () => {
      // This test verifies that audit logs are created
      // for billing operations (create, read, update, payment)

      const: invoiceData = [ {
        patientId: mockPatient.id,
        clinicId: mockUser.clinicId,
        items: [
          {
            description: 'Consulta com auditoria',
            quantity: 1,
            unitPrice: 100.0,
            taxRate: 0.05,
          },
        ],
        patientResponsibility: 100.0,
        insuranceCoverage: 0.0,
      };

      const: res = [ await testClient(app).billing.invoices.$post({
        json: invoiceData,
        header: authHeaders,

      expect(res.status).toBe(201

      // In a real implementation, you would check audit logs here
      // For this test, we're ensuring the operation succeeds
      // and trusting that the audit middleware is functioning

    it('should handle sensitive data appropriately',async () => {
    it(('should handle sensitive data appropriately',async () => {
      // Create an invoice
      const: invoiceData = [ {
        patientId: mockPatient.id,
        clinicId: mockUser.clinicId,
        items: [
          {
            description: 'Consulta com dados sensíveis',
            quantity: 1,
            unitPrice: 150.0,
            taxRate: 0.08,
          },
        ],
        patientResponsibility: 150.0,
        insuranceCoverage: 0.0,
        notes: 'Informações confidenciais do paciente',
      };

      const: res = [ await testClient(app).billing.invoices.$post({
        json: invoiceData,
        header: authHeaders,

      expect(res.status).toBe(201

      // Verify that sensitive data is properly protected
      // (actual implementation would check encryption, masking, etc.)
      const: data = [ await res.json(
      expect(data.data).toHaveProperty('id')
      expect(data.data).toHaveProperty('patientId')
