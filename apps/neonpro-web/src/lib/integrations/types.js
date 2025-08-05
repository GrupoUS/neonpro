/**
 * NeonPro - Third-party Integrations Framework
 * Types and interfaces for integration system
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2025-01-27
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationType = void 0;
var IntegrationType;
((IntegrationType) => {
  IntegrationType["ERP"] = "erp";
  IntegrationType["CRM"] = "crm";
  IntegrationType["PAYMENT"] = "payment";
  IntegrationType["EMAIL"] = "email";
  IntegrationType["SMS"] = "sms";
  IntegrationType["CALENDAR"] = "calendar";
  IntegrationType["STORAGE"] = "storage";
  IntegrationType["ANALYTICS"] = "analytics";
  IntegrationType["SOCIAL_MEDIA"] = "social_media";
  IntegrationType["TELEMEDICINE"] = "telemedicine";
  IntegrationType["LAB_SYSTEM"] = "lab_system";
  IntegrationType["IMAGING"] = "imaging";
  IntegrationType["PHARMACY"] = "pharmacy";
  IntegrationType["INSURANCE"] = "insurance";
  IntegrationType["CUSTOM"] = "custom";
})(IntegrationType || (exports.IntegrationType = IntegrationType = {}));
