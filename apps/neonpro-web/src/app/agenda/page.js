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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.default = AppointmentsPage;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var avatar_1 = require("@/components/ui/avatar");
var calendar_1 = require("@/components/ui/calendar");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var loading_spinner_1 = require("@/components/ui/loading-spinner");
var lucide_react_1 = require("lucide-react");
var appointmentTypes = [
  { value: "consulta", label: "Consulta Geral", color: "bg-blue-100 text-blue-800" },
  { value: "retorno", label: "Retorno", color: "bg-green-100 text-green-800" },
  { value: "exame", label: "Exames", color: "bg-purple-100 text-purple-800" },
  { value: "cirurgia", label: "Cirurgia", color: "bg-red-100 text-red-800" },
];
var statusConfig = {
  agendado: {
    label: "Agendado",
    color: "bg-yellow-100 text-yellow-800",
    icon: lucide_react_1.Clock,
  },
  confirmado: {
    label: "Confirmado",
    color: "bg-blue-100 text-blue-800",
    icon: lucide_react_1.CheckCircle,
  },
  "em-andamento": {
    label: "Em Andamento",
    color: "bg-green-100 text-green-800",
    icon: lucide_react_1.Clock,
  },
  concluido: {
    label: "Concluído",
    color: "bg-gray-100 text-gray-800",
    icon: lucide_react_1.CheckCircle,
  },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: lucide_react_1.XCircle },
  faltou: { label: "Faltou", color: "bg-red-100 text-red-800", icon: lucide_react_1.AlertCircle },
};
function AppointmentsPage() {
  var _a = (0, react_1.useState)(true),
    isLoading = _a[0],
    setIsLoading = _a[1];
  var _b = (0, react_1.useState)([]),
    appointments = _b[0],
    setAppointments = _b[1];
  var _c = (0, react_1.useState)(new Date()),
    selectedDate = _c[0],
    setSelectedDate = _c[1];
  var _d = (0, react_1.useState)(""),
    searchTerm = _d[0],
    setSearchTerm = _d[1];
  var _e = (0, react_1.useState)("all"),
    statusFilter = _e[0],
    setStatusFilter = _e[1];
  var _f = (0, react_1.useState)("all"),
    typeFilter = _f[0],
    setTypeFilter = _f[1];
  var _g = (0, react_1.useState)(false),
    isDialogOpen = _g[0],
    setIsDialogOpen = _g[1];
  (0, react_1.useEffect)(() => {
    var loadAppointments = () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              // Simulate API call
              return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
            case 1:
              // Simulate API call
              _a.sent();
              setAppointments([
                {
                  id: "1",
                  patientName: "Ana Silva Santos",
                  patientPhone: "(11) 99999-9999",
                  date: "2024-08-05",
                  time: "14:00",
                  duration: 30,
                  type: "consulta",
                  status: "confirmado",
                  consultationType: "presencial",
                  doctor: "Dr. João Medeiros",
                  room: "Sala 102",
                  symptoms: "Dor de cabeça frequente, tontura",
                },
                {
                  id: "2",
                  patientName: "Carlos Rodrigues",
                  patientPhone: "(11) 88888-8888",
                  date: "2024-08-05",
                  time: "14:30",
                  duration: 20,
                  type: "retorno",
                  status: "agendado",
                  consultationType: "telemedicina",
                  doctor: "Dr. João Medeiros",
                  notes: "Retorno para acompanhamento de tratamento",
                },
                {
                  id: "3",
                  patientName: "Maria Oliveira",
                  patientPhone: "(11) 77777-7777",
                  date: "2024-08-05",
                  time: "15:00",
                  duration: 45,
                  type: "exame",
                  status: "confirmado",
                  consultationType: "presencial",
                  doctor: "Dr. Ana Beatriz",
                  room: "Sala 201",
                  symptoms: "Exames de rotina, check-up completo",
                },
                {
                  id: "4",
                  patientName: "João Ferreira",
                  patientPhone: "(11) 66666-6666",
                  date: "2024-08-05",
                  time: "16:00",
                  duration: 60,
                  type: "consulta",
                  status: "em-andamento",
                  consultationType: "presencial",
                  doctor: "Dr. Roberto Santos",
                  room: "Sala 103",
                  symptoms: "Dores articulares, fadiga",
                },
              ]);
              setIsLoading(false);
              return [2 /*return*/];
          }
        });
      });
    loadAppointments();
  }, []);
  var filteredAppointments = appointments.filter((appointment) => {
    var matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    var matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    var matchesType = typeFilter === "all" || appointment.type === typeFilter;
    var matchesDate = appointment.date === selectedDate.toISOString().split("T")[0];
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });
  var _getTypeConfig = (type) =>
    appointmentTypes.find((t) => t.value === type) || appointmentTypes[0];
  var _StatusIcon = (_a) => {
    var status = _a.status;
    var config = statusConfig[status];
    var Icon =
      (config === null || config === void 0 ? void 0 : config.icon) || lucide_react_1.Clock;
    return <Icon className="w-4 h-4" />;
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <loading_spinner_1.LoadingSpinner className="w-8 h-8 mx-auto" />
          <p className="text-muted-foreground">Carregando agenda...</p>
        </div>
      </div>
    );
  }
  return (
    <main className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Agenda Médica</h1>
          <p className="text-muted-foreground">Gerencie suas consultas e agendamentos</p>
        </div>
        <div className="flex items-center space-x-2">
          <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button className="bg-neon-500 hover:bg-neon-600">
                <lucide_react_1.Plus className="w-4 h-4 mr-2" />
                Nova Consulta
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="sm:max-w-[600px]">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>Agendar Nova Consulta</dialog_1.DialogTitle>
                <dialog_1.DialogDescription>
                  Preencha os dados para agendar uma nova consulta
                </dialog_1.DialogDescription>
              </dialog_1.DialogHeader>
              <NewAppointmentForm onClose={() => setIsDialogOpen(false)} />
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar Sidebar */}
        <card_1.Card className="lg:col-span-1">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg">Calendário</card_1.CardTitle>
            <card_1.CardDescription>Selecione uma data para visualizar</card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <calendar_1.Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border w-full"
            />

            {/* Quick Stats */}
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span>Total do Dia:</span>
                <span className="font-medium">{filteredAppointments.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Confirmados:</span>
                <span className="font-medium text-green-600">
                  {filteredAppointments.filter((a) => a.status === "confirmado").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pendentes:</span>
                <span className="font-medium text-yellow-600">
                  {filteredAppointments.filter((a) => a.status === "agendado").length}
                </span>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <card_1.Card>
            <card_1.CardContent className="pt-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input_1.Input
                      placeholder="Buscar paciente ou médico..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                  <select_1.SelectTrigger className="w-[180px]">
                    <select_1.SelectValue placeholder="Status" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">Todos os Status</select_1.SelectItem>
                    {Object.entries(statusConfig).map((_a) => {
                      var value = _a[0],
                        config = _a[1];
                      return (
                        <select_1.SelectItem key={value} value={value}>
                          {config.label}
                        </select_1.SelectItem>
                      );
                    })}
                  </select_1.SelectContent>
                </select_1.Select>

                <select_1.Select value={typeFilter} onValueChange={setTypeFilter}>
                  <select_1.SelectTrigger className="w-[180px]">
                    <select_1.SelectValue placeholder="Tipo" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="all">Todos os Tipos</select_1.SelectItem>
                    {appointmentTypes.map((type) => (
                      <select_1.SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </select_1.SelectItem>
                    ))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          {/* Appointments List */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center">
                <lucide_react_1.Calendar className="w-5 h-5 mr-2 text-neon-500" />
                Consultas - {selectedDate.toLocaleDateString("pt-BR")}
              </card_1.CardTitle>
              <card_1.CardDescription>
                {filteredAppointments.length} consulta(s) para este dia
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {filteredAppointments.length === 0
                ? <div className="text-center py-12">
                    <lucide_react_1.Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      Nenhuma consulta encontrada
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tente ajustar os filtros ou selecione uma data diferente
                    </p>
                  </div>
                : <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onEdit={(id) => console.log("Edit", id)}
                        onCancel={(id) => console.log("Cancel", id)}
                      />
                    ))}
                  </div>}
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    </main>
  );
} // Appointment Card Component
function AppointmentCard(_a) {
  var appointment = _a.appointment,
    onEdit = _a.onEdit,
    onCancel = _a.onCancel;
  var typeConfig = getTypeConfig(appointment.type);
  var statusConfig = statusConfig[appointment.status];
  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <avatar_1.Avatar className="w-12 h-12">
            <avatar_1.AvatarImage src={appointment.patientAvatar} />
            <avatar_1.AvatarFallback className="bg-neon-100 text-neon-700">
              {appointment.patientName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </avatar_1.AvatarFallback>
          </avatar_1.Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
              <div className="flex items-center space-x-2">
                <badge_1.Badge
                  variant="outline"
                  className={
                    statusConfig === null || statusConfig === void 0 ? void 0 : statusConfig.color
                  }
                >
                  <StatusIcon status={appointment.status} />
                  <span className="ml-1">
                    {statusConfig === null || statusConfig === void 0 ? void 0 : statusConfig.label}
                  </span>
                </badge_1.Badge>
                <badge_1.Badge variant="outline" className={typeConfig.color}>
                  {typeConfig.label}
                </badge_1.Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <lucide_react_1.Clock className="w-4 h-4 mr-1" />
                {appointment.time} ({appointment.duration}min)
              </div>
              <div className="flex items-center">
                <lucide_react_1.Phone className="w-4 h-4 mr-1" />
                {appointment.patientPhone}
              </div>
              <div className="flex items-center">
                {appointment.consultationType === "telemedicina"
                  ? <lucide_react_1.Video className="w-4 h-4 mr-1" />
                  : <lucide_react_1.MapPin className="w-4 h-4 mr-1" />}
                {appointment.consultationType === "telemedicina"
                  ? "Telemedicina"
                  : appointment.room}
              </div>
              <div className="flex items-center">
                <span>Dr(a). {appointment.doctor}</span>
              </div>
            </div>

            {(appointment.symptoms || appointment.notes) && (
              <div className="mt-3 p-3 bg-muted/50 rounded-md">
                <p className="text-sm">
                  <strong>Sintomas/Observações:</strong> {appointment.symptoms || appointment.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button_1.Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(appointment.id)}
            className="text-neon-600 hover:text-neon-700 hover:bg-neon-50"
          >
            <lucide_react_1.Edit className="w-4 h-4" />
          </button_1.Button>
          <button_1.Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(appointment.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <lucide_react_1.Trash2 className="w-4 h-4" />
          </button_1.Button>
        </div>
      </div>
    </div>
  );
}
// New Appointment Form Component
function NewAppointmentForm(_a) {
  var onClose = _a.onClose;
  var _b = (0, react_1.useState)({
      patientName: "",
      patientPhone: "",
      date: "",
      time: "",
      duration: "30",
      type: "consulta",
      consultationType: "presencial",
      doctor: "",
      room: "",
      symptoms: "",
    }),
    formData = _b[0],
    setFormData = _b[1];
  var handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("New appointment:", formData);
    onClose();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label_1.Label htmlFor="patientName">Nome do Paciente</label_1.Label>
          <input_1.Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) =>
              setFormData(__assign(__assign({}, formData), { patientName: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <label_1.Label htmlFor="patientPhone">Telefone</label_1.Label>
          <input_1.Input
            id="patientPhone"
            value={formData.patientPhone}
            onChange={(e) =>
              setFormData(__assign(__assign({}, formData), { patientPhone: e.target.value }))
            }
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label_1.Label htmlFor="date">Data</label_1.Label>
          <input_1.Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData(__assign(__assign({}, formData), { date: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <label_1.Label htmlFor="time">Horário</label_1.Label>
          <input_1.Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) =>
              setFormData(__assign(__assign({}, formData), { time: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <label_1.Label htmlFor="duration">Duração (min)</label_1.Label>
          <select_1.Select
            value={formData.duration}
            onValueChange={(value) =>
              setFormData(__assign(__assign({}, formData), { duration: value }))
            }
          >
            <select_1.SelectTrigger>
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="15">15 min</select_1.SelectItem>
              <select_1.SelectItem value="30">30 min</select_1.SelectItem>
              <select_1.SelectItem value="45">45 min</select_1.SelectItem>
              <select_1.SelectItem value="60">60 min</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>
        </div>
      </div>

      <div>
        <label_1.Label htmlFor="symptoms">Sintomas/Motivo da Consulta</label_1.Label>
        <textarea_1.Textarea
          id="symptoms"
          value={formData.symptoms}
          onChange={(e) =>
            setFormData(__assign(__assign({}, formData), { symptoms: e.target.value }))
          }
          placeholder="Descreva os sintomas ou motivo da consulta..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button_1.Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </button_1.Button>
        <button_1.Button type="submit" className="bg-neon-500 hover:bg-neon-600">
          Agendar Consulta
        </button_1.Button>
      </div>
    </form>
  );
}
