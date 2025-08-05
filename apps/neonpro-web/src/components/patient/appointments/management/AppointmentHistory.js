"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentHistory = AppointmentHistory;
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
function AppointmentHistory(_a) {
  var appointments = _a.appointments,
    onView = _a.onView;
  var _b = (0, react_1.useState)(""),
    searchTerm = _b[0],
    setSearchTerm = _b[1];
  var _c = (0, react_1.useState)("all"),
    statusFilter = _c[0],
    setStatusFilter = _c[1];
  var _d = (0, react_1.useState)("desc"),
    sortOrder = _d[0],
    setSortOrder = _d[1];
  // Filter and sort appointments
  var filteredAppointments = appointments
    .filter(function (appointment) {
      var _a, _b;
      // Search filter
      var matchesSearch =
        searchTerm === "" ||
        appointment.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((_a = appointment.professional_name) === null || _a === void 0
          ? void 0
          : _a.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((_b = appointment.notes) === null || _b === void 0
          ? void 0
          : _b.toLowerCase().includes(searchTerm.toLowerCase()));
      // Status filter
      var matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort(function (a, b) {
      var dateA = new Date("".concat(a.appointment_date, "T").concat(a.appointment_time));
      var dateB = new Date("".concat(b.appointment_date, "T").concat(b.appointment_time));
      return sortOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  var getStatusBadge = function (status) {
    var statusConfig = {
      completed: {
        variant: "default",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
        icon: lucide_react_1.CheckCircle,
        label: "Concluído",
      },
      cancelled: {
        variant: "destructive",
        className: "",
        icon: lucide_react_1.XCircle,
        label: "Cancelado",
      },
      no_show: {
        variant: "secondary",
        className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
        icon: lucide_react_1.AlertCircle,
        label: "Falta",
      },
      rescheduled: {
        variant: "outline",
        className: "",
        icon: lucide_react_1.Calendar,
        label: "Reagendado",
      },
    };
    var config = statusConfig[status] || {
      variant: "outline",
      className: "",
      icon: lucide_react_1.FileText,
      label: status,
    };
    var Icon = config.icon;
    return (
      <badge_1.Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </badge_1.Badge>
    );
  };
  var formatAppointmentDateTime = function (date, time) {
    try {
      var dateTime = (0, date_fns_1.parseISO)("".concat(date, "T").concat(time));
      return {
        date: (0, date_fns_1.format)(dateTime, "dd/MM/yyyy", { locale: locale_1.ptBR }),
        time: (0, date_fns_1.format)(dateTime, "HH:mm", { locale: locale_1.ptBR }),
        fullDate: (0, date_fns_1.format)(dateTime, "EEEE, dd MMMM yyyy", { locale: locale_1.ptBR }),
      };
    } catch (error) {
      return { date: date, time: time, fullDate: date };
    }
  };
  // Statistics
  var stats = {
    total: appointments.length,
    completed: appointments.filter(function (a) {
      return a.status === "completed";
    }).length,
    cancelled: appointments.filter(function (a) {
      return a.status === "cancelled";
    }).length,
    noShow: appointments.filter(function (a) {
      return a.status === "no_show";
    }).length,
  };
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <lucide_react_1.FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Nenhum histórico encontrado
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Seus agendamentos passados aparecerão aqui após serem realizados ou cancelados.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <card_1.Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </card_1.Card>
        <card_1.Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Concluídos</div>
          </div>
        </card_1.Card>
        <card_1.Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-xs text-muted-foreground">Cancelados</div>
          </div>
        </card_1.Card>
        <card_1.Card className="p-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.noShow}</div>
            <div className="text-xs text-muted-foreground">Faltas</div>
          </div>
        </card_1.Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input_1.Input
            placeholder="Buscar por serviço, profissional ou observações..."
            value={searchTerm}
            onChange={function (e) {
              return setSearchTerm(e.target.value);
            }}
            className="pl-9"
          />
        </div>

        <select_1.Select
          value={statusFilter}
          onValueChange={function (value) {
            return setStatusFilter(value);
          }}
        >
          <select_1.SelectTrigger className="w-full sm:w-48">
            <lucide_react_1.Filter className="h-4 w-4 mr-2" />
            <select_1.SelectValue placeholder="Filtrar por status" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="all">Todos os status</select_1.SelectItem>
            <select_1.SelectItem value="completed">Concluídos</select_1.SelectItem>
            <select_1.SelectItem value="cancelled">Cancelados</select_1.SelectItem>
            <select_1.SelectItem value="no_show">Faltas</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>

        <select_1.Select
          value={sortOrder}
          onValueChange={function (value) {
            return setSortOrder(value);
          }}
        >
          <select_1.SelectTrigger className="w-full sm:w-48">
            <select_1.SelectValue placeholder="Ordenar por data" />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="desc">Mais recentes primeiro</select_1.SelectItem>
            <select_1.SelectItem value="asc">Mais antigos primeiro</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredAppointments.length} de {appointments.length} agendamentos
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0
        ? <div className="text-center py-8">
            <lucide_react_1.Search className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum agendamento encontrado com os filtros aplicados.
            </p>
          </div>
        : <div className="space-y-3">
            {filteredAppointments.map(function (appointment) {
              var _a = formatAppointmentDateTime(
                  appointment.appointment_date,
                  appointment.appointment_time,
                ),
                date = _a.date,
                time = _a.time,
                fullDate = _a.fullDate;
              return (
                <card_1.Card key={appointment.id} className="transition-shadow hover:shadow-md">
                  <card_1.CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{appointment.service_name}</h3>
                          {getStatusBadge(appointment.status)}
                        </div>

                        {/* Date and time */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Calendar className="h-4 w-4" />
                            <span>{fullDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <lucide_react_1.Clock className="h-4 w-4" />
                            <span>{time}</span>
                          </div>
                          <div>{appointment.service_duration} min</div>
                        </div>

                        {/* Professional */}
                        {appointment.professional_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <lucide_react_1.User className="h-4 w-4 text-muted-foreground" />
                            <span>{appointment.professional_name}</span>
                          </div>
                        )}

                        {/* Cancellation reason */}
                        {appointment.status === "cancelled" && appointment.cancellation_reason && (
                          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-2 text-sm">
                            <strong>Motivo do cancelamento:</strong>{" "}
                            {appointment.cancellation_reason}
                            {appointment.cancellation_date && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Cancelado em:{" "}
                                {(0, date_fns_1.format)(
                                  (0, date_fns_1.parseISO)(appointment.cancellation_date),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: locale_1.ptBR },
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {appointment.notes && (
                          <div className="bg-muted/30 rounded-md p-2 text-sm">
                            <strong>Observações:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ml-4">
                        <button_1.Button
                          variant="outline"
                          size="sm"
                          onClick={function () {
                            return onView(appointment.id);
                          }}
                          className="text-xs"
                        >
                          Ver detalhes
                        </button_1.Button>
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              );
            })}
          </div>}

      {/* Summary footer */}
      {filteredAppointments.length > 0 && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground text-center">
          {stats.completed > 0 && (
            <span>
              Taxa de comparecimento:{" "}
              {Math.round((stats.completed / (stats.total - stats.cancelled)) * 100)}%
            </span>
          )}
          {stats.noShow > 0 && (
            <span className="ml-4">
              Taxa de faltas: {Math.round((stats.noShow / stats.total) * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
