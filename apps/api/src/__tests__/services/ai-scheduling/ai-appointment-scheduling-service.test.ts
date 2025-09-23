/**
 * AI Appointment Scheduling Service Tests
 * 
 * Comprehensive test suite for AI-powered appointment scheduling with:
 * - No-show prediction algorithms
 * - Resource optimization
 * - Scheduling conflict detection
 * - Performance analytics
 * - ML model integration
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AIAppointmentSchedulingService } from "../../../services/ai-appointment-scheduling-service";
// import { prisma } from "../../../lib/prisma";
import { NoShowPredictionFeatures, SchedulingOptimization, AppointmentSchedulingContext } from "../../../services/ai-appointment-scheduling-service";

// Mock dependencies
vi.mock("../../../lib/prisma");
vi.mock("../../../services/enhanced-lgpd-lifecycle");

describe("AIAppointmentSchedulingService", () => {
  let schedulingService: AIAppointmentSchedulingService;
  let mockPrisma: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup mock Prisma client
    mockPrisma = {
      appointment: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
        groupBy: vi.fn(),
      },
      patient: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      professional: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      clinic: {
        findUnique: vi.fn(),
      },
      $queryRaw: vi.fn(),
    };

    // (prisma as any) = mockPrisma; // removed: cannot assign to imported binding
    
    // Create service instance
    schedulingService = new AIAppointmentSchedulingService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("No-show Prediction", () => {
    it("should calculate no-show probability with historical data", async () => {
      const features: NoShowPredictionFeatures = {
        patientId: "patient-123",
        professionalId: "prof-456", 
        clinicId: "clinic-789",
        appointmentType: "consultation",
        scheduledHour: 14,
        dayOfWeek: 1, // Monday
        daysInAdvance: 7,
        previousNoShowRate: 0.15,
        age: 35,
        gender: "F",
        distanceFromClinic: 5.2,
        socioeconomicIndicator: 0.7,
        seasonalFactor: 1.0,
        weatherImpact: 0.1,
        appointmentHistoryCount: 12,
        consecutiveCancellations: 1,
        paymentMethod: "private",
        insuranceType: "premium",
        reminderPreference: ["whatsapp", "email"],
        previousRemindersSent: 3,
        timeSinceLastAppointment: 45,
        appointmentTimePreference: "afternoon",
        transportationMethod: "car",
        employmentStatus: "employed",
        stressLevel: "moderate",
        healthCondition: "stable",
        treatmentComplexity: "low",
        hasFamilySupport: true,
        financialConstraint: false,
        technologyAccess: "high",
        languagePreference: "pt-BR",
        culturalBackground: "urban",
      };

      const mockHistoricalData = [
        {
          status: "completed",
          scheduledFor: new Date("2024-01-15T14:00:00Z"),
          noShowProbability: 0.1,
        },
        {
          status: "no_show",
          scheduledFor: new Date("2024-01-08T14:00:00Z"),
          noShowProbability: 0.8,
        },
      ];

      mockPrisma.appointment.findMany.mockResolvedValue(mockHistoricalData);
      
      const result = await schedulingService.predictNoShow(features);
      
      expect(result).toMatchObject({
        probability: expect.any(Number),
        confidence: expect.any(Number),
        riskFactors: expect.any(Array),
        recommendations: expect.any(Array),
        predictionTimestamp: expect.any(Date),
      });
      
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(1);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("should handle insufficient historical data gracefully", async () => {
      const features: NoShowPredictionFeatures = {
        patientId: "new-patient",
        professionalId: "prof-456",
        clinicId: "clinic-789",
        appointmentType: "consultation",
        scheduledHour: 10,
        dayOfWeek: 2,
        daysInAdvance: 3,
        previousNoShowRate: 0,
        age: 25,
        gender: "M",
        distanceFromClinic: 2.1,
        socioeconomicIndicator: 0.5,
        seasonalFactor: 1.0,
        weatherImpact: 0.05,
        appointmentHistoryCount: 0,
        consecutiveCancellations: 0,
        paymentMethod: "private",
        insuranceType: "basic",
        reminderPreference: ["email"],
        previousRemindersSent: 0,
        timeSinceLastAppointment: 0,
        appointmentTimePreference: "morning",
        transportationMethod: "public",
        employmentStatus: "student",
        stressLevel: "low",
        healthCondition: "good",
        treatmentComplexity: "low",
        hasFamilySupport: true,
        financialConstraint: true,
        technologyAccess: "medium",
        languagePreference: "pt-BR",
        culturalBackground: "urban",
      };

      mockPrisma.appointment.findMany.mockResolvedValue([]);
      
      const result = await schedulingService.predictNoShow(features);
      
      // Should use demographic and clinic-wide averages for new patients
      expect(result.probability).toBeGreaterThan(0);
      expect(result.riskFactors).toContain("insufficient_history");
      expect(result.recommendations).toContain("enhanced_monitoring");
    });

    it("should identify high-risk patients accurately", async () => {
      const highRiskFeatures: NoShowPredictionFeatures = {
        patientId: "high-risk-patient",
        professionalId: "prof-456",
        clinicId: "clinic-789",
        appointmentType: "follow_up",
        scheduledHour: 16, // Late afternoon
        dayOfWeek: 5, // Friday
        daysInAdvance: 1,
        previousNoShowRate: 0.8,
        age: 22,
        gender: "M",
        distanceFromClinic: 15.8,
        socioeconomicIndicator: 0.2,
        seasonalFactor: 1.2,
        weatherImpact: 0.3,
        appointmentHistoryCount: 5,
        consecutiveCancellations: 3,
        paymentMethod: "public",
        insuranceType: "basic",
        reminderPreference: ["sms"],
        previousRemindersSent: 1,
        timeSinceLastAppointment: 180,
        appointmentTimePreference: "evening",
        transportationMethod: "public",
        employmentStatus: "unemployed",
        stressLevel: "high",
        healthCondition: "chronic",
        treatmentComplexity: "high",
        hasFamilySupport: false,
        financialConstraint: true,
        technologyAccess: "low",
        languagePreference: "pt-BR",
        culturalBackground: "rural",
      };

      mockPrisma.appointment.findMany.mockResolvedValue([
        { status: "no_show", scheduledFor: new Date(), noShowProbability: 0.9 },
        { status: "cancelled", scheduledFor: new Date(), noShowProbability: 0.7 },
      ]);

      const result = await schedulingService.predictNoShow(highRiskFeatures);
      
      expect(result.probability).toBeGreaterThan(0.6);
      expect(result.riskLevel).toBe("high");
      expect(result.riskFactors).toEqual(
        expect.arrayContaining([
          "high_history_rate",
          "late_afternoon_slot",
          "friday_appointment",
          "short_notice_booking",
          "long_distance",
          "consecutive_cancellations",
        ])
      );
    });

    it("should incorporate seasonal and weather factors", async () => {
      const seasonalFeatures: NoShowPredictionFeatures = {
        patientId: "patient-123",
        professionalId: "prof-456",
        clinicId: "clinic-789",
        appointmentType: "consultation",
        scheduledHour: 14,
        dayOfWeek: 3,
        daysInAdvance: 5,
        previousNoShowRate: 0.2,
        age: 40,
        gender: "F",
        distanceFromClinic: 3.5,
        socioeconomicIndicator: 0.6,
        seasonalFactor: 1.5, // Holiday season
        weatherImpact: 0.8, // Severe weather expected
        appointmentHistoryCount: 8,
        consecutiveCancellations: 0,
        paymentMethod: "private",
        insuranceType: "premium",
        reminderPreference: ["whatsapp", "email"],
        previousRemindersSent: 2,
        timeSinceLastAppointment: 30,
        appointmentTimePreference: "afternoon",
        transportationMethod: "car",
        employmentStatus: "employed",
        stressLevel: "moderate",
        healthCondition: "stable",
        treatmentComplexity: "low",
        hasFamilySupport: true,
        financialConstraint: false,
        technologyAccess: "high",
        languagePreference: "pt-BR",
        culturalBackground: "urban",
      };

      mockPrisma.appointment.findMany.mockResolvedValue([
        { status: "completed", scheduledFor: new Date(), noShowProbability: 0.1 },
      ]);

      const result = await schedulingService.predictNoShow(seasonalFeatures);
      
      expect(result.seasonalAdjustment).toBeGreaterThan(0);
      expect(result.weatherAdjustment).toBeGreaterThan(0);
      expect(result.riskFactors).toContain("seasonal_factor_high");
      expect(result.riskFactors).toContain("severe_weather_expected");
    });
  });

  describe("Resource Optimization", () => {
    it("should optimize scheduling with resource constraints", async () => {
      const optimization: SchedulingOptimization = {
        clinicId: "clinic-789",
        date: "2024-12-15",
        availableProfessionals: ["prof-456", "prof-789"],
        availableRooms: ["room-1", "room-2"],
        serviceTypes: ["consultation", "procedure"],
        timeSlots: [
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "11:00", end: "12:00" },
          { start: "14:00", end: "15:00" },
        ],
        constraints: {
          maxAppointmentsPerProfessional: 8,
          minBreakBetweenAppointments: 15,
          roomSetupTime: 10,
          maxParallelProcedures: 2,
          requiredStaffPerProcedure: 2,
          lunchBreak: { start: "12:00", end: "13:00" },
        },
        objectives: {
          maximizeUtilization: true,
          minimizeWaitTime: true,
          balanceWorkload: true,
          prioritizeHighValue: true,
          accommodateEmergency: true,
        },
        existingAppointments: [
          {
            id: "existing-1",
            professionalId: "prof-456",
            roomId: "room-1",
            startTime: "09:00",
            endTime: "10:00",
            type: "consultation",
          },
        ],
      };

      const mockProfessionals = [
        {
          id: "prof-456",
          specialization: "dermatology",
          experience: 5,
          efficiency: 0.9,
          patientSatisfaction: 4.7,
          maxDailyAppointments: 12,
          preferredHours: { start: "09:00", end: "18:00" },
        },
        {
          id: "prof-789",
          specialization: "aesthetics",
          experience: 8,
          efficiency: 0.95,
          patientSatisfaction: 4.9,
          maxDailyAppointments: 10,
          preferredHours: { start: "10:00", end: "19:00" },
        },
      ];

      mockPrisma.professional.findMany.mockResolvedValue(mockProfessionals);

      const result = await schedulingService.optimizeScheduling(optimization);
      
      expect(result).toMatchObject({
        optimizedSchedule: expect.any(Array),
        utilizationMetrics: expect.any(Object),
        recommendations: expect.any(Array),
        conflictResolutions: expect.any(Array),
        optimizationScore: expect.any(Number),
      });

      // Verify optimization quality
      expect(result.optimizationScore).toBeGreaterThan(0.7);
      expect(result.utilizationMetrics.overallUtilization).toBeGreaterThan(0.6);
      expect(result.conflictResolutions).toHaveLength(0); // No conflicts in optimal schedule
    });

    it("should handle resource conflicts gracefully", async () => {
      const constrainedOptimization: SchedulingOptimization = {
        clinicId: "clinic-789",
        date: "2024-12-15",
        availableProfessionals: ["prof-456"], // Only one professional
        availableRooms: ["room-1"], // Only one room
        serviceTypes: ["consultation", "procedure"],
        timeSlots: [
          { start: "09:00", end: "10:00" },
          { start: "09:30", end: "10:30" }, // Overlapping slot
          { start: "10:00", end: "11:00" },
        ],
        constraints: {
          maxAppointmentsPerProfessional: 2,
          minBreakBetweenAppointments: 15,
          roomSetupTime: 5,
          maxParallelProcedures: 1,
          requiredStaffPerProcedure: 1,
          lunchBreak: { start: "12:00", end: "13:00" },
        },
        objectives: {
          maximizeUtilization: true,
          minimizeWaitTime: true,
          balanceWorkload: false,
          prioritizeHighValue: false,
          accommodateEmergency: false,
        },
        existingAppointments: [
          {
            id: "existing-1",
            professionalId: "prof-456",
            roomId: "room-1",
            startTime: "09:00",
            endTime: "10:00",
            type: "consultation",
          },
        ],
      };

      mockPrisma.professional.findMany.mockResolvedValue([
        {
          id: "prof-456",
          specialization: "general",
          experience: 3,
          efficiency: 0.8,
          patientSatisfaction: 4.2,
          maxDailyAppointments: 8,
          preferredHours: { start: "09:00", end: "17:00" },
        },
      ]);

      const result = await schedulingService.optimizeScheduling(constrainedOptimization);
      
      // Should detect and resolve conflicts
      expect(result.conflictResolutions.length).toBeGreaterThan(0);
      expect(result.conflictResolutions[0]).toMatchObject({
        type: expect.any(String),
        description: expect.any(String),
        resolution: expect.any(String),
        impact: expect.any(String),
      });

      // Should still provide viable schedule
      expect(result.optimizedSchedule.length).toBeGreaterThan(0);
      expect(result.optimizationScore).toBeGreaterThan(0.4);
    });

    it("should prioritize high-value appointments", async () => {
      const optimization: SchedulingOptimization = {
        clinicId: "clinic-789",
        date: "2024-12-15",
        availableProfessionals: ["prof-456", "prof-789"],
        availableRooms: ["room-1", "room-2"],
        serviceTypes: ["consultation", "procedure", "surgery"],
        timeSlots: [
          { start: "09:00", end: "10:00" },
          { start: "10:00", end: "11:00" },
          { start: "11:00", end: "12:00" },
        ],
        constraints: {
          maxAppointmentsPerProfessional: 3,
          minBreakBetweenAppointments: 15,
          roomSetupTime: 10,
          maxParallelProcedures: 1,
          requiredStaffPerProcedure: 2,
          lunchBreak: { start: "12:00", end: "13:00" },
        },
        objectives: {
          maximizeUtilization: true,
          minimizeWaitTime: true,
          balanceWorkload: true,
          prioritizeHighValue: true,
          accommodateEmergency: false,
        },
        existingAppointments: [],
        highValueAppointments: [
          {
            id: "high-value-1",
            type: "surgery",
            duration: 120,
            revenue: 5000,
            urgency: "high",
            requiredResources: ["room-2", "prof-789"],
          },
        ],
      };

      const result = await schedulingService.optimizeScheduling(optimization);
      
      // High-value appointments should be prioritized
      const highValueScheduled = result.optimizedSchedule.find(
        apt => apt.appointmentId === "high-value-1"
      );
      
      expect(highValueScheduled).toBeDefined();
      expect(highValueScheduled?.priorityScore).toBeGreaterThan(0.8);
    });
  });

  describe("Scheduling Context Management", () => {
    it("should build comprehensive scheduling context", async () => {
      const context: AppointmentSchedulingContext = {
        patientId: "patient-123",
        professionalId: "prof-456",
        clinicId: "clinic-789",
        serviceType: "consultation",
        requestedDate: "2024-12-15",
        requestedTime: "14:00",
        duration: 60,
        urgency: "normal",
        preferences: {
          timeOfDay: "afternoon",
          dayOfWeek: [1, 2, 3, 4, 5],
          professionalGender: "any",
          roomType: "standard",
        },
        constraints: {
          accessibility: false,
          language: "pt-BR",
          insurance: "premium",
          specificRequirements: [],
        },
        medicalHistory: {
          conditions: ["acne"],
          allergies: [],
          medications: [],
          previousTreatments: ["chemical_peel"],
        },
      };

      const mockPatient = {
        id: "patient-123",
        age: 35,
        gender: "F",
        contactInfo: { phone: "+5511999999999", email: "patient@email.com" },
        preferences: { language: "pt-BR", contactMethod: "whatsapp" },
        medicalHistory: { conditions: ["acne"], allergies: [] },
      };

      const mockProfessional = {
        id: "prof-456",
        specialization: "dermatology",
        schedule: { monday: ["09:00-18:00"], tuesday: ["09:00-18:00"] },
        availability: { maxDaily: 12, efficiency: 0.9 },
      };

      const mockClinic = {
        id: "clinic-789",
        resources: { rooms: ["room-1", "room-2"], equipment: ["laser"] },
        operatingHours: { monday: "08:00-19:00", tuesday: "08:00-19:00" },
      };

      mockPrisma.patient.findUnique.mockResolvedValue(mockPatient);
      mockPrisma.professional.findUnique.mockResolvedValue(mockProfessional);
      mockPrisma.clinic.findUnique.mockResolvedValue(mockClinic);

      const result = await schedulingService.buildSchedulingContext(context);
      
      expect(result).toMatchObject({
        patient: expect.any(Object),
        professional: expect.any(Object),
        clinic: expect.any(Object),
        availableSlots: expect.any(Array),
        constraints: expect.any(Object),
        optimizationFactors: expect.any(Object),
        readinessScore: expect.any(Number),
      });

      expect(result.readinessScore).toBeGreaterThan(0.7);
      expect(result.availableSlots.length).toBeGreaterThan(0);
    });

    it("should identify scheduling constraints and conflicts", async () => {
      const conflictingContext: AppointmentSchedulingContext = {
        patientId: "patient-123",
        professionalId: "prof-456",
        clinicId: "clinic-789",
        serviceType: "consultation",
        requestedDate: "2024-12-15", // Sunday
        requestedTime: "14:00",
        duration: 60,
        urgency: "normal",
        preferences: {
          timeOfDay: "afternoon",
          dayOfWeek: [1, 2, 3, 4, 5], // Weekdays only
          professionalGender: "any",
          roomType: "standard",
        },
        constraints: {
          accessibility: false,
          language: "pt-BR",
          insurance: "basic",
          specificRequirements: ["wheelchair_access"],
        },
        medicalHistory: {
          conditions: [],
          allergies: [],
          medications: [],
          previousTreatments: [],
        },
      };

      const mockClinic = {
        id: "clinic-789",
        operatingHours: { sunday: "closed" },
        resources: { rooms: ["room-1"], equipment: [] },
      };

      mockPrisma.patient.findUnique.mockResolvedValue({});
      mockPrisma.professional.findUnique.mockResolvedValue({});
      mockPrisma.clinic.findUnique.mockResolvedValue(mockClinic);

      const result = await schedulingService.buildSchedulingContext(conflictingContext);
      
      // Should identify conflicts
      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.conflicts[0]).toMatchObject({
        type: "clinic_closed",
        severity: "high",
        description: expect.any(String),
        resolution: expect.any(String),
      });

      expect(result.readinessScore).toBeLessThan(0.5);
    });
  });

  describe("Performance Analytics", () => {
    it("should calculate comprehensive performance metrics", async () => {
      const period = {
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        clinicId: "clinic-789",
      };

      const mockAppointments = [
        {
          id: "apt-1",
          status: "completed",
          scheduledFor: new Date("2024-01-15T14:00:00Z"),
          actualStartTime: new Date("2024-01-15T14:05:00Z"),
          endTime: new Date("2024-01-15T14:55:00Z"),
          professionalId: "prof-456",
          duration: 60,
          revenue: 500,
        },
        {
          id: "apt-2",
          status: "completed",
          scheduledFor: new Date("2024-01-16T10:00:00Z"),
          actualStartTime: new Date("2024-01-16T10:00:00Z"),
          endTime: new Date("2024-01-16T11:00:00Z"),
          professionalId: "prof-456",
          duration: 60,
          revenue: 300,
        },
      ];

      mockPrisma.appointment.findMany.mockResolvedValue(mockAppointments);
      mockPrisma.appointment.aggregate.mockResolvedValue({
        _count: { _all: 150 },
        _sum: { revenue: 75000 },
      });

      const result = await schedulingService.getPerformanceAnalytics(period);
      
      expect(result).toMatchObject({
        period: expect.any(Object),
        utilization: expect.any(Object),
        efficiency: expect.any(Object),
        quality: expect.any(Object),
        financial: expect.any(Object),
        predictions: expect.any(Object),
        recommendations: expect.any(Array),
      });

      // Verify metric calculations
      expect(result.utilization.overallUtilization).toBeGreaterThan(0);
      expect(result.efficiency.onTimePerformance).toBeGreaterThan(0);
      expect(result.financial.totalRevenue).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("should identify performance trends and patterns", async () => {
      const trendsPeriod = {
        startDate: "2024-06-01",
        endDate: "2024-12-31",
        clinicId: "clinic-789",
        granularity: "monthly",
      };

      const mockMonthlyData = [
        {
          month: "2024-06",
          completed: 45,
          cancelled: 5,
          noShow: 3,
          totalRevenue: 15000,
          avgWaitTime: 8.5,
        },
        {
          month: "2024-07",
          completed: 48,
          cancelled: 3,
          noShow: 2,
          totalRevenue: 16500,
          avgWaitTime: 7.2,
        },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockMonthlyData);

      const result = await schedulingService.getPerformanceTrends(trendsPeriod);
      
      expect(result).toMatchObject({
        trends: expect.any(Array),
        patterns: expect.any(Object),
        projections: expect.any(Array),
        insights: expect.any(Array),
      });

      // Should identify positive trends
      expect(result.trends[0].utilizationTrend).toBeDefined();
      expect(result.patterns.seasonalPatterns).toBeDefined();
      expect(result.projections.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle database connection errors gracefully", async () => {
      mockPrisma.appointment.findMany.mockRejectedValue(new Error("Database connection failed"));

      const features: NoShowPredictionFeatures = {
        patientId: "patient-123",
        professionalId: "prof-456",
        clinicId: "clinic-789",
        appointmentType: "consultation",
        scheduledHour: 14,
        dayOfWeek: 1,
        daysInAdvance: 7,
        previousNoShowRate: 0.2,
        age: 35,
        gender: "F",
        distanceFromClinic: 5.2,
        socioeconomicIndicator: 0.7,
        seasonalFactor: 1.0,
        weatherImpact: 0.1,
        appointmentHistoryCount: 12,
        consecutiveCancellations: 1,
        paymentMethod: "private",
        insuranceType: "premium",
        reminderPreference: ["whatsapp", "email"],
        previousRemindersSent: 3,
        timeSinceLastAppointment: 45,
        appointmentTimePreference: "afternoon",
        transportationMethod: "car",
        employmentStatus: "employed",
        stressLevel: "moderate",
        healthCondition: "stable",
        treatmentComplexity: "low",
        hasFamilySupport: true,
        financialConstraint: false,
        technologyAccess: "high",
        languagePreference: "pt-BR",
        culturalBackground: "urban",
      };

      await expect(schedulingService.predictNoShow(features)).rejects.toThrow("Database connection failed");
    });

    it("should validate input parameters", async () => {
      const invalidFeatures = {
        patientId: "",
        professionalId: "prof-456",
        // Missing required fields...
      } as any;

      await expect(schedulingService.predictNoShow(invalidFeatures)).rejects.toThrow("Invalid input parameters");
    });

    it("should handle concurrent scheduling requests", async () => {
      const optimization: SchedulingOptimization = {
        clinicId: "clinic-789",
        date: "2024-12-15",
        availableProfessionals: ["prof-456"],
        availableRooms: ["room-1"],
        serviceTypes: ["consultation"],
        timeSlots: [{ start: "09:00", end: "10:00" }],
        constraints: {
          maxAppointmentsPerProfessional: 1,
          minBreakBetweenAppointments: 15,
          roomSetupTime: 5,
          maxParallelProcedures: 1,
          requiredStaffPerProcedure: 1,
          lunchBreak: { start: "12:00", end: "13:00" },
        },
        objectives: {
          maximizeUtilization: true,
          minimizeWaitTime: true,
          balanceWorkload: true,
          prioritizeHighValue: false,
          accommodateEmergency: false,
        },
        existingAppointments: [],
      };

      // Simulate concurrent requests
      const concurrentRequests = [
        schedulingService.optimizeScheduling(optimization),
        schedulingService.optimizeScheduling(optimization),
      ];

      const results = await Promise.allSettled(concurrentRequests);
      
      // Both requests should succeed (thread-safe)
      expect(results.every(r => r.status === "fulfilled")).toBe(true);
    });
  });

  describe("Integration with External Services", () => {
    it("should integrate with LGPD compliance service", async () => {
      const features: NoShowPredictionFeatures = {
        patientId: "patient-123",
        professionalId: "prof-456",
        clinicId: "clinic-789",
        appointmentType: "consultation",
        scheduledHour: 14,
        dayOfWeek: 1,
        daysInAdvance: 7,
        previousNoShowRate: 0.2,
        age: 35,
        gender: "F",
        distanceFromClinic: 5.2,
        socioeconomicIndicator: 0.7,
        seasonalFactor: 1.0,
        weatherImpact: 0.1,
        appointmentHistoryCount: 12,
        consecutiveCancellations: 1,
        paymentMethod: "private",
        insuranceType: "premium",
        reminderPreference: ["whatsapp", "email"],
        previousRemindersSent: 3,
        timeSinceLastAppointment: 45,
        appointmentTimePreference: "afternoon",
        transportationMethod: "car",
        employmentStatus: "employed",
        stressLevel: "moderate",
        healthCondition: "stable",
        treatmentComplexity: "low",
        hasFamilySupport: true,
        financialConstraint: false,
        technologyAccess: "high",
        languagePreference: "pt-BR",
        culturalBackground: "urban",
      };

      mockPrisma.appointment.findMany.mockResolvedValue([
        { status: "completed", scheduledFor: new Date() },
      ]);

      const result = await schedulingService.predictNoShow(features);
      
      // Should include compliance validation
      expect(result.compliance).toBeDefined();
      expect(result.compliance.lgpdCompliant).toBe(true);
      expect(result.compliance.dataProcessing).toBeDefined();
    });

    it("should integrate with reminder system", async () => {
      const context: AppointmentSchedulingContext = {
        patientId: "patient-123",
        professionalId: "prof-456",
        clinicId: "clinic-789",
        serviceType: "consultation",
        requestedDate: "2024-12-15",
        requestedTime: "14:00",
        duration: 60,
        urgency: "normal",
        preferences: {
          timeOfDay: "afternoon",
          dayOfWeek: [1, 2, 3, 4, 5],
          professionalGender: "any",
          roomType: "standard",
        },
        constraints: {
          accessibility: false,
          language: "pt-BR",
          insurance: "premium",
          specificRequirements: [],
        },
        medicalHistory: {
          conditions: [],
          allergies: [],
          medications: [],
          previousTreatments: [],
        },
      };

      mockPrisma.patient.findUnique.mockResolvedValue({
        id: "patient-123",
        preferences: { language: "pt-BR", contactMethod: "whatsapp" },
      });
      mockPrisma.professional.findUnique.mockResolvedValue({});
      mockPrisma.clinic.findUnique.mockResolvedValue({});

      const result = await schedulingService.buildSchedulingContext(context);
      
      // Should include reminder recommendations
      expect(result.reminderStrategy).toBeDefined();
      expect(result.reminderStrategy.timing).toEqual(expect.arrayContaining([24, 2]));
      expect(result.reminderStrategy.channels).toEqual(expect.arrayContaining(["whatsapp"]));
    });
  });
});