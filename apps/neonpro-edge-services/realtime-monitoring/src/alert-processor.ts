import type {
  Env,
  VitalSigns,
  SystemAlert,
  AlertType,
  AlertSeverity,
  VitalSignsRange,
} from "./types";
import { v4 as uuidv4 } from "uuid";

export class AlertProcessor {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async processVitalSigns(vitalSigns: VitalSigns): Promise<SystemAlert[]> {
    const alerts: SystemAlert[] = [];

    try {
      // Get patient age group for appropriate ranges
      const patientInfo = await this.getPatientInfo(vitalSigns.patientId, vitalSigns.tenantId);
      const ageGroup = this.determineAgeGroup(patientInfo?.dateOfBirth);

      // Define normal ranges based on age group
      const vitalRanges = this.getVitalSignsRanges(ageGroup);

      // Check each vital sign parameter
      for (const range of vitalRanges) {
        const value = vitalSigns[range.parameter];
        if (value === undefined || value === null) continue;

        const alert = this.checkVitalSignRange(vitalSigns, range, value);
        if (alert) {
          alerts.push(alert);
        }
      }

      // Store alerts in database and cache
      for (const alert of alerts) {
        await this.storeAlert(alert);
      }

      return alerts;
    } catch (error) {
      console.error("Error processing vital signs alerts:", error);
      return [];
    }
  }

  private async getPatientInfo(patientId: string, tenantId: string): Promise<any> {
    try {
      const result = await this.env.NEONPRO_DB.prepare(`
        SELECT date_of_birth, gender, medical_conditions 
        FROM patients 
        WHERE id = ? AND tenant_id = ?
      `)
        .bind(patientId, tenantId)
        .first();

      return result;
    } catch (error) {
      console.error("Error fetching patient info:", error);
      return null;
    }
  }

  private determineAgeGroup(dateOfBirth?: string): "pediatric" | "adult" | "elderly" {
    if (!dateOfBirth) return "adult";

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const ageInYears = today.getFullYear() - birthDate.getFullYear();

    if (ageInYears < 18) return "pediatric";
    if (ageInYears >= 65) return "elderly";
    return "adult";
  }

  private getVitalSignsRanges(ageGroup: "pediatric" | "adult" | "elderly"): VitalSignsRange[] {
    const ranges: VitalSignsRange[] = [
      // Blood pressure (systolic)
      {
        parameter: "systolicBP",
        minNormal: ageGroup === "pediatric" ? 90 : ageGroup === "elderly" ? 110 : 90,
        maxNormal: ageGroup === "pediatric" ? 120 : ageGroup === "elderly" ? 150 : 140,
        minCritical: 70,
        maxCritical: ageGroup === "elderly" ? 180 : 160,
        unit: "mmHg",
        ageGroup,
      },
      // Blood pressure (diastolic)
      {
        parameter: "diastolicBP",
        minNormal: ageGroup === "pediatric" ? 50 : 60,
        maxNormal: ageGroup === "pediatric" ? 80 : ageGroup === "elderly" ? 95 : 90,
        minCritical: 40,
        maxCritical: ageGroup === "elderly" ? 110 : 100,
        unit: "mmHg",
        ageGroup,
      },
      // Heart rate
      {
        parameter: "heartRate",
        minNormal: ageGroup === "pediatric" ? 80 : ageGroup === "elderly" ? 50 : 60,
        maxNormal: ageGroup === "pediatric" ? 120 : ageGroup === "elderly" ? 90 : 100,
        minCritical: ageGroup === "pediatric" ? 60 : 40,
        maxCritical: ageGroup === "pediatric" ? 160 : ageGroup === "elderly" ? 120 : 130,
        unit: "bpm",
        ageGroup,
      },
      // Temperature
      {
        parameter: "temperature",
        minNormal: 36.1,
        maxNormal: 37.2,
        minCritical: 35.0,
        maxCritical: 40.0,
        unit: "°C",
        ageGroup,
      },
      // Oxygen saturation
      {
        parameter: "oxygenSaturation",
        minNormal: ageGroup === "elderly" ? 92 : 95,
        maxNormal: 100,
        minCritical: 85,
        maxCritical: 100,
        unit: "%",
        ageGroup,
      },
      // Respiratory rate
      {
        parameter: "respiratoryRate",
        minNormal: ageGroup === "pediatric" ? 20 : ageGroup === "elderly" ? 12 : 12,
        maxNormal: ageGroup === "pediatric" ? 40 : ageGroup === "elderly" ? 25 : 20,
        minCritical: ageGroup === "pediatric" ? 15 : 8,
        maxCritical: ageGroup === "pediatric" ? 60 : 35,
        unit: "breaths/min",
        ageGroup,
      },
      // Blood glucose
      {
        parameter: "bloodGlucose",
        minNormal: 70,
        maxNormal: 140, // Post-meal can be higher
        minCritical: 40,
        maxCritical: 400,
        unit: "mg/dL",
        ageGroup,
      },
    ];

    return ranges;
  }

  private checkVitalSignRange(
    vitalSigns: VitalSigns,
    range: VitalSignsRange,
    value: number,
  ): SystemAlert | null {
    let alertType: AlertType | null = null;
    let severity: AlertSeverity = "low";
    let message = "";

    // Check critical ranges first
    if (range.minCritical !== undefined && value < range.minCritical) {
      alertType = "vital_signs_critical";
      severity = "critical";
      message = `${this.getParameterDisplayName(range.parameter)} critically low: ${value} ${range.unit} (normal: ${range.minNormal}-${range.maxNormal} ${range.unit})`;
    } else if (range.maxCritical !== undefined && value > range.maxCritical) {
      alertType = "vital_signs_critical";
      severity = "critical";
      message = `${this.getParameterDisplayName(range.parameter)} critically high: ${value} ${range.unit} (normal: ${range.minNormal}-${range.maxNormal} ${range.unit})`;
    }
    // Check abnormal ranges
    else if (value < range.minNormal) {
      alertType = "vital_signs_abnormal";
      severity = "medium";
      message = `${this.getParameterDisplayName(range.parameter)} below normal: ${value} ${range.unit} (normal: ${range.minNormal}-${range.maxNormal} ${range.unit})`;
    } else if (value > range.maxNormal) {
      alertType = "vital_signs_abnormal";
      severity = "medium";
      message = `${this.getParameterDisplayName(range.parameter)} above normal: ${value} ${range.unit} (normal: ${range.minNormal}-${range.maxNormal} ${range.unit})`;
    }

    if (!alertType) return null;

    const alert: SystemAlert = {
      id: uuidv4(),
      tenantId: vitalSigns.tenantId,
      type: alertType,
      severity,
      title: `Vital Signs Alert - ${this.getParameterDisplayName(range.parameter)}`,
      message,
      source: "vital_signs_monitor",
      sourceId: vitalSigns.id,
      patientId: vitalSigns.patientId,
      metadata: {
        parameter: range.parameter,
        value,
        normalRange: { min: range.minNormal, max: range.maxNormal },
        criticalRange: { min: range.minCritical, max: range.maxCritical },
        ageGroup: range.ageGroup,
        recordedBy: vitalSigns.recordedBy,
        deviceId: vitalSigns.deviceId,
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
      expiresAt: this.calculateExpirationTime(severity),
    };

    return alert;
  }

  private getParameterDisplayName(parameter: keyof VitalSigns): string {
    const displayNames: Record<string, string> = {
      systolicBP: "Systolic Blood Pressure",
      diastolicBP: "Diastolic Blood Pressure",
      heartRate: "Heart Rate",
      temperature: "Body Temperature",
      respiratoryRate: "Respiratory Rate",
      oxygenSaturation: "Oxygen Saturation",
      bloodGlucose: "Blood Glucose",
      weight: "Weight",
      height: "Height",
    };

    return displayNames[parameter as string] || (parameter as string);
  }

  private calculateExpirationTime(severity: AlertSeverity): string {
    const now = new Date();
    let hoursToAdd = 24; // Default 24 hours

    switch (severity) {
      case "critical":
      case "emergency":
        hoursToAdd = 72; // 3 days for critical alerts
        break;
      case "high":
        hoursToAdd = 48; // 2 days for high priority
        break;
      case "medium":
        hoursToAdd = 24; // 1 day for medium priority
        break;
      case "low":
        hoursToAdd = 12; // 12 hours for low priority
        break;
    }

    now.setHours(now.getHours() + hoursToAdd);
    return now.toISOString();
  }

  private async storeAlert(alert: SystemAlert): Promise<void> {
    try {
      // Store in D1 database
      await this.env.NEONPRO_DB.prepare(`
        INSERT INTO system_alerts (
          id, tenant_id, type, severity, title, message, source, source_id,
          patient_id, user_id, metadata, is_resolved, created_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
        .bind(
          alert.id,
          alert.tenantId,
          alert.type,
          alert.severity,
          alert.title,
          alert.message,
          alert.source,
          alert.sourceId,
          alert.patientId,
          alert.userId,
          JSON.stringify(alert.metadata),
          alert.isResolved,
          alert.createdAt,
          alert.expiresAt,
        )
        .run();

      // Cache active alerts for quick access
      const alertsKey = `alerts:${alert.tenantId}:active`;
      const cached = await this.env.ALERT_STORAGE.get(alertsKey);
      let activeAlerts: SystemAlert[] = cached ? JSON.parse(cached) : [];

      activeAlerts.unshift(alert); // Add to beginning

      // Keep only last 100 alerts in cache
      if (activeAlerts.length > 100) {
        activeAlerts = activeAlerts.slice(0, 100);
      }

      await this.env.ALERT_STORAGE.put(alertsKey, JSON.stringify(activeAlerts), {
        expirationTtl: 3600,
      });

      // Store individual alert for quick lookup
      await this.env.ALERT_STORAGE.put(`alert:${alert.id}`, JSON.stringify(alert), {
        expirationTtl: 86400,
      });
    } catch (error) {
      console.error("Error storing alert:", error);
    }
  }

  async processAppointmentAlert(
    appointmentId: string,
    tenantId: string,
    alertType: "missed" | "overdue",
  ): Promise<SystemAlert | null> {
    try {
      // Get appointment details
      const appointment = await this.env.NEONPRO_DB.prepare(`
        SELECT * FROM appointments WHERE id = ? AND tenant_id = ?
      `)
        .bind(appointmentId, tenantId)
        .first();

      if (!appointment) return null;

      const severity: AlertSeverity = alertType === "missed" ? "high" : "medium";
      const title = alertType === "missed" ? "Missed Appointment" : "Overdue Appointment";
      const message = `${title}: Patient ${appointment.patient_name} ${alertType === "missed" ? "missed" : "is overdue for"} appointment scheduled at ${new Date(appointment.scheduled_at).toLocaleString("pt-BR")}`;

      const alert: SystemAlert = {
        id: uuidv4(),
        tenantId,
        type: alertType === "missed" ? "appointment_missed" : "appointment_overdue",
        severity,
        title,
        message,
        source: "appointment_system",
        sourceId: appointmentId,
        patientId: appointment.patient_id,
        metadata: {
          appointmentType: appointment.type,
          scheduledAt: appointment.scheduled_at,
          providerId: appointment.provider_id,
          roomId: appointment.room_id,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
        expiresAt: this.calculateExpirationTime(severity),
      };

      await this.storeAlert(alert);
      return alert;
    } catch (error) {
      console.error("Error processing appointment alert:", error);
      return null;
    }
  }

  async processEquipmentAlert(
    equipmentId: string,
    tenantId: string,
    alertData: {
      type: "malfunction" | "maintenance_due" | "calibration_needed";
      message: string;
      severity?: AlertSeverity;
    },
  ): Promise<SystemAlert | null> {
    try {
      const severity = alertData.severity || "medium";
      const alertType: AlertType = "equipment_malfunction";

      const alert: SystemAlert = {
        id: uuidv4(),
        tenantId,
        type: alertType,
        severity,
        title: `Equipment Alert - ${alertData.type.replace("_", " ").toUpperCase()}`,
        message: alertData.message,
        source: "equipment_monitor",
        sourceId: equipmentId,
        metadata: {
          equipmentId,
          alertSubType: alertData.type,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
        expiresAt: this.calculateExpirationTime(severity),
      };

      await this.storeAlert(alert);
      return alert;
    } catch (error) {
      console.error("Error processing equipment alert:", error);
      return null;
    }
  }

  async resolveAlert(alertId: string, userId: string, tenantId: string): Promise<boolean> {
    try {
      // Update database
      await this.env.NEONPRO_DB.prepare(`
        UPDATE system_alerts 
        SET is_resolved = TRUE, resolved_by = ?, resolved_at = ? 
        WHERE id = ? AND tenant_id = ?
      `)
        .bind(userId, new Date().toISOString(), alertId, tenantId)
        .run();

      // Update cache
      const alertKey = `alert:${alertId}`;
      const alertData = await this.env.ALERT_STORAGE.get(alertKey);

      if (alertData) {
        const alert = JSON.parse(alertData);
        alert.isResolved = true;
        alert.resolvedBy = userId;
        alert.resolvedAt = new Date().toISOString();

        await this.env.ALERT_STORAGE.put(alertKey, JSON.stringify(alert), { expirationTtl: 86400 });
      }

      // Update active alerts cache
      const alertsKey = `alerts:${tenantId}:active`;
      const cached = await this.env.ALERT_STORAGE.get(alertsKey);

      if (cached) {
        const activeAlerts: SystemAlert[] = JSON.parse(cached);
        const updatedAlerts = activeAlerts.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                isResolved: true,
                resolvedBy: userId,
                resolvedAt: new Date().toISOString(),
              }
            : alert,
        );

        await this.env.ALERT_STORAGE.put(alertsKey, JSON.stringify(updatedAlerts), {
          expirationTtl: 3600,
        });
      }

      return true;
    } catch (error) {
      console.error("Error resolving alert:", error);
      return false;
    }
  }

  async getActiveAlerts(
    tenantId: string,
    filters?: {
      severity?: AlertSeverity[];
      type?: AlertType[];
      patientId?: string;
      limit?: number;
    },
  ): Promise<SystemAlert[]> {
    try {
      // Try cache first
      const alertsKey = `alerts:${tenantId}:active`;
      const cached = await this.env.ALERT_STORAGE.get(alertsKey);

      if (cached) {
        let alerts: SystemAlert[] = JSON.parse(cached);

        // Apply filters
        if (filters) {
          if (filters.severity) {
            alerts = alerts.filter((alert) => filters.severity!.includes(alert.severity));
          }
          if (filters.type) {
            alerts = alerts.filter((alert) => filters.type!.includes(alert.type));
          }
          if (filters.patientId) {
            alerts = alerts.filter((alert) => alert.patientId === filters.patientId);
          }
          if (filters.limit) {
            alerts = alerts.slice(0, filters.limit);
          }
        }

        return alerts;
      }

      // Query from database
      let query = `
        SELECT * FROM system_alerts 
        WHERE tenant_id = ? AND is_resolved = FALSE 
      `;
      const params: any[] = [tenantId];

      if (filters?.severity) {
        query += ` AND severity IN (${filters.severity.map(() => "?").join(",")})`;
        params.push(...filters.severity);
      }

      if (filters?.type) {
        query += ` AND type IN (${filters.type.map(() => "?").join(",")})`;
        params.push(...filters.type);
      }

      if (filters?.patientId) {
        query += ` AND patient_id = ?`;
        params.push(filters.patientId);
      }

      query += ` ORDER BY created_at DESC`;

      if (filters?.limit) {
        query += ` LIMIT ?`;
        params.push(filters.limit);
      } else {
        query += ` LIMIT 100`;
      }

      const result = await this.env.NEONPRO_DB.prepare(query)
        .bind(...params)
        .all();
      const alerts = (result.results || []) as SystemAlert[];

      // Cache results
      await this.env.ALERT_STORAGE.put(alertsKey, JSON.stringify(alerts), { expirationTtl: 300 });

      return alerts;
    } catch (error) {
      console.error("Error getting active alerts:", error);
      return [];
    }
  }
}
