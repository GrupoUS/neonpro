/**
 * @fileoverview Healthcare Monitoring Dashboards
 * @description Story 05.03: Monitoring & Observability for Healthcare Systems
 */

export class HealthcareDashboards {
  /**
   * Patient Data Access Monitoring Dashboard
   * LGPD Compliance: Track all patient data access
   */
  static getPatientDataAccessDashboard() {
    return {
      title: "Patient Data Access Monitoring",
      panels: [
        {
          title: "Patient Data Access Rate",
          query: "rate(patient_data_access_total[5m])",
          alertThreshold: 1000, // requests per minute
          description: "Monitor patient data access patterns for LGPD compliance",
        },
        {
          title: "Unauthorized Access Attempts",
          query: "sum(rate(unauthorized_access_attempts_total[5m]))",
          alertThreshold: 5,
          description: "Alert on potential security breaches",
        },
        {
          title: "Data Encryption Status",
          query: "avg(data_encryption_active)",
          alertThreshold: 0.99,
          description: "Ensure all patient data is encrypted",
        },
        {
          title: "LGPD Consent Status",
          query: "avg(lgpd_consent_granted_ratio)",
          alertThreshold: 0.95,
          description: "Monitor LGPD consent compliance rates",
        },
      ],
    };
  }

  /**
   * Medical Accuracy Monitoring Dashboard
   * CFM Compliance: Monitor AI medical recommendations
   */
  static getMedicalAccuracyDashboard() {
    return {
      title: "Medical Accuracy Monitoring",
      panels: [
        {
          title: "AI Recommendation Accuracy",
          query: "avg(ai_recommendation_accuracy_score)",
          alertThreshold: 0.95,
          description: "Monitor AI medical recommendation accuracy (≥95% required)",
        },
        {
          title: "Doctor Approval Rate",
          query: "avg(ai_recommendation_approval_rate)",
          alertThreshold: 0.9,
          description: "CFM compliance: Doctor approval for AI recommendations",
        },
        {
          title: "Medical Ethics Violations",
          query: "sum(rate(medical_ethics_violations_total[5m]))",
          alertThreshold: 0,
          description: "Alert on any medical ethics violations",
        },
      ],
    };
  }

  /**
   * System Performance Dashboard
   * Healthcare SLA: <100ms API response, >95 Core Web Vitals
   */
  static getPerformanceDashboard() {
    return {
      title: "Healthcare System Performance",
      panels: [
        {
          title: "API Response Time",
          query: "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
          alertThreshold: 0.1, // 100ms
          description: "Healthcare SLA: API responses <100ms",
        },
        {
          title: "Core Web Vitals Score",
          query: "avg(lighthouse_performance_score)",
          alertThreshold: 95,
          description: "Healthcare UX: Core Web Vitals >95",
        },
      ],
    };
  }
}
