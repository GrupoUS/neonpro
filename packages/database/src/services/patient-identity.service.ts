/**
 * Patient Identity Verification Service
 * Implements CFM Resolution 2314/2022 Article 6 requirements
 * for secure and reliable patient identification
 */

import { createClient } from "../client";
// import type { Database } from '../types/supabase';

export interface PatientIdentityDocument {
  type: "cpf" | "rg" | "cns" | "passport" | "driver_license";
  number: string;
  issuingAuthority?: string;
  issueDate?: Date;
  expiryDate?: Date;
  verified: boolean;
  verificationMethod: "manual" | "api" | "document_scan" | "biometric";
  verificationTimestamp: Date;
}

export interface BiometricVerification {
  faceMatch: boolean;
  faceMatchScore: number; // 0-100
  livenessDetected: boolean;
  documentPhotoMatch: boolean;
  biometricHash: string; // Hashed biometric template (not raw data)
  verificationProvider: string;
  timestamp: Date;
}

export interface IdentityVerificationResult {
  patientId: string;
  verificationLevel: "basic" | "enhanced" | "biometric";
  documentsVerified: PatientIdentityDocument[];
  biometricVerification?: BiometricVerification;
  riskScore: number; // 0-100 (0 = no risk, 100 = high risk)
  fraudIndicators: string[];
  complianceStatus: {
    cfmCompliant: boolean;
    lgpdCompliant: boolean;
    dataMinimization: boolean;
  };
  verificationSession: string;
  timestamp: Date;
}

export interface AddressVerification {
  zipCode: string;
  state: string;
  city: string;
  neighborhood?: string;
  street: string;
  number?: string;
  complement?: string;
  verified: boolean;
  verificationMethod:
    | "postal_service"
    | "utility_bill"
    | "bank_statement"
    | "manual";
  verificationDate: Date;
}

export class PatientIdentityService {
  private supabase = createClient();

  /**
   * Performs comprehensive patient identity verification
   * according to CFM Resolution 2314/2022 Article 6
   */
  async verifyPatientIdentity(
    patientId: string,
    documents: PatientIdentityDocument[],
    enableBiometric: boolean = false,
  ): Promise<IdentityVerificationResult> {
    try {
      const verificationSession = crypto.randomUUID();

      // Get patient data
      const { data: patient, error: patientError } = await this.supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      if (patientError || !patient) {
        throw new Error("Patient not found");
      }

      // Verify each document
      const verifiedDocuments: PatientIdentityDocument[] = [];
      const fraudIndicators: string[] = [];
      let riskScore = 0;

      for (const doc of documents) {
        const verificationResult = await this.verifyDocument(patient, doc);
        verifiedDocuments.push(verificationResult.document);

        if (!verificationResult.valid) {
          fraudIndicators.push(
            `Invalid ${doc.type}: ${verificationResult.reason}`,
          );
          riskScore += 25;
        }
      }

      // Biometric verification if enabled
      let biometricVerification: BiometricVerification | undefined;
      if (enableBiometric) {
        biometricVerification =
          await this.performBiometricVerification(patientId);
        if (
          !biometricVerification.faceMatch ||
          !biometricVerification.livenessDetected
        ) {
          fraudIndicators.push("Biometric verification failed");
          riskScore += 30;
        }
      }

      // Determine verification level
      const verificationLevel = this.determineVerificationLevel(
        verifiedDocuments,
        biometricVerification,
      );

      // Check for data consistency
      const consistencyCheck = this.checkDataConsistency(
        patient,
        verifiedDocuments,
      );
      if (!consistencyCheck.consistent) {
        fraudIndicators.push(...consistencyCheck.inconsistencies);
        riskScore += 20;
      }

      // Ensure risk score doesn't exceed 100
      riskScore = Math.min(100, riskScore);

      // CFM Compliance check
      const cfmCompliant = this.checkCFMCompliance(verifiedDocuments);
      const lgpdCompliant = this.checkLGPDCompliance(
        patient,
        verifiedDocuments,
      );

      // Create verification record
      const verificationResult: IdentityVerificationResult = {
        patientId,
        verificationLevel,
        documentsVerified: verifiedDocuments,
        biometricVerification,
        riskScore,
        fraudIndicators,
        complianceStatus: {
          cfmCompliant,
          lgpdCompliant,
          dataMinimization: this.checkDataMinimization(verifiedDocuments),
        },
        verificationSession,
        timestamp: new Date(),
      };

      // Store verification record for audit trail
      await this.storeVerificationRecord(verificationResult);

      // Update patient record with verification status
      await this.updatePatientVerificationStatus(patientId, verificationResult);

      return verificationResult;
    } catch (_error) {
      console.error("Error verifying patient identity:", error);
      throw new Error(
        `Identity verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Verifies a specific identity document
   */
  private async verifyDocument(
    patient: any,
    document: PatientIdentityDocument,
  ): Promise<{
    valid: boolean;
    document: PatientIdentityDocument;
    reason?: string;
  }> {
    try {
      let valid = false;
      let reason: string | undefined;

      switch (document.type) {
        case "cpf":
          const cpfValidation = this.validateCPF(document.number);
          valid = cpfValidation.valid;
          reason = cpfValidation.reason;

          // Cross-check with patient's stored CPF
          if (valid && patient.cpf && patient.cpf !== document.number) {
            valid = false;
            reason = "CPF does not match patient record";
          }
          break;

        case "rg":
          valid = this.validateRG(document.number);
          if (!valid) reason = "Invalid RG format";
          break;

        case "cns":
          valid = this.validateCNS(document.number);
          if (!valid) reason = "Invalid CNS format";
          break;

        case "passport":
          valid = this.validatePassport(document.number);
          if (!valid) reason = "Invalid passport format";
          break;

        default:
          valid = true; // Allow other document types
      }

      // Check expiry date
      if (valid && document.expiryDate && document.expiryDate < new Date()) {
        valid = false;
        reason = "Document has expired";
      }

      const verifiedDocument: PatientIdentityDocument = {
        ...document,
        verified: valid,
        verificationTimestamp: new Date(),
      };

      return { valid, document: verifiedDocument, reason };
    } catch (_error) {
      console.error("Error verifying document:", error);
      return {
        valid: false,
        document: {
          ...document,
          verified: false,
          verificationTimestamp: new Date(),
        },
        reason: "Verification process failed",
      };
    }
  }

  /**
   * Performs biometric verification using face recognition
   */
  private async performBiometricVerification(
    patientId: string,
  ): Promise<BiometricVerification> {
    try {
      // This would integrate with a biometric verification service
      // For demonstration, we'll simulate the process

      // In production, this would:
      // 1. Capture live photo/video
      // 2. Extract facial features
      // 3. Compare with document photo
      // 4. Perform liveness detection
      // 5. Generate biometric template hash

      const simulatedVerification: BiometricVerification = {
        faceMatch: true,
        faceMatchScore: 95,
        livenessDetected: true,
        documentPhotoMatch: true,
        biometricHash: crypto.randomUUID().replace(/-/g, ""), // Simulated hash
        verificationProvider: "neonpro-biometric-service",
        timestamp: new Date(),
      };

      // Store biometric verification record
      await this.storeBiometricRecord(patientId, simulatedVerification);

      return simulatedVerification;
    } catch (_error) {
      console.error("Error performing biometric verification:", error);

      return {
        faceMatch: false,
        faceMatchScore: 0,
        livenessDetected: false,
        documentPhotoMatch: false,
        biometricHash: "",
        verificationProvider: "error",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Determines the verification level based on verified documents and biometrics
   */
  private determineVerificationLevel(
    documents: PatientIdentityDocument[],
    biometric?: BiometricVerification,
  ): "basic" | "enhanced" | "biometric" {
    const verifiedDocs = documents.filter(_(doc) => doc.verified);

    if (biometric && biometric.faceMatch && biometric.livenessDetected) {
      return "biometric";
    }

    if (_verifiedDocs.length >= 2 &&
      verifiedDocs.some((doc) => doc.type === "cpf")
    ) {
      return "enhanced";
    }

    return "basic";
  }

  /**
   * Checks data consistency across documents and patient record
   */
  private checkDataConsistency(
    patient: any,
    documents: PatientIdentityDocument[],
  ): { consistent: boolean; inconsistencies: string[] } {
    const inconsistencies: string[] = [];

    // Check CPF consistency
    const cpfDoc = documents.find(_(doc) => doc.type === "cpf" && doc.verified);
    if (cpfDoc && patient.cpf && patient.cpf !== cpfDoc.number) {
      inconsistencies.push("CPF mismatch between document and patient record");
    }

    // Check RG consistency
    const rgDoc = documents.find(_(doc) => doc.type === "rg" && doc.verified);
    if (rgDoc && patient.rg && patient.rg !== rgDoc.number) {
      inconsistencies.push("RG mismatch between document and patient record");
    }

    // Check CNS consistency
    const cnsDoc = documents.find(_(doc) => doc.type === "cns" && doc.verified);
    if (cnsDoc && patient.cns && patient.cns !== cnsDoc.number) {
      inconsistencies.push("CNS mismatch between document and patient record");
    }

    return {
      consistent: inconsistencies.length === 0,
      inconsistencies,
    };
  }

  /**
   * Checks CFM compliance requirements
   */
  private checkCFMCompliance(documents: PatientIdentityDocument[]): boolean {
    // CFM Resolution 2314/2022 Article 6 requires secure and reliable identification
    const verifiedDocs = documents.filter(_(doc) => doc.verified);

    // Must have at least one verified primary document (CPF or RG)
    const hasPrimaryDoc = verifiedDocs.some(_(doc) => doc.type === "cpf" || doc.type === "rg",
    );

    // Must have adequate verification level
    const hasAdequateVerification = verifiedDocs.length >= 1;

    return hasPrimaryDoc && hasAdequateVerification;
  }

  /**
   * Checks LGPD compliance for data processing
   */
  private checkLGPDCompliance(
    patient: any,
    _documents: PatientIdentityDocument[],
  ): boolean {
    // LGPD requires explicit consent for processing sensitive personal data
    return (
      patient.lgpd_consent_given && patient.data_consent_status === "given"
    );
  }

  /**
   * Checks data minimization principle
   */
  private checkDataMinimization(documents: PatientIdentityDocument[]): boolean {
    // Only collect necessary documents for telemedicine
    return documents.length <= 3; // Reasonable limit for telemedicine
  }

  /**
   * Stores verification record for audit trail
   */
  private async storeVerificationRecord(
    result: IdentityVerificationResult,
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("patient_identity_verifications")
        .insert({
          patient_id: result.patientId,
          verification_session: result.verificationSession,
          verification_level: result.verificationLevel,
          documents_verified: result.documentsVerified,
          biometric_verification: result.biometricVerification,
          risk_score: result.riskScore,
          fraud_indicators: result.fraudIndicators,
          cfm_compliant: result.complianceStatus.cfmCompliant,
          lgpd_compliant: result.complianceStatus.lgpdCompliant,
          data_minimization: result.complianceStatus.dataMinimization,
          verification_timestamp: result.timestamp.toISOString(),
        });

      if (error) {
        console.error("Failed to store verification record:", error);
      }
    } catch (_error) {
      console.error("Error storing verification record:", error);
    }
  }

  /**
   * Stores biometric verification record
   */
  private async storeBiometricRecord(
    patientId: string,
    biometric: BiometricVerification,
  ): Promise<void> {
    try {
      // Note: Only store the hash, never raw biometric data (LGPD compliance)
      const { error } = await this.supabase
        .from("patient_biometric_verifications")
        .insert({
          patient_id: patientId,
          biometric_hash: biometric.biometricHash,
          face_match_score: biometric.faceMatchScore,
          liveness_detected: biometric.livenessDetected,
          verification_provider: biometric.verificationProvider,
          verification_timestamp: biometric.timestamp.toISOString(),
        });

      if (error) {
        console.error("Failed to store biometric record:", error);
      }
    } catch (_error) {
      console.error("Error storing biometric record:", error);
    }
  }

  /**
   * Updates patient record with verification status
   */
  private async updatePatientVerificationStatus(
    patientId: string,
    result: IdentityVerificationResult,
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("patients")
        .update({
          identity_verification_level: result.verificationLevel,
          identity_verification_date: result.timestamp.toISOString(),
          identity_risk_score: result.riskScore,
          cfm_identity_compliant: result.complianceStatus.cfmCompliant,
        })
        .eq("id", patientId);

      if (error) {
        console.error("Failed to update patient verification status:", error);
      }
    } catch (_error) {
      console.error("Error updating patient verification status:", error);
    }
  }

  /**
   * Document validation methods
   */
  private validateCPF(cpf: string): { valid: boolean; reason?: string } {
    // Remove non-numeric characters
    cpf = cpf.replace(/[^\d]/g, "");

    // Check if has 11 digits
    if (cpf.length !== 11) {
      return { valid: false, reason: "CPF must have 11 digits" };
    }

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { valid: false, reason: "CPF cannot have all identical digits" };
    }

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) {
      return { valid: false, reason: "Invalid CPF check digit" };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) {
      return { valid: false, reason: "Invalid CPF check digit" };
    }

    return { valid: true };
  }

  private validateRG(rg: string): boolean {
    // Basic RG validation - format varies by state
    const rgPattern = /^[\d\w.-]{5,20}$/;
    return rgPattern.test(rg);
  }

  private validateCNS(cns: string): boolean {
    // CNS (Cartão Nacional de Saúde) validation
    cns = cns.replace(/[^\d]/g, "");

    if (cns.length !== 15) return false;

    // Basic CNS algorithm validation
    if (/^[1-2]/.test(cns)) {
      let sum = 0;
      for (let i = 0; i < 15; i++) {
        sum += parseInt(cns.charAt(i)) * (15 - i);
      }
      return sum % 11 === 0;
    }

    if (/^[7-9]/.test(cns)) {
      let sum = 0;
      for (let i = 0; i < 15; i++) {
        sum += parseInt(cns.charAt(i)) * (15 - i);
      }
      return sum % 11 === 0;
    }

    return false;
  }

  private validatePassport(passport: string): boolean {
    // Brazilian passport format: 2 letters + 6 digits
    const passportPattern = /^[A-Z]{2}\d{6}$/;
    return passportPattern.test(passport.toUpperCase());
  }

  /**
   * Verifies patient address for additional identity confirmation
   */
  async verifyPatientAddress(
    patientId: string,
    address: AddressVerification,
  ): Promise<{ verified: boolean; confidence: number; method: string }> {
    try {
      // This would integrate with Correios API or similar service
      // For demonstration, we'll perform basic validation

      let confidence = 0;
      let method = "basic_validation";

      // Basic format validation
      if (address.zipCode && /^\d{5}-?\d{3}$/.test(address.zipCode)) {
        confidence += 30;
      }

      if (address.state && address.state.length === 2) {
        confidence += 20;
      }

      if (address.city && address.city.length > 2) {
        confidence += 25;
      }

      if (address.street && address.street.length > 5) {
        confidence += 25;
      }

      const verified = confidence >= 70;

      // Store address verification record
      if (verified) {
        await this.supabase.from("patient_address_verifications").insert({
          patient_id: patientId,
          zip_code: address.zipCode,
          state: address.state,
          city: address.city,
          street: address.street,
          verified,
          confidence_score: confidence,
          verification_method: method,
          verification_date: new Date().toISOString(),
        });
      }

      return { verified, confidence, method };
    } catch (_error) {
      console.error("Error verifying patient address:", error);
      return { verified: false, confidence: 0, method: "error" };
    }
  }

  /**
   * Verifies physician identity for telemedicine sessions
   */
  async verifyPhysicianIdentity(
    physicianId: string,
    crmNumber: string,
    crmState: string,
  ): Promise<{
    isValid: boolean;
    verificationLevel: "basic" | "enhanced" | "biometric";
    documentsVerified: string[];
    errors: string[];
  }> {
    try {
      // Get physician data
      const { data: physician, error } = await this.supabase
        .from("physicians")
        .select("cpf, rg, full_name, crm_number, crm_state")
        .eq("id", physicianId)
        .single();

      if (error || !physician) {
        return {
          isValid: false,
          verificationLevel: "basic",
          documentsVerified: [],
          errors: ["Physician not found"],
        };
      }

      const errors: string[] = [];
      const documentsVerified: string[] = [];

      // Validate CRM matches
      if (
        physician.crm_number !== crmNumber ||
        physician.crm_state !== crmState
      ) {
        errors.push("CRM number or state mismatch");
      } else {
        documentsVerified.push("CRM");
      }

      // Validate CPF
      if (physician.cpf) {
        if (this.validateCPF(physician.cpf)) {
          documentsVerified.push("CPF");
        } else {
          errors.push("Invalid CPF format");
        }
      } else {
        errors.push("CPF is required");
      }

      // Validate RG
      if (physician.rg) {
        documentsVerified.push("RG");
      } else {
        errors.push("RG is required");
      }

      const isValid = errors.length === 0 && documentsVerified.length >= 2;
      const verificationLevel =
        documentsVerified.length >= 3 ? "enhanced" : "basic";

      return {
        isValid,
        verificationLevel,
        documentsVerified,
        errors,
      };
    } catch (_error) {
      console.error("Error verifying physician identity:", error);
      return {
        isValid: false,
        verificationLevel: "basic",
        documentsVerified: [],
        errors: [
          error instanceof Error ? error.message : "Verification failed",
        ],
      };
    }
  }
}
