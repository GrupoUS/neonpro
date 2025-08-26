// Healthcare-specific types for Brazilian market
export type PatientInfo = {
	id: string;
	name: string;
	cpf: string;
	sus?: string; // Sistema Único de Saúde number
	phone: string;
	email?: string;
	birthDate: string;
	gender: "M" | "F" | "O";
	address: Address;
	emergencyContact: EmergencyContact;
	lgpdConsent: LGPDConsent;
};

export type Address = {
	street: string;
	number: string;
	complement?: string;
	neighborhood: string;
	city: string;
	state: string;
	cep: string;
	region: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
};

export type EmergencyContact = {
	name: string;
	relationship: string;
	phone: string;
	alternativePhone?: string;
};

export type LGPDConsent = {
	dataProcessing: boolean;
	marketing: boolean;
	dataSharing: boolean;
	consentDate: string;
	consentVersion: string;
	ipAddress: string;
	userAgent: string;
};

export type HealthcareProfessional = {
	id: string;
	name: string;
	crm: string; // Conselho Regional de Medicina
	specialty: string;
	phone: string;
	email: string;
};

export type MedicalRecord = {
	id: string;
	patientId: string;
	professionalId: string;
	date: string;
	type: "consultation" | "procedure" | "emergency" | "followup";
	description: string;
	diagnosis?: string;
	treatment?: string;
	medications?: Medication[];
	attachments?: MedicalAttachment[];
};

export type Medication = {
	name: string;
	dosage: string;
	frequency: string;
	duration: string;
	instructions?: string;
	anvisaCode?: string;
};

export type MedicalAttachment = {
	id: string;
	filename: string;
	type: "image" | "document" | "exam";
	url: string;
	uploadDate: string;
	lgpdClassification: "public" | "internal" | "confidential" | "restricted";
};

// UI/UX specific types
export type EmergencyAlert = {
	id: string;
	type: "critical" | "high" | "medium";
	message: string;
	patientId?: string;
	roomNumber?: string;
	timestamp: string;
	acknowledged: boolean;
	acknowledgedBy?: string;
};

export type ConnectivityLevel = {
	type: "2G" | "3G" | "4G" | "5G" | "wifi";
	strength: "weak" | "medium" | "strong";
	latency: number; // ms
};

export type RegionalSettings = {
	region: "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";
	connectivity: ConnectivityLevel;
	language: "pt-BR";
	timezone: string;
	currency: "BRL";
	dateFormat: "DD/MM/YYYY";
};

// Accessibility types
export type AccessibilityOptions = {
	highContrast: boolean;
	largeText: boolean;
	screenReader: boolean;
	voiceNavigation: boolean;
	colorBlindSupport: boolean;
	language: "pt-BR";
};

// LGPD Compliance types
export type LGPDCompliance = {
	consentRequired: boolean;
	dataClassification: "public" | "internal" | "confidential" | "restricted";
	retentionPeriod: number; // days
	auditRequired: boolean;
	anonymizationRequired: boolean;
};

export type AuditEvent = {
	id: string;
	userId: string;
	action: string;
	resource: string;
	timestamp: string;
	ipAddress: string;
	userAgent: string;
	outcome: "success" | "failure";
	details?: Record<string, any>;
};
