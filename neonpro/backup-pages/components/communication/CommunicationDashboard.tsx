'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MessageCircle,
  Template,
  Inbox,
  Send,
  Users,
  BarChart3,
  Settings
} from 'lucide-react'
import { CommunicationInbox } from './CommunicationInbox'
import { MessageComposer } from './MessageComposer'
import { TemplateManager } from './TemplateManager'
import { useMessageStatistics } from '@/app/hooks/use-communication'
import type { MessageTemplate } from '@/app/lib/types/communication'

interface CommunicationDashboardProps {
  patientId?: string
  defaultTab?: string
  className?: string
}

export function CommunicationDashboard({ 
  patientId, 
  defaultTab = 'inbox',
  className 
}: CommunicationDashboardProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [activeTab, setActiveTab] = useState(defaultTab)

  // Get statistics for dashboard overview
  const statisticsQuery = useMessageStatistics({
    patient_id: patientId,
    period: '30d'
  })

  const stats = statisticsQuery.data?.data || {
    total_messages: 0,
    sent_messages: 0,
    received_messages: 0,
    unread_messages: 0,
    active_threads: 0,
    response_rate: 0,
    avg_response_time: 0
  }

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setActiveTab('compose')
  }

  const handleMessageSent = () => {
    setSelectedTemplate(null)
    setActiveTab('inbox')
  }

  return (
    <div className={className}>
      {/* Dashboard Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensagens</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_messages}</div>
            <p className="text-xs text-muted-foreground">
              {stats.sent_messages} enviadas, {stats.received_messages} recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread_messages}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_threads}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.response_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Média: {Math.round(stats.avg_response_time / 60)}min
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Communication Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Centro de Comunicação
            {patientId && (
              <Badge variant="outline">Paciente Específico</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Caixa de Entrada
                {stats.unread_messages > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                    {stats.unread_messages}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="compose" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Compor
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Template className="h-4 w-4" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="mt-6">
              <CommunicationInbox 
                patientId={patientId}
                onReplyMessage={(threadId, message) => {
                  // Switch to compose tab with context
                  setActiveTab('compose')
                }}
              />
            </TabsContent>

            <TabsContent value="compose" className="mt-6">
              <MessageComposer
                patientId={patientId}
                selectedTemplate={selectedTemplate}
                onTemplateClear={() => setSelectedTemplate(null)}
                onMessageSent={handleMessageSent}
                onSelectTemplate={() => setActiveTab('templates')}
              />
            </TabsContent>

            <TabsContent value="templates" className="mt-6">
              <TemplateManager
                onTemplateSelect={handleTemplateSelect}
                selectionMode={activeTab === 'templates' && selectedTemplate === null}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Comunicação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Configurações de comunicação serão implementadas em breve.
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Canais Ativos</h4>
                          <div className="space-y-1">
                            <Badge variant="outline">SMS</Badge>
                            <Badge variant="outline">Email</Badge>
                            <Badge variant="outline">WhatsApp</Badge>
                            <Badge variant="outline">Sistema</Badge>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Notificações</h4>
                          <div className="space-y-1">
                            <div className="text-xs">✓ Mensagens não lidas</div>
                            <div className="text-xs">✓ Novas conversas</div>
                            <div className="text-xs">✓ Respostas automáticas</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Automação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">Recursos de automação disponíveis:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Respostas automáticas fora do horário</li>
                        <li>Lembretes de consulta automáticos</li>
                        <li>Follow-up pós-procedimento</li>
                        <li>Campanhas de marketing segmentadas</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
