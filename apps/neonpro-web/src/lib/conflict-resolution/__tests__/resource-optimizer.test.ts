import type { createClient } from "@supabase/supabase-js";
import type { ResourceOptimizer } from "../resource-optimizer";
import type {
  OptimizationRecommendation,
  OptimizationType,
  ResourceMetrics,
  ResourceOptimizationConfig,
  WorkloadDistribution,
} from "../types";

// Mock Supabase
jest.mock("@supabase/supabase-js");
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
    insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
  rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe("ResourceOptimizer", () => {
  let optimizer: ResourceOptimizer;
  let mockConfig: ResourceOptimizationConfig;

  beforeEach(() => {
    mockConfig = {
      enabledOptimizations: [
        OptimizationType.STAFF_BALANCING,
        OptimizationType.ROOM_UTILIZATION,
        OptimizationType.EQUIPMENT_ALLOCATION,
        OptimizationType.SCHEDULE_COMPACTION,
      ],
      workloadThresholds: {
        underutilized: 0.3,
        optimal: 0.7,
        overloaded: 0.9,
      },
      utilizationTargets: {
        staff: 0.75,
        rooms: 0.8,
        equipment: 0.7,
      },
      optimizationInterval: 3600000, // 1 hour
      autoApplyOptimizations: false,
      maxRecommendations: 10,
      considerClientPreferences: true,
      respectStaffAvailability: true,
    };

    optimizer = new ResourceOptimizer(mockConfig);
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default config", () => {
      const defaultOptimizer = new ResourceOptimizer();
      expect(defaultOptimizer).toBeInstanceOf(ResourceOptimizer);
    });

    it("should initialize with custom config", () => {
      expect(optimizer).toBeInstanceOf(ResourceOptimizer);
    });

    it("should validate config on initialization", () => {
      const invalidConfig = {
        ...mockConfig,
        workloadThresholds: {
          underutilized: 0.8,
          optimal: 0.7,
          overloaded: 0.6,
        },
      };

      expect(() => new ResourceOptimizer(invalidConfig)).toThrow();
    });
  });

  describe("optimizeResources", () => {
    const mockDateRange = {
      startDate: new Date("2024-01-15T00:00:00Z"),
      endDate: new Date("2024-01-15T23:59:59Z"),
    };

    it("should optimize resources for given date range", async () => {
      // Mock appointments data
      const mockAppointments = [
        {
          id: "appointment-1",
          start_time: "2024-01-15T10:00:00Z",
          end_time: "2024-01-15T11:00:00Z",
          staff_id: "staff-1",
          room_id: "room-1",
          client_id: "client-1",
          service_id: "service-1",
          status: "scheduled",
        },
        {
          id: "appointment-2",
          start_time: "2024-01-15T14:00:00Z",
          end_time: "2024-01-15T15:00:00Z",
          staff_id: "staff-2",
          room_id: "room-2",
          client_id: "client-2",
          service_id: "service-2",
          status: "scheduled",
        },
      ];

      // Mock staff data
      const mockStaff = [
        {
          id: "staff-1",
          name: "John Doe",
          role: "therapist",
          availability: "09:00-17:00",
          skills: ["massage", "therapy"],
        },
        {
          id: "staff-2",
          name: "Jane Smith",
          role: "therapist",
          availability: "10:00-18:00",
          skills: ["facial", "therapy"],
        },
      ];

      // Mock rooms data
      const mockRooms = [
        {
          id: "room-1",
          name: "Room A",
          capacity: 1,
          equipment: ["massage-table"],
          availability: "09:00-17:00",
        },
        {
          id: "room-2",
          name: "Room B",
          capacity: 1,
          equipment: ["facial-bed"],
          availability: "09:00-17:00",
        },
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: mockAppointments,
                      error: null,
                    }),
                  ),
                })),
              })),
            })),
          };
        }
        if (table === "staff") {
          return {
            select: jest.fn(() =>
              Promise.resolve({
                data: mockStaff,
                error: null,
              }),
            ),
          };
        }
        if (table === "rooms") {
          return {
            select: jest.fn(() =>
              Promise.resolve({
                data: mockRooms,
                error: null,
              }),
            ),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      const result = await optimizer.optimizeResources(mockDateRange);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.metrics).toBeDefined();
      expect(result.workloadDistribution).toBeDefined();
    });

    it("should handle empty date range", async () => {
      const emptyDateRange = {
        startDate: new Date("2024-01-15T00:00:00Z"),
        endDate: new Date("2024-01-14T23:59:59Z"), // End before start
      };

      await expect(optimizer.optimizeResources(emptyDateRange)).rejects.toThrow();
    });

    it("should respect staff availability constraints", async () => {
      const mockAppointments = [
        {
          id: "appointment-1",
          start_time: "2024-01-15T08:00:00Z", // Before staff availability
          end_time: "2024-01-15T09:00:00Z",
          staff_id: "staff-1",
          room_id: "room-1",
          client_id: "client-1",
          service_id: "service-1",
          status: "scheduled",
        },
      ];

      const mockStaff = [
        {
          id: "staff-1",
          name: "John Doe",
          role: "therapist",
          availability: "09:00-17:00",
          skills: ["massage"],
        },
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: mockAppointments,
                      error: null,
                    }),
                  ),
                })),
              })),
            })),
          };
        }
        if (table === "staff") {
          return {
            select: jest.fn(() =>
              Promise.resolve({
                data: mockStaff,
                error: null,
              }),
            ),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      const result = await optimizer.optimizeResources(mockDateRange);

      // Should generate recommendations to fix availability conflicts
      expect(result.recommendations.length).toBeGreaterThan(0);
      const availabilityRecommendations = result.recommendations.filter((rec) =>
        rec.description.includes("availability"),
      );
      expect(availabilityRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe("balanceWorkload", () => {
    it("should balance workload across staff members", async () => {
      const mockStaffWorkload = [
        {
          staffId: "staff-1",
          totalHours: 40,
          appointmentCount: 8,
          utilizationRate: 0.9,
          efficiency: 0.85,
        },
        {
          staffId: "staff-2",
          totalHours: 20,
          appointmentCount: 4,
          utilizationRate: 0.5,
          efficiency: 0.9,
        },
      ];

      const mockAppointments = [
        {
          id: "appointment-1",
          start_time: "2024-01-15T10:00:00Z",
          end_time: "2024-01-15T11:00:00Z",
          staff_id: "staff-1",
          room_id: "room-1",
          client_id: "client-1",
          service_id: "service-1",
          status: "scheduled",
        },
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: mockAppointments,
                      error: null,
                    }),
                  ),
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      const result = await optimizer.balanceWorkload(mockStaffWorkload);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.balancingActions).toBeDefined();
    });

    it("should identify overloaded staff", async () => {
      const overloadedWorkload = [
        {
          staffId: "staff-1",
          totalHours: 50,
          appointmentCount: 12,
          utilizationRate: 0.95,
          efficiency: 0.7,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() =>
                Promise.resolve({
                  data: [],
                  error: null,
                }),
              ),
            })),
          })),
        })),
      });

      const result = await optimizer.balanceWorkload(overloadedWorkload);

      const overloadRecommendations = result.recommendations.filter(
        (rec) => rec.description.includes("overloaded") || rec.description.includes("reduce"),
      );
      expect(overloadRecommendations.length).toBeGreaterThan(0);
    });

    it("should identify underutilized staff", async () => {
      const underutilizedWorkload = [
        {
          staffId: "staff-1",
          totalHours: 15,
          appointmentCount: 3,
          utilizationRate: 0.25,
          efficiency: 0.9,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() =>
                Promise.resolve({
                  data: [],
                  error: null,
                }),
              ),
            })),
          })),
        })),
      });

      const result = await optimizer.balanceWorkload(underutilizedWorkload);

      const underutilizedRecommendations = result.recommendations.filter(
        (rec) => rec.description.includes("underutilized") || rec.description.includes("increase"),
      );
      expect(underutilizedRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe("applyOptimizations", () => {
    let mockRecommendations: OptimizationRecommendation[];

    beforeEach(() => {
      mockRecommendations = [
        {
          id: "rec-1",
          type: OptimizationType.STAFF_BALANCING,
          priority: "high",
          description: "Reassign appointment to balance workload",
          impact: {
            efficiency: 0.15,
            utilization: 0.1,
            cost: -50,
          },
          actions: [
            {
              type: "reassign_appointment",
              appointmentId: "appointment-1",
              fromStaffId: "staff-1",
              toStaffId: "staff-2",
            },
          ],
          estimatedDuration: 10,
          confidence: 0.9,
        },
        {
          id: "rec-2",
          type: OptimizationType.ROOM_UTILIZATION,
          priority: "medium",
          description: "Optimize room allocation",
          impact: {
            efficiency: 0.08,
            utilization: 0.12,
            cost: -25,
          },
          actions: [
            {
              type: "change_room",
              appointmentId: "appointment-2",
              fromRoomId: "room-1",
              toRoomId: "room-2",
            },
          ],
          estimatedDuration: 5,
          confidence: 0.85,
        },
      ];
    });

    it("should apply optimization recommendations", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({
              data: [{ id: "appointment-1" }],
              error: null,
            }),
          ),
        })),
      });

      const result = await optimizer.applyOptimizations(mockRecommendations);

      expect(result.success).toBe(true);
      expect(result.appliedOptimizations).toBeDefined();
      expect(result.appliedOptimizations.length).toBe(2);
    });

    it("should handle partial application failures", async () => {
      let callCount = 0;
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve({
                data: [{ id: "appointment-1" }],
                error: null,
              });
            } else {
              return Promise.resolve({
                data: null,
                error: { message: "Update failed" },
              });
            }
          }),
        })),
      });

      const result = await optimizer.applyOptimizations(mockRecommendations);

      expect(result.success).toBe(false);
      expect(result.appliedOptimizations.length).toBe(1);
      expect(result.failedOptimizations.length).toBe(1);
    });

    it("should validate recommendations before applying", async () => {
      const invalidRecommendations = [
        {
          ...mockRecommendations[0],
          actions: [
            {
              type: "invalid_action",
              appointmentId: "appointment-1",
            },
          ],
        },
      ];

      const result = await optimizer.applyOptimizations(invalidRecommendations as any);

      expect(result.success).toBe(false);
      expect(result.failedOptimizations.length).toBe(1);
    });

    it("should handle database transaction failures", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.reject(new Error("Transaction failed"))),
        })),
      });

      const result = await optimizer.applyOptimizations(mockRecommendations);

      expect(result.success).toBe(false);
      expect(result.failedOptimizations.length).toBe(2);
    });
  });

  describe("calculateResourceMetrics", () => {
    const mockDateRange = {
      startDate: new Date("2024-01-15T00:00:00Z"),
      endDate: new Date("2024-01-15T23:59:59Z"),
    };

    it("should calculate comprehensive resource metrics", async () => {
      const mockData = {
        appointments: [
          {
            id: "appointment-1",
            start_time: "2024-01-15T10:00:00Z",
            end_time: "2024-01-15T11:00:00Z",
            staff_id: "staff-1",
            room_id: "room-1",
          },
        ],
        staff: [
          {
            id: "staff-1",
            name: "John Doe",
            availability: "09:00-17:00",
          },
        ],
        rooms: [
          {
            id: "room-1",
            name: "Room A",
            capacity: 1,
          },
        ],
      };

      mockSupabase.from.mockImplementation((table) => {
        return {
          select: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() =>
                Promise.resolve({
                  data: mockData[table as keyof typeof mockData] || [],
                  error: null,
                }),
              ),
            })),
          })),
        };
      });

      const metrics = await optimizer.calculateResourceMetrics(mockDateRange);

      expect(metrics).toBeDefined();
      expect(metrics.staffUtilization).toBeDefined();
      expect(metrics.roomUtilization).toBeDefined();
      expect(metrics.equipmentUtilization).toBeDefined();
      expect(metrics.overallEfficiency).toBeDefined();
      expect(typeof metrics.overallEfficiency).toBe("number");
    });

    it("should handle empty data gracefully", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() =>
              Promise.resolve({
                data: [],
                error: null,
              }),
            ),
          })),
        })),
      });

      const metrics = await optimizer.calculateResourceMetrics(mockDateRange);

      expect(metrics).toBeDefined();
      expect(metrics.overallEfficiency).toBe(0);
    });
  });

  describe("generateRecommendations", () => {
    it("should generate staff balancing recommendations", async () => {
      const mockMetrics: ResourceMetrics = {
        staffUtilization: {
          "staff-1": 0.95, // Overloaded
          "staff-2": 0.3, // Underutilized
        },
        roomUtilization: {
          "room-1": 0.8,
        },
        equipmentUtilization: {
          "equipment-1": 0.7,
        },
        overallEfficiency: 0.75,
        bottlenecks: ["staff-1"],
        underutilizedResources: ["staff-2"],
      };

      const mockWorkload: WorkloadDistribution = {
        staff: {
          "staff-1": {
            totalHours: 45,
            appointmentCount: 10,
            utilizationRate: 0.95,
            efficiency: 0.7,
          },
          "staff-2": {
            totalHours: 15,
            appointmentCount: 3,
            utilizationRate: 0.3,
            efficiency: 0.9,
          },
        },
        rooms: {},
        equipment: {},
        timeSlots: {},
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            }),
          ),
        })),
      });

      const recommendations = await (optimizer as any).generateRecommendations(
        mockMetrics,
        mockWorkload,
      );

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      const staffRecommendations = recommendations.filter(
        (rec) => rec.type === OptimizationType.STAFF_BALANCING,
      );
      expect(staffRecommendations.length).toBeGreaterThan(0);
    });

    it("should prioritize recommendations correctly", async () => {
      const mockMetrics: ResourceMetrics = {
        staffUtilization: {
          "staff-1": 0.98, // Critically overloaded
        },
        roomUtilization: {
          "room-1": 0.85, // Slightly over target
        },
        equipmentUtilization: {},
        overallEfficiency: 0.6,
        bottlenecks: ["staff-1"],
        underutilizedResources: [],
      };

      const mockWorkload: WorkloadDistribution = {
        staff: {
          "staff-1": {
            totalHours: 50,
            appointmentCount: 12,
            utilizationRate: 0.98,
            efficiency: 0.6,
          },
        },
        rooms: {},
        equipment: {},
        timeSlots: {},
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            }),
          ),
        })),
      });

      const recommendations = await (optimizer as any).generateRecommendations(
        mockMetrics,
        mockWorkload,
      );

      // Should prioritize critical staff overload over room utilization
      const highPriorityRecs = recommendations.filter((rec) => rec.priority === "high");
      const staffRecs = highPriorityRecs.filter(
        (rec) => rec.type === OptimizationType.STAFF_BALANCING,
      );

      expect(staffRecs.length).toBeGreaterThan(0);
    });
  });

  describe("Configuration and Updates", () => {
    it("should update configuration", () => {
      const newConfig = {
        ...mockConfig,
        autoApplyOptimizations: true,
      };

      optimizer.updateConfig(newConfig);
      // Configuration should be updated (no direct way to test, but method should not throw)
    });

    it("should validate new configuration", () => {
      const invalidConfig = {
        ...mockConfig,
        workloadThresholds: {
          underutilized: 0.9,
          optimal: 0.7,
          overloaded: 0.5,
        },
      };

      expect(() => optimizer.updateConfig(invalidConfig)).toThrow();
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle large datasets efficiently", async () => {
      const largeDataRange = {
        startDate: new Date("2024-01-01T00:00:00Z"),
        endDate: new Date("2024-01-31T23:59:59Z"),
      };

      // Mock large dataset
      const largeAppointmentSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `appointment-${i}`,
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: `staff-${i % 10}`,
        room_id: `room-${i % 5}`,
        client_id: `client-${i}`,
        service_id: `service-${i % 3}`,
        status: "scheduled",
      }));

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest.fn(() => ({
                  eq: jest.fn(() =>
                    Promise.resolve({
                      data: largeAppointmentSet,
                      error: null,
                    }),
                  ),
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      const startTime = Date.now();
      const result = await optimizer.optimizeResources(largeDataRange);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(15000); // Should complete within 15 seconds
      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it("should cache optimization results", async () => {
      const dateRange = {
        startDate: new Date("2024-01-15T00:00:00Z"),
        endDate: new Date("2024-01-15T23:59:59Z"),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() =>
                Promise.resolve({
                  data: [],
                  error: null,
                }),
              ),
            })),
          })),
        })),
      });

      // First call
      await optimizer.optimizeResources(dateRange);

      // Second call should be faster (cached)
      const startTime = Date.now();
      await optimizer.optimizeResources(dateRange);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast due to caching
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      const dateRange = {
        startDate: new Date("2024-01-15T00:00:00Z"),
        endDate: new Date("2024-01-15T23:59:59Z"),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => Promise.reject(new Error("Database connection failed"))),
            })),
          })),
        })),
      });

      await expect(optimizer.optimizeResources(dateRange)).rejects.toThrow(
        "Database connection failed",
      );
    });

    it("should handle invalid date ranges", async () => {
      const invalidDateRange = {
        startDate: new Date("invalid-date"),
        endDate: new Date("2024-01-15T23:59:59Z"),
      };

      await expect(optimizer.optimizeResources(invalidDateRange)).rejects.toThrow();
    });

    it("should handle network timeouts", async () => {
      const dateRange = {
        startDate: new Date("2024-01-15T00:00:00Z"),
        endDate: new Date("2024-01-15T23:59:59Z"),
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(
                () =>
                  new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Network timeout")), 100);
                  }),
              ),
            })),
          })),
        })),
      });

      await expect(optimizer.optimizeResources(dateRange)).rejects.toThrow("Network timeout");
    });
  });
});
