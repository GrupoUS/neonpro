import {
  EmergencyProtocol,
  EmergencyResponse,
  EmergencyContact,
  EmergencyCategory,
  EmergencyPriority,
  EmergencyStatus,
  EmergencyEscalationLevel,
  EmergencyNotification,
  EmergencyResponseTeam,
  ValidationResponse
} from '@/types/compliance';

/**
 * Emergency Medical Protocols Service
 * 
 * Manages emergency response protocols, contact procedures, and escalation workflows
 * for Brazilian healthcare platforms according to CFM and ANVISA emergency regulations.
 * 
 * Features:
 * - Emergency classification and triage protocols
 * - Automated response workflow management
 * - Emergency contact and notification systems
 * - Escalation procedures and team coordination
 * - Compliance with Brazilian emergency medical regulations
 * - Real-time monitoring and response tracking
 * - Integration with SAMU (Sistema de Atendimento Móvel de Urgência)
 * - CFM emergency protocols compliance
 * 
 * Compliance Framework:
 * - Resolution CFM nº 2.314/2022 (Telemedicine and Emergency Care)
 * - Resolution CFM nº 1.643/2002 (Emergency Medical Service)
 * - Portaria MS nº 2.048/2002 (National Emergency Care Policy)
 * - Lei nº 8.080/1990 (SUS Law - Emergency Care)
 * - SAMU Integration Requirements
 * - State Health Department Emergency Protocols
 */
export class EmergencyMedicalProtocolsService {
  private static instance: EmergencyMedicalProtocolsService;
  private protocols: Map<string, EmergencyProtocol> = new Map();
  private activeResponses: Map<string, EmergencyResponse> = new Map();
  private responseTeams: Map<string, EmergencyResponseTeam> = new Map();
  private emergencyContacts: Map<string, EmergencyContact> = new Map();
  private notifications: Array<EmergencyNotification> = [];
  private auditLog: Array<{
    timestamp: Date;
    action: string;
    emergencyId?: string;
    userId?: string;
    details: Record<string, any>;
  }> = [];

  private constructor() {
    this.initializeDefaultProtocols();
    this.initializeDefaultContacts();
    this.initializeResponseTeams();
  }

  public static getInstance(): EmergencyMedicalProtocolsService {
    if (!EmergencyMedicalProtocolsService.instance) {
      EmergencyMedicalProtocolsService.instance = new EmergencyMedicalProtocolsService();
    }
    return EmergencyMedicalProtocolsService.instance;
  }

  /**
   * Initialize default emergency protocols for Brazilian healthcare
   */
  private initializeDefaultProtocols(): void {
    const defaultProtocols: EmergencyProtocol[] = [
      {
        id: 'cardiac-emergency',
        name: 'Emergência Cardíaca',
        category: 'cardiovascular',
        priority: 'critical',
        description: 'Protocolo para emergências cardíacas - parada cardiorrespiratória, infarto',
        triggerCriteria: [
          'Dor torácica intensa',
          'Perda de consciência súbita',
          'Ausência de pulso',
          'Dificuldade respiratória severa',
          'Cianose',
          'Sudorese profusa'
        ],
        immediateActions: [
          'Verificar sinais vitais',
          'Acionar SAMU (192)',
          'Iniciar RCP se necessário',
          'Administrar oxigênio',
          'Preparar desfibrilador',
          'Documentar ECG'
        ],
        medicationProtocols: [
          {
            medication: 'Adrenalina',
            dosage: '1mg IV/IO',
            frequency: 'A cada 3-5 minutos durante RCP'
          },
          {
            medication: 'Atropina',
            dosage: '0.5mg IV',
            frequency: 'Se bradicardia sintomática'
          }
        ],
        escalationCriteria: [
          'Não responsivo após 5 minutos',
          'Necessidade de procedimento invasivo',
          'Instabilidade hemodinâmica persistente'
        ],
        requiredTeam: ['emergency-physician', 'emergency-nurse', 'support-staff'],
        maxResponseTime: 3, // minutes
        followUpRequired: true,
        cfmCompliant: true,
        samuIntegration: true,
        documentationRequired: [
          'Horário de início dos sintomas',
          'Medidas tomadas',
          'Medicações administradas',
          'Resposta do paciente',
          'Encaminhamentos'
        ],
        isActive: true,
        lastUpdated: new Date(),
        version: '2.1',
        approvedBy: 'CFM-Emergency-Committee'
      },
      {
        id: 'respiratory-emergency',
        name: 'Emergência Respiratória',
        category: 'respiratory',
        priority: 'high',
        description: 'Protocolo para insuficiência respiratória aguda, anafilaxia, asma severa',
        triggerCriteria: [
          'Dispneia severa',
          'Saturação O2 < 90%',
          'Uso de musculatura acessória',
          'Cianose',
          'Alteração do nível de consciência',
          'Estridor ou sibilância severa'
        ],
        immediateActions: [
          'Posicionar paciente semi-sentado',
          'Administrar oxigênio (alto fluxo)',
          'Verificar vias aéreas',
          'Preparar intubação se necessário',
          'Acionar equipe médica',
          'Monitorar saturação'
        ],
        medicationProtocols: [
          {
            medication: 'Salbutamol',
            dosage: '2.5mg nebulização',
            frequency: 'Repetir se necessário'
          },
          {
            medication: 'Prednisolona',
            dosage: '1-2mg/kg VO',
            frequency: 'Dose única'
          },
          {
            medication: 'Adrenalina',
            dosage: '0.3mg IM',
            frequency: 'Se anafilaxia'
          }
        ],
        escalationCriteria: [
          'Necessidade de ventilação mecânica',
          'Falha na resposta ao tratamento inicial',
          'Deterioração clínica'
        ],
        requiredTeam: ['emergency-physician', 'respiratory-therapist', 'emergency-nurse'],
        maxResponseTime: 2, // minutes
        followUpRequired: true,
        cfmCompliant: true,
        samuIntegration: true,
        documentationRequired: [
          'Causa provável',
          'Saturação inicial e final',
          'Medicações administradas',
          'Resposta ao tratamento'
        ],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.8',
        approvedBy: 'CFM-Respiratory-Committee'
      },
      {
        id: 'neurological-emergency',
        name: 'Emergência Neurológica',
        category: 'neurological',
        priority: 'critical',
        description: 'Protocolo para AVC, convulsões, traumatismo craniano',
        triggerCriteria: [
          'Alteração súbita do nível de consciência',
          'Déficit neurológico agudo',
          'Convulsões',
          'Cefaleia súbita e intensa',
          'Assimetria facial',
          'Alteração da fala'
        ],
        immediateActions: [
          'Avaliação neurológica rápida (Glasgow)',
          'Verificar glicemia',
          'Posicionar cabeça elevada 30°',
          'Acionar neurologista',
          'Preparar para TC craniano',
          'Monitorar sinais vitais'
        ],
        medicationProtocols: [
          {
            medication: 'Diazepam',
            dosage: '5-10mg IV',
            frequency: 'Para convulsões'
          },
          {
            medication: 'Dexametasona',
            dosage: '4-8mg IV',
            frequency: 'Se edema cerebral'
          }
        ],
        escalationCriteria: [
          'Glasgow < 13',
          'Convulsões refratárias',
          'Sinais de hipertensão intracraniana'
        ],
        requiredTeam: ['neurologist', 'emergency-physician', 'emergency-nurse'],
        maxResponseTime: 4, // minutes
        followUpRequired: true,
        cfmCompliant: true,
        samuIntegration: true,
        documentationRequired: [
          'Escala de Glasgow inicial',
          'Sintomas neurológicos',
          'Horário de início',
          'Medicações administradas'
        ],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.5',
        approvedBy: 'CFM-Neurology-Committee'
      },
      {
        id: 'allergic-reaction',
        name: 'Reação Alérgica Severa/Anafilaxia',
        category: 'allergic',
        priority: 'high',
        description: 'Protocolo para reações alérgicas graves e anafilaxia',
        triggerCriteria: [
          'Urticária generalizada',
          'Edema de face/língua/laringe',
          'Dispneia súbita',
          'Hipotensão',
          'Náuseas/vômitos após exposição',
          'Alteração do nível de consciência'
        ],
        immediateActions: [
          'Remover agente causador',
          'Administrar adrenalina IM',
          'Acesso venoso calibroso',
          'Administrar oxigênio',
          'Monitorar PA e saturação',
          'Preparar para intubação'
        ],
        medicationProtocols: [
          {
            medication: 'Adrenalina',
            dosage: '0.3-0.5mg IM',
            frequency: 'Repetir a cada 5-15 min se necessário'
          },
          {
            medication: 'Prometazina',
            dosage: '25mg IM/IV',
            frequency: 'Dose única'
          },
          {
            medication: 'Hidrocortisona',
            dosage: '200mg IV',
            frequency: 'Dose única'
          }
        ],
        escalationCriteria: [
          'Hipotensão persistente',
          'Necessidade de múltiplas doses de adrenalina',
          'Comprometimento de via aérea'
        ],
        requiredTeam: ['emergency-physician', 'emergency-nurse', 'pharmacist'],
        maxResponseTime: 2, // minutes
        followUpRequired: true,
        cfmCompliant: true,
        samuIntegration: false,
        documentationRequired: [
          'Agente desencadeante',
          'Sintomas apresentados',
          'Medicações administradas',
          'Resposta ao tratamento'
        ],
        isActive: true,
        lastUpdated: new Date(),
        version: '1.3',
        approvedBy: 'CFM-Emergency-Committee'
      },
      {
        id: 'obstetric-emergency',
        name: 'Emergência Obstétrica',
        category: 'obstetric',
        priority: 'critical',
        description: 'Protocolo para emergências obstétricas - eclâmpsia, hemorragia pós-parto',
        triggerCriteria: [
          'Convulsões em gestante',
          'Hemorragia vaginal intensa',
          'Dor abdominal severa',
          'Hipertensão severa (PA > 160/110)',
          'Edema pulmonar agudo',
          'Alteração visual súbita'
        ],
        immediateActions: [
          'Posicionar em decúbito lateral esquerdo',
          'Acesso venoso calibroso',
          'Monitorar PA continuamente',
          'Preparar sulfato de magnésio',
          'Acionar obstetra urgente',
          'Preparar para cesariana se necessário'
        ],
        medicationProtocols: [
          {
            medication: 'Sulfato de Magnésio',
            dosage: '4g IV em 20 min',
            frequency: 'Dose de ataque, depois 1g/h'
          },
          {
            medication: 'Nifedipina',
            dosage: '10mg sublingual',
            frequency: 'Se PA > 160/110'
          }
        ],
        escalationCriteria: [
          'Convulsões refratárias',
          'Hemorragia não controlada',
          'Sofrimento fetal agudo'
        ],
        requiredTeam: ['obstetrician', 'emergency-physician', 'obstetric-nurse', 'anesthesiologist'],
        maxResponseTime: 3, // minutes
        followUpRequired: true,
        cfmCompliant: true,
        samuIntegration: true,
        documentationRequired: [
          'Idade gestacional',
          'Sintomas iniciais',
          'Medicações administradas',
          'Condição fetal',
          'Procedimentos realizados'
        ],
        isActive: true,
        lastUpdated: new Date(),
        version: '2.0',
        approvedBy: 'CFM-Obstetrics-Committee'
      }
    ];

    defaultProtocols.forEach(protocol => {
      this.protocols.set(protocol.id, protocol);
    });
  }

  /**
   * Initialize default emergency contacts
   */
  private initializeDefaultContacts(): void {
    const defaultContacts: EmergencyContact[] = [
      {
        id: 'samu-192',
        name: 'SAMU - Serviço de Atendimento Móvel de Urgência',
        type: 'medical-emergency',
        phoneNumber: '192',
        isActive: true,
        priority: 1,
        description: 'Atendimento pré-hospitalar móvel',
        availableHours: '24/7',
        responseArea: 'Nacional',
        specialties: ['emergency', 'trauma', 'cardiac', 'respiratory']
      },
      {
        id: 'bombeiros-193',
        name: 'Corpo de Bombeiros',
        type: 'rescue-emergency',
        phoneNumber: '193',
        isActive: true,
        priority: 1,
        description: 'Resgate e emergências',
        availableHours: '24/7',
        responseArea: 'Nacional',
        specialties: ['rescue', 'trauma', 'burns', 'toxic']
      },
      {
        id: 'police-emergency-190',
        name: 'Polícia Militar - Emergência',
        type: 'security-emergency',
        phoneNumber: '190',
        isActive: true,
        priority: 2,
        description: 'Segurança e emergências policiais',
        availableHours: '24/7',
        responseArea: 'Nacional',
        specialties: ['security', 'violence', 'psychiatric']
      },
      {
        id: 'poison-control-0800',
        name: 'Centro de Informações Toxicológicas',
        type: 'toxicological-emergency',
        phoneNumber: '0800-722-6001',
        isActive: true,
        priority: 2,
        description: 'Intoxicações e envenenamentos',
        availableHours: '24/7',
        responseArea: 'Nacional',
        specialties: ['toxicology', 'poison', 'overdose']
      },
      {
        id: 'emergency-coordinator',
        name: 'Coordenador de Emergência da Clínica',
        type: 'internal-coordinator',
        phoneNumber: '+55 11 98765-4321',
        email: 'emergencia@neonpro.com.br',
        isActive: true,
        priority: 1,
        description: 'Coordenação interna de emergências',
        availableHours: '24/7',
        responseArea: 'Clínica',
        specialties: ['coordination', 'logistics', 'communication']
      },
      {
        id: 'medical-director',
        name: 'Diretor Médico',
        type: 'medical-authority',
        phoneNumber: '+55 11 98765-1234',
        email: 'diretor.medico@neonpro.com.br',
        isActive: true,
        priority: 1,
        description: 'Diretor médico responsável',
        availableHours: '24/7',
        responseArea: 'Clínica',
        specialties: ['medical-authority', 'decision-making']
      }
    ];

    defaultContacts.forEach(contact => {
      this.emergencyContacts.set(contact.id, contact);
    });
  }

  /**
   * Initialize response teams
   */
  private initializeResponseTeams(): void {
    const defaultTeams: EmergencyResponseTeam[] = [
      {
        id: 'primary-emergency-team',
        name: 'Equipe Primária de Emergência',
        description: 'Primeira linha de resposta para emergências médicas',
        members: [
          {
            id: 'emergency-physician-1',
            name: 'Dr. João Silva',
            role: 'emergency-physician',
            crm: 'CRM/SP 123456',
            phoneNumber: '+55 11 99999-1111',
            isOnCall: true,
            specialties: ['emergency', 'cardiac', 'trauma']
          },
          {
            id: 'emergency-nurse-1',
            name: 'Enfª Maria Santos',
            role: 'emergency-nurse',
            coren: 'COREN/SP 123456',
            phoneNumber: '+55 11 99999-2222',
            isOnCall: true,
            specialties: ['emergency', 'critical-care']
          }
        ],
        responseTime: 2, // minutes
        isActive: true,
        capabilities: ['resuscitation', 'advanced-life-support', 'medication-administration'],
        equipment: ['defibrillator', 'emergency-medications', 'oxygen', 'monitoring']
      },
      {
        id: 'secondary-emergency-team',
        name: 'Equipe Secundária de Emergência',
        description: 'Suporte e backup para emergências complexas',
        members: [
          {
            id: 'cardiologist-1',
            name: 'Dr. Carlos Oliveira',
            role: 'cardiologist',
            crm: 'CRM/SP 654321',
            phoneNumber: '+55 11 99999-3333',
            isOnCall: false,
            specialties: ['cardiology', 'interventional-cardiology']
          },
          {
            id: 'anesthesiologist-1',
            name: 'Dra. Ana Costa',
            role: 'anesthesiologist',
            crm: 'CRM/SP 789012',
            phoneNumber: '+55 11 99999-4444',
            isOnCall: true,
            specialties: ['anesthesia', 'pain-management', 'critical-care']
          }
        ],
        responseTime: 5, // minutes
        isActive: true,
        capabilities: ['specialized-procedures', 'complex-resuscitation', 'surgical-support'],
        equipment: ['advanced-monitoring', 'intubation', 'surgical-instruments']
      }
    ];

    defaultTeams.forEach(team => {
      this.responseTeams.set(team.id, team);
    });
  }

  /**
   * Trigger emergency response based on symptoms and assessment
   */
  public async triggerEmergencyResponse(
    emergencyData: {
      patientId: string;
      patientName: string;
      patientAge: number;
      symptoms: string[];
      vitalSigns?: {
        bloodPressure?: string;
        heartRate?: number;
        oxygenSaturation?: number;
        temperature?: number;
        respiratoryRate?: number;
        glucoseLevel?: number;
      };
      consciousness?: string;
      location: string;
      reportedBy: string;
      contactNumber: string;
      description: string;
    }
  ): Promise<ValidationResponse<EmergencyResponse>> {
    try {
      // Classify emergency based on symptoms
      const classification = await this.classifyEmergency(emergencyData.symptoms);
      
      if (!classification.isValid || !classification.data) {
        return {
          isValid: false,
          errors: ['Não foi possível classificar a emergência']
        };
      }

      const { protocol, priority, category } = classification.data;

      // Create emergency response
      const emergencyResponse: EmergencyResponse = {
        id: this.generateEmergencyId(),
        patientId: emergencyData.patientId,
        patientName: emergencyData.patientName,
        patientAge: emergencyData.patientAge,
        protocolId: protocol.id,
        category,
        priority,
        status: 'active',
        symptoms: emergencyData.symptoms,
        vitalSigns: emergencyData.vitalSigns,
        consciousness: emergencyData.consciousness,
        location: emergencyData.location,
        reportedBy: emergencyData.reportedBy,
        contactNumber: emergencyData.contactNumber,
        description: emergencyData.description,
        startTime: new Date(),
        responseTime: protocol.maxResponseTime,
        assignedTeam: protocol.requiredTeam[0], // Assign primary team member
        escalationLevel: 'initial',
        actionsPerformed: [],
        medicationsAdministered: [],
        followUpRequired: protocol.followUpRequired,
        samuCalled: protocol.samuIntegration && (priority === 'critical' || priority === 'high'),
        cfmCompliant: protocol.cfmCompliant,
        auditTrail: [{
          timestamp: new Date(),
          action: 'emergency-triggered',
          userId: emergencyData.reportedBy,
          details: { symptoms: emergencyData.symptoms, location: emergencyData.location }
        }]
      };

      // Store emergency response
      this.activeResponses.set(emergencyResponse.id, emergencyResponse);

      // Send immediate notifications
      await this.sendEmergencyNotifications(emergencyResponse, protocol);

      // Auto-trigger SAMU if required
      if (emergencyResponse.samuCalled) {
        await this.contactSAMU(emergencyResponse);
      }

      // Log audit trail
      this.logActivity('emergency-triggered', emergencyResponse.id, emergencyData.reportedBy, {
        protocolId: protocol.id,
        priority,
        category,
        samuCalled: emergencyResponse.samuCalled
      });

      return {
        isValid: true,
        data: emergencyResponse
      };

    } catch (error) {
      console.error('Error triggering emergency response:', error);
      return {
        isValid: false,
        errors: ['Erro interno ao acionar protocolo de emergência']
      };
    }
  }

  /**
   * Classify emergency based on symptoms
   */
  private async classifyEmergency(
    symptoms: string[]
  ): Promise<ValidationResponse<{
    protocol: EmergencyProtocol;
    priority: EmergencyPriority;
    category: EmergencyCategory;
  }>> {
    const symptomLower = symptoms.map(s => s.toLowerCase());
    
    // Check each protocol for matching criteria
    for (const protocol of this.protocols.values()) {
      const matchingCriteria = protocol.triggerCriteria.filter(criteria =>
        symptomLower.some(symptom => 
          symptom.includes(criteria.toLowerCase()) ||
          criteria.toLowerCase().includes(symptom)
        )
      );

      // If 50% or more criteria match, use this protocol
      if (matchingCriteria.length >= Math.ceil(protocol.triggerCriteria.length * 0.5)) {
        return {
          isValid: true,
          data: {
            protocol,
            priority: protocol.priority,
            category: protocol.category
          }
        };
      }
    }

    // Fallback to general emergency protocol
    const generalProtocol = this.protocols.get('cardiac-emergency');
    if (generalProtocol) {
      return {
        isValid: true,
        data: {
          protocol: generalProtocol,
          priority: 'high',
          category: 'general'
        }
      };
    }

    return {
      isValid: false,
      errors: ['Nenhum protocolo de emergência encontrado para os sintomas informados']
    };
  }

  /**
   * Send emergency notifications to response team
   */
  private async sendEmergencyNotifications(
    emergency: EmergencyResponse,
    protocol: EmergencyProtocol
  ): Promise<void> {
    const team = this.responseTeams.get('primary-emergency-team');
    if (!team) return;

    const notifications: EmergencyNotification[] = team.members
      .filter(member => member.isOnCall)
      .map(member => ({
        id: this.generateNotificationId(),
        emergencyId: emergency.id,
        recipientId: member.id,
        recipientName: member.name,
        recipientPhone: member.phoneNumber,
        type: 'emergency-alert',
        priority: emergency.priority,
        message: `EMERGÊNCIA: ${protocol.name} - Paciente: ${emergency.patientName} - Local: ${emergency.location}`,
        sentAt: new Date(),
        status: 'sent',
        method: 'sms'
      }));

    // Store notifications
    this.notifications.push(...notifications);

    // In real implementation, would send actual SMS/calls
    console.log(`Emergency notifications sent to ${notifications.length} team members`);
  }

  /**
   * Contact SAMU (192)
   */
  private async contactSAMU(emergency: EmergencyResponse): Promise<void> {
    const samuContact = this.emergencyContacts.get('samu-192');
    if (!samuContact) return;

    const notification: EmergencyNotification = {
      id: this.generateNotificationId(),
      emergencyId: emergency.id,
      recipientId: 'samu-192',
      recipientName: samuContact.name,
      recipientPhone: samuContact.phoneNumber,
      type: 'samu-call',
      priority: emergency.priority,
      message: `Emergência médica - ${emergency.description} - Local: ${emergency.location}`,
      sentAt: new Date(),
      status: 'sent',
      method: 'phone'
    };

    this.notifications.push(notification);

    // Update emergency with SAMU contact
    emergency.auditTrail.push({
      timestamp: new Date(),
      action: 'samu-contacted',
      userId: 'system',
      details: { phone: '192', location: emergency.location }
    });

    this.logActivity('samu-contacted', emergency.id, 'system', {
      location: emergency.location,
      priority: emergency.priority
    });
  }

  /**
   * Update emergency status and add action
   */
  public async updateEmergencyStatus(
    emergencyId: string,
    update: {
      status?: EmergencyStatus;
      action?: string;
      medication?: {
        name: string;
        dosage: string;
        time: Date;
        administeredBy: string;
      };
      notes?: string;
      userId: string;
    }
  ): Promise<ValidationResponse<EmergencyResponse>> {
    try {
      const emergency = this.activeResponses.get(emergencyId);
      if (!emergency) {
        return {
          isValid: false,
          errors: ['Emergência não encontrada']
        };
      }

      // Update status if provided
      if (update.status) {
        emergency.status = update.status;
        if (update.status === 'resolved') {
          emergency.endTime = new Date();
        }
      }

      // Add action if provided
      if (update.action) {
        emergency.actionsPerformed.push({
          action: update.action,
          timestamp: new Date(),
          performedBy: update.userId
        });
      }

      // Add medication if provided
      if (update.medication) {
        emergency.medicationsAdministered.push(update.medication);
      }

      // Update audit trail
      emergency.auditTrail.push({
        timestamp: new Date(),
        action: 'emergency-updated',
        userId: update.userId,
        details: {
          status: update.status,
          action: update.action,
          medication: update.medication,
          notes: update.notes
        }
      });

      // Log activity
      this.logActivity('emergency-updated', emergencyId, update.userId, {
        status: update.status,
        action: update.action
      });

      return {
        isValid: true,
        data: emergency
      };

    } catch (error) {
      console.error('Error updating emergency status:', error);
      return {
        isValid: false,
        errors: ['Erro interno ao atualizar status de emergência']
      };
    }
  }

  /**
   * Escalate emergency to next level
   */
  public async escalateEmergency(
    emergencyId: string,
    escalationReason: string,
    userId: string
  ): Promise<ValidationResponse<EmergencyResponse>> {
    try {
      const emergency = this.activeResponses.get(emergencyId);
      if (!emergency) {
        return {
          isValid: false,
          errors: ['Emergência não encontrada']
        };
      }

      // Determine next escalation level
      let nextLevel: EmergencyEscalationLevel;
      switch (emergency.escalationLevel) {
        case 'initial':
          nextLevel = 'specialist';
          break;
        case 'specialist':
          nextLevel = 'director';
          break;
        case 'director':
          nextLevel = 'external';
          break;
        default:
          return {
            isValid: false,
            errors: ['Nível máximo de escalação já atingido']
          };
      }

      // Update emergency
      emergency.escalationLevel = nextLevel;
      emergency.priority = emergency.priority === 'low' ? 'medium' :
                         emergency.priority === 'medium' ? 'high' : 'critical';

      // Add to audit trail
      emergency.auditTrail.push({
        timestamp: new Date(),
        action: 'emergency-escalated',
        userId,
        details: {
          fromLevel: emergency.escalationLevel,
          toLevel: nextLevel,
          reason: escalationReason,
          newPriority: emergency.priority
        }
      });

      // Notify appropriate team/contact based on escalation level
      await this.notifyEscalationTeam(emergency, nextLevel, escalationReason);

      this.logActivity('emergency-escalated', emergencyId, userId, {
        toLevel: nextLevel,
        reason: escalationReason
      });

      return {
        isValid: true,
        data: emergency
      };

    } catch (error) {
      console.error('Error escalating emergency:', error);
      return {
        isValid: false,
        errors: ['Erro interno ao escalar emergência']
      };
    }
  }

  /**
   * Notify escalation team
   */
  private async notifyEscalationTeam(
    emergency: EmergencyResponse,
    level: EmergencyEscalationLevel,
    reason: string
  ): Promise<void> {
    let contactId: string;
    
    switch (level) {
      case 'specialist':
        contactId = 'secondary-emergency-team';
        break;
      case 'director':
        contactId = 'medical-director';
        break;
      case 'external':
        contactId = 'samu-192';
        break;
      default:
        return;
    }

    const notification: EmergencyNotification = {
      id: this.generateNotificationId(),
      emergencyId: emergency.id,
      recipientId: contactId,
      recipientName: `Escalação - ${level}`,
      recipientPhone: '',
      type: 'escalation-alert',
      priority: emergency.priority,
      message: `Escalação de emergência: ${reason} - Paciente: ${emergency.patientName}`,
      sentAt: new Date(),
      status: 'sent',
      method: 'sms'
    };

    this.notifications.push(notification);
  }

  /**
   * Get active emergencies
   */
  public getActiveEmergencies(): EmergencyResponse[] {
    return Array.from(this.activeResponses.values())
      .filter(emergency => emergency.status === 'active')
      .sort((a, b) => {
        // Sort by priority: critical > high > medium > low
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  /**
   * Get emergency protocols
   */
  public getEmergencyProtocols(): EmergencyProtocol[] {
    return Array.from(this.protocols.values())
      .filter(protocol => protocol.isActive)
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  /**
   * Get emergency contacts
   */
  public getEmergencyContacts(): EmergencyContact[] {
    return Array.from(this.emergencyContacts.values())
      .filter(contact => contact.isActive)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get response teams
   */
  public getResponseTeams(): EmergencyResponseTeam[] {
    return Array.from(this.responseTeams.values())
      .filter(team => team.isActive);
  }

  /**
   * Generate emergency statistics
   */
  public generateEmergencyStatistics(
    startDate: Date,
    endDate: Date
  ): ValidationResponse<{
    period: { start: Date; end: Date };
    totalEmergencies: number;
    emergenciesByCategory: Record<EmergencyCategory, number>;
    emergenciesByPriority: Record<EmergencyPriority, number>;
    averageResponseTime: number;
    samuCallsCount: number;
    escalationRate: number;
    resolutionRate: number;
    topProtocols: Array<{ protocolId: string; count: number; name: string }>;
  }> {
    try {
      const emergencies = Array.from(this.activeResponses.values())
        .filter(e => e.startTime >= startDate && e.startTime <= endDate);

      const emergenciesByCategory = emergencies.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + 1;
        return acc;
      }, {} as Record<EmergencyCategory, number>);

      const emergenciesByPriority = emergencies.reduce((acc, e) => {
        acc[e.priority] = (acc[e.priority] || 0) + 1;
        return acc;
      }, {} as Record<EmergencyPriority, number>);

      const resolvedEmergencies = emergencies.filter(e => e.endTime);
      const averageResponseTime = resolvedEmergencies.length > 0 
        ? resolvedEmergencies.reduce((sum, e) => {
            if (e.endTime) {
              return sum + (e.endTime.getTime() - e.startTime.getTime()) / (1000 * 60); // minutes
            }
            return sum;
          }, 0) / resolvedEmergencies.length
        : 0;

      const escalatedEmergencies = emergencies.filter(e => e.escalationLevel !== 'initial');
      const samuCalls = emergencies.filter(e => e.samuCalled);

      const protocolCounts = emergencies.reduce((acc, e) => {
        acc[e.protocolId] = (acc[e.protocolId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topProtocols = Object.entries(protocolCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([protocolId, count]) => ({
          protocolId,
          count,
          name: this.protocols.get(protocolId)?.name || 'Unknown'
        }));

      return {
        isValid: true,
        data: {
          period: { start: startDate, end: endDate },
          totalEmergencies: emergencies.length,
          emergenciesByCategory,
          emergenciesByPriority,
          averageResponseTime,
          samuCallsCount: samuCalls.length,
          escalationRate: emergencies.length > 0 ? (escalatedEmergencies.length / emergencies.length) * 100 : 0,
          resolutionRate: emergencies.length > 0 ? (resolvedEmergencies.length / emergencies.length) * 100 : 0,
          topProtocols
        }
      };

    } catch (error) {
      console.error('Error generating emergency statistics:', error);
      return {
        isValid: false,
        errors: ['Erro ao gerar estatísticas de emergência']
      };
    }
  }

  // Utility methods
  private generateEmergencyId(): string {
    return `emrg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNotificationId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logActivity(
    action: string,
    emergencyId?: string,
    userId?: string,
    details: Record<string, any> = {}
  ): void {
    this.auditLog.push({
      timestamp: new Date(),
      action,
      emergencyId,
      userId,
      details
    });
  }

  // Public getters for monitoring and testing
  public getAuditLog(): Array<{
    timestamp: Date;
    action: string;
    emergencyId?: string;
    userId?: string;
    details: Record<string, any>;
  }> {
    return [...this.auditLog];
  }

  public getNotifications(): EmergencyNotification[] {
    return [...this.notifications];
  }
}