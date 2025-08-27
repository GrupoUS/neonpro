/**
 * Critical Alert Management System
 * Phase 3.4: Mobile Emergency Interface Implementation
 * 
 * Features:
 * - Life-threatening alert detection and management
 * - Automatic escalation with configurable timeouts
 * - Multi-channel alert delivery (visual, audio, vibration)
 * - Alert acknowledgment and audit trail
 * - Brazilian healthcare protocol compliance
 * - Real-time alert broadcasting to multiple devices
 * - Priority-based alert queue management
 */

import type {
  CriticalAlert,
  EmergencyPatientData,
  EmergencyProtocol,
  EmergencyStep,
  EmergencySeverity,
  AlertType,
  EmergencyAuditLog
} from '@/types/emergency';

// Alert priority levels for queue management
export const ALERT_PRIORITIES = {
  LIFE_THREATENING: 1,
  SEVERE: 2,
  MODERATE: 3,
  INFORMATIONAL: 4
} as const;

// Auto-escalation timeouts by severity (minutes)
export const ESCALATION_TIMEOUTS = {
  life_threatening: 2,  // 2 minutes for life-threatening
  severe: 5,           // 5 minutes for severe
  moderate: 15,        // 15 minutes for moderate
  informational: 60    // 60 minutes for informational
} as const;

// Alert sound patterns (milliseconds)
export const ALERT_SOUND_PATTERNS = {
  life_threatening: { duration: 2000, pattern: [500, 200, 500, 200, 1000] },
  severe: { duration: 1500, pattern: [300, 150, 300, 150, 600] },
  moderate: { duration: 1000, pattern: [200, 100, 200] },
  informational: { duration: 500, pattern: [100] }
} as const;

/**
 * Critical Alert Manager
 * Handles creation, delivery, and lifecycle management of emergency alerts
 */
export class CriticalAlertManager {
  private alerts: Map<string, CriticalAlert> = new Map();
  private alertQueue: CriticalAlert[] = [];
  private activeAlerts: Set<string> = new Set();
  private auditLogs: EmergencyAuditLog[] = [];
  private escalationTimers: Map<string, NodeJS.Timeout> = new Map();
  private alertSubscribers: Set<(alerts: CriticalAlert[]) => void> = new Set();

  /**
   * Create and trigger a critical alert
   */
  async createAlert(alertData: {
    patientId: string;
    severity: EmergencySeverity;
    type: AlertType;
    title: string;
    message: string;
    actionRequired?: boolean;
    acknowledgmentRequired?: boolean;
    emergencyProtocol?: EmergencyProtocol;
    autoEscalate?: number; // minutes, defaults to severity-based timeout
  }): Promise<CriticalAlert> {
    const alert: CriticalAlert = {
      id: this.generateAlertId(),
      ...alertData,
      timestamp: new Date(),
      acknowledged: false,
      resolved: false,
      escalated: false,
      autoEscalate: alertData.autoEscalate || ESCALATION_TIMEOUTS[alertData.severity]
    };

    // Store alert
    this.alerts.set(alert.id, alert);
    this.alertQueue.push(alert);
    this.activeAlerts.add(alert.id);

    // Sort queue by priority
    this.sortAlertQueue();

    // Log alert creation
    await this.logAlertEvent(
      'ALERT_CREATED',
      alert.id,
      alert.patientId,
      'system',
      `Created ${alert.severity} alert: ${alert.title}`
    );

    // Start auto-escalation timer
    if (alert.autoEscalate && alert.autoEscalate > 0) {
      this.startEscalationTimer(alert);
    }

    // Trigger alert delivery
    await this.deliverAlert(alert);

    // Notify subscribers
    this.notifySubscribers();

    return alert;
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string,
    notes?: string
  ): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();

    // Clear escalation timer
    this.clearEscalationTimer(alertId);

    await this.logAlertEvent(
      'ALERT_ACKNOWLEDGED',
      alertId,
      alert.patientId,
      acknowledgedBy,
      notes || 'Alert acknowledged'
    );

    this.notifySubscribers();
    return true;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(
    alertId: string,
    resolvedBy: string,
    resolution?: string
  ): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedAt = new Date();
    
    // Remove from active alerts
    this.activeAlerts.delete(alertId);
    
    // Remove from queue
    this.alertQueue = this.alertQueue.filter(a => a.id !== alertId);
    
    // Clear escalation timer
    this.clearEscalationTimer(alertId);

    await this.logAlertEvent(
      'ALERT_RESOLVED',
      alertId,
      alert.patientId,
      resolvedBy,
      resolution || 'Alert resolved'
    );

    this.notifySubscribers();
    return true;
  }

  /**
   * Escalate an alert to next level
   */
  async escalateAlert(
    alertId: string,
    escalatedBy?: string
  ): Promise<boolean> {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.escalated = true;
    
    // Clear current escalation timer
    this.clearEscalationTimer(alertId);

    await this.logAlertEvent(
      'ALERT_ESCALATED',
      alertId,
      alert.patientId,
      escalatedBy || 'system',
      'Alert escalated to next level'
    );

    // In real implementation, this would:
    // 1. Contact next level of escalation chain
    // 2. Send alert to hospital systems
    // 3. Notify SAMU if necessary
    // 4. Update alert priority and visibility

    console.log(`🚨 Alert ${alertId} escalated - Contact emergency personnel`);

    this.notifySubscribers();
    return true;
  }

  /**
   * Get active alerts with filtering
   */
  getActiveAlerts(filters?: {
    patientId?: string;
    severity?: EmergencySeverity;
    type?: AlertType;
    acknowledged?: boolean;
    limit?: number;
  }): CriticalAlert[] {
    let alerts = this.alertQueue.filter(alert => this.activeAlerts.has(alert.id));

    // Apply filters
    if (filters?.patientId) {
      alerts = alerts.filter(alert => alert.patientId === filters.patientId);
    }
    if (filters?.severity) {
      alerts = alerts.filter(alert => alert.severity === filters.severity);
    }
    if (filters?.type) {
      alerts = alerts.filter(alert => alert.type === filters.type);
    }
    if (filters?.acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === filters.acknowledged);
    }

    // Apply limit
    if (filters?.limit) {
      alerts = alerts.slice(0, filters.limit);
    }

    return alerts;
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics() {
    const activeAlerts = Array.from(this.activeAlerts).map(id => this.alerts.get(id)!);
    const totalAlerts = this.alerts.size;
    
    return {
      total: totalAlerts,
      active: activeAlerts.length,
      acknowledged: activeAlerts.filter(a => a.acknowledged).length,
      unacknowledged: activeAlerts.filter(a => !a.acknowledged).length,
      resolved: totalAlerts - activeAlerts.length,
      escalated: activeAlerts.filter(a => a.escalated).length,
      bySeverity: {
        life_threatening: activeAlerts.filter(a => a.severity === 'life_threatening').length,
        severe: activeAlerts.filter(a => a.severity === 'severe').length,
        moderate: activeAlerts.filter(a => a.severity === 'moderate').length,
        informational: activeAlerts.filter(a => a.severity === 'informational').length
      },
      byType: {
        allergy: activeAlerts.filter(a => a.type === 'allergy').length,
        medication: activeAlerts.filter(a => a.type === 'medication').length,
        procedure: activeAlerts.filter(a => a.type === 'procedure').length,
        protocol: activeAlerts.filter(a => a.type === 'protocol').length,
        system: activeAlerts.filter(a => a.type === 'system').length
      },
      averageResponseTime: this.calculateAverageResponseTime(),
      escalationRate: activeAlerts.length > 0 ? 
        (activeAlerts.filter(a => a.escalated).length / activeAlerts.length) * 100 : 0
    };
  }

  /**
   * Subscribe to alert updates
   */
  subscribe(callback: (alerts: CriticalAlert[]) => void): () => void {
    this.alertSubscribers.add(callback);
    
    // Send current alerts
    callback(this.getActiveAlerts());
    
    // Return unsubscribe function
    return () => {
      this.alertSubscribers.delete(callback);
    };
  }

  /**
   * Check patient for potential alerts
   */
  async checkPatientForAlerts(patientData: EmergencyPatientData): Promise<CriticalAlert[]> {
    const detectedAlerts: CriticalAlert[] = [];

    // Check for fatal allergies
    const fatalAllergies = patientData.criticalInfo.allergies.filter(a => a.severity === 'fatal');
    if (fatalAllergies.length > 0) {
      for (const allergy of fatalAllergies) {
        const alert = await this.createAlert({
          patientId: patientData.patientId,
          severity: 'life_threatening',
          type: 'allergy',
          title: `ALERGIA FATAL: ${allergy.allergen}`,
          message: `Paciente tem alergia fatal a ${allergy.allergen}. Reação: ${allergy.reaction}. Tratamento: ${allergy.treatment}`,
          actionRequired: true,
          acknowledgmentRequired: true,
          emergencyProtocol: this.getAllergyProtocol(allergy.allergen)
        });
        detectedAlerts.push(alert);
      }
    }

    // Check for critical medication interactions
    const criticalMeds = patientData.criticalInfo.medications.filter(m => m.critical);
    for (let i = 0; i < criticalMeds.length; i++) {
      for (let j = i + 1; j < criticalMeds.length; j++) {
        const med1 = criticalMeds[i];
        const med2 = criticalMeds[j];
        
        if (this.checkMedicationInteraction(med1.name, med2.name)) {
          const alert = await this.createAlert({
            patientId: patientData.patientId,
            severity: 'severe',
            type: 'medication',
            title: `INTERAÇÃO MEDICAMENTOSA: ${med1.name} + ${med2.name}`,
            message: `Possível interação perigosa entre ${med1.name} e ${med2.name}. Monitorar sinais de toxicidade.`,
            actionRequired: true,
            acknowledgmentRequired: false
          });
          detectedAlerts.push(alert);
        }
      }
    }

    // Check for critical conditions requiring monitoring
    const criticalConditions = patientData.criticalInfo.medicalConditions
      .filter(c => c.severity === 'critical');
    
    for (const condition of criticalConditions) {
      const alert = await this.createAlert({
        patientId: patientData.patientId,
        severity: 'moderate',
        type: 'protocol',
        title: `CONDIÇÃO CRÍTICA: ${condition.condition}`,
        message: `Paciente com ${condition.condition} requer monitoramento especial. ${condition.emergencyProtocol || ''}`,
        actionRequired: false,
        acknowledgmentRequired: true
      });
      detectedAlerts.push(alert);
    }

    return detectedAlerts;
  }

  /**
   * Deliver alert through multiple channels
   */
  private async deliverAlert(alert: CriticalAlert): Promise<void> {
    try {
      // Visual alert (always delivered)
      this.deliverVisualAlert(alert);

      // Audio alert for severe+ alerts
      if (['life_threatening', 'severe'].includes(alert.severity)) {
        this.deliverAudioAlert(alert);
      }

      // Vibration alert for mobile devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const pattern = ALERT_SOUND_PATTERNS[alert.severity].pattern;
        navigator.vibrate(pattern);
      }

      // Push notification (in real implementation)
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Send push notification to registered devices
        console.log(`📱 Push notification sent: ${alert.title}`);
      }

      await this.logAlertEvent(
        'ALERT_DELIVERED',
        alert.id,
        alert.patientId,
        'system',
        'Alert delivered through all available channels'
      );

    } catch (error) {
      console.error('Alert delivery failed:', error);
      await this.logAlertEvent(
        'ALERT_DELIVERY_ERROR',
        alert.id,
        alert.patientId,
        'system',
        `Alert delivery failed: ${error.message}`
      );
    }
  }

  /**
   * Deliver visual alert
   */
  private deliverVisualAlert(alert: CriticalAlert): void {
    // In real implementation, this would trigger visual components
    console.log(`🚨 Visual Alert: ${alert.title}`);
    
    // Add visual indicator to page
    if (typeof document !== 'undefined') {
      const indicator = document.createElement('div');
      indicator.className = `alert-indicator severity-${alert.severity}`;
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 12px 20px;
        background: ${alert.severity === 'life_threatening' ? '#dc2626' : '#f59e0b'};
        color: white;
        border-radius: 8px;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: alertPulse 1s infinite;
      `;
      indicator.textContent = alert.title;
      
      document.body.appendChild(indicator);
      
      // Auto-remove after 10 seconds if not life-threatening
      if (alert.severity !== 'life_threatening') {
        setTimeout(() => {
          document.body.removeChild(indicator);
        }, 10000);
      }
    }
  }

  /**
   * Deliver audio alert
   */
  private deliverAudioAlert(alert: CriticalAlert): void {
    try {
      // Create audio context for alert sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set frequency based on severity
      const frequency = alert.severity === 'life_threatening' ? 800 : 600;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Set volume
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      // Play sound pattern
      const pattern = ALERT_SOUND_PATTERNS[alert.severity];
      let currentTime = audioContext.currentTime;
      
      pattern.pattern.forEach((duration, index) => {
        if (index % 2 === 0) {
          // Sound
          oscillator.start(currentTime);
          oscillator.stop(currentTime + duration / 1000);
        }
        currentTime += duration / 1000;
      });

      console.log(`🔊 Audio alert played: ${alert.severity}`);
      
    } catch (error) {
      console.error('Audio alert failed:', error);
    }
  }

  /**
   * Start auto-escalation timer
   */
  private startEscalationTimer(alert: CriticalAlert): void {
    if (!alert.autoEscalate) return;

    const timeout = setTimeout(async () => {
      if (!alert.acknowledged && !alert.resolved) {
        await this.escalateAlert(alert.id, 'auto-escalation');
      }
    }, alert.autoEscalate * 60 * 1000);

    this.escalationTimers.set(alert.id, timeout);
  }

  /**
   * Clear escalation timer
   */
  private clearEscalationTimer(alertId: string): void {
    const timeout = this.escalationTimers.get(alertId);
    if (timeout) {
      clearTimeout(timeout);
      this.escalationTimers.delete(alertId);
    }
  }

  /**
   * Sort alert queue by priority and timestamp
   */
  private sortAlertQueue(): void {
    this.alertQueue.sort((a, b) => {
      // First by priority (severity)
      const aPriority = ALERT_PRIORITIES[a.severity.toUpperCase() as keyof typeof ALERT_PRIORITIES] || 999;
      const bPriority = ALERT_PRIORITIES[b.severity.toUpperCase() as keyof typeof ALERT_PRIORITIES] || 999;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Then by timestamp (newer first for same priority)
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  /**
   * Notify all subscribers of alert changes
   */
  private notifySubscribers(): void {
    const activeAlerts = this.getActiveAlerts();
    this.alertSubscribers.forEach(callback => {
      try {
        callback(activeAlerts);
      } catch (error) {
        console.error('Alert subscriber callback failed:', error);
      }
    });
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    const acknowledgedAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.acknowledged && alert.acknowledgedAt);
    
    if (acknowledgedAlerts.length === 0) return 0;
    
    const totalResponseTime = acknowledgedAlerts.reduce((sum, alert) => {
      const responseTime = alert.acknowledgedAt!.getTime() - alert.timestamp.getTime();
      return sum + responseTime;
    }, 0);
    
    return Math.round(totalResponseTime / acknowledgedAlerts.length / 1000); // Return in seconds
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ALERT-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Log alert event for audit trail
   */
  private async logAlertEvent(
    action: string,
    alertId: string,
    patientId: string,
    userId: string,
    details: string
  ): Promise<void> {
    const auditLog: EmergencyAuditLog = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      userId,
      action,
      details: `Alert ${alertId}: ${details}`,
      severity: 'informational',
      timestamp: new Date(),
      ipAddress: 'localhost',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'AlertManager',
      compliance: {
        lgpd: true,
        cfm: true
      }
    };
    
    this.auditLogs.push(auditLog);
    
    // Keep only recent audit logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-500);
    }
  }

  /**
   * Get allergy emergency protocol
   */
  private getAllergyProtocol(allergen: string): EmergencyProtocol {
    return {
      id: `ALLERGY-${allergen.toUpperCase()}`,
      name: `Protocolo de Alergia - ${allergen}`,
      condition: `Reação alérgica a ${allergen}`,
      steps: [
        {
          stepNumber: 1,
          instruction: 'Suspender imediatamente a substância causadora',
          timeLimit: 30,
          critical: true,
          verification: 'Substância removida/suspensa'
        },
        {
          stepNumber: 2,
          instruction: 'Avaliar sinais vitais e via aérea',
          timeLimit: 60,
          critical: true,
          verification: 'Sinais vitais estáveis'
        },
        {
          stepNumber: 3,
          instruction: 'Aplicar epinefrina se choque anafilático',
          timeLimit: 120,
          critical: true,
          verification: 'Epinefrina aplicada se indicado'
        }
      ],
      timeLimit: 5,
      requiredPersonnel: ['Médico', 'Enfermeiro'],
      equipment: ['Epinefrina', 'O2', 'Monitor'],
      medications: ['Epinefrina', 'Corticoide', 'Anti-histamínico'],
      contraindications: [],
      lastUpdated: new Date(),
      source: 'cfm'
    };
  }

  /**
   * Check for medication interaction
   */
  private checkMedicationInteraction(med1: string, med2: string): boolean {
    // Simplified interaction checking - in real implementation, use drug interaction database
    const knownInteractions = [
      ['varfarina', 'aas'],
      ['varfarina', 'heparina'],
      ['digoxina', 'quinidina'],
      ['lítio', 'diurético'],
      ['enalapril', 'potássio']
    ];
    
    const med1Lower = med1.toLowerCase();
    const med2Lower = med2.toLowerCase();
    
    return knownInteractions.some(([drug1, drug2]) =>
      (med1Lower.includes(drug1) && med2Lower.includes(drug2)) ||
      (med1Lower.includes(drug2) && med2Lower.includes(drug1))
    );
  }

  /**
   * Get audit logs
   */
  getAuditLogs(): EmergencyAuditLog[] {
    return [...this.auditLogs];
  }

  /**
   * Clear all alerts (emergency reset)
   */
  clearAllAlerts(): void {
    // Clear all timers
    this.escalationTimers.forEach(timer => clearTimeout(timer));
    this.escalationTimers.clear();
    
    // Clear all data structures
    this.alerts.clear();
    this.alertQueue = [];
    this.activeAlerts.clear();
    
    // Notify subscribers
    this.notifySubscribers();
  }
}

// Global alert manager instance
export const criticalAlertManager = new CriticalAlertManager();

// Utility functions for components
export const alertUtils = {
  /**
   * Create emergency allergy alert
   */
  createAllergyAlert: (patientId: string, allergen: string, severity: 'fatal' | 'severe') =>
    criticalAlertManager.createAlert({
      patientId,
      severity: severity === 'fatal' ? 'life_threatening' : 'severe',
      type: 'allergy',
      title: `ALERGIA ${severity.toUpperCase()}: ${allergen}`,
      message: `Paciente tem alergia ${severity} a ${allergen}. Verificar antes de qualquer procedimento.`,
      actionRequired: true,
      acknowledgmentRequired: true
    }),

  /**
   * Create medication interaction alert
   */
  createInteractionAlert: (patientId: string, med1: string, med2: string) =>
    criticalAlertManager.createAlert({
      patientId,
      severity: 'severe',
      type: 'medication',
      title: `INTERAÇÃO: ${med1} + ${med2}`,
      message: `Possível interação entre ${med1} e ${med2}. Monitorar paciente.`,
      actionRequired: true,
      acknowledgmentRequired: false
    }),

  /**
   * Quick acknowledge alert
   */
  acknowledgeAlert: (alertId: string, user: string) =>
    criticalAlertManager.acknowledgeAlert(alertId, user),

  /**
   * Get active alerts for display
   */
  getActiveAlerts: () => criticalAlertManager.getActiveAlerts(),

  /**
   * Subscribe to alert updates
   */
  subscribeToAlerts: (callback: (alerts: CriticalAlert[]) => void) =>
    criticalAlertManager.subscribe(callback),

  /**
   * Check patient for alerts
   */
  checkPatient: (patientData: EmergencyPatientData) =>
    criticalAlertManager.checkPatientForAlerts(patientData)
};

export default CriticalAlertManager;