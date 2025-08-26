// Healthcare Mock Data for NeonPro Testing
// LGPD-compliant synthetic data for testing purposes

export const mockPatients = [
  {
    id: "patient-001",
    name: "João Silva Santos",
    cpf: "123.456.789-00",
    email: "joao.test@example.com",
    phone: "(11) 98765-4321",
    dateOfBirth: "1985-03-15",
    consent: {
      lgpd_consent: true,
      data_processing_consent: true,
      marketing_consent: false,
      consent_date: "2024-01-15T10:30:00Z",
      consent_version: "1.0",
    },
    address: {
      street: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      country: "Brazil",
    },
    medicalInfo: {
      allergies: ["Penicilina"],
      bloodType: "O+",
      emergencyContact: {
        name: "Maria Silva Santos",
        phone: "(11) 99999-8888",
        relationship: "Esposa",
      },
    },
    auditTrail: {
      created_at: "2024-01-15T10:30:00Z",
      created_by: "admin-001",
      last_modified: "2024-01-20T14:15:00Z",
      last_modified_by: "doctor-001",
    },
  },
  {
    id: "patient-002",
    name: "Maria Oliveira Costa",
    cpf: "987.654.321-00",
    email: "maria.test@example.com",
    phone: "(11) 97654-3210",
    dateOfBirth: "1992-07-22",
    consent: {
      lgpd_consent: true,
      data_processing_consent: true,
      marketing_consent: true,
      consent_date: "2024-01-10T09:15:00Z",
      consent_version: "1.0",
    },
    address: {
      street: "Av. Paulista, 1000",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      country: "Brazil",
    },
    medicalInfo: {
      allergies: [],
      bloodType: "A+",
      emergencyContact: {
        name: "José Oliveira Costa",
        phone: "(11) 88888-7777",
        relationship: "Pai",
      },
    },
    auditTrail: {
      created_at: "2024-01-10T09:15:00Z",
      created_by: "admin-001",
      last_modified: "2024-01-18T16:30:00Z",
      last_modified_by: "nurse-001",
    },
  },
];

export const mockHealthcareProfessionals = [
  {
    id: "prof-001",
    name: "Dr. Carlos Eduardo Medicina",
    cfm_license: "CRM/SP 123456",
    specialty: "Dermatologia",
    email: "dr.carlos@neonpro.com",
    phone: "(11) 99999-0001",
    status: "active",
    digital_signature: {
      certificate_id: "CERT-001-2024",
      valid_until: "2025-12-31T23:59:59Z",
      issuer: "ICP-Brasil",
    },
    credentials: {
      medical_school: "Universidade de São Paulo",
      graduation_year: 2010,
      residency: "Hospital das Clínicas - USP",
      board_certifications: ["Dermatologia Clínica", "Dermatologia Cirúrgica"],
    },
    auditTrail: {
      created_at: "2024-01-01T08:00:00Z",
      last_login: "2024-01-20T08:30:00Z",
      last_validation: "2024-01-15T10:00:00Z",
    },
  },
  {
    id: "prof-002",
    name: "Dra. Ana Paula Dermatologia",
    cfm_license: "CRM/SP 654321",
    specialty: "Dermatologia Estética",
    email: "dra.ana@neonpro.com",
    phone: "(11) 99999-0002",
    status: "active",
    digital_signature: {
      certificate_id: "CERT-002-2024",
      valid_until: "2025-11-30T23:59:59Z",
      issuer: "ICP-Brasil",
    },
    credentials: {
      medical_school: "Universidade Federal de São Paulo",
      graduation_year: 2012,
      residency: "Hospital Santa Casa",
      board_certifications: ["Dermatologia Estética", "Medicina Estética"],
    },
    auditTrail: {
      created_at: "2024-01-01T08:00:00Z",
      last_login: "2024-01-20T09:15:00Z",
      last_validation: "2024-01-15T11:30:00Z",
    },
  },
];

export const mockMedicalDevices = [
  {
    id: "device-001",
    name: "Laser Dermatológico CO2",
    anvisa_registration: "REG-001-2024",
    manufacturer: "MedDevice Brasil Ltda",
    model: "CO2-LASER-PRO-2024",
    serial_number: "SN-001-2024-BR",
    status: "approved",
    category: "Class III Medical Device",
    specifications: {
      power: "30W",
      wavelength: "10.6μm",
      safety_features: ["Emergency Stop", "Eye Protection", "Cooling System"],
    },
    compliance: {
      anvisa_approval_date: "2024-01-05T00:00:00Z",
      anvisa_expiry_date: "2029-01-05T00:00:00Z",
      iso_certification: "ISO 13485:2016",
      ce_marking: true,
    },
    maintenance: {
      last_calibration: "2024-01-10T14:00:00Z",
      next_calibration: "2024-07-10T14:00:00Z",
      maintenance_contract: "MAINT-001-2024",
    },
    auditTrail: {
      registered_at: "2024-01-05T10:00:00Z",
      registered_by: "admin-001",
      last_inspection: "2024-01-10T14:00:00Z",
      inspector: "tech-001",
    },
  },
];

export const mockAuditLogs = [
  {
    id: "audit-001",
    action: "patient_data_access",
    resource_type: "patient",
    resource_id: "patient-001",
    user_id: "prof-001",
    user_type: "healthcare_professional",
    timestamp: "2024-01-20T10:30:00Z",
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    session_id: "sess-001-2024",
    compliance_flags: {
      lgpd_compliant: true,
      purpose_documented: true,
      consent_verified: true,
    },
    metadata: {
      access_reason: "Routine consultation",
      data_fields_accessed: ["name", "cpf", "medical_history"],
      duration_minutes: 15,
    },
  },
  {
    id: "audit-002",
    action: "device_operation",
    resource_type: "medical_device",
    resource_id: "device-001",
    user_id: "prof-002",
    user_type: "healthcare_professional",
    timestamp: "2024-01-20T14:15:00Z",
    ip_address: "192.168.1.101",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    session_id: "sess-002-2024",
    compliance_flags: {
      anvisa_compliant: true,
      safety_verified: true,
      operator_certified: true,
    },
    metadata: {
      operation_type: "laser_treatment",
      patient_id: "patient-002",
      treatment_duration_minutes: 30,
      power_settings: "25W",
    },
  },
];

export const mockComplianceReports = {
  lgpd: {
    report_id: "LGPD-RPT-2024-001",
    generated_at: "2024-01-20T18:00:00Z",
    period: {
      start_date: "2024-01-01T00:00:00Z",
      end_date: "2024-01-20T23:59:59Z",
    },
    summary: {
      total_data_subjects: 2,
      consent_rate: 100,
      data_breaches: 0,
      subject_requests: 0,
      compliance_score: 98.5,
    },
    details: {
      consent_management: "Compliant",
      data_minimization: "Compliant",
      right_to_access: "Compliant",
      right_to_rectification: "Compliant",
      right_to_erasure: "Compliant",
      data_portability: "Compliant",
    },
  },
  anvisa: {
    report_id: "ANVISA-RPT-2024-001",
    generated_at: "2024-01-20T18:00:00Z",
    period: {
      start_date: "2024-01-01T00:00:00Z",
      end_date: "2024-01-20T23:59:59Z",
    },
    summary: {
      registered_devices: 1,
      compliance_rate: 100,
      adverse_events: 0,
      device_recalls: 0,
      compliance_score: 99.2,
    },
    details: {
      device_registration: "Compliant",
      adverse_event_reporting: "Compliant",
      quality_management: "Compliant",
      post_market_surveillance: "Compliant",
    },
  },
  cfm: {
    report_id: "CFM-RPT-2024-001",
    generated_at: "2024-01-20T18:00:00Z",
    period: {
      start_date: "2024-01-01T00:00:00Z",
      end_date: "2024-01-20T23:59:59Z",
    },
    summary: {
      licensed_professionals: 2,
      license_compliance_rate: 100,
      digital_signature_compliance: 100,
      telemedicine_sessions: 0,
      compliance_score: 97.8,
    },
    details: {
      professional_licensing: "Compliant",
      digital_signatures: "Compliant",
      electronic_prescriptions: "Compliant",
      telemedicine_compliance: "Not Applicable",
    },
  },
};
