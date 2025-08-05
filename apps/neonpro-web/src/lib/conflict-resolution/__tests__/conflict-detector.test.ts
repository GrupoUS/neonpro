import type { ConflictDetector } from "../conflict-detector";
import type { ConflictType, ConflictSeverity, ConflictDetectionConfig } from "../types";
import type { createClient } from "@supabase/supabase-js";

// Mock Supabase
jest.mock("@supabase/supabase-js");
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      gte: jest.fn(() => ({
        lte: jest.fn(() => ({
          eq: jest.fn(() => ({
            neq: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })),
    })),
  })),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

describe("ConflictDetector", () => {
  let detector: ConflictDetector;
  let mockConfig: ConflictDetectionConfig;

  beforeEach(() => {
    mockConfig = {
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
    };

    detector = new ConflictDetector(mockConfig);
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with default config", () => {
      const defaultDetector = new ConflictDetector();
      expect(defaultDetector).toBeInstanceOf(ConflictDetector);
    });

    it("should initialize with custom config", () => {
      expect(detector).toBeInstanceOf(ConflictDetector);
    });

    it("should validate config on initialization", () => {
      const invalidConfig = {
        ...mockConfig,
        severityThresholds: {
          low: 0.8,
          medium: 0.6,
          high: 0.3,
        },
      };

      expect(() => new ConflictDetector(invalidConfig)).toThrow();
    });
  });

  describe("detectConflicts", () => {
    const mockAppointment = {
      id: "test-appointment",
      start_time: "2024-01-15T10:00:00Z",
      end_time: "2024-01-15T11:00:00Z",
      staff_id: "staff-1",
      room_id: "room-1",
      client_id: "client-1",
      service_id: "service-1",
      status: "scheduled",
    };

    it("should detect time overlap conflicts", async () => {
      const overlappingAppointment = {
        id: "overlapping-appointment",
        start_time: "2024-01-15T10:30:00Z",
        end_time: "2024-01-15T11:30:00Z",
        staff_id: "staff-1",
        room_id: "room-2",
        client_id: "client-2",
        service_id: "service-2",
        status: "scheduled",
      };

      mockSupabase.from.mockReturnValue({
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
      });

      const conflicts = await detector.detectConflicts(mockAppointment);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe(ConflictType.TIME_OVERLAP);
      expect(conflicts[0].severity).toBeDefined();
    });

    it("should detect staff conflicts", async () => {
      const staffConflictAppointment = {
        id: "staff-conflict-appointment",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: "staff-1",
        room_id: "room-2",
        client_id: "client-2",
        service_id: "service-2",
        status: "scheduled",
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                neq: jest.fn(() =>
                  Promise.resolve({
                    data: [staffConflictAppointment],
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      const conflicts = await detector.detectConflicts(mockAppointment);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe(ConflictType.STAFF_CONFLICT);
    });

    it("should detect room conflicts", async () => {
      const roomConflictAppointment = {
        id: "room-conflict-appointment",
        start_time: "2024-01-15T10:30:00Z",
        end_time: "2024-01-15T11:30:00Z",
        staff_id: "staff-2",
        room_id: "room-1",
        client_id: "client-2",
        service_id: "service-2",
        status: "scheduled",
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                neq: jest.fn(() =>
                  Promise.resolve({
                    data: [roomConflictAppointment],
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      const conflicts = await detector.detectConflicts(mockAppointment);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe(ConflictType.ROOM_CONFLICT);
    });

    it("should handle multiple conflicts", async () => {
      const multipleConflicts = [
        {
          id: "conflict-1",
          start_time: "2024-01-15T10:30:00Z",
          end_time: "2024-01-15T11:30:00Z",
          staff_id: "staff-1",
          room_id: "room-1",
          client_id: "client-2",
          service_id: "service-2",
          status: "scheduled",
        },
        {
          id: "conflict-2",
          start_time: "2024-01-15T10:15:00Z",
          end_time: "2024-01-15T11:15:00Z",
          staff_id: "staff-1",
          room_id: "room-2",
          client_id: "client-3",
          service_id: "service-3",
          status: "scheduled",
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                neq: jest.fn(() =>
                  Promise.resolve({
                    data: multipleConflicts,
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      const conflicts = await detector.detectConflicts(mockAppointment);

      expect(conflicts.length).toBeGreaterThan(1);
    });

    it("should return empty array when no conflicts", async () => {
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

      const conflicts = await detector.detectConflicts(mockAppointment);

      expect(conflicts).toHaveLength(0);
    });

    it("should handle database errors gracefully", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          gte: jest.fn(() => ({
            lte: jest.fn(() => ({
              eq: jest.fn(() => ({
                neq: jest.fn(() =>
                  Promise.resolve({
                    data: null,
                    error: { message: "Database error" },
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      await expect(detector.detectConflicts(mockAppointment)).rejects.toThrow("Database error");
    });
  });

  describe("detectBatchConflicts", () => {
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
        start_time: "2024-01-15T11:00:00Z",
        end_time: "2024-01-15T12:00:00Z",
        staff_id: "staff-2",
        room_id: "room-2",
        client_id: "client-2",
        service_id: "service-2",
        status: "scheduled",
      },
    ];

    it("should detect conflicts for multiple appointments", async () => {
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

      const results = await detector.detectBatchConflicts(mockAppointments);

      expect(results).toHaveLength(2);
      expect(results[0].appointmentId).toBe("appointment-1");
      expect(results[1].appointmentId).toBe("appointment-2");
    });

    it("should handle empty appointment list", async () => {
      const results = await detector.detectBatchConflicts([]);
      expect(results).toHaveLength(0);
    });

    it("should respect batch size limits", async () => {
      const largeAppointmentList = Array.from({ length: 250 }, (_, i) => ({
        id: `appointment-${i}`,
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: `staff-${i}`,
        room_id: `room-${i}`,
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
                    data: [],
                    error: null,
                  }),
                ),
              })),
            })),
          })),
        })),
      });

      const results = await detector.detectBatchConflicts(largeAppointmentList);
      expect(results).toHaveLength(250);
    });
  });

  describe("Severity Calculation", () => {
    it("should calculate correct severity for high overlap", () => {
      const appointment1 = {
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T12:00:00Z",
      };
      const appointment2 = {
        start_time: "2024-01-15T10:30:00Z",
        end_time: "2024-01-15T11:30:00Z",
      };

      // Access private method through any type
      const severity = (detector as any).calculateOverlapSeverity(appointment1, appointment2);
      expect(severity).toBeGreaterThan(0.5);
    });

    it("should calculate correct severity for low overlap", () => {
      const appointment1 = {
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T12:00:00Z",
      };
      const appointment2 = {
        start_time: "2024-01-15T11:45:00Z",
        end_time: "2024-01-15T12:15:00Z",
      };

      const severity = (detector as any).calculateOverlapSeverity(appointment1, appointment2);
      expect(severity).toBeLessThan(0.3);
    });
  });

  describe("Cache Management", () => {
    it("should use cache when enabled", async () => {
      const appointment = {
        id: "cached-appointment",
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
      await detector.detectConflicts(appointment);

      // Second call should use cache
      await detector.detectConflicts(appointment);

      // Should only call database once due to caching
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });

    it("should clear cache when requested", async () => {
      await detector.clearCache();
      // Cache should be cleared (no direct way to test, but method should not throw)
    });
  });

  describe("Configuration Updates", () => {
    it("should update configuration", () => {
      const newConfig = {
        ...mockConfig,
        cacheEnabled: false,
      };

      detector.updateConfig(newConfig);
      // Configuration should be updated (no direct way to test, but method should not throw)
    });

    it("should validate new configuration", () => {
      const invalidConfig = {
        ...mockConfig,
        severityThresholds: {
          low: 1.5,
          medium: 0.6,
          high: 0.3,
        },
      };

      expect(() => detector.updateConfig(invalidConfig)).toThrow();
    });
  });

  describe("Error Handling", () => {
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

      await expect(detector.detectConflicts(invalidAppointment as any)).rejects.toThrow();
    });

    it("should handle network timeouts", async () => {
      const appointment = {
        id: "timeout-appointment",
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
                neq: jest.fn(() => Promise.reject(new Error("Network timeout"))),
              })),
            })),
          })),
        })),
      });

      await expect(detector.detectConflicts(appointment)).rejects.toThrow("Network timeout");
    });
  });

  describe("Performance", () => {
    it("should handle large datasets efficiently", async () => {
      const appointment = {
        id: "performance-test",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        staff_id: "staff-1",
        room_id: "room-1",
        client_id: "client-1",
        service_id: "service-1",
        status: "scheduled",
      };

      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `conflict-${i}`,
        start_time: "2024-01-15T10:30:00Z",
        end_time: "2024-01-15T11:30:00Z",
        staff_id: `staff-${i}`,
        room_id: `room-${i}`,
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
      const conflicts = await detector.detectConflicts(appointment);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(conflicts).toBeDefined();
    });
  });
});
