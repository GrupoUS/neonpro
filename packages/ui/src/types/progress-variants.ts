/**
 * Progress Component Variant Functions
 * Type-safe variant getters for progress components
 */

import type { ProgressVariant } from "./badge-variants";

export function getPhaseColor(): ProgressVariant {
  return "default";
}

export function getComplianceVariant(): ProgressVariant {
  return "success";
}

export function getStageVariant(): ProgressVariant {
  return "medical";
}
