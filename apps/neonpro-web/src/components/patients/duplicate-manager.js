"use client";
"use strict";
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
exports.default = DuplicateManager;
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var progress_1 = require("@/components/ui/progress");
var tooltip_1 = require("@/components/ui/tooltip");
var duplicate_detection_1 = require("@/lib/patients/duplicate-detection");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function DuplicateManager(_a) {
  var _this = this;
  var onMergeComplete = _a.onMergeComplete;
  var _b = (0, react_1.useState)([]),
    duplicates = _b[0],
    setDuplicates = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    selectedDuplicate = _d[0],
    setSelectedDuplicate = _d[1];
  var _e = (0, react_1.useState)(false),
    compareDialogOpen = _e[0],
    setCompareDialogOpen = _e[1];
  var _f = (0, react_1.useState)(false),
    mergeDialogOpen = _f[0],
    setMergeDialogOpen = _f[1];
  var _g = (0, react_1.useState)([]),
    fieldComparisons = _g[0],
    setFieldComparisons = _g[1];
  var _h = (0, react_1.useState)(null),
    mergePreview = _h[0],
    setMergePreview = _h[1];
  var _j = (0, react_1.useState)(false),
    processing = _j[0],
    setProcessing = _j[1];
  (0, react_1.useEffect)(function () {
    loadDuplicates();
  }, []);
  var loadDuplicates = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            return [4 /*yield*/, duplicate_detection_1.duplicateDetectionSystem.detectDuplicates()];
          case 1:
            data = _a.sent();
            setDuplicates(data);
            return [3 /*break*/, 4];
          case 2:
            error_1 = _a.sent();
            console.error("Erro ao carregar duplicatas:", error_1);
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleViewComparison = function (duplicate) {
    return __awaiter(_this, void 0, void 0, function () {
      var comparisons, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            setSelectedDuplicate(duplicate);
            return [
              4 /*yield*/,
              duplicate_detection_1.duplicateDetectionSystem.comparePatients(
                duplicate.primaryPatientId,
                duplicate.duplicatePatientId,
              ),
            ];
          case 1:
            comparisons = _a.sent();
            setFieldComparisons(comparisons);
            setCompareDialogOpen(true);
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Erro ao comparar pacientes:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleConfirmDuplicate = function (duplicate) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setProcessing(true);
            return [
              4 /*yield*/,
              duplicate_detection_1.duplicateDetectionSystem.confirmDuplicate(
                duplicate.id,
                "current_user",
              ),
            ];
          case 1:
            _a.sent();
            return [4 /*yield*/, loadDuplicates()];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_3 = _a.sent();
            console.error("Erro ao confirmar duplicata:", error_3);
            return [3 /*break*/, 5];
          case 4:
            setProcessing(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleRejectDuplicate = function (duplicate) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setProcessing(true);
            return [
              4 /*yield*/,
              duplicate_detection_1.duplicateDetectionSystem.rejectDuplicate(
                duplicate.id,
                "current_user",
                "Não são o mesmo paciente",
              ),
            ];
          case 1:
            _a.sent();
            return [4 /*yield*/, loadDuplicates()];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            error_4 = _a.sent();
            console.error("Erro ao rejeitar duplicata:", error_4);
            return [3 /*break*/, 5];
          case 4:
            setProcessing(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var handlePreviewMerge = function (duplicate) {
    return __awaiter(_this, void 0, void 0, function () {
      var preview, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            setSelectedDuplicate(duplicate);
            return [
              4 /*yield*/,
              duplicate_detection_1.duplicateDetectionSystem.previewMerge(
                duplicate.primaryPatientId,
                duplicate.duplicatePatientId,
                {
                  patientData: "merge_intelligent",
                  medicalHistory: "combine",
                  appointments: "combine",
                  documents: "combine",
                  financialData: "keep_primary",
                },
              ),
            ];
          case 1:
            preview = _a.sent();
            setMergePreview(preview);
            setMergeDialogOpen(true);
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Erro no preview de merge:", error_5);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleExecuteMerge = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var result, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!selectedDuplicate) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            setProcessing(true);
            return [
              4 /*yield*/,
              duplicate_detection_1.duplicateDetectionSystem.mergePatients(
                selectedDuplicate.primaryPatientId,
                selectedDuplicate.duplicatePatientId,
                {
                  patientData: "merge_intelligent",
                  medicalHistory: "combine",
                  appointments: "combine",
                  documents: "combine",
                  financialData: "keep_primary",
                },
                "current_user",
              ),
            ];
          case 2:
            result = _a.sent();
            setMergeDialogOpen(false);
            return [4 /*yield*/, loadDuplicates()];
          case 3:
            _a.sent();
            onMergeComplete === null || onMergeComplete === void 0
              ? void 0
              : onMergeComplete(result);
            return [3 /*break*/, 6];
          case 4:
            error_6 = _a.sent();
            console.error("Erro no merge:", error_6);
            return [3 /*break*/, 6];
          case 5:
            setProcessing(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var getConfidenceBadgeVariant = function (score) {
    if (score >= 0.9) return "destructive";
    if (score >= 0.7) return "default";
    return "secondary";
  };
  var getStatusBadgeVariant = function (status) {
    switch (status) {
      case "pending":
        return "default";
      case "confirmed":
        return "destructive";
      case "merged":
        return "default";
      case "rejected":
        return "secondary";
      default:
        return "secondary";
    }
  };
  var pendingDuplicates = duplicates.filter(function (d) {
    return d.status === "pending";
  });
  var confirmedDuplicates = duplicates.filter(function (d) {
    return d.status === "confirmed";
  });
  if (loading) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Carregando duplicatas...</card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <progress_1.Progress value={undefined} className="w-full" />
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">{pendingDuplicates.length}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.CheckCircle className="h-4 w-4 text-red-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">{confirmedDuplicates.length}</p>
                <p className="text-sm text-muted-foreground">Confirmadas</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.GitMerge className="h-4 w-4 text-green-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">
                  {
                    duplicates.filter(function (d) {
                      return d.status === "merged";
                    }).length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Mescladas</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center">
              <lucide_react_1.BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">
                  {duplicates.length > 0
                    ? Math.round(
                        (duplicates.reduce(function (acc, d) {
                          return acc + d.confidenceScore;
                        }, 0) /
                          duplicates.length) *
                          100,
                      )
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Confiança Média</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Pending Duplicates */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center">
            <lucide_react_1.Users className="h-5 w-5 mr-2" />
            Duplicatas Pendentes de Revisão
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          {pendingDuplicates.length === 0
            ? <alert_1.Alert>
                <lucide_react_1.CheckCircle className="h-4 w-4" />
                <alert_1.AlertDescription>
                  Nenhuma duplicata pendente encontrada!
                </alert_1.AlertDescription>
              </alert_1.Alert>
            : <div className="space-y-4">
                {pendingDuplicates.map(function (duplicate) {
                  return (
                    <div key={duplicate.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">Possível Duplicata #{duplicate.id}</h3>
                            <badge_1.Badge
                              variant={getConfidenceBadgeVariant(duplicate.confidenceScore)}
                            >
                              {Math.round(duplicate.confidenceScore * 100)}%
                            </badge_1.Badge>
                            <badge_1.Badge variant={getStatusBadgeVariant(duplicate.status)}>
                              {duplicate.status}
                            </badge_1.Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Campos similares: {duplicate.matchingFields.join(", ")}
                            </p>
                            {duplicate.potentialIssues.length > 0 && (
                              <p className="text-sm text-yellow-600">
                                Possíveis problemas: {duplicate.potentialIssues.join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <tooltip_1.TooltipProvider>
                            <tooltip_1.Tooltip>
                              <tooltip_1.TooltipTrigger asChild>
                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  onClick={function () {
                                    return handleViewComparison(duplicate);
                                  }}
                                >
                                  <lucide_react_1.Eye className="h-4 w-4" />
                                </button_1.Button>
                              </tooltip_1.TooltipTrigger>
                              <tooltip_1.TooltipContent>
                                <p>Comparar registros</p>
                              </tooltip_1.TooltipContent>
                            </tooltip_1.Tooltip>
                          </tooltip_1.TooltipProvider>

                          <tooltip_1.TooltipProvider>
                            <tooltip_1.Tooltip>
                              <tooltip_1.TooltipTrigger asChild>
                                <button_1.Button
                                  variant="outline"
                                  size="sm"
                                  onClick={function () {
                                    return handlePreviewMerge(duplicate);
                                  }}
                                >
                                  <lucide_react_1.GitMerge className="h-4 w-4" />
                                </button_1.Button>
                              </tooltip_1.TooltipTrigger>
                              <tooltip_1.TooltipContent>
                                <p>Preview do merge</p>
                              </tooltip_1.TooltipContent>
                            </tooltip_1.Tooltip>
                          </tooltip_1.TooltipProvider>

                          <button_1.Button
                            size="sm"
                            onClick={function () {
                              return handleConfirmDuplicate(duplicate);
                            }}
                            disabled={processing}
                          >
                            Confirmar
                          </button_1.Button>

                          <button_1.Button
                            variant="outline"
                            size="sm"
                            onClick={function () {
                              return handleRejectDuplicate(duplicate);
                            }}
                            disabled={processing}
                          >
                            Rejeitar
                          </button_1.Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>}
        </card_1.CardContent>
      </card_1.Card>

      {/* Comparison Dialog */}
      <dialog_1.Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <dialog_1.DialogContent className="max-w-4xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Comparação Detalhada</dialog_1.DialogTitle>
            {selectedDuplicate && (
              <dialog_1.DialogDescription>
                Paciente {selectedDuplicate.primaryPatientId} vs{" "}
                {selectedDuplicate.duplicatePatientId}
              </dialog_1.DialogDescription>
            )}
          </dialog_1.DialogHeader>
          <div className="space-y-4">
            {fieldComparisons.map(function (comparison, index) {
              return (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{comparison.field}</h4>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Principal:</p>
                      <p>{comparison.primaryValue || "(vazio)"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duplicata:</p>
                      <p>{comparison.duplicateValue || "(vazio)"}</p>
                    </div>
                  </div>
                  <div>
                    <progress_1.Progress value={comparison.similarity * 100} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Similaridade: {Math.round(comparison.similarity * 100)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <dialog_1.DialogFooter>
            <button_1.Button
              onClick={function () {
                return setCompareDialogOpen(false);
              }}
            >
              Fechar
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>

      {/* Merge Preview Dialog */}
      <dialog_1.Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <dialog_1.DialogContent className="max-w-4xl">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Preview do Merge</dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          {mergePreview && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Estratégia de Merge</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Dados do Paciente:</span>
                    <span>{mergePreview.strategy.patientData}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Histórico Médico:</span>
                    <span>{mergePreview.strategy.medicalHistory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agendamentos:</span>
                    <span>{mergePreview.strategy.appointments}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Transferência de Dados Estimada</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>Agendamentos: {mergePreview.estimatedDataTransfer.appointments}</div>
                  <div>Documentos: {mergePreview.estimatedDataTransfer.documents}</div>
                  <div>Registros Médicos: {mergePreview.estimatedDataTransfer.medicalRecords}</div>
                  <div>
                    Dados Financeiros: {mergePreview.estimatedDataTransfer.financialRecords}
                  </div>
                </div>
              </div>

              {mergePreview.potentialConflicts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Conflitos Potenciais</h4>
                  <div className="space-y-2">
                    {mergePreview.potentialConflicts.map(function (conflict, index) {
                      return (
                        <div key={index} className="flex items-center">
                          <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                          <span>{conflict}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {mergePreview.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recomendações</h4>
                  <div className="space-y-2">
                    {mergePreview.recommendations.map(function (recommendation, index) {
                      return (
                        <div key={index} className="flex items-center">
                          <lucide_react_1.CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                          <span>{recommendation}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <dialog_1.DialogFooter>
            <button_1.Button
              variant="outline"
              onClick={function () {
                return setMergeDialogOpen(false);
              }}
            >
              Cancelar
            </button_1.Button>
            <button_1.Button onClick={handleExecuteMerge} disabled={processing}>
              {processing ? "Executando..." : "Executar Merge"}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>
  );
}
