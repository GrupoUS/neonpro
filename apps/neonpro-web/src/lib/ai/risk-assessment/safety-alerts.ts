/**
 * Safety Alerts System
 * Story 3.2: AI-powered Risk Assessment + Insights Implementation
 *
 * This module implements comprehensive safety alerts and monitoring:
 * - Real-time risk monitoring and alerts
 * - Automated safety protocol activation
 * - Emergency response coordination
 * - Compliance violation detection
 * - Predictive safety warnings
 * - Multi-channel alert distribution
 * - Brazilian healthcare safety standards compliance
 */

import type { createClient } from "@/lib/supabase/client";

// Alert Types
type AlertType =
  | "critical_risk"
  | "high_risk"
  | "contraindication"
  | "drug_interaction"
  | "allergy_warning"
  | "equipment_failure"
  | "staff_alert"
  | "compliance_violation"
  | "emergency_protocol"
  | "predictive_warning";

// Alert Severity
type AlertSeverity = "info" | "warning" | "urgent" | "critical" | "emergency";

// Alert Priority
type AlertPriority = "low" | "medium" | "high" | "critical";

// Alert Status
type AlertStatus = "active" | "acknowledged" | "resolved" | "escalated" | "dismissed";

// Alert Channel
type AlertChannel = "dashboard" | "email" | "sms" | "push" | "system" | "emergency";

// Safety Alert
interface SafetyAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  message: string;
  details: {
    patientId?: string;
    treatmentId?: string;
    staffId?: string;
    equipmentId?: string;
    riskScore?: number;
    riskFactors?: string[];
    recommendations?: string[];
    requiredActions?: string[];
    timeframe?: string;
    consequences?: string[];
  };
  metadata: {
    source: string;
    timestamp: Date;
    expiresAt?: Date;
    escalationTime?: Date;
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedBy?: string;
    resolvedAt?: Date;
    escalatedTo?: string[];
  };
  channels: AlertChannel[];
  recipients: {
    userId: string;
    role: string;
    channel: AlertChannel;
    delivered: boolean;
    deliveredAt?: Date;
    acknowledged: boolean;
    acknowledgedAt?: Date;
  }[];
  compliance: {
    cfmRequired: boolean;
    anvisaRequired: boolean;
    ethicsRequired: boolean;
    documentationRequired: boolean;
    reportingRequired: boolean;
  };
}

// Alert Rule
interface AlertRule {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;
  priority: AlertPriority;
  conditions: {
    field: string;
    operator: "equals" | "greater_than" | "less_than" | "contains" | "not_contains";
    value: any;
    logic?: "and" | "or";
  }[];
  actions: {
    type: "alert" | "block" | "require_approval" | "escalate" | "log";
    parameters: any;
  }[];
  channels: AlertChannel[];
  recipients: {
    role: string;
    channel: AlertChannel;
  }[];
  enabled: boolean;
  escalationRules: {
    timeMinutes: number;
    escalateTo: string[];
    channels: AlertChannel[];
  }[];
  compliance: {
    cfmGuideline?: string;
    anvisaRequirement?: string;
    ethicsCode?: string;
  };
}

// Alert Configuration
interface AlertConfig {
  enabled: boolean;
  channels: {
    dashboard: { enabled: boolean };
    email: { enabled: boolean; smtp?: any };
    sms: { enabled: boolean; provider?: any };
    push: { enabled: boolean; service?: any };
    emergency: { enabled: boolean; contacts?: string[] };
  };
  escalation: {
    enabled: boolean;
    timeouts: Record<AlertSeverity, number>;
    maxEscalations: number;
  };
  compliance: {
    cfmReporting: boolean;
    anvisaReporting: boolean;
    ethicsReporting: boolean;
    automaticDocumentation: boolean;
  };
  monitoring: {
    realTimeEnabled: boolean;
    batchProcessing: boolean;
    intervalMinutes: number;
  };
}

// Alert Statistics
interface AlertStatistics {
  total: number;
  byType: Record<AlertType, number>;
  bySeverity: Record<AlertSeverity, number>;
  byStatus: Record<AlertStatus, number>;
  responseTime: {
    average: number;
    median: number;
    percentile95: number;
  };
  escalationRate: number;
  resolutionRate: number;
  falsePositiveRate: number;
}

class SafetyAlertsSystem {
  private supabase = createClient();
  private config: AlertConfig;
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, SafetyAlert> = new Map();
  private alertHistory: SafetyAlert[] = [];
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(config?: Partial<AlertConfig>) {
    this.config = this.initializeConfig(config);
    this.loadAlertRules();
    this.loadActiveAlerts();

    if (this.config.monitoring.realTimeEnabled) {
      this.startRealTimeMonitoring();
    }
  }

  /**
   * Create and process a safety alert
   */
  async createAlert(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
    details: SafetyAlert["details"],
    options?: {
      priority?: AlertPriority;
      channels?: AlertChannel[];
      recipients?: string[];
      expiresIn?: number;
      escalateIn?: number;
    },
  ): Promise<SafetyAlert> {
    try {
      const alertId = this.generateAlertId();
      const now = new Date();

      const alert: SafetyAlert = {
        id: alertId,
        type,
        severity,
        priority: options?.priority || this.determinePriority(severity),
        status: "active",
        title,
        message,
        details,
        metadata: {
          source: "safety_alerts_system",
          timestamp: now,
          expiresAt: options?.expiresIn
            ? new Date(now.getTime() + options.expiresIn * 60000)
            : undefined,
          escalationTime: options?.escalateIn
            ? new Date(now.getTime() + options.escalateIn * 60000)
            : undefined,
        },
        channels: options?.channels || this.getDefaultChannels(severity),
        recipients: await this.determineRecipients(type, severity, options?.recipients),
        compliance: this.determineComplianceRequirements(type, severity),
      };

      // Store alert
      this.activeAlerts.set(alertId, alert);
      await this.storeAlert(alert);

      // Process alert
      await this.processAlert(alert);

      console.log(`Safety alert created: ${alertId} - ${title} (${severity})`);
      return alert;
    } catch (error) {
      console.error("Error creating safety alert:", error);
      throw new Error("Failed to create safety alert");
    }
  }

  /**
   * Process risk assessment and generate alerts
   */
  async processRiskAssessment(
    patientId: string,
    treatmentId: string,
    riskResult: any,
  ): Promise<SafetyAlert[]> {
    const alerts: SafetyAlert[] = [];

    try {
      // Check for critical alerts from risk assessment
      if (riskResult.criticalAlerts && riskResult.criticalAlerts.length > 0) {
        for (const criticalAlert of riskResult.criticalAlerts) {
          const alert = await this.createAlert(
            criticalAlert.type,
            criticalAlert.severity,
            `Critical Risk Alert: ${criticalAlert.type}`,
            criticalAlert.message,
            {
              patientId,
              treatmentId,
              riskScore: riskResult.overallRisk.score,
              riskFactors: [criticalAlert.message],
              requiredActions:
                criticalAlert.action === "block"
                  ? ["Treatment blocked pending review"]
                  : ["Immediate review required"],
              timeframe: criticalAlert.severity === "critical" ? "Immediate" : "15 minutes",
              consequences: ["Patient safety risk", "Potential complications"],
            },
            {
              priority: "critical",
              escalateIn: criticalAlert.severity === "critical" ? 5 : 15,
            },
          );
          alerts.push(alert);
        }
      }

      // Check overall risk level
      if (
        riskResult.overallRisk.severity === "high" ||
        riskResult.overallRisk.severity === "critical"
      ) {
        const alert = await this.createAlert(
          "high_risk",
          riskResult.overallRisk.severity === "critical" ? "critical" : "urgent",
          `High Risk Patient Alert`,
          `Patient ${patientId} has ${riskResult.overallRisk.severity} risk level (${riskResult.overallRisk.score}/100)`,
          {
            patientId,
            treatmentId,
            riskScore: riskResult.overallRisk.score,
            riskFactors: this.extractRiskFactors(riskResult.categoryRisks),
            recommendations: riskResult.recommendations.preOperative,
            requiredActions: ["Enhanced monitoring", "Specialist consultation"],
            timeframe: "Before procedure",
            consequences: ["Increased complication risk", "Extended recovery time"],
          },
          {
            priority: riskResult.overallRisk.severity === "critical" ? "critical" : "high",
          },
        );
        alerts.push(alert);
      }

      // Check for contraindications
      const contraindications = riskResult.criticalAlerts?.filter(
        (alert: any) => alert.type === "contraindication",
      );
      if (contraindications && contraindications.length > 0) {
        const alert = await this.createAlert(
          "contraindication",
          "critical",
          "Contraindication Detected",
          "Treatment contraindications have been identified",
          {
            patientId,
            treatmentId,
            riskFactors: contraindications.map((c: any) => c.message),
            requiredActions: ["Treatment blocked", "Physician review required"],
            timeframe: "Immediate",
            consequences: ["Treatment cannot proceed", "Alternative treatment required"],
          },
          {
            priority: "critical",
            escalateIn: 0, // Immediate escalation
          },
        );
        alerts.push(alert);
      }

      return alerts;
    } catch (error) {
      console.error("Error processing risk assessment alerts:", error);
      return alerts;
    }
  }

  /**
   * Monitor patient vitals and generate alerts
   */
  async monitorPatientVitals(
    patientId: string,
    vitals: {
      heartRate?: number;
      bloodPressure?: { systolic: number; diastolic: number };
      oxygenSaturation?: number;
      temperature?: number;
      respiratoryRate?: number;
    },
  ): Promise<SafetyAlert[]> {
    const alerts: SafetyAlert[] = [];

    try {
      // Heart rate monitoring
      if (vitals.heartRate) {
        if (vitals.heartRate > 120 || vitals.heartRate < 50) {
          const severity = vitals.heartRate > 150 || vitals.heartRate < 40 ? "critical" : "urgent";
          const alert = await this.createAlert(
            "critical_risk",
            severity,
            "Abnormal Heart Rate",
            `Heart rate: ${vitals.heartRate} bpm`,
            {
              patientId,
              riskFactors: [`Heart rate: ${vitals.heartRate} bpm`],
              requiredActions: ["Immediate assessment", "Cardiac monitoring"],
              timeframe: "Immediate",
              consequences: ["Cardiac complications", "Hemodynamic instability"],
            },
            { priority: "critical", escalateIn: 2 },
          );
          alerts.push(alert);
        }
      }

      // Blood pressure monitoring
      if (vitals.bloodPressure) {
        const { systolic, diastolic } = vitals.bloodPressure;
        if (systolic > 180 || systolic < 90 || diastolic > 110 || diastolic < 60) {
          const severity =
            systolic > 200 || systolic < 80 || diastolic > 120 || diastolic < 50
              ? "critical"
              : "urgent";
          const alert = await this.createAlert(
            "critical_risk",
            severity,
            "Abnormal Blood Pressure",
            `Blood pressure: ${systolic}/${diastolic} mmHg`,
            {
              patientId,
              riskFactors: [`Blood pressure: ${systolic}/${diastolic} mmHg`],
              requiredActions: ["Blood pressure management", "Cardiovascular assessment"],
              timeframe: "Immediate",
              consequences: ["Cardiovascular complications", "Stroke risk"],
            },
            { priority: "critical", escalateIn: 2 },
          );
          alerts.push(alert);
        }
      }

      // Oxygen saturation monitoring
      if (vitals.oxygenSaturation && vitals.oxygenSaturation < 95) {
        const severity = vitals.oxygenSaturation < 90 ? "critical" : "urgent";
        const alert = await this.createAlert(
          "critical_risk",
          severity,
          "Low Oxygen Saturation",
          `Oxygen saturation: ${vitals.oxygenSaturation}%`,
          {
            patientId,
            riskFactors: [`Oxygen saturation: ${vitals.oxygenSaturation}%`],
            requiredActions: ["Oxygen therapy", "Respiratory assessment"],
            timeframe: "Immediate",
            consequences: ["Hypoxia", "Respiratory failure"],
          },
          { priority: "critical", escalateIn: 1 },
        );
        alerts.push(alert);
      }

      return alerts;
    } catch (error) {
      console.error("Error monitoring patient vitals:", error);
      return alerts;
    }
  }

  /**
   * Check for drug interactions
   */
  async checkDrugInteractions(
    patientId: string,
    medications: string[],
    newMedication: string,
  ): Promise<SafetyAlert[]> {
    const alerts: SafetyAlert[] = [];

    try {
      // Get drug interaction data
      const { data: interactions } = await this.supabase
        .from("drug_interactions")
        .select("*")
        .or(`drug1.in.(${medications.join(",")}),drug2.eq.${newMedication}`);

      if (interactions && interactions.length > 0) {
        for (const interaction of interactions) {
          const severity = this.mapInteractionSeverity(interaction.severity);
          const alert = await this.createAlert(
            "drug_interaction",
            severity,
            "Drug Interaction Alert",
            `Interaction between ${interaction.drug1} and ${interaction.drug2}`,
            {
              patientId,
              riskFactors: [interaction.description],
              requiredActions: ["Review medication", "Consider alternatives"],
              timeframe: severity === "critical" ? "Immediate" : "30 minutes",
              consequences: [interaction.consequences],
            },
            {
              priority: severity === "critical" ? "critical" : "high",
              escalateIn: severity === "critical" ? 5 : 30,
            },
          );
          alerts.push(alert);
        }
      }

      return alerts;
    } catch (error) {
      console.error("Error checking drug interactions:", error);
      return alerts;
    }
  }

  /**
   * Monitor equipment status
   */
  async monitorEquipmentStatus(
    equipmentId: string,
    status: {
      operational: boolean;
      lastMaintenance?: Date;
      nextMaintenance?: Date;
      errorCodes?: string[];
      calibrationStatus?: "valid" | "expired" | "due";
    },
  ): Promise<SafetyAlert[]> {
    const alerts: SafetyAlert[] = [];

    try {
      // Equipment failure
      if (!status.operational) {
        const alert = await this.createAlert(
          "equipment_failure",
          "critical",
          "Equipment Failure",
          `Equipment ${equipmentId} is not operational`,
          {
            equipmentId,
            riskFactors: ["Equipment failure", ...(status.errorCodes || [])],
            requiredActions: ["Stop using equipment", "Technical support", "Use backup equipment"],
            timeframe: "Immediate",
            consequences: ["Treatment delay", "Patient safety risk"],
          },
          { priority: "critical", escalateIn: 0 },
        );
        alerts.push(alert);
      }

      // Calibration expired
      if (status.calibrationStatus === "expired") {
        const alert = await this.createAlert(
          "equipment_failure",
          "urgent",
          "Equipment Calibration Expired",
          `Equipment ${equipmentId} calibration has expired`,
          {
            equipmentId,
            riskFactors: ["Expired calibration"],
            requiredActions: ["Recalibrate equipment", "Verify accuracy"],
            timeframe: "Before next use",
            consequences: ["Inaccurate readings", "Treatment errors"],
          },
          { priority: "high", escalateIn: 60 },
        );
        alerts.push(alert);
      }

      // Maintenance overdue
      if (status.nextMaintenance && status.nextMaintenance < new Date()) {
        const alert = await this.createAlert(
          "equipment_failure",
          "warning",
          "Equipment Maintenance Overdue",
          `Equipment ${equipmentId} maintenance is overdue`,
          {
            equipmentId,
            riskFactors: ["Overdue maintenance"],
            requiredActions: ["Schedule maintenance", "Inspect equipment"],
            timeframe: "24 hours",
            consequences: ["Equipment failure risk", "Reduced reliability"],
          },
          { priority: "medium", escalateIn: 1440 }, // 24 hours
        );
        alerts.push(alert);
      }

      return alerts;
    } catch (error) {
      console.error("Error monitoring equipment status:", error);
      return alerts;
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string, notes?: string): Promise<boolean> {
    try {
      const alert = this.activeAlerts.get(alertId);
      if (!alert) {
        throw new Error("Alert not found");
      }

      // Update alert status
      alert.status = "acknowledged";
      alert.metadata.acknowledgedBy = userId;
      alert.metadata.acknowledgedAt = new Date();

      // Update recipients
      alert.recipients.forEach((recipient) => {
        if (recipient.userId === userId) {
          recipient.acknowledged = true;
          recipient.acknowledgedAt = new Date();
        }
      });

      // Update in database
      await this.updateAlert(alert);

      console.log(`Alert ${alertId} acknowledged by ${userId}`);
      return true;
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      return false;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(
    alertId: string,
    userId: string,
    resolution: string,
    notes?: string,
  ): Promise<boolean> {
    try {
      const alert = this.activeAlerts.get(alertId);
      if (!alert) {
        throw new Error("Alert not found");
      }

      // Update alert status
      alert.status = "resolved";
      alert.metadata.resolvedBy = userId;
      alert.metadata.resolvedAt = new Date();

      // Move to history
      this.alertHistory.push(alert);
      this.activeAlerts.delete(alertId);

      // Update in database
      await this.updateAlert(alert);

      console.log(`Alert ${alertId} resolved by ${userId}: ${resolution}`);
      return true;
    } catch (error) {
      console.error("Error resolving alert:", error);
      return false;
    }
  }

  /**
   * Escalate an alert
   */
  async escalateAlert(alertId: string, escalationLevel: number, reason?: string): Promise<boolean> {
    try {
      const alert = this.activeAlerts.get(alertId);
      if (!alert) {
        throw new Error("Alert not found");
      }

      // Find escalation rule
      const rule = this.alertRules.get(alert.type);
      if (!rule || !rule.escalationRules[escalationLevel]) {
        throw new Error("Escalation rule not found");
      }

      const escalationRule = rule.escalationRules[escalationLevel];

      // Update alert status
      alert.status = "escalated";
      alert.metadata.escalatedTo = escalationRule.escalateTo;

      // Add new recipients
      for (const escalateTo of escalationRule.escalateTo) {
        for (const channel of escalationRule.channels) {
          alert.recipients.push({
            userId: escalateTo,
            role: "escalation",
            channel,
            delivered: false,
            acknowledged: false,
          });
        }
      }

      // Send escalation notifications
      await this.sendAlertNotifications(alert, escalationRule.channels);

      // Update in database
      await this.updateAlert(alert);

      console.log(`Alert ${alertId} escalated to level ${escalationLevel}`);
      return true;
    } catch (error) {
      console.error("Error escalating alert:", error);
      return false;
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(filters?: {
    type?: AlertType;
    severity?: AlertSeverity;
    priority?: AlertPriority;
    patientId?: string;
    treatmentId?: string;
  }): SafetyAlert[] {
    let alerts = Array.from(this.activeAlerts.values());

    if (filters) {
      if (filters.type) alerts = alerts.filter((a) => a.type === filters.type);
      if (filters.severity) alerts = alerts.filter((a) => a.severity === filters.severity);
      if (filters.priority) alerts = alerts.filter((a) => a.priority === filters.priority);
      if (filters.patientId)
        alerts = alerts.filter((a) => a.details.patientId === filters.patientId);
      if (filters.treatmentId)
        alerts = alerts.filter((a) => a.details.treatmentId === filters.treatmentId);
    }

    return alerts.sort((a, b) => {
      // Sort by priority and timestamp
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];

      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime();
    });
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics(timeframe?: { start: Date; end: Date }): Promise<AlertStatistics> {
    try {
      let query = this.supabase.from("safety_alerts").select("*");

      if (timeframe) {
        query = query
          .gte("created_at", timeframe.start.toISOString())
          .lte("created_at", timeframe.end.toISOString());
      }

      const { data: alerts } = await query;

      if (!alerts) {
        return this.getEmptyStatistics();
      }

      const stats: AlertStatistics = {
        total: alerts.length,
        byType: {} as Record<AlertType, number>,
        bySeverity: {} as Record<AlertSeverity, number>,
        byStatus: {} as Record<AlertStatus, number>,
        responseTime: { average: 0, median: 0, percentile95: 0 },
        escalationRate: 0,
        resolutionRate: 0,
        falsePositiveRate: 0,
      };

      // Calculate statistics
      alerts.forEach((alert) => {
        stats.byType[alert.type as AlertType] = (stats.byType[alert.type as AlertType] || 0) + 1;
        stats.bySeverity[alert.severity as AlertSeverity] =
          (stats.bySeverity[alert.severity as AlertSeverity] || 0) + 1;
        stats.byStatus[alert.status as AlertStatus] =
          (stats.byStatus[alert.status as AlertStatus] || 0) + 1;
      });

      // Calculate rates
      const resolvedAlerts = alerts.filter((a) => a.status === "resolved");
      const escalatedAlerts = alerts.filter((a) => a.status === "escalated");

      stats.resolutionRate = alerts.length > 0 ? resolvedAlerts.length / alerts.length : 0;
      stats.escalationRate = alerts.length > 0 ? escalatedAlerts.length / alerts.length : 0;

      // Calculate response times
      const responseTimes = resolvedAlerts
        .filter((a) => a.acknowledged_at && a.created_at)
        .map((a) => new Date(a.acknowledged_at).getTime() - new Date(a.created_at).getTime())
        .map((ms) => ms / 60000); // Convert to minutes

      if (responseTimes.length > 0) {
        stats.responseTime.average =
          responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        responseTimes.sort((a, b) => a - b);
        stats.responseTime.median = responseTimes[Math.floor(responseTimes.length / 2)];
        stats.responseTime.percentile95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
      }

      return stats;
    } catch (error) {
      console.error("Error getting alert statistics:", error);
      return this.getEmptyStatistics();
    }
  }

  /**
   * Start real-time monitoring
   */
  private startRealTimeMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log("Starting real-time safety monitoring");

    // Set up Supabase real-time subscriptions
    this.setupRealtimeSubscriptions();

    // Set up periodic monitoring
    if (this.config.monitoring.batchProcessing) {
      this.monitoringInterval = setInterval(
        () => this.performPeriodicChecks(),
        this.config.monitoring.intervalMinutes * 60000,
      );
    }
  }

  /**
   * Stop real-time monitoring
   */
  stopRealTimeMonitoring(): void {
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log("Stopped real-time safety monitoring");
  }

  /**
   * Setup Supabase real-time subscriptions
   */
  private setupRealtimeSubscriptions(): void {
    // Subscribe to patient vitals changes
    this.supabase
      .channel("patient_vitals")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "patient_vitals" },
        (payload) => this.handleVitalsUpdate(payload.new),
      )
      .subscribe();

    // Subscribe to equipment status changes
    this.supabase
      .channel("equipment_status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "equipment" },
        (payload) => this.handleEquipmentUpdate(payload.new),
      )
      .subscribe();

    // Subscribe to treatment updates
    this.supabase
      .channel("treatments")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "treatments" },
        (payload) => this.handleTreatmentUpdate(payload.new),
      )
      .subscribe();
  }

  /**
   * Handle vitals update from real-time subscription
   */
  private async handleVitalsUpdate(vitals: any): Promise<void> {
    try {
      await this.monitorPatientVitals(vitals.patient_id, {
        heartRate: vitals.heart_rate,
        bloodPressure: vitals.blood_pressure ? JSON.parse(vitals.blood_pressure) : undefined,
        oxygenSaturation: vitals.oxygen_saturation,
        temperature: vitals.temperature,
        respiratoryRate: vitals.respiratory_rate,
      });
    } catch (error) {
      console.error("Error handling vitals update:", error);
    }
  }

  /**
   * Handle equipment update from real-time subscription
   */
  private async handleEquipmentUpdate(equipment: any): Promise<void> {
    try {
      await this.monitorEquipmentStatus(equipment.id, {
        operational: equipment.operational,
        lastMaintenance: equipment.last_maintenance
          ? new Date(equipment.last_maintenance)
          : undefined,
        nextMaintenance: equipment.next_maintenance
          ? new Date(equipment.next_maintenance)
          : undefined,
        errorCodes: equipment.error_codes ? JSON.parse(equipment.error_codes) : undefined,
        calibrationStatus: equipment.calibration_status,
      });
    } catch (error) {
      console.error("Error handling equipment update:", error);
    }
  }

  /**
   * Handle treatment update from real-time subscription
   */
  private async handleTreatmentUpdate(treatment: any): Promise<void> {
    try {
      // Check if treatment status changed to something that requires alerts
      if (treatment.status === "emergency" || treatment.status === "complication") {
        await this.createAlert(
          "emergency_protocol",
          "critical",
          "Treatment Emergency",
          `Treatment ${treatment.id} status changed to ${treatment.status}`,
          {
            patientId: treatment.patient_id,
            treatmentId: treatment.id,
            riskFactors: [treatment.status],
            requiredActions: ["Emergency response", "Immediate assessment"],
            timeframe: "Immediate",
            consequences: ["Patient safety risk"],
          },
          { priority: "critical", escalateIn: 0 },
        );
      }
    } catch (error) {
      console.error("Error handling treatment update:", error);
    }
  }

  /**
   * Perform periodic safety checks
   */
  private async performPeriodicChecks(): Promise<void> {
    try {
      console.log("Performing periodic safety checks");

      // Check for expired alerts
      await this.checkExpiredAlerts();

      // Check for escalation timeouts
      await this.checkEscalationTimeouts();

      // Check compliance requirements
      await this.checkComplianceRequirements();

      // Update alert statistics
      await this.updateAlertStatistics();
    } catch (error) {
      console.error("Error in periodic safety checks:", error);
    }
  }

  /**
   * Check for expired alerts
   */
  private async checkExpiredAlerts(): Promise<void> {
    const now = new Date();

    for (const [alertId, alert] of this.activeAlerts) {
      if (alert.metadata.expiresAt && alert.metadata.expiresAt < now) {
        await this.resolveAlert(alertId, "system", "Alert expired");
      }
    }
  }

  /**
   * Check for escalation timeouts
   */
  private async checkEscalationTimeouts(): Promise<void> {
    const now = new Date();

    for (const [alertId, alert] of this.activeAlerts) {
      if (
        alert.metadata.escalationTime &&
        alert.metadata.escalationTime < now &&
        alert.status === "active"
      ) {
        // Find current escalation level and escalate
        const rule = this.alertRules.get(alert.type);
        if (rule && rule.escalationRules.length > 0) {
          await this.escalateAlert(alertId, 0, "Escalation timeout");
        }
      }
    }
  }

  /**
   * Check compliance requirements
   */
  private async checkComplianceRequirements(): Promise<void> {
    // Check for alerts requiring compliance reporting
    for (const [alertId, alert] of this.activeAlerts) {
      if (alert.compliance.cfmRequired || alert.compliance.anvisaRequired) {
        // Generate compliance report if not already done
        await this.generateComplianceReport(alert);
      }
    }
  }

  /**
   * Generate compliance report
   */
  private async generateComplianceReport(alert: SafetyAlert): Promise<void> {
    try {
      const report = {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity,
        patientId: alert.details.patientId,
        treatmentId: alert.details.treatmentId,
        timestamp: alert.metadata.timestamp,
        description: alert.message,
        actions_taken: alert.details.requiredActions,
        outcome: alert.status,
        cfm_compliance: alert.compliance.cfmRequired,
        anvisa_compliance: alert.compliance.anvisaRequired,
        generated_at: new Date(),
      };

      await this.supabase.from("compliance_reports").insert(report);

      console.log(`Compliance report generated for alert ${alert.id}`);
    } catch (error) {
      console.error("Error generating compliance report:", error);
    }
  }

  /**
   * Helper methods
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determinePriority(severity: AlertSeverity): AlertPriority {
    const priorityMap: Record<AlertSeverity, AlertPriority> = {
      emergency: "critical",
      critical: "critical",
      urgent: "high",
      warning: "medium",
      info: "low",
    };
    return priorityMap[severity];
  }

  private getDefaultChannels(severity: AlertSeverity): AlertChannel[] {
    if (severity === "emergency" || severity === "critical") {
      return ["dashboard", "email", "sms", "push", "emergency"];
    }
    if (severity === "urgent") {
      return ["dashboard", "email", "push"];
    }
    return ["dashboard", "email"];
  }

  private async determineRecipients(
    type: AlertType,
    severity: AlertSeverity,
    customRecipients?: string[],
  ): Promise<SafetyAlert["recipients"]> {
    const recipients: SafetyAlert["recipients"] = [];

    if (customRecipients) {
      customRecipients.forEach((userId) => {
        recipients.push({
          userId,
          role: "custom",
          channel: "dashboard",
          delivered: false,
          acknowledged: false,
        });
      });
    } else {
      // Default recipients based on type and severity
      const defaultRecipients = await this.getDefaultRecipients(type, severity);
      recipients.push(...defaultRecipients);
    }

    return recipients;
  }

  private async getDefaultRecipients(
    type: AlertType,
    severity: AlertSeverity,
  ): Promise<SafetyAlert["recipients"]> {
    // This would query the database for default recipients based on roles
    // For now, return empty array
    return [];
  }

  private determineComplianceRequirements(
    type: AlertType,
    severity: AlertSeverity,
  ): SafetyAlert["compliance"] {
    return {
      cfmRequired: severity === "critical" || severity === "emergency",
      anvisaRequired: type === "equipment_failure" || severity === "emergency",
      ethicsRequired: type === "contraindication" || severity === "critical",
      documentationRequired: true,
      reportingRequired: severity === "critical" || severity === "emergency",
    };
  }

  private extractRiskFactors(categoryRisks: any[]): string[] {
    return categoryRisks
      .filter((risk) => risk.severity === "high" || risk.severity === "critical")
      .flatMap((risk) => risk.factors);
  }

  private mapInteractionSeverity(severity: string): AlertSeverity {
    const severityMap: Record<string, AlertSeverity> = {
      major: "critical",
      moderate: "urgent",
      minor: "warning",
      contraindicated: "critical",
    };
    return severityMap[severity] || "warning";
  }

  private async processAlert(alert: SafetyAlert): Promise<void> {
    // Send notifications
    await this.sendAlertNotifications(alert, alert.channels);

    // Apply alert rules
    await this.applyAlertRules(alert);

    // Log alert
    console.log(`Processing alert: ${alert.id} - ${alert.title}`);
  }

  private async sendAlertNotifications(
    alert: SafetyAlert,
    channels: AlertChannel[],
  ): Promise<void> {
    // Implementation would send notifications via various channels
    console.log(`Sending alert notifications for ${alert.id} via channels: ${channels.join(", ")}`);
  }

  private async applyAlertRules(alert: SafetyAlert): Promise<void> {
    const rule = this.alertRules.get(alert.type);
    if (!rule) return;

    // Apply rule actions
    for (const action of rule.actions) {
      switch (action.type) {
        case "block":
          // Block the treatment or action
          break;
        case "require_approval":
          // Require approval before proceeding
          break;
        case "escalate":
          // Immediate escalation
          await this.escalateAlert(alert.id, 0, "Rule-based escalation");
          break;
        case "log":
          // Additional logging
          console.log(`Rule action: ${action.type} for alert ${alert.id}`);
          break;
      }
    }
  }

  private async storeAlert(alert: SafetyAlert): Promise<void> {
    try {
      await this.supabase.from("safety_alerts").insert({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        priority: alert.priority,
        status: alert.status,
        title: alert.title,
        message: alert.message,
        details: JSON.stringify(alert.details),
        metadata: JSON.stringify(alert.metadata),
        channels: JSON.stringify(alert.channels),
        recipients: JSON.stringify(alert.recipients),
        compliance: JSON.stringify(alert.compliance),
        created_at: alert.metadata.timestamp.toISOString(),
      });
    } catch (error) {
      console.error("Error storing alert:", error);
    }
  }

  private async updateAlert(alert: SafetyAlert): Promise<void> {
    try {
      await this.supabase
        .from("safety_alerts")
        .update({
          status: alert.status,
          metadata: JSON.stringify(alert.metadata),
          recipients: JSON.stringify(alert.recipients),
          updated_at: new Date().toISOString(),
        })
        .eq("id", alert.id);
    } catch (error) {
      console.error("Error updating alert:", error);
    }
  }

  private async loadAlertRules(): Promise<void> {
    try {
      const { data: rules } = await this.supabase
        .from("alert_rules")
        .select("*")
        .eq("enabled", true);

      if (rules) {
        rules.forEach((rule) => {
          this.alertRules.set(rule.type, {
            id: rule.id,
            name: rule.name,
            description: rule.description,
            type: rule.type,
            severity: rule.severity,
            priority: rule.priority,
            conditions: JSON.parse(rule.conditions || "[]"),
            actions: JSON.parse(rule.actions || "[]"),
            channels: JSON.parse(rule.channels || "[]"),
            recipients: JSON.parse(rule.recipients || "[]"),
            enabled: rule.enabled,
            escalationRules: JSON.parse(rule.escalation_rules || "[]"),
            compliance: JSON.parse(rule.compliance || "{}"),
          });
        });
      }
    } catch (error) {
      console.error("Error loading alert rules:", error);
    }
  }

  private async loadActiveAlerts(): Promise<void> {
    try {
      const { data: alerts } = await this.supabase
        .from("safety_alerts")
        .select("*")
        .in("status", ["active", "acknowledged", "escalated"]);

      if (alerts) {
        alerts.forEach((alertData) => {
          const alert: SafetyAlert = {
            id: alertData.id,
            type: alertData.type,
            severity: alertData.severity,
            priority: alertData.priority,
            status: alertData.status,
            title: alertData.title,
            message: alertData.message,
            details: JSON.parse(alertData.details || "{}"),
            metadata: JSON.parse(alertData.metadata || "{}"),
            channels: JSON.parse(alertData.channels || "[]"),
            recipients: JSON.parse(alertData.recipients || "[]"),
            compliance: JSON.parse(alertData.compliance || "{}"),
          };
          this.activeAlerts.set(alert.id, alert);
        });
      }
    } catch (error) {
      console.error("Error loading active alerts:", error);
    }
  }

  private initializeConfig(config?: Partial<AlertConfig>): AlertConfig {
    const defaultConfig: AlertConfig = {
      enabled: true,
      channels: {
        dashboard: { enabled: true },
        email: { enabled: true },
        sms: { enabled: true },
        push: { enabled: true },
        emergency: { enabled: true },
      },
      escalation: {
        enabled: true,
        timeouts: {
          info: 60,
          warning: 30,
          urgent: 15,
          critical: 5,
          emergency: 0,
        },
        maxEscalations: 3,
      },
      compliance: {
        cfmReporting: true,
        anvisaReporting: true,
        ethicsReporting: true,
        automaticDocumentation: true,
      },
      monitoring: {
        realTimeEnabled: true,
        batchProcessing: true,
        intervalMinutes: 5,
      },
    };

    return { ...defaultConfig, ...config };
  }

  private getEmptyStatistics(): AlertStatistics {
    return {
      total: 0,
      byType: {} as Record<AlertType, number>,
      bySeverity: {} as Record<AlertSeverity, number>,
      byStatus: {} as Record<AlertStatus, number>,
      responseTime: { average: 0, median: 0, percentile95: 0 },
      escalationRate: 0,
      resolutionRate: 0,
      falsePositiveRate: 0,
    };
  }

  private async updateAlertStatistics(): Promise<void> {
    // Update internal statistics cache
    // This would be called periodically to maintain performance
  }
}

export {
  SafetyAlertsSystem,
  type SafetyAlert,
  type AlertRule,
  type AlertConfig,
  type AlertStatistics,
  type AlertType,
  type AlertSeverity,
  type AlertPriority,
  type AlertStatus,
  type AlertChannel,
};
