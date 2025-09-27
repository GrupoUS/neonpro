/**
 * Healthcare Test Fixtures
 * 
 * Predefined test scenarios and data fixtures for healthcare testing.
 * These fixtures provide realistic healthcare scenarios for comprehensive testing.
 * 
 * Categories:
 * - Patient scenarios with varying risk levels
 * - Clinical scenarios for emergency response
 * - Compliance test scenarios
 * - Integration test data
 */

import { HealthcareTestDataGenerator } from '../utils/healthcare-test-data-generator'

const testDataGenerator = new HealthcareTestDataGenerator('healthcare-fixtures-seed')

// Patient Scenarios with Risk Levels
export const patientScenarios = {
  lowRisk: {
    name: 'Paciente saudável - tratamento cosmético básico',
    patient: testDataGenerator.generatePatientData({
      age: 28,
      medicalRecord: {
        allergies: [],
        chronicConditions: [],
        currentMedications: [],
        bloodType: 'O+'
      }
    }),
    treatment: {
      procedures: ['Limpeza de Pele Profunda', 'Hidratação Facial'],
      riskLevel: 'baixo',
      expectedDuration: 60,
      emergencyProtocol: false
    }
  },

  mediumRisk: {
    name: 'Paciente com alergias conhecidas',
    patient: testDataGenerator.generatePatientData({
      age: 35,
      medicalRecord: {
        allergies: ['Cosméticos com fragrância', 'Látex'],
        chronicConditions: ['Rinite alérgica'],
        currentMedications: ['Anti-histamínico'],
        bloodType: 'A+'
      }
    }),
    treatment: {
      procedures: ['Peeling Químico Suave'],
      riskLevel: 'moderado',
      expectedDuration: 45,
      emergencyProtocol: true,
      specialRequirements: ['Teste alérgico obrigatório', 'Produtos hipoalergênicos']
    }
  },

  highRisk: {
    name: 'Paciente com múltiplas condições crônicas',
    patient: testDataGenerator.generatePatientData({
      age: 52,
      medicalRecord: {
        allergies: ['Penicilina', 'Sulfa'],
        chronicConditions: ['Diabetes Tipo 2', 'Hipertensão', 'Hipotireoidismo'],
        currentMedications: [
          { name: 'Metformina', dosage: '2x ao dia' },
          { name: 'Losartana', dosage: '1x ao dia' },
          { name: 'Levotiroxina', dosage: '1x ao dia' }
        ],
        bloodType: 'B+'
      }
    }),
    treatment: {
      procedures: ['Botox Terapêutico para Hiperidrose'],
      riskLevel: 'alto',
      expectedDuration: 90,
      emergencyProtocol: true,
      specialRequirements: [
        'Avaliação médica prévia obrigatória',
        'Monitoramento de pressão arterial durante procedimento',
        'Médico disponível para emergências'
      ]
    }
  },

  criticalRisk: {
    name: 'Paciente idoso com histórico de complicações',
    patient: testDataGenerator.generatePatientData({
      age: 78,
      medicalRecord: {
        allergies: ['Iodo', 'Contraste radiológico'],
        chronicConditions: ['Fibrilação atrial', 'Insuficiência cardíaca', 'Doença renal crônica'],
        currentMedications: [
          { name: 'Warfarina', dosage: '1x ao dia' },
          { name: 'Furosemida', dosage: '2x ao dia' },
          { name: 'Digoxina', dosage: '1x ao dia' },
          { name: 'Omeprazol', dosage: '1x ao dia' }
        ],
        bloodType: 'AB+'
      }
    }),
    treatment: {
      procedures: ['Remoção de lesão cutânea suspeita'],
      riskLevel: 'crítico',
      expectedDuration: 120,
      emergencyProtocol: true,
      specialRequirements: [
        'Avaliação cardiológica prévia',
        'Monitoramento cardíaco contínuo',
        'Equipe de emergência disponível',
        'Hospital de referência acionado'
      ]
    }
  }
}

// Professional Scenarios
export const professionalScenarios = {
  dermatologist: {
    name: 'Dermatologista experiente',
    professional: testDataGenerator.generateMedicalProfessional({
      specialty: 'Dermatologia',
      experience: {
        years: 15,
        specializations: ['Dermatologia Cosmética', 'Cirurgia Dermatológica']
      }
    }),
    competencies: [
      'Diagnóstico dermatológico',
      'Procedimentos cosméticos',
      'Tratamento de lesões cutâneas',
      'Emergências dermatológicas'
    ]
  },

  plasticSurgeon: {
    name: 'Cirurgião plástico',
    professional: testDataGenerator.generateMedicalProfessional({
      specialty: 'Cirurgia Plástica',
      experience: {
        years: 20,
        specializations: ['Cirurgia Estética', 'Reconstrução Facial']
      }
    }),
    competencies: [
      'Cirurgias estéticas faciais',
      'Procedimentos corporais',
      'Reconstrução tecidual',
      'Manuseio de complicações cirúrgicas'
    ]
  },

  generalPractitioner: {
    name: 'Clínico geral com foco em estética',
    professional: testDataGenerator.generateMedicalProfessional({
      specialty: 'Clínica Geral',
      experience: {
        years: 8,
        specializations: ['Medicina Estética', 'Prevenção']
      }
    }),
    competencies: [
      'Avaliação pré-operatória',
      'Acompanhamento pós-operatório',
      'Tratamento de intercorrências',
      'Encaminhamento especializado'
    ]
  }
}

// Facility Scenarios
export const facilityScenarios = {
  aestheticClinic: {
    name: 'Clínica Estética Premium',
    facility: testDataGenerator.generateHealthcareFacility({
      type: 'Clínica',
      services: [
        'Botox Terapêutico',
        'Preenchimento Facial',
        'Peeling Químico',
        'Laserterapia',
        'Microagulhamento'
      ]
    }),
    capabilities: {
      emergencyKit: true,
      defibrillator: true,
      oxygen: true,
      emergencyProtocol: true,
      ambulanceAccess: true
    }
  },

  dayHospital: {
    name: 'Hospital Dia Cirúrgico',
    facility: testDataGenerator.generateHealthcareFacility({
      type: 'Hospital',
      services: ['Procedimentos cirúrgicos menores', 'Anestesia local', 'Recuperação pós-anestésica']
    }),
    capabilities: {
      emergencyKit: true,
      defibrillator: true,
      oxygen: true,
      emergencyProtocol: true,
      fullMedicalTeam: true,
      recoveryRooms: true,
      ambulanceService: true
    }
  },

  medicalOffice: {
    name: 'Consultório Médico Particular',
    facility: testDataGenerator.generateHealthcareFacility({
      type: 'Consultório',
      services: ['Consultas', 'Avaliações', 'Procedimentos menores']
    }),
    capabilities: {
      emergencyKit: true,
      emergencyProtocol: true,
      nearbyHospital: true
    }
  }
}

// Clinical Emergency Scenarios
export const emergencyScenarios = {
  anaphylaxis: {
    name: 'Reação Anafilática',
    trigger: 'Aplicação de preenchedor facial',
    symptoms: [
      'Edema facial',
      'Dispneia',
      'Hipotensão arterial',
      'Urticária generalizada',
      'Taquicardia'
    ],
    timeline: [
      { time: 0, event: 'Aplicação do produto', status: 'administered' },
      { time: 2, event: 'Início de edema facial', status: 'symptom_onset' },
      { time: 5, event: 'Dispneia e taquicardia', status: 'symptom_progression' },
      { time: 8, event: 'Hipotensão arterial', status: 'emergency' },
      { time: 10, event: 'Administração de adrenalina', status: 'treatment' },
      { time: 15, event: 'Melhora dos sintomas', status: 'improvement' }
    ],
    treatment: [
      'Adrenalina 1:1000 IM',
      'Oxigenoterapia',
      'Anti-histamínico IV',
      'Corticosteroide IV',
      'Monitorização contínua'
    ],
    successCriteria: [
      'Estabilização hemodinâmica em <15 minutos',
      'Melhora respiratória em <10 minutos',
      'Transferência para hospital em <30 minutos'
    ]
  },

  vasovagal: {
    name: 'Síncope Vasovagal',
    trigger: 'Procedimento com agulha',
    symptoms: [
      'Palidez',
      'Sudorese',
      'Tontura',
      'Perda de consciência',
      'Bradicardia'
    ],
    timeline: [
      { time: 0, event: 'Início do procedimento', status: 'started' },
      { time: 3, event: 'Paciente refere tontura', status: 'symptom_onset' },
      { time: 5, event: 'Paciente perde consciência', status: 'emergency' },
      { time: 7, event: 'Posicionamento Trendelenburg', status: 'treatment' },
      { time: 10, event: 'Retorno da consciência', status: 'improvement' }
    ],
    treatment: [
      'Posicionamento Trendelenburg',
      'Oxigenoterapia',
      'Monitorização de sinais vitais',
      'Avaliação médica'
    ],
    successCriteria: [
      'Retorno da consciência em <5 minutos',
      'Estabilização hemodinâmica',
      'Identificação e tratamento do fator desencadeante'
    ]
  },

  infection: {
    name: 'Infecção Local Pós-Procedure',
    trigger: 'Microagulhamento',
    symptoms: [
      'Eritema local',
      'Edema',
      'Dor intensa',
      'Secreção purulenta',
      'Febre'
    ],
    timeline: [
      { time: 0, event: 'Procedimento realizado', status: 'completed' },
      { time: 24, event: 'Início de eritema', status: 'symptom_onset' },
      { time: 48, event: 'Dor intensa e edema', status: 'symptom_progression' },
      { time: 72, event: 'Secreção purulenta', status: 'infection_confirmed' },
      { time: 76, event: 'Início de antibioticoterapia', status: 'treatment' }
    ],
    treatment: [
      'Antibioticoterapia empírica',
      'Cultura do material',
      'Curativo diário',
      'Anti-inflamatório',
      'Acompanhamento clínico'
    ],
    successCriteria: [
      'Melhora clínica em 48-72 horas',
      'Resolução completa em 7-10 dias',
      'Culture com antibiograma'
    ]
  }
}

// Compliance Test Scenarios
export const complianceScenarios = {
  lgpdDataSubjectRequest: {
    name: 'Solicitação de direitos do titular (LGPD)',
    scenario: {
      patientId: 'patient_123',
      requestType: 'access',
      requestData: 'Todos os meus dados pessoais',
      requestDate: new Date().toISOString(),
      responseDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      expectedResponse: {
        dataComplete: true,
        formatAccessible: true,
        withinDeadline: true,
        documentation: true
      }
    },
    validationSteps: [
      'Identificar todos os dados do paciente',
      'Compilar dados de todos os sistemas',
      'Remover dados de terceiros',
      'Formatar para leitura humana',
      'Documentar o processo',
      'Enviar dentro do prazo legal'
    ]
  },

  lgpdDataDeletion: {
    name: 'Solicitação de exclusão de dados (LGPD)',
    scenario: {
      patientId: 'patient_456',
      requestType: 'deletion',
      justification: 'Retirada de consentimento',
      requestDate: new Date().toISOString(),
      exceptions: [
        'Obrigações legais (prontuário médico)',
        'Interesses legítimos (prevenção de fraudes)',
        'Estudos científicos (dados anonimizados)'
      ]
    },
    validationSteps: [
      'Identificar dados a serem excluídos',
      'Verificar exceções legais',
      'Excluir dados não essenciais',
      'Anonimizar dados necessários',
      'Documentar o processo',
      'Confirmar exclusão'
    ]
  },

  anvisaIncidentReporting: {
    name: 'Notificação de evento adverso (ANVISA)',
    scenario: {
      incidentType: 'reação_adversa_grave',
      product: 'ácido_hialurônico_marca_x',
      patientData: {
        age: 45,
        gender: 'F',
        preExistingConditions: ['alergia_cosméticos']
      },
      incidentDescription: 'Edema facial e dispneia 5 minutos após aplicação',
      severity: 'grave',
      outcome: 'recuperação_com_tratamento',
      reportingDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    validationSteps: [
      'Documentar detalhes do incidente',
      'Identificar produto e lote',
      'Coletar dados do paciente',
      'Descrever tratamento realizado',
      'Classificar gravidade',
      'Notificar ANVISA no prazo'
    ]
  },

  cfmEthicalViolation: {
    name: 'Violação ética profissional (CFM)',
    scenario: {
      violationType: 'divulgação_de_imagens_sem_consentimento',
      professionalId: 'crm_sp_12345',
      patientId: 'patient_789',
      incident: 'Publicação de fotos de antes e depois em redes sociais',
      evidence: ['screenshots', 'testemunhas', 'confissão do profissional'],
      consequences: [
        'Processo ético',
        'Suspensão temporária',
        'Obrigação de remover conteúdo',
        'Indenização por danos morais'
      ]
    },
    validationSteps: [
      'Identificar a violação',
      'Coletar evidências',
      'Notificar o profissional',
      'Iniciar processo ético',
      'Aplicar sanções',
      'Monitorar compliance'
    ]
  }
}

// Integration Test Data
export const integrationTestData = {
  patientJourney: {
    registration: {
      patientData: testDataGenerator.generatePatientData(),
      expectedSteps: [
        'Coleta de dados pessoais',
        'Verificação de documentos',
        'Anamnese inicial',
        'Termo de consentimento',
        'Cadastro no sistema'
      ]
    },
    consultation: {
      professional: professionalScenarios.dermatologist.professional,
      facility: facilityScenarios.aestheticClinic.facility,
      expectedSteps: [
        'Agendamento',
        'Confirmação',
        'Check-in',
        'Avaliação inicial',
        'Exame físico',
        'Diagnóstico',
        'Planejamento terapêutico'
      ]
    },
    treatment: {
      procedures: ['Botox Terapêutico', 'Preenchimento Nasogeniano'],
      expectedSteps: [
        'Preparação do paciente',
        'Fotografia pré-operatória',
        'Assepsia',
        'Aplicação anestésica',
        'Procedimento principal',
        'Pós-operatório imediato',
        'Orientações finais'
      ]
    },
    followUp: {
      timeline: ['7 dias', '30 dias', '90 dias'],
      expectedSteps: [
        'Avaliação de resultados',
        'Registro de eventos adversos',
        'Satisfação do paciente',
        'Documentação fotográfica',
        'Planejamento de manutenção'
      ]
    }
  },

  dataFlow: {
    patientRegistration: {
      from: 'frontend',
      to: 'api',
      data: ['personal_data', 'medical_history', 'consent'],
      validations: ['format_validation', 'required_fields', 'consent_verification']
    },
    clinicalAssessment: {
      from: 'api',
      to: 'database',
      data: ['assessment_data', 'diagnosis', 'treatment_plan'],
      validations: ['clinical_validation', 'professional_signature', 'data_encryption']
    },
    billing: {
      from: 'api',
      to: 'payment_gateway',
      data: ['treatment_details', 'costs', 'insurance_info'],
      validations: ['cost_calculation', 'insurance_validation', 'payment_security']
    },
    reporting: {
      from: 'database',
      to: 'analytics',
      data: ['anonymized_data', 'treatment_outcomes', 'satisfaction_metrics'],
      validations: ['data_anonymization', 'aggregation_rules', 'privacy_compliance']
    }
  }
}

// Performance Test Scenarios
export const performanceScenarios = {
  emergencyResponse: {
    name: 'Resposta a emergência anafilática',
    steps: [
      { name: 'Reconhecimento do evento', targetTime: 30, unit: 'segundos' },
      { name: 'Chamada da equipe médica', targetTime: 60, unit: 'segundos' },
      { name: 'Administração de adrenalina', targetTime: 180, unit: 'segundos' },
      { name: 'Estabilização do paciente', targetTime: 900, unit: 'segundos' },
      { name: 'Transferência para hospital', targetTime: 1800, unit: 'segundos' }
    ],
    criticalPath: ['Reconhecimento', 'Adrenalina', 'Estabilização'],
    metrics: {
      totalTime: { max: 1800, unit: 'segundos' },
      teamResponseTime: { max: 90, unit: 'segundos' },
      treatmentTime: { max: 300, unit: 'segundos' }
    }
  },

  systemLoad: {
    name: 'Pico de agendamentos online',
    scenario: {
      concurrentUsers: 1000,
      requestsPerSecond: 50,
      duration: 300,
      endpoints: ['/api/appointments', '/api/patients', '/api/professionals']
    },
    performanceTargets: {
      responseTime: { p95: 2000, unit: 'milissegundos' },
      errorRate: { max: 1, unit: 'percentual' },
      throughput: { min: 45, unit: 'requests/segundo' },
      availability: { min: 99.9, unit: 'percentual' }
    }
  },

  dataProcessing: {
    name: 'Processamento em lote de prontuários',
    scenario: {
      batchSize: 10000,
      processType: 'anonymization',
      complexity: 'high'
    },
    performanceTargets: {
      processingTime: { max: 3600, unit: 'segundos' },
      memoryUsage: { max: 4, unit: 'GB' },
      cpuUsage: { max: 80, unit: 'percentual' },
      successRate: { min: 99.5, unit: 'percentual' }
    }
  }
}

// Accessibility Test Scenarios
export const accessibilityScenarios = {
  visualImpairment: {
    name: 'Paciente com deficiência visual',
    adaptations: [
      'Leitor de tela compatível',
      'Alto contraste',
      'Textos alternativos para imagens',
      'Navegação por teclado',
      'Descrição de procedimentos em áudio'
    ],
    testCases: [
      'Cadastro de paciente sem visual',
      'Agendamento via leitor de tela',
      'Acesso a informações médicas',
      'Preenchimento de formulários de consentimento'
    ]
  },

  motorImpairment: {
    name: 'Paciente com limitação motora',
    adaptations: [
      'Navegação por teclado completa',
      'Tempo aumentado para preenchimento',
      'Botões maiores e espaçados',
      'Comandos de voz',
      'Interface simplificada'
    ],
    testCases: [
      'Agendamento sem mouse',
      'Preenchimento de formulários com teclado',
      'Navegação em telas complexas',
      'Cancelamento de emergência'
    ]
  },

  cognitiveImpairment: {
    name: 'Paciente com deficiência cognitiva',
    adaptations: [
      'Interface simplificada',
      'Instruções passo a passo',
      'Tempo estendido',
      'Linguagem clara e direta',
      'Remoção de distrações'
    ],
    testCases: [
      'Entendimento de termos de consentimento',
      'Navegação no sistema',
      'Compreensão de procedimentos',
      'Agendamento simplificado'
    ]
  }
}

// Export all fixtures for easy importing
export const healthcareTestFixtures = {
  patientScenarios,
  professionalScenarios,
  facilityScenarios,
  emergencyScenarios,
  complianceScenarios,
  integrationTestData,
  performanceScenarios,
  accessibilityScenarios
}

// Default export for convenience
export default healthcareTestFixtures