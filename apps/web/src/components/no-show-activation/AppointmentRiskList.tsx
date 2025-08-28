"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
  Clock,
  Filter,
  Mail,
  Phone,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  TrendingUp,
  User,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import RiskScoreIndicator, { RiskScoreData } from "./RiskScoreIndicator";

// Types
export interface AppointmentData {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  doctorName: string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed" | "no_show";
  riskScore: RiskScoreData;
  lastContactDate?: string;
  interventionsCount: number;
}

export interface AppointmentRiskListProps {
  appointments: AppointmentData[];
  loading?: boolean;
  onRefresh?: () => void;
  onAppointmentSelect?: (appointment: AppointmentData) => void;
  onInterventionTrigger?: (appointmentId: string, riskLevel: string) => void;
  onContactPatient?: (patientId: string, method: "phone" | "email") => void;
  className?: string;
}

// Filter and sort options
const RISK_FILTER_OPTIONS = [
  { value: "all", label: "Todos os Riscos" },
  { value: "critical", label: "Risco Crítico" },
  { value: "high", label: "Alto Risco" },
  { value: "medium", label: "Risco Moderado" },
  { value: "low", label: "Baixo Risco" },
];

const SORT_OPTIONS = [
  { value: "risk_desc", label: "Maior Risco Primeiro" },
  { value: "risk_asc", label: "Menor Risco Primeiro" },
  { value: "date_asc", label: "Data Mais Próxima" },
  { value: "date_desc", label: "Data Mais Distante" },
  { value: "patient_name", label: "Nome do Paciente" },
];

export function AppointmentRiskList({
  appointments,
  loading = false,
  onRefresh,
  onAppointmentSelect,
  onInterventionTrigger,
  onContactPatient,
  className = "",
}: AppointmentRiskListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("risk_desc");
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);

  // Filtered and sorted appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(appointment =>
        appointment.patientName.toLowerCase().includes(term)
        || appointment.appointmentType.toLowerCase().includes(term)
        || appointment.doctorName.toLowerCase().includes(term)
      );
    }

    // Apply risk filter
    if (riskFilter !== "all") {
      filtered = filtered.filter(appointment => appointment.riskScore.riskCategory === riskFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "risk_desc":
          return b.riskScore.noShowProbability - a.riskScore.noShowProbability;
        case "risk_asc":
          return a.riskScore.noShowProbability - b.riskScore.noShowProbability;
        case "date_asc":
          return new Date(`${a.appointmentDate} ${a.appointmentTime}`).getTime()
            - new Date(`${b.appointmentDate} ${b.appointmentTime}`).getTime();
        case "date_desc":
          return new Date(`${b.appointmentDate} ${b.appointmentTime}`).getTime()
            - new Date(`${a.appointmentDate} ${a.appointmentTime}`).getTime();
        case "patient_name":
          return a.patientName.localeCompare(b.patientName, "pt-BR");
        default:
          return 0;
      }
    });

    return filtered;
  }, [appointments, searchTerm, riskFilter, sortBy]);

  // Risk statistics
  const riskStats = useMemo(() => {
    const stats = {
      total: appointments.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      avgRisk: 0,
    };

    appointments.forEach(appointment => {
      stats[appointment.riskScore.riskCategory]++;
      stats.avgRisk += appointment.riskScore.noShowProbability;
    });

    if (stats.total > 0) {
      stats.avgRisk = stats.avgRisk / stats.total;
    }

    return stats;
  }, [appointments]);

  // Format date and time
  const formatDateTime = useCallback((date: string, time: string) => {
    const datetime = new Date(`${date} ${time}`);
    return {
      date: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(datetime),
      time: new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(datetime),
      weekday: new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
      }).format(datetime),
    };
  }, []);

  // Handle appointment expansion
  const toggleAppointmentExpansion = useCallback((appointmentId: string) => {
    setExpandedAppointment(current => current === appointmentId ? null : appointmentId);
  }, []);

  // Handle patient contact
  const handleContactPatient = useCallback((patientId: string, method: "phone" | "email") => {
    if (onContactPatient) {
      onContactPatient(patientId, method);
    }
  }, [onContactPatient]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Stats */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Lista de Consultas com Análise de Risco
            </CardTitle>
            <Button
              size="sm"
              disabled={loading}
              onClick={onRefresh}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
              Atualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Risk Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{riskStats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{riskStats.critical}</div>
              <div className="text-sm text-muted-foreground">Crítico</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{riskStats.high}</div>
              <div className="text-sm text-muted-foreground">Alto</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{riskStats.medium}</div>
              <div className="text-sm text-muted-foreground">Moderado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{riskStats.low}</div>
              <div className="text-sm text-muted-foreground">Baixo</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, tipo de consulta ou médico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_FILTER_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SortAsc className="h-4 w-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment List */}
      <div className="space-y-3">
        {loading
          ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )
          : filteredAppointments.length === 0
          ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  {searchTerm || riskFilter !== "all"
                    ? "Nenhuma consulta encontrada com os filtros aplicados."
                    : "Nenhuma consulta encontrada."}
                </div>
              </CardContent>
            </Card>
          )
          : (
            filteredAppointments.map(appointment => {
              const datetime = formatDateTime(
                appointment.appointmentDate,
                appointment.appointmentTime,
              );
              const isExpanded = expandedAppointment === appointment.appointmentId;

              return (
                <Card
                  key={appointment.appointmentId}
                  className={cn(
                    "transition-all duration-200 hover:shadow-md",
                    appointment.riskScore.riskCategory === "critical" && "border-red-200",
                    appointment.riskScore.riskCategory === "high" && "border-orange-200",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Risk Indicator */}
                        <RiskScoreIndicator
                          riskData={appointment.riskScore}
                          size="md"
                          showDetails={false}
                          showTooltip={true}
                          interactive={true}
                          onInterventionTrigger={onInterventionTrigger}
                        />

                        {/* Appointment Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">
                              {appointment.patientName}
                            </h3>
                            {appointment.interventionsCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {appointment.interventionsCount} intervenções
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {datetime.date} ({datetime.weekday})
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {datetime.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {appointment.doctorName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {(appointment.riskScore.riskCategory === "high"
                          || appointment.riskScore.riskCategory === "critical") && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContactPatient(appointment.patientId, "phone")}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleContactPatient(appointment.patientId, "email")}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleAppointmentExpansion(appointment.appointmentId)}
                        >
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded && "rotate-90",
                            )}
                          />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                          <RiskScoreIndicator
                            riskData={appointment.riskScore}
                            size="md"
                            showDetails={true}
                            showTooltip={false}
                            interactive={true}
                            onInterventionTrigger={onInterventionTrigger}
                          />

                          {/* Additional appointment details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Tipo de Consulta:</strong> {appointment.appointmentType}
                            </div>
                            <div>
                              <strong>Status:</strong> {appointment.status}
                            </div>
                            <div>
                              <strong>Telefone:</strong> {appointment.patientPhone}
                            </div>
                            <div>
                              <strong>Email:</strong> {appointment.patientEmail}
                            </div>
                            {appointment.lastContactDate && (
                              <div className="md:col-span-2">
                                <strong>Último Contato:</strong> {new Intl.DateTimeFormat("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }).format(new Date(appointment.lastContactDate))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
      </div>
    </div>
  );
}

export default AppointmentRiskList;
