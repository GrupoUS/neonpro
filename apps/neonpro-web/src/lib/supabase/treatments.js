"use strict";
/**
 * Treatment & Procedure Data Access Layer
 * Supabase functions for HL7 FHIR R4 compliant treatment documentation
 * Includes LGPD compliance and Row Level Security
 *
 * Created: January 26, 2025
 * Story: 3.2 - Treatment & Procedure Documentation
 */
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
exports.createTreatmentPlan = createTreatmentPlan;
exports.updateTreatmentPlan = updateTreatmentPlan;
exports.getTreatmentPlan = getTreatmentPlan;
exports.searchTreatmentPlans = searchTreatmentPlans;
exports.createProcedure = createProcedure;
exports.updateProcedure = updateProcedure;
exports.getProcedure = getProcedure;
exports.searchProcedures = searchProcedures;
exports.createClinicalNote = createClinicalNote;
exports.updateClinicalNote = updateClinicalNote;
exports.getClinicalNote = getClinicalNote;
exports.searchClinicalNotes = searchClinicalNotes;
exports.getTreatmentStatistics = getTreatmentStatistics;
exports.deleteTreatmentPlan = deleteTreatmentPlan;
exports.deleteProcedure = deleteProcedure;
exports.deleteClinicalNote = deleteClinicalNote;
var client_1 = require("@/lib/supabase/client");
var supabase = await (0, client_1.createClient)();
// ===============================================
// TREATMENT PLAN FUNCTIONS
// ===============================================
/**
 * Create a new treatment plan
 */
function createTreatmentPlan(data) {
  return __awaiter(this, void 0, void 0, function () {
    var user, fhir_id, treatmentPlan, _a, result, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _b.sent().data.user;
          if (!user) throw new Error("Usuário não autenticado");
          fhir_id = "careplan-".concat(crypto.randomUUID());
          treatmentPlan = {
            patient_id: data.patient_id,
            provider_id: user.id,
            fhir_id: fhir_id,
            status: data.status,
            intent: data.intent,
            category: data.category.map(function (cat) {
              return {
                coding: [{ code: cat, display: cat }],
              };
            }),
            title: data.title,
            description: data.description,
            subject_reference: "Patient/".concat(data.patient_id),
            period_start: data.period_start,
            period_end: data.period_end,
            care_team: [],
            goals: data.goals.map(function (goal) {
              return { reference: "Goal/".concat(goal) };
            }),
            activities: [],
            supporting_info: [],
            addresses: data.addresses.map(function (addr) {
              return { reference: "Condition/".concat(addr) };
            }),
            fhir_meta: {
              versionId: "1",
              lastUpdated: new Date().toISOString(),
              source: "NeonPro",
              profile: ["http://hl7.org/fhir/StructureDefinition/CarePlan"],
            },
            fhir_text: {
              status: "generated",
              div: "<div>"
                .concat(data.title, ": ")
                .concat(data.description || "Plano de tratamento", "</div>"),
            },
            data_consent_given: data.data_consent_given,
            data_consent_date: data.data_consent_given ? new Date().toISOString() : null,
            data_retention_until: data.data_consent_given
              ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
              : null, // 10 years
            version: 1,
            created_by: user.id,
            updated_by: user.id,
          };
          return [
            4 /*yield*/,
            supabase.from("treatment_plans").insert(treatmentPlan).select().single(),
          ];
        case 2:
          (_a = _b.sent()), (result = _a.data), (error = _a.error);
          if (error) throw new Error("Erro ao criar plano de tratamento: ".concat(error.message));
          return [2 /*return*/, result];
      }
    });
  });
}
/**
 * Update an existing treatment plan
 */
function updateTreatmentPlan(id, data) {
  return __awaiter(this, void 0, void 0, function () {
    var user, updateData, _a, result, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _b.sent().data.user;
          if (!user) throw new Error("Usuário não autenticado");
          updateData = __assign(__assign({}, data), {
            fhir_meta: {
              lastUpdated: new Date().toISOString(),
            },
            updated_by: user.id,
          });
          return [
            4 /*yield*/,
            supabase.from("treatment_plans").update(updateData).eq("id", id).select().single(),
          ];
        case 2:
          (_a = _b.sent()), (result = _a.data), (error = _a.error);
          if (error)
            throw new Error("Erro ao atualizar plano de tratamento: ".concat(error.message));
          return [2 /*return*/, result];
      }
    });
  });
}
/**
 * Get treatment plan by ID
 */
function getTreatmentPlan(id) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("treatment_plans")
              .select(
                "\n      *,\n      patient:patients!treatment_plans_patient_id_fkey(id, given_name, family_name),\n      provider:profiles!treatment_plans_provider_id_fkey(id, full_name, professional_title)\n    ",
              )
              .eq("id", id)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            if (error.code === "PGRST116") return [2 /*return*/, null];
            throw new Error("Erro ao buscar plano de tratamento: ".concat(error.message));
          }
          return [2 /*return*/, data];
      }
    });
  });
}
/**
 * Search and list treatment plans with filters
 */
function searchTreatmentPlans(filters_1) {
  return __awaiter(this, arguments, void 0, function (filters, page, perPage) {
    var query, from, to, _a, data, error, count;
    if (page === void 0) {
      page = 1;
    }
    if (perPage === void 0) {
      perPage = 10;
    }
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          query = supabase
            .from("treatment_plans")
            .select(
              "\n      *,\n      patient:patients!treatment_plans_patient_id_fkey(id, given_name, family_name),\n      provider:profiles!treatment_plans_provider_id_fkey(id, full_name, professional_title)\n    ",
              { count: "exact" },
            );
          // Apply filters
          if (filters.patient_id) {
            query = query.eq("patient_id", filters.patient_id);
          }
          if (filters.provider_id) {
            query = query.eq("provider_id", filters.provider_id);
          }
          if (filters.status && filters.status.length > 0) {
            query = query.in("status", filters.status);
          }
          if (filters.intent && filters.intent.length > 0) {
            query = query.in("intent", filters.intent);
          }
          if (filters.period_start) {
            query = query.gte("period_start", filters.period_start);
          }
          if (filters.period_end) {
            query = query.lte("period_end", filters.period_end);
          }
          if (filters.search_text) {
            query = query.or(
              "title.ilike.%"
                .concat(filters.search_text, "%,description.ilike.%")
                .concat(filters.search_text, "%"),
            );
          }
          from = (page - 1) * perPage;
          to = from + perPage - 1;
          return [4 /*yield*/, query.range(from, to).order("created_at", { ascending: false })];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
          if (error) throw new Error("Erro ao buscar planos de tratamento: ".concat(error.message));
          return [
            2 /*return*/,
            {
              treatment_plans: data || [],
              total_count: count || 0,
              page: page,
              per_page: perPage,
            },
          ];
      }
    });
  });
}
// ===============================================
// PROCEDURE FUNCTIONS
// ===============================================
/**
 * Create a new procedure
 */
function createProcedure(data) {
  return __awaiter(this, void 0, void 0, function () {
    var user, fhir_id, procedure, _a, result, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _b.sent().data.user;
          if (!user) throw new Error("Usuário não autenticado");
          fhir_id = "procedure-".concat(crypto.randomUUID());
          procedure = {
            patient_id: data.patient_id,
            provider_id: user.id,
            treatment_plan_id: data.treatment_plan_id,
            fhir_id: fhir_id,
            status: data.status,
            category: data.category
              ? {
                  coding: [{ code: data.category, display: data.category }],
                }
              : null,
            code: {
              coding: [{ code: data.code, display: data.code_display }],
            },
            subject_reference: "Patient/".concat(data.patient_id),
            performed_datetime: data.performed_datetime,
            performed_period_start: data.performed_period_start,
            performed_period_end: data.performed_period_end,
            recorder_reference: "Practitioner/".concat(user.id),
            asserter_reference: "Practitioner/".concat(user.id),
            performers: [
              {
                actor: "Practitioner/".concat(user.id),
              },
            ],
            reason_code: data.reason_code.map(function (code) {
              return {
                coding: [{ code: code, display: code }],
              };
            }),
            reason_reference: [],
            body_site: data.body_site.map(function (site) {
              return {
                coding: [{ code: site, display: site }],
              };
            }),
            outcome: data.outcome
              ? {
                  coding: [{ code: data.outcome, display: data.outcome }],
                }
              : null,
            report: [],
            complications: [],
            follow_up: [],
            notes: data.notes,
            used_reference: [],
            used_code: [],
            fhir_meta: {
              versionId: "1",
              lastUpdated: new Date().toISOString(),
              source: "NeonPro",
              profile: ["http://hl7.org/fhir/StructureDefinition/Procedure"],
            },
            fhir_text: {
              status: "generated",
              div: "<div>".concat(data.code_display, "</div>"),
            },
            data_consent_given: data.data_consent_given,
            data_consent_date: data.data_consent_given ? new Date().toISOString() : null,
            data_retention_until: data.data_consent_given
              ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
              : null, // 10 years
            version: 1,
            created_by: user.id,
            updated_by: user.id,
          };
          return [4 /*yield*/, supabase.from("procedures").insert(procedure).select().single()];
        case 2:
          (_a = _b.sent()), (result = _a.data), (error = _a.error);
          if (error) throw new Error("Erro ao criar procedimento: ".concat(error.message));
          return [2 /*return*/, result];
      }
    });
  });
} /**
 * Update an existing procedure
 */
function updateProcedure(id, data) {
  return __awaiter(this, void 0, void 0, function () {
    var user, updateData, _a, result, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _b.sent().data.user;
          if (!user) throw new Error("Usuário não autenticado");
          updateData = __assign(__assign({}, data), {
            fhir_meta: {
              lastUpdated: new Date().toISOString(),
            },
            updated_by: user.id,
          });
          return [
            4 /*yield*/,
            supabase.from("procedures").update(updateData).eq("id", id).select().single(),
          ];
        case 2:
          (_a = _b.sent()), (result = _a.data), (error = _a.error);
          if (error) throw new Error("Erro ao atualizar procedimento: ".concat(error.message));
          return [2 /*return*/, result];
      }
    });
  });
}
/**
 * Get procedure by ID
 */
function getProcedure(id) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("procedures")
              .select(
                "\n      *,\n      patient:patients!procedures_patient_id_fkey(id, given_name, family_name),\n      provider:profiles!procedures_provider_id_fkey(id, full_name, professional_title),\n      treatment_plan:treatment_plans!procedures_treatment_plan_id_fkey(id, title, status)\n    ",
              )
              .eq("id", id)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            if (error.code === "PGRST116") return [2 /*return*/, null];
            throw new Error("Erro ao buscar procedimento: ".concat(error.message));
          }
          return [2 /*return*/, data];
      }
    });
  });
}
/**
 * Search and list procedures with filters
 */
function searchProcedures(filters_1) {
  return __awaiter(this, arguments, void 0, function (filters, page, perPage) {
    var query, from, to, _a, data, error, count;
    if (page === void 0) {
      page = 1;
    }
    if (perPage === void 0) {
      perPage = 10;
    }
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          query = supabase
            .from("procedures")
            .select(
              "\n      *,\n      patient:patients!procedures_patient_id_fkey(id, given_name, family_name),\n      provider:profiles!procedures_provider_id_fkey(id, full_name, professional_title),\n      treatment_plan:treatment_plans!procedures_treatment_plan_id_fkey(id, title, status)\n    ",
              { count: "exact" },
            );
          // Apply filters
          if (filters.patient_id) {
            query = query.eq("patient_id", filters.patient_id);
          }
          if (filters.provider_id) {
            query = query.eq("provider_id", filters.provider_id);
          }
          if (filters.treatment_plan_id) {
            query = query.eq("treatment_plan_id", filters.treatment_plan_id);
          }
          if (filters.status && filters.status.length > 0) {
            query = query.in("status", filters.status);
          }
          if (filters.procedure_code && filters.procedure_code.length > 0) {
            query = query.contains("code", { coding: [{ code: filters.procedure_code }] });
          }
          if (filters.performed_start) {
            query = query.gte("performed_datetime", filters.performed_start);
          }
          if (filters.performed_end) {
            query = query.lte("performed_datetime", filters.performed_end);
          }
          if (filters.search_text) {
            query = query.or("notes.ilike.%".concat(filters.search_text, "%"));
          }
          from = (page - 1) * perPage;
          to = from + perPage - 1;
          return [
            4 /*yield*/,
            query.range(from, to).order("performed_datetime", { ascending: false }),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
          if (error) throw new Error("Erro ao buscar procedimentos: ".concat(error.message));
          return [
            2 /*return*/,
            {
              procedures: data || [],
              total_count: count || 0,
              page: page,
              per_page: perPage,
            },
          ];
      }
    });
  });
}
// ===============================================
// CLINICAL NOTES FUNCTIONS
// ===============================================
/**
 * Create a new clinical note
 */
function createClinicalNote(data) {
  return __awaiter(this, void 0, void 0, function () {
    var user, fhir_id, clinicalNote, _a, result, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _b.sent().data.user;
          if (!user) throw new Error("Usuário não autenticado");
          fhir_id = "note-".concat(crypto.randomUUID());
          clinicalNote = {
            patient_id: data.patient_id,
            provider_id: user.id,
            treatment_plan_id: data.treatment_plan_id,
            procedure_id: data.procedure_id,
            fhir_id: fhir_id,
            status: "current",
            category: data.category
              ? {
                  coding: [{ code: data.category, display: data.category }],
                }
              : null,
            type: {
              coding: [{ code: data.type, display: data.type_display }],
            },
            subject_reference: "Patient/".concat(data.patient_id),
            title: data.title,
            content: data.content,
            content_type: data.content_type,
            authored_time: new Date().toISOString(),
            author_reference: "Practitioner/".concat(user.id),
            authenticator_reference: "Practitioner/".concat(user.id),
            relates_to: [],
            security_label: [],
            confidentiality: data.confidentiality,
            fhir_meta: {
              versionId: "1",
              lastUpdated: new Date().toISOString(),
              source: "NeonPro",
              profile: ["http://hl7.org/fhir/StructureDefinition/DocumentReference"],
            },
            fhir_text: {
              status: "generated",
              div: "<div>"
                .concat(data.title, ": ")
                .concat(data.content.substring(0, 100), "...</div>"),
            },
            data_consent_given: data.data_consent_given,
            data_consent_date: data.data_consent_given ? new Date().toISOString() : null,
            data_retention_until: data.data_consent_given
              ? new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
              : null, // 10 years
            version: 1,
            created_by: user.id,
            updated_by: user.id,
          };
          return [
            4 /*yield*/,
            supabase.from("clinical_notes").insert(clinicalNote).select().single(),
          ];
        case 2:
          (_a = _b.sent()), (result = _a.data), (error = _a.error);
          if (error) throw new Error("Erro ao criar nota cl\u00EDnica: ".concat(error.message));
          return [2 /*return*/, result];
      }
    });
  });
}
/**
 * Update an existing clinical note
 */
function updateClinicalNote(id, data) {
  return __awaiter(this, void 0, void 0, function () {
    var user, updateData, _a, result, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _b.sent().data.user;
          if (!user) throw new Error("Usuário não autenticado");
          updateData = __assign(__assign({}, data), {
            fhir_meta: {
              lastUpdated: new Date().toISOString(),
            },
            updated_by: user.id,
          });
          return [
            4 /*yield*/,
            supabase.from("clinical_notes").update(updateData).eq("id", id).select().single(),
          ];
        case 2:
          (_a = _b.sent()), (result = _a.data), (error = _a.error);
          if (error) throw new Error("Erro ao atualizar nota cl\u00EDnica: ".concat(error.message));
          return [2 /*return*/, result];
      }
    });
  });
}
/**
 * Get clinical note by ID
 */
function getClinicalNote(id) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, data, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [
            4 /*yield*/,
            supabase
              .from("clinical_notes")
              .select(
                "\n      *,\n      patient:patients!clinical_notes_patient_id_fkey(id, given_name, family_name),\n      provider:profiles!clinical_notes_provider_id_fkey(id, full_name, professional_title),\n      treatment_plan:treatment_plans!clinical_notes_treatment_plan_id_fkey(id, title, status),\n      procedure:procedures!clinical_notes_procedure_id_fkey(id, code, status)\n    ",
              )
              .eq("id", id)
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error);
          if (error) {
            if (error.code === "PGRST116") return [2 /*return*/, null];
            throw new Error("Erro ao buscar nota cl\u00EDnica: ".concat(error.message));
          }
          return [2 /*return*/, data];
      }
    });
  });
}
/**
 * Search and list clinical notes with filters
 */
function searchClinicalNotes(filters_1) {
  return __awaiter(this, arguments, void 0, function (filters, page, perPage) {
    var query, from, to, _a, data, error, count;
    if (page === void 0) {
      page = 1;
    }
    if (perPage === void 0) {
      perPage = 10;
    }
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          query = supabase
            .from("clinical_notes")
            .select(
              "\n      *,\n      patient:patients!clinical_notes_patient_id_fkey(id, given_name, family_name),\n      provider:profiles!clinical_notes_provider_id_fkey(id, full_name, professional_title),\n      treatment_plan:treatment_plans!clinical_notes_treatment_plan_id_fkey(id, title, status),\n      procedure:procedures!clinical_notes_procedure_id_fkey(id, code, status)\n    ",
              { count: "exact" },
            );
          // Apply filters
          if (filters.patient_id) {
            query = query.eq("patient_id", filters.patient_id);
          }
          if (filters.provider_id) {
            query = query.eq("provider_id", filters.provider_id);
          }
          if (filters.treatment_plan_id) {
            query = query.eq("treatment_plan_id", filters.treatment_plan_id);
          }
          if (filters.procedure_id) {
            query = query.eq("procedure_id", filters.procedure_id);
          }
          if (filters.status && filters.status.length > 0) {
            query = query.in("status", filters.status);
          }
          if (filters.note_type && filters.note_type.length > 0) {
            query = query.contains("type", { coding: [{ code: filters.note_type }] });
          }
          if (filters.authored_start) {
            query = query.gte("authored_time", filters.authored_start);
          }
          if (filters.authored_end) {
            query = query.lte("authored_time", filters.authored_end);
          }
          if (filters.confidentiality && filters.confidentiality.length > 0) {
            query = query.in("confidentiality", filters.confidentiality);
          }
          if (filters.search_text) {
            query = query.or(
              "title.ilike.%"
                .concat(filters.search_text, "%,content.ilike.%")
                .concat(filters.search_text, "%"),
            );
          }
          from = (page - 1) * perPage;
          to = from + perPage - 1;
          return [4 /*yield*/, query.range(from, to).order("authored_time", { ascending: false })];
        case 1:
          (_a = _b.sent()), (data = _a.data), (error = _a.error), (count = _a.count);
          if (error) throw new Error("Erro ao buscar notas cl\u00EDnicas: ".concat(error.message));
          return [
            2 /*return*/,
            {
              clinical_notes: data || [],
              total_count: count || 0,
              page: page,
              per_page: perPage,
            },
          ];
      }
    });
  });
}
// ===============================================
// STATISTICS AND ANALYTICS FUNCTIONS
// ===============================================
/**
 * Get treatment statistics for dashboard
 */
function getTreatmentStatistics() {
  return __awaiter(this, void 0, void 0, function () {
    var user,
      treatmentPlansStats,
      proceduresStats,
      thisMonth,
      proceduresThisMonth,
      outcomes,
      procedureCounts,
      mostCommonProcedures,
      completedPlans,
      avgDuration;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _a.sent().data.user;
          if (!user) throw new Error("Usuário não autenticado");
          return [
            4 /*yield*/,
            supabase.from("treatment_plans").select("status").eq("provider_id", user.id),
          ];
        case 2:
          treatmentPlansStats = _a.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("procedures")
              .select("status, code, performed_datetime")
              .eq("provider_id", user.id),
          ];
        case 3:
          proceduresStats = _a.sent().data;
          thisMonth = new Date();
          thisMonth.setDate(1);
          return [
            4 /*yield*/,
            supabase
              .from("procedures")
              .select("id")
              .eq("provider_id", user.id)
              .gte("performed_datetime", thisMonth.toISOString()),
          ];
        case 4:
          proceduresThisMonth = _a.sent().data;
          return [
            4 /*yield*/,
            supabase
              .from("procedures")
              .select("outcome")
              .eq("provider_id", user.id)
              .not("outcome", "is", null),
          ];
        case 5:
          outcomes = _a.sent().data;
          procedureCounts = (proceduresStats || []).reduce(function (acc, proc) {
            var _a, _b, _c, _d, _e, _f;
            var code =
              ((_c =
                (_b = (_a = proc.code) === null || _a === void 0 ? void 0 : _a.coding) === null ||
                _b === void 0
                  ? void 0
                  : _b[0]) === null || _c === void 0
                ? void 0
                : _c.code) || "unknown";
            var display =
              ((_f =
                (_e = (_d = proc.code) === null || _d === void 0 ? void 0 : _d.coding) === null ||
                _e === void 0
                  ? void 0
                  : _e[0]) === null || _f === void 0
                ? void 0
                : _f.display) || "Procedimento não especificado";
            if (!acc[code]) {
              acc[code] = { code: code, display: display, count: 0 };
            }
            acc[code].count++;
            return acc;
          }, {});
          mostCommonProcedures = Object.values(procedureCounts)
            .sort(function (a, b) {
              return b.count - a.count;
            })
            .slice(0, 5);
          completedPlans = (treatmentPlansStats || []).filter(function (plan) {
            return plan.status === "completed";
          });
          avgDuration =
            completedPlans.length > 0
              ? completedPlans.reduce(function (acc, plan) {
                  // This would need period_start and period_end to calculate properly
                  return acc + 30; // Placeholder: 30 days average
                }, 0) / completedPlans.length
              : 0;
          return [
            2 /*return*/,
            {
              total_treatment_plans:
                (treatmentPlansStats === null || treatmentPlansStats === void 0
                  ? void 0
                  : treatmentPlansStats.length) || 0,
              active_treatment_plans:
                (treatmentPlansStats === null || treatmentPlansStats === void 0
                  ? void 0
                  : treatmentPlansStats.filter(function (p) {
                      return p.status === "active";
                    }).length) || 0,
              completed_treatment_plans:
                (treatmentPlansStats === null || treatmentPlansStats === void 0
                  ? void 0
                  : treatmentPlansStats.filter(function (p) {
                      return p.status === "completed";
                    }).length) || 0,
              total_procedures:
                (proceduresStats === null || proceduresStats === void 0
                  ? void 0
                  : proceduresStats.length) || 0,
              procedures_this_month:
                (proceduresThisMonth === null || proceduresThisMonth === void 0
                  ? void 0
                  : proceduresThisMonth.length) || 0,
              average_treatment_duration_days: Math.round(avgDuration),
              most_common_procedures: mostCommonProcedures,
              treatment_outcomes: {
                successful:
                  (outcomes === null || outcomes === void 0
                    ? void 0
                    : outcomes.filter(function (o) {
                        var _a, _b, _c;
                        return (
                          ((_c =
                            (_b =
                              (_a = o.outcome) === null || _a === void 0 ? void 0 : _a.coding) ===
                              null || _b === void 0
                              ? void 0
                              : _b[0]) === null || _c === void 0
                            ? void 0
                            : _c.code) === "successful"
                        );
                      }).length) || 0,
                partial:
                  (outcomes === null || outcomes === void 0
                    ? void 0
                    : outcomes.filter(function (o) {
                        var _a, _b, _c;
                        return (
                          ((_c =
                            (_b =
                              (_a = o.outcome) === null || _a === void 0 ? void 0 : _a.coding) ===
                              null || _b === void 0
                              ? void 0
                              : _b[0]) === null || _c === void 0
                            ? void 0
                            : _c.code) === "partial"
                        );
                      }).length) || 0,
                unsuccessful:
                  (outcomes === null || outcomes === void 0
                    ? void 0
                    : outcomes.filter(function (o) {
                        var _a, _b, _c;
                        return (
                          ((_c =
                            (_b =
                              (_a = o.outcome) === null || _a === void 0 ? void 0 : _a.coding) ===
                              null || _b === void 0
                              ? void 0
                              : _b[0]) === null || _c === void 0
                            ? void 0
                            : _c.code) === "unsuccessful"
                        );
                      }).length) || 0,
              },
            },
          ];
      }
    });
  });
}
/**
 * Delete treatment plan (soft delete by changing status)
 */
function deleteTreatmentPlan(id) {
  return __awaiter(this, void 0, void 0, function () {
    var user, error;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _a.sent().data.user;
          if (!user) throw new Error("Usuário não autenticado");
          return [
            4 /*yield*/,
            supabase
              .from("treatment_plans")
              .update({
                status: "entered-in-error",
                updated_by: user.id,
              })
              .eq("id", id),
          ];
        case 2:
          error = _a.sent().error;
          if (error) throw new Error("Erro ao excluir plano de tratamento: ".concat(error.message));
          return [2 /*return*/, true];
      }
    });
  });
}
/**
 * Delete procedure (soft delete by changing status)
 */
function deleteProcedure(id) {
  return __awaiter(this, void 0, void 0, function () {
    var user, error;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _a.sent().data.user;
          if (!user) throw new Error("Usuário não autenticado");
          return [
            4 /*yield*/,
            supabase
              .from("procedures")
              .update({
                status: "entered-in-error",
                updated_by: user.id,
              })
              .eq("id", id),
          ];
        case 2:
          error = _a.sent().error;
          if (error) throw new Error("Erro ao excluir procedimento: ".concat(error.message));
          return [2 /*return*/, true];
      }
    });
  });
}
/**
 * Delete clinical note (soft delete by changing status)
 */
function deleteClinicalNote(id) {
  return __awaiter(this, void 0, void 0, function () {
    var user, error;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, supabase.auth.getUser()];
        case 1:
          user = _a.sent().data.user;
          if (!user) throw new Error("Usuário não autenticado");
          return [
            4 /*yield*/,
            supabase
              .from("clinical_notes")
              .update({
                status: "entered-in-error",
                updated_by: user.id,
              })
              .eq("id", id),
          ];
        case 2:
          error = _a.sent().error;
          if (error) throw new Error("Erro ao excluir nota cl\u00EDnica: ".concat(error.message));
          return [2 /*return*/, true];
      }
    });
  });
}
