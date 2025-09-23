/**
 * Real-time Availability Service Tests
 * 
 * Comprehensive test suite for real-time availability management:
 * - Availability calculation and caching
 * - Conflict detection and resolution
 * - WebSocket integration and subscriptions
 * - Resource optimization and utilization
 * - Performance analytics and monitoring
 * - Multi-client synchronization
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { RealtimeAvailabilityService } from "../../../services/realtime-availability-service";
import { prisma } from "../../../lib/prisma";
import { 
  RealTimeAvailability, 
  AvailabilityConflict, 
  ResourceUtilization,
  AvailabilitySubscription 
} from "../../../services/realtime-availability-service";

// Mock WebSocket
const mockWebSocket = {
  send: vi.fn(),
  close: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  readyState: 1, // OPEN
};

vi.mock("ws", () => ({
  WebSocket: vi.fn(() => mockWebSocket),
}));

// Mock dependencies
vi.mock("../../../lib/prisma");
vi.mock("../../../services/enhanced-lgpd-lifecycle");

describe("RealtimeAvailabilityService", () => {
  let availabilityService: RealtimeAvailabilityService;
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
        delete: vi.fn(),
        aggregate: vi.fn(),
        groupBy: vi.fn(),
      },
      professional: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      clinic: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      room: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      availabilityCache: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        upsert: vi.fn(),
      },
      availabilitySubscription: {
        create: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      $queryRaw: vi.fn(),
      $transaction: vi.fn(),
    };

    (prisma as any) = mockPrisma;
    
    // Create service instance
    availabilityService = new RealtimeAvailabilityService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Availability Calculation", () => {
    it("should calculate availability for a single professional", async () => {
      const professionalId = "prof-123";
      const date = "2024-12-16";

      const mockProfessional = {
        id: professionalId,
        name: "Dr. Silva",
        schedule: {
          monday: ["09:00-12:00", "14:00-18:00"],
          tuesday: ["09:00-12:00", "14:00-18:00"],
          wednesday: ["09:00-12:00", "14:00-18:00"],
          thursday: ["09:00-12:00", "14:00-18:00"],
          friday: ["09:00-12:00", "14:00-18:00"],
          saturday: [],
          sunday: [],
        },
        maxDailyAppointments: 12,
        breakDuration: 15,
        appointmentDuration: 60,
      };

      const mockExistingAppointments = [
        {
          id: "apt-1",
          professionalId,
          startTime: new Date("2024-12-16T09:00:00Z"),
          endTime: new Date("2024-12-16T10:00:00Z"),
          status: "scheduled",
        },
        {
          id: "apt-2",
          professionalId,
          startTime: new Date("2024-12-16T11:00:00Z"),
          endTime: new Date("2024-12-16T12:00:00Z"),
          status: "scheduled",
        },
      ];

      mockPrisma.professional.findUnique.mockResolvedValue(mockProfessional);
      mockPrisma.appointment.findMany.mockResolvedValue(mockExistingAppointments);

      const result = await availabilityService.calculateProfessionalAvailability(professionalId, date);
      
      expect(result).toMatchObject({
        professionalId,
        date,
        availableSlots: expect.any(Array),
        utilization: expect.any(Object),
        breaks: expect.any(Array),
        calculatedAt: expect.any(Date),
      });

      expect(result.availableSlots.length).toBeGreaterThan(0);
      expect(result.utilization.totalAvailableTime).toBeGreaterThan(0);
      expect(result.utilization.occupiedTime).toBeGreaterThan(0);
    });

    it("should handle professional with no existing appointments", async () => {
      const professionalId = "prof-456";
      const date = "2024-12-16";

      const mockProfessional = {
        id: professionalId,
        name: "Dra. Santos",
        schedule: {
          monday: ["09:00-18:00"],
          tuesday: ["09:00-18:00"],
          wednesday: ["09:00-18:00"],
          thursday: ["09:00-18:00"],
          friday: ["09:00-18:00"],
          saturday: [],
          sunday: [],
        },
        maxDailyAppointments: 8,
        breakDuration: 15,
        appointmentDuration: 60,
      };

      mockPrisma.professional.findUnique.mockResolvedValue(mockProfessional);
      mockPrisma.appointment.findMany.mockResolvedValue([]);

      const result = await availabilityService.calculateProfessionalAvailability(professionalId, date);
      
      expect(result.availableSlots.length).toBeGreaterThan(0);
      expect(result.utilization.utilizationRate).toBe(0);
      expect(result.availableSlots[0].available).toBe(true);
    });

    it("should calculate availability for multiple professionals", async () => {
      const clinicId = "clinic-123";
      const date = "2024-12-16";

      const mockProfessionals = [
        {
          id: "prof-123",
          name: "Dr. Silva",
          schedule: { monday: ["09:00-18:00"] },
          maxDailyAppointments: 12,
        },
        {
          id: "prof-456",
          name: "Dra. Santos",
          schedule: { monday: ["10:00-19:00"] },
          maxDailyAppointments: 10,
        },
      ];

      mockPrisma.professional.findMany.mockResolvedValue(mockProfessionals);
      mockPrisma.appointment.findMany.mockResolvedValue([]);

      const result = await availabilityService.calculateClinicAvailability(clinicId, date);
      
      expect(result).toMatchObject({
        clinicId,
        date,
        professionals: expect.any(Array),
        totalAvailableSlots: expect.any(Number),
        totalUtilization: expect.any(Object),
      });

      expect(result.professionals.length).toBe(2);
      expect(result.totalAvailableSlots).toBeGreaterThan(0);
    });

    it("should respect business hours and holidays", async () => {
      const professionalId = "prof-123";
      const date = "2024-12-25"; // Christmas

      const mockProfessional = {
        id: professionalId,
        name: "Dr. Silva",
        schedule: {
          monday: ["09:00-18:00"],
          tuesday: ["09:00-18:00"],
        },
        maxDailyAppointments: 12,
        holidays: ["2024-12-25"],
      };

      mockPrisma.professional.findUnique.mockResolvedValue(mockProfessional);
      mockPrisma.appointment.findMany.mockResolvedValue([]);

      const result = await availabilityService.calculateProfessionalAvailability(professionalId, date);
      
      expect(result.availableSlots).toEqual([]);
      expect(result.utilization.utilizationRate).toBe(0);
      expect(result.businessStatus).toBe("holiday");
    });

    it("should handle overlapping appointments correctly", async () => {
      const professionalId = "prof-123";
      const date = "2024-12-16";

      const mockProfessional = {
        id: professionalId,
        name: "Dr. Silva",
        schedule: { monday: ["09:00-18:00"] },
        maxDailyAppointments: 12,
        appointmentDuration: 60,
      };

      const overlappingAppointments = [
        {
          id: "apt-1",
          professionalId,
          startTime: new Date("2024-12-16T09:00:00Z"),
          endTime: new Date("2024-12-16T10:30:00Z"), // Overlaps with standard slots
          status: "scheduled",
        },
        {
          id: "apt-2",
          professionalId,
          startTime: new Date("2024-12-16T10:15:00Z"), // Direct overlap
          endTime: new Date("2024-12-16T11:15:00Z"),
          status: "scheduled",
        },
      ];

      mockPrisma.professional.findUnique.mockResolvedValue(mockProfessional);
      mockPrisma.appointment.findMany.mockResolvedValue(overlappingAppointments);

      const result = await availabilityService.calculateProfessionalAvailability(professionalId, date);
      
      // Should detect and handle overlaps
      expect(result.conflicts).toBeDefined();
      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.conflicts[0].type).toBe("overlap");
    });
  });

  describe("Conflict Detection", () => {
    it("should detect professional scheduling conflicts", async () => {
      const appointment = {
        id: "new-apt",
        professionalId: "prof-123",
        startTime: new Date("2024-12-16T10:00:00Z"),
        endTime: new Date("2024-12-16T11:00:00Z"),
        roomId: "room-1",
      };

      const existingAppointments = [
        {
          id: "existing-1",
          professionalId: "prof-123",
          startTime: new Date("2024-12-16T10:30:00Z"),
          endTime: new Date("2024-12-16T11:30:00Z"),
          roomId: "room-2",
        },
      ];

      mockPrisma.appointment.findMany.mockResolvedValue(existingAppointments);

      const conflicts = await availabilityService.detectConflicts(appointment);
      
      expect(conflicts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "professional_conflict",
            severity: "high",
            conflictingAppointmentId: "existing-1",
            overlapMinutes: 30,
          }),
        ])
      );
    });

    it("should detect room conflicts", async () => {
      const appointment = {
        id: "new-apt",
        professionalId: "prof-123",
        startTime: new Date("2024-12-16T14:00:00Z"),
        endTime: new Date("2024-12-16T15:00:00Z"),
        roomId: "room-1",
      };

      const existingAppointments = [
        {
          id: "existing-1",
          professionalId: "prof-456", // Different professional
          startTime: new Date("2024-12-16T14:30:00Z"),
          endTime: new Date("2024-12-16T15:30:00Z"),
          roomId: "room-1", // Same room
        },
      ];

      mockPrisma.appointment.findMany.mockResolvedValue(existingAppointments);

      const conflicts = await availabilityService.detectConflicts(appointment);
      
      expect(conflicts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "room_conflict",
            severity: "high",
            conflictingAppointmentId: "existing-1",
            overlapMinutes: 30,
          }),
        ])
      );
    });

    it("should detect equipment conflicts", async () => {
      const appointment = {
        id: "new-apt",
        professionalId: "prof-123",
        startTime: new Date("2024-12-16T14:00:00Z"),
        endTime: new Date("2024-12-16T15:00:00Z"),
        roomId: "room-1",
        requiredEquipment: ["laser", "ultrasound"],
      };

      const existingAppointments = [
        {
          id: "existing-1",
          professionalId: "prof-456",
          startTime: new Date("2024-12-16T14:30:00Z"),
          endTime: new Date("2024-12-16T15:30:00Z"),
          roomId: "room-2",
          requiredEquipment: ["laser"], // Same equipment
        },
      ];

      mockPrisma.appointment.findMany.mockResolvedValue(existingAppointments);

      const conflicts = await availabilityService.detectConflicts(appointment);
      
      expect(conflicts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "equipment_conflict",
            severity: "medium",
            conflictingEquipment: ["laser"],
            overlapMinutes: 30,
          }),
        ])
      );
    });

    it("should handle double-booking scenarios", async () => {
      const appointment = {
        id: "new-apt",
        professionalId: "prof-123",
        startTime: new Date("2024-12-16T10:00:00Z"),
        endTime: new Date("2024-12-16T11:00:00Z"),
        roomId: "room-1",
      };

      const exactMatchAppointment = {
        id: "existing-1",
        professionalId: "prof-123",
        startTime: new Date("2024-12-16T10:00:00Z"), // Exact same time
        endTime: new Date("2024-12-16T11:00:00Z"),
        roomId: "room-1",
      };

      mockPrisma.appointment.findMany.mockResolvedValue([exactMatchAppointment]);

      const conflicts = await availabilityService.detectConflicts(appointment);
      
      expect(conflicts[0].type).toBe("exact_match");
      expect(conflicts[0].severity).toBe("critical");
      expect(conflicts[0].overlapMinutes).toBe(60);
    });

    it("should resolve conflicts with alternative suggestions", async () => {
      const appointment = {
        id: "new-apt",
        professionalId: "prof-123",
        startTime: new Date("2024-12-16T10:00:00Z"),
        endTime: new Date("2024-12-16T11:00:00Z"),
        roomId: "room-1",
      };

      const conflictingAppointments = [
        {
          id: "existing-1",
          professionalId: "prof-123",
          startTime: new Date("2024-12-16T10:30:00Z"),
          endTime: new Date("2024-12-16T11:30:00Z"),
          roomId: "room-2",
        },
      ];

      mockPrisma.professional.findUnique.mockResolvedValue({
        id: "prof-123",
        schedule: { monday: ["09:00-18:00"] },
        maxDailyAppointments: 12,
      });

      mockPrisma.appointment.findMany.mockResolvedValue(conflictingAppointments);

      const resolution = await availabilityService.resolveConflicts(appointment);
      
      expect(resolution).toMatchObject({
        hasConflicts: expect.any(Boolean),
        conflicts: expect.any(Array),
        suggestions: expect.any(Array),
        resolutionScore: expect.any(Number),
      });

      expect(resolution.suggestions.length).toBeGreaterThan(0);
      expect(resolution.suggestions[0]).toMatchObject({
        type: expect.any(String),
        alternativeTime: expect.any(String),
        confidence: expect.any(Number),
      });
    });
  });

  describe("Caching and Performance", () => {
    it("should cache availability calculations", async () => {
      const professionalId = "prof-123";
      const date = "2024-12-16";

      const mockProfessional = {
        id: professionalId,
        name: "Dr. Silva",
        schedule: { monday: ["09:00-18:00"] },
        maxDailyAppointments: 12,
      };

      mockPrisma.professional.findUnique.mockResolvedValue(mockProfessional);
      mockPrisma.appointment.findMany.mockResolvedValue([]);

      // First call - should cache result
      const result1 = await availabilityService.getAvailabilityWithCache(professionalId, date);
      
      // Second call - should use cache
      const result2 = await availabilityService.getAvailabilityWithCache(professionalId, date);

      expect(result1).toEqual(result2);
      expect(mockPrisma.professional.findUnique).toHaveBeenCalledTimes(1); // Only called once
    });

    it("should invalidate cache on appointment changes", async () => {
      const professionalId = "prof-123";
      const date = "2024-12-16";

      // First, cache the availability
      await availabilityService.getAvailabilityWithCache(professionalId, date);

      // Simulate appointment creation
      const newAppointment = {
        id: "new-apt",
        professionalId,
        startTime: new Date("2024-12-16T10:00:00Z"),
        endTime: new Date("2024-12-16T11:00:00Z"),
        status: "scheduled",
      };

      await availabilityService.invalidateCacheForProfessional(professionalId, date);

      // Next call should recalculate
      mockPrisma.professional.findUnique.mockClear();
      await availabilityService.getAvailabilityWithCache(professionalId, date);

      expect(mockPrisma.professional.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should handle cache expiration", async () => {
      const professionalId = "prof-123";
      const date = "2024-12-16";

      const mockProfessional = {
        id: professionalId,
        name: "Dr. Silva",
        schedule: { monday: ["09:00-18:00"] },
        maxDailyAppointments: 12,
      };

      mockPrisma.professional.findUnique.mockResolvedValue(mockProfessional);
      mockPrisma.appointment.findMany.mockResolvedValue([]);

      // Set cache TTL to 1ms for testing
      availabilityService["cacheTTL"] = 1;

      // First call
      await availabilityService.getAvailabilityWithCache(professionalId, date);

      // Wait for cache expiration
      await new Promise(resolve => setTimeout(resolve, 10));

      // Second call should recalculate
      mockPrisma.professional.findUnique.mockClear();
      await availabilityService.getAvailabilityWithCache(professionalId, date);

      expect(mockPrisma.professional.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe("WebSocket Integration", () => {
    it("should handle WebSocket subscriptions", async () => {
      const subscription: AvailabilitySubscription = {
        id: "sub-123",
        clientId: "client-456",
        professionalIds: ["prof-123", "prof-456"],
        clinicId: "clinic-789",
        dateRange: { start: "2024-12-16", end: "2024-12-20" },
        filters: { availableOnly: true },
        active: true,
        createdAt: new Date(),
      };

      mockPrisma.availabilitySubscription.create.mockResolvedValue(subscription);

      const result = await availabilityService.addSubscription(subscription);
      
      expect(result).toMatchObject({
        id: "sub-123",
        clientId: "client-456",
        active: true,
      });

      expect(availabilityService["subscriptions"].get("sub-123")).toBeDefined();
    });

    it("should broadcast availability updates to subscribers", async () => {
      // Setup subscriptions
      const subscription1: AvailabilitySubscription = {
        id: "sub-1",
        clientId: "client-1",
        professionalIds: ["prof-123"],
        clinicId: "clinic-789",
        dateRange: { start: "2024-12-16", end: "2024-12-16" },
        filters: {},
        active: true,
        createdAt: new Date(),
      };

      const subscription2: AvailabilitySubscription = {
        id: "sub-2",
        clientId: "client-2",
        professionalIds: ["prof-456"], // Different professional
        clinicId: "clinic-789",
        dateRange: { start: "2024-12-16", end: "2024-12-16" },
        filters: {},
        active: true,
        createdAt: new Date(),
      };

      await availabilityService.addSubscription(subscription1);
      await availabilityService.addSubscription(subscription2);

      // Broadcast update for prof-123
      const update = {
        professionalId: "prof-123",
        date: "2024-12-16",
        availableSlots: [
          { startTime: "09:00", endTime: "10:00", available: true },
        ],
      };

      await availabilityService.broadcastAvailabilityUpdate(update);

      // Only subscription1 should receive the update
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"professionalId":"prof-123"')
      );
    });

    it("should handle subscription cleanup", async () => {
      const subscription: AvailabilitySubscription = {
        id: "sub-123",
        clientId: "client-456",
        professionalIds: ["prof-123"],
        clinicId: "clinic-789",
        dateRange: { start: "2024-12-16", end: "2024-12-20" },
        filters: {},
        active: true,
        createdAt: new Date(),
      };

      await availabilityService.addSubscription(subscription);

      // Remove subscription
      await availabilityService.removeSubscription("sub-123");

      expect(availabilityService["subscriptions"].has("sub-123")).toBe(false);
    });

    it("should handle WebSocket connection errors", async () => {
      // Simulate WebSocket error
      mockWebSocket.readyState = 3; // CLOSED

      const subscription: AvailabilitySubscription = {
        id: "sub-123",
        clientId: "client-456",
        professionalIds: ["prof-123"],
        clinicId: "clinic-789",
        dateRange: { start: "2024-12-16", end: "2024-12-20" },
        filters: {},
        active: true,
        createdAt: new Date(),
      };

      await availabilityService.addSubscription(subscription);

      // Should handle gracefully without throwing
      expect(availabilityService["subscriptions"].has("sub-123")).toBe(true);
    });
  });

  describe("Resource Optimization", () => {
    it("should optimize resource allocation", async () => {
      const clinicId = "clinic-123";
      const date = "2024-12-16";

      const mockResources = {
        professionals: [
          {
            id: "prof-123",
            name: "Dr. Silva",
            specialization: "dermatology",
            efficiency: 0.9,
            maxDaily: 12,
            schedule: { monday: ["09:00-18:00"] },
          },
          {
            id: "prof-456",
            name: "Dra. Santos",
            specialization: "aesthetics",
            efficiency: 0.95,
            maxDaily: 10,
            schedule: { monday: ["10:00-19:00"] },
          },
        ],
        rooms: [
          { id: "room-1", type: "consultation", capacity: 1 },
          { id: "room-2", type: "procedure", capacity: 2 },
        ],
        equipment: [
          { id: "laser-1", type: "laser", available: true },
          { id: "ultrasound-1", type: "ultrasound", available: true },
        ],
      };

      const demand = [
        {
          type: "consultation",
          duration: 60,
          count: 8,
          requiredEquipment: [],
        },
        {
          type: "procedure",
          duration: 90,
          count: 4,
          requiredEquipment: ["laser"],
        },
      ];

      mockPrisma.clinic.findUnique.mockResolvedValue({
        id: clinicId,
        resources: mockResources,
      });

      mockPrisma.professional.findMany.mockResolvedValue(mockResources.professionals);

      const optimization = await availabilityService.optimizeResourceAllocation(clinicId, date, demand);
      
      expect(optimization).toMatchObject({
        clinicId,
        date,
        allocation: expect.any(Array),
        utilization: expect.any(Object),
        efficiency: expect.any(Object),
        recommendations: expect.any(Array),
      });

      expect(optimization.allocation.length).toBeGreaterThan(0);
      expect(optimization.utilization.overallEfficiency).toBeGreaterThan(0.7);
    });

    it("should balance workload across professionals", async () => {
      const professionalIds = ["prof-123", "prof-456", "prof-789"];
      const appointments = [
        { professionalId: "prof-123", duration: 60 },
        { professionalId: "prof-123", duration: 60 },
        { professionalId: "prof-456", duration: 90 },
        { professionalId: "prof-789", duration: 30 },
      ];

      const balancing = await availabilityService.balanceWorkload(professionalIds, appointments);
      
      expect(balancing).toMatchObject({
        originalWorkload: expect.any(Object),
        balancedWorkload: expect.any(Object),
        redistributions: expect.any(Array),
        fairnessScore: expect.any(Number),
      });

      expect(balancing.fairnessScore).toBeGreaterThan(0.7);
      expect(balancing.redistributions.length).toBeGreaterThan(0);
    });
  });

  describe("Performance Analytics", () => {
    it("should calculate utilization metrics", async () => {
      const clinicId = "clinic-123";
      const period = {
        startDate: "2024-12-01",
        endDate: "2024-12-31",
      };

      const mockAppointments = [
        {
          id: "apt-1",
          professionalId: "prof-123",
          startTime: new Date("2024-12-16T09:00:00Z"),
          endTime: new Date("2024-12-16T10:00:00Z"),
          status: "completed",
          duration: 60,
        },
        {
          id: "apt-2",
          professionalId: "prof-123",
          startTime: new Date("2024-12-16T10:00:00Z"),
          endTime: new Date("2024-12-16T11:00:00Z"),
          status: "completed",
          duration: 60,
        },
      ];

      const mockProfessionals = [
        {
          id: "prof-123",
          maxDailyAppointments: 12,
          workHours: { monday: ["09:00-18:00"] },
        },
      ];

      mockPrisma.appointment.findMany.mockResolvedValue(mockAppointments);
      mockPrisma.professional.findMany.mockResolvedValue(mockProfessionals);

      const analytics = await availabilityService.getUtilizationAnalytics(clinicId, period);
      
      expect(analytics).toMatchObject({
        clinicId,
        period,
        overallUtilization: expect.any(Object),
        professionalUtilization: expect.any(Array),
        timeBasedAnalysis: expect.any(Object),
        trends: expect.any(Array),
        recommendations: expect.any(Array),
      });

      expect(analytics.overallUtilization.utilizationRate).toBeGreaterThan(0);
      expect(analytics.professionalUtilization.length).toBeGreaterThan(0);
    });

    it("should identify bottlenecks and inefficiencies", async () => {
      const clinicId = "clinic-123";
      const date = "2024-12-16";

      const bottleneckData = {
        professionalUtilization: [
          { id: "prof-123", utilization: 0.95, overload: true },
          { id: "prof-456", utilization: 0.3, underutilized: true },
        ],
        roomUtilization: [
          { id: "room-1", utilization: 0.9, bottleneck: true },
          { id: "room-2", utilization: 0.2, underutilized: true },
        ],
        timeSlots: [
          { time: "09:00-10:00", demand: 8, capacity: 4, overload: true },
          { time: "14:00-15:00", demand: 2, capacity: 6, underutilized: true },
        ],
      };

      mockPrisma.$queryRaw.mockResolvedValue(bottleneckData);

      const bottlenecks = await availabilityService.identifyBottlenecks(clinicId, date);
      
      expect(bottlenecks).toMatchObject({
        clinicId,
        date,
        bottlenecks: expect.any(Array),
        criticalIssues: expect.any(Array),
        optimizationOpportunities: expect.any(Array),
        impactScore: expect.any(Number),
      });

      expect(bottlenecks.bottlenecks.length).toBeGreaterThan(0);
      expect(bottlenecks.criticalIssues.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle database connection failures", async () => {
      const professionalId = "prof-123";
      const date = "2024-12-16";

      mockPrisma.professional.findUnique.mockRejectedValue(new Error("Database connection failed"));

      await expect(
        availabilityService.calculateProfessionalAvailability(professionalId, date)
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle invalid professional IDs", async () => {
      const professionalId = "invalid-prof";
      const date = "2024-12-16";

      mockPrisma.professional.findUnique.mockResolvedValue(null);

      await expect(
        availabilityService.calculateProfessionalAvailability(professionalId, date)
      ).rejects.toThrow("Professional not found");
    });

    it("should handle invalid date formats", async () => {
      const professionalId = "prof-123";
      const invalidDate = "invalid-date";

      await expect(
        availabilityService.calculateProfessionalAvailability(professionalId, invalidDate)
      ).rejects.toThrow("Invalid date format");
    });

    it("should handle concurrent modification conflicts", async () => {
      const appointment = {
        id: "new-apt",
        professionalId: "prof-123",
        startTime: new Date("2024-12-16T10:00:00Z"),
        endTime: new Date("2024-12-16T11:00:00Z"),
        roomId: "room-1",
      };

      // Simulate concurrent modification
      mockPrisma.appointment.findMany.mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: "conflicting-apt",
            professionalId: "prof-123",
            startTime: new Date("2024-12-16T10:30:00Z"),
            endTime: new Date("2024-12-16T11:30:00Z"),
          },
        ]);

      const conflicts1 = await availabilityService.detectConflicts(appointment);
      const conflicts2 = await availabilityService.detectConflicts(appointment);

      expect(conflicts1.length).not.toBe(conflicts2.length);
    });

    it("should validate input parameters", async () => {
      await expect(
        availabilityService.calculateProfessionalAvailability("", "2024-12-16")
      ).rejects.toThrow("Invalid professional ID");

      await expect(
        availabilityService.calculateProfessionalAvailability("prof-123", "")
      ).rejects.toThrow("Invalid date");
    });
  });

  describe("Integration Testing", () => {
    it("should integrate with appointment scheduling workflow", async () => {
      const appointmentData = {
        patientId: "patient-456",
        professionalId: "prof-123",
        clinicId: "clinic-789",
        startTime: new Date("2024-12-16T10:00:00Z"),
        endTime: new Date("2024-12-16T11:00:00Z"),
      };

      const mockProfessional = {
        id: "prof-123",
        schedule: { monday: ["09:00-18:00"] },
        maxDailyAppointments: 12,
      };

      mockPrisma.professional.findUnique.mockResolvedValue(mockProfessional);
      mockPrisma.appointment.findMany.mockResolvedValue([]);

      // Check availability first
      const availability = await availabilityService.calculateProfessionalAvailability(
        "prof-123",
        "2024-12-16"
      );

      // Detect conflicts
      const conflicts = await availabilityService.detectConflicts(appointmentData);

      expect(availability.availableSlots.length).toBeGreaterThan(0);
      expect(conflicts.length).toBe(0);
    });

    it("should handle real-time updates across multiple clients", async () => {
      // Setup multiple client subscriptions
      const subscriptions = [
        {
          id: "sub-1",
          clientId: "client-1",
          professionalIds: ["prof-123"],
          clinicId: "clinic-789",
          dateRange: { start: "2024-12-16", end: "2024-12-16" },
          filters: {},
          active: true,
          createdAt: new Date(),
        },
        {
          id: "sub-2",
          clientId: "client-2",
          professionalIds: ["prof-123"],
          clinicId: "clinic-789",
          dateRange: { start: "2024-12-16", end: "2024-12-16" },
          filters: {},
          active: true,
          createdAt: new Date(),
        },
      ];

      for (const sub of subscriptions) {
        await availabilityService.addSubscription(sub);
      }

      // Broadcast update
      const update = {
        professionalId: "prof-123",
        date: "2024-12-16",
        availableSlots: [
          { startTime: "09:00", endTime: "10:00", available: false }, // Now unavailable
        ],
      };

      await availabilityService.broadcastAvailabilityUpdate(update);

      // Both clients should receive the update
      expect(mockWebSocket.send).toHaveBeenCalledTimes(2);
    });
  });
});