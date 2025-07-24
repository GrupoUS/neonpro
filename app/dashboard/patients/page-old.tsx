import { createClient } from "@/app/utils/supabase/server";
import { DashboardLayout } from "@/components/navigation/dashboard-layout";
import { redirect } from "next/navigation";
import { PatientsClientPage } from "./client-page";

export default async function PatientsPage() {
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

  // Mock data para demonstração com acessibilidade
  const patients = [
    {
      id: "1",
      name: "Maria Silva",
      email: "maria@example.com",
      phone: "(11) 99999-9999",
      cpf: "123.456.789-00",
      lastVisit: "2024-01-15",
      nextAppointment: "2024-02-10",
      status: "active" as const,
    },
    {
      id: "2",
      name: "João Santos",
      email: "joao@example.com",
      phone: "(11) 88888-8888",
      cpf: "987.654.321-00",
      lastVisit: "2024-01-10",
      status: "inactive" as const,
    },
    {
      id: "3",
      name: "Ana Costa",
      email: "ana@example.com",
      phone: "(11) 77777-7777",
      cpf: "456.789.123-00",
      nextAppointment: "2024-02-05",
      status: "pending" as const,
    },
  ];

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Pacientes" },
  ];

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <PatientsClientPage initialPatients={patients} />
    </DashboardLayout>
  );
}

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Pacientes</h2>
            <p className="text-muted-foreground">
              Gerencie todos os pacientes da sua clínica
            </p>
          </div>
          <Link href="/dashboard/patients/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pacientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">892</div>
              <p className="text-xs text-muted-foreground">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Novos Pacientes
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                Esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Retorno
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5%</span> este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pacientes</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os pacientes cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pacientes..."
                  className="pl-8"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Última Consulta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.age} anos</TableCell>
                    <TableCell>
                      {new Date(patient.lastVisit).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          patient.status === "Ativo" ? "default" : "secondary"
                        }
                      >
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
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