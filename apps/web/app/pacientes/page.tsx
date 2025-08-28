"use client";

// import { useAuth } from "@/contexts/auth-context"; // Commented out - not used
import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  Textarea,
} from "@neonpro/ui";
import {
  Calendar,
  Edit,
  Heart,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "M" | "F" | "O";
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  medicalHistory: string[];
  allergies: string[];
  medications: string[];
  lastVisit?: string;
  nextAppointment?: string;
  status: "active" | "inactive";
  insuranceInfo?: string;
  createdAt: string;
  lgpdConsent: boolean;
}

const MOCK_PATIENTS: Patient[] = [
  {
    id: "1",
    name: "Maria Silva Santos",
    email: "maria.santos@email.com",
    phone: "(11) 99999-9999",
    dateOfBirth: "1985-03-15",
    gender: "F",
    address: "Rua das Flores, 123 - São Paulo, SP",
    emergencyContact: "João Santos",
    emergencyPhone: "(11) 88888-8888",
    medicalHistory: ["Hipertensão", "Diabetes tipo 2"],
    allergies: ["Penicilina"],
    medications: ["Losartana 50mg", "Metformina 850mg"],
    lastVisit: "2024-01-15",
    nextAppointment: "2024-02-15",
    status: "active",
    insuranceInfo: "Unimed - 123456789",
    createdAt: "2023-01-01",
    lgpdConsent: true,
  },
  {
    id: "2",
    name: "José Oliveira Costa",
    email: "jose.costa@email.com",
    phone: "(11) 77777-7777",
    dateOfBirth: "1978-07-22",
    gender: "M",
    address: "Av. Paulista, 456 - São Paulo, SP",
    emergencyContact: "Ana Costa",
    emergencyPhone: "(11) 66666-6666",
    medicalHistory: ["Colesterol alto"],
    allergies: [],
    medications: ["Sinvastatina 20mg"],
    lastVisit: "2024-01-10",
    status: "active",
    insuranceInfo: "Bradesco Saúde - 987654321",
    createdAt: "2023-02-15",
    lgpdConsent: true,
  },
];

export default function PacientesPage() {
  // const { user: _user } = useAuth(); // Commented out - not used
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [_isLoading, _setIsLoading] = useState(false); // Commented out - not used

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);

    const matchesFilter =
      filterStatus === "all" || patient.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleAddPatient = () => {
    setSelectedPatient(undefined);
    setIsDialogOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    // TODO: Replace with proper confirmation dialog
    // if (confirm("Tem certeza que deseja excluir este paciente?")) {
    console.log(
      "TODO: Add confirmation dialog for patient deletion:",
      patientId,
    );
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    // }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
    );
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie os pacientes da sua clínica
          </p>
        </div>
        <Button onClick={handleAddPatient}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar pacientes..."
                  value={searchQuery}
                />
              </div>
            </div>
            <Select onValueChange={setFilterStatus} value={filterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>
            {filteredPatients.length} paciente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Última Consulta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {patient.gender === "M"
                            ? "Masculino"
                            : patient.gender === "F"
                              ? "Feminino"
                              : "Outro"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {patient.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {patient.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {calculateAge(patient.dateOfBirth)} anos
                  </TableCell>
                  <TableCell>
                    {patient.lastVisit ? (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(patient.lastVisit).toLocaleDateString(
                          "pt-BR",
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">
                        Sem consultas
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(patient.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleEditPatient(patient)}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeletePatient(patient.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Patient Dialog */}
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPatient ? "Editar Paciente" : "Novo Paciente"}
            </DialogTitle>
            <DialogDescription>
              {selectedPatient
                ? "Atualize as informações do paciente"
                : "Preencha os dados do novo paciente"}
            </DialogDescription>
          </DialogHeader>

          <Tabs className="w-full" defaultValue="personal">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="medical">Histórico Médico</TabsTrigger>
              <TabsTrigger value="emergency">Emergência</TabsTrigger>
            </TabsList>

            <TabsContent className="space-y-4" value="personal">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input defaultValue={selectedPatient?.name} id="name" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    defaultValue={selectedPatient?.email}
                    id="email"
                    type="email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input defaultValue={selectedPatient?.phone} id="phone" />
                </div>
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    defaultValue={selectedPatient?.dateOfBirth}
                    id="birthDate"
                    type="date"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <Select defaultValue={selectedPatient?.gender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    defaultValue={selectedPatient?.address}
                    id="address"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent className="space-y-4" value="medical">
              <div>
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  defaultValue={selectedPatient?.allergies.join(", ")}
                  id="allergies"
                  placeholder="Liste as alergias conhecidas"
                />
              </div>
              <div>
                <Label htmlFor="medications">Medicações Atuais</Label>
                <Textarea
                  defaultValue={selectedPatient?.medications.join(", ")}
                  id="medications"
                  placeholder="Liste as medicações em uso"
                />
              </div>
              <div>
                <Label htmlFor="history">Histórico Médico</Label>
                <Textarea
                  defaultValue={selectedPatient?.medicalHistory.join(", ")}
                  id="history"
                  placeholder="Histórico médico relevante"
                />
              </div>
            </TabsContent>

            <TabsContent className="space-y-4" value="emergency">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">
                    Contato de Emergência
                  </Label>
                  <Input
                    defaultValue={selectedPatient?.emergencyContact}
                    id="emergencyContact"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
                  <Input
                    defaultValue={selectedPatient?.emergencyPhone}
                    id="emergencyPhone"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="insurance">Informações do Convênio</Label>
                  <Input
                    defaultValue={selectedPatient?.insuranceInfo}
                    id="insurance"
                  />
                </div>
              </div>

              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  <strong>LGPD:</strong> Os dados pessoais são tratados conforme
                  a Lei Geral de Proteção de Dados. O paciente deve consentir
                  com o tratamento de seus dados.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button>{selectedPatient ? "Atualizar" : "Criar"} Paciente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
