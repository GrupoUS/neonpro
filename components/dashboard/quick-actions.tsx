'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Calendar,
  Clock,
  Users,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  RotateCcw,
  MessageCircle,
  Phone,
  Plus,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/hooks/use-appointments-manager'

interface QuickActionsProps {
  appointments: Appointment[]
  onConfirmAppointment?: (appointmentId: string) => Promise<void>
  onCancelAppointment?: (appointmentId: string, reason?: string) => Promise<void>
  onRescheduleAppointment?: (appointment: Appointment) => void
  onMarkCompleted?: (appointmentId: string) => Promise<void>
  onMarkNoShow?: (appointmentId: string) => Promise<void>
  onCreateAppointment?: () => void
  onBulkAction?: (action: string, appointmentIds: string[]) => Promise<void>
  className?: string
}

interface BulkActionModalProps {
  isOpen: boolean
  onClose: () => void
  appointments: Appointment[]
  onConfirm: (action: string, appointmentIds: string[], reason?: string) => Promise<void>
}

interface CancelModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  onConfirm: (reason: string) => Promise<void>
}

function BulkActionModal({ isOpen, onClose, appointments, onConfirm }: BulkActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([])
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending')
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed')

  const handleConfirm = async () => {
    if (selectedAppointments.length === 0) {
      toast.error('Selecione pelo menos um agendamento')
      return
    }

    setLoading(true)
    try {
      await onConfirm(selectedAction, selectedAppointments, reason)
      toast.success('Ação executada com sucesso!')
      onClose()
      setSelectedAction('')
      setSelectedAppointments([])
      setReason('')
    } catch (error) {
      toast.error('Erro ao executar ação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ações em Lote</DialogTitle>
          <DialogDescription>
            Execute ações em múltiplos agendamentos simultaneamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Ação</Label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirm">Confirmar Agendamentos</SelectItem>
                <SelectItem value="cancel">Cancelar Agendamentos</SelectItem>
                <SelectItem value="complete">Marcar como Concluído</SelectItem>
                <SelectItem value="no_show">Marcar como Não Compareceu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedAction && (
            <div className="space-y-2">
              <Label>Agendamentos Disponíveis</Label>
              <div className="max-h-40 overflow-y-auto space-y-2 border rounded p-2">
                {(selectedAction === 'confirm' ? pendingAppointments : 
                  selectedAction === 'cancel' ? appointments.filter(apt => !['cancelled', 'completed'].includes(apt.status)) :
                  selectedAction === 'complete' ? confirmedAppointments :
                  confirmedAppointments
                ).map(apt => (
                  <label key={apt.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAppointments.includes(apt.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAppointments(prev => [...prev, apt.id])
                        } else {
                          setSelectedAppointments(prev => prev.filter(id => id !== apt.id))
                        }
                      }}
                    />
                    <span className="text-sm">
                      {apt.patient.full_name} - {new Date(apt.date_time).toLocaleDateString()} {new Date(apt.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(selectedAction === 'cancel' || selectedAction === 'no_show') && (
            <div className="space-y-2">
              <Label>Motivo {selectedAction === 'cancel' ? '(opcional)' : ''}</Label>
              <Textarea
                placeholder={selectedAction === 'cancel' ? 'Motivo do cancelamento...' : 'Observações...'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedAction || selectedAppointments.length === 0 || loading}
          >
            {loading ? 'Processando...' : 'Confirmar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CancelModal({ isOpen, onClose, appointment, onConfirm }: CancelModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(reason)
      onClose()
      setReason('')
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar Agendamento</DialogTitle>
          <DialogDescription>
            {appointment && (
              <>Confirme o cancelamento do agendamento de {appointment.patient.full_name}</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Motivo (opcional)</Label>
            <Textarea
              placeholder="Motivo do cancelamento..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={loading}
          >
            {loading ? 'Cancelando...' : 'Cancelar Agendamento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function QuickActions({
  appointments,
  onConfirmAppointment,
  onCancelAppointment,
  onRescheduleAppointment,
  onMarkCompleted,
  onMarkNoShow,
  onCreateAppointment,
  onBulkAction,
  className
}: QuickActionsProps) {
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  // Statistics
  const stats = {
    total: appointments.length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
    completed: appointments.filter(apt => apt.status === 'completed').length,
    noShow: appointments.filter(apt => apt.status === 'no_show').length
  }

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending')
  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.date_time)
    const now = new Date()
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    return apt.status === 'confirmed' && appointmentDate <= todayEnd && appointmentDate >= now
  })

  const handleQuickAction = async (action: string, appointment?: Appointment) => {
    try {
      switch (action) {
        case 'confirm':
          if (appointment) {
            await onConfirmAppointment?.(appointment.id)
            toast.success('Agendamento confirmado!')
          }
          break
        case 'complete':
          if (appointment) {
            await onMarkCompleted?.(appointment.id)
            toast.success('Agendamento marcado como concluído!')
          }
          break
        case 'no_show':
          if (appointment) {
            await onMarkNoShow?.(appointment.id)
            toast.success('Agendamento marcado como não compareceu!')
          }
          break
        case 'reschedule':
          if (appointment) {
            onRescheduleAppointment?.(appointment)
          }
          break
      }
    } catch (error) {
      toast.error('Erro ao executar ação')
    }
  }

  const handleCancelAppointment = async (reason: string) => {
    if (!selectedAppointment) return
    
    try {
      await onCancelAppointment?.(selectedAppointment.id, reason)
      toast.success('Agendamento cancelado!')
    } catch (error) {
      toast.error('Erro ao cancelar agendamento')
    }
  }

  return (
    <>
      <div className={cn('grid gap-4', className)}>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                  <p className="text-xs text-muted-foreground">Confirmados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Concluídos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                  <p className="text-xs text-muted-foreground">Cancelados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UserX className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.noShow}</p>
                  <p className="text-xs text-muted-foreground">Não Compareceram</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create New Appointment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Novo Agendamento
              </CardTitle>
              <CardDescription>
                Criar um novo agendamento rapidamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onCreateAppointment} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Criar Agendamento
              </Button>
            </CardContent>
          </Card>

          {/* Pending Confirmations */}
          {pendingAppointments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Confirmações Pendentes
                  <Badge variant="secondary">{pendingAppointments.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Agendamentos aguardando confirmação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {pendingAppointments.slice(0, 3).map(apt => (
                    <div key={apt.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <span>{apt.patient.full_name}</span>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleQuickAction('confirm', apt)}
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(apt)
                            setCancelModalOpen(true)
                          }}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {pendingAppointments.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{pendingAppointments.length - 3} mais pendentes
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Today's Appointments */}
          {upcomingAppointments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Próximos Agendamentos
                  <Badge variant="secondary">{upcomingAppointments.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Agendamentos confirmados para hoje
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {upcomingAppointments.slice(0, 3).map(apt => (
                    <div key={apt.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <div>
                        <span className="font-medium">{apt.patient.full_name}</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(apt.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleQuickAction('complete', apt)}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleQuickAction('no_show', apt)}
                        >
                          <AlertTriangle className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bulk Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Ações em Lote
              </CardTitle>
              <CardDescription>
                Execute ações em múltiplos agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setBulkModalOpen(true)}
                disabled={appointments.length === 0}
              >
                Gerenciar em Lote
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <BulkActionModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        appointments={appointments}
        onConfirm={onBulkAction || (async () => {})}
      />

      <CancelModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false)
          setSelectedAppointment(null)
        }}
        appointment={selectedAppointment}
        onConfirm={handleCancelAppointment}
      />
    </>
  )
}