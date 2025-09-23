/**
 * Healthcare KPI Computation Functions
 *
 * Pure functions for computing Key Performance Indicators from analytics events
 * with comprehensive healthcare metrics, Brazilian compliance, and edge case handling.
 */

import type { AnalyticsEvent } from "../types/base-metrics";
import type { IngestionEvent } from "../types/ingestion";

/**
 * Computed KPIs result structure
 */
export interface ComputedKPIs {
  /** Patient flow and operational metrics */
  patientFlow: {
    totalVisits: number;
    averageWaitTime: number;
    noShowRate: number;
    patientSatisfactionScore: number;
    appointmentUtilization: number;
  };

  /** Clinical quality metrics */
  clinicalQuality: {
    diagnosisAccuracy: number;
    treatmentCompletionRate: number;
    readmissionRate: number;
    emergencyInterventions: number;
    medicationAdherence: number;
  };

  /** Operational efficiency metrics */
  operational: {
    resourceUtilization: number;
    staffEfficiency: number;
    equipmentUsage: number;
    schedulingEfficiency: number;
    averageServiceTime: number;
  };

  /** Financial performance metrics */
  financial: {
    revenuePerPatient: number;
    costPerTreatment: number;
    insuranceClaimSuccessRate: number;
    paymentCollectionRate: number;
    profitMargin: number;
  };

  /** Data quality and system metrics */
  system: {
    dataQualityScore: number;
    complianceScore: number;
    systemUptime: number;
    errorRate: number;
    performanceScore: number;
  };

  /** Computation metadata */
  metadata: {
    computedAt: Date;
    eventCount: number;
    timeRange: {
      start: Date;
      end: Date;
    };
    coverage: {
      totalEvents: number;
      validEvents: number;
      invalidEvents: number;
    };
  };
}

/**
 * KPI computation options
 */
export interface KPIComputationOptions {
  /** Time range for computation */
  timeRange?: {
    start: Date;
    end: Date;
  };

  /** Filter by specific event types */
  eventTypes?: string[];

  /** Filter by source systems */
  sources?: string[];

  /** Include/exclude specific KPI categories */
  categories?: {
    includePatientFlow?: boolean;
    includeClinicalQuality?: boolean;
    includeOperational?: boolean;
    includeFinancial?: boolean;
    includeSystem?: boolean;
  };

  /** Aggregation preferences */
  aggregation?: {
    method: string;
    frequency: string;
  };

  /** Validation options */
  validation?: {
    strictMode?: boolean;
    requireMinEvents?: number;
    validateDataQuality?: boolean;
  };
}

/**
 * Main KPI computation function - processes events and computes healthcare KPIs
 *
 * @param events - Array of analytics/ingestion events to process
 * @param options - Computation options and filters
 * @returns Computed KPIs with metadata
 */
export function computeKPIs(
  events: (AnalyticsEvent | IngestionEvent)[],
  options?: KPIComputationOptions,
): ComputedKPIs {
  // Input validation
  if (!Array.isArray(events)) {
    throw new Error("Events must be an array");
  }

  // Filter events based on options
  const filteredEvents = filterEvents(events, options);

  // Validate minimum event count if required
  if (
    options?.validation?.requireMinEvents &&
    filteredEvents.length < options.validation.requireMinEvents
  ) {
    throw new Error(
      `Insufficient events: ${filteredEvents.length} < ${options.validation.requireMinEvents}`,
    );
  }

  // Compute time range
  const timeRange = computeTimeRange(filteredEvents, options);

  // Compute each KPI category
  const patientFlow = computePatientFlowKPIs(filteredEvents, options);
  const clinicalQuality = computeClinicalQualityKPIs(filteredEvents, options);
  const operational = computeOperationalKPIs(filteredEvents, options);
  const financial = computeFinancialKPIs(filteredEvents, options);
  const system = computeSystemKPIs(filteredEvents, options);

  // Compute metadata
  const metadata = computeMetadata(events, filteredEvents, timeRange);

  return {
    patientFlow,
    clinicalQuality,
    operational,
    financial,
    system,
    metadata,
  };
}

/**
 * Filter events based on computation options
 */
function filterEvents(
  events: (AnalyticsEvent | IngestionEvent)[],
  options?: KPIComputationOptions,
): (AnalyticsEvent | IngestionEvent)[] {
  let filtered = [...events];

  // Filter by time range
  if (options?.timeRange) {
    filtered = filtered.filter(
      (event) =>
        event.timestamp >= options.timeRange!.start &&
        event.timestamp <= options.timeRange!.end,
    );
  }

  // Filter by event types
  if (options?.eventTypes && options.eventTypes.length > 0) {
    filtered = filtered.filter((event) =>
      options.eventTypes!.includes(event.type),
    );
  }

  // Filter by sources (for IngestionEvents)
  if (options?.sources && options.sources.length > 0) {
    filtered = filtered.filter((event) => {
      if (
        "source" in event &&
        typeof event.source === "object" &&
        event.source !== null
      ) {
        return options.sources!.includes((event.source as any).sourceId);
      }
      return true;
    });
  }

  return filtered;
}

/**
 * Compute time range from events
 */
function computeTimeRange(
  events: (AnalyticsEvent | IngestionEvent)[],
  options?: KPIComputationOptions,
): { start: Date; end: Date } {
  if (options?.timeRange) {
    return options.timeRange;
  }

  if (events.length === 0) {
    const now = new Date();
    return { start: now, end: now };
  }

  const timestamps = events.map((e) => e.timestamp);
  return {
    start: new Date(_Math.min(...timestamps.map((t) => t.getTime()))),
    end: new Date(_Math.max(...timestamps.map((t) => t.getTime()))),
  };
}

/**
 * Compute patient flow KPIs
 */
function computePatientFlowKPIs(
  events: (AnalyticsEvent | IngestionEvent)[],
  options?: KPIComputationOptions,
) {
  if (options?.categories?.includePatientFlow === false) {
    return getEmptyPatientFlowKPIs();
  }

  // Extract patient-related events
  const patientEvents = events.filter(
    (e) =>
      e.type.includes("patient") ||
      e.type.includes("appointment") ||
      e.type.includes("visit"),
  );

  // Compute total visits
  const totalVisits = patientEvents.filter(
    (e) => e.type === "patient_visit" || e.type === "appointment_completed",
  ).length;

  // Compute average wait time (mock calculation)
  const waitTimeEvents = patientEvents.filter((e) => e.properties.waitTime);
  const averageWaitTime =
    waitTimeEvents.length > 0
      ? waitTimeEvents.reduce(
          (sum, _e) => sum + (e.properties.waitTime as number),
          0,
        ) / waitTimeEvents.length
      : 0;

  // Compute no-show rate
  const appointmentEvents = patientEvents.filter((e) =>
    e.type.includes("appointment"),
  );
  const noShowEvents = appointmentEvents.filter(
    (e) => e.properties.status === "no_show",
  );
  const noShowRate =
    appointmentEvents.length > 0
      ? (noShowEvents.length / appointmentEvents.length) * 100
      : 0;

  // Compute patient satisfaction (mock from feedback events)
  const satisfactionEvents = events.filter(
    (e) => e.type === "patient_feedback",
  );
  const patientSatisfactionScore =
    satisfactionEvents.length > 0
      ? satisfactionEvents.reduce(
          (sum, _e) => sum + ((e.properties.rating as number) || 0),
          0,
        ) / satisfactionEvents.length
      : 0;

  // Compute appointment utilization
  const scheduledAppointments = appointmentEvents.filter(
    (e) => e.properties.status === "scheduled",
  );
  const completedAppointments = appointmentEvents.filter(
    (e) => e.properties.status === "completed",
  );
  const appointmentUtilization =
    scheduledAppointments.length > 0
      ? (completedAppointments.length / scheduledAppointments.length) * 100
      : 0;

  return {
    totalVisits,
    averageWaitTime,
    noShowRate,
    patientSatisfactionScore,
    appointmentUtilization,
  };
}

/**
 * Compute clinical quality KPIs
 */
function computeClinicalQualityKPIs(
  events: (AnalyticsEvent | IngestionEvent)[],
  options?: KPIComputationOptions,
) {
  if (options?.categories?.includeClinicalQuality === false) {
    return getEmptyClinicalQualityKPIs();
  }

  // Extract clinical events
  const clinicalEvents = events.filter(
    (e) =>
      e.type.includes("diagnosis") ||
      e.type.includes("treatment") ||
      e.type.includes("medication") ||
      e.type.includes("clinical"),
  );

  // Compute diagnosis accuracy (mock calculation)
  const diagnosisEvents = clinicalEvents.filter((e) =>
    e.type.includes("diagnosis"),
  );
  const accurateDiagnoses = diagnosisEvents.filter(
    (e) => e.properties.accuracy === "correct",
  );
  const diagnosisAccuracy =
    diagnosisEvents.length > 0
      ? (accurateDiagnoses.length / diagnosisEvents.length) * 100
      : 0;

  // Compute treatment completion rate
  const treatmentEvents = clinicalEvents.filter((e) =>
    e.type.includes("treatment"),
  );
  const completedTreatments = treatmentEvents.filter(
    (e) => e.properties.status === "completed",
  );
  const treatmentCompletionRate =
    treatmentEvents.length > 0
      ? (completedTreatments.length / treatmentEvents.length) * 100
      : 0;

  // Compute readmission rate
  const admissionEvents = events.filter((e) => e.type === "patient_admission");
  const readmissionEvents = admissionEvents.filter(
    (e) => e.properties.readmission === true,
  );
  const readmissionRate =
    admissionEvents.length > 0
      ? (readmissionEvents.length / admissionEvents.length) * 100
      : 0;

  // Compute emergency interventions
  const emergencyInterventions = events.filter(
    (e) =>
      e.type === "emergency_intervention" ||
      e.properties.urgency === "emergency",
  ).length;

  // Compute medication adherence
  const medicationEvents = events.filter((e) => e.type.includes("medication"));
  const adherentMedication = medicationEvents.filter(
    (e) => e.properties.adherence === "high",
  );
  const medicationAdherence =
    medicationEvents.length > 0
      ? (adherentMedication.length / medicationEvents.length) * 100
      : 0;

  return {
    diagnosisAccuracy,
    treatmentCompletionRate,
    readmissionRate,
    emergencyInterventions,
    medicationAdherence,
  };
}

/**
 * Compute operational KPIs
 */
function computeOperationalKPIs(
  events: (AnalyticsEvent | IngestionEvent)[],
  options?: KPIComputationOptions,
) {
  if (options?.categories?.includeOperational === false) {
    return getEmptyOperationalKPIs();
  }

  // Extract operational events
  const operationalEvents = events.filter(
    (e) =>
      e.type.includes("resource") ||
      e.type.includes("staff") ||
      e.type.includes("equipment") ||
      e.type.includes("schedule"),
  );

  // Compute resource utilization
  const resourceEvents = operationalEvents.filter((e) =>
    e.type.includes("resource"),
  );
  const utilizationSum = resourceEvents.reduce(
    (sum, _e) => sum + ((e.properties.utilization as number) || 0),
    0,
  );
  const resourceUtilization =
    resourceEvents.length > 0 ? utilizationSum / resourceEvents.length : 0;

  // Compute staff efficiency
  const staffEvents = operationalEvents.filter((e) => e.type.includes("staff"));
  const efficiencySum = staffEvents.reduce(
    (sum, _e) => sum + ((e.properties.efficiency as number) || 0),
    0,
  );
  const staffEfficiency =
    staffEvents.length > 0 ? efficiencySum / staffEvents.length : 0;

  // Compute equipment usage
  const equipmentEvents = operationalEvents.filter((e) =>
    e.type.includes("equipment"),
  );
  const usageSum = equipmentEvents.reduce(
    (sum, _e) => sum + ((e.properties.usage as number) || 0),
    0,
  );
  const equipmentUsage =
    equipmentEvents.length > 0 ? usageSum / equipmentEvents.length : 0;

  // Compute scheduling efficiency
  const scheduleEvents = operationalEvents.filter((e) =>
    e.type.includes("schedule"),
  );
  const schedulingSum = scheduleEvents.reduce(
    (sum, _e) => sum + ((e.properties.efficiency as number) || 0),
    0,
  );
  const schedulingEfficiency =
    scheduleEvents.length > 0 ? schedulingSum / scheduleEvents.length : 0;

  // Compute average service time
  const serviceEvents = events.filter((e) => e.properties.serviceTime);
  const serviceTimeSum = serviceEvents.reduce(
    (sum, _e) => sum + (e.properties.serviceTime as number),
    0,
  );
  const averageServiceTime =
    serviceEvents.length > 0 ? serviceTimeSum / serviceEvents.length : 0;

  return {
    resourceUtilization,
    staffEfficiency,
    equipmentUsage,
    schedulingEfficiency,
    averageServiceTime,
  };
}

/**
 * Compute financial KPIs
 */
function computeFinancialKPIs(
  events: (AnalyticsEvent | IngestionEvent)[],
  options?: KPIComputationOptions,
) {
  if (options?.categories?.includeFinancial === false) {
    return getEmptyFinancialKPIs();
  }

  // Extract financial events
  const financialEvents = events.filter(
    (e) =>
      e.type.includes("payment") ||
      e.type.includes("revenue") ||
      e.type.includes("cost") ||
      e.type.includes("billing") ||
      e.type.includes("insurance"),
  );

  // Compute revenue per patient
  const revenueEvents = financialEvents.filter((e) =>
    e.type.includes("revenue"),
  );
  const totalRevenue = revenueEvents.reduce(
    (sum, _e) => sum + ((e.properties.amount as number) || 0),
    0,
  );
  const uniquePatients = new Set(
    _revenueEvents.map((e) => e.properties.patientId),
  ).size;
  const revenuePerPatient =
    uniquePatients > 0 ? totalRevenue / uniquePatients : 0;

  // Compute cost per treatment
  const costEvents = financialEvents.filter((e) => e.type.includes("cost"));
  const totalCosts = costEvents.reduce(
    (sum, _e) => sum + ((e.properties.amount as number) || 0),
    0,
  );
  const treatmentCount = costEvents.length;
  const costPerTreatment = treatmentCount > 0 ? totalCosts / treatmentCount : 0;

  // Compute insurance claim success rate
  const claimEvents = financialEvents.filter((e) =>
    e.type.includes("insurance_claim"),
  );
  const successfulClaims = claimEvents.filter(
    (e) => e.properties.status === "approved",
  );
  const insuranceClaimSuccessRate =
    claimEvents.length > 0
      ? (successfulClaims.length / claimEvents.length) * 100
      : 0;

  // Compute payment collection rate
  const paymentEvents = financialEvents.filter((e) =>
    e.type.includes("payment"),
  );
  const collectedPayments = paymentEvents.filter(
    (e) => e.properties.status === "collected",
  );
  const paymentCollectionRate =
    paymentEvents.length > 0
      ? (collectedPayments.length / paymentEvents.length) * 100
      : 0;

  // Compute profit margin
  const profitMargin =
    totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

  return {
    revenuePerPatient,
    costPerTreatment,
    insuranceClaimSuccessRate,
    paymentCollectionRate,
    profitMargin,
  };
}

/**
 * Compute system KPIs
 */
function computeSystemKPIs(
  events: (AnalyticsEvent | IngestionEvent)[],
  options?: KPIComputationOptions,
) {
  if (options?.categories?.includeSystem === false) {
    return getEmptySystemKPIs();
  }

  // Extract system events
  const systemEvents = events.filter(
    (e) =>
      e.type.includes("system") ||
      e.type.includes("error") ||
      e.type.includes("performance") ||
      "processing" in e, // IngestionEvents
  );

  // Compute data quality score from IngestionEvents
  const ingestionEvents = events.filter(
    (e) => "quality" in e,
  ) as IngestionEvent[];
  const qualitySum = ingestionEvents.reduce((sum, _e) => {
    const total = e.quality.validRecords + e.quality.invalidRecords;
    return total > 0 ? sum + e.quality.validRecords / total : sum;
  }, 0);
  const dataQualityScore =
    ingestionEvents.length > 0
      ? (qualitySum / ingestionEvents.length) * 100
      : 100;

  // Compute compliance score (mock calculation)
  const complianceEvents = events.filter((e) => e.properties.compliance);
  const complianceSum = complianceEvents.reduce(
    (sum, _e) => sum + (e.properties.compliance as number),
    0,
  );
  const complianceScore =
    complianceEvents.length > 0 ? complianceSum / complianceEvents.length : 100;

  // Compute system uptime
  const uptimeEvents = systemEvents.filter((e) => e.type.includes("uptime"));
  const uptimeSum = uptimeEvents.reduce(
    (sum, _e) => sum + ((e.properties.uptime as number) || 100),
    0,
  );
  const systemUptime =
    uptimeEvents.length > 0 ? uptimeSum / uptimeEvents.length : 100;

  // Compute error rate
  const errorEvents = systemEvents.filter((e) => e.type.includes("error"));
  const totalSystemEvents = systemEvents.length;
  const errorRate =
    totalSystemEvents > 0 ? (errorEvents.length / totalSystemEvents) * 100 : 0;

  // Compute performance score
  const performanceEvents = systemEvents.filter((e) =>
    e.type.includes("performance"),
  );
  const performanceSum = performanceEvents.reduce(
    (sum, _e) => sum + ((e.properties.score as number) || 100),
    0,
  );
  const performanceScore =
    performanceEvents.length > 0
      ? performanceSum / performanceEvents.length
      : 100;

  return {
    dataQualityScore,
    complianceScore,
    systemUptime,
    errorRate,
    performanceScore,
  };
}

/**
 * Compute metadata for the KPI computation
 */
function computeMetadata(
  originalEvents: (AnalyticsEvent | IngestionEvent)[],
  filteredEvents: (AnalyticsEvent | IngestionEvent)[],
  timeRange: { start: Date; end: Date },
) {
  const validEvents = filteredEvents.filter(
    (e) => e.id && e.type && e.timestamp,
  );
  const invalidEvents = filteredEvents.length - validEvents.length;

  return {
    computedAt: new Date(),
    eventCount: filteredEvents.length,
    timeRange,
    coverage: {
      totalEvents: originalEvents.length,
      validEvents: validEvents.length,
      invalidEvents,
    },
  };
}

// Helper functions for empty KPI structures
function getEmptyPatientFlowKPIs() {
  return {
    totalVisits: 0,
    averageWaitTime: 0,
    noShowRate: 0,
    patientSatisfactionScore: 0,
    appointmentUtilization: 0,
  };
}

function getEmptyClinicalQualityKPIs() {
  return {
    diagnosisAccuracy: 0,
    treatmentCompletionRate: 0,
    readmissionRate: 0,
    emergencyInterventions: 0,
    medicationAdherence: 0,
  };
}

function getEmptyOperationalKPIs() {
  return {
    resourceUtilization: 0,
    staffEfficiency: 0,
    equipmentUsage: 0,
    schedulingEfficiency: 0,
    averageServiceTime: 0,
  };
}

function getEmptyFinancialKPIs() {
  return {
    revenuePerPatient: 0,
    costPerTreatment: 0,
    insuranceClaimSuccessRate: 0,
    paymentCollectionRate: 0,
    profitMargin: 0,
  };
}

function getEmptySystemKPIs() {
  return {
    dataQualityScore: 0,
    complianceScore: 0,
    systemUptime: 0,
    errorRate: 0,
    performanceScore: 0,
  };
}

/**
 * Utility function to create mock events for testing
 */
export function createMockEvents(count: number = 10): AnalyticsEvent[] {
  const eventTypes = [
    "patient_visit",
    "appointment_completed",
    "patient_feedback",
    "diagnosis_made",
    "treatment_started",
    "payment_received",
    "insurance_claim",
    "system_performance",
    "error_occurred",
    "staff_activity",
  ];

  const events: AnalyticsEvent[] = [];

  for (let i = 0; i < count; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    events.push({
      id: `mock_event_${i + 1}`,
      type: eventType,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
      _userId: `user_${Math.floor(Math.random() * 100)}`,
      sessionId: `session_${Math.floor(Math.random() * 50)}`,
      properties: generateMockProperties(eventType),
      _context: {
        userAgent: "Healthcare System",
        ip: "127.0.0.1",
      },
    });
  }

  return events;
}

/**
 * Generate mock properties based on event type
 */
function generateMockProperties(eventType: string): Record<string, unknown> {
  switch (eventType) {
    case "patient_visit":
      return {
        patientId: `patient_${Math.floor(Math.random() * 1000)}`,
        waitTime: Math.random() * 60,
        serviceTime: Math.random() * 30 + 10,
      };

    case "appointment_completed":
      return {
        patientId: `patient_${Math.floor(Math.random() * 1000)}`,
        status: Math.random() > 0.1 ? "completed" : "no_show",
      };

    case "patient_feedback":
      return {
        patientId: `patient_${Math.floor(Math.random() * 1000)}`,
        rating: Math.floor(Math.random() * 5) + 1,
      };

    case "diagnosis_made":
      return {
        patientId: `patient_${Math.floor(Math.random() * 1000)}`,
        accuracy: Math.random() > 0.2 ? "correct" : "incorrect",
      };

    case "payment_received":
      return {
        patientId: `patient_${Math.floor(Math.random() * 1000)}`,
        amount: Math.random() * 500 + 50,
        status: Math.random() > 0.1 ? "collected" : "pending",
      };

    case "system_performance":
      return {
        score: Math.random() * 40 + 60, // 60-100 range
        uptime: Math.random() * 10 + 90, // 90-100 range
      };

    default:
      return {
        value: Math.random() * 100,
      };
  }
}
