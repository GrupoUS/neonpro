/**
 * Voice Search Engine
 * Story 3.4: Smart Search + NLP Integration - Task 5
 * Advanced voice search with speech recognition, NLP processing, and voice commands
 */

import { nlpEngine } from './nlp-engine';
import { comprehensiveSearch } from './comprehensive-search';
import { searchSuggestions } from './search-suggestions';
import type { SearchResult, ComprehensiveSearchResponse } from './comprehensive-search';
import type { SuggestionContext } from './search-suggestions';

// Voice search types
export interface VoiceSearchOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  noiseReduction?: boolean;
  autoStop?: boolean;
  timeout?: number;
  confidenceThreshold?: number;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  alternatives: Array<{
    transcript: string;
    confidence: number;
  }>;
  isFinal: boolean;
  timestamp: number;
}

export interface VoiceCommand {
  id: string;
  patterns: string[];
  action: string;
  parameters?: Record<string, any>;
  description: string;
  examples: string[];
  category: 'search' | 'navigation' | 'action' | 'filter' | 'system';
}

export interface VoiceSearchSession {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  queries: VoiceQuery[];
  totalDuration: number;
  successRate: number;
  averageConfidence: number;
  commandsUsed: string[];
  errors: VoiceError[];
}

export interface VoiceQuery {
  id: string;
  sessionId: string;
  originalAudio?: Blob;
  transcript: string;
  confidence: number;
  alternatives: string[];
  processedQuery: string;
  nlpResults?: any;
  searchResults?: ComprehensiveSearchResponse;
  command?: VoiceCommand;
  timestamp: number;
  duration: number;
  success: boolean;
  errorMessage?: string;
}

export interface VoiceError {
  type: 'recognition' | 'processing' | 'network' | 'permission' | 'timeout';
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}

export interface VoiceSearchAnalytics {
  totalSessions: number;
  totalQueries: number;
  averageSessionDuration: number;
  successRate: number;
  mostUsedCommands: Array<{ command: string; count: number }>;
  languageDistribution: Record<string, number>;
  errorDistribution: Record<string, number>;
  confidenceDistribution: {
    high: number; // >0.8
    medium: number; // 0.5-0.8
    low: number; // <0.5
  };
}

export interface AudioProcessingOptions {
  sampleRate?: number;
  channels?: number;
  bitDepth?: number;
  noiseReduction?: boolean;
  echoCancellation?: boolean;
  autoGainControl?: boolean;
  noiseSuppression?: boolean;
}

/**
 * Voice Search Engine Class
 * Handles speech recognition, voice commands, and audio processing
 */
export class VoiceSearch {
  private recognition: SpeechRecognition | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private currentSession: VoiceSearchSession | null = null;
  private isListening = false;
  private isProcessing = false;
  private commands: Map<string, VoiceCommand> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private audioChunks: Blob[] = [];
  private silenceTimer: NodeJS.Timeout | null = null;
  private options: VoiceSearchOptions;
  
  constructor(options: VoiceSearchOptions = {}) {
    this.options = {
      language: 'pt-BR',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      noiseReduction: true,
      autoStop: true,
      timeout: 30000,
      confidenceThreshold: 0.5,
      ...options
    };
    
    this.initializeRecognition();
    this.initializeCommands();
  }
  
  /**
   * Initialize speech recognition
   */
  private initializeRecognition(): void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = this.options.continuous!;
    this.recognition.interimResults = this.options.interimResults!;
    this.recognition.lang = this.options.language!;
    this.recognition.maxAlternatives = this.options.maxAlternatives!;
    
    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.emit('start');
    };
    
    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event);
    };
    
    this.recognition.onerror = (event) => {
      this.handleRecognitionError(event);
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      this.emit('end');
    };
  }
  
  /**
   * Initialize voice commands
   */
  private initializeCommands(): void {
    const defaultCommands: VoiceCommand[] = [
      {
        id: 'search_patients',
        patterns: ['buscar paciente', 'procurar paciente', 'encontrar paciente'],
        action: 'search',
        parameters: { type: 'patient' },
        description: 'Buscar pacientes',
        examples: ['Buscar paciente João Silva', 'Procurar paciente com diabetes'],
        category: 'search'
      },
      {
        id: 'search_appointments',
        patterns: ['buscar consulta', 'procurar agendamento', 'encontrar consulta'],
        action: 'search',
        parameters: { type: 'appointment' },
        description: 'Buscar consultas e agendamentos',
        examples: ['Buscar consulta hoje', 'Procurar agendamento Dr. Silva'],
        category: 'search'
      },
      {
        id: 'filter_by_date',
        patterns: ['filtrar por data', 'mostrar de hoje', 'mostrar desta semana'],
        action: 'filter',
        parameters: { filterType: 'date' },
        description: 'Filtrar resultados por data',
        examples: ['Filtrar por data hoje', 'Mostrar consultas desta semana'],
        category: 'filter'
      },
      {
        id: 'clear_search',
        patterns: ['limpar busca', 'limpar pesquisa', 'resetar filtros'],
        action: 'clear',
        description: 'Limpar busca e filtros',
        examples: ['Limpar busca', 'Resetar filtros'],
        category: 'action'
      },
      {
        id: 'help_voice',
        patterns: ['ajuda', 'comandos de voz', 'o que posso falar'],
        action: 'help',
        description: 'Mostrar comandos de voz disponíveis',
        examples: ['Ajuda', 'Quais comandos posso usar?'],
        category: 'system'
      },
      {
        id: 'stop_listening',
        patterns: ['parar', 'parar de escutar', 'cancelar'],
        action: 'stop',
        description: 'Parar reconhecimento de voz',
        examples: ['Parar', 'Cancelar escuta'],
        category: 'system'
      }
    ];
    
    defaultCommands.forEach(command => {
      this.commands.set(command.id, command);
    });
  }
  
  /**
   * Start voice search session
   */
  async startSession(userId?: string): Promise<string> {
    if (this.currentSession) {
      throw new Error('Voice search session already active');
    }
    
    // Check permissions
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      throw new Error('Microphone permission denied');
    }
    
    // Create new session
    this.currentSession = {
      id: `voice_session_${Date.now()}`,
      userId,
      startTime: Date.now(),
      queries: [],
      totalDuration: 0,
      successRate: 0,
      averageConfidence: 0,
      commandsUsed: [],
      errors: []
    };
    
    this.emit('sessionStart', this.currentSession);
    return this.currentSession.id;
  }
  
  /**
   * End voice search session
   */
  async endSession(): Promise<VoiceSearchSession | null> {
    if (!this.currentSession) {
      return null;
    }
    
    // Stop listening if active
    if (this.isListening) {
      this.stopListening();
    }
    
    // Calculate session metrics
    const session = this.currentSession;
    session.endTime = Date.now();
    session.totalDuration = session.endTime - session.startTime;
    
    if (session.queries.length > 0) {
      const successfulQueries = session.queries.filter(q => q.success).length;
      session.successRate = successfulQueries / session.queries.length;
      
      const totalConfidence = session.queries.reduce((sum, q) => sum + q.confidence, 0);
      session.averageConfidence = totalConfidence / session.queries.length;
    }
    
    // Save session to database
    await this.saveSession(session);
    
    const completedSession = { ...session };
    this.currentSession = null;
    
    this.emit('sessionEnd', completedSession);
    return completedSession;
  }
  
  /**
   * Start listening for voice input
   */
  async startListening(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }
    
    if (this.isListening) {
      return;
    }
    
    try {
      this.recognition.start();
      
      // Set timeout if configured
      if (this.options.timeout) {
        setTimeout(() => {
          if (this.isListening) {
            this.stopListening();
          }
        }, this.options.timeout);
      }
    } catch (error) {
      throw new Error(`Failed to start voice recognition: ${error}`);
    }
  }
  
  /**
   * Stop listening for voice input
   */
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
    
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }
  
  /**
   * Handle speech recognition result
   */
  private async handleRecognitionResult(event: SpeechRecognitionEvent): Promise<void> {
    const result = event.results[event.resultIndex];
    const transcript = result[0].transcript.trim();
    const confidence = result[0].confidence;
    const isFinal = result.isFinal;
    
    // Get alternatives
    const alternatives: Array<{ transcript: string; confidence: number }> = [];
    for (let i = 0; i < result.length; i++) {
      alternatives.push({
        transcript: result[i].transcript.trim(),
        confidence: result[i].confidence
      });
    }
    
    const recognitionResult: VoiceRecognitionResult = {
      transcript,
      confidence,
      alternatives,
      isFinal,
      timestamp: Date.now()
    };
    
    this.emit('recognition', recognitionResult);
    
    // Process final results
    if (isFinal && confidence >= this.options.confidenceThreshold!) {
      await this.processVoiceInput(transcript, confidence, alternatives.map(a => a.transcript));
    }
    
    // Handle silence detection for auto-stop
    if (this.options.autoStop && isFinal) {
      this.silenceTimer = setTimeout(() => {
        this.stopListening();
      }, 2000); // Stop after 2 seconds of silence
    }
  }
  
  /**
   * Handle speech recognition error
   */
  private handleRecognitionError(event: SpeechRecognitionErrorEvent): void {
    const error: VoiceError = {
      type: this.mapErrorType(event.error),
      message: event.error,
      timestamp: Date.now(),
      context: { event: event.error }
    };
    
    if (this.currentSession) {
      this.currentSession.errors.push(error);
    }
    
    this.emit('error', error);
  }
  
  /**
   * Map speech recognition error to our error types
   */
  private mapErrorType(error: string): VoiceError['type'] {
    switch (error) {
      case 'network':
        return 'network';
      case 'not-allowed':
      case 'service-not-allowed':
        return 'permission';
      case 'aborted':
      case 'audio-capture':
        return 'recognition';
      default:
        return 'processing';
    }
  }
  
  /**
   * Process voice input (transcript)
   */
  private async processVoiceInput(
    transcript: string,
    confidence: number,
    alternatives: string[]
  ): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active voice search session');
    }
    
    this.isProcessing = true;
    const startTime = Date.now();
    
    try {
      // Create voice query
      const query: VoiceQuery = {
        id: `voice_query_${Date.now()}`,
        sessionId: this.currentSession.id,
        transcript,
        confidence,
        alternatives,
        processedQuery: transcript,
        timestamp: startTime,
        duration: 0,
        success: false
      };
      
      // Check for voice commands first
      const command = this.detectCommand(transcript);
      if (command) {
        query.command = command;
        await this.executeCommand(command, transcript, query);
      } else {
        // Process as search query
        await this.executeSearch(transcript, query);
      }
      
      // Update query duration and success
      query.duration = Date.now() - startTime;
      query.success = !query.errorMessage;
      
      // Add to session
      this.currentSession.queries.push(query);
      
      this.emit('queryProcessed', query);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const query: VoiceQuery = {
        id: `voice_query_${Date.now()}`,
        sessionId: this.currentSession.id,
        transcript,
        confidence,
        alternatives,
        processedQuery: transcript,
        timestamp: startTime,
        duration: Date.now() - startTime,
        success: false,
        errorMessage
      };
      
      this.currentSession.queries.push(query);
      this.emit('queryError', { query, error: errorMessage });
    } finally {
      this.isProcessing = false;
    }
  }
  
  /**
   * Detect voice command in transcript
   */
  private detectCommand(transcript: string): VoiceCommand | null {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    for (const command of this.commands.values()) {
      for (const pattern of command.patterns) {
        if (normalizedTranscript.includes(pattern.toLowerCase())) {
          return command;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Execute voice command
   */
  private async executeCommand(
    command: VoiceCommand,
    transcript: string,
    query: VoiceQuery
  ): Promise<void> {
    // Track command usage
    if (this.currentSession && !this.currentSession.commandsUsed.includes(command.id)) {
      this.currentSession.commandsUsed.push(command.id);
    }
    
    switch (command.action) {
      case 'search':
        // Extract search terms after command pattern
        const searchTerms = this.extractSearchTerms(transcript, command.patterns);
        if (searchTerms) {
          query.processedQuery = searchTerms;
          await this.executeSearch(searchTerms, query, command.parameters);
        }
        break;
        
      case 'filter':
        this.emit('filterCommand', { command, transcript, parameters: command.parameters });
        break;
        
      case 'clear':
        this.emit('clearCommand', { command });
        break;
        
      case 'help':
        this.emit('helpCommand', { commands: Array.from(this.commands.values()) });
        break;
        
      case 'stop':
        this.stopListening();
        break;
        
      default:
        this.emit('customCommand', { command, transcript });
    }
  }
  
  /**
   * Extract search terms from transcript after removing command patterns
   */
  private extractSearchTerms(transcript: string, patterns: string[]): string | null {
    const normalizedTranscript = transcript.toLowerCase();
    
    for (const pattern of patterns) {
      const patternIndex = normalizedTranscript.indexOf(pattern.toLowerCase());
      if (patternIndex !== -1) {
        const searchTerms = transcript
          .substring(patternIndex + pattern.length)
          .trim();
        
        if (searchTerms.length > 0) {
          return searchTerms;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Execute search with voice input
   */
  private async executeSearch(
    searchQuery: string,
    query: VoiceQuery,
    parameters?: Record<string, any>
  ): Promise<void> {
    try {
      // Process with NLP
      const nlpResults = await nlpEngine.processQuery(searchQuery);
      query.nlpResults = nlpResults;
      
      // Perform comprehensive search
      const searchOptions = {
        query: searchQuery,
        nlpResults,
        dataTypes: parameters?.type ? [parameters.type] : undefined,
        limit: 10,
        includeHighlights: true,
        includeRelated: true
      };
      
      const searchResults = await comprehensiveSearch.search(searchOptions);
      query.searchResults = searchResults;
      
      this.emit('searchResults', { query, results: searchResults });
    } catch (error) {
      query.errorMessage = error instanceof Error ? error.message : 'Search failed';
      throw error;
    }
  }
  
  /**
   * Add custom voice command
   */
  addCommand(command: VoiceCommand): void {
    this.commands.set(command.id, command);
  }
  
  /**
   * Remove voice command
   */
  removeCommand(commandId: string): boolean {
    return this.commands.delete(commandId);
  }
  
  /**
   * Get all available commands
   */
  getCommands(): VoiceCommand[] {
    return Array.from(this.commands.values());
  }
  
  /**
   * Get commands by category
   */
  getCommandsByCategory(category: VoiceCommand['category']): VoiceCommand[] {
    return Array.from(this.commands.values()).filter(cmd => cmd.category === category);
  }
  
  /**
   * Check if speech recognition is supported
   */
  isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
  
  /**
   * Check if currently listening
   */
  getIsListening(): boolean {
    return this.isListening;
  }
  
  /**
   * Check if currently processing
   */
  getIsProcessing(): boolean {
    return this.isProcessing;
  }
  
  /**
   * Get current session
   */
  getCurrentSession(): VoiceSearchSession | null {
    return this.currentSession;
  }
  
  /**
   * Save session to database
   */
  private async saveSession(session: VoiceSearchSession): Promise<void> {
    try {
      // This would typically save to Supabase
      // Implementation depends on your database schema
      console.log('Saving voice search session:', session.id);
    } catch (error) {
      console.error('Failed to save voice search session:', error);
    }
  }
  
  /**
   * Get voice search analytics
   */
  async getAnalytics(userId?: string, dateRange?: { start: Date; end: Date }): Promise<VoiceSearchAnalytics> {
    // This would typically query from Supabase
    // Placeholder implementation
    return {
      totalSessions: 0,
      totalQueries: 0,
      averageSessionDuration: 0,
      successRate: 0,
      mostUsedCommands: [],
      languageDistribution: {},
      errorDistribution: {},
      confidenceDistribution: {
        high: 0,
        medium: 0,
        low: 0
      }
    };
  }
  
  /**
   * Event system
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }
  
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopListening();
    
    if (this.currentSession) {
      this.endSession();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.eventListeners.clear();
    this.commands.clear();
  }
}

// Create and export singleton instance
export const voiceSearch = new VoiceSearch();

// Type declarations for browser APIs
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};
