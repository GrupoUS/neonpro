/**
 * New Session Creation Route
 * Form to start a new telemedicine consultation with patient selection and compliance checks
 */

import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  FileText,
  Mic,
  Phone,
  Search,
  Settings,
  Shield,
  UserPlus,
  Video,
} from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/telemedicine/session/new")({
  component: NewSession,
});

function NewSession() {
  const router = useRouter();

  // Form state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [sessionType, setSessionType] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("30");
  const [sessionNotes, setSessionNotes] = useState("");
  const [deviceChecked, setDeviceChecked] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // Mock patients data - will be replaced with real tRPC calls
  const patients = [
    {
      id: "patient-1",
      name: "Maria Silva",
      age: 34,
      medicalRecord: "MR-12345",
      phone: "(11) 99999-1111",
      lastConsultation: "2025-01-15",
      avatar: null,
      status: "active",
      priority: "normal",
    },
    {
      id: "patient-2",
      name: "João Santos",
      age: 45,
      medicalRecord: "MR-12346",
      phone: "(11) 99999-2222",
      lastConsultation: "2025-01-10",
      avatar: null,
      status: "active",
      priority: "urgent",
    },
    {
      id: "patient-3",
      name: "Ana Costa",
      age: 28,
      medicalRecord: "MR-12347",
      phone: "(11) 99999-3333",
      lastConsultation: null,
      avatar: null,
      status: "new",
      priority: "normal",
    },
  ];

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medicalRecord.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isFormValid = () => {
    return selectedPatient && sessionType && deviceChecked && consentConfirmed;
  };

  const handleStartSession = () => {
    if (!isFormValid()) return;

    // TODO: Implement session creation via tRPC
    const sessionId = `session-${Date.now()}`;
    router.navigate({ to: `/telemedicine/session/${sessionId}` });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Nova Consulta de Telemedicina</h1>
        <p className="text-muted-foreground">
          Configure e inicie uma nova consulta seguindo as diretrizes CFM
          2.314/2022
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Seleção de Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div>
                <Label htmlFor="patient-search">Buscar Paciente</Label>
                <Input
                  id="patient-search"
                  placeholder="Nome ou número do prontuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Patient List */}
              <div className="space-y-2">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient?.id === patient.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={patient.avatar || undefined} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{patient.name}</h4>
                          {patient.priority === "urgent" && (
                            <Badge variant="destructive" className="text-xs">
                              Urgente
                            </Badge>
                          )}
                          {patient.status === "new" && (
                            <Badge variant="outline" className="text-xs">
                              Novo
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {patient.age} anos • {patient.medicalRecord} •{" "}
                          {patient.phone}
                        </div>
                        {patient.lastConsultation && (
                          <div className="text-xs text-muted-foreground">
                            Última consulta: {patient.lastConsultation}
                          </div>
                        )}
                      </div>

                      {selectedPatient?.id === patient.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Patient */}
              <Button variant="outline" className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar Novo Paciente
              </Button>
            </CardContent>
          </Card>

          {/* Session Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuração da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="session-type">Tipo de Consulta</Label>
                  <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first-consultation">
                        Primeira Consulta
                      </SelectItem>
                      <SelectItem value="follow-up">Retorno</SelectItem>
                      <SelectItem value="routine">
                        Consulta de Rotina
                      </SelectItem>
                      <SelectItem value="emergency">Emergência</SelectItem>
                      <SelectItem value="prescription">Receituário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duração Estimada (min)</Label>
                  <Select
                    value={estimatedDuration}
                    onValueChange={setEstimatedDuration}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="session-notes">Observações Iniciais</Label>
                <Textarea
                  id="session-notes"
                  placeholder="Motivo da consulta, sintomas relatados, etc..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance and Setup */}
        <div className="space-y-4">
          {/* Device Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Camera className="h-4 w-4 mr-2" />
                Verificação de Dispositivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Câmera</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Microfone</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Alto-falantes</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Conexão</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="device-check"
                  checked={deviceChecked}
                  onCheckedChange={(checked) =>
                    setDeviceChecked(checked as boolean)
                  }
                />
                <Label htmlFor="device-check" className="text-sm">
                  Dispositivos verificados e funcionando
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Shield className="h-4 w-4 mr-2" />
                Conformidade CFM
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">CFM 2.314/2022</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">LGPD Compliance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">ANVISA Validation</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent-check"
                  checked={consentConfirmed}
                  onCheckedChange={(checked) =>
                    setConsentConfirmed(checked as boolean)
                  }
                />
                <Label htmlFor="consent-check" className="text-sm">
                  Termo de consentimento assinado
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <FileText className="h-4 w-4 mr-2" />
                Termo de Consentimento
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Retorno
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Phone className="h-4 w-4 mr-2" />
                Teste de Conexão
              </Button>
            </CardContent>
          </Card>

          {/* Start Session */}
          <div className="space-y-4">
            {!isFormValid() && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Complete todos os campos obrigatórios para iniciar a consulta.
                </AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!isFormValid()}
              onClick={handleStartSession}
            >
              <Video className="h-4 w-4 mr-2" />
              Iniciar Consulta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
