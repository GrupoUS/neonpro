/**
 * Staff Coordination Component
 * 
 * Sistema de coordenação de equipe para clínicas estéticas brasileiras
 * Comunicação em tempo real, atribuição de tarefas e gestão de equipe
 * 
 * @component StaffCoordination
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@neonpro/ui'
import { Button } from '@neonpro/ui'
import { Alert, AlertDescription } from '@neonpro/ui'
import { Badge } from '@neonpro/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@neonpro/ui'
import { AccessibilityProvider } from '@neonpro/ui'
import { ScreenReaderAnnouncer } from '@neonpro/ui'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'
import { AccessibilityInput } from '@/components/ui/accessibility-input'
import { MobileHealthcareButton } from '@/components/ui/mobile-healthcare-button'

import {
  StaffMember,
  ClinicalTask,
  ClinicalMessage,
  StaffCoordinationProps,
  StaffRole,
  WorkingHours,
  ClinicalWorkflowComponentProps
} from './types'

import { HealthcareContext } from '@/types/healthcare'

interface StaffCoordinationComponentProps extends ClinicalWorkflowComponentProps {
  staffMembers: StaffMember[]
  tasks: ClinicalTask[]
  messages: ClinicalMessage[]
  onTaskAssignment?: (taskId: string, staffId: string) => Promise<void>
  onTaskUpdate?: (task: Partial<ClinicalTask>) => Promise<void>
  onSendMessage?: (message: Omit<ClinicalMessage, 'id' | 'createdAt' | 'read'>) => Promise<void>
  onMessageRead?: (messageId: string) => Promise<void>
  onStaffStatusUpdate?: (staffId: string, status: 'available' | 'busy' | 'offline') => Promise<void>
  onEmergencyAlert?: (alert: any) => void
}

const STAFF_ROLES: { value: StaffRole; label: string; color: string }[] = [
  { value: 'medico', label: 'Médico', color: 'blue' },
  { value: 'enfermeiro', label: 'Enfermeiro', color: 'green' },
  { value: 'tecnico_enfermagem', label: 'Técnico de Enfermagem', color: 'teal' },
  { value: 'esteticista', label: 'Esteticista', color: 'purple' },
  { value: 'coordenador_clinico', label: 'Coordenador Clínico', color: 'orange' },
  { value: 'recepcao', label: 'Recepção', color: 'gray' },
  { value: 'administrativo', label: 'Administrativo', color: 'indigo' }
]

const TASK_PRIORITIES = [
  { value: 'low', label: 'Baixa', color: 'gray' },
  { value: 'medium', label: 'Média', color: 'blue' },
  { value: 'high', label: 'Alta', color: 'yellow' },
  { value: 'urgent', label: 'Urgente', color: 'red' }
]

const TASK_CATEGORIES = [
  { value: 'patient_care', label: 'Cuidado ao Paciente' },
  { value: 'administrative', label: 'Administrativo' },
  { value: 'clinical', label: 'Clínico' },
  { value: 'emergency', label: 'Emergência' }
]

const MESSAGE_TYPES = [
  { value: 'general', label: 'Geral', color: 'gray' },
  { value: 'urgent', label: 'Urgente', color: 'red' },
  { value: 'patient_update', label: 'Atualização de Paciente', color: 'blue' },
  { value: 'emergency', label: 'Emergência', color: 'red' },
  { value: 'task_assignment', label: 'Atribuição de Tarefa', color: 'purple' }
]

export const StaffCoordination: React.FC<StaffCoordinationComponentProps> = ({
  staffId,
  healthcareContext,
  className,
  staffMembers = [],
  tasks = [],
  messages = [],
  onTaskAssignment,
  onTaskUpdate,
  onSendMessage,
  onMessageRead,
  onStaffStatusUpdate,
  onEmergencyAlert
}) => {
  const [activeTab, setActiveTab] = useState('team')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)

  // Form states
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as const,
    category: 'patient_care' as const,
    dueDate: '',
    patientId: '',
    treatmentSessionId: ''
  })

  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    recipientRole: undefined as StaffRole | undefined,
    content: '',
    type: 'general' as const,
    priority: 'medium' as const
  })

  // Monitor offline status for mobile clinical use
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Filter data based on search
  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTaskCreate = useCallback(async () => {
    if (!newTask.title.trim() || !newTask.assignedTo) return

    try {
      setIsSubmitting(true)

      const taskData: Omit<ClinicalTask, 'id' | 'createdAt' | 'updatedAt'> = {
        title: newTask.title,
        description: newTask.description,
        assignedTo: newTask.assignedTo,
        assignedBy: staffId,
        priority: newTask.priority,
        category: newTask.category,
        status: 'pending',
        dueDate: newTask.dueDate,
        patientId: newTask.patientId || undefined,
        treatmentSessionId: newTask.treatmentSessionId || undefined
      }

      if (onTaskUpdate) {
        await onTaskUpdate(taskData)
      }

      // Reset form
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        category: 'patient_care',
        dueDate: '',
        patientId: '',
        treatmentSessionId: ''
      })

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Tarefa criada com sucesso')
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [newTask, staffId, onTaskUpdate])

  const handleTaskAssignment = useCallback(async (taskId: string, newStaffId: string) => {
    try {
      setIsSubmitting(true)

      if (onTaskAssignment) {
        await onTaskAssignment(taskId, newStaffId)
      }

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Tarefa reatribuída com sucesso')
    } catch (error) {
      console.error('Error assigning task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onTaskAssignment])

  const handleTaskStatusUpdate = useCallback(async (taskId: string, newStatus: string) => {
    try {
      setIsSubmitting(true)

      if (onTaskUpdate) {
        await onTaskUpdate({ id: taskId, status: newStatus as any })
      }

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Status da tarefa atualizado com sucesso')
    } catch (error) {
      console.error('Error updating task status:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onTaskUpdate])

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.content.trim() || (!newMessage.recipientId && !newMessage.recipientRole)) return

    try {
      setIsSubmitting(true)

      const messageData: Omit<ClinicalMessage, 'id' | 'createdAt' | 'read'> = {
        senderId: staffId,
        recipientId: newMessage.recipientId,
        recipientRole: newMessage.recipientRole,
        content: newMessage.content,
        type: newMessage.type,
        priority: newMessage.priority
      }

      if (onSendMessage) {
        await onSendMessage(messageData)
      }

      // Reset form
      setNewMessage({
        recipientId: '',
        recipientRole: undefined,
        content: '',
        type: 'general',
        priority: 'medium'
      })

      // Announce for screen readers
      ScreenReaderAnnouncer.announce('Mensagem enviada com sucesso')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [newMessage, staffId, onSendMessage])

  const handleMessageRead = useCallback(async (messageId: string) => {
    try {
      if (onMessageRead) {
        await onMessageRead(messageId)
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }, [onMessageRead])

  const handleStaffStatusUpdate = useCallback(async (staffId: string, status: 'available' | 'busy' | 'offline') => {
    try {
      if (onStaffStatusUpdate) {
        await onStaffStatusUpdate(staffId, status)
      }
    } catch (error) {
      console.error('Error updating staff status:', error)
    }
  }, [onStaffStatusUpdate])

  const handleEmergency = useCallback(() => {
    if (onEmergencyAlert) {
      onEmergencyAlert({
        id: `emergency-${Date.now()}`,
        type: 'medical_emergency',
        severity: 'high',
        location: 'Coordenação de Equipe',
        description: 'Emergência requer coordenação de equipe',
        reportedBy: staffId,
        reportedAt: new Date().toISOString(),
        status: 'active',
        responseTeam: []
      })
    }
  }, [onEmergencyAlert, staffId])

  const isStaffAvailable = (staff: StaffMember) => {
    // Check if staff is currently working based on their working hours
    const now = new Date()
    const currentDay = now.toLocaleLowerCase('en-US', { weekday: 'long' })
    const currentTime = now.getHours() * 100 + now.getMinutes()
    
    const daySchedule = staff.workingHours[currentDay as keyof WorkingHours]
    if (!daySchedule || daySchedule.length === 0) return false
    
    return daySchedule.some(slot => {
      const [startHour, startMin] = slot.start.split(':').map(Number)
      const [endHour, endMin] = slot.end.split(':').map(Number)
      const startTime = startHour * 100 + startMin
      const endTime = endHour * 100 + endMin
      
      return currentTime >= startTime && currentTime <= endTime
    })
  }

  const getStaffWorkload = (staffId: string) => {
    const activeTasks = tasks.filter(task => 
      task.assignedTo === staffId && 
      task.status !== 'completed' && 
      task.status !== 'cancelled'
    )
    return activeTasks.length
  }

  const getUnreadMessageCount = () => {
    return messages.filter(message => 
      !message.read && 
      (message.recipientId === staffId || message.recipientRole === STAFF_ROLES.find(r => r.value === staffMembers.find(s => s.id === staffId)?.role)?.value)
    ).length
  }

  return (
    <AccessibilityProvider>
      <div className={`max-w-7xl mx-auto p-4 ${className}`}>
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Coordenação de Equipe Clínica
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Comunicação em tempo real e gestão de tarefas para equipe multidisciplinar
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isOffline ? "destructive" : "secondary"}>
                  {isOffline ? 'Offline' : 'Online'}
                </Badge>
                {getUnreadMessageCount() > 0 && (
                  <Badge variant="destructive">
                    {getUnreadMessageCount()} mensagens não lidas
                  </Badge>
                )}
                <MobileHealthcareButton
                  variant="emergency"
                  size="lg"
                  onClick={handleEmergency}
                  aria-label="Acionar emergência"
                >
                  Emergência
                </MobileHealthcareButton>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <AccessibilityInput
                placeholder="Buscar equipe, tarefas ou mensagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <div className="text-sm text-gray-600">
                {filteredStaff.length} membros • {filteredTasks.length} tarefas • {filteredMessages.length} mensagens
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map(staff => (
                <StaffCard
                  key={staff.id}
                  staff={staff}
                  isAvailable={isStaffAvailable(staff)}
                  workload={getStaffWorkload(staff.id)}
                  isSelected={selectedStaff === staff.id}
                  onClick={() => setSelectedStaff(staff.id)}
                  onStatusUpdate={handleStaffStatusUpdate}
                />
              ))}
            </div>

            {selectedStaff && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Membro da Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <StaffDetailView 
                    staff={staffMembers.find(s => s.id === selectedStaff)!}
                    tasks={tasks.filter(t => t.assignedTo === selectedStaff)}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Criar Nova Tarefa</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <HealthcareFormGroup label="Título da Tarefa" context={healthcareContext}>
                    <AccessibilityInput
                      value={newTask.title}
                      onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título da tarefa"
                    />
                  </HealthcareFormGroup>
                  <HealthcareFormGroup label="Atribuir a" context={healthcareContext}>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Selecione um membro da equipe...</option>
                      {staffMembers.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.role})
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>
                </div>

                <HealthcareFormGroup label="Descrição" context={healthcareContext}>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="Descrição detalhada da tarefa..."
                  />
                </HealthcareFormGroup>

                <div className="grid grid-cols-3 gap-4">
                  <HealthcareFormGroup label="Prioridade" context={healthcareContext}>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {TASK_PRIORITIES.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>
                  <HealthcareFormGroup label="Categoria" context={healthcareContext}>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {TASK_CATEGORIES.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>
                  <HealthcareFormGroup label="Data Limite" context={healthcareContext}>
                    <AccessibilityInput
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </HealthcareFormGroup>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleTaskCreate}
                    disabled={isSubmitting || !newTask.title.trim() || !newTask.assignedTo}
                    loading={isSubmitting}
                  >
                    Criar Tarefa
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarefas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTasks
                    .filter(task => task.status !== 'completed' && task.status !== 'cancelled')
                    .map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      staffMembers={staffMembers}
                      onAssignment={handleTaskAssignment}
                      onStatusUpdate={handleTaskStatusUpdate}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <HealthcareFormGroup label="Destinatário" context={healthcareContext}>
                    <select
                      value={newMessage.recipientId}
                      onChange={(e) => setNewMessage(prev => ({ 
                        ...prev, 
                        recipientId: e.target.value,
                        recipientRole: undefined
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Selecione um membro da equipe...</option>
                      {staffMembers.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.role})
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>
                  <HealthcareFormGroup label="Ou enviar para cargo" context={healthcareContext}>
                    <select
                      value={newMessage.recipientRole || ''}
                      onChange={(e) => setNewTask(prev => ({ 
                        ...prev, 
                        recipientId: '',
                        recipientRole: e.target.value as StaffRole
                      }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Selecione um cargo...</option>
                      {STAFF_ROLES.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>
                </div>

                <HealthcareFormGroup label="Mensagem" context={healthcareContext}>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    placeholder="Digite sua mensagem..."
                  />
                </HealthcareFormGroup>

                <div className="grid grid-cols-2 gap-4">
                  <HealthcareFormGroup label="Tipo" context={healthcareContext}>
                    <select
                      value={newMessage.type}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {MESSAGE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>
                  <HealthcareFormGroup label="Prioridade" context={healthcareContext}>
                    <select
                      value={newMessage.priority}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {TASK_PRIORITIES.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </HealthcareFormGroup>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSubmitting || !newMessage.content.trim() || (!newMessage.recipientId && !newMessage.recipientRole)}
                    loading={isSubmitting}
                  >
                    Enviar Mensagem
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mensagens Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredMessages.map(message => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      staffMembers={staffMembers}
                      onMarkAsRead={handleMessageRead}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {staffMembers.length}
                  </div>
                  <div className="text-sm text-gray-600">Membros da Equipe</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-yellow-600">
                    {tasks.filter(t => t.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Tarefas Pendentes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-green-600">
                    {staffMembers.filter(s => isStaffAvailable(s)).length}
                  </div>
                  <div className="text-sm text-gray-600">Disponíveis</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-red-600">
                    {getUnreadMessageCount()}
                  </div>
                  <div className="text-sm text-gray-600">Mensagens Não Lidas</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent tasks */}
                  <div>
                    <h4 className="font-semibold mb-2">Tarefas Recentes</h4>
                    <div className="space-y-2">
                      {tasks.slice(-5).map(task => (
                        <div key={task.id} className="flex items-center justify-between text-sm">
                          <span>{task.title}</span>
                          <Badge variant="outline">{task.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent messages */}
                  <div>
                    <h4 className="font-semibold mb-2">Mensagens Recentes</h4>
                    <div className="space-y-2">
                      {messages.slice(-5).map(message => (
                        <div key={message.id} className="flex items-center justify-between text-sm">
                          <span>{message.content.substring(0, 50)}...</span>
                          <Badge variant={message.read ? 'secondary' : 'destructive'}>
                            {message.read ? 'Lida' : 'Não lida'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AccessibilityProvider>
  )
}

// Sub-components
const StaffCard: React.FC<{
  staff: StaffMember
  isAvailable: boolean
  workload: number
  isSelected: boolean
  onClick: () => void
  onStatusUpdate: (staffId: string, status: 'available' | 'busy' | 'offline') => void
}> = ({ staff, isAvailable, workload, isSelected, onClick, onStatusUpdate }) => {
  const roleInfo = STAFF_ROLES.find(r => r.value === staff.role)
  
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <Badge variant={roleInfo?.color as any || 'secondary'}>
          {roleInfo?.label || staff.role}
        </Badge>
        <Badge variant={isAvailable ? 'green' : 'gray'}>
          {isAvailable ? 'Disponível' : 'Indisponível'}
        </Badge>
      </div>
      <h3 className="font-medium mb-1">{staff.name}</h3>
      <div className="text-sm text-gray-600 mb-2">
        {staff.phone} • {staff.email}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span>{workload} tarefas ativas</span>
        <select
          value={isAvailable ? 'available' : 'busy'}
          onChange={(e) => onStatusUpdate(staff.id, e.target.value as any)}
          onClick={(e) => e.stopPropagation()}
          className="text-xs p-1 border rounded"
        >
          <option value="available">Disponível</option>
          <option value="busy">Ocupado</option>
          <option value="offline">Offline</option>
        </select>
      </div>
    </div>
  )
}

const StaffDetailView: React.FC<{
  staff: StaffMember
  tasks: ClinicalTask[]
}> = ({ staff, tasks }) => {
  const roleInfo = STAFF_ROLES.find(r => r.value === staff.role)
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Informações Pessoais</h4>
          <p><strong>Nome:</strong> {staff.name}</p>
          <p><strong>Cargo:</strong> {roleInfo?.label || staff.role}</p>
          <p><strong>Telefone:</strong> {staff.phone}</p>
          <p><strong>Email:</strong> {staff.email}</p>
        </div>
        <div>
          <h4 className="font-semibold">Registros Profissionais</h4>
          {staff.crm && <p><strong>CRM:</strong> {staff.crm}</p>}
          {staff.coren && <p><strong>COREN:</strong> {staff.coren}</p>}
          <p><strong>Especializações:</strong> {staff.specializations?.join(', ') || 'Nenhuma'}</p>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold">Tarefas Ativas</h4>
        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center justify-between text-sm p-2 border rounded">
              <span>{task.title}</span>
              <Badge variant="outline">{task.status}</Badge>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-gray-600 text-sm">Nenhuma tarefa ativa</p>
          )}
        </div>
      </div>
    </div>
  )
}

const TaskItem: React.FC<{
  task: ClinicalTask
  staffMembers: StaffMember[]
  onAssignment: (taskId: string, staffId: string) => void
  onStatusUpdate: (taskId: string, status: string) => void
  disabled: boolean
}> = ({ task, staffMembers, onAssignment, onStatusUpdate, disabled }) => {
  const priorityInfo = TASK_PRIORITIES.find(p => p.value === task.priority)
  const categoryInfo = TASK_CATEGORIES.find(c => c.value === task.category)
  
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={priorityInfo?.color as any || 'secondary'}>
            {priorityInfo?.label || task.priority}
          </Badge>
          <Badge variant="outline">{categoryInfo?.label || task.category}</Badge>
        </div>
        <span className="text-sm text-gray-600">
          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
        </span>
      </div>
      <h4 className="font-medium mb-2">{task.title}</h4>
      <p className="text-sm text-gray-700 mb-2">{task.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={task.assignedTo}
            onChange={(e) => onAssignment(task.id, e.target.value)}
            className="text-sm p-1 border rounded"
            disabled={disabled}
          >
            {staffMembers.map(staff => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </select>
          <select
            value={task.status}
            onChange={(e) => onStatusUpdate(task.id, e.target.value)}
            className="text-sm p-1 border rounded"
            disabled={disabled}
          >
            <option value="pending">Pendente</option>
            <option value="in_progress">Em Progresso</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>
    </div>
  )
}

const MessageItem: React.FC<{
  message: ClinicalMessage
  staffMembers: StaffMember[]
  onMarkAsRead: (messageId: string) => void
}> = ({ message, staffMembers, onMarkAsRead }) => {
  const sender = staffMembers.find(s => s.id === message.senderId)
  const typeInfo = MESSAGE_TYPES.find(t => t.value === message.type)
  const priorityInfo = TASK_PRIORITIES.find(p => p.value === message.priority)
  
  return (
    <div className={`p-4 border rounded-lg ${!message.read ? 'bg-yellow-50 border-yellow-200' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={typeInfo?.color as any || 'secondary'}>
            {typeInfo?.label || message.type}
          </Badge>
          <Badge variant={priorityInfo?.color as any || 'secondary'}>
            {priorityInfo?.label || message.priority}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {sender?.name || 'Desconhecido'}
          </span>
          <span className="text-sm text-gray-600">
            {new Date(message.createdAt).toLocaleString('pt-BR')}
          </span>
          {!message.read && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkAsRead(message.id)}
            >
              Marcar como lida
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-700">{message.content}</p>
    </div>
  )
}

export default StaffCoordination