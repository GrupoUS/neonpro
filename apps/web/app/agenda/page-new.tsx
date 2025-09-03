"use client";

import { EmptyState, StateManager } from "@/components/forms/loading-error-states";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context-new";
import {
  addDays,
  addHours,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  MapPin,
  Phone,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Stethoscope,
  UserX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Types
interface Patient {
  id: string;
  full_name: string;
  phone_primary?: string;
  email?: string;
}

interface Professional {
  id: string;
  full_name: string;
  specialty: string;
}

interface ServiceType {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

interface Room {
  id: string;
  name: string;
  type: string;
}

interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  professional_id: string;
  service_type_id: string;
  status:
    | "scheduled"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show"
    | "rescheduled";
  start_time: string;
  end_time: string;
  notes?: string;
  internal_notes?: string;
  room_id?: string;
  priority: number;
  patients?: Patient;
  professionals?: Professional;
  service_types?: ServiceType;
  rooms?: Room;
  created_at: string;
  updated_at: string;
}

interface AppointmentFormData {
  patient_id: string;
  professional_id: string;
  service_type_id: string;
  start_time: string;
  end_time: string;
  notes?: string;
  internal_notes?: string;
  room_id?: string;
  priority: number;
  status?: string;
}

interface AvailabilitySlot {
  start_time: string;
  end_time: string;
}

// Status configurations
const STATUS_CONFIG = {
  scheduled: {
    label: "Agendado",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CalendarDays,
  },
  confirmed: {
    label: "Confirmado",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  in_progress: {
    label: "Em Andamento",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Play,
  },
  completed: {
    label: "Concluído",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Check,
  },
  cancelled: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: X,
  },
  no_show: {
    label: "Não Compareceu",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: UserX,
  },
  rescheduled: {
    label: "Reagendado",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: RotateCcw,
  },
} as const;

// Custom hooks
function useAppointmentsAPI() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  };

  const fetchAppointments = useCallback(async (
    startDate?: string,
    endDate?: string,
    professionalId?: string,
    status?: string,
  ) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const clinicId = "mock-clinic-id";
      const params = new URLSearchParams({
        clinic_id: clinicId,
        limit: "1000",
      });

      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (professionalId) params.append("professional_id", professionalId);
      if (status) params.append("status", status);

      const response = await fetch(
        `${API_BASE_URL}/appointments?${params.toString()}`,
        { headers: getHeaders() },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Fetch appointments error:", err);
      setError(err instanceof Error ? err.message : "Erro ao buscar agendamentos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPatients = useCallback(async () => {
    if (!user) return;

    try {
      const clinicId = "mock-clinic-id";
      const response = await fetch(
        `${API_BASE_URL}/patients?clinic_id=${clinicId}&limit=1000&status=active`,
        { headers: getHeaders() },
      );

      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (err) {
      console.error("Fetch patients error:", err);
    }
  }, [user]);

  const createAppointment = async (appointmentData: AppointmentFormData) => {
    try {
      const clinicId = "mock-clinic-id";

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          clinic_id: clinicId,
          ...appointmentData,
          created_by: user?.id || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar agendamento");
      }

      return await response.json();
    } catch (err) {
      console.error("Create appointment error:", err);
      throw err;
    }
  };

  const updateAppointment = async (
    appointmentId: string,
    appointmentData: Partial<AppointmentFormData>,
  ) => {
    try {
      const clinicId = "mock-clinic-id";

      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          clinic_id: clinicId,
          ...appointmentData,
          updated_by: user?.id || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar agendamento");
      }

      return await response.json();
    } catch (err) {
      console.error("Update appointment error:", err);
      throw err;
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const clinicId = "mock-clinic-id";

      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          clinic_id: clinicId,
          status,
          updated_by: user?.id || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar status do agendamento");
      }

      return await response.json();
    } catch (err) {
      console.error("Update appointment status error:", err);
      throw err;
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      const clinicId = "mock-clinic-id";

      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}?clinic_id=${clinicId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao cancelar agendamento");
      }

      return await response.json();
    } catch (err) {
      console.error("Delete appointment error:", err);
      throw err;
    }
  };

  const checkAvailability = async (professionalId: string, date: string) => {
    try {
      const clinicId = "mock-clinic-id";
      const params = new URLSearchParams({
        clinic_id: clinicId,
        professional_id: professionalId,
        date,
      });

      const response = await fetch(
        `${API_BASE_URL}/appointments/availability?${params.toString()}`,
        { headers: getHeaders() },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.available_slots || [];
    } catch (err) {
      console.error("Check availability error:", err);
      return [];
    }
  };

  // Mock data for professionals, service types, and rooms (in real app, fetch from API)
  useEffect(() => {
    if (user) {
      setProfessionals([
        { id: "prof-1", full_name: "Dr. João Silva", specialty: "Dermatologia" },
        { id: "prof-2", full_name: "Dra. Maria Santos", specialty: "Estética Facial" },
        { id: "prof-3", full_name: "Dr. Carlos Oliveira", specialty: "Cirurgia Plástica" },
      ]);

      setServiceTypes([
        { id: "service-1", name: "Consulta Dermatológica", duration_minutes: 30, price: 150 },
        { id: "service-2", name: "Limpeza de Pele", duration_minutes: 60, price: 120 },
        { id: "service-3", name: "Preenchimento", duration_minutes: 45, price: 300 },
        { id: "service-4", name: "Toxina Botulínica", duration_minutes: 30, price: 400 },
      ]);

      setRooms([
        { id: "room-1", name: "Sala 1", type: "consulta" },
        { id: "room-2", name: "Sala 2", type: "procedimento" },
        { id: "room-3", name: "Sala 3", type: "cirurgia" },
      ]);

      fetchPatients();
    }
  }, [user, fetchPatients]);

  return {
    appointments,
    patients,
    professionals,
    serviceTypes,
    rooms,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    checkAvailability,
  };
}

// Calendar Component
function AppointmentCalendar({
  appointments,
  selectedDate,
  onDateSelect,
  viewMode,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  viewMode: "month" | "week" | "day";
  onAppointmentClick: (appointment: Appointment) => void;
}) {
  const getDaysInView = () => {
    switch (viewMode) {
      case "month":
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        const calendarStart = startOfWeek(start, { weekStartsOn: 0 });
        const calendarEnd = endOfWeek(end, { weekStartsOn: 0 });

        const days = [];
        let day = calendarStart;
        while (day <= calendarEnd) {
          days.push(day);
          day = addDays(day, 1);
        }
        return days;

      case "week":
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

      case "day":
        return [selectedDate];

      default:
        return [];
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => isSameDay(parseISO(appointment.start_time), date));
  };

  const days = getDaysInView();

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Week headers */}
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {days.map((day, index) => {
        const dayAppointments = getAppointmentsForDate(day);
        const isCurrentMonth = isSameMonth(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);

        return (
          <div
            key={index}
            tabIndex={0}
            className={`min-h-24 p-1 border border-border cursor-pointer hover:bg-muted/50 ${
              !isCurrentMonth ? "text-muted-foreground bg-muted/20" : ""
            } ${isToday ? "bg-primary/5 border-primary" : ""} ${isSelected ? "bg-primary/10" : ""}`}
            onClick={() => onDateSelect(day)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onDateSelect(day);
            }}
          >
            <div className="text-sm font-medium mb-1">
              {format(day, "d")}
            </div>

            <div className="space-y-1">
              {dayAppointments.slice(0, 3).map((appointment) => (
                <div
                  key={appointment.id}
                  role="button"
                  tabIndex={0}
                  className={`text-xs p-1 rounded cursor-pointer truncate ${
                    STATUS_CONFIG[appointment.status].color
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick(appointment);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onAppointmentClick(appointment);
                    }
                  }}
                  title={`${appointment.patients?.full_name} - ${
                    format(parseISO(appointment.start_time), "HH:mm")
                  }`}
                >
                  {format(parseISO(appointment.start_time), "HH:mm")}{" "}
                  {appointment.patients?.full_name}
                </div>
              ))}
              {dayAppointments.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{dayAppointments.length - 3} mais
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day, index) => {
        const dayAppointments = getAppointmentsForDate(day);
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);

        return (
          <div
            key={index}
            role="button"
            tabIndex={0}
            className={`border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 ${
              isToday ? "bg-primary/5 border-primary" : ""
            } ${isSelected ? "bg-primary/10" : ""}`}
            onClick={() => onDateSelect(day)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onDateSelect(day);
            }}
          >
            <div className="text-center mb-3">
              <div className="text-xs text-muted-foreground uppercase">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div className="text-lg font-semibold">
                {format(day, "d")}
              </div>
            </div>

            <div className="space-y-2">
              {dayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  role="button"
                  tabIndex={0}
                  className={`text-xs p-2 rounded cursor-pointer ${
                    STATUS_CONFIG[appointment.status].color
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAppointmentClick(appointment);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onAppointmentClick(appointment);
                    }
                  }}
                >
                  <div className="font-medium truncate">
                    {format(parseISO(appointment.start_time), "HH:mm")}
                  </div>
                  <div className="truncate">
                    {appointment.patients?.full_name}
                  </div>
                  <div className="text-muted-foreground truncate">
                    {appointment.professionals?.full_name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate).sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    );

    return (
      <div className="space-y-2">
        <div className="text-lg font-semibold text-center mb-4">
          {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </div>

        {dayAppointments.length > 0
          ? (
            <div className="space-y-2">
              {dayAppointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onAppointmentClick(appointment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className="text-lg font-semibold">
                            {format(parseISO(appointment.start_time), "HH:mm")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(parseISO(appointment.end_time), "HH:mm")}
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium">
                            {appointment.patients?.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {appointment.professionals?.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.service_types?.name}
                          </p>
                        </div>
                      </div>

                      <Badge className={STATUS_CONFIG[appointment.status].color}>
                        {STATUS_CONFIG[appointment.status].label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
          : (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum agendamento para este dia
              </p>
            </div>
          )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}
    </div>
  );
}

// Appointment Form Component
function AppointmentForm({
  appointment,
  patients,
  professionals,
  serviceTypes,
  rooms,
  onSubmit,
  onCancel,
  loading,
}: {
  appointment?: Appointment;
  patients: Patient[];
  professionals: Professional[];
  serviceTypes: ServiceType[];
  rooms: Room[];
  onSubmit: (data: AppointmentFormData) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patient_id: appointment?.patient_id || "",
    professional_id: appointment?.professional_id || "",
    service_type_id: appointment?.service_type_id || "",
    start_time: appointment?.start_time
      ? format(parseISO(appointment.start_time), "yyyy-MM-dd'T'HH:mm")
      : "",
    end_time: appointment?.end_time
      ? format(parseISO(appointment.end_time), "yyyy-MM-dd'T'HH:mm")
      : "",
    notes: appointment?.notes || "",
    internal_notes: appointment?.internal_notes || "",
    room_id: appointment?.room_id || "",
    priority: appointment?.priority || 1,
    status: appointment?.status || "scheduled",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const { checkAvailability } = useAppointmentsAPI();

  // Auto-calculate end time based on service duration
  useEffect(() => {
    if (formData.service_type_id && formData.start_time) {
      const serviceType = serviceTypes.find(s => s.id === formData.service_type_id);
      if (serviceType) {
        const startTime = new Date(formData.start_time);
        const endTime = addHours(startTime, serviceType.duration_minutes / 60);
        setFormData(prev => ({
          ...prev,
          end_time: format(endTime, "yyyy-MM-dd'T'HH:mm"),
        }));
      }
    }
  }, [formData.service_type_id, formData.start_time, serviceTypes]);

  // Load available slots when professional and date change
  useEffect(() => {
    if (formData.professional_id && formData.start_time) {
      const date = format(new Date(formData.start_time), "yyyy-MM-dd");
      checkAvailability(formData.professional_id, date).then(setAvailableSlots);
    }
  }, [formData.professional_id, formData.start_time, checkAvailability]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.patient_id) newErrors.patient_id = "Paciente é obrigatório";
    if (!formData.professional_id) newErrors.professional_id = "Profissional é obrigatório";
    if (!formData.service_type_id) newErrors.service_type_id = "Serviço é obrigatório";
    if (!formData.start_time) newErrors.start_time = "Data e hora de início são obrigatórias";
    if (!formData.end_time) newErrors.end_time = "Data e hora de término são obrigatórias";

    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);

      if (end <= start) {
        newErrors.end_time = "Hora de término deve ser posterior ao início";
      }

      if (start < new Date()) {
        newErrors.start_time = "Agendamento deve ser no futuro";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient_id">Paciente *</Label>
          <Select
            value={formData.patient_id}
            onValueChange={(value) => handleInputChange("patient_id", value)}
          >
            <SelectTrigger className={errors.patient_id ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecionar paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.patient_id && <p className="text-sm text-red-600">{errors.patient_id}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="professional_id">Profissional *</Label>
          <Select
            value={formData.professional_id}
            onValueChange={(value) => handleInputChange("professional_id", value)}
          >
            <SelectTrigger className={errors.professional_id ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecionar profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionals.map((professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.full_name} - {professional.specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.professional_id && (
            <p className="text-sm text-red-600">{errors.professional_id}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service_type_id">Serviço *</Label>
        <Select
          value={formData.service_type_id}
          onValueChange={(value) => handleInputChange("service_type_id", value)}
        >
          <SelectTrigger className={errors.service_type_id ? "border-red-500" : ""}>
            <SelectValue placeholder="Selecionar serviço" />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name} - {service.duration_minutes}min - R$ {service.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.service_type_id && <p className="text-sm text-red-600">{errors.service_type_id}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_time">Data e Hora de Início *</Label>
          <Input
            id="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => handleInputChange("start_time", e.target.value)}
            className={errors.start_time ? "border-red-500" : ""}
          />
          {errors.start_time && <p className="text-sm text-red-600">{errors.start_time}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">Data e Hora de Término *</Label>
          <Input
            id="end_time"
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => handleInputChange("end_time", e.target.value)}
            className={errors.end_time ? "border-red-500" : ""}
          />
          {errors.end_time && <p className="text-sm text-red-600">{errors.end_time}</p>}
        </div>
      </div>

      {availableSlots.length > 0 && (
        <div className="space-y-2">
          <Label>Horários Disponíveis (Sugestões)</Label>
          <div className="flex flex-wrap gap-2">
            {availableSlots.slice(0, 6).map((slot, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleInputChange(
                    "start_time",
                    format(parseISO(slot.start_time), "yyyy-MM-dd'T'HH:mm"),
                  );
                  handleInputChange(
                    "end_time",
                    format(parseISO(slot.end_time), "yyyy-MM-dd'T'HH:mm"),
                  );
                }}
              >
                {format(parseISO(slot.start_time), "HH:mm")}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="room_id">Sala</Label>
          <Select
            value={formData.room_id}
            onValueChange={(value) => handleInputChange("room_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar sala (opcional)" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name} - {room.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={formData.priority.toString()}
            onValueChange={(value) => handleInputChange("priority", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Baixa</SelectItem>
              <SelectItem value="2">Normal</SelectItem>
              <SelectItem value="3">Alta</SelectItem>
              <SelectItem value="4">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {appointment && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Observações para o paciente"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="internal_notes">Notas Internas</Label>
        <Textarea
          id="internal_notes"
          value={formData.internal_notes}
          onChange={(e) => handleInputChange("internal_notes", e.target.value)}
          placeholder="Notas internas da equipe (não visível para o paciente)"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            )
            : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {appointment ? "Atualizar" : "Agendar"}
              </>
            )}
        </Button>
      </div>
    </form>
  );
}

// Appointment Details Dialog
function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
  onEdit,
  onUpdateStatus,
  onCancel,
}: {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (appointment: Appointment) => void;
  onUpdateStatus: (appointment: Appointment, status: string) => void;
  onCancel: (appointment: Appointment) => void;
}) {
  if (!appointment) return null;

  const statusConfig = STATUS_CONFIG[appointment.status];
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Detalhes do Agendamento
          </DialogTitle>
          <DialogDescription>
            {format(parseISO(appointment.start_time), "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
              locale: ptBR,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Quick Actions */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(appointment)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>

              {appointment.status !== "cancelled" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onCancel(appointment)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>

          {/* Main Information */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Paciente
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {appointment.patients?.full_name
                        ?.split(" ")
                        .map(n => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{appointment.patients?.full_name}</p>
                    {appointment.patients?.phone_primary && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {appointment.patients.phone_primary}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Profissional
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{appointment.professionals?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.professionals?.specialty}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Serviço
                </Label>
                <p className="font-medium mt-1">
                  {appointment.service_types?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duração: {appointment.service_types?.duration_minutes}min
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Data e Horário
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(parseISO(appointment.start_time), "dd/MM/yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(appointment.start_time), "HH:mm")} às{" "}
                      {format(parseISO(appointment.end_time), "HH:mm")}
                    </p>
                  </div>
                </div>
              </div>

              {appointment.rooms && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Sala
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {appointment.rooms.name} ({appointment.rooms.type})
                    </p>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Prioridade
                </Label>
                <p className="font-medium mt-1">
                  {["", "Baixa", "Normal", "Alta", "Urgente"][appointment.priority]}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(appointment.notes || appointment.internal_notes) && (
            <div className="space-y-4">
              <Separator />

              {appointment.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Observações
                  </Label>
                  <p className="mt-1 p-3 rounded-lg bg-muted/50">
                    {appointment.notes}
                  </p>
                </div>
              )}

              {appointment.internal_notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Notas Internas
                  </Label>
                  <p className="mt-1 p-3 rounded-lg bg-muted/50">
                    {appointment.internal_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Status Actions */}
          {appointment.status !== "cancelled" && appointment.status !== "completed" && (
            <div className="space-y-3">
              <Separator />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Ações Rápidas
                </Label>
                <div className="flex gap-2 mt-2">
                  {appointment.status === "scheduled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStatus(appointment, "confirmed")}
                      className="bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar
                    </Button>
                  )}

                  {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStatus(appointment, "in_progress")}
                      className="bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar
                    </Button>
                  )}

                  {appointment.status === "in_progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStatus(appointment, "completed")}
                      className="bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Concluir
                    </Button>
                  )}

                  {(appointment.status === "scheduled" || appointment.status === "confirmed") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateStatus(appointment, "no_show")}
                      className="bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Não Compareceu
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function AgendaPage() {
  const { user } = useAuth();
  const {
    appointments,
    patients,
    professionals,
    serviceTypes,
    rooms,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
  } = useAppointmentsAPI();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [professionalFilter, setProfessionalFilter] = useState<string>("");

  // Load appointments when filters or date range changes
  useEffect(() => {
    if (user) {
      let startDate: string, endDate: string;

      switch (viewMode) {
        case "month":
          startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
          endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");
          break;
        case "week":
          startDate = format(startOfWeek(selectedDate), "yyyy-MM-dd");
          endDate = format(endOfWeek(selectedDate), "yyyy-MM-dd");
          break;
        case "day":
          startDate = format(selectedDate, "yyyy-MM-dd");
          endDate = format(selectedDate, "yyyy-MM-dd");
          break;
      }

      fetchAppointments(startDate, endDate, professionalFilter, statusFilter);
    }
  }, [user, selectedDate, viewMode, statusFilter, professionalFilter, fetchAppointments]);

  const handleCreateAppointment = async (data: AppointmentFormData) => {
    try {
      setSubmitting(true);
      await createAppointment(data);
      setShowCreateDialog(false);
      // Refresh appointments
      const startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");
      await fetchAppointments(startDate, endDate, professionalFilter, statusFilter);
    } catch (err) {
      console.error("Create appointment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAppointment = async (data: AppointmentFormData) => {
    if (!selectedAppointment) return;

    try {
      setSubmitting(true);
      await updateAppointment(selectedAppointment.id, data);
      setShowEditDialog(false);
      setSelectedAppointment(null);
      // Refresh appointments
      const startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");
      await fetchAppointments(startDate, endDate, professionalFilter, statusFilter);
    } catch (err) {
      console.error("Update appointment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (appointment: Appointment, newStatus: string) => {
    try {
      setSubmitting(true);
      await updateAppointmentStatus(appointment.id, newStatus);
      setShowDetailsDialog(false);
      // Refresh appointments
      const startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");
      await fetchAppointments(startDate, endDate, professionalFilter, statusFilter);
    } catch (err) {
      console.error("Update appointment status error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      setSubmitting(true);
      await deleteAppointment(appointment.id);
      setShowDetailsDialog(false);
      // Refresh appointments
      const startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");
      await fetchAppointments(startDate, endDate, professionalFilter, statusFilter);
    } catch (err) {
      console.error("Cancel appointment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    switch (viewMode) {
      case "month":
        setSelectedDate(prev => direction === "prev" ? subDays(prev, 30) : addDays(prev, 30));
        break;
      case "week":
        setSelectedDate(prev => direction === "prev" ? subDays(prev, 7) : addDays(prev, 7));
        break;
      case "day":
        setSelectedDate(prev => direction === "prev" ? subDays(prev, 1) : addDays(prev, 1));
        break;
    }
  };

  if (!user) {
    return (
      <StateManager
        isEmpty
        emptyComponent={
          <EmptyState
            title="Acesso Negado"
            description="Você precisa estar logado para acessar a agenda de consultas."
            action={{
              label: "Fazer Login",
              onClick: () => window.location.href = "/login",
            }}
          />
        }
      >
        <div />
      </StateManager>
    );
  }

  return (
    <StateManager
      loading={loading && appointments.length === 0}
      error={error}
      isEmpty={!loading && appointments.length === 0 && !error}
      onRetry={() => {
        const startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
        const endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");
        fetchAppointments(startDate, endDate, professionalFilter, statusFilter);
      }}
      emptyProps={{
        title: "Nenhuma consulta agendada",
        description: "Comece agendando a primeira consulta para este período.",
        action: {
          label: "Agendar Consulta",
          onClick: () => setShowCreateDialog(true),
        },
      }}
      className="space-y-6 p-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">
              Gerencie os agendamentos e horários da clínica
            </p>
          </div>

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <h2 className="text-lg font-semibold min-w-48 text-center">
                  {viewMode === "month" && format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  {viewMode === "week"
                    && `${format(startOfWeek(selectedDate), "dd/MM")} - ${
                      format(endOfWeek(selectedDate), "dd/MM/yyyy")
                    }`}
                  {viewMode === "day"
                    && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </h2>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* View Mode Selector */}
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as unknown)}>
                <TabsList>
                  <TabsTrigger value="month">Mês</TabsTrigger>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="day">Dia</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Select
                  value={professionalFilter}
                  onValueChange={setProfessionalFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos os profissionais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os profissionais</SelectItem>
                    {professionals.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
                    const endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");
                    fetchAppointments(startDate, endDate, professionalFilter, statusFilter);
                  }}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Hoje
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Calendar */}
        <Card>
          <CardContent className="p-6">
            {loading
              ? (
                <div className="grid gap-4 md:grid-cols-7">
                  {Array.from({ length: 35 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-8" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              )
              : (
                <AppointmentCalendar
                  appointments={appointments}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  viewMode={viewMode}
                  onAppointmentClick={(appointment) => {
                    setSelectedAppointment(appointment);
                    setShowDetailsDialog(true);
                  }}
                />
              )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        {/* Create Appointment Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Preencha as informações para criar um novo agendamento.
              </DialogDescription>
            </DialogHeader>

            <AppointmentForm
              patients={patients}
              professionals={professionals}
              serviceTypes={serviceTypes}
              rooms={rooms}
              onSubmit={handleCreateAppointment}
              onCancel={() => setShowCreateDialog(false)}
              loading={submitting}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Appointment Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Agendamento</DialogTitle>
              <DialogDescription>
                Atualize as informações do agendamento.
              </DialogDescription>
            </DialogHeader>

            {selectedAppointment && (
              <AppointmentForm
                appointment={selectedAppointment}
                patients={patients}
                professionals={professionals}
                serviceTypes={serviceTypes}
                rooms={rooms}
                onSubmit={handleUpdateAppointment}
                onCancel={() => {
                  setShowEditDialog(false);
                  setSelectedAppointment(null);
                }}
                loading={submitting}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Appointment Details Dialog */}
        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          open={showDetailsDialog}
          onOpenChange={(open) => {
            setShowDetailsDialog(open);
            if (!open) setSelectedAppointment(null);
          }}
          onEdit={(appointment) => {
            setSelectedAppointment(appointment);
            setShowDetailsDialog(false);
            setShowEditDialog(true);
          }}
          onUpdateStatus={handleStatusUpdate}
          onCancel={handleCancelAppointment}
        />
      </div>
    </StateManager>
  );
}
