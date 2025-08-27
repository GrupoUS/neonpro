/**
 * SAMU Integration System - Brazilian Emergency Services
 * Phase 3.4: Mobile Emergency Interface Implementation
 * 
 * Features:
 * - SAMU 192 emergency calling with patient context
 * - GPS location sharing for ambulance dispatch
 * - Hospital network notifications and routing
 * - Emergency escalation chain management
 * - Complete audit trail for CFM compliance
 * - Multi-language support (Portuguese + English)
 * - Real-time status tracking and updates
 */

import type {
  SAMUEmergencyCall,
  EmergencyPatientData,
  GPSCoordinates,
  HospitalInfo,
  EmergencyEscalation,
  EmergencyType,
  EmergencySeverity,
  DoctorContact,
  EmergencyAuditLog
} from '@/types/emergency';

// Brazilian emergency service numbers
export const EMERGENCY_NUMBERS = {
  SAMU: '192',                    // Medical emergency
  BOMBEIROS: '193',               // Fire department / rescue
  POLICIA_MILITAR: '190',         // Police
  POLICIA_CIVIL: '197',          // Civil police
  DEFESA_CIVIL: '199'            // Civil defense
} as const;

// Emergency call priorities based on Brazilian protocols
export const EMERGENCY_PRIORITIES = {
  DELTA: { code: 'DELTA', description: 'Risco iminente de morte', responseTime: 8 },
  CHARLIE: { code: 'CHARLIE', description: 'Potencialmente grave', responseTime: 15 },
  BRAVO: { code: 'BRAVO', description: 'Urgência', responseTime: 30 },
  ALPHA: { code: 'ALPHA', description: 'Não urgente', responseTime: 60 }
} as const;

// Sample hospitals in São Paulo for emergency routing
const SAO_PAULO_HOSPITALS: HospitalInfo[] = [
  {
    id: 'HOSPITAL-001',
    name: 'Hospital das Clínicas da FMUSP',
    address: 'Av. Dr. Enéas de Carvalho Aguiar, 255 - Cerqueira César, São Paulo - SP',
    coordinates: { latitude: -23.5558, longitude: -46.6696, accuracy: 10, timestamp: new Date() },
    phone: '(11) 2661-0000',
    emergencyPhone: '(11) 2661-7777',
    capabilities: ['Trauma', 'Cardiologia', 'Neurologia', 'Cirurgia'],
    cnes: '2077469'
  },
  {
    id: 'HOSPITAL-002', 
    name: 'Hospital Sírio-Libanês',
    address: 'R. Dona Adma Jafet, 91 - Bela Vista, São Paulo - SP',
    coordinates: { latitude: -23.5618, longitude: -46.6526, accuracy: 10, timestamp: new Date() },
    phone: '(11) 3394-5000',
    emergencyPhone: '(11) 3394-5911',
    capabilities: ['Emergência 24h', 'UTI', 'Hemodinâmica'],
    cnes: '2078015'
  }
];

/**
 * SAMU Integration Manager
 * Handles emergency calls, hospital routing, and escalation chains
 */
export class SAMUIntegrationManager {
  private activeCall: SAMUEmergencyCall | null = null;
  private auditLogs: EmergencyAuditLog[] = [];
  private escalationQueue: EmergencyEscalation[] = [];
  
  /**
   * Initiate emergency call to SAMU 192
   */
  async initiateEmergencyCall(
    patientData: EmergencyPatientData,
    emergencyType: EmergencyType,
    location: GPSCoordinates,
    callerInfo: {
      name: string;
      phone: string;
      relationship: string;
    }
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
      // Create emergency call data
      const callData: SAMUEmergencyCall = {
        id: this.generateCallId(),
        patientId: patientData.patientId,
        location,
        emergencyType,
        severity: this.determineSeverity(patientData, emergencyType),
        criticalInfo: this.formatCriticalInfo(patientData),
        callerInfo,
        timestamp: new Date(),
        status: 'calling'
      };

      // Find responsible doctor
      if (patientData.criticalInfo.emergencyContacts.length > 0) {
        const primaryContact = patientData.criticalInfo.emergencyContacts
          .sort((a, b) => a.priority - b.priority)[0];
        
        // Mock doctor data - in real implementation, lookup from database
        callData.responsibleDoctor = {
          id: 'DOC-001',
          name: primaryContact.name,
          crm: '123456',
          specialty: 'Medicina de Emergência',
          phone: primaryContact.phone,
          emergencyPhone: primaryContact.alternativePhone,
          available24h: true
        };
      }

      this.activeCall = callData;

      // Log the emergency call attempt
      await this.logEmergencyEvent(
        'SAMU_CALL_INITIATED',
        patientData.patientId,
        'system',
        `Emergency call initiated for ${emergencyType}`,
        'life_threatening'
      );

      // In real implementation, this would:
      // 1. Connect to telephony API (Twilio, AWS Connect, etc.)
      // 2. Establish 3-way call with user, SAMU, and system
      // 3. Send structured data to SAMU dispatch system
      // 4. Monitor call status and update in real-time

      // Simulate call connection
      setTimeout(() => {
        this.updateCallStatus(callData.id, 'dispatched');
      }, 2000);

      // Find nearest hospital and notify
      const nearestHospital = this.findNearestHospital(location);
      if (nearestHospital) {
        await this.notifyHospital(callData, nearestHospital);
      }

      return { success: true, callId: callData.id };
      
    } catch (error) {
      console.error('SAMU call initiation failed:', error);
      
      await this.logEmergencyEvent(
        'SAMU_CALL_ERROR',
        patientData.patientId,
        'system',
        `SAMU call failed: ${error.message}`,
        'severe'
      );
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Update call status and notify stakeholders
   */
  async updateCallStatus(
    callId: string,
    status: SAMUEmergencyCall['status']
  ): Promise<void> {
    if (this.activeCall?.id === callId) {
      this.activeCall.status = status;
      
      // Estimate arrival time based on status
      if (status === 'dispatched') {
        this.activeCall.estimatedArrivalTime = 12; // 12 minutes average in São Paulo
        this.activeCall.samuUnit = 'USA-' + Math.floor(Math.random() * 999).toString().padStart(3, '0');
      }
      
      await this.logEmergencyEvent(
        'SAMU_STATUS_UPDATE',
        this.activeCall.patientId,
        'samu',
        `Call status updated to: ${status}`,
        'informational'
      );
      
      // In real implementation, send push notification to user
      console.log(`🚑 SAMU Update: ${status} - ETA: ${this.activeCall.estimatedArrivalTime || 'N/A'} min`);
    }
  }

  /**
   * Create emergency escalation chain
   */
  async createEscalationChain(
    patientData: EmergencyPatientData,
    triggerEvent: string,
    initialLevel: 1 | 2 | 3 | 4 = 1
  ): Promise<EmergencyEscalation> {
    const escalation: EmergencyEscalation = {
      id: this.generateEscalationId(),
      patientId: patientData.patientId,
      triggerEvent,
      escalationLevel: initialLevel,
      contacts: this.buildEscalationContacts(patientData),
      timestamp: new Date(),
      status: 'pending'
    };

    this.escalationQueue.push(escalation);

    // Start escalation process
    await this.processEscalation(escalation);

    return escalation;
  }

  /**
   * Process escalation step by step
   */
  private async processEscalation(escalation: EmergencyEscalation): Promise<void> {
    try {
      escalation.status = 'contacted';
      
      // Escalation levels:
      // 1: Responsible doctor
      // 2: Clinic emergency contact
      // 3: Hospital network
      // 4: SAMU 192
      
      const contact = escalation.contacts[escalation.escalationLevel - 1];
      if (contact) {
        await this.contactEmergencyPersonnel(contact, escalation);
        
        // Wait for response (mock - in real implementation, wait for actual response)
        setTimeout(async () => {
          const responseReceived = Math.random() > 0.3; // 70% response rate simulation
          
          if (responseReceived) {
            escalation.status = 'responded';
            escalation.responseTime = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
            
            await this.logEmergencyEvent(
              'ESCALATION_RESPONDED',
              escalation.patientId,
              contact.id,
              `Escalation level ${escalation.escalationLevel} responded`,
              'informational'
            );
          } else {
            // Escalate to next level
            await this.escalateToNextLevel(escalation);
          }
        }, 30000); // 30 seconds wait time
      }
      
    } catch (error) {
      escalation.status = 'escalated';
      console.error('Escalation processing failed:', error);
    }
  }

  /**
   * Escalate to next level
   */
  private async escalateToNextLevel(escalation: EmergencyEscalation): Promise<void> {
    if (escalation.escalationLevel < 4) {
      escalation.escalationLevel = (escalation.escalationLevel + 1) as 1 | 2 | 3 | 4;
      escalation.status = 'escalated';
      
      await this.logEmergencyEvent(
        'ESCALATION_LEVEL_UP',
        escalation.patientId,
        'system',
        `Escalated to level ${escalation.escalationLevel}`,
        'severe'
      );
      
      // Process next level
      await this.processEscalation(escalation);
    } else {
      escalation.status = 'resolved';
      
      await this.logEmergencyEvent(
        'ESCALATION_MAX_LEVEL',
        escalation.patientId,
        'system',
        'Maximum escalation level reached - SAMU contacted',
        'life_threatening'
      );
    }
  }

  /**
   * Contact emergency personnel
   */
  private async contactEmergencyPersonnel(
    contact: DoctorContact,
    escalation: EmergencyEscalation
  ): Promise<void> {
    // In real implementation, this would:
    // 1. Send SMS with emergency details
    // 2. Make automated phone call
    // 3. Send push notification to hospital app
    // 4. Update hospital information systems
    
    console.log(`📞 Contacting: ${contact.name} (${contact.phone}) - Level ${escalation.escalationLevel}`);
    
    await this.logEmergencyEvent(
      'PERSONNEL_CONTACTED',
      escalation.patientId,
      contact.id,
      `Emergency personnel contacted: ${contact.name}`,
      'informational'
    );
  }

  /**
   * Determine emergency severity based on patient data
   */
  private determineSeverity(
    patientData: EmergencyPatientData,
    emergencyType: EmergencyType
  ): EmergencySeverity {
    // High severity conditions
    if (emergencyType === 'cardiac' || emergencyType === 'respiratory') {
      return 'life_threatening';
    }
    
    // Check for fatal allergies
    const hasFatalAllergies = patientData.criticalInfo.allergies
      .some(allergy => allergy.severity === 'fatal');
    
    // Check for critical conditions
    const hasCriticalConditions = patientData.criticalInfo.medicalConditions
      .some(condition => condition.severity === 'critical');
    
    if (hasFatalAllergies || hasCriticalConditions) {
      return emergencyType === 'allergic_reaction' ? 'life_threatening' : 'severe';
    }
    
    // Age-based severity adjustment
    if (patientData.age >= 75 || patientData.age <= 2) {
      return 'severe';
    }
    
    return 'moderate';
  }

  /**
   * Format critical patient information for SAMU operators
   */
  private formatCriticalInfo(patientData: EmergencyPatientData): string {
    const info: string[] = [];
    
    // Basic patient info
    info.push(`PACIENTE: ${patientData.name}, ${patientData.age} anos`);
    
    if (patientData.bloodType) {
      info.push(`TIPO SANGUÍNEO: ${patientData.bloodType}`);
    }
    
    // Fatal allergies (highest priority)
    const fatalAllergies = patientData.criticalInfo.allergies
      .filter(allergy => allergy.severity === 'fatal');
    
    if (fatalAllergies.length > 0) {
      info.push(`⚠️ ALERGIAS FATAIS: ${fatalAllergies.map(a => a.allergen).join(', ')}`);
    }
    
    // Critical medical conditions
    const criticalConditions = patientData.criticalInfo.medicalConditions
      .filter(condition => condition.severity === 'critical');
    
    if (criticalConditions.length > 0) {
      info.push(`CONDIÇÕES CRÍTICAS: ${criticalConditions.map(c => c.condition).join(', ')}`);
    }
    
    // Critical medications
    const criticalMeds = patientData.criticalInfo.medications
      .filter(med => med.critical);
    
    if (criticalMeds.length > 0) {
      info.push(`MEDICAÇÕES CRÍTICAS: ${criticalMeds.map(m => m.name).join(', ')}`);
    }
    
    // DNR status
    if (patientData.dnr) {
      info.push('⚠️ DIRETRIZ DE NÃO RESSUSCITAÇÃO (DNR)');
    }
    
    // Emergency contacts
    const primaryContact = patientData.criticalInfo.emergencyContacts
      .find(contact => contact.priority === 1);
    
    if (primaryContact) {
      info.push(`CONTATO PRIMÁRIO: ${primaryContact.name} - ${primaryContact.phone}`);
    }
    
    // Additional emergency notes
    if (patientData.emergencyNotes) {
      info.push(`OBSERVAÇÕES: ${patientData.emergencyNotes}`);
    }
    
    return info.join(' | ');
  }

  /**
   * Find nearest hospital for ambulance routing
   */
  private findNearestHospital(location: GPSCoordinates): HospitalInfo | null {
    if (SAO_PAULO_HOSPITALS.length === 0) return null;
    
    // Calculate distances using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    
    let nearestHospital = SAO_PAULO_HOSPITALS[0];
    let minDistance = calculateDistance(
      location.latitude,
      location.longitude,
      nearestHospital.coordinates.latitude,
      nearestHospital.coordinates.longitude
    );
    
    for (const hospital of SAO_PAULO_HOSPITALS.slice(1)) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        hospital.coordinates.latitude,
        hospital.coordinates.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestHospital = hospital;
      }
    }
    
    // Add estimated time to hospital
    nearestHospital.estimatedTime = Math.ceil(minDistance * 2); // Rough estimate: 2 min per km
    
    return nearestHospital;
  }

  /**
   * Notify receiving hospital about incoming emergency
   */
  private async notifyHospital(
    callData: SAMUEmergencyCall,
    hospital: HospitalInfo
  ): Promise<void> {
    // In real implementation, this would:
    // 1. Send structured data to hospital information system
    // 2. Alert emergency department staff
    // 3. Prepare appropriate resources based on emergency type
    // 4. Update bed availability if needed
    
    console.log(`🏥 Hospital notification sent to: ${hospital.name}`);
    console.log(`   Emergency type: ${callData.emergencyType}`);
    console.log(`   ETA: ${hospital.estimatedTime} minutes`);
    
    await this.logEmergencyEvent(
      'HOSPITAL_NOTIFIED',
      callData.patientId,
      'system',
      `Hospital ${hospital.name} notified of incoming emergency`,
      'informational'
    );
  }

  /**
   * Build escalation contacts based on patient data
   */
  private buildEscalationContacts(patientData: EmergencyPatientData): DoctorContact[] {
    const contacts: DoctorContact[] = [];
    
    // Level 1: Primary emergency contact (if they're medical professional)
    const primaryContact = patientData.criticalInfo.emergencyContacts
      .find(contact => contact.priority === 1);
    
    if (primaryContact) {
      contacts.push({
        id: `CONTACT-${primaryContact.id}`,
        name: primaryContact.name,
        crm: 'PENDING', // In real implementation, lookup CRM if medical professional
        specialty: 'Contato de Emergência',
        phone: primaryContact.phone,
        emergencyPhone: primaryContact.alternativePhone,
        available24h: true
      });
    }
    
    // Level 2: Clinic emergency contact (mock data)
    contacts.push({
      id: 'CLINIC-EMERGENCY',
      name: 'Plantão NeonPro',
      crm: '654321',
      specialty: 'Medicina de Emergência',
      phone: '(11) 3000-0000',
      emergencyPhone: '(11) 99999-0000',
      available24h: true
    });
    
    // Level 3: Hospital emergency department
    contacts.push({
      id: 'HOSPITAL-EMERGENCY',
      name: 'Hospital das Clínicas - Emergência',
      crm: 'INSTITUTIONAL',
      specialty: 'Medicina de Emergência',
      phone: '(11) 2661-7777',
      emergencyPhone: '(11) 2661-7777',
      hospital: 'Hospital das Clínicas da FMUSP',
      available24h: true
    });
    
    // Level 4: SAMU 192 (final escalation)
    contacts.push({
      id: 'SAMU-192',
      name: 'SAMU 192 - Central de Emergências',
      crm: 'SAMU',
      specialty: 'Atendimento Pré-Hospitalar',
      phone: '192',
      emergencyPhone: '192',
      available24h: true
    });
    
    return contacts;
  }

  /**
   * Log emergency event for audit trail
   */
  private async logEmergencyEvent(
    action: string,
    patientId: string,
    userId: string,
    details: string,
    severity: EmergencySeverity
  ): Promise<void> {
    const auditLog: EmergencyAuditLog = {
      id: `SAMU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      userId,
      action,
      details,
      severity,
      timestamp: new Date(),
      ipAddress: 'localhost',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SAMU-Integration',
      compliance: {
        lgpd: true,
        cfm: true
      }
    };
    
    this.auditLogs.push(auditLog);
    
    // In real implementation, send to secure audit logging service
    console.log(`📋 Audit: [${severity.toUpperCase()}] ${action} - ${details}`);
  }

  /**
   * Generate unique call ID
   */
  private generateCallId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `SAMU-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Generate unique escalation ID
   */
  private generateEscalationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ESC-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Get current call status
   */
  getCurrentCall(): SAMUEmergencyCall | null {
    return this.activeCall;
  }

  /**
   * Get all audit logs
   */
  getAuditLogs(): EmergencyAuditLog[] {
    return [...this.auditLogs];
  }

  /**
   * Get escalation queue
   */
  getEscalationQueue(): EmergencyEscalation[] {
    return [...this.escalationQueue];
  }

  /**
   * Get available hospitals
   */
  getAvailableHospitals(): HospitalInfo[] {
    return SAO_PAULO_HOSPITALS;
  }
}

// Global SAMU integration manager
export const samuIntegrationManager = new SAMUIntegrationManager();

// Utility functions for components
export const samuUtils = {
  /**
   * Quick emergency call with patient data
   */
  callSAMU: async (
    patientData: EmergencyPatientData,
    emergencyType: EmergencyType,
    location: GPSCoordinates
  ) => {
    return samuIntegrationManager.initiateEmergencyCall(
      patientData,
      emergencyType,
      location,
      {
        name: 'Sistema NeonPro',
        phone: 'N/A',
        relationship: 'Sistema médico'
      }
    );
  },
  
  /**
   * Check current emergency status
   */
  getEmergencyStatus: () => {
    const currentCall = samuIntegrationManager.getCurrentCall();
    return {
      hasActiveCall: !!currentCall,
      callStatus: currentCall?.status || 'idle',
      estimatedArrival: currentCall?.estimatedArrivalTime,
      samuUnit: currentCall?.samuUnit
    };
  },
  
  /**
   * Create escalation for unresponsive emergency
   */
  escalateEmergency: (patientData: EmergencyPatientData, reason: string) =>
    samuIntegrationManager.createEscalationChain(patientData, reason),
  
  /**
   * Format emergency info for display
   */
  formatEmergencyInfo: (callData: SAMUEmergencyCall) => ({
    priority: EMERGENCY_PRIORITIES.DELTA.code,
    description: `${callData.emergencyType} - ${callData.severity}`,
    location: `${callData.location.latitude.toFixed(6)}, ${callData.location.longitude.toFixed(6)}`,
    timestamp: callData.timestamp.toLocaleString('pt-BR')
  })
};

export default SAMUIntegrationManager;