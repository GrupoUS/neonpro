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
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var checkbox_1 = require("@/components/ui/checkbox");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var alert_1 = require("@/components/ui/alert");
var stepper_1 = require("@/components/ui/stepper");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var RecoveryWizard = function (_a) {
  var isOpen = _a.isOpen,
    onClose = _a.onClose,
    onSuccess = _a.onSuccess;
  var _b = (0, react_1.useState)(0),
    currentStep = _b[0],
    setCurrentStep = _b[1];
  var _c = (0, react_1.useState)([]),
    backups = _c[0],
    setBackups = _c[1];
  var _d = (0, react_1.useState)(null),
    selectedBackup = _d[0],
    setSelectedBackup = _d[1];
  var _e = (0, react_1.useState)({
      backup_id: "",
      type: "FULL_RESTORE",
      overwrite_existing: false,
      verify_integrity: true,
      files_to_restore: [],
    }),
    recoveryOptions = _e[0],
    setRecoveryOptions = _e[1];
  var _f = (0, react_1.useState)([]),
    availableFiles = _f[0],
    setAvailableFiles = _f[1];
  var _g = (0, react_1.useState)(false),
    loading = _g[0],
    setLoading = _g[1];
  var _h = (0, react_1.useState)(false),
    recoveryInProgress = _h[0],
    setRecoveryInProgress = _h[1];
  var steps = [
    {
      title: "Selecionar Backup",
      description: "Escolha o backup que deseja restaurar",
    },
    {
      title: "Tipo de Restauração",
      description: "Configure as opções de restauração",
    },
    {
      title: "Confirmação",
      description: "Revise e confirme a operação",
    },
    {
      title: "Progresso",
      description: "Acompanhe o progresso da restauração",
    },
  ];
  (0, react_1.useEffect)(
    function () {
      if (isOpen) {
        loadAvailableBackups();
      }
    },
    [isOpen],
  );
  (0, react_1.useEffect)(
    function () {
      if (selectedBackup && recoveryOptions.type === "PARTIAL_RESTORE") {
        loadBackupFiles(selectedBackup.id);
      }
    },
    [selectedBackup, recoveryOptions.type],
  );
  var loadAvailableBackups = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setLoading(true);
            return [4 /*yield*/, fetch("/api/backup/jobs?status=COMPLETED")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setBackups(data.data || []);
            return [3 /*break*/, 4];
          case 3:
            sonner_1.toast.error("Erro ao carregar backups disponíveis");
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            error_1 = _a.sent();
            console.error("Erro ao carregar backups:", error_1);
            sonner_1.toast.error("Erro ao carregar backups disponíveis");
            return [3 /*break*/, 7];
          case 6:
            setLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadBackupFiles = function (backupId) {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/backup/jobs/".concat(backupId, "/files"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setAvailableFiles(data.files || []);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Erro ao carregar arquivos do backup:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleBackupSelect = function (backup) {
    setSelectedBackup(backup);
    setRecoveryOptions(__assign(__assign({}, recoveryOptions), { backup_id: backup.id }));
  };
  var handleRecoveryTypeChange = function (type) {
    setRecoveryOptions(
      __assign(__assign({}, recoveryOptions), {
        type: type,
        files_to_restore: type === "PARTIAL_RESTORE" ? [] : undefined,
        point_in_time: type === "POINT_IN_TIME" ? new Date().toISOString() : undefined,
      }),
    );
  };
  var handleFileToggle = function (file, checked) {
    var currentFiles = recoveryOptions.files_to_restore || [];
    if (checked) {
      setRecoveryOptions(
        __assign(__assign({}, recoveryOptions), {
          files_to_restore: __spreadArray(__spreadArray([], currentFiles, true), [file], false),
        }),
      );
    } else {
      setRecoveryOptions(
        __assign(__assign({}, recoveryOptions), {
          files_to_restore: currentFiles.filter(function (f) {
            return f !== file;
          }),
        }),
      );
    }
  };
  var startRecovery = function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var response, errorData, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            setRecoveryInProgress(true);
            return [
              4 /*yield*/,
              fetch("/api/backup/recovery", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(recoveryOptions),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 2];
            setCurrentStep(3);
            sonner_1.toast.success("Operação de recuperação iniciada com sucesso");
            // Simular progresso (em produção, seria uma chamada real à API)
            setTimeout(function () {
              setRecoveryInProgress(false);
              sonner_1.toast.success("Recuperação concluída com sucesso");
              onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
              handleClose();
            }, 5000);
            return [3 /*break*/, 4];
          case 2:
            return [4 /*yield*/, response.json()];
          case 3:
            errorData = _a.sent();
            sonner_1.toast.error(errorData.error || "Erro ao iniciar recuperação");
            setRecoveryInProgress(false);
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_3 = _a.sent();
            console.error("Erro ao iniciar recuperação:", error_3);
            sonner_1.toast.error("Erro ao iniciar operação de recuperação");
            setRecoveryInProgress(false);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var handleClose = function () {
    setCurrentStep(0);
    setSelectedBackup(null);
    setRecoveryOptions({
      backup_id: "",
      type: "FULL_RESTORE",
      overwrite_existing: false,
      verify_integrity: true,
      files_to_restore: [],
    });
    setRecoveryInProgress(false);
    onClose();
  };
  var canProceedToNext = function () {
    var _a;
    switch (currentStep) {
      case 0:
        return selectedBackup !== null;
      case 1:
        if (recoveryOptions.type === "PARTIAL_RESTORE") {
          return (
            (((_a = recoveryOptions.files_to_restore) === null || _a === void 0
              ? void 0
              : _a.length) || 0) > 0
          );
        }
        return true;
      case 2:
        return true;
      default:
        return false;
    }
  };
  var getRecoveryTypeIcon = function (type) {
    switch (type) {
      case "FULL_RESTORE":
        return <lucide_react_1.Database className="h-4 w-4" />;
      case "PARTIAL_RESTORE":
        return <lucide_react_1.FileText className="h-4 w-4" />;
      case "POINT_IN_TIME":
        return <lucide_react_1.Clock className="h-4 w-4" />;
      case "VERIFICATION":
        return <lucide_react_1.Shield className="h-4 w-4" />;
      default:
        return <lucide_react_1.HardDrive className="h-4 w-4" />;
    }
  };
  var renderStepContent = function () {
    var _a, _b, _c;
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Selecione um backup válido para restaurar:
            </div>
            {loading
              ? <div className="text-center py-8">
                  <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Carregando backups disponíveis...</p>
                </div>
              : backups.length === 0
                ? <alert_1.Alert>
                    <lucide_react_1.AlertTriangle className="h-4 w-4" />
                    <alert_1.AlertDescription>
                      Nenhum backup válido encontrado para restauração.
                    </alert_1.AlertDescription>
                  </alert_1.Alert>
                : <div className="space-y-2 max-h-64 overflow-y-auto">
                    {backups.map(function (backup) {
                      return (
                        <card_1.Card
                          key={backup.id}
                          className={"cursor-pointer transition-colors ".concat(
                            (selectedBackup === null || selectedBackup === void 0
                              ? void 0
                              : selectedBackup.id) === backup.id
                              ? "ring-2 ring-primary bg-accent"
                              : "hover:bg-accent",
                          )}
                          onClick={function () {
                            return handleBackupSelect(backup);
                          }}
                        >
                          <card_1.CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getRecoveryTypeIcon(backup.type)}
                                <div>
                                  <div className="font-medium">{backup.config_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {(0, utils_1.formatDate)(new Date(backup.start_time))}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <badge_1.Badge variant="outline">{backup.type}</badge_1.Badge>
                                {backup.size && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {(0, utils_1.formatBytes)(backup.size)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </card_1.CardContent>
                        </card_1.Card>
                      );
                    })}
                  </div>}
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label_1.Label>Tipo de Restauração</label_1.Label>
              <select_1.Select
                value={recoveryOptions.type}
                onValueChange={handleRecoveryTypeChange}
              >
                <select_1.SelectTrigger className="mt-2">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="FULL_RESTORE">
                    <div className="flex items-center space-x-2">
                      <lucide_react_1.Database className="h-4 w-4" />
                      <span>Restauração Completa</span>
                    </div>
                  </select_1.SelectItem>
                  <select_1.SelectItem value="PARTIAL_RESTORE">
                    <div className="flex items-center space-x-2">
                      <lucide_react_1.FileText className="h-4 w-4" />
                      <span>Restauração Parcial</span>
                    </div>
                  </select_1.SelectItem>
                  <select_1.SelectItem value="POINT_IN_TIME">
                    <div className="flex items-center space-x-2">
                      <lucide_react_1.Clock className="h-4 w-4" />
                      <span>Point-in-Time</span>
                    </div>
                  </select_1.SelectItem>
                  <select_1.SelectItem value="VERIFICATION">
                    <div className="flex items-center space-x-2">
                      <lucide_react_1.Shield className="h-4 w-4" />
                      <span>Verificação de Integridade</span>
                    </div>
                  </select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            {recoveryOptions.type === "PARTIAL_RESTORE" && (
              <div>
                <label_1.Label>Arquivos para Restaurar</label_1.Label>
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {availableFiles.length === 0
                    ? <p className="text-sm text-muted-foreground">
                        Carregando lista de arquivos...
                      </p>
                    : <div className="space-y-2">
                        {availableFiles.map(function (file) {
                          return (
                            <div key={file} className="flex items-center space-x-2">
                              <checkbox_1.Checkbox
                                id={file}
                                checked={(recoveryOptions.files_to_restore || []).includes(file)}
                                onCheckedChange={function (checked) {
                                  return handleFileToggle(file, checked);
                                }}
                              />
                              <label_1.Label htmlFor={file} className="text-sm">
                                {file}
                              </label_1.Label>
                            </div>
                          );
                        })}
                      </div>}
                </div>
              </div>
            )}

            {recoveryOptions.type === "POINT_IN_TIME" && (
              <div>
                <label_1.Label htmlFor="point-in-time">Data e Hora</label_1.Label>
                <input_1.Input
                  id="point-in-time"
                  type="datetime-local"
                  value={
                    (_a = recoveryOptions.point_in_time) === null || _a === void 0
                      ? void 0
                      : _a.split(".")[0]
                  }
                  onChange={function (e) {
                    return setRecoveryOptions(
                      __assign(__assign({}, recoveryOptions), {
                        point_in_time: e.target.value + ".000Z",
                      }),
                    );
                  }}
                  className="mt-2"
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <checkbox_1.Checkbox
                  id="overwrite"
                  checked={recoveryOptions.overwrite_existing}
                  onCheckedChange={function (checked) {
                    return setRecoveryOptions(
                      __assign(__assign({}, recoveryOptions), { overwrite_existing: checked }),
                    );
                  }}
                />
                <label_1.Label htmlFor="overwrite">Sobrescrever arquivos existentes</label_1.Label>
              </div>

              <div className="flex items-center space-x-2">
                <checkbox_1.Checkbox
                  id="verify"
                  checked={recoveryOptions.verify_integrity}
                  onCheckedChange={function (checked) {
                    return setRecoveryOptions(
                      __assign(__assign({}, recoveryOptions), { verify_integrity: checked }),
                    );
                  }}
                />
                <label_1.Label htmlFor="verify">Verificar integridade dos dados</label_1.Label>
              </div>
            </div>

            <div>
              <label_1.Label htmlFor="email">Email para Notificação (Opcional)</label_1.Label>
              <input_1.Input
                id="email"
                type="email"
                value={recoveryOptions.notification_email || ""}
                onChange={function (e) {
                  return setRecoveryOptions(
                    __assign(__assign({}, recoveryOptions), { notification_email: e.target.value }),
                  );
                }}
                placeholder="seu@email.com"
                className="mt-2"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <alert_1.Alert>
              <lucide_react_1.AlertTriangle className="h-4 w-4" />
              <alert_1.AlertDescription>
                <strong>Atenção:</strong> Esta operação irá restaurar dados do backup selecionado.
                Certifique-se de que as configurações estão corretas antes de prosseguir.
              </alert_1.AlertDescription>
            </alert_1.Alert>

            <div className="space-y-4">
              <div>
                <label_1.Label className="text-sm font-medium">Backup Selecionado</label_1.Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedBackup === null || selectedBackup === void 0
                    ? void 0
                    : selectedBackup.config_name}{" "}
                  -{" "}
                  {(0, utils_1.formatDate)(
                    new Date(
                      (selectedBackup === null || selectedBackup === void 0
                        ? void 0
                        : selectedBackup.start_time) || "",
                    ),
                  )}
                </div>
              </div>

              <div>
                <label_1.Label className="text-sm font-medium">Tipo de Restauração</label_1.Label>
                <div className="mt-1 text-sm text-muted-foreground">
                  {recoveryOptions.type === "FULL_RESTORE" && "Restauração Completa"}
                  {recoveryOptions.type === "PARTIAL_RESTORE" && "Restauração Parcial"}
                  {recoveryOptions.type === "POINT_IN_TIME" && "Point-in-Time Recovery"}
                  {recoveryOptions.type === "VERIFICATION" && "Verificação de Integridade"}
                </div>
              </div>

              {recoveryOptions.type === "PARTIAL_RESTORE" && (
                <div>
                  <label_1.Label className="text-sm font-medium">
                    Arquivos Selecionados (
                    {((_b = recoveryOptions.files_to_restore) === null || _b === void 0
                      ? void 0
                      : _b.length) || 0}
                    )
                  </label_1.Label>
                  <div className="mt-1 max-h-32 overflow-y-auto">
                    {(_c = recoveryOptions.files_to_restore) === null || _c === void 0
                      ? void 0
                      : _c.map(function (file) {
                          return (
                            <div key={file} className="text-sm text-muted-foreground">
                              {file}
                            </div>
                          );
                        })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label_1.Label className="text-sm font-medium">
                    Sobrescrever Existentes
                  </label_1.Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {recoveryOptions.overwrite_existing ? "Sim" : "Não"}
                  </div>
                </div>
                <div>
                  <label_1.Label className="text-sm font-medium">
                    Verificar Integridade
                  </label_1.Label>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {recoveryOptions.verify_integrity ? "Sim" : "Não"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {recoveryInProgress
                ? <lucide_react_1.RefreshCw className="h-8 w-8 text-primary animate-spin" />
                : <lucide_react_1.CheckCircle className="h-8 w-8 text-green-500" />}
            </div>

            {recoveryInProgress
              ? <>
                  <div>
                    <h3 className="text-lg font-medium">Restauração em Progresso</h3>
                    <p className="text-muted-foreground">
                      Por favor, aguarde enquanto os dados são restaurados...
                    </p>
                  </div>
                  <progress_1.Progress value={75} className="w-full" />
                  <p className="text-sm text-muted-foreground">Estimativa: 2 minutos restantes</p>
                </>
              : <>
                  <div>
                    <h3 className="text-lg font-medium">Restauração Concluída</h3>
                    <p className="text-muted-foreground">Os dados foram restaurados com sucesso!</p>
                  </div>
                </>}
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <dialog_1.Dialog open={isOpen} onOpenChange={!recoveryInProgress ? handleClose : undefined}>
      <dialog_1.DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Assistente de Recuperação</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Restore dados de backup de forma fácil e segura
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <div className="space-y-6">
          <stepper_1.Stepper value={currentStep} className="w-full">
            {steps.map(function (step, index) {
              return (
                <stepper_1.StepperItem key={index} value={index}>
                  <stepper_1.StepperTrigger>{step.title}</stepper_1.StepperTrigger>
                  <stepper_1.StepperContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      {renderStepContent()}
                    </div>
                  </stepper_1.StepperContent>
                  {index < steps.length - 1 && <stepper_1.StepperSeparator />}
                </stepper_1.StepperItem>
              );
            })}
          </stepper_1.Stepper>
        </div>

        <dialog_1.DialogFooter>
          {currentStep > 0 && currentStep < 3 && (
            <button_1.Button
              variant="outline"
              onClick={function () {
                return setCurrentStep(currentStep - 1);
              }}
            >
              <lucide_react_1.ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </button_1.Button>
          )}

          {currentStep < 2 && (
            <button_1.Button
              onClick={function () {
                return setCurrentStep(currentStep + 1);
              }}
              disabled={!canProceedToNext()}
            >
              Próximo
              <lucide_react_1.ArrowRight className="h-4 w-4 ml-2" />
            </button_1.Button>
          )}

          {currentStep === 2 && (
            <button_1.Button onClick={startRecovery} disabled={recoveryInProgress}>
              <lucide_react_1.Download className="h-4 w-4 mr-2" />
              Iniciar Recuperação
            </button_1.Button>
          )}

          {currentStep === 3 && !recoveryInProgress && (
            <button_1.Button onClick={handleClose}>Fechar</button_1.Button>
          )}
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
};
exports.default = RecoveryWizard;
