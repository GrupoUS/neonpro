'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Send,
  Paperclip,
  Image,
  Smile,
  MoreVertical,
  Phone,
  Mail,
  MessageCircle,
  MessageSquare,
  Template,
  Clock,
  User,
  AlertTriangle,
  Star,
  Loader2
} from 'lucide-react'
import { useSendMessage, useTemplates, usePatientCommunication } from '@/app/hooks/use-communication'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { MessageTemplate } from '@/app/lib/types/communication'

interface MessageComposerProps {
  recipientId?: string
  recipientType?: 'patient' | 'staff'
  threadId?: string
  onSent?: () => void
  defaultChannel?: 'sms' | 'email' | 'whatsapp' | 'system'
  className?: string
}

const messageSchema = z.object({
  content: z.string().min(1, 'Mensagem é obrigatória'),
  channel: z.enum(['sms', 'email', 'whatsapp', 'system']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  subject: z.string().optional(),
  scheduled_for: z.string().optional(),
  template_id: z.string().optional()
})

type MessageFormData = z.infer<typeof messageSchema>

export function MessageComposer({
  recipientId,
  recipientType = 'patient',
  threadId,
  onSent,
  defaultChannel = 'sms',
  className
}: MessageComposerProps) {
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [showScheduling, setShowScheduling] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      channel: defaultChannel,
      priority: 'normal',
      content: ''
    }
  })

  const watchedChannel = watch('channel')
  const watchedContent = watch('content')

  // Hooks
  const sendMessage = useSendMessage()
  const { data: templatesData } = useTemplates({
    active: 'true',
    limit: '50',
    sort: 'name',
    order: 'asc'
  })

  // Get character count for SMS
  const smsCharCount = watchedChannel === 'sms' ? watchedContent?.length || 0 : 0
  const smsSegments = Math.ceil(smsCharCount / 160)

  // Handle form submission
  const onSubmit = useCallback(async (data: MessageFormData) => {
    if (!recipientId) {
      return
    }

    try {
      await sendMessage.mutateAsync({
        recipient_id: recipientId,
        recipient_type: recipientType,
        content: data.content,
        channel: data.channel,
        priority: data.priority,
        subject: data.subject,
        thread_id: threadId,
        scheduled_for: data.scheduled_for,
        template_id: data.template_id,
        metadata: selectedTemplate ? {
          template_name: selectedTemplate.name,
          template_category: selectedTemplate.category
        } : undefined
      })

      // Reset form
      reset()
      setSelectedTemplate(null)
      setShowScheduling(false)
      onSent?.()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [recipientId, recipientType, threadId, sendMessage, reset, onSent, selectedTemplate])

  // Handle template selection
  const handleTemplateSelect = useCallback((template: MessageTemplate) => {
    let content = template.body

    // Simple variable replacement (in a real app, you'd have a more sophisticated system)
    const variables = template.variables || []
    variables.forEach(variable => {
      // Replace common variables with placeholders
      content = content.replace(
        new RegExp(`{{${variable}}}`, 'g'),
        `[${variable.toUpperCase()}]`
      )
    })

    setValue('content', content)
    if (template.subject) {
      setValue('subject', template.subject)
    }
    if (template.default_channel) {
      setValue('channel', template.default_channel)
    }
    setValue('template_id', template.id)

    setSelectedTemplate(template)
    setIsTemplateDialogOpen(false)

    // Focus textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }, [setValue])

  // Get channel icon and label
  const getChannelInfo = (channel: string) => {
    switch (channel) {
      case 'sms':
        return { icon: <Phone className="h-4 w-4" />, label: 'SMS', color: 'text-blue-600' }
      case 'email':
        return { icon: <Mail className="h-4 w-4" />, label: 'Email', color: 'text-green-600' }
      case 'whatsapp':
        return { icon: <MessageCircle className="h-4 w-4" />, label: 'WhatsApp', color: 'text-green-500' }
      case 'system':
        return { icon: <MessageSquare className="h-4 w-4" />, label: 'Sistema', color: 'text-gray-600' }
      default:
        return { icon: <MessageSquare className="h-4 w-4" />, label: 'Mensagem', color: 'text-gray-600' }
    }
  }

  const channelInfo = getChannelInfo(watchedChannel)

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {channelInfo.icon}
            <span>Nova Mensagem</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Template selector */}
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Template className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Selecionar Template</DialogTitle>
                  <DialogDescription>
                    Escolha um template para preencher a mensagem automaticamente
                  </DialogDescription>
                </DialogHeader>
                
                <div className="max-h-96 overflow-y-auto">
                  {templatesData?.data.templates?.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 mb-2"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.body}
                      </p>
                      {template.variables && template.variables.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Scheduling toggle */}
            <Button
              variant={showScheduling ? "default" : "outline"}
              size="sm"
              onClick={() => setShowScheduling(!showScheduling)}
            >
              <Clock className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Channel and priority selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="channel">Canal</Label>
              <Select
                value={watchedChannel}
                onValueChange={(value) => setValue('channel', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      SMS
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Sistema
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={watch('priority')}
                onValueChange={(value) => setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Urgente
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject (for email) */}
          {watchedChannel === 'email' && (
            <div>
              <Label htmlFor="subject">Assunto</Label>
              <Input
                {...register('subject')}
                placeholder="Digite o assunto do email..."
              />
            </div>
          )}

          {/* Scheduling (if enabled) */}
          {showScheduling && (
            <div>
              <Label htmlFor="scheduled_for">Agendar para</Label>
              <Input
                type="datetime-local"
                {...register('scheduled_for')}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}

          {/* Selected template indicator */}
          {selectedTemplate && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Template className="h-4 w-4" />
                  <span className="text-sm font-medium">Template: {selectedTemplate.name}</span>
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(null)
                    setValue('template_id', undefined)
                  }}
                >
                  Remover
                </Button>
              </div>
            </div>
          )}

          {/* Message content */}
          <div>
            <Label htmlFor="content">Mensagem</Label>
            <Textarea
              ref={textareaRef}
              {...register('content')}
              placeholder="Digite sua mensagem..."
              rows={6}
              className="resize-none"
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
            )}
            
            {/* Character count for SMS */}
            {watchedChannel === 'sms' && (
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  {smsCharCount}/160 caracteres
                  {smsSegments > 1 && ` (${smsSegments} mensagens)`}
                </span>
                {smsCharCount > 160 && (
                  <span className="text-yellow-600">
                    Mensagem será dividida em {smsSegments} partes
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled>
                <Paperclip className="h-4 w-4 mr-2" />
                Anexar
              </Button>
              <Button type="button" variant="outline" size="sm" disabled>
                <Image className="h-4 w-4 mr-2" />
                Imagem
              </Button>
              <Button type="button" variant="outline" size="sm" disabled>
                <Smile className="h-4 w-4 mr-2" />
                Emoji
              </Button>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !recipientId}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {showScheduling && watch('scheduled_for') ? 'Agendar' : 'Enviar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}