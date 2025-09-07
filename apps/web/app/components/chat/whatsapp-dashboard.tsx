"use client";

/**
 * WhatsApp Dashboard Component for NeonPro Healthcare
 * Main dashboard integrating conversation list and chat interface
 * Mobile-first responsive design for Brazilian healthcare providers
 */

// framer-motion not used in this dashboard
import {
  AlertCircle,
  BarChart3,
  MessageSquare,
  RefreshCw,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";
import type React from "react";
import { useState } from "react";

interface Conversation {
  id: string;
  clinicId: string;
  patientId?: string;
  phoneNumber: string;
  contactName?: string;
  status: "active" | "closed" | "archived";
  lastMessageAt?: Date;
  messageCount: number;
  unreadCount: number;
  assignedTo?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// UI Components
import { cn } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@neonpro/ui";

// Custom components
import { WhatsappChat } from "./whatsapp-chat";
import { WhatsappConversationList } from "./whatsapp-conversation-list";

// Hooks
import { useWhatsapp } from "@/app/hooks/use-whatsapp";

interface WhatsappDashboardProps {
  clinicId: string;
  currentUserId: string;
  className?: string;
}

export const WhatsappDashboard: React.FC<WhatsappDashboardProps> = ({
  clinicId,
  currentUserId,
  className,
}) => {
  const [activeTab, setActiveTab] = useState("conversations");

  // WhatsApp hook
  const {
    conversations,
    messages,
    selectedConversation,
    isLoading,
    isLoadingMessages,
    error,
    sendMessage,
    selectConversation,
    markAsRead,
    archiveConversation,
    refreshData,
    connectionStatus,
  } = useWhatsapp({
    clinicId,
    autoRefresh: true,
    refreshInterval: 30_000,
  });

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    selectConversation(conversation);
    // On mobile, switch to chat tab when conversation is selected
    if (window.innerWidth < 768) {
      setActiveTab("chat");
    }
  };

  // Handle refresh
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const handleRefresh = async () => {
    try {
      await refreshData();
      setRefreshError(null);
    } catch (err) {
      console.error("Failed to refresh data:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setRefreshError(`Failed to refresh data: ${msg}`);
    }
  };

  // Connection status indicator
  const ConnectionStatus = () => {
    const getStatusIcon = () => {
      switch (connectionStatus) {
        case "connected":
          return <Wifi className="h-4 w-4 text-green-500" />;
        case "connecting":
          return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
        case "disconnected":
          return <WifiOff className="h-4 w-4 text-red-500" />;
        default:
          return <WifiOff className="h-4 w-4 text-gray-400" />;
      }
    };

    const getStatusText = () => {
      switch (connectionStatus) {
        case "connected":
          return "Conectado";
        case "connecting":
          return "Conectando...";
        case "disconnected":
          return "Desconectado";
        default:
          return "Status desconhecido";
      }
    };

    return (
      <div className="flex items-center gap-2 text-sm">
        {getStatusIcon()}
        <span className="text-muted-foreground">{getStatusText()}</span>
      </div>
    );
  };

  // Statistics
  const stats = {
    total: conversations.length,
    active: conversations.filter((c: Conversation) => c.status === "active").length,
    unread: conversations.reduce(
      (sum: number, c: Conversation) => sum + (c.unreadCount || 0),
      0,
    ),
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">WhatsApp Business</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comunicação com pacientes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ConnectionStatus />
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{stats.total}</Badge>
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">{stats.active}</Badge>
              <span className="text-sm text-muted-foreground">Ativas</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{stats.unread}</Badge>
              <span className="text-sm text-muted-foreground">Não lidas</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alerts */}
      {(error || refreshError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{refreshError || error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden md:flex h-full gap-4">
          {/* Conversation List */}
          <div className="w-80 flex-shrink-0">
            <WhatsappConversationList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
              onArchiveConversation={archiveConversation}
              isLoading={isLoading}
              className="h-full"
            />
          </div>

          <Separator orientation="vertical" />

          {/* Chat Area */}
          <div className="flex-1">
            {selectedConversation
              ? (
                <WhatsappChat
                  conversation={selectedConversation}
                  messages={messages}
                  currentUserId={currentUserId}
                  clinicId={clinicId}
                  onSendMessage={sendMessage}
                  onMarkAsRead={markAsRead}
                  isLoading={isLoadingMessages}
                  className="h-full"
                />
              )
              : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">
                      Selecione uma conversa
                    </h3>
                    <p className="text-muted-foreground">
                      Escolha uma conversa da lista para começar a conversar
                    </p>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="conversations" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Conversas
                {stats.unread > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                    {stats.unread > 99 ? "99+" : stats.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="chat" disabled={!selectedConversation}>
                Chat
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4" />
                Métricas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversations" className="flex-1 mt-4">
              <WhatsappConversationList
                conversations={conversations}
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={handleSelectConversation}
                onArchiveConversation={archiveConversation}
                isLoading={isLoading}
                className="h-full"
              />
            </TabsContent>

            <TabsContent value="chat" className="flex-1 mt-4">
              {selectedConversation
                ? (
                  <WhatsappChat
                    conversation={selectedConversation}
                    messages={messages}
                    currentUserId={currentUserId}
                    clinicId={clinicId}
                    onSendMessage={sendMessage}
                    onMarkAsRead={markAsRead}
                    isLoading={isLoadingMessages}
                    className="h-full"
                  />
                )
                : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">
                        Nenhuma conversa selecionada
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Volte para a aba de conversas e selecione uma conversa
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("conversations")}
                      >
                        Ver Conversas
                      </Button>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>

            <TabsContent value="analytics" className="flex-1 mt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Métricas do WhatsApp</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.total}</div>
                        <div className="text-sm text-muted-foreground">Total de Conversas</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                        <div className="text-sm text-muted-foreground">Conversas Ativas</div>
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
                      <div className="text-sm text-muted-foreground">Mensagens Não Lidas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WhatsappDashboard;
