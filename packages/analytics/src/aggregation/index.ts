/**
 * Analytics Aggregation Module
 *
 * Exports KPI computation functions and related utilities
 * for healthcare analytics aggregation.
 */

export * from "./kpis.ts";
export type { ComputedKPIs, KPIComputationOptions } from "./kpis.ts";
export { computeKPIs, createMockEvents } from "./kpis.ts";
