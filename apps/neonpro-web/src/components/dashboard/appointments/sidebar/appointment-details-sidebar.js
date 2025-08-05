// components/dashboard/appointments/sidebar/appointment-details-sidebar.tsx
// Main appointment details sidebar with view/edit modes
// Story 1.1 Task 5 - Appointment Details Modal/Sidebar
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
exports.default = AppointmentDetailsSidebar;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var sheet_1 = require("@/components/ui/sheet");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var appointment_details_1 = require("./appointment-details");
var appointment_edit_form_1 = require("./appointment-edit-form");
var appointment_history_1 = require("./appointment-history");
function AppointmentDetailsSidebar(_a) {
  var isOpen = _a.isOpen,
    appointmentId = _a.appointmentId,
    onClose = _a.onClose,
    onUpdate = _a.onUpdate,
    onDelete = _a.onDelete;
  var _b = (0, react_1.useState)("view"),
    mode = _b[0],
    setMode = _b[1];
  var _c = (0, react_1.useState)(null),
    appointment = _c[0],
    setAppointment = _c[1];
  var _d = (0, react_1.useState)([]),
    history = _d[0],
    setHistory = _d[1];
  var _e = (0, react_1.useState)(false),
    loading = _e[0],
    setLoading = _e[1];
  var _f = (0, react_1.useState)(false),
    updating = _f[0],
    setUpdating = _f[1];
  // Fetch appointment details
  var fetchAppointmentDetails = (id) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            return [4 /*yield*/, fetch("/api/appointments/".concat(id))];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (!response.ok || !data.success) {
              throw new Error(data.error_message || "Failed to fetch appointment");
            }
            setAppointment(data.data);
            return [3 /*break*/, 5];
          case 3:
            error_1 = _a.sent();
            console.error("Error fetching appointment:", error_1);
            sonner_1.toast.error("Erro ao carregar agendamento");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    }); // Fetch appointment history
  var fetchAppointmentHistory = (id) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/appointments/".concat(id, "/history"))];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (response.ok && data.success) {
              setHistory(data.data || []);
            }
            return [3 /*break*/, 4];
          case 3:
            error_2 = _a.sent();
            console.error("Error fetching appointment history:", error_2);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  // Load appointment data when opened
  (0, react_1.useEffect)(() => {
    if (isOpen && appointmentId) {
      setMode("view");
      fetchAppointmentDetails(appointmentId);
      fetchAppointmentHistory(appointmentId);
    } else {
      setAppointment(null);
      setHistory([]);
    }
  }, [isOpen, appointmentId]);
  // Handle appointment update
  var handleUpdate = (updatedAppointment) =>
    __awaiter(this, void 0, void 0, function () {
      var error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setUpdating(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, 5, 6]);
            // Update local state
            setAppointment(updatedAppointment);
            setMode("view");
            if (!appointmentId) return [3 /*break*/, 3];
            return [4 /*yield*/, fetchAppointmentHistory(appointmentId)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Notify parent component
            if (onUpdate) {
              onUpdate(updatedAppointment);
            }
            sonner_1.toast.success("Agendamento atualizado com sucesso");
            return [3 /*break*/, 6];
          case 4:
            error_3 = _a.sent();
            console.error("Error handling update:", error_3);
            sonner_1.toast.error("Erro ao atualizar agendamento");
            return [3 /*break*/, 6];
          case 5:
            setUpdating(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    }); // Handle appointment deletion
  var handleDelete = (reason) =>
    __awaiter(this, void 0, void 0, function () {
      var response, data, error_4;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            if (!appointmentId) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              fetch("/api/appointments/".concat(appointmentId), {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: reason }),
              }),
            ];
          case 2:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 3:
            data = _a.sent();
            if (!response.ok || !data.success) {
              throw new Error(data.error_message || "Failed to delete appointment");
            }
            // Notify parent component
            if (onDelete) {
              onDelete(appointmentId);
            }
            // Close sidebar
            onClose();
            sonner_1.toast.success("Agendamento cancelado com sucesso");
            return [3 /*break*/, 5];
          case 4:
            error_4 = _a.sent();
            console.error("Error deleting appointment:", error_4);
            sonner_1.toast.error("Erro ao cancelar agendamento");
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Reset mode when closing
  var handleClose = () => {
    setMode("view");
    onClose();
  };
  if (!isOpen) return null;
  return (
    <sheet_1.Sheet open={isOpen} onOpenChange={handleClose}>
      <sheet_1.SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <sheet_1.SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <sheet_1.SheetTitle className="text-left">
                {mode === "edit" ? "Editar Agendamento" : "Detalhes do Agendamento"}
              </sheet_1.SheetTitle>
              {appointment && (
                <sheet_1.SheetDescription className="text-left">
                  {appointment.patient_name} - {appointment.service_name}
                </sheet_1.SheetDescription>
              )}
            </div>
            <div className="flex gap-2">
              {mode === "view" && appointment && (
                <button_1.Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("edit")}
                  disabled={loading}
                >
                  <lucide_react_1.Edit className="h-4 w-4" />
                  Editar
                </button_1.Button>
              )}
              {mode === "edit" && (
                <button_1.Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("view")}
                  disabled={updating}
                >
                  <lucide_react_1.X className="h-4 w-4" />
                  Cancelar
                </button_1.Button>
              )}
            </div>
          </div>
        </sheet_1.SheetHeader>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <lucide_react_1.Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        )}{" "}
        {!loading && appointment && (
          <>
            {mode === "view"
              ? <tabs_1.Tabs defaultValue="details" className="space-y-4">
                  <tabs_1.TabsList className="grid w-full grid-cols-2">
                    <tabs_1.TabsTrigger value="details">Detalhes</tabs_1.TabsTrigger>
                    <tabs_1.TabsTrigger value="history">Histórico</tabs_1.TabsTrigger>
                  </tabs_1.TabsList>

                  <tabs_1.TabsContent value="details">
                    <appointment_details_1.default
                      appointment={appointment}
                      onDelete={handleDelete}
                    />
                  </tabs_1.TabsContent>

                  <tabs_1.TabsContent value="history">
                    <appointment_history_1.default history={history} isLoading={loading} />
                  </tabs_1.TabsContent>
                </tabs_1.Tabs>
              : <appointment_edit_form_1.default
                  appointment={appointment}
                  onUpdate={handleUpdate}
                  onCancel={() => setMode("view")}
                  isUpdating={updating}
                />}
          </>
        )}
        {!loading && !appointment && (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Agendamento não encontrado</p>
          </div>
        )}
      </sheet_1.SheetContent>
    </sheet_1.Sheet>
  );
}
