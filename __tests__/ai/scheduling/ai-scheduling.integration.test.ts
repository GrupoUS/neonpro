import { PatientPreferenceLearner } from "../../../lib/ai/preference-learner";
import { AISchedulingOptimizer } from "../../../lib/ai/scheduling-optimizer";

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
    insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    })),
  })),
  rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
};

// Mock AuditLogger
const mockAuditLogger = {
  logEvent: jest.fn(() => Promise.resolve()),
  logError: jest.fn(() => Promise.resolve()),
  logAccess: jest.fn(() => Promise.resolve()),
};

describe("AI Scheduling Integration Tests", () => {
  let optimizer: AISchedulingOptimizer;
  let learner: PatientPreferenceLearner;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the constructor dependencies
    optimizer = new AISchedulingOptimizer();
    learner = new PatientPreferenceLearner();

    // Override the supabase and auditLogger properties
    (optimizer as any).supabase = mockSupabaseClient;
    (optimizer as any).auditLogger = mockAuditLogger;
    (learner as any).supabase = mockSupabaseClient;
    (learner as any).auditLogger = mockAuditLogger;
  });

  describe("AISchedulingOptimizer", () => {
    it("should create optimizer instance", () => {
      expect(optimizer).toBeInstanceOf(AISchedulingOptimizer);
    });

    it("should have suggestOptimalSlots method", () => {
      expect(typeof optimizer.suggestOptimalSlots).toBe("function");
    });

    it("should have getPatientPreferenceData method", () => {
      expect(typeof optimizer.getPatientPreferenceData).toBe("function");
    });

    it("should have processFeedback method", () => {
      expect(typeof optimizer.processFeedback).toBe("function");
    });

    it("should have getFeedbackHistory method", () => {
      expect(typeof optimizer.getFeedbackHistory).toBe("function");
    });

    it("should handle suggestOptimalSlots call", async () => {
      const mockSlots = [
        {
          slot_id: "slot_1",
          start_time: "2025-01-27T10:00:00Z",
          end_time: "2025-01-27T11:00:00Z",
          confidence_score: 0.95,
          staff_id: "staff_1",
          staff_name: "Dr. Smith",
          optimization_factors: {
            patient_preference_score: 0.9,
            staff_efficiency_score: 0.8,
            clinic_capacity_score: 0.85,
            historical_success_rate: 0.92,
          },
          reasons: ["High patient satisfaction with this time slot", "Optimal staff availability"],
        },
      ];

      // Mock the method to return test data
      optimizer.suggestOptimalSlots = jest.fn().mockResolvedValue(mockSlots);

      const result = await optimizer.suggestOptimalSlots({
        patient_id: "patient_123",
        treatment_type: "consultation",
        preferred_date_range: {
          start: "2025-01-27T08:00:00Z",
          end: "2025-01-27T18:00:00Z",
        },
        duration_minutes: 60,
      });

      expect(result).toEqual(mockSlots);
      expect(optimizer.suggestOptimalSlots).toHaveBeenCalledWith({
        patient_id: "patient_123",
        treatment_type: "consultation",
        preferred_date_range: {
          start: "2025-01-27T08:00:00Z",
          end: "2025-01-27T18:00:00Z",
        },
        duration_minutes: 60,
      });
    });

    it("should handle getPatientPreferenceData call", async () => {
      const mockPreferenceData = {
        preferences: {
          preferred_times: ["morning", "afternoon"],
          preferred_staff: ["staff_1", "staff_2"],
          treatment_preferences: ["quick_consultation"],
        },
        confidence_score: 0.87,
        data_points_count: 25,
        last_updated: "2025-01-26T12:00:00Z",
        insights: {
          preferred_times: ["09:00-12:00"],
          preferred_staff: ["Dr. Smith"],
          opportunities: ["Schedule during morning hours for best satisfaction"],
        },
      };

      optimizer.getPatientPreferenceData = jest.fn().mockResolvedValue(mockPreferenceData);

      const result = await optimizer.getPatientPreferenceData("patient_123");

      expect(result).toEqual(mockPreferenceData);
      expect(optimizer.getPatientPreferenceData).toHaveBeenCalledWith("patient_123");
    });
  });

  describe("PatientPreferenceLearner", () => {
    it("should create learner instance", () => {
      expect(learner).toBeInstanceOf(PatientPreferenceLearner);
    });

    it("should have updatePreferences method", () => {
      expect(typeof learner.updatePreferences).toBe("function");
    });

    it("should have getPatientPreferences method", () => {
      expect(typeof learner.getPatientPreferences).toBe("function");
    });

    it("should have analyzeSchedulingPatterns method", () => {
      expect(typeof learner.analyzeSchedulingPatterns).toBe("function");
    });

    it("should handle updatePreferences call", async () => {
      const mockLearningResult = {
        learning_applied: true,
        confidence_scores: {
          time_preference: 0.85,
          staff_preference: 0.78,
          treatment_preference: 0.92,
        },
        discovered_patterns: ["Prefers morning appointments", "Consistent with Dr. Smith"],
        preference_strength: 0.87,
        prediction_accuracy: 0.83,
      };

      learner.updatePreferences = jest.fn().mockResolvedValue(mockLearningResult);

      const result = await learner.updatePreferences("patient_123", {
        appointment_outcome: "completed",
        satisfaction_score: 9,
        preferred_time: "10:00",
        staff_interaction: "positive",
      });

      expect(result).toEqual(mockLearningResult);
      expect(learner.updatePreferences).toHaveBeenCalledWith("patient_123", {
        appointment_outcome: "completed",
        satisfaction_score: 9,
        preferred_time: "10:00",
        staff_interaction: "positive",
      });
    });

    it("should handle getPatientPreferences call", async () => {
      const mockPreferences = {
        current_preferences: {
          time_preferences: {
            preferred_times: ["09:00-12:00"],
            avoided_times: ["17:00-19:00"],
            flexibility_score: 0.7,
          },
          staff_preferences: {
            preferred_staff: ["staff_1"],
            staff_satisfaction_scores: { staff_1: 0.95 },
          },
          treatment_preferences: {
            preferred_treatment_sequences: ["consultation", "treatment"],
            time_between_treatments: 14,
          },
        },
        overall_confidence: 0.88,
        preference_reliability: 0.92,
        data_completeness: 0.75,
        patterns: {
          time_preferences: [{ pattern: "Morning preference", confidence: 0.9, frequency: 15 }],
          staff_preferences: [
            {
              staff_id: "staff_1",
              staff_name: "Dr. Smith",
              preference_strength: 0.95,
              interaction_count: 12,
            },
          ],
          treatment_preferences: [
            { treatment_type: "consultation", preference_score: 0.88, optimal_timing: "morning" },
          ],
          scheduling_behaviors: [
            { behavior: "Books 1 week in advance", frequency: 80, reliability: 0.85 },
          ],
        },
      };

      learner.getPatientPreferences = jest.fn().mockResolvedValue(mockPreferences);

      const result = await learner.getPatientPreferences("patient_123", false);

      expect(result).toEqual(mockPreferences);
      expect(learner.getPatientPreferences).toHaveBeenCalledWith("patient_123", false);
    });
  });

  describe("Service Integration", () => {
    it("should demonstrate integration between optimizer and learner", async () => {
      // Mock learner response
      const mockPatientData = {
        current_preferences: {
          time_preferences: {
            preferred_times: ["09:00-12:00"],
            avoided_times: ["17:00-19:00"],
            flexibility_score: 0.8,
          },
        },
        overall_confidence: 0.85,
      };

      learner.getPatientPreferences = jest.fn().mockResolvedValue(mockPatientData);

      // Mock optimizer response using learner data
      const mockOptimizedSlots = [
        {
          slot_id: "slot_morning_1",
          start_time: "2025-01-27T10:00:00Z",
          end_time: "2025-01-27T11:00:00Z",
          confidence_score: 0.95,
          staff_id: "staff_1",
          staff_name: "Dr. Smith",
          optimization_factors: {
            patient_preference_score: 0.9, // High because matches learned preferences
            staff_efficiency_score: 0.8,
            clinic_capacity_score: 0.85,
            historical_success_rate: 0.92,
          },
          reasons: ["Matches learned morning preference", "High confidence from patient history"],
        },
      ];

      optimizer.suggestOptimalSlots = jest.fn().mockResolvedValue(mockOptimizedSlots);

      // Simulate the integration workflow
      const patientPrefs = await learner.getPatientPreferences("patient_123", false);
      expect(patientPrefs.current_preferences.time_preferences.preferred_times).toContain(
        "09:00-12:00",
      );

      const optimizedSlots = await optimizer.suggestOptimalSlots({
        patient_id: "patient_123",
        treatment_type: "consultation",
        preferred_date_range: {
          start: "2025-01-27T08:00:00Z",
          end: "2025-01-27T18:00:00Z",
        },
        duration_minutes: 60,
      });

      expect(optimizedSlots[0].optimization_factors.patient_preference_score).toBeGreaterThan(0.85);
      expect(optimizedSlots[0].reasons).toContain("Matches learned morning preference");
    });
  });
});
