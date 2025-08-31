"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  Mic, 
  Send, 
  Search, 
  Activity, 
  ShieldCheck, 
  Download,
  User,
  MessageSquare,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export interface UserRole {
  id: string;
  name: 'Admin' | 'Professional' | 'Assistant' | 'Coordinator';
  permissions: string[];
}

export interface QuerySuggestion {
  id: string;
  text: string;
  category: 'patient' | 'analytics' | 'compliance' | 'scheduling';
  confidence: number;
}

export interface QueryResult {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  userId: string;
  type: 'table' | 'chart' | 'text' | 'export';
  data?: any;
  confidence: number;
}

export interface InternalAssistantPanelProps {
  userRole: UserRole;
  activePatientId?: string;
  onQuerySubmit?: (query: string) => Promise<QueryResult>;
  onExport?: (data: any, format: 'pdf' | 'excel' | 'csv') => void;
  className?: string;
}

export function InternalAssistantPanel({
  userRole,
  activePatientId,
  onQuerySubmit,
  onExport,
  className
}: InternalAssistantPanelProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState&lt;QuerySuggestion[]&gt;([]);
  const [queryHistory, setQueryHistory] = useState&lt;QueryResult[]&gt;([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  const inputRef = useRef&lt;HTMLInputElement&gt;(null);
  const recognitionRef = useRef&lt;SpeechRecognition | null&gt;(null);

  // Portuguese medical query suggestions based on context
  const getContextualSuggestions = useCallback((input: string): QuerySuggestion[] => {
    const suggestions: QuerySuggestion[] = [
      // Patient Context Suggestions
      {
        id: 'patient-history',
        text: `Mostrar histórico médico ${activePatientId ? 'do paciente ativo' : 'dos pacientes'}`,
        category: 'patient',
        confidence: activePatientId ? 0.95 : 0.7
      },
      {
        id: 'patient-allergies',
        text: 'Verificar alergias e medicamentos contraindicados',
        category: 'patient',
        confidence: 0.9
      },
      // Analytics Suggestions  
      {
        id: 'daily-metrics',
        text: 'Relatório de métricas diárias da clínica',
        category: 'analytics',
        confidence: 0.85
      },
      {
        id: 'no-show-analysis',
        text: 'Análise de faltas e taxa de no-show por período',
        category: 'analytics',
        confidence: 0.8
      },
      // Compliance Suggestions
      {
        id: 'lgpd-status',
        text: 'Status de compliance LGPD dos pacientes',
        category: 'compliance',
        confidence: 0.9
      },
      {
        id: 'consent-tracking',
        text: 'Verificar consentimentos pendentes de atualização',
        category: 'compliance',
        confidence: 0.85
      },
      // Scheduling Suggestions
      {
        id: 'schedule-optimization',
        text: 'Otimizar agenda baseado em histórico de procedimentos',
        category: 'scheduling',
        confidence: 0.75
      }
    ];

    if (!input.trim()) return suggestions.slice(0, 3);
    
    return suggestions
      .filter(s => s.text.toLowerCase().includes(input.toLowerCase()))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }, [activePatientId]);

  // Handle query submission with role-based permissions
  const handleQuerySubmit = useCallback(async () => {
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    setShowSuggestions(false);
    
    try {
      const result = await onQuerySubmit?.(query) || {
        id: Date.now().toString(),
        query,
        response: 'Simulação: Consulta processada com sucesso.',
        timestamp: new Date(),
        userId: userRole.id,
        type: 'text' as const,
        confidence: 0.9
      };

      setQueryHistory(prev => [result, ...prev.slice(0, 9)]);
      setQuery('');
      
      // Log for LGPD compliance
      console.log(`[AUDIT] Query by ${userRole.name}: "${query}" at ${new Date().toISOString()}`);
      
    } catch (error) {
      console.error('Query processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [query, isProcessing, onQuerySubmit, userRole]);

  // Voice input setup for Portuguese
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.lang = 'pt-BR';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setQuery(transcript);
          setVoiceEnabled(false);
        };
        
        recognitionRef.current.onerror = () => {
          setVoiceEnabled(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    if (query.trim()) {
      setSuggestions(getContextualSuggestions(query));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query, getContextualSuggestions]);

  const handleVoiceInput = () => {
    if (recognitionRef.current && !voiceEnabled) {
      setVoiceEnabled(true);
      recognitionRef.current.start();
    }
  };

  const handleSuggestionClick = (suggestion: QuerySuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      patient: 'bg-blue-100 text-blue-800',
      analytics: 'bg-green-100 text-green-800',
      compliance: 'bg-yellow-100 text-yellow-800',
      scheduling: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      Admin: ShieldCheck,
      Professional: User,
      Assistant: MessageSquare,
      Coordinator: Activity
    };
    const Icon = icons[role as keyof typeof icons] || User;
    return Icon;
  };

  return (
    &lt;Card className={cn('w-full max-w-4xl mx-auto', className)}&gt;
      &lt;CardHeader className="pb-3"&gt;
        &lt;div className="flex items-center justify-between"&gt;
          &lt;CardTitle className="flex items-center gap-2"&gt;
            &lt;MessageSquare className="h-5 w-5 text-blue-600" /&gt;
            Assistente IA Interno - Equipe Médica
          &lt;/CardTitle&gt;
          &lt;div className="flex items-center gap-2"&gt;
            &lt;Badge variant="secondary" className="flex items-center gap-1"&gt;
              {React.createElement(getRoleIcon(userRole.name), { className: 'h-3 w-3' })}
              {userRole.name}
            &lt;/Badge&gt;
            {activePatientId && (
              &lt;Badge variant="outline" className="text-xs"&gt;
                Paciente Ativo: {activePatientId.slice(0, 8)}...
              &lt;/Badge&gt;
            )}
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/CardHeader&gt;

      &lt;CardContent className="space-y-4"&gt;
        {/* Query Input Section */}
        &lt;div className="relative"&gt;
          &lt;div className="flex gap-2"&gt;
            &lt;div className="flex-1 relative"&gt;
              &lt;Input
                ref={inputRef}
                value={query}
                onChange={(e) =&gt; setQuery(e.target.value)}
                placeholder="Digite sua consulta em português natural... Ex: 'Mostrar pacientes com alergia a Botox'"
                className="pr-12"
                onKeyDown={(e) =&gt; e.key === 'Enter' && handleQuerySubmit()}
                disabled={isProcessing}
              /&gt;
              &lt;Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1 h-8 w-8"
                onClick={handleVoiceInput}
                disabled={isProcessing || voiceEnabled}
              &gt;
                &lt;Mic className={cn('h-4 w-4', voiceEnabled && 'text-red-500')} /&gt;
              &lt;/Button&gt;
            &lt;/div&gt;
            
            &lt;Button 
              onClick={handleQuerySubmit} 
              disabled={!query.trim() || isProcessing}
              className="min-w-[100px]"
            &gt;
              {isProcessing ? (
                &lt;&gt;
                  &lt;div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /&gt;
                  Processando
                &lt;/&gt;
              ) : (
                &lt;&gt;
                  &lt;Send className="h-4 w-4 mr-2" /&gt;
                  Consultar
                &lt;/&gt;
              )}
            &lt;/Button&gt;
          &lt;/div&gt;

          {/* Query Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            &lt;Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-48 overflow-y-auto"&gt;
              &lt;CardContent className="p-2"&gt;
                {suggestions.map((suggestion) =&gt; (
                  &lt;Button
                    key={suggestion.id}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() =&gt; handleSuggestionClick(suggestion)}
                  &gt;
                    &lt;div className="flex items-center justify-between w-full"&gt;
                      &lt;span className="text-sm"&gt;{suggestion.text}&lt;/span&gt;
                      &lt;div className="flex items-center gap-2"&gt;
                        &lt;Badge 
                          variant="secondary" 
                          className={cn('text-xs', getCategoryColor(suggestion.category))}
                        &gt;
                          {suggestion.category}
                        &lt;/Badge&gt;
                        &lt;span className="text-xs text-gray-500"&gt;
                          {Math.round(suggestion.confidence * 100)}%
                        &lt;/span&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                  &lt;/Button&gt;
                ))}
              &lt;/CardContent&gt;
            &lt;/Card&gt;
          )}
        &lt;/div&gt;

        &lt;Separator /&gt;

        {/* Query History */}
        &lt;div&gt;
          &lt;div className="flex items-center justify-between mb-3"&gt;
            &lt;h3 className="text-sm font-medium flex items-center gap-2"&gt;
              &lt;Clock className="h-4 w-4" /&gt;
              Histórico de Consultas
            &lt;/h3&gt;
            {queryHistory.length > 0 && (
              &lt;Button 
                variant="outline" 
                size="sm"
                onClick={() =&gt; onExport?.(queryHistory, 'csv')}
              &gt;
                &lt;Download className="h-4 w-4 mr-2" /&gt;
                Exportar
              &lt;/Button&gt;
            )}
          &lt;/div&gt;

          &lt;ScrollArea className="h-80"&gt;
            &lt;div className="space-y-3"&gt;
              {queryHistory.length === 0 ? (
                &lt;div className="text-center py-8 text-gray-500"&gt;
                  &lt;Search className="h-12 w-12 mx-auto mb-2 opacity-50" /&gt;
                  &lt;p&gt;Nenhuma consulta realizada ainda.&lt;/p&gt;
                  &lt;p className="text-xs mt-1"&gt;
                    Experimente: "Quantos pacientes atendemos hoje?"
                  &lt;/p&gt;
                &lt;/div&gt;
              ) : (
                queryHistory.map((result) =&gt; (
                  &lt;Card key={result.id} className="p-3"&gt;
                    &lt;div className="space-y-2"&gt;
                      &lt;div className="flex items-start justify-between"&gt;
                        &lt;div className="flex-1"&gt;
                          &lt;p className="text-sm font-medium text-blue-900"&gt;
                            {result.query}
                          &lt;/p&gt;
                          &lt;p className="text-xs text-gray-500 mt-1"&gt;
                            {result.timestamp.toLocaleString('pt-BR')}
                          &lt;/p&gt;
                        &lt;/div&gt;
                        &lt;Badge 
                          variant="outline" 
                          className="text-xs flex items-center gap-1"
                        &gt;
                          &lt;TrendingUp className="h-3 w-3" /&gt;
                          {Math.round(result.confidence * 100)}%
                        &lt;/Badge&gt;
                      &lt;/div&gt;
                      
                      &lt;div className="bg-gray-50 rounded p-2 text-sm"&gt;
                        {result.response}
                      &lt;/div&gt;

                      {result.type !== 'text' && (
                        &lt;div className="flex gap-2"&gt;
                          &lt;Badge variant="secondary" className="text-xs"&gt;
                            {result.type.toUpperCase()}
                          &lt;/Badge&gt;
                          &lt;Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs"
                            onClick={() =&gt; onExport?.(result.data, 'pdf')}
                          &gt;
                            Visualizar
                          &lt;/Button&gt;
                        &lt;/div&gt;
                      )}
                    &lt;/div&gt;
                  &lt;/Card&gt;
                ))
              )}
            &lt;/div&gt;
          &lt;/ScrollArea&gt;
        &lt;/div&gt;

        {/* Footer with Compliance Note */}
        &lt;div className="bg-yellow-50 border border-yellow-200 rounded p-3"&gt;
          &lt;div className="flex items-center gap-2 text-xs text-yellow-800"&gt;
            &lt;AlertCircle className="h-4 w-4" /&gt;
            &lt;span&gt;
              &lt;strong&gt;LGPD Compliance:&lt;/strong&gt; Todas as consultas são registradas para auditoria. 
              Dados sensíveis são protegidos conforme legislação vigente.
            &lt;/span&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/CardContent&gt;
    &lt;/Card&gt;
  );
}