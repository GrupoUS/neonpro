"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ErrorMessage } from "@/hooks/use-error-handling";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  Info,
  MapPin,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

// =============================================
// NeonPro Error Messages Display
// Story 1.2: Comprehensive error messaging UI
// =============================================

interface ErrorMessagesDisplayProps {
  messages: ErrorMessage[];
  onRemoveMessage: (id: string) => void;
  onClearAll: () => void;
  isRetrying?: boolean;
  showProgressiveDisclosure?: boolean;
  maxHeight?: string;
}

const getMessageIcon = (type: ErrorMessage["type"]) => {
  switch (type) {
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const getMessageVariant = (type: ErrorMessage["type"]) => {
  switch (type) {
    case "error":
      return "destructive";
    case "warning":
      return "default";
    case "info":
      return "default";
    case "success":
      return "default";
    default:
      return "default";
  }
};

const getMessageColors = (type: ErrorMessage["type"]) => {
  switch (type) {
    case "error":
      return "border-red-200 bg-red-50 text-red-800";
    case "warning":
      return "border-yellow-200 bg-yellow-50 text-yellow-800";
    case "info":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "success":
      return "border-green-200 bg-green-50 text-green-800";
    default:
      return "border-gray-200 bg-gray-50 text-gray-800";
  }
};

const MessageCard = ({
  message,
  onRemove,
  showProgressiveDisclosure,
  isRetrying,
}: {
  message: ErrorMessage;
  onRemove: (id: string) => void;
  showProgressiveDisclosure?: boolean;
  isRetrying?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState<string | null>(
    null
  );

  const handleActionClick = async (actionIndex: number) => {
    const action = message.actions?.[actionIndex];
    if (!action) return;

    setIsExecutingAction(`action-${actionIndex}`);

    try {
      await action.action();
    } catch (error) {
      console.error("Error executing action:", error);
    } finally {
      setIsExecutingAction(null);
    }
  };

  const hasExpandableContent =
    message.details ||
    message.context ||
    (showProgressiveDisclosure &&
      (message.context?.metadata || message.context?.component));

  return (
    <Card className={`mb-3 ${getMessageColors(message.type)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {getMessageIcon(message.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{message.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {format(message.timestamp, "HH:mm", { locale: ptBR })}
                </Badge>
              </div>

              <p className="text-sm mb-3">{message.message}</p>

              {/* Context Information */}
              {message.context && (
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  {message.context.component && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{message.context.component}</span>
                    </div>
                  )}
                  {message.context.operation && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{message.context.operation}</span>
                    </div>
                  )}
                  {message.context.userId && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>ID: {message.context.userId.slice(-6)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Progressive Disclosure */}
              {hasExpandableContent && showProgressiveDisclosure && (
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 p-0 text-xs"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Menos detalhes
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Mais detalhes
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 pt-2 border-t border-current/20">
                    {message.details && (
                      <div className="mb-2">
                        <p className="text-xs font-medium mb-1">Detalhes:</p>
                        <p className="text-xs text-gray-600">
                          {message.details}
                        </p>
                      </div>
                    )}

                    {message.context?.metadata && (
                      <div className="mb-2">
                        <p className="text-xs font-medium mb-1">
                          Informações Técnicas:
                        </p>
                        <pre className="text-xs bg-black/5 p-2 rounded text-gray-600 overflow-x-auto">
                          {JSON.stringify(message.context.metadata, null, 2)}
                        </pre>
                      </div>
                    )}

                    {message.context?.appointmentId && (
                      <div className="mb-2">
                        <p className="text-xs font-medium mb-1">
                          ID do Agendamento:
                        </p>
                        <code className="text-xs bg-black/5 px-1 py-0.5 rounded">
                          {message.context.appointmentId}
                        </code>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.actions.map((action, index) => {
                    const isLoading =
                      isExecutingAction === `action-${index}` ||
                      (isRetrying && action.label.includes("Tentar"));

                    return (
                      <Button
                        key={index}
                        size="sm"
                        variant={
                          action.variant === "primary"
                            ? "default"
                            : action.variant === "destructive"
                            ? "destructive"
                            : "outline"
                        }
                        onClick={() => handleActionClick(index)}
                        disabled={isLoading || Boolean(isExecutingAction)}
                        className="h-7 text-xs"
                      >
                        {isLoading && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                        )}
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Dismiss Button */}
          {message.dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(message.id)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 ml-2"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function ErrorMessagesDisplay({
  messages,
  onRemoveMessage,
  onClearAll,
  isRetrying = false,
  showProgressiveDisclosure = true,
  maxHeight = "400px",
}: ErrorMessagesDisplayProps) {
  if (messages.length === 0) return null;

  const errorCount = messages.filter((m) => m.type === "error").length;
  const warningCount = messages.filter((m) => m.type === "warning").length;
  const infoCount = messages.filter((m) => m.type === "info").length;
  const successCount = messages.filter((m) => m.type === "success").length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-sm text-gray-900">
              Mensagens do Sistema
            </span>
          </div>

          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} erro(s)
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="default" className="text-xs">
                {warningCount} aviso(s)
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {infoCount} info
              </Badge>
            )}
            {successCount > 0 && (
              <Badge variant="outline" className="text-xs text-green-600">
                {successCount} sucesso
              </Badge>
            )}
          </div>
        </div>

        {messages.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="h-7 text-xs"
          >
            Limpar Tudo
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea style={{ maxHeight }}>
        <div className="space-y-0">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onRemove={onRemoveMessage}
              showProgressiveDisclosure={showProgressiveDisclosure}
              isRetrying={isRetrying}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Help Footer */}
      {showProgressiveDisclosure &&
        messages.some((m) => m.type === "error") && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Precisa de Ajuda?</p>
                <p className="text-xs">
                  Se os problemas persistirem, entre em contato com o suporte
                  técnico ou consulte nossa documentação de ajuda.
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
