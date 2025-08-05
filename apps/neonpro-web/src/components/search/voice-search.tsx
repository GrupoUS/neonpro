/**
 * Voice Search Component
 * Story 3.4: Smart Search + NLP Integration - Task 5
 * Voice search interface with speech recognition and visual feedback
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Loader2,
  CheckCircle,
  XCircle,
  Brain,
  Zap,
  Clock,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Settings,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  voiceSearch,
  type VoiceSearchOptions,
  type VoiceRecognitionResult,
  type VoiceQuery,
  type VoiceCommand,
  type VoiceError,
  type VoiceSearchSession
} from '@/lib/search/voice-search';
import type { ComprehensiveSearchResponse } from '@/lib/search/comprehensive-search';

interface VoiceSearchProps {
  onSearchResults?: (results: ComprehensiveSearchResponse) => void;
  onTranscriptChange?: (transcript: string) => void;
  onError?: (error: VoiceError) => void;
  className?: string;
  options?: Partial<VoiceSearchOptions>;
  showCommands?: boolean;
  showAnalytics?: boolean;
  autoStart?: boolean;
  userId?: string;
}

export function VoiceSearch({
  onSearchResults,
  onTranscriptChange,
  onError,
  className,
  options = {},
  showCommands = true,
  showAnalytics = false,
  autoStart = false,
  userId
}: VoiceSearchProps) {
  // State
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [session, setSession] = useState<VoiceSearchSession | null>(null);
  const [queries, setQueries] = useState<VoiceQuery[]>([]);
  const [errors, setErrors] = useState<VoiceError[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  
  // Refs
  const audioLevelRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  // Initialize voice search
  useEffect(() => {
    setIsSupported(voiceSearch.isSupported());
    setCommands(voiceSearch.getCommands());
    
    // Check microphone permission
    checkMicrophonePermission();
    
    // Setup event listeners
    const handleStart = () => {
      setIsListening(true);
      setErrors([]);
    };
    
    const handleEnd = () => {
      setIsListening(false);
      setInterimTranscript('');
      setAudioLevel(0);
    };
    
    const handleRecognition = (result: VoiceRecognitionResult) => {
      if (result.isFinal) {
        setCurrentTranscript(result.transcript);
        setInterimTranscript('');
        setConfidence(result.confidence);
        
        if (onTranscriptChange) {
          onTranscriptChange(result.transcript);
        }
      } else {
        setInterimTranscript(result.transcript);
      }
    };
    
    const handleQueryProcessed = (query: VoiceQuery) => {
      setQueries(prev => [...prev, query]);
      setIsProcessing(false);
      
      if (query.searchResults && onSearchResults) {
        onSearchResults(query.searchResults);
      }
    };
    
    const handleQueryError = ({ query, error }: { query: VoiceQuery; error: string }) => {
      setQueries(prev => [...prev, query]);
      setIsProcessing(false);
      
      const voiceError: VoiceError = {
        type: 'processing',
        message: error,
        timestamp: Date.now()
      };
      
      setErrors(prev => [...prev, voiceError]);
      
      if (onError) {
        onError(voiceError);
      }
    };
    
    const handleError = (error: VoiceError) => {
      setErrors(prev => [...prev, error]);
      setIsListening(false);
      setIsProcessing(false);
      
      if (onError) {
        onError(error);
      }
    };
    
    const handleSessionStart = (newSession: VoiceSearchSession) => {
      setSession(newSession);
      setQueries([]);
      setErrors([]);
    };
    
    const handleSessionEnd = (endedSession: VoiceSearchSession) => {
      setSession(null);
    };
    
    const handleSearchResults = ({ results }: { results: ComprehensiveSearchResponse }) => {
      setIsProcessing(false);
      
      if (onSearchResults) {
        onSearchResults(results);
      }
    };
    
    const handleHelpCommand = ({ commands }: { commands: VoiceCommand[] }) => {
      setShowHelp(true);
    };
    
    // Register event listeners
    voiceSearch.on('start', handleStart);
    voiceSearch.on('end', handleEnd);
    voiceSearch.on('recognition', handleRecognition);
    voiceSearch.on('queryProcessed', handleQueryProcessed);
    voiceSearch.on('queryError', handleQueryError);
    voiceSearch.on('error', handleError);
    voiceSearch.on('sessionStart', handleSessionStart);
    voiceSearch.on('sessionEnd', handleSessionEnd);
    voiceSearch.on('searchResults', handleSearchResults);
    voiceSearch.on('helpCommand', handleHelpCommand);
    
    // Auto-start if requested
    if (autoStart && isSupported) {
      startVoiceSearch();
    }
    
    return () => {
      // Cleanup event listeners
      voiceSearch.off('start', handleStart);
      voiceSearch.off('end', handleEnd);
      voiceSearch.off('recognition', handleRecognition);
      voiceSearch.off('queryProcessed', handleQueryProcessed);
      voiceSearch.off('queryError', handleQueryError);
      voiceSearch.off('error', handleError);
      voiceSearch.off('sessionStart', handleSessionStart);
      voiceSearch.off('sessionEnd', handleSessionEnd);
      voiceSearch.off('searchResults', handleSearchResults);
      voiceSearch.off('helpCommand', handleHelpCommand);
      
      // Stop listening
      if (isListening) {
        stopVoiceSearch();
      }
      
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [autoStart, isSupported, onSearchResults, onTranscriptChange, onError]);
  
  // Check microphone permission
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setPermissionGranted(false);
    }
  };
  
  // Start voice search
  const startVoiceSearch = async () => {
    if (!isSupported) {
      const error: VoiceError = {
        type: 'recognition',
        message: 'Reconhecimento de voz não suportado neste navegador',
        timestamp: Date.now()
      };
      setErrors(prev => [...prev, error]);
      return;
    }
    
    if (!permissionGranted) {
      await checkMicrophonePermission();
      if (!permissionGranted) {
        const error: VoiceError = {
          type: 'permission',
          message: 'Permissão de microfone negada',
          timestamp: Date.now()
        };
        setErrors(prev => [...prev, error]);
        return;
      }
    }
    
    try {
      // Start session if not already active
      if (!session) {
        await voiceSearch.startSession(userId);
      }
      
      // Start listening
      await voiceSearch.startListening();
      setIsProcessing(true);
    } catch (error) {
      const voiceError: VoiceError = {
        type: 'recognition',
        message: error instanceof Error ? error.message : 'Falha ao iniciar reconhecimento de voz',
        timestamp: Date.now()
      };
      setErrors(prev => [...prev, voiceError]);
    }
  };
  
  // Stop voice search
  const stopVoiceSearch = () => {
    voiceSearch.stopListening();
    setIsProcessing(false);
  };
  
  // End session
  const endSession = async () => {
    await voiceSearch.endSession();
  };
  
  // Get status color
  const getStatusColor = () => {
    if (errors.length > 0) return 'text-red-500';
    if (isListening) return 'text-green-500';
    if (isProcessing) return 'text-blue-500';
    return 'text-gray-500';
  };
  
  // Get status text
  const getStatusText = () => {
    if (errors.length > 0) return 'Erro';
    if (isListening) return 'Escutando...';
    if (isProcessing) return 'Processando...';
    return 'Pronto';
  };
  
  // Get confidence color
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600';
    if (conf >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Format duration
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };
  
  if (!isSupported) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="pt-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Reconhecimento de voz não é suportado neste navegador.
              Tente usar Chrome, Edge ou Safari mais recentes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Voice Control */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Busca por Voz
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Badge variant={isListening ? 'default' : 'secondary'} className={getStatusColor()}>
                {getStatusText()}
              </Badge>
              
              {session && (
                <Badge variant="outline">
                  {queries.length} consultas
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant={isListening ? 'destructive' : 'default'}
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              disabled={isProcessing}
              className="h-16 w-16 rounded-full"
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isListening ? (
                <Square className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            
            {session && (
              <Button
                variant="outline"
                onClick={endSession}
                disabled={isListening || isProcessing}
              >
                Finalizar Sessão
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Comandos
            </Button>
          </div>
          
          {/* Audio Level Indicator */}
          {isListening && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nível de Áudio</span>
                <span className={cn("font-medium", audioLevel > 50 ? 'text-green-600' : 'text-gray-500')}>
                  {Math.round(audioLevel)}%
                </span>
              </div>
              <Progress value={audioLevel} className="h-2" />
            </div>
          )}
          
          {/* Transcript Display */}
          <div className="space-y-2">
            {(currentTranscript || interimTranscript) && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {currentTranscript && (
                      <p className="text-sm font-medium">
                        {currentTranscript}
                      </p>
                    )}
                    
                    {interimTranscript && (
                      <p className="text-sm text-muted-foreground italic">
                        {interimTranscript}
                      </p>
                    )}
                  </div>
                  
                  {confidence > 0 && (
                    <Badge variant="outline" className={getConfidenceColor(confidence)}>
                      {Math.round(confidence * 100)}%
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {errors[errors.length - 1].message}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Permission Warning */}
          {!permissionGranted && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Permissão de microfone necessária para busca por voz.
                <Button
                  variant="link"
                  className="p-0 h-auto ml-2"
                  onClick={checkMicrophonePermission}
                >
                  Verificar permissão
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Voice Commands Help */}
      {showHelp && showCommands && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Comandos de Voz Disponíveis
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-4">
                {Object.entries(
                  commands.reduce((groups, cmd) => {
                    if (!groups[cmd.category]) groups[cmd.category] = [];
                    groups[cmd.category].push(cmd);
                    return groups;
                  }, {} as Record<string, VoiceCommand[]>)
                ).map(([category, categoryCommands]) => (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      {category === 'search' ? 'Busca' :
                       category === 'filter' ? 'Filtros' :
                       category === 'action' ? 'Ações' :
                       category === 'system' ? 'Sistema' : category}
                    </h4>
                    
                    <div className="space-y-2">
                      {categoryCommands.map(command => (
                        <div key={command.id} className="p-2 bg-muted/50 rounded">
                          <div className="font-medium text-sm">{command.description}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Exemplos: {command.examples.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Session Analytics */}
      {showAnalytics && session && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas da Sessão
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{queries.length}</div>
                <div className="text-sm text-muted-foreground">Consultas</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {queries.filter(q => q.success).length}
                </div>
                <div className="text-sm text-muted-foreground">Sucessos</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {session.totalDuration > 0 ? formatDuration(Date.now() - session.startTime) : '0:00'}
                </div>
                <div className="text-sm text-muted-foreground">Duração</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {queries.length > 0 ? Math.round(
                    queries.reduce((sum, q) => sum + q.confidence, 0) / queries.length * 100
                  ) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Confiança Média</div>
              </div>
            </div>
            
            {/* Recent Queries */}
            {queries.length > 0 && (
              <div className="mt-4">
                <Separator className="mb-3" />
                <h4 className="font-medium text-sm mb-2">Consultas Recentes</h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {queries.slice(-5).reverse().map(query => (
                      <div key={query.id} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{query.transcript}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="outline" className={getConfidenceColor(query.confidence)}>
                            {Math.round(query.confidence * 100)}%
                          </Badge>
                          {query.success ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Compact voice search button for integration into other components
export function VoiceSearchButton({
  onTranscript,
  onResults,
  className,
  size = 'default'
}: {
  onTranscript?: (transcript: string) => void;
  onResults?: (results: ComprehensiveSearchResponse) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(voiceSearch.isSupported());
  
  const handleClick = async () => {
    if (!isSupported) return;
    
    if (isListening) {
      voiceSearch.stopListening();
    } else {
      try {
        if (!voiceSearch.getCurrentSession()) {
          await voiceSearch.startSession();
        }
        await voiceSearch.startListening();
      } catch (error) {
        console.error('Voice search error:', error);
      }
    }
  };
  
  useEffect(() => {
    const handleStart = () => setIsListening(true);
    const handleEnd = () => setIsListening(false);
    const handleRecognition = (result: VoiceRecognitionResult) => {
      if (result.isFinal && onTranscript) {
        onTranscript(result.transcript);
      }
    };
    const handleSearchResults = ({ results }: { results: ComprehensiveSearchResponse }) => {
      if (onResults) {
        onResults(results);
      }
    };
    
    voiceSearch.on('start', handleStart);
    voiceSearch.on('end', handleEnd);
    voiceSearch.on('recognition', handleRecognition);
    voiceSearch.on('searchResults', handleSearchResults);
    
    return () => {
      voiceSearch.off('start', handleStart);
      voiceSearch.off('end', handleEnd);
      voiceSearch.off('recognition', handleRecognition);
      voiceSearch.off('searchResults', handleSearchResults);
    };
  }, [onTranscript, onResults]);
  
  if (!isSupported) {
    return null;
  }
  
  return (
    <Button
      variant={isListening ? 'destructive' : 'outline'}
      size={size}
      onClick={handleClick}
      className={cn(
        "transition-all duration-200",
        isListening && "animate-pulse",
        className
      )}
    >
      {isListening ? (
        <Square className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
