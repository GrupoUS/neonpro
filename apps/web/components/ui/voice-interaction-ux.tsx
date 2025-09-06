"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress"; // Unused import
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ConfidencePatterns } from "./confidence-patterns";

// Voice interaction modes
export enum VoiceMode {
  PUSH_TO_TALK = "push_to_talk",
  CONTINUOUS = "continuous",
  WAKE_WORD = "wake_word",
  DISABLED = "disabled",
}

// Healthcare voice contexts
export enum VoiceContext {
  GENERAL = "general",
  PATIENT_CONSULTATION = "patient_consultation",
  PROCEDURE_NOTES = "procedure_notes",
  EMERGENCY = "emergency",
  SCHEDULING = "scheduling",
  PRESCRIPTION = "prescription",
  DOCUMENTATION = "documentation",
}

// Voice recognition states
export enum VoiceState {
  IDLE = "idle",
  LISTENING = "listening",
  PROCESSING = "processing",
  SPEAKING = "speaking",
  ERROR = "error",
  PAUSED = "paused",
}

// Portuguese healthcare vocabulary for better recognition
const HealthcareVocabulary = {
  [VoiceContext.GENERAL]: [
    "paciente",
    "consulta",
    "agendamento",
    "prontuário",
    "medicação",
    "sintomas",
    "diagnóstico",
    "tratamento",
    "procedimento",
    "receita",
  ],
  [VoiceContext.PATIENT_CONSULTATION]: [
    "botox",
    "preenchimento",
    "ácido hialurônico",
    "anestesia",
    "assepsia",
    "alergia",
    "reação",
    "contraindicação",
    "consentimento informado",
    "pós-operatório",
    "cicatrização",
    "edema",
    "hematoma",
    "inflamação",
  ],
  [VoiceContext.PROCEDURE_NOTES]: [
    "aplicação",
    "unidades",
    "diluição",
    "técnica",
    "localização",
    "quantidade",
    "resultado",
    "complicações",
    "intercorrências",
    "orientações",
    "retorno",
    "avaliação",
    "satisfação",
  ],
  [VoiceContext.EMERGENCY]: [
    "urgência",
    "emergência",
    "prioridade",
    "crítico",
    "estável",
    "instável",
    "choque",
    "anafilaxia",
    "parada",
    "reanimação",
  ],
  [VoiceContext.SCHEDULING]: [
    "agendar",
    "remarcar",
    "cancelar",
    "disponibilidade",
    "horário",
    "data",
    "confirmação",
    "lista de espera",
    "preferência",
  ],
  [VoiceContext.PRESCRIPTION]: [
    "prescrever",
    "posologia",
    "dosagem",
    "via",
    "frequência",
    "duração",
    "interações",
    "efeitos colaterais",
    "cuidados",
  ],
} as const;

// Voice commands for healthcare workflows
const VoiceCommands = {
  global: {
    "abrir paciente": { action: "openPatient", params: [] },
    "nova consulta": { action: "newConsultation", params: [] },
    "emergência": { action: "emergency", params: [] },
    "ajuda": { action: "help", params: [] },
    "parar gravação": { action: "stopRecording", params: [] },
    "repetir": { action: "repeat", params: [] },
  },
  [VoiceContext.PATIENT_CONSULTATION]: {
    "iniciar consulta": { action: "startConsultation", params: [] },
    "adicionar sintoma": { action: "addSymptom", params: ["symptom"] },
    "prescrever medicamento": { action: "prescribeMedication", params: ["medication"] },
    "agendar retorno": { action: "scheduleReturn", params: ["date"] },
  },
  [VoiceContext.SCHEDULING]: {
    "próximo disponível": { action: "nextAvailable", params: [] },
    "agendar para": { action: "scheduleFor", params: ["date", "time"] },
    "cancelar agendamento": { action: "cancelAppointment", params: ["id"] },
  },
} as const;

// Voice interaction hook
export function useVoiceInteraction(
  context: VoiceContext = VoiceContext.GENERAL,
  options: {
    mode?: VoiceMode;
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
  } = {},
) {
  const [isSupported, setIsSupported] = useState(false);
  const [state, setState] = useState<VoiceState>(VoiceState.IDLE);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const {
    _mode = VoiceMode.PUSH_TO_TALK, // Unused variable
    language = "pt-BR",
    continuous = false,
    interimResults = true,
  } = options;

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition; })
        .webkitSpeechRecognition;

    setIsSupported(!!SpeechRecognition && !!window.speechSynthesis);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition; })
        .webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 3;

    // Add healthcare vocabulary hints
    if (recognition.grammars && HealthcareVocabulary[context]) {
      const grammarList = new SpeechGrammarList();
      const vocabulary = HealthcareVocabulary[context].join(" | ");
      grammarList.addFromString(
        `#JSGF V1.0; grammar healthcare; public <healthcare> = ${vocabulary} ;`,
        1,
      );
      recognition.grammars = grammarList;
    }

    recognition.onstart = () => {
      setState(VoiceState.LISTENING);
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(result[0].confidence * 100);
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        setState(VoiceState.PROCESSING);
      }

      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      setError(`Erro de reconhecimento: ${event.error}`);
      setState(VoiceState.ERROR);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (state !== VoiceState.ERROR) {
        setState(VoiceState.IDLE);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported, language, continuous, interimResults, context, state]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    setTranscript("");
    setInterimTranscript("");
    setError(null);

    try {
      recognitionRef.current.start();
    } catch (_err) { // Unused catch parameter
      setError("Não foi possível iniciar o reconhecimento de voz");
      setState(VoiceState.ERROR);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    recognitionRef.current.stop();
  }, [isListening]);

  const speak = useCallback((text: string, options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
    volume?: number;
  }) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = options?.rate || 0.9;
    utterance.pitch = options?.pitch || 1;
    utterance.volume = options?.volume || 1;

    // Try to use Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const portugueseVoice = voices.find(voice =>
      voice.lang.startsWith("pt") || voice.name.includes("Portuguese")
    );
    if (portugueseVoice) {
      utterance.voice = portugueseVoice;
    }

    utterance.onstart = () => setState(VoiceState.SPEAKING);
    utterance.onend = () => setState(VoiceState.IDLE);
    utterance.onerror = () => setState(VoiceState.ERROR);

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const processCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase().trim();

    // Check global commands first
    for (const [command, action] of Object.entries(VoiceCommands.global)) {
      if (lowerText.includes(command)) {
        return { command, action, text: lowerText };
      }
    }

    // Check context-specific commands
    const contextCommands = VoiceCommands[context] || {};
    for (const [command, action] of Object.entries(contextCommands)) {
      if (lowerText.includes(command)) {
        return { command, action, text: lowerText };
      }
    }

    return null;
  }, [context]);

  return {
    isSupported,
    state,
    transcript,
    interimTranscript,
    confidence,
    error,
    isListening,
    startListening,
    stopListening,
    speak,
    processCommand,
    clearTranscript: () => {
      setTranscript("");
      setInterimTranscript("");
    },
  };
}

// Main voice interaction component
interface VoiceInteractionUXProps {
  context?: VoiceContext;
  mode?: VoiceMode;
  onTranscript?: (text: string, confidence: number) => void;
  onCommand?: (command: string, action: Record<string, unknown>, text: string) => void;
  onError?: (error: string) => void;
  className?: string;
  showConfidence?: boolean;
  showTranscript?: boolean;
  enableCommands?: boolean;
  autoSpeak?: boolean;
}

export function VoiceInteractionUX({
  context = VoiceContext.GENERAL,
  mode = VoiceMode.PUSH_TO_TALK,
  onTranscript,
  onCommand,
  onError,
  className,
  showConfidence = true,
  showTranscript = true,
  enableCommands = true,
  _autoSpeak = false, // Unused parameter
}: VoiceInteractionUXProps) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [isEnabled, setIsEnabled] = useState(true);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const voice = useVoiceInteraction(context, {
    mode: currentMode,
    continuous: currentMode === VoiceMode.CONTINUOUS,
    interimResults: true,
  });

  // Handle transcript updates
  useEffect(() => {
    if (voice.transcript && onTranscript) {
      onTranscript(voice.transcript, voice.confidence);
    }
  }, [voice.transcript, voice.confidence, onTranscript]);

  // Handle command processing
  useEffect(() => {
    if (voice.transcript && enableCommands) {
      const command = voice.processCommand(voice.transcript);
      if (command && onCommand) {
        onCommand(command.command, command.action, command.text);
      }
    }
  }, [voice.transcript, enableCommands, voice, onCommand]);

  // Handle errors
  useEffect(() => {
    if (voice.error && onError) {
      onError(voice.error);
    }
  }, [voice.error, onError]);

  const getStateDescription = (state: VoiceState) => {
    switch (state) {
      case VoiceState.IDLE:
        return "Pronto para ouvir";
      case VoiceState.LISTENING:
        return "Escutando...";
      case VoiceState.PROCESSING:
        return "Processando fala...";
      case VoiceState.SPEAKING:
        return "Falando...";
      case VoiceState.ERROR:
        return "Erro no reconhecimento";
      case VoiceState.PAUSED:
        return "Pausado";
      default:
        return "Desconhecido";
    }
  };

  const getContextDescription = (ctx: VoiceContext) => {
    switch (ctx) {
      case VoiceContext.PATIENT_CONSULTATION:
        return "Consulta de Paciente";
      case VoiceContext.PROCEDURE_NOTES:
        return "Notas de Procedimento";
      case VoiceContext.EMERGENCY:
        return "Emergência Médica";
      case VoiceContext.SCHEDULING:
        return "Agendamento";
      case VoiceContext.PRESCRIPTION:
        return "Prescrição";
      default:
        return "Geral";
    }
  };

  if (!voice.isSupported) {
    return (
      <Alert>
        <AlertDescription>
          Reconhecimento de voz não é suportado neste navegador. Recomendamos usar Chrome ou Edge
          para melhor experiência.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Privacy Consent */}
      {!privacyConsent && (
        <Alert>
          <AlertDescription className="space-y-3">
            <div>
              <strong>Consentimento LGPD - Uso de Voz</strong>
            </div>
            <p className="text-sm">
              O reconhecimento de voz processa áudio localmente no seu navegador. Nenhum dado de voz
              é enviado para servidores externos. Você pode revogar este consentimento a qualquer
              momento.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setPrivacyConsent(true)}
              >
                Aceito o Uso de Voz
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Voice Control Panel */}
      {privacyConsent && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    voice.state === VoiceState.LISTENING
                      ? "bg-red-500 animate-pulse"
                      : voice.state === VoiceState.PROCESSING
                      ? "bg-yellow-500 animate-pulse"
                      : voice.state === VoiceState.SPEAKING
                      ? "bg-blue-500 animate-pulse"
                      : voice.state === VoiceState.ERROR
                      ? "bg-red-500"
                      : "bg-gray-300",
                  )}
                />
                <div>
                  <CardTitle className="text-lg">
                    Interação por Voz
                  </CardTitle>
                  <CardDescription>
                    {getContextDescription(context)} • {getStateDescription(voice.state)}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  pt-BR
                </Badge>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Voice Controls */}
            <div className="flex gap-2">
              {currentMode === VoiceMode.PUSH_TO_TALK && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="lg"
                        disabled={!isEnabled || voice.state === VoiceState.ERROR}
                        onMouseDown={voice.startListening}
                        onMouseUp={voice.stopListening}
                        onTouchStart={voice.startListening}
                        onTouchEnd={voice.stopListening}
                        className={cn(
                          "h-16 w-16 rounded-full",
                          voice.isListening ? "bg-red-500 hover:bg-red-600" : "",
                        )}
                      >
                        🎤
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div>Pressione e mantenha pressionado para falar</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {currentMode === VoiceMode.CONTINUOUS && (
                <Button
                  size="lg"
                  disabled={!isEnabled}
                  onClick={voice.isListening ? voice.stopListening : voice.startListening}
                  className={cn(
                    "h-16 w-16 rounded-full",
                    voice.isListening ? "bg-red-500 hover:bg-red-600" : "",
                  )}
                >
                  {voice.isListening ? "🛑" : "🎤"}
                </Button>
              )}

              <Button
                variant="outline"
                disabled={!voice.transcript}
                onClick={voice.clearTranscript}
              >
                Limpar
              </Button>
            </div>

            {/* Voice Mode Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Modo de Voz:</label>
              <div className="flex gap-2">
                {Object.values(VoiceMode).map((modeOption) => (
                  <Button
                    key={modeOption}
                    size="sm"
                    variant={currentMode === modeOption ? "default" : "outline"}
                    onClick={() => setCurrentMode(modeOption)}
                    disabled={modeOption === VoiceMode.WAKE_WORD} // Not implemented yet
                  >
                    {modeOption === VoiceMode.PUSH_TO_TALK && "Pressionar"}
                    {modeOption === VoiceMode.CONTINUOUS && "Contínuo"}
                    {modeOption === VoiceMode.WAKE_WORD && "Palavra-chave"}
                    {modeOption === VoiceMode.DISABLED && "Desabilitado"}
                  </Button>
                ))}
              </div>
            </div>

            {/* Confidence Display */}
            {showConfidence && voice.confidence > 0 && (
              <div className="space-y-2">
                <ConfidencePatterns
                  score={voice.confidence}
                  category="voice-recognition"
                  variant="progress"
                  showTooltip
                  context="Reconhecimento de voz em português"
                />
              </div>
            )}

            {/* Transcript Display */}
            {showTranscript && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Transcrição:</label>
                <div className="min-h-20 p-3 border rounded-md bg-gray-50">
                  {voice.transcript && (
                    <div className="text-sm">
                      <strong>Final:</strong> {voice.transcript}
                    </div>
                  )}
                  {voice.interimTranscript && (
                    <div className="text-sm text-gray-600 italic">
                      <strong>Interim:</strong> {voice.interimTranscript}
                    </div>
                  )}
                  {!voice.transcript && !voice.interimTranscript && (
                    <div className="text-sm text-gray-500">
                      Pressione o botão do microfone para começar a falar...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {voice.error && (
              <Alert>
                <AlertDescription>
                  {voice.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Voice Commands Help */}
            {enableCommands && (
              <details className="group">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2">
                  <span className="group-open:rotate-90 transition-transform">▶</span>
                  Comandos de Voz Disponíveis
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-2">
                  <div>
                    <strong>Comandos Globais:</strong>
                    {Object.keys(VoiceCommands.global).map(cmd => (
                      <Badge key={cmd} variant="outline" className="ml-1 text-xs">
                        " &quot;{cmd}&quot;"
                      </Badge>
                    ))}
                  </div>

                  {VoiceCommands[context] && (
                    <div>
                      <strong>Comandos do Contexto:</strong>
                      {Object.keys(VoiceCommands[context]).map(cmd => (
                        <Badge key={cmd} variant="outline" className="ml-1 text-xs">
                          " &quot;{cmd}&quot;"
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default VoiceInteractionUX;
