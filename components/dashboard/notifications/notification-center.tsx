'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Bell,
  Calendar,
  User,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notification {
  id: string
  type: 'appointment' | 'payment' | 'reminder' | 'system'
  title: string
  message: string
  read: boolean
  created_at: string
  related_id?: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()
    generateAutomaticNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Por enquanto, vamos simular notificações baseadas em agendamentos
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          status,
          clients (full_name),
          services (name)
        `)
        .eq('user_id', user.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time')
        .limit(10)

      if (appointments) {
        const generatedNotifications = generateNotificationsFromAppointments(appointments)
        setNotifications(generatedNotifications)
        setUnreadCount(generatedNotifications.filter(n => !n.read).length)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNotificationsFromAppointments = (appointments: any[]): Notification[] => {
    const notifications: Notification[] = []
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.start_time)
      
      // Notificação para agendamentos de amanhã
      if (appointmentDate.toDateString() === tomorrow.toDateString()) {
        notifications.push({
          id: `reminder-${appointment.id}`,
          type: 'reminder',
          title: 'Agendamento Amanhã',
          message: `${appointment.clients?.full_name} - ${appointment.services?.name} às ${format(appointmentDate, 'HH:mm')}`,
          read: false,
          created_at: now.toISOString(),
          related_id: appointment.id
        })
      }

      // Notificação para agendamentos pendentes de confirmação
      if (appointment.status === 'scheduled') {
        notifications.push({
          id: `pending-${appointment.id}`,
          type: 'appointment',
          title: 'Agendamento Pendente',
          message: `${appointment.clients?.full_name} aguarda confirmação para ${format(appointmentDate, "dd/MM 'às' HH:mm")}`,
          read: false,
          created_at: now.toISOString(),
          related_id: appointment.id
        })
      }
    })

    return notifications
  }

  const generateAutomaticNotifications = async () => {
    // Aqui você pode adicionar lógica para gerar notificações automáticas
    // baseadas em regras de negócio específicas
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'reminder':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'system':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      return 'Agora'
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`
    } else {
      return format(date, "dd/MM", { locale: ptBR })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Carregando notificações...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
            Nenhuma notificação
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start space-x-3 p-3 cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatNotificationTime(notification.created_at)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-muted-foreground">
              Ver todas as notificações
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
