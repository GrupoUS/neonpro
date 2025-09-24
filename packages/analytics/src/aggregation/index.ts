/**
 * Analytics Aggregation Module
 *
 * Exports KPI computation functions and related utilities
 * for healthcare analytics aggregation.
 */

export * from './kpis';
export type { ComputedKPIs, KPIComputationOptions } from './kpis';
export { computeKPIs, createMockEvents } from './kpis';
