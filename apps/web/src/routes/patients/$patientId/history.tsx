/**
 * Patient History Route - Medical Records with Brazilian Healthcare Patterns
 * Features: Timeline view, procedure history, appointment records, LGPD compliance
 */

import { usePatient } from "@/hooks/usePatients";
import { Card, CardContent, CardHeader, CardTitle } from "@neonpro/ui";
import { Badge } from "@neonpro/ui";
import { Button } from "@neonpro/ui";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Activity,
  AlertCircle,
  Calendar,
  Clock,
  Download,
  FileText,
  History,
  MapPin,
  Pill,
  Search,
  Stethoscope,
  TrendingUp,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

// Type-safe params schema
const patientParamsSchema = z.object({
  patientId: z.string().min(1),
});

// Search params for filtering history
const historySearchSchema = z.object({
  filter: z
    .enum(["all", "appointments", "procedures", "medications"])
    .optional()
    .default("all"),
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).optional().default("all"),
  sortBy: z.enum(["date", "type", "status"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Mock data types (replace with actual API types)
interface HistoryItem {
  id: string;
  type: "appointment" | "procedure" | "medication" | "exam";
  title: string;
  description?: string;
  date: string;
  status: "completed" | "cancelled" | "scheduled" | "in_progress";
  professional?: string;
  location?: string;
  notes?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
}

// Route definition
export const Route = createFileRoute("/patients/$patientId/history")({
  // Type-safe parameter validation
  params: {
    parse: (params) => patientParamsSchema.parse(params),
    stringify: (params) => params,
  },

  // Type-safe search parameter validation
  validateSearch: historySearchSchema,

  // Loading component
  pendingComponent: () => (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded w-20"></div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  ),

  // Error boundary
  errorComponent: ({ error, reset }) => (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-lg mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">
            Erro ao Carregar Histórico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Não foi possível carregar o histórico médico do paciente.
          </p>
          <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
            {error.message}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={reset} variant="outline">
              Tentar Novamente
            </Button>
            <Button asChild>
              <Link to="/patients">Voltar</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),

  component: PatientHistoryPage,
});

function PatientHistoryPage() {
  const { patientId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();

  // Data fetching
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  // const { data: appointmentHistory, isLoading: historyLoading } = usePatientAppointmentHistory(patientId);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for demonstration (replace with real data)
  const mockHistoryData: HistoryItem[] = [
    {
      id: "1",
      type: "appointment",
      title: "Consulta de Rotina",
      description: "Avaliação geral e check-up preventivo",
      date: "2024-01-15T14:00:00Z",
      status: "completed",
      professional: "Dr. Carlos Silva",
      location: "Consultório 1",
      notes:
        "Paciente apresenta bom estado geral. Recomendado retorno em 6 meses.",
    },
    {
      id: "2",
      type: "procedure",
      title: "Aplicação de Botox",
      description: "Tratamento estético facial - região frontal",
      date: "2024-01-10T10:30:00Z",
      status: "completed",
      professional: "Dra. Ana Santos",
      location: "Sala de Procedimentos",
      notes:
        "Procedimento realizado sem intercorrências. Orientações pós-procedimento fornecidas.",
    },
    {
      id: "3",
      type: "exam",
      title: "Exames Laboratoriais",
      description: "Hemograma completo, glicose, colesterol",
      date: "2024-01-05T08:00:00Z",
      status: "completed",
      professional: "Lab. Diagnóstico",
      attachments: [
        { id: "1", name: "resultados_lab.pdf", type: "pdf", url: "#" },
      ],
    },
    {
      id: "4",
      type: "appointment",
      title: "Consulta de Retorno",
      description: "Avaliação pós-procedimento",
      date: "2024-02-15T15:00:00Z",
      status: "scheduled",
      professional: "Dra. Ana Santos",
      location: "Consultório 2",
    },
  ];

  // Filter and sort history data
  const filteredHistory = useMemo(() => {
    let filtered = mockHistoryData;

    // Apply type filter
    if ((search as any).filter !== "all") {
      const filterMap: Record<string, string[]> = {
        appointments: ["appointment"],
        procedures: ["procedure"],
        medications: ["medication"],
      };
      filtered = filtered.filter((item) =>
        filterMap[(search as any).filter]?.includes(item.type),
      );
    }

    // Apply period filter
    if ((search as any).period !== "all") {
      const now = new Date();
      const periodDays: Record<string, number> = {
        "7d": 7,
        "30d": 30,
        "90d": 90,
        "1y": 365,
      };
      const dayLimit = periodDays[(search as any).period];
      if (dayLimit) {
        filtered = filtered.filter(
          (item) => differenceInDays(now, parseISO(item.date)) <= dayLimit,
        );
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.professional?.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch ((search as any).sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return (search as any).sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [
    mockHistoryData,
    (search as any).filter,
    (search as any).period,
    searchQuery,
    (search as any).sortBy,
    (search as any).sortOrder,
  ]);

  // Filter change handler
  const handleFilterChange = (
    newFilter: "all" | "appointments" | "procedures" | "medications",
  ) => {
    navigate({
      to: "/patients/$patientId/history",
      params: { patientId },
      search: {
        filter: newFilter,
        period: (search as any).period,
        sortBy: (search as any).sortBy,
        sortOrder: (search as any).sortOrder,
      },
    });
  };

  // Period change handler
  const handlePeriodChange = (
    newPeriod: "all" | "7d" | "30d" | "90d" | "1y",
  ) => {
    navigate({
      to: "/patients/$patientId/history",
      params: { patientId },
      search: {
        filter: (search as any).filter,
        period: newPeriod,
        sortBy: (search as any).sortBy,
        sortOrder: (search as any).sortOrder,
      },
    });
  };

  if (patientLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card className="max-w-lg mx-auto text-center">
          <CardHeader>
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Paciente Não Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link
              to="/patients"
              className="hover:text-foreground transition-colors"
            >
              Pacientes
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link
              to="/patients/$patientId"
              params={{ patientId }}
              className="hover:text-foreground transition-colors"
            >
              {patient.fullName}
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground font-medium" aria-current="page">
            Histórico Médico
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <History className="w-6 h-6" />
            Histórico Médico
          </h1>
          <p className="text-muted-foreground">
            Registro completo de consultas, procedimentos e exames de{" "}
            {patient.fullName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar no histórico..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
        </div>

        {/* Type Filter */}
        <select
          value={(search as any).filter}
          onChange={(e) =>
            handleFilterChange(
              e.target.value as
                | "all"
                | "appointments"
                | "procedures"
                | "medications",
            )
          }
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <option value="all">Todos os tipos</option>
          <option value="appointments">Consultas</option>
          <option value="procedures">Procedimentos</option>
          <option value="medications">Medicamentos</option>
        </select>

        {/* Period Filter */}
        <select
          value={(search as any).period}
          onChange={(e) =>
            handlePeriodChange(
              e.target.value as "all" | "7d" | "30d" | "90d" | "1y",
            )
          }
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <option value="all">Todo o período</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
          <option value="1y">Último ano</option>
        </select>

        {/* Results count */}
        <div className="flex items-center justify-center px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground">
          {filteredHistory.length} registros
        </div>
      </div>

      {/* History Timeline */}
      <div className="space-y-6">
        {filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((item, index) => (
              <HistoryItemCard
                key={item.id}
                item={item}
                isLast={index === filteredHistory.length - 1}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Não há registros que correspondam aos filtros aplicados."
                  : "Este paciente ainda não possui histórico médico registrado."}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Limpar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Resumo do Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <HistoryStat
              label="Total de Consultas"
              value={
                mockHistoryData.filter((item) => item.type === "appointment")
                  .length
              }
              icon={Calendar}
              color="blue"
            />
            <HistoryStat
              label="Procedimentos Realizados"
              value={
                mockHistoryData.filter((item) => item.type === "procedure")
                  .length
              }
              icon={Stethoscope}
              color="green"
            />
            <HistoryStat
              label="Exames Realizados"
              value={
                mockHistoryData.filter((item) => item.type === "exam").length
              }
              icon={Activity}
              color="purple"
            />
            <HistoryStat
              label="Última Consulta"
              value={format(parseISO("2024-01-15T14:00:00Z"), "dd/MM/yyyy", {
                locale: ptBR,
              })}
              icon={Clock}
              color="orange"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * History Item Card Component
 */
function HistoryItemCard({
  item,
  isLast,
}: {
  item: HistoryItem;
  isLast: boolean;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return Calendar;
      case "procedure":
        return Stethoscope;
      case "medication":
        return Pill;
      case "exam":
        return Activity;
      default:
        return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "appointment":
        return "Consulta";
      case "procedure":
        return "Procedimento";
      case "medication":
        return "Medicamento";
      case "exam":
        return "Exame";
      default:
        return "Registro";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      completed: { label: "Concluído", variant: "default" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const },
      scheduled: { label: "Agendado", variant: "outline" as const },
      in_progress: { label: "Em Andamento", variant: "secondary" as const },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "outline" as const,
      }
    );
  };

  const TypeIcon = getTypeIcon(item.type);
  const statusInfo = getStatusBadge(item.status);

  return (
    <div className="relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
      )}

      <Card className="ml-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Timeline dot and icon */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                <TypeIcon className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                    <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(parseISO(item.date), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>

                {item.professional && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{item.professional}</span>
                  </div>
                )}

                {item.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-foreground">{item.notes}</p>
                </div>
              )}

              {/* Attachments */}
              {item.attachments && item.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Anexos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.attachments.map((attachment) => (
                      <Button
                        key={attachment.id}
                        variant="outline"
                        size="sm"
                        className="h-auto p-2"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <span className="text-xs">{attachment.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * History Stat Component
 */
function HistoryStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
    green: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
    purple:
      "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
    orange:
      "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
