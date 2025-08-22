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
		lastAudit: "2024-01-15",
		nextAudit: "2024-04-15",
	},
	consentMetrics: {
		marketing: { granted: 8456, withdrawn: 234, pending: 12 },
		analytics: { granted: 9123, withdrawn: 145, pending: 8 },
		thirdParty: { granted: 5678, withdrawn: 456, pending: 23 },
		research: { granted: 3456, withdrawn: 234, pending: 12 },
	},
	dataRequests: [
		{
			id: "REQ-2024-001",
			type: "Acesso aos Dados",
			status: "Concluído",
			requestDate: "2024-01-20",
			completionDate: "2024-01-21",
			requesterCPF: "***.***.***-12",
			dataCategory: "Dados de Consulta",
		},
		{
			id: "REQ-2024-002",
			type: "Exclusão de Dados",
			status: "Em Andamento",
			requestDate: "2024-01-19",
			requesterCPF: "***.***.***-34",
			dataCategory: "Dados Pessoais",
		},
		{
			id: "REQ-2024-003",
			type: "Retificação",
			status: "Concluído",
			requestDate: "2024-01-18",
			completionDate: "2024-01-19",
			requesterCPF: "***.***.***-56",
			dataCategory: "Dados de Contato",
		},
	],
	privacyPolicies: {
		lastUpdate: "2024-01-10",
		version: "3.2",
		acknowledgments: 11_456,
		pendingAcknowledments: 234,
	},
};

// ANVISA Inspection Data
export const anvisaInspectionData = {
	facilityInfo: {
		cnpj: "12.345.678/0001-90",
		razaoSocial: "NeonPro Clínica Estética Ltda",
		nomeFantasia: "NeonPro Aesthetic Clinic",
		endereco: "Rua das Flores, 123 - Vila Madalena, São Paulo - SP",
		cep: "05432-100",
		responsavelTecnico: "Dr. João Silva Santos",
		crm: "CRM-SP 123456",
		especialidade: "Dermatologia",
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
			date: "2023-11-15",
			type: "Inspeção Programada",
			result: "Conforme",
			inspector: "Fiscal ANVISA - Maria Santos",
			observations: "Estabelecimento em conformidade com RDC 302/2005",
			nextInspection: "2024-11-15",
		},
		{
			date: "2023-06-10",
			type: "Inspeção por Denúncia",
			result: "Conforme",
			inspector: "Fiscal ANVISA - Pedro Oliveira",
			observations: "Verificação de procedimentos de esterilização - Adequado",
		},
	],
	equipment: [
		{
			name: "Autoclave Digital 40L",
			model: "Stermax AC-40",
			serie: "AC-40-2023-001",
			calibration: "2024-01-10",
			nextCalibration: "2024-07-10",
			status: "Conforme",
		},
		{
			name: "Laser CO2 Fracionado",
			model: "Fotona SP Dynamis",
			serie: "FD-2023-laser-001",
			calibration: "2024-01-05",
			nextCalibration: "2024-06-05",
			status: "Conforme",
		},
	],
};

// CFM Professional Activity Data
export const cfmProfessionalData = {
	professional: {
		name: "Dr. João Silva Santos",
		crm: "CRM-SP 123456",
		cpf: "123.456.789-00",
		specialty: "Dermatologia",
		subspecialty: "Cosmiatria",
		graduationYear: 2010,
		residencyCompletion: 2013,
		boardCertification: "Título de Especialista SBD - 2014",
	},
	continuingEducation: {
		requiredHours: 100,
		completedHours: 124,
		complianceStatus: "Em Conformidade",
		lastUpdate: "2024-01-15",
		activities: [
			{
				activity: "Congresso Brasileiro de Dermatologia",
				date: "2023-09-15",
				hours: 20,
				category: "Congressos",
			},
			{
				activity: "Curso de Laser em Dermatologia",
				date: "2023-11-20",
				hours: 16,
				category: "Cursos",
			},
			{
				activity: "Workshop Preenchimento Facial",
				date: "2024-01-10",
				hours: 8,
				category: "Workshops",
			},
		],
	},
	professionalActivity: {
		totalPatients: 2847,
		totalProcedures: 5692,
		monthlyAverage: 245,
		specialtyProcedures: {
			Botox: 1234,
			Preenchimento: 856,
			Laser: 643,
			Peeling: 432,
			Consultas: 2527,
		},
	},
};

// ANS Performance Metrics
export const ansPerformanceData = {
	qualityIndicators: {
		patientSatisfaction: 4.7,
		treatmentEffectiveness: 92.3,
		safetyRecord: 99.1,
		timingCompliance: 94.6,
		resolutionRate: 89.7,
	},
	performanceMetrics: {
		averageWaitTime: 12, // minutes
		treatmentCompletionRate: 96.4,
		patientReturnRate: 87.2,
		complicationRate: 0.8,
		patientComplaintRate: 2.1,
	},
	qualityPrograms: [
		{
			program: "Programa de Segurança do Paciente",
			implementation: "2023-03-01",
			status: "Ativo",
			compliance: 97.8,
		},
		{
			program: "Acreditação Hospitalar",
			implementation: "2023-06-01",
			status: "Em Processo",
			compliance: 85.4,
		},
	],
};

// Financial Data with Brazilian formatting
export const financialData = {
	revenue: {
		monthly: 487_650.0,
		quarterly: 1_425_300.0,
		yearly: 5_847_200.0,
		growth: {
			monthly: 12.4,
			quarterly: 18.7,
			yearly: 24.3,
		},
	},
	paymentMethods: {
		pix: { amount: 145_230.0, percentage: 29.8, transactions: 234 },
		creditCard: { amount: 234_560.0, percentage: 48.1, transactions: 456 },
		debitCard: { amount: 87_450.0, percentage: 17.9, transactions: 189 },
		cash: { amount: 20_410.0, percentage: 4.2, transactions: 67 },
	},
	insurance: {
		sus: { amount: 0, percentage: 0, patients: 0 },
		private: { amount: 234_560.0, percentage: 48.1, patients: 1247 },
		particular: { amount: 253_090.0, percentage: 51.9, patients: 1456 },
	},
	profitability: {
		grossMargin: 68.4,
		netMargin: 23.7,
		ebitda: 115_678.0,
		operationalCosts: 154_230.0,
	},
	taxes: {
		irpj: 23_456.0,
		csll: 15_234.0,
		pis: 3567.0,
		cofins: 16_234.0,
		iss: 24_567.0,
		inss: 45_678.0,
		total: 128_736.0,
	},
	serviceAnalysis: [
		{ service: "Botox", revenue: 145_230.0, margin: 72.3, sessions: 234 },
		{
			service: "Preenchimento",
			revenue: 123_450.0,
			margin: 68.9,
			sessions: 156,
		},
		{ service: "Laser CO2", revenue: 98_760.0, margin: 74.2, sessions: 123 },
		{ service: "Peeling", revenue: 65_430.0, margin: 65.1, sessions: 189 },
		{ service: "Consulta", revenue: 54_780.0, margin: 85.4, sessions: 456 },
	],
};

// Clinical Performance Data
export const clinicalData = {
	treatmentOutcomes: {
		successRate: 94.2,
		complicationRate: 0.8,
		patientSatisfaction: 4.7,
		treatmentCompletionRate: 96.4,
		followUpCompliance: 89.3,
	},
	patientSatisfaction: {
		overall: 4.7,
		breakdown: {
			treatment: 4.8,
			service: 4.6,
			facilities: 4.7,
			staff: 4.9,
			scheduling: 4.4,
		},
		nps: 87,
		surveyResponse: 78.3,
	},
	adverseEvents: [
		{
			id: "AE-2024-001",
			date: "2024-01-18",
			type: "Reação Alérgica Leve",
			severity: "Baixa",
			treatment: "Botox",
			outcome: "Resolvido",
			reportedToAnvisa: true,
		},
		{
			id: "AE-2024-002",
			date: "2024-01-15",
			type: "Hematoma",
			severity: "Baixa",
			treatment: "Preenchimento",
			outcome: "Resolvido",
			reportedToAnvisa: false,
		},
	],
	qualityMetrics: {
		infectionRate: 0,
		patientReturnRate: 87.2,
		treatmentRevisionRate: 2.1,
		referralRate: 12.3,
		educationalCompliance: 95.6,
	},
	performanceIndicators: [
		{ metric: "Tempo de Consulta", target: 30, actual: 28, unit: "minutos" },
		{ metric: "Taxa de No-Show", target: 5, actual: 3.2, unit: "%" },
		{
			metric: "Satisfação Pós-Tratamento",
			target: 90,
			actual: 94.2,
			unit: "%",
		},
		{ metric: "Retorno em 7 dias", target: 15, actual: 12.3, unit: "%" },
	],
};

// Patient Demographics (Brazilian context)
export const patientDemographics = {
	totalPatients: 2847,
	ageDistribution: {
		"18-25": { count: 284, percentage: 10.0 },
		"26-35": { count: 997, percentage: 35.0 },
		"36-45": { count: 1139, percentage: 40.0 },
		"46-55": { count: 284, percentage: 10.0 },
		"56+": { count: 143, percentage: 5.0 },
	},
	genderDistribution: {
		female: { count: 2277, percentage: 80.0 },
		male: { count: 570, percentage: 20.0 },
	},
	regionDistribution: {
		"São Paulo": { count: 1423, percentage: 50.0 },
		"Rio de Janeiro": { count: 569, percentage: 20.0 },
		"Minas Gerais": { count: 427, percentage: 15.0 },
		Outros: { count: 428, percentage: 15.0 },
	},
	treatmentHistory: {
		newPatients: 456,
		returningPatients: 2391,
		averageVisits: 3.4,
		retentionRate: 87.2,
	},
};

// Audit Trail Data
export const auditTrailData = [
	{
		id: "AUDIT-2024-001",
		timestamp: "2024-01-21T10:30:00Z",
		user: "Dr. João Silva",
		action: "Acesso a Prontuário",
		resource: "Paciente: Maria Santos (ID: 12345)",
		ip: "192.168.1.10",
		status: "Sucesso",
		details: "Consulta de prontuário eletrônico",
	},
	{
		id: "AUDIT-2024-002",
		timestamp: "2024-01-21T09:15:00Z",
		user: "Enfermeira Ana",
		action: "Modificação de Dados",
		resource: "Agendamento: Consulta 21/01/2024",
		ip: "192.168.1.15",
		status: "Sucesso",
		details: "Reagendamento de consulta por solicitação do paciente",
	},
	{
		id: "AUDIT-2024-003",
		timestamp: "2024-01-21T08:45:00Z",
		user: "Sistema Automático",
		action: "Backup de Dados",
		resource: "Base de Dados Principal",
		ip: "localhost",
		status: "Sucesso",
		details: "Backup automático diário realizado",
	},
];

// Staff Performance Data
export const staffPerformanceData = {
	professionals: [
		{
			name: "Dr. João Silva Santos",
			role: "Dermatologista",
			crm: "CRM-SP 123456",
			patients: 1247,
			procedures: 2847,
			satisfaction: 4.9,
			revenue: 345_670.0,
		},
		{
			name: "Dra. Maria Oliveira",
			role: "Dermatologista",
			crm: "CRM-SP 234567",
			patients: 1156,
			procedures: 2234,
			satisfaction: 4.7,
			revenue: 298_450.0,
		},
		{
			name: "Enfª Ana Paula",
			role: "Enfermeira",
			coren: "COREN-SP 123456",
			patients: 2847,
			procedures: 5692,
			satisfaction: 4.8,
			support: true,
		},
	],
	teamMetrics: {
		averageSatisfaction: 4.8,
		totalRevenue: 644_120.0,
		productivityIndex: 94.2,
		trainingCompliance: 98.5,
	},
};

// Export all data
export const reportData = {
	lgpd: lgpdComplianceData,
	anvisa: anvisaInspectionData,
	cfm: cfmProfessionalData,
	ans: ansPerformanceData,
	financial: financialData,
	clinical: clinicalData,
	demographics: patientDemographics,
	audit: auditTrailData,
	staff: staffPerformanceData,
};

// Utility functions for Brazilian formatting
export const formatCurrency = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

export const formatPercentage = (value: number): string => {
	return new Intl.NumberFormat("pt-BR", {
		style: "percent",
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	}).format(value / 100);
};

export const formatDate = (date: string): string => {
	return new Date(date).toLocaleDateString("pt-BR");
};

export const formatCPF = (cpf: string): string => {
	return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const formatCNPJ = (cnpj: string): string => {
	return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};
