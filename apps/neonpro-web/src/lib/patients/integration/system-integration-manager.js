var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.createsystemIntegrationManager = void 0;
var client_1 = require("@/lib/supabase/client");
var audit_logger_1 = require("@/lib/audit/audit-logger");
var lgpd_manager_1 = require("@/lib/lgpd/lgpd-manager");
var patient_insights_1 = require("@/lib/ai/patient-insights");
var createsystemIntegrationManager = /** @class */ (() => {
  function createsystemIntegrationManager() {
    this.supabase = (0, client_1.createClient)();
    this.auditLogger = new audit_logger_1.AuditLogger();
    this.lgpdManager = new lgpd_manager_1.LGPDManager();
    this.patientInsights = new patient_insights_1.PatientInsights();
  }
  /**
   * Advanced patient search with AI-powered suggestions
   */
  createsystemIntegrationManager.prototype.searchPatients = function (query_1) {
    return __awaiter(this, arguments, void 0, function (query, filters, userId, limit) {
      var startTime,
        searchQuery,
        currentYear,
        maxBirthYear,
        minBirthYear,
        _a,
        patients,
        error,
        count,
        enrichedPatients,
        suggestions,
        searchTime,
        error_1;
      var _this = this;
      if (filters === void 0) {
        filters = {};
      }
      if (limit === void 0) {
        limit = 50;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            _b.label = 1;
          case 1:
            _b.trys.push([1, 6, , 7]);
            // Log search activity
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "patient_search",
                userId: userId,
                details: { query: query, filters: filters },
                timestamp: new Date(),
              }),
            ];
          case 2:
            // Log search activity
            _b.sent();
            searchQuery = this.supabase
              .from("patients")
              .select(
                "\n          *,\n          appointments!inner(*),\n          treatments(*),\n          patient_photos(count)\n        ",
              );
            // Apply text search
            if (query) {
              searchQuery = searchQuery.or(
                "name.ilike.%"
                  .concat(query, "%,email.ilike.%")
                  .concat(query, "%,phone.ilike.%")
                  .concat(query, "%,cpf.ilike.%")
                  .concat(query, "%"),
              );
            }
            // Apply filters
            if (filters.ageRange) {
              currentYear = new Date().getFullYear();
              maxBirthYear = currentYear - filters.ageRange.min;
              minBirthYear = currentYear - filters.ageRange.max;
              searchQuery = searchQuery
                .gte("birth_date", "".concat(minBirthYear, "-01-01"))
                .lte("birth_date", "".concat(maxBirthYear, "-12-31"));
            }
            if (filters.gender) {
              searchQuery = searchQuery.eq("gender", filters.gender);
            }
            if (filters.lastVisit) {
              searchQuery = searchQuery
                .gte("appointments.appointment_date", filters.lastVisit.from.toISOString())
                .lte("appointments.appointment_date", filters.lastVisit.to.toISOString());
            }
            if (filters.appointmentStatus) {
              searchQuery = searchQuery.eq("appointments.status", filters.appointmentStatus);
            }
            if (filters.consentStatus !== undefined) {
              searchQuery = searchQuery.eq("lgpd_consent", filters.consentStatus);
            }
            return [
              4 /*yield*/,
              searchQuery.limit(limit).order("updated_at", { ascending: false }),
            ];
          case 3:
            (_a = _b.sent()), (patients = _a.data), (error = _a.error), (count = _a.count);
            if (error) throw error;
            return [
              4 /*yield*/,
              Promise.all(
                (patients || []).map((patient) =>
                  __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, this.getIntegratedPatientData(patient.id, userId)];
                        case 1:
                          return [2 /*return*/, _a.sent()];
                      }
                    });
                  }),
                ),
              ),
            ];
          case 4:
            enrichedPatients = _b.sent();
            return [4 /*yield*/, this.generateSearchSuggestions(query, filters)];
          case 5:
            suggestions = _b.sent();
            searchTime = Date.now() - startTime;
            return [
              2 /*return*/,
              {
                patients: enrichedPatients,
                suggestions: suggestions,
                totalCount: count || 0,
                searchTime: searchTime,
              },
            ];
          case 6:
            error_1 = _b.sent();
            console.error("Error searching patients:", error_1);
            throw error_1;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get integrated patient data with all related information
   */
  createsystemIntegrationManager.prototype.getIntegratedPatientData = function (patientId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var hasPermission,
        _a,
        patient,
        patientError,
        appointments,
        treatments,
        photoCount,
        riskAssessment,
        totalSpent,
        lastActivity,
        loyaltyScore,
        communicationHistory,
        error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 8, , 9]);
            return [
              4 /*yield*/,
              this.lgpdManager.checkDataAccess(userId, patientId, "patient_profile"),
            ];
          case 1:
            hasPermission = _b.sent();
            if (!hasPermission) {
              throw new Error(
                "Acesso negado: sem permissão LGPD para visualizar dados do paciente",
              );
            }
            return [
              4 /*yield*/,
              this.supabase.from("patients").select("*").eq("id", patientId).single(),
            ];
          case 2:
            (_a = _b.sent()), (patient = _a.data), (patientError = _a.error);
            if (patientError) throw patientError;
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("*")
                .eq("patient_id", patientId)
                .order("appointment_date", { ascending: false }),
            ];
          case 3:
            appointments = _b.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("treatments")
                .select("*")
                .eq("patient_id", patientId)
                .order("created_at", { ascending: false }),
            ];
          case 4:
            treatments = _b.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_photos")
                .select("*", { count: "exact", head: true })
                .eq("patient_id", patientId),
            ];
          case 5:
            photoCount = _b.sent().count;
            return [4 /*yield*/, this.patientInsights.assessPatientRisk(patientId)];
          case 6:
            riskAssessment = _b.sent();
            totalSpent =
              (treatments === null || treatments === void 0
                ? void 0
                : treatments.reduce((sum, treatment) => sum + (treatment.cost || 0), 0)) || 0;
            lastActivity = this.getLastActivity(appointments || [], treatments || []);
            loyaltyScore = this.calculateLoyaltyScore(appointments || [], treatments || []);
            communicationHistory = [];
            // Log access
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "patient_data_access",
                userId: userId,
                details: { patientId: patientId, accessType: "integrated_view" },
                timestamp: new Date(),
              }),
            ];
          case 7:
            // Log access
            _b.sent();
            return [
              2 /*return*/,
              {
                patient: patient,
                appointments: appointments || [],
                treatments: treatments || [],
                riskAssessment: riskAssessment,
                communicationHistory: communicationHistory,
                photoCount: photoCount || 0,
                lastActivity: lastActivity,
                totalSpent: totalSpent,
                loyaltyScore: loyaltyScore,
              },
            ];
          case 8:
            error_2 = _b.sent();
            console.error("Error getting integrated patient data:", error_2);
            throw error_2;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate AI-powered search suggestions
   */
  createsystemIntegrationManager.prototype.generateSearchSuggestions = function (query, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var suggestions, patientSuggestions, treatmentSuggestions, error_3;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            suggestions = [];
            if (!query || query.length < 2) return [2 /*return*/, suggestions];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patients")
                .select("id, name, email")
                .ilike("name", "%".concat(query, "%"))
                .limit(5),
            ];
          case 2:
            patientSuggestions = _a.sent().data;
            patientSuggestions === null || patientSuggestions === void 0
              ? void 0
              : patientSuggestions.forEach((patient) => {
                  suggestions.push({
                    type: "patient",
                    id: patient.id,
                    title: patient.name,
                    subtitle: patient.email,
                    relevanceScore: _this.calculateRelevanceScore(query, patient.name),
                    matchedFields: ["name"],
                  });
                });
            return [
              4 /*yield*/,
              this.supabase
                .from("treatments")
                .select("id, name, patients(name)")
                .ilike("name", "%".concat(query, "%"))
                .limit(3),
            ];
          case 3:
            treatmentSuggestions = _a.sent().data;
            treatmentSuggestions === null || treatmentSuggestions === void 0
              ? void 0
              : treatmentSuggestions.forEach((treatment) => {
                  var _a;
                  suggestions.push({
                    type: "treatment",
                    id: treatment.id,
                    title: treatment.name,
                    subtitle: "Paciente: ".concat(
                      (_a = treatment.patients) === null || _a === void 0 ? void 0 : _a.name,
                    ),
                    relevanceScore: _this.calculateRelevanceScore(query, treatment.name),
                    matchedFields: ["treatment_name"],
                  });
                });
            // Sort by relevance
            suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
            return [2 /*return*/, suggestions.slice(0, 8)];
          case 4:
            error_3 = _a.sent();
            console.error("Error generating search suggestions:", error_3);
            return [2 /*return*/, []];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create patient segment for targeted analysis
   */
  createsystemIntegrationManager.prototype.createPatientSegment = function (
    name,
    description,
    criteria,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var count, segment, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.searchPatients("", criteria, userId, 1)];
          case 1:
            count = _a.sent().count;
            segment = {
              id: crypto.randomUUID(),
              name: name,
              description: description,
              criteria: criteria,
              patientCount: count,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            // Save segment (would be stored in database)
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "patient_segment_created",
                userId: userId,
                details: { segmentId: segment.id, name: name, patientCount: count },
                timestamp: new Date(),
              }),
            ];
          case 2:
            // Save segment (would be stored in database)
            _a.sent();
            return [2 /*return*/, segment];
          case 3:
            error_4 = _a.sent();
            console.error("Error creating patient segment:", error_4);
            throw error_4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get quick access patients for staff
   */
  createsystemIntegrationManager.prototype.getQuickAccessPatients = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var recentAppointments, quickAccess_1, seenPatients_1, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select(
                  "\n          patient_id,\n          patients(name),\n          appointment_date,\n          status\n        ",
                )
                .eq("staff_id", userId)
                .gte(
                  "appointment_date",
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                )
                .order("appointment_date", { ascending: false })
                .limit(10),
            ];
          case 1:
            recentAppointments = _a.sent().data;
            quickAccess_1 = [];
            seenPatients_1 = new Set();
            recentAppointments === null || recentAppointments === void 0
              ? void 0
              : recentAppointments.forEach((appointment) => {
                  var _a;
                  if (!seenPatients_1.has(appointment.patient_id)) {
                    seenPatients_1.add(appointment.patient_id);
                    quickAccess_1.push({
                      patientId: appointment.patient_id,
                      patientName:
                        ((_a = appointment.patients) === null || _a === void 0
                          ? void 0
                          : _a.name) || "Nome não disponível",
                      lastAccessed: new Date(appointment.appointment_date),
                      accessCount: 1,
                      context: "appointment",
                    });
                  }
                });
            return [2 /*return*/, quickAccess_1];
          case 2:
            error_5 = _a.sent();
            console.error("Error getting quick access patients:", error_5);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get patient communication history integration
   */
  createsystemIntegrationManager.prototype.getPatientCommunicationHistory = function (
    patientId,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var hasPermission, appointments, communicationHistory, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.lgpdManager.checkDataAccess(userId, patientId, "communication_history"),
            ];
          case 1:
            hasPermission = _a.sent();
            if (!hasPermission) {
              throw new Error("Acesso negado: sem permissão para histórico de comunicação");
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("*")
                .eq("patient_id", patientId)
                .order("appointment_date", { ascending: false }),
            ];
          case 2:
            appointments = _a.sent().data;
            communicationHistory =
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.map((appointment) => ({
                    id: appointment.id,
                    type: "appointment",
                    date: appointment.appointment_date,
                    subject: "Consulta - ".concat(appointment.service_type),
                    status: appointment.status,
                    notes: appointment.notes,
                  }))) || [];
            return [2 /*return*/, communicationHistory];
          case 3:
            error_6 = _a.sent();
            console.error("Error getting communication history:", error_6);
            throw error_6;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Helper methods
   */
  createsystemIntegrationManager.prototype.getLastActivity = (appointments, treatments) => {
    var allDates = __spreadArray(
      __spreadArray(
        [],
        appointments.map((a) => new Date(a.appointment_date)),
        true,
      ),
      treatments.map((t) => new Date(t.created_at)),
      true,
    );
    return allDates.length > 0
      ? new Date(
          Math.max.apply(
            Math,
            allDates.map((d) => d.getTime()),
          ),
        )
      : new Date();
  };
  createsystemIntegrationManager.prototype.calculateLoyaltyScore = (appointments, treatments) => {
    var appointmentCount = appointments.length;
    var treatmentCount = treatments.length;
    var completedAppointments = appointments.filter((a) => a.status === "completed").length;
    // Simple loyalty calculation
    var baseScore = Math.min(appointmentCount * 10, 100);
    var completionBonus = (completedAppointments / Math.max(appointmentCount, 1)) * 20;
    var treatmentBonus = Math.min(treatmentCount * 5, 30);
    return Math.round(baseScore + completionBonus + treatmentBonus);
  };
  createsystemIntegrationManager.prototype.calculateRelevanceScore = (query, text) => {
    var queryLower = query.toLowerCase();
    var textLower = text.toLowerCase();
    if (textLower === queryLower) return 100;
    if (textLower.startsWith(queryLower)) return 90;
    if (textLower.includes(queryLower)) return 70;
    // Fuzzy matching could be implemented here
    return 50;
  };
  return createsystemIntegrationManager;
})();
exports.createsystemIntegrationManager = createsystemIntegrationManager;
