"use client";

import type {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  FileText,
  Filter,
  Heart,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import type { useEffect, useState } from "react";
import type { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type { LoadingSpinner } from "@/components/ui/loading-spinner";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Textarea } from "@/components/ui/textarea";

interface Patient {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "masculino" | "feminino" | "outro";
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    provider: string;
    planNumber: string;
  };
  medicalInfo: {
    bloodType: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
    lastVisit?: string;
    nextAppointment?: string;
  };
  status: "ativo" | "inativo" | "bloqueado";
  registrationDate: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: "consulta" | "exame" | "procedimento";
  doctor: string;
  diagnosis: string;
  treatment: string;
  notes: string;
}

export default function PatientsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setPatients([
        {
          id: "1",
          name: "Ana Silva Santos",
          email: "ana.silva@email.com",
          phone: "(11) 99999-9999",
          dateOfBirth: "1985-03-15",
          gender: "feminino",
          address: {
            street: "Rua das Flores, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
          },
          emergencyContact: {
            name: "João Silva",
            phone: "(11) 88888-8888",
            relationship: "Esposo",
          },
          insurance: {
            provider: "Unimed",
            planNumber: "123456789",
          },
          medicalInfo: {
            bloodType: "O+",
            allergies: ["Penicilina", "Pólen"],
            medications: ["Losartana 50mg"],
            conditions: ["Hipertensão", "Diabetes Tipo 2"],
            lastVisit: "2024-07-20",
            nextAppointment: "2024-08-15",
          },
          status: "ativo",
          registrationDate: "2023-01-15",
        },
        {
          id: "2",
          name: "Carlos Rodrigues",
          email: "carlos.rodrigues@email.com",
          phone: "(11) 88888-8888",
          dateOfBirth: "1978-11-22",
          gender: "masculino",
          address: {
            street: "Av. Paulista, 456",
            city: "São Paulo",
            state: "SP",
            zipCode: "01310-100",
          },
          emergencyContact: {
            name: "Maria Rodrigues",
            phone: "(11) 77777-7777",
            relationship: "Esposa",
          },
          medicalInfo: {
            bloodType: "A-",
            allergies: [],
            medications: ["Sinvastatina 20mg"],
            conditions: ["Colesterol Alto"],
            lastVisit: "2024-07-18",
            nextAppointment: "2024-08-10",
          },
          status: "ativo",
          registrationDate: "2023-03-10",
        },
        {
          id: "3",
          name: "Maria Oliveira",
          email: "maria.oliveira@email.com",
          phone: "(11) 77777-7777",
          dateOfBirth: "1992-06-08",
          gender: "feminino",
          address: {
            street: "Rua Augusta, 789",
            city: "São Paulo",
            state: "SP",
            zipCode: "01305-000",
          },
          emergencyContact: {
            name: "Pedro Oliveira",
            phone: "(11) 66666-6666",
            relationship: "Pai",
          },
          medicalInfo: {
            bloodType: "B+",
            allergies: ["Lactose"],
            medications: [],
            conditions: ["Intolerância à Lactose"],
            lastVisit: "2024-07-25",
          },
          status: "ativo",
          registrationDate: "2023-05-20",
        },
      ]);

      setIsLoading(false);
    };

    loadPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoadingSpinner className="w-8 h-8 mx-auto" />
          <p className="text-muted-foreground">Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Gerenciamento de Pacientes
          </h1>
          <p className="text-muted-foreground">
            Gerencie informações médicas e histórico dos pacientes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Exportar Lista
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neon-500 hover:bg-neon-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
                <DialogDescription>Preencha as informações do novo paciente</DialogDescription>
              </DialogHeader>
              <NewPatientForm onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-neon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">
              {patients.filter((p) => p.status === "ativo").length} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+20% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Agendadas</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Para os próximos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Médicos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
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
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Mais Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-neon-500" />
            Lista de Pacientes
          </CardTitle>
          <CardDescription>{filteredPatients.length} paciente(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                Nenhum paciente encontrado
              </p>
              <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Idade</TableHead>
                    <TableHead>Tipo Sanguíneo</TableHead>
                    <TableHead>Última Consulta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={patient.avatar} />
                            <AvatarFallback className="bg-neon-100 text-neon-700">
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1" />
                            {patient.phone}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="w-3 h-3 mr-1" />
                            {patient.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{calculateAge(patient.dateOfBirth)} anos</p>
                          <p className="text-muted-foreground">{patient.gender}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <Heart className="w-3 h-3 mr-1" />
                          {patient.medicalInfo.bloodType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {patient.medicalInfo.lastVisit ? (
                            <>
                              <p>
                                {new Date(patient.medicalInfo.lastVisit).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </p>
                              {patient.medicalInfo.nextAppointment && (
                                <p className="text-muted-foreground">
                                  Próxima:{" "}
                                  {new Date(patient.medicalInfo.nextAppointment).toLocaleDateString(
                                    "pt-BR",
                                  )}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground">Nunca</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(patient.status)}>
                          {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setIsDetailsOpen(true);
                            }}
                            className="text-neon-600 hover:text-neon-700 hover:bg-neon-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log("Edit patient", patient.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => console.log("Delete patient", patient.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          {selectedPatient && (
            <PatientDetailsView patient={selectedPatient} onClose={() => setIsDetailsOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

// Helper function for age calculation
const calculateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case "ativo":
      return "bg-green-100 text-green-800 border-green-200";
    case "inativo":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "bloqueado":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Patient Details View Component
function PatientDetailsView({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={patient.avatar} />
            <AvatarFallback className="bg-neon-100 text-neon-700">
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{patient.name}</h2>
            <p className="text-muted-foreground">
              {calculateAge(patient.dateOfBirth)} anos • {patient.gender}
            </p>
          </div>
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Pessoal</TabsTrigger>
          <TabsTrigger value="medical">Médico</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="insurance">Convênio</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="font-medium">{patient.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
              <p className="font-medium">{patient.phone}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Data de Nascimento
              </Label>
              <p className="font-medium">
                {new Date(patient.dateOfBirth).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Gênero</Label>
              <p className="font-medium capitalize">{patient.gender}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Endereço</Label>
            <p className="font-medium">
              {patient.address.street}
              <br />
              {patient.address.city}, {patient.address.state}
              <br />
              CEP: {patient.address.zipCode}
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">
              Contato de Emergência
            </Label>
            <p className="font-medium">
              {patient.emergencyContact.name} ({patient.emergencyContact.relationship})<br />
              {patient.emergencyContact.phone}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Tipo Sanguíneo</Label>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <Heart className="w-3 h-3 mr-1" />
                {patient.medicalInfo.bloodType}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge variant="outline" className={getStatusColor(patient.status)}>
                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Alergias</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {patient.medicalInfo.allergies.length > 0 ? (
                patient.medicalInfo.allergies.map((allergy, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {allergy}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Nenhuma alergia conhecida</span>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Medicamentos</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {patient.medicalInfo.medications.length > 0 ? (
                patient.medicalInfo.medications.map((medication, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {medication}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Nenhum medicamento</span>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Condições Médicas</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {patient.medicalInfo.conditions.length > 0 ? (
                patient.medicalInfo.conditions.map((condition, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-orange-200"
                  >
                    {condition}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">Nenhuma condição conhecida</span>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-muted-foreground">
                Histórico de Consultas
              </Label>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Consulta
              </Button>
            </div>

            <div className="space-y-3">
              {/* Sample medical history - would come from API */}
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">Consulta Geral</p>
                    <p className="text-sm text-muted-foreground">Dr. João Medeiros</p>
                  </div>
                  <Badge variant="outline">20/07/2024</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Diagnóstico:</strong> Hipertensão controlada
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Tratamento:</strong> Manter medicação atual, retorno em 30 dias
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">Exames Laboratoriais</p>
                    <p className="text-sm text-muted-foreground">Dr. Ana Beatriz</p>
                  </div>
                  <Badge variant="outline">15/06/2024</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Diagnóstico:</strong> Exames dentro da normalidade
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Observações:</strong> Glicemia e colesterol controlados
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4">
          {patient.insurance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Operadora</Label>
                  <p className="font-medium">{patient.insurance.provider}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Número do Plano
                  </Label>
                  <p className="font-medium">{patient.insurance.planNumber}</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Convênio Ativo</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Todas as consultas podem ser realizadas pelo convênio
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">Sem Convênio Médico</p>
              <p className="text-sm text-muted-foreground">
                Paciente realiza consultas particulares
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button className="bg-neon-500 hover:bg-neon-600">
          <Edit className="w-4 h-4 mr-2" />
          Editar Paciente
        </Button>
      </div>
    </>
  );
}

// New Patient Form Component
function NewPatientForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "feminino",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    bloodType: "",
    allergies: "",
    medications: "",
    conditions: "",
    insuranceProvider: "",
    planNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New patient:", formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="medical">Informações Médicas</TabsTrigger>
          <TabsTrigger value="insurance">Convênio</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="gender">Gênero</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              placeholder="Rua, número"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Cidade"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                placeholder="Estado"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <Input
                placeholder="CEP"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bloodType">Tipo Sanguíneo</Label>
              <Select
                value={formData.bloodType}
                onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="allergies">Alergias (separadas por vírgula)</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="Ex: Penicilina, Pólen, Lactose"
            />
          </div>

          <div>
            <Label htmlFor="medications">Medicamentos Atuais</Label>
            <Textarea
              id="medications"
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              placeholder="Ex: Losartana 50mg, Sinvastatina 20mg"
            />
          </div>

          <div>
            <Label htmlFor="conditions">Condições Médicas</Label>
            <Textarea
              id="conditions"
              value={formData.conditions}
              onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
              placeholder="Ex: Hipertensão, Diabetes, Asma"
            />
          </div>
        </TabsContent>

        <TabsContent value="insurance" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="insuranceProvider">Operadora do Convênio</Label>
              <Input
                id="insuranceProvider"
                value={formData.insuranceProvider}
                onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                placeholder="Ex: Unimed, SulAmérica"
              />
            </div>
            <div>
              <Label htmlFor="planNumber">Número do Plano</Label>
              <Input
                id="planNumber"
                value={formData.planNumber}
                onChange={(e) => setFormData({ ...formData, planNumber: e.target.value })}
                placeholder="Número da carteirinha"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-neon-500 hover:bg-neon-600">
          Cadastrar Paciente
        </Button>
      </div>
    </form>
  );
}
