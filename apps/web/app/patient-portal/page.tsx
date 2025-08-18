"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Calendar,
  Alert,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Separator,
  Progress,
} from "@neonpro/ui";

import {
  Heart,
  Calendar as CalendarIcon,
  FileText,
  Pill,
  Activity,
  Clock,
  MapPin,
  Phone,
  Mail,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  User,
  Stethoscope,
} from "lucide-react";

interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  status: "scheduled" | "completed" | "cancelled";
  location: string;
  notes?: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  doctor: string;
  diagnosis: string;
  prescription: string[];
  notes: string;
  attachments?: string[];
}

interface TestResult {
  id: string;
  date: string;
  type: string;
  result: string;
  status: "normal" | "abnormal" | "pending";
  doctor: string;
  notes?: string;
}

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    date: "2024-02-15",
    time: "14:30",
    doctor: "Dr. Ana Silva",
    specialty: "Cardiologia",
    status: "scheduled",
    location: "Consultório 201",
    notes: "Consulta de rotina - retorno",
  },
  {
    id: "2",
    date: "2024-01-20",
    time: "09:00",
    doctor: "Dr. João Santos",
    specialty: "Clínica Geral",
    status: "completed",
    location: "Consultório 105",
  },
];

const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: "1",
    date: "2024-01-20",
    doctor: "Dr. João Santos",
    diagnosis: "Hipertensão Arterial Leve",
    prescription: ["Losartana 50mg - 1x ao dia", "Dieta com redução de sódio"],
    notes:
      "Paciente apresenta pressão arterial levemente elevada. Iniciar tratamento medicamentoso e mudanças no estilo de vida.",
    attachments: ["receita_20240120.pdf"],
  },
];

const MOCK_TEST_RESULTS: TestResult[] = [
  {
    id: "1",
    date: "2024-01-18",
    type: "Hemograma Completo",
    result: "Normal",
    status: "normal",
    doctor: "Dr. João Santos",
  },
  {
    id: "2",
    date: "2024-01-18",
    type: "Colesterol Total",
    result: "245 mg/dL",
    status: "abnormal",
    doctor: "Dr. João Santos",
    notes: "Valor acima do recomendado. Orientações dietéticas necessárias.",
  },
];

export default function PatientPortalPage() {
  const { user, isLoaded } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [records, setRecords] = useState<MedicalRecord[]>(MOCK_RECORDS);
  const [testResults, setTestResults] = useState<TestResult[]>(MOCK_TEST_RESULTS);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      normal: "bg-green-100 text-green-800",
      abnormal: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };

    const labels = {
      scheduled: "Agendado",
      completed: "Concluído",
      cancelled: "Cancelado",
      normal: "Normal",
      abnormal: "Alterado",
      pending: "Pendente",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const nextAppointment = appointments.find((apt) => apt.status === "scheduled");

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal do Paciente</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {user?.firstName}! Gerencie sua saúde de forma digital.
          </p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Próxima Consulta</p>
                <p className="text-xs text-muted-foreground">
                  {nextAppointment
                    ? `${new Date(nextAppointment.date).toLocaleDateString("pt-BR")} às ${nextAppointment.time}`
                    : "Nenhuma agendada"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Prontuários</p>
                <p className="text-xs text-muted-foreground">{records.length} registro(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Exames</p>
                <p className="text-xs text-muted-foreground">{testResults.length} resultado(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Pill className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Medicações</p>
                <p className="text-xs text-muted-foreground">2 ativa(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment Alert */}
      {nextAppointment && (
        <Alert>
          <CalendarIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Próxima consulta:</strong> {nextAppointment.doctor} ({nextAppointment.specialty}
            ) - {new Date(nextAppointment.date).toLocaleDateString("pt-BR")} às{" "}
            {nextAppointment.time}
            <Button variant="link" className="ml-2 p-0 h-auto">
              Ver detalhes
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="records">Prontuários</TabsTrigger>
          <TabsTrigger value="tests">Exames</TabsTrigger>
          <TabsTrigger value="medications">Medicações</TabsTrigger>
        </TabsList>

        {/* Appointments */}
        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Consultas</CardTitle>
              <CardDescription>Histórico e agendamentos de consultas médicas</CardDescription>
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
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{appointment.doctor}</h4>
                        <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {new Date(appointment.date).toLocaleDateString("pt-BR")}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {appointment.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Records */}
        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prontuários Médicos</CardTitle>
              <CardDescription>Histórico de consultas e diagnósticos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{record.doctor}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Diagnóstico:</span>
                        <p className="text-sm">{record.diagnosis}</p>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Prescrição:</span>
                        <ul className="text-sm list-disc list-inside">
                          {record.prescription.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {record.notes && (
                        <div>
                          <span className="text-sm font-medium">Observações:</span>
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      )}

                      {record.attachments && record.attachments.length > 0 && (
                        <div>
                          <span className="text-sm font-medium">Anexos:</span>
                          <div className="flex space-x-2 mt-1">
                            {record.attachments.map((attachment, index) => (
                              <Button key={index} variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-1" />
                                {attachment}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultados de Exames</CardTitle>
              <CardDescription>Histórico de exames e resultados laboratoriais</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Exame</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>{new Date(test.date).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="font-medium">{test.type}</TableCell>
                      <TableCell>{test.result}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>{test.doctor}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications */}
        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medicações Atuais</CardTitle>
              <CardDescription>Medicamentos prescritos e em uso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Pill className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Losartana 50mg</h4>
                      <p className="text-sm text-muted-foreground">1 comprimido ao dia - Manhã</p>
                      <p className="text-xs text-muted-foreground">Prescrito por Dr. João Santos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Próxima dose: 08:00</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Pill className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Complexo B</h4>
                      <p className="text-sm text-muted-foreground">
                        1 cápsula ao dia - Após café da manhã
                      </p>
                      <p className="text-xs text-muted-foreground">Prescrição própria</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Próxima dose: 09:00</p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Lembrete:</strong> Sempre consulte seu médico antes de alterar ou
                  interromper medicações.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
