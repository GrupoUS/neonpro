'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Mail,
  Smartphone,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { StaffChat } from './staff-chat';
import { ConsentManager } from './consent-manager';
import { TemplateManager } from './template-manager';
import { 
  CommunicationConversation, 
  CommunicationTemplate, 
  CommunicationConsent,
  CommunicationNotification 
} from '@/types/communication';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface CommunicationDashboardProps {
  userId: string;
  clinicId: string;
  className?: string;
}

interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  messagesSentToday: number;
  messagesReceivedToday: number;
  emailsToday: number;
  smsToday: number;
  pushToday: number;
  consentRate: number;
  responseRate: number;
}

export function CommunicationDashboard({ 
  userId, 
  clinicId, 
  className 
}: CommunicationDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    activeConversations: 0,
    messagesSentToday: 0,
    messagesReceivedToday: 0,
    emailsToday: 0,
    smsToday: 0,
    pushToday: 0,
    consentRate: 0,
    responseRate: 0
  });
  
  const [conversations, setConversations] = useState<CommunicationConversation[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [consents, setConsents] = useState<CommunicationConsent[]>([]);
  const [notifications, setNotifications] = useState<CommunicationNotification[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const supabase = createClient();

  // Carregar dados do dashboard
  useEffect(() => {
    loadDashboardData();
    
    // Configurar updates em tempo real
    const conversationChannel = supabase
      .channel('dashboard-conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'communication_conversations' },
        () => loadConversations()
      )
      .subscribe();

    const messageChannel = supabase
      .channel('dashboard-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'communication_messages' },
        () => loadStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [clinicId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadConversations(),
        loadTemplates(),
        loadConsents(),
        loadNotifications()
      ]);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dashboard',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Carregar estatísticas paralelo
      const [
        conversationsData,
        messagesData,
        notificationsData,
        consentsData
      ] = await Promise.all([
        supabase
          .from('communication_conversations')
          .select('id, status')
          .eq('clinic_id', clinicId),
        
        supabase
          .from('communication_messages')
          .select('id, sender_id, created_at')
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`),
        
        supabase
          .from('communication_notifications')
          .select('id, type, sent_at')
          .eq('clinic_id', clinicId)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`),
        
        supabase
          .from('communication_consents')
          .select('id, consent_type, consented')
      ]);

      if (conversationsData.error || messagesData.error || notificationsData.error || consentsData.error) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const conversations = conversationsData.data || [];
      const messages = messagesData.data || [];
      const notifications = notificationsData.data || [];
      const consents = consentsData.data || [];

      const messagesSent = messages.filter(m => m.sender_id === userId).length;
      const messagesReceived = messages.length - messagesSent;
      
      const emailsToday = notifications.filter(n => n.type === 'email' && n.sent_at).length;
      const smsToday = notifications.filter(n => n.type === 'sms' && n.sent_at).length;
      const pushToday = notifications.filter(n => n.type === 'push' && n.sent_at).length;

      const totalConsents = consents.length;
      const consentedCount = consents.filter(c => c.consented).length;
      const consentRate = totalConsents > 0 ? (consentedCount / totalConsents) * 100 : 0;

      setStats({
        totalConversations: conversations.length,
        activeConversations: conversations.filter(c => c.status === 'active').length,
        messagesSentToday: messagesSent,
        messagesReceivedToday: messagesReceived,
        emailsToday,
        smsToday,
        pushToday,
        consentRate: Math.round(consentRate),
        responseRate: 85 // TODO: Calcular taxa de resposta real
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_conversations')
        .select(`
          *,
          patient:patients(id, name, email),
          last_message:communication_messages(content, created_at, sender_id)
        `)
        .eq('clinic_id', clinicId)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_templates')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadConsents = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_consents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsents(data || []);
    } catch (error) {
      console.error('Erro ao carregar consentimentos:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('communication_notifications')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Renderizar cards de estatísticas
  const StatCard = ({ 
    title, 
    value, 
    icon, 
    change, 
    changeType = 'neutral' 
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {change && (
                <Badge 
                  variant={changeType === 'positive' ? 'default' : 
                          changeType === 'negative' ? 'destructive' : 'secondary'}
                >
                  {change}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Comunicação</h1>
        <p className="text-muted-foreground">
          Gerencie todas as comunicações da clínica em um só lugar
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Conversas Ativas"
          value={stats.activeConversations}
          icon={<MessageSquare className="w-5 h-5" />}
          change="+12%"
          changeType="positive"
        />
        <StatCard
          title="Mensagens Hoje"
          value={stats.messagesSentToday + stats.messagesReceivedToday}
          icon={<Send className="w-5 h-5" />}
          change="+8%"
          changeType="positive"
        />
        <StatCard
          title="Taxa de Consentimento"
          value={`${stats.consentRate}%`}
          icon={<CheckCircle className="w-5 h-5" />}
          change="+3%"
          changeType="positive"
        />
        <StatCard
          title="Taxa de Resposta"
          value={`${stats.responseRate}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          change="+5%"
          changeType="positive"
        />
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="conversations">Conversas</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="consents">Consentimentos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Resumo de atividades */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Emails Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.emailsToday}</div>
                <Progress value={65} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  65% da meta diária
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  SMS Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.smsToday}</div>
                <Progress value={80} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  80% da meta diária
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Push Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pushToday}</div>
                <Progress value={45} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  45% da meta diária
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conversas recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Conversas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.slice(0, 5).map((conversation) => (
                  <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {conversation.patient?.name || 'Paciente não identificado'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {conversation.last_message?.content?.substring(0, 50) || 'Sem mensagens'}...
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={conversation.status === 'active' ? 'default' : 'secondary'}>
                        {conversation.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conversation.updated_at}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Lista de conversas */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Conversas Ativas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {conversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant={selectedConversation === conversation.id ? 'default' : 'ghost'}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="text-left">
                      <p className="font-medium">
                        {conversation.patient?.name || 'Paciente não identificado'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.last_message?.content || 'Sem mensagens'}
                      </p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Chat */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <StaffChat
                  conversationId={selectedConversation}
                  userId={userId}
                  patientContext={
                    conversations.find(c => c.id === selectedConversation)?.patient
                  }
                />
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                    <p>Selecione uma conversa para começar</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager
            templates={templates}
            onTemplateUpdate={(template) => {
              setTemplates(prev => {
                const index = prev.findIndex(t => t.id === template.id);
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = template;
                  return updated;
                } else {
                  return [...prev, template];
                }
              });
            }}
            onTemplateDelete={(templateId) => {
              setTemplates(prev => prev.filter(t => t.id !== templateId));
            }}
          />
        </TabsContent>

        <TabsContent value="consents">
          <ConsentManager
            patientId={userId} // TODO: Implementar seleção de paciente
            consents={consents}
            onConsentUpdate={(consent) => {
              setConsents(prev => {
                const index = prev.findIndex(c => c.id === consent.id);
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = consent;
                  return updated;
                } else {
                  return [...prev, consent];
                }
              });
            }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics de Comunicação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                  <p>Relatórios detalhados em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}