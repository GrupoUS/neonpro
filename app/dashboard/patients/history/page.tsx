import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Clock,
  Download,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function PatientHistoryPage() {
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

  // Mock data para demonstração
  const medicalHistory = [
    {
      id: 1,
      patient: "João Silva",
      date: "2024-01-15",
      type: "Consulta",
      diagnosis: "Hipertensão arterial",
      doctor: "Dr. Maria Santos",
      status: "Concluído",
    },
    {
      id: 2,
      patient: "Maria Santos",
      date: "2024-01-10",
      type: "Exame",
      diagnosis: "Exame de rotina",
      doctor: "Dr. Pedro Costa",
      status: "Concluído",
    },
    {
      id: 3,
      patient: "Pedro Costa",
      date: "2024-01-08",
      type: "Retorno",
      diagnosis: "Diabetes tipo 2",
      doctor: "Dr. Ana Silva",
      status: "Concluído",
    },
    {
      id: 4,
      patient: "Ana Silva",
      date: "2024-01-05",
      type: "Consulta",
      diagnosis: "Gripe",
      doctor: "Dr. João Santos",
      status: "Concluído",
    },
  ];

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Pacientes", href: "/dashboard/patients" },
    { title: "Histórico Médico" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Histórico Médico</h2>
            <p className="text-muted-foreground">
              Visualize o histórico médico completo dos pacientes
            </p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Registros
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">
                Todos os registros médicos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Este Mês
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+18%</span> vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Únicos
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">423</div>
              <p className="text-xs text-muted-foreground">
                Com histórico médico
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tempo Médio
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45min</div>
              <p className="text-xs text-muted-foreground">
                Por consulta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Consultas</CardTitle>
            <CardDescription>
              Registros médicos de todos os pacientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, diagnóstico ou médico..."
                  className="pl-8"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de consulta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="exame">Exame</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                  <SelectItem value="emergencia">Emergência</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="3months">Últimos 3 meses</SelectItem>
                  <SelectItem value="6months">Últimos 6 meses</SelectItem>
                  <SelectItem value="1year">Último ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Mais Filtros
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Diagnóstico/Procedimento</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {record.patient}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {record.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.diagnosis}</TableCell>
                    <TableCell>{record.doctor}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}