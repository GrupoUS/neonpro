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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentService = void 0;
var client_1 = require("@/lib/supabase/client");
var ConsentService = /** @class */ (() => {
  function ConsentService() {
    this.supabase = (0, client_1.createClient)();
  }
  // Consent Form Management
  ConsentService.prototype.getConsentForms = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("consent_forms")
                .select("*")
                .eq("clinic_id", clinicId)
                .eq("is_active", true)
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching consent forms:", error);
              throw new Error("Failed to fetch consent forms");
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  ConsentService.prototype.getConsentForm = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("consent_forms").select("*").eq("id", id).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching consent form:", error);
              throw new Error("Failed to fetch consent form");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  ConsentService.prototype.createConsentForm = function (form) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from("consent_forms").insert([form]).select()];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error creating consent form:", error);
              throw new Error("Failed to create consent form");
            }
            return [2 /*return*/, data[0]];
        }
      });
    });
  };
  ConsentService.prototype.updateConsentForm = function (id, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("consent_forms").update(updates).eq("id", id).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error updating consent form:", error);
              throw new Error("Failed to update consent form");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  ConsentService.prototype.deactivateConsentForm = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("consent_forms").update({ is_active: false }).eq("id", id),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error deactivating consent form:", error);
              throw new Error("Failed to deactivate consent form");
            }
            return [2 /*return*/];
        }
      });
    });
  };
  // Patient Consent Management
  ConsentService.prototype.getPatientConsents = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_consents")
                .select("\n        *,\n        consent_form:consent_forms(*)\n      ")
                .eq("patient_id", patientId)
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching patient consents:", error);
              throw new Error("Failed to fetch patient consents");
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  ConsentService.prototype.getActiveConsents = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_consents")
                .select("\n        *,\n        consent_form:consent_forms(*)\n      ")
                .eq("patient_id", patientId)
                .eq("status", "active")
                .or("expires_at.is.null,expires_at.gt.now()")
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching active consents:", error);
              throw new Error("Failed to fetch active consents");
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  ConsentService.prototype.createPatientConsent = function (consentData, formId, patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var consentRecord, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            consentRecord = {
              patient_id: patientId,
              consent_form_id: formId,
              consent_given: true,
              consent_type: consentData.consent_type,
              purpose: consentData.purpose,
              signed_at: new Date().toISOString(),
              consent_data: {
                patient_name: consentData.patient_name,
                cpf: consentData.cpf,
                email: consentData.email,
                phone: consentData.phone,
                form_data: consentData,
              },
              signature_data: {
                signature: consentData.signature,
                timestamp: consentData.date,
                ip_address: consentData.ip_address,
                user_agent: consentData.user_agent,
              },
              ip_address: consentData.ip_address,
              user_agent: consentData.user_agent,
              processing_categories: consentData.processing_categories,
              status: "active",
            };
            return [
              4 /*yield*/,
              this.supabase.from("patient_consents").insert([consentRecord]).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error creating patient consent:", error);
              throw new Error("Failed to create patient consent");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  ConsentService.prototype.withdrawConsent = function (consentId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_consents")
                .update({
                  status: "withdrawn",
                  withdrawal_date: new Date().toISOString(),
                  withdrawal_reason: reason,
                })
                .eq("id", consentId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error withdrawing consent:", error);
              throw new Error("Failed to withdraw consent");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  ConsentService.prototype.updateConsentExpiry = function (consentId, expiryDate) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_consents")
                .update({ expires_at: expiryDate })
                .eq("id", consentId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error updating consent expiry:", error);
              throw new Error("Failed to update consent expiry");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  // Patient Consent Management
  ConsentService.prototype.recordPatientConsent = function (consent) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from("patient_consent").insert([consent]).select()];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error recording patient consent:", error);
              throw new Error("Failed to record patient consent");
            }
            return [2 /*return*/, data[0]];
        }
      });
    });
  };
  // Methods needed for testing
  ConsentService.prototype.grantPatientConsent = function (patientId, formId) {
    return __awaiter(this, void 0, void 0, function () {
      var consentData, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            consentData = {
              patient_id: patientId,
              consent_form_id: formId,
              status: "granted",
              consented_at: new Date().toISOString(),
              signature_method: "digital",
            };
            return [
              4 /*yield*/,
              this.supabase.from("patient_consent").insert([consentData]).select(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error granting patient consent:", error);
              throw new Error("Failed to grant patient consent");
            }
            return [2 /*return*/, data[0]];
        }
      });
    });
  };
  ConsentService.prototype.revokePatientConsent = function (consentId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_consent")
                .update({
                  status: "revoked",
                  withdrawal_date: new Date().toISOString(),
                  withdrawal_reason: reason || "User requested",
                })
                .eq("id", consentId)
                .select(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error revoking patient consent:", error);
              throw new Error("Failed to revoke patient consent");
            }
            return [2 /*return*/, data[0]];
        }
      });
    });
  };
  // Digital Signature Validation
  ConsentService.prototype.validateDigitalSignature = (signature) => {
    if (!signature.signature_data || !signature.timestamp) {
      return false;
    }
    // Basic validation - in production, you might want more sophisticated validation
    var signatureAge = Date.now() - new Date(signature.timestamp).getTime();
    var maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return signatureAge <= maxAge;
  };
  // Consent Form Templates
  ConsentService.prototype.renderConsentTemplate = (template, data) => {
    var rendered = template;
    // Replace template variables
    var replacements = {
      "{{patient_name}}": data.patient_name || "",
      "{{cpf}}": data.cpf || "",
      "{{email}}": data.email || "",
      "{{phone}}": data.phone || "",
      "{{date}}": data.date || new Date().toLocaleDateString("pt-BR"),
      "{{consent_type}}": data.consent_type || "",
      "{{purpose}}": data.purpose || "",
    };
    Object.entries(replacements).forEach((_a) => {
      var key = _a[0],
        value = _a[1];
      rendered = rendered.replace(new RegExp(key, "g"), value);
    });
    return rendered;
  };
  // Compliance Utilities
  ConsentService.prototype.getExpiringConsents = function (clinicId_1) {
    return __awaiter(this, arguments, void 0, function (clinicId, daysAhead) {
      var futureDate, _a, data, error;
      if (daysAhead === void 0) {
        daysAhead = 30;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + daysAhead);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_consents")
                .select(
                  "\n        *,\n        consent_form:consent_forms(*),\n        patient:patients(id, name, email)\n      ",
                )
                .eq("clinic_id", clinicId)
                .eq("status", "active")
                .not("expires_at", "is", null)
                .lte("expires_at", futureDate.toISOString())
                .order("expires_at", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching expiring consents:", error);
              throw new Error("Failed to fetch expiring consents");
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  ConsentService.prototype.getConsentStats = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, stats;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("patient_consents").select("status").eq("clinic_id", clinicId),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching consent stats:", error);
              throw new Error("Failed to fetch consent stats");
            }
            stats = {
              total: (data === null || data === void 0 ? void 0 : data.length) || 0,
              active: 0,
              expired: 0,
              withdrawn: 0,
              pending: 0,
            };
            data === null || data === void 0
              ? void 0
              : data.forEach((consent) => {
                  switch (consent.status) {
                    case "active":
                      stats.active++;
                      break;
                    case "expired":
                      stats.expired++;
                      break;
                    case "withdrawn":
                      stats.withdrawn++;
                      break;
                    case "pending":
                      stats.pending++;
                      break;
                  }
                });
            return [2 /*return*/, stats];
        }
      });
    });
  };
  // Get all patient consents for a clinic
  ConsentService.prototype.getClinicConsents = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_consents")
                .select(
                  "\n        *,\n        consent_form:consent_forms(*),\n        patient:patients(*)\n      ",
                )
                .eq("clinic_id", clinicId)
                .order("created_at", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch clinic consents: ".concat(error.message));
            }
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  // Audit Trail for Consent Operations
  ConsentService.prototype.logConsentOperation = function (operation, consentId, details) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would integrate with the audit system
        console.log("Consent operation logged:", {
          operation: operation,
          consent_id: consentId,
          timestamp: new Date().toISOString(),
          details: details,
        });
        return [2 /*return*/];
      });
    });
  };
  return ConsentService;
})();
exports.ConsentService = ConsentService;
