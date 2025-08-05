/**
 * Supabase Patient Management Functions
 *
 * Provides FHIR-compliant database operations for patient management
 * with LGPD compliance and comprehensive audit logging.
 */
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
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
exports.PatientError = void 0;
exports.transformRegistrationToFHIR = transformRegistrationToFHIR;
exports.createPatient = createPatient;
exports.searchPatients = searchPatients;
exports.getPatientById = getPatientById;
exports.updatePatientConsent = updatePatientConsent;
exports.getPatientStats = getPatientStats;
var client_1 = require("@/lib/supabase/client");
// Error types for better error handling
var PatientError = /** @class */ ((_super) => {
  __extends(PatientError, _super);
  function PatientError(message, code, statusCode) {
    if (statusCode === void 0) {
      statusCode = 500;
    }
    var _this = _super.call(this, message) || this;
    _this.code = code;
    _this.statusCode = statusCode;
    _this.name = "PatientError";
    return _this;
  }
  return PatientError;
})(Error);
exports.PatientError = PatientError;
// Transform registration data to FHIR Patient resource
function transformRegistrationToFHIR(data, clinic_id, user_id) {
  var _a, _b, _c, _d, _e, _f, _g;
  var now = new Date().toISOString();
  // Build FHIR Patient resource
  var fhir_patient = {
    resourceType: "Patient",
    identifier: [
      {
        use: "official",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "MR",
              display: "Medical Record Number",
            },
          ],
          text: "Medical Record Number",
        },
        system: "".concat(process.env.NEXT_PUBLIC_SITE_URL, "/patients"),
        value: data.medical_record_number,
      },
    ],
    active: true,
    name: [
      {
        use: "official",
        family: data.family_name,
        given: data.given_names,
        text: "".concat(data.given_names.join(" "), " ").concat(data.family_name),
      },
    ],
    telecom: [
      {
        system: "phone",
        value: data.phone_primary,
        use: "mobile",
        rank: 1,
      },
    ],
    gender: data.gender,
    birthDate: data.birth_date,
    address: [
      {
        use: "home",
        type: "physical",
        line: data.address_line2 ? [data.address_line1, data.address_line2] : [data.address_line1],
        city: data.city,
        state: data.state,
        postalCode: data.postal_code,
        country: data.country || "BR",
      },
    ],
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0131",
                code: "EP",
                display: "Emergency contact person",
              },
            ],
            text: data.emergency_contact_relationship,
          },
        ],
        name: {
          text: data.emergency_contact_name,
        },
        telecom: [
          {
            system: "phone",
            value: data.emergency_contact_phone,
            use: "home",
          },
        ],
      },
    ],
  };
  // Add optional fields
  if (data.cpf) {
    (_a = fhir_patient.identifier) === null || _a === void 0
      ? void 0
      : _a.push({
          use: "official",
          type: {
            coding: [
              {
                system: "http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoDocumento",
                code: "CPF",
                display: "Cadastro de Pessoa Física",
              },
            ],
            text: "CPF",
          },
          system: "http://www.receita.fazenda.gov.br/cpf",
          value: data.cpf,
        });
  }
  if (data.rg) {
    (_b = fhir_patient.identifier) === null || _b === void 0
      ? void 0
      : _b.push({
          use: "official",
          type: {
            coding: [
              {
                system: "http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoDocumento",
                code: "RG",
                display: "Registro Geral",
              },
            ],
            text: "RG",
          },
          value: data.rg,
        });
  }
  if (data.email) {
    (_c = fhir_patient.telecom) === null || _c === void 0
      ? void 0
      : _c.push({
          system: "email",
          value: data.email,
          use: "home",
        });
  }
  if (data.phone_secondary) {
    (_d = fhir_patient.telecom) === null || _d === void 0
      ? void 0
      : _d.push({
          system: "phone",
          value: data.phone_secondary,
          use: "home",
          rank: 2,
        });
  }
  if (data.emergency_contact_email) {
    (_g =
      (_f = (_e = fhir_patient.contact) === null || _e === void 0 ? void 0 : _e[0]) === null ||
      _f === void 0
        ? void 0
        : _f.telecom) === null || _g === void 0
      ? void 0
      : _g.push({
          system: "email",
          value: data.emergency_contact_email,
          use: "home",
        });
  }
  if (data.marital_status) {
    fhir_patient.maritalStatus = {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
          code: data.marital_status.toUpperCase(),
          display: data.marital_status,
        },
      ],
      text: data.marital_status,
    };
  }
  if (data.preferred_language && data.preferred_language !== "pt-BR") {
    fhir_patient.communication = [
      {
        language: {
          coding: [
            {
              system: "urn:ietf:bcp:47",
              code: data.preferred_language,
            },
          ],
        },
        preferred: true,
      },
    ];
  }
  // Create patient record
  var patient = {
    clinic_id: clinic_id,
    medical_record_number: data.medical_record_number,
    fhir_data: fhir_patient,
    active: true,
    created_at: now,
    updated_at: now,
    created_by: user_id,
    updated_by: user_id,
  };
  // Create LGPD consents
  var consents = [];
  // General consent (required)
  if (data.lgpd_consent_general) {
    consents.push({
      consent_type: "explicit",
      purpose: "Healthcare service provision and medical record management",
      data_categories: [
        "demographics",
        "contact_information",
        "medical_history",
        "emergency_contacts",
      ],
      retention_period_years: 20, // Minimum for medical records in Brazil
      consent_date: now,
      is_active: true,
      legal_basis_article:
        "LGPD Article 11, Item I - Health data processing for healthcare provision",
      processing_details:
        "Patient data will be used for healthcare service provision, appointment scheduling, medical record management, and emergency contact purposes.",
      created_at: now,
      updated_at: now,
    });
  } // Marketing consent (optional)
  if (data.lgpd_consent_marketing) {
    consents.push({
      consent_type: "explicit",
      purpose: "Marketing communications and promotional materials",
      data_categories: ["contact_information", "demographics", "service_preferences"],
      retention_period_years: 5,
      consent_date: now,
      is_active: true,
      legal_basis_article: "LGPD Article 7, Item I - Explicit consent for marketing",
      processing_details:
        "Patient contact information will be used to send marketing communications, promotional materials, and service updates.",
      created_at: now,
      updated_at: now,
    });
  }
  // Research consent (optional)
  if (data.lgpd_consent_research) {
    consents.push({
      consent_type: "explicit",
      purpose: "Medical research and clinical studies (anonymized)",
      data_categories: ["medical_history", "demographics", "treatment_outcomes"],
      retention_period_years: 10,
      consent_date: now,
      is_active: true,
      legal_basis_article: "LGPD Article 7, Item I - Explicit consent for research",
      processing_details:
        "Anonymized patient data may be used for medical research and clinical studies to improve healthcare services.",
      created_at: now,
      updated_at: now,
    });
  }
  // Third-party sharing consent (optional)
  if (data.lgpd_consent_third_party) {
    consents.push({
      consent_type: "explicit",
      purpose: "Data sharing with healthcare partners and insurance providers",
      data_categories: ["medical_history", "demographics", "treatment_records"],
      retention_period_years: 5,
      consent_date: now,
      is_active: true,
      legal_basis_article: "LGPD Article 7, Item I - Explicit consent for third-party sharing",
      processing_details:
        "Patient data may be shared with healthcare partners, insurance providers, and other authorized third parties as necessary for care coordination.",
      created_at: now,
      updated_at: now,
    });
  }
  return { patient: patient, consents: consents };
}
// Create a new patient with LGPD consents
function createPatient(data, user_id) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      profile,
      profileError,
      _b,
      existingPatient,
      checkError,
      _c,
      patientData,
      consentData,
      _d,
      createdPatient_1,
      patientError,
      consentsWithPatientId,
      _e,
      createdConsents,
      consentError,
      error_1;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          return [4 /*yield*/, (0, client_1.createClient)()];
        case 1:
          supabase = _f.sent();
          _f.label = 2;
        case 2:
          _f.trys.push([2, 9, , 10]);
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user_id).single(),
          ];
        case 3:
          (_a = _f.sent()), (profile = _a.data), (profileError = _a.error);
          if (
            profileError ||
            !(profile === null || profile === void 0 ? void 0 : profile.clinic_id)
          ) {
            throw new PatientError("User clinic not found", "CLINIC_NOT_FOUND", 404);
          }
          return [
            4 /*yield*/,
            supabase
              .from("patients")
              .select("id")
              .eq("clinic_id", profile.clinic_id)
              .eq("medical_record_number", data.medical_record_number)
              .single(),
          ];
        case 4:
          (_b = _f.sent()), (existingPatient = _b.data), (checkError = _b.error);
          if (checkError && checkError.code !== "PGRST116") {
            throw new PatientError(
              "Database error checking medical record number",
              "DATABASE_ERROR",
            );
          }
          if (existingPatient) {
            throw new PatientError(
              "Medical record number already exists in this clinic",
              "DUPLICATE_MEDICAL_RECORD",
              409,
            );
          }
          (_c = transformRegistrationToFHIR(data, profile.clinic_id, user_id)),
            (patientData = _c.patient),
            (consentData = _c.consents);
          return [4 /*yield*/, supabase.from("patients").insert([patientData]).select().single()];
        case 5:
          (_d = _f.sent()), (createdPatient_1 = _d.data), (patientError = _d.error);
          if (patientError) {
            throw new PatientError(
              "Failed to create patient: ".concat(patientError.message),
              "PATIENT_CREATION_FAILED",
            );
          }
          consentsWithPatientId = consentData.map((consent) =>
            __assign(__assign({}, consent), { patient_id: createdPatient_1.id }),
          );
          return [
            4 /*yield*/,
            supabase.from("patient_consents").insert(consentsWithPatientId).select(),
          ];
        case 6:
          (_e = _f.sent()), (createdConsents = _e.data), (consentError = _e.error);
          if (!consentError) return [3 /*break*/, 8];
          // Rollback patient creation if consent creation fails
          return [4 /*yield*/, supabase.from("patients").delete().eq("id", createdPatient_1.id)];
        case 7:
          // Rollback patient creation if consent creation fails
          _f.sent();
          throw new PatientError(
            "Failed to create patient consents: ".concat(consentError.message),
            "CONSENT_CREATION_FAILED",
          );
        case 8:
          return [
            2 /*return*/,
            {
              patient: createdPatient_1,
              consents: createdConsents || [],
            },
          ];
        case 9:
          error_1 = _f.sent();
          if (error_1 instanceof PatientError) {
            throw error_1;
          }
          throw new PatientError(
            "Unexpected error creating patient: ".concat(
              error_1 instanceof Error ? error_1.message : "Unknown error",
            ),
            "UNEXPECTED_ERROR",
          );
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
// Search patients with filters and pagination
function searchPatients(params, user_id) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      profile,
      profileError,
      query,
      sortField,
      _b,
      patients,
      searchError,
      count,
      error_2;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, (0, client_1.createClient)()];
        case 1:
          supabase = _c.sent();
          _c.label = 2;
        case 2:
          _c.trys.push([2, 5, , 6]);
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user_id).single(),
          ];
        case 3:
          (_a = _c.sent()), (profile = _a.data), (profileError = _a.error);
          if (
            profileError ||
            !(profile === null || profile === void 0 ? void 0 : profile.clinic_id)
          ) {
            throw new PatientError("User clinic not found", "CLINIC_NOT_FOUND", 404);
          }
          query = supabase
            .from("patients")
            .select("\n        *,\n        consents_count:patient_consents(count)\n      ", {
              count: "exact",
            })
            .eq("clinic_id", profile.clinic_id);
          // Apply filters
          if (params.query) {
            // Search in patient name (FHIR data) and medical record number
            query = query.or(
              "medical_record_number.ilike.%"
                .concat(params.query, "%,fhir_data->>name.ilike.%")
                .concat(params.query, "%"),
            );
          }
          if (params.medical_record_number) {
            query = query.eq("medical_record_number", params.medical_record_number);
          }
          if (params.active !== undefined) {
            query = query.eq("active", params.active);
          }
          if (params.created_from) {
            query = query.gte("created_at", params.created_from);
          }
          if (params.created_to) {
            query = query.lte("created_at", params.created_to);
          }
          sortField = params.sort_by === "name" ? "fhir_data->name->0->>text" : params.sort_by;
          query = query.order(sortField, { ascending: params.sort_order === "asc" });
          // Apply pagination
          query = query.range(params.offset, params.offset + params.limit - 1);
          return [4 /*yield*/, query];
        case 4:
          (_b = _c.sent()), (patients = _b.data), (searchError = _b.error), (count = _b.count);
          if (searchError) {
            throw new PatientError(
              "Failed to search patients: ".concat(searchError.message),
              "SEARCH_FAILED",
            );
          }
          return [
            2 /*return*/,
            {
              patients: patients || [],
              total_count: count || 0,
              has_next_page: (count || 0) > params.offset + params.limit,
            },
          ];
        case 5:
          error_2 = _c.sent();
          if (error_2 instanceof PatientError) {
            throw error_2;
          }
          throw new PatientError(
            "Unexpected error searching patients: ".concat(
              error_2 instanceof Error ? error_2.message : "Unknown error",
            ),
            "UNEXPECTED_ERROR",
          );
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// Get patient by ID with full details
function getPatientById(patient_id, user_id) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, profile, profileError, _b, patient, patientError, error_3;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          return [4 /*yield*/, (0, client_1.createClient)()];
        case 1:
          supabase = _c.sent();
          _c.label = 2;
        case 2:
          _c.trys.push([2, 5, , 6]);
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", user_id).single(),
          ];
        case 3:
          (_a = _c.sent()), (profile = _a.data), (profileError = _a.error);
          if (
            profileError ||
            !(profile === null || profile === void 0 ? void 0 : profile.clinic_id)
          ) {
            throw new PatientError("User clinic not found", "CLINIC_NOT_FOUND", 404);
          }
          return [
            4 /*yield*/,
            supabase
              .from("patients")
              .select(
                "\n        *,\n        consents:patient_consents(*),\n        conditions:medical_conditions(*),\n        allergies:allergies_intolerances(*)\n      ",
              )
              .eq("id", patient_id)
              .eq("clinic_id", profile.clinic_id)
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (patient = _b.data), (patientError = _b.error);
          if (patientError) {
            if (patientError.code === "PGRST116") {
              return [2 /*return*/, null]; // Patient not found
            }
            throw new PatientError(
              "Failed to get patient: ".concat(patientError.message),
              "GET_PATIENT_FAILED",
            );
          }
          return [2 /*return*/, patient];
        case 5:
          error_3 = _c.sent();
          if (error_3 instanceof PatientError) {
            throw error_3;
          }
          throw new PatientError(
            "Unexpected error getting patient: ".concat(
              error_3 instanceof Error ? error_3.message : "Unknown error",
            ),
            "UNEXPECTED_ERROR",
          );
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// Update patient LGPD consent
function updatePatientConsent(patient_id, consent_id, updates, user_id) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, patient, _a, updatedConsent, updateError, error_4;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, (0, client_1.createClient)()];
        case 1:
          supabase = _b.sent();
          _b.label = 2;
        case 2:
          _b.trys.push([2, 5, , 6]);
          return [4 /*yield*/, getPatientById(patient_id, user_id)];
        case 3:
          patient = _b.sent();
          if (!patient) {
            throw new PatientError("Patient not found", "PATIENT_NOT_FOUND", 404);
          }
          return [
            4 /*yield*/,
            supabase
              .from("patient_consents")
              .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
              .eq("id", consent_id)
              .eq("patient_id", patient_id)
              .select()
              .single(),
          ];
        case 4:
          (_a = _b.sent()), (updatedConsent = _a.data), (updateError = _a.error);
          if (updateError) {
            throw new PatientError(
              "Failed to update consent: ".concat(updateError.message),
              "UPDATE_CONSENT_FAILED",
            );
          }
          return [2 /*return*/, updatedConsent];
        case 5:
          error_4 = _b.sent();
          if (error_4 instanceof PatientError) {
            throw error_4;
          }
          throw new PatientError(
            "Unexpected error updating consent: ".concat(
              error_4 instanceof Error ? error_4.message : "Unknown error",
            ),
            "UNEXPECTED_ERROR",
          );
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Get patient statistics for dashboard
 *
 * Returns aggregated statistics for patient management dashboard
 * including total patients, new patients, active patients, etc.
 */
function getPatientStats(clinicId) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      userError,
      activeClinicId,
      now,
      thirtyDaysAgo,
      sevenDaysFromNow,
      _b,
      totalPatients,
      totalError,
      firstDayOfMonth,
      _c,
      newPatients,
      newError,
      _d,
      activePatients,
      activeError,
      _e,
      scheduledAppointments,
      scheduledError,
      stats,
      error_5;
    var _f;
    return __generator(this, (_g) => {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 7, , 8]);
          return [4 /*yield*/, (0, client_1.createClient)()];
        case 1:
          supabase = _g.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _g.sent()), (user = _a.data.user), (userError = _a.error);
          if (userError || !user) {
            throw new PatientError("Authentication required", "AUTH_REQUIRED", 401);
          }
          activeClinicId =
            clinicId ||
            ((_f = user.user_metadata) === null || _f === void 0 ? void 0 : _f.clinic_id);
          if (!activeClinicId) {
            throw new PatientError("Clinic ID required", "CLINIC_ID_REQUIRED", 400);
          }
          now = new Date();
          thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          return [
            4 /*yield*/,
            supabase
              .from("patients")
              .select("*", { count: "exact", head: true })
              .eq("clinic_id", activeClinicId)
              .is("deleted_at", null),
          ];
        case 3:
          (_b = _g.sent()), (totalPatients = _b.count), (totalError = _b.error);
          if (totalError) {
            throw new PatientError(
              "Failed to get total patients: ".concat(totalError.message),
              "STATS_FETCH_FAILED",
            );
          }
          firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return [
            4 /*yield*/,
            supabase
              .from("patients")
              .select("*", { count: "exact", head: true })
              .eq("clinic_id", activeClinicId)
              .gte("created_at", firstDayOfMonth.toISOString())
              .is("deleted_at", null),
          ];
        case 4:
          (_c = _g.sent()), (newPatients = _c.count), (newError = _c.error);
          if (newError) {
            throw new PatientError(
              "Failed to get new patients: ".concat(newError.message),
              "STATS_FETCH_FAILED",
            );
          }
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select("patient_id", { count: "exact", head: true })
              .eq("clinic_id", activeClinicId)
              .gte("appointment_date", thirtyDaysAgo.toISOString())
              .is("deleted_at", null),
          ];
        case 5:
          (_d = _g.sent()), (activePatients = _d.count), (activeError = _d.error);
          if (activeError) {
            throw new PatientError(
              "Failed to get active patients: ".concat(activeError.message),
              "STATS_FETCH_FAILED",
            );
          }
          return [
            4 /*yield*/,
            supabase
              .from("appointments")
              .select("*", { count: "exact", head: true })
              .eq("clinic_id", activeClinicId)
              .gte("appointment_date", now.toISOString())
              .lte("appointment_date", sevenDaysFromNow.toISOString())
              .in("status", ["scheduled", "confirmed"])
              .is("deleted_at", null),
          ];
        case 6:
          (_e = _g.sent()), (scheduledAppointments = _e.count), (scheduledError = _e.error);
          if (scheduledError) {
            throw new PatientError(
              "Failed to get scheduled appointments: ".concat(scheduledError.message),
              "STATS_FETCH_FAILED",
            );
          }
          stats = {
            totalPatients: totalPatients || 0,
            newPatients: newPatients || 0,
            activePatients: activePatients || 0,
            scheduledAppointments: scheduledAppointments || 0,
          };
          return [
            2 /*return*/,
            {
              success: true,
              data: stats,
              message: "Patient statistics retrieved successfully",
            },
          ];
        case 7:
          error_5 = _g.sent();
          if (error_5 instanceof PatientError) {
            return [
              2 /*return*/,
              {
                success: false,
                error: error_5.message,
                code: error_5.code,
              },
            ];
          }
          return [
            2 /*return*/,
            {
              success: false,
              error: "Unexpected error getting patient statistics: ".concat(
                error_5 instanceof Error ? error_5.message : "Unknown error",
              ),
              code: "UNEXPECTED_ERROR",
            },
          ];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
