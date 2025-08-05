// Dashboard Components Export - STORY-SUB-002 Task 4
// Main export file for all dashboard components
// Created: 2025-01-22
// Updated: 2025-01-23 - Added Stock Alerts and Reports components (Story 11.4)

// Analytics Components
export { AnalyticsOverview } from "./analytics/analytics-overview";
export { ConversionCharts } from "./analytics/conversion-charts";
// Appointment Management Components
export { AppointmentManagementDashboard } from "./appointment-management-dashboard";
// Main Dashboard Layout
// Default export for main dashboard
export { Dashboard, Dashboard as default } from "./dashboard";

// Stock Management Components (Story 11.4)
export { StockAlertsManagement } from "./stock-alerts-management";
export { default as StockPerformanceDashboard } from "./stock-performance-dashboard";
export { StockReports } from "./stock-reports";
// Trial Management Components
export { TrialManagement } from "./trial-management/trial-management";
