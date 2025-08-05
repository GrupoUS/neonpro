/**
 * Healthcare Analytics Functions
 * Ultra-fast analytics queries optimized for edge computing
 */

// Patient metrics calculation
export async function getPatientMetrics(db: D1Database, tenantId: string) {
  const _today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // Use prepared statements for performance
  const queries = await Promise.all([
    // Total active patients
    db
      .prepare("SELECT COUNT(*) as total FROM patients WHERE tenant_id = ? AND is_active = 1")
      .bind(tenantId)
      .first(),

    // New patients this month
    db
      .prepare(
        "SELECT COUNT(*) as new_patients FROM patients WHERE tenant_id = ? AND created_at >= ? AND is_active = 1",
      )
      .bind(tenantId, thirtyDaysAgo)
      .first(),

    // Patients by age group
    db
      .prepare(`
      SELECT 
        CASE 
          WHEN (julianday('now') - julianday(date_of_birth)) / 365.25 < 18 THEN 'pediatric'
          WHEN (julianday('now') - julianday(date_of_birth)) / 365.25 < 65 THEN 'adult'
          ELSE 'senior'
        END as age_group,
        COUNT(*) as count
      FROM patients 
      WHERE tenant_id = ? AND is_active = 1 
      GROUP BY age_group
    `)
      .bind(tenantId)
      .all(),

    // Patients by gender
    db
      .prepare(
        "SELECT gender, COUNT(*) as count FROM patients WHERE tenant_id = ? AND is_active = 1 GROUP BY gender",
      )
      .bind(tenantId)
      .all(),
  ]);

  return {
    total_patients: queries[0]?.total || 0,
    new_patients_30d: queries[1]?.new_patients || 0,
    demographics: {
      age_groups: queries[2]?.results || [],
      gender_distribution: queries[3]?.results || [],
    },
    growth_rate: calculateGrowthRate(queries[1]?.new_patients || 0),
    timestamp: new Date().toISOString(),
  };
}

// Appointment metrics calculation
export async function getAppointmentMetrics(db: D1Database, tenantId: string, timeRange: string) {
  const { startDate, endDate } = getDateRange(timeRange);

  const queries = await Promise.all([
    // Total appointments in range
    db
      .prepare(
        "SELECT COUNT(*) as total FROM appointments WHERE tenant_id = ? AND appointment_date BETWEEN ? AND ?",
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Appointments by status
    db
      .prepare(
        "SELECT status, COUNT(*) as count FROM appointments WHERE tenant_id = ? AND appointment_date BETWEEN ? AND ? GROUP BY status",
      )
      .bind(tenantId, startDate, endDate)
      .all(),

    // Appointments by type
    db
      .prepare(
        "SELECT appointment_type, COUNT(*) as count FROM appointments WHERE tenant_id = ? AND appointment_date BETWEEN ? AND ? GROUP BY appointment_type",
      )
      .bind(tenantId, startDate, endDate)
      .all(),

    // No-show rate
    db
      .prepare(
        'SELECT COUNT(*) as no_shows FROM appointments WHERE tenant_id = ? AND appointment_date BETWEEN ? AND ? AND status = "no_show"',
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Average appointment duration
    db
      .prepare(
        'SELECT AVG(duration) as avg_duration FROM appointments WHERE tenant_id = ? AND appointment_date BETWEEN ? AND ? AND status = "completed"',
      )
      .bind(tenantId, startDate, endDate)
      .first(),
  ]);

  const totalAppointments = queries[0]?.total || 0;
  const noShows = queries[4]?.no_shows || 0;

  return {
    total_appointments: totalAppointments,
    by_status: queries[1]?.results || [],
    by_type: queries[2]?.results || [],
    no_show_rate: totalAppointments > 0 ? ((noShows / totalAppointments) * 100).toFixed(2) : 0,
    avg_duration_minutes: Math.round(queries[4]?.avg_duration || 30),
    time_range: timeRange,
    timestamp: new Date().toISOString(),
  };
}

// Revenue analytics with Brazilian tax considerations
export async function getRevenueAnalytics(db: D1Database, tenantId: string, period: string) {
  const { startDate, endDate } = getPeriodRange(period);

  const queries = await Promise.all([
    // Total revenue
    db
      .prepare(
        'SELECT SUM(amount) as total_revenue FROM payments WHERE tenant_id = ? AND payment_date BETWEEN ? AND ? AND status = "completed"',
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Revenue by payment method
    db
      .prepare(
        'SELECT payment_method, SUM(amount) as revenue FROM payments WHERE tenant_id = ? AND payment_date BETWEEN ? AND ? AND status = "completed" GROUP BY payment_method',
      )
      .bind(tenantId, startDate, endDate)
      .all(),

    // Revenue by service type
    db
      .prepare(`
      SELECT p.service_type, SUM(pay.amount) as revenue, COUNT(*) as transactions
      FROM payments pay 
      JOIN appointments a ON pay.appointment_id = a.id
      JOIN procedures p ON a.procedure_id = p.id
      WHERE pay.tenant_id = ? AND pay.payment_date BETWEEN ? AND ? AND pay.status = "completed"
      GROUP BY p.service_type
    `)
      .bind(tenantId, startDate, endDate)
      .all(),

    // Monthly revenue trend (last 12 months)
    db
      .prepare(`
      SELECT 
        strftime('%Y-%m', payment_date) as month,
        SUM(amount) as revenue
      FROM payments 
      WHERE tenant_id = ? AND payment_date >= date('now', '-12 months') AND status = "completed"
      GROUP BY month
      ORDER BY month
    `)
      .bind(tenantId)
      .all(),
  ]);

  const totalRevenue = queries[0]?.total_revenue || 0;

  // Calculate Brazilian taxes (simplified)
  const taxes = calculateBrazilianTaxes(totalRevenue);

  return {
    total_revenue: totalRevenue,
    net_revenue: totalRevenue - taxes.total,
    taxes: taxes,
    by_payment_method: queries[1]?.results || [],
    by_service_type: queries[2]?.results || [],
    monthly_trend: queries[3]?.results || [],
    period: period,
    currency: "BRL",
    timestamp: new Date().toISOString(),
  };
}

// LGPD/ANVISA compliance report generation
export async function generateComplianceReport(
  db: D1Database,
  tenantId: string,
  reportType: string,
  startDate?: string,
  endDate?: string,
) {
  const dateRange = startDate && endDate ? { startDate, endDate } : getDateRange("30d");

  switch (reportType) {
    case "lgpd_summary":
      return await generateLGPDReport(db, tenantId, dateRange.startDate, dateRange.endDate);

    case "anvisa_audit":
      return await generateANVISAReport(db, tenantId, dateRange.startDate, dateRange.endDate);

    case "cfm_compliance":
      return await generateCFMReport(db, tenantId, dateRange.startDate, dateRange.endDate);

    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
}

// Helper functions
function getDateRange(timeRange: string) {
  const now = new Date();
  let startDate: string;

  switch (timeRange) {
    case "24h":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      break;
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  }

  return { startDate, endDate: now.toISOString() };
}

function getPeriodRange(period: string) {
  const now = new Date();
  let startDate: string;

  switch (period) {
    case "current_month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      break;
    case "last_month": {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate = lastMonth.toISOString();
      break;
    }
    case "current_year":
      startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  return { startDate, endDate: now.toISOString() };
}

function calculateGrowthRate(newPatients: number): string {
  // Simplified growth rate calculation
  // In production, this would compare with previous period
  if (newPatients > 50) return "high";
  if (newPatients > 20) return "moderate";
  return "low";
}

function calculateBrazilianTaxes(revenue: number) {
  // Simplified Brazilian tax calculation for healthcare services
  const pis = revenue * 0.0165; // PIS 1.65%
  const cofins = revenue * 0.076; // COFINS 7.6%
  const iss = revenue * 0.05; // ISS ~5% (varies by municipality)

  return {
    pis: Math.round(pis * 100) / 100,
    cofins: Math.round(cofins * 100) / 100,
    iss: Math.round(iss * 100) / 100,
    total: Math.round((pis + cofins + iss) * 100) / 100,
  };
} // LGPD compliance report
async function generateLGPDReport(
  db: D1Database,
  tenantId: string,
  startDate: string,
  endDate: string,
) {
  const queries = await Promise.all([
    // Data access requests
    db
      .prepare(
        'SELECT COUNT(*) as total FROM audit_logs WHERE tenant_id = ? AND action LIKE "%data_export%" AND timestamp BETWEEN ? AND ?',
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Data deletion requests
    db
      .prepare(
        'SELECT COUNT(*) as total FROM audit_logs WHERE tenant_id = ? AND action LIKE "%patient_deactivated%" AND timestamp BETWEEN ? AND ?',
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Consent management
    db
      .prepare(
        'SELECT COUNT(*) as total FROM patients WHERE tenant_id = ? AND lgpd_consent->>"$.data_processing" = "true"',
      )
      .bind(tenantId)
      .first(),

    // Data breach incidents (should be 0)
    db
      .prepare(
        'SELECT COUNT(*) as total FROM security_incidents WHERE tenant_id = ? AND incident_type = "data_breach" AND created_at BETWEEN ? AND ?',
      )
      .bind(tenantId, startDate, endDate)
      .first(),
  ]);

  return {
    report_type: "LGPD Compliance Summary",
    period: { startDate, endDate },
    metrics: {
      data_access_requests: queries[0]?.total || 0,
      data_deletion_requests: queries[1]?.total || 0,
      patients_with_consent: queries[2]?.total || 0,
      data_breach_incidents: queries[3]?.total || 0,
      compliance_score: calculateComplianceScore("lgpd", [
        queries[0]?.total || 0,
        queries[1]?.total || 0,
        queries[3]?.total || 0,
      ]),
    },
    recommendations: generateLGPDRecommendations(queries),
    generated_at: new Date().toISOString(),
  };
}

// ANVISA compliance report
async function generateANVISAReport(
  db: D1Database,
  tenantId: string,
  startDate: string,
  endDate: string,
) {
  const queries = await Promise.all([
    // Controlled substance prescriptions
    db
      .prepare(
        'SELECT COUNT(*) as total FROM audit_logs WHERE tenant_id = ? AND action = "controlled_substance_prescribed" AND timestamp BETWEEN ? AND ?',
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Medical device usage tracking
    db
      .prepare(
        'SELECT COUNT(*) as total FROM audit_logs WHERE tenant_id = ? AND action LIKE "%medical_device%" AND timestamp BETWEEN ? AND ?',
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Healthcare professional license validations
    db
      .prepare(
        'SELECT COUNT(*) as total FROM audit_logs WHERE tenant_id = ? AND action = "license_verified" AND timestamp BETWEEN ? AND ?',
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Adverse event reports
    db
      .prepare(
        "SELECT COUNT(*) as total FROM adverse_events WHERE tenant_id = ? AND reported_date BETWEEN ? AND ?",
      )
      .bind(tenantId, startDate, endDate)
      .first(),
  ]);

  return {
    report_type: "ANVISA Compliance Audit",
    period: { startDate, endDate },
    metrics: {
      controlled_substance_logs: queries[0]?.total || 0,
      medical_device_usage: queries[1]?.total || 0,
      license_validations: queries[2]?.total || 0,
      adverse_events: queries[3]?.total || 0,
      compliance_score: calculateComplianceScore("anvisa", [
        queries[0]?.total || 0,
        queries[1]?.total || 0,
        queries[2]?.total || 0,
      ]),
    },
    recommendations: generateANVISARecommendations(queries),
    generated_at: new Date().toISOString(),
  };
}

// CFM compliance report
async function generateCFMReport(
  db: D1Database,
  tenantId: string,
  startDate: string,
  endDate: string,
) {
  const queries = await Promise.all([
    // Medical consultations logged
    db
      .prepare(
        'SELECT COUNT(*) as total FROM appointments WHERE tenant_id = ? AND appointment_date BETWEEN ? AND ? AND status = "completed" AND appointment_type IN ("consultation", "follow_up")',
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Telemedicine sessions
    db
      .prepare(
        'SELECT COUNT(*) as total FROM appointments WHERE tenant_id = ? AND appointment_date BETWEEN ? AND ? AND is_telemedicine = 1 AND status = "completed"',
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Medical record completeness
    db
      .prepare(
        "SELECT COUNT(*) as complete FROM medical_records WHERE tenant_id = ? AND created_at BETWEEN ? AND ? AND diagnosis IS NOT NULL AND treatment_plan IS NOT NULL",
      )
      .bind(tenantId, startDate, endDate)
      .first(),

    // Total medical records
    db
      .prepare(
        "SELECT COUNT(*) as total FROM medical_records WHERE tenant_id = ? AND created_at BETWEEN ? AND ?",
      )
      .bind(tenantId, startDate, endDate)
      .first(),
  ]);

  const completenessRate =
    queries[3]?.total > 0 ? Math.round((queries[2]?.complete / queries[3]?.total) * 100) : 0;

  return {
    report_type: "CFM Compliance Report",
    period: { startDate, endDate },
    metrics: {
      medical_consultations: queries[0]?.total || 0,
      telemedicine_sessions: queries[1]?.total || 0,
      medical_record_completeness: `${completenessRate}%`,
      total_medical_records: queries[3]?.total || 0,
      compliance_score: calculateComplianceScore("cfm", [
        completenessRate,
        queries[0]?.total || 0,
        queries[1]?.total || 0,
      ]),
    },
    recommendations: generateCFMRecommendations(queries, completenessRate),
    generated_at: new Date().toISOString(),
  };
}

// Helper functions for compliance scoring
function calculateComplianceScore(type: string, metrics: number[]): string {
  // Simplified compliance scoring algorithm
  let score = 85; // Base score

  switch (type) {
    case "lgpd":
      // Lower score if there are data breach incidents
      if (metrics[2] > 0) score -= 30;
      // Increase score for proper data handling
      if (metrics[0] > 0 || metrics[1] > 0) score += 10;
      break;

    case "anvisa":
      // Increase score for proper logging
      if (metrics[0] > 0) score += 5;
      if (metrics[1] > 0) score += 5;
      if (metrics[2] > 0) score += 5;
      break;

    case "cfm":
      // Score based on medical record completeness
      if (metrics[0] >= 90) score += 10;
      else if (metrics[0] >= 70) score += 5;
      else if (metrics[0] < 50) score -= 20;
      break;
  }

  score = Math.max(0, Math.min(100, score));

  if (score >= 95) return "Excellent";
  if (score >= 85) return "Good";
  if (score >= 70) return "Satisfactory";
  return "Needs Improvement";
}

function generateLGPDRecommendations(queries: any[]): string[] {
  const recommendations = [];

  if (queries[3]?.total > 0) {
    recommendations.push("Immediate action required: Address data breach incidents");
    recommendations.push("Review security protocols and access controls");
  }

  if (queries[0]?.total > 10) {
    recommendations.push("High volume of data access requests - consider automated export tools");
  }

  recommendations.push("Regularly review and update consent management procedures");
  recommendations.push("Conduct quarterly LGPD compliance audits");

  return recommendations;
}

function generateANVISARecommendations(queries: any[]): string[] {
  const recommendations = [];

  if (queries[0]?.total === 0) {
    recommendations.push("No controlled substance logs found - verify prescription tracking");
  }

  if (queries[2]?.total === 0) {
    recommendations.push("Implement automated healthcare professional license validation");
  }

  recommendations.push("Maintain complete audit trails for all regulated activities");
  recommendations.push("Schedule regular ANVISA compliance reviews");

  return recommendations;
}

function generateCFMRecommendations(queries: any[], completenessRate: number): string[] {
  const recommendations = [];

  if (completenessRate < 70) {
    recommendations.push("Critical: Improve medical record completeness rate");
    recommendations.push("Implement mandatory fields for diagnosis and treatment plans");
  }

  if (queries[1]?.total > queries[0]?.total * 0.5) {
    recommendations.push("High telemedicine usage - ensure CFM telemedicine guidelines compliance");
  }

  recommendations.push("Regular training for healthcare professionals on documentation standards");
  recommendations.push("Implement quality assurance reviews for medical records");

  return recommendations;
}
