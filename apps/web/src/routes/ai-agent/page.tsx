/**
 * AI Agent Page
 * Main page for the AI assistant interface
 */

'use client';

import { AIChat } from '@/components/ai-agent/ai-chat';
import { AIChatWS } from '@/components/ai-agent/ai-chat-ws';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { createFileRoute } from '@tanstack/react-router';
import { Brain, Calendar, MessageSquare, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import React, { useState } from 'react';

export const Route = createFileRoute('/ai-agent/page')({
  component: AIAgentPage,
});

function AIAgentPage() {
  const { user } = useAuth();
  const [useWebSocket, setUseWebSocket] = useState(false);

  const features = [
    {
      icon: Users,
      title: 'Busca Inteligente',
      description: 'Encontre pacientes rapidamente com busca por nome e filtros avançados',
    },
    {
      icon: Calendar,
      title: 'Gestão de Agenda',
      description: 'Consulte agendamentos, horários disponíveis e gere novos compromissos',
    },
    {
      icon: TrendingUp,
      title: 'Insights Financeiros',
      description: 'Acompanhe faturamento, pagamentos e métricas da clínica',
    },
    {
      icon: Shield,
      title: 'LGPD Compliance',
      description: 'Segurança e conformidade com a Lei Geral de Proteção de Dados',
    },
  ];

  const examples = [
    'Quais meus agendamentos para hoje?',
    'Buscar paciente Maria Santos',
    'Resumo financeiro desta semana',
    'Agendar retorno para paciente X',
    'Horários disponíveis amanhã',
  ];

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-background'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Brain className='h-5 w-5' />
              Assistente NeonPro
            </CardTitle>
            <CardDescription>
              Faça login para acessar o assistente de IA
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10'>
                <Brain className='h-5 w-5 text-primary' />
              </div>
              <div>
                <h1 className='text-2xl font-semibold'>Assistente NeonPro</h1>
                <p className='text-sm text-muted-foreground'>
                  Seu assistente de IA para gestão de clínica
                </p>
              </div>
            </div>
            <Badge variant='secondary' className='gap-1'>
              <Zap className='h-3 w-3' />
              Beta
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Sidebar */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Recursos</CardTitle>
                <CardDescription>
                  O que o assistente pode fazer por você
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {features.map((feature, _index) => (
                  <div key={index} className='flex items-start gap-3'>
                    <div className='flex items-center justify-center w-8 h-8 rounded-md bg-muted'>
                      <feature.icon className='h-4 w-4' />
                    </div>
                    <div className='space-y-1'>
                      <h4 className='text-sm font-medium'>{feature.title}</h4>
                      <p className='text-xs text-muted-foreground'>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Examples Card */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Exemplos</CardTitle>
                <CardDescription>Tente perguntar:</CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                {examples.map((example, _index) => (
                  <Button
                    key={index}
                    variant='ghost'
                    className='w-full justify-start text-left h-auto p-3'
                    onClick={() => {
                      // Copy to clipboard
                      navigator.clipboard.writeText(example);
                    }}
                  >
                    <MessageSquare className='h-4 w-4 mr-2 flex-shrink-0' />
                    <span className='text-sm'>{example}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className='border-amber-200 bg-amber-50'>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2 text-amber-800'>
                  <Shield className='h-4 w-4' />
                  Segurança & Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-amber-700'>
                  Todas as interações são criptografadas e seguem as diretrizes da LGPD. Dados
                  sensíveis são tratados com o máximo cuidado.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className='lg:col-span-3'>
            <Card className='h-[calc(100vh-12rem)]'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      <MessageSquare className='h-5 w-5' />
                      Conversa
                    </CardTitle>
                    <CardDescription>
                      Converse com o assistente usando linguagem natural
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      Conexão:
                    </span>
                    <div className='flex bg-muted p-1 rounded-md'>
                      <button
                        onClick={() => setUseWebSocket(false)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          !useWebSocket
                            ? 'bg-background shadow-sm'
                            : 'hover:bg-background/50'
                        }`}
                      >
                        REST
                      </button>
                      <button
                        onClick={() => setUseWebSocket(true)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          useWebSocket
                            ? 'bg-background shadow-sm'
                            : 'hover:bg-background/50'
                        }`}
                      >
                        WebSocket
                      </button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-0 h-[calc(100%-8rem)]'>
                {useWebSocket
                  ? (
                    <AIChatWS
                      initialContext={{
                        domain: user.clinicId,
                      }}
                      className='h-full rounded-none border-0'
                    />
                  )
                  : (
                    <AIChat
                      initialContext={{
                        domain: user.clinicId,
                      }}
                      className='h-full rounded-none border-0'
                    />
                  )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
