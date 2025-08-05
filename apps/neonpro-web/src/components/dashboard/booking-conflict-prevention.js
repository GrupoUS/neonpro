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
exports.BookingConflictPrevention = BookingConflictPrevention;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var use_toast_1 = require("@/hooks/use-toast");
var client_1 = require("@/app/utils/supabase/client");
function BookingConflictPrevention(_a) {
  var selectedSlot = _a.selectedSlot,
    patientId = _a.patientId,
    onConflictResolved = _a.onConflictResolved;
  var _b = (0, react_1.useState)(false),
    isChecking = _b[0],
    setIsChecking = _b[1];
  var _c = (0, react_1.useState)(null),
    conflictDetector = _c[0],
    setConflictDetector = _c[1];
  var _d = (0, react_1.useState)(null),
    lastCheckedAt = _d[0],
    setLastCheckedAt = _d[1];
  var supabase = (0, client_1.createClient)();
  var toast = (0, use_toast_1.useToast)().toast;
  var checkIntervalRef = (0, react_1.useRef)(null);
  // Função para verificar conflitos
  var checkForConflicts = (slot) =>
    __awaiter(this, void 0, void 0, function () {
      var _a,
        currentSlot,
        slotError,
        _b,
        professionalSlots,
        profError,
        conflictingSlots,
        _c,
        patientAppointments,
        patientError,
        sameDayAppointments,
        error_1;
      return __generator(this, (_d) => {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              supabase.from("time_slots").select("*").eq("id", slot.id).single(),
            ];
          case 1:
            (_a = _d.sent()), (currentSlot = _a.data), (slotError = _a.error);
            if (slotError) {
              throw new Error("Erro ao verificar slot: ".concat(slotError.message));
            }
            if (!currentSlot.is_available) {
              return [
                2 /*return*/,
                {
                  hasConflict: true,
                  conflictType: "double_booking",
                  conflictingSlots: [currentSlot],
                  message: "Este horário foi reservado por outro paciente",
                },
              ];
            }
            return [
              4 /*yield*/,
              supabase
                .from("time_slots")
                .select("\n          *,\n          appointments!inner(*)\n        ")
                .eq("professional_id", slot.professional_id)
                .eq("date", slot.date)
                .neq("id", slot.id),
            ];
          case 2:
            (_b = _d.sent()), (professionalSlots = _b.data), (profError = _b.error);
            if (profError) {
              throw new Error("Erro ao verificar profissional: ".concat(profError.message));
            }
            conflictingSlots = professionalSlots.filter((profSlot) => {
              var slotStart = new Date("".concat(slot.date, "T").concat(slot.start_time));
              var slotEnd = new Date("".concat(slot.date, "T").concat(slot.end_time));
              var profStart = new Date("".concat(profSlot.date, "T").concat(profSlot.start_time));
              var profEnd = new Date("".concat(profSlot.date, "T").concat(profSlot.end_time));
              return (
                (slotStart < profEnd && slotEnd > profStart) ||
                (profStart < slotEnd && profEnd > slotStart)
              );
            });
            if (conflictingSlots.length > 0) {
              return [
                2 /*return*/,
                {
                  hasConflict: true,
                  conflictType: "time_overlap",
                  conflictingSlots: conflictingSlots,
                  message: "O profissional possui outro compromisso neste horário",
                },
              ];
            }
            return [
              4 /*yield*/,
              supabase
                .from("appointments")
                .select("\n          *,\n          time_slot:time_slots(*)\n        ")
                .eq("patient_id", patientId)
                .eq("status", "confirmed"),
            ];
          case 3:
            (_c = _d.sent()), (patientAppointments = _c.data), (patientError = _c.error);
            if (patientError) {
              throw new Error("Erro ao verificar paciente: ".concat(patientError.message));
            }
            sameDayAppointments = patientAppointments.filter((apt) => {
              var _a;
              return (
                ((_a = apt.time_slot) === null || _a === void 0 ? void 0 : _a.date) === slot.date
              );
            });
            if (sameDayAppointments.length > 0) {
              return [
                2 /*return*/,
                {
                  hasConflict: true,
                  conflictType: "double_booking",
                  conflictingSlots: sameDayAppointments.map((apt) => apt.time_slot),
                  message: "Você já possui um agendamento neste dia",
                },
              ];
            }
            // Nenhum conflito encontrado
            return [
              2 /*return*/,
              {
                hasConflict: false,
                conflictType: null,
                conflictingSlots: [],
                message: "Nenhum conflito detectado",
              },
            ];
          case 4:
            error_1 = _d.sent();
            console.error("Erro na verificação de conflitos:", error_1);
            return [
              2 /*return*/,
              {
                hasConflict: true,
                conflictType: "professional_unavailable",
                conflictingSlots: [],
                message: error_1 instanceof Error ? error_1.message : "Erro desconhecido",
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Função para executar verificação
  var runConflictCheck = () =>
    __awaiter(this, void 0, void 0, function () {
      var detector, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!selectedSlot) return [2 /*return*/];
            setIsChecking(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, checkForConflicts(selectedSlot)];
          case 2:
            detector = _a.sent();
            setConflictDetector(detector);
            setLastCheckedAt(new Date());
            // Notificar sobre conflitos
            if (detector.hasConflict) {
              toast({
                title: "Conflito detectado",
                description: detector.message,
                variant: "destructive",
              });
            } else {
              toast({
                title: "Verificação concluída",
                description: "Nenhum conflito encontrado",
                duration: 2000,
              });
            }
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            console.error("Erro na verificação:", error_2);
            toast({
              title: "Erro na verificação",
              description: "Não foi possível verificar conflitos",
              variant: "destructive",
            });
            return [3 /*break*/, 5];
          case 4:
            setIsChecking(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Função para resolver conflito
  var resolveConflict = () =>
    __awaiter(this, void 0, void 0, function () {
      var _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            if (
              !(conflictDetector === null || conflictDetector === void 0
                ? void 0
                : conflictDetector.hasConflict)
            )
              return [2 /*return*/];
            _a = conflictDetector.conflictType;
            switch (_a) {
              case "double_booking":
                return [3 /*break*/, 1];
              case "time_overlap":
                return [3 /*break*/, 1];
              case "professional_unavailable":
                return [3 /*break*/, 2];
            }
            return [3 /*break*/, 4];
          case 1:
            // Sugerir horários alternativos
            toast({
              title: "Sugestão",
              description: "Selecione outro horário disponível",
            });
            onConflictResolved === null || onConflictResolved === void 0
              ? void 0
              : onConflictResolved();
            return [3 /*break*/, 4];
          case 2:
            // Atualizar dados
            return [4 /*yield*/, runConflictCheck()];
          case 3:
            // Atualizar dados
            _b.sent();
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  if (!selectedSlot) {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2 text-sm">
            <lucide_react_1.Shield className="h-4 w-4" />
            Prevenção de Conflitos
          </card_1.CardTitle>
          <card_1.CardDescription className="text-xs">
            Selecione um horário para verificar conflitos
          </card_1.CardDescription>
        </card_1.CardHeader>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="flex items-center gap-2 text-sm">
              <lucide_react_1.Shield className="h-4 w-4" />
              Prevenção de Conflitos
            </card_1.CardTitle>
            <card_1.CardDescription className="text-xs">
              Verificação automática de disponibilidade
            </card_1.CardDescription>
          </div>

          <button_1.Button
            size="sm"
            variant="outline"
            onClick={runConflictCheck}
            disabled={isChecking}
          >
            <lucide_react_1.RefreshCw
              className={"h-3 w-3 mr-1 ".concat(isChecking ? "animate-spin" : "")}
            />
            Verificar
          </button_1.Button>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="space-y-4">
        {/* Informações do slot selecionado */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Horário selecionado:</span>
            <badge_1.Badge variant="outline">
              <lucide_react_1.Clock className="h-3 w-3 mr-1" />
              {(0, date_fns_1.format)(new Date(selectedSlot.date + "T00:00:00"), "dd/MM/yyyy", {
                locale: locale_1.pt,
              })}
              {" às "}
              {(0, date_fns_1.format)(
                new Date("2000-01-01T".concat(selectedSlot.start_time)),
                "HH:mm",
              )}
            </badge_1.Badge>
          </div>

          {lastCheckedAt && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Última verificação:</span>
              <span>{(0, date_fns_1.format)(lastCheckedAt, "HH:mm:ss")}</span>
            </div>
          )}
        </div>

        <separator_1.Separator />

        {/* Status da verificação */}
        {isChecking && (
          <div className="flex items-center gap-2 text-sm">
            <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin" />
            <span>Verificando conflitos...</span>
          </div>
        )}

        {conflictDetector && !isChecking && (
          <div className="space-y-3">
            {conflictDetector.hasConflict
              ? <alert_1.Alert variant="destructive">
                  <lucide_react_1.AlertTriangle className="h-4 w-4" />
                  <alert_1.AlertDescription className="text-sm">
                    <strong>Conflito detectado:</strong> {conflictDetector.message}
                  </alert_1.AlertDescription>
                </alert_1.Alert>
              : <alert_1.Alert>
                  <lucide_react_1.CheckCircle className="h-4 w-4" />
                  <alert_1.AlertDescription className="text-sm">
                    <strong>Disponível:</strong> {conflictDetector.message}
                  </alert_1.AlertDescription>
                </alert_1.Alert>}

            {/* Detalhes dos conflitos */}
            {conflictDetector.conflictingSlots.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Horários conflitantes:</p>
                {conflictDetector.conflictingSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs p-2 bg-muted rounded"
                  >
                    <div className="flex items-center gap-2">
                      <lucide_react_1.Users className="h-3 w-3" />
                      <span>
                        {slot.date} às {slot.start_time}
                      </span>
                    </div>
                    <badge_1.Badge variant="secondary" className="text-xs">
                      {slot.is_available ? "Disponível" : "Ocupado"}
                    </badge_1.Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Ações de resolução */}
            {conflictDetector.hasConflict && (
              <button_1.Button
                size="sm"
                variant="outline"
                onClick={resolveConflict}
                className="w-full"
              >
                Resolver Conflito
              </button_1.Button>
            )}
          </div>
        )}
      </card_1.CardContent>
    </card_1.Card>
  );
}
