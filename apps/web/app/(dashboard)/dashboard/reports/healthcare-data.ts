// Brazilian Healthcare Mock Data for Reports Center
// Comprehensive data for regulatory, financial, and clinical reporting

// LGPD Compliance Data
export const lgpdComplianceData = {
  overview: {
    totalDataSubjects: 12_847,
    activeConsents: 11_923,
    withdrawnConsents: 924,
    pendingRequests: 15,
    dataBreaches: 0,
    complianceScore: 94.2,
    lastAudit: '2024-01-15',
    nextAudit: '2024-04-15',
  },
  consentMetrics: {
    marketing: { granted: 8456, withdrawn: 234, pending: 12, },
    analytics: { granted: 9123, withdrawn: 145, pending: 8, },
    thirdParty: { granted: 5678, withdrawn: 456, pending: 23, },
    research: { granted: 3456, withdrawn: 234, pending: 12, },
  },
  dataRequests: [
    {
      id: 'REQ-2024-001',
      type: 'Acesso aos Dados',
      status: 'Concluído',
      requestDate: '2024-01-20',
      completionDate: '2024-01-21',
      requesterCPF: '***.***.***-12',
      dataCategory: 'Dados de Consulta',
    },
    {
      id: 'REQ-2024-002',
      type: 'Exclusão de Dados',
      status: 'Em Andamento',
      requestDate: '2024-01-19',
      requesterCPF: '***.***.***-34',
      dataCategory: 'Dados Pessoais',
    },
    {
      id: 'REQ-2024-003',
      type: 'Retificação',
      status: 'Concluído',
      requestDate: '2024-01-18',
      completionDate: '2024-01-19',
      requesterCPF: '***.***.***-56',
      dataCategory: 'Dados de Contato',
    },
  ],
  privacyPolicies: {
    lastUpdate: '2024-01-10',
    version: '3.2',
    acknowledgments: 11_456,
    pendingAcknowledments: 234,
  },
}

// ANVISA Inspection Data
export const anvisaInspectionData = {
  facilityInfo: {
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'NeonPro Clínica Estética Ltda',
    nomeFantasia: 'NeonPro Aesthetic Clinic',
    endereco: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
    cep: '05432-100',
    responsavelTecnico: 'Dr. João Silva Santos',
    crm: 'CRM-SP 123456',
    especialidade: 'Dermatologia',
  },
  qualityIndicators: {
    sterilizationCompliance: 98.5,
    equipmentMaintenance: 96.2,
    staffTraining: 94.8,
    documentationComplete: 92.1,
    adverseEventReporting: 100,
    patientSafetyProtocols: 97.3,
  },
  inspectionHistory: [
    {
      date: '2023-11-15',
      type: 'Inspeção Programada',
      result: 'Conforme',
      inspector: 'Fiscal ANVISA - Maria Santos',
      observations: 'Estabelecimento em conformidade com RDC 302/2005',
      nextInspection: '2024-11-15',
    },
    {
      date: '2023-06-10',
      type: 'Inspeção por Denúncia',
      result: 'Conforme',
      inspector: 'Fiscal ANVISA - Pedro Oliveira',
      observations: 'Verificação de procedimentos de esterilização - Adequado',
    },
  ],
  equipment: [
    {
      name: 'Autoclave Digital 40L',
      model: 'Stermax AC-40',
      serie: 'AC-40-2023-001',
      calibration: '2024-01-10',
      nextCalibration: '2024-07-10',
      status: 'Conforme',
    },
    {
      name: 'Laser CO2 Fracionado',
      model: 'Fotona SP Dynamis',
      serie: 'FD-2023-laser-001',
      calibration: '2024-01-05',
      nextCalibration: '2024-06-05',
      status: 'Conforme',
    },
  ],
}

// CFM Professional Activity Data
export const cfmProfessionalData = {
  professional: {
    name: 'Dr. João Silva Santos',
    crm: 'CRM-SP 123456',
    cpf: '123.456.789-00',
    specialty: 'Dermatologia',
    subspecialty: 'Cosmiatria',
    graduationYear: 2010,
    residencyCompletion: 2013,
    boardCertification: 'Título de Especialista SBD - 2014',
  },
  continuingEducation: {
    requiredHours: 100,
    completedHours: 124,
    complianceStatus: 'Em Conformidade',
    lastUpdate: '2024-01-15',
    activities: [
      {
        activity: 'Congresso Brasileiro de Dermatologia',
        date: '2023-09-15',
        hours: 20,
        category: 'Congressos',
      },
      {
        activity: 'Curso de Laser em Dermatologia',
        date: '2023-11-20',
        hours: 16,
        category: 'Cursos',
      },
      {
        activity: 'Workshop Preenchimento Facial',
        date: '2024-01-10',
        hours: 8,
        category: 'Workshops',
      },
    ],
  },
}

// Utility functions
export const formatCurrency = (value: number,): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  },).format(value,)
}

export const formatDate = (date: string | Date,): string => {
  const dateObj = typeof date === 'string' ? new Date(date,) : date
  return new Intl.DateTimeFormat('pt-BR',).format(dateObj,)
}

// Financial Data
export const financialData = {
  revenue: {
    total: 850_000,
    monthly: 70_833,
    quarterly: 212_500,
    yearly: 850_000,
    consultations: 450_000,
    procedures: 320_000,
    products: 80_000,
    growth: {
      monthly: 5.2,
      quarterly: 12.8,
      yearly: 18.5,
    },
  },
  expenses: {
    total: 620_000,
    staff: 380_000,
    equipment: 120_000,
    supplies: 85_000,
    overhead: 35_000,
  },
  taxes: {
    irpf: 45_000,
    irpj: 38_000,
    csll: 22_000,
    pis: 12_000,
    cofins: 18_000,
    iss: 25_000,
    inss: 32_000,
    total: 192_000,
  },
  paymentMethods: {
    pix: { amount: 340_000, percentage: 40, },
    card: { amount: 255_000, percentage: 30, },
    creditCard: { amount: 255_000, percentage: 30, },
    debitCard: { amount: 170_000, percentage: 20, },
    cash: { amount: 170_000, percentage: 20, },
    transfer: { amount: 85_000, percentage: 10, },
  },
}

// Clinical Data
export const clinicalData = {
  patients: {
    total: 2847,
    active: 2156,
    newThisMonth: 89,
    averageAge: 42.5,
  },
  procedures: {
    total: 1245,
    consultations: 856,
    treatments: 389,
    successRate: 94.2,
  },
  outcomes: {
    satisfaction: 4.7,
    complications: 2.1,
    followUpRate: 87.3,
  },
  treatmentOutcomes: {
    successRate: 94.2,
    complicationRate: 2.1,
    patientSatisfaction: 4.7,
    treatmentCompletionRate: 89.5,
    followUpAdherence: 87.3,
    followUpCompliance: 87.3,
  },
  patientSatisfaction: {
    overall: 4.7,
    treatment: 4.8,
    communication: 4.6,
    facilities: 4.5,
    nps: 8.5,
    breakdown: {
      treatment: 4.8,
      communication: 4.6,
      facilities: 4.5,
      staff: 4.7,
      service: 4.6,
      scheduling: 4.4,
    },
  },
  adverseEvents: [
    {
      id: 'AE001',
      date: '2024-01-15',
      type: 'Reação alérgica leve',
      severity: 'Baixa',
      treatment: 'Anti-histamínico oral',
      outcome: 'Resolvido',
      reportedToAnvisa: true,
    },
    {
      id: 'AE002',
      date: '2024-02-03',
      type: 'Hematoma pós-procedimento',
      severity: 'Média',
      treatment: 'Compressas frias e observação',
      outcome: 'Resolvido',
      reportedToAnvisa: false,
    },
  ],
}

// Combined report data
export const reportData = {
  lgpd: lgpdComplianceData,
  cfm: cfmProfessionalData,
  financial: financialData,
  clinical: clinicalData,
}
