"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Stethoscope,
  MessageCircle,
  Headphones,
  Activity
} from 'lucide-react';

// ================================================================================
// GLOBAL TYPE DECLARATIONS
// ================================================================================

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

 // Keep this file as a module

// ================================================================================
// TYPES & INTERFACES
// ================================================================================

export interface MedicalVocabulary {
  specialty: MedicalSpecialty;
  terms: MedicalTerm[];
  commands: VoiceCommand[];
  phonetic_variations: { [key: string]: string[] };
}

export interface MedicalTerm {
  term: string;
  pronunciation: string;
  category: 'procedure' | 'anatomy' | 'medication' | 'condition' | 'equipment' | 'action';
  confidence_threshold: number;
  alternatives: string[];
  context_clues: string[];
}

export interface VoiceCommand {
  id: string;
  phrases: string[];
  action: string;
  category: 'navigation' | 'medical_action' | 'emergency' | 'system' | 'accessibility';
  confirmation_required: boolean;
  healthcare_priority: 'emergency' | 'high' | 'normal' | 'low';
  lgpd_sensitive: boolean;
}

export interface VoiceRecognitionSettings {
  enabled: boolean;
  language: 'pt-BR' | 'pt-PT' | 'en-US';
  confidence_threshold: number; // 0-1
  continuous_listening: boolean;
  push_to_talk: boolean;
  wake_word_enabled: boolean;
  wake_words: string[];
  
  // Medical Features
  medical_vocabulary_enabled: boolean;
  specialty_focus: MedicalSpecialty | 'all';
  pronunciation_assistance: boolean;
  phonetic_matching: boolean;
  
  // Privacy & Compliance
  lgpd_mode: boolean;
  local_processing: boolean;
  data_retention_days: number;
  consent_required: boolean;
  
  // Accessibility Features
  voice_feedback: boolean;
  audio_cues: boolean;
  volume_level: number; // 0-100
  speech_rate: number; // 0.5-2.0
}

export interface VoiceSession {
  id: string;
  start_time: number;
  end_time?: number;
  specialty: MedicalSpecialty;
  commands_recognized: VoiceCommand[];
  medical_terms_used: MedicalTerm[];
  confidence_scores: number[];
  lgpd_consent: boolean;
  data_processed_locally: boolean;
}

export type MedicalSpecialty = 
  | 'dermatology' 
  | 'plastic_surgery' 
  | 'general_medicine' 
  | 'emergency' 
  | 'nursing' 
  | 'pharmacy'
  | 'administration'
  | 'all';

export interface VoiceMedicalContextType {
  // Recognition State
  is_listening: boolean;
  is_speaking: boolean;
  current_session: VoiceSession | null;
  
  // Settings Management
  settings: VoiceRecognitionSettings;
  updateSettings: (settings: Partial<VoiceRecognitionSettings>) => void;
  
  // Voice Control
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, priority?: 'normal' | 'high' | 'emergency') => void;
  
  // Medical Vocabulary
  vocabularies: MedicalVocabulary[];
  loadVocabulary: (specialty: MedicalSpecialty) => void;
  
  // Command System
  registerCommand: (command: VoiceCommand) => void;
  unregisterCommand: (commandId: string) => void;
  
  // LGPD Compliance
  requestConsent: () => Promise<boolean>;
  revokeConsent: () => void;
  exportData: () => unknown;
  deleteData: () => void;
}

// ================================================================================
// MEDICAL VOCABULARIES & COMMANDS
// ================================================================================

const DERMATOLOGY_VOCABULARY: MedicalVocabulary = {
  specialty: 'dermatology',
  terms: [
    {
      term: 'botox',
      pronunciation: 'bó-tocs',
      category: 'medication',
      confidence_threshold: 0.8,
      alternatives: ['toxina botulínica', 'aplicação de botox'],
      context_clues: ['rugas', 'linhas de expressão', 'aplicar']
    },
    {
      term: 'preenchimento',
      pronunciation: 'pre-en-chi-men-to',
      category: 'procedure',
      confidence_threshold: 0.85,
      alternatives: ['filler', 'ácido hialurônico', 'preenchedor'],
      context_clues: ['volume', 'lábios', 'sulcos']
    },
    {
      term: 'microagulhamento',
      pronunciation: 'mi-cro-a-gu-lha-men-to',
      category: 'procedure',
      confidence_threshold: 0.9,
      alternatives: ['microrolagem', 'dermaroller', 'indução percutânea'],
      context_clues: ['colágeno', 'cicatrizes', 'pele']
    },
    {
      term: 'peeling',
      pronunciation: 'pí-ling',
      category: 'procedure',
      confidence_threshold: 0.7,
      alternatives: ['descamação', 'esfoliação química'],
      context_clues: ['ácido', 'renovação', 'superficial']
    }
  ],
  commands: [
    {
      id: 'agendar_botox',
      phrases: ['agendar botox', 'marcar aplicação de botox', 'consulta para rugas'],
      action: 'schedule_botox_appointment',
      category: 'medical_action',
      confirmation_required: true,
      healthcare_priority: 'normal',
      lgpd_sensitive: true
    },
    {
      id: 'consultar_preenchimento',
      phrases: ['consultar preenchimento', 'informações sobre filler', 'ácido hialurônico'],
      action: 'show_filler_information',
      category: 'navigation',
      confirmation_required: false,
      healthcare_priority: 'low',
      lgpd_sensitive: false
    }
  ],
  phonetic_variations: {
    'botox': ['bótox', 'bôtox', 'botóx'],
    'preenchimento': ['preenchimeto', 'preechimento', 'prechimento'],
    'hialurônico': ['ialurónico', 'hialuronico', 'ialuronico']
  }
};

const EMERGENCY_VOCABULARY: MedicalVocabulary = {
  specialty: 'emergency',
  terms: [
    {
      term: 'emergência',
      pronunciation: 'e-mer-gên-cia',
      category: 'condition',
      confidence_threshold: 0.95,
      alternatives: ['urgência', 'socorro', 'ajuda'],
      context_clues: ['rápido', 'imediato', 'grave']
    },
    {
      term: 'anafilaxia',
      pronunciation: 'a-na-fi-la-xi-a',
      category: 'condition',
      confidence_threshold: 0.9,
      alternatives: ['reação alérgica grave', 'choque alérgico'],
      context_clues: ['alergia', 'respiração', 'inchaço']
    }
  ],
  commands: [
    {
      id: 'emergencia_medica',
      phrases: ['emergência médica', 'socorro médico', 'ajuda urgente', 'código vermelho'],
      action: 'trigger_medical_emergency',
      category: 'emergency',
      confirmation_required: false,
      healthcare_priority: 'emergency',
      lgpd_sensitive: true
    },
    {
      id: 'chamar_medico',
      phrases: ['chamar médico', 'buscar doutor', 'preciso de ajuda médica'],
      action: 'call_doctor',
      category: 'emergency',
      confirmation_required: false,
      healthcare_priority: 'high',
      lgpd_sensitive: true
    }
  ],
  phonetic_variations: {
    'emergência': ['emergencia', 'emergênça', 'emergencia'],
    'anafilaxia': ['anafilacia', 'anfilaxia', 'anafilacia']
  }
};

const NAVIGATION_COMMANDS: VoiceCommand[] = [
  {
    id: 'proximo_paciente',
    phrases: ['próximo paciente', 'seguinte', 'avançar paciente'],
    action: 'navigate_next_patient',
    category: 'navigation',
    confirmation_required: false,
    healthcare_priority: 'normal',
    lgpd_sensitive: true
  },
  {
    id: 'abrir_prontuario',
    phrases: ['abrir prontuário', 'ver ficha', 'histórico médico'],
    action: 'open_medical_record',
    category: 'navigation',
    confirmation_required: false,
    healthcare_priority: 'high',
    lgpd_sensitive: true
  },
  {
    id: 'salvar_dados',
    phrases: ['salvar dados', 'gravar informações', 'confirmar dados'],
    action: 'save_patient_data',
    category: 'medical_action',
    confirmation_required: true,
    healthcare_priority: 'high',
    lgpd_sensitive: true
  }
];

const DEFAULT_SETTINGS: VoiceRecognitionSettings = {
  enabled: false,
  language: 'pt-BR',
  confidence_threshold: 0.8,
  continuous_listening: false,
  push_to_talk: true,
  wake_word_enabled: false,
  wake_words: ['assistente médico', 'neon assistente'],
  medical_vocabulary_enabled: true,
  specialty_focus: 'all',
  pronunciation_assistance: true,
  phonetic_matching: true,
  lgpd_mode: true,
  local_processing: true,
  data_retention_days: 30,
  consent_required: true,
  voice_feedback: true,
  audio_cues: true,
  volume_level: 70,
  speech_rate: 1
};

// ================================================================================
// CONTEXT & PROVIDER
// ================================================================================

const VoiceMedicalContext = createContext<VoiceMedicalContextType | null>(null);

export function VoiceMedicalProvider({ children }: { children: React.ReactNode }) {
  // State Management
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSession, setCurrentSession] = useState<VoiceSession | null>(null);
  const [settings, setSettings] = useState<VoiceRecognitionSettings>(DEFAULT_SETTINGS);
  const [vocabularies, setVocabularies] = useState<MedicalVocabulary[]>([
    DERMATOLOGY_VOCABULARY,
    EMERGENCY_VOCABULARY
  ]);
  const [registeredCommands, setRegisteredCommands] = useState<VoiceCommand[]>(NAVIGATION_COMMANDS);
  
  // Refs
  const recognition = useRef<SpeechRecognition | null>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const consentGiven = useRef<boolean>(false);

  // ================================================================================
  // SPEECH RECOGNITION SETUP
  // ================================================================================

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition.current = new SpeechRecognition();
    synthesis.current = window.speechSynthesis;

    if (recognition.current) {
      recognition.current.continuous = settings.continuous_listening;
      recognition.current.lang = settings.language;
      recognition.current.interimResults = true;
      recognition.current.maxAlternatives = 5;

      recognition.current.onstart = () => {
        setIsListening(true);
        if (settings.audio_cues) {
          playAudioCue('start');
        }
      };

      recognition.current.onend = () => {
        setIsListening(false);
        if (settings.audio_cues) {
          playAudioCue('stop');
        }
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          speak('Permissão de microfone negada. Por favor, permita o acesso para usar comandos de voz.', 'high');
        } else if (event.error === 'no-speech') {
          speak('Nenhuma fala detectada. Tente falar mais próximo ao microfone.', 'normal');
        }
      };

      recognition.current.onresult = (event) => {
        handleSpeechResult(event);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [settings]);

  // ================================================================================
  // SPEECH PROCESSING & MEDICAL TERM RECOGNITION
  // ================================================================================

  const handleSpeechResult = useCallback((event: SpeechRecognitionEvent) => {
    const lastResult = event.results[event.results.length - 1];
    if (!lastResult.isFinal) {return;}

    const transcript = lastResult[0].transcript.toLowerCase().trim();
    const confidence = lastResult[0].confidence;

    console.log(`Voice input: "${transcript}" (confidence: ${confidence})`);

    if (confidence < settings.confidence_threshold) {
      if (settings.voice_feedback) {
        speak('Desculpe, não entendi bem. Pode repetir?', 'normal');
      }
      return;
    }

    // Process medical terminology first
    const medicalTerms = processMedicalTerminology(transcript, confidence);
    
    // Process voice commands
    const matchedCommand = processVoiceCommands(transcript, confidence);
    
    // Update current session
    if (currentSession) {
      setCurrentSession(prev => ({
        ...prev!,
        commands_recognized: matchedCommand ? [...prev!.commands_recognized, matchedCommand] : prev!.commands_recognized,
        medical_terms_used: [...prev!.medical_terms_used, ...medicalTerms],
        confidence_scores: [...prev!.confidence_scores, confidence]
      }));
    }

    // Execute command if found
    if (matchedCommand) {
      executeVoiceCommand(matchedCommand, transcript);
    } else if (settings.voice_feedback) {
      speak('Comando não reconhecido. Diga "ajuda" para ver os comandos disponíveis.', 'normal');
    }
  }, [settings, currentSession]);

  const processMedicalTerminology = useCallback((transcript: string, confidence: number): MedicalTerm[] => {
    const recognizedTerms: MedicalTerm[] = [];
    
    for (const vocabulary of vocabularies) {
      // Skip if specialty focus is set and doesn't match
      if (settings.specialty_focus !== 'all' && vocabulary.specialty !== settings.specialty_focus) {
        continue;
      }
      
      for (const term of vocabulary.terms) {
        let matchFound = false;
        
        // Direct term matching
        if (transcript.includes(term.term.toLowerCase())) {
          matchFound = true;
        }
        
        // Alternative matching
        if (!matchFound) {
          for (const alternative of term.alternatives) {
            if (transcript.includes(alternative.toLowerCase())) {
              matchFound = true;
              break;
            }
          }
        }
        
        // Phonetic matching if enabled
        if (!matchFound && settings.phonetic_matching) {
          const phoneticVariations = vocabulary.phonetic_variations[term.term] || [];
          for (const variation of phoneticVariations) {
            if (transcript.includes(variation.toLowerCase())) {
              matchFound = true;
              break;
            }
          }
        }
        
        // Context clue matching (boosts confidence)
        let contextBonus = 0;
        for (const clue of term.context_clues) {
          if (transcript.includes(clue.toLowerCase())) {
            contextBonus += 0.1;
          }
        }
        
        if (matchFound && confidence + contextBonus >= term.confidence_threshold) {
          recognizedTerms.push(term);
        }
      }
    }
    
    return recognizedTerms;
  }, [vocabularies, settings]);

  const processVoiceCommands = useCallback((transcript: string, confidence: number): VoiceCommand | null => {
    const allCommands = [
      ...registeredCommands,
      ...vocabularies.flatMap(v => v.commands)
    ];
    
    for (const command of allCommands) {
      for (const phrase of command.phrases) {
        // Simple phrase matching (could be enhanced with fuzzy matching)
        if (transcript.includes(phrase.toLowerCase())) {
          return command;
        }
      }
    }
    
    return null;
  }, [registeredCommands, vocabularies]);

  const executeVoiceCommand = useCallback((command: VoiceCommand, originalTranscript: string) => {
    console.log(`Executing command: ${command.id}`);
    
    // LGPD compliance check
    if (command.lgpd_sensitive && !consentGiven.current) {
      speak('Esta ação requer consentimento LGPD. Por favor, confirme no painel de configurações.', 'high');
      return;
    }
    
    // Confirmation for high-priority actions
    if (command.confirmation_required && command.healthcare_priority === 'emergency') {
      speak(`Confirma a execução de: ${command.phrases[0]}? Diga "sim" para confirmar ou "não" para cancelar.`, 'emergency');
      // Would implement confirmation flow here
      return;
    }
    
    // Provide voice feedback
    if (settings.voice_feedback) {
      const feedbackText = getFeedbackText(command);
      speak(feedbackText, command.healthcare_priority === 'emergency' ? 'emergency' : 'normal');
    }
    
    // Dispatch custom event for command execution
    const commandEvent = new CustomEvent('voice-medical-command', {
      detail: {
        command,
        originalTranscript,
        session: currentSession
      }
    });
    window.dispatchEvent(commandEvent);
  }, [settings, currentSession]);

  const getFeedbackText = (command: VoiceCommand): string => {
    const feedbackMap: { [key: string]: string } = {
      'navigate_next_patient': 'Avançando para o próximo paciente',
      'open_medical_record': 'Abrindo prontuário médico',
      'save_patient_data': 'Salvando dados do paciente',
      'trigger_medical_emergency': 'ALERTA: Emergência médica acionada',
      'call_doctor': 'Chamando médico de plantão',
      'schedule_botox_appointment': 'Agendando consulta para aplicação de botox',
      'show_filler_information': 'Mostrando informações sobre preenchimento'
    };
    
    return feedbackMap[command.action] || `Executando: ${command.phrases[0]}`;
  };

  // ================================================================================
  // TEXT-TO-SPEECH SYSTEM
  // ================================================================================

  const speak = useCallback((text: string, priority: 'normal' | 'high' | 'emergency' = 'normal') => {
    if (!synthesis.current || !settings.voice_feedback) {return;}

    // Stop current speech if higher priority
    if (synthesis.current && currentUtterance.current && (priority === 'emergency' || (priority === 'high' && currentUtterance.current.text !== text))) {
      synthesis.current.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = settings.language;
    utterance.volume = settings.volume_level / 100;
    utterance.rate = settings.speech_rate;
    
    // Emergency speech characteristics
    if (priority === 'emergency') {
      utterance.pitch = 1.2;
      utterance.rate = 0.9; // Slower for clarity
      utterance.volume = Math.min(1, settings.volume_level / 100 + 0.2);
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      currentUtterance.current = null;
    };

    currentUtterance.current = utterance;
    if (synthesis.current) {
      synthesis.current.speak(utterance);
    }
  }, [settings]);

  // ================================================================================
  // AUDIO FEEDBACK SYSTEM
  // ================================================================================

  const playAudioCue = useCallback((type: 'start' | 'stop' | 'error' | 'success') => {
    if (!settings.audio_cues) {return;}
    
    // Create simple audio cues using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const volume = settings.volume_level / 100 * 0.1; // Keep cues subtle
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    
    switch (type) {
      case 'start':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        break;
      case 'stop':
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        break;
      case 'error':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.type = 'sawtooth';
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2);
        break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, [settings]);

  // ================================================================================
  // VOICE CONTROL FUNCTIONS
  // ================================================================================

  const startListening = useCallback(async () => {
    if (!recognition.current || isListening) {return;}
    
    // Request LGPD consent if required
    if (settings.lgpd_mode && settings.consent_required && !consentGiven.current) {
      const consent = await requestConsent();
      if (!consent) {return;}
    }
    
    // Start new session
    const session: VoiceSession = {
      id: `session_${Date.now()}`,
      start_time: Date.now(),
      specialty: settings.specialty_focus,
      commands_recognized: [],
      medical_terms_used: [],
      confidence_scores: [],
      lgpd_consent: consentGiven.current,
      data_processed_locally: settings.local_processing
    };
    
    setCurrentSession(session);
    
    try {
      recognition.current.start();
      if (settings.voice_feedback) {
        speak('Assistente médico ativado. Como posso ajudar?', 'normal');
      }
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      speak('Erro ao iniciar reconhecimento de voz. Verifique as permissões do microfone.', 'high');
    }
  }, [isListening, settings]);

  const stopListening = useCallback(() => {
    if (recognition.current && isListening) {
      recognition.current.stop();
    }
    
    // End current session
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, end_time: Date.now() } : null);
    }
    
    if (settings.voice_feedback) {
      speak('Assistente médico desativado.', 'normal');
    }
  }, [isListening, currentSession, settings]);

  // ================================================================================
  // VOCABULARY MANAGEMENT
  // ================================================================================

  const loadVocabulary = useCallback((specialty: MedicalSpecialty) => {
    // In a real implementation, this would load from a server or local database
    console.log(`Loading vocabulary for specialty: ${specialty}`);
    
    // Update specialty focus
    setSettings(prev => ({ ...prev, specialty_focus: specialty }));
  }, []);

  // ================================================================================
  // COMMAND REGISTRATION
  // ================================================================================

  const registerCommand = useCallback((command: VoiceCommand) => {
    setRegisteredCommands(prev => [...prev.filter(c => c.id !== command.id), command]);
  }, []);

  const unregisterCommand = useCallback((commandId: string) => {
    setRegisteredCommands(prev => prev.filter(c => c.id !== commandId));
  }, []);

  // ================================================================================
  // LGPD COMPLIANCE FUNCTIONS
  // ================================================================================

  const requestConsent = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      // In a real implementation, this would show a consent dialog
      const consent = confirm(
        'O assistente de voz médico precisa processar dados de voz para funcionar. ' +
        'Os dados serão processados localmente quando possível. ' +
        'Você consente com o uso de reconhecimento de voz médico?'
      );
      
      consentGiven.current = consent;
      resolve(consent);
    });
  }, []);

  const revokeConsent = useCallback(() => {
    consentGiven.current = false;
    setSettings(prev => ({ ...prev, enabled: false }));
    stopListening();
    speak('Consentimento revogado. Assistente de voz desativado.', 'normal');
  }, [stopListening]);

  const exportData = useCallback(() => {
    // Return all session data for LGPD export requests
    return {
      settings,
      sessions: [currentSession].filter(Boolean),
      consent_status: consentGiven.current,
      export_timestamp: new Date().toISOString()
    };
  }, [settings, currentSession]);

  const deleteData = useCallback(() => {
    setCurrentSession(null);
    // In a real implementation, would delete all stored session data
    speak('Dados de voz deletados conforme solicitado.', 'normal');
  }, []);

  // ================================================================================
  // SETTINGS UPDATE
  // ================================================================================

  const updateSettings = useCallback((newSettings: Partial<VoiceRecognitionSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // ================================================================================
  // CONTEXT VALUE
  // ================================================================================

  const contextValue: VoiceMedicalContextType = {
    is_listening: isListening,
    is_speaking: isSpeaking,
    current_session: currentSession,
    settings,
    updateSettings,
    startListening,
    stopListening,
    speak,
    vocabularies,
    loadVocabulary,
    registerCommand,
    unregisterCommand,
    requestConsent,
    revokeConsent,
    exportData,
    deleteData
  };

  return (
    <VoiceMedicalContext.Provider value={contextValue}>
      {children}
    </VoiceMedicalContext.Provider>
  );
}

// ================================================================================
// CUSTOM HOOKS
// ================================================================================

export function useVoiceMedical() {
  const context = useContext(VoiceMedicalContext);
  if (!context) {
    throw new Error('useVoiceMedical must be used within VoiceMedicalProvider');
  }
  return context;
}

// ================================================================================
// MAIN COMPONENT
// ================================================================================

export interface VoiceMedicalControllerProps {
  className?: string;
  onSettingsChange?: (settings: VoiceRecognitionSettings) => void;
  onCommandExecuted?: (command: VoiceCommand, transcript: string) => void;
  specialtyFocus?: MedicalSpecialty;
  lgpdMode?: boolean;
  initialSettings?: Partial<VoiceRecognitionSettings>;
}

export function VoiceMedicalController({
  className,
  onSettingsChange,
  onCommandExecuted,
  specialtyFocus = 'all',
  lgpdMode = true,
  initialSettings
}: VoiceMedicalControllerProps) {
  const {
    is_listening,
    is_speaking,
    current_session,
    settings,
    updateSettings,
    startListening,
    stopListening,
    speak,
    vocabularies,
    loadVocabulary,
    requestConsent,
    revokeConsent,
    exportData,
    deleteData
  } = useVoiceMedical();

  // Initialize settings and modes
  useEffect(() => {
    if (initialSettings) {
      updateSettings({
        ...initialSettings,
        specialty_focus: specialtyFocus,
        lgpd_mode: lgpdMode
      });
    }
  }, [initialSettings, specialtyFocus, lgpdMode, updateSettings]);

  // Notify parent of settings changes
  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  // Listen for voice command events
  useEffect(() => {
    const handleVoiceCommand = ((event: CustomEvent) => {
      if (onCommandExecuted) {
        onCommandExecuted(event.detail.command, event.detail.originalTranscript);
      }
    }) as EventListener;

    window.addEventListener('voice-medical-command', handleVoiceCommand);
    return () => window.removeEventListener('voice-medical-command', handleVoiceCommand);
  }, [onCommandExecuted]);

  const activeVocabulary = vocabularies.find(v => v.specialty === settings.specialty_focus) || vocabularies[0];
  const totalCommands = vocabularies.reduce((sum, v) => sum + v.commands.length, 0);

  return (
    <Card className={`w-full max-w-4xl ${className}`}>
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Assistente de Voz Médico</h3>
              <p className="text-sm text-muted-foreground">
                Controle por voz com terminologia médica portuguesa
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={is_listening ? "default" : "secondary"}>
              {is_listening ? "Ouvindo" : "Inativo"}
            </Badge>
            
            {is_speaking && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <Volume2 className="h-3 w-3 mr-1" />
                Falando
              </Badge>
            )}
            
            {settings.lgpd_mode && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                LGPD
              </Badge>
            )}
          </div>
        </div>

        {/* Voice Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center">
              <Mic className="h-4 w-4 mr-2" />
              Controle de Voz
            </h4>
            
            <div className="space-y-2">
              <Button
                size="sm"
                onClick={is_listening ? stopListening : startListening}
                disabled={!settings.enabled}
                variant={is_listening ? "destructive" : "default"}
                className="w-full"
              >
                {is_listening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Parar
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Push-to-Talk</span>
                <Switch
                  checked={settings.push_to_talk}
                  onCheckedChange={(checked) => updateSettings({ push_to_talk: checked })}
                  disabled={is_listening}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Vocabulário Médico</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Especialidade</span>
                <select
                  value={settings.specialty_focus}
                  onChange={(e) => {
                    const specialty = e.target.value as MedicalSpecialty;
                    updateSettings({ specialty_focus: specialty });
                    loadVocabulary(specialty);
                  }}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">Todas</option>
                  <option value="dermatology">Dermatologia</option>
                  <option value="plastic_surgery">Cirurgia Plástica</option>
                  <option value="emergency">Emergência</option>
                  <option value="nursing">Enfermagem</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Termos Médicos</span>
                <Badge variant="outline">
                  {activeVocabulary?.terms.length || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Comandos</span>
                <Badge variant="outline">
                  {totalCommands}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Sessão Atual</h4>
            
            {current_session ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Comandos</span>
                  <span className="text-sm font-mono">
                    {current_session.commands_recognized.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Termos Médicos</span>
                  <span className="text-sm font-mono">
                    {current_session.medical_terms_used.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Confiança Média</span>
                  <span className="text-sm font-mono">
                    {current_session.confidence_scores.length > 0
                      ? Math.round(current_session.confidence_scores.reduce((a, b) => a + b, 0) / current_session.confidence_scores.length * 100) + '%'
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Nenhuma sessão ativa
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Configurações Rápidas</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Habilitar</span>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Feedback de Voz</span>
                <Switch
                  checked={settings.voice_feedback}
                  onCheckedChange={(checked) => updateSettings({ voice_feedback: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Sinais Sonoros</span>
                <Switch
                  checked={settings.audio_cues}
                  onCheckedChange={(checked) => updateSettings({ audio_cues: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-4">
            <h4 className="font-medium">Configurações de Reconhecimento</h4>
            
            <div className="space-y-2">
              <span className="text-sm">Limiar de Confiança: {Math.round(settings.confidence_threshold * 100)}%</span>
              <Slider
                value={[settings.confidence_threshold]}
                onValueChange={([value]) => updateSettings({ confidence_threshold: value })}
                min={0.5}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm">Volume: {settings.volume_level}%</span>
              <Slider
                value={[settings.volume_level]}
                onValueChange={([value]) => updateSettings({ volume_level: value })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm">Velocidade da Fala: {settings.speech_rate}x</span>
              <Slider
                value={[settings.speech_rate]}
                onValueChange={([value]) => updateSettings({ speech_rate: value })}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Configurações Médicas</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Vocabulário Médico</span>
              <Switch
                checked={settings.medical_vocabulary_enabled}
                onCheckedChange={(checked) => updateSettings({ medical_vocabulary_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Assistência de Pronúncia</span>
              <Switch
                checked={settings.pronunciation_assistance}
                onCheckedChange={(checked) => updateSettings({ pronunciation_assistance: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Correspondência Fonética</span>
              <Switch
                checked={settings.phonetic_matching}
                onCheckedChange={(checked) => updateSettings({ phonetic_matching: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Escuta Contínua</span>
              <Switch
                checked={settings.continuous_listening}
                onCheckedChange={(checked) => updateSettings({ continuous_listening: checked })}
              />
            </div>
          </div>
        </div>

        {/* LGPD Compliance Section */}
        {settings.lgpd_mode && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-4 flex items-center text-green-600">
              <Shield className="h-4 w-4 mr-2" />
              Conformidade LGPD
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Processamento Local</span>
                <Switch
                  checked={settings.local_processing}
                  onCheckedChange={(checked) => updateSettings({ local_processing: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Consentimento Obrigatório</span>
                <Switch
                  checked={settings.consent_required}
                  onCheckedChange={(checked) => updateSettings({ consent_required: checked })}
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm">Retenção de Dados: {settings.data_retention_days} dias</span>
                <Slider
                  value={[settings.data_retention_days]}
                  onValueChange={([value]) => updateSettings({ data_retention_days: value })}
                  min={1}
                  max={365}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportData}
                  className="flex-1"
                >
                  Exportar Dados
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteData}
                  className="flex-1"
                >
                  Deletar Dados
                </Button>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Proteção de Dados:</strong> Dados de voz são processados localmente quando possível. 
                Consentimento explícito é solicitado para funcionalidades que requerem dados sensíveis.
              </p>
            </div>
          </div>
        )}

        {/* Quick Commands Reference */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Comandos Rápidos</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-green-600 mb-2">Navegação</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>"próximo paciente"</li>
                <li>"abrir prontuário"</li>
                <li>"salvar dados"</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-orange-600 mb-2">Emergência</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>"emergência médica"</li>
                <li>"chamar médico"</li>
                <li>"código vermelho"</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-blue-600 mb-2">Dermatologia</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>"agendar botox"</li>
                <li>"consultar preenchimento"</li>
                <li>"informações microagulhamento"</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VoiceMedicalController;