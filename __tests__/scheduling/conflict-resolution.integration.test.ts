// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn(),
  data: null,
  error: null,
};

// Mock AuditLogger
const mockAuditLogger = {
  logConflictDetection: jest.fn(),
  logSchedulingAction: jest.fn(),
  logSystemEvent: jest.fn(),
};

// Mock createClient to return our mock
jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

// Import services after mocking
import {
  ConflictDetectionService,
  WaitlistService,
} from "../../lib/scheduling/conflict-resolution";

describe("Conflict Resolution System Integration Tests", () => {
  let conflictService: ConflictDetectionService;
  let waitlistService: WaitlistService;

  beforeEach(() => {
    jest.clearAllMocks();
    conflictService = new ConflictDetectionService();
    waitlistService = new WaitlistService();

    // Default successful responses
    mockSupabaseClient.single.mockResolvedValue({
      data: { count: 0 },
      error: null,
    });
  });

  describe("ConflictDetectionService", () => {
    describe("detectConflicts", () => {
      test("should detect appointment conflicts successfully", async () => {
        const appointmentData = {
          provider_id: "prov-123",
          start_time: "2024-01-15T10:00:00Z",
          end_time: "2024-01-15T11:00:00Z",
          service_type: "consultation",
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: { count: 2 },
          error: null,
        });

        const result = await conflictService.detectConflicts(appointmentData);

        expect(result).toEqual({
          hasConflicts: true,
          conflictCount: 2,
          severity: "medium",
        });
        expect(mockSupabaseClient.from).toHaveBeenCalledWith("appointments");
      });

      test("should return no conflicts when none exist", async () => {
        const appointmentData = {
          provider_id: "prov-123",
          start_time: "2024-01-15T10:00:00Z",
          end_time: "2024-01-15T11:00:00Z",
          service_type: "consultation",
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: { count: 0 },
          error: null,
        });

        const result = await conflictService.detectConflicts(appointmentData);

        expect(result).toEqual({
          hasConflicts: false,
          conflictCount: 0,
          severity: "none",
        });
      });

      test("should handle database errors gracefully", async () => {
        const appointmentData = {
          provider_id: "prov-123",
          start_time: "2024-01-15T10:00:00Z",
          end_time: "2024-01-15T11:00:00Z",
          service_type: "consultation",
        };

        const mockError = new Error("DB error");
        mockSupabaseClient.single.mockRejectedValue(mockError);

        await expect(conflictService.detectConflicts(appointmentData)).rejects.toThrow(
          "Failed to detect conflicts",
        );
      });
    });

    describe("analyzeConflictSeverity", () => {
      test("should correctly analyze conflict severity", async () => {
        const conflictData = {
          conflictCount: 3,
          affectedProviders: ["prov-1", "prov-2"],
          timeOverlap: 30,
        };

        const result = await conflictService.analyzeConflictSeverity(conflictData);

        expect(result).toEqual({
          severity: "high",
          impact: "multiple_providers",
          recommendation: "immediate_resolution",
        });
      });
    });

    describe("suggestResolutions", () => {
      test("should suggest appropriate resolutions", async () => {
        const conflictContext = {
          conflictType: "time_overlap",
          severity: "medium",
          involvedAppointments: ["apt-1", "apt-2"],
        };

        const result = await conflictService.suggestResolutions(conflictContext);

        expect(result).toHaveProperty("suggestions");
        expect(Array.isArray(result.suggestions)).toBe(true);
        expect(result.suggestions.length).toBeGreaterThan(0);
      });
    });
  });

  describe("WaitlistService", () => {
    describe("addToWaitlist", () => {
      test("should add patient to waitlist successfully", async () => {
        const waitlistData = {
          patient_id: "pat-123",
          preferred_provider: "prov-456",
          service_type: "consultation",
          priority: "normal",
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: { id: "wait-789" },
          error: null,
        });

        const result = await waitlistService.addToWaitlist(waitlistData);

        expect(result).toEqual({
          success: true,
          waitlistId: "wait-789",
          position: 5,
        });
        expect(mockSupabaseClient.from).toHaveBeenCalledWith("waitlist");
      });

      test("should handle duplicate waitlist entries", async () => {
        const waitlistData = {
          patient_id: "pat-123",
          preferred_provider: "prov-456",
          service_type: "consultation",
          priority: "normal",
        };

        const mockError = new Error("Duplicate entry");
        mockSupabaseClient.single.mockRejectedValue(mockError);

        await expect(waitlistService.addToWaitlist(waitlistData)).rejects.toThrow(
          "Failed to add to waitlist",
        );
      });
    });

    describe("processWaitlist", () => {
      test("should process waitlist successfully", async () => {
        const criteria = {
          provider_id: "prov-123",
          available_slots: ["2024-01-15T10:00:00Z", "2024-01-15T14:00:00Z"],
        };

        mockSupabaseClient.single.mockResolvedValue({
          data: [
            { id: "wait-1", patient_id: "pat-1", priority: "high" },
            { id: "wait-2", patient_id: "pat-2", priority: "normal" },
          ],
          error: null,
        });

        const result = await waitlistService.processWaitlist(criteria);

        expect(result).toEqual({
          processed: 2,
          matched: 2,
        });
      });
    });

    describe("getWaitlistPosition", () => {
      test("should return correct waitlist position", async () => {
        const patientId = "pat-123";

        // Mock the full chain: from().select().eq().single()
        mockSupabaseClient.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({
                data: {
                  id: "wait-1",
                  patient_id: "pat-123",
                  created_at: "2024-01-15T10:30:00Z",
                },
                error: null,
              }),
            }),
          }),
        });

        const result = await waitlistService.getWaitlistPosition(patientId);

        expect(result).toEqual({
          position: 3,
          estimatedWait: "2 hours",
        });
      });

      test("should handle patient not on waitlist", async () => {
        const patientId = "pat-999";

        // Mock the full chain: from().select().eq().single() - returning null data
        mockSupabaseClient.from.mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              single: jest.fn().mockResolvedValueOnce({
                data: null,
                error: null,
              }),
            }),
          }),
        });

        const result = await waitlistService.getWaitlistPosition(patientId);

        expect(result).toEqual({
          position: null,
          estimatedWait: null,
        });
      });
    });
  });

  describe("Integration Scenarios", () => {
    test("should handle conflict detection and waitlist integration", async () => {
      const appointmentData = {
        provider_id: "prov-123",
        start_time: "2024-01-15T10:00:00Z",
        end_time: "2024-01-15T11:00:00Z",
        service_type: "consultation",
      };

      // Mock conflict detection
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { count: 1 },
        error: null,
      });

      const conflicts = await conflictService.detectConflicts(appointmentData);
      expect(conflicts.hasConflicts).toBe(true);

      // Mock waitlist addition
      mockSupabaseClient.single.mockResolvedValueOnce({
        data: { id: "wait-new" },
        error: null,
      });

      const waitlistResult = await waitlistService.addToWaitlist({
        patient_id: "pat-123",
        preferred_provider: appointmentData.provider_id,
        service_type: appointmentData.service_type,
        priority: "normal",
      });

      expect(waitlistResult.success).toBe(true);
      expect(waitlistResult.position).toBe(5);
    });
  });
});
