"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Bell,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@neonpro/ui";
import { cn } from "@neonpro/utils";

// Mock data for appointments
const mockAppointments = {
  upcoming: [
    {
      id: 1,
      date: "2024-08-25",
      time: "14:30",
      duration: 60,
      treatment: "Aplicação de Botox",
      type: "Procedimento",
      doctor: "Dra. Ana Santos",
      clinic: "NeonPro Clínica Ipanema",
      address: "Rua Visconde de Pirajá, 550 - Ipanema, Rio de Janeiro",
      status: "confirmed",
      notes: "Trazer exames recentes. Evitar aspirina 48h antes.",
      preparation: [
        "Não usar aspirina ou anti-inflamatórios 48h antes",
        "Evitar álcool 24h antes do procedimento",
        "Chegar 15 minutos antes para check-in",
      ],
      canReschedule: true,
      canCancel: true,
      reminderSet: true,
    },
    {
      id: 2,
      date: "2024-09-05",
      time: "10:00",
      duration: 90,
      treatment: "Criolipólise",
      type: "Procedimento",
      doctor: "Dr. Carlos Mendes",
      clinic: "NeonPro Clínica Barra",
      address: "Av. das Américas, 3434 - Barra da Tijuca, Rio de Janeiro",
      status: "pending",
      notes: "Segunda sessão do tratamento corporal",
      preparation: [
        "Hidratar bem a pele nos dias anteriores",
        "Vir com roupas confortáveis",
        "Fazer refeição leve antes do procedimento",
      ],
      canReschedule: true,
      canCancel: true,
      reminderSet: false,
    },
    {
      id: 3,
      date: "2024-08-30",
      time: "16:00",
      duration: 30,
      treatment: "Consulta de Retorno",
      type: "Consulta",
      doctor: "Dra. Ana Santos",
      clinic: "NeonPro Clínica Ipanema",
      address: "Rua Visconde de Pirajá, 550 - Ipanema, Rio de Janeiro",
      status: "confirmed",
      isVirtual: true,
      notes: "Avaliação dos resultados do Botox",
      preparation: [
        "Preparar fotos atualizadas",
        "Anotar quaisquer reações ou efeitos",
        "Teste de conexão 30min antes",
      ],
      canReschedule: true,
      canCancel: false,
      reminderSet: true,
    },
  ],
  past: [
    {
      id: 4,
      date: "2024-08-10",
      time: "14:30",
      treatment: "Preenchimento Labial",
      doctor: "Dra. Ana Santos",
      status: "completed",
      rating: 5,
      feedback: "Excelente resultado, muito natural",
    },
    {
      id: 5,
      date: "2024-07-20",
      time: "15:00",
      treatment: "Limpeza de Pele",
      doctor: "Esp. Maria Oliveira",
      status: "completed",
      rating: 5,
      feedback: "Pele ficou ótima, profissional muito cuidadosa",
    },
  ],
};

const availableSlots = [
  { date: "2024-08-26", time: "09:00", available: true },
  { date: "2024-08-26", time: "10:30", available: true },
  { date: "2024-08-26", time: "14:00", available: false },
  { date: "2024-08-26", time: "15:30", available: true },
  { date: "2024-08-27", time: "09:00", available: true },
  { date: "2024-08-27", time: "11:00", available: true },
  { date: "2024-08-27", time: "16:00", available: true },
];

const treatmentTypes = [
  { id: "botox", name: "Botox", duration: 60, price: 1200 },
  { id: "preenchimento", name: "Preenchimento", duration: 90, price: 1500 },
  { id: "limpeza", name: "Limpeza de Pele", duration: 60, price: 250 },
  { id: "peeling", name: "Peeling Químico", duration: 45, price: 400 },
  { id: "criolipolise", name: "Criolipólise", duration: 120, price: 800 },
  { id: "consulta", name: "Consulta", duration: 30, price: 200 },
];

function AppointmentCard({ appointment, isPast = false }: { appointment: any; isPast?: boolean }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-3 flex-1">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{appointment.treatment}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(appointment.date)} às {appointment.time}
                </p>
              </div>
              <Badge
                className={cn("flex items-center space-x-1", getStatusColor(appointment.status))}
              >
                {getStatusIcon(appointment.status)}
                <span className="capitalize">
                  {appointment.status === "confirmed"
                    ? "Confirmado"
                    : appointment.status === "pending"
                      ? "Pendente"
                      : appointment.status === "cancelled"
                        ? "Cancelado"
                        : "Concluído"}
                </span>
              </Badge>
            </div>

            {/* Details */}
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.doctor}</span>
              </div>

              {appointment.clinic && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.clinic}</span>
                </div>
              )}

              {appointment.duration && (
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.duration} minutos</span>
                </div>
              )}

              {appointment.isVirtual && (
                <div className="flex items-center space-x-2 text-sm">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span>Consulta Virtual</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {appointment.notes && (
              <p className="text-sm text-muted-foreground italic">{appointment.notes}</p>
            )}

            {/* Preparation (for upcoming appointments) */}
            {!isPast && appointment.preparation && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">
                  Preparação para o procedimento:
                </h4>
                <ul className="space-y-1">
                  {appointment.preparation.map((item: string, index: number) => (
                    <li
                      key={index}
                      className="text-xs text-blue-800 dark:text-blue-200 flex items-start space-x-2"
                    >
                      <span className="mt-1 h-1 w-1 bg-blue-600 rounded-full flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Past appointment feedback */}
            {isPast && appointment.rating && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <span className="text-sm">Avaliação:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "text-sm",
                          i < appointment.rating ? "text-yellow-400" : "text-gray-300",
                        )}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {appointment.feedback && (
                  <p className="text-sm text-muted-foreground italic">"{appointment.feedback}"</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {!isPast && (
            <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
              {appointment.isVirtual && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Video className="h-4 w-4" />
                  Entrar na Consulta
                </Button>
              )}

              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
                Contato
              </Button>

              {appointment.canReschedule && (
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                  Reagendar
                </Button>
              )}

              {appointment.canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Cancelar
                </Button>
              )}

              {!appointment.reminderSet && (
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4" />
                  Lembrete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NewAppointmentForm() {
  const [selectedTreatment, setSelectedTreatment] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5 text-pink-600" />
          <span>Agendar Nova Consulta</span>
        </CardTitle>
        <CardDescription>
          Use nossa IA para encontrar o melhor horário para seu tratamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Treatment Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Tratamento</label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {treatmentTypes.map((treatment) => (
              <Card
                key={treatment.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedTreatment === treatment.id
                    ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
                    : "hover:border-gray-300",
                )}
                onClick={() => setSelectedTreatment(treatment.id)}
              >
                <CardContent className="p-4">
                  <h4 className="font-medium">{treatment.name}</h4>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                    <span>{treatment.duration}min</span>
                    <span>R$ {treatment.price}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Date and Time Selection */}
        {selectedTreatment && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Horários Disponíveis</label>
              <p className="text-sm text-muted-foreground">
                Baseado na sua localização e preferências
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availableSlots
                .filter((slot) => slot.available)
                .map((slot, index) => (
                  <Card
                    key={index}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedDate === slot.date && selectedTime === slot.time
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20"
                        : "hover:border-gray-300",
                    )}
                    onClick={() => {
                      setSelectedDate(slot.date);
                      setSelectedTime(slot.time);
                    }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="font-medium">
                        {new Date(slot.date).toLocaleDateString("pt-BR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                      <div className="text-lg font-bold text-pink-600">{slot.time}</div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {selectedDate && selectedTime && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações (opcional)</label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Alguma observação especial ou dúvida sobre o procedimento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        )}

        {/* Confirmation */}
        {selectedTreatment && selectedDate && selectedTime && (
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
              Resumo do Agendamento
            </h4>
            <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
              <p>
                <strong>Tratamento:</strong>{" "}
                {treatmentTypes.find((t) => t.id === selectedTreatment)?.name}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(selectedDate).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p>
                <strong>Horário:</strong> {selectedTime}
              </p>
              <p>
                <strong>Duração:</strong>{" "}
                {treatmentTypes.find((t) => t.id === selectedTreatment)?.duration} minutos
              </p>
              <p>
                <strong>Valor:</strong> R${" "}
                {treatmentTypes.find((t) => t.id === selectedTreatment)?.price}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            className="flex-1 bg-pink-600 hover:bg-pink-700"
            disabled={!selectedTreatment || !selectedDate || !selectedTime}
          >
            Confirmar Agendamento
          </Button>
          <Button variant="outline" className="flex-1">
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AppointmentManagement() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Gerenciamento de Agendamentos
          </h1>
          <p className="text-muted-foreground">
            Visualize, agende e gerencie suas consultas e tratamentos
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowNewAppointment(!showNewAppointment)}>
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button
            className="bg-pink-600 hover:bg-pink-700"
            onClick={() => setShowNewAppointment(!showNewAppointment)}
          >
            <Plus className="h-4 w-4" />
            Nova Consulta
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por tratamento, médico ou data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* New Appointment Form */}
      {showNewAppointment && <NewAppointmentForm />}

      {/* Appointments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Próximas Consultas ({mockAppointments.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">Histórico ({mockAppointments.past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {mockAppointments.upcoming.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma consulta agendada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Que tal agendar sua próxima sessão de tratamento?
                </p>
                <Button
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => setShowNewAppointment(true)}
                >
                  <Plus className="h-4 w-4" />
                  Agendar Consulta
                </Button>
              </CardContent>
            </Card>
          ) : (
            mockAppointments.upcoming.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {mockAppointments.past.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma consulta anterior</h3>
                <p className="text-muted-foreground text-center">
                  Seu histórico de consultas aparecerá aqui
                </p>
              </CardContent>
            </Card>
          ) : (
            mockAppointments.past.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} isPast />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Calendar className="h-6 w-6 text-pink-600" />
              <div className="text-center">
                <div className="font-medium">Reagendar Consulta</div>
                <div className="text-xs text-muted-foreground">Alterar data/horário</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Bell className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <div className="font-medium">Configurar Lembretes</div>
                <div className="text-xs text-muted-foreground">SMS, email, push</div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Phone className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="font-medium">Contatar Clínica</div>
                <div className="text-xs text-muted-foreground">Suporte direto</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
