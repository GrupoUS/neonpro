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
exports.ServiceTypeRuleManager = ServiceTypeRuleManager;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var sonner_1 = require("sonner");
function ServiceTypeRuleManager(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    onRulesChange = _a.onRulesChange;
  // State management
  var _b = (0, react_1.useState)([]),
    rules = _b[0],
    setRules = _b[1];
  var _c = (0, react_1.useState)([]),
    services = _c[0],
    setServices = _c[1];
  var _d = (0, react_1.useState)([]),
    professionals = _d[0],
    setProfessionals = _d[1];
  var _e = (0, react_1.useState)(true),
    isLoading = _e[0],
    setIsLoading = _e[1];
  var _f = (0, react_1.useState)(false),
    isDialogOpen = _f[0],
    setIsDialogOpen = _f[1];
  var _g = (0, react_1.useState)(null),
    editingRule = _g[0],
    setEditingRule = _g[1];
  var _h = (0, react_1.useState)({
      service_type_id: "",
      minimum_duration: 30,
      maximum_duration: 180,
      buffer_before: 0,
      buffer_after: 0,
      max_daily_bookings: undefined,
      requires_specific_professional: false,
      allowed_professional_ids: [],
      minimum_advance_hours: 0,
      maximum_advance_days: 90,
      allow_same_day: true,
      description: "",
    }),
    formData = _h[0],
    setFormData = _h[1];
  // Load data on mount
  (0, react_1.useEffect)(
    function () {
      Promise.all([loadRules(), loadServices(), loadProfessionals()]);
    },
    [clinicId],
  );
  var loadRules = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            setIsLoading(true);
            return [4 /*yield*/, fetch("/api/clinic/".concat(clinicId, "/service-rules"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setRules(data);
            onRulesChange === null || onRulesChange === void 0 ? void 0 : onRulesChange(data);
            _a.label = 3;
          case 3:
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Error loading service rules:", error_1);
            sonner_1.toast.error("Erro ao carregar regras de serviços");
            return [3 /*break*/, 6];
          case 5:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadServices = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/clinic/".concat(clinicId, "/services"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setServices(
              data.map(function (s) {
                return { id: s.id, name: s.name };
              }),
            );
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_2 = _a.sent();
            console.error("Error loading services:", error_2);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var loadProfessionals = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, fetch("/api/clinic/".concat(clinicId, "/professionals"))];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setProfessionals(
              data.map(function (p) {
                return { id: p.id, name: p.name };
              }),
            );
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            console.error("Error loading professionals:", error_3);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var openDialog = function (rule) {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        service_type_id: rule.service_type_id,
        minimum_duration: rule.minimum_duration,
        maximum_duration: rule.maximum_duration,
        buffer_before: rule.buffer_before,
        buffer_after: rule.buffer_after,
        max_daily_bookings: rule.max_daily_bookings,
        requires_specific_professional: rule.requires_specific_professional,
        allowed_professional_ids: rule.allowed_professional_ids || [],
        minimum_advance_hours: rule.minimum_advance_hours,
        maximum_advance_days: rule.maximum_advance_days,
        allow_same_day: rule.allow_same_day,
        description: rule.description || "",
      });
    } else {
      setEditingRule(null);
      setFormData({
        service_type_id: "",
        minimum_duration: 30,
        maximum_duration: 180,
        buffer_before: 0,
        buffer_after: 0,
        max_daily_bookings: undefined,
        requires_specific_professional: false,
        allowed_professional_ids: [],
        minimum_advance_hours: 0,
        maximum_advance_days: 90,
        allow_same_day: true,
        description: "",
      });
    }
    setIsDialogOpen(true);
  };
  var closeDialog = function () {
    setIsDialogOpen(false);
    setEditingRule(null);
  };
  var saveRule = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var method, url, response, savedRule_1, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            // Basic validation
            if (!formData.service_type_id) {
              sonner_1.toast.error("Selecione um tipo de serviço");
              return [2 /*return*/];
            }
            if (formData.minimum_duration > formData.maximum_duration) {
              sonner_1.toast.error("Duração mínima deve ser menor que duração máxima");
              return [2 /*return*/];
            }
            if (
              formData.requires_specific_professional &&
              formData.allowed_professional_ids.length === 0
            ) {
              sonner_1.toast.error(
                'Selecione pelo menos um profissional quando "Requer profissional específico" está ativo',
              );
              return [2 /*return*/];
            }
            method = editingRule ? "PUT" : "POST";
            url = editingRule
              ? "/api/clinic/".concat(clinicId, "/service-rules/").concat(editingRule.id)
              : "/api/clinic/".concat(clinicId, "/service-rules");
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
              throw new Error("Failed to save rule");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            savedRule_1 = _a.sent();
            if (editingRule) {
              setRules(function (prev) {
                return prev.map(function (r) {
                  return r.id === editingRule.id ? savedRule_1 : r;
                });
              });
              sonner_1.toast.success("Regra atualizada com sucesso!");
            } else {
              setRules(function (prev) {
                return __spreadArray(__spreadArray([], prev, true), [savedRule_1], false);
              });
              sonner_1.toast.success("Regra adicionada com sucesso!");
            }
            closeDialog();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            console.error("Error saving rule:", error_4);
            sonner_1.toast.error("Erro ao salvar regra");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var deleteRule = function (ruleId) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/clinic/".concat(clinicId, "/service-rules/").concat(ruleId), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to delete rule");
            }
            setRules(function (prev) {
              return prev.filter(function (r) {
                return r.id !== ruleId;
              });
            });
            sonner_1.toast.success("Regra removida com sucesso!");
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Error deleting rule:", error_5);
            sonner_1.toast.error("Erro ao remover regra");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var toggleRuleStatus = function (ruleId, isActive) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/clinic/".concat(clinicId, "/service-rules/").concat(ruleId), {
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
              throw new Error("Failed to update rule status");
            }
            setRules(function (prev) {
              return prev.map(function (r) {
                return r.id === ruleId ? __assign(__assign({}, r), { is_active: isActive }) : r;
              });
            });
            sonner_1.toast.success(
              "Regra ".concat(isActive ? "ativada" : "desativada", " com sucesso!"),
            );
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Error updating rule status:", error_6);
            sonner_1.toast.error("Erro ao atualizar status da regra");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  var getServiceName = function (serviceId) {
    var service = services.find(function (s) {
      return s.id === serviceId;
    });
    return (
      (service === null || service === void 0 ? void 0 : service.name) || "Serviço não encontrado"
    );
  };
  var getProfessionalNames = function (professionalIds) {
    return professionalIds.map(function (id) {
      var professional = professionals.find(function (p) {
        return p.id === id;
      });
      return (
        (professional === null || professional === void 0 ? void 0 : professional.name) ||
        "Profissional não encontrado"
      );
    });
  };
  var formatDuration = function (minutes) {
    if (minutes < 60) return "".concat(minutes, "min");
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    return mins > 0 ? "".concat(hours, "h").concat(mins, "min") : "".concat(hours, "h");
  };
  var formatAdvanceTime = function (rule) {
    if (!rule.allow_same_day && rule.minimum_advance_hours === 0) {
      return "Não permite agendamento no mesmo dia";
    }
    if (rule.minimum_advance_hours === 0) {
      return "Permite agendamento imediato";
    }
    if (rule.minimum_advance_hours >= 24) {
      var days = Math.floor(rule.minimum_advance_hours / 24);
      return "M\u00EDn. ".concat(days, " dia").concat(days > 1 ? "s" : "", " de anteced\u00EAncia");
    }
    return "M\u00EDn. ".concat(rule.minimum_advance_hours, "h de anteced\u00EAncia");
  };
  if (isLoading) {
    return (
      <card_1.Card>
        <card_1.CardContent className="p-6">
          <div className="flex items-center gap-2">
            <lucide_react_1.Settings className="h-4 w-4 animate-spin" />
            <span>Carregando regras...</span>
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
            <lucide_react_1.Settings className="h-5 w-5" />
            Regras de Tipos de Serviços
          </card_1.CardTitle>
          <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button
                onClick={function () {
                  return openDialog();
                }}
              >
                <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>
                  {editingRule ? "Editar" : "Criar"} Regra de Serviço
                </dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Configure restrições e parâmetros específicos para tipos de serviços.
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>

              <div className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label_1.Label>Tipo de Serviço *</label_1.Label>
                  <select_1.Select
                    value={formData.service_type_id}
                    onValueChange={function (value) {
                      return setFormData(function (prev) {
                        return __assign(__assign({}, prev), { service_type_id: value });
                      });
                    }}
                  >
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Selecione um serviço" />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {services.map(function (service) {
                        return (
                          <select_1.SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </select_1.SelectItem>
                        );
                      })}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                {/* Duration Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <lucide_react_1.Clock className="h-4 w-4" />
                    Configurações de Duração
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label_1.Label>Duração mínima (min) *</label_1.Label>
                      <input_1.Input
                        type="number"
                        min="15"
                        step="15"
                        value={formData.minimum_duration}
                        onChange={function (e) {
                          return setFormData(function (prev) {
                            return __assign(__assign({}, prev), {
                              minimum_duration: parseInt(e.target.value) || 30,
                            });
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label_1.Label>Duração máxima (min) *</label_1.Label>
                      <input_1.Input
                        type="number"
                        min="15"
                        step="15"
                        value={formData.maximum_duration}
                        onChange={function (e) {
                          return setFormData(function (prev) {
                            return __assign(__assign({}, prev), {
                              maximum_duration: parseInt(e.target.value) || 180,
                            });
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label_1.Label>Buffer antes (min)</label_1.Label>
                      <input_1.Input
                        type="number"
                        min="0"
                        step="5"
                        value={formData.buffer_before}
                        onChange={function (e) {
                          return setFormData(function (prev) {
                            return __assign(__assign({}, prev), {
                              buffer_before: parseInt(e.target.value) || 0,
                            });
                          });
                        }}
                      />
                    </div>
                    <div>
                      <label_1.Label>Buffer depois (min)</label_1.Label>
                      <input_1.Input
                        type="number"
                        min="0"
                        step="5"
                        value={formData.buffer_after}
                        onChange={function (e) {
                          return setFormData(function (prev) {
                            return __assign(__assign({}, prev), {
                              buffer_after: parseInt(e.target.value) || 0,
                            });
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Limits */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <lucide_react_1.Users className="h-4 w-4" />
                    Limites de Agendamento
                  </h4>
                  <div>
                    <label_1.Label>Máximo de agendamentos por dia</label_1.Label>
                    <input_1.Input
                      type="number"
                      min="1"
                      value={formData.max_daily_bookings || ""}
                      onChange={function (e) {
                        return setFormData(function (prev) {
                          return __assign(__assign({}, prev), {
                            max_daily_bookings: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          });
                        });
                      }}
                      placeholder="Deixe vazio para sem limite"
                    />
                  </div>
                </div>

                {/* Professional Requirements */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <lucide_react_1.UserCheck className="h-4 w-4" />
                    Requisitos de Profissionais
                  </h4>

                  <div className="flex items-center space-x-2">
                    <switch_1.Switch
                      checked={formData.requires_specific_professional}
                      onCheckedChange={function (checked) {
                        return setFormData(function (prev) {
                          return __assign(__assign({}, prev), {
                            requires_specific_professional: checked,
                            allowed_professional_ids: checked ? prev.allowed_professional_ids : [],
                          });
                        });
                      }}
                    />
                    <label_1.Label>Requer profissional específico</label_1.Label>
                  </div>

                  {formData.requires_specific_professional && (
                    <div>
                      <label_1.Label>Profissionais autorizados</label_1.Label>
                      <select_1.Select
                        value=""
                        onValueChange={function (professionalId) {
                          if (!formData.allowed_professional_ids.includes(professionalId)) {
                            setFormData(function (prev) {
                              return __assign(__assign({}, prev), {
                                allowed_professional_ids: __spreadArray(
                                  __spreadArray([], prev.allowed_professional_ids, true),
                                  [professionalId],
                                  false,
                                ),
                              });
                            });
                          }
                        }}
                      >
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Adicionar profissional" />
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                          {professionals
                            .filter(function (p) {
                              return !formData.allowed_professional_ids.includes(p.id);
                            })
                            .map(function (professional) {
                              return (
                                <select_1.SelectItem key={professional.id} value={professional.id}>
                                  {professional.name}
                                </select_1.SelectItem>
                              );
                            })}
                        </select_1.SelectContent>
                      </select_1.Select>

                      {formData.allowed_professional_ids.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {getProfessionalNames(formData.allowed_professional_ids).map(
                            function (name, index) {
                              return (
                                <badge_1.Badge
                                  key={index}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={function () {
                                    var professionalId = formData.allowed_professional_ids[index];
                                    setFormData(function (prev) {
                                      return __assign(__assign({}, prev), {
                                        allowed_professional_ids:
                                          prev.allowed_professional_ids.filter(function (id) {
                                            return id !== professionalId;
                                          }),
                                      });
                                    });
                                  }}
                                >
                                  {name} ×
                                </badge_1.Badge>
                              );
                            },
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Advance Booking */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Agendamento Antecipado</h4>

                  <div className="flex items-center space-x-2">
                    <switch_1.Switch
                      checked={formData.allow_same_day}
                      onCheckedChange={function (checked) {
                        return setFormData(function (prev) {
                          return __assign(__assign({}, prev), {
                            allow_same_day: checked,
                            minimum_advance_hours: checked ? prev.minimum_advance_hours : 24,
                          });
                        });
                      }}
                    />
                    <label_1.Label>Permite agendamento no mesmo dia</label_1.Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label_1.Label>Mínimo antecedência (horas)</label_1.Label>
                      <input_1.Input
                        type="number"
                        min="0"
                        value={formData.minimum_advance_hours}
                        onChange={function (e) {
                          return setFormData(function (prev) {
                            return __assign(__assign({}, prev), {
                              minimum_advance_hours: parseInt(e.target.value) || 0,
                            });
                          });
                        }}
                        disabled={!formData.allow_same_day && formData.minimum_advance_hours < 24}
                      />
                    </div>
                    <div>
                      <label_1.Label>Máximo antecedência (dias)</label_1.Label>
                      <input_1.Input
                        type="number"
                        min="1"
                        value={formData.maximum_advance_days}
                        onChange={function (e) {
                          return setFormData(function (prev) {
                            return __assign(__assign({}, prev), {
                              maximum_advance_days: parseInt(e.target.value) || 90,
                            });
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label_1.Label>Descrição/Observações</label_1.Label>
                  <textarea_1.Textarea
                    value={formData.description}
                    onChange={function (e) {
                      return setFormData(function (prev) {
                        return __assign(__assign({}, prev), { description: e.target.value });
                      });
                    }}
                    placeholder="Detalhes adicionais sobre esta regra..."
                    rows={2}
                  />
                </div>
              </div>

              <dialog_1.DialogFooter>
                <button_1.Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </button_1.Button>
                <button_1.Button onClick={saveRule}>
                  <lucide_react_1.Save className="h-4 w-4 mr-2" />
                  Salvar Regra
                </button_1.Button>
              </dialog_1.DialogFooter>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <div className="space-y-4">
          {rules.length === 0
            ? <div className="text-center py-8 text-muted-foreground">
                <lucide_react_1.Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma regra configurada</p>
                <p className="text-sm">
                  Clique em "Nova Regra" para criar restrições específicas por tipo de serviço
                </p>
              </div>
            : rules.map(function (rule) {
                var serviceName = getServiceName(rule.service_type_id);
                var professionalNames = getProfessionalNames(rule.allowed_professional_ids || []);
                return (
                  <card_1.Card key={rule.id} className={!rule.is_active ? "opacity-60" : ""}>
                    <card_1.CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{serviceName}</h4>
                            {!rule.is_active && (
                              <badge_1.Badge variant="outline" className="text-xs">
                                Inativa
                              </badge_1.Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <lucide_react_1.Clock className="h-3 w-3" />
                                Duração: {formatDuration(rule.minimum_duration)} -{" "}
                                {formatDuration(rule.maximum_duration)}
                              </div>
                              {(rule.buffer_before > 0 || rule.buffer_after > 0) && (
                                <div className="text-xs">
                                  Buffer: {rule.buffer_before}min antes, {rule.buffer_after}min
                                  depois
                                </div>
                              )}
                              {rule.max_daily_bookings && (
                                <div className="flex items-center gap-1">
                                  <lucide_react_1.Users className="h-3 w-3" />
                                  Máx: {rule.max_daily_bookings} agendamentos/dia
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <div>{formatAdvanceTime(rule)}</div>
                              <div className="text-xs">
                                Máx: {rule.maximum_advance_days} dias de antecedência
                              </div>
                              {rule.requires_specific_professional && (
                                <div className="text-xs">
                                  <lucide_react_1.UserCheck className="h-3 w-3 inline mr-1" />
                                  Profissionais: {professionalNames.join(", ") || "Nenhum"}
                                </div>
                              )}
                            </div>
                          </div>

                          {rule.description && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              {rule.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <switch_1.Switch
                            checked={rule.is_active}
                            onCheckedChange={function (checked) {
                              return toggleRuleStatus(rule.id, checked);
                            }}
                          />
                          <button_1.Button
                            variant="ghost"
                            size="sm"
                            onClick={function () {
                              return openDialog(rule);
                            }}
                          >
                            <lucide_react_1.Edit className="h-3 w-3" />
                          </button_1.Button>
                          <button_1.Button
                            variant="ghost"
                            size="sm"
                            onClick={function () {
                              return deleteRule(rule.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <lucide_react_1.Trash2 className="h-3 w-3" />
                          </button_1.Button>
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                );
              })}
        </div>

        {rules.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <div className="flex items-start gap-2">
              <lucide_react_1.AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700">
                <p className="font-medium mb-1">Como funcionam as regras:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>
                    <strong>Duração:</strong> Define limites mín/máx para o serviço
                  </li>
                  <li>
                    <strong>Buffer:</strong> Tempo adicional antes/depois do agendamento
                  </li>
                  <li>
                    <strong>Limites diários:</strong> Controla quantidade de agendamentos por dia
                  </li>
                  <li>
                    <strong>Profissionais específicos:</strong> Restringe quem pode executar o
                    serviço
                  </li>
                  <li>
                    <strong>Antecedência:</strong> Define quando é possível agendar
                  </li>
                  <li>Regras inativas não são aplicadas na validação</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
