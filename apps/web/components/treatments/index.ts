/**
 * Brazilian Aesthetic Medicine Treatment Components
 * Comprehensive system for aesthetic medicine workflows with LGPD/CFM compliance
 */

// Hook exports
export { useTreatments } from "@/hooks/useTreatments";
// Type exports for convenience
export type {
  AestheticTreatmentCategory,
  CFMComplianceStatus,
  LGPDPhotoConsentStatus,
  PatientConsent,
  TreatmentPhoto,
  TreatmentPlan,
  TreatmentPlanType,
  TreatmentProgress,
  TreatmentProtocol,
  TreatmentSession,
  TreatmentStatus,
} from "@/types/treatments";
// Main treatment components
export { default as AestheticTreatmentPlan } from "./AestheticTreatmentPlan";
export { default as BeforeAfterSecureGallery } from "./BeforeAfterSecureGallery";
export { default as CosmeticConsentBrazilian } from "./CosmeticConsentBrazilian";

/**
 * Component Usage Examples:
 *
 * // Treatment Plan Display
 * <AestheticTreatmentPlan
 *   treatmentPlan={plan}
 *   variant="card"
 *   onViewProgress={handleViewProgress}
 *   onScheduleSession={handleScheduleSession}
 * />
 *
 * // LGPD/CFM Consent Management
 * <CosmeticConsentBrazilian
 *   treatmentPlan={plan}
 *   mode="new"
 *   onConsentGranted={handleConsentGranted}
 * />
 *
 * // Secure Photo Gallery
 * <BeforeAfterSecureGallery
 *   treatmentSessionId={sessionId}
 *   photos={photos}
 *   consentStatus="granted"
 *   canEdit={true}
 *   onPhotoUpload={handlePhotoUpload}
 * />
 *
 * // Data Hook
 * const {
 *   treatmentPlans,
 *   activeTreatments,
 *   loading,
 *   error,
 *   searchTreatments,
 *   filterByCategory
 * } = useTreatments();
 */
