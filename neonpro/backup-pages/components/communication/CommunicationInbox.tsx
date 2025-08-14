'use client'

import { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Clock,
  User,
  Phone,
  Mail,
  MessageCircle,
  Archive,
  Star,
  AlertTriangle,
  CheckCircle2,
  Circle
} from 'lucide-react'
import { useInbox, useThreads } from '@/app/hooks/use-communication'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Message, MessageThread } from '@/app/lib/types/communication'

interface CommunicationInboxProps {
  onMessageSelect?: (message: Message) => void
  onThreadSelect?: (thread: MessageThread) => void
  selectedMessageId?: string | null
  selectedThreadId?: string | null
  className?: string
}

type ViewMode = 'messages' | 'threads'
type FilterStatus = 'all' | 'unread' | 'read' | 'urgent'
type FilterChannel = 'all' | 'sms' | 'email' | 'whatsapp' | 'system'

export function CommunicationInbox({ 
  onMessageSelect,
  onThreadSelect,
  selectedMessageId,
  selectedThreadId,
  className 
}: CommunicationInboxProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('threads')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterChannel, setFilterChannel] = useState<FilterChannel>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Build filters based on current state
  const messageFilters = useMemo(() => {
    const filters: any = {
      page: currentPage.toString(),
      limit: '20',
      sort: 'created_at',
      order: 'desc' as const
    }

    if (searchQuery) {
      filters.search = searchQuery
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'unread') {
        filters.read_at = 'null'
      } else if (filterStatus === 'read') {
        filters.read_at = 'not_null'
      } else if (filterStatus === 'urgent') {
        filters.priority = 'urgent'
      }
    }

    if (filterChannel !== 'all') {
      filters.channel = filterChannel
    }

    return filters
  }, [searchQuery, filterStatus, filterChannel, currentPage])

  const threadFilters = useMemo(() => {
    const filters: any = {
      page: currentPage.toString(),
      limit: '20',
      sort: 'updated_at',
      order: 'desc' as const
    }

    if (searchQuery) {
      filters.search = searchQuery
    }

    if (filterStatus === 'unread') {
      filters.status = 'active'
      filters.has_unread = 'true'
    } else if (filterStatus === 'urgent') {
      filters.priority = 'urgent'
    }

    return filters
  }, [searchQuery, filterStatus, currentPage])

  // Query hooks
  const messagesQuery = useInbox(viewMode === 'messages' ? messageFilters : undefined)
  const threadsQuery = useThreads(viewMode === 'threads' ? threadFilters : undefined)

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  // Handle filter changes
  const handleStatusFilter = useCallback((status: FilterStatus) => {
    setFilterStatus(status)
    setCurrentPage(1)
  }, [])

  const handleChannelFilter = useCallback((channel: FilterChannel) => {
    setFilterChannel(channel)
    setCurrentPage(1)
  }, [])

  // Get priority badge variant
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'default'
      case 'normal': return 'secondary'
      case 'low': return 'outline'
      default: return 'secondary'
    }
  }

  // Get channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return <Phone className="h-3 w-3" />
      case 'email': return <Mail className="h-3 w-3" />
      case 'whatsapp': return <MessageCircle className="h-3 w-3" />
      case 'system': return <MessageSquare className="h-3 w-3" />
      default: return <MessageSquare className="h-3 w-3" />
    }
  }

  // Render message item
  const renderMessageItem = (message: Message) => {
    const isSelected = selectedMessageId === message.id
    const isUnread = !message.read_at

    return (
      <div
        key={message.id}
        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
          isSelected ? 'bg-muted border-l-4 border-l-primary' : ''
        }`}
        onClick={() => onMessageSelect?.(message)}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.avatar_url} />
            <AvatarFallback>
              {message.sender?.name?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium truncate ${
                  isUnread ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {message.sender?.name || 'Sistema'}
                </span>
                <div className="flex items-center gap-1">
                  {getChannelIcon(message.channel)}
                  {message.priority !== 'normal' && (
                    <Badge variant={getPriorityVariant(message.priority)} className="h-5">
                      {message.priority}
                    </Badge>
                  )}
                  {isUnread && <Circle className="h-2 w-2 fill-primary text-primary" />}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(message.created_at), { 
                  addSuffix: true,
                  locale: ptBR 
                })}
              </div>
            </div>
            
            <p className={`text-sm line-clamp-2 ${
              isUnread ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {message.content}
            </p>
            
            {message.metadata?.template_name && (
              <div className="mt-1">
                <Badge variant="outline" className="h-5 text-xs">
                  Template: {message.metadata.template_name}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render thread item
  const renderThreadItem = (thread: MessageThread) => {
    const isSelected = selectedThreadId === thread.id
    const hasUnread = thread.unread_count > 0

    return (
      <div
        key={thread.id}
        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
          isSelected ? 'bg-muted border-l-4 border-l-primary' : ''
        }`}
        onClick={() => onThreadSelect?.(thread)}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={thread.patient?.avatar_url} />
            <AvatarFallback>
              {thread.patient?.name?.charAt(0) || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium truncate ${
                  hasUnread ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {thread.patient?.name || 'Paciente'}
                </span>
                
                <div className="flex items-center gap-1">
                  {thread.priority !== 'normal' && (
                    <Badge variant={getPriorityVariant(thread.priority)} className="h-5">
                      {thread.priority}
                    </Badge>
                  )}
                  
                  {thread.status === 'closed' && (
                    <Badge variant="outline" className="h-5">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Fechado
                    </Badge>
                  )}
                  
                  {thread.status === 'archived' && (
                    <Badge variant="secondary" className="h-5">
                      <Archive className="h-3 w-3 mr-1" />
                      Arquivado
                    </Badge>
                  )}
                  
                  {hasUnread && (
                    <Badge variant="default" className="h-5">
                      {thread.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(thread.updated_at), { 
                  addSuffix: true,
                  locale: ptBR 
                })}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-1 truncate">
              {thread.subject || 'Sem assunto'}
            </p>
            
            {thread.last_message && (
              <p className={`text-xs line-clamp-1 ${
                hasUnread ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {thread.last_message.content}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                {thread.message_count} mensagens
              </div>
              
              {thread.assigned_to && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  {thread.assigned_to.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isLoading = viewMode === 'messages' ? messagesQuery.isLoading : threadsQuery.isLoading
  const data = viewMode === 'messages' ? messagesQuery.data : threadsQuery.data
  const items = data?.data ? (viewMode === 'messages' ? data.data.messages : data.data.threads) : []

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comunicação
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="threads">Conversas</SelectItem>
                <SelectItem value="messages">Mensagens</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Search and filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mensagens..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={(value) => handleStatusFilter(value as FilterStatus)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="unread">Não lidas</SelectItem>
                <SelectItem value="read">Lidas</SelectItem>
                <SelectItem value="urgent">Urgentes</SelectItem>
              </SelectContent>
            </Select>
            
            {viewMode === 'messages' && (
              <Select value={filterChannel} onValueChange={(value) => handleChannelFilter(value as FilterChannel)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos canais</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma {viewMode === 'messages' ? 'mensagem' : 'conversa'} encontrada</p>
            </div>
          ) : (
            <div>
              {viewMode === 'messages' 
                ? items.map(renderMessageItem)
                : items.map(renderThreadItem)
              }
            </div>
          )}
        </ScrollArea>
        
        {/* Pagination */}
        {data?.data.pagination && data.data.pagination.pages > 1 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {data.data.pagination.page} de {data.data.pagination.pages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.data.pagination.has_prev}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.data.pagination.has_next}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}