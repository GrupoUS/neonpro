"use strict";
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
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataMinimizationManager =
  exports.DataMinimizationManager =
  exports.MinimizationAction =
  exports.DataNecessity =
  exports.ProcessingPurpose =
  exports.DataCategory =
    void 0;
var events_1 = require("events");
// ============================================================================
// DATA MINIMIZATION TYPES & INTERFACES
// ============================================================================
/**
 * Data Categories for Minimization
 */
var DataCategory;
(function (DataCategory) {
  DataCategory["PERSONAL_IDENTIFIERS"] = "personal_identifiers";
  DataCategory["CONTACT_INFORMATION"] = "contact_information";
  DataCategory["DEMOGRAPHIC_DATA"] = "demographic_data";
  DataCategory["BEHAVIORAL_DATA"] = "behavioral_data";
  DataCategory["TRANSACTIONAL_DATA"] = "transactional_data";
  DataCategory["TECHNICAL_DATA"] = "technical_data";
  DataCategory["LOCATION_DATA"] = "location_data";
  DataCategory["BIOMETRIC_DATA"] = "biometric_data";
  DataCategory["HEALTH_DATA"] = "health_data";
  DataCategory["FINANCIAL_DATA"] = "financial_data";
  DataCategory["SENSITIVE_PERSONAL"] = "sensitive_personal";
  DataCategory["CHILDREN_DATA"] = "children_data";
})(DataCategory || (exports.DataCategory = DataCategory = {}));
/**
 * Processing Purposes
 */
var ProcessingPurpose;
(function (ProcessingPurpose) {
  ProcessingPurpose["SERVICE_PROVISION"] = "service_provision";
  ProcessingPurpose["ACCOUNT_MANAGEMENT"] = "account_management";
  ProcessingPurpose["PAYMENT_PROCESSING"] = "payment_processing";
  ProcessingPurpose["CUSTOMER_SUPPORT"] = "customer_support";
  ProcessingPurpose["MARKETING"] = "marketing";
  ProcessingPurpose["ANALYTICS"] = "analytics";
  ProcessingPurpose["SECURITY"] = "security";
  ProcessingPurpose["COMPLIANCE"] = "compliance";
  ProcessingPurpose["RESEARCH"] = "research";
  ProcessingPurpose["PERSONALIZATION"] = "personalization";
})(ProcessingPurpose || (exports.ProcessingPurpose = ProcessingPurpose = {}));
/**
 * Data Necessity Levels
 */
var DataNecessity;
(function (DataNecessity) {
  DataNecessity["ESSENTIAL"] = "essential";
  DataNecessity["FUNCTIONAL"] = "functional";
  DataNecessity["ANALYTICAL"] = "analytical";
  DataNecessity["MARKETING"] = "marketing";
  DataNecessity["OPTIONAL"] = "optional"; // Nice to have but not necessary
})(DataNecessity || (exports.DataNecessity = DataNecessity = {}));
/**
 * Minimization Actions
 */
var MinimizationAction;
(function (MinimizationAction) {
  MinimizationAction["COLLECT"] = "collect";
  MinimizationAction["FILTER"] = "filter";
  MinimizationAction["ANONYMIZE"] = "anonymize";
  MinimizationAction["PSEUDONYMIZE"] = "pseudonymize";
  MinimizationAction["AGGREGATE"] = "aggregate";
  MinimizationAction["REJECT"] = "reject"; // Reject collection entirely
})(MinimizationAction || (exports.MinimizationAction = MinimizationAction = {}));
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
var DataMinimizationManager = /** @class */ (function (_super) {
  __extends(DataMinimizationManager, _super);
  function DataMinimizationManager(config) {
    if (config === void 0) {
      config = {
        strictMode: true,
        autoMinimization: true,
        consentValidation: true,
        retentionEnforcement: true,
        monitoringIntervalMinutes: 60,
        maxRequestsPerHour: 1000,
        defaultRetentionDays: 365,
      };
    }
    var _this = _super.call(this) || this;
    _this.config = config;
    _this.schemas = new Map();
    _this.rules = new Map();
    _this.requests = new Map();
    _this.isInitialized = false;
    _this.monitoringInterval = null;
    _this.setMaxListeners(50);
    return _this;
  }
  /**
   * Initialize the data minimization system
   */
  DataMinimizationManager.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (this.isInitialized) {
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            // Load schemas and rules
            return [4 /*yield*/, this.loadSchemas()];
          case 2:
            // Load schemas and rules
            _a.sent();
            return [4 /*yield*/, this.loadRules()];
          case 3:
            _a.sent();
            // Load existing requests
            return [4 /*yield*/, this.loadRequests()];
          case 4:
            // Load existing requests
            _a.sent();
            // Start monitoring
            this.startMonitoring();
            this.isInitialized = true;
            this.logActivity("system", "minimization_initialized", {
              schemasLoaded: this.schemas.size,
              rulesLoaded: this.rules.size,
              requestsLoaded: this.requests.size,
            });
            return [3 /*break*/, 6];
          case 5:
            error_1 = _a.sent();
            throw new Error("Failed to initialize data minimization system: ".concat(error_1));
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create data collection schema
   */
  DataMinimizationManager.prototype.createSchema = function (schemaData) {
    return __awaiter(this, void 0, void 0, function () {
      var schema;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            schema = __assign(__assign({}, schemaData), {
              id: this.generateId("schema"),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            // Validate schema
            this.validateSchema(schema);
            this.schemas.set(schema.id, schema);
            return [4 /*yield*/, this.saveSchema(schema)];
          case 3:
            _a.sent();
            this.emit("schema:updated", { schema: schema });
            this.logActivity("user", "schema_created", {
              schemaId: schema.id,
              name: schema.name,
              purpose: schema.purpose,
              fieldsCount: schema.fields.length,
              createdBy: schema.createdBy,
            });
            return [2 /*return*/, schema];
        }
      });
    });
  };
  /**
   * Process data collection request
   */
  DataMinimizationManager.prototype.processCollectionRequest = function (requestData) {
    return __awaiter(this, void 0, void 0, function () {
      var request, schema, originalFields, minimizedFields, reductionPercentage, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            request = __assign(__assign({}, requestData), {
              id: this.generateId("request"),
              processing: {
                status: "pending",
                appliedActions: [],
                rejectedFields: [],
                warnings: [],
              },
              createdAt: new Date(),
            });
            _a.label = 3;
          case 3:
            _a.trys.push([3, 9, , 10]);
            schema = this.schemas.get(request.schemaId);
            if (!schema) {
              throw new Error("Schema not found");
            }
            if (!(schema.consentRequired && this.config.consentValidation)) return [3 /*break*/, 5];
            return [4 /*yield*/, this.validateConsent(request, schema)];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            if (!(schema.minimizationEnabled && this.config.autoMinimization))
              return [3 /*break*/, 7];
            return [4 /*yield*/, this.applyMinimization(request, schema)];
          case 6:
            _a.sent();
            return [3 /*break*/, 8];
          case 7:
            // No minimization - collect as requested
            request.processing.minimizedData = request.requestedData;
            _a.label = 8;
          case 8:
            request.processing.status = "processed";
            request.processing.processedAt = new Date();
            this.emit("collection:processed", { request: request });
            originalFields = Object.keys(request.requestedData).length;
            minimizedFields = Object.keys(request.processing.minimizedData || {}).length;
            reductionPercentage =
              originalFields > 0 ? ((originalFields - minimizedFields) / originalFields) * 100 : 0;
            if (reductionPercentage > 0) {
              this.emit("data:minimized", {
                request: request,
                reductionPercentage: reductionPercentage,
              });
            }
            return [3 /*break*/, 10];
          case 9:
            error_2 = _a.sent();
            request.processing.status = "error";
            request.processing.warnings.push(String(error_2));
            this.emit("collection:rejected", { request: request, reason: String(error_2) });
            return [3 /*break*/, 10];
          case 10:
            this.requests.set(request.id, request);
            return [4 /*yield*/, this.saveRequest(request)];
          case 11:
            _a.sent();
            this.logActivity("system", "collection_processed", {
              requestId: request.id,
              schemaId: request.schemaId,
              status: request.processing.status,
              fieldsRequested: Object.keys(request.requestedData).length,
              fieldsCollected: Object.keys(request.processing.minimizedData || {}).length,
            });
            return [2 /*return*/, request];
        }
      });
    });
  };
  /**
   * Create minimization rule
   */
  DataMinimizationManager.prototype.createRule = function (ruleData) {
    return __awaiter(this, void 0, void 0, function () {
      var rule;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!!this.isInitialized) return [3 /*break*/, 2];
            return [4 /*yield*/, this.initialize()];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            rule = __assign(__assign({}, ruleData), {
              id: this.generateId("rule"),
              metrics: {
                applicationsCount: 0,
                successRate: 0,
                averageReduction: 0,
              },
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            this.rules.set(rule.id, rule);
            return [4 /*yield*/, this.saveRule(rule)];
          case 3:
            _a.sent();
            this.logActivity("user", "rule_created", {
              ruleId: rule.id,
              name: rule.name,
              category: rule.category,
              priority: rule.priority,
              createdBy: rule.createdBy,
            });
            return [2 /*return*/, rule];
        }
      });
    });
  };
  /**
   * Apply minimization to data collection request
   */
  DataMinimizationManager.prototype.applyMinimization = function (request, schema) {
    return __awaiter(this, void 0, void 0, function () {
      var minimizedData, requestedFields, _loop_1, this_1, _i, requestedFields_1, fieldName;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            minimizedData = {};
            requestedFields = Object.keys(request.requestedData);
            _loop_1 = function (fieldName) {
              var fieldDef, fieldValue, action;
              return __generator(this, function (_b) {
                switch (_b.label) {
                  case 0:
                    fieldDef = schema.fields.find(function (f) {
                      return f.name === fieldName;
                    });
                    fieldValue = request.requestedData[fieldName];
                    if (!fieldDef) {
                      // Field not in schema - reject if strict mode
                      if (this_1.config.strictMode) {
                        request.processing.rejectedFields.push({
                          field: fieldName,
                          reason: "Field not defined in schema",
                        });
                        return [2 /*return*/, "continue"];
                      } else {
                        // Allow in non-strict mode
                        minimizedData[fieldName] = fieldValue;
                        return [2 /*return*/, "continue"];
                      }
                    }
                    // Check if field is necessary for the purpose
                    if (!fieldDef.purposes.includes(request.purpose)) {
                      request.processing.rejectedFields.push({
                        field: fieldName,
                        reason: "Field not necessary for purpose: ".concat(request.purpose),
                      });
                      return [2 /*return*/, "continue"];
                    }
                    return [4 /*yield*/, this_1.determineMinimizationAction(fieldDef, request)];
                  case 1:
                    action = _b.sent();
                    switch (action.action) {
                      case MinimizationAction.COLLECT:
                        minimizedData[fieldName] = fieldValue;
                        break;
                      case MinimizationAction.FILTER:
                        // Field is filtered out
                        request.processing.appliedActions.push({
                          field: fieldName,
                          action: MinimizationAction.FILTER,
                          reason: action.reason || "Field filtered by minimization rule",
                        });
                        break;
                      case MinimizationAction.ANONYMIZE:
                        minimizedData[fieldName] = this_1.anonymizeValue(fieldValue, fieldDef);
                        request.processing.appliedActions.push({
                          field: fieldName,
                          action: MinimizationAction.ANONYMIZE,
                          reason: action.reason || "Field anonymized",
                        });
                        break;
                      case MinimizationAction.PSEUDONYMIZE:
                        minimizedData[fieldName] = this_1.pseudonymizeValue(fieldValue, fieldDef);
                        request.processing.appliedActions.push({
                          field: fieldName,
                          action: MinimizationAction.PSEUDONYMIZE,
                          reason: action.reason || "Field pseudonymized",
                        });
                        break;
                      case MinimizationAction.AGGREGATE:
                        // For aggregation, we might need to collect multiple values
                        minimizedData[fieldName] = this_1.aggregateValue(fieldValue, fieldDef);
                        request.processing.appliedActions.push({
                          field: fieldName,
                          action: MinimizationAction.AGGREGATE,
                          reason: action.reason || "Field aggregated",
                        });
                        break;
                      case MinimizationAction.REJECT:
                        request.processing.rejectedFields.push({
                          field: fieldName,
                          reason: action.reason || "Field rejected by minimization rule",
                        });
                        break;
                    }
                    return [2 /*return*/];
                }
              });
            };
            this_1 = this;
            (_i = 0), (requestedFields_1 = requestedFields);
            _a.label = 1;
          case 1:
            if (!(_i < requestedFields_1.length)) return [3 /*break*/, 4];
            fieldName = requestedFields_1[_i];
            return [5 /*yield**/, _loop_1(fieldName)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            request.processing.minimizedData = minimizedData;
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Determine minimization action for a field
   */
  DataMinimizationManager.prototype.determineMinimizationAction = function (fieldDef, request) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, _a, rule, applicableRules, _b, applicableRules_1, rule;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            // Check field-specific rules first
            for (_i = 0, _a = fieldDef.minimizationRules; _i < _a.length; _i++) {
              rule = _a[_i];
              if (this.evaluateRuleConditions(rule.conditions || {}, request, fieldDef)) {
                return [
                  2 /*return*/,
                  {
                    action: rule.action,
                    reason: "Applied field rule: ".concat(rule.action),
                  },
                ];
              }
            }
            applicableRules = Array.from(this.rules.values())
              .filter(function (rule) {
                return rule.enabled && rule.category === fieldDef.category;
              })
              .sort(function (a, b) {
                return b.priority - a.priority;
              });
            (_b = 0), (applicableRules_1 = applicableRules);
            _c.label = 1;
          case 1:
            if (!(_b < applicableRules_1.length)) return [3 /*break*/, 4];
            rule = applicableRules_1[_b];
            if (!this.evaluateGlobalRuleConditions(rule.conditions, request, fieldDef))
              return [3 /*break*/, 3];
            // Update rule metrics
            rule.metrics.applicationsCount++;
            rule.metrics.lastApplied = new Date();
            return [4 /*yield*/, this.saveRule(rule)];
          case 2:
            _c.sent();
            this.emit("rule:triggered", { rule: rule, request: request });
            return [
              2 /*return*/,
              {
                action: rule.actions.primary,
                reason: "Applied global rule: ".concat(rule.name),
              },
            ];
          case 3:
            _b++;
            return [3 /*break*/, 1];
          case 4:
            // Default action based on necessity
            switch (fieldDef.necessity) {
              case DataNecessity.ESSENTIAL:
              case DataNecessity.FUNCTIONAL:
                return [
                  2 /*return*/,
                  { action: MinimizationAction.COLLECT, reason: "Essential/functional field" },
                ];
              case DataNecessity.ANALYTICAL:
                return [
                  2 /*return*/,
                  {
                    action: MinimizationAction.PSEUDONYMIZE,
                    reason: "Analytical field - pseudonymized",
                  },
                ];
              case DataNecessity.MARKETING:
                return [
                  2 /*return*/,
                  { action: MinimizationAction.ANONYMIZE, reason: "Marketing field - anonymized" },
                ];
              case DataNecessity.OPTIONAL:
                return [
                  2 /*return*/,
                  { action: MinimizationAction.FILTER, reason: "Optional field - filtered" },
                ];
              default:
                return [
                  2 /*return*/,
                  { action: MinimizationAction.COLLECT, reason: "Default action" },
                ];
            }
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Evaluate rule conditions
   */
  DataMinimizationManager.prototype.evaluateRuleConditions = function (
    conditions,
    request,
    fieldDef,
  ) {
    // Simple condition evaluation - in a real implementation this would be more sophisticated
    if (conditions.purpose && conditions.purpose !== request.purpose) {
      return false;
    }
    if (conditions.necessity && conditions.necessity !== fieldDef.necessity) {
      return false;
    }
    if (conditions.sensitive !== undefined && conditions.sensitive !== fieldDef.sensitive) {
      return false;
    }
    return true;
  };
  /**
   * Evaluate global rule conditions
   */
  DataMinimizationManager.prototype.evaluateGlobalRuleConditions = function (
    conditions,
    request,
    fieldDef,
  ) {
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
  };
  /**
   * Anonymize field value
   */
  DataMinimizationManager.prototype.anonymizeValue = function (value, fieldDef) {
    if (value === null || value === undefined) {
      return value;
    }
    switch (fieldDef.category) {
      case DataCategory.PERSONAL_IDENTIFIERS:
        if (typeof value === "string") {
          // Replace with hash or generic identifier
          return "anon_".concat(this.generateHash(value).substring(0, 8));
        }
        break;
      case DataCategory.CONTACT_INFORMATION:
        if (typeof value === "string" && value.includes("@")) {
          // Email anonymization
          return "anonymous@example.com";
        }
        if (typeof value === "string" && /\d{10,}/.test(value)) {
          // Phone number anonymization
          return "xxx-xxx-xxxx";
        }
        break;
      case DataCategory.LOCATION_DATA:
        // Reduce precision for location data
        if (typeof value === "object" && value.lat && value.lng) {
          return {
            lat: Math.round(value.lat * 10) / 10,
            lng: Math.round(value.lng * 10) / 10,
          };
        }
        break;
      case DataCategory.DEMOGRAPHIC_DATA:
        if (typeof value === "number") {
          // Age ranges instead of exact age
          var age = value;
          if (age < 18) return "0-17";
          if (age < 25) return "18-24";
          if (age < 35) return "25-34";
          if (age < 45) return "35-44";
          if (age < 55) return "45-54";
          if (age < 65) return "55-64";
          return "65+";
        }
        break;
    }
    // Default anonymization
    return "[ANONYMIZED]";
  };
  /**
   * Pseudonymize field value
   */
  DataMinimizationManager.prototype.pseudonymizeValue = function (value, fieldDef) {
    if (value === null || value === undefined) {
      return value;
    }
    // Generate consistent pseudonym based on value
    var hash = this.generateHash(String(value));
    switch (fieldDef.category) {
      case DataCategory.PERSONAL_IDENTIFIERS:
        return "user_".concat(hash.substring(0, 12));
      case DataCategory.CONTACT_INFORMATION:
        if (typeof value === "string" && value.includes("@")) {
          return "user".concat(hash.substring(0, 8), "@example.com");
        }
        return "contact_".concat(hash.substring(0, 10));
      default:
        return "pseudo_".concat(hash.substring(0, 10));
    }
  };
  /**
   * Aggregate field value
   */
  DataMinimizationManager.prototype.aggregateValue = function (value, fieldDef) {
    // For aggregation, we typically need multiple values
    // This is a simplified implementation
    if (typeof value === "number") {
      // Round to nearest 10 for numeric values
      return Math.round(value / 10) * 10;
    }
    if (typeof value === "string") {
      // Return category instead of specific value
      return "category_".concat(this.generateHash(value).substring(0, 4));
    }
    return value;
  };
  /**
   * Validate consent for data collection
   */
  DataMinimizationManager.prototype.validateConsent = function (request, schema) {
    return __awaiter(this, void 0, void 0, function () {
      var consentAge, maxAge;
      return __generator(this, function (_a) {
        if (!request.userConsent) {
          throw new Error("Consent required but not provided");
        }
        // Check if consent covers the requested purpose
        if (!request.userConsent.purposes.includes(request.purpose)) {
          throw new Error("Consent does not cover purpose: ".concat(request.purpose));
        }
        consentAge = Date.now() - request.userConsent.timestamp.getTime();
        maxAge = 365 * 24 * 60 * 60 * 1000;
        if (consentAge > maxAge) {
          throw new Error("Consent has expired");
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Generate minimization report
   */
  DataMinimizationManager.prototype.generateReport = function (period, generatedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var requests,
        totalRequests,
        processedRequests,
        rejectedRequests,
        minimizedRequests,
        totalFieldsRequested,
        totalFieldsCollected,
        categoryStats,
        purposeStats,
        _i,
        requests_1,
        request,
        requestedCount,
        collectedCount,
        reductionPercentage,
        schemaCompliance,
        consentCompliance,
        purposeLimitation,
        dataAccuracy,
        actionCounts,
        _a,
        requests_2,
        request,
        _b,
        _c,
        action,
        topActions,
        recommendations,
        report;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            requests = Array.from(this.requests.values()).filter(function (r) {
              return r.createdAt >= period.start && r.createdAt <= period.end;
            });
            totalRequests = requests.length;
            processedRequests = requests.filter(function (r) {
              return r.processing.status === "processed";
            }).length;
            rejectedRequests = requests.filter(function (r) {
              return r.processing.status === "rejected";
            }).length;
            minimizedRequests = requests.filter(function (r) {
              return r.processing.appliedActions.length > 0;
            }).length;
            totalFieldsRequested = 0;
            totalFieldsCollected = 0;
            categoryStats = {};
            purposeStats = {};
            for (_i = 0, requests_1 = requests; _i < requests_1.length; _i++) {
              request = requests_1[_i];
              requestedCount = Object.keys(request.requestedData).length;
              collectedCount = Object.keys(request.processing.minimizedData || {}).length;
              totalFieldsRequested += requestedCount;
              totalFieldsCollected += collectedCount;
              // Update purpose stats
              if (!purposeStats[request.purpose]) {
                purposeStats[request.purpose] = { requested: 0, collected: 0 };
              }
              purposeStats[request.purpose].requested += requestedCount;
              purposeStats[request.purpose].collected += collectedCount;
            }
            reductionPercentage =
              totalFieldsRequested > 0
                ? ((totalFieldsRequested - totalFieldsCollected) / totalFieldsRequested) * 100
                : 0;
            schemaCompliance = totalRequests > 0 ? (processedRequests / totalRequests) * 100 : 100;
            consentCompliance = this.calculateConsentCompliance(requests);
            purposeLimitation = this.calculatePurposeLimitation(requests);
            dataAccuracy = this.calculateDataAccuracy(requests);
            actionCounts = {};
            for (_a = 0, requests_2 = requests; _a < requests_2.length; _a++) {
              request = requests_2[_a];
              for (_b = 0, _c = request.processing.appliedActions; _b < _c.length; _b++) {
                action = _c[_b];
                actionCounts[action.action] = (actionCounts[action.action] || 0) + 1;
              }
            }
            topActions = Object.entries(actionCounts)
              .map(function (_a) {
                var action = _a[0],
                  count = _a[1];
                return {
                  action: action,
                  count: count,
                  percentage: totalRequests > 0 ? (count / totalRequests) * 100 : 0,
                };
              })
              .sort(function (a, b) {
                return b.count - a.count;
              })
              .slice(0, 5);
            recommendations = this.generateRecommendations({
              reductionPercentage: reductionPercentage,
              schemaCompliance: schemaCompliance,
              consentCompliance: consentCompliance,
              topActions: topActions,
            });
            report = {
              id: this.generateId("report"),
              period: period,
              collections: {
                total: totalRequests,
                processed: processedRequests,
                rejected: rejectedRequests,
                minimized: minimizedRequests,
              },
              reduction: {
                totalFieldsRequested: totalFieldsRequested,
                totalFieldsCollected: totalFieldsCollected,
                reductionPercentage: reductionPercentage,
                byCategory: this.convertToReductionStats(categoryStats),
                byPurpose: this.convertToReductionStats(purposeStats),
              },
              compliance: {
                schemaCompliance: schemaCompliance,
                consentCompliance: consentCompliance,
                purposeLimitation: purposeLimitation,
                dataAccuracy: dataAccuracy,
              },
              topActions: topActions,
              recommendations: recommendations,
              generatedAt: new Date(),
              generatedBy: generatedBy,
            };
            return [4 /*yield*/, this.saveReport(report)];
          case 1:
            _d.sent();
            this.logActivity("user", "report_generated", {
              reportId: report.id,
              period: period,
              totalRequests: totalRequests,
              reductionPercentage: reductionPercentage,
              generatedBy: generatedBy,
            });
            return [2 /*return*/, report];
        }
      });
    });
  };
  /**
   * Get collection requests with filtering
   */
  DataMinimizationManager.prototype.getRequests = function (filters) {
    var requests = Array.from(this.requests.values());
    if (filters) {
      if (filters.schemaId) {
        requests = requests.filter(function (r) {
          return r.schemaId === filters.schemaId;
        });
      }
      if (filters.purpose) {
        requests = requests.filter(function (r) {
          return r.purpose === filters.purpose;
        });
      }
      if (filters.status) {
        requests = requests.filter(function (r) {
          return r.processing.status === filters.status;
        });
      }
      if (filters.dateRange) {
        requests = requests.filter(function (r) {
          return r.createdAt >= filters.dateRange.start && r.createdAt <= filters.dateRange.end;
        });
      }
    }
    return requests.sort(function (a, b) {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  };
  /**
   * Get schemas
   */
  DataMinimizationManager.prototype.getSchemas = function () {
    return Array.from(this.schemas.values()).sort(function (a, b) {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  };
  /**
   * Get minimization rules
   */
  DataMinimizationManager.prototype.getRules = function () {
    return Array.from(this.rules.values()).sort(function (a, b) {
      return b.priority - a.priority;
    });
  };
  /**
   * Calculate consent compliance
   */
  DataMinimizationManager.prototype.calculateConsentCompliance = function (requests) {
    var _this = this;
    var consentRequiredRequests = requests.filter(function (r) {
      var schema = _this.schemas.get(r.schemaId);
      return schema === null || schema === void 0 ? void 0 : schema.consentRequired;
    });
    if (consentRequiredRequests.length === 0) return 100;
    var validConsentRequests = consentRequiredRequests.filter(function (r) {
      return r.userConsent;
    });
    return (validConsentRequests.length / consentRequiredRequests.length) * 100;
  };
  /**
   * Calculate purpose limitation compliance
   */
  DataMinimizationManager.prototype.calculatePurposeLimitation = function (requests) {
    var compliantRequests = 0;
    for (var _i = 0, requests_3 = requests; _i < requests_3.length; _i++) {
      var request = requests_3[_i];
      var schema = this.schemas.get(request.schemaId);
      if (schema && schema.purpose === request.purpose) {
        compliantRequests++;
      }
    }
    return requests.length > 0 ? (compliantRequests / requests.length) * 100 : 100;
  };
  /**
   * Calculate data accuracy
   */
  DataMinimizationManager.prototype.calculateDataAccuracy = function (requests) {
    // Simplified calculation - in a real implementation this would be more sophisticated
    var processedRequests = requests.filter(function (r) {
      return r.processing.status === "processed";
    });
    var errorRequests = requests.filter(function (r) {
      return r.processing.status === "error";
    });
    if (requests.length === 0) return 100;
    return ((requests.length - errorRequests.length) / requests.length) * 100;
  };
  /**
   * Convert stats to reduction format
   */
  DataMinimizationManager.prototype.convertToReductionStats = function (stats) {
    var result = {};
    for (var _i = 0, _a = Object.entries(stats); _i < _a.length; _i++) {
      var _b = _a[_i],
        key = _b[0],
        value = _b[1];
      result[key] = __assign(__assign({}, value), {
        reduction:
          value.requested > 0 ? ((value.requested - value.collected) / value.requested) * 100 : 0,
      });
    }
    return result;
  };
  /**
   * Generate recommendations
   */
  DataMinimizationManager.prototype.generateRecommendations = function (metrics) {
    var recommendations = [];
    if (metrics.reductionPercentage < 20) {
      recommendations.push({
        type: "schema_optimization",
        priority: "high",
        description:
          "Low data reduction rate detected. Consider reviewing data collection schemas to identify unnecessary fields.",
        impact: "Improved privacy compliance and reduced data storage costs",
      });
    }
    if (metrics.schemaCompliance < 95) {
      recommendations.push({
        type: "process_improvement",
        priority: "high",
        description: "Schema compliance is below optimal levels. Review data collection processes.",
        impact: "Better data governance and compliance",
      });
    }
    if (metrics.consentCompliance < 90) {
      recommendations.push({
        type: "process_improvement",
        priority: "high",
        description:
          "Consent compliance needs improvement. Ensure proper consent collection mechanisms.",
        impact: "Enhanced LGPD compliance and user trust",
      });
    }
    if (metrics.reductionPercentage > 80) {
      recommendations.push({
        type: "rule_adjustment",
        priority: "medium",
        description:
          "Very high data reduction rate. Review if essential data is being filtered out.",
        impact: "Balanced privacy protection and service functionality",
      });
    }
    return recommendations;
  };
  /**
   * Validate schema
   */
  DataMinimizationManager.prototype.validateSchema = function (schema) {
    if (!schema.name || schema.name.trim().length === 0) {
      throw new Error("Schema name is required");
    }
    if (!schema.fields || schema.fields.length === 0) {
      throw new Error("Schema must have at least one field");
    }
    // Validate field definitions
    for (var _i = 0, _a = schema.fields; _i < _a.length; _i++) {
      var field = _a[_i];
      if (!field.name || field.name.trim().length === 0) {
        throw new Error("Field name is required");
      }
      if (!field.purposes || field.purposes.length === 0) {
        throw new Error("Field ".concat(field.name, " must have at least one purpose"));
      }
    }
  };
  /**
   * Start monitoring
   */
  DataMinimizationManager.prototype.startMonitoring = function () {
    var _this = this;
    this.monitoringInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.performMonitoringCheck()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        });
      },
      this.config.monitoringIntervalMinutes * 60 * 1000,
    );
  };
  /**
   * Perform monitoring check
   */
  DataMinimizationManager.prototype.performMonitoringCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var oneHourAgo_1, recentRequests, violations;
      return __generator(this, function (_a) {
        try {
          oneHourAgo_1 = new Date(Date.now() - 60 * 60 * 1000);
          recentRequests = Array.from(this.requests.values()).filter(function (r) {
            return r.createdAt >= oneHourAgo_1;
          });
          if (recentRequests.length > this.config.maxRequestsPerHour) {
            this.logActivity("system", "high_request_volume", {
              requestsLastHour: recentRequests.length,
              threshold: this.config.maxRequestsPerHour,
            });
          }
          violations = recentRequests.filter(function (r) {
            return r.processing.status === "error" || r.processing.rejectedFields.length > 0;
          });
          if (violations.length > recentRequests.length * 0.1) {
            // More than 10% violations
            this.logActivity("system", "high_violation_rate", {
              violations: violations.length,
              total: recentRequests.length,
              rate: (violations.length / recentRequests.length) * 100,
            });
          }
        } catch (error) {
          this.logActivity("system", "monitoring_error", {
            error: String(error),
          });
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Generate hash
   */
  DataMinimizationManager.prototype.generateHash = function (input) {
    // Simple hash function - in a real implementation use crypto
    var hash = 0;
    for (var i = 0; i < input.length; i++) {
      var char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };
  /**
   * Generate ID
   */
  DataMinimizationManager.prototype.generateId = function (prefix) {
    return ""
      .concat(prefix, "_")
      .concat(Date.now(), "_")
      .concat(Math.random().toString(36).substr(2, 9));
  };
  /**
   * Load schemas
   */
  DataMinimizationManager.prototype.loadSchemas = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Load rules
   */
  DataMinimizationManager.prototype.loadRules = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Load requests
   */
  DataMinimizationManager.prototype.loadRequests = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save schema
   */
  DataMinimizationManager.prototype.saveSchema = function (schema) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save rule
   */
  DataMinimizationManager.prototype.saveRule = function (rule) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save request
   */
  DataMinimizationManager.prototype.saveRequest = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Save report
   */
  DataMinimizationManager.prototype.saveReport = function (report) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  /**
   * Log activity
   */
  DataMinimizationManager.prototype.logActivity = function (actor, action, details) {
    // In a real implementation, this would log to audit trail
    console.log("[DataMinimization] ".concat(actor, " - ").concat(action, ":"), details);
  };
  /**
   * Shutdown the system
   */
  DataMinimizationManager.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        if (this.monitoringInterval) {
          clearInterval(this.monitoringInterval);
          this.monitoringInterval = null;
        }
        this.removeAllListeners();
        this.isInitialized = false;
        this.logActivity("system", "minimization_shutdown", {
          timestamp: new Date(),
        });
        return [2 /*return*/];
      });
    });
  };
  /**
   * Health check
   */
  DataMinimizationManager.prototype.getHealthStatus = function () {
    var issues = [];
    if (!this.isInitialized) {
      issues.push("Data minimization system not initialized");
    }
    if (!this.monitoringInterval) {
      issues.push("Monitoring not running");
    }
    if (this.schemas.size === 0) {
      issues.push("No data collection schemas defined");
    }
    var enabledRules = Array.from(this.rules.values()).filter(function (r) {
      return r.enabled;
    });
    if (enabledRules.length === 0) {
      issues.push("No enabled minimization rules");
    }
    var status = issues.length === 0 ? "healthy" : issues.length <= 2 ? "degraded" : "unhealthy";
    return {
      status: status,
      details: {
        initialized: this.isInitialized,
        schemasCount: this.schemas.size,
        rulesCount: this.rules.size,
        enabledRules: enabledRules.length,
        requestsCount: this.requests.size,
        strictMode: this.config.strictMode,
        autoMinimization: this.config.autoMinimization,
        issues: issues,
      },
    };
  };
  return DataMinimizationManager;
})(events_1.EventEmitter);
exports.DataMinimizationManager = DataMinimizationManager;
/**
 * Default data minimization manager instance
 */
exports.dataMinimizationManager = new DataMinimizationManager();
