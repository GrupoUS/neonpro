"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@neonpro/ui";
import {
  Activity,
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Download,
  Eye,
  FileText,
  MapPin,
  Pill,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";

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
  const { user, loading } = useAuth();
  const [appointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [records] = useState<MedicalRecord[]>(MOCK_RECORDS);
  const [testResults] = useState<TestResult[]>(MOCK_TEST_RESULTS);
  // const [_selectedDate, _setSelectedDate] = useState<Date>(new Date()); // Commented out - not used

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      normal: "bg-green-100 text-green-800",
      abnormal: "bg-red-100 text-red-800",
      pending: "bg-accent/10 text-accent",
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
      <Badge
        className={
          variants[status as keyof typeof variants] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const nextAppointment = appointments.find(
    (apt) => apt.status === "scheduled",
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Portal do Paciente
          </h1>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-blue-100 p-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Próxima Consulta</p>
                <p className="text-muted-foreground text-xs">
                  {nextAppointment
                    ? `${new Date(nextAppointment.date).toLocaleDateString(
                        "pt-BR",
                      )} às ${nextAppointment.time}`
                    : "Nenhuma agendada"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-green-100 p-2">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Prontuários</p>
                <p className="text-muted-foreground text-xs">
                  {records.length} registro(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Exames</p>
                <p className="text-muted-foreground text-xs">
                  {testResults.length} resultado(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-orange-100 p-2">
                <Pill className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Medicações</p>
                <p className="text-muted-foreground text-xs">2 ativa(s)</p>
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
            <strong>Próxima consulta:</strong> {nextAppointment.doctor} (
            {nextAppointment.specialty}) -{" "}
            {new Date(nextAppointment.date).toLocaleDateString("pt-BR")} às{" "}
            {nextAppointment.time}
            <Button className="ml-2 h-auto p-0" variant="link">
              Ver detalhes
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs className="space-y-6" defaultValue="appointments">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="records">Prontuários</TabsTrigger>
          <TabsTrigger value="tests">Exames</TabsTrigger>
          <TabsTrigger value="medications">Medicações</TabsTrigger>
        </TabsList>

        {/* Appointments */}
        <TabsContent className="space-y-6" value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Consultas</CardTitle>
              <CardDescription>
                Histórico e agendamentos de consultas médicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    className="flex items-center justify-between rounded-lg border p-4"
                    key={appointment.id}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-blue-100 p-2">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{appointment.doctor}</h4>
                        <p className="text-muted-foreground text-sm">
                          {appointment.specialty}
                        </p>
                        <div className="mt-1 flex items-center space-x-4">
                          <div className="flex items-center text-muted-foreground text-xs">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {new Date(appointment.date).toLocaleDateString(
                              "pt-BR",
                            )}
                          </div>
                          <div className="flex items-center text-muted-foreground text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center text-muted-foreground text-xs">
                            <MapPin className="mr-1 h-3 w-3" />
                            {appointment.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      <Button size="sm" variant="outline">
                        <Eye className="mr-1 h-4 w-4" />
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
        <TabsContent className="space-y-6" value="records">
          <Card>
            <CardHeader>
              <CardTitle>Prontuários Médicos</CardTitle>
              <CardDescription>
                Histórico de consultas e diagnósticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {records.map((record) => (
                  <div className="rounded-lg border p-4" key={record.id}>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{record.doctor}</h4>
                        <p className="text-muted-foreground text-sm">
                          {new Date(record.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="mr-1 h-4 w-4" />
                        Baixar
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-sm">
                          Diagnóstico:
                        </span>
                        <p className="text-sm">{record.diagnosis}</p>
                      </div>

                      <div>
                        <span className="font-medium text-sm">Prescrição:</span>
                        <ul className="list-inside list-disc text-sm">
                          {record.prescription.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {record.notes && (
                        <div>
                          <span className="font-medium text-sm">
                            Observações:
                          </span>
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      )}

                      {record.attachments && record.attachments.length > 0 && (
                        <div>
                          <span className="font-medium text-sm">Anexos:</span>
                          <div className="mt-1 flex space-x-2">
                            {record.attachments.map((attachment, index) => (
                              <Button key={index} size="sm" variant="outline">
                                <FileText className="mr-1 h-4 w-4" />
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
        <TabsContent className="space-y-6" value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Resultados de Exames</CardTitle>
              <CardDescription>
                Histórico de exames e resultados laboratoriais
              </CardDescription>
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
                      <TableCell>
                        {new Date(test.date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium">{test.type}</TableCell>
                      <TableCell>{test.result}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>{test.doctor}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-4 w-4" />
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
        <TabsContent className="space-y-6" value="medications">
          <Card>
            <CardHeader>
              <CardTitle>Medicações Atuais</CardTitle>
              <CardDescription>
                Medicamentos prescritos e em uso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-green-100 p-2">
                      <Pill className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Losartana 50mg</h4>
                      <p className="text-muted-foreground text-sm">
                        1 comprimido ao dia - Manhã
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Prescrito por Dr. João Santos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Próxima dose: 08:00
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Pill className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Complexo B</h4>
                      <p className="text-muted-foreground text-sm">
                        1 cápsula ao dia - Após café da manhã
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Prescrição própria
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Próxima dose: 09:00
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Lembrete:</strong> Sempre consulte seu médico antes de
                  alterar ou interromper medicações.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
