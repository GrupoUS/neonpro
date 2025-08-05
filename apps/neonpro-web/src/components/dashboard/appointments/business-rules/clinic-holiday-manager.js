"use client";
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicHolidayManager = ClinicHolidayManager;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var textarea_1 = require("@/components/ui/textarea");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function ClinicHolidayManager(_a) {
  var clinicId = _a.clinicId,
    onHolidaysChange = _a.onHolidaysChange;
  // State management
  var _b = (0, react_1.useState)([]),
    holidays = _b[0],
    setHolidays = _b[1];
  var _c = (0, react_1.useState)(true),
    isLoading = _c[0],
    setIsLoading = _c[1];
  var _d = (0, react_1.useState)(false),
    isDialogOpen = _d[0],
    setIsDialogOpen = _d[1];
  var _e = (0, react_1.useState)(null),
    editingHoliday = _e[0],
    setEditingHoliday = _e[1];
  var _f = (0, react_1.useState)({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      is_recurring: false,
      recurrence_type: undefined,
    }),
    formData = _f[0],
    setFormData = _f[1];
  // Load existing holidays
  (0, react_1.useEffect)(() => {
    loadHolidays();
  }, [clinicId]);
  var loadHolidays = () =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            setIsLoading(true);
            return [4 /*yield*/, fetch("/api/clinic/".concat(clinicId, "/holidays"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setHolidays(data);
            onHolidaysChange === null || onHolidaysChange === void 0
              ? void 0
              : onHolidaysChange(data);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Error loading holidays:", error_1);
            sonner_1.toast.error("Erro ao carregar feriados");
            return [3 /*break*/, 6];
          case 5:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  var openDialog = (holiday) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setFormData({
        name: holiday.name,
        description: holiday.description || "",
        start_date: holiday.start_date,
        end_date: holiday.end_date,
        start_time: holiday.start_time || "",
        end_time: holiday.end_time || "",
        is_recurring: holiday.is_recurring,
        recurrence_type: holiday.recurrence_type,
      });
    } else {
      setEditingHoliday(null);
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        start_time: "",
        end_time: "",
        is_recurring: false,
        recurrence_type: undefined,
      });
    }
    setIsDialogOpen(true);
  };
  var closeDialog = () => {
    setIsDialogOpen(false);
    setEditingHoliday(null);
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      is_recurring: false,
      recurrence_type: undefined,
    });
  };
  var saveHoliday = () =>
    __awaiter(this, void 0, void 0, function () {
      var method, url, response, savedHoliday_1, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            // Basic validation
            if (!formData.name || !formData.start_date || !formData.end_date) {
              sonner_1.toast.error("Nome, data inicial e data final são obrigatórios");
              return [2 /*return*/];
            }
            if (formData.start_date > formData.end_date) {
              sonner_1.toast.error("Data inicial deve ser anterior à data final");
              return [2 /*return*/];
            }
            if (
              formData.start_time &&
              formData.end_time &&
              formData.start_time >= formData.end_time
            ) {
              sonner_1.toast.error("Horário inicial deve ser anterior ao horário final");
              return [2 /*return*/];
            }
            method = editingHoliday ? "PUT" : "POST";
            url = editingHoliday
              ? "/api/clinic/".concat(clinicId, "/holidays/").concat(editingHoliday.id)
              : "/api/clinic/".concat(clinicId, "/holidays");
            return [
              4 /*yield*/,
              fetch(url, {
                method: method,
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to save holiday");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            savedHoliday_1 = _a.sent();
            if (editingHoliday) {
              setHolidays((prev) =>
                prev.map((h) => (h.id === editingHoliday.id ? savedHoliday_1 : h)),
              );
              sonner_1.toast.success("Feriado atualizado com sucesso!");
            } else {
              setHolidays((prev) =>
                __spreadArray(__spreadArray([], prev, true), [savedHoliday_1], false),
              );
              sonner_1.toast.success("Feriado adicionado com sucesso!");
            }
            closeDialog();
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error saving holiday:", error_2);
            sonner_1.toast.error("Erro ao salvar feriado");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var deleteHoliday = (holidayId) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/clinic/".concat(clinicId, "/holidays/").concat(holidayId), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to delete holiday");
            }
            setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
            sonner_1.toast.success("Feriado removido com sucesso!");
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Error deleting holiday:", error_3);
            sonner_1.toast.error("Erro ao remover feriado");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var toggleHolidayStatus = (holidayId, isActive) =>
    __awaiter(this, void 0, void 0, function () {
      var response, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/clinic/".concat(clinicId, "/holidays/").concat(holidayId), {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ is_active: isActive }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to update holiday status");
            }
            setHolidays((prev) =>
              prev.map((h) =>
                h.id === holidayId ? __assign(__assign({}, h), { is_active: isActive }) : h,
              ),
            );
            sonner_1.toast.success(
              "Feriado ".concat(isActive ? "ativado" : "desativado", " com sucesso!"),
            );
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Error updating holiday status:", error_4);
            sonner_1.toast.error("Erro ao atualizar status do feriado");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  var getHolidayDateRange = (holiday) => {
    var startDate = (0, date_fns_1.parseISO)(holiday.start_date);
    var endDate = (0, date_fns_1.parseISO)(holiday.end_date);
    if (holiday.start_date === holiday.end_date) {
      return (0, date_fns_1.format)(startDate, "dd/MM/yyyy", { locale: locale_1.ptBR });
    }
    return ""
      .concat((0, date_fns_1.format)(startDate, "dd/MM/yyyy", { locale: locale_1.ptBR }), " - ")
      .concat((0, date_fns_1.format)(endDate, "dd/MM/yyyy", { locale: locale_1.ptBR }));
  };
  var getHolidayTimeRange = (holiday) => {
    if (!holiday.start_time || !holiday.end_time) {
      return "Dia todo";
    }
    return "".concat(holiday.start_time, " - ").concat(holiday.end_time);
  };
  var getRecurrenceLabel = (holiday) => {
    if (!holiday.is_recurring) return "";
    var labels = {
      yearly: "Anual",
      monthly: "Mensal",
      weekly: "Semanal",
    };
    return labels[holiday.recurrence_type || "yearly"] || "";
  };
  if (isLoading) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-4 w-4 animate-spin" />
            <span>Carregando feriados...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-5 w-5" />
            Feriados e Fechamentos
          </card_1.CardTitle>
          <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button onClick={() => openDialog()}>
                <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                Adicionar
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="sm:max-w-md">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>
                  {editingHoliday ? "Editar" : "Adicionar"} Feriado
                </dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Configure um período de fechamento ou feriado para a clínica.
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>

              <div className="space-y-4">
                <div>
                  <label_1.Label htmlFor="holiday-name">Nome *</label_1.Label>
                  <input_1.Input
                    id="holiday-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => __assign(__assign({}, prev), { name: e.target.value }))
                    }
                    placeholder="Ex: Natal, Fechamento para reformas..."
                  />
                </div>

                <div>
                  <label_1.Label htmlFor="holiday-description">Descrição</label_1.Label>
                  <textarea_1.Textarea
                    id="holiday-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) =>
                        __assign(__assign({}, prev), { description: e.target.value }),
                      )
                    }
                    placeholder="Detalhes adicionais (opcional)"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="start-date">Data inicial *</label_1.Label>
                    <input_1.Input
                      id="start-date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => {
                        setFormData((prev) =>
                          __assign(__assign({}, prev), {
                            start_date: e.target.value,
                            end_date: prev.end_date || e.target.value,
                          }),
                        );
                      }}
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="end-date">Data final *</label_1.Label>
                    <input_1.Input
                      id="end-date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData((prev) =>
                          __assign(__assign({}, prev), { end_date: e.target.value }),
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label_1.Label htmlFor="start-time">Início (opcional)</label_1.Label>
                    <input_1.Input
                      id="start-time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData((prev) =>
                          __assign(__assign({}, prev), { start_time: e.target.value }),
                        )
                      }
                    />
                  </div>
                  <div>
                    <label_1.Label htmlFor="end-time">Fim (opcional)</label_1.Label>
                    <input_1.Input
                      id="end-time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData((prev) =>
                          __assign(__assign({}, prev), { end_time: e.target.value }),
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <switch_1.Switch
                      checked={formData.is_recurring}
                      onCheckedChange={(checked) =>
                        setFormData((prev) =>
                          __assign(__assign({}, prev), {
                            is_recurring: checked,
                            recurrence_type: checked ? "yearly" : undefined,
                          }),
                        )
                      }
                    />
                    <label_1.Label>Recorrente</label_1.Label>
                  </div>

                  {formData.is_recurring && (
                    <select_1.Select
                      value={formData.recurrence_type}
                      onValueChange={(value) =>
                        setFormData((prev) =>
                          __assign(__assign({}, prev), { recurrence_type: value }),
                        )
                      }
                    >
                      <select_1.SelectTrigger>
                        <select_1.SelectValue placeholder="Tipo de recorrência" />
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="yearly">Anual</select_1.SelectItem>
                        <select_1.SelectItem value="monthly">Mensal</select_1.SelectItem>
                        <select_1.SelectItem value="weekly">Semanal</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                  )}
                </div>
              </div>

              <dialog_1.DialogFooter>
                <button_1.Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={saveHoliday}>
                  <lucide_react_1.Save className="h-4 w-4 mr-2" />
                  Salvar
                </button_1.Button>
              </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          {holidays.length === 0
            ? <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum feriado configurado</p>
                <p className="text-sm">Clique em "Adicionar" para criar um novo feriado</p>
              </div>
            : holidays.map((holiday) => (
                <card_1.Card key={holiday.id} className={!holiday.is_active ? "opacity-60" : ""}>
                  <card_1.CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{holiday.name}</h4>
                          {holiday.is_recurring && (
                            <badge_1.Badge variant="secondary" className="text-xs">
                              <lucide_react_1.RefreshCw className="h-3 w-3 mr-1" />
                              {getRecurrenceLabel(holiday)}
                            </badge_1.Badge>
                          )}
                          {!holiday.is_active && (
                            <badge_1.Badge variant="outline" className="text-xs">
                              Inativo
                            </badge_1.Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Calendar className="h-3 w-3" />
                            {getHolidayDateRange(holiday)}
                          </div>
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Clock className="h-3 w-3" />
                            {getHolidayTimeRange(holiday)}
                          </div>
                          {holiday.description && <p className="text-xs">{holiday.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <switch_1.Switch
                          checked={holiday.is_active}
                          onCheckedChange={(checked) => toggleHolidayStatus(holiday.id, checked)}
                        />
                        <button_1.Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(holiday)}
                        >
                          <lucide_react_1.Edit className="h-3 w-3" />
                        </button_1.Button>
                        <button_1.Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHoliday(holiday.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <lucide_react_1.Trash2 className="h-3 w-3" />
                        </button_1.Button>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              ))}
        </div>

        {holidays.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <lucide_react_1.AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Informações importantes:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Feriados ativos bloqueiam automaticamente agendamentos</li>
                  <li>Horários específicos permitem fechamentos parciais</li>
                  <li>Feriados recorrentes se repetem automaticamente</li>
                  <li>Agendamentos existentes em feriados precisam ser reagendados manualmente</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
