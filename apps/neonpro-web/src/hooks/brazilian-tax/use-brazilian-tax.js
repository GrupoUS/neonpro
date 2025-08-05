"use strict";
/**
 * Brazilian Tax Hooks
 * React hooks for CNPJ validation, tax calculation, and compliance features
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCNPJValidation = useCNPJValidation;
exports.useTaxCalculation = useTaxCalculation;
exports.useBrazilianTaxCompliance = useBrazilianTaxCompliance;
exports.useBrazilianTax = useBrazilianTax;
var react_1 = require("react");
var cnpj_consultation_1 = require("../../lib/services/brazilian-tax/cnpj-consultation");
var cnpj_validator_1 = require("../../lib/services/brazilian-tax/cnpj-validator");
var tax_calculator_v2_1 = require("../../lib/services/brazilian-tax/tax-calculator-v2");
/**
 * Hook for CNPJ validation and consultation
 */
function useCNPJValidation() {
  var _this = this;
  var _a = (0, react_1.useState)({
      cnpj: "",
      isValid: false,
      isLoading: false,
      companyData: null,
      errors: [],
      consultationResult: null,
    }),
    validationState = _a[0],
    setValidationState = _a[1];
  var validateCNPJ = (0, react_1.useCallback)(function (cnpj) {
    var validation = (0, cnpj_validator_1.validateCNPJFormat)(cnpj);
    setValidationState(function (prev) {
      return __assign(__assign({}, prev), {
        cnpj: cnpj,
        isValid: validation.valid,
        errors: validation.errors || [],
      });
    });
    return validation;
  }, []);
  var consultCNPJ = (0, react_1.useCallback)(function (cnpj) {
    return __awaiter(_this, void 0, void 0, function () {
      var result_1, error_1, errorMessage_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!cnpj) return [2 /*return*/];
            setValidationState(function (prev) {
              return __assign(__assign({}, prev), { isLoading: true, errors: [] });
            });
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, cnpj_consultation_1.default.consultCNPJ(cnpj)];
          case 2:
            result_1 = _a.sent();
            setValidationState(function (prev) {
              return __assign(__assign({}, prev), {
                isLoading: false,
                consultationResult: result_1,
                companyData: result_1.success ? result_1.data || null : null,
                errors: result_1.errors || [],
              });
            });
            return [2 /*return*/, result_1];
          case 3:
            error_1 = _a.sent();
            errorMessage_1 = error_1 instanceof Error ? error_1.message : "Erro na consulta";
            setValidationState(function (prev) {
              return __assign(__assign({}, prev), { isLoading: false, errors: [errorMessage_1] });
            });
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  var formatAndValidate = (0, react_1.useCallback)(
    function (cnpj) {
      var formatted = (0, cnpj_validator_1.formatCNPJ)(cnpj);
      var validation = validateCNPJ(formatted);
      return {
        formatted: formatted,
        validation: validation,
      };
    },
    [validateCNPJ],
  );
  var clearValidation = (0, react_1.useCallback)(function () {
    setValidationState({
      cnpj: "",
      isValid: false,
      isLoading: false,
      companyData: null,
      errors: [],
      consultationResult: null,
    });
  }, []);
  return __assign(__assign({}, validationState), {
    validateCNPJ: validateCNPJ,
    consultCNPJ: consultCNPJ,
    formatAndValidate: formatAndValidate,
    clearValidation: clearValidation,
  });
}
/**
 * Hook for tax calculations
 */
function useTaxCalculation() {
  var _this = this;
  var _a = (0, react_1.useState)({
      isLoading: false,
      result: null,
      errors: [],
      history: [],
    }),
    calculationState = _a[0],
    setCalculationState = _a[1];
  var calculateTaxes = (0, react_1.useCallback)(function (request) {
    return __awaiter(_this, void 0, void 0, function () {
      var result_2, errorMessage_2;
      return __generator(this, function (_a) {
        setCalculationState(function (prev) {
          return __assign(__assign({}, prev), { isLoading: true, errors: [] });
        });
        try {
          result_2 = tax_calculator_v2_1.default.calculateTaxes(request);
          setCalculationState(function (prev) {
            return __assign(__assign({}, prev), {
              isLoading: false,
              result: result_2,
              history: __spreadArray([result_2], prev.history.slice(0, 9), true),
            });
          });
          return [2 /*return*/, result_2];
        } catch (error) {
          errorMessage_2 = error instanceof Error ? error.message : "Erro no cálculo";
          setCalculationState(function (prev) {
            return __assign(__assign({}, prev), { isLoading: false, errors: [errorMessage_2] });
          });
          return [2 /*return*/, null];
        }
        return [2 /*return*/];
      });
    });
  }, []);
  var batchCalculate = (0, react_1.useCallback)(function (requests) {
    return __awaiter(_this, void 0, void 0, function () {
      var results, errorMessage_3;
      return __generator(this, function (_a) {
        setCalculationState(function (prev) {
          return __assign(__assign({}, prev), { isLoading: true, errors: [] });
        });
        try {
          results = tax_calculator_v2_1.default.batchCalculateTaxes(requests);
          setCalculationState(function (prev) {
            return __assign(__assign({}, prev), { isLoading: false });
          });
          return [2 /*return*/, results];
        } catch (error) {
          errorMessage_3 = error instanceof Error ? error.message : "Erro no cálculo em lote";
          setCalculationState(function (prev) {
            return __assign(__assign({}, prev), { isLoading: false, errors: [errorMessage_3] });
          });
          return [2 /*return*/, null];
        }
        return [2 /*return*/];
      });
    });
  }, []);
  var estimateAnnualTax = (0, react_1.useCallback)(function (monthlyRevenue, regime, serviceType) {
    try {
      return tax_calculator_v2_1.default.estimateAnnualTax(monthlyRevenue, regime, serviceType);
    } catch (error) {
      var errorMessage_4 = error instanceof Error ? error.message : "Erro na estimativa";
      setCalculationState(function (prev) {
        return __assign(__assign({}, prev), { errors: [errorMessage_4] });
      });
      return null;
    }
  }, []);
  var clearCalculations = (0, react_1.useCallback)(function () {
    setCalculationState({
      isLoading: false,
      result: null,
      errors: [],
      history: [],
    });
  }, []);
  return __assign(__assign({}, calculationState), {
    calculateTaxes: calculateTaxes,
    batchCalculate: batchCalculate,
    estimateAnnualTax: estimateAnnualTax,
    clearCalculations: clearCalculations,
  });
}
/**
 * Hook for Brazilian tax compliance features
 */
function useBrazilianTaxCompliance() {
  var _this = this;
  var _a = (0, react_1.useState)({
      isLoading: false,
      healthcareCNAEValid: false,
      regimeTributario: null,
      complianceChecks: {
        cnpj_valid: false,
        inscricao_estadual_valid: false,
        inscricao_municipal_valid: false,
        simples_nacional_active: false,
      },
      errors: [],
    }),
    complianceState = _a[0],
    setComplianceState = _a[1];
  var checkHealthcareCNAE = (0, react_1.useCallback)(function (cnae) {
    var healthcareCNAEs = [
      "8610-1", // Atividades de atendimento hospitalar
      "8630-5", // Atividades de atenção ambulatorial
      "8640-2", // Atividades de serviços de complementação diagnóstica
      "8650-0", // Atividades de profissionais da área de saúde
      "9609-2", // Outras atividades de serviços pessoais (estética)
      "8591-1", // Ensino de esportes (relacionado a estética/fitness)
      "8292-0", // Envasamento e empacotamento sob contrato (cosméticos)
      "4771-7", // Comércio varejista de produtos farmacêuticos
      "4772-5", // Comércio varejista de cosméticos
    ];
    var isValid = healthcareCNAEs.some(function (code) {
      return cnae.startsWith(code.replace("-", ""));
    });
    setComplianceState(function (prev) {
      return __assign(__assign({}, prev), { healthcareCNAEValid: isValid });
    });
    return isValid;
  }, []);
  var validateCompliance = (0, react_1.useCallback)(
    function (companyData) {
      return __awaiter(_this, void 0, void 0, function () {
        var cnpjValid_1, healthcareValid_1, regimeTributario_1, errorMessage_5;
        return __generator(this, function (_a) {
          setComplianceState(function (prev) {
            return __assign(__assign({}, prev), { isLoading: true, errors: [] });
          });
          try {
            cnpjValid_1 = (0, cnpj_validator_1.validateCNPJFormat)(companyData.cnpj).valid;
            healthcareValid_1 = checkHealthcareCNAE(companyData.atividade_principal.code);
            regimeTributario_1 = "simples_nacional";
            if (companyData.capital_social > 5000000) {
              regimeTributario_1 = "lucro_real";
            } else if (companyData.capital_social > 1000000) {
              regimeTributario_1 = "lucro_presumido";
            }
            setComplianceState(function (prev) {
              return __assign(__assign({}, prev), {
                isLoading: false,
                healthcareCNAEValid: healthcareValid_1,
                regimeTributario: regimeTributario_1,
                complianceChecks: {
                  cnpj_valid: cnpjValid_1,
                  inscricao_estadual_valid: true, // Would need additional validation
                  inscricao_municipal_valid: true, // Would need additional validation
                  simples_nacional_active: regimeTributario_1 === "simples_nacional",
                },
              });
            });
            return [
              2 /*return*/,
              {
                cnpjValid: cnpjValid_1,
                healthcareValid: healthcareValid_1,
                regimeTributario: regimeTributario_1,
              },
            ];
          } catch (error) {
            errorMessage_5 = error instanceof Error ? error.message : "Erro na validação";
            setComplianceState(function (prev) {
              return __assign(__assign({}, prev), { isLoading: false, errors: [errorMessage_5] });
            });
            return [2 /*return*/, null];
          }
          return [2 /*return*/];
        });
      });
    },
    [checkHealthcareCNAE],
  );
  var clearCompliance = (0, react_1.useCallback)(function () {
    setComplianceState({
      isLoading: false,
      healthcareCNAEValid: false,
      regimeTributario: null,
      complianceChecks: {
        cnpj_valid: false,
        inscricao_estadual_valid: false,
        inscricao_municipal_valid: false,
        simples_nacional_active: false,
      },
      errors: [],
    });
  }, []);
  return __assign(__assign({}, complianceState), {
    checkHealthcareCNAE: checkHealthcareCNAE,
    validateCompliance: validateCompliance,
    clearCompliance: clearCompliance,
  });
}
/**
 * Master hook that combines all Brazilian tax functionality
 */
function useBrazilianTax() {
  var _this = this;
  var cnpjValidation = useCNPJValidation();
  var taxCalculation = useTaxCalculation();
  var compliance = useBrazilianTaxCompliance();
  var _a = (0, react_1.useState)(false),
    isInitialized = _a[0],
    setIsInitialized = _a[1];
  (0, react_1.useEffect)(function () {
    // Initialization logic if needed
    setIsInitialized(true);
  }, []);
  var validateAndCalculate = (0, react_1.useCallback)(
    function (cnpj, serviceType, serviceValue) {
      return __awaiter(_this, void 0, void 0, function () {
        var cnpjResult, complianceResult, taxRequest, taxResult;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cnpjValidation.consultCNPJ(cnpj)];
            case 1:
              cnpjResult = _a.sent();
              if (!(cnpjResult === null || cnpjResult === void 0 ? void 0 : cnpjResult.success)) {
                throw new Error("CNPJ inválido ou não encontrado");
              }
              return [4 /*yield*/, compliance.validateCompliance(cnpjResult.data)];
            case 2:
              complianceResult = _a.sent();
              if (!complianceResult) {
                throw new Error("Erro na validação de compliance");
              }
              taxRequest = {
                clinic_id: "temp", // Would come from context
                valor_base: serviceValue,
                tipo_servico: serviceType,
                regime_tributario: complianceResult.regimeTributario,
              };
              return [4 /*yield*/, taxCalculation.calculateTaxes(taxRequest)];
            case 3:
              taxResult = _a.sent();
              if (!taxResult) {
                throw new Error("Erro no cálculo de impostos");
              }
              return [
                2 /*return*/,
                {
                  cnpj: cnpjResult,
                  compliance: complianceResult,
                  tax: taxResult,
                },
              ];
          }
        });
      });
    },
    [cnpjValidation, taxCalculation, compliance],
  );
  var resetAll = (0, react_1.useCallback)(
    function () {
      cnpjValidation.clearValidation();
      taxCalculation.clearCalculations();
      compliance.clearCompliance();
    },
    [cnpjValidation, taxCalculation, compliance],
  );
  return {
    cnpj: cnpjValidation,
    tax: taxCalculation,
    compliance: compliance,
    isInitialized: isInitialized,
    validateAndCalculate: validateAndCalculate,
    resetAll: resetAll,
  };
}
