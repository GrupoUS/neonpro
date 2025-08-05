/**
 * Calendar View Component
 * NeonPro Intelligent Scheduling System
 *
 * Advanced calendar component with multi-professional scheduling,
 * conflict detection, and real-time updates
 */

"use client";

import type { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subWeeks,
} from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Grid3X3,
  List,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Button } from "@/components/ui/button";
import type { Calendar } from "@/components/ui/calendar";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types
interface Appointment {
  id: string;
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
  priority: number;
  patients: {
    id: string;
    full_name: string;
    phone?: string;
  };
  professionals: {
    id: string;
    full_name: string;
    color: string;
  };
  service_types: {
    id: string;
    name: string;
    duration_minutes: number;
    color: string;
  };
}

interface Professional {
  id: string;
  full_name: string;
  specialization?: string;
  color: string;
  is_active: boolean;
}

interface ServiceType {
  id: string;
  name: string;
  duration_minutes: number;
  color: string;
  price?: number;
}

interface CalendarViewProps {
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (date: Date, time: string, professionalId?: string) => void;
  onCreateAppointment?: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  onAppointmentClick,
  onTimeSlotClick,
  onCreateAppointment,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("week");
  const [selectedProfessional, setSelectedProfessional] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  // Fetch appointments
  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    error: appointmentsError,
  } = useQuery({
    queryKey: ["appointments", selectedDate, selectedProfessional, selectedStatus],
    queryFn: async () => {
      const startDate = viewMode === "month" ? startOfWeek(selectedDate) : startOfWeek(currentWeek);
      const endDate = viewMode === "month" ? endOfWeek(selectedDate) : endOfWeek(currentWeek);

      let query = supabase
        .from("appointments")
        .select(
          `
          *,
          patients (id, full_name, phone),
          professionals (id, full_name, color),
          service_types (id, name, duration_minutes, color)
        `,
        )
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("start_time", { ascending: true });

      if (selectedProfessional !== "all") {
        query = query.eq("professional_id", selectedProfessional);
      }

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Appointment[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Fetch professionals
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("*")
        .eq("is_active", true)
        .order("full_name");

      if (error) throw error;
      return data as Professional[];
    },
  });

  // Fetch service types
  const { data: serviceTypes = [] } = useQuery({
    queryKey: ["service_types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_types")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as ServiceType[];
    },
  });

  // Week navigation
  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeek(today);
    setSelectedDate(today);
  };

  // Generate time slots for display
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  }, []);

  // Generate week days
  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(currentWeek, { weekStartsOn: 1 }), // Monday start
      end: endOfWeek(currentWeek, { weekStartsOn: 1 }),
    });
  }, [currentWeek]);

  // Get appointments for a specific date and time
  const getAppointmentsForSlot = (date: Date, time: string, professionalId?: string) => {
    const slotDateTime = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    slotDateTime.setHours(hours, minutes, 0, 0);

    return appointments.filter((appointment) => {
      const appointmentStart = new Date(appointment.start_time);
      const appointmentEnd = new Date(appointment.end_time);

      const slotEnd = new Date(slotDateTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      const hasTimeOverlap =
        (appointmentStart <= slotDateTime && appointmentEnd > slotDateTime) ||
        (appointmentStart < slotEnd && appointmentEnd >= slotEnd) ||
        (appointmentStart >= slotDateTime && appointmentEnd <= slotEnd);

      const matchesProfessional = !professionalId || appointment.professional_id === professionalId;

      return hasTimeOverlap && matchesProfessional;
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "no_show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rescheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get priority indicator
  const getPriorityIcon = (priority: number) => {
    if (priority >= 4) return <AlertTriangle className="w-3 h-3 text-red-500" />;
    if (priority >= 3) return <Clock className="w-3 h-3 text-yellow-500" />;
    return null;
  };

  // Appointment Card Component
  const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => (
    <div
      className={`p-2 rounded-md text-xs cursor-pointer transition-all hover:shadow-md border ${getStatusColor(appointment.status)}`}
      onClick={() => onAppointmentClick?.(appointment)}
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: appointment.professionals.color || "#3B82F6",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium truncate">{appointment.patients.full_name}</span>
        {getPriorityIcon(appointment.priority)}
      </div>
      <div className="text-gray-600 mb-1">
        {format(new Date(appointment.start_time), "HH:mm")} -{" "}
        {format(new Date(appointment.end_time), "HH:mm")}
      </div>
      <div className="text-gray-500 truncate">{appointment.service_types.name}</div>
      <div className="text-gray-500 truncate text-xs">{appointment.professionals.full_name}</div>
    </div>
  );

  // Week View Component
  const WeekView = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 gap-1 mb-4">
          <div className="p-2 font-medium text-sm text-gray-600">Horário</div>
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="p-2 text-center">
              <div className="font-medium text-sm">{format(day, "EEEEEE", { locale: ptBR })}</div>
              <div
                className={`text-lg ${isSameDay(day, new Date()) ? "text-blue-600 font-bold" : ""}`}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="space-y-1">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 gap-1">
              <div className="p-2 text-sm text-gray-600 font-mono border-r">{time}</div>
              {weekDays.map((day) => {
                const slotAppointments = getAppointmentsForSlot(day, time);
                return (
                  <div
                    key={`${day.toISOString()}-${time}`}
                    className="min-h-[60px] border border-gray-200 p-1 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onTimeSlotClick?.(day, time)}
                  >
                    <div className="space-y-1">
                      {slotAppointments.map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Month View Component
  const MonthView = () => (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && setSelectedDate(date)}
        className="rounded-md border"
        locale={ptBR}
      />

      {/* Appointments for selected date */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Agendamentos - {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {appointments
              .filter((appointment) => isSameDay(new Date(appointment.start_time), selectedDate))
              .map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            {appointments.filter((appointment) =>
              isSameDay(new Date(appointment.start_time), selectedDate),
            ).length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhum agendamento para este dia</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Agenda Inteligente
              </CardTitle>
              <CardDescription>
                Sistema de agendamento com detecção de conflitos em tempo real
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={goToToday} variant="outline" size="sm">
                Hoje
              </Button>
              <Button onClick={onCreateAppointment} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* View Mode Tabs */}
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "month" | "week" | "day")}
              className="w-full lg:w-auto"
            >
              <TabsList>
                <TabsTrigger value="month" className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Mês
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Semana
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Navigation Controls */}
            {viewMode === "week" && (
              <div className="flex items-center gap-2">
                <Button onClick={goToPreviousWeek} variant="outline" size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 text-sm font-medium">
                  {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "dd/MM", { locale: ptBR })}{" "}
                  -{" "}
                  {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </span>
                <Button onClick={goToNextWeek} variant="outline" size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Filters */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Profissional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  {professionals.map((professional) => (
                    <SelectItem key={professional.id} value={professional.id}>
                      {professional.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full lg:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["appointments"] })}
                variant="outline"
                size="sm"
                disabled={appointmentsLoading}
              >
                <RefreshCw className={`w-4 h-4 ${appointmentsLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {appointmentsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar agendamentos: {appointmentsError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar Content */}
      <Card>
        <CardContent className="p-6">
          {appointmentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Carregando agendamentos...
            </div>
          ) : (
            <Tabs value={viewMode} className="w-full">
              <TabsContent value="month" className="mt-0">
                <MonthView />
              </TabsContent>
              <TabsContent value="week" className="mt-0">
                <WeekView />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hoje</p>
                <p className="text-2xl font-bold">
                  {
                    appointments.filter((apt) => isSameDay(new Date(apt.start_time), new Date()))
                      .length
                  }
                </p>
              </div>
              <CalendarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">
                  {appointments.filter((apt) => apt.status === "confirmed").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {appointments.filter((apt) => apt.status === "in_progress").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profissionais</p>
                <p className="text-2xl font-bold">{professionals.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
