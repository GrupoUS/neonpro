/**
 * Emergency Voice Commands Hook for Healthcare Scenarios
 * Web Speech API implementation for hands-free emergency communication
 * WCAG 2.1 AA+ compliance for accessibility in critical medical situations
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface EmergencyVoicePattern {
  commands: string[];
  intent: "emergency" | "call_doctor" | "symptoms" | "medication" | "pain" | "help";
  priority: "critical" | "high" | "medium";
  response: string;
  action?: () => void;
}

interface VoiceRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  confidence: number;
  transcript: string;
  finalTranscript: string;
}

interface UseSpeechSynthesisState {
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
}

interface UseEmergencyVoiceCommandsProps {
  onEmergencyDetected: (intent: string, transcript: string) => void;
  onCommandExecuted: (command: string, intent: string) => void;
  enableContinuousListening?: boolean;
  emergencyThreshold?: number; // Confidence threshold for emergency detection
  language?: string;
}

export function useEmergencyVoiceCommands({
  onEmergencyDetected,
  onCommandExecuted,
  enableContinuousListening = false,
  emergencyThreshold = 0.7,
  language = "pt-BR",
}: UseEmergencyVoiceCommandsProps) {
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const emergencyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Voice Recognition State
  const [recognition, setRecognition] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    error: null,
    confidence: 0,
    transcript: "",
    finalTranscript: "",
  });

  // Speech Synthesis State
  const [synthesis, setSynthesis] = useState<UseSpeechSynthesisState>({
    isSpeaking: false,
    isSupported: false,
    voices: [],
    selectedVoice: null,
  });

  // Emergency Voice Patterns for Brazilian Portuguese Healthcare
  const emergencyPatterns: EmergencyVoicePattern[] = [
    {
      commands: [
        "emergência", "emergency", "socorro", "help", "ajuda", "urgente", 
        "não consigo respirar", "can't breathe", "dor no peito", "chest pain",
        "desmaiei", "fainted", "tonteira", "dizzy", "sangramento", "bleeding"
      ],
      intent: "emergency",
      priority: "critical",
      response: "Situação de emergência detectada. Acionando protocolo de emergência. Mantenha-se calmo, ajuda está a caminho.",
    },
    {
      commands: [
        "chamar médico", "call doctor", "quero falar com médico", 
        "preciso de médico", "médico urgente", "doctor please"
      ],
      intent: "call_doctor",
      priority: "high",
      response: "Conectando você com um profissional médico. Por favor, aguarde.",
    },
    {
      commands: [
        "dor", "pain", "está doendo", "hurts", "sintomas", "symptoms",
        "não me sinto bem", "don't feel well", "mal estar", "nausea"
      ],
      intent: "symptoms",
      priority: "high",
      response: "Entendo que você está sentindo desconforto. Vou registrar seus sintomas e conectar você com nossa equipe médica.",
    },
    {
      commands: [
        "medicamento", "medication", "remédio", "medicine", "comprimido", "pill",
        "tomar medicação", "take medication", "dose", "dosagem"
      ],
      intent: "medication",
      priority: "medium",
      response: "Vou ajudá-lo com informações sobre medicação. Conectando com farmacêutico ou médico.",
    },
    {
      commands: [
        "dor severa", "severe pain", "dor insuportável", "unbearable pain",
        "dor 10", "pain level 10", "agonia", "agony"
      ],
      intent: "pain",
      priority: "critical",
      response: "Dor severa reportada. Acionando protocolo de emergência para controle da dor.",
    },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = enableContinuousListening;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = language;
        recognitionInstance.maxAlternatives = 3;

        // Configure for emergency scenarios - more sensitive
        recognitionInstance.grammars = undefined; // Allow all speech
        
        recognitionRef.current = recognitionInstance;
        setRecognition(prev => ({ ...prev, isSupported: true }));
      } else {
        setRecognition(prev => ({ 
          ...prev, 
          isSupported: false, 
          error: "Speech recognition not supported in this browser" 
        }));
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        setSynthesis(prev => ({ ...prev, isSupported: true }));
        
        // Load available voices
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          const portugueseVoices = voices.filter(voice => 
            voice.lang.startsWith('pt') || voice.lang.startsWith('en')
          );
          
          setSynthesis(prev => ({
            ...prev,
            voices: portugueseVoices,
            selectedVoice: portugueseVoices.find(v => v.lang === 'pt-BR') || 
                          portugueseVoices.find(v => v.lang.startsWith('pt')) ||
                          voices[0] || null
          }));
        };

        // Load voices immediately and on voiceschanged event
        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
          window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        };
      }
    }
  }, [language, enableContinuousListening]);

  // Setup Speech Recognition Event Handlers
  useEffect(() => {
    const recognitionInstance = recognitionRef.current;
    if (!recognitionInstance) {return;}

    const handleResult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let maxConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        if (result.isFinal) {
          finalTranscript += transcript;
          maxConfidence = Math.max(maxConfidence, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      setRecognition(prev => ({
        ...prev,
        transcript: interimTranscript,
        finalTranscript: prev.finalTranscript + finalTranscript,
        confidence: maxConfidence,
        error: null,
      }));

      // Process final transcript for emergency patterns
      if (finalTranscript) {
        processEmergencyCommand(finalTranscript, maxConfidence);
      }
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = "Erro no reconhecimento de voz";
      
      switch (event.error) {
        case "no-speech":
          errorMessage = "Nenhuma fala detectada. Tente falar mais alto.";
          break;
        case "audio-capture":
          errorMessage = "Erro ao capturar áudio. Verifique o microfone.";
          break;
        case "not-allowed":
          errorMessage = "Permissão negada para usar microfone.";
          break;
        case "network":
          errorMessage = "Erro de rede. Verifique sua conexão.";
          break;
        case "service-not-allowed":
          errorMessage = "Serviço de reconhecimento de voz não disponível.";
          break;
        default:
          errorMessage = `Erro: ${event.error}`;
      }

      setRecognition(prev => ({
        ...prev,
        isListening: false,
        error: errorMessage,
      }));

      toast({
        title: "Erro no Reconhecimento de Voz",
        description: errorMessage,
        variant: "destructive",
      });
    };

    const handleStart = () => {
      setRecognition(prev => ({ ...prev, isListening: true, error: null }));
      
      // Set emergency timeout - if continuous listening for emergencies
      if (enableContinuousListening) {
        emergencyTimeoutRef.current = setTimeout(() => {
          toast({
            title: "🚨 Monitoramento de Emergência Ativo",
            description: "Sistema de voz ativo para detecção de emergências médicas.",
            variant: "default",
          });
        }, 3000);
      }
    };

    const handleEnd = () => {
      setRecognition(prev => ({ ...prev, isListening: false }));
      
      if (emergencyTimeoutRef.current) {
        clearTimeout(emergencyTimeoutRef.current);
        emergencyTimeoutRef.current = null;
      }
      
      // Restart if continuous mode and no error
      if (enableContinuousListening && !recognition.error) {
        setTimeout(() => startListening(), 1000);
      }
    };

    recognitionInstance.addEventListener('result', handleResult);
    recognitionInstance.addEventListener('error', handleError);
    recognitionInstance.addEventListener('start', handleStart);
    recognitionInstance.addEventListener('end', handleEnd);

    return () => {
      recognitionInstance.removeEventListener('result', handleResult);
      recognitionInstance.removeEventListener('error', handleError);
      recognitionInstance.removeEventListener('start', handleStart);
      recognitionInstance.removeEventListener('end', handleEnd);
    };
  }, [recognition.error, enableContinuousListening, toast]);

  // Process emergency commands
  const processEmergencyCommand = useCallback((transcript: string, confidence: number) => {
    const lowerTranscript = transcript.toLowerCase();
    
    for (const pattern of emergencyPatterns) {
      const matchedCommand = pattern.commands.find(cmd => 
        lowerTranscript.includes(cmd.toLowerCase())
      );
      
      if (matchedCommand && confidence >= emergencyThreshold) {
        // Emergency detected
        if (pattern.priority === "critical") {
          onEmergencyDetected(pattern.intent, transcript);
          
          // Immediate audio feedback for critical emergencies
          speakText(pattern.response, { priority: "critical", interrupt: true });
          
          toast({
            title: "🚨 EMERGÊNCIA MÉDICA DETECTADA",
            description: pattern.response,
            variant: "destructive",
          });
        } else {
          // High/Medium priority
          onCommandExecuted(matchedCommand, pattern.intent);
          speakText(pattern.response, { priority: pattern.priority });
          
          toast({
            title: "Comando de Voz Reconhecido",
            description: `Executando: ${pattern.response}`,
          });
        }
        
        break; // Only process first match
      }
    }
  }, [onEmergencyDetected, onCommandExecuted, emergencyThreshold, toast]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || recognition.isListening) {return;}

    try {
      setRecognition(prev => ({ ...prev, transcript: "", finalTranscript: "" }));
      recognitionRef.current.start();
    } catch (error) {
      setRecognition(prev => ({
        ...prev,
        error: "Não foi possível iniciar o reconhecimento de voz",
      }));
    }
  }, [recognition.isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !recognition.isListening) {return;}

    recognitionRef.current.stop();
  }, [recognition.isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (recognition.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [recognition.isListening, startListening, stopListening]);

  // Speak text with emergency prioritization
  const speakText = useCallback((
    text: string, 
    options: {
      priority?: "critical" | "high" | "medium";
      interrupt?: boolean;
      rate?: number;
      pitch?: number;
      volume?: number;
    } = {}
  ) => {
    if (!synthRef.current || !synthesis.isSupported) {return;}

    const { 
      priority = "medium", 
      interrupt = false, 
      rate = 1, 
      pitch = 1, 
      volume = 1 
    } = options;

    // Stop current speech if interrupting (for emergencies)
    if (interrupt && synthesis.isSpeaking) {
      synthRef.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings based on priority
    utterance.voice = synthesis.selectedVoice;
    utterance.rate = priority === "critical" ? 0.9 : rate; // Slightly slower for critical messages
    utterance.pitch = priority === "critical" ? 1.2 : pitch; // Higher pitch for urgency
    utterance.volume = volume;
    utterance.lang = language;

    utterance.onstart = () => {
      setSynthesis(prev => ({ ...prev, isSpeaking: true }));
    };

    utterance.onend = () => {
      setSynthesis(prev => ({ ...prev, isSpeaking: false }));
    };

    utterance.onerror = (error) => {
      setSynthesis(prev => ({ ...prev, isSpeaking: false }));
      toast({
        title: "Erro na Síntese de Voz",
        description: `Erro: ${error.error}`,
        variant: "destructive",
      });
    };

    synthRef.current.speak(utterance);
  }, [synthesis.isSupported, synthesis.isSpeaking, synthesis.selectedVoice, language, toast]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current && synthesis.isSpeaking) {
      synthRef.current.cancel();
      setSynthesis(prev => ({ ...prev, isSpeaking: false }));
    }
  }, [synthesis.isSpeaking]);

  // Emergency announcement
  const announceEmergency = useCallback((message?: string) => {
    const emergencyMessage = message || 
      "Situação de emergência detectada. Conectando com equipe médica. Mantenha-se calmo.";
    
    speakText(emergencyMessage, { 
      priority: "critical", 
      interrupt: true,
      rate: 0.8, // Slower for clarity in emergency
      volume: 1 // Full volume
    });
  }, [speakText]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (emergencyTimeoutRef.current) {
        clearTimeout(emergencyTimeoutRef.current);
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  return {
    // Voice Recognition
    recognition,
    startListening,
    stopListening,
    toggleListening,
    
    // Speech Synthesis
    synthesis,
    speakText,
    stopSpeaking,
    announceEmergency,
    
    // Utilities
    isVoiceSupported: recognition.isSupported && synthesis.isSupported,
    isActive: recognition.isListening || synthesis.isSpeaking,
  };
}

export default useEmergencyVoiceCommands;