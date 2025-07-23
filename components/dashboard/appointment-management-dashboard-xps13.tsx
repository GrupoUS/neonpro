'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  List,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  TrendingUp,
  Settings,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { toast } from 'sonner'
import { useAppointmentsManager } from '@/hooks/use-appointments-manager'
import { AppointmentFilters } from './appointment-filters'
import { AppointmentListView } from './appointment-list-view'
import { AppointmentCalendarView } from './appointment-calendar-view'
import { QuickActions } from './quick-actions'
import {
  EditAppointmentDialog,
  RescheduleAppointmentDialog,
  ContactPatientDialog,
  CreateAppointmentDialog
} from './appointments/modals'
import type { Appointment } from '@/hooks/use-appointments-manager'

interface AppointmentManagementDashboardProps {
  userId: string
  userRole: 'admin' | 'professional' | 'receptionist'
  professionalId?: string
  className?: string
}

export function AppointmentManagementDashboard({
  userId,
  userRole,
  professionalId,
  className = ''
}: AppointmentManagementDashboardProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedView, setSelectedView] = useState<'list' | 'calendar'>('list')
  const [refreshing, setRefreshing] = useState(false)
  
  // Modal states
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const {
    appointments,
    filters,
    statistics,
    isLoading,
    error,
    updateFilters,
    clearFilters,
    confirmAppointment,
    cancelAppointment,
    rescheduleAppointment,
    markCompleted,
    markNoShow,
    refreshData
  } = useAppointmentsManager({
    userId,
    userRole,
    professionalId,
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  })

  // Mock professionals data (replace with actual data)
  const professionals = [
    { id: '1', name: 'Dr. Ana Silva' },
    { id: '2', name: 'Dr. Carlos Santos' },
    { id: '3', name: 'Dra. Maria Oliveira' }
  ]

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshData()
      toast.success('Dados atualizados!')
    } catch (error) {
      toast.error('Erro ao atualizar dados')
    } finally {
      setRefreshing(false)
    }
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setEditDialogOpen(true)
  }

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleDialogOpen(true)
  }

  const handleContactPatient = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setContactDialogOpen(true)
  }

  const handleCreateAppointment = (date?: Date, time?: string) => {
    setCreateDialogOpen(true)
  }

  // Handle appointment updates from modals
  const handleAppointmentUpdate = (updatedAppointment: Appointment) => {
    // Refresh data to show updated appointment
    refreshData()
    setSelectedAppointment(null)
  }

  const handleAppointmentReschedule = async (appointmentId: string, newStartTime: string, reason: string) => {
    try {
      await rescheduleAppointment(appointmentId, newStartTime, reason)
      setSelectedAppointment(null)
    } catch (error) {
      throw error // Re-throw to be handled by the modal
    }
  }

  const handleCreateSuccess = () => {
    // Refresh data to show new appointment
    refreshData()
  }

  const handleBulkAction = async (action: string, appointmentIds: string[], reason?: string) => {
    try {
      switch (action) {
        case 'confirm':
          await Promise.all(appointmentIds.map(id => confirmAppointment(id)))
          break
        case 'cancel':
          await Promise.all(appointmentIds.map(id => cancelAppointment(id, reason)))
          break
        case 'complete':
          await Promise.all(appointmentIds.map(id => markCompleted(id)))
          break
        case 'no_show':
          await Promise.all(appointmentIds.map(id => markNoShow(id)))
          break
      }
    } catch (error) {
      throw error
    }
  }

  const formatDateRange = () => {
    switch (filters.dateRange) {
      case 'today':
        return 'Hoje'
      case 'week':
        return 'Esta Semana'
      case 'month':
        return 'Este Mês'
      case 'custom':
        if (filters.startDate && filters.endDate) {
          return `${format(filters.startDate, 'dd/MM')} - ${format(filters.endDate, 'dd/MM')}`
        }
        return 'Período Personalizado'
      default:
        return 'Esta Semana'
    }
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-600">Erro ao carregar agendamentos</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error}
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Agendamentos</h1>
          <p className="text-muted-foreground">
            {formatDateRange()} • {statistics.total} agendamento{statistics.total !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button onClick={() => handleCreateAppointment()}>
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions
        appointments={appointments}
        onConfirmAppointment={confirmAppointment}
        onCancelAppointment={cancelAppointment}
        onRescheduleAppointment={handleRescheduleAppointment}
        onMarkCompleted={markCompleted}
        onMarkNoShow={markNoShow}
        onCreateAppointment={() => handleCreateAppointment()}
        onBulkAction={handleBulkAction}
      />

      {/* Filters */}
      <AppointmentFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onClearFilters={clearFilters}
        professionals={professionals}
      />

      {/* Main Content */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <AppointmentListView
            appointments={appointments}
            onEdit={handleEditAppointment}
            onCancel={(id, reason) => cancelAppointment(id, reason)}
            onConfirm={confirmAppointment}
            onReschedule={handleRescheduleAppointment}
            onMarkCompleted={markCompleted}
            onMarkNoShow={markNoShow}
            onContact={handleContactPatient}
            loading={isLoading}
          />
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-4">
          <AppointmentCalendarView
            appointments={appointments}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            onAppointmentSelect={handleEditAppointment}
            onDaySelect={(date) => {
              // Focus on selected day
              setCurrentDate(date)
            }}
            onCreateAppointment={handleCreateAppointment}
            loading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Statistics Summary */}
      {statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Resumo do Período
            </CardTitle>
            <CardDescription>
              Estatísticas dos agendamentos para {formatDateRange().toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{statistics.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistics.completed}</div>
                <div className="text-sm text-muted-foreground">Concluídos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistics.cancelled + statistics.noShow}</div>
                <div className="text-sm text-muted-foreground">Cancelados/Faltas</div>
              </div>
            </div>
            
            {statistics.revenue && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Receita do Período</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {statistics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <EditAppointmentDialog
        appointment={selectedAppointment}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={handleAppointmentUpdate}
      />

      <RescheduleAppointmentDialog
        appointment={selectedAppointment}
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
        onReschedule={handleAppointmentReschedule}
      />

      <ContactPatientDialog
        appointment={selectedAppointment}
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
      />

      <CreateAppointmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateSuccess={handleCreateSuccess}
        professionalId={professionalId}
      />
    </div>
  )
}