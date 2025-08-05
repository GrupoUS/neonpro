/**
 * Intelligent Appointment Form Component
 * NeonPro Scheduling System
 *
 * Smart appointment booking form with conflict detection,
 * auto-suggestions, and real-time validation
 */
'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var calendar_1 = require("@/components/ui/calendar");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var separator_1 = require("@/components/ui/separator");
var popover_1 = require("@/components/ui/popover");
var form_1 = require("@/components/ui/form");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var react_query_1 = require("@tanstack/react-query");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var utils_1 = require("@/lib/utils");
var conflict_detection_1 = require("./conflict-detection");
// Validation Schema
var appointmentSchema = zod_2.z.object({
    patient_id: zod_2.z.string().min(1, 'Selecione um paciente'),
    professional_id: zod_2.z.string().min(1, 'Selecione um profissional'),
    service_type_id: zod_2.z.string().min(1, 'Selecione um tipo de serviço'),
    date: zod_2.z.date({
        required_error: 'Selecione uma data',
    }),
    time: zod_2.z.string().min(1, 'Selecione um horário'),
    duration_minutes: zod_2.z.number().min(15, 'Duração mínima de 15 minutos'),
    notes: zod_2.z.string().optional(),
    internal_notes: zod_2.z.string().optional(),
    priority: zod_2.z.number().min(1).max(5).default(1),
    room_id: zod_2.z.string().optional(),
    reminder_preferences: zod_2.z.object({
        whatsapp: zod_2.z.boolean().default(true),
        sms: zod_2.z.boolean().default(false),
        email: zod_2.z.boolean().default(true),
        hours_before: zod_2.z.number().default(24),
    }).optional(),
});
var AppointmentForm = function (_a) {
    var selectedDate = _a.selectedDate, selectedTime = _a.selectedTime, selectedProfessional = _a.selectedProfessional, patientId = _a.patientId, onSuccess = _a.onSuccess, onCancel = _a.onCancel, editingAppointment = _a.editingAppointment;
    var _b = (0, react_1.useState)(''), patientSearch = _b[0], setPatientSearch = _b[1];
    var _c = (0, react_1.useState)(false), showConflictDetection = _c[0], setShowConflictDetection = _c[1];
    var _d = (0, react_1.useState)(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    var _e = (0, react_1.useState)(null), selectedPatient = _e[0], setSelectedPatient = _e[1];
    var supabase = (0, auth_helpers_nextjs_1.createClientComponentClient)();
    var queryClient = (0, react_query_1.useQueryClient)();
    var form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(appointmentSchema),
        defaultValues: {
            patient_id: patientId || (editingAppointment === null || editingAppointment === void 0 ? void 0 : editingAppointment.patient_id) || '',
            professional_id: selectedProfessional || (editingAppointment === null || editingAppointment === void 0 ? void 0 : editingAppointment.professional_id) || '',
            service_type_id: (editingAppointment === null || editingAppointment === void 0 ? void 0 : editingAppointment.service_type_id) || '',
            date: selectedDate || (editingAppointment ? new Date(editingAppointment.start_time) : new Date()),
            time: selectedTime || (editingAppointment ? (0, date_fns_1.format)(new Date(editingAppointment.start_time), 'HH:mm') : ''),
            duration_minutes: 30,
            notes: (editingAppointment === null || editingAppointment === void 0 ? void 0 : editingAppointment.notes) || '',
            internal_notes: (editingAppointment === null || editingAppointment === void 0 ? void 0 : editingAppointment.internal_notes) || '',
            priority: (editingAppointment === null || editingAppointment === void 0 ? void 0 : editingAppointment.priority) || 1,
            room_id: (editingAppointment === null || editingAppointment === void 0 ? void 0 : editingAppointment.room_id) || '',
            reminder_preferences: {
                whatsapp: true,
                sms: false,
                email: true,
                hours_before: 24,
            },
        },
    });
    var watchedValues = form.watch();
    var date = watchedValues.date, time = watchedValues.time, professional_id = watchedValues.professional_id, service_type_id = watchedValues.service_type_id, duration_minutes = watchedValues.duration_minutes;
    // Calculate appointment end time
    var appointmentStartTime = (0, react_1.useMemo)(function () {
        if (!date || !time)
            return null;
        var _a = time.split(':').map(Number), hours = _a[0], minutes = _a[1];
        var startTime = new Date(date);
        startTime.setHours(hours, minutes, 0, 0);
        return startTime;
    }, [date, time]);
    var appointmentEndTime = (0, react_1.useMemo)(function () {
        if (!appointmentStartTime || !duration_minutes)
            return null;
        return (0, date_fns_1.addMinutes)(appointmentStartTime, duration_minutes);
    }, [appointmentStartTime, duration_minutes]);
    // Fetch patients with search
    var _f = (0, react_query_1.useQuery)({
        queryKey: ['patients', patientSearch],
        queryFn: function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (patientSearch.length < 2)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, supabase
                                .from('patients')
                                .select('id, full_name, phone_primary, email, medical_record_number')
                                .or("full_name.ilike.%".concat(patientSearch, "%,phone_primary.ilike.%").concat(patientSearch, "%,medical_record_number.ilike.%").concat(patientSearch, "%"))
                                .eq('is_active', true)
                                .limit(10)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
        enabled: patientSearch.length >= 2,
    }), _g = _f.data, patients = _g === void 0 ? [] : _g, patientsLoading = _f.isLoading;
    // Fetch professionals
    var _h = (0, react_query_1.useQuery)({
        queryKey: ['professionals'],
        queryFn: function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('professionals')
                            .select('*')
                            .eq('is_active', true)
                            .order('full_name')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
    }).data, professionals = _h === void 0 ? [] : _h;
    // Fetch service types
    var _j = (0, react_query_1.useQuery)({
        queryKey: ['service_types'],
        queryFn: function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('service_types')
                            .select('*')
                            .eq('is_active', true)
                            .order('name')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
    }).data, serviceTypes = _j === void 0 ? [] : _j;
    // Fetch rooms (if needed)
    var _k = (0, react_query_1.useQuery)({
        queryKey: ['rooms'],
        queryFn: function () { return __awaiter(void 0, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, supabase
                            .from('rooms')
                            .select('*')
                            .eq('is_active', true)
                            .order('name')];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                }
            });
        }); },
    }).data, rooms = _k === void 0 ? [] : _k;
    // Get available time slots
    var _l = (0, react_query_1.useQuery)({
        queryKey: ['available_slots', professional_id, date, duration_minutes],
        queryFn: function () { return __awaiter(void 0, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!professional_id || !date)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, fetch('/api/appointments/available-slots', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    professional_id: professional_id,
                                    date: (0, date_fns_1.format)(date, 'yyyy-MM-dd'),
                                    duration_minutes: duration_minutes || 30,
                                }),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error('Failed to fetch available slots');
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        enabled: !!professional_id && !!date,
    }), _m = _l.data, availableSlots = _m === void 0 ? [] : _m, slotsLoading = _l.isLoading;
    // Filter service types by professional
    var availableServiceTypes = (0, react_1.useMemo)(function () {
        var selectedProfessional = professionals.find(function (p) { return p.id === professional_id; });
        if (!(selectedProfessional === null || selectedProfessional === void 0 ? void 0 : selectedProfessional.service_type_ids))
            return serviceTypes;
        return serviceTypes.filter(function (st) { var _a; return (_a = selectedProfessional.service_type_ids) === null || _a === void 0 ? void 0 : _a.includes(st.id); });
    }, [serviceTypes, professionals, professional_id]);
    // Update duration when service type changes
    (0, react_1.useEffect)(function () {
        var selectedServiceType = serviceTypes.find(function (st) { return st.id === service_type_id; });
        if (selectedServiceType) {
            form.setValue('duration_minutes', selectedServiceType.duration_minutes);
        }
    }, [service_type_id, serviceTypes, form]);
    // Show conflict detection when key fields are filled
    (0, react_1.useEffect)(function () {
        var shouldShow = !!(appointmentStartTime && appointmentEndTime && professional_id && service_type_id);
        setShowConflictDetection(shouldShow);
    }, [appointmentStartTime, appointmentEndTime, professional_id, service_type_id]);
    // Create appointment mutation
    var createAppointmentMutation = (0, react_query_1.useMutation)({
        mutationFn: function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var startDateTime, _a, hours, minutes, endDateTime, appointmentData, response, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startDateTime = new Date(data.date);
                        _a = data.time.split(':').map(Number), hours = _a[0], minutes = _a[1];
                        startDateTime.setHours(hours, minutes, 0, 0);
                        endDateTime = (0, date_fns_1.addMinutes)(startDateTime, data.duration_minutes);
                        appointmentData = {
                            patient_id: data.patient_id,
                            professional_id: data.professional_id,
                            service_type_id: data.service_type_id,
                            start_time: startDateTime,
                            end_time: endDateTime,
                            notes: data.notes,
                            internal_notes: data.internal_notes,
                            priority: data.priority,
                            room_id: data.room_id || null,
                        };
                        return [4 /*yield*/, fetch('/api/appointments', {
                                method: editingAppointment ? 'PUT' : 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(__assign(__assign({}, appointmentData), (editingAppointment && { id: editingAppointment.id }))),
                            })];
                    case 1:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        error = _b.sent();
                        throw new Error(error.error_message || 'Failed to create appointment');
                    case 3: return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function (data) {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(data.appointment_id);
        },
    });
    var onSubmit = function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, createAppointmentMutation.mutateAsync(data)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error creating appointment:', error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Generate time slots for selection
    var timeSlots = (0, react_1.useMemo)(function () {
        var slots = [];
        for (var hour = 8; hour <= 18; hour++) {
            var _loop_1 = function (minute) {
                var timeString = "".concat(hour.toString().padStart(2, '0'), ":").concat(minute.toString().padStart(2, '0'));
                var isAvailable = availableSlots.some(function (slot) {
                    return slot.time === timeString && slot.available;
                });
                slots.push({ time: timeString, available: isAvailable });
            };
            for (var minute = 0; minute < 60; minute += 30) {
                _loop_1(minute);
            }
        }
        return slots;
    }, [availableSlots]);
    return (<card_1.Card className="w-full max-w-4xl mx-auto">
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.Calendar className="w-5 h-5"/>
          {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </card_1.CardTitle>
        <card_1.CardDescription>
          Preencha os dados para criar um novo agendamento com detecção automática de conflitos
        </card_1.CardDescription>
      </card_1.CardHeader>

      <form_1.Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <card_1.CardContent className="space-y-6">
            
            {/* Patient Selection */}
            <div className="space-y-4">
              <label_1.Label className="text-base font-semibold flex items-center gap-2">
                <lucide_react_1.User className="w-4 h-4"/>
                Paciente
              </label_1.Label>
              
              <div className="space-y-2">
                <div className="relative">
                  <lucide_react_1.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                  <input_1.Input placeholder="Buscar paciente por nome, telefone ou prontuário..." value={patientSearch} onChange={function (e) { return setPatientSearch(e.target.value); }} className="pl-10"/>
                </div>

                {patientsLoading && patientSearch.length >= 2 && (<div className="flex items-center gap-2 text-sm text-gray-500">
                    <lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/>
                    Buscando pacientes...
                  </div>)}

                {patients.length > 0 && (<div className="border rounded-md max-h-48 overflow-y-auto">
                    {patients.map(function (patient) { return (<div key={patient.id} className={(0, utils_1.cn)("p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0", (selectedPatient === null || selectedPatient === void 0 ? void 0 : selectedPatient.id) === patient.id && "bg-blue-50 border-blue-200")} onClick={function () {
                    setSelectedPatient(patient);
                    form.setValue('patient_id', patient.id);
                    setPatientSearch(patient.full_name);
                }}>
                        <div className="font-medium">{patient.full_name}</div>
                        <div className="text-sm text-gray-500">
                          {patient.medical_record_number} • {patient.phone_primary} • {patient.email}
                        </div>
                      </div>); })}
                  </div>)}

                <form_1.FormField control={form.control} name="patient_id" render={function () { return (<form_1.FormItem className="hidden">
                      <form_1.FormControl>
                        <input_1.Input />
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>); }}/>
              </div>
            </div>

            <separator_1.Separator />

            {/* Professional and Service Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField control={form.control} name="professional_id" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel className="flex items-center gap-2">
                      <lucide_react_1.Users className="w-4 h-4"/>
                      Profissional
                    </form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} value={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Selecione um profissional"/>
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {professionals.map(function (professional) { return (<select_1.SelectItem key={professional.id} value={professional.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: professional.color }}/>
                              <span>{professional.full_name}</span>
                              {professional.specialization && (<span className="text-gray-500 text-sm">
                                  - {professional.specialization}
                                </span>)}
                            </div>
                          </select_1.SelectItem>); })}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="service_type_id" render={function (_a) {
            var _b;
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel className="flex items-center gap-2">
                      <lucide_react_1.Briefcase className="w-4 h-4"/>
                      Tipo de Serviço
                    </form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} value={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Selecione o serviço"/>
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        {availableServiceTypes.map(function (serviceType) { return (<select_1.SelectItem key={serviceType.id} value={serviceType.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{serviceType.name}</span>
                              <div className="flex items-center gap-2 ml-2">
                                <badge_1.Badge variant="outline" className="text-xs">
                                  {serviceType.duration_minutes}min
                                </badge_1.Badge>
                                {serviceType.price && (<badge_1.Badge variant="outline" className="text-xs">
                                    R$ {serviceType.price.toFixed(2)}
                                  </badge_1.Badge>)}
                              </div>
                            </div>
                          </select_1.SelectItem>); })}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormDescription>
                      {service_type_id && ((_b = availableServiceTypes.find(function (st) { return st.id === service_type_id; })) === null || _b === void 0 ? void 0 : _b.description)}
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form_1.FormField control={form.control} name="date" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem className="flex flex-col">
                    <form_1.FormLabel className="flex items-center gap-2">
                      <lucide_react_1.CalendarIcon className="w-4 h-4"/>
                      Data do Agendamento
                    </form_1.FormLabel>
                    <popover_1.Popover>
                      <popover_1.PopoverTrigger asChild>
                        <form_1.FormControl>
                          <button_1.Button variant="outline" className={(0, utils_1.cn)("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? ((0, date_fns_1.format)(field.value, "PPP", { locale: locale_1.ptBR })) : (<span>Selecione uma data</span>)}
                            <lucide_react_1.CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                          </button_1.Button>
                        </form_1.FormControl>
                      </popover_1.PopoverTrigger>
                      <popover_1.PopoverContent className="w-auto p-0" align="start">
                        <calendar_1.Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={function (date) { return (0, date_fns_1.isBefore)(date, (0, date_fns_1.startOfDay)(new Date())); }} initialFocus locale={locale_1.ptBR}/>
                      </popover_1.PopoverContent>
                    </popover_1.Popover>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="time" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel className="flex items-center gap-2">
                      <lucide_react_1.Clock className="w-4 h-4"/>
                      Horário
                    </form_1.FormLabel>
                    <select_1.Select onValueChange={field.onChange} value={field.value}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue placeholder="Selecione o horário"/>
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent className="max-h-48">
                        {slotsLoading ? (<div className="flex items-center justify-center p-4">
                            <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/>
                            Carregando horários...
                          </div>) : (timeSlots.map(function (_a) {
                    var time = _a.time, available = _a.available;
                    return (<select_1.SelectItem key={time} value={time} disabled={!available} className={available ? '' : 'opacity-50'}>
                              <div className="flex items-center justify-between w-full">
                                <span>{time}</span>
                                {!available && (<badge_1.Badge variant="destructive" className="text-xs ml-2">
                                    Ocupado
                                  </badge_1.Badge>)}
                              </div>
                            </select_1.SelectItem>);
                }))}
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <form_1.FormField control={form.control} name="duration_minutes" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Duração (minutos)</form_1.FormLabel>
                    <form_1.FormControl>
                      <input_1.Input type="number" min="15" max="480" step="15" {...field} onChange={function (e) { return field.onChange(Number(e.target.value)); }}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="priority" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Prioridade</form_1.FormLabel>
                    <select_1.Select onValueChange={function (value) { return field.onChange(Number(value)); }} value={field.value.toString()}>
                      <form_1.FormControl>
                        <select_1.SelectTrigger>
                          <select_1.SelectValue />
                        </select_1.SelectTrigger>
                      </form_1.FormControl>
                      <select_1.SelectContent>
                        <select_1.SelectItem value="1">1 - Baixa</select_1.SelectItem>
                        <select_1.SelectItem value="2">2 - Normal</select_1.SelectItem>
                        <select_1.SelectItem value="3">3 - Média</select_1.SelectItem>
                        <select_1.SelectItem value="4">4 - Alta</select_1.SelectItem>
                        <select_1.SelectItem value="5">5 - Urgente</select_1.SelectItem>
                      </select_1.SelectContent>
                    </select_1.Select>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              {rooms.length > 0 && (<form_1.FormField control={form.control} name="room_id" render={function (_a) {
                var field = _a.field;
                return (<form_1.FormItem>
                      <form_1.FormLabel className="flex items-center gap-2">
                        <lucide_react_1.MapPin className="w-4 h-4"/>
                        Sala
                      </form_1.FormLabel>
                      <select_1.Select onValueChange={field.onChange} value={field.value}>
                        <form_1.FormControl>
                          <select_1.SelectTrigger>
                            <select_1.SelectValue placeholder="Selecione uma sala"/>
                          </select_1.SelectTrigger>
                        </form_1.FormControl>
                        <select_1.SelectContent>
                          <select_1.SelectItem value="">Nenhuma sala específica</select_1.SelectItem>
                          {rooms.map(function (room) { return (<select_1.SelectItem key={room.id} value={room.id}>
                              {room.name} (Cap: {room.capacity})
                            </select_1.SelectItem>); })}
                        </select_1.SelectContent>
                      </select_1.Select>
                      <form_1.FormMessage />
                    </form_1.FormItem>);
            }}/>)}
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <form_1.FormField control={form.control} name="notes" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Observações do Paciente</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea placeholder="Observações visíveis para o paciente..." className="resize-none" rows={3} {...field}/>
                    </form_1.FormControl>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>

              <form_1.FormField control={form.control} name="internal_notes" render={function (_a) {
            var field = _a.field;
            return (<form_1.FormItem>
                    <form_1.FormLabel>Observações Internas</form_1.FormLabel>
                    <form_1.FormControl>
                      <textarea_1.Textarea placeholder="Observações internas da equipe..." className="resize-none" rows={3} {...field}/>
                    </form_1.FormControl>
                    <form_1.FormDescription>
                      Estas observações são visíveis apenas para a equipe da clínica
                    </form_1.FormDescription>
                    <form_1.FormMessage />
                  </form_1.FormItem>);
        }}/>
            </div>

            {/* Conflict Detection */}
            {showConflictDetection && appointmentStartTime && appointmentEndTime && (<div className="space-y-4">
                <separator_1.Separator />
                <conflict_detection_1.default appointmentStart={appointmentStartTime} appointmentEnd={appointmentEndTime} professionalId={professional_id} treatmentType={service_type_id} roomId={watchedValues.room_id} autoDetect={true}/>
              </div>)}

          </card_1.CardContent>

          <card_1.CardFooter className="flex justify-between">
            <button_1.Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </button_1.Button>
            <button_1.Button type="submit" disabled={isSubmitting || createAppointmentMutation.isPending}>
              {(isSubmitting || createAppointmentMutation.isPending) && (<lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>)}
              {editingAppointment ? 'Atualizar Agendamento' : 'Criar Agendamento'}
            </button_1.Button>
          </card_1.CardFooter>
        </form>
      </form_1.Form>

      {/* Error Display */}
      {createAppointmentMutation.error && (<alert_1.Alert variant="destructive" className="mx-6 mb-6">
          <lucide_react_1.AlertTriangle className="h-4 w-4"/>
          <alert_1.AlertTitle>Erro ao criar agendamento</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            {createAppointmentMutation.error.message}
          </alert_1.AlertDescription>
        </alert_1.Alert>)}
    </card_1.Card>);
};
exports.default = AppointmentForm;
