// Brazilian Healthcare Compliance Components - Index
// Centralized exports for all compliance components

export { default as CFMValidator } from "./CFMValidator";
export { default as ANVISATracker } from "./ANVISATracker";

// Re-export compliance managers and utilities
export {
  cfmValidator,
  generateCRMSummary,
  validateBrazilianCPF,
} from "@/lib/compliance/cfm-professional-validation";

export {
  anvisaManager,
  getPrescriptionTypeDescription,
  getControlClassDescription,
} from "@/lib/compliance/anvisa-controlled-substances";

export {
  lgpdManager,
  getPurposeDescription,
  getDataCategoryDescription,
  getLegalBasisDescription,
} from "@/lib/compliance/lgpd-consent-management";

// Re-export all compliance types
export type * from "@/types/compliance";