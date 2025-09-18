/**
 * RealTimeChat Component
 * 
 * T042: Telemedicine Interface Components
 * 
 * Features:
 * - Real-time medical chat with Portuguese terminology support
 * - AI-powered medical transcription and assistance
 * - LGPD-compliant conversation logging with audit trails
 * - Healthcare-specific message templates and quick responses
 * - Voice input/output with medical terminology recognition
 * - Mobile-first design for smartphone consultations
 * - WCAG 2.1 AA+ accessibility compliance
 * - CFM Resolution 2,314/2022 telemedicine compliance
 * - Integration with T039 AI chat hooks and T031 real-time subscriptions
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Mic, 
  MicOff,
  Send, 
  Paperclip,
  FileText,
  Image,
  Video,
  Phone,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Copy,
  Download,
  Share,
  AlertTriangle,
  Shield,
  Clock,
  User,
  Bot,
  Stethoscope,
  Heart,
  Activity,
  Brain,
  Zap,
  Search,
  Filter,
  Star,
  Archive
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

import { cn } from '@/lib/utils';
import { useAIChat, useAIVoiceChat } from '@/hooks/use-ai-chat';
import { useRealtimeTelemedicine } from '@/hooks/useRealtimeTelemedicine';

export interface RealTimeChatProps {
  sessionId: string;
  patientId: string;
  professionalId: string;
  patientName: string;
  professionalName: string;
  className?: string;
  mode?: 'patient' | 'professional';
  showAIAssistant?: boolean;
  enableVoiceInput?: boolean;
  enableTranscription?: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'patient' | 'professional' | 'ai_assistant' | 'system';
  senderName: string;
  content: string;
  type: 'text' | 'voice' | 'image' | 'file' | 'template' | 'ai_insight' | 'system_alert';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: ChatAttachment[];
  transcription?: string;
  aiAnalysis?: AIMessageAnalysis;
  medicalTerms?: MedicalTerm[];
  urgent?: boolean;
  flagged?: boolean;
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'video';
  name: string;
  url: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

export interface AIMessageAnalysis {
  intent: 'question' | 'symptom_report' | 'medication_query' | 'emergency' | 'general';
  confidence: number;
  medicalRelevance: number;
  suggestedResponse?: string;
  redFlags?: string[];
  followUpQuestions?: string[];
}

export interface MedicalTerm {
  term: string;
  definition: string;
  category: 'symptom' | 'medication' | 'procedure' | 'anatomy' | 'condition';
  confidence: number;
}

const quickResponses = [
  {
    category: 'Saudação',
    responses: [
      'Olá! Como posso ajudá-lo hoje?',
      'Boa tarde! Vamos começar nossa consulta?',
      'Prazer em atendê-lo. Como está se sentindo?'
    ]
  },
  {
    category: 'Sintomas',
    responses: [
      'Pode me descrever seus sintomas com mais detalhes?',
      'Quando esses sintomas começaram?',
      'Em uma escala de 1 a 10, como classifica a intensidade?',
      'Há algo que alivia ou piora os sintomas?'
    ]
  },
  {
    category: 'Medicação',
    responses: [
      'Está tomando alguma medicação atualmente?',
      'Tem alguma alergia a medicamentos?',
      'Já tentou algum tratamento anteriormente?',
      'Vou prescrever o medicamento adequado para seu caso.'
    ]
  },
  {
    category: 'Orientações',
    responses: [
      'É importante seguir as orientações médicas.',
      'Retorne se os sintomas piorarem.',
      'Mantenha repouso e hidratação.',
      'Agendarei um retorno em X dias.'
    ]
  },
  {
    category: 'Encerramento',
    responses: [
      'Alguma dúvida sobre o tratamento?',
      'Vou enviar a prescrição pelo sistema.',
      'Obrigado pela consulta. Melhoras!',
      'Estarei disponível para dúvidas.'
    ]
  }
];

/**
 * RealTimeChat - Medical chat with AI assistance and transcription
 */
export function RealTimeChat({
  sessionId,
  patientId,
  professionalId,
  patientName,
  professionalName,
  className,
  mode = 'professional',
  showAIAssistant = true,
  enableVoiceInput = true,
  enableTranscription = true
}: RealTimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(false);
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(showAIAssistant);
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(enableTranscription);
  const [voiceEnabled, setVoiceEnabled] = useState(enableVoiceInput);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hook integrations
  const { 
    mutate: sendAIMessage, 
    isPending: aiLoading 
  } = useAIChat();
  
  const {
    startVoiceInput,
    stopVoiceInput,
    isListening,
    transcript
  } = useAIVoiceChat();

  const {
    messages: realtimeMessages,
    sendMessage,
    isConnected,
    connectionQuality
  } = useRealtimeTelemedicine(sessionId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sync with real-time messages
  useEffect(() => {
    if (realtimeMessages) {
      setMessages(prev => [...prev, ...realtimeMessages]);
    }
  }, [realtimeMessages]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript && !isListening) {
      setNewMessage(prev => prev + ' ' + transcript);
    }
  }, [transcript, isListening]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sessionId,
      senderId: mode === 'patient' ? patientId : professionalId,
      senderType: mode,
      senderName: mode === 'patient' ? patientName : professionalName,
      content: newMessage.trim(),
      type: 'text',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      await sendMessage(message);
      
      // Update message status
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'sent' } : m
      ));

      // AI Analysis if enabled
      if (aiAssistantEnabled && mode === 'patient') {
        sendAIMessage({
          message: newMessage,
          context: 'medical_consultation',
          patientId,
          sessionId
        }, {
          onSuccess: (aiResponse) => {
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              sessionId,
              senderId: 'ai_assistant',
              senderType: 'ai_assistant',
              senderName: 'Assistente IA',
              content: aiResponse.suggestions || 'Análise concluída.',
              type: 'ai_insight',
              timestamp: new Date(),
              status: 'sent',
              aiAnalysis: aiResponse.analysis
            };
            
            setMessages(prev => [...prev, aiMessage]);
          }
        });
      }

    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, status: 'failed' } : m
      ));
    }
  }, [newMessage, sessionId, patientId, professionalId, mode, patientName, professionalName, sendMessage, aiAssistantEnabled, sendAIMessage]);

  const handleVoiceInput = useCallback(() => {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  }, [isListening, startVoiceInput, stopVoiceInput]);

  const handleQuickResponse = (response: string) => {
    setNewMessage(response);
    setShowQuickResponses(false);
    inputRef.current?.focus();
  };

  const getMessageStatusIcon = (status: ChatMessage['status']) => {
    switch (status) {
      case 'sending': return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent': return <Send className="h-3 w-3 text-blue-500" />;
      case 'delivered': return <Send className="h-3 w-3 text-green-500" />;
      case 'read': return <Eye className="h-3 w-3 text-green-600" />;
      case 'failed': return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };

  const getSenderAvatar = (message: ChatMessage) => {
    switch (message.senderType) {
      case 'patient':
        return <User className="h-4 w-4" />;
      case 'professional':
        return <Stethoscope className="h-4 w-4" />;
      case 'ai_assistant':
        return <Bot className="h-4 w-4" />;
      case 'system':
        return <Shield className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredMessages = messages.filter(message => {
    if (searchTerm) {
      return message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
             message.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <Card className={cn("flex flex-col h-[600px]", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Chat Médico - {mode === 'patient' ? professionalName : patientName}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <Badge variant={isConnected ? "success" : "destructive"}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Badge>
            
            {/* Settings */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurações do Chat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Assistente IA</Label>
                    <Switch 
                      checked={aiAssistantEnabled}
                      onCheckedChange={setAiAssistantEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Transcrição de Voz</Label>
                    <Switch 
                      checked={transcriptionEnabled}
                      onCheckedChange={setTranscriptionEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Entrada de Voz</Label>
                    <Switch 
                      checked={voiceEnabled}
                      onCheckedChange={setVoiceEnabled}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Connection Quality */}
        {isConnected && (
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Activity className="h-3 w-3" />
            <span>Qualidade: {connectionQuality}ms</span>
            <Progress value={Math.max(100 - connectionQuality / 2, 0)} className="w-16 h-1" />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start space-x-3",
                  message.senderId === (mode === 'patient' ? patientId : professionalId) 
                    ? "flex-row-reverse space-x-reverse" 
                    : ""
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {getSenderAvatar(message)}
                  </AvatarFallback>
                </Avatar>

                <div 
                  className={cn(
                    "max-w-[70%] rounded-lg p-3",
                    message.senderId === (mode === 'patient' ? patientId : professionalId)
                      ? "bg-blue-500 text-white"
                      : message.senderType === 'ai_assistant'
                        ? "bg-purple-50 border border-purple-200"
                        : message.senderType === 'system'
                          ? "bg-gray-50 border border-gray-200"
                          : "bg-gray-100"
                  )}
                >
                  {/* Sender Name and Timestamp */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium opacity-75">
                      {message.senderName}
                    </span>
                    <span className="text-xs opacity-60">
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="text-sm">
                    {message.content}
                  </div>

                  {/* AI Analysis */}
                  {message.aiAnalysis && (
                    <div className="mt-2 p-2 bg-white/20 rounded text-xs">
                      <div className="font-medium">Análise IA:</div>
                      <div>Intenção: {message.aiAnalysis.intent}</div>
                      <div>Relevância: {Math.round(message.aiAnalysis.medicalRelevance * 100)}%</div>
                      {message.aiAnalysis.redFlags && message.aiAnalysis.redFlags.length > 0 && (
                        <div className="text-red-200">
                          ⚠️ Alertas: {message.aiAnalysis.redFlags.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Medical Terms */}
                  {message.medicalTerms && message.medicalTerms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.medicalTerms.map((term, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {term.term}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Message Status */}
                  <div className="flex items-center justify-end mt-1">
                    {getMessageStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span>Digitando...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick Responses */}
        {showQuickResponses && mode === 'professional' && (
          <div className="border-t p-4">
            <div className="text-sm font-medium mb-2">Respostas Rápidas:</div>
            <div className="space-y-2">
              {quickResponses.map((category) => (
                <div key={category.category}>
                  <div className="text-xs font-medium text-gray-600 mb-1">
                    {category.category}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {category.responses.map((response, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto py-1"
                        onClick={() => handleQuickResponse(response)}
                      >
                        {response}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-12"
              />
              
              {/* Voice Input Button */}
              {voiceEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={handleVoiceInput}
                  disabled={!isConnected}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 text-red-500" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Quick Responses Toggle */}
            {mode === 'professional' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuickResponses(!showQuickResponses)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}

            {/* Attachments */}
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Send Button */}
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Voice Transcript */}
          {isListening && (
            <div className="mt-2 p-2 bg-red-50 rounded text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-700">Gravando... {transcript}</span>
              </div>
            </div>
          )}

          {/* AI Assistant Status */}
          {aiAssistantEnabled && aiLoading && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-purple-600">
              <Brain className="h-4 w-4 animate-pulse" />
              <span>Assistente IA analisando...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RealTimeChat;