// AR Simulator Validation Schemas

import { z } from "zod";
import { VALIDATION_LIMITS } from "./ar-simulator-constants";

const CreateSimulationSchema = z.object({
  patientId: z
    .string()
    .min(VALIDATION_LIMITS.PATIENT_ID_MIN_LENGTH, "Patient ID is required"),
  preferences: z.object({
    avoidanceList: z.array(z.string()).optional().default([]),
    concerns: z.array(z.string()),
    goals: z.array(z.string()),
    intensityLevel: z.enum(["subtle", "moderate", "dramatic"]),
    referenceImages: z.array(z.string()).optional(),
  }),
  priority: z.enum(["low", "normal", "high"]).optional().default("normal"),
  treatmentParameters: z.object({
    areas: z.array(
      z.object({
        coordinates: z
          .array(
            z.object({
              coordinateX: z.number(),
              coordinateY: z.number(),
              coordinateZ: z.number(),
            }),
          )
          .optional()
          .default([]),
        name: z.string(),
        priority: z
          .number()
          .min(VALIDATION_LIMITS.MIN_PRIORITY)
          .max(VALIDATION_LIMITS.MAX_PRIORITY),
        severity: z
          .number()
          .min(VALIDATION_LIMITS.MIN_SEVERITY)
          .max(VALIDATION_LIMITS.MAX_SEVERITY),
        technique: z.string(),
        units: z.number().optional(),
      }),
    ),
    combinedTreatments: z.array(z.string()).optional().default([]),
    expectedUnits: z.number().optional(),
    sessionCount: z
      .number()
      .min(VALIDATION_LIMITS.MIN_SESSIONS)
      .max(VALIDATION_LIMITS.MAX_SESSIONS),
    technique: z.string(),
    treatmentType: z.enum([
      "botox",
      "filler",
      "facial_harmonization",
      "thread_lift",
      "peeling",
    ]),
  }),
  treatmentType: z.enum([
    "botox",
    "filler",
    "facial_harmonization",
    "thread_lift",
    "peeling",
  ]),
});

const CompareSimulationsSchema = z.object({
  comparisonType: z.enum([
    "before_after",
    "treatment_options",
    "timeline_progression",
  ]),
  simulationIds: z
    .array(z.string())
    .min(
      VALIDATION_LIMITS.MIN_SIMULATIONS_COMPARE,
      "At least 2 simulations required for comparison",
    )
    .max(
      VALIDATION_LIMITS.MAX_SIMULATIONS_COMPARE,
      "Maximum 5 simulations can be compared",
    ),
});

export { CompareSimulationsSchema, CreateSimulationSchema };
