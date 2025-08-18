"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@neonpro/ui";

import {
  Heart,
  Calendar,
  Activity,
  FileText,
  Pill,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
} from "lucide-react";

interface PatientInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  avatar?: string;
}

interface HealthMetrics {
  bloodPressure: {
    systolic: number;
    diastolic: number;
    date: Date;
    status: "normal" | "high" | "low";
  };
  heartRate: {
    value: number;
    date: Date;
    status: "normal" | "high" | "low";
  };
  weight: {
    value: number;
    date: Date;
    trend: "up" | "down" | "stable";
  };
  bmi: {
    value: number;
    category: "underweight" | "normal" | "overweight" | "obese";
  };
}

interface Appointment {
  id: string;
  date: Date;
  time: string;
  doctor: string;
  specialty: string;
  type: string;
  status: "scheduled" | "completed" | "cancelled";
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  status: "active" | "completed" | "paused";
}

const MOCK_PATIENT: PatientInfo = {
  id: "1",
  name: "Maria Silva Santos",
  email: "maria.santos@email.com",
  phone: "(11) 99999-9999",
  dateOfBirth: "1985-03-15",
  address: "Rua das Flores, 123 - São Paulo, SP",
  emergencyContact: "João Santos",
  emergencyPhone: "(11) 88888-8888",
};

const MOCK_HEALTH_METRICS: HealthMetrics = {
  bloodPressure: {
    systolic: 125,
    diastolic: 80,
    date: new Date(),
    status: "normal",
  },
  heartRate: {
    value: 72,
    date: new Date(),
    status: "normal",
  },
  weight: {
    value: 65.2,
    date: new Date(),
    trend: "stable",
  },
  bmi: {
    value: 23.4,
    category: "normal",
  },
};

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: "14:30",
    doctor: "Dr. Ana Silva",
    specialty: "Cardiologia",
    type: "Consulta de retorno",
    status: "scheduled",
  },
  {
    id: "2",
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    time: "09:00",
    doctor: "Dr. João Santos",
    specialty: "Clínica Geral",
    type: "Consulta de rotina",
    status: "completed",
  },
];

const MOCK_MEDICATIONS: Medication[] = [
  {
    id: "1",
    name: "Losartana",
    dosage: "50mg",
    frequency: "1x ao dia",
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    prescribedBy: "Dr. Ana Silva",
    status: "active",
  },
  {
    id: "2",
    name: "Vitamina D",
    dosage: "2000 UI",
    frequency: "1x ao dia",
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    prescribedBy: "Dr. João Santos",
    status: "active",
  },
];

export default function PatientDashboard() {
  const [patient] = useState<PatientInfo>(MOCK_PATIENT);
  const [healthMetrics] = useState<HealthMetrics>(MOCK_HEALTH_METRICS);
  const [appointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [medications] = useState<Medication[]>(MOCK_MEDICATIONS);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      normal: "bg-green-100 text-green-800",
      high: "bg-red-100 text-red-800",
      low: "bg-blue-100 text-blue-800",
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      paused: "bg-yellow-100 text-yellow-800",
      completed: "bg-gray-100 text-gray-800",
    };

    const labels = {
      normal: "Normal",
      high: "Alto",
      low: "Baixo",
      scheduled: "Agendado",
      completed: "Concluído",
      cancelled: "Cancelado",
      active: "Ativo",
      paused: "Pausado",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getBMIColor = (category: string) => {
    switch (category) {
      case "underweight":
        return "text-blue-600";
      case "normal":
        return "text-green-600";
      case "overweight":
        return "text-yellow-600";
      case "obese":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getBMILabel = (category: string) => {
    switch (category) {
      case "underweight":
        return "Abaixo do peso";
      case "normal":
        return "Peso normal";
      case "overweight":
        return "Sobrepeso";
      case "obese":
        return "Obesidade";
      default:
        return "Não classificado";
    }
  };

  const upcomingAppointment = appointments.find((apt) => apt.status === "scheduled");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta, {patient.name.split(" ")[0]}!</p>
        </div>
        <Avatar className="h-16 w-16">
          <AvatarImage src={patient.avatar} />
          <AvatarFallback className="text-lg">
            {patient.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Idade</p>
                <p className="text-xl font-bold">{calculateAge(patient.dateOfBirth)} anos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Pressão Arterial</p>
                <p className="text-xl font-bold">
                  {healthMetrics.bloodPressure.systolic}/{healthMetrics.bloodPressure.diastolic}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Frequência Cardíaca</p>
                <p className="text-xl font-bold">{healthMetrics.heartRate.value} bpm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">IMC</p>
                <p className={`text-xl font-bold ${getBMIColor(healthMetrics.bmi.category)}`}>
                  {healthMetrics.bmi.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment Alert */}
      {upcomingAppointment && (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <strong>Próxima consulta:</strong> {upcomingAppointment.doctor} (
            {upcomingAppointment.specialty}) -{" "}
            {upcomingAppointment.date.toLocaleDateString("pt-BR")} às {upcomingAppointment.time}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">Saúde</TabsTrigger>
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="medications">Medicações</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Saúde</CardTitle>
                <CardDescription>Seus indicadores vitais atuais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">Pressão Arterial</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {healthMetrics.bloodPressure.systolic}/{healthMetrics.bloodPressure.diastolic}{" "}
                      mmHg
                    </span>
                    {getStatusBadge(healthMetrics.bloodPressure.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Frequência Cardíaca</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{healthMetrics.heartRate.value} bpm</span>
                    {getStatusBadge(healthMetrics.heartRate.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Peso</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{healthMetrics.weight.value} kg</span>
                    <Badge variant="outline">
                      {healthMetrics.weight.trend === "stable"
                        ? "Estável"
                        : healthMetrics.weight.trend === "up"
                          ? "Subindo"
                          : "Descendo"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Índice de Massa Corporal (IMC)</span>
                    <span className={`font-bold ${getBMIColor(healthMetrics.bmi.category)}`}>
                      {healthMetrics.bmi.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Classificação</span>
                    <span className={`text-sm ${getBMIColor(healthMetrics.bmi.category)}`}>
                      {getBMILabel(healthMetrics.bmi.category)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Peso</CardTitle>
                <CardDescription>Evolução nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <Activity className="h-16 w-16" />
                  <span className="ml-2">Gráfico de evolução do peso</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Consultas</CardTitle>
              <CardDescription>Histórico e próximos agendamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{appointment.doctor}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {appointment.date.toLocaleDateString("pt-BR")}
                          </span>
                          <span className="text-xs text-muted-foreground">{appointment.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medicações Atuais</CardTitle>
              <CardDescription>Medicamentos prescritos e em uso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medications.map((medication) => (
                  <div
                    key={medication.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Pill className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {medication.name} {medication.dosage}
                        </h4>
                        <p className="text-sm text-muted-foreground">{medication.frequency}</p>
                        <p className="text-xs text-muted-foreground">
                          Prescrito por {medication.prescribedBy}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Desde {medication.startDate.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(medication.status)}
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Lembre-se:</strong> Sempre consulte seu médico antes de alterar ou
                  interromper medicações.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Seus dados cadastrais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nome</p>
                    <p className="text-sm text-muted-foreground">{patient.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Telefone</p>
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Data de Nascimento</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(patient.dateOfBirth).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Endereço</p>
                    <p className="text-sm text-muted-foreground">{patient.address}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Contato de Emergência</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Nome</p>
                      <p className="text-sm text-muted-foreground">{patient.emergencyContact}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{patient.emergencyPhone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Editar Perfil</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
