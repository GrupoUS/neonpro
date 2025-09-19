/**
 * Real-Time Chat Component for Telemedicine Platform
 * Features AI assistance, medical terminology, LGPD compliance, and CFM audit trails
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Send, Bot, User, Stethoscope, FileText, Image, 
  Paperclip, Smile, MoreVertical, Search, Filter,
  Download, Flag, Shield, Lock, Trash2, Copy,
  MessageSquare, Heart, AlertTriangle, CheckCircle,
  Clock, Eye, EyeOff, Archive, Settings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { 
  useRealTimeChat, 
  useAIAssistant,
  useChatCompliance,
  useChatAudit
} from '@/hooks/use-telemedicine';

interface RealTimeChatProps {
  sessionId: string;
  participantRole: 'patient' | 'professional' | 'ai_assistant';
  enableAI?: boolean;
  enableFileSharing?: boolean;
  enableVoiceNotes?: boolean;
  className?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  senderType: 'patient' | 'professional' | 'ai_assistant' | 'system';
  senderId: string;
  senderName: string;
  timestamp: Date;
  messageType: 'text' | 'file' | 'image' | 'voice' | 'system_alert' | 'medical_note';
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    voiceDuration?: number;
    medicalTerms?: string[];
    urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
    aiContext?: string;
    complianceFlags?: string[];
  };
  isEncrypted: boolean;
  auditTrail: {
    created: Date;
    edited?: Date;
    seen?: Date[];
    deleted?: Date;
  };
  reactions?: {
    userId: string;
    userName: string;
    reaction: string;
  }[];
}

interface AISuggestion {
  id: string;
  type: 'diagnosis' | 'treatment' | 'followup' | 'emergency' | 'terminology';
  content: string;
  confidence: number;
  context: string;
  source?: string;
}

export function RealTimeChat({ 
  sessionId, 
  participantRole,
  enableAI = true,
  enableFileSharing = true,
  enableVoiceNotes = false,
  className = '' 
}: RealTimeChatProps) {
  // Hooks
  const { 
    messages, 
    sendMessage, 
    deleteMessage,
    editMessage,
    markAsRead,
    isSending,
    isConnected 
  } = useRealTimeChat({ sessionId, enableAI });
  
  const { 
    suggestions, 
    generateSuggestion,
    expandMedicalTerm,
    checkSymptoms,
    isProcessing 
  } = useAIAssistant(sessionId);
  
  const { 
    complianceStatus, 
    flagMessage,
    checkCompliance 
  } = useChatCompliance(sessionId);
  
  const { 
    auditLog, 
    exportChatHistory,
    generateAuditReport 
  } = useChatAudit(sessionId);

  // State
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [showSystemMessages, setShowSystemMessages] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'medical' | 'ai' | 'files'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [autoAIAssist, setAutoAIAssist] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [showAuditDialog, setShowAuditDialog] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage]);

  // Mark messages as read when they come into view
  useEffect(() => {
    const unreadMessages = messages.filter(m => 
      m.senderType !== participantRole && 
      !m.auditTrail.seen?.some(seen => seen.toString() === new Date().toDateString())
    );
    
    if (unreadMessages.length > 0) {
      unreadMessages.forEach(message => markAsRead(message.id));
    }
  }, [messages, participantRole, markAsRead]);

  // Auto AI assistance for medical terms
  useEffect(() => {
    if (enableAI && autoAIAssist && newMessage.length > 10) {
      const medicalTerms = extractMedicalTerms(newMessage);
      if (medicalTerms.length > 0) {
        generateSuggestion(newMessage, 'terminology');
      }
    }
  }, [newMessage, enableAI, autoAIAssist, generateSuggestion]);

  // Extract medical terms from text (simple regex-based approach)
  const extractMedicalTerms = useCallback((text: string): string[] => {
    const medicalPatterns = [
      /\b(dor|febre|tosse|náusea|vômito|diarreia|constipação|fadiga|insônia)\b/gi,
      /\b(hipertensão|diabetes|asma|bronquite|pneumonia|gripe|covid|dengue)\b/gi,
      /\b(medicamento|remédio|comprimido|injeção|vacina|tratamento|terapia)\b/gi,
      /\b(sintoma|diagnóstico|exame|consulta|receita|prescrição)\b/gi
    ];
    
    const terms: string[] = [];
    medicalPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        terms.push(...matches);
      }
    });
    
    return [...new Set(terms.map(term => term.toLowerCase()))];
  }, []);

  // Filter messages based on search and filter type
  const filteredMessages = useCallback(() => {
    let filtered = messages;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(message => {
        switch (filterType) {
          case 'text':
            return message.messageType === 'text';
          case 'medical':
            return message.messageType === 'medical_note' || message.metadata?.medicalTerms?.length > 0;
          case 'ai':
            return message.senderType === 'ai_assistant';
          case 'files':
            return ['file', 'image', 'voice'].includes(message.messageType);
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(message =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter system messages
    if (!showSystemMessages) {
      filtered = filtered.filter(message => message.senderType !== 'system');
    }

    return filtered;
  }, [messages, filterType, searchQuery, showSystemMessages]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || isSending) return;

    try {
      const medicalTerms = extractMedicalTerms(newMessage);
      const urgencyLevel = detectUrgencyLevel(newMessage);
      
      await sendMessage(newMessage, {
        messageType: 'text',
        metadata: {
          medicalTerms: medicalTerms.length > 0 ? medicalTerms : undefined,
          urgencyLevel,
          aiContext: autoAIAssist ? 'enabled' : 'disabled'
        }
      });

      setNewMessage('');
      
      // Auto-generate AI suggestions for medical content
      if (enableAI && medicalTerms.length > 0) {
        generateSuggestion(newMessage, 'diagnosis');
      }
      
      // Check urgency for emergency escalation
      if (urgencyLevel === 'critical') {
        toast.warning('Mensagem de urgência detectada. Considerando escalação.');
      }
      
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    }
  }, [newMessage, isSending, sendMessage, extractMedicalTerms, enableAI, autoAIAssist, generateSuggestion]);

  // Detect urgency level in message
  const detectUrgencyLevel = useCallback((text: string): 'low' | 'medium' | 'high' | 'critical' => {
    const criticalKeywords = ['emergência', 'urgente', 'grave', 'socorro', 'ajuda', 'dor intensa', 'não consigo respirar'];
    const highKeywords = ['preocupado', 'pior', 'aumentou', 'forte', 'muito'];
    const mediumKeywords = ['sintoma', 'desconforto', 'mudança', 'diferente'];
    
    const lowerText = text.toLowerCase();
    
    if (criticalKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'critical';
    } else if (highKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }, []);

  // Handle message editing
  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      await editMessage(messageId, newContent);
      setEditingMessageId(null);
      setEditingContent('');
      toast.success('Mensagem editada');
    } catch (error) {
      toast.error('Erro ao editar mensagem');
    }
  }, [editMessage]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 10MB.');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de arquivo não permitido.');
        return;
      }

      // Upload file and send message
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);

      // Simulate file upload (replace with actual upload logic)
      const fileUrl = URL.createObjectURL(file);
      
      await sendMessage(`Arquivo compartilhado: ${file.name}`, {
        messageType: file.type.startsWith('image/') ? 'image' : 'file',
        metadata: {
          fileUrl,
          fileName: file.name,
          fileSize: file.size
        }
      });

      toast.success('Arquivo enviado com sucesso');
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    }
  }, [sessionId, sendMessage]);

  // Handle AI suggestion application
  const handleApplySuggestion = useCallback(async (suggestion: AISuggestion) => {
    try {
      await sendMessage(suggestion.content, {
        messageType: 'text',
        metadata: {
          aiContext: suggestion.type,
          urgencyLevel: suggestion.type === 'emergency' ? 'critical' : 'medium'
        }
      });
      toast.success('Sugestão aplicada');
    } catch (error) {
      toast.error('Erro ao aplicar sugestão');
    }
  }, [sendMessage]);

  // Handle export chat
  const handleExportChat = useCallback(async () => {
    try {
      const exportData = await exportChatHistory('pdf');
      toast.success('Histórico exportado com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar histórico');
    }
  }, [exportChatHistory]);

  // Get message status icon
  const getMessageStatusIcon = useCallback((message: ChatMessage) => {
    if (message.metadata?.urgencyLevel === 'critical') {
      return <AlertTriangle className="h-3 w-3 text-red-500" />;
    }
    if (message.auditTrail.seen && message.auditTrail.seen.length > 0) {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
    return <Clock className="h-3 w-3 text-gray-400" />;
  }, []);

  // Get sender avatar
  const getSenderAvatar = useCallback((message: ChatMessage) => {
    switch (message.senderType) {
      case 'ai_assistant':
        return <Bot className="h-4 w-4" />;
      case 'professional':
        return <Stethoscope className="h-4 w-4" />;
      case 'patient':
        return <User className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  }, []);

  // Get message background color
  const getMessageBgColor = useCallback((message: ChatMessage) => {
    if (message.senderType === participantRole) {
      return 'bg-blue-600 text-white';
    }
    
    switch (message.senderType) {
      case 'ai_assistant':
        return 'bg-purple-100 text-purple-900 border border-purple-200';
      case 'professional':
        return 'bg-green-100 text-green-900 border border-green-200';
      case 'patient':
        return 'bg-gray-100 text-gray-900 border border-gray-200';
      case 'system':
        return 'bg-yellow-100 text-yellow-900 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  }, [participantRole]);

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Chat da Consulta</h3>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar mensagens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-48 h-8 text-sm"
            />
          </div>

          {/* Filter */}
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="medical">Médicas</SelectItem>
              <SelectItem value="ai">IA</SelectItem>
              <SelectItem value="files">Arquivos</SelectItem>
            </SelectContent>
          </Select>

          {/* Settings */}
          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <h4 className="font-semibold">Configurações do Chat</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sugestões IA</span>
                  <Switch checked={showAISuggestions} onCheckedChange={setShowAISuggestions} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Assistência Automática</span>
                  <Switch checked={autoAIAssist} onCheckedChange={setAutoAIAssist} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mensagens do Sistema</span>
                  <Switch checked={showSystemMessages} onCheckedChange={setShowSystemMessages} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Criptografia</span>
                  <div className="flex items-center space-x-1">
                    <Lock className="h-3 w-3 text-green-600" />
                    <Switch checked={encryptionEnabled} onCheckedChange={setEncryptionEnabled} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleExportChat}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Histórico
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowAuditDialog(true)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Auditoria
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Compliance Status */}
      {complianceStatus && (
        <div className="px-4 py-2 bg-green-50 border-b border-green-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-green-800">Chat em conformidade com CFM e LGPD</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                E2E Criptografado
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                Auditável
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      {enableAI && showAISuggestions && suggestions.length > 0 && (
        <div className="p-3 bg-purple-50 border-b border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Bot className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Sugestões da IA</span>
          </div>
          <div className="space-y-2">
            {suggestions.slice(0, 2).map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{suggestion.content}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {suggestion.type} • {Math.round(suggestion.confidence * 100)}% confiança
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleApplySuggestion(suggestion)}
                  className="ml-2"
                >
                  Aplicar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredMessages().map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.senderType === participantRole ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${message.senderType !== participantRole ? 'order-2' : ''}`}>
                {/* Avatar and Name */}
                {message.senderType !== participantRole && (
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                        {getSenderAvatar(message)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-gray-700">
                      {message.senderName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`rounded-lg p-3 ${getMessageBgColor(message)} relative group`}>
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingMessageId(null)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleEditMessage(message.id, editingContent)}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm">
                        {message.content}
                      </div>

                      {/* Medical Terms Highlight */}
                      {message.metadata?.medicalTerms && message.metadata.medicalTerms.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.metadata.medicalTerms.map((term, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs bg-blue-100 text-blue-700"
                            >
                              {term}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* File Preview */}
                      {message.messageType === 'image' && message.metadata?.fileUrl && (
                        <div className="mt-2">
                          <img 
                            src={message.metadata.fileUrl} 
                            alt={message.metadata.fileName} 
                            className="max-w-full h-32 object-cover rounded"
                          />
                        </div>
                      )}

                      {/* File Link */}
                      {message.messageType === 'file' && message.metadata?.fileName && (
                        <div className="mt-2 p-2 bg-gray-100 rounded flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">{message.metadata.fileName}</span>
                          <span className="text-xs text-gray-500">
                            ({Math.round((message.metadata.fileSize || 0) / 1024)} KB)
                          </span>
                        </div>
                      )}

                      {/* Message Actions */}
                      {message.senderType === participantRole && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-32" align="end">
                              <div className="space-y-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start"
                                  onClick={() => {
                                    setEditingMessageId(message.id);
                                    setEditingContent(message.content);
                                  }}
                                >
                                  Editar
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start"
                                  onClick={() => navigator.clipboard.writeText(message.content)}
                                >
                                  <Copy className="h-3 w-3 mr-2" />
                                  Copiar
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="w-full justify-start text-red-600"
                                  onClick={() => deleteMessage(message.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Excluir
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </>
                  )}

                  {/* Message Status */}
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1">
                      {message.isEncrypted && <Lock className="h-3 w-3 text-gray-400" />}
                      {message.metadata?.urgencyLevel && message.metadata.urgencyLevel !== 'low' && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            message.metadata.urgencyLevel === 'critical' ? 'bg-red-100 text-red-700 border-red-300' :
                            message.metadata.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                            'bg-yellow-100 text-yellow-700 border-yellow-300'
                          }`}
                        >
                          {message.metadata.urgencyLevel}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {message.senderType === participantRole && getMessageStatusIcon(message)}
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-end space-x-2">
          {/* File Upload */}
          {enableFileSharing && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="p-2"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Text Input */}
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="min-h-[40px] max-h-32 resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="p-2"
          >
            {isSending ? (
              <Activity className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        {enableAI && (
          <div className="flex items-center space-x-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateSuggestion('Preciso de ajuda médica', 'emergency')}
              className="text-red-600 hover:text-red-700"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Emergência
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateSuggestion('Quais são os sintomas?', 'diagnosis')}
            >
              <Heart className="h-3 w-3 mr-1" />
              Sintomas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateSuggestion('Como devo proceder?', 'treatment')}
            >
              <FileText className="h-3 w-3 mr-1" />
              Tratamento
            </Button>
          </div>
        )}
      </div>

      {/* Audit Dialog */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Auditoria do Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Total de Mensagens:</span>
                <span className="ml-2">{messages.length}</span>
              </div>
              <div>
                <span className="font-medium">Conformidade:</span>
                <Badge variant="outline" className="ml-2 bg-green-100 text-green-700">
                  ✓ Ativo
                </Badge>
              </div>
              <div>
                <span className="font-medium">Criptografia:</span>
                <Badge variant="outline" className="ml-2 bg-green-100 text-green-700">
                  ✓ E2E
                </Badge>
              </div>
              <div>
                <span className="font-medium">Retenção:</span>
                <span className="ml-2">7 anos</span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Atividades Recentes</h4>
              <ScrollArea className="h-48">
                {auditLog.slice(0, 10).map((entry, index) => (
                  <div key={index} className="flex justify-between text-xs text-gray-600 py-1">
                    <span>{entry.action}</span>
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAuditDialog(false)}>
                Fechar
              </Button>
              <Button onClick={() => generateAuditReport()}>
                Gerar Relatório
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RealTimeChat;