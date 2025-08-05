"use strict";
/**
 * CRM Components Index
 * Clean exports for Customer Relationship Management components
 * Created: January 24, 2025
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRetentionRate = exports.segmentCustomers = exports.generateFollowUpMessage = exports.determineNextFollowUpDate = exports.rankCustomersByValue = exports.calculateAverageAppointmentValue = exports.calculateCustomerLifetimeValue = exports.predictChurnRisk = exports.calculateDaysSinceLastVisit = exports.determineCustomerLifecycle = exports.categorizeLeadPriority = exports.calculateLeadScore = exports.CustomerAnalytics = exports.LeadTracking = exports.CustomerManagement = void 0;
// Main Components
var CustomerManagement_1 = require("./CustomerManagement");
Object.defineProperty(exports, "CustomerManagement", { enumerable: true, get: function () { return CustomerManagement_1.CustomerManagement; } });
var LeadTracking_1 = require("./LeadTracking");
Object.defineProperty(exports, "LeadTracking", { enumerable: true, get: function () { return LeadTracking_1.LeadTracking; } });
var CustomerAnalytics_1 = require("./CustomerAnalytics");
Object.defineProperty(exports, "CustomerAnalytics", { enumerable: true, get: function () { return CustomerAnalytics_1.CustomerAnalytics; } });
// Utility Functions and Types
var utils_1 = require("./utils");
// Lead Scoring Functions
Object.defineProperty(exports, "calculateLeadScore", { enumerable: true, get: function () { return utils_1.calculateLeadScore; } });
Object.defineProperty(exports, "categorizeLeadPriority", { enumerable: true, get: function () { return utils_1.categorizeLeadPriority; } });
// Customer Lifecycle Functions
Object.defineProperty(exports, "determineCustomerLifecycle", { enumerable: true, get: function () { return utils_1.determineCustomerLifecycle; } });
Object.defineProperty(exports, "calculateDaysSinceLastVisit", { enumerable: true, get: function () { return utils_1.calculateDaysSinceLastVisit; } });
Object.defineProperty(exports, "predictChurnRisk", { enumerable: true, get: function () { return utils_1.predictChurnRisk; } });
// Customer Value Functions
Object.defineProperty(exports, "calculateCustomerLifetimeValue", { enumerable: true, get: function () { return utils_1.calculateCustomerLifetimeValue; } });
Object.defineProperty(exports, "calculateAverageAppointmentValue", { enumerable: true, get: function () { return utils_1.calculateAverageAppointmentValue; } });
Object.defineProperty(exports, "rankCustomersByValue", { enumerable: true, get: function () { return utils_1.rankCustomersByValue; } });
// Follow-up Management Functions
Object.defineProperty(exports, "determineNextFollowUpDate", { enumerable: true, get: function () { return utils_1.determineNextFollowUpDate; } });
Object.defineProperty(exports, "generateFollowUpMessage", { enumerable: true, get: function () { return utils_1.generateFollowUpMessage; } });
// Analytics and Segmentation Functions
Object.defineProperty(exports, "segmentCustomers", { enumerable: true, get: function () { return utils_1.segmentCustomers; } });
Object.defineProperty(exports, "calculateRetentionRate", { enumerable: true, get: function () { return utils_1.calculateRetentionRate; } });
// Export default object for convenience
exports.default = {
    CustomerManagement: CustomerManagement,
    LeadTracking: LeadTracking,
    CustomerAnalytics: CustomerAnalytics,
    // Utility functions
    calculateLeadScore: calculateLeadScore,
    categorizeLeadPriority: categorizeLeadPriority,
    determineCustomerLifecycle: determineCustomerLifecycle,
    calculateDaysSinceLastVisit: calculateDaysSinceLastVisit,
    predictChurnRisk: predictChurnRisk,
    calculateCustomerLifetimeValue: calculateCustomerLifetimeValue,
    calculateAverageAppointmentValue: calculateAverageAppointmentValue,
    rankCustomersByValue: rankCustomersByValue,
    determineNextFollowUpDate: determineNextFollowUpDate,
    generateFollowUpMessage: generateFollowUpMessage,
    segmentCustomers: segmentCustomers,
    calculateRetentionRate: calculateRetentionRate
};
