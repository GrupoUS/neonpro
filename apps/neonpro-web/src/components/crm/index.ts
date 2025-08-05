/**
 * CRM Components Index
 * Clean exports for Customer Relationship Management components
 * Created: January 24, 2025
 */

// Main Components
export { CustomerManagement } from "./CustomerManagement";
export { LeadTracking } from "./LeadTracking";
export { CustomerAnalytics } from "./CustomerAnalytics";

// Utility Functions and Types
export {
  // TypeScript Interfaces
  type Customer,
  type Appointment,
  type LeadScore,
  type CustomerSegment,
  type SegmentCriteria,
  type RetentionAnalysis,
  // Lead Scoring Functions
  calculateLeadScore,
  categorizeLeadPriority,
  // Customer Lifecycle Functions
  determineCustomerLifecycle,
  calculateDaysSinceLastVisit,
  predictChurnRisk,
  // Customer Value Functions
  calculateCustomerLifetimeValue,
  calculateAverageAppointmentValue,
  rankCustomersByValue,
  // Follow-up Management Functions
  determineNextFollowUpDate,
  generateFollowUpMessage,
  // Analytics and Segmentation Functions
  segmentCustomers,
  calculateRetentionRate,
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
