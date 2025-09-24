---
title: "Aesthetic Professional Council Virtual Consultation Requirements"
last_updated: 2025-09-23
tags:
  [CNEP-COREN-CFF, virtual-consultation, regulations, compliance, Brazil, technical-requirements]
related:
  - ./virtual-consultation-platform-research.md
  - ./virtual-consultation-platform-architecture.md
  - ../rules/supabase-best-practices.md
---

# Aesthetic Professional Council Virtual Consultation Requirements

## Overview

Detailed analysis of aesthetic professional council requirements for virtual consultation implementation in Brazil, with specific mapping to NeonPro platform technical specifications for aesthetic clinics.

## Aesthetic Professional Council Key Requirements

### Virtual Consultation Definition

**Definition**: "Virtual consultation in aesthetic procedures as the practice of aesthetic services mediated by Digital Information and Communication Technologies (DICTs), for consultation, education, treatment planning, procedure guidance, and aesthetic management."

**Technical Implications**:

- All communications must use secure digital technologies
- Platform must support multiple use cases: consultation, education, treatment planning
- System must enable aesthetic service delivery and procedure guidance workflows

### Virtual Consultation Modalities

**Requirements**: "Virtual consultation for aesthetic procedures, in real-time online (synchronous) or offline (asynchronous), by multimedia in technology, is permitted within the national territory."

**Technical Requirements**:

```yaml
synchronous_support:
  - real_time_video_calls: required
  - audio_communication: required
  - instant_messaging: required
  - screen_sharing: recommended

asynchronous_support:
  - message_exchange: required
  - file_sharing: required
  - consultation_scheduling: required
  - follow_up_tracking: required

multimedia_requirements:
  - video_resolution: "minimum 720p"
  - audio_quality: "22kHz sampling rate minimum"
  - image_sharing: "aesthetic procedure quality"
  - document_exchange: "encrypted transmission"
```

### Article 3 - Data Preservation Requirements

**Text**: "In services provided by virtual consultation, client data and images contained in the aesthetic record must be preserved, obeying the legal norms and professional councils pertaining to confidentiality, availability, and integrity."

**Implementation Requirements**:

```typescript
interface DataPreservationRequirements {
  confidentiality: {
    encryption: 'AES-256-GCM';
    accessControl: 'role-based-rbac';
    auditTrail: 'immutable-logging';
  };

  availability: {
    uptime: '99.9%';
    backupFrequency: 'real-time';
    disasterRecovery: 'geographic-redundancy';
  };

  integrity: {
    digitalSignature: 'required';
    checksumValidation: 'mandatory';
    versionControl: 'complete-history';
  };

  retention: {
    aestheticRecords: '20-years';
    consultationRecordings: '20-years';
    auditLogs: '10-years';
    accessLogs: '5-years';
  };
}
```

### Article 4 - Aesthetic Professional Requirements

**Text**: "Virtual consultation must be performed by aesthetic professionals registered with their respective professional councils (CNEP, COREN, CFF, etc.) and with active license."

**Technical Validation**:

```typescript
interface ProfessionalLicenseValidation {
  validateProfessionalLicense(
    licenseNumber: string,
    councilType: 'CNEP' | 'COREN' | 'CFF' | 'OTHER',
    state: string,
  ): Promise<LicenseStatus>;
  checkLicenseExpiry(professionalId: string): Promise<boolean>;
  verifySpecialization(professionalId: string, specialty: string): Promise<boolean>;
  updateLicenseStatus(professionalId: string): Promise<void>;
}

interface LicenseStatus {
  isActive: boolean;
  licenseNumber: string;
  councilType: string;
  state: string;
  expiryDate: Date;
  specializations: string[];
  restrictions: string[];
}
```

### Article 6 - Client Identification

**Text**: "Client identification must be done safely and reliably, following current legal standards."

**Identity Verification Requirements**:

```typescript
interface ClientIdentification {
  cpf: string; // Brazilian Tax ID (required)
  rg: string; // State ID
  fullName: string;
  dateOfBirth: Date;
  phone: string; // Primary contact method
  email: string; // For appointment confirmations

  // Biometric verification (recommended)
  faceVerification?: boolean;
  documentPhotos?: {
    cpfPhoto: string;
    rgPhoto: string;
  };

  // Address verification
  addressVerification: {
    zipCode: string;
    state: string;
    city: string;
    street: string;
  };
}
```

### Article 8 - Informed Consent

**Text**: "Informed consent for virtual consultation must be obtained from the client or legal representative."

**Consent Management System**:

```typescript
interface VirtualConsultationConsent {
  consentId: string;
  clientId: string;
  consentType: 'virtual_consultation' | 'recording' | 'data_processing' | 'aesthetic_procedure';

  consentDetails: {
    purpose: string;
    dataTypes: string[];
    retentionPeriod: string;
    sharingScope: string[];
  };

  consentStatus: 'pending' | 'granted' | 'revoked';
  grantedAt?: Date;
  revokedAt?: Date;

  // Legal basis under LGPD
  legalBasis: 'consent' | 'legitimate_interest' | 'contractual_necessity';

  // Consent evidence
  ipAddress: string;
  userAgent: string;
  consentMethod: 'digital_signature' | 'checkbox' | 'verbal_recorded';

  // Withdrawal rights
  withdrawalMethod: string;
  withdrawalEffects: string;
}
```

### Article 10 - Technical Infrastructure

**Text**: "Services provided through virtual consultation must have adequate technological infrastructure and comply with professional council rules regarding storage, handling, integrity, accuracy, confidentiality, privacy, irrefutability, and professional confidentiality of information."

**Infrastructure Requirements Mapping**:

```yaml
technological_infrastructure:
  minimum_requirements:
    internet_bandwidth: "10 Mbps upload/download"
    latency: "< 150ms"
    uptime: "99.9%"
    concurrent_users: "100+ simultaneous sessions"

  server_requirements:
    geographic_location: "Brazil only"
    data_residency: "Brazilian territory mandatory"
    backup_locations: "Multiple Brazilian regions"
    encryption_at_rest: "AES-256"
    encryption_in_transit: "TLS 1.3"

  compliance_features:
    storage_compliance:
      - aesthetic_record_integration: true
      - data_lifecycle_management: true
      - secure_deletion_capabilities: true
      - geographic_restrictions: "Brazil only"

    handling_compliance:
      - role_based_access_control: true
      - multi_factor_authentication: true
      - session_timeouts: true
      - automatic_logout: true

    integrity_compliance:
      - digital_signatures: true
      - checksum_validation: true
      - audit_trail: "immutable"
      - version_control: "complete"

    accuracy_compliance:
      - real_time_synchronization: true
      - data_validation: "strict"
      - error_detection: "automatic"
      - correction_tracking: true

    confidentiality_compliance:
      - end_to_end_encryption: true
      - secure_communication_channels: true
      - encrypted_storage: true
      - key_management: "HSM-based"

    privacy_compliance:
      - data_minimization: true
      - purpose_limitation: true
      - consent_management: true
      - right_to_erasure: true

    irrefutability_compliance:
      - digital_certificates: true
      - timestamp_services: true
      - non_repudiation: true
      - legal_evidence_format: true

    professional_confidentiality:
      - aesthetic_professional_access_only: true
      - client_data_isolation: true
      - confidentiality_agreements: true
      - breach_notification: "automatic"
```

### Article 11 - Aesthetic Record Integration

**Text**: "Records must be made in a physical aesthetic record or using information systems in the Electronic Aesthetic Record System (SREA) of the client, meeting standards of representation, terminology, and interoperability."

**Aesthetic Record Integration Requirements**:

```typescript
interface AestheticRecordIntegration {
  // Standard compliance
  standards: {
    terminology: 'Aesthetic Procedures' | 'Cosmetic Products' | 'Treatment Codes';
    representation: 'HL7-FHIR';
    interoperability: 'openEHR';
  };

  // Record structure
  consultation_record: {
    session_id: string;
    professional_id: string;
    client_id: string;
    consultation_date: Date;
    consultation_type: 'virtual_consultation';

    // Aesthetic consultation data
    client_concerns: string;
    aesthetic_history: string;
    skin_assessment: string;
    treatment_plan: string;
    product_recommendations: Product[];

    // Virtual consultation specific
    technology_used: string;
    session_quality: QualityMetrics;
    technical_issues: string[];

    // Legal compliance
    informed_consent_obtained: boolean;
    client_identification_verified: boolean;
    professional_license_verified: boolean;
  };

  // Integration methods
  integration_apis: {
    createConsultationRecord(record: ConsultationRecord): Promise<string>;
    updateAestheticRecord(
      clientId: string,
      updates: RecordUpdate[],
    ): Promise<void>;
    retrieveClientHistory(clientId: string): Promise<AestheticHistory>;
    generateAestheticSummary(sessionId: string): Promise<AestheticSummary>;
  };
}
```

### Article 17 - Legal Entity Requirements

**Text**: "Legal entities that provide virtual consultation services, communication platforms, and data archiving must have headquarters established in Brazilian territory and be registered with the relevant professional councils of the state where they are based."

**Company Registration Requirements**:

```yaml
legal_entity_requirements:
  business_registration:
    headquarters_location: "Brazil mandatory"
    professional_council_registration: "Required in operational state"
    technical_responsibility: "Licensed aesthetic professional required"
    anvisa_registration: "Cosmetic product software"

  compliance_documentation:
    - company_registration: "CNPJ required"
    - professional_council_technical_responsibility: "Active aesthetic professional"
    - anvisa_cosmetic_registration: "Cosmetic software registration"
    - data_protection_officer: "LGPD compliance"
    - quality_management_system: "ISO 9001"

  operational_requirements:
    data_processing_location: "Brazil only"
    customer_support: "Portuguese language"
    legal_jurisdiction: "Brazilian law"
    regulatory_compliance: "Professional Councils + ANVISA + LGPD"
```

## Technical Implementation Mapping

### 1. Authentication and Authorization System

```typescript
class ProfessionalCouncilAuthenticationService {
  async validateProfessionalCredentials(
    credentials: ProfessionalCredentials,
  ): Promise<AuthResult> {
    // Validate professional license with relevant council API
    const licenseStatus = await this.councilApi.validateLicense(
      credentials.licenseNumber,
      credentials.councilType,
      credentials.state,
    );

    if (!licenseStatus.isActive) {
      throw new Error('Invalid or inactive professional license');
    }

    // Create authenticated session
    return {
      userId: credentials.professionalId,
      role: 'aesthetic_professional',
      licenseNumber: credentials.licenseNumber,
      councilType: credentials.councilType,
      specializations: licenseStatus.specializations,
      sessionToken: this.generateSecureToken(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    };
  }

  async validateClientIdentity(
    identity: ClientIdentity,
  ): Promise<IdentityResult> {
    // Validate CPF format and check digit
    if (!this.validateCPF(identity.cpf)) {
      throw new Error('Invalid CPF format');
    }

    // Optional: Integrate with Receita Federal for CPF validation

    return {
      verified: true,
      cpf: identity.cpf,
      fullName: identity.fullName,
      verificationMethod: 'document_check',
      verifiedAt: new Date(),
    };
  }
}
```

### 2. Session Management and Recording

```typescript
class VirtualConsultationSessionService {
  async createSession(
    params: CreateSessionParams,
  ): Promise<VirtualConsultationSession> {
    // Validate all professional council requirements
    await this.validateCompliance(params);

    const session = await this.database.virtual_consultation_sessions.create({
      data: {
        professional_id: params.professionalId,
        client_id: params.clientId,
        session_type: params.type,
        status: 'scheduled',
        webrtc_room_id: this.generateRoomId(),
        license_verified: true,
        lgpd_consent_obtained: params.consentObtained,
        compliance_verified: true,
        scheduled_at: params.scheduledTime,
      },
    });

    // Initialize audit logging
    await this.auditService.logEvent({
      event_type: 'session_created',
      session_id: session.id,
      professional_id: params.professionalId,
      client_id: params.clientId,
      compliance_status: 'council_verified',
    });

    return session;
  }

  async startRecording(sessionId: string): Promise<void> {
    // Verify recording consent
    const session = await this.getSession(sessionId);
    if (!session.client_consent_recording) {
      throw new Error('Client consent for recording not obtained');
    }

    // Start encrypted recording
    const recordingConfig = {
      encryption: 'AES-256-GCM',
      storage: 'brazilian-servers-only',
      retention: '20-years',
      format: 'consultation-grade-quality',
    };

    await this.recordingService.startRecording(sessionId, recordingConfig);

    // Log recording start
    await this.auditService.logEvent({
      event_type: 'recording_started',
      session_id: sessionId,
      consent_verified: true,
      encryption_enabled: true,
    });
  }
}
```

### 3. Data Preservation and Compliance

```typescript
class DataPreservationService {
  async preserveConsultationData(
    sessionId: string,
    consultationData: ConsultationData,
  ): Promise<void> {
    // Encrypt sensitive data
    const encryptedData = await this.encryptionService.encrypt(
      consultationData,
      'AES-256-GCM',
    );

    // Create digital signature for integrity
    const digitalSignature = await this.signingService.sign(encryptedData);

    // Store with metadata
    await this.database.consultation_records.create({
      data: {
        session_id: sessionId,
        encrypted_data: encryptedData,
        digital_signature: digitalSignature,
        preservation_metadata: {
          encryption_algorithm: 'AES-256-GCM',
          signing_algorithm: 'RSA-PSS',
          geographic_location: 'brazil',
          retention_period: '20-years',
          council_compliant: true,
        },
        created_at: new Date(),
      },
    });

    // Create audit trail
    await this.auditService.logEvent({
      event_type: 'data_preserved',
      session_id: sessionId,
      encryption_verified: true,
      signature_verified: true,
      geographic_compliance: 'brazil-only',
    });
  }

  async validateDataIntegrity(recordId: string): Promise<IntegrityResult> {
    const record = await this.database.consultation_records.findUnique({
      where: { id: recordId },
    });

    // Verify digital signature
    const signatureValid = await this.signingService.verify(
      record.encrypted_data,
      record.digital_signature,
    );

    // Verify encryption integrity
    const encryptionValid = await this.encryptionService.validateIntegrity(
      record.encrypted_data,
    );

    return {
      signature_valid: signatureValid,
      encryption_valid: encryptionValid,
      overall_integrity: signatureValid && encryptionValid,
      last_verified: new Date(),
    };
  }
}
```

### 4. Compliance Monitoring Dashboard

```typescript
interface ProfessionalCouncilComplianceStatus {
  // Real-time compliance monitoring
  active_sessions: {
    total: number;
    license_verified: number;
    consent_obtained: number;
    recording_compliant: number;
  };

  // Professional verification status
  professional_compliance: {
    active_licenses: number;
    expired_licenses: number;
    pending_verification: number;
  };

  // Client consent tracking
  consent_status: {
    granted: number;
    pending: number;
    revoked: number;
  };

  // Technical compliance
  technical_status: {
    encryption_enabled: boolean;
    data_residency_compliant: boolean;
    backup_operational: boolean;
    audit_trail_active: boolean;
  };

  // Regulatory alerts
  compliance_alerts: Array<{
    type: 'license_expiry' | 'consent_missing' | 'technical_issue';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    action_required: string;
  }>;
}
```

## Implementation Checklist

### Phase 1: Core Professional Council Compliance

- [ ] Professional council license validation API integration
- [ ] Client identity verification system
- [ ] Informed consent management
- [ ] Aesthetic record integration (HL7-FHIR)
- [ ] Audit logging system

### Phase 2: Technical Infrastructure

- [ ] Brazilian data residency compliance
- [ ] End-to-end encryption implementation
- [ ] Digital signature system
- [ ] Backup and disaster recovery
- [ ] Session recording with consent

### Phase 3: Monitoring and Reporting

- [ ] Real-time compliance dashboard
- [ ] Automated compliance checking
- [ ] Regulatory reporting system
- [ ] Alert and notification system
- [ ] Performance monitoring

### Phase 4: Quality Assurance

- [ ] Security audit and penetration testing
- [ ] Professional council compliance validation
- [ ] Documentation and training
- [ ] Incident response procedures
- [ ] Continuous monitoring setup

## Risk Mitigation Strategies

### 1. License Validation Failures

- **Risk**: Professional license expires or becomes invalid
- **Mitigation**: Daily license status checks, automated alerts, grace period with manual verification

### 2. Client Consent Issues

- **Risk**: Client withdraws consent during session
- **Mitigation**: Real-time consent status checking, immediate session termination procedures, data anonymization

### 3. Technical Infrastructure Failures

- **Risk**: System downtime or data loss
- **Mitigation**: 99.9% uptime guarantee, real-time backups, geographic redundancy within Brazil

### 4. Data Breach or Security Issues

- **Risk**: Unauthorized access to client data
- **Mitigation**: Zero-trust security model, encryption everywhere, immediate breach detection and notification

### 5. Regulatory Changes

- **Risk**: Professional councils update regulations
- **Mitigation**: Regular regulatory monitoring, flexible architecture, compliance team engagement

---

**Compliance Status**: ✅ Requirements mapped to technical specifications
**Implementation Status**: 🟡 Ready for development
**Legal Review**: 🟡 Pending legal team validation
**Next Phase**: Database schema implementation with professional council compliance features
**Last Updated**: 2025-09-23
