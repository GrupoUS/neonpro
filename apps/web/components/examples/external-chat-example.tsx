"use client";

import { useState, useCallback } from "react";
import { ExternalChatWidget } from "@/components/ui/external-chat-widget";
import { useChatHandoff } from "@/hooks/use-chat-handoff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ExternalChatExample() {
  const [apiCalls, setApiCalls] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  const {
    handoffState,
    processAIResponse,
    getHandoffMessage,
    requestHandoff,
    cancelHandoff
  } = useChatHandoff({
    confidenceThreshold: 85,
    maxRetries: 3,
    handoffDelay: 2000
  });

  // Simular chamada para API da OpenAI/Claude
  const simulateAIResponse = useCallback(async (message: string): Promise<{
    response: string;
    confidence: number;
    requiresHumanHandoff?: boolean;
  }> => {
    const startTime = Date.now();
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    setApiCalls(prev => prev + 1);
    setResponseTime(responseTime);

    // Simular diferentes cenários baseado na mensagem
    const lowerMessage = message.toLowerCase();
    
    // Cenários de baixa confiança
    if (lowerMessage.includes('problema técnico complexo') || 
        lowerMessage.includes('erro específico') ||
        lowerMessage.includes('configuração avançada')) {
      const confidence = Math.random() * 30 + 40; // 40-70%
      setAccuracy(confidence);
      
      return {
        response: "Entendo que você está enfrentando um problema técnico. Vou tentar ajudá-lo, mas se precisar de assistência mais específica, posso conectá-lo com um especialista.",
        confidence: Math.round(confidence)
      };
    }

    // Cenários de média confiança
    if (lowerMessage.includes('como fazer') || 
        lowerMessage.includes('tutorial') ||
        lowerMessage.includes('exemplo')) {
      const confidence = Math.random() * 25 + 60; // 60-85%
      setAccuracy(confidence);
      
      return {
        response: `Aqui está um guia passo a passo para "${message}": \n\n1. Primeiro, acesse o painel principal\n2. Navegue até a seção apropriada\n3. Configure as opções necessárias\n4. Salve as alterações\n\nPrecisa de mais detalhes em algum passo específico?`,
        confidence: Math.round(confidence)
      };
    }

    // Cenários de alta confiança
    const confidence = Math.random() * 15 + 85; // 85-100%
    setAccuracy(confidence);
    
    const responses = [
      "Posso ajudá-lo com isso! Esta é uma questão comum e tenho informações precisas sobre o assunto.",
      "Claro! Esta é uma funcionalidade que conheço bem. Deixe-me explicar detalhadamente.",
      "Perfeito! Tenho todas as informações necessárias para responder sua pergunta.",
      `Sobre "${message}": Esta é uma excelente pergunta! Aqui está uma resposta completa e precisa.`
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      confidence: Math.round(confidence)
    };
  }, []);

  // Timeout wrapper for AI response
  const withTimeout = useCallback(<T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('AI response timeout after ' + timeoutMs + 'ms'));
        }, timeoutMs);
      })
    ]);
  }, []);

  // Handler principal para mensagens
  const handleMessage = useCallback(async (message: string) => {
    try {
      // Apply 8-second timeout to AI response
      const aiResponse = await withTimeout(simulateAIResponse(message), 8000);
      const processedResponse = processAIResponse(message, aiResponse);
      
      if (processedResponse.shouldHandoff) {
        const handoffMsg = getHandoffMessage(processedResponse.reason);
        return {
          response: `${processedResponse.response.response}\n\n${handoffMsg}`,
          confidence: processedResponse.response.confidence,
          requiresHumanHandoff: true
        };
      }
      
      return processedResponse.response;
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      // Check if it's a timeout error
      if (error instanceof Error && error.message.includes('timeout')) {
        console.error('AI response timed out, initiating human handoff');
        return {
          response: "Desculpe, a resposta está demorando mais que o esperado. Vou conectá-lo com um atendente humano para ajudá-lo melhor.",
          confidence: 0,
          requiresHumanHandoff: true
        };
      }
      
      return {
        response: "Desculpe, ocorreu um erro interno. Vou conectá-lo com um atendente humano.",
        confidence: 0,
        requiresHumanHandoff: true
      };
    }
  }, [withTimeout, simulateAIResponse, processAIResponse, getHandoffMessage]);

  // Handler para solicitação de atendimento humano
  const handleHumanHandoff = useCallback(() => {
    console.log('Handoff solicitado:', {
      timestamp: new Date(),
      reason: handoffState.handoffReason || 'Solicitação manual',
      state: handoffState
    });
    
    // Aqui você integraria com seu sistema de atendimento (WhatsApp, Zendesk, etc.)
    alert(`Atendimento humano solicitado!\nMotivo: ${handoffState.handoffReason || 'Solicitação manual'}`);
  }, [handoffState]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Título */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            External AI Chat Widget
          </h1>
          <p className="text-gray-600">
            Widget de chat com IA, reconhecimento de voz e handoff inteligente
          </p>
        </div>

        {/* Estatísticas em tempo real */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{apiCalls}</div>
              <div className="text-sm text-gray-600">Chamadas API</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{responseTime}ms</div>
              <div className="text-sm text-gray-600">Tempo Resposta</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{accuracy.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Confiança</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Badge 
                variant={handoffState.isHandoffActive ? "destructive" : "default"}
                className="text-sm"
              >
                {handoffState.isHandoffActive ? "Handoff Ativo" : "IA Ativa"}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Status</div>
            </CardContent>
          </Card>
        </div>

        {/* Instruções de teste */}
        <Card>
          <CardHeader>
            <CardTitle>Como Testar o Widget</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✅ Teste Alta Confiança (85-100%)</h4>
              <p className="text-sm text-gray-600 mb-2">Digite mensagens simples como:</p>
              <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                "Olá", "Como você funciona?", "Preciso de ajuda"
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-600 mb-2">⚠️ Teste Média Confiança (60-85%)</h4>
              <p className="text-sm text-gray-600 mb-2">Digite mensagens como:</p>
              <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                "Como fazer backup", "Preciso de um tutorial", "Exemplo de configuração"
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-600 mb-2">🚨 Teste Handoff Automático (&lt;85%)</h4>
              <p className="text-sm text-gray-600 mb-2">Digite mensagens como:</p>
              <div className="bg-gray-100 p-2 rounded text-sm font-mono">
                "Problema técnico complexo", "Erro específico", "Falar com atendente"
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-blue-600 mb-2">🎤 Teste Reconhecimento de Voz</h4>
              <p className="text-sm text-gray-600">
                Use o botão de microfone no widget para testar o reconhecimento de voz em português.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Controles de teste */}
        <Card>
          <CardHeader>
            <CardTitle>Controles de Teste</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button 
              onClick={() => requestHandoff('Teste manual')}
              variant="outline"
            >
              Forçar Handoff
            </Button>
            
            <Button 
              onClick={cancelHandoff}
              variant="outline"
            >
              Cancelar Handoff
            </Button>
            
            <Button 
              onClick={() => {
                setApiCalls(0);
                setResponseTime(0);
                setAccuracy(0);
              }}
              variant="outline"
            >
              Reset Estatísticas
            </Button>
          </CardContent>
        </Card>

        {/* Estado do Handoff */}
        {handoffState.isHandoffRequested && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Estado do Handoff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Status:</strong> {handoffState.isHandoffActive ? 'Ativo' : 'Solicitado'}</p>
                <p><strong>Motivo:</strong> {handoffState.handoffReason}</p>
                <p><strong>Tentativas:</strong> {handoffState.retryCount}</p>
                {handoffState.handoffTimestamp && (
                  <p><strong>Timestamp:</strong> {handoffState.handoffTimestamp.toLocaleTimeString('pt-BR')}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Widget de Chat */}
      <ExternalChatWidget
        position="bottom-right"
        onMessage={handleMessage}
        onHumanHandoffRequest={handleHumanHandoff}
        title="Assistente NeonPro"
        subtitle="IA com handoff inteligente"
        enableVoice
        enableHandoff
        isHighContrast={false}
        maxMessages={50}
      />
    </div>
  );
}