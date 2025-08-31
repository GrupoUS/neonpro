"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfidenceIndicator } from "./confidence-indicator";

interface VoiceInputProps {
  onTranscript: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  continuous?: boolean;
  interimResults?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

export function VoiceInput({
  onTranscript,
  onError,
  className,
  disabled = false,
  continuous = false,
  interimResults = true
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Verifica se a Speech Recognition API é suportada
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        window.SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        onError?.("Speech Recognition não é suportado neste navegador");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = 'pt-BR';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0].transcript;
          const resultConfidence = Math.round(result[0].confidence * 100);
          
          maxConfidence = Math.max(maxConfidence, resultConfidence);
          
          if (result.isFinal) {
            finalTranscript += transcriptText;
          } else {
            interimTranscript += transcriptText;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
        setConfidence(maxConfidence);

        if (finalTranscript) {
          onTranscript(finalTranscript, maxConfidence);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionError) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        const errorMessages = {
          'no-speech': 'Nenhuma fala detectada. Tente novamente.',
          'audio-capture': 'Falha ao capturar áudio. Verifique o microfone.',
          'not-allowed': 'Permissão de microfone negada.',
          'network': 'Erro de rede. Verifique sua conexão.',
          'service-not-allowed': 'Serviço de reconhecimento não permitido.',
          'bad-grammar': 'Erro na gramática de reconhecimento.',
          'language-not-supported': 'Idioma não suportado.'
        };

        const errorMessage = errorMessages[event.error as keyof typeof errorMessages] || 
                           `Erro de reconhecimento de fala: ${event.error}`;
        
        onError?.(errorMessage);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [continuous, interimResults, onTranscript, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported || disabled) {return;}
    
    try {
      setTranscript("");
      setConfidence(0);
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      onError?.("Erro ao iniciar o reconhecimento de fala");
    }
  }, [isSupported, disabled, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {return;}
    
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, []);

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 text-center p-4">
        Reconhecimento de voz não disponível neste navegador
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? "destructive" : "default"}
          size="sm"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className="flex items-center gap-2"
          aria-label={isListening ? "Parar gravação" : "Iniciar gravação"}
        >
          {isListening ? (
            <>
              <Square className="h-4 w-4" />
              Parar
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Gravar
            </>
          )}
        </Button>
        
        {transcript && confidence > 0 && (
          <ConfidenceIndicator 
            confidence={confidence} 
            size="sm"
            showPercentage={false}
          />
        )}
      </div>

      {isListening && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <MicOff className="h-4 w-4 animate-pulse" />
          <span>Ouvindo...</span>
        </div>
      )}

      {transcript && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-700">
            <strong>Transcrição:</strong> {transcript}
          </p>
          {confidence > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Confiança: {confidence}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}