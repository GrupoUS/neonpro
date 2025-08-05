"use client";

import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Helper function for type configuration
function getTypeConfig(type: string) {
  const typeConfigs = {
    consulta: { icon: "User", color: "blue" },
    exame: { icon: "FileText", color: "green" },
    retorno: { icon: "RotateCcw", color: "orange" },
    emergencia: { icon: "AlertTriangle", color: "red" },
  };
  return typeConfigs[type as keyof typeof typeConfigs] || typeConfigs.consulta;
}

// Status configuration
const _statusConfig = {
  confirmado: { color: "success", icon: CheckCircle, label: "Confirmado" },
  pendente: { color: "warning", icon: AlertCircle, label: "Pendente" },
  cancelado: { color: "danger", icon: XCircle, label: "Cancelado" },
};

import { Edit, Plus, Search, Trash2 } from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  patientAvatar?: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number;
  type: "consulta" | "retorno" | "exame" | "cirurgia";
  status: "agendado" | "confirmado" | "em-andamento" | "concluido" | "cancelado" | "faltou";
  consultationType: "presencial" | "telemedicina";
  doctor: string;
  room?: string;
  notes?: string;
  symptoms?: string;
}

const appointmentTypes = [
  { value: "consulta", label: "Consulta Geral", color: "bg-blue-100 text-blue-800" },
  { value: "retorno", label: "Retorno", color: "bg-green-100 text-green-800" },
  { value: "exame", label: "Exames", color: "bg-purple-100 text-purple-800" },
  { value: "cirurgia", label: "Cirurgia", color: "bg-red-100 text-red-800" },
];

const statusConfig = {
  agendado: { label: "Agendado", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  "em-andamento": { label: "Em Andamento", color: "bg-green-100 text-green-800", icon: Clock },
  concluido: { label: "Concluído", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
  faltou: { label: "Faltou", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default function AppointmentsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
    };

    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    const matchesType = typeFilter === "all" || appointment.type === typeFilter;
    const matchesDate = appointment.date === selectedDate.toISOString().split("T")[0];

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const _getTypeConfig = (type: string) => {
    return appointmentTypes.find((t) => t.value === type) || appointmentTypes[0];
  };

  const _StatusIcon = ({ status }: { status: string }) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;
    return <Icon className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner className="w-8 h-8 mx-auto" />
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neon-500 hover:bg-neon-600">
                <Plus className="w-4 h-4 mr-2" />
                Nova Consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Agendar Nova Consulta</DialogTitle>
                <DialogDescription>
                  Preencha os dados para agendar uma nova consulta
                </DialogDescription>
              </DialogHeader>
              <NewAppointmentForm onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Calendário</CardTitle>
            <CardDescription>Selecione uma data para visualizar</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
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
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar paciente ou médico..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    {Object.entries(statusConfig).map(([value, config]) => (
                      <SelectItem key={value} value={value}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-neon-500" />
                Consultas - {selectedDate.toLocaleDateString("pt-BR")}
              </CardTitle>
              <CardDescription>
                {filteredAppointments.length} consulta(s) para este dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium text-muted-foreground mb-2">
                    Nenhuma consulta encontrada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros ou selecione uma data diferente
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onEdit={(id) => console.log("Edit", id)}
                      onCancel={(id) => console.log("Cancel", id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
} // Appointment Card Component
function AppointmentCard({
  appointment,
  onEdit,
  onCancel,
}: {
  appointment: Appointment;
  onEdit: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const typeConfig = getTypeConfig(appointment.type);
  const currentStatusConfig = statusConfig[appointment.status as keyof typeof statusConfig];
  const StatusIcon = currentStatusConfig?.icon;

  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <Avatar className="w-12 h-12">
            <AvatarImage src={appointment.patientAvatar} />
            <AvatarFallback className="bg-neon-100 text-neon-700">
              {appointment.patientName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={statusConfig?.color}>
                  <StatusIcon status={appointment.status} />
                  <span className="ml-1">{statusConfig?.label}</span>
                </Badge>
                <Badge variant="outline" className={typeConfig.color}>
                  {typeConfig.label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {appointment.time} ({appointment.duration}min)
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {appointment.patientPhone}
              </div>
              <div className="flex items-center">
                {appointment.consultationType === "telemedicina" ? (
                  <Video className="w-4 h-4 mr-1" />
                ) : (
                  <MapPin className="w-4 h-4 mr-1" />
                )}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(appointment.id)}
            className="text-neon-600 hover:text-neon-700 hover:bg-neon-50"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(appointment.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// New Appointment Form Component
function NewAppointmentForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("New appointment:", formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientName">Nome do Paciente</Label>
          <Input
            id="patientName"
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="patientPhone">Telefone</Label>
          <Input
            id="patientPhone"
            value={formData.patientPhone}
            onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="date">Data</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Horário</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="duration">Duração (min)</Label>
          <Select
            value={formData.duration}
            onValueChange={(value) => setFormData({ ...formData, duration: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 min</SelectItem>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">60 min</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="symptoms">Sintomas/Motivo da Consulta</Label>
        <Textarea
          id="symptoms"
          value={formData.symptoms}
          onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
          placeholder="Descreva os sintomas ou motivo da consulta..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-neon-500 hover:bg-neon-600">
          Agendar Consulta
        </Button>
      </div>
    </form>
  );
}
