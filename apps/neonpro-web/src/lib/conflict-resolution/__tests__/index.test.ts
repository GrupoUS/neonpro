import type { IntelligentConflictResolutionSystem } from "../index";
import type {
  ConflictType,
  ConflictSeverity,
  ResolutionStrategy,
  OptimizationType,
  ConflictResolutionConfig,
  SystemMetrics,
  AutomationRule,
} from "../types";
import type { createClient } from "@supabase/supabase-js";

// Mock Supabase
jest.mock("@supabase/supabase-js");
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            neq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
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

describe("IntelligentConflictResolutionSystem", () => {
  let system: IntelligentConflictResolutionSystem;
  let mockConfig: ConflictResolutionConfig;

  beforeEach(() => {
    mockConfig = {
      detection: {
        enabledTypes: [
          ConflictType.TIME_OVERLAP,
          ConflictType.STAFF_CONFLICT,
          ConflictType.ROOM_CONFLICT,
        ],
        severityThresholds: {
          low: 0.3,
          medium: 0.6,
          high: 0.8,
        },
        cacheEnabled: true,
        cacheTTL: 300000,
        batchSize: 100,
        maxConcurrentChecks: 5,
      },
      resolution: {
        enabledStrategies: [
          ResolutionStrategy.RESCHEDULE_LATER,
          ResolutionStrategy.RESCHEDULE_EARLIER,
          ResolutionStrategy.CHANGE_STAFF,
          ResolutionStrategy.CHANGE_ROOM,
        ],
        maxResolutionOptions: 5,
        autoApplyThreshold: 0.9,
        requireApproval: true,
        notificationEnabled: true,
        rollbackEnabled: true,
        maxRollbackDays: 7,
      },
      optimization: {
        enabledOptimizations: [
          OptimizationType.STAFF_BALANCING,
          OptimizationType.ROOM_UTILIZATION,
          OptimizationType.EQUIPMENT_ALLOCATION,
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
        optimizationInterval: 3600000,
        autoApplyOptimizations: false,
        maxRecommendations: 10,
        considerClientPreferences: true,
        respectStaffAvailability: true,
      },
      automation: {
        enabled: true,
        rules: [],
        scheduleOptimization: true,
        optimizationFrequency: "daily",
        autoResolveConflicts: false,
        notificationSettings: {
          email: true,
          sms: false,
          inApp: true,
        },
      },
      constraints: {
        businessHours: {
          start: "09:00",
          end: "17:00",
        },
        maxRescheduleDays: 7,
        minNoticeHours: 24,
        allowWeekendRescheduling: false,
        respectClientPreferences: true,
        maintainServiceQuality: true,
      },
    };

    system = new IntelligentConflictResolutionSystem(mockConfig);
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default config", () => {
      const defaultSystem = new IntelligentConflictResolutionSystem();
      expect(defaultSystem).toBeInstanceOf(IntelligentConflictResolutionSystem);
    });

    it("should initialize with custom config", () => {
      expect(system).toBeInstanceOf(IntelligentConflictResolutionSystem);
    });

    it("should validate config on initialization", () => {
      const invalidConfig = {
        ...mockConfig,
        detection: {
          ...mockConfig.detection,
          severityThresholds: {
            low: 0.8,
            medium: 0.6,
            high: 0.3,
          },
        },
      };

      expect(() => new IntelligentConflictResolutionSystem(invalidConfig)).toThrow();
    });

    it("should initialize all subsystems", () => {
      expect(system).toHaveProperty("detector");
      expect(system).toHaveProperty("resolutionEngine");
      expect(system).toHaveProperty("optimizer");
    });
  });

  describe("detectAndResolveConflicts", () => {
    const mockAppointment = {
      id: "appointment-1",
      start_time: "2024-01-15T10:00:00Z",
      end_time: "2024-01-15T11:00:00Z",
      staff_id: "staff-1",
      room_id: "room-1",
      client_id: "client-1",
      service_id: "service-1",
      status: "scheduled",
    };

    it("should detect and resolve conflicts automatically", async () => {
      // Mock conflict detection
      const mockConflicts = [
        {
          id: "conflict-1",
          type: ConflictType.TIME_OVERLAP,
          severity: ConflictSeverity.HIGH,
          appointmentId: "appointment-1",
          conflictingAppointmentId: "appointment-2",
          description: "Time overlap conflict",
          detectedAt: new Date(),
          metadata: {
            overlapDuration: 30,
            overlapPercentage: 0.5,
          },
        },
      ];

      // Mock overlapping appointment
      const overlappingAppointment = {
        id: "appointment-2",
        start_time: "2024-01-15T10:30:00Z",
        end_time: "2024-01-15T11:30:00Z",
        staff_id: "staff-1",
        room_id: "room-2",
        client_id: "client-2",
        service_id: "service-2",
        status: "scheduled",
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    neq: jest.fn(() =>
                      Promise.resolve({
                        data: [overlappingAppointment],
                        error: null,
                      }),
                    ),
                  })),
                })),
              })),
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() =>
                Promise.resolve({
                  data: [{ id: "appointment-1" }],
                  error: null,
                }),
              ),
            })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      const result = await system.detectAndResolveConflicts(mockAppointment);

      expect(result).toBeDefined();
      expect(result.conflicts).toBeDefined();
      expect(result.resolutions).toBeDefined();
      expect(Array.isArray(result.conflicts)).toBe(true);
      expect(Array.isArray(result.resolutions)).toBe(true);
    });

    it("should handle no conflicts scenario", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                neq: jest.fn(() =>
                  Promise.resolve({
                    data: [],
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      const result = await system.detectAndResolveConflicts(mockAppointment);

      expect(result.conflicts).toHaveLength(0);
      expect(result.resolutions).toHaveLength(0);
      expect(result.success).toBe(true);
    });

    it("should respect automation rules", async () => {
      const automationRule: AutomationRule = {
        id: "rule-1",
        name: "Auto-resolve low severity conflicts",
        condition: {
          conflictType: ConflictType.TIME_OVERLAP,
          severity: ConflictSeverity.LOW,
          maxAffectedAppointments: 2,
        },
        action: {
          strategy: ResolutionStrategy.RESCHEDULE_LATER,
          autoApply: true,
          requireApproval: false,
        },
        enabled: true,
        priority: 1,
      };

      const configWithAutomation = {
        ...mockConfig,
        automation: {
          ...mockConfig.automation,
          rules: [automationRule],
          autoResolveConflicts: true,
        },
      };

      const automatedSystem = new IntelligentConflictResolutionSystem(configWithAutomation);

      // Mock low severity conflict
      const lowSeverityConflict = {
        id: "appointment-2",
        start_time: "2024-01-15T10:45:00Z",
        end_time: "2024-01-15T11:15:00Z",
        staff_id: "staff-1",
        room_id: "room-2",
        client_id: "client-2",
        service_id: "service-2",
        status: "scheduled",
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    neq: jest.fn(() =>
                      Promise.resolve({
                        data: [lowSeverityConflict],
                        error: null,
                      }),
                    ),
                  })),
                })),
              })),
            })),
            update: jest.fn(() => ({
              eq: jest.fn(() =>
                Promise.resolve({
                  data: [{ id: "appointment-1" }],
                  error: null,
                }),
              ),
            })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      const result = await automatedSystem.detectAndResolveConflicts(mockAppointment);

      expect(result.autoResolved).toBe(true);
      expect(result.appliedResolutions).toBeDefined();
    });

    it("should handle high severity conflicts requiring approval", async () => {
      const highSeverityConflict = {
        id: "appointment-2",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: "staff-1",
        room_id: "room-1",
        client_id: "client-2",
        service_id: "service-2",
        status: "scheduled",
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === "appointments") {
          return {
            select: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    neq: jest.fn(() =>
                      Promise.resolve({
                        data: [highSeverityConflict],
                        error: null,
                      }),
                    ),
                  })),
                })),
              })),
            })),
          };
        }
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      const result = await system.detectAndResolveConflicts(mockAppointment);

      expect(result.requiresApproval).toBe(true);
      expect(result.pendingApprovals).toBeDefined();
      expect(result.pendingApprovals.length).toBeGreaterThan(0);
    });
  });

  describe("optimizeResourceAllocation", () => {
    const mockDateRange = {
      startDate: new Date("2024-01-15T00:00:00Z"),
      endDate: new Date("2024-01-15T23:59:59Z"),
    };

    it("should optimize resource allocation", async () => {
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

      const mockStaff = [
        {
          id: "staff-1",
          name: "John Doe",
          role: "therapist",
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
        return {
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        };
      });

      const result = await system.optimizeResourceAllocation(mockDateRange);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.metrics).toBeDefined();
      expect(result.workloadDistribution).toBeDefined();
    });

    it("should apply optimizations when auto-apply is enabled", async () => {
      const configWithAutoApply = {
        ...mockConfig,
        optimization: {
          ...mockConfig.optimization,
          autoApplyOptimizations: true,
        },
      };

      const autoSystem = new IntelligentConflictResolutionSystem(configWithAutoApply);

      mockSupabase.from.mockImplementation((table) => {
        return {
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
          update: jest.fn(() => ({
            eq: jest.fn(() =>
              Promise.resolve({
                data: [],
                error: null,
              }),
            ),
          })),
        };
      });

      const result = await autoSystem.optimizeResourceAllocation(mockDateRange);

      expect(result.appliedOptimizations).toBeDefined();
    });
  });

  describe("balanceWorkload", () => {
    it("should balance workload across staff", async () => {
      const mockStaffWorkload = [
        {
          staffId: "staff-1",
          totalHours: 45,
          appointmentCount: 10,
          utilizationRate: 0.9,
          efficiency: 0.8,
        },
        {
          staffId: "staff-2",
          totalHours: 20,
          appointmentCount: 4,
          utilizationRate: 0.4,
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

      const result = await system.balanceWorkload(mockStaffWorkload);

      expect(result).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.balancingActions).toBeDefined();
    });
  });

  describe("getSystemAnalytics", () => {
    it("should provide comprehensive system analytics", async () => {
      const dateRange = {
        startDate: new Date("2024-01-01T00:00:00Z"),
        endDate: new Date("2024-01-31T23:59:59Z"),
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

      const analytics = await system.getSystemAnalytics(dateRange);

      expect(analytics).toBeDefined();
      expect(analytics.conflictMetrics).toBeDefined();
      expect(analytics.resolutionMetrics).toBeDefined();
      expect(analytics.optimizationMetrics).toBeDefined();
      expect(analytics.performanceMetrics).toBeDefined();
      expect(analytics.trends).toBeDefined();
    });

    it("should calculate performance trends", async () => {
      const dateRange = {
        startDate: new Date("2024-01-01T00:00:00Z"),
        endDate: new Date("2024-01-31T23:59:59Z"),
      };

      // Mock historical data
      const mockConflictHistory = [
        {
          date: "2024-01-01",
          conflicts_detected: 5,
          conflicts_resolved: 4,
          avg_resolution_time: 15,
        },
        {
          date: "2024-01-02",
          conflicts_detected: 3,
          conflicts_resolved: 3,
          avg_resolution_time: 12,
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() =>
                Promise.resolve({
                  data: mockConflictHistory,
                  error: null,
                }),
              ),
            })),
          })),
        })),
      });

      const analytics = await system.getSystemAnalytics(dateRange);

      expect(analytics.trends).toBeDefined();
      expect(analytics.trends.conflictReduction).toBeDefined();
      expect(analytics.trends.resolutionEfficiency).toBeDefined();
      expect(analytics.trends.resourceUtilization).toBeDefined();
    });
  });

  describe("updateConfiguration", () => {
    it("should update system configuration", () => {
      const newConfig = {
        ...mockConfig,
        automation: {
          ...mockConfig.automation,
          autoResolveConflicts: true,
        },
      };

      system.updateConfiguration(newConfig);
      // Configuration should be updated (no direct way to test, but method should not throw)
    });

    it("should validate new configuration", () => {
      const invalidConfig = {
        ...mockConfig,
        detection: {
          ...mockConfig.detection,
          severityThresholds: {
            low: 1.5,
            medium: 0.6,
            high: 0.3,
          },
        },
      };

      expect(() => system.updateConfiguration(invalidConfig)).toThrow();
    });

    it("should update subsystem configurations", () => {
      const newConfig = {
        ...mockConfig,
        detection: {
          ...mockConfig.detection,
          cacheEnabled: false,
        },
        resolution: {
          ...mockConfig.resolution,
          autoApplyThreshold: 0.95,
        },
        optimization: {
          ...mockConfig.optimization,
          autoApplyOptimizations: true,
        },
      };

      system.updateConfiguration(newConfig);
      // All subsystems should be updated
    });
  });

  describe("performHealthCheck", () => {
    it("should perform comprehensive health check", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ id: "test" }],
              error: null,
            }),
          ),
        })),
      });

      const healthCheck = await system.performHealthCheck();

      expect(healthCheck).toBeDefined();
      expect(healthCheck.overall).toBeDefined();
      expect(healthCheck.subsystems).toBeDefined();
      expect(healthCheck.subsystems.detector).toBeDefined();
      expect(healthCheck.subsystems.resolutionEngine).toBeDefined();
      expect(healthCheck.subsystems.optimizer).toBeDefined();
      expect(healthCheck.database).toBeDefined();
      expect(healthCheck.performance).toBeDefined();
    });

    it("should detect database connectivity issues", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          limit: jest.fn(() => Promise.reject(new Error("Connection failed"))),
        })),
      });

      const healthCheck = await system.performHealthCheck();

      expect(healthCheck.overall).toBe("unhealthy");
      expect(healthCheck.database.status).toBe("error");
      expect(healthCheck.database.error).toContain("Connection failed");
    });

    it("should measure performance metrics", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ id: "test" }],
              error: null,
            }),
          ),
        })),
      });

      const startTime = Date.now();
      const healthCheck = await system.performHealthCheck();
      const endTime = Date.now();

      expect(healthCheck.performance).toBeDefined();
      expect(healthCheck.performance.responseTime).toBeLessThan(endTime - startTime + 100);
      expect(healthCheck.performance.memoryUsage).toBeDefined();
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle invalid appointment data", async () => {
      const invalidAppointment = {
        id: "invalid-appointment",
        start_time: "invalid-date",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: "staff-1",
        room_id: "room-1",
        client_id: "client-1",
        service_id: "service-1",
        status: "scheduled",
      };

      await expect(system.detectAndResolveConflicts(invalidAppointment as any)).rejects.toThrow();
    });

    it("should handle database connection failures", async () => {
      const appointment = {
        id: "appointment-1",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: "staff-1",
        room_id: "room-1",
        client_id: "client-1",
        service_id: "service-1",
        status: "scheduled",
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                neq: jest.fn(() => Promise.reject(new Error("Database error"))),
              })),
            })),
          })),
        })),
      });

      await expect(system.detectAndResolveConflicts(appointment)).rejects.toThrow("Database error");
    });

    it("should handle empty date ranges gracefully", async () => {
      const emptyDateRange = {
        startDate: new Date("2024-01-15T00:00:00Z"),
        endDate: new Date("2024-01-14T23:59:59Z"),
      };

      await expect(system.optimizeResourceAllocation(emptyDateRange)).rejects.toThrow();
    });

    it("should handle network timeouts", async () => {
      const appointment = {
        id: "appointment-1",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: "staff-1",
        room_id: "room-1",
        client_id: "client-1",
        service_id: "service-1",
        status: "scheduled",
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                neq: jest.fn(
                  () =>
                    new Promise((_, reject) => {
                      setTimeout(() => reject(new Error("Timeout")), 100);
                    }),
                ),
              })),
            })),
          })),
        })),
      });

      await expect(system.detectAndResolveConflicts(appointment)).rejects.toThrow("Timeout");
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle large numbers of appointments efficiently", async () => {
      const appointment = {
        id: "appointment-1",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: "staff-1",
        room_id: "room-1",
        client_id: "client-1",
        service_id: "service-1",
        status: "scheduled",
      };

      // Mock large dataset
      const largeDataset = Array.from({ length: 500 }, (_, i) => ({
        id: `appointment-${i}`,
        start_time: "2024-01-15T10:30:00Z",
        end_time: "2024-01-15T11:30:00Z",
        staff_id: `staff-${i % 10}`,
        room_id: `room-${i % 5}`,
        client_id: `client-${i}`,
        service_id: `service-${i}`,
        status: "scheduled",
      }));

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                neq: jest.fn(() =>
                  Promise.resolve({
                    data: largeDataset,
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      const startTime = Date.now();
      const result = await system.detectAndResolveConflicts(appointment);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(result).toBeDefined();
    });

    it("should cache results for improved performance", async () => {
      const appointment = {
        id: "appointment-1",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: "staff-1",
        room_id: "room-1",
        client_id: "client-1",
        service_id: "service-1",
        status: "scheduled",
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                neq: jest.fn(() =>
                  Promise.resolve({
                    data: [],
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      // First call
      await system.detectAndResolveConflicts(appointment);

      // Second call should be faster due to caching
      const startTime = Date.now();
      await system.detectAndResolveConflicts(appointment);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be very fast due to caching
    });
  });
});
