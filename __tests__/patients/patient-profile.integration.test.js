/**
 * Patient Profile Integration Tests
 *
 * Tests for the comprehensive patient profile management system including
 * profile creation, updates, search functionality, and AI insights integration.
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
Object.defineProperty(exports, "__esModule", { value: true });
var patient_insights_1 = require("../../lib/ai/patient-insights");
var profile_manager_1 = require("../../lib/patients/profile-manager");
// Mock the entire Supabase module to avoid ES module issues
jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({ single: jest.fn() })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ single: jest.fn() })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({ single: jest.fn() })),
        })),
      })),
    })),
  })),
}));
// Mock AuditLogger to avoid dependencies
jest.mock("../../lib/auth/audit/audit-logger", () => ({
  AuditLogger: jest.fn().mockImplementation(() => ({
    log: jest.fn().mockResolvedValue(true),
    logProfileUpdate: jest.fn().mockResolvedValue(true),
    logProfileAccess: jest.fn().mockResolvedValue(true),
  })),
}));
// Mock LGPDComplianceManager to avoid dependencies
jest.mock("../../lib/lgpd/LGPDComplianceManager", () => ({
  LGPDComplianceManager: jest.fn().mockImplementation(() => ({
    validateDataConsent: jest.fn().mockResolvedValue(true),
    validateDataAccess: jest.fn().mockResolvedValue(true),
  })),
}));
// Mock createClient
jest.mock("../../app/utils/supabase/server", () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: "test-user" } } },
      }),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({ single: jest.fn() })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ single: jest.fn() })),
      })),
    })),
  })),
}));
describe("Patient Profile System Integration Tests", () => {
  var profileManager;
  var _mockSupabaseClient;
  var mockPatientData = {
    patient_id: "test-patient-001",
    demographics: {
      name: "John Doe",
      date_of_birth: "1980-05-15",
      gender: "male",
      phone: "+1-555-123-4567",
      email: "john.doe@email.com",
      address: "123 Main St, City, State 12345",
      insurance_provider: "Blue Cross",
      insurance_id: "BC123456789",
      preferred_language: "English",
    },
    medical_information: {
      medical_history: ["Hypertension", "Type 2 Diabetes"],
      chronic_conditions: ["Diabetes Mellitus Type 2"],
      current_medications: [
        {
          name: "Metformin",
          dosage: "500mg",
          frequency: "twice daily",
          prescribing_doctor: "Dr. Smith",
        },
      ],
      allergies: ["Penicillin", "Shellfish"],
    },
    vital_signs: {
      height_cm: 180,
      weight_kg: 85,
      bmi: 26.2,
      blood_pressure_systolic: 140,
      blood_pressure_diastolic: 90,
      blood_type: "O+",
    },
    care_preferences: {
      communication_method: "email",
      appointment_preferences: {
        preferred_time_of_day: "morning",
        preferred_days: ["Monday", "Wednesday", "Friday"],
      },
      language: "English",
    },
    emergency_contacts: [
      {
        name: "Jane Doe",
        relationship: "Spouse",
        phone: "+1-555-987-6543",
        email: "jane.doe@email.com",
        is_primary: true,
        can_make_medical_decisions: true,
      },
    ],
  };
  beforeEach(() => {
    // Create mock Supabase client
    _mockSupabaseClient = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({ data: mockPatientData, error: null })),
          })),
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({ data: mockPatientData, error: null })),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({ data: mockPatientData, error: null })),
            })),
          })),
        })),
      })),
    };
    profileManager = new profile_manager_1.ProfileManager();
    // patientInsights is now imported as a ready-to-use object
  });
  describe("ProfileManager Core Operations", () => {
    test("should create a comprehensive patient profile", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, profileManager.createPatientProfile(mockPatientData)];
            case 1:
              result = _a.sent();
              expect(result).toBeTruthy();
              expect(result === null || result === void 0 ? void 0 : result.patient_id).toBe(
                mockPatientData.patient_id,
              );
              expect(result === null || result === void 0 ? void 0 : result.demographics.name).toBe(
                mockPatientData.demographics.name,
              );
              expect(
                result === null || result === void 0 ? void 0 : result.profile_completeness_score,
              ).toBeGreaterThan(0);
              expect(result === null || result === void 0 ? void 0 : result.is_active).toBe(true);
              return [2 /*return*/];
          }
        });
      }));
    test("should retrieve existing patient profile", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // First create a profile
              return [4 /*yield*/, profileManager.createPatientProfile(mockPatientData)];
            case 1:
              // First create a profile
              _a.sent();
              return [4 /*yield*/, profileManager.getPatientProfile(mockPatientData.patient_id)];
            case 2:
              result = _a.sent();
              expect(result).toBeTruthy();
              expect(result === null || result === void 0 ? void 0 : result.patient_id).toBe(
                mockPatientData.patient_id,
              );
              expect(result === null || result === void 0 ? void 0 : result.demographics.name).toBe(
                mockPatientData.demographics.name,
              );
              expect(
                result === null || result === void 0 ? void 0 : result.last_accessed,
              ).toBeTruthy();
              return [2 /*return*/];
          }
        });
      }));
    test("should update patient profile selectively", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var updateData, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Create initial profile
              return [4 /*yield*/, profileManager.createPatientProfile(mockPatientData)];
            case 1:
              // Create initial profile
              _a.sent();
              updateData = {
                demographics: {
                  phone: "+1-555-999-8888",
                  address: "456 New Street, New City, State 54321",
                },
              };
              return [
                4 /*yield*/,
                profileManager.updatePatientProfile(mockPatientData.patient_id, updateData),
              ];
            case 2:
              result = _a.sent();
              expect(result).toBeTruthy();
              expect(
                result === null || result === void 0 ? void 0 : result.demographics.phone,
              ).toBe(updateData.demographics.phone);
              expect(
                result === null || result === void 0 ? void 0 : result.demographics.address,
              ).toBe(updateData.demographics.address);
              expect(result === null || result === void 0 ? void 0 : result.demographics.name).toBe(
                mockPatientData.demographics.name,
              ); // Should remain unchanged
              return [2 /*return*/];
          }
        });
      }));
    test("should calculate profile completeness score accurately", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, profileManager.createPatientProfile(mockPatientData)];
            case 1:
              result = _a.sent();
              expect(
                result === null || result === void 0 ? void 0 : result.profile_completeness_score,
              ).toBeGreaterThan(70); // Changed to percentage
              expect(
                result === null || result === void 0 ? void 0 : result.profile_completeness_score,
              ).toBeLessThanOrEqual(100); // Changed to percentage
              return [2 /*return*/];
          }
        });
      }));
    test("should search patients by various criteria", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var testPatient1, testPatient2, nameResults, phoneResults;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              testPatient1 = {
                patient_id: "test-patient-1",
                demographics: {
                  name: "John Doe",
                  date_of_birth: "1985-06-15",
                  gender: "male",
                  phone: "+1-555-123-4567",
                  email: "john.doe@example.com",
                  address: "123 Main St, City, State 12345",
                },
              };
              testPatient2 = {
                patient_id: "test-patient-2",
                demographics: {
                  name: "Jane Smith",
                  date_of_birth: "1990-03-20",
                  gender: "female",
                  phone: "+1-555-987-6543",
                  email: "jane.smith@example.com",
                  address: "456 Oak Ave, Town, State 67890",
                },
              };
              // Create patient profiles to populate internal mockProfiles
              return [4 /*yield*/, profileManager.createPatientProfile(testPatient1)];
            case 1:
              // Create patient profiles to populate internal mockProfiles
              _a.sent();
              return [4 /*yield*/, profileManager.createPatientProfile(testPatient2)];
            case 2:
              _a.sent();
              return [4 /*yield*/, profileManager.searchPatients({ name: "John" })];
            case 3:
              nameResults = _a.sent();
              expect(nameResults.length).toBeGreaterThan(0);
              expect(nameResults[0].demographics.name).toContain("John");
              return [
                4 /*yield*/,
                profileManager.searchPatients({
                  phone: testPatient1.demographics.phone,
                }),
              ];
            case 4:
              phoneResults = _a.sent();
              expect(phoneResults.length).toBe(1);
              expect(phoneResults[0].patient_id).toBe(testPatient1.patient_id);
              return [2 /*return*/];
          }
        });
      }));
    test("should identify incomplete profiles", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var incompleteData, incompleteProfiles, found;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Create a complete profile
              return [4 /*yield*/, profileManager.createPatientProfile(mockPatientData)];
            case 1:
              // Create a complete profile
              _a.sent();
              incompleteData = {
                patient_id: "incomplete-patient",
                demographics: {
                  name: "Incomplete User",
                  date_of_birth: "1990-01-01",
                  gender: "female",
                  phone: "",
                  email: "",
                  address: "",
                },
              };
              return [4 /*yield*/, profileManager.createPatientProfile(incompleteData)];
            case 2:
              _a.sent();
              return [4 /*yield*/, profileManager.getIncompleteProfiles(80)];
            case 3:
              incompleteProfiles = _a.sent();
              expect(incompleteProfiles.length).toBeGreaterThan(0);
              found = incompleteProfiles.find((p) => p.patient_id === "incomplete-patient");
              expect(found).toBeTruthy();
              expect(
                found === null || found === void 0 ? void 0 : found.profile_completeness_score,
              ).toBeLessThan(80); // Changed to percentage
              return [2 /*return*/];
          }
        });
      }));
    test("should archive patient profile", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var archived, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Create profile
              return [4 /*yield*/, profileManager.createPatientProfile(mockPatientData)];
            case 1:
              // Create profile
              _a.sent();
              return [
                4 /*yield*/,
                profileManager.archivePatientProfile(mockPatientData.patient_id),
              ];
            case 2:
              archived = _a.sent();
              expect(archived).toBe(true);
              return [4 /*yield*/, profileManager.getPatientProfile(mockPatientData.patient_id)];
            case 3:
              result = _a.sent();
              expect(result).toBeNull();
              return [2 /*return*/];
          }
        });
      }));
    test("should provide patient analytics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var analytics;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Create some test profiles
              return [4 /*yield*/, profileManager.createPatientProfile(mockPatientData)];
            case 1:
              // Create some test profiles
              _a.sent();
              return [
                4 /*yield*/,
                profileManager.createPatientProfile(
                  __assign(__assign({}, mockPatientData), { patient_id: "test-patient-002" }),
                ),
              ];
            case 2:
              _a.sent();
              return [4 /*yield*/, profileManager.getPatientAnalytics()];
            case 3:
              analytics = _a.sent();
              expect(analytics.totalPatients).toBeGreaterThanOrEqual(2);
              expect(analytics.activePatients).toBeGreaterThanOrEqual(2);
              expect(analytics.averageCompleteness).toBeGreaterThan(0);
              expect(typeof analytics.profilesNeedingAttention).toBe("number");
              expect(typeof analytics.recentlyUpdated).toBe("number");
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("AI Patient Insights Integration", () => {
    test("should generate comprehensive patient insights", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var insights;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                patient_insights_1.patientInsights.generatePatientInsights(mockPatientData),
              ];
            case 1:
              insights = _a.sent();
              expect(insights).toBeTruthy();
              expect(insights.clinical_insights).toBeInstanceOf(Array);
              expect(insights.personalization_insights).toBeTruthy();
              expect(insights.risk_assessment).toBeTruthy();
              expect(insights.care_recommendations).toBeInstanceOf(Array);
              return [2 /*return*/];
          }
        });
      }));
    test("should provide clinical insights with proper structure", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var insights, clinicalInsights, firstInsight;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                patient_insights_1.patientInsights.generatePatientInsights(mockPatientData),
              ];
            case 1:
              insights = _a.sent();
              clinicalInsights = insights.clinical_insights;
              expect(clinicalInsights.length).toBeGreaterThan(0);
              firstInsight = clinicalInsights[0];
              expect(firstInsight.type).toBeTruthy();
              expect(firstInsight.priority).toBeTruthy();
              expect(firstInsight.title).toBeTruthy();
              expect(firstInsight.description).toBeTruthy();
              expect(firstInsight.confidence_score).toBeGreaterThan(0);
              expect(firstInsight.confidence_score).toBeLessThanOrEqual(1);
              return [2 /*return*/];
          }
        });
      }));
    test("should provide personalization insights", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var insights, personalization;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                patient_insights_1.patientInsights.generatePatientInsights(mockPatientData),
              ];
            case 1:
              insights = _a.sent();
              personalization = insights.personalization_insights;
              expect(personalization.communication_preferences).toBeTruthy();
              expect(personalization.care_preferences).toBeTruthy();
              expect(personalization.behavioral_patterns).toBeTruthy();
              expect(
                personalization.behavioral_patterns.appointment_attendance_rate,
              ).toBeGreaterThan(0);
              expect(
                personalization.behavioral_patterns.appointment_attendance_rate,
              ).toBeLessThanOrEqual(1);
              return [2 /*return*/];
          }
        });
      }));
    test("should perform risk assessment", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var insights, riskAssessment;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                patient_insights_1.patientInsights.generatePatientInsights(mockPatientData),
              ];
            case 1:
              insights = _a.sent();
              riskAssessment = insights.risk_assessment;
              expect(riskAssessment.overall_score).toBeGreaterThanOrEqual(0);
              expect(riskAssessment.overall_score).toBeLessThanOrEqual(1);
              expect(riskAssessment.level).toBeTruthy();
              expect(["low", "medium", "high", "critical"]).toContain(riskAssessment.level);
              return [2 /*return*/];
          }
        });
      }));
    test("should generate care recommendations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var insights, recommendations, firstRecommendation;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                patient_insights_1.patientInsights.generatePatientInsights(mockPatientData),
              ];
            case 1:
              insights = _a.sent();
              recommendations = insights.care_recommendations;
              expect(recommendations.length).toBeGreaterThan(0);
              firstRecommendation = recommendations[0];
              expect(firstRecommendation.category).toBeTruthy();
              expect(firstRecommendation.title).toBeTruthy();
              expect(firstRecommendation.description).toBeTruthy();
              expect(firstRecommendation.priority).toBeTruthy();
              return [2 /*return*/];
          }
        });
      }));
    test("should update insights successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                patient_insights_1.patientInsights.updateInsights(mockPatientData.patient_id, {
                  new_vitals: { blood_pressure: "130/80" },
                }),
              ];
            case 1:
              result = _a.sent();
              expect(result).toBe(true);
              return [2 /*return*/];
          }
        });
      }));
    test("should provide trending insights", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var trends, firstTrend;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, patient_insights_1.patientInsights.getTrendingInsights()];
            case 1:
              trends = _a.sent();
              expect(trends).toBeInstanceOf(Array);
              expect(trends.length).toBeGreaterThan(0);
              firstTrend = trends[0];
              expect(firstTrend.trend).toBeTruthy();
              expect(firstTrend.patient_count).toBeGreaterThan(0);
              expect(firstTrend.description).toBeTruthy();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Integrated Workflows", () => {
    test("should create profile and generate insights in workflow", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var profile, insights;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, profileManager.createPatientProfile(mockPatientData)];
            case 1:
              profile = _a.sent();
              expect(profile).toBeTruthy();
              return [
                4 /*yield*/,
                patient_insights_1.patientInsights.generatePatientInsights(mockPatientData),
              ];
            case 2:
              insights = _a.sent();
              expect(insights).toBeTruthy();
              // Verify workflow integration
              expect(profile === null || profile === void 0 ? void 0 : profile.patient_id).toBe(
                mockPatientData.patient_id,
              );
              expect(insights.clinical_insights.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }));
    test("should handle profile updates and insight regeneration", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var vitalUpdate, updatedProfile, insightUpdate;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Create initial profile
              return [4 /*yield*/, profileManager.createPatientProfile(mockPatientData)];
            case 1:
              // Create initial profile
              _a.sent();
              vitalUpdate = {
                vital_signs: {
                  blood_pressure_systolic: 120,
                  blood_pressure_diastolic: 80,
                  weight_kg: 80,
                },
              };
              return [
                4 /*yield*/,
                profileManager.updatePatientProfile(mockPatientData.patient_id, vitalUpdate),
              ];
            case 2:
              updatedProfile = _a.sent();
              expect(updatedProfile).toBeTruthy();
              expect(
                updatedProfile === null || updatedProfile === void 0
                  ? void 0
                  : updatedProfile.vital_signs.blood_pressure_systolic,
              ).toBe(120);
              return [
                4 /*yield*/,
                patient_insights_1.patientInsights.updateInsights(
                  mockPatientData.patient_id,
                  vitalUpdate,
                ),
              ];
            case 3:
              insightUpdate = _a.sent();
              expect(insightUpdate).toBe(true);
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Error Handling and Edge Cases", () => {
    test("should handle missing patient profile gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, profileManager.getPatientProfile("non-existent-patient")];
            case 1:
              result = _a.sent();
              expect(result).toBeNull();
              return [2 /*return*/];
          }
        });
      }));
    test("should handle empty search criteria", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var results;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, profileManager.searchPatients({})];
            case 1:
              results = _a.sent();
              expect(results).toBeInstanceOf(Array);
              return [2 /*return*/];
          }
        });
      }));
    test("should handle insights generation with minimal data", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var minimalData, insights;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              minimalData = {
                patient_id: "minimal-patient",
                demographics: {
                  name: "Test",
                  date_of_birth: "1990-01-01",
                  gender: "other",
                  phone: "",
                  email: "",
                  address: "",
                },
                medical_history: {},
                vital_signs: {},
                appointment_history: {},
                care_preferences: {},
              };
              return [
                4 /*yield*/,
                patient_insights_1.patientInsights.generatePatientInsights(minimalData),
              ];
            case 1:
              insights = _a.sent();
              expect(insights).toBeTruthy();
              expect(insights.clinical_insights).toBeInstanceOf(Array);
              return [2 /*return*/];
          }
        });
      }));
  });
});
