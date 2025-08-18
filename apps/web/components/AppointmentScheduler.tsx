"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Calendar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@neonpro/ui";

import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: Date;
  time: string;
  duration: number;
  type: "consultation" | "followup" | "procedure" | "emergency";
  doctor: string;
  specialty: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  notes?: string;
  room?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  availability: {
    [key: string]: string[]; // day: available times
  };
}

const MOCK_DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. Ana Silva",
    specialty: "Cardiologia",
    availability: {
      monday: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      tuesday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
      wednesday: ["09:00", "10:00", "14:00", "15:00", "16:00"],
      thursday: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
      friday: ["09:00", "10:00", "11:00", "14:00", "15:00"],
    },
  },
  {
    id: "2",
    name: "Dr. João Santos",
    specialty: "Clínica Geral",
    availability: {
      monday: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "17:00"],
      tuesday: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"],
      wednesday: ["08:00", "09:00", "14:00", "15:00", "16:00", "17:00"],
      thursday: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"],
      friday: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"],
    },
  },
];

const APPOINTMENT_TYPES = [
  { value: "consultation", label: "Consulta", duration: 30 },
  { value: "followup", label: "Retorno", duration: 20 },
  { value: "procedure", label: "Procedimento", duration: 60 },
  { value: "emergency", label: "Emergência", duration: 45 },
];

export default function AppointmentScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    date: new Date(),
    time: "",
    type: "consultation" as Appointment["type"],
    doctor: "",
    notes: "",
  });

  const handleDateSelect = useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData((prev) => ({ ...prev, date }));
    }
  }, []);

  const handleScheduleAppointment = () => {
    const selectedDoctor = MOCK_DOCTORS.find((d) => d.id === formData.doctor);
    const appointmentType = APPOINTMENT_TYPES.find((t) => t.value === formData.type);

    if (!(selectedDoctor && appointmentType)) return;

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patientName: formData.patientName,
      patientEmail: formData.patientEmail,
      patientPhone: formData.patientPhone,
      date: formData.date,
      time: formData.time,
      duration: appointmentType.duration,
      type: formData.type,
      doctor: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      status: "scheduled",
      notes: formData.notes,
    };

    setAppointments((prev) => [...prev, newAppointment]);
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      patientName: "",
      patientEmail: "",
      patientPhone: "",
      date: new Date(),
      time: "",
      type: "consultation",
      doctor: "",
      notes: "",
    });
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment["status"]) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt)),
    );
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
      "no-show": "bg-orange-100 text-orange-800",
    };

    const labels = {
      scheduled: "Agendado",
      confirmed: "Confirmado",
      completed: "Concluído",
      cancelled: "Cancelado",
      "no-show": "Faltou",
    };

    return <Badge className={variants[status]}>{labels[status]}</Badge>;
  };

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "no-show":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAvailableTimes = (doctorId: string, date: Date) => {
    const doctor = MOCK_DOCTORS.find((d) => d.id === doctorId);
    if (!doctor) return [];

    const dayName = date.toLocaleDateString("en-US", { weekday: "lowercase" });
    return doctor.availability[dayName] || [];
  };

  const filteredAppointments = appointments.filter(
    (apt) => apt.date.toDateString() === selectedDate.toDateString(),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie consultas e horários disponíveis</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agendar Consulta</DialogTitle>
              <DialogDescription>
                Preencha os dados para agendar uma nova consulta
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patientName">Nome do Paciente</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, patientName: e.target.value }))
                  }
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientEmail">Email</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, patientEmail: e.target.value }))
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Telefone</Label>
                <Input
                  id="patientPhone"
                  value={formData.patientPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, patientPhone: e.target.value }))
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">Médico</Label>
                <Select
                  value={formData.doctor}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, doctor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_DOCTORS.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Consulta</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value as Appointment["type"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPOINTMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} ({type.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Select
                  value={formData.time}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, time: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTimes(formData.doctor, formData.date).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações adicionais..."
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleScheduleAppointment}>Agendar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Selecione uma data para ver os agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Agendamentos - {selectedDate.toLocaleDateString("pt-BR")}</CardTitle>
            <CardDescription>
              {filteredAppointments.length} agendamento(s) para esta data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 font-medium text-gray-900 text-sm">Nenhum agendamento</h3>
                <p className="mt-1 text-gray-500 text-sm">
                  Não há consultas agendadas para esta data.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appointment.status)}
                        <div>
                          <h4 className="font-medium">{appointment.patientName}</h4>
                          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {appointment.time}
                            </span>
                            <span className="flex items-center">
                              <User className="mr-1 h-3 w-3" />
                              {appointment.doctor}
                            </span>
                            <span>{appointment.specialty}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      <Select
                        value={appointment.status}
                        onValueChange={(value) =>
                          handleStatusChange(appointment.id, value as Appointment["status"])
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                          <SelectItem value="no-show">Faltou</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Hoje</p>
                <p className="font-bold text-2xl">
                  {
                    appointments.filter(
                      (apt) => apt.date.toDateString() === new Date().toDateString(),
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-sm">Confirmados</p>
                <p className="font-bold text-2xl">
                  {appointments.filter((apt) => apt.status === "confirmed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-sm">Cancelados</p>
                <p className="font-bold text-2xl">
                  {appointments.filter((apt) => apt.status === "cancelled").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-sm">Faltas</p>
                <p className="font-bold text-2xl">
                  {appointments.filter((apt) => apt.status === "no-show").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
