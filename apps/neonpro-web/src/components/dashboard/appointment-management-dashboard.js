'use client';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentManagementDashboard = AppointmentManagementDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var sonner_1 = require("sonner");
var use_appointments_manager_1 = require("@/hooks/use-appointments-manager");
var appointment_filters_1 = require("./appointment-filters");
var appointment_list_view_1 = require("./appointment-list-view");
var appointment_calendar_view_1 = require("./appointment-calendar-view");
var quick_actions_1 = require("./quick-actions");
var modals_1 = require("./appointments/modals");
function AppointmentManagementDashboard(_a) {
    var _this = this;
    var userId = _a.userId, userRole = _a.userRole, professionalId = _a.professionalId, _b = _a.className, className = _b === void 0 ? '' : _b;
    var _c = (0, react_1.useState)(null), currentDate = _c[0], setCurrentDate = _c[1];
    var _d = (0, react_1.useState)('list'), selectedView = _d[0], setSelectedView = _d[1];
    var _e = (0, react_1.useState)(false), refreshing = _e[0], setRefreshing = _e[1];
    // Initialize current date on client side only
    (0, react_1.useEffect)(function () {
        setCurrentDate(new Date());
    }, []);
    // Modal states
    var _f = (0, react_1.useState)(false), editDialogOpen = _f[0], setEditDialogOpen = _f[1];
    var _g = (0, react_1.useState)(false), rescheduleDialogOpen = _g[0], setRescheduleDialogOpen = _g[1];
    var _h = (0, react_1.useState)(false), contactDialogOpen = _h[0], setContactDialogOpen = _h[1];
    var _j = (0, react_1.useState)(false), createDialogOpen = _j[0], setCreateDialogOpen = _j[1];
    var _k = (0, react_1.useState)(null), selectedAppointment = _k[0], setSelectedAppointment = _k[1];
    var _l = (0, use_appointments_manager_1.useAppointmentsManager)({
        userId: userId,
        userRole: userRole,
        professionalId: professionalId,
        autoRefresh: true,
        refreshInterval: 30000 // 30 seconds
    }), appointments = _l.appointments, filters = _l.filters, statistics = _l.statistics, isLoading = _l.isLoading, error = _l.error, updateFilters = _l.updateFilters, clearFilters = _l.clearFilters, confirmAppointment = _l.confirmAppointment, cancelAppointment = _l.cancelAppointment, rescheduleAppointment = _l.rescheduleAppointment, markCompleted = _l.markCompleted, markNoShow = _l.markNoShow, refreshData = _l.refreshData;
    // Mock professionals data (replace with actual data)
    var professionals = [
        { id: '1', name: 'Dr. Ana Silva' },
        { id: '2', name: 'Dr. Carlos Santos' },
        { id: '3', name: 'Dra. Maria Oliveira' }
    ];
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setRefreshing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, refreshData()];
                case 2:
                    _a.sent();
                    sonner_1.toast.success('Dados atualizados!');
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error('Erro ao atualizar dados');
                    return [3 /*break*/, 5];
                case 4:
                    setRefreshing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleEditAppointment = function (appointment) {
        setSelectedAppointment(appointment);
        setEditDialogOpen(true);
    };
    var handleRescheduleAppointment = function (appointment) {
        setSelectedAppointment(appointment);
        setRescheduleDialogOpen(true);
    };
    var handleContactPatient = function (appointment) {
        setSelectedAppointment(appointment);
        setContactDialogOpen(true);
    };
    var handleCreateAppointment = function (date, time) {
        setCreateDialogOpen(true);
    };
    // Handle appointment updates from modals
    var handleAppointmentUpdate = function (updatedAppointment) {
        // Refresh data to show updated appointment
        refreshData();
        setSelectedAppointment(null);
    };
    var handleAppointmentReschedule = function (appointmentId, newStartTime, reason) { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, rescheduleAppointment(appointmentId, newStartTime, reason)];
                case 1:
                    _a.sent();
                    setSelectedAppointment(null);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    throw error_2; // Re-throw to be handled by the modal
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleCreateSuccess = function () {
        // Refresh data to show new appointment
        refreshData();
    };
    var handleBulkAction = function (action, appointmentIds, reason) { return __awaiter(_this, void 0, void 0, function () {
        var _a, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 10, , 11]);
                    _a = action;
                    switch (_a) {
                        case 'confirm': return [3 /*break*/, 1];
                        case 'cancel': return [3 /*break*/, 3];
                        case 'complete': return [3 /*break*/, 5];
                        case 'no_show': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 1: return [4 /*yield*/, Promise.all(appointmentIds.map(function (id) { return confirmAppointment(id); }))];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 3: return [4 /*yield*/, Promise.all(appointmentIds.map(function (id) { return cancelAppointment(id, reason); }))];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 5: return [4 /*yield*/, Promise.all(appointmentIds.map(function (id) { return markCompleted(id); }))];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, Promise.all(appointmentIds.map(function (id) { return markNoShow(id); }))];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_3 = _b.sent();
                    throw error_3;
                case 11: return [2 /*return*/];
            }
        });
    }); };
    var formatDateRange = function () {
        switch (filters.dateRange) {
            case 'today':
                return 'Hoje';
            case 'week':
                return 'Esta Semana';
            case 'month':
                return 'Este Mês';
            case 'custom':
                if (filters.startDate && filters.endDate) {
                    return "".concat((0, date_fns_1.format)(filters.startDate, 'dd/MM'), " - ").concat((0, date_fns_1.format)(filters.endDate, 'dd/MM'));
                }
                return 'Período Personalizado';
            default:
                return 'Esta Semana';
        }
    };
    if (error) {
        return (<card_1.Card className={className}>
        <card_1.CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <lucide_react_1.AlertCircle className="h-12 w-12 text-red-500"/>
            <div>
              <h3 className="font-semibold text-red-600">Erro ao carregar agendamentos</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error}
              </p>
            </div>
            <button_1.Button onClick={handleRefresh} variant="outline">
              <lucide_react_1.RefreshCw className="h-4 w-4 mr-2"/>
              Tentar novamente
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Agendamentos</h1>
          <p className="text-muted-foreground">
            {formatDateRange()} • {statistics.total} agendamento{statistics.total !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button_1.Button variant="outline" onClick={handleRefresh} disabled={refreshing || isLoading}>
            <lucide_react_1.RefreshCw className={"h-4 w-4 mr-2 ".concat(refreshing ? 'animate-spin' : '')}/>
            Atualizar
          </button_1.Button>
          
          <button_1.Button onClick={function () { return handleCreateAppointment(); }}>
            Novo Agendamento
          </button_1.Button>
        </div>
      </div>

      {/* Quick Actions */}
      <quick_actions_1.QuickActions appointments={appointments} onConfirmAppointment={confirmAppointment} onCancelAppointment={cancelAppointment} onRescheduleAppointment={handleRescheduleAppointment} onMarkCompleted={markCompleted} onMarkNoShow={markNoShow} onCreateAppointment={function () { return handleCreateAppointment(); }} onBulkAction={handleBulkAction}/>

      {/* Filters */}
      <appointment_filters_1.AppointmentFilters filters={filters} onFiltersChange={updateFilters} onClearFilters={clearFilters} professionals={professionals}/>

      {/* Main Content */}
      <tabs_1.Tabs value={selectedView} onValueChange={function (value) { return setSelectedView(value); }}>
        <tabs_1.TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
          <tabs_1.TabsTrigger value="list" className="flex items-center gap-2">
            <lucide_react_1.List className="h-4 w-4"/>
            Lista
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="calendar" className="flex items-center gap-2">
            <lucide_react_1.Calendar className="h-4 w-4"/>
            Calendário
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* List View */}
        <tabs_1.TabsContent value="list" className="space-y-4">
          <appointment_list_view_1.AppointmentListView appointments={appointments} onEdit={handleEditAppointment} onCancel={function (id, reason) { return cancelAppointment(id, reason); }} onConfirm={confirmAppointment} onReschedule={handleRescheduleAppointment} onMarkCompleted={markCompleted} onMarkNoShow={markNoShow} onContact={handleContactPatient} loading={isLoading}/>
        </tabs_1.TabsContent>

        {/* Calendar View */}
        <tabs_1.TabsContent value="calendar" className="space-y-4">
          <appointment_calendar_view_1.AppointmentCalendarView appointments={appointments} currentDate={currentDate} onDateChange={setCurrentDate} onAppointmentSelect={handleEditAppointment} onDaySelect={function (date) {
            // Focus on selected day
            setCurrentDate(date);
        }} onCreateAppointment={handleCreateAppointment} loading={isLoading}/>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Statistics Summary */}
      {statistics && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Trophy className="h-5 w-5"/>
              Resumo do Período
            </card_1.CardTitle>
            <card_1.CardDescription>
              Estatísticas dos agendamentos para {formatDateRange().toLowerCase()}
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{statistics.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.completed}</div>
                <div className="text-sm text-muted-foreground">Concluídos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.cancelled + statistics.noShow}</div>
                <div className="text-sm text-muted-foreground">Cancelados/Faltas</div>
              </div>
            </div>
            
            {statistics.revenue && (<div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Receita do Período</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {statistics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>)}
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Modals */}
      <modals_1.EditAppointmentDialog appointment={selectedAppointment} open={editDialogOpen} onOpenChange={setEditDialogOpen} onUpdate={handleAppointmentUpdate}/>

      <modals_1.RescheduleAppointmentDialog appointment={selectedAppointment} open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen} onReschedule={handleAppointmentReschedule}/>

      <modals_1.ContactPatientDialog appointment={selectedAppointment} open={contactDialogOpen} onOpenChange={setContactDialogOpen}/>

      <modals_1.CreateAppointmentDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onCreateSuccess={handleCreateSuccess} professionalId={professionalId}/>
    </div>);
}
