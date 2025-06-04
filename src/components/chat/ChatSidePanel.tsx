import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Bot, User, Loader2, X, Crown, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import SuggestedQuestions from "../chatbot/SuggestedQuestions";
import AudioRecorder from "../chatbot/AudioRecorder";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  actionExecuted?: boolean;
}

interface ChatSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AI_MODELS = [
  { 
    id: 'openai/gpt-3.5-turbo', 
    name: 'Consulta Rápida (GPT-3.5)', 
    tier: 'free',
    description: 'Modelo básico para consultas gerais'
  },
  { 
    id: 'openai/gpt-4o-mini', 
    name: 'Análise Clínica (GPT-4)', 
    tier: 'premium',
    description: 'Modelo avançado para análises médicas'
  },
  { 
    id: 'anthropic/claude-3-haiku', 
    name: 'Assistente Médico (Claude)', 
    tier: 'premium',
    description: 'Especialista em suporte clínico'
  },
  { 
    id: 'google/gemini-pro', 
    name: 'Insights Clínicos (Gemini Pro)', 
    tier: 'premium',
    description: 'Análise preditiva e insights médicos'
  }
];

const ChatSidePanel = ({ isOpen, onClose }: ChatSidePanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const canUseModel = (model: typeof AI_MODELS[0]) => {
    if (model.tier === 'free') return true;
    // Para o neonpro, vamos assumir que todos os usuários autenticados podem usar modelos premium
    return !!user;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      // Adaptar para usar as tabelas do neonpro se existirem
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

      if (error && error.code !== 'PGRST116') { // Table not found
        console.error('Error loading chat history:', error);
        return;
      }

      if (data) {
        const chatMessages: ChatMessage[] = [];
        data.forEach((chat) => {
          chatMessages.push({
            id: `${chat.id}-user`,
            role: 'user',
            content: chat.user_message || chat.message,
            timestamp: new Date(chat.created_at)
          });
          chatMessages.push({
            id: `${chat.id}-assistant`,
            role: 'assistant',
            content: chat.ai_response || chat.response,
            timestamp: new Date(chat.created_at),
            model: chat.model_used
          });
        });
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async (messageToSend?: string) => {
    const message = messageToSend || inputMessage;
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado');
      }

      // Usar a função de chat existente do neonpro ou criar uma resposta simulada
      const response = await simulateAIResponse(message);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        model: selectedModel,
        actionExecuted: response.actionExecuted
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show success message if action was executed
      if (response.actionExecuted) {
        toast({
          title: "Ação Executada",
          description: "A ação solicitada foi executada com sucesso!",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função temporária para simular resposta da IA até implementar a integração real
  const simulateAIResponse = async (message: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay

    if (message.toLowerCase().includes('paciente')) {
      return {
        content: "Posso ajudá-lo com informações sobre pacientes. Você pode agendar consultas, visualizar histórico médico ou buscar informações específicas. O que você gostaria de fazer?",
        actionExecuted: false
      };
    }

    if (message.toLowerCase().includes('agendar')) {
      return {
        content: "Vou ajudá-lo a agendar uma consulta. Por favor, me informe: 1) Nome do paciente, 2) Data preferida, 3) Tipo de consulta. Posso criar o agendamento automaticamente.",
        actionExecuted: false
      };
    }

    return {
      content: "Como assistente médico da clínica, posso ajudá-lo com: gestão de pacientes, agendamentos, análise de dados clínicos, lembretes de consultas e relatórios. Como posso auxiliá-lo hoje?",
      actionExecuted: false
    };
  };

  const handleModelChange = (modelId: string) => {
    const model = AI_MODELS.find(m => m.id === modelId);
    if (model && !canUseModel(model)) {
      toast({
        title: "Modelo Premium",
        description: "Este modelo requer autenticação. Faça login para acessar.",
        variant: "destructive"
      });
      return;
    }
    setSelectedModel(modelId);
  };

  const handleQuestionSelect = (question: string) => {
    setInputMessage(question);
    sendMessage(question);
  };

  const handleTranscriptionComplete = (text: string) => {
    setInputMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-96 md:w-1/3 bg-white dark:bg-gray-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h2 className="text-base sm:text-lg font-semibold">Assistente Médico IA</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar Chat</span>
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Modelo:</span>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger className="flex-1 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => {
                    const canUse = canUseModel(model);
                    return (
                      <SelectItem 
                        key={model.id} 
                        value={model.id}
                        disabled={!canUse}
                        className={!canUse ? "opacity-50" : ""}
                      >
                        <div className="flex items-center gap-1 text-xs">
                          <span>{model.name}</span>
                          {model.tier === 'premium' && (
                            canUse ? (
                              <Crown className="h-2 w-2 text-yellow-500" />
                            ) : (
                              <Lock className="h-2 w-2 text-gray-400" />
                            )
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {!user && (
              <div className="text-xs text-muted-foreground">
                💡 Faça login para acessar modelos avançados
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-4">
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 opacity-50" />
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-semibold mb-2">Olá! Sou seu assistente médico.</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Analiso dados clínicos e auxilio na gestão da clínica.
                </p>
                {user && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded text-xs text-blue-800 dark:text-blue-200 mb-3">
                    ✨ <strong>Recursos:</strong> Posso agendar consultas e gerenciar pacientes!
                  </div>
                )}
              </div>
              <SuggestedQuestions onQuestionSelect={handleQuestionSelect} />
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-2 max-w-[90%] sm:max-w-[85%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center">
                  {message.role === 'user' ? (
                    <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                  ) : (
                    <Bot className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-2 sm:p-3 text-xs sm:text-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  {message.model && (
                    <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                      <span>
                        {AI_MODELS.find(m => m.id === message.model)?.name || message.model}
                      </span>
                      {message.actionExecuted && (
                        <span className="text-green-400 ml-1">✅</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="flex gap-2 max-w-[85%]">
                <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                </div>
                <div className="rounded-lg p-2 sm:p-3 bg-muted">
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Analisando...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta..."
              className="flex-1 text-xs sm:text-sm"
              disabled={isLoading}
            />
            <AudioRecorder 
              onTranscriptionComplete={handleTranscriptionComplete}
              disabled={isLoading}
            />
            <Button 
              onClick={() => sendMessage()} 
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidePanel;
