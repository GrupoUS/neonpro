/**
 * Brazilian Aesthetic Medicine Treatment Components
 * Comprehensive system for aesthetic medicine workflows with LGPD/CFM compliance
 */

// Main treatment components
export { default as AestheticTreatmentPlan } from './AestheticTreatmentPlan';
export { default as CosmeticConsentBrazilian } from './CosmeticConsentBrazilian';
export { default as BeforeAfterSecureGallery } from './BeforeAfterSecureGallery';

// Type exports for convenience
export type {
  TreatmentPlan,
  TreatmentSession,
  TreatmentProtocol,
  TreatmentPhoto,
  PatientConsent,
  TreatmentProgress,
  AestheticTreatmentCategory,
  TreatmentStatus,
  TreatmentPlanType,
  CFMComplianceStatus,
  LGPDPhotoConsentStatus,
} from '@/types/treatments';

// Hook exports
export { useTreatments } from '@/hooks/useTreatments';

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