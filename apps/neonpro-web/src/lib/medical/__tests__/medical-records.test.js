"use strict";
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
var vitest_1 = require("vitest");
var medical_records_1 = require("../medical-records");
// Mock Supabase
var mockSupabase = {
  from: vitest_1.vi.fn(function () {
    return {
      select: vitest_1.vi.fn(function () {
        return {
          eq: vitest_1.vi.fn(function () {
            return {
              order: vitest_1.vi.fn(function () {
                return {
                  data: [],
                  error: null,
                };
              }),
            };
          }),
        };
      }),
      insert: vitest_1.vi.fn(function () {
        return {
          select: vitest_1.vi.fn(function () {
            return {
              single: vitest_1.vi.fn(function () {
                return {
                  data: null,
                  error: null,
                };
              }),
            };
          }),
        };
      }),
      update: vitest_1.vi.fn(function () {
        return {
          eq: vitest_1.vi.fn(function () {
            return {
              select: vitest_1.vi.fn(function () {
                return {
                  single: vitest_1.vi.fn(function () {
                    return {
                      data: null,
                      error: null,
                    };
                  }),
                };
              }),
            };
          }),
        };
      }),
      delete: vitest_1.vi.fn(function () {
        return {
          eq: vitest_1.vi.fn(function () {
            return {
              data: null,
              error: null,
            };
          }),
        };
      }),
    };
  }),
  storage: {
    from: vitest_1.vi.fn(function () {
      return {
        upload: vitest_1.vi.fn(function () {
          return {
            data: { path: "test-path" },
            error: null,
          };
        }),
        download: vitest_1.vi.fn(function () {
          return {
            data: new Blob(["test"]),
            error: null,
          };
        }),
        remove: vitest_1.vi.fn(function () {
          return {
            data: null,
            error: null,
          };
        }),
      };
    }),
  },
};
// Mock dependencies
vitest_1.vi.mock("@/lib/supabase", function () {
  return {
    supabase: mockSupabase,
  };
});
vitest_1.vi.mock("@/lib/audit/audit-logger", function () {
  return {
    AuditLogger: {
      log: vitest_1.vi.fn(),
    },
  };
});
vitest_1.vi.mock("@/lib/lgpd/lgpd-manager", function () {
  return {
    LGPDManager: {
      logDataProcessing: vitest_1.vi.fn(),
      checkDataRetention: vitest_1.vi.fn(),
    },
  };
});
(0, vitest_1.describe)("MedicalRecordsManager", function () {
  var manager;
  var mockPatientId = "patient-123";
  var mockClinicId = "clinic-456";
  var mockUserId = "user-789";
  (0, vitest_1.beforeEach)(function () {
    manager = new medical_records_1.MedicalRecordsManager();
    vitest_1.vi.clearAllMocks();
  });
  (0, vitest_1.afterEach)(function () {
    vitest_1.vi.resetAllMocks();
  });
  (0, vitest_1.describe)("Medical Records", function () {
    var mockMedicalRecord = {
      id: "record-1",
      patientId: mockPatientId,
      clinicId: mockClinicId,
      type: "consultation",
      title: "Consulta de Rotina",
      content: "Paciente apresenta bom estado geral",
      status: "active",
      priority: "normal",
      tags: ["rotina", "checkup"],
      attachments: [],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: mockUserId,
      version: 1,
      isDeleted: false,
    };
    (0, vitest_1.describe)("createMedicalRecord", function () {
      (0, vitest_1.it)("should create a medical record successfully", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var createData, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                createData = {
                  patientId: mockPatientId,
                  clinicId: mockClinicId,
                  type: "consultation",
                  title: "Nova Consulta",
                  content: "Conteúdo da consulta",
                  priority: "normal",
                  tags: ["consulta"],
                  metadata: {},
                };
                mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                  data: mockMedicalRecord,
                  error: null,
                });
                return [4 /*yield*/, manager.createMedicalRecord(createData, mockUserId)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockMedicalRecord);
                (0, vitest_1.expect)(mockSupabase.from).toHaveBeenCalledWith("medical_records");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should handle creation errors", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var createData, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                createData = {
                  patientId: mockPatientId,
                  clinicId: mockClinicId,
                  type: "consultation",
                  title: "Nova Consulta",
                  content: "Conteúdo da consulta",
                  priority: "normal",
                  tags: [],
                  metadata: {},
                };
                mockSupabase
                  .from()
                  .insert()
                  .select()
                  .single.mockResolvedValueOnce({
                    data: null,
                    error: { message: "Database error" },
                  });
                return [4 /*yield*/, manager.createMedicalRecord(createData, mockUserId)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result.error).toBe("Database error");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should validate required fields", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var invalidData, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                invalidData = {
                  patientId: "",
                  clinicId: mockClinicId,
                  type: "consultation",
                  title: "",
                  content: "Conteúdo",
                  priority: "normal",
                  tags: [],
                  metadata: {},
                };
                return [4 /*yield*/, manager.createMedicalRecord(invalidData, mockUserId)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result.error).toContain("obrigatório");
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("getMedicalRecord", function () {
      (0, vitest_1.it)("should retrieve a medical record by id", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .order.mockResolvedValueOnce({
                    data: [mockMedicalRecord],
                    error: null,
                  });
                return [4 /*yield*/, manager.getMedicalRecord("record-1")];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockMedicalRecord);
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should handle record not found", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockSupabase.from().select().eq().order.mockResolvedValueOnce({
                  data: [],
                  error: null,
                });
                return [4 /*yield*/, manager.getMedicalRecord("nonexistent")];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result.error).toBe("Registro médico não encontrado");
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("updateMedicalRecord", function () {
      (0, vitest_1.it)("should update a medical record successfully", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var updateData, updatedRecord, result;
          var _a, _b;
          return __generator(this, function (_c) {
            switch (_c.label) {
              case 0:
                updateData = {
                  title: "Título Atualizado",
                  content: "Conteúdo atualizado",
                  tags: ["atualizado"],
                };
                updatedRecord = __assign(__assign(__assign({}, mockMedicalRecord), updateData), {
                  version: 2,
                });
                mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
                  data: updatedRecord,
                  error: null,
                });
                return [
                  4 /*yield*/,
                  manager.updateMedicalRecord("record-1", updateData, mockUserId),
                ];
              case 1:
                result = _c.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(
                  (_a = result.data) === null || _a === void 0 ? void 0 : _a.title,
                ).toBe("Título Atualizado");
                (0, vitest_1.expect)(
                  (_b = result.data) === null || _b === void 0 ? void 0 : _b.version,
                ).toBe(2);
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should handle update errors", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var updateData, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                updateData = {
                  title: "Título Atualizado",
                };
                mockSupabase
                  .from()
                  .update()
                  .eq()
                  .select()
                  .single.mockResolvedValueOnce({
                    data: null,
                    error: { message: "Update failed" },
                  });
                return [
                  4 /*yield*/,
                  manager.updateMedicalRecord("record-1", updateData, mockUserId),
                ];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result.error).toBe("Update failed");
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("deleteMedicalRecord", function () {
      (0, vitest_1.it)("should soft delete a medical record", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .update()
                  .eq()
                  .select()
                  .single.mockResolvedValueOnce({
                    data: __assign(__assign({}, mockMedicalRecord), { isDeleted: true }),
                    error: null,
                  });
                return [4 /*yield*/, manager.deleteMedicalRecord("record-1", mockUserId)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(mockSupabase.from().update).toHaveBeenCalledWith(
                  vitest_1.expect.objectContaining({ isDeleted: true }),
                );
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("getPatientMedicalRecords", function () {
      (0, vitest_1.it)("should retrieve all medical records for a patient", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockRecords, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockRecords = [mockMedicalRecord];
                mockSupabase.from().select().eq().order.mockResolvedValueOnce({
                  data: mockRecords,
                  error: null,
                });
                return [4 /*yield*/, manager.getPatientMedicalRecords(mockPatientId)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockRecords);
                (0, vitest_1.expect)(mockSupabase.from().select().eq).toHaveBeenCalledWith(
                  "patient_id",
                  mockPatientId,
                );
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should filter by type when specified", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockRecords, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockRecords = [mockMedicalRecord];
                mockSupabase.from().select().eq().order.mockResolvedValueOnce({
                  data: mockRecords,
                  error: null,
                });
                return [
                  4 /*yield*/,
                  manager.getPatientMedicalRecords(mockPatientId, {
                    type: "consultation",
                  }),
                ];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockRecords);
                return [2 /*return*/];
            }
          });
        });
      });
    });
  });
  (0, vitest_1.describe)("Medical History", function () {
    var mockMedicalHistory = {
      id: "history-1",
      patientId: mockPatientId,
      clinicId: mockClinicId,
      category: "allergy",
      subcategory: "medication",
      title: "Alergia a Penicilina",
      description: "Paciente apresenta alergia severa à penicilina",
      severity: "high",
      status: "active",
      startDate: new Date("2020-01-01"),
      endDate: null,
      tags: ["alergia", "medicamento"],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: mockUserId,
      isDeleted: false,
    };
    (0, vitest_1.describe)("createMedicalHistory", function () {
      (0, vitest_1.it)("should create medical history successfully", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var createData, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                createData = {
                  patientId: mockPatientId,
                  clinicId: mockClinicId,
                  category: "allergy",
                  subcategory: "medication",
                  title: "Nova Alergia",
                  description: "Descrição da alergia",
                  severity: "medium",
                  status: "active",
                  startDate: new Date(),
                  tags: ["alergia"],
                  metadata: {},
                };
                mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                  data: mockMedicalHistory,
                  error: null,
                });
                return [4 /*yield*/, manager.createMedicalHistory(createData, mockUserId)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockMedicalHistory);
                (0, vitest_1.expect)(mockSupabase.from).toHaveBeenCalledWith("medical_history");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should validate required fields for medical history", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var invalidData, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                invalidData = {
                  patientId: "",
                  clinicId: mockClinicId,
                  category: "allergy",
                  title: "",
                  description: "Descrição",
                  severity: "medium",
                  status: "active",
                  startDate: new Date(),
                  tags: [],
                  metadata: {},
                };
                return [4 /*yield*/, manager.createMedicalHistory(invalidData, mockUserId)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result.error).toContain("obrigatório");
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("getMedicalHistory", function () {
      (0, vitest_1.it)("should retrieve medical history by id", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .order.mockResolvedValueOnce({
                    data: [mockMedicalHistory],
                    error: null,
                  });
                return [4 /*yield*/, manager.getMedicalHistory("history-1")];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockMedicalHistory);
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("getPatientMedicalHistory", function () {
      (0, vitest_1.it)("should retrieve all medical history for a patient", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockHistories, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockHistories = [mockMedicalHistory];
                mockSupabase.from().select().eq().order.mockResolvedValueOnce({
                  data: mockHistories,
                  error: null,
                });
                return [4 /*yield*/, manager.getPatientMedicalHistory(mockPatientId)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockHistories);
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should filter by category when specified", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockHistories, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockHistories = [mockMedicalHistory];
                mockSupabase.from().select().eq().order.mockResolvedValueOnce({
                  data: mockHistories,
                  error: null,
                });
                return [
                  4 /*yield*/,
                  manager.getPatientMedicalHistory(mockPatientId, {
                    category: "allergy",
                  }),
                ];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockHistories);
                return [2 /*return*/];
            }
          });
        });
      });
    });
  });
  (0, vitest_1.describe)("Attachments", function () {
    var mockAttachment = {
      id: "attachment-1",
      recordId: "record-1",
      fileName: "test-file.pdf",
      originalName: "Test File.pdf",
      mimeType: "application/pdf",
      fileSize: 1024,
      filePath: "medical/attachments/test-file.pdf",
      category: "document",
      subcategory: "report",
      description: "Test document",
      tags: ["test"],
      metadata: {},
      uploadedAt: new Date(),
      uploadedBy: mockUserId,
      isDeleted: false,
    };
    (0, vitest_1.describe)("uploadAttachment", function () {
      (0, vitest_1.it)("should upload attachment successfully", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockFile, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
                mockSupabase.storage.from().upload.mockResolvedValueOnce({
                  data: { path: "medical/attachments/test.pdf" },
                  error: null,
                });
                mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                  data: mockAttachment,
                  error: null,
                });
                return [
                  4 /*yield*/,
                  manager.uploadAttachment(
                    "record-1",
                    mockFile,
                    {
                      category: "document",
                      subcategory: "report",
                      description: "Test document",
                      tags: ["test"],
                    },
                    mockUserId,
                  ),
                ];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockAttachment);
                (0, vitest_1.expect)(mockSupabase.storage.from).toHaveBeenCalledWith(
                  "medical-attachments",
                );
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should handle upload errors", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockFile, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockFile = new File(["test content"], "test.pdf", { type: "application/pdf" });
                mockSupabase.storage.from().upload.mockResolvedValueOnce({
                  data: null,
                  error: { message: "Upload failed" },
                });
                return [
                  4 /*yield*/,
                  manager.uploadAttachment(
                    "record-1",
                    mockFile,
                    {
                      category: "document",
                      description: "Test document",
                    },
                    mockUserId,
                  ),
                ];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result.error).toBe("Upload failed");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should validate file size", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var largeFile, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.pdf", {
                  type: "application/pdf",
                });
                return [
                  4 /*yield*/,
                  manager.uploadAttachment(
                    "record-1",
                    largeFile,
                    {
                      category: "document",
                      description: "Large document",
                    },
                    mockUserId,
                  ),
                ];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result.error).toContain("muito grande");
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should validate file type", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var invalidFile, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                invalidFile = new File(["test"], "test.exe", { type: "application/x-executable" });
                return [
                  4 /*yield*/,
                  manager.uploadAttachment(
                    "record-1",
                    invalidFile,
                    {
                      category: "document",
                      description: "Invalid file",
                    },
                    mockUserId,
                  ),
                ];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result.error).toContain("não permitido");
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("getAttachment", function () {
      (0, vitest_1.it)("should retrieve attachment by id", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .order.mockResolvedValueOnce({
                    data: [mockAttachment],
                    error: null,
                  });
                return [4 /*yield*/, manager.getAttachment("attachment-1")];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockAttachment);
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("downloadAttachment", function () {
      (0, vitest_1.it)("should download attachment successfully", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockBlob, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockBlob = new Blob(["test content"], { type: "application/pdf" });
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .order.mockResolvedValueOnce({
                    data: [mockAttachment],
                    error: null,
                  });
                mockSupabase.storage.from().download.mockResolvedValueOnce({
                  data: mockBlob,
                  error: null,
                });
                return [4 /*yield*/, manager.downloadAttachment("attachment-1")];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockBlob);
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should handle download errors", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .order.mockResolvedValueOnce({
                    data: [mockAttachment],
                    error: null,
                  });
                mockSupabase.storage.from().download.mockResolvedValueOnce({
                  data: null,
                  error: { message: "Download failed" },
                });
                return [4 /*yield*/, manager.downloadAttachment("attachment-1")];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(false);
                (0, vitest_1.expect)(result.error).toBe("Download failed");
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("deleteAttachment", function () {
      (0, vitest_1.it)("should delete attachment successfully", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .order.mockResolvedValueOnce({
                    data: [mockAttachment],
                    error: null,
                  });
                mockSupabase.storage.from().remove.mockResolvedValueOnce({
                  data: null,
                  error: null,
                });
                mockSupabase
                  .from()
                  .update()
                  .eq()
                  .select()
                  .single.mockResolvedValueOnce({
                    data: __assign(__assign({}, mockAttachment), { isDeleted: true }),
                    error: null,
                  });
                return [4 /*yield*/, manager.deleteAttachment("attachment-1", mockUserId)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(mockSupabase.storage.from().remove).toHaveBeenCalled();
                return [2 /*return*/];
            }
          });
        });
      });
    });
  });
  (0, vitest_1.describe)("Search and Analytics", function () {
    (0, vitest_1.describe)("searchMedicalRecords", function () {
      (0, vitest_1.it)("should search medical records by query", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockRecords, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockRecords = [
                  {
                    id: "record-1",
                    patientId: mockPatientId,
                    title: "Consulta de Rotina",
                    content: "Paciente apresenta bom estado geral",
                    type: "consultation",
                    status: "active",
                    createdAt: new Date(),
                    rank: 0.5,
                  },
                ];
                mockSupabase.from().select().eq().order.mockResolvedValueOnce({
                  data: mockRecords,
                  error: null,
                });
                return [
                  4 /*yield*/,
                  manager.searchMedicalRecords({
                    query: "consulta",
                    patientId: mockPatientId,
                  }),
                ];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockRecords);
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should handle search with filters", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockRecords, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockRecords = [];
                mockSupabase.from().select().eq().order.mockResolvedValueOnce({
                  data: mockRecords,
                  error: null,
                });
                return [
                  4 /*yield*/,
                  manager.searchMedicalRecords({
                    query: "test",
                    patientId: mockPatientId,
                    type: "consultation",
                    status: "active",
                    dateFrom: new Date("2024-01-01"),
                    dateTo: new Date("2024-12-31"),
                    limit: 10,
                  }),
                ];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toEqual(mockRecords);
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("getPatientSummary", function () {
      (0, vitest_1.it)("should generate patient summary", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockSummary, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockSummary = {
                  totalRecords: 5,
                  totalHistory: 3,
                  totalAttachments: 2,
                  recentRecords: [],
                  activeConditions: [],
                  allergies: [],
                  medications: [],
                  lastUpdated: new Date(),
                };
                // Mock multiple database calls
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .order.mockResolvedValueOnce({ data: [], error: null }) // records
                  .mockResolvedValueOnce({ data: [], error: null }) // history
                  .mockResolvedValueOnce({ data: [], error: null }) // attachments
                  .mockResolvedValueOnce({ data: [], error: null }) // recent records
                  .mockResolvedValueOnce({ data: [], error: null }) // active conditions
                  .mockResolvedValueOnce({ data: [], error: null }) // allergies
                  .mockResolvedValueOnce({ data: [], error: null }); // medications
                return [4 /*yield*/, manager.getPatientSummary(mockPatientId)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result.success).toBe(true);
                (0, vitest_1.expect)(result.data).toHaveProperty("totalRecords");
                (0, vitest_1.expect)(result.data).toHaveProperty("totalHistory");
                (0, vitest_1.expect)(result.data).toHaveProperty("totalAttachments");
                return [2 /*return*/];
            }
          });
        });
      });
    });
  });
  (0, vitest_1.describe)("Utility Methods", function () {
    (0, vitest_1.describe)("generateThumbnail", function () {
      (0, vitest_1.it)("should generate thumbnail for image files", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockImageFile, mockCanvas, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockImageFile = new File(["fake image data"], "test.jpg", { type: "image/jpeg" });
                mockCanvas = {
                  getContext: vitest_1.vi.fn(function () {
                    return {
                      drawImage: vitest_1.vi.fn(),
                      canvas: {
                        toBlob: vitest_1.vi.fn(function (callback) {
                          return callback(new Blob(["thumbnail"], { type: "image/jpeg" }));
                        }),
                      },
                    };
                  }),
                  width: 0,
                  height: 0,
                };
                global.HTMLCanvasElement = vitest_1.vi.fn(function () {
                  return mockCanvas;
                });
                global.Image = vitest_1.vi.fn(function () {
                  return {
                    onload: null,
                    onerror: null,
                    src: "",
                  };
                });
                return [4 /*yield*/, manager.generateThumbnail(mockImageFile)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result).toBeInstanceOf(Blob);
                return [2 /*return*/];
            }
          });
        });
      });
      (0, vitest_1.it)("should return null for non-image files", function () {
        return __awaiter(void 0, void 0, void 0, function () {
          var mockPdfFile, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                mockPdfFile = new File(["pdf content"], "test.pdf", { type: "application/pdf" });
                return [4 /*yield*/, manager.generateThumbnail(mockPdfFile)];
              case 1:
                result = _a.sent();
                (0, vitest_1.expect)(result).toBeNull();
                return [2 /*return*/];
            }
          });
        });
      });
    });
    (0, vitest_1.describe)("validateFileType", function () {
      (0, vitest_1.it)("should validate allowed file types", function () {
        (0, vitest_1.expect)(manager.validateFileType("image/jpeg")).toBe(true);
        (0, vitest_1.expect)(manager.validateFileType("application/pdf")).toBe(true);
        (0, vitest_1.expect)(manager.validateFileType("text/plain")).toBe(true);
        (0, vitest_1.expect)(manager.validateFileType("application/x-executable")).toBe(false);
        (0, vitest_1.expect)(manager.validateFileType("application/javascript")).toBe(false);
      });
    });
    (0, vitest_1.describe)("formatFileSize", function () {
      (0, vitest_1.it)("should format file sizes correctly", function () {
        (0, vitest_1.expect)(manager.formatFileSize(1024)).toBe("1.0 KB");
        (0, vitest_1.expect)(manager.formatFileSize(1048576)).toBe("1.0 MB");
        (0, vitest_1.expect)(manager.formatFileSize(1073741824)).toBe("1.0 GB");
        (0, vitest_1.expect)(manager.formatFileSize(500)).toBe("500 B");
      });
    });
  });
  (0, vitest_1.describe)("Error Handling", function () {
    (0, vitest_1.it)("should handle database connection errors", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockSupabase
                .from()
                .select()
                .eq()
                .order.mockRejectedValueOnce(new Error("Connection failed"));
              return [4 /*yield*/, manager.getMedicalRecord("record-1")];
            case 1:
              result = _a.sent();
              (0, vitest_1.expect)(result.success).toBe(false);
              (0, vitest_1.expect)(result.error).toContain("Connection failed");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should handle invalid input data", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidData, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              invalidData = null;
              return [4 /*yield*/, manager.createMedicalRecord(invalidData, mockUserId)];
            case 1:
              result = _a.sent();
              (0, vitest_1.expect)(result.success).toBe(false);
              (0, vitest_1.expect)(result.error).toContain("Dados inválidos");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should handle missing user ID", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var createData, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              createData = {
                patientId: mockPatientId,
                clinicId: mockClinicId,
                type: "consultation",
                title: "Test",
                content: "Content",
                priority: "normal",
                tags: [],
                metadata: {},
              };
              return [4 /*yield*/, manager.createMedicalRecord(createData, "")];
            case 1:
              result = _a.sent();
              (0, vitest_1.expect)(result.success).toBe(false);
              (0, vitest_1.expect)(result.error).toContain("obrigatório");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("Integration Tests", function () {
    (0, vitest_1.it)("should create record with attachment workflow", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var createData, mockRecord, recordResult, mockFile, mockAttachment, attachmentResult;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              createData = {
                patientId: mockPatientId,
                clinicId: mockClinicId,
                type: "consultation",
                title: "Consulta com Anexo",
                content: "Consulta que terá anexo",
                priority: "normal",
                tags: [],
                metadata: {},
              };
              mockRecord = __assign(__assign({ id: "record-1" }, createData), {
                status: "active",
                attachments: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: mockUserId,
                version: 1,
                isDeleted: false,
              });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: mockRecord,
                error: null,
              });
              return [4 /*yield*/, manager.createMedicalRecord(createData, mockUserId)];
            case 1:
              recordResult = _b.sent();
              (0, vitest_1.expect)(recordResult.success).toBe(true);
              mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });
              mockSupabase.storage.from().upload.mockResolvedValueOnce({
                data: { path: "medical/attachments/test.pdf" },
                error: null,
              });
              mockAttachment = {
                id: "attachment-1",
                recordId: "record-1",
                fileName: "test.pdf",
                originalName: "test.pdf",
                mimeType: "application/pdf",
                fileSize: 4,
                filePath: "medical/attachments/test.pdf",
                category: "document",
                uploadedAt: new Date(),
                uploadedBy: mockUserId,
                isDeleted: false,
              };
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: mockAttachment,
                error: null,
              });
              return [
                4 /*yield*/,
                manager.uploadAttachment(
                  "record-1",
                  mockFile,
                  { category: "document" },
                  mockUserId,
                ),
              ];
            case 2:
              attachmentResult = _b.sent();
              (0, vitest_1.expect)(attachmentResult.success).toBe(true);
              (0, vitest_1.expect)(
                (_a = attachmentResult.data) === null || _a === void 0 ? void 0 : _a.recordId,
              ).toBe("record-1");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should handle complete patient data retrieval", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var recordsResult, historyResult;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              // Mock all patient data
              mockSupabase
                .from()
                .select()
                .eq()
                .order.mockResolvedValueOnce({ data: [mockMedicalRecord], error: null }) // records
                .mockResolvedValueOnce({ data: [], error: null }); // history
              return [4 /*yield*/, manager.getPatientMedicalRecords(mockPatientId)];
            case 1:
              recordsResult = _a.sent();
              return [4 /*yield*/, manager.getPatientMedicalHistory(mockPatientId)];
            case 2:
              historyResult = _a.sent();
              (0, vitest_1.expect)(recordsResult.success).toBe(true);
              (0, vitest_1.expect)(historyResult.success).toBe(true);
              (0, vitest_1.expect)(recordsResult.data).toHaveLength(1);
              (0, vitest_1.expect)(historyResult.data).toHaveLength(0);
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
