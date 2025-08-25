import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState<boolean>(false);

	React.useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
		const onChange = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};
		mql.addEventListener("change", onChange);
		setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		return () => mql.removeEventListener("change", onChange);
	}, []);

	return isMobile;
}

// =============================================================================
// 🤖 useAgentChat - Healthcare AI Agent Chat Hook
// =============================================================================
// Hook principal para gerenciar o sistema de chat AI com agente especializado
// Integra Archon MCP, Speech Recognition e dados específicos do cliente
// =============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useChat } from 'ai/react';
import type {
  AgentChatState,
  ClientContext,
  VoiceInputState,
  AgentMessage,
  AgentCapabilities,
  HealthcarePromptContext,
  ArchonQueryResult,
  SpeechRecognitionEvent
} from '../types/common';

export function useAgentChat() {
  // =============================================================================
  // ESTADO PRINCIPAL DO CHAT
  // =============================================================================
  
  const [chatState, setChatState] = useState<AgentChatState>({
    isOpen: false,
    isLoading: false,
    isInitializing: true,
    messages: [],
    clientContext: null,
    voiceInput: {
      isListening: false,
      isProcessing: false,
      transcript: '',
      confidence: 0,
      language: 'pt-BR',
      autoStop: true
    },
    capabilities: {
      dataAnalysis: true,
      voiceInput: true,
      archonIntegration: true,
      mlPipelineAccess: true,
      complianceMonitoring: true,
      reportGeneration: true,
      patientDataAccess: true,
      appointmentManagement: true,
      financialInsights: true,
      predictiveAnalytics: true
    },
    lastActivity: new Date()
  });

  // Refs para Speech Recognition
  const recognition = useRef<SpeechRecognition | null>(null);
  const isRecognitionSupported = useRef(false);

  // =============================================================================
  // INTEGRATION WITH VERCEL AI SDK
  // =============================================================================
  
  const {
    messages: aiMessages,
    input,
    handleInputChange,
    handleSubmit: submitToAI,
    isLoading: aiIsLoading,
    error: aiError,
    setMessages
  } = useChat({
    api: '/api/ai/agent',
    initialMessages: [],
    onResponse: (response) => {
      updateLastActivity();
    },
    onError: (error) => {
      console.error('AI Chat Error:', error);
      setChatState(prev => ({
        ...prev,
        error: error.message
      }));
    }
  });

  // =============================================================================
  // CLIENT CONTEXT MANAGEMENT
  // =============================================================================

  const updateClientContext = useCallback(async () => {
    try {
      setChatState(prev => ({ ...prev, isLoading: true }));
      
      // Buscar contexto do cliente via API
      const response = await fetch('/api/ai/client-context', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const context: ClientContext = await response.json();
        setChatState(prev => ({
          ...prev,
          clientContext: context,
          isLoading: false,
          isInitializing: false
        }));
      }
    } catch (error) {
      console.error('Error updating client context:', error);
      setChatState(prev => ({
        ...prev,
        error: 'Failed to load client context',
        isLoading: false,
        isInitializing: false
      }));
    }
  }, []);

  // =============================================================================
  // SPEECH RECOGNITION SETUP
  // =============================================================================

  useEffect(() => {
    // Verificar suporte para Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        isRecognitionSupported.current = true;
        recognition.current = new SpeechRecognition();
        
        // Configurar reconhecimento
        recognition.current.continuous = false;
        recognition.current.interimResults = true;
        recognition.current.maxAlternatives = 1;
        recognition.current.lang = chatState.voiceInput.language;

        // Event handlers
        recognition.current.onstart = () => {
          setChatState(prev => ({
            ...prev,
            voiceInput: { ...prev.voiceInput, isListening: true, error: undefined }
          }));
        };

        recognition.current.onresult = (event: SpeechRecognitionEvent) => {
          const results = event.results;
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < results.length; i++) {
            const result = results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          const transcript = finalTranscript || interimTranscript;
          const confidence = results[results.length - 1]?.[0]?.confidence || 0;

          setChatState(prev => ({
            ...prev,
            voiceInput: {
              ...prev.voiceInput,
              transcript,
              confidence,
              isProcessing: !!finalTranscript
            }
          }));

          // Se temos transcrição final, enviar para o chat
          if (finalTranscript.trim()) {
            handleVoiceMessage(finalTranscript.trim());
          }
        };

        recognition.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setChatState(prev => ({
            ...prev,
            voiceInput: {
              ...prev.voiceInput,
              isListening: false,
              isProcessing: false,
              error: event.error
            }
          }));
        };

        recognition.current.onend = () => {
          setChatState(prev => ({
            ...prev,
            voiceInput: {
              ...prev.voiceInput,
              isListening: false,
              isProcessing: false
            }
          }));
        };
      }
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [chatState.voiceInput.language]);

  // =============================================================================
  // CHAT CONTROLS
  // =============================================================================

  const toggleChat = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      isOpen: !prev.isOpen,
      lastActivity: new Date()
    }));
  }, []);

  const closeChat = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setChatState(prev => ({
      ...prev,
      messages: [],
      error: undefined
    }));
  }, [setMessages]);

  const updateLastActivity = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      lastActivity: new Date()
    }));
  }, []);

  // =============================================================================
  // VOICE CONTROLS
  // =============================================================================

  const startVoiceInput = useCallback(() => {
    if (!isRecognitionSupported.current || !recognition.current) {
      setChatState(prev => ({
        ...prev,
        voiceInput: {
          ...prev.voiceInput,
          error: 'Speech recognition not supported'
        }
      }));
      return;
    }

    try {
      recognition.current.start();
    } catch (error) {
      console.error('Error starting voice input:', error);
      setChatState(prev => ({
        ...prev,
        voiceInput: {
          ...prev.voiceInput,
          error: 'Failed to start voice input'
        }
      }));
    }
  }, []);

  const stopVoiceInput = useCallback(() => {
    if (recognition.current) {
      recognition.current.stop();
    }
  }, []);

  const handleVoiceMessage = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript,
      timestamp: new Date(),
      metadata: {
        audioTranscription: true,
        confidence: chatState.voiceInput.confidence
      }
    };

    // Enviar para o AI chat
    handleInputChange({ target: { value: transcript } } as any);
    submitToAI();
    updateLastActivity();
  }, [chatState.voiceInput.confidence, handleInputChange, submitToAI, updateLastActivity]);

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  useEffect(() => {
    // Carregar contexto inicial
    updateClientContext();
  }, [updateClientContext]);

  // =============================================================================
  // RETURN INTERFACE
  // =============================================================================

  return {
    // Estado
    ...chatState,
    isLoading: aiIsLoading || chatState.isLoading,
    error: aiError?.message || chatState.error,
    
    // Messages (mescla AI SDK com estado local)
    messages: aiMessages,
    
    // Chat Controls
    toggleChat,
    closeChat,
    clearChat,
    
    // Input handling
    input,
    handleInputChange,
    handleSubmit: submitToAI,
    
    // Voice Controls
    startVoiceInput,
    stopVoiceInput,
    isVoiceSupported: isRecognitionSupported.current,
    
    // Context Management
    updateClientContext,
    
    // Utilities
    updateLastActivity
  };
}
