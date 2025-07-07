import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarPlus, ArrowLeft, Save, Clock, User } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewAppointmentPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Agendamentos", href: "/dashboard/appointments" },
    { title: "Nova Consulta" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/appointments">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Nova Consulta</h2>
              <p className="text-muted-foreground">
                Agende uma nova consulta para um paciente
              </p>
            </div>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Agendar Consulta
          </Button>
        </div>

        {/* Form */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Paciente
              </CardTitle>
              <CardDescription>
                Selecione ou cadastre o paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Paciente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="joao">João Silva</SelectItem>
                    <SelectItem value="maria">Maria Santos</SelectItem>
                    <SelectItem value="pedro">Pedro Costa</SelectItem>
                    <SelectItem value="ana">Ana Silva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientPhone">Telefone de Contato</Label>
                <Input id="patientPhone" placeholder="(11) 99999-9999" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="patientEmail">E-mail</Label>
                <Input id="patientEmail" type="email" placeholder="email@exemplo.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                <Input id="emergencyContact" placeholder="Nome e telefone" />
              </div>
            </CardContent>
          </Card>

          {/* Informações da Consulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Detalhes da Consulta
              </CardTitle>
              <CardDescription>
                Configure data, horário e tipo de consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input id="time" type="time" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointmentType">Tipo de Consulta</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="retorno">Retorno</SelectItem>
                    <SelectItem value="exame">Exame</SelectItem>
                    <SelectItem value="emergencia">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duração Estimada</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1h 30min</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor">Médico Responsável</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dr-maria">Dr. Maria Santos</SelectItem>
                    <SelectItem value="dr-pedro">Dr. Pedro Costa</SelectItem>
                    <SelectItem value="dr-ana">Dr. Ana Silva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Observações e Configurações */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Observações e Configurações</CardTitle>
              <CardDescription>
                Informações adicionais sobre a consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo da Consulta</Label>
                <Textarea 
                  id="reason" 
                  placeholder="Descreva o motivo da consulta..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea 
                  id="observations" 
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room">Sala/Consultório</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sala1">Sala 1</SelectItem>
                      <SelectItem value="sala2">Sala 2</SelectItem>
                      <SelectItem value="sala3">Sala 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status Inicial</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="pendente">Pendente Confirmação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/appointments">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Agendar Consulta
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}