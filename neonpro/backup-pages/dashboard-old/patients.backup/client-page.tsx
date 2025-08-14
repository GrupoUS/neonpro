'use client'

import { KeyboardNavigationProvider } from "@/components/accessibility/keyboard-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Calendar,
    Filter,
    Mail,
    MoreHorizontal,
    Phone,
    Search,
    UserPlus,
    Users,
} from "lucide-react";
import Link from "next/link";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  lastVisit?: string;
  nextAppointment?: string;
  status: "active" | "inactive" | "pending";
}

interface PatientsClientPageProps {
  initialPatients: Patient[];
}

export function PatientsClientPage({ initialPatients }: PatientsClientPageProps) {
  // Portuguese translations for healthcare accessibility
  const t = {
    title: 'Pacientes',
    description: 'Gerencie os pacientes da clínica',
    accessibility: {
      skipToSearch: 'Pular para pesquisa',
      skipToTable: 'Pular para tabela de pacientes',
      skipToAddPatient: 'Pular para adicionar paciente'
    },
    actions: {
      addPatient: 'Adicionar Paciente'
    },
    stats: {
      totalPatients: 'Total de Pacientes',
      activePatients: 'Pacientes Ativos',
      newPatients: 'Novos Pacientes',
      pendingReviews: 'Análises Pendentes',
      fromLastMonth: 'do mês passado'
    },
    search: {
      title: 'Buscar Pacientes',
      description: 'Use os filtros para encontrar pacientes específicos',
      placeholder: 'Buscar por nome, email ou CPF...',
      ariaLabel: 'Campo de busca de pacientes',
      filter: 'Filtrar'
    },
    table: {
      title: 'Lista de Pacientes',
      description: 'Visualize e gerencie todos os pacientes cadastrados',
      ariaLabel: 'Tabela de pacientes cadastrados na clínica',
      columns: {
        name: 'Nome',
        contact: 'Contato',
        document: 'CPF',
        lastVisit: 'Última Consulta',
        nextAppointment: 'Próximo Agendamento',
        status: 'Status',
        actions: 'Ações'
      },
      patientLink: (name: string) => `Visualizar dados do paciente ${name}`,
      email: 'E-mail',
      phone: 'Telefone',
      noData: 'Não informado',
      moreActions: (name: string) => `Mais ações para ${name}`
    },
    status: {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente'
    }
  };

  return (
    <KeyboardNavigationProvider>
      {/* Skip Links for Accessibility */}
      <div className="sr-only">
        <a 
          href="#patients-search" 
          className="absolute top-0 left-0 p-2 bg-blue-600 text-white focus:not-sr-only focus:z-50"
        >
          {t.accessibility.skipToSearch}
        </a>
        <a 
          href="#patients-table" 
          className="absolute top-0 left-20 p-2 bg-blue-600 text-white focus:not-sr-only focus:z-50"
        >
          {t.accessibility.skipToTable}
        </a>
        <a 
          href="#add-patient" 
          className="absolute top-0 left-40 p-2 bg-blue-600 text-white focus:not-sr-only focus:z-50"
        >
          {t.accessibility.skipToAddPatient}
        </a>
      </div>
      
      <div className="space-y-6" role="main">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t.title}
            </h1>
            <p className="text-muted-foreground">
              {t.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild id="add-patient">
              <Link href="/dashboard/patients/new">
                <UserPlus className="h-4 w-4" />
                {t.actions.addPatient}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4" role="region" aria-label="Estatísticas de pacientes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t.stats.totalPatients}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="1234 pacientes no total">1,234</div>
              <p className="text-xs text-muted-foreground">
                +12% {t.stats.fromLastMonth}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t.stats.activePatients}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="1180 pacientes ativos">1,180</div>
              <p className="text-xs text-muted-foreground">
                +8% {t.stats.fromLastMonth}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t.stats.newPatients}
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="54 novos pacientes">54</div>
              <p className="text-xs text-muted-foreground">
                +25% {t.stats.fromLastMonth}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t.stats.pendingReviews}
              </CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-label="12 análises pendentes">12</div>
              <p className="text-xs text-muted-foreground">
                -15% {t.stats.fromLastMonth}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t.search.title}</CardTitle>
            <CardDescription>
              {t.search.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
              <div className="relative flex-1" id="patients-search">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder={t.search.placeholder}
                  className="pl-8"
                  aria-label={t.search.ariaLabel}
                />
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                {t.search.filter}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t.table.title}</CardTitle>
            <CardDescription>
              {t.table.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table id="patients-table" role="table" aria-label={t.table.ariaLabel}>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.table.columns.name}</TableHead>
                    <TableHead>{t.table.columns.contact}</TableHead>
                    <TableHead>{t.table.columns.document}</TableHead>
                    <TableHead>{t.table.columns.lastVisit}</TableHead>
                    <TableHead>{t.table.columns.nextAppointment}</TableHead>
                    <TableHead>{t.table.columns.status}</TableHead>
                    <TableHead className="w-[50px]">
                      <span className="sr-only">{t.table.columns.actions}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialPatients.map((patient, index) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/patients/${patient.id}`}
                          className="text-blue-600 hover:text-blue-800 underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-describedby={`patient-${patient.id}-info`}
                        >
                          {patient.name}
                        </Link>
                        <span id={`patient-${patient.id}-info`} className="sr-only">
                          {t.table.patientLink(patient.name)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" aria-hidden="true" />
                            <span className="sr-only">{t.table.email}:</span>
                            <a 
                              href={`mailto:${patient.email}`} 
                              className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              {patient.email}
                            </a>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" aria-hidden="true" />
                            <span className="sr-only">{t.table.phone}:</span>
                            <a 
                              href={`tel:${patient.phone}`} 
                              className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              {patient.phone}
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{patient.cpf}</span>
                      </TableCell>
                      <TableCell>
                        {patient.lastVisit ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
                            <time dateTime={patient.lastVisit}>{patient.lastVisit}</time>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t.table.noData}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.nextAppointment ? (
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
                            <time dateTime={patient.nextAppointment}>{patient.nextAppointment}</time>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{t.table.noData}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            patient.status === "active"
                              ? "default"
                              : patient.status === "inactive"
                              ? "secondary"
                              : "outline"
                          }
                          aria-label={`Status: ${t.status[patient.status]}`}
                        >
                          {t.status[patient.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={t.table.moreActions(patient.name)}
                          className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </KeyboardNavigationProvider>
  );
}
