"use strict";
// Patient Authentication Utils
// Story 1.3, Task 1: Patient Authentication System with LGPD Compliance
// Created: Healthcare-grade authentication utilities for patient portal
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
exports.PatientAuthClient = exports.PatientAuthServer = void 0;
var server_1 = require("@/lib/supabase/server");
var client_1 = require("@/lib/supabase/client");
// Server-side patient authentication utilities
var PatientAuthServer = /** @class */ (function () {
  function PatientAuthServer() {}
  PatientAuthServer.getCurrentPatient = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, user, userError, _b, profile, profileError, error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              (0, server_1.createServerClient)(),
              // Get current user
            ];
          case 1:
            supabase = _c.sent();
            return [4 /*yield*/, supabase.auth.getUser()];
          case 2:
            (_a = _c.sent()), (user = _a.data.user), (userError = _a.error);
            if (userError || !user)
              return [
                2 /*return*/,
                null,
                // Get patient profile
              ];
            return [
              4 /*yield*/,
              supabase.from("patient_profiles").select("*").eq("user_id", user.id).single(),
            ];
          case 3:
            (_b = _c.sent()), (profile = _b.data), (profileError = _b.error);
            if (profileError || !profile)
              return [
                2 /*return*/,
                null,
                // Record access for LGPD compliance
              ];
            // Record access for LGPD compliance
            return [
              4 /*yield*/,
              PatientAuthServer.recordDataAccess(profile.id, "profile_access", {
                accessed_fields: ["basic_info"],
              }),
            ];
          case 4:
            // Record access for LGPD compliance
            _c.sent();
            return [2 /*return*/, profile];
          case 5:
            error_1 = _c.sent();
            console.error("Error getting current patient:", error_1);
            return [2 /*return*/, null];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientAuthServer.recordDataAccess = function (patientId, action, details) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, server_1.createServerClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase.rpc("record_patient_data_access", {
                p_patient_id: patientId,
                p_action: action,
                p_details: details || {},
              }),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              console.error("Error recording data access:", error);
            }
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error in recordDataAccess:", error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientAuthServer.checkPatientConsent = function (patientId, consentType) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, server_1.createServerClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.rpc("check_patient_consent", {
                p_patient_id: patientId,
                p_consent_type: consentType,
              }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error checking consent:", error);
              return [2 /*return*/, false];
            }
            return [2 /*return*/, data];
          case 3:
            error_3 = _b.sent();
            console.error("Error in checkPatientConsent:", error_3);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientAuthServer.isPatientRoute = function (path) {
    return __awaiter(this, void 0, void 0, function () {
      var patientRoutes;
      return __generator(this, function (_a) {
        patientRoutes = [
          "/portal",
          "/portal/dashboard",
          "/portal/appointments",
          "/portal/profile",
          "/portal/history",
          "/portal/payments",
        ];
        return [
          2 /*return*/,
          patientRoutes.some(function (route) {
            return path.startsWith(route);
          }),
        ];
      });
    });
  };
  PatientAuthServer.validatePatientAccess = function () {
    return __awaiter(this, void 0, void 0, function () {
      var patient;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, PatientAuthServer.getCurrentPatient()];
          case 1:
            patient = _a.sent();
            if (!patient) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  redirect: "/portal/login",
                },
              ];
            }
            // Check account status
            if (patient.account_status === "suspended") {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  redirect: "/portal/suspended",
                },
              ];
            }
            if (patient.account_status === "pending_verification") {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  redirect: "/portal/verify",
                },
              ];
            }
            // Check privacy consent (required for LGPD)
            if (!patient.privacy_consent) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  redirect: "/portal/consent",
                },
              ];
            }
            return [
              2 /*return*/,
              {
                isValid: true,
                patient: patient,
              },
            ];
        }
      });
    });
  };
  return PatientAuthServer;
})(); // Client-side patient authentication utilities
exports.PatientAuthServer = PatientAuthServer;
var PatientAuthClient = /** @class */ (function () {
  function PatientAuthClient() {}
  PatientAuthClient.registerPatient = function (data) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, authData, authError, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              (0, client_1.createClient)(),
              // Register user with Supabase Auth
            ];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                  data: {
                    full_name: data.full_name,
                    user_type: "patient", // This triggers our database trigger
                  },
                },
              }),
            ];
          case 2:
            (_a = _b.sent()), (authData = _a.data), (authError = _a.error);
            if (authError) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: authError.message,
                  code: authError.name,
                },
              ];
            }
            if (!authData.user) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: "Registration failed - no user created",
                },
              ];
            }
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  user: authData.user,
                  session: authData.session,
                  needsVerification: !authData.session,
                },
              },
            ];
          case 3:
            error_4 = _b.sent();
            console.error("Registration error:", error_4);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_4.message || "Registration failed",
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientAuthClient.loginPatient = function (email, password) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, updateError, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.auth.signInWithPassword({
                email: email,
                password: password,
              }),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: error.message,
                  code: error.name,
                },
              ];
            }
            if (!data.user || !data.session) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: "Login failed - invalid credentials",
                },
              ];
            }
            return [
              4 /*yield*/,
              supabase
                .from("patient_profiles")
                .update({
                  last_login: new Date().toISOString(),
                })
                .eq("user_id", data.user.id),
            ];
          case 3:
            updateError = _b.sent().error;
            if (updateError) {
              console.error("Error updating last login:", updateError);
            }
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  user: data.user,
                  session: data.session,
                },
              },
            ];
          case 4:
            error_5 = _b.sent();
            console.error("Login error:", error_5);
            return [
              2 /*return*/,
              {
                success: false,
                error: error_5.message || "Login failed",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  return PatientAuthClient;
})();
exports.PatientAuthClient = PatientAuthClient;
