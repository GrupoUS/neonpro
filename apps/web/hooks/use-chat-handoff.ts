"use client";

import { useCallback, useRef, useState } from "react";

export interface HandoffConfig {
  confidenceThreshold: number;
  maxRetries: number;
  handoffDelay: number;
  autoHandoffKeywords: string[];
  escalationReasons: string[];
}

export interface HandoffState {
  isHandoffRequested: boolean;
  isHandoffActive: boolean;
  handoffReason: string;
  handoffTimestamp: Date | null;
  retryCount: number;
}

export interface ChatMessage {
  content: string;
  confidence: number;
  requiresHumanHandoff?: boolean;
}

const DEFAULT_CONFIG: HandoffConfig = {
  confidenceThreshold: 85,
  maxRetries: 3,
  handoffDelay: 2000,
  autoHandoffKeywords: [
    "falar com atendente",
    "atendimento humano",
    "não entendi",
    "problema urgente",
    "emergência",
    "reclamação",
    "cancelar",
    "resolver problema",
  ],
  escalationReasons: [
    "Baixa confiança na resposta",
    "Solicitação específica do usuário",
    "Múltiplas tentativas sem resolução",
    "Palavra-chave de escalação detectada",
    "Problema complexo identificado",
  ],
};

export function useChatHandoff(config: Partial<HandoffConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [handoffState, setHandoffState] = useState<HandoffState>({
    isHandoffRequested: false,
    isHandoffActive: false,
    handoffReason: "",
    handoffTimestamp: null,
    retryCount: 0,
  });

  const handoffTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Verificar se mensagem requer handoff
  const shouldTriggerHandoff = useCallback((message: string, confidence: number): {
    shouldHandoff: boolean;
    reason: string;
  } => {
    const lowerMessage = message.toLowerCase();

    // Verificar palavras-chave
    const keywordMatch = finalConfig.autoHandoffKeywords.some(keyword =>
      lowerMessage.includes(keyword.toLowerCase())
    );

    if (keywordMatch) {
      return {
        shouldHandoff: true,
        reason: "Palavra-chave de escalação detectada",
      };
    }

    // Verificar confiança
    if (confidence < finalConfig.confidenceThreshold) {
      return {
        shouldHandoff: true,
        reason: "Baixa confiança na resposta",
      };
    }

    return {
      shouldHandoff: false,
      reason: "",
    };
  }, [finalConfig.autoHandoffKeywords, finalConfig.confidenceThreshold]);

  // Solicitar handoff
  const requestHandoff = useCallback((reason: string = "Solicitação manual") => {
    if (handoffTimeoutRef.current) {
      clearTimeout(handoffTimeoutRef.current);
    }

    setHandoffState(prev => ({
      ...prev,
      isHandoffRequested: true,
      handoffReason: reason,
      handoffTimestamp: new Date(),
    }));

    // Delay para ativar handoff
    handoffTimeoutRef.current = setTimeout(() => {
      setHandoffState(prev => ({
        ...prev,
        isHandoffActive: true,
      }));
    }, finalConfig.handoffDelay);

    return true;
  }, [finalConfig.handoffDelay]);

  // Cancelar handoff
  const cancelHandoff = useCallback(() => {
    if (handoffTimeoutRef.current) {
      clearTimeout(handoffTimeoutRef.current);
    }

    setHandoffState({
      isHandoffRequested: false,
      isHandoffActive: false,
      handoffReason: "",
      handoffTimestamp: null,
      retryCount: 0,
    });

    return true;
  }, []);

  // Incrementar tentativas
  const incrementRetries = useCallback(() => {
    let shouldRequestHandoff = false;

    setHandoffState(prev => {
      const newRetryCount = prev.retryCount + 1;

      // Check if should trigger auto handoff
      if (newRetryCount >= finalConfig.maxRetries) {
        shouldRequestHandoff = true;
      }

      return {
        ...prev,
        retryCount: newRetryCount,
      };
    });

    // Auto handoff se exceder máximo de tentativas
    if (shouldRequestHandoff) {
      requestHandoff("Múltiplas tentativas sem resolução");
    }
  }, [finalConfig.maxRetries, requestHandoff]);

  // Processar resposta da AI
  const processAIResponse = useCallback((
    userMessage: string,
    aiResponse: ChatMessage,
  ): {
    shouldHandoff: boolean;
    reason: string;
    response: ChatMessage;
  } => {
    // Verificar se mensagem do usuário requer handoff
    const userCheck = shouldTriggerHandoff(userMessage, 100);
    if (userCheck.shouldHandoff) {
      requestHandoff(userCheck.reason);
      return {
        shouldHandoff: true,
        reason: userCheck.reason,
        response: {
          ...aiResponse,
          requiresHumanHandoff: true,
        },
      };
    }

    // Verificar confiança da resposta da AI
    const aiCheck = shouldTriggerHandoff(aiResponse.content, aiResponse.confidence);
    if (aiCheck.shouldHandoff) {
      requestHandoff(aiCheck.reason);
      return {
        shouldHandoff: true,
        reason: aiCheck.reason,
        response: {
          ...aiResponse,
          requiresHumanHandoff: true,
        },
      };
    }

    // Resetar contador se resposta bem-sucedida
    setHandoffState(prev => ({
      ...prev,
      retryCount: 0,
    }));

    return {
      shouldHandoff: false,
      reason: "",
      response: aiResponse,
    };
  }, [shouldTriggerHandoff, requestHandoff]);

  // Obter mensagem de handoff
  const getHandoffMessage = useCallback((reason: string): string => {
    const messages = {
      "Baixa confiança na resposta":
        "Parece que não consegui entender completamente sua solicitação. Vou transferir você para um atendente humano que poderá ajudá-lo melhor.",
      "Solicitação específica do usuário":
        "Entendido! Vou conectá-lo com um de nossos atendentes humanos.",
      "Múltiplas tentativas sem resolução":
        "Percebo que estamos tendo dificuldades para resolver sua questão. Vou transferi-lo para um atendente humano especializado.",
      "Palavra-chave de escalação detectada":
        "Vou conectá-lo imediatamente com um atendente humano.",
      "Problema complexo identificado":
        "Esta situação requer atenção especializada. Transferindo para atendimento humano.",
      "Solicitação manual": "Transferindo para atendimento humano conforme solicitado.",
    };

    return messages[reason as keyof typeof messages]
      || "Transferindo para atendimento humano. Um agente entrará em contato em breve.";
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    if (handoffTimeoutRef.current) {
      clearTimeout(handoffTimeoutRef.current);
    }
  }, []);

  return {
    handoffState,
    config: finalConfig,
    requestHandoff,
    cancelHandoff,
    processAIResponse,
    getHandoffMessage,
    incrementRetries,
    shouldTriggerHandoff,
    cleanup,
  };
}
