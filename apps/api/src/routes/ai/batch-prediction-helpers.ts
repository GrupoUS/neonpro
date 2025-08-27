// Helper functions for batch prediction endpoints

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function calculateSuccessRate(completed: number, total: number): number {
  if (total === 0) {
    return 0;
  }
  return Math.round((completed / total) * 100);
}

export function calculateAverageProcessingTime(times: number[]): number {
  if (times.length === 0) {
    return 0;
  }
  return times.reduce((sum, time) => sum + time, 0) / times.length;
}

export function calculateThroughputPerHour(
  totalProcessed: number,
  avgProcessingTime: number,
): number {
  if (totalProcessed === 0 || avgProcessingTime === 0) {
    return 0;
  }
  return Math.round((totalProcessed / avgProcessingTime) * 3_600_000);
}

export function calculateAveragePredictionsPerJob(
  totalProcessed: number,
  jobCount: number,
): number {
  if (jobCount === 0) {
    return 0;
  }
  return Math.round(totalProcessed / jobCount);
}

export function getDatePlusHours(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

export function getDatePlusDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function hasErrors(errors: unknown[]): boolean {
  return errors.length > 0;
}

export function getStatusCode(hasErrors: boolean): number {
  return hasErrors ? 207 : 201;
}
