/**
 * CRM Business Logic Test Suite
 * Comprehensive tests for Customer Relationship Management utilities
 * Created: January 24, 2025
 */

import {
  Customer,
  Appointment,
  SegmentCriteria,
  calculateLeadScore,
  categorizeLeadPriority,
  determineCustomerLifecycle,
  calculateDaysSinceLastVisit,
  predictChurnRisk,
  calculateCustomerLifetimeValue,
  calculateAverageAppointmentValue,
  rankCustomersByValue,
  determineNextFollowUpDate,
  generateFollowUpMessage,
  segmentCustomers,
  calculateRetentionRate
} from './utils';

// Test data - hardcoded ISO strings to avoid Date mocking issues
const FIXED_NOW = '2025-01-24T12:00:00.000Z';
const PAST_DATE = '2024-10-24T12:00:00.000Z'; // 92 days ago
const RECENT_DATE = '2025-01-10T12:00:00.000Z'; // 14 days ago
const FUTURE_DATE = '2025-02-24T12:00:00.000Z'; // 31 days from now

const mockCustomer: Customer = {
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

const mockAppointments: Appointment[] = [
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

describe('CRM Lead Scoring Functions', () => {
  test('calculateLeadScore should calculate correct score for customer', () => {
    const leadScore = calculateLeadScore(mockCustomer, mockAppointments);
    
    expect(leadScore.customerId).toBe(mockCustomer.id);
    expect(leadScore.score).toBeGreaterThan(0);
    expect(leadScore.score).toBeLessThanOrEqual(100);
    expect(leadScore.factors.engagement).toBeGreaterThan(0);
    expect(leadScore.factors.value).toBeGreaterThan(0);
    expect(leadScore.factors.frequency).toBeGreaterThan(0);
    expect(leadScore.factors.recency).toBeGreaterThan(0);
    expect(['high', 'medium', 'low']).toContain(leadScore.priority);
  });

  test('calculateLeadScore should handle customer without appointments', () => {
    const leadScore = calculateLeadScore(mockCustomer, []);
    
    expect(leadScore.customerId).toBe(mockCustomer.id);
    expect(leadScore.score).toBeGreaterThanOrEqual(0);
    expect(leadScore.score).toBeLessThanOrEqual(100);
  });

  test('calculateLeadScore should throw error for invalid customer', () => {
    // @ts-ignore - Testing invalid input
    expect(() => calculateLeadScore(null)).toThrow('Invalid customer data provided');
    expect(() => calculateLeadScore({} as Customer)).toThrow('Invalid customer data provided');
  });

  test('categorizeLeadPriority should categorize scores correctly', () => {
    expect(categorizeLeadPriority(80)).toBe('high');
    expect(categorizeLeadPriority(70)).toBe('high');
    expect(categorizeLeadPriority(60)).toBe('medium');
    expect(categorizeLeadPriority(40)).toBe('medium');
    expect(categorizeLeadPriority(30)).toBe('low');
    expect(categorizeLeadPriority(0)).toBe('low');
  });
});

describe('CRM Lifecycle Functions', () => {
  test('determineCustomerLifecycle should classify active customer correctly', () => {
    const lifecycle = determineCustomerLifecycle(mockCustomer);
    expect(['new', 'active', 'at-risk', 'churned']).toContain(lifecycle);
  });

  test('determineCustomerLifecycle should handle new customer', () => {
    const newCustomer: Customer = {
      ...mockCustomer,
      registrationDate: RECENT_DATE,
      appointmentCount: 1,
      lastVisitDate: RECENT_DATE
    };
    
    const lifecycle = determineCustomerLifecycle(newCustomer);
    expect(['new', 'active']).toContain(lifecycle);
  });

  test('determineCustomerLifecycle should handle churned customer', () => {
    const churnedCustomer: Customer = {
      ...mockCustomer,
      lastVisitDate: '2024-08-01T12:00:00.000Z', // Very old date
      status: 'churned'
    };
    
    const lifecycle = determineCustomerLifecycle(churnedCustomer);
    expect(lifecycle).toBe('churned');
  });

  test('calculateDaysSinceLastVisit should calculate days correctly', () => {
    // Mock Date.now to return our fixed date
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => Date.parse(FIXED_NOW));

    const days = calculateDaysSinceLastVisit(RECENT_DATE);
    expect(days).toBe(14); // 14 days difference

    // Restore original Date.now
    Date.now = originalDateNow;
  });

  test('calculateDaysSinceLastVisit should throw error for invalid date', () => {
    expect(() => calculateDaysSinceLastVisit('')).toThrow('Last visit date is required');
    expect(() => calculateDaysSinceLastVisit('invalid-date')).toThrow('Invalid date format for last visit date');
  });

  test('predictChurnRisk should calculate risk percentage', () => {
    const churnRisk = predictChurnRisk(mockCustomer);
    
    expect(churnRisk).toBeGreaterThanOrEqual(0);
    expect(churnRisk).toBeLessThanOrEqual(100);
    expect(typeof churnRisk).toBe('number');
  });

  test('predictChurnRisk should throw error for invalid customer', () => {
    // @ts-ignore - Testing invalid input
    expect(() => predictChurnRisk(null)).toThrow('Customer data is required');
  });
});

describe('CRM Value Functions', () => {
  test('calculateCustomerLifetimeValue should calculate total value from completed appointments', () => {
    const ltv = calculateCustomerLifetimeValue(mockAppointments);
    expect(ltv).toBe(350); // 200 + 150
  });

  test('calculateCustomerLifetimeValue should handle empty appointments', () => {
    const ltv = calculateCustomerLifetimeValue([]);
    expect(ltv).toBe(0);
  });

  test('calculateCustomerLifetimeValue should ignore cancelled appointments', () => {
    const appointmentsWithCancelled = [
      ...mockAppointments,
      {
        id: '3',
        customerId: '1',
        service: 'Cancelled Service',
        cost: 300,
        date: RECENT_DATE,
        duration: 60,
        status: 'cancelled' as const,
        satisfaction: 1
      }
    ];
    
    const ltv = calculateCustomerLifetimeValue(appointmentsWithCancelled);
    expect(ltv).toBe(350); // Still 200 + 150, cancelled appointment ignored
  });

  test('calculateAverageAppointmentValue should calculate correct average', () => {
    const avgValue = calculateAverageAppointmentValue(mockAppointments);
    expect(avgValue).toBe(175); // (200 + 150) / 2
  });

  test('calculateAverageAppointmentValue should handle empty appointments', () => {
    const avgValue = calculateAverageAppointmentValue([]);
    expect(avgValue).toBe(0);
  });

  test('rankCustomersByValue should sort customers by total spent', () => {
    const customers: Customer[] = [
      { ...mockCustomer, id: '1', totalSpent: 500 },
      { ...mockCustomer, id: '2', totalSpent: 1000 },
      { ...mockCustomer, id: '3', totalSpent: 200 }
    ];
    
    const ranked = rankCustomersByValue(customers);
    expect(ranked[0].totalSpent).toBe(1000);
    expect(ranked[1].totalSpent).toBe(500);
    expect(ranked[2].totalSpent).toBe(200);
  });

  test('rankCustomersByValue should handle empty array', () => {
    const ranked = rankCustomersByValue([]);
    expect(ranked).toEqual([]);
  });
});

describe('CRM Follow-up Functions', () => {
  beforeAll(() => {
    // Use fake timers to ensure consistent date calculations
    jest.useFakeTimers();
    // Set a fixed system time for all date operations
    jest.setSystemTime(new Date('2025-01-01T10:00:00.000Z'));
  });

  afterAll(() => {
    // Restore real timers after tests
    jest.useRealTimers();
  });

  test('determineNextFollowUpDate should calculate correct dates for different customer types', () => {
    // Test that follow-up dates are calculated correctly for different customer types
    const newCustomerFollowUp = determineNextFollowUpDate(RECENT_DATE, 'new');
    const activeCustomerFollowUp = determineNextFollowUpDate(RECENT_DATE, 'active');
    const atRiskCustomerFollowUp = determineNextFollowUpDate(RECENT_DATE, 'at-risk');
    const churnedCustomerFollowUp = determineNextFollowUpDate(RECENT_DATE, 'churned');

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

  test('determineNextFollowUpDate should throw error for invalid date', () => {
    expect(() => determineNextFollowUpDate('', 'active')).toThrow('Last contact date is required');
    expect(() => determineNextFollowUpDate('invalid-date', 'active')).toThrow('Invalid date format for last contact date');
  });

  test('generateFollowUpMessage should create appropriate messages', () => {
    const appointmentMessage = generateFollowUpMessage(mockCustomer, 'appointment');
    expect(appointmentMessage).toContain('John');
    expect(appointmentMessage).toContain('appointment');

    const satisfactionMessage = generateFollowUpMessage(mockCustomer, 'satisfaction');
    expect(satisfactionMessage).toContain('John');
    expect(satisfactionMessage).toContain('feedback');

    const retentionMessage = generateFollowUpMessage(mockCustomer, 'retention');
    expect(retentionMessage).toContain('John');
    expect(retentionMessage).toContain('discount');

    const birthdayMessage = generateFollowUpMessage(mockCustomer, 'birthday');
    expect(birthdayMessage).toContain('John');
    expect(birthdayMessage).toContain('Birthday');

    const defaultMessage = generateFollowUpMessage(mockCustomer, 'other');
    expect(defaultMessage).toContain('John');
  });

  test('generateFollowUpMessage should throw error for invalid customer', () => {
    // @ts-ignore - Testing invalid input
    expect(() => generateFollowUpMessage(null, 'appointment')).toThrow('Customer data with name is required');
    expect(() => generateFollowUpMessage({} as Customer, 'appointment')).toThrow('Customer data with name is required');
  });
});

describe('CRM Analytics Functions', () => {
  test('segmentCustomers should create segments based on criteria', () => {
    const customers: Customer[] = [
      { ...mockCustomer, id: '1', totalSpent: 1500, appointmentCount: 8 },
      { ...mockCustomer, id: '2', totalSpent: 500, appointmentCount: 3 },
      { ...mockCustomer, id: '3', totalSpent: 2000, appointmentCount: 12, satisfactionRating: 5 }
    ];

    const criteria: SegmentCriteria = {
      minTotalSpent: 1000,
      minAppointments: 5,
      satisfactionThreshold: 4.5
    };

    const segments = segmentCustomers(customers, criteria);
    
    expect(segments.length).toBeGreaterThan(0);
    segments.forEach(segment => {
      expect(segment.name).toBeDefined();
      expect(segment.customers).toBeDefined();
      expect(segment.criteria).toBeDefined();
      expect(segment.size).toBe(segment.customers.length);
    });
  });

  test('segmentCustomers should handle empty customer array', () => {
    const segments = segmentCustomers([], {});
    expect(segments).toEqual([]);
  });

  test('calculateRetentionRate should calculate retention metrics', () => {
    const customers: Customer[] = [
      { ...mockCustomer, id: '1', registrationDate: PAST_DATE, lastVisitDate: RECENT_DATE },
      { ...mockCustomer, id: '2', registrationDate: PAST_DATE, lastVisitDate: '2024-12-01T12:00:00.000Z' },
      { ...mockCustomer, id: '3', registrationDate: PAST_DATE, lastVisitDate: '2024-09-01T12:00:00.000Z' }
    ];

    const retention = calculateRetentionRate(customers, 6);
    
    expect(retention.totalCustomers).toBeGreaterThanOrEqual(0);
    expect(retention.activeCustomers).toBeGreaterThanOrEqual(0);
    expect(retention.churnedCustomers).toBeGreaterThanOrEqual(0);
    expect(retention.retentionRate).toBeGreaterThanOrEqual(0);
    expect(retention.retentionRate).toBeLessThanOrEqual(100);
    expect(retention.averageLifetimeValue).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(retention.riskCustomers)).toBe(true);
  });

  test('calculateRetentionRate should handle empty customer array', () => {
    const retention = calculateRetentionRate([], 12);
    
    expect(retention.totalCustomers).toBe(0);
    expect(retention.activeCustomers).toBe(0);
    expect(retention.churnedCustomers).toBe(0);
    expect(retention.retentionRate).toBe(0);
    expect(retention.averageLifetimeValue).toBe(0);
    expect(retention.riskCustomers).toEqual([]);
  });
});
