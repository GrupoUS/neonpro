"use client";
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
exports.useComplianceAssessment = useComplianceAssessment;
var react_1 = require("react");
var LGPDComplianceManager_1 = require("@/lib/lgpd/LGPDComplianceManager");
var use_toast_1 = require("@/hooks/use-toast");
function useComplianceAssessment() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    assessments = _a[0],
    setAssessments = _a[1];
  var _b = (0, react_1.useState)(0),
    totalCount = _b[0],
    setTotalCount = _b[1];
  var _c = (0, react_1.useState)(1),
    currentPage = _c[0],
    setCurrentPage = _c[1];
  var _d = (0, react_1.useState)({
      total: 0,
      completed: 0,
      pending: 0,
      averageScore: 0,
    }),
    statistics = _d[0],
    setStatistics = _d[1];
  var _e = (0, react_1.useState)(null),
    latestAssessment = _e[0],
    setLatestAssessment = _e[1];
  var _f = (0, react_1.useState)(true),
    isLoading = _f[0],
    setIsLoading = _f[1];
  var _g = (0, react_1.useState)(false),
    isCreating = _g[0],
    setIsCreating = _g[1];
  var _h = (0, react_1.useState)(false),
    isRunning = _h[0],
    setIsRunning = _h[1];
  var _j = (0, react_1.useState)(null),
    error = _j[0],
    setError = _j[1];
  var _k = (0, react_1.useState)({
      limit: 20,
      offset: 0,
      sortBy: "created_at",
      sortOrder: "desc",
    }),
    filters = _k[0],
    setFilters = _k[1];
  var toast = (0, use_toast_1.useToast)().toast;
  var complianceManager = new LGPDComplianceManager_1.LGPDComplianceManager();
  var loadAssessments = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response, completed, pending, averageScore, err_1, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              setError(null);
              return [
                4 /*yield*/,
                complianceManager.getComplianceAssessments(
                  __assign(__assign({}, filters), {
                    offset: (currentPage - 1) * (filters.limit || 20),
                  }),
                ),
              ];
            case 1:
              response = _a.sent();
              setAssessments(response.data);
              setTotalCount(response.total);
              completed = response.data.filter(function (a) {
                return a.status === "completed";
              });
              pending = response.data.filter(function (a) {
                return a.status === "pending";
              });
              averageScore =
                completed.length > 0
                  ? completed.reduce(function (sum, a) {
                      return sum + (a.score || 0);
                    }, 0) / completed.length
                  : 0;
              setStatistics({
                total: response.total,
                completed: completed.length,
                pending: pending.length,
                averageScore: Math.round(averageScore * 100) / 100,
              });
              // Set latest assessment
              if (response.data.length > 0) {
                setLatestAssessment(response.data[0]);
              }
              return [3 /*break*/, 3];
            case 2:
              err_1 = _a.sent();
              errorMessage = err_1 instanceof Error ? err_1.message : "Erro ao carregar avaliações";
              setError(errorMessage);
              toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [filters, currentPage, complianceManager, toast],
  );
  var createAssessment = (0, react_1.useCallback)(
    function (assessment) {
      return __awaiter(_this, void 0, void 0, function () {
        var newAssessment_1, err_2, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              setIsCreating(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              setError(null);
              return [4 /*yield*/, complianceManager.createComplianceAssessment(assessment)];
            case 2:
              newAssessment_1 = _a.sent();
              // Update local state
              setAssessments(function (prev) {
                return __spreadArray([newAssessment_1], prev, true);
              });
              setTotalCount(function (prev) {
                return prev + 1;
              });
              // Update statistics
              setStatistics(function (prev) {
                return __assign(__assign({}, prev), {
                  total: prev.total + 1,
                  pending: prev.pending + 1,
                });
              });
              toast({
                title: "Avaliação criada",
                description: 'Avalia\u00E7\u00E3o "'.concat(
                  assessment.title,
                  '" foi criada com sucesso.',
                ),
              });
              return [3 /*break*/, 5];
            case 3:
              err_2 = _a.sent();
              errorMessage = err_2 instanceof Error ? err_2.message : "Erro ao criar avaliação";
              setError(errorMessage);
              toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 5];
            case 4:
              setIsCreating(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [complianceManager, toast],
  );
  var runAutomatedAssessment = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var automatedAssessment, newAssessment_2, result_1, err_3, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              setIsRunning(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, 5, 6]);
              setError(null);
              automatedAssessment = {
                title: "Avalia\u00E7\u00E3o Automatizada - ".concat(
                  new Date().toLocaleDateString("pt-BR"),
                ),
                description: "Avaliação automatizada de conformidade LGPD",
                assessment_type: "automated",
                status: "pending",
                score: null,
                findings: [],
                recommendations: [],
                assessor_id: "system",
              };
              return [
                4 /*yield*/,
                complianceManager.createComplianceAssessment(automatedAssessment),
              ];
            case 2:
              newAssessment_2 = _a.sent();
              return [4 /*yield*/, complianceManager.runAutomatedAssessment(newAssessment_2.id)];
            case 3:
              result_1 = _a.sent();
              // Update local state with results
              setAssessments(function (prev) {
                return prev.map(function (assessment) {
                  return assessment.id === newAssessment_2.id ? result_1 : assessment;
                });
              });
              // Update statistics
              setStatistics(function (prev) {
                return __assign(__assign({}, prev), {
                  completed: prev.completed + 1,
                  pending: Math.max(0, prev.pending - 1),
                  averageScore:
                    prev.completed > 0
                      ? (prev.averageScore * (prev.completed - 1) + (result_1.score || 0)) /
                        prev.completed
                      : result_1.score || 0,
                });
              });
              // Update latest assessment
              setLatestAssessment(result_1);
              toast({
                title: "Avaliação concluída",
                description:
                  "Avalia\u00E7\u00E3o automatizada conclu\u00EDda com pontua\u00E7\u00E3o: ".concat(
                    result_1.score,
                    "/100",
                  ),
              });
              return [3 /*break*/, 6];
            case 4:
              err_3 = _a.sent();
              errorMessage =
                err_3 instanceof Error ? err_3.message : "Erro ao executar avaliação automatizada";
              setError(errorMessage);
              toast({
                title: "Erro",
                description: errorMessage,
                variant: "destructive",
              });
              return [3 /*break*/, 6];
            case 5:
              setIsRunning(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [complianceManager, toast],
  );
  var exportAssessments = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var csvHeaders, csvRows, csvContent, blob, link, url, errorMessage;
        return __generator(this, function (_a) {
          try {
            setError(null);
            csvHeaders = [
              "ID",
              "Título",
              "Tipo",
              "Status",
              "Pontuação",
              "Avaliador",
              "Data de Criação",
              "Data de Atualização",
              "Descrição",
            ];
            csvRows = assessments.map(function (assessment) {
              var _a;
              return [
                assessment.id,
                assessment.title,
                assessment.assessment_type,
                assessment.status,
                ((_a = assessment.score) === null || _a === void 0 ? void 0 : _a.toString()) || "",
                assessment.assessor_id || "",
                assessment.created_at,
                assessment.updated_at,
                assessment.description || "",
              ];
            });
            csvContent = __spreadArray([csvHeaders], csvRows, true)
              .map(function (row) {
                return row
                  .map(function (cell) {
                    return '"'.concat(cell, '"');
                  })
                  .join(",");
              })
              .join("\n");
            blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            link = document.createElement("a");
            url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute(
              "download",
              "lgpd-assessments-".concat(new Date().toISOString().split("T")[0], ".csv"),
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({
              title: "Exportação concluída",
              description: "Avaliações exportadas com sucesso.",
            });
          } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Erro ao exportar avaliações";
            setError(errorMessage);
            toast({
              title: "Erro na exportação",
              description: errorMessage,
              variant: "destructive",
            });
          }
          return [2 /*return*/];
        });
      });
    },
    [assessments, toast],
  );
  var goToPage = (0, react_1.useCallback)(function (page) {
    setCurrentPage(page);
  }, []);
  // Load data on mount and when filters change
  (0, react_1.useEffect)(
    function () {
      var loadData = function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                setIsLoading(true);
                return [4 /*yield*/, loadAssessments()];
              case 1:
                _a.sent();
                setIsLoading(false);
                return [2 /*return*/];
            }
          });
        });
      };
      loadData();
    },
    [loadAssessments],
  );
  return {
    // Data
    assessments: assessments,
    totalCount: totalCount,
    currentPage: currentPage,
    statistics: statistics,
    latestAssessment: latestAssessment,
    // Loading states
    isLoading: isLoading,
    isCreating: isCreating,
    isRunning: isRunning,
    // Filters
    filters: filters,
    setFilters: setFilters,
    // Actions
    loadAssessments: loadAssessments,
    createAssessment: createAssessment,
    runAutomatedAssessment: runAutomatedAssessment,
    exportAssessments: exportAssessments,
    // Pagination
    goToPage: goToPage,
    // Error handling
    error: error,
  };
}
