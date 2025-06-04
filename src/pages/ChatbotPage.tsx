import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useClinicAI, type ChatMessage } from "@/hooks/useClinicAI";
import SuggestedQuestions from "@/components/chatbot/SuggestedQuestions";
import AudioRecorder from "@/components/chatbot/AudioRecorder";

const ChatbotPage = () => {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    messages,
    isLoading,
    sendMessage,
    sendSuggestion,
    clearMessages,
    initializeAssistant,
    getLastSuggestions,
    isReady,
    user
  } = useClinicAI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user) {
      initializeAssistant();
    }
  }, [user, initializeAssistant]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !isReady) return;

    try {
      await sendMessage(inputMessage);
      setInputMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleQuestionSelect = async (question: string) => {
    if (!isReady) return;
    
    try {
      await sendSuggestion(question);
    } catch (error) {
      console.error('Error sending suggestion:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a sugestão. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleTranscriptionComplete = (text: string) => {
    setInputMessage(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    clearMessages();
    toast({
      title: "Conversa limpa",
      description: "O histórico da conversa foi removido.",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="h-[85vh] flex flex-col items-center justify-center">
          <CardContent>
            <div className="text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Faça login para continuar</h3>
              <p className="text-muted-foreground">
                Você precisa estar logado para usar o assistente clínico.
              </p>
              <Button 
                onClick={() => navigate("/login")} 
                className="mt-4"
              >
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="h-[85vh] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                Assistente Clínico IA
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Chat
            </Button>
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            🏥 Seu assistente pessoal para gestão clínica e agendamentos
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Olá! Sou seu assistente clínico pessoal.</h3>
                  <p className="text-muted-foreground mb-4">
                    Posso te ajudar a gerenciar consultas, pacientes, criar lembretes e dar insights sobre sua prática clínica.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      ✨ <strong>Recursos Disponíveis:</strong> Agendar consultas, gerenciar pacientes, criar lembretes, análise de atendimentos e muito mais!
                    </p>
                  </div>
                </div>
                <SuggestedQuestions onQuestionSelect={handleQuestionSelect} />
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    {message.isUser ? (
                      <User className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Suggestions from last AI message */}
            {!isLoading && getLastSuggestions().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {getLastSuggestions().map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuestionSelect(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="rounded-lg p-3 bg-background border">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analisando seus dados clínicos...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta sobre a clínica ou grave um áudio..."
              className="flex-1"
              disabled={isLoading || !isReady}
            />
            <AudioRecorder 
              onTranscriptionComplete={handleTranscriptionComplete}
              disabled={isLoading || !isReady}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isLoading || !isReady}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {!isReady && user && (
            <div className="text-center text-sm text-muted-foreground">
              Inicializando assistente clínico...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotPage;
