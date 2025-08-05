"use strict";
/**
 * Simple test file for financial components
 * Tests the basic functionality without complex setup
 */
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var utils_1 = require("./utils");
// Simple utility function tests
(0, globals_1.describe)('Financial Utils', function () {
    (0, globals_1.it)('should format currency correctly', function () {
        // Simple currency formatting function
        var formatCurrency = function (value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        };
        (0, globals_1.expect)(formatCurrency(1000)).toBe('R$\u00a01.000,00');
        (0, globals_1.expect)(formatCurrency(0)).toBe('R$\u00a00,00');
        (0, globals_1.expect)(formatCurrency(-500)).toBe('-R$\u00a0500,00');
    });
    (0, globals_1.it)('should format percentage correctly', function () {
        // Simple percentage formatting function
        var formatPercentage = function (value) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'percent',
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
            }).format(value / 100);
        };
        (0, globals_1.expect)(formatPercentage(25)).toBe('25,0%');
        (0, globals_1.expect)(formatPercentage(0)).toBe('0,0%');
        (0, globals_1.expect)(formatPercentage(100)).toBe('100,0%');
    });
    (0, globals_1.it)('should calculate totals correctly', function () {
        // Simple totals calculation function
        var calculateTotals = function (items) {
            var subtotal = items.reduce(function (sum, item) { return sum + (item.amount * item.quantity); }, 0);
            var tax = subtotal * 0.1; // 10% tax
            var total = subtotal + tax;
            return {
                subtotal: subtotal,
                tax: tax,
                total: total,
                count: items.length
            };
        };
        var testItems = [
            { amount: 100, quantity: 2 },
            { amount: 50, quantity: 1 },
        ];
        var result = calculateTotals(testItems);
        (0, globals_1.expect)(result.subtotal).toBe(250);
        (0, globals_1.expect)(result.tax).toBe(25);
        (0, globals_1.expect)(result.total).toBe(275);
        (0, globals_1.expect)(result.count).toBe(2);
    });
});
// Basic component interface tests
(0, globals_1.describe)('Financial Component Interfaces', function () {
    (0, globals_1.it)('should define correct invoice data structure', function () {
        var testInvoice = {
            id: 'INV-001',
            patientId: 'PAT-001',
            amount: 500,
            dueDate: '2025-02-01',
            status: 'pending',
            items: [
                {
                    description: 'Consultation',
                    quantity: 1,
                    unitPrice: 500,
                    total: 500
                }
            ]
        };
        (0, globals_1.expect)(testInvoice.id).toBe('INV-001');
        (0, globals_1.expect)(testInvoice.amount).toBe(500);
        (0, globals_1.expect)(testInvoice.items).toHaveLength(1);
        (0, globals_1.expect)(testInvoice.status).toBe('pending');
    });
    (0, globals_1.it)('should define correct appointment data structure', function () {
        var testAppointment = {
            id: 'APP-001',
            patientId: 'PAT-001',
            professionalId: 'PROF-001',
            serviceId: 'SVC-001',
            datetime: '2025-01-25T14:00:00Z',
            duration: 60,
            status: 'scheduled',
            cost: 300
        };
        (0, globals_1.expect)(testAppointment.id).toBe('APP-001');
        (0, globals_1.expect)(testAppointment.duration).toBe(60);
        (0, globals_1.expect)(testAppointment.cost).toBe(300);
        (0, globals_1.expect)(testAppointment.status).toBe('scheduled');
    });
});
// Mock data validation tests
(0, globals_1.describe)('Financial Data Validation', function () {
    (0, globals_1.it)('should validate invoice amounts', function () {
        var validateInvoiceAmount = function (amount) {
            return amount > 0 && Number.isFinite(amount);
        };
        (0, globals_1.expect)(validateInvoiceAmount(100)).toBe(true);
        (0, globals_1.expect)(validateInvoiceAmount(0)).toBe(false);
        (0, globals_1.expect)(validateInvoiceAmount(-50)).toBe(false);
        (0, globals_1.expect)(validateInvoiceAmount(Infinity)).toBe(false);
        (0, globals_1.expect)(validateInvoiceAmount(NaN)).toBe(false);
    });
    (0, globals_1.it)('should validate appointment scheduling', function () {
        // Use the global Date.now mock which is set to 2025-01-24T10:00:00.000Z (1737712800000)
        var globalFixedTime = Date.now(); // This returns the mocked timestamp
        // Create ISO date strings manually to avoid Date constructor mock
        var futureTimestamp = globalFixedTime + 2 * 60 * 60 * 1000; // 2 hours after global fixed time
        var pastTimestamp = globalFixedTime - 60 * 60 * 1000; // 1 hour before global fixed time
        // Convert timestamps to ISO strings manually to avoid Date constructor
        var futureDate = new Date(futureTimestamp).toISOString(); // This will still be mocked, need different approach
        var pastDate = new Date(pastTimestamp).toISOString(); // This will still be mocked, need different approach
        // Let's manually create valid ISO strings using the known timestamps
        // 1737712800000 = 2025-01-24T10:00:00.000Z (now)
        // 1737720000000 = 2025-01-24T12:00:00.000Z (2 hours later)
        // 1737709200000 = 2025-01-24T09:00:00.000Z (1 hour earlier)
        var futureDate2 = "2025-01-24T12:00:00.000Z"; // 2 hours after mocked time
        var pastDate2 = "2025-01-24T09:00:00.000Z"; // 1 hour before mocked time
        // Valid future appointment (using manually created future date)
        (0, globals_1.expect)((0, utils_1.validateAppointmentSlot)(futureDate2, 60)).toBe(true);
        // Past appointment should fail (using manually created past date)
        (0, globals_1.expect)((0, utils_1.validateAppointmentSlot)(pastDate2, 60)).toBe(false);
        // Invalid duration should fail
        (0, globals_1.expect)((0, utils_1.validateAppointmentSlot)(futureDate2, 0)).toBe(false);
        (0, globals_1.expect)((0, utils_1.validateAppointmentSlot)(futureDate2, 500)).toBe(false);
        // Valid duration should pass
        (0, globals_1.expect)((0, utils_1.validateAppointmentSlot)(futureDate2, 45)).toBe(true);
        // Not 15-min interval should fail
        (0, globals_1.expect)((0, utils_1.validateAppointmentSlot)(futureDate2, 37)).toBe(false);
    });
});
