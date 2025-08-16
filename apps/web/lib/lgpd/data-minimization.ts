/**
 * LGPD Data Minimization System
 * Implements data minimization principles to ensure only necessary data is collected and processed
 *
 * Features:
 * - Data collection validation and filtering
 * - Purpose-based data processing controls
 * - Automated data reduction and anonymization
 * - Data lifecycle management
 * - Collection impact assessment
 * - Compliance monitoring and reporting
 * - Integration with consent management
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 */

import { EventEmitter } from 'node:events';

// ============================================================================
// DATA MINIMIZATION TYPES & INTERFACES
// ============================================================================

/**
 * Data Categories for Minimization
 */
export enum DataCategory {
  PERSONAL_IDENTIFIERS = 'personal_identifiers',
  CONTACT_INFORMATION = 'contact_information',
  DEMOGRAPHIC_DATA = 'demographic_data',
  BEHAVIORAL_DATA = 'behavioral_data',
  TRANSACTIONAL_DATA = 'transactional_data',
  TECHNICAL_DATA = 'technical_data',
  LOCATION_DATA = 'location_data',
  BIOMETRIC_DATA = 'biometric_data',
  HEALTH_DATA = 'health_data',
  FINANCIAL_DATA = 'financial_data',
  SENSITIVE_PERSONAL = 'sensitive_personal',
  CHILDREN_DATA = 'children_data',
}

/**
 * Processing Purposes
 */
export enum ProcessingPurpose {
  SERVICE_PROVISION = 'service_provision',
  ACCOUNT_MANAGEMENT = 'account_management',
  PAYMENT_PROCESSING = 'payment_processing',
  CUSTOMER_SUPPORT = 'customer_support',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  RESEARCH = 'research',
  PERSONALIZATION = 'personalization',
}

/**
 * Data Necessity Levels
 */
export enum DataNecessity {
  ESSENTIAL = 'essential', // Required for core service
  FUNCTIONAL = 'functional', // Enhances service functionality
  ANALYTICAL = 'analytical', // For analysis and improvement
  MARKETING = 'marketing', // For marketing purposes
  OPTIONAL = 'optional', // Nice to have but not necessary
}

/**
 * Minimization Actions
 */
export enum MinimizationAction {
  COLLECT = 'collect', // Allow collection
  FILTER = 'filter', // Remove specific fields
  ANONYMIZE = 'anonymize', // Remove identifying information
  PSEUDONYMIZE = 'pseudonymize', // Replace with pseudonyms
  AGGREGATE = 'aggregate', // Combine into aggregated data
  REJECT = 'reject', // Reject collection entirely
}

/**
 * Data Field Definition
 */
export type DataField = {
  name: string;
  category: DataCategory;
  necessity: DataNecessity;
  purposes: ProcessingPurpose[];
  sensitive: boolean;
  retention: {
    period: number;
    unit: 'days' | 'months' | 'years';
  };
  minimizationRules: {
    action: MinimizationAction;
    conditions?: Record<string, any>;
    parameters?: Record<string, any>;
  }[];
};

/**
 * Data Collection Schema
 */
export type DataCollectionSchema = {
  id: string;
  name: string;
  description: string;
  purpose: ProcessingPurpose;
  legalBasis: string;
  fields: DataField[];
  minimizationEnabled: boolean;
  consentRequired: boolean;

  // Validation rules
  validation: {
    required: string[];
    optional: string[];
    conditional: {
      field: string;
      condition: any;
      requiredFields: string[];
    }[];
  };

  // Minimization configuration
  minimization: {
    autoApply: boolean;
    strictMode: boolean;
    allowOverrides: boolean;
    reviewRequired: boolean;
  };

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Data Collection Request
 */
export type DataCollectionRequest = {
  id: string;
  schemaId: string;
  purpose: ProcessingPurpose;
  requestedData: Record<string, any>;
  userConsent?: {
    consentId: string;
    purposes: ProcessingPurpose[];
    timestamp: Date;
  };
  context: {
    userId?: string;
    sessionId: string;
    ipAddress: string;
    userAgent: string;
    source: string;
  };

  // Processing results
  processing: {
    status: 'pending' | 'processed' | 'rejected' | 'error';
    processedAt?: Date;
    minimizedData?: Record<string, any>;
    appliedActions: {
      field: string;
      action: MinimizationAction;
      reason: string;
    }[];
    rejectedFields: {
      field: string;
      reason: string;
    }[];
    warnings: string[];
  };

  createdAt: Date;
};

/**
 * Minimization Rule
 */
export type MinimizationRule = {
  id: string;
  name: string;
  description: string;
  category: DataCategory;
  priority: number;
  enabled: boolean;

  // Rule conditions
  conditions: {
    field?: string;
    purpose?: ProcessingPurpose;
    userType?: string;
    consentStatus?: string;
    dataVolume?: {
      operator: '>=' | '>' | '<=' | '<' | '==';
      value: number;
    };
    customConditions?: Record<string, any>;
  };

  // Actions to apply
  actions: {
    primary: MinimizationAction;
    fallback?: MinimizationAction;
    parameters?: Record<string, any>;
  };

  // Effectiveness tracking
  metrics: {
    applicationsCount: number;
    successRate: number;
    lastApplied?: Date;
    averageReduction: number;
  };

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Minimization Report
 */
export type MinimizationReport = {
  id: string;
  period: {
    start: Date;
    end: Date;
  };

  // Collection statistics
  collections: {
    total: number;
    processed: number;
    rejected: number;
    minimized: number;
  };

  // Data reduction metrics
  reduction: {
    totalFieldsRequested: number;
    totalFieldsCollected: number;
    reductionPercentage: number;
    byCategory: Record<
      DataCategory,
      {
        requested: number;
        collected: number;
        reduction: number;
      }
    >;
    byPurpose: Record<
      ProcessingPurpose,
      {
        requested: number;
        collected: number;
        reduction: number;
      }
    >;
  };

  // Compliance metrics
  compliance: {
    schemaCompliance: number;
    consentCompliance: number;
    purposeLimitation: number;
    dataAccuracy: number;
  };

  // Top minimization actions
  topActions: {
    action: MinimizationAction;
    count: number;
    percentage: number;
  }[];

  // Recommendations
  recommendations: {
    type: 'schema_optimization' | 'rule_adjustment' | 'process_improvement';
    priority: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
  }[];

  generatedAt: Date;
  generatedBy: string;
};

/**
 * Data Minimization Events
 */
export type DataMinimizationEvents = {
  'collection:processed': { request: DataCollectionRequest };
  'collection:rejected': { request: DataCollectionRequest; reason: string };
  'data:minimized': {
    request: DataCollectionRequest;
    reductionPercentage: number;
  };
  'rule:triggered': { rule: MinimizationRule; request: DataCollectionRequest };
  'compliance:violation': { violation: string; request: DataCollectionRequest };
  'schema:updated': { schema: DataCollectionSchema };
};

// ============================================================================
// DATA MINIMIZATION SYSTEM
// ============================================================================

/**
 * Data Minimization Manager
 *
 * Implements LGPD data minimization principles including:
 * - Purpose-based data collection validation
 * - Automated data filtering and reduction
 * - Consent-based processing controls
 * - Compliance monitoring and reporting
 */
export class DataMinimizationManager extends EventEmitter {
  private readonly schemas: Map<string, DataCollectionSchema> = new Map();
  private readonly rules: Map<string, MinimizationRule> = new Map();
  private readonly requests: Map<string, DataCollectionRequest> = new Map();
  private isInitialized = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: {
      strictMode: boolean;
      autoMinimization: boolean;
      consentValidation: boolean;
      retentionEnforcement: boolean;
      monitoringIntervalMinutes: number;
      maxRequestsPerHour: number;
      defaultRetentionDays: number;
    } = {
      strictMode: true,
      autoMinimization: true,
      consentValidation: true,
      retentionEnforcement: true,
      monitoringIntervalMinutes: 60,
      maxRequestsPerHour: 1000,
      defaultRetentionDays: 365,
    },
  ) {
    super();
    this.setMaxListeners(50);
  }

  /**
   * Initialize the data minimization system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load schemas and rules
      await this.loadSchemas();
      await this.loadRules();

      // Load existing requests
      await this.loadRequests();

      // Start monitoring
      this.startMonitoring();

      this.isInitialized = true;
      this.logActivity('system', 'minimization_initialized', {
        schemasLoaded: this.schemas.size,
        rulesLoaded: this.rules.size,
        requestsLoaded: this.requests.size,
      });
    } catch (error) {
      throw new Error(
        `Failed to initialize data minimization system: ${error}`,
      );
    }
  }

  /**
   * Create data collection schema
   */
  async createSchema(
    schemaData: Omit<DataCollectionSchema, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<DataCollectionSchema> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const schema: DataCollectionSchema = {
      ...schemaData,
      id: this.generateId('schema'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate schema
    this.validateSchema(schema);

    this.schemas.set(schema.id, schema);
    await this.saveSchema(schema);

    this.emit('schema:updated', { schema });

    this.logActivity('user', 'schema_created', {
      schemaId: schema.id,
      name: schema.name,
      purpose: schema.purpose,
      fieldsCount: schema.fields.length,
      createdBy: schema.createdBy,
    });

    return schema;
  }

  /**
   * Process data collection request
   */
  async processCollectionRequest(
    requestData: Omit<DataCollectionRequest, 'id' | 'processing' | 'createdAt'>,
  ): Promise<DataCollectionRequest> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const request: DataCollectionRequest = {
      ...requestData,
      id: this.generateId('request'),
      processing: {
        status: 'pending',
        appliedActions: [],
        rejectedFields: [],
        warnings: [],
      },
      createdAt: new Date(),
    };

    try {
      // Get schema
      const schema = this.schemas.get(request.schemaId);
      if (!schema) {
        throw new Error('Schema not found');
      }

      // Validate consent if required
      if (schema.consentRequired && this.config.consentValidation) {
        await this.validateConsent(request, schema);
      }

      // Apply minimization
      if (schema.minimizationEnabled && this.config.autoMinimization) {
        await this.applyMinimization(request, schema);
      } else {
        // No minimization - collect as requested
        request.processing.minimizedData = request.requestedData;
      }

      request.processing.status = 'processed';
      request.processing.processedAt = new Date();

      this.emit('collection:processed', { request });

      // Calculate reduction percentage
      const originalFields = Object.keys(request.requestedData).length;
      const minimizedFields = Object.keys(
        request.processing.minimizedData || {},
      ).length;
      const reductionPercentage =
        originalFields > 0
          ? ((originalFields - minimizedFields) / originalFields) * 100
          : 0;

      if (reductionPercentage > 0) {
        this.emit('data:minimized', { request, reductionPercentage });
      }
    } catch (error) {
      request.processing.status = 'error';
      request.processing.warnings.push(String(error));

      this.emit('collection:rejected', { request, reason: String(error) });
    }

    this.requests.set(request.id, request);
    await this.saveRequest(request);

    this.logActivity('system', 'collection_processed', {
      requestId: request.id,
      schemaId: request.schemaId,
      status: request.processing.status,
      fieldsRequested: Object.keys(request.requestedData).length,
      fieldsCollected: Object.keys(request.processing.minimizedData || {})
        .length,
    });

    return request;
  }

  /**
   * Create minimization rule
   */
  async createRule(
    ruleData: Omit<
      MinimizationRule,
      'id' | 'metrics' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<MinimizationRule> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const rule: MinimizationRule = {
      ...ruleData,
      id: this.generateId('rule'),
      metrics: {
        applicationsCount: 0,
        successRate: 0,
        averageReduction: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rules.set(rule.id, rule);
    await this.saveRule(rule);

    this.logActivity('user', 'rule_created', {
      ruleId: rule.id,
      name: rule.name,
      category: rule.category,
      priority: rule.priority,
      createdBy: rule.createdBy,
    });

    return rule;
  }

  /**
   * Apply minimization to data collection request
   */
  private async applyMinimization(
    request: DataCollectionRequest,
    schema: DataCollectionSchema,
  ): Promise<void> {
    const minimizedData: Record<string, any> = {};
    const requestedFields = Object.keys(request.requestedData);

    for (const fieldName of requestedFields) {
      const fieldDef = schema.fields.find((f) => f.name === fieldName);
      const fieldValue = request.requestedData[fieldName];

      if (!fieldDef) {
        // Field not in schema - reject if strict mode
        if (this.config.strictMode) {
          request.processing.rejectedFields.push({
            field: fieldName,
            reason: 'Field not defined in schema',
          });
          continue;
        }
        // Allow in non-strict mode
        minimizedData[fieldName] = fieldValue;
        continue;
      }

      // Check if field is necessary for the purpose
      if (!fieldDef.purposes.includes(request.purpose)) {
        request.processing.rejectedFields.push({
          field: fieldName,
          reason: `Field not necessary for purpose: ${request.purpose}`,
        });
        continue;
      }

      // Apply field-specific minimization rules
      const action = await this.determineMinimizationAction(fieldDef, request);

      switch (action.action) {
        case MinimizationAction.COLLECT:
          minimizedData[fieldName] = fieldValue;
          break;

        case MinimizationAction.FILTER:
          // Field is filtered out
          request.processing.appliedActions.push({
            field: fieldName,
            action: MinimizationAction.FILTER,
            reason: action.reason || 'Field filtered by minimization rule',
          });
          break;

        case MinimizationAction.ANONYMIZE:
          minimizedData[fieldName] = this.anonymizeValue(fieldValue, fieldDef);
          request.processing.appliedActions.push({
            field: fieldName,
            action: MinimizationAction.ANONYMIZE,
            reason: action.reason || 'Field anonymized',
          });
          break;

        case MinimizationAction.PSEUDONYMIZE:
          minimizedData[fieldName] = this.pseudonymizeValue(
            fieldValue,
            fieldDef,
          );
          request.processing.appliedActions.push({
            field: fieldName,
            action: MinimizationAction.PSEUDONYMIZE,
            reason: action.reason || 'Field pseudonymized',
          });
          break;

        case MinimizationAction.AGGREGATE:
          // For aggregation, we might need to collect multiple values
          minimizedData[fieldName] = this.aggregateValue(fieldValue, fieldDef);
          request.processing.appliedActions.push({
            field: fieldName,
            action: MinimizationAction.AGGREGATE,
            reason: action.reason || 'Field aggregated',
          });
          break;

        case MinimizationAction.REJECT:
          request.processing.rejectedFields.push({
            field: fieldName,
            reason: action.reason || 'Field rejected by minimization rule',
          });
          break;
      }
    }

    request.processing.minimizedData = minimizedData;
  }

  /**
   * Determine minimization action for a field
   */
  private async determineMinimizationAction(
    fieldDef: DataField,
    request: DataCollectionRequest,
  ): Promise<{ action: MinimizationAction; reason?: string }> {
    // Check field-specific rules first
    for (const rule of fieldDef.minimizationRules) {
      if (
        this.evaluateRuleConditions(rule.conditions || {}, request, fieldDef)
      ) {
        return {
          action: rule.action,
          reason: `Applied field rule: ${rule.action}`,
        };
      }
    }

    // Check global minimization rules
    const applicableRules = Array.from(this.rules.values())
      .filter((rule) => rule.enabled && rule.category === fieldDef.category)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of applicableRules) {
      if (
        this.evaluateGlobalRuleConditions(rule.conditions, request, fieldDef)
      ) {
        // Update rule metrics
        rule.metrics.applicationsCount++;
        rule.metrics.lastApplied = new Date();
        await this.saveRule(rule);

        this.emit('rule:triggered', { rule, request });

        return {
          action: rule.actions.primary,
          reason: `Applied global rule: ${rule.name}`,
        };
      }
    }

    // Default action based on necessity
    switch (fieldDef.necessity) {
      case DataNecessity.ESSENTIAL:
      case DataNecessity.FUNCTIONAL:
        return {
          action: MinimizationAction.COLLECT,
          reason: 'Essential/functional field',
        };
      case DataNecessity.ANALYTICAL:
        return {
          action: MinimizationAction.PSEUDONYMIZE,
          reason: 'Analytical field - pseudonymized',
        };
      case DataNecessity.MARKETING:
        return {
          action: MinimizationAction.ANONYMIZE,
          reason: 'Marketing field - anonymized',
        };
      case DataNecessity.OPTIONAL:
        return {
          action: MinimizationAction.FILTER,
          reason: 'Optional field - filtered',
        };
      default:
        return { action: MinimizationAction.COLLECT, reason: 'Default action' };
    }
  }

  /**
   * Evaluate rule conditions
   */
  private evaluateRuleConditions(
    conditions: Record<string, any>,
    request: DataCollectionRequest,
    fieldDef: DataField,
  ): boolean {
    // Simple condition evaluation - in a real implementation this would be more sophisticated
    if (conditions.purpose && conditions.purpose !== request.purpose) {
      return false;
    }

    if (conditions.necessity && conditions.necessity !== fieldDef.necessity) {
      return false;
    }

    if (
      conditions.sensitive !== undefined &&
      conditions.sensitive !== fieldDef.sensitive
    ) {
      return false;
    }

    return true;
  }

  /**
   * Evaluate global rule conditions
   */
  private evaluateGlobalRuleConditions(
    conditions: MinimizationRule['conditions'],
    request: DataCollectionRequest,
    fieldDef: DataField,
  ): boolean {
    if (conditions.purpose && conditions.purpose !== request.purpose) {
      return false;
    }

    if (conditions.field && conditions.field !== fieldDef.name) {
      return false;
    }

    if (conditions.consentStatus && request.userConsent) {
      // Check consent status logic here
    }

    return true;
  }

  /**
   * Anonymize field value
   */
  private anonymizeValue(value: any, fieldDef: DataField): any {
    if (value === null || value === undefined) {
      return value;
    }

    switch (fieldDef.category) {
      case DataCategory.PERSONAL_IDENTIFIERS:
        if (typeof value === 'string') {
          // Replace with hash or generic identifier
          return `anon_${this.generateHash(value).substring(0, 8)}`;
        }
        break;

      case DataCategory.CONTACT_INFORMATION:
        if (typeof value === 'string' && value.includes('@')) {
          // Email anonymization
          return 'anonymous@example.com';
        }
        if (typeof value === 'string' && /\d{10,}/.test(value)) {
          // Phone number anonymization
          return 'xxx-xxx-xxxx';
        }
        break;

      case DataCategory.LOCATION_DATA:
        // Reduce precision for location data
        if (typeof value === 'object' && value.lat && value.lng) {
          return {
            lat: Math.round(value.lat * 10) / 10,
            lng: Math.round(value.lng * 10) / 10,
          };
        }
        break;

      case DataCategory.DEMOGRAPHIC_DATA:
        if (typeof value === 'number') {
          // Age ranges instead of exact age
          const age = value;
          if (age < 18) {
            return '0-17';
          }
          if (age < 25) {
            return '18-24';
          }
          if (age < 35) {
            return '25-34';
          }
          if (age < 45) {
            return '35-44';
          }
          if (age < 55) {
            return '45-54';
          }
          if (age < 65) {
            return '55-64';
          }
          return '65+';
        }
        break;
    }

    // Default anonymization
    return '[ANONYMIZED]';
  }

  /**
   * Pseudonymize field value
   */
  private pseudonymizeValue(value: any, fieldDef: DataField): any {
    if (value === null || value === undefined) {
      return value;
    }

    // Generate consistent pseudonym based on value
    const hash = this.generateHash(String(value));

    switch (fieldDef.category) {
      case DataCategory.PERSONAL_IDENTIFIERS:
        return `user_${hash.substring(0, 12)}`;
      case DataCategory.CONTACT_INFORMATION:
        if (typeof value === 'string' && value.includes('@')) {
          return `user${hash.substring(0, 8)}@example.com`;
        }
        return `contact_${hash.substring(0, 10)}`;
      default:
        return `pseudo_${hash.substring(0, 10)}`;
    }
  }

  /**
   * Aggregate field value
   */
  private aggregateValue(value: any, _fieldDef: DataField): any {
    // For aggregation, we typically need multiple values
    // This is a simplified implementation
    if (typeof value === 'number') {
      // Round to nearest 10 for numeric values
      return Math.round(value / 10) * 10;
    }

    if (typeof value === 'string') {
      // Return category instead of specific value
      return `category_${this.generateHash(value).substring(0, 4)}`;
    }

    return value;
  }

  /**
   * Validate consent for data collection
   */
  private async validateConsent(
    request: DataCollectionRequest,
    _schema: DataCollectionSchema,
  ): Promise<void> {
    if (!request.userConsent) {
      throw new Error('Consent required but not provided');
    }

    // Check if consent covers the requested purpose
    if (!request.userConsent.purposes.includes(request.purpose)) {
      throw new Error(`Consent does not cover purpose: ${request.purpose}`);
    }

    // Check consent freshness (example: 1 year)
    const consentAge = Date.now() - request.userConsent.timestamp.getTime();
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year

    if (consentAge > maxAge) {
      throw new Error('Consent has expired');
    }
  }

  /**
   * Generate minimization report
   */
  async generateReport(
    period: { start: Date; end: Date },
    generatedBy: string,
  ): Promise<MinimizationReport> {
    const requests = Array.from(this.requests.values()).filter(
      (r) => r.createdAt >= period.start && r.createdAt <= period.end,
    );

    const totalRequests = requests.length;
    const processedRequests = requests.filter(
      (r) => r.processing.status === 'processed',
    ).length;
    const rejectedRequests = requests.filter(
      (r) => r.processing.status === 'rejected',
    ).length;
    const minimizedRequests = requests.filter(
      (r) => r.processing.appliedActions.length > 0,
    ).length;

    // Calculate reduction metrics
    let totalFieldsRequested = 0;
    let totalFieldsCollected = 0;
    const categoryStats: Record<
      string,
      { requested: number; collected: number }
    > = {};
    const purposeStats: Record<
      string,
      { requested: number; collected: number }
    > = {};

    for (const request of requests) {
      const requestedCount = Object.keys(request.requestedData).length;
      const collectedCount = Object.keys(
        request.processing.minimizedData || {},
      ).length;

      totalFieldsRequested += requestedCount;
      totalFieldsCollected += collectedCount;

      // Update purpose stats
      if (!purposeStats[request.purpose]) {
        purposeStats[request.purpose] = { requested: 0, collected: 0 };
      }
      purposeStats[request.purpose].requested += requestedCount;
      purposeStats[request.purpose].collected += collectedCount;
    }

    const reductionPercentage =
      totalFieldsRequested > 0
        ? ((totalFieldsRequested - totalFieldsCollected) /
            totalFieldsRequested) *
          100
        : 0;

    // Calculate compliance metrics
    const schemaCompliance =
      totalRequests > 0 ? (processedRequests / totalRequests) * 100 : 100;
    const consentCompliance = this.calculateConsentCompliance(requests);
    const purposeLimitation = this.calculatePurposeLimitation(requests);
    const dataAccuracy = this.calculateDataAccuracy(requests);

    // Get top actions
    const actionCounts: Record<string, number> = {};
    for (const request of requests) {
      for (const action of request.processing.appliedActions) {
        actionCounts[action.action] = (actionCounts[action.action] || 0) + 1;
      }
    }

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({
        action: action as MinimizationAction,
        count,
        percentage: totalRequests > 0 ? (count / totalRequests) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      reductionPercentage,
      schemaCompliance,
      consentCompliance,
      topActions,
    });

    const report: MinimizationReport = {
      id: this.generateId('report'),
      period,
      collections: {
        total: totalRequests,
        processed: processedRequests,
        rejected: rejectedRequests,
        minimized: minimizedRequests,
      },
      reduction: {
        totalFieldsRequested,
        totalFieldsCollected,
        reductionPercentage,
        byCategory: this.convertToReductionStats(categoryStats),
        byPurpose: this.convertToReductionStats(purposeStats),
      },
      compliance: {
        schemaCompliance,
        consentCompliance,
        purposeLimitation,
        dataAccuracy,
      },
      topActions,
      recommendations,
      generatedAt: new Date(),
      generatedBy,
    };

    await this.saveReport(report);

    this.logActivity('user', 'report_generated', {
      reportId: report.id,
      period,
      totalRequests,
      reductionPercentage,
      generatedBy,
    });

    return report;
  }

  /**
   * Get collection requests with filtering
   */
  getRequests(filters?: {
    schemaId?: string;
    purpose?: ProcessingPurpose;
    status?: string;
    dateRange?: { start: Date; end: Date };
  }): DataCollectionRequest[] {
    let requests = Array.from(this.requests.values());

    if (filters) {
      if (filters.schemaId) {
        requests = requests.filter((r) => r.schemaId === filters.schemaId);
      }
      if (filters.purpose) {
        requests = requests.filter((r) => r.purpose === filters.purpose);
      }
      if (filters.status) {
        requests = requests.filter(
          (r) => r.processing.status === filters.status,
        );
      }
      if (filters.dateRange) {
        requests = requests.filter(
          (r) =>
            r.createdAt >= filters.dateRange?.start &&
            r.createdAt <= filters.dateRange?.end,
        );
      }
    }

    return requests.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  /**
   * Get schemas
   */
  getSchemas(): DataCollectionSchema[] {
    return Array.from(this.schemas.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }

  /**
   * Get minimization rules
   */
  getRules(): MinimizationRule[] {
    return Array.from(this.rules.values()).sort(
      (a, b) => b.priority - a.priority,
    );
  }

  /**
   * Calculate consent compliance
   */
  private calculateConsentCompliance(
    requests: DataCollectionRequest[],
  ): number {
    const consentRequiredRequests = requests.filter((r) => {
      const schema = this.schemas.get(r.schemaId);
      return schema?.consentRequired;
    });

    if (consentRequiredRequests.length === 0) {
      return 100;
    }

    const validConsentRequests = consentRequiredRequests.filter(
      (r) => r.userConsent,
    );
    return (validConsentRequests.length / consentRequiredRequests.length) * 100;
  }

  /**
   * Calculate purpose limitation compliance
   */
  private calculatePurposeLimitation(
    requests: DataCollectionRequest[],
  ): number {
    let compliantRequests = 0;

    for (const request of requests) {
      const schema = this.schemas.get(request.schemaId);
      if (schema && schema.purpose === request.purpose) {
        compliantRequests++;
      }
    }

    return requests.length > 0
      ? (compliantRequests / requests.length) * 100
      : 100;
  }

  /**
   * Calculate data accuracy
   */
  private calculateDataAccuracy(requests: DataCollectionRequest[]): number {
    // Simplified calculation - in a real implementation this would be more sophisticated
    const _processedRequests = requests.filter(
      (r) => r.processing.status === 'processed',
    );
    const errorRequests = requests.filter(
      (r) => r.processing.status === 'error',
    );

    if (requests.length === 0) {
      return 100;
    }
    return ((requests.length - errorRequests.length) / requests.length) * 100;
  }

  /**
   * Convert stats to reduction format
   */
  private convertToReductionStats(
    stats: Record<string, { requested: number; collected: number }>,
  ): Record<
    string,
    { requested: number; collected: number; reduction: number }
  > {
    const result: Record<
      string,
      { requested: number; collected: number; reduction: number }
    > = {};

    for (const [key, value] of Object.entries(stats)) {
      result[key] = {
        ...value,
        reduction:
          value.requested > 0
            ? ((value.requested - value.collected) / value.requested) * 100
            : 0,
      };
    }

    return result;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(metrics: {
    reductionPercentage: number;
    schemaCompliance: number;
    consentCompliance: number;
    topActions: any[];
  }): MinimizationReport['recommendations'] {
    const recommendations: MinimizationReport['recommendations'] = [];

    if (metrics.reductionPercentage < 20) {
      recommendations.push({
        type: 'schema_optimization',
        priority: 'high',
        description:
          'Low data reduction rate detected. Consider reviewing data collection schemas to identify unnecessary fields.',
        impact: 'Improved privacy compliance and reduced data storage costs',
      });
    }

    if (metrics.schemaCompliance < 95) {
      recommendations.push({
        type: 'process_improvement',
        priority: 'high',
        description:
          'Schema compliance is below optimal levels. Review data collection processes.',
        impact: 'Better data governance and compliance',
      });
    }

    if (metrics.consentCompliance < 90) {
      recommendations.push({
        type: 'process_improvement',
        priority: 'high',
        description:
          'Consent compliance needs improvement. Ensure proper consent collection mechanisms.',
        impact: 'Enhanced LGPD compliance and user trust',
      });
    }

    if (metrics.reductionPercentage > 80) {
      recommendations.push({
        type: 'rule_adjustment',
        priority: 'medium',
        description:
          'Very high data reduction rate. Review if essential data is being filtered out.',
        impact: 'Balanced privacy protection and service functionality',
      });
    }

    return recommendations;
  }

  /**
   * Validate schema
   */
  private validateSchema(schema: DataCollectionSchema): void {
    if (!schema.name || schema.name.trim().length === 0) {
      throw new Error('Schema name is required');
    }

    if (!schema.fields || schema.fields.length === 0) {
      throw new Error('Schema must have at least one field');
    }

    // Validate field definitions
    for (const field of schema.fields) {
      if (!field.name || field.name.trim().length === 0) {
        throw new Error('Field name is required');
      }

      if (!field.purposes || field.purposes.length === 0) {
        throw new Error(`Field ${field.name} must have at least one purpose`);
      }
    }
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(
      async () => {
        await this.performMonitoringCheck();
      },
      this.config.monitoringIntervalMinutes * 60 * 1000,
    );
  }

  /**
   * Perform monitoring check
   */
  private async performMonitoringCheck(): Promise<void> {
    try {
      // Check for high request volume
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentRequests = Array.from(this.requests.values()).filter(
        (r) => r.createdAt >= oneHourAgo,
      );

      if (recentRequests.length > this.config.maxRequestsPerHour) {
        this.logActivity('system', 'high_request_volume', {
          requestsLastHour: recentRequests.length,
          threshold: this.config.maxRequestsPerHour,
        });
      }

      // Check for compliance violations
      const violations = recentRequests.filter(
        (r) =>
          r.processing.status === 'error' ||
          r.processing.rejectedFields.length > 0,
      );

      if (violations.length > recentRequests.length * 0.1) {
        // More than 10% violations
        this.logActivity('system', 'high_violation_rate', {
          violations: violations.length,
          total: recentRequests.length,
          rate: (violations.length / recentRequests.length) * 100,
        });
      }
    } catch (error) {
      this.logActivity('system', 'monitoring_error', {
        error: String(error),
      });
    }
  }

  /**
   * Generate hash
   */
  private generateHash(input: string): string {
    // Simple hash function - in a real implementation use crypto
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Generate ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load schemas
   */
  private async loadSchemas(): Promise<void> {
    // In a real implementation, this would load from database
  }

  /**
   * Load rules
   */
  private async loadRules(): Promise<void> {
    // In a real implementation, this would load from database
  }

  /**
   * Load requests
   */
  private async loadRequests(): Promise<void> {
    // In a real implementation, this would load from database
  }

  /**
   * Save schema
   */
  private async saveSchema(_schema: DataCollectionSchema): Promise<void> {
    // In a real implementation, this would save to database
  }

  /**
   * Save rule
   */
  private async saveRule(_rule: MinimizationRule): Promise<void> {
    // In a real implementation, this would save to database
  }

  /**
   * Save request
   */
  private async saveRequest(_request: DataCollectionRequest): Promise<void> {
    // In a real implementation, this would save to database
  }

  /**
   * Save report
   */
  private async saveReport(_report: MinimizationReport): Promise<void> {
    // In a real implementation, this would save to database
  }

  /**
   * Log activity
   */
  private logActivity(
    _actor: string,
    _action: string,
    _details: Record<string, any>,
  ): void {}

  /**
   * Shutdown the system
   */
  async shutdown(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.removeAllListeners();
    this.isInitialized = false;

    this.logActivity('system', 'minimization_shutdown', {
      timestamp: new Date(),
    });
  }

  /**
   * Health check
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: Record<string, any>;
  } {
    const issues: string[] = [];

    if (!this.isInitialized) {
      issues.push('Data minimization system not initialized');
    }

    if (!this.monitoringInterval) {
      issues.push('Monitoring not running');
    }

    if (this.schemas.size === 0) {
      issues.push('No data collection schemas defined');
    }

    const enabledRules = Array.from(this.rules.values()).filter(
      (r) => r.enabled,
    );
    if (enabledRules.length === 0) {
      issues.push('No enabled minimization rules');
    }

    const status =
      issues.length === 0
        ? 'healthy'
        : issues.length <= 2
          ? 'degraded'
          : 'unhealthy';

    return {
      status,
      details: {
        initialized: this.isInitialized,
        schemasCount: this.schemas.size,
        rulesCount: this.rules.size,
        enabledRules: enabledRules.length,
        requestsCount: this.requests.size,
        strictMode: this.config.strictMode,
        autoMinimization: this.config.autoMinimization,
        issues,
      },
    };
  }
}

/**
 * Default data minimization manager instance
 */
export const dataMinimizationManager = new DataMinimizationManager();

/**
 * Export types for external use
 */
export type {
  DataCollectionSchema,
  DataCollectionRequest,
  MinimizationRule,
  MinimizationReport,
  DataMinimizationEvents,
};
