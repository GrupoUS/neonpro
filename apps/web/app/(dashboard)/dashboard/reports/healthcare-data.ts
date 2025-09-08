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
      