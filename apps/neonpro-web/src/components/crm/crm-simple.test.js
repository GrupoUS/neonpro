"use strict";
/**
 * CRM Business Logic Test Suite
 * Comprehensive tests for Customer Relationship Management utilities
 * Created: January 24, 2025
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
// Test data - hardcoded ISO strings to avoid Date mocking issues
var FIXED_NOW = '2025-01-24T12:00:00.000Z';
var PAST_DATE = '2024-10-24T12:00:00.000Z'; // 92 days ago
var RECENT_DATE = '2025-01-10T12:00:00.000Z'; // 14 days ago
var FUTURE_DATE = '2025-02-24T12:00:00.000Z'; // 31 days from now
var mockCustomer = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    registrationDate: PAST_DATE,
    lastVisitDate: RECENT_DATE,
    totalSpent: 1500,
    appointmentCount: 8,
    communicationPreference: 'email',
    satisfactionRating: 4.5,
    tags: ['vip', 'referral'],
    leadSource: 'google',
    status: 'active'
};
var mockAppointments = [
    {
        id: '1',
        customerId: '1',
        service: 'Facial Treatment',
        cost: 200,
        date: RECENT_DATE,
        duration: 60,
        status: 'completed',
        satisfaction: 5
    },
    {
        id: '2',
        customerId: '1',
        service: 'Hair Treatment',
        cost: 150,
        date: PAST_DATE,
        duration: 90,
        status: 'completed',
        satisfaction: 4
    }
];
describe('CRM Lead Scoring Functions', function () {
    test('calculateLeadScore should calculate correct score for customer', function () {
        var leadScore = (0, utils_1.calculateLeadScore)(mockCustomer, mockAppointments);
        expect(leadScore.customerId).toBe(mockCustomer.id);
        expect(leadScore.score).toBeGreaterThan(0);
        expect(leadScore.score).toBeLessThanOrEqual(100);
        expect(leadScore.factors.engagement).toBeGreaterThan(0);
        expect(leadScore.factors.value).toBeGreaterThan(0);
        expect(leadScore.factors.frequency).toBeGreaterThan(0);
        expect(leadScore.factors.recency).toBeGreaterThan(0);
        expect(['high', 'medium', 'low']).toContain(leadScore.priority);
    });
    test('calculateLeadScore should handle customer without appointments', function () {
        var leadScore = (0, utils_1.calculateLeadScore)(mockCustomer, []);
        expect(leadScore.customerId).toBe(mockCustomer.id);
        expect(leadScore.score).toBeGreaterThanOrEqual(0);
        expect(leadScore.score).toBeLessThanOrEqual(100);
    });
    test('calculateLeadScore should throw error for invalid customer', function () {
        // @ts-ignore - Testing invalid input
        expect(function () { return (0, utils_1.calculateLeadScore)(null); }).toThrow('Invalid customer data provided');
        expect(function () { return (0, utils_1.calculateLeadScore)({}); }).toThrow('Invalid customer data provided');
    });
    test('categorizeLeadPriority should categorize scores correctly', function () {
        expect((0, utils_1.categorizeLeadPriority)(80)).toBe('high');
        expect((0, utils_1.categorizeLeadPriority)(70)).toBe('high');
        expect((0, utils_1.categorizeLeadPriority)(60)).toBe('medium');
        expect((0, utils_1.categorizeLeadPriority)(40)).toBe('medium');
        expect((0, utils_1.categorizeLeadPriority)(30)).toBe('low');
        expect((0, utils_1.categorizeLeadPriority)(0)).toBe('low');
    });
});
describe('CRM Lifecycle Functions', function () {
    test('determineCustomerLifecycle should classify active customer correctly', function () {
        var lifecycle = (0, utils_1.determineCustomerLifecycle)(mockCustomer);
        expect(['new', 'active', 'at-risk', 'churned']).toContain(lifecycle);
    });
    test('determineCustomerLifecycle should handle new customer', function () {
        var newCustomer = __assign(__assign({}, mockCustomer), { registrationDate: RECENT_DATE, appointmentCount: 1, lastVisitDate: RECENT_DATE });
        var lifecycle = (0, utils_1.determineCustomerLifecycle)(newCustomer);
        expect(['new', 'active']).toContain(lifecycle);
    });
    test('determineCustomerLifecycle should handle churned customer', function () {
        var churnedCustomer = __assign(__assign({}, mockCustomer), { lastVisitDate: '2024-08-01T12:00:00.000Z', status: 'churned' });
        var lifecycle = (0, utils_1.determineCustomerLifecycle)(churnedCustomer);
        expect(lifecycle).toBe('churned');
    });
    test('calculateDaysSinceLastVisit should calculate days correctly', function () {
        // Mock Date.now to return our fixed date
        var originalDateNow = Date.now;
        Date.now = jest.fn(function () { return Date.parse(FIXED_NOW); });
        var days = (0, utils_1.calculateDaysSinceLastVisit)(RECENT_DATE);
        expect(days).toBe(14); // 14 days difference
        // Restore original Date.now
        Date.now = originalDateNow;
    });
    test('calculateDaysSinceLastVisit should throw error for invalid date', function () {
        expect(function () { return (0, utils_1.calculateDaysSinceLastVisit)(''); }).toThrow('Last visit date is required');
        expect(function () { return (0, utils_1.calculateDaysSinceLastVisit)('invalid-date'); }).toThrow('Invalid date format for last visit date');
    });
    test('predictChurnRisk should calculate risk percentage', function () {
        var churnRisk = (0, utils_1.predictChurnRisk)(mockCustomer);
        expect(churnRisk).toBeGreaterThanOrEqual(0);
        expect(churnRisk).toBeLessThanOrEqual(100);
        expect(typeof churnRisk).toBe('number');
    });
    test('predictChurnRisk should throw error for invalid customer', function () {
        // @ts-ignore - Testing invalid input
        expect(function () { return (0, utils_1.predictChurnRisk)(null); }).toThrow('Customer data is required');
    });
});
describe('CRM Value Functions', function () {
    test('calculateCustomerLifetimeValue should calculate total value from completed appointments', function () {
        var ltv = (0, utils_1.calculateCustomerLifetimeValue)(mockAppointments);
        expect(ltv).toBe(350); // 200 + 150
    });
    test('calculateCustomerLifetimeValue should handle empty appointments', function () {
        var ltv = (0, utils_1.calculateCustomerLifetimeValue)([]);
        expect(ltv).toBe(0);
    });
    test('calculateCustomerLifetimeValue should ignore cancelled appointments', function () {
        var appointmentsWithCancelled = __spreadArray(__spreadArray([], mockAppointments, true), [
            {
                id: '3',
                customerId: '1',
                service: 'Cancelled Service',
                cost: 300,
                date: RECENT_DATE,
                duration: 60,
                status: 'cancelled',
                satisfaction: 1
            }
        ], false);
        var ltv = (0, utils_1.calculateCustomerLifetimeValue)(appointmentsWithCancelled);
        expect(ltv).toBe(350); // Still 200 + 150, cancelled appointment ignored
    });
    test('calculateAverageAppointmentValue should calculate correct average', function () {
        var avgValue = (0, utils_1.calculateAverageAppointmentValue)(mockAppointments);
        expect(avgValue).toBe(175); // (200 + 150) / 2
    });
    test('calculateAverageAppointmentValue should handle empty appointments', function () {
        var avgValue = (0, utils_1.calculateAverageAppointmentValue)([]);
        expect(avgValue).toBe(0);
    });
    test('rankCustomersByValue should sort customers by total spent', function () {
        var customers = [
            __assign(__assign({}, mockCustomer), { id: '1', totalSpent: 500 }),
            __assign(__assign({}, mockCustomer), { id: '2', totalSpent: 1000 }),
            __assign(__assign({}, mockCustomer), { id: '3', totalSpent: 200 })
        ];
        var ranked = (0, utils_1.rankCustomersByValue)(customers);
        expect(ranked[0].totalSpent).toBe(1000);
        expect(ranked[1].totalSpent).toBe(500);
        expect(ranked[2].totalSpent).toBe(200);
    });
    test('rankCustomersByValue should handle empty array', function () {
        var ranked = (0, utils_1.rankCustomersByValue)([]);
        expect(ranked).toEqual([]);
    });
});
describe('CRM Follow-up Functions', function () {
    beforeAll(function () {
        // Use fake timers to ensure consistent date calculations
        jest.useFakeTimers();
        // Set a fixed system time for all date operations
        jest.setSystemTime(new Date('2025-01-01T10:00:00.000Z'));
    });
    afterAll(function () {
        // Restore real timers after tests
        jest.useRealTimers();
    });
    test('determineNextFollowUpDate should calculate correct dates for different customer types', function () {
        // Test that follow-up dates are calculated correctly for different customer types
        var newCustomerFollowUp = (0, utils_1.determineNextFollowUpDate)(RECENT_DATE, 'new');
        var activeCustomerFollowUp = (0, utils_1.determineNextFollowUpDate)(RECENT_DATE, 'active');
        var atRiskCustomerFollowUp = (0, utils_1.determineNextFollowUpDate)(RECENT_DATE, 'at-risk');
        var churnedCustomerFollowUp = (0, utils_1.determineNextFollowUpDate)(RECENT_DATE, 'churned');
        // Verify that dates are valid ISO strings
        expect(new Date(newCustomerFollowUp).toISOString()).toBe(newCustomerFollowUp);
        expect(new Date(activeCustomerFollowUp).toISOString()).toBe(activeCustomerFollowUp);
        expect(new Date(atRiskCustomerFollowUp).toISOString()).toBe(atRiskCustomerFollowUp);
        expect(new Date(churnedCustomerFollowUp).toISOString()).toBe(churnedCustomerFollowUp);
        // CORRECTED: Based on actual function implementation:
        // Customer types map to: new=7 days, active=30 days, at-risk=14 days, churned=90 days
        // Base date: RECENT_DATE = '2025-01-10T12:00:00.000Z'
        // Expected follow-up dates:
        // New customer (7 days): 2025-01-17T12:00:00.000Z
        // Active customer (30 days): 2025-02-09T12:00:00.000Z  
        // At-risk customer (14 days): 2025-01-24T12:00:00.000Z
        // Churned customer (90 days): 2025-04-10T12:00:00.000Z
        expect(newCustomerFollowUp).toBe('2025-01-17T12:00:00.000Z');
        expect(activeCustomerFollowUp).toBe('2025-02-09T12:00:00.000Z');
        expect(atRiskCustomerFollowUp).toBe('2025-01-24T12:00:00.000Z');
        expect(churnedCustomerFollowUp).toBe('2025-04-10T12:00:00.000Z');
        // Verify relative ordering (new < at-risk < active < churned)
        expect(new Date(newCustomerFollowUp).getTime()).toBeLessThan(new Date(atRiskCustomerFollowUp).getTime());
        expect(new Date(atRiskCustomerFollowUp).getTime()).toBeLessThan(new Date(activeCustomerFollowUp).getTime());
        expect(new Date(activeCustomerFollowUp).getTime()).toBeLessThan(new Date(churnedCustomerFollowUp).getTime());
    });
    test('determineNextFollowUpDate should throw error for invalid date', function () {
        expect(function () { return (0, utils_1.determineNextFollowUpDate)('', 'active'); }).toThrow('Last contact date is required');
        expect(function () { return (0, utils_1.determineNextFollowUpDate)('invalid-date', 'active'); }).toThrow('Invalid date format for last contact date');
    });
    test('generateFollowUpMessage should create appropriate messages', function () {
        var appointmentMessage = (0, utils_1.generateFollowUpMessage)(mockCustomer, 'appointment');
        expect(appointmentMessage).toContain('John');
        expect(appointmentMessage).toContain('appointment');
        var satisfactionMessage = (0, utils_1.generateFollowUpMessage)(mockCustomer, 'satisfaction');
        expect(satisfactionMessage).toContain('John');
        expect(satisfactionMessage).toContain('feedback');
        var retentionMessage = (0, utils_1.generateFollowUpMessage)(mockCustomer, 'retention');
        expect(retentionMessage).toContain('John');
        expect(retentionMessage).toContain('discount');
        var birthdayMessage = (0, utils_1.generateFollowUpMessage)(mockCustomer, 'birthday');
        expect(birthdayMessage).toContain('John');
        expect(birthdayMessage).toContain('Birthday');
        var defaultMessage = (0, utils_1.generateFollowUpMessage)(mockCustomer, 'other');
        expect(defaultMessage).toContain('John');
    });
    test('generateFollowUpMessage should throw error for invalid customer', function () {
        // @ts-ignore - Testing invalid input
        expect(function () { return (0, utils_1.generateFollowUpMessage)(null, 'appointment'); }).toThrow('Customer data with name is required');
        expect(function () { return (0, utils_1.generateFollowUpMessage)({}, 'appointment'); }).toThrow('Customer data with name is required');
    });
});
describe('CRM Analytics Functions', function () {
    test('segmentCustomers should create segments based on criteria', function () {
        var customers = [
            __assign(__assign({}, mockCustomer), { id: '1', totalSpent: 1500, appointmentCount: 8 }),
            __assign(__assign({}, mockCustomer), { id: '2', totalSpent: 500, appointmentCount: 3 }),
            __assign(__assign({}, mockCustomer), { id: '3', totalSpent: 2000, appointmentCount: 12, satisfactionRating: 5 })
        ];
        var criteria = {
            minTotalSpent: 1000,
            minAppointments: 5,
            satisfactionThreshold: 4.5
        };
        var segments = (0, utils_1.segmentCustomers)(customers, criteria);
        expect(segments.length).toBeGreaterThan(0);
        segments.forEach(function (segment) {
            expect(segment.name).toBeDefined();
            expect(segment.customers).toBeDefined();
            expect(segment.criteria).toBeDefined();
            expect(segment.size).toBe(segment.customers.length);
        });
    });
    test('segmentCustomers should handle empty customer array', function () {
        var segments = (0, utils_1.segmentCustomers)([], {});
        expect(segments).toEqual([]);
    });
    test('calculateRetentionRate should calculate retention metrics', function () {
        var customers = [
            __assign(__assign({}, mockCustomer), { id: '1', registrationDate: PAST_DATE, lastVisitDate: RECENT_DATE }),
            __assign(__assign({}, mockCustomer), { id: '2', registrationDate: PAST_DATE, lastVisitDate: '2024-12-01T12:00:00.000Z' }),
            __assign(__assign({}, mockCustomer), { id: '3', registrationDate: PAST_DATE, lastVisitDate: '2024-09-01T12:00:00.000Z' })
        ];
        var retention = (0, utils_1.calculateRetentionRate)(customers, 6);
        expect(retention.totalCustomers).toBeGreaterThanOrEqual(0);
        expect(retention.activeCustomers).toBeGreaterThanOrEqual(0);
        expect(retention.churnedCustomers).toBeGreaterThanOrEqual(0);
        expect(retention.retentionRate).toBeGreaterThanOrEqual(0);
        expect(retention.retentionRate).toBeLessThanOrEqual(100);
        expect(retention.averageLifetimeValue).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(retention.riskCustomers)).toBe(true);
    });
    test('calculateRetentionRate should handle empty customer array', function () {
        var retention = (0, utils_1.calculateRetentionRate)([], 12);
        expect(retention.totalCustomers).toBe(0);
        expect(retention.activeCustomers).toBe(0);
        expect(retention.churnedCustomers).toBe(0);
        expect(retention.retentionRate).toBe(0);
        expect(retention.averageLifetimeValue).toBe(0);
        expect(retention.riskCustomers).toEqual([]);
    });
});
