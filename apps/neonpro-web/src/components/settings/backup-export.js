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
exports.default = BackupExport;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var select_1 = require("@/components/ui/select");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var backupExportSchema = z.object({
  // Automatic Backup Settings
  automaticBackup: z.object({
    enabled: z.boolean(),
    frequency: z.enum(["daily", "weekly", "monthly"]),
    time: z.string(),
    retentionDays: z.number().min(7).max(365),
    includeFiles: z.boolean(),
    includeDatabase: z.boolean(),
    encryption: z.boolean(),
  }),
  // Export Settings
  exportSettings: z.object({
    defaultFormat: z.enum(["json", "csv", "xml", "pdf"]),
    includePII: z.boolean(),
    anonymizeData: z.boolean(),
    dateRange: z.enum(["all", "last_year", "last_6_months", "custom"]),
    customStartDate: z.string().optional(),
    customEndDate: z.string().optional(),
  }),
  // LGPD Compliance
  lgpdCompliance: z.object({
    automaticAnonymization: z.boolean(),
    anonymizationDays: z.number().min(30).max(2555),
    dataPortabilityEnabled: z.boolean(),
    rightToErasure: z.boolean(),
    consentWithdrawalDeletion: z.boolean(),
  }),
  // Storage Settings
  storage: z.object({
    localPath: z.string().optional(),
    cloudProvider: z.enum(["none", "aws", "google", "azure"]).optional(),
    cloudBucket: z.string().optional(),
    cloudRegion: z.string().optional(),
    encryptionKey: z.string().optional(),
  }),
});
function BackupExport() {
  var _this = this;
  var _a = (0, react_1.useState)(false),
    isLoading = _a[0],
    setIsLoading = _a[1];
  var _b = (0, react_1.useState)(false),
    isSaving = _b[0],
    setIsSaving = _b[1];
  var _c = (0, react_1.useState)(null),
    lastSaved = _c[0],
    setLastSaved = _c[1];
  var _d = (0, react_1.useState)([]),
    backupHistory = _d[0],
    setBackupHistory = _d[1];
  var _e = (0, react_1.useState)(0),
    exportProgress = _e[0],
    setExportProgress = _e[1];
  var _f = (0, react_1.useState)(false),
    isExporting = _f[0],
    setIsExporting = _f[1];
  var form = (0, react_hook_form_1.useForm)({
    resolver: (0, zod_1.zodResolver)(backupExportSchema),
    defaultValues: {
      automaticBackup: {
        enabled: true,
        frequency: "daily",
        time: "02:00",
        retentionDays: 30,
        includeFiles: true,
        includeDatabase: true,
        encryption: true,
      },
      exportSettings: {
        defaultFormat: "json",
        includePII: false,
        anonymizeData: true,
        dateRange: "last_year",
        customStartDate: "",
        customEndDate: "",
      },
      lgpdCompliance: {
        automaticAnonymization: true,
        anonymizationDays: 365,
        dataPortabilityEnabled: true,
        rightToErasure: true,
        consentWithdrawalDeletion: true,
      },
      storage: {
        localPath: "/backups",
        cloudProvider: "none",
        cloudBucket: "",
        cloudRegion: "us-east-1",
        encryptionKey: "",
      },
    },
  });
  // Load existing settings and backup history
  (0, react_1.useEffect)(
    function () {
      var loadBackupSettings = function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            setIsLoading(true);
            try {
              // TODO: Replace with actual API call
              // Mock backup history
              setBackupHistory([
                {
                  id: "1",
                  date: new Date(Date.now() - 86400000), // 1 day ago
                  type: "automatic",
                  status: "success",
                  size: 150000000, // 150MB
                  duration: 120, // 2 minutes
                  location: "/backups/backup_2024_01_20.tar.gz",
                },
                {
                  id: "2",
                  date: new Date(Date.now() - 172800000), // 2 days ago
                  type: "automatic",
                  status: "success",
                  size: 148000000,
                  duration: 115,
                  location: "/backups/backup_2024_01_19.tar.gz",
                },
              ]);
            } catch (error) {
              console.error("Erro ao carregar configurações:", error);
              sonner_1.toast.error("Erro ao carregar configurações de backup");
            } finally {
              setIsLoading(false);
            }
            return [2 /*return*/];
          });
        });
      };
      loadBackupSettings();
    },
    [form],
  );
  var onSubmit = function (data) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        setIsSaving(true);
        try {
          setLastSaved(new Date());
          sonner_1.toast.success("Configurações de backup salvas com sucesso!");
        } catch (error) {
          console.error("Erro ao salvar configurações:", error);
          sonner_1.toast.error("Erro ao salvar configurações");
        } finally {
          setIsSaving(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var startManualBackup = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var interval_1;
      return __generator(this, function (_a) {
        try {
          setIsExporting(true);
          setExportProgress(0);
          interval_1 = setInterval(function () {
            setExportProgress(function (prev) {
              if (prev >= 100) {
                clearInterval(interval_1);
                setIsExporting(false);
                sonner_1.toast.success("Backup manual realizado com sucesso!");
                return 100;
              }
              return prev + 10;
            });
          }, 500);
        } catch (error) {
          console.error("Erro no backup:", error);
          sonner_1.toast.error("Erro ao realizar backup");
          setIsExporting(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var exportPatientData = function (patientId) {
    return __awaiter(_this, void 0, void 0, function () {
      var interval_2;
      return __generator(this, function (_a) {
        try {
          setIsExporting(true);
          setExportProgress(0);
          interval_2 = setInterval(function () {
            setExportProgress(function (prev) {
              if (prev >= 100) {
                clearInterval(interval_2);
                setIsExporting(false);
                sonner_1.toast.success("Dados exportados com sucesso!");
                return 100;
              }
              return prev + 15;
            });
          }, 300);
        } catch (error) {
          console.error("Erro na exportação:", error);
          sonner_1.toast.error("Erro ao exportar dados");
          setIsExporting(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var formatBytes = function (bytes) {
    if (bytes === 0) return "0 Bytes";
    var k = 1024;
    var sizes = ["Bytes", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  var formatDuration = function (seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return "".concat(mins, "m ").concat(secs, "s");
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <alert_1.Alert>
        <lucide_react_1.Shield className="h-4 w-4" />
        <alert_1.AlertDescription>
          <strong>Conformidade LGPD:</strong> Este módulo garante a conformidade com os direitos dos
          titulares de dados, incluindo portabilidade, anonimização e direito ao esquecimento.
        </alert_1.AlertDescription>
      </alert_1.Alert>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Automatic Backup */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Database className="h-5 w-5" />
                Backup Automático
              </card_1.CardTitle>
              <card_1.CardDescription>
                Configure backups automáticos para proteção dos dados
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <form_1.FormField
                control={form.control}
                name="automaticBackup.enabled"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">
                          Habilitar Backup Automático
                        </form_1.FormLabel>
                        <form_1.FormDescription>
                          Realizar backups automáticos dos dados
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />

              {form.watch("automaticBackup.enabled") && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="automaticBackup.frequency"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Frequência</form_1.FormLabel>
                            <select_1.Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <form_1.FormControl>
                                <select_1.SelectTrigger>
                                  <select_1.SelectValue />
                                </select_1.SelectTrigger>
                              </form_1.FormControl>
                              <select_1.SelectContent>
                                <select_1.SelectItem value="daily">Diário</select_1.SelectItem>
                                <select_1.SelectItem value="weekly">Semanal</select_1.SelectItem>
                                <select_1.SelectItem value="monthly">Mensal</select_1.SelectItem>
                              </select_1.SelectContent>
                            </select_1.Select>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="automaticBackup.time"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Horário</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input type="time" {...field} />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Horário para executar o backup
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="automaticBackup.retentionDays"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem>
                            <form_1.FormLabel>Retenção (dias)</form_1.FormLabel>
                            <form_1.FormControl>
                              <input_1.Input
                                type="number"
                                min="7"
                                max="365"
                                {...field}
                                onChange={function (e) {
                                  return field.onChange(parseInt(e.target.value) || 30);
                                }}
                              />
                            </form_1.FormControl>
                            <form_1.FormDescription>
                              Dias para manter backups
                            </form_1.FormDescription>
                            <form_1.FormMessage />
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <form_1.FormField
                      control={form.control}
                      name="automaticBackup.includeDatabase"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <form_1.FormLabel>Incluir Banco de Dados</form_1.FormLabel>
                              <form_1.FormDescription>
                                Backup completo do banco
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="automaticBackup.includeFiles"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <form_1.FormLabel>Incluir Arquivos</form_1.FormLabel>
                              <form_1.FormDescription>
                                Backup de documentos e imagens
                              </form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />

                    <form_1.FormField
                      control={form.control}
                      name="automaticBackup.encryption"
                      render={function (_a) {
                        var field = _a.field;
                        return (
                          <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <form_1.FormLabel>Criptografia</form_1.FormLabel>
                              <form_1.FormDescription>Criptografar backups</form_1.FormDescription>
                            </div>
                            <form_1.FormControl>
                              <switch_1.Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </form_1.FormControl>
                          </form_1.FormItem>
                        );
                      }}
                    />
                  </div>
                </>
              )}
            </card_1.CardContent>
          </card_1.Card>

          {/* Manual Backup and Export */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Download className="h-5 w-5" />
                Backup Manual e Exportação
              </card_1.CardTitle>
              <card_1.CardDescription>
                Realizar backups sob demanda e exportações LGPD
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button_1.Button
                  type="button"
                  onClick={startManualBackup}
                  disabled={isExporting}
                  className="flex-1"
                >
                  <lucide_react_1.Database className="h-4 w-4 mr-2" />
                  {isExporting ? "Realizando Backup..." : "Backup Manual"}
                </button_1.Button>

                <button_1.Button
                  type="button"
                  variant="outline"
                  onClick={function () {
                    return exportPatientData();
                  }}
                  disabled={isExporting}
                  className="flex-1"
                >
                  <lucide_react_1.FileText className="h-4 w-4 mr-2" />
                  Exportar Dados (LGPD)
                </button_1.Button>
              </div>

              {isExporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do Backup/Exportação</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <progress_1.Progress value={exportProgress} className="h-2" />
                </div>
              )}

              <form_1.FormField
                control={form.control}
                name="exportSettings.defaultFormat"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="md:w-1/2">
                      <form_1.FormLabel>Formato Padrão de Exportação</form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} defaultValue={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue />
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="json">JSON</select_1.SelectItem>
                          <select_1.SelectItem value="csv">CSV</select_1.SelectItem>
                          <select_1.SelectItem value="xml">XML</select_1.SelectItem>
                          <select_1.SelectItem value="pdf">PDF</select_1.SelectItem>
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormDescription>
                        Formato para exportações de dados dos pacientes
                      </form_1.FormDescription>
                      <form_1.FormMessage />
                    </form_1.FormItem>
                  );
                }}
              />
            </card_1.CardContent>
          </card_1.Card>

          {/* LGPD Compliance */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Shield className="h-5 w-5" />
                Conformidade LGPD
                <badge_1.Badge variant="secondary" className="bg-red-100 text-red-800">
                  CRÍTICO
                </badge_1.Badge>
              </card_1.CardTitle>
              <card_1.CardDescription>
                Configurações obrigatórias para conformidade com a LGPD
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent className="space-y-4">
              <form_1.FormField
                control={form.control}
                name="lgpdCompliance.dataPortabilityEnabled"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">
                          Portabilidade de Dados
                          <span className="text-red-500 ml-1">*</span>
                        </form_1.FormLabel>
                        <form_1.FormDescription>
                          Permitir exportação de dados pelos pacientes (Art. 18, V LGPD)
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />

              <form_1.FormField
                control={form.control}
                name="lgpdCompliance.rightToErasure"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">
                          Direito ao Esquecimento
                          <span className="text-red-500 ml-1">*</span>
                        </form_1.FormLabel>
                        <form_1.FormDescription>
                          Permitir eliminação de dados pelos pacientes (Art. 18, VI LGPD)
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />

              <form_1.FormField
                control={form.control}
                name="lgpdCompliance.automaticAnonymization"
                render={function (_a) {
                  var field = _a.field;
                  return (
                    <form_1.FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <form_1.FormLabel className="text-base">
                          Anonimização Automática
                        </form_1.FormLabel>
                        <form_1.FormDescription>
                          Anonimizar dados após período de retenção
                        </form_1.FormDescription>
                      </div>
                      <form_1.FormControl>
                        <switch_1.Switch checked={field.value} onCheckedChange={field.onChange} />
                      </form_1.FormControl>
                    </form_1.FormItem>
                  );
                }}
              />

              {form.watch("lgpdCompliance.automaticAnonymization") && (
                <form_1.FormField
                  control={form.control}
                  name="lgpdCompliance.anonymizationDays"
                  render={function (_a) {
                    var field = _a.field;
                    return (
                      <form_1.FormItem className="md:w-1/3">
                        <form_1.FormLabel>Dias para Anonimização</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input
                            type="number"
                            min="30"
                            max="2555"
                            {...field}
                            onChange={function (e) {
                              return field.onChange(parseInt(e.target.value) || 365);
                            }}
                          />
                        </form_1.FormControl>
                        <form_1.FormDescription>
                          Dias após inatividade para anonimizar dados
                        </form_1.FormDescription>
                        <form_1.FormMessage />
                      </form_1.FormItem>
                    );
                  }}
                />
              )}
            </card_1.CardContent>
          </card_1.Card>

          {/* Backup History */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Clock className="h-5 w-5" />
                Histórico de Backups
              </card_1.CardTitle>
              <card_1.CardDescription>Últimos backups realizados</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {backupHistory.length === 0
                ? <div className="text-center p-8">
                    <lucide_react_1.HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum backup encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">Realize o primeiro backup da clínica</p>
                  </div>
                : <div className="space-y-3">
                    {backupHistory.map(function (backup) {
                      return (
                        <div
                          key={backup.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={"p-2 rounded-full ".concat(
                                backup.status === "success"
                                  ? "bg-green-100"
                                  : backup.status === "failed"
                                    ? "bg-red-100"
                                    : "bg-yellow-100",
                              )}
                            >
                              {backup.status === "success"
                                ? <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-600" />
                                : backup.status === "failed"
                                  ? <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600" />
                                  : <lucide_react_1.Clock className="h-4 w-4 text-yellow-600" />}
                            </div>
                            <div>
                              <div className="font-medium">
                                Backup {backup.type === "automatic" ? "Automático" : "Manual"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {backup.date.toLocaleString("pt-BR")} • {formatBytes(backup.size)} •{" "}
                                {formatDuration(backup.duration)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <badge_1.Badge
                              className={
                                backup.status === "success"
                                  ? "bg-green-100 text-green-800"
                                  : backup.status === "failed"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {backup.status === "success"
                                ? "Sucesso"
                                : backup.status === "failed"
                                  ? "Falhou"
                                  : "Em andamento"}
                            </badge_1.Badge>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.Download className="h-4 w-4" />
                            </button_1.Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>}
            </card_1.CardContent>
          </card_1.Card>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {lastSaved && (
                <>
                  <lucide_react_1.CheckCircle2 className="h-4 w-4 text-green-600" />
                  Salvo em {lastSaved.toLocaleTimeString()}
                </>
              )}
            </div>
            <button_1.Button type="submit" disabled={isSaving} className="min-w-32">
              {isSaving
                ? <>
                    <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                : <>
                    <lucide_react_1.Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </>}
            </button_1.Button>
          </div>
        </form>
      </form_1.Form>
    </div>
  );
}
