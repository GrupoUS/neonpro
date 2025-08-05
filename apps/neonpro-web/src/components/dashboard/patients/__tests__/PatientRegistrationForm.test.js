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
var react_1 = require("@testing-library/react");
var user_event_1 = require("@testing-library/user-event");
var client_1 = require("@/app/utils/supabase/client");
var PatientRegistrationForm_1 = require("../PatientRegistrationForm");
var sonner_1 = require("sonner");
// Mock dependencies
jest.mock("@/app/utils/supabase/client");
jest.mock("sonner");
var mockSupabase = {
  from: jest.fn(function () {
    return {
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
  }),
};
client_1.createClient.mockReturnValue(mockSupabase);
var mockOnSuccess = jest.fn();
var setup = function () {
  var user = user_event_1.default.setup();
  var utils = (0, react_1.render)(<PatientRegistrationForm_1.default onSuccess={mockOnSuccess} />);
  return __assign({ user: user }, utils);
};
describe("PatientRegistrationForm", function () {
  beforeEach(function () {
    jest.clearAllMocks();
    sonner_1.toast.success.mockClear();
    sonner_1.toast.error.mockClear();
  });
  describe("Rendering and Form Structure", function () {
    it("renders all required form sections", function () {
      setup();
      // Check main form sections exist
      expect(react_1.screen.getByText("Dados Pessoais")).toBeInTheDocument();
      expect(react_1.screen.getByText("Endereço")).toBeInTheDocument();
      expect(react_1.screen.getByText("Contato de Emergência")).toBeInTheDocument();
      expect(react_1.screen.getByText("Informações de Saúde")).toBeInTheDocument();
      expect(react_1.screen.getByText("Informações do Plano de Saúde")).toBeInTheDocument();
      expect(react_1.screen.getByText("Consentimentos LGPD")).toBeInTheDocument();
    });
    it("renders all personal data fields", function () {
      setup();
      expect(react_1.screen.getByLabelText("Nome Completo")).toBeInTheDocument();
      expect(react_1.screen.getByLabelText("CPF")).toBeInTheDocument();
      expect(react_1.screen.getByLabelText("RG")).toBeInTheDocument();
      expect(react_1.screen.getByLabelText("Data de Nascimento")).toBeInTheDocument();
      expect(react_1.screen.getByLabelText("Sexo")).toBeInTheDocument();
      expect(react_1.screen.getByLabelText("Telefone")).toBeInTheDocument();
      expect(react_1.screen.getByLabelText("Email")).toBeInTheDocument();
    });
    it("renders all LGPD consent checkboxes", function () {
      setup();
      expect(react_1.screen.getByText(/Dados básicos para cadastro/)).toBeInTheDocument();
      expect(react_1.screen.getByText(/Comunicação de marketing/)).toBeInTheDocument();
      expect(react_1.screen.getByText(/Comunicação de saúde/)).toBeInTheDocument();
      expect(react_1.screen.getByText(/Análise de tendências/)).toBeInTheDocument();
      expect(react_1.screen.getByText(/Pesquisas de satisfação/)).toBeInTheDocument();
    });
  });
  describe("LGPD Consent Management", function () {
    it("requires basic consent to submit form", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, submitButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              // Fill form without basic consent
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Nome Completo"), "João Silva"),
              ];
            case 1:
              // Fill form without basic consent
              _a.sent();
              return [4 /*yield*/, user.type(react_1.screen.getByLabelText("CPF"), "12345678901")];
            case 2:
              _a.sent();
              submitButton = react_1.screen.getByRole("button", { name: /cadastrar paciente/i });
              return [4 /*yield*/, user.click(submitButton)];
            case 3:
              _a.sent();
              // Form should not submit without basic consent
              expect(mockOnSuccess).not.toHaveBeenCalled();
              return [2 /*return*/];
          }
        });
      });
    });
    it("allows submission when basic consent is provided", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, basicConsentCheckbox, submitButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              // Fill required fields
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Nome Completo"), "João Silva"),
              ];
            case 1:
              // Fill required fields
              _a.sent();
              return [4 /*yield*/, user.type(react_1.screen.getByLabelText("CPF"), "12345678901")];
            case 2:
              _a.sent();
              basicConsentCheckbox = react_1.screen.getByRole("checkbox", {
                name: /Dados básicos para cadastro/,
              });
              return [4 /*yield*/, user.click(basicConsentCheckbox)];
            case 3:
              _a.sent();
              submitButton = react_1.screen.getByRole("button", { name: /cadastrar paciente/i });
              return [4 /*yield*/, user.click(submitButton)];
            case 4:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(mockSupabase.from).toHaveBeenCalled();
                }),
              ];
            case 5:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("properly handles optional consents", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, marketingCheckbox;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              marketingCheckbox = react_1.screen.getByRole("checkbox", {
                name: /Comunicação de marketing/,
              });
              return [4 /*yield*/, user.click(marketingCheckbox)];
            case 1:
              _a.sent();
              expect(marketingCheckbox).toBeChecked();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Field Validation", function () {
    it("validates CPF format", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, cpfInput;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              cpfInput = react_1.screen.getByLabelText("CPF");
              return [4 /*yield*/, user.type(cpfInput, "123")];
            case 1:
              _a.sent();
              return [4 /*yield*/, user.tab()];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText(/CPF deve ter 11 dígitos/)).toBeInTheDocument();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("validates email format", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, emailInput;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              emailInput = react_1.screen.getByLabelText("Email");
              return [4 /*yield*/, user.type(emailInput, "invalid-email")];
            case 1:
              _a.sent();
              return [4 /*yield*/, user.tab()];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText(/Email inválido/)).toBeInTheDocument();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("validates phone format", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, phoneInput;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              phoneInput = react_1.screen.getByLabelText("Telefone");
              return [4 /*yield*/, user.type(phoneInput, "123")];
            case 1:
              _a.sent();
              return [4 /*yield*/, user.tab()];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText(/Telefone inválido/)).toBeInTheDocument();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("validates birth date is not in future", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, tomorrow, tomorrowString, birthDateInput;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              tomorrowString = tomorrow.toISOString().split("T")[0];
              birthDateInput = react_1.screen.getByLabelText("Data de Nascimento");
              return [4 /*yield*/, user.type(birthDateInput, tomorrowString)];
            case 1:
              _a.sent();
              return [4 /*yield*/, user.tab()];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(
                    react_1.screen.getByText(/Data de nascimento não pode ser no futuro/),
                  ).toBeInTheDocument();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("validates CEP format", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, cepInput;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              cepInput = react_1.screen.getByLabelText("CEP");
              return [4 /*yield*/, user.type(cepInput, "123")];
            case 1:
              _a.sent();
              return [4 /*yield*/, user.tab()];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(react_1.screen.getByText(/CEP deve ter 8 dígitos/)).toBeInTheDocument();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("FHIR Compliance", function () {
    it("includes all required FHIR Patient resource fields", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              // Fill FHIR-required fields
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Nome Completo"), "João Silva Santos"),
              ];
            case 1:
              // Fill FHIR-required fields
              _a.sent();
              return [4 /*yield*/, user.type(react_1.screen.getByLabelText("CPF"), "12345678901")];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Data de Nascimento"), "1990-01-15"),
              ];
            case 3:
              _a.sent();
              return [
                4 /*yield*/,
                user.selectOptions(react_1.screen.getByLabelText("Sexo"), "male"),
              ];
            case 4:
              _a.sent();
              // Check that all FHIR identifier types are represented
              expect(react_1.screen.getByLabelText("CPF")).toBeInTheDocument(); // Brazilian national ID
              expect(react_1.screen.getByLabelText("RG")).toBeInTheDocument(); // State ID
              // Check address fields (FHIR Address resource)
              expect(react_1.screen.getByLabelText("CEP")).toBeInTheDocument();
              expect(react_1.screen.getByLabelText("Logradouro")).toBeInTheDocument();
              expect(react_1.screen.getByLabelText("Cidade")).toBeInTheDocument();
              expect(react_1.screen.getByLabelText("Estado")).toBeInTheDocument();
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles emergency contact as FHIR RelatedPerson", function () {
      setup();
      expect(react_1.screen.getByLabelText("Nome do Contato")).toBeInTheDocument();
      expect(react_1.screen.getByLabelText("Parentesco")).toBeInTheDocument();
      expect(react_1.screen.getByLabelText("Telefone do Contato")).toBeInTheDocument();
    });
  });
  describe("Form Submission", function () {
    var fillValidForm = function (user) {
      return __awaiter(void 0, void 0, void 0, function () {
        var basicConsentCheckbox;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Nome Completo"), "João Silva Santos"),
              ];
            case 1:
              _a.sent();
              return [4 /*yield*/, user.type(react_1.screen.getByLabelText("CPF"), "12345678901")];
            case 2:
              _a.sent();
              return [4 /*yield*/, user.type(react_1.screen.getByLabelText("RG"), "123456789")];
            case 3:
              _a.sent();
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Data de Nascimento"), "1990-01-15"),
              ];
            case 4:
              _a.sent();
              return [
                4 /*yield*/,
                user.selectOptions(react_1.screen.getByLabelText("Sexo"), "male"),
              ];
            case 5:
              _a.sent();
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Telefone"), "11987654321"),
              ];
            case 6:
              _a.sent();
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Email"), "joao@email.com"),
              ];
            case 7:
              _a.sent();
              // Address
              return [4 /*yield*/, user.type(react_1.screen.getByLabelText("CEP"), "01234567")];
            case 8:
              // Address
              _a.sent();
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Logradouro"), "Rua das Flores, 123"),
              ];
            case 9:
              _a.sent();
              return [4 /*yield*/, user.type(react_1.screen.getByLabelText("Cidade"), "São Paulo")];
            case 10:
              _a.sent();
              return [
                4 /*yield*/,
                user.selectOptions(react_1.screen.getByLabelText("Estado"), "SP"),
              ];
            case 11:
              _a.sent();
              // Emergency contact
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Nome do Contato"), "Maria Silva"),
              ];
            case 12:
              // Emergency contact
              _a.sent();
              return [
                4 /*yield*/,
                user.selectOptions(react_1.screen.getByLabelText("Parentesco"), "spouse"),
              ];
            case 13:
              _a.sent();
              return [
                4 /*yield*/,
                user.type(react_1.screen.getByLabelText("Telefone do Contato"), "11987654322"),
              ];
            case 14:
              _a.sent();
              basicConsentCheckbox = react_1.screen.getByRole("checkbox", {
                name: /Dados básicos para cadastro/,
              });
              return [4 /*yield*/, user.click(basicConsentCheckbox)];
            case 15:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    };
    it("successfully submits valid form", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, submitButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              return [4 /*yield*/, fillValidForm(user)];
            case 1:
              _a.sent();
              submitButton = react_1.screen.getByRole("button", { name: /cadastrar paciente/i });
              return [4 /*yield*/, user.click(submitButton)];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(mockSupabase.from).toHaveBeenCalledWith("patients");
                  expect(sonner_1.toast.success).toHaveBeenCalledWith(
                    "Paciente cadastrado com sucesso!",
                  );
                  expect(mockOnSuccess).toHaveBeenCalled();
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    it("shows loading state during submission", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, submitButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              // Mock slow submission
              mockSupabase.from.mockReturnValue({
                insert: jest.fn().mockImplementation(function () {
                  return new Promise(function (resolve) {
                    return setTimeout(function () {
                      return resolve({ data: null, error: null });
                    }, 100);
                  });
                }),
              });
              return [4 /*yield*/, fillValidForm(user)];
            case 1:
              _a.sent();
              submitButton = react_1.screen.getByRole("button", { name: /cadastrar paciente/i });
              return [4 /*yield*/, user.click(submitButton)];
            case 2:
              _a.sent();
              // Should show loading state
              expect(react_1.screen.getByText(/cadastrando/i)).toBeInTheDocument();
              expect(submitButton).toBeDisabled();
              return [2 /*return*/];
          }
        });
      });
    });
    it("handles submission errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, submitButton;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              // Mock submission error
              mockSupabase.from.mockReturnValue({
                insert: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Database error" },
                }),
              });
              return [4 /*yield*/, fillValidForm(user)];
            case 1:
              _a.sent();
              submitButton = react_1.screen.getByRole("button", { name: /cadastrar paciente/i });
              return [4 /*yield*/, user.click(submitButton)];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  expect(sonner_1.toast.error).toHaveBeenCalledWith(
                    "Erro ao cadastrar paciente. Tente novamente.",
                  );
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  describe("Accessibility", function () {
    it("has proper ARIA labels for form sections", function () {
      setup();
      // Check that form sections have proper headings
      expect(react_1.screen.getByRole("heading", { name: "Dados Pessoais" })).toBeInTheDocument();
      expect(react_1.screen.getByRole("heading", { name: "Endereço" })).toBeInTheDocument();
      expect(
        react_1.screen.getByRole("heading", { name: "Consentimentos LGPD" }),
      ).toBeInTheDocument();
    });
    it("has proper form labels and associations", function () {
      setup();
      var nameInput = react_1.screen.getByLabelText("Nome Completo");
      expect(nameInput).toHaveAttribute("aria-required", "true");
      var cpfInput = react_1.screen.getByLabelText("CPF");
      expect(cpfInput).toHaveAttribute("aria-required", "true");
    });
    it("provides proper error announcements", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var user, cpfInput;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              user = setup().user;
              cpfInput = react_1.screen.getByLabelText("CPF");
              return [4 /*yield*/, user.type(cpfInput, "123")];
            case 1:
              _a.sent();
              return [4 /*yield*/, user.tab()];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                (0, react_1.waitFor)(function () {
                  var errorMessage = react_1.screen.getByText(/CPF deve ter 11 dígitos/);
                  expect(errorMessage).toHaveAttribute("role", "alert");
                }),
              ];
            case 3:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
