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
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
} from "@neonpro/ui";

import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Calendar,
  Phone,
  Mail,
  FileText,
  Heart,
  Activity,
  Clock,
} from "lucide-react";

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
  const { user } = useUser();
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);

    const matchesFilter = filterStatus === "all" || patient.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsDialogOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (confirm("Tem certeza que deseja excluir este paciente?")) {
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    }
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

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
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
          <p className="text-muted-foreground">Gerencie os pacientes da sua clínica</p>
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
                  placeholder="Buscar pacientes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
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
          <CardDescription>{filteredPatients.length} paciente(s) encontrado(s)</CardDescription>
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
                  <TableCell>{calculateAge(patient.dateOfBirth)} anos</TableCell>
                  <TableCell>
                    {patient.lastVisit ? (
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(patient.lastVisit).toLocaleDateString("pt-BR")}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sem consultas</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(patient.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditPatient(patient)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePatient(patient.id)}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPatient ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
            <DialogDescription>
              {selectedPatient
                ? "Atualize as informações do paciente"
                : "Preencha os dados do novo paciente"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="medical">Histórico Médico</TabsTrigger>
              <TabsTrigger value="emergency">Emergência</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" defaultValue={selectedPatient?.name} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={selectedPatient?.email} />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" defaultValue={selectedPatient?.phone} />
                </div>
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input id="birthDate" type="date" defaultValue={selectedPatient?.dateOfBirth} />
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
                  <Textarea id="address" defaultValue={selectedPatient?.address} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4">
              <div>
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea
                  id="allergies"
                  placeholder="Liste as alergias conhecidas"
                  defaultValue={selectedPatient?.allergies.join(", ")}
                />
              </div>
              <div>
                <Label htmlFor="medications">Medicações Atuais</Label>
                <Textarea
                  id="medications"
                  placeholder="Liste as medicações em uso"
                  defaultValue={selectedPatient?.medications.join(", ")}
                />
              </div>
              <div>
                <Label htmlFor="history">Histórico Médico</Label>
                <Textarea
                  id="history"
                  placeholder="Histórico médico relevante"
                  defaultValue={selectedPatient?.medicalHistory.join(", ")}
                />
              </div>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                  <Input id="emergencyContact" defaultValue={selectedPatient?.emergencyContact} />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
                  <Input id="emergencyPhone" defaultValue={selectedPatient?.emergencyPhone} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="insurance">Informações do Convênio</Label>
                  <Input id="insurance" defaultValue={selectedPatient?.insuranceInfo} />
                </div>
              </div>

              <Alert>
                <Heart className="h-4 w-4" />
                <AlertDescription>
                  <strong>LGPD:</strong> Os dados pessoais são tratados conforme a Lei Geral de
                  Proteção de Dados. O paciente deve consentir com o tratamento de seus dados.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button>{selectedPatient ? "Atualizar" : "Criar"} Paciente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
