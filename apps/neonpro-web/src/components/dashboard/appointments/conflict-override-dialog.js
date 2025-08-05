// Conflict Override Dialog Component with Manager Approval Workflow
"use client";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictOverrideDialog = ConflictOverrideDialog;
var react_1 = require("react");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var use_conflict_override_1 = require("@/hooks/use-conflict-override");
var use_toast_1 = require("@/hooks/use-toast");
var dayjs_1 = require("dayjs");
var OVERRIDE_REASONS = [
  {
    value: "emergency_appointment",
    label: "Emergência Médica",
    description: "Situação de emergência que requer atendimento imediato",
  },
  {
    value: "medical_priority",
    label: "Prioridade Médica",
    description: "Paciente com condição que requer priorização médica",
  },
  {
    value: "patient_preference",
    label: "Preferência do Paciente",
    description: "Solicitação específica do paciente por motivos pessoais",
  },
  {
    value: "schedule_optimization",
    label: "Otimização de Agenda",
    description: "Melhoria na eficiência da agenda clínica",
  },
  {
    value: "special_circumstances",
    label: "Circunstâncias Especiais",
    description: "Situação única que justifica o override",
  },
  {
    value: "administrative_decision",
    label: "Decisão Administrativa",
    description: "Decisão da gestão clínica",
  },
];
function ConflictOverrideDialog(_a) {
  var open = _a.open,
    onOpenChange = _a.onOpenChange,
    conflictDetails = _a.conflictDetails,
    onOverrideComplete = _a.onOverrideComplete;
  var _b = (0, react_1.useState)("emergency_appointment"),
    selectedReason = _b[0],
    setSelectedReason = _b[1];
  var _c = (0, react_1.useState)(""),
    reasonText = _c[0],
    setReasonText = _c[1];
  var _d = (0, react_1.useState)("request"),
    activeTab = _d[0],
    setActiveTab = _d[1];
  var _e = (0, use_conflict_override_1.useConflictOverride)(),
    loading = _e.loading,
    userPermissions = _e.userPermissions,
    requestConflictOverride = _e.requestConflictOverride,
    checkOverridePermissions = _e.checkOverridePermissions;
  var toast = (0, use_toast_1.useToast)().toast;
  (0, react_1.useEffect)(() => {
    if (open) {
      checkOverridePermissions();
    }
  }, [open, checkOverridePermissions]);
  var handleSubmitOverride = () =>
    __awaiter(this, void 0, void 0, function () {
      var overrideRequest, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!conflictDetails) return [2 /*return*/];
            if (!reasonText.trim()) {
              toast({
                variant: "destructive",
                title: "Justificativa Obrigatória",
                description: "Por favor, forneça uma justificativa detalhada para o override.",
              });
              return [2 /*return*/];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              requestConflictOverride({
                appointment_id: conflictDetails.appointment_id,
                conflict_type: conflictDetails.conflict_type,
                conflict_details: conflictDetails.conflict_description,
                override_reason: selectedReason,
                override_reason_text: reasonText,
                requested_by: "", // Will be filled by the hook
                impact_assessment: {
                  affected_appointments: conflictDetails.affected_appointments,
                  estimated_delay_minutes: conflictDetails.estimated_impact_minutes,
                  notification_required: conflictDetails.affected_appointments.length > 0,
                },
              }),
            ];
          case 2:
            overrideRequest = _a.sent();
            onOverrideComplete === null || onOverrideComplete === void 0
              ? void 0
              : onOverrideComplete(overrideRequest);
            onOpenChange(false);
            // Reset form
            setSelectedReason("emergency_appointment");
            setReasonText("");
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  var getImpactSeverity = (minutes) => {
    if (minutes <= 30) return { level: "low", color: "bg-green-100 text-green-800" };
    if (minutes <= 120) return { level: "medium", color: "bg-yellow-100 text-yellow-800" };
    return { level: "high", color: "bg-red-100 text-red-800" };
  };
  var canRequestOverride =
    userPermissions === null || userPermissions === void 0
      ? void 0
      : userPermissions.can_override_conflicts;
  var requiresApproval =
    userPermissions === null || userPermissions === void 0
      ? void 0
      : userPermissions.requires_approval;
  var impactSeverity = conflictDetails
    ? getImpactSeverity(conflictDetails.estimated_impact_minutes)
    : null;
  if (!conflictDetails) return null;
  return (
    <dialog_1.Dialog open={open} onOpenChange={onOpenChange}>
      <dialog_1.DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2">
            <lucide_react_1.AlertTriangle className="h-5 w-5 text-orange-500" />
            Sistema de Override de Conflitos
          </dialog_1.DialogTitle>
        </dialog_1.DialogHeader>

        <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <tabs_1.TabsList className="grid w-full grid-cols-3">
            <tabs_1.TabsTrigger value="conflict">Detalhes do Conflito</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="request">Solicitar Override</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="impact">Avaliação de Impacto</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="conflict" className="space-y-4">
            <card_1.Card className="border-red-200 bg-red-50/50">
              <card_1.CardHeader>
                <card_1.CardTitle className="text-red-700 text-lg flex items-center gap-2">
                  <lucide_react_1.AlertTriangle className="h-5 w-5" />
                  Conflito Identificado
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label_1.Label className="text-red-600 font-medium">
                      Tipo de Conflito:
                    </label_1.Label>
                    <p className="mt-1">{conflictDetails.conflict_type}</p>
                  </div>
                  <div>
                    <label_1.Label className="text-red-600 font-medium">
                      ID do Agendamento:
                    </label_1.Label>
                    <p className="mt-1 font-mono text-sm">{conflictDetails.appointment_id}</p>
                  </div>
                </div>
                <div>
                  <label_1.Label className="text-red-600 font-medium">Descrição:</label_1.Label>
                  <p className="mt-1">{conflictDetails.conflict_description}</p>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {conflictDetails.affected_appointments.length > 0 && (
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="text-lg">Agendamentos Afetados</card_1.CardTitle>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    {conflictDetails.affected_appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <lucide_react_1.User className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="font-medium">{appointment.patient_name}</p>
                            <p className="text-sm text-gray-600">{appointment.service_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {(0, dayjs_1.default)(appointment.original_time).format(
                              "DD/MM/YYYY HH:mm",
                            )}
                          </p>
                          <badge_1.Badge variant="secondary" className="text-xs">
                            Reagendamento Necessário
                          </badge_1.Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            )}
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="request" className="space-y-4">
            {!canRequestOverride
              ? <card_1.Card className="border-orange-200 bg-orange-50/50">
                  <card_1.CardContent className="pt-6">
                    <div className="text-center">
                      <lucide_react_1.AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-orange-700 mb-2">
                        Permissão Insuficiente
                      </h3>
                      <p className="text-orange-600">
                        Você não tem permissão para solicitar override de conflitos. Entre em
                        contato com um supervisor ou gerente da clínica.
                      </p>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              : <>
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="text-lg">
                        Justificativa para Override
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent className="space-y-4">
                      <div>
                        <label_1.Label htmlFor="reason">Motivo Principal</label_1.Label>
                        <select_1.Select
                          value={selectedReason}
                          onValueChange={(value) => setSelectedReason(value)}
                        >
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione o motivo" />
                          </select_1.SelectTrigger>
                          <select_1.SelectContent>
                            {OVERRIDE_REASONS.map((reason) => (
                              <select_1.SelectItem key={reason.value} value={reason.value}>
                                <div>
                                  <div className="font-medium">{reason.label}</div>
                                  <div className="text-xs text-gray-500">{reason.description}</div>
                                </div>
                              </select_1.SelectItem>
                            ))}
                          </select_1.SelectContent>
                        </select_1.Select>
                      </div>

                      <div>
                        <label_1.Label htmlFor="reason-text">
                          Justificativa Detalhada *
                        </label_1.Label>
                        <textarea_1.Textarea
                          id="reason-text"
                          value={reasonText}
                          onChange={(e) => setReasonText(e.target.value)}
                          placeholder="Forneça uma justificativa detalhada para este override, incluindo quaisquer circunstâncias especiais ou considerações médicas..."
                          rows={4}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Esta justificativa será registrada no audit log e pode ser revisada
                          durante auditorias.
                        </p>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  {requiresApproval && (
                    <card_1.Card className="border-blue-200 bg-blue-50/50">
                      <card_1.CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <lucide_react_1.Bell className="h-5 w-5 text-blue-600 mt-1" />
                          <div>
                            <h4 className="font-medium text-blue-700">Aprovação Necessária</h4>
                            <p className="text-sm text-blue-600 mt-1">
                              Sua solicitação de override será enviada para aprovação de um
                              supervisor ou gerente. Você será notificado sobre o status da
                              aprovação.
                            </p>
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  )}
                </>}
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="impact" className="space-y-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-lg">Análise de Impacto</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <lucide_react_1.Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                      {conflictDetails.estimated_impact_minutes}
                    </p>
                    <p className="text-sm text-gray-600">Minutos de Impacto</p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <lucide_react_1.User className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-800">
                      {conflictDetails.affected_appointments.length}
                    </p>
                    <p className="text-sm text-gray-600">Pacientes Afetados</p>
                  </div>

                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <badge_1.Badge
                      className={"".concat(
                        impactSeverity === null || impactSeverity === void 0
                          ? void 0
                          : impactSeverity.color,
                        " text-lg px-3 py-1",
                      )}
                    >
                      {(impactSeverity === null || impactSeverity === void 0
                        ? void 0
                        : impactSeverity.level) === "low" && "Baixo"}
                      {(impactSeverity === null || impactSeverity === void 0
                        ? void 0
                        : impactSeverity.level) === "medium" && "Médio"}
                      {(impactSeverity === null || impactSeverity === void 0
                        ? void 0
                        : impactSeverity.level) === "high" && "Alto"}
                    </badge_1.Badge>
                    <p className="text-sm text-gray-600 mt-2">Nível de Impacto</p>
                  </div>
                </div>

                <separator_1.Separator />

                <div>
                  <h4 className="font-medium mb-3">Ações Automáticas após Aprovação:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Notificações automáticas enviadas aos pacientes afetados
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Registro completo no audit log para compliance
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Atualização automática das agendas afetadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Alertas para a equipe sobre mudanças na agenda
                      </span>
                    </div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button_1.Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </button_1.Button>

          {canRequestOverride && activeTab === "request" && (
            <button_1.Button
              onClick={handleSubmitOverride}
              disabled={loading || !reasonText.trim()}
              className="min-w-[140px]"
            >
              {loading
                ? "Processando..."
                : requiresApproval
                  ? "Solicitar Aprovação"
                  : "Aplicar Override"}
            </button_1.Button>
          )}
        </div>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>
  );
}
