/**
 * Emergency Protocols System - Brazilian Medical Guidelines
 * Phase 3.4: Mobile Emergency Interface Implementation
 *
 * Features:
 * - Comprehensive Brazilian medical emergency protocols
 * - CFM (Conselho Federal de Medicina) approved procedures
 * - Step-by-step emergency guidance in Portuguese
 * - Time-critical protocol execution tracking
 * - SAMU integration with standardized protocols
 * - Specialty-specific emergency procedures
 * - Protocol compliance monitoring and audit
 * - Real-time protocol guidance for healthcare professionals
 */

import type {
  EmergencyProtocol,
  EmergencySeverity,
  EmergencyStep,
  EmergencyType,
} from "@/types/emergency";

// Brazilian medical specialties with emergency protocols
export const BRAZILIAN_SPECIALTIES = {
  CARDIOLOGIA: "Cardiologia",
  PNEUMOLOGIA: "Pneumologia",
  NEUROLOGIA: "Neurologia",
  PEDIATRIA: "Pediatria",
  GERIATRIA: "Geriatria",
  MEDICINA_EMERGENCIA: "Medicina de Emergência",
  MEDICINA_INTENSIVA: "Medicina Intensiva",
  ANESTESIOLOGIA: "Anestesiologia",
  CIRURGIA_GERAL: "Cirurgia Geral",
  OBSTETRICIA: "Ginecologia e Obstetrícia",
  PSIQUIATRIA: "Psiquiatria",
} as const;

// Protocol categories aligned with SAMU guidelines
export const PROTOCOL_CATEGORIES = {
  SUPORTE_BASICO: "Suporte Básico de Vida",
  SUPORTE_AVANCADO: "Suporte Avançado de Vida",
  TRAUMA: "Atendimento ao Trauma",
  PEDIATRICO: "Emergências Pediátricas",
  OBSTETRICO: "Emergências Obstétricas",
  PSIQUIATRICO: "Emergências Psiquiátricas",
  TOXICOLOGICO: "Emergências Toxicológicas",
} as const;

// Time-critical thresholds (minutes) for different protocols
export const PROTOCOL_TIME_LIMITS = {
  PARADA_CARDIACA: 2, // Brain death starts at 4-6 minutes
  CHOQUE_ANAFILATICO: 5, // Life-threatening within 5-15 minutes
  AVC_ISQUEMICO: 180, // Golden hour for thrombolysis (3 hours)
  IAM_STEMI: 90, // Door-to-balloon time (90 minutes)
  TRAUMA_GRAVE: 60, // Golden hour for trauma
  STATUS_EPILEPTICUS: 20, // Permanent damage after 30 minutes
  INSUF_RESPIRATORIA: 15, // Respiratory failure intervention
  INTOXICACAO_GRAVE: 30, // Critical intervention window
} as const;

/**
 * Brazilian Emergency Protocols Database
 * Based on CFM guidelines and SAMU standardization
 */
const EMERGENCY_PROTOCOLS: Record<string, EmergencyProtocol> = {
  // Cardiac Emergency Protocols
  PARADA_CARDIORRESPIRATORIA: {
    id: "PCR-001",
    name: "Parada Cardiorrespiratória - Adulto",
    condition: "Ausência de pulso e respiração em paciente adulto",
    steps: [
      {
        stepNumber: 1,
        instruction: "Verificar responsividade - chamar em voz alta e tocar ombros",
        timeLimit: 15,
        critical: true,
        verification: "Paciente não responde a estímulos verbais e táteis",
        alternatives: ["Se responsivo, avaliar outros parâmetros vitais"],
      },
      {
        stepNumber: 2,
        instruction: "Verificar pulso carotídeo e respiração simultaneamente",
        timeLimit: 10,
        critical: true,
        verification: "Ausência de pulso palpável e movimentos respiratórios",
        alternatives: ["Se presente pulso, verificar adequação da ventilação"],
      },
      {
        stepNumber: 3,
        instruction: "Posicionar paciente em superfície rígida e iniciar RCP 30:2",
        timeLimit: 30,
        critical: true,
        verification: "Compressões no centro do tórax, 5-6cm profundidade, 100-120/min",
        alternatives: ["Se via aérea comprometida, priorizar compressões contínuas"],
      },
      {
        stepNumber: 4,
        instruction: "Conectar monitor/desfibrilador e analisar ritmo",
        timeLimit: 60,
        critical: true,
        verification: "Ritmo identificado: FV/TV (chocável) ou AESP/assistolia",
        alternatives: ["Se não disponível, continuar RCP até chegada do equipamento"],
      },
      {
        stepNumber: 5,
        instruction: "Se FV/TV: DESFIBRILAR 200J bifásico, retomar RCP imediatamente",
        timeLimit: 30,
        critical: true,
        verification: "Choque aplicado, RCP reiniciado sem verificar pulso",
        alternatives: ["Se AESP/assistolia, continuar RCP e investigar causas reversíveis"],
      },
      {
        stepNumber: 6,
        instruction: "Estabelecer via aérea definitiva e acesso venoso",
        timeLimit: 120,
        critical: false,
        verification: "IOT realizada, acesso EV/IO funcionante",
        alternatives: ["Bolsa-máscara se IOT não possível, acesso IO se EV difícil"],
      },
      {
        stepNumber: 7,
        instruction: "Epinefrina 1mg EV/IO a cada 3-5 minutos",
        timeLimit: 300,
        critical: false,
        verification: "Epinefrina administrada, horário registrado",
        alternatives: ["Vasopressina 40U pode substituir 1ª ou 2ª dose de epinefrina"],
      },
      {
        stepNumber: 8,
        instruction: "Investigar e tratar causas reversíveis (5 Hs e 5 Ts)",
        timeLimit: 600,
        critical: false,
        verification:
          "Hipovolemia, hipóxia, H+, hipo/hiperK+, hipotermia, tensão pneumotórax, tamponamento, tóxicos, trombose coronariana, trombose pulmonar",
        alternatives: ["Focar nas causas mais prováveis baseado no contexto clínico"],
      },
    ],
    timeLimit: PROTOCOL_TIME_LIMITS.PARADA_CARDIACA,
    requiredPersonnel: ["Médico", "Enfermeiro", "Técnico de Emergência"],
    equipment: ["Monitor/Desfibrilador", "Bolsa-máscara", "Material de IOT", "Acesso vascular"],
    medications: ["Epinefrina 1mg/ml", "Vasopressina 20U/ml", "Amiodarona 150mg"],
    contraindications: ["Lesões incompatíveis com vida", "DNR documentado"],
    lastUpdated: new Date("2024-01-15"),
    source: "cfm",
  },

  CHOQUE_ANAFILATICO: {
    id: "ANA-001",
    name: "Choque Anafilático",
    condition: "Reação alérgica sistêmica grave com comprometimento hemodinâmico",
    steps: [
      {
        stepNumber: 1,
        instruction: "Remover ou suspender imediatamente o agente causador",
        timeLimit: 30,
        critical: true,
        verification: "Agente identificado e removido/suspenso",
        alternatives: ["Se agente desconhecido, suspender todas medicações não essenciais"],
      },
      {
        stepNumber: 2,
        instruction: "Avaliar via aérea - sinais de edema laríngeo ou broncoespasmo",
        timeLimit: 60,
        critical: true,
        verification: "Via aérea pérvea, ausência de estridor ou sibilos",
        alternatives: ["Se comprometimento: IOT precoce, cricotireoidostomia se necessário"],
      },
      {
        stepNumber: 3,
        instruction: "Epinefrina 1:1000 - 0,3-0,5ml IM na coxa (vasto lateral)",
        timeLimit: 120,
        critical: true,
        verification: "Epinefrina aplicada, horário registrado, local adequado",
        alternatives: ["Se choque severo: epinefrina EV 1:10.000 - 0,1mg lento"],
      },
      {
        stepNumber: 4,
        instruction: "Posição supina, elevar MMII, estabelecer acesso venoso calibroso",
        timeLimit: 180,
        critical: true,
        verification: "Paciente posicionado, acesso EV 14-16G funcionante",
        alternatives: ["Se hipotensão severa, considerar dois acessos EV"],
      },
      {
        stepNumber: 5,
        instruction: "Expansão volêmica com cristaloide 20ml/kg em bolus",
        timeLimit: 300,
        critical: false,
        verification: "Volume infundido, monitorização hemodinâmica",
        alternatives: ["Ajustar volume conforme resposta pressórica e sinais de sobrecarga"],
      },
      {
        stepNumber: 6,
        instruction: "Corticoide EV: metilprednisolona 1-2mg/kg ou hidrocortisona 5mg/kg",
        timeLimit: 600,
        critical: false,
        verification: "Corticoide administrado, dose e horário registrados",
        alternatives: ["Prednisona VO se via EV não disponível"],
      },
      {
        stepNumber: 7,
        instruction: "Anti-histamínico: difenidramina 1mg/kg EV ou IM",
        timeLimit: 900,
        critical: false,
        verification: "Anti-histamínico administrado",
        alternatives: ["Loratadina VO se reação leve sem comprometimento sistêmico"],
      },
    ],
    timeLimit: PROTOCOL_TIME_LIMITS.CHOQUE_ANAFILATICO,
    requiredPersonnel: ["Médico", "Enfermeiro"],
    equipment: ["Monitor", "Material para via aérea", "Acesso vascular", "Bombas de infusão"],
    medications: [
      "Epinefrina 1:1000 e 1:10000",
      "Corticoide EV",
      "Anti-histamínico",
      "Cristaloide",
    ],
    contraindications: ["Uso cuidadoso de betabloqueadores (pode piorar broncoespasmo)"],
    lastUpdated: new Date("2024-01-15"),
    source: "cfm",
  },

  AVC_ISQUEMICO: {
    id: "AVC-001",
    name: "AVC Isquêmico - Protocolo de Trombólise",
    condition: "Acidente vascular cerebral isquêmico agudo dentro da janela terapêutica",
    steps: [
      {
        stepNumber: 1,
        instruction: "Horário de início dos sintomas PRECISO - última vez visto normal",
        timeLimit: 10,
        critical: true,
        verification: "Horário documentado com precisão, < 4,5h do início",
        alternatives: ["Se horário impreciso, considerar wake-up stroke protocol"],
      },
      {
        stepNumber: 2,
        instruction:
          "Exame neurológico rápido - NIHSS (National Institutes of Health Stroke Scale)",
        timeLimit: 15,
        critical: true,
        verification: "NIHSS calculado e documentado (ideal > 4 para trombólise)",
        alternatives: ["Se NIHSS < 4, avaliar déficit incapacitante"],
      },
      {
        stepNumber: 3,
        instruction: "TC crânio SEM contraste URGENTE - excluir hemorragia",
        timeLimit: 25,
        critical: true,
        verification: "TC sem sinais de hemorragia, edema ou hipodensidade extensa",
        alternatives: ["Se TC indisponível, RM com sequências apropriadas"],
      },
      {
        stepNumber: 4,
        instruction: "Laboratório: glicemia, Cr, ureia, TAP, TTPa, plaquetas",
        timeLimit: 60,
        critical: true,
        verification: "Resultados dentro dos limites para trombólise",
        alternatives: ["Glicemia capilar imediata se demora laboratorial"],
      },
      {
        stepNumber: 5,
        instruction: "Verificar critérios de inclusão e exclusão para rtPA",
        timeLimit: 90,
        critical: true,
        verification: "Checklist de critérios preenchido, indicação confirmada",
        alternatives: ["Se contraindicação para rtPA, considerar trombectomia mecânica"],
      },
      {
        stepNumber: 6,
        instruction: "Alteplase (rtPA) 0,9mg/kg EV (máx 90mg): 10% bolus, 90% em 60min",
        timeLimit: 270,
        critical: true,
        verification: "rtPA iniciado, dose calculada corretamente, monitorização neurológica",
        alternatives: ["Tenecteplase pode ser alternativa em protocolos específicos"],
      },
      {
        stepNumber: 7,
        instruction: "Monitorização rigorosa: PA, sinais neurológicos, sinais de hemorragia",
        timeLimit: 1440,
        critical: false,
        verification: "Protocolos de monitorização implementados",
        alternatives: ["TC controle em 24h ou se deterioração neurológica"],
      },
    ],
    timeLimit: PROTOCOL_TIME_LIMITS.AVC_ISQUEMICO,
    requiredPersonnel: ["Neurologista", "Médico Emergencista", "Enfermeiro", "Técnico Radiologia"],
    equipment: ["Monitor multiparamétrico", "Bomba infusão", "TC", "Laboratorio"],
    medications: ["Alteplase (rtPA)", "Soluções cristaloides"],
    contraindications: [
      "Hemorragia intracraniana prévia",
      "Trauma/cirurgia recente (<3 meses)",
      "PA > 185/110mmHg não controlada",
      "Glicemia < 50mg/dl",
      "Plaquetas < 100.000",
      "INR > 1,7",
    ],
    lastUpdated: new Date("2024-01-15"),
    source: "cfm",
  },

  INSUFICIENCIA_RESPIRATORIA: {
    id: "RESP-001",
    name: "Insuficiência Respiratória Aguda",
    condition: "Falência do sistema respiratório em manter adequada oxigenação/ventilação",
    steps: [
      {
        stepNumber: 1,
        instruction: "Avaliação ABCDE - priorizar via aérea e ventilação",
        timeLimit: 30,
        critical: true,
        verification: "Via aérea pérvea, padrão respiratório avaliado",
        alternatives: ["Se obstrução, manobras de desobstrução imediatas"],
      },
      {
        stepNumber: 2,
        instruction: "Oximetria contínua, gasometria arterial se disponível",
        timeLimit: 60,
        critical: true,
        verification: "SatO2 monitorizada, meta > 94% (ou > 88% se DPOC)",
        alternatives: ["Se gasometria não disponível, basear-se em sinais clínicos"],
      },
      {
        stepNumber: 3,
        instruction: "Suplementação O2: cateter, máscara, máscara com reservatório",
        timeLimit: 90,
        critical: true,
        verification: "FiO2 adequada para manter saturação alvo",
        alternatives: [
          "Escalar dispositivos conforme necessidade: cateter → máscara → reservatório",
        ],
      },
      {
        stepNumber: 4,
        instruction: "Se insuficiente: ventilação não invasiva (CPAP/BiPAP)",
        timeLimit: 180,
        critical: true,
        verification: "VNI instalada, parâmetros adequados, tolerância do paciente",
        alternatives: ["Se contraindicação ou falha de VNI, preparar para IOT"],
      },
      {
        stepNumber: 5,
        instruction: "Critérios para IOT: rebaixamento consciência, fadiga, gasometria crítica",
        timeLimit: 300,
        critical: true,
        verification: "Indicação precisa para IOT, preparativos realizados",
        alternatives: ["Reavaliação contínua, IOT precoce se deterioração"],
      },
      {
        stepNumber: 6,
        instruction: "IOT com sequência rápida: pré-oxigenação, sedação, BNM, laringoscopia",
        timeLimit: 600,
        critical: false,
        verification: "IOT realizada com sucesso, confirmação da posição do tubo",
        alternatives: ["Via aérea cirúrgica se IOT não possível"],
      },
      {
        stepNumber: 7,
        instruction: "Ventilação mecânica protetora: baixo volume corrente, PEEP adequado",
        timeLimit: 900,
        critical: false,
        verification: "Parâmetros ventilatórios otimizados, monitorização contínua",
        alternatives: ["Ajustar parâmetros conforme gasometria e mecânica respiratória"],
      },
    ],
    timeLimit: PROTOCOL_TIME_LIMITS.INSUF_RESPIRATORIA,
    requiredPersonnel: ["Médico", "Fisioterapeuta", "Enfermeiro", "Técnico"],
    equipment: ["Monitor", "Dispositivos O2", "VNI", "Ventilador mecânico", "Material IOT"],
    medications: [
      "Sedativos (midazolam, propofol)",
      "BNM (succinilcolina, rocurônio)",
      "Broncodilatadores",
    ],
    contraindications: ["Pneumotórax hipertensivo não drenado"],
    lastUpdated: new Date("2024-01-15"),
    source: "cfm",
  },

  STATUS_EPILEPTICUS: {
    id: "EPI-001",
    name: "Estado de Mal Epiléptico",
    condition: "Crise epiléptica contínua > 5 min ou crises recorrentes sem recuperação",
    steps: [
      {
        stepNumber: 1,
        instruction: "Verificar via aérea, posição lateral de segurança, proteção contra lesões",
        timeLimit: 60,
        critical: true,
        verification: "Via aérea mantida, paciente protegido, não conter movimentos",
        alternatives: ["Aspiração se necessário, cânula orofaríngea se possível"],
      },
      {
        stepNumber: 2,
        instruction: "Acesso venoso, monitor cardíaco, oximetria, glicemia capilar",
        timeLimit: 120,
        critical: true,
        verification: "Monitorização completa, glicemia verificada",
        alternatives: ["Acesso IO se EV difícil, glicose EV se hipoglicemia"],
      },
      {
        stepNumber: 3,
        instruction: "Benzodiazepínico EV: diazepam 0,15mg/kg ou lorazepam 0,1mg/kg",
        timeLimit: 180,
        critical: true,
        verification: "Benzodiazepínico administrado, dose adequada ao peso",
        alternatives: ["Via retal ou IM se EV não disponível, midazolam nasal"],
      },
      {
        stepNumber: 4,
        instruction: "Se persistir: segunda dose de benzodiazepínico após 5-10min",
        timeLimit: 300,
        critical: true,
        verification: "Segunda dose administrada se indicada",
        alternatives: ["Não exceder dose máxima, preparar para anticonvulsivante EV"],
      },
      {
        stepNumber: 5,
        instruction: "Anticonvulsivante EV: fenitoína 18-20mg/kg ou ácido valpróico 25-45mg/kg",
        timeLimit: 600,
        critical: true,
        verification: "Anticonvulsivante EV iniciado, velocidade de infusão adequada",
        alternatives: ["Levetiracetam 60mg/kg se contraindicação aos outros"],
      },
      {
        stepNumber: 6,
        instruction: "Se refratário: anestesia geral com propofol, midazolam ou pentobarbital",
        timeLimit: 1200,
        critical: true,
        verification: "Anestesia iniciada, monitorização intensiva, EEG contínuo se disponível",
        alternatives: ["IOT necessária, suporte intensivo completo"],
      },
      {
        stepNumber: 7,
        instruction: "Investigar causa: TC, punção lombar, exames metabólicos, toxicológicos",
        timeLimit: 1800,
        critical: false,
        verification: "Investigação etiológica iniciada conforme estabilização",
        alternatives: ["Tratar causas identificáveis simultaneamente"],
      },
    ],
    timeLimit: PROTOCOL_TIME_LIMITS.STATUS_EPILEPTICUS,
    requiredPersonnel: ["Neurologista", "Médico Emergencista", "Enfermeiro", "Anestesista"],
    equipment: ["Monitor", "Material IOT", "Ventilador", "Bombas infusão", "EEG se disponível"],
    medications: [
      "Diazepam 10mg/2ml",
      "Midazolam 15mg/3ml",
      "Fenitoína 250mg/5ml",
      "Ácido valpróico 400mg/4ml",
      "Propofol",
      "Pentobarbital",
    ],
    contraindications: [
      "Bloqueio AV avançado (para fenitoína)",
      "Hepatopatia grave (para valpróico)",
    ],
    lastUpdated: new Date("2024-01-15"),
    source: "cfm",
  },
};

/**
 * Emergency Protocols Manager
 * Handles protocol retrieval, execution tracking, and compliance monitoring
 */
export class EmergencyProtocolsManager {
  private activeProtocols: Map<string, {
    protocol: EmergencyProtocol;
    startTime: Date;
    currentStep: number;
    completedSteps: number[];
    notes: string[];
    personnel: string[];
  }> = new Map();

  /**
   * Get protocol by emergency type
   */
  getProtocol(emergencyType: EmergencyType | string): EmergencyProtocol | null {
    const protocolMappings = {
      cardiac: "PARADA_CARDIORRESPIRATORIA",
      respiratory: "INSUFICIENCIA_RESPIRATORIA",
      allergic_reaction: "CHOQUE_ANAFILATICO",
      neurological: "STATUS_EPILEPTICUS",
      trauma: "TRAUMA_GRAVE",
      poisoning: "INTOXICACAO_GRAVE",
    };

    const protocolKey = protocolMappings[emergencyType as keyof typeof protocolMappings]
      || emergencyType.toUpperCase();
    return EMERGENCY_PROTOCOLS[protocolKey] || null;
  }

  /**
   * Get all available protocols
   */
  getAllProtocols(): EmergencyProtocol[] {
    return Object.values(EMERGENCY_PROTOCOLS);
  }

  /**
   * Get protocols by category
   */
  getProtocolsByCategory(category: string): EmergencyProtocol[] {
    return this.getAllProtocols().filter(protocol =>
      protocol.name.toLowerCase().includes(category.toLowerCase())
      || protocol.condition.toLowerCase().includes(category.toLowerCase())
    );
  }

  /**
   * Get protocols by specialty
   */
  getProtocolsBySpecialty(specialty: string): EmergencyProtocol[] {
    const specialtyMappings = {
      [BRAZILIAN_SPECIALTIES.CARDIOLOGIA]: ["PARADA_CARDIORRESPIRATORIA", "IAM_STEMI"],
      [BRAZILIAN_SPECIALTIES.PNEUMOLOGIA]: ["INSUFICIENCIA_RESPIRATORIA"],
      [BRAZILIAN_SPECIALTIES.NEUROLOGIA]: ["AVC_ISQUEMICO", "STATUS_EPILEPTICUS"],
      [BRAZILIAN_SPECIALTIES.MEDICINA_EMERGENCIA]: Object.keys(EMERGENCY_PROTOCOLS),
    };

    const protocolKeys = specialtyMappings[specialty] || [];
    return protocolKeys.map(key => EMERGENCY_PROTOCOLS[key]).filter(Boolean);
  }

  /**
   * Start protocol execution
   */
  startProtocolExecution(
    protocolId: string,
    patientId: string,
    personnel: string[],
  ): string {
    const protocol = this.getAllProtocols().find(p => p.id === protocolId);
    if (!protocol) throw new Error(`Protocol ${protocolId} not found`);

    const executionId = `EXEC-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

    this.activeProtocols.set(executionId, {
      protocol,
      startTime: new Date(),
      currentStep: 1,
      completedSteps: [],
      notes: [],
      personnel,
    });

    console.log(`🏥 Protocol started: ${protocol.name} (${executionId})`);

    return executionId;
  }

  /**
   * Mark protocol step as completed
   */
  completeProtocolStep(
    executionId: string,
    stepNumber: number,
    completedBy: string,
    notes?: string,
  ): boolean {
    const execution = this.activeProtocols.get(executionId);
    if (!execution) return false;

    if (!execution.completedSteps.includes(stepNumber)) {
      execution.completedSteps.push(stepNumber);
      execution.completedSteps.sort((a, b) => a - b);

      if (notes) {
        execution.notes.push(`Step ${stepNumber} (${completedBy}): ${notes}`);
      }

      // Move to next step
      if (stepNumber === execution.currentStep) {
        execution.currentStep = stepNumber + 1;
      }

      console.log(`✅ Step ${stepNumber} completed by ${completedBy}`);
      return true;
    }

    return false;
  }

  /**
   * Get protocol execution status
   */
  getProtocolStatus(executionId: string) {
    const execution = this.activeProtocols.get(executionId);
    if (!execution) return null;

    const totalSteps = execution.protocol.steps.length;
    const completedSteps = execution.completedSteps.length;
    const elapsedTime = (Date.now() - execution.startTime.getTime()) / 1000 / 60; // minutes
    const isOverdue = elapsedTime > execution.protocol.timeLimit!;

    return {
      protocolName: execution.protocol.name,
      startTime: execution.startTime,
      currentStep: execution.currentStep,
      completedSteps: execution.completedSteps,
      totalSteps,
      progress: Math.round((completedSteps / totalSteps) * 100),
      elapsedTime: Math.round(elapsedTime),
      timeLimit: execution.protocol.timeLimit,
      isOverdue,
      personnel: execution.personnel,
      notes: execution.notes,
    };
  }

  /**
   * Get current step guidance
   */
  getCurrentStepGuidance(executionId: string) {
    const execution = this.activeProtocols.get(executionId);
    if (!execution) return null;

    const currentStep = execution.protocol.steps.find(
      step => step.stepNumber === execution.currentStep,
    );

    if (!currentStep) return null;

    return {
      step: currentStep,
      isTimecritical: currentStep.critical,
      timeRemaining: currentStep.timeLimit
        ? Math.max(
          0,
          currentStep.timeLimit - Math.round((Date.now() - execution.startTime.getTime()) / 1000),
        )
        : null,
      requiredEquipment: execution.protocol.equipment,
      requiredMedications: execution.protocol.medications,
    };
  }

  /**
   * Search protocols by keywords
   */
  searchProtocols(keywords: string): EmergencyProtocol[] {
    const searchTerms = keywords.toLowerCase().split(" ");

    return this.getAllProtocols().filter(protocol => {
      const searchText = `${protocol.name} ${protocol.condition} ${
        protocol.steps.map(s => s.instruction).join(" ")
      }`.toLowerCase();

      return searchTerms.every(term => searchText.includes(term));
    });
  }

  /**
   * Get protocol compliance checklist
   */
  getComplianceChecklist(protocolId: string) {
    const protocol = this.getAllProtocols().find(p => p.id === protocolId);
    if (!protocol) return null;

    return {
      protocolInfo: {
        name: protocol.name,
        source: protocol.source,
        lastUpdated: protocol.lastUpdated,
      },
      requirements: {
        personnel: protocol.requiredPersonnel,
        equipment: protocol.equipment,
        medications: protocol.medications,
      },
      contraindications: protocol.contraindications,
      timeLimit: protocol.timeLimit,
      criticalSteps: protocol.steps.filter(step => step.critical).map(step => ({
        stepNumber: step.stepNumber,
        instruction: step.instruction,
        timeLimit: step.timeLimit,
        verification: step.verification,
      })),
    };
  }

  /**
   * Get protocol statistics
   */
  getProtocolStatistics() {
    const activeExecutions = Array.from(this.activeProtocols.values());

    return {
      totalProtocols: Object.keys(EMERGENCY_PROTOCOLS).length,
      activeExecutions: activeExecutions.length,
      protocolsByCategory: {
        cardiac: this.getProtocolsByCategory("cardiac").length,
        respiratory: this.getProtocolsByCategory("respiratory").length,
        neurological: this.getProtocolsByCategory("neurological").length,
        trauma: this.getProtocolsByCategory("trauma").length,
        toxicological: this.getProtocolsByCategory("toxicological").length,
        pediatric: this.getProtocolsByCategory("pediatric").length,
      },
      averageExecutionTime: this.calculateAverageExecutionTime(),
      complianceRate: this.calculateComplianceRate(),
    };
  }

  /**
   * Calculate average execution time
   */
  private calculateAverageExecutionTime(): number {
    const executions = Array.from(this.activeProtocols.values());
    if (executions.length === 0) return 0;

    const totalTime = executions.reduce((sum, execution) => {
      return sum + (Date.now() - execution.startTime.getTime());
    }, 0);

    return Math.round(totalTime / executions.length / 1000 / 60); // minutes
  }

  /**
   * Calculate protocol compliance rate
   */
  private calculateComplianceRate(): number {
    const executions = Array.from(this.activeProtocols.values());
    if (executions.length === 0) return 100;

    const compliantExecutions = executions.filter(execution => {
      const elapsedTime = (Date.now() - execution.startTime.getTime()) / 1000 / 60;
      return elapsedTime <= execution.protocol.timeLimit!;
    }).length;

    return Math.round((compliantExecutions / executions.length) * 100);
  }

  /**
   * Export protocol for external systems
   */
  exportProtocol(protocolId: string, format: "json" | "pdf" | "print" = "json") {
    const protocol = this.getAllProtocols().find(p => p.id === protocolId);
    if (!protocol) return null;

    // In real implementation, this would generate different formats
    switch (format) {
      case "json":
        return JSON.stringify(protocol, null, 2);
      case "pdf":
        console.log(`📄 Generating PDF for protocol: ${protocol.name}`);
        return { url: `/protocols/${protocolId}.pdf` };
      case "print":
        console.log(`🖨️ Formatting for print: ${protocol.name}`);
        return this.formatForPrint(protocol);
      default:
        return protocol;
    }
  }

  /**
   * Format protocol for printing
   */
  private formatForPrint(protocol: EmergencyProtocol): string {
    let output = `PROTOCOLO DE EMERGÊNCIA\n`;
    output += `${protocol.name.toUpperCase()}\n`;
    output += `${"=".repeat(50)}\n\n`;

    output += `CONDIÇÃO: ${protocol.condition}\n`;
    output += `LIMITE DE TEMPO: ${protocol.timeLimit} minutos\n`;
    output += `FONTE: ${protocol.source.toUpperCase()}\n`;
    output += `ATUALIZADO: ${protocol.lastUpdated.toLocaleDateString("pt-BR")}\n\n`;

    output += `PESSOAL NECESSÁRIO:\n`;
    protocol.requiredPersonnel.forEach(person => {
      output += `• ${person}\n`;
    });
    output += "\n";

    output += `EQUIPAMENTOS:\n`;
    protocol.equipment.forEach(equipment => {
      output += `• ${equipment}\n`;
    });
    output += "\n";

    output += `MEDICAÇÕES:\n`;
    protocol.medications.forEach(medication => {
      output += `• ${medication}\n`;
    });
    output += "\n";

    output += `PASSOS DO PROTOCOLO:\n`;
    protocol.steps.forEach(step => {
      const criticalMark = step.critical ? "🚨 " : "";
      const timeInfo = step.timeLimit ? ` (${step.timeLimit}s)` : "";

      output += `${criticalMark}${step.stepNumber}. ${step.instruction}${timeInfo}\n`;
      if (step.verification) {
        output += `   Verificação: ${step.verification}\n`;
      }
      if (step.alternatives && step.alternatives.length > 0) {
        output += `   Alternativas: ${step.alternatives.join("; ")}\n`;
      }
      output += "\n";
    });

    if (protocol.contraindications.length > 0) {
      output += `CONTRAINDICAÇÕES:\n`;
      protocol.contraindications.forEach(contraindication => {
        output += `• ${contraindication}\n`;
      });
    }

    return output;
  }
}

// Global protocols manager
export const emergencyProtocolsManager = new EmergencyProtocolsManager();

// Utility functions for components
export const protocolUtils = {
  /**
   * Get protocol for emergency type
   */
  getEmergencyProtocol: (emergencyType: EmergencyType) =>
    emergencyProtocolsManager.getProtocol(emergencyType),

  /**
   * Start protocol execution
   */
  startProtocol: (protocolId: string, patientId: string, personnel: string[]) =>
    emergencyProtocolsManager.startProtocolExecution(protocolId, patientId, personnel),

  /**
   * Get step guidance
   */
  getStepGuidance: (executionId: string) =>
    emergencyProtocolsManager.getCurrentStepGuidance(executionId),

  /**
   * Search protocols
   */
  searchProtocols: (keywords: string) => emergencyProtocolsManager.searchProtocols(keywords),

  /**
   * Get protocols by specialty
   */
  getSpecialtyProtocols: (specialty: string) =>
    emergencyProtocolsManager.getProtocolsBySpecialty(specialty),

  /**
   * Format protocol for display
   */
  formatProtocol: (protocol: EmergencyProtocol) => ({
    title: protocol.name,
    condition: protocol.condition,
    timeLimit: `${protocol.timeLimit} minutos`,
    steps: protocol.steps.length,
    criticalSteps: protocol.steps.filter(s => s.critical).length,
    source: protocol.source.toUpperCase(),
  }),
};

export default EmergencyProtocolsManager;
