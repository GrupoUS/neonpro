/**
 * Batch Prediction Helper Functions - Refactored
 *
 * IMPROVEMENTS:
 * ✅ Removed unnecessary async from pure calculation functions
 * ✅ Added proper input validation and error handling
 * ✅ Improved function names for clarity
 * ✅ Added JSDoc documentation
 * ✅ Consistent return types and error handling
 * ✅ Applied KISS principles
 */

// =============================================================================
// CORE CALCULATION UTILITIES
// =============================================================================

/**
 * Extracts error message from unknown error type
 * Safe error message extraction with fallback
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
}

/**
 * Calculates success rate as percentage
 * Handles division by zero gracefully
 */
export function calculateSuccessRate(completed: number, total: number): number {
  if (total === 0 || completed < 0 || total < 0) {
    return 0;
  }

  if (completed > total) {
    return 100; // Cap at 100% for invalid inputs
  }

  return Math.round((completed / total) * 100);
}

/**
 * Calculates average processing time from array of times
 * Returns 0 for empty arrays, handles edge cases
 */
export function calculateAverageProcessingTime(times: readonly number[]): number {
  if (times.length === 0) {
    return 0;
  }

  // Filter out negative times (invalid data)
  const validTimes = times.filter(time => time >= 0);

  if (validTimes.length === 0) {
    return 0;
  }

  const sum = validTimes.reduce((total, time) => total + time, 0);
  return Math.round(sum / validTimes.length);
}

/**
 * Calculates theoretical throughput per hour
 * Based on average processing time and total processed items
 */
export function calculateThroughputPerHour(
  totalProcessed: number,
  avgProcessingTimeMs: number,
): number {
  if (totalProcessed <= 0 || avgProcessingTimeMs <= 0) {
    return 0;
  }

  // Convert milliseconds to hours: 1 hour = 3,600,000 ms
  const itemsPerHour = (totalProcessed / avgProcessingTimeMs) * 3_600_000;
  return Math.round(itemsPerHour);
}

/**
 * Calculates average predictions per batch job
 * Returns 0 for edge cases
 */
export function calculateAveragePredictionsPerJob(
  totalProcessed: number,
  jobCount: number,
): number {
  if (jobCount <= 0 || totalProcessed < 0) {
    return 0;
  }

  return Math.round(totalProcessed / jobCount);
}

// =============================================================================
// DATE UTILITY FUNCTIONS
// =============================================================================

/**
 * Gets date string for N hours from now
 * Returns date in YYYY-MM-DD format
 */
export function getDatePlusHours(hours: number): string {
  if (hours < 0) {
    throw new Error("Hours must be non-negative");
  }

  const futureDate = new Date(Date.now() + hours * 60 * 60 * 1000);
  return futureDate.toISOString().split("T")[0];
}

/**
 * Gets date string for N days from now
 * Returns date in YYYY-MM-DD format
 */
export function getDatePlusDays(days: number): string {
  if (days < 0) {
    throw new Error("Days must be non-negative");
  }

  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return futureDate.toISOString().split("T")[0];
}

/**
 * Gets today's date string
 * Returns date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

// =============================================================================
// STATUS AND ERROR UTILITIES
// =============================================================================

/**
 * Checks if error array contains any errors
 * Type-safe error array validation
 */
export function hasErrors(errors: readonly unknown[]): boolean {
  return Array.isArray(errors) && errors.length > 0;
}

/**
 * Returns appropriate HTTP status code based on error presence
 * 207 Multi-Status for partial success, 201 Created for full success
 */
export function getStatusCode(hasErrors: boolean): number {
  return hasErrors ? 207 : 201;
}

/**
 * Validates processing time array
 * Filters out invalid times and returns clean array
 */
export function validateProcessingTimes(times: readonly number[]): number[] {
  return times.filter(time =>
    typeof time === "number"
    && time >= 0
    && !Number.isNaN(time)
    && Number.isFinite(time)
  );
}

/**
 * Calculates processing efficiency metrics
 * Returns comprehensive performance statistics
 */
export interface ProcessingMetrics {
  readonly successRate: number;
  readonly averageProcessingTime: number;
  readonly throughputPerHour: number;
  readonly avgPredictionsPerJob: number;
  readonly efficiency: "high" | "medium" | "low";
}

export function calculateProcessingMetrics(
  completed: number,
  total: number,
  processingTimes: readonly number[],
  jobCount = 1,
): ProcessingMetrics {
  const successRate = calculateSuccessRate(completed, total);
  const validTimes = validateProcessingTimes(processingTimes);
  const averageProcessingTime = calculateAverageProcessingTime(validTimes);
  const throughputPerHour = calculateThroughputPerHour(completed, averageProcessingTime);
  const avgPredictionsPerJob = calculateAveragePredictionsPerJob(completed, jobCount);

  // Determine efficiency level
  let efficiency: "high" | "medium" | "low" = "low";
  if (successRate >= 95 && averageProcessingTime > 0) {
    efficiency = "high";
  } else if (successRate >= 80) {
    efficiency = "medium";
  }

  return {
    successRate,
    averageProcessingTime,
    throughputPerHour,
    avgPredictionsPerJob,
    efficiency,
  };
}
