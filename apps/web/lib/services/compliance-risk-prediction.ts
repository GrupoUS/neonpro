/**
 * Real-time Predictive Compliance Risk Assessment
 * Uses ML-style algorithms to predict compliance violations before they occur
 */

import { supabase } from "@/lib/supabase/client";

export interface RiskPrediction {
  risk_level: "low" | "medium" | "high" | "critical";
  confidence: number; // 0-100%
  predicted_violation_type: "lgpd" | "anvisa" | "cfm" | "general";
  risk_factors: {
    factor: string;
    impact: number; // 1-10
    description: string;
  }[];
  prevention_actions: string[];
  estimated_days_to_violation: number;
}

export interface ComplianceMetrics {
  lgpd_score: number;
  anvisa_score: number;
  cfm_score: number;
  overall_score: number;
  trend: "improving" | "stable" | "declining";
  predicted_risks: RiskPrediction[];
}

export class ComplianceRiskPredictionService {
  /**
   * Analyze real-time compliance risks for a tenant
   */
  async analyzeComplianceRisks(
    tenantId: string,
  ): Promise<{ metrics?: ComplianceMetrics; error?: string; }> {
    try {
      // Collect real-time data for risk assessment
      const [
        recentActivity,
        consentData,
        equipmentStatus,
        staffLicenses,
        securityEvents,
        historicalTrends,
      ] = await Promise.all([
        this.getRecentActivity(tenantId),
        this.getConsentMetrics(tenantId),
        this.getEquipmentComplianceStatus(tenantId),
        this.getStaffLicenseStatus(tenantId),
        this.getRecentSecurityEvents(tenantId),
        this.getHistoricalComplianceTrends(tenantId),
      ]);

      // Calculate individual regulatory scores
      const lgpdScore = this.calculateLGPDRiskScore(
        consentData,
        securityEvents,
        recentActivity,
      );
      const anvisaScore = this.calculateANVISARiskScore(
        equipmentStatus,
        recentActivity,
      );
      const cfmScore = this.calculateCFMRiskScore(
        staffLicenses,
        recentActivity,
      );

      // Calculate overall score
      const overallScore = Math.round(
        (lgpdScore.score + anvisaScore.score + cfmScore.score) / 3,
      );

      // Predict future risks using pattern analysis
      const predictedRisks = await this.predictFutureRisks(
        tenantId,
        { lgpd: lgpdScore, anvisa: anvisaScore, cfm: cfmScore },
        historicalTrends,
      );

      // Determine trend
      const trend = this.calculateTrend(historicalTrends, overallScore);

      const metrics: ComplianceMetrics = {
        lgpd_score: lgpdScore.score,
        anvisa_score: anvisaScore.score,
        cfm_score: cfmScore.score,
        overall_score: overallScore,
        trend,
        predicted_risks: predictedRisks,
      };

      // Store metrics for trend analysis
      await this.storeMetrics(tenantId, metrics);

      // Trigger alerts for high-risk predictions
      await this.triggerRiskAlerts(tenantId, predictedRisks);

      return { metrics };
    } catch (error) {
      return {
        error: error instanceof Error
          ? error.message
          : "Failed to analyze compliance risks",
      };
    }
  }

  /**
   * Calculate LGPD-specific risk score
   */
  private calculateLGPDRiskScore(
    consentData: unknown,
    securityEvents: unknown[],
    activity: unknown[],
  ): unknown {
    let score = 100;
    const riskFactors = [];

    // Consent compliance analysis
    const consentRate = consentData.total > 0 ? consentData.granted / consentData.total : 1;
    if (consentRate < 0.8) {
      const impact = Math.round((0.8 - consentRate) * 50);
      score -= impact;
      riskFactors.push({
        factor: "Low consent rate",
        impact: impact / 5,
        description: `Only ${Math.round(consentRate * 100)}% consent rate (requires ≥80%)`,
      });
    }

    // Data retention violations
    const retentionViolations =
      activity.filter((a) => a.action?.includes("data_retention_exceeded")).length;
    if (retentionViolations > 0) {
      score -= retentionViolations * 15;
      riskFactors.push({
        factor: "Data retention violations",
        impact: 8,
        description: `${retentionViolations} data retention policy violations`,
      });
    }

    // Security incidents
    const criticalIncidents = securityEvents.filter(
      (e) => e.severity === "high" || e.severity === "critical",
    ).length;
    if (criticalIncidents > 0) {
      score -= criticalIncidents * 20;
      riskFactors.push({
        factor: "Security incidents",
        impact: 9,
        description: `${criticalIncidents} high-severity security incidents`,
      });
    }

    // Data subject request response time
    const slowResponses = activity.filter(
      (a) =>
        a.action?.includes("data_subject_request")
        && a.response_time_hours > 72, // LGPD requires response within 72 hours
    ).length;
    if (slowResponses > 0) {
      score -= slowResponses * 10;
      riskFactors.push({
        factor: "Slow data subject responses",
        impact: 6,
        description: `${slowResponses} requests exceeded 72-hour response limit`,
      });
    }

    return {
      score: Math.max(0, score),
      riskFactors,
    };
  }

  /**
   * Calculate ANVISA-specific risk score
   */
  private calculateANVISARiskScore(
    equipmentStatus: unknown[],
    activity: unknown[],
  ): unknown {
    let score = 100;
    const riskFactors = [];

    // Equipment registration compliance
    const expiredRegistrations = equipmentStatus.filter(
      (eq) => new Date(eq.certification_expiry) <= new Date(),
    ).length;
    if (expiredRegistrations > 0) {
      score -= expiredRegistrations * 25;
      riskFactors.push({
        factor: "Expired equipment registrations",
        impact: 9,
        description: `${expiredRegistrations} equipment with expired ANVISA registrations`,
      });
    }

    // Equipment near expiry (within 30 days)
    const nearExpiry = equipmentStatus.filter((eq) => {
      const expiryDate = new Date(eq.certification_expiry);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow && expiryDate > new Date();
    }).length;
    if (nearExpiry > 0) {
      score -= nearExpiry * 10;
      riskFactors.push({
        factor: "Equipment certifications expiring soon",
        impact: 6,
        description: `${nearExpiry} equipment certifications expire within 30 days`,
      });
    }

    // Maintenance overdue
    const overdueMaintenances = equipmentStatus.filter(
      (eq) => eq.maintenance_due && new Date(eq.maintenance_due) < new Date(),
    ).length;
    if (overdueMaintenances > 0) {
      score -= overdueMaintenances * 15;
      riskFactors.push({
        factor: "Overdue equipment maintenance",
        impact: 7,
        description: `${overdueMaintenances} equipment overdue for maintenance`,
      });
    }

    // Adverse events
    const adverseEvents = activity.filter((a) => a.action?.includes("adverse_event")).length;
    if (adverseEvents > 0) {
      score -= adverseEvents * 20;
      riskFactors.push({
        factor: "Recent adverse events",
        impact: 8,
        description: `${adverseEvents} adverse events requiring ANVISA reporting`,
      });
    }

    return {
      score: Math.max(0, score),
      riskFactors,
    };
  }

  /**
   * Calculate CFM-specific risk score
   */
  private calculateCFMRiskScore(
    staffLicenses: unknown[],
    activity: unknown[],
  ): unknown {
    let score = 100;
    const riskFactors = [];

    // Professional license compliance
    const expiredLicenses = staffLicenses.filter(
      (lic) => new Date(lic.expires_at) <= new Date(),
    ).length;
    if (expiredLicenses > 0) {
      score -= expiredLicenses * 30;
      riskFactors.push({
        factor: "Expired professional licenses",
        impact: 10,
        description: `${expiredLicenses} professionals with expired CFM licenses`,
      });
    }

    // Licenses expiring soon
    const soonExpiring = staffLicenses.filter((lic) => {
      const expiryDate = new Date(lic.expires_at);
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
      return expiryDate <= sixtyDaysFromNow && expiryDate > new Date();
    }).length;
    if (soonExpiring > 0) {
      score -= soonExpiring * 15;
      riskFactors.push({
        factor: "Professional licenses expiring soon",
        impact: 7,
        description: `${soonExpiring} licenses expire within 60 days`,
      });
    }

    // Continuing education compliance
    const inadequateEducation = staffLicenses.filter(
      (lic) => (lic.education_hours_current_year || 0) < 20, // CFM requires 40 hours annually, warn at 50%
    ).length;
    if (inadequateEducation > 0) {
      score -= inadequateEducation * 12;
      riskFactors.push({
        factor: "Insufficient continuing education",
        impact: 6,
        description: `${inadequateEducation} professionals below continuing education requirements`,
      });
    }

    // Ethical violations
    const ethicalViolations =
      activity.filter((a) => a.action?.includes("ethical_violation")).length;
    if (ethicalViolations > 0) {
      score -= ethicalViolations * 25;
      riskFactors.push({
        factor: "Ethical violations reported",
        impact: 9,
        description: `${ethicalViolations} ethical violations requiring CFM reporting`,
      });
    }

    // Telemedicine compliance
    const telemedicineViolations = activity.filter(
      (a) => a.action?.includes("telemedicine") && a.status === "non_compliant",
    ).length;
    if (telemedicineViolations > 0) {
      score -= telemedicineViolations * 18;
      riskFactors.push({
        factor: "Telemedicine compliance issues",
        impact: 8,
        description: `${telemedicineViolations} telemedicine sessions with compliance issues`,
      });
    }

    return {
      score: Math.max(0, score),
      riskFactors,
    };
  }

  /**
   * Predict future compliance risks using pattern analysis
   */
  private async predictFutureRisks(
    tenantId: string,
    currentScores: unknown,
    historicalTrends: unknown[],
  ): Promise<RiskPrediction[]> {
    const predictions: RiskPrediction[] = [];

    // Analyze trends for each regulatory framework
    for (const [framework, scoreData] of Object.entries(currentScores)) {
      const frameworkTrends = historicalTrends.filter(
        (t) => t.framework === framework,
      );

      if (frameworkTrends.length >= 3) {
        // Need at least 3 data points for trend analysis
        const trend = this.calculateScoreTrend(frameworkTrends);

        if (trend.slope < -2) {
          // Declining trend
          const estimatedDays = this.estimateTimeToViolation(
            scoreData.score,
            trend.slope,
          );

          predictions.push({
            risk_level: this.mapScoreToRiskLevel(scoreData.score),
            confidence: Math.min(90, Math.abs(trend.slope) * 15),
            predicted_violation_type: framework as unknown,
            risk_factors: scoreData.riskFactors,
            prevention_actions: this.generatePreventionActions(
              framework,
              scoreData.riskFactors,
            ),
            estimated_days_to_violation: estimatedDays,
          });
        }
      }
    }

    // Pattern-based predictions
    const patternPredictions = await this.analyzeCompliancePatterns(tenantId);
    predictions.push(...patternPredictions);

    return predictions.sort((a, b) => {
      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return riskOrder[b.risk_level] - riskOrder[a.risk_level];
    });
  }

  /**
   * Generate prevention actions based on risk factors
   */
  private generatePreventionActions(
    framework: string,
    riskFactors: unknown[],
  ): string[] {
    const actions: string[] = [];

    riskFactors.forEach((factor) => {
      switch (framework) {
        case "lgpd": {
          if (factor.factor.includes("consent")) {
            actions.push("Implementar campanha de renovação de consentimentos");
            actions.push("Revisar processo de coleta de consentimento");
          }
          if (factor.factor.includes("retention")) {
            actions.push(
              "Executar limpeza de dados conforme política de retenção",
            );
            actions.push("Automatizar processo de exclusão de dados");
          }
          if (factor.factor.includes("security")) {
            actions.push("Revisar e reforçar medidas de segurança");
            actions.push("Implementar monitoramento avançado");
          }
          break;
        }

        case "anvisa": {
          if (factor.factor.includes("registration")) {
            actions.push("Renovar registros de equipamentos ANVISA");
            actions.push("Agendar inspeções preventivas");
          }
          if (factor.factor.includes("maintenance")) {
            actions.push("Executar manutenções pendentes imediatamente");
            actions.push("Implementar cronograma preventivo de manutenção");
          }
          if (factor.factor.includes("adverse")) {
            actions.push("Revisar protocolos de segurança");
            actions.push("Treinar equipe em prevenção de eventos adversos");
          }
          break;
        }

        case "cfm": {
          if (factor.factor.includes("license")) {
            actions.push("Renovar licenças profissionais CFM");
            actions.push("Verificar status de todos os profissionais");
          }
          if (factor.factor.includes("education")) {
            actions.push(
              "Inscrever profissionais em cursos de educação continuada",
            );
            actions.push("Planejar cronograma de capacitação anual");
          }
          if (factor.factor.includes("ethical")) {
            actions.push("Implementar revisão de procedimentos éticos");
            actions.push("Realizar treinamento em ética médica");
          }
          break;
        }
      }
    });

    return [...new Set(actions)]; // Remove duplicates
  }

  // Helper methods for data collection
  private async getRecentActivity(tenantId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("created_at", thirtyDaysAgo.toISOString());
    return data || [];
  }

  private async getConsentMetrics(tenantId: string) {
    const { data } = await supabase
      .from("patient_consents")
      .select("status")
      .eq("tenant_id", tenantId);

    const consents = data || [];
    return {
      total: consents.length,
      granted: consents.filter((c) => c.status === "active").length,
      withdrawn: consents.filter((c) => c.status === "withdrawn").length,
    };
  }

  private async getEquipmentComplianceStatus(tenantId: string) {
    const { data } = await supabase
      .from("medical_equipment")
      .select("*")
      .eq("tenant_id", tenantId);
    return data || [];
  }

  private async getStaffLicenseStatus(tenantId: string) {
    const { data } = await supabase
      .from("medical_licenses")
      .select("*")
      .eq("tenant_id", tenantId);
    return data || [];
  }

  private async getRecentSecurityEvents(tenantId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await supabase
      .from("security_events")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("timestamp", sevenDaysAgo.toISOString());
    return data || [];
  }

  private async getHistoricalComplianceTrends(tenantId: string) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data } = await supabase
      .from("compliance_metrics_history")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("created_at", ninetyDaysAgo.toISOString())
      .order("created_at", { ascending: true });
    return data || [];
  }

  private async analyzeCompliancePatterns(
    _tenantId: string,
  ): Promise<RiskPrediction[]> {
    // This would implement more sophisticated pattern analysis
    // For now, return empty array but could include ML-based predictions
    return [];
  }

  private calculateScoreTrend(trends: unknown[]) {
    if (trends.length < 2) {
      return { slope: 0 };
    }

    const { length: n } = trends;
    const sumX = trends.reduce((sum, _, i) => sum + i, 0);
    const sumY = trends.reduce((sum, t) => sum + t.score, 0);
    const sumXY = trends.reduce((sum, t, i) => sum + i * t.score, 0);
    const sumX2 = trends.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return { slope };
  }

  private estimateTimeToViolation(currentScore: number, slope: number): number {
    if (slope >= 0) {
      return 999;
    } // Not declining

    const daysToReach70 = Math.round((currentScore - 70) / Math.abs(slope));
    return Math.max(1, daysToReach70);
  }

  private mapScoreToRiskLevel(
    score: number,
  ): "low" | "medium" | "high" | "critical" {
    if (score >= 95) {
      return "low";
    }
    if (score >= 85) {
      return "medium";
    }
    if (score >= 70) {
      return "high";
    }
    return "critical";
  }

  private calculateTrend(
    historicalTrends: unknown[],
    currentScore: number,
  ): "improving" | "stable" | "declining" {
    if (historicalTrends.length < 3) {
      return "stable";
    }

    const recentTrend = historicalTrends.slice(-3);
    const avgRecent = recentTrend.reduce((sum, t) => sum + t.overall_score, 0) / 3;

    if (currentScore > avgRecent + 2) {
      return "improving";
    }
    if (currentScore < avgRecent - 2) {
      return "declining";
    }
    return "stable";
  }

  private async storeMetrics(tenantId: string, metrics: ComplianceMetrics) {
    await supabase.from("compliance_metrics_history").insert({
      tenant_id: tenantId,
      lgpd_score: metrics.lgpd_score,
      anvisa_score: metrics.anvisa_score,
      cfm_score: metrics.cfm_score,
      overall_score: metrics.overall_score,
      trend: metrics.trend,
      predicted_risks_count: metrics.predicted_risks.length,
      created_at: new Date().toISOString(),
    });
  }

  private async triggerRiskAlerts(tenantId: string, risks: RiskPrediction[]) {
    for (const risk of risks) {
      if (risk.risk_level === "high" || risk.risk_level === "critical") {
        await supabase.from("compliance_alerts").insert({
          tenant_id: tenantId,
          alert_type: `${risk.predicted_violation_type}_violation` as unknown,
          severity: risk.risk_level === "critical" ? "critical" : "high",
          description:
            `Predicted ${risk.predicted_violation_type.toUpperCase()} violation in ${risk.estimated_days_to_violation} days`,
          action_required: risk.prevention_actions.join("; "),
          status: "open",
        });
      }
    }
  }
}

export const complianceRiskPredictionService = new ComplianceRiskPredictionService();
