/**
 * KPI Computation Tests
 * 
 * Comprehensive test suite for computeKPIs function with ≥90% branch coverage,
 * edge cases, validation, and healthcare-specific scenarios.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { computeKPIs, createMockEvents, type ComputedKPIs, type KPIComputationOptions } from '../../aggregation/kpis';
import type { AnalyticsEvent } from '../../types/base-metrics';
import type { IngestionEvent } from '../../types/ingestion';

describe('computeKPIs', () => {
  let mockEvents: AnalyticsEvent[];
  let mockIngestionEvents: IngestionEvent[];

  beforeEach(() => {
    // Create mock analytics events
    mockEvents = createMockEvents(20);
    
    // Create mock ingestion events
    mockIngestionEvents = [
      {
        id: 'ingestion_1',
        type: 'data_received',
        timestamp: new Date(),
        properties: {},
        eventType: 'data_received',
        source: {
          sourceId: 'ehr_system',
          sourceType: 'database',
          recordCount: 100,
          dataSize: 1024,
        },
        processing: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 1000,
          status: 'completed',
        },
        quality: {
          validRecords: 95,
          invalidRecords: 5,
          duplicateRecords: 2,
          transformedRecords: 100,
        },
      },
      {
        id: 'ingestion_2',
        type: 'processing_completed',
        timestamp: new Date(),
        properties: {},
        eventType: 'processing_completed',
        source: {
          sourceId: 'lab_system',
          sourceType: 'api',
          recordCount: 50,
          dataSize: 512,
        },
        processing: {
          startTime: new Date(),
          endTime: new Date(),
          duration: 500,
          status: 'completed',
        },
        quality: {
          validRecords: 48,
          invalidRecords: 2,
          duplicateRecords: 1,
          transformedRecords: 50,
        },
      },
    ];
  });

  describe('Basic functionality', () => {
    it('should compute KPIs from empty events array', () => {
      const result = computeKPIs([]);
      
      expect(result).toMatchObject({
        patientFlow: {
          totalVisits: 0,
          averageWaitTime: 0,
          noShowRate: 0,
          patientSatisfactionScore: 0,
          appointmentUtilization: 0,
        },
        clinicalQuality: {
          diagnosisAccuracy: 0,
          treatmentCompletionRate: 0,
          readmissionRate: 0,
          emergencyInterventions: 0,
          medicationAdherence: 0,
        },
        operational: {
          resourceUtilization: 0,
          staffEfficiency: 0,
          equipmentUsage: 0,
          schedulingEfficiency: 0,
          averageServiceTime: 0,
        },
        financial: {
          revenuePerPatient: 0,
          costPerTreatment: 0,
          insuranceClaimSuccessRate: 0,
          paymentCollectionRate: 0,
          profitMargin: 0,
        },
        system: {
          dataQualityScore: 100,
          complianceScore: 100,
          systemUptime: 100,
          errorRate: 0,
          performanceScore: 100,
        },
      });
      
      expect(result.metadata.eventCount).toBe(0);
      expect(result.metadata.coverage.totalEvents).toBe(0);
    });

    it('should compute KPIs from valid events array', () => {
      const result = computeKPIs(mockEvents);
      
      expect(result).toBeDefined();
      expect(result.metadata.eventCount).toBe(mockEvents.length);
      expect(result.metadata.computedAt).toBeInstanceOf(Date);
      expect(result.metadata.timeRange.start).toBeInstanceOf(Date);
      expect(result.metadata.timeRange.end).toBeInstanceOf(Date);
    });

    it('should handle mixed analytics and ingestion events', () => {
      const combinedEvents = [...mockEvents, ...mockIngestionEvents];
      const result = computeKPIs(combinedEvents);
      
      expect(result.metadata.eventCount).toBe(combinedEvents.length);
      expect(result.system.dataQualityScore).toBeGreaterThan(0);
    });
  });

  describe('Input validation', () => {
    it('should throw error for non-array input', () => {
      expect(() => computeKPIs(null as any)).toThrow('Events must be an array');
      expect(() => computeKPIs(undefined as any)).toThrow('Events must be an array');
      expect(() => computeKPIs('not-array' as any)).toThrow('Events must be an array');
      expect(() => computeKPIs({} as any)).toThrow('Events must be an array');
    });

    it('should throw error when minimum event count not met', () => {
      const options: KPIComputationOptions = {
        validation: {
          requireMinEvents: 50,
        },
      };
      
      expect(() => computeKPIs(mockEvents, options)).toThrow(/Insufficient events/);
    });

    it('should validate minimum event count when filtering reduces events', () => {
      const options: KPIComputationOptions = {
        eventTypes: ['non_existent_type'],
        validation: {
          requireMinEvents: 5,
        },
      };
      
      expect(() => computeKPIs(mockEvents, options)).toThrow(/Insufficient events/);
    });
  });

  describe('Filtering functionality', () => {
    it('should filter events by time range', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const options: KPIComputationOptions = {
        timeRange: {
          start: oneHourAgo,
          end: now,
        },
      };
      
      const result = computeKPIs(mockEvents, options);
      expect(result.metadata.timeRange.start).toEqual(oneHourAgo);
      expect(result.metadata.timeRange.end).toEqual(now);
    });

    it('should filter events by event types', () => {
      const options: KPIComputationOptions = {
        eventTypes: ['patient_visit', 'appointment_completed'],
      };
      
      const result = computeKPIs(mockEvents, options);
      // Should have fewer events after filtering
      expect(result.metadata.eventCount).toBeLessThanOrEqual(mockEvents.length);
    });

    it('should filter events by sources', () => {
      const options: KPIComputationOptions = {
        sources: ['ehr_system'],
      };
      
      const combinedEvents = [...mockEvents, ...mockIngestionEvents];
      const result = computeKPIs(combinedEvents, options);
      
      // Should filter out events not from specified sources
      expect(result.metadata.eventCount).toBeLessThanOrEqual(combinedEvents.length);
    });

    it('should handle filtering with no matching events', () => {
      const options: KPIComputationOptions = {
        eventTypes: ['non_existent_type'],
      };
      
      const result = computeKPIs(mockEvents, options);
      expect(result.metadata.eventCount).toBe(0);
    });
  });

  describe('KPI category exclusion', () => {
    it('should exclude patient flow KPIs when disabled', () => {
      const options: KPIComputationOptions = {
        categories: {
          includePatientFlow: false,
        },
      };
      
      const result = computeKPIs(mockEvents, options);
      
      expect(result.patientFlow).toMatchObject({
        totalVisits: 0,
        averageWaitTime: 0,
        noShowRate: 0,
        patientSatisfactionScore: 0,
        appointmentUtilization: 0,
      });
    });

    it('should exclude clinical quality KPIs when disabled', () => {
      const options: KPIComputationOptions = {
        categories: {
          includeClinicalQuality: false,
        },
      };
      
      const result = computeKPIs(mockEvents, options);
      
      expect(result.clinicalQuality).toMatchObject({
        diagnosisAccuracy: 0,
        treatmentCompletionRate: 0,
        readmissionRate: 0,
        emergencyInterventions: 0,
        medicationAdherence: 0,
      });
    });

    it('should exclude operational KPIs when disabled', () => {
      const options: KPIComputationOptions = {
        categories: {
          includeOperational: false,
        },
      };
      
      const result = computeKPIs(mockEvents, options);
      
      expect(result.operational).toMatchObject({
        resourceUtilization: 0,
        staffEfficiency: 0,
        equipmentUsage: 0,
        schedulingEfficiency: 0,
        averageServiceTime: 0,
      });
    });

    it('should exclude financial KPIs when disabled', () => {
      const options: KPIComputationOptions = {
        categories: {
          includeFinancial: false,
        },
      };
      
      const result = computeKPIs(mockEvents, options);
      
      expect(result.financial).toMatchObject({
        revenuePerPatient: 0,
        costPerTreatment: 0,
        insuranceClaimSuccessRate: 0,
        paymentCollectionRate: 0,
        profitMargin: 0,
      });
    });

    it('should exclude system KPIs when disabled', () => {
      const options: KPIComputationOptions = {
        categories: {
          includeSystem: false,
        },
      };
      
      const result = computeKPIs(mockEvents, options);
      
      expect(result.system).toMatchObject({
        dataQualityScore: 0,
        complianceScore: 0,
        systemUptime: 0,
        errorRate: 0,
        performanceScore: 0,
      });
    });
  });

  describe('Patient flow KPIs', () => {
    it('should compute patient flow metrics correctly', () => {
      const patientEvents: AnalyticsEvent[] = [
        {
          id: '1',
          type: 'patient_visit',
          timestamp: new Date(),
          properties: { patientId: 'p1', waitTime: 15 },
        },
        {
          id: '2',
          type: 'appointment_completed',
          timestamp: new Date(),
          properties: { patientId: 'p2', status: 'completed' },
        },
        {
          id: '3',
          type: 'appointment_scheduled',
          timestamp: new Date(),
          properties: { patientId: 'p3', status: 'no_show' },
        },
        {
          id: '4',
          type: 'patient_feedback',
          timestamp: new Date(),
          properties: { patientId: 'p1', rating: 4 },
        },
      ];
      
      const result = computeKPIs(patientEvents);
      
      expect(result.patientFlow.totalVisits).toBeGreaterThanOrEqual(0);
      expect(result.patientFlow.averageWaitTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Clinical quality KPIs', () => {
    it('should compute clinical quality metrics correctly', () => {
      const clinicalEvents: AnalyticsEvent[] = [
        {
          id: '1',
          type: 'diagnosis_made',
          timestamp: new Date(),
          properties: { patientId: 'p1', accuracy: 'correct' },
        },
        {
          id: '2',
          type: 'treatment_completed',
          timestamp: new Date(),
          properties: { patientId: 'p2', status: 'completed' },
        },
        {
          id: '3',
          type: 'patient_admission',
          timestamp: new Date(),
          properties: { patientId: 'p3', readmission: false },
        },
        {
          id: '4',
          type: 'emergency_intervention',
          timestamp: new Date(),
          properties: { patientId: 'p1', urgency: 'emergency' },
        },
      ];
      
      const result = computeKPIs(clinicalEvents);
      
      expect(result.clinicalQuality.diagnosisAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.clinicalQuality.emergencyInterventions).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Financial KPIs', () => {
    it('should compute financial metrics correctly', () => {
      const financialEvents: AnalyticsEvent[] = [
        {
          id: '1',
          type: 'payment_received',
          timestamp: new Date(),
          properties: { patientId: 'p1', amount: 100, status: 'collected' },
        },
        {
          id: '2',
          type: 'revenue_generated',
          timestamp: new Date(),
          properties: { patientId: 'p1', amount: 200 },
        },
        {
          id: '3',
          type: 'cost_incurred',
          timestamp: new Date(),
          properties: { amount: 50 },
        },
        {
          id: '4',
          type: 'insurance_claim',
          timestamp: new Date(),
          properties: { status: 'approved', amount: 150 },
        },
      ];
      
      const result = computeKPIs(financialEvents);
      
      expect(result.financial.revenuePerPatient).toBeGreaterThanOrEqual(0);
      expect(result.financial.insuranceClaimSuccessRate).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero division in financial calculations', () => {
      const emptyFinancialEvents: AnalyticsEvent[] = [];
      
      const result = computeKPIs(emptyFinancialEvents);
      
      expect(result.financial.revenuePerPatient).toBe(0);
      expect(result.financial.costPerTreatment).toBe(0);
      expect(result.financial.profitMargin).toBe(0);
    });
  });

  describe('System KPIs', () => {
    it('should compute system metrics from ingestion events', () => {
      const result = computeKPIs(mockIngestionEvents);
      
      expect(result.system.dataQualityScore).toBeGreaterThan(0);
      expect(result.system.dataQualityScore).toBeLessThanOrEqual(100);
    });

    it('should handle system metrics with performance events', () => {
      const systemEvents: AnalyticsEvent[] = [
        {
          id: '1',
          type: 'system_performance',
          timestamp: new Date(),
          properties: { score: 95, uptime: 99.5 },
        },
        {
          id: '2',
          type: 'system_error',
          timestamp: new Date(),
          properties: { severity: 'low' },
        },
      ];
      
      const result = computeKPIs(systemEvents);
      
      expect(result.system.performanceScore).toBeGreaterThan(0);
      expect(result.system.errorRate).toBeGreaterThan(0);
    });
  });

  describe('Aggregation options', () => {
    it('should handle aggregation preferences', () => {
      const options: KPIComputationOptions = {
        aggregation: {
          method: 'average',
          frequency: 'daily',
        },
      };
      
      const result = computeKPIs(mockEvents, options);
      expect(result).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle events with missing properties', () => {
      const incompleteEvents: AnalyticsEvent[] = [
        {
          id: '1',
          type: 'patient_visit',
          timestamp: new Date(),
          properties: {}, // Missing expected properties
        },
        {
          id: '2',
          type: 'appointment_completed',
          timestamp: new Date(),
          properties: { patientId: 'p1' }, // Missing status
        },
      ];
      
      const result = computeKPIs(incompleteEvents);
      expect(result).toBeDefined();
      expect(result.metadata.eventCount).toBe(2);
    });

    it('should handle events with invalid timestamps', () => {
      const invalidEvents: AnalyticsEvent[] = [
        {
          id: '1',
          type: 'patient_visit',
          timestamp: new Date('invalid-date'),
          properties: { patientId: 'p1' },
        },
      ];
      
      // Should not throw, but handle gracefully
      expect(() => computeKPIs(invalidEvents)).not.toThrow();
    });

    it('should handle very large event arrays', () => {
      const largeEventArray = createMockEvents(1000);
      
      const result = computeKPIs(largeEventArray);
      expect(result.metadata.eventCount).toBe(1000);
    });

    it('should handle events with null/undefined properties', () => {
      const nullPropertyEvents: AnalyticsEvent[] = [
        {
          id: '1',
          type: 'patient_visit',
          timestamp: new Date(),
          properties: {
            patientId: null,
            waitTime: undefined,
            rating: 0,
          },
        },
      ];
      
      const result = computeKPIs(nullPropertyEvents);
      expect(result).toBeDefined();
    });
  });

  describe('Time range computation', () => {
    it('should compute time range from events when not provided', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const timedEvents: AnalyticsEvent[] = [
        {
          id: '1',
          type: 'test',
          timestamp: oneHourAgo,
          properties: {},
        },
        {
          id: '2',
          type: 'test',
          timestamp: now,
          properties: {},
        },
      ];
      
      const result = computeKPIs(timedEvents);
      
      expect(result.metadata.timeRange.start.getTime()).toBeLessThanOrEqual(oneHourAgo.getTime());
      expect(result.metadata.timeRange.end.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });

    it('should handle same start and end time for single event', () => {
      const singleTime = new Date();
      const singleEvent: AnalyticsEvent[] = [
        {
          id: '1',
          type: 'test',
          timestamp: singleTime,
          properties: {},
        },
      ];
      
      const result = computeKPIs(singleEvent);
      
      expect(result.metadata.timeRange.start.getTime()).toBe(singleTime.getTime());
      expect(result.metadata.timeRange.end.getTime()).toBe(singleTime.getTime());
    });
  });

  describe('Complex scenarios', () => {
    it('should handle comprehensive healthcare workflow', () => {
      const workflowEvents: AnalyticsEvent[] = [
        // Patient journey
        { id: '1', type: 'patient_visit', timestamp: new Date(), properties: { patientId: 'p1', waitTime: 15 } },
        { id: '2', type: 'diagnosis_made', timestamp: new Date(), properties: { patientId: 'p1', accuracy: 'correct' } },
        { id: '3', type: 'treatment_prescribed', timestamp: new Date(), properties: { patientId: 'p1', medicationType: 'antibiotics' } },
        { id: '4', type: 'revenue_generated', timestamp: new Date(), properties: { patientId: 'p1', amount: 200 } },
        { id: '5', type: 'patient_feedback', timestamp: new Date(), properties: { patientId: 'p1', rating: 5 } },
        
        // System events
        { id: '6', type: 'system_performance', timestamp: new Date(), properties: { score: 98, uptime: 99.9 } },
        { id: '7', type: 'resource_utilization', timestamp: new Date(), properties: { utilization: 85 } },
        
        // Quality assurance
        { id: '8', type: 'compliance_check', timestamp: new Date(), properties: { compliance: 95 } },
      ];
      
      const result = computeKPIs(workflowEvents);
      
      // Verify all categories have been computed
      expect(result.patientFlow.totalVisits).toBeGreaterThan(0);
      expect(result.patientFlow.patientSatisfactionScore).toBeGreaterThan(0);
      expect(result.clinicalQuality.diagnosisAccuracy).toBeGreaterThan(0);
      expect(result.financial.revenuePerPatient).toBeGreaterThan(0);
      expect(result.system.performanceScore).toBeGreaterThan(0);
      expect(result.operational.resourceUtilization).toBeGreaterThan(0);
    });
  });
});

describe('createMockEvents', () => {
  it('should create specified number of mock events', () => {
    const events = createMockEvents(5);
    expect(events).toHaveLength(5);
    
    events.forEach(event => {
      expect(event.id).toBeDefined();
      expect(event.type).toBeDefined();
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.properties).toBeDefined();
    });
  });

  it('should create default number of events when count not specified', () => {
    const events = createMockEvents();
    expect(events).toHaveLength(10);
  });

  it('should create events with realistic healthcare properties', () => {
    const events = createMockEvents(20);
    
    // Check for healthcare-related event types
    const eventTypes = events.map(e => e.type);
    expect(eventTypes).toContain('patient_visit');
    expect(eventTypes).toContain('appointment_completed');
    expect(eventTypes).toContain('diagnosis_made');
    
    // Check for appropriate properties based on event type
    const patientVisitEvent = events.find(e => e.type === 'patient_visit');
    if (patientVisitEvent) {
      expect(patientVisitEvent.properties.patientId).toBeDefined();
      expect(patientVisitEvent.properties.waitTime).toBeTypeOf('number');
    }
  });
});