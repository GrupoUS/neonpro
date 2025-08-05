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
var professionals_1 = require("@/lib/supabase/professionals");
var server_1 = require("@/app/utils/supabase/server");
// Mock Supabase client
var mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
    then: jest.fn(),
  })),
};
jest.mock("@/app/utils/supabase/server", () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));
// Mock data
var mockProfessional = {
  id: "1",
  given_name: "Dr. Ana",
  family_name: "Silva",
  email: "ana.silva@email.com",
  phone_number: "(11) 99999-9999",
  birth_date: "1985-06-15",
  license_number: "CRM 123456",
  qualification: "Dermatologista",
  employment_status: "full_time",
  status: "active",
  bio: "Especialista em dermatologia estética",
  address: {
    line: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    postal_code: "01234-567",
    country: "BR",
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T00:00:00Z",
};
var mockCredential = {
  id: "cred-1",
  professional_id: "1",
  credential_type: "license",
  credential_number: "CRM 123456",
  issuing_authority: "Conselho Regional de Medicina",
  issue_date: "2010-06-15",
  expiry_date: "2030-06-15",
  verification_status: "verified",
  description: "Licença para prática médica",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};
var mockService = {
  id: "service-1",
  professional_id: "1",
  service_name: "Consulta Dermatológica",
  service_type: "consultation",
  description: "Consulta completa de dermatologia",
  duration_minutes: 60,
  base_price: 200.0,
  requires_certification: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};
var mockPerformanceMetric = {
  id: "metric-1",
  professional_id: "1",
  metric_type: "patient_satisfaction",
  metric_value: 4.8,
  measurement_period: "monthly",
  period_start: "2024-01-01",
  period_end: "2024-01-31",
  notes: "Excelente avaliação dos pacientes",
  created_at: "2024-02-01T00:00:00Z",
  updated_at: "2024-02-01T00:00:00Z",
};
describe("Professional Supabase Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("Professional Management", () => {
    describe("createProfessional", () => {
      it("should create a new professional successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockInsertResponse, professionalData, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockInsertResponse = { data: [mockProfessional], error: null };
                mockSupabaseClient.from().insert().single.mockResolvedValue(mockInsertResponse);
                professionalData = {
                  given_name: "Dr. Ana",
                  family_name: "Silva",
                  email: "ana.silva@email.com",
                  license_number: "CRM 123456",
                  qualification: "Dermatologista",
                };
                return [4 /*yield*/, (0, professionals_1.createProfessional)(professionalData)];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professionals");
                expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(professionalData);
                expect(result).toEqual(mockProfessional);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when creation fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockInsertResponse, professionalData;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Database error");
                mockInsertResponse = { data: null, error: mockError };
                mockSupabaseClient.from().insert().single.mockResolvedValue(mockInsertResponse);
                professionalData = {
                  given_name: "Dr. Ana",
                  family_name: "Silva",
                  email: "ana.silva@email.com",
                };
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.createProfessional)(professionalData)).rejects.toThrow(
                    "Database error",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
      it("should validate required fields", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var incompleteProfessionalData;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                incompleteProfessionalData = {
                  given_name: "Dr. Ana",
                  // Missing required fields
                };
                return [
                  4 /*yield*/,
                  expect(
                    (0, professionals_1.createProfessional)(incompleteProfessionalData),
                  ).rejects.toThrow(),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("updateProfessional", () => {
      it("should update professional successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockUpdateResponse, updateData, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockUpdateResponse = { data: [mockProfessional], error: null };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                updateData = {
                  given_name: "Dr. Ana Luiza",
                };
                return [4 /*yield*/, (0, professionals_1.updateProfessional)("1", updateData)];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professionals");
                expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(updateData);
                expect(mockSupabaseClient.from().update().eq).toHaveBeenCalledWith("id", "1");
                expect(result).toEqual(mockProfessional);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when update fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockUpdateResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Update failed");
                mockUpdateResponse = { data: null, error: mockError };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.updateProfessional)("1", {})).rejects.toThrow(
                    "Update failed",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when professional not found", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockUpdateResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockUpdateResponse = { data: null, error: null };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.updateProfessional)("999", {})).rejects.toThrow(
                    "Professional not found",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("deleteProfessional", () => {
      it("should delete professional successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockDeleteResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockDeleteResponse = { data: null, error: null };
                mockSupabaseClient.from().delete().eq.mockResolvedValue(mockDeleteResponse);
                return [4 /*yield*/, (0, professionals_1.deleteProfessional)("1")];
              case 1:
                _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professionals");
                expect(mockSupabaseClient.from().delete().eq).toHaveBeenCalledWith("id", "1");
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when deletion fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockDeleteResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Deletion failed");
                mockDeleteResponse = { data: null, error: mockError };
                mockSupabaseClient.from().delete().eq.mockResolvedValue(mockDeleteResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.deleteProfessional)("1")).rejects.toThrow(
                    "Deletion failed",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("getProfessionals", () => {
      it("should fetch all professionals successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockSelectResponse, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSelectResponse = { data: [mockProfessional], error: null };
                mockSupabaseClient.from().select().order.mockResolvedValue(mockSelectResponse);
                return [4 /*yield*/, (0, professionals_1.getProfessionals)()];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professionals");
                expect(mockSupabaseClient.from().select).toHaveBeenCalledWith("*");
                expect(result).toEqual([mockProfessional]);
                return [2 /*return*/];
            }
          });
        }));
      it("should filter professionals by status", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockSelectResponse, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSelectResponse = { data: [mockProfessional], error: null };
                mockSupabaseClient.from().select().eq().order.mockResolvedValue(mockSelectResponse);
                return [4 /*yield*/, (0, professionals_1.getProfessionals)({ status: "active" })];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith(
                  "status",
                  "active",
                );
                expect(result).toEqual([mockProfessional]);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when fetch fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockSelectResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Fetch failed");
                mockSelectResponse = { data: null, error: mockError };
                mockSupabaseClient.from().select().order.mockResolvedValue(mockSelectResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.getProfessionals)()).rejects.toThrow("Fetch failed"),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("getProfessionalById", () => {
      it("should fetch professional by ID successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockSelectResponse, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSelectResponse = { data: mockProfessional, error: null };
                mockSupabaseClient
                  .from()
                  .select()
                  .eq()
                  .single.mockResolvedValue(mockSelectResponse);
                return [4 /*yield*/, (0, professionals_1.getProfessionalById)("1")];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professionals");
                expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith("id", "1");
                expect(result).toEqual(mockProfessional);
                return [2 /*return*/];
            }
          });
        }));
      it("should return null when professional not found", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockSelectResponse, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSelectResponse = { data: null, error: null };
                mockSupabaseClient
                  .from()
                  .select()
                  .eq()
                  .single.mockResolvedValue(mockSelectResponse);
                return [4 /*yield*/, (0, professionals_1.getProfessionalById)("999")];
              case 1:
                result = _a.sent();
                expect(result).toBeNull();
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when fetch fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockSelectResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Fetch failed");
                mockSelectResponse = { data: null, error: mockError };
                mockSupabaseClient
                  .from()
                  .select()
                  .eq()
                  .single.mockResolvedValue(mockSelectResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.getProfessionalById)("1")).rejects.toThrow(
                    "Fetch failed",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("Credentials Management", () => {
    describe("getProfessionalCredentials", () => {
      it("should fetch credentials for professional", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockSelectResponse, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSelectResponse = { data: [mockCredential], error: null };
                mockSupabaseClient.from().select().eq().order.mockResolvedValue(mockSelectResponse);
                return [4 /*yield*/, (0, professionals_1.getProfessionalCredentials)("1")];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professional_credentials");
                expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith(
                  "professional_id",
                  "1",
                );
                expect(result).toEqual([mockCredential]);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when fetch fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockSelectResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Fetch failed");
                mockSelectResponse = { data: null, error: mockError };
                mockSupabaseClient.from().select().eq().order.mockResolvedValue(mockSelectResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.getProfessionalCredentials)("1")).rejects.toThrow(
                    "Fetch failed",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("createProfessionalCredential", () => {
      it("should create credential successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockInsertResponse, credentialData, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockInsertResponse = { data: [mockCredential], error: null };
                mockSupabaseClient.from().insert().single.mockResolvedValue(mockInsertResponse);
                credentialData = {
                  professional_id: "1",
                  credential_type: "license",
                  credential_number: "CRM 123456",
                  issuing_authority: "Conselho Regional de Medicina",
                };
                return [
                  4 /*yield*/,
                  (0, professionals_1.createProfessionalCredential)(credentialData),
                ];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professional_credentials");
                expect(result).toEqual(mockCredential);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when creation fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockInsertResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Creation failed");
                mockInsertResponse = { data: null, error: mockError };
                mockSupabaseClient.from().insert().single.mockResolvedValue(mockInsertResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.createProfessionalCredential)({})).rejects.toThrow(
                    "Creation failed",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("updateProfessionalCredential", () => {
      it("should update credential successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockUpdateResponse, updateData, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockUpdateResponse = { data: [mockCredential], error: null };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                updateData = {
                  verification_status: "verified",
                };
                return [
                  4 /*yield*/,
                  (0, professionals_1.updateProfessionalCredential)("cred-1", updateData),
                ];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professional_credentials");
                expect(result).toEqual(mockCredential);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when update fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockUpdateResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Update failed");
                mockUpdateResponse = { data: null, error: mockError };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                return [
                  4 /*yield*/,
                  expect(
                    (0, professionals_1.updateProfessionalCredential)("cred-1", {}),
                  ).rejects.toThrow("Update failed"),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("deleteProfessionalCredential", () => {
      it("should delete credential successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockDeleteResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockDeleteResponse = { data: null, error: null };
                mockSupabaseClient.from().delete().eq.mockResolvedValue(mockDeleteResponse);
                return [4 /*yield*/, (0, professionals_1.deleteProfessionalCredential)("cred-1")];
              case 1:
                _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professional_credentials");
                expect(mockSupabaseClient.from().delete().eq).toHaveBeenCalledWith("id", "cred-1");
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when deletion fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockDeleteResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Deletion failed");
                mockDeleteResponse = { data: null, error: mockError };
                mockSupabaseClient.from().delete().eq.mockResolvedValue(mockDeleteResponse);
                return [
                  4 /*yield*/,
                  expect(
                    (0, professionals_1.deleteProfessionalCredential)("cred-1"),
                  ).rejects.toThrow("Deletion failed"),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("verifyCredential", () => {
      it("should verify credential successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockUpdateResponse, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockUpdateResponse = {
                  data: [
                    __assign(__assign({}, mockCredential), { verification_status: "verified" }),
                  ],
                  error: null,
                };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                return [4 /*yield*/, (0, professionals_1.verifyCredential)("cred-1")];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professional_credentials");
                expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
                  verification_status: "verified",
                  verified_at: expect.any(String),
                });
                expect(result.verification_status).toBe("verified");
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when verification fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockUpdateResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Verification failed");
                mockUpdateResponse = { data: null, error: mockError };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.verifyCredential)("cred-1")).rejects.toThrow(
                    "Verification failed",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("Services Management", () => {
    describe("getProfessionalServices", () => {
      it("should fetch services for professional", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockSelectResponse, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSelectResponse = { data: [mockService], error: null };
                mockSupabaseClient.from().select().eq().order.mockResolvedValue(mockSelectResponse);
                return [4 /*yield*/, (0, professionals_1.getProfessionalServices)("1")];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professional_services");
                expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith(
                  "professional_id",
                  "1",
                );
                expect(result).toEqual([mockService]);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when fetch fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockSelectResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Fetch failed");
                mockSelectResponse = { data: null, error: mockError };
                mockSupabaseClient.from().select().eq().order.mockResolvedValue(mockSelectResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.getProfessionalServices)("1")).rejects.toThrow(
                    "Fetch failed",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("createProfessionalService", () => {
      it("should create service successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockInsertResponse, serviceData, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockInsertResponse = { data: [mockService], error: null };
                mockSupabaseClient.from().insert().single.mockResolvedValue(mockInsertResponse);
                serviceData = {
                  professional_id: "1",
                  service_name: "Consulta Dermatológica",
                  service_type: "consultation",
                  duration_minutes: 60,
                  base_price: 200.0,
                };
                return [4 /*yield*/, (0, professionals_1.createProfessionalService)(serviceData)];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professional_services");
                expect(result).toEqual(mockService);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when creation fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockInsertResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Creation failed");
                mockInsertResponse = { data: null, error: mockError };
                mockSupabaseClient.from().insert().single.mockResolvedValue(mockInsertResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.createProfessionalService)({})).rejects.toThrow(
                    "Creation failed",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("updateProfessionalService", () => {
      it("should update service successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockUpdateResponse, updateData, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockUpdateResponse = { data: [mockService], error: null };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                updateData = {
                  base_price: 250.0,
                };
                return [
                  4 /*yield*/,
                  (0, professionals_1.updateProfessionalService)("service-1", updateData),
                ];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professional_services");
                expect(result).toEqual(mockService);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when update fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockUpdateResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Update failed");
                mockUpdateResponse = { data: null, error: mockError };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                return [
                  4 /*yield*/,
                  expect(
                    (0, professionals_1.updateProfessionalService)("service-1", {}),
                  ).rejects.toThrow("Update failed"),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("deleteProfessionalService", () => {
      it("should delete service successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockDeleteResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockDeleteResponse = { data: null, error: null };
                mockSupabaseClient.from().delete().eq.mockResolvedValue(mockDeleteResponse);
                return [4 /*yield*/, (0, professionals_1.deleteProfessionalService)("service-1")];
              case 1:
                _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("professional_services");
                expect(mockSupabaseClient.from().delete().eq).toHaveBeenCalledWith(
                  "id",
                  "service-1",
                );
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when deletion fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockDeleteResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Deletion failed");
                mockDeleteResponse = { data: null, error: mockError };
                mockSupabaseClient.from().delete().eq.mockResolvedValue(mockDeleteResponse);
                return [
                  4 /*yield*/,
                  expect(
                    (0, professionals_1.deleteProfessionalService)("service-1"),
                  ).rejects.toThrow("Deletion failed"),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("Performance Metrics", () => {
    describe("getProfessionalPerformanceMetrics", () => {
      it("should fetch performance metrics for professional", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockSelectResponse, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSelectResponse = { data: [mockPerformanceMetric], error: null };
                mockSupabaseClient.from().select().eq().order.mockResolvedValue(mockSelectResponse);
                return [4 /*yield*/, (0, professionals_1.getProfessionalPerformanceMetrics)("1")];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("performance_metrics");
                expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith(
                  "professional_id",
                  "1",
                );
                expect(result).toEqual([mockPerformanceMetric]);
                return [2 /*return*/];
            }
          });
        }));
      it("should filter metrics by date range", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockSelectResponse, options, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockSelectResponse = { data: [mockPerformanceMetric], error: null };
                mockSupabaseClient
                  .from()
                  .select()
                  .eq()
                  .gte()
                  .lte()
                  .order.mockResolvedValue(mockSelectResponse);
                options = {
                  startDate: "2024-01-01",
                  endDate: "2024-01-31",
                };
                return [
                  4 /*yield*/,
                  (0, professionals_1.getProfessionalPerformanceMetrics)("1", options),
                ];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from().select().eq().gte).toHaveBeenCalledWith(
                  "period_start",
                  "2024-01-01",
                );
                expect(mockSupabaseClient.from().select().eq().gte().lte).toHaveBeenCalledWith(
                  "period_end",
                  "2024-01-31",
                );
                expect(result).toEqual([mockPerformanceMetric]);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when fetch fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockSelectResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Fetch failed");
                mockSelectResponse = { data: null, error: mockError };
                mockSupabaseClient.from().select().eq().order.mockResolvedValue(mockSelectResponse);
                return [
                  4 /*yield*/,
                  expect(
                    (0, professionals_1.getProfessionalPerformanceMetrics)("1"),
                  ).rejects.toThrow("Fetch failed"),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("addPerformanceMetric", () => {
      it("should add performance metric successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockInsertResponse, metricData, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockInsertResponse = { data: [mockPerformanceMetric], error: null };
                mockSupabaseClient.from().insert().single.mockResolvedValue(mockInsertResponse);
                metricData = {
                  professional_id: "1",
                  metric_type: "patient_satisfaction",
                  metric_value: 4.8,
                  measurement_period: "monthly",
                  period_start: "2024-01-01",
                  period_end: "2024-01-31",
                };
                return [4 /*yield*/, (0, professionals_1.addPerformanceMetric)(metricData)];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("performance_metrics");
                expect(result).toEqual(mockPerformanceMetric);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when creation fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockInsertResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Creation failed");
                mockInsertResponse = { data: null, error: mockError };
                mockSupabaseClient.from().insert().single.mockResolvedValue(mockInsertResponse);
                return [
                  4 /*yield*/,
                  expect((0, professionals_1.addPerformanceMetric)({})).rejects.toThrow(
                    "Creation failed",
                  ),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
    describe("updatePerformanceMetric", () => {
      it("should update performance metric successfully", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockUpdateResponse, updateData, result;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockUpdateResponse = { data: [mockPerformanceMetric], error: null };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                updateData = {
                  metric_value: 4.9,
                };
                return [
                  4 /*yield*/,
                  (0, professionals_1.updatePerformanceMetric)("metric-1", updateData),
                ];
              case 1:
                result = _a.sent();
                expect(mockSupabaseClient.from).toHaveBeenCalledWith("performance_metrics");
                expect(result).toEqual(mockPerformanceMetric);
                return [2 /*return*/];
            }
          });
        }));
      it("should throw error when update fails", () =>
        __awaiter(void 0, void 0, void 0, function () {
          var mockError, mockUpdateResponse;
          return __generator(this, (_a) => {
            switch (_a.label) {
              case 0:
                mockError = new Error("Update failed");
                mockUpdateResponse = { data: null, error: mockError };
                mockSupabaseClient
                  .from()
                  .update()
                  .eq()
                  .single.mockResolvedValue(mockUpdateResponse);
                return [
                  4 /*yield*/,
                  expect(
                    (0, professionals_1.updatePerformanceMetric)("metric-1", {}),
                  ).rejects.toThrow("Update failed"),
                ];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }));
    });
  });
  describe("Data Validation", () => {
    it("should validate professional data structure", () => {
      expect(mockProfessional).toHaveProperty("id");
      expect(mockProfessional).toHaveProperty("given_name");
      expect(mockProfessional).toHaveProperty("family_name");
      expect(mockProfessional).toHaveProperty("email");
      expect(mockProfessional).toHaveProperty("license_number");
      expect(mockProfessional).toHaveProperty("qualification");
      expect(mockProfessional).toHaveProperty("status");
    });
    it("should validate credential data structure", () => {
      expect(mockCredential).toHaveProperty("id");
      expect(mockCredential).toHaveProperty("professional_id");
      expect(mockCredential).toHaveProperty("credential_type");
      expect(mockCredential).toHaveProperty("credential_number");
      expect(mockCredential).toHaveProperty("issuing_authority");
      expect(mockCredential).toHaveProperty("verification_status");
    });
    it("should validate service data structure", () => {
      expect(mockService).toHaveProperty("id");
      expect(mockService).toHaveProperty("professional_id");
      expect(mockService).toHaveProperty("service_name");
      expect(mockService).toHaveProperty("service_type");
      expect(mockService).toHaveProperty("duration_minutes");
      expect(mockService).toHaveProperty("base_price");
    });
    it("should validate performance metric data structure", () => {
      expect(mockPerformanceMetric).toHaveProperty("id");
      expect(mockPerformanceMetric).toHaveProperty("professional_id");
      expect(mockPerformanceMetric).toHaveProperty("metric_type");
      expect(mockPerformanceMetric).toHaveProperty("metric_value");
      expect(mockPerformanceMetric).toHaveProperty("measurement_period");
    });
  });
  describe("Error Handling", () => {
    it("should handle database connection errors", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockError;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockError = new Error("Connection failed");
              server_1.createClient.mockImplementation(() => {
                throw mockError;
              });
              return [
                4 /*yield*/,
                expect((0, professionals_1.getProfessionals)()).rejects.toThrow(
                  "Connection failed",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should handle malformed data gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var malformedData;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              malformedData = {
                // Missing required fields
                given_name: null,
                email: "invalid-email",
              };
              return [
                4 /*yield*/,
                expect((0, professionals_1.createProfessional)(malformedData)).rejects.toThrow(),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
    it("should handle concurrent update conflicts", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockError, mockUpdateResponse;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockError = new Error("Conflict: Resource was modified");
              mockUpdateResponse = { data: null, error: mockError };
              mockSupabaseClient.from().update().eq().single.mockResolvedValue(mockUpdateResponse);
              return [
                4 /*yield*/,
                expect((0, professionals_1.updateProfessional)("1", {})).rejects.toThrow(
                  "Conflict: Resource was modified",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }));
  });
  describe("Performance", () => {
    it("should handle large datasets efficiently", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var largeProfessionalSet, mockSelectResponse, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              largeProfessionalSet = Array.from({ length: 1000 }, (_, i) =>
                __assign(__assign({}, mockProfessional), {
                  id: "".concat(i + 1),
                  email: "professional".concat(i + 1, "@email.com"),
                }),
              );
              mockSelectResponse = { data: largeProfessionalSet, error: null };
              mockSupabaseClient.from().select().order.mockResolvedValue(mockSelectResponse);
              return [4 /*yield*/, (0, professionals_1.getProfessionals)()];
            case 1:
              result = _a.sent();
              expect(result).toHaveLength(1000);
              expect(mockSupabaseClient.from().select).toHaveBeenCalledWith("*");
              return [2 /*return*/];
          }
        });
      }));
    it("should implement pagination for large result sets", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockSelectResponse, options;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSelectResponse = { data: [mockProfessional], error: null };
              mockSupabaseClient
                .from()
                .select()
                .order()
                .limit.mockResolvedValue(mockSelectResponse);
              options = {
                limit: 50,
                offset: 0,
              };
              return [4 /*yield*/, (0, professionals_1.getProfessionals)(options)];
            case 1:
              _a.sent();
              expect(mockSupabaseClient.from().select().order().limit).toHaveBeenCalledWith(50);
              return [2 /*return*/];
          }
        });
      }));
    it("should optimize queries with selective field retrieval", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockSelectResponse, options;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSelectResponse = { data: [mockProfessional], error: null };
              mockSupabaseClient.from().select().order.mockResolvedValue(mockSelectResponse);
              options = {
                fields: "id,given_name,family_name,email,status",
              };
              return [4 /*yield*/, (0, professionals_1.getProfessionals)(options)];
            case 1:
              _a.sent();
              expect(mockSupabaseClient.from().select).toHaveBeenCalledWith(
                "id,given_name,family_name,email,status",
              );
              return [2 /*return*/];
          }
        });
      }));
  });
});
