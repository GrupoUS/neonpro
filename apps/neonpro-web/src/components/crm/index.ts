/**
 * CRM Components Index
 * Clean exports for Customer Relationship Management components
 * Created: January 24, 2025
 */

export { CustomerAnalytics } from "./CustomerAnalytics";
// Main Components
export { CustomerManagement } from "./CustomerManagement";
export { LeadTracking } from "./LeadTracking";

// Utility Functions and Types
export {
  type Appointment,
  // TypeScript Interfaces
  type Customer,
  type CustomerSegment,
  calculateAverageAppointmentValue,
  // Customer Value Functions
  calculateCustomerLifetimeValue,
  calculateDaysSinceLastVisit,
  // Lead Scoring Functions
  calculateLeadScore,
  calculateRetentionRate,
  categorizeLeadPriority,
  // Customer Lifecycle Functions
  determineCustomerLifecycle,
  // Follow-up Management Functions
  determineNextFollowUpDate,
  generateFollowUpMessage,
  type LeadScore,
  predictChurnRisk,
  type RetentionAnalysis,
  rankCustomersByValue,
  type SegmentCriteria,
  // Analytics and Segmentation Functions
  segmentCustomers,
} from "./utils";

// Export default object for convenience
export default {
  CustomerManagement,
  LeadTracking,
  CustomerAnalytics,
  // Utility functions
  calculateLeadScore,
  categorizeLeadPriority,
  determineCustomerLifecycle,
  calculateDaysSinceLastVisit,
  predictChurnRisk,
  calculateCustomerLifetimeValue,
  calculateAverageAppointmentValue,
  rankCustomersByValue,
  determineNextFollowUpDate,
  generateFollowUpMessage,
  segmentCustomers,
  calculateRetentionRate,
};
