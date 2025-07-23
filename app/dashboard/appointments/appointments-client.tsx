"use client";

import type {
  AppointmentStatus,
  AppointmentWithDetails,
  AppointmentWithRelations,
  AppointmentFilters as FilterType,
} from "@/app/lib/types/appointments";
import { CalendarView } from "@/components/dashboard/appointments/calendar";
import DeleteAppointmentDialog from "@/components/dashboard/appointments/delete-appointment-dialog";
import { AppointmentFilters } from "@/components/dashboard/appointments/filters";
import KeyboardShortcutsHelp from "@/components/dashboard/appointments/keyboard-shortcuts-help";
import { AppointmentDetailsSidebar } from "@/components/dashboard/appointments/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppointmentFilters } from "@/hooks/appointments/use-appointment-filters";
import { useKeyboardShortcuts } from "@/hooks/appointments/use-keyboard-shortcuts";
import {
  AlertCircle,
  CalendarPlus,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AppointmentsPageClientProps {
  initialAppointments: AppointmentWithRelations[];
  user: any;
}

export default function AppointmentsPageClient({
  initialAppointments,
  user,
}: AppointmentsPageClientProps) {
  const [appointments, setAppointments] =
    useState<AppointmentWithRelations[]>(initialAppointments);
  const [filteredAppointments, setFilteredAppointments] =
    useState<AppointmentWithRelations[]>(initialAppointments);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentWithRelations | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<AppointmentWithRelations | null>(null);

  // Keyboard shortcuts state
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  // Filters hook
  const {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    getAPIQueryParams,
  } = useAppointmentFilters();

  const router = useRouter();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRefresh: () => loadAppointments(),
    onToggleFilters: () => setShowFilters((prev) => !prev),
    onNewAppointment: () => handleCreateAppointment(),
    onCloseDialog: () => {
      if (deleteDialogOpen) {
        setDeleteDialogOpen(false);
        setAppointmentToDelete(null);
      } else if (sidebarOpen) {
        setSidebarOpen(false);
        setSelectedAppointmentId(null);
      } else if (shortcutsHelpOpen) {
        setShortcutsHelpOpen(false);
      }
    },
    onShowHelp: () => setShortcutsHelpOpen((prev) => !prev),
  });

  // Load appointments from API with filters
  const loadAppointments = async (filtersToApply?: FilterType) => {
    setIsLoading(true);
    try {
      const queryFilters = filtersToApply || filters;
      const queryParams = getAPIQueryParams;
      const queryString = new URLSearchParams(queryParams).toString();
      const url = `/api/appointments${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
        setFilteredAppointments(data);
      } else {
        toast.error("Erro ao carregar agendamentos");
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to reload appointments when filters change
  useEffect(() => {
    loadAppointments();
  }, [filters]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<FilterType>) => {
    updateFilters(newFilters);
  };

  // Handle clearing filters
  const handleClearFilters = () => {
    clearFilters();
  };

  // Toggle filters panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Refresh appointments
  const handleRefresh = () => {
    loadAppointments();
  };

  // Handle appointment actions
  const handleAppointmentClick = (appointment: AppointmentWithRelations) => {
    setSelectedAppointmentId(appointment.id);
    setSidebarOpen(true);
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setSelectedAppointmentId(null);
  };

  // Handle appointment update from sidebar
  const handleAppointmentUpdate = (
    updatedAppointment: AppointmentWithDetails
  ) => {
    // Update the appointments list with the updated appointment
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === updatedAppointment.id
          ? { ...apt, ...updatedAppointment }
          : apt
      )
    );

    // Refresh the full list to ensure consistency
    loadAppointments();
  };

  // Handle appointment deletion from sidebar
  const handleAppointmentDelete = (appointmentId: string) => {
    // Remove appointment from local state
    setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));

    // Refresh the full list to ensure consistency
    loadAppointments();
  };

  const handleAppointmentEdit = (appointment: AppointmentWithRelations) => {
    // Navigate to edit page
    router.push(`/dashboard/appointments/${appointment.id}/edit`);
  };

  const handleAppointmentCancel = (appointment: AppointmentWithRelations) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // The dialog handles the actual deletion
    // When completed, it will call loadAppointments via onDelete
    loadAppointments();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAppointmentToDelete(null);
  };

  const handleAppointmentComplete = async (
    appointment: AppointmentWithRelations
  ) => {
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (response.ok) {
        toast.success("Agendamento marcado como concluído");
        loadAppointments(); // Refresh the list
      } else {
        toast.error("Erro ao concluir agendamento");
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Erro ao concluir agendamento");
    }
  };

  const handleCreateAppointment = (date?: Date, time?: string) => {
    // Navigate to create page with optional pre-filled date/time
    const searchParams = new URLSearchParams();
    if (date) {
      searchParams.set("date", date.toISOString().split("T")[0]);
    }
    if (time) {
      searchParams.set("time", time);
    }

    router.push(`/dashboard/appointments/new?${searchParams.toString()}`);
  };

  // Calculate summary stats based on filtered appointments
  const todayAppointments = filteredAppointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.start_time);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  });

  const statusCounts = filteredAppointments.reduce((counts, appointment) => {
    const status = appointment.status as AppointmentStatus;
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {} as Record<AppointmentStatus, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agendamentos</h2>
          <p className="text-muted-foreground">
            Gerencie todos os agendamentos da clínica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            aria-label="Atualizar lista de agendamentos (tecla R)"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          <Link href="/dashboard/appointments/new">
            <Button aria-label="Criar novo agendamento (Ctrl+N)">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        className="grid gap-4 md:grid-cols-4"
        role="region"
        aria-label="Resumo de agendamentos"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Clock
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              aria-label={`${todayAppointments.length} agendamentos para hoje`}
            >
              {todayAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayAppointments.filter((a) => a.status === "confirmed").length}{" "}
              confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              aria-label={`${filteredAppointments.length} agendamentos ${
                hasActiveFilters ? "filtrados" : "total"
              }`}
            >
              {filteredAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              agendamentos{hasActiveFilters ? " (filtrados)" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              aria-label={`${
                statusCounts.confirmed || 0
              } agendamentos confirmados`}
            >
              {statusCounts.confirmed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              prontos para atendimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold"
              aria-label={`${
                statusCounts.scheduled || 0
              } agendamentos pendentes`}
            >
              {statusCounts.scheduled || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              aguardando confirmação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendário de Agendamentos</CardTitle>
              <CardDescription>
                Visualize e gerencie agendamentos por dia, semana ou mês
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFilters}
                className={hasActiveFilters ? "border-primary" : ""}
                aria-label={`${
                  showFilters ? "Ocultar" : "Mostrar"
                } filtros de agendamentos (tecla F)`}
                aria-expanded={showFilters}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-1 rounded-full bg-primary px-1 text-xs text-primary-foreground">
                    •
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  aria-label="Limpar todos os filtros aplicados"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {/* Filters Panel */}
        {showFilters && (
          <div className="border-b border-border px-6 py-4">
            <AppointmentFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}
        <CardContent className="p-0">
          <div className="h-[800px]">
            <CalendarView
              appointments={filteredAppointments}
              onRefresh={handleRefresh}
              onAppointmentClick={handleAppointmentClick}
              onAppointmentEdit={handleAppointmentEdit}
              onAppointmentCancel={handleAppointmentCancel}
              onAppointmentComplete={handleAppointmentComplete}
              onCreateAppointment={handleCreateAppointment}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Sidebar */}
      <AppointmentDetailsSidebar
        isOpen={sidebarOpen}
        appointmentId={selectedAppointmentId}
        onClose={handleSidebarClose}
        onUpdate={handleAppointmentUpdate}
        onDelete={handleAppointmentDelete}
      />

      {/* Delete Appointment Dialog */}
      <DeleteAppointmentDialog
        appointment={appointmentToDelete}
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onDelete={handleDeleteConfirm}
      />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />
    </div>
  );
}
