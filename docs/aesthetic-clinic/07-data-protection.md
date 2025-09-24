# Data Protection & Privacy Management

## 🔒 Data Protection Overview

The aesthetic clinic system implements comprehensive data protection measures aligned with LGPD requirements, ensuring end-to-end encryption, secure storage, and proper data lifecycle management for sensitive healthcare information.

## 🏗️ Data Protection Architecture

### Protection Layers

```
Application Layer: Input Validation, Data Masking, Access Control
Transport Layer: TLS 1.3, Certificate Pinning, Secure Headers
Database Layer: Encryption at Rest, Row Level Security, Access Logs
Storage Layer: Encrypted Backups, Secure File Storage, Access Controls
Audit Layer: Complete Activity Logging, Compliance Monitoring
```

## 🗃️ Data Classification & Handling

### Data Classification Framework

```typescript
// apps/api/src/services/sensitive-field-analyzer.ts
export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'restricted' | 'highly_restricted';
  category: 'personal' | 'health' | 'financial' | 'professional' | 'operational';
  retentionPeriod: number; // days
  encryptionRequired: boolean;
  accessLogging: boolean;
  consentRequired: boolean;
  anonymizationMethod: 'masking' | 'pseudonymization' | 'aggregation' | 'deletion';
}

export const DATA_CLASSIFICATIONS: Record<string, DataClassification> = {
  // Personal Identifiable Information
  cpf: {
    level: 'highly_restricted',
    category: 'personal',
    retentionPeriod: 3650, // 10 years
    encryptionRequired: true,
    accessLogging: true,
    consentRequired: true,
    anonymizationMethod: 'pseudonymization',
  },
  email: {
    level: 'restricted',
    category: 'personal',
    retentionPeriod: 1825, // 5 years
    encryptionRequired: true,
    accessLogging: true,
    consentRequired: true,
    anonymizationMethod: 'masking',
  },
  phone: {
    level: 'restricted',
    category: 'personal',
    retentionPeriod: 1825,
    encryptionRequired: true,
    accessLogging: true,
    consentRequired: true,
    anonymizationMethod: 'masking',
  },

  // Health Data
  medical_conditions: {
    level: 'highly_restricted',
    category: 'health',
    retentionPeriod: 7300, // 20 years
    encryptionRequired: true,
    accessLogging: true,
    consentRequired: true,
    anonymizationMethod: 'pseudonymization',
  },
  treatment_history: {
    level: 'highly_restricted',
    category: 'health',
    retentionPeriod: 7300,
    encryptionRequired: true,
    accessLogging: true,
    consentRequired: true,
    anonymizationMethod: 'pseudonymization',
  },
  biometric_data: {
    level: 'highly_restricted',
    category: 'health',
    retentionPeriod: 3650,
    encryptionRequired: true,
    accessLogging: true,
    consentRequired: true,
    anonymizationMethod: 'deletion',
  },

  // Financial Data
  payment_information: {
    level: 'restricted',
    category: 'financial',
    retentionPeriod: 1825,
    encryptionRequired: true,
    accessLogging: true,
    consentRequired: true,
    anonymizationMethod: 'aggregation',
  },

  // Professional Data
  professional_license: {
    level: 'restricted',
    category: 'professional',
    retentionPeriod: 3650,
    encryptionRequired: true,
    accessLogging: true,
    consentRequired: false,
    anonymizationMethod: 'masking',
  },
};

export class DataClassificationService {
  async classifyData(data: any, context: ClassifyContext): Promise<ClassifiedData> {
    const classifiedFields: Record<string, DataClassification> = {};
    let highestLevel: DataClassification['level'] = 'public';

    // Analyze each field
    for (const [field, value] of Object.entries(data)) {
      const classification = await this.classifyField(field, value, context);
      if (classification) {
        classifiedFields[field] = classification;

        // Update highest classification level
        if (this.compareClassificationLevels(classification.level, highestLevel) > 0) {
          highestLevel = classification.level;
        }
      }
    }

    // Determine overall data classification
    const overallClassification = this.determineOverallClassification(classifiedFields);

    return {
      data,
      classifiedFields,
      overallClassification,
      protectionRequirements: this.getProtectionRequirements(overallClassification),
      retentionPolicy: this.getRetentionPolicy(overallClassification),
      consentRequirements: this.getConsentRequirements(classifiedFields),
    };
  }

  private async classifyField(
    fieldName: string,
    value: any,
    context: ClassifyContext,
  ): Promise<DataClassification | null> {
    // Check predefined classifications
    if (DATA_CLASSIFICATIONS[fieldName]) {
      return DATA_CLASSIFICATIONS[fieldName];
    }

    // Use AI-based classification for unknown fields
    return await this.aiClassifier.classify(fieldName, value, context);
  }

  private getProtectionRequirements(level: DataClassification['level']): ProtectionRequirements {
    const baseRequirements = {
      encryption: true,
      accessControl: true,
      auditLogging: true,
      backup: true,
      disasterRecovery: true,
    };

    switch (level) {
      case 'highly_restricted':
        return {
          ...baseRequirements,
          encryption: {
            atRest: true,
            inTransit: true,
            algorithm: 'aes-256-gcm',
            keyRotation: 90,
          },
          accessControl: {
            mfaRequired: true,
            approvalRequired: true,
            sessionTimeout: 30,
            ipRestriction: true,
          },
          auditLogging: {
            detailed: true,
            realTime: true,
            retention: 3650,
          },
          monitoring: {
            realTime: true,
            alerting: true,
            anomalyDetection: true,
          },
        };

      case 'restricted':
        return {
          ...baseRequirements,
          encryption: {
            atRest: true,
            inTransit: true,
            algorithm: 'aes-256-gcm',
            keyRotation: 180,
          },
          accessControl: {
            mfaRequired: true,
            approvalRequired: false,
            sessionTimeout: 60,
            ipRestriction: false,
          },
          auditLogging: {
            detailed: true,
            realTime: false,
            retention: 1825,
          },
          monitoring: {
            realTime: false,
            alerting: true,
            anomalyDetection: false,
          },
        };

      default:
        return baseRequirements;
    }
  }
}
```

## 🔐 Encryption Implementation

### End-to-End Encryption

```typescript
// apps/api/src/services/encryption-service.ts
export interface EncryptionConfig {
  algorithm: 'aes-256-gcm' | 'aes-256-cbc' | 'rsa-2048' | 'rsa-4096';
  keyDerivation: 'pbkdf2' | 'scrypt' | 'argon2';
  keyRotationDays: number;
  backupEnabled: boolean;
  geographicDistribution: boolean;
}

export class EncryptionService {
  private masterKey: CryptoKey;
  private dataKeys: Map<string, CryptoKey> = new Map();
  private keyManager: KeyManager;
  private auditService: AuditService;

  constructor(private config: EncryptionConfig) {
    this.initializeEncryption();
  }

  private async initializeEncryption(): Promise<void> {
    // Initialize master key from secure storage
    this.masterKey = await this.loadMasterKey();

    // Initialize key manager
    this.keyManager = new KeyManager(this.config);

    // Set up key rotation schedule
    this.scheduleKeyRotation();
  }

  async encryptData(
    data: any,
    classification: DataClassification,
    context: EncryptionContext,
  ): Promise<EncryptedData> {
    // Validate encryption requirements
    if (!classification.encryptionRequired) {
      return { data, encrypted: false };
    }

    // Get appropriate encryption key
    const key = await this.getEncryptionKey(classification, context);

    // Serialize data
    const dataString = JSON.stringify(data);
    const dataBuffer = new TextEncoder().encode(dataString);

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt data
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.config.algorithm,
        iv: iv,
      },
      key,
      dataBuffer,
    );

    const encryptedData: EncryptedData = {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      algorithm: this.config.algorithm,
      keyId: await this.keyManager.getCurrentKeyId(),
      classification: classification.level,
      metadata: {
        encryptedAt: new Date().toISOString(),
        encryptedBy: context.userId,
        encryptionVersion: '1.0',
        context: context,
      },
    };

    // Log encryption event
    await this.auditService.logEvent({
      eventType: 'data_encryption',
      userId: context.userId,
      userRole: context.userRole,
      resourceType: 'encrypted_data',
      resourceId: context.resourceId,
      action: 'create',
      eventData: {
        classification: classification.level,
        algorithm: this.config.algorithm,
        keyId: encryptedData.keyId,
      },
      complianceRelevant: true,
      riskLevel: 'low',
      requiresReview: false,
    });

    return encryptedData;
  }

  async decryptData(encryptedData: EncryptedData, context: DecryptionContext): Promise<any> {
    // Validate decryption permissions
    await this.validateDecryptionPermissions(encryptedData, context);

    // Get decryption key
    const key = await this.getDecryptionKey(encryptedData.keyId, context);

    // Prepare encrypted data
    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);

    // Decrypt data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: encryptedData.algorithm,
        iv: iv,
      },
      key,
      data,
    );

    // Parse decrypted data
    const decryptedString = new TextDecoder().decode(decrypted);
    const dataObject = JSON.parse(decryptedString);

    // Log decryption event
    await this.auditService.logEvent({
      eventType: 'data_decryption',
      userId: context.userId,
      userRole: context.userRole,
      resourceType: 'encrypted_data',
      resourceId: context.resourceId,
      action: 'read',
      eventData: {
        classification: encryptedData.classification,
        algorithm: encryptedData.algorithm,
        keyId: encryptedData.keyId,
      },
      complianceRelevant: true,
      riskLevel: 'medium',
      requiresReview: true,
    });

    return dataObject;
  }

  private async getEncryptionKey(
    classification: DataClassification,
    context: EncryptionContext,
  ): Promise<CryptoKey> {
    // For highly restricted data, use unique keys per entity
    if (classification.level === 'highly_restricted' && context.entityId) {
      const cacheKey = `${classification.level}:${context.entityId}`;

      if (!this.dataKeys.has(cacheKey)) {
        const key = await this.keyManager.generateDataKey(this.masterKey, classification);
        this.dataKeys.set(cacheKey, key);
      }

      return this.dataKeys.get(cacheKey)!;
    }

    // For other classifications, use classification-level keys
    const cacheKey = `classification:${classification.level}`;
    if (!this.dataKeys.has(cacheKey)) {
      const key = await this.keyManager.generateDataKey(this.masterKey, classification);
      this.dataKeys.set(cacheKey, key);
    }

    return this.dataKeys.get(cacheKey)!;
  }

  async rotateKeys(): Promise<void> {
    console.log('Starting key rotation process...');

    // Generate new master key
    const newMasterKey = await this.keyManager.generateMasterKey();

    // Re-encrypt all data keys with new master key
    for (const [cacheKey, oldKey] of this.dataKeys) {
      const newKey = await this.keyManager.reencryptDataKey(oldKey, this.masterKey, newMasterKey);
      this.dataKeys.set(cacheKey, newKey);
    }

    // Replace master key
    this.masterKey = newMasterKey;

    // Archive old master key
    await this.keyManager.archiveMasterKey();

    // Log key rotation
    await this.auditService.logEvent({
      eventType: 'key_rotation',
      userId: 'system',
      userRole: 'system',
      resourceType: 'encryption_key',
      resourceId: 'master',
      action: 'update',
      eventData: {
        rotationCompleted: new Date().toISOString(),
        keysRotated: this.dataKeys.size,
      },
      complianceRelevant: true,
      riskLevel: 'medium',
      requiresReview: true,
    });

    console.log('Key rotation completed successfully');
  }
}
```

### Database Encryption

```typescript
// Database encryption implementation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Transparent Data Encryption (TDE) setup
CREATE TABLE encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(255) NOT NULL UNIQUE,
    encrypted_key BYTEA NOT NULL,
    key_algorithm VARCHAR(50) NOT NULL,
    key_version INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    rotation_required BOOLEAN DEFAULT false
);

-- Encrypted client data table
CREATE TABLE encrypted_client_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES AestheticClientProfile(id) ON DELETE CASCADE,
    field_name VARCHAR(255) NOT NULL,
    field_value BYTEA NOT NULL,
    encryption_key_id UUID REFERENCES encryption_keys(id),
    iv BYTEA NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_client_field UNIQUE (client_id, field_name)
);

-- Encryption trigger function
CREATE OR REPLACE FUNCTION encrypt_sensitive_client_data()
RETURNS TRIGGER AS $$
DECLARE
    encryption_key_id UUID;
    iv BYTEA;
    encrypted_value BYTEA;
BEGIN
    -- Check if field requires encryption
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.field_value IS DISTINCT FROM OLD.field_value) THEN
        -- Get appropriate encryption key
        SELECT id INTO encryption_key_id 
        FROM encryption_keys 
        WHERE key_name = 'client_data_encryption' 
        AND is_active = true 
        AND (expires_at IS NULL OR expires_at > NOW())
        LIMIT 1;
        
        IF encryption_key_id IS NULL THEN
            RAISE EXCEPTION 'No active encryption key found for client data';
        END IF;
        
        -- Generate IV
        iv := gen_random_bytes(16);
        
        -- Encrypt the value
        encrypted_value := pgp_sym_encrypt(NEW.field_value::text, 
            (SELECT pgp_sym_decrypt(encrypted_key, current_setting('app.encryption_key_password')) 
             FROM encryption_keys WHERE id = encryption_key_id));
        
        -- Update the encrypted values
        NEW.encrypted_value := encrypted_value;
        NEW.iv := iv;
        NEW.encryption_key_id := encryption_key_id;
        NEW.algorithm := 'aes-256-gcm';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic encryption
CREATE TRIGGER trigger_encrypt_client_data
    BEFORE INSERT OR UPDATE ON encrypted_client_data
    FOR EACH ROW EXECUTE FUNCTION encrypt_sensitive_client_data();

-- Decryption function
CREATE OR REPLACE FUNCTION decrypt_client_data(
    encrypted_value BYTEA,
    key_id UUID,
    iv BYTEA
) RETURNS TEXT AS $$
DECLARE
    decrypted_value TEXT;
BEGIN
    SELECT pgp_sym_decrypt(
        encrypted_value, 
        pgp_sym_decrypt(
            ek.encrypted_key, 
            current_setting('app.encryption_key_password')
        )
    ) INTO decrypted_value
    FROM encryption_keys ek
    WHERE ek.id = key_id;
    
    RETURN decrypted_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🛡️ Data Access Control

### Fine-Grained Access Control

```typescript
// apps/api/src/services/access-control-service.ts
export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  resources: string[];
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute')[];
  conditions: AccessCondition[];
  effect: 'allow' | 'deny';
  priority: number;
}

export interface AccessCondition {
  type: 'attribute' | 'environmental' | 'temporal' | 'compliance';
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  attribute: string;
  value: any;
}

export class AccessControlService {
  private policies: Map<string, AccessPolicy> = new Map();
  private auditService: AuditService;

  constructor() {
    this.loadPolicies();
  }

  async checkAccess(
    userId: string,
    resource: string,
    action: string,
    context: AccessContext,
  ): Promise<AccessDecision> {
    // Get user attributes
    const userAttributes = await this.getUserAttributes(userId);

    // Get applicable policies
    const applicablePolicies = this.getApplicablePolicies(resource, action);

    // Evaluate policies
    const decisions = await this.evaluatePolicies(applicablePolicies, userAttributes, context);

    // Determine final decision
    const finalDecision = this.makeDecision(decisions);

    // Log access attempt
    await this.logAccessAttempt(userId, resource, action, finalDecision, context);

    // Check compliance requirements
    if (finalDecision.allowed) {
      await this.checkComplianceRequirements(userId, resource, action, context);
    }

    return finalDecision;
  }

  private async evaluatePolicies(
    policies: AccessPolicy[],
    userAttributes: UserAttributes,
    context: AccessContext,
  ): Promise<PolicyEvaluation[]> {
    const evaluations: PolicyEvaluation[] = [];

    for (const policy of policies) {
      const conditionsMet = await this.evaluateConditions(
        policy.conditions,
        userAttributes,
        context,
      );

      evaluations.push({
        policyId: policy.id,
        policyName: policy.name,
        effect: policy.effect,
        conditionsMet,
        priority: policy.priority,
      });
    }

    return evaluations;
  }

  private async evaluateConditions(
    conditions: AccessCondition[],
    userAttributes: UserAttributes,
    context: AccessContext,
  ): Promise<boolean> {
    for (const condition of conditions) {
      const result = await this.evaluateCondition(condition, userAttributes, context);
      if (!result) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(
    condition: AccessCondition,
    userAttributes: UserAttributes,
    context: AccessContext,
  ): Promise<boolean> {
    let attributeValue: any;

    switch (condition.type) {
      case 'attribute':
        attributeValue = this.getAttributeValue(userAttributes, condition.attribute);
        break;
      case 'environmental':
        attributeValue = this.getEnvironmentalValue(condition.attribute, context);
        break;
      case 'temporal':
        attributeValue = this.getTemporalValue(condition.attribute);
        break;
      case 'compliance':
        attributeValue = await this.getComplianceValue(
          condition.attribute,
          userAttributes,
          context,
        );
        break;
      default:
        return false;
    }

    return this.evaluateOperation(condition.operator, attributeValue, condition.value);
  }

  private getAttributeValue(userAttributes: UserAttributes, attribute: string): any {
    const path = attribute.split('.');
    let value = userAttributes;

    for (const part of path) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private getEnvironmentalValue(attribute: string, context: AccessContext): any {
    switch (attribute) {
      case 'ip_address':
        return context.ipAddress;
      case 'user_agent':
        return context.userAgent;
      case 'location':
        return context.location;
      case 'device_type':
        return context.deviceType;
      case 'session_time':
        return context.sessionTime;
      default:
        return undefined;
    }
  }

  private async getComplianceValue(
    attribute: string,
    userAttributes: UserAttributes,
    context: AccessContext,
  ): Promise<any> {
    switch (attribute) {
      case 'lgpd_consent_given':
        return await this.checkLGPDConsent(userAttributes.userId, context.clientId);
      case 'professional_certified':
        return await this.checkProfessionalCertification(
          userAttributes.userId,
          context.treatmentId,
        );
      case 'data_retention_valid':
        return await this.checkDataRetention(context.resourceId);
      case 'compliance_training_completed':
        return await this.checkComplianceTraining(userAttributes.userId);
      default:
        return false;
    }
  }

  private evaluateOperation(operator: string, actual: any, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not_equals':
        return actual !== expected;
      case 'contains':
        return Array.isArray(actual)
          ? actual.includes(expected)
          : String(actual).includes(String(expected));
      case 'not_contains':
        return Array.isArray(actual)
          ? !actual.includes(expected)
          : !String(actual).includes(String(expected));
      case 'greater_than':
        return Number(actual) > Number(expected);
      case 'less_than':
        return Number(actual) < Number(expected);
      default:
        return false;
    }
  }

  private async checkComplianceRequirements(
    userId: string,
    resource: string,
    action: string,
    context: AccessContext,
  ): Promise<void> {
    // Check if access requires compliance validation
    if (this.requiresComplianceValidation(resource, action)) {
      const complianceCheck = await this.validateComplianceAccess(userId, resource, context);

      if (!complianceCheck.valid) {
        throw new ComplianceError(complianceCheck.reason);
      }
    }
  }

  private async validateComplianceAccess(
    userId: string,
    resource: string,
    context: AccessContext,
  ): Promise<ComplianceValidation> {
    const checks = await Promise.all([
      this.checkDataProcessingConsent(userId, context.clientId),
      this.checkProfessionalAuthorization(userId, resource),
      this.checkAccessPurpose(userId, context.purpose),
      this.checkDataRetention(resource),
    ]);

    const allValid = checks.every(check => check.valid);
    const issues = checks.filter(check => !check.valid).map(check => check.reason);

    return {
      valid: allValid,
      reasons: issues,
    };
  }
}
```

## 📊 Data Retention & Lifecycle Management

### Automated Data Retention

```typescript
// apps/api/src/services/data-retention-service.ts
export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  dataType: string;
  retentionPeriod: number; // days
  retentionAction: 'archive' | 'anonymize' | 'delete';
  conditions: RetentionCondition[];
  legalHold: boolean;
  complianceRequirements: string[];
}

export interface RetentionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export class DataRetentionService {
  private policies: Map<string, RetentionPolicy> = new Map();
  private legalHolds: Set<string> = new Set();
  private auditService: AuditService;

  constructor() {
    this.initializeRetentionPolicies();
    this.scheduleRetentionJobs();
  }

  private initializeRetentionPolicies(): void {
    // Client data retention policy
    this.policies.set('client_data', {
      id: 'client_data',
      name: 'Client Data Retention',
      description: 'Retention policy for client personal and health data',
      dataType: 'client_data',
      retentionPeriod: 7300, // 20 years for health data
      retentionAction: 'archive',
      conditions: [
        { field: 'data_type', operator: 'equals', value: 'personal' },
        { field: 'data_type', operator: 'equals', value: 'health' },
      ],
      legalHold: false,
      complianceRequirements: ['LGPD', 'Healthcare Regulations'],
    });

    // Treatment data retention policy
    this.policies.set('treatment_data', {
      id: 'treatment_data',
      name: 'Treatment Data Retention',
      description: 'Retention policy for treatment records and medical data',
      dataType: 'treatment_data',
      retentionPeriod: 7300,
      retentionAction: 'archive',
      conditions: [
        { field: 'data_type', operator: 'equals', value: 'treatment' },
        { field: 'data_type', operator: 'equals', value: 'medical' },
      ],
      legalHold: false,
      complianceRequirements: ['LGPD', 'ANVISA', 'Medical Records'],
    });

    // Financial data retention policy
    this.policies.set('financial_data', {
      id: 'financial_data',
      name: 'Financial Data Retention',
      description: 'Retention policy for financial and billing data',
      dataType: 'financial_data',
      retentionPeriod: 1825, // 5 years for financial data
      retentionAction: 'archive',
      conditions: [
        { field: 'data_type', operator: 'equals', value: 'financial' },
        { field: 'data_type', operator: 'equals', value: 'billing' },
      ],
      legalHold: false,
      complianceRequirements: ['LGPD', 'Financial Regulations'],
    });

    // Communication logs retention policy
    this.policies.set('communication_logs', {
      id: 'communication_logs',
      name: 'Communication Logs Retention',
      description: 'Retention policy for communication logs and messages',
      dataType: 'communication_data',
      retentionPeriod: 365, // 1 year for communication logs
      retentionAction: 'delete',
      conditions: [
        { field: 'data_type', operator: 'equals', value: 'communication' },
        { field: 'data_type', operator: 'equals', value: 'logs' },
      ],
      legalHold: false,
      complianceRequirements: ['LGPD', 'Communication Privacy'],
    });
  }

  async processRetention(): Promise<void> {
    console.log('Starting data retention processing...');

    const processedRecords = [];
    const failedRecords = [];

    for (const [policyId, policy] of this.policies) {
      try {
        const result = await this.processRetentionPolicy(policy);
        processedRecords.push({
          policyId,
          ...result,
        });
      } catch (error) {
        console.error(`Failed to process retention policy ${policyId}:`, error);
        failedRecords.push({
          policyId,
          error: error.message,
        });
      }
    }

    // Generate retention report
    await this.generateRetentionReport(processedRecords, failedRecords);

    // Log retention processing
    await this.auditService.logEvent({
      eventType: 'data_retention_processed',
      userId: 'system',
      userRole: 'system',
      resourceType: 'retention_system',
      resourceId: 'retention_job',
      action: 'execute',
      eventData: {
        processedCount: processedRecords.reduce((sum, r) => sum + r.processedCount, 0),
        archivedCount: processedRecords.reduce((sum, r) => sum + r.archivedCount, 0),
        anonymizedCount: processedRecords.reduce((sum, r) => sum + r.anonymizedCount, 0),
        deletedCount: processedRecords.reduce((sum, r) => sum + r.deletedCount, 0),
        failedCount: failedRecords.length,
      },
      complianceRelevant: true,
      riskLevel: 'medium',
      requiresReview: true,
    });

    console.log('Data retention processing completed');
  }

  private async processRetentionPolicy(policy: RetentionPolicy): Promise<RetentionResult> {
    const cutoffDate = subDays(new Date(), policy.retentionPeriod);
    let processedCount = 0;
    let archivedCount = 0;
    let anonymizedCount = 0;
    let deletedCount = 0;

    // Get records subject to retention
    const records = await this.getRecordsForRetention(policy, cutoffDate);

    for (const record of records) {
      // Check for legal holds
      if (this.legalHolds.has(record.id)) {
        continue;
      }

      try {
        switch (policy.retentionAction) {
          case 'archive':
            await this.archiveRecord(record, policy);
            archivedCount++;
            break;
          case 'anonymize':
            await this.anonymizeRecord(record, policy);
            anonymizedCount++;
            break;
          case 'delete':
            await this.deleteRecord(record, policy);
            deletedCount++;
            break;
        }

        processedCount++;
      } catch (error) {
        console.error(`Failed to process record ${record.id} for policy ${policy.id}:`, error);
      }
    }

    return {
      policyId: policy.id,
      processedCount,
      archivedCount,
      anonymizedCount,
      deletedCount,
      cutoffDate,
    };
  }

  private async archiveRecord(record: any, policy: RetentionPolicy): Promise<void> {
    // Move record to archive storage
    const archiveData = {
      originalId: record.id,
      dataType: policy.dataType,
      data: record,
      archivedAt: new Date(),
      retentionPolicy: policy.id,
      retentionPeriod: policy.retentionPeriod,
      scheduledFor: subDays(new Date(), policy.retentionPeriod),
    };

    await this.archiveStorage.store(archiveData);
    await this.deleteRecord(record, policy);
  }

  private async anonymizeRecord(record: any, policy: RetentionPolicy): Promise<void> {
    const anonymizationFields = this.getAnonymizationFields(policy.dataType);
    const anonymizedData = { ...record };

    for (const field of anonymizationFields) {
      if (anonymizedData[field]) {
        anonymizedData[field] = this.anonymizeValue(field, anonymizedData[field]);
      }
    }

    anonymizedData.anonymizedAt = new Date();
    anonymizedData.anonymizationPolicy = policy.id;

    await this.updateRecord(record.id, anonymizedData);
  }

  private async deleteRecord(record: any, policy: RetentionPolicy): Promise<void> {
    // Create deletion record for audit
    await this.createDeletionRecord({
      originalId: record.id,
      dataType: policy.dataType,
      deletedAt: new Date(),
      deletionPolicy: policy.id,
      reason: 'retention_policy',
      deletedBy: 'system',
    });

    // Perform soft delete first
    await this.softDeleteRecord(record.id);

    // Schedule hard delete after compliance period
    await this.scheduleHardDelete(record.id, policy.dataType);
  }

  private getAnonymizationFields(dataType: string): string[] {
    const anonymizationFields = {
      client_data: ['fullName', 'email', 'phone', 'cpf', 'address'],
      treatment_data: ['clientName', 'professionalName', 'notes'],
      financial_data: ['cardNumber', 'bankAccount', 'transactionDetails'],
      communication_data: ['phoneNumber', 'emailAddress', 'messageContent'],
    };

    return anonymizationFields[dataType] || [];
  }

  private anonymizeValue(field: string, value: string): string {
    switch (field) {
      case 'cpf':
        return `***.${value.slice(-6)}`;
      case 'email':
        const [local, domain] = value.split('@');
        return `${local[0]}***@${domain}`;
      case 'phone':
        return `(***) ***-${value.slice(-4)}`;
      case 'fullName':
        return `${value[0]}${'*'.repeat(value.length - 2)}${value.slice(-1)}`;
      case 'cardNumber':
        return `****-****-****-${value.slice(-4)}`;
      default:
        return '*'.repeat(Math.min(value.length, 8));
    }
  }

  async addLegalHold(entityId: string, reason: string, expiry?: Date): Promise<void> {
    const holdId = generateUUID();
    this.legalHolds.add(entityId);

    await this.legalHoldStorage.store({
      id: holdId,
      entityId,
      reason,
      expiry,
      createdAt: new Date(),
      createdBy: 'system',
    });

    await this.auditService.logEvent({
      eventType: 'legal_hold_added',
      userId: 'system',
      userRole: 'system',
      resourceType: 'legal_hold',
      resourceId: holdId,
      action: 'create',
      eventData: {
        entityId,
        reason,
        expiry,
      },
      complianceRelevant: true,
      riskLevel: 'medium',
      requiresReview: true,
    });
  }

  async removeLegalHold(entityId: string, reason: string): Promise<void> {
    this.legalHolds.delete(entityId);

    await this.legalHoldStorage.update(entityId, {
      removedAt: new Date(),
      removalReason: reason,
    });

    await this.auditService.logEvent({
      eventType: 'legal_hold_removed',
      userId: 'system',
      userRole: 'system',
      resourceType: 'legal_hold',
      resourceId: entityId,
      action: 'delete',
      eventData: {
        reason,
      },
      complianceRelevant: true,
      riskLevel: 'medium',
      requiresReview: true,
    });
  }

  async generateRetentionReport(
    processedRecords: RetentionResult[],
    failedRecords: FailedRetention[],
  ): Promise<RetentionReport> {
    return {
      generatedAt: new Date(),
      period: {
        start: subDays(new Date(), 1),
        end: new Date(),
      },
      summary: {
        totalProcessed: processedRecords.reduce((sum, r) => sum + r.processedCount, 0),
        totalArchived: processedRecords.reduce((sum, r) => sum + r.archivedCount, 0),
        totalAnonymized: processedRecords.reduce((sum, r) => sum + r.anonymizedCount, 0),
        totalDeleted: processedRecords.reduce((sum, r) => sum + r.deletedCount, 0),
        totalFailed: failedRecords.length,
        activeLegalHolds: this.legalHolds.size,
      },
      policyResults: processedRecords,
      failures: failedRecords,
      recommendations: this.generateRetentionRecommendations(processedRecords, failedRecords),
    };
  }
}
```

This comprehensive data protection framework ensures end-to-end security for sensitive healthcare data while maintaining full compliance with Brazilian privacy regulations and providing robust lifecycle management.
