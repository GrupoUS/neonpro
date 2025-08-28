/**
 * Universal AI Chat Test Page
 * Demonstrates both External and Internal chat interfaces
 */

"use client";

import { ChatProvider } from "@neonpro/ai/chat";
import type { ChatInterface as ChatInterfaceType } from "@neonpro/types/ai-chat";
import { ChatInterface } from "@neonpro/ui";
import { Badge } from "@neonpro/ui/components/Badge";
import { Button } from "@neonpro/ui/components/Button";
import { Card } from "@neonpro/ui/components/Card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@neonpro/ui/components/Tabs";
import { Bot, Globe, Lock, UserCheck, Users, Zap } from "lucide-react";
import { useState } from "react";

export default function UniversalChatTestPage() {
  const [activeInterface, setActiveInterface] =
    useState<ChatInterfaceType>("external");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-bold text-3xl text-gray-900">
            Universal AI Chat System
          </h1>
          <p className="text-gray-600">
            Sistema de chat com IA dual: Interface Externa para Pacientes e
            Interface Interna para Equipe
          </p>
        </div>

        {/* Features Overview */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <Globe className="h-6 w-6 text-blue-500" />
              <h3 className="font-semibold">Interface Externa</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Atendimento 24/7 para pacientes com agendamentos e orientações
            </p>
          </Card>

          <Card className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <Lock className="h-6 w-6 text-green-500" />
              <h3 className="font-semibold">Interface Interna</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Assistente para equipe com dados operacionais e insights
            </p>
          </Card>

          <Card className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <Zap className="h-6 w-6 text-yellow-500" />
              <h3 className="font-semibold">Streaming em Tempo Real</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Respostas em tempo real com tecnologia Vercel AI SDK
            </p>
          </Card>

          <Card className="p-4">
            <div className="mb-2 flex items-center gap-3">
              <Bot className="h-6 w-6 text-purple-500" />
              <h3 className="font-semibold">IA Especializada</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Otimizada para saúde brasileira com compliance LGPD/ANVISA
            </p>
          </Card>
        </div>

        {/* Interface Switcher */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-xl">Interface Atual</h2>
            <div className="flex gap-2">
              <Button
                className="flex items-center gap-2"
                onClick={() => setActiveInterface("external")}
                variant={activeInterface === "external" ? "default" : "outline"}
              >
                <Users className="h-4 w-4" />
                Externa (Pacientes)
              </Button>
              <Button
                className="flex items-center gap-2"
                onClick={() => setActiveInterface("internal")}
                variant={activeInterface === "internal" ? "default" : "outline"}
              >
                <UserCheck className="h-4 w-4" />
                Interna (Equipe)
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              className="text-sm"
              variant={activeInterface === "external" ? "default" : "secondary"}
            >
              {activeInterface === "external" ? "Modo Paciente" : "Modo Equipe"}
            </Badge>
            <span className="text-gray-600 text-sm">
              {activeInterface === "external"
                ? "Agendamentos, informações gerais, triagem inicial"
                : "Dados operacionais, relatórios, insights internos"}
            </span>
          </div>
        </Card>

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Chat */}
          <div className="lg:col-span-2">
            <ChatProvider
              apiBaseUrl="/api/ai/universal-chat"
              initialInterface={activeInterface}
            >
              <ChatInterface
                className="h-[600px]"
                interface_type={activeInterface}
                maxHeight="600px"
                placeholder={
                  activeInterface === "external"
                    ? "Digite sua mensagem... (ex: 'Gostaria de agendar uma consulta')"
                    : "Faça uma pergunta... (ex: 'Como está o estoque hoje?')"
                }
              />
            </ChatProvider>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="mb-3 font-semibold">Exemplos de Perguntas</h3>

              <Tabs defaultValue={activeInterface}>
                <TabsList className="mb-4 grid w-full grid-cols-2">
                  <TabsTrigger value="external">Externa</TabsTrigger>
                  <TabsTrigger value="internal">Interna</TabsTrigger>
                </TabsList>

                <TabsContent className="space-y-2" value="external">
                  <div className="space-y-2 text-sm">
                    <div className="rounded bg-gray-100 p-2 text-gray-700">
                      &quot;Gostaria de agendar uma consulta com
                      cardiologista&quot;
                    </div>
                    <div className="rounded bg-gray-100 p-2 text-gray-700">
                      &quot;Quais são os horários de funcionamento?&quot;
                    </div>
                    <div className="rounded bg-gray-100 p-2 text-gray-700">
                      &quot;Estou com dor de cabeça há 2 dias&quot;
                    </div>
                    <div className="rounded bg-gray-100 p-2 text-gray-700">
                      &quot;Como cancelo minha consulta?&quot;
                    </div>
                  </div>
                </TabsContent>

                <TabsContent className="space-y-2" value="internal">
                  <div className="space-y-2 text-sm">
                    <div className="rounded bg-gray-100 p-2 text-gray-700">
                      &quot;Como está o estoque de materiais hoje?&quot;
                    </div>
                    <div className="rounded bg-gray-100 p-2 text-gray-700">
                      &quot;Quantos pacientes atendemos esta semana?&quot;
                    </div>
                    <div className="rounded bg-gray-100 p-2 text-gray-700">
                      &quot;Gere um relatório de performance&quot;
                    </div>
                    <div className="rounded bg-gray-100 p-2 text-gray-700">
                      &quot;Status dos equipamentos da clínica&quot;
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            <Card className="p-4">
              <h3 className="mb-3 font-semibold">Recursos Ativos</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Streaming em tempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Detecção de emergências</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Análise de sentimento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Compliance LGPD/ANVISA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Gravação de voz (em breve)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Upload de arquivos (em breve)</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="mb-3 font-semibold">Tecnologias</h3>
              <div className="space-y-1 text-gray-600 text-sm">
                <div>• Vercel AI SDK</div>
                <div>• OpenAI GPT-4o Mini</div>
                <div>• React Context + useReducer</div>
                <div>• Next.js Edge Runtime</div>
                <div>• Streaming responses</div>
                <div>• Portuguese NLP</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 rounded-lg border bg-white p-4 text-center text-gray-600 text-sm">
          <p>
            🚀 Sistema Universal de Chat com IA • NeonPro Healthcare Platform •
            Compliance LGPD/ANVISA/CFM • Português Brasileiro
          </p>
        </div>
      </div>
    </div>
  );
}
