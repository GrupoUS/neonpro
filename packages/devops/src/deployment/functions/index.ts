/**
 * @fileoverview Supabase Edge Functions for NeonPro Healthcare Platform
 * Consolidated from infrastructure/functions/
 */

// Export function configurations for deployment
export const stockAlerts = {
  name: "stock-alerts-processor",
  schedule: "0 */6 * * *", // Every 6 hours
  description: "Process stock alerts and inventory notifications",
};

export const stockReports = {
  name: "stock-reports-generator",
  schedule: "0 9 * * *", // Daily at 9 AM
  description: "Generate automated stock reports",
};

export const subscriptionBilling = {
  name: "subscription-billing-processor",
  schedule: "0 2 * * *", // Daily at 2 AM
  description: "Process subscription billing cycles and renewals",
};

// Function deployment manifest
export const deploymentManifest = {
  functions: [
    stockAlerts,
    stockReports,
    subscriptionBilling,
  ],
  runtime: "deno",
  version: "1.0.0",
};
