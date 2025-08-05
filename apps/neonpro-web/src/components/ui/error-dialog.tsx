// Progressive Disclosure Error Dialog Component
"use client";

import React, { useState } from "react";
import type {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
  Shield,
  Clock,
} from "lucide-react";
import type { AppError } from "@/hooks/use-error-handling";

interface ErrorDialogProps {
  error: AppError | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry?: () => void;
  onContactSupport?: () => void;
  showTechnicalDetails?: boolean; // Only for authorized users
}

const SEVERITY_ICONS = {
  low: Info,
  medium: AlertTriangle,
  high: XCircle,
  critical: XCircle,
} as const;

const SEVERITY_COLORS = {
  low: "bg-blue-50 text-blue-700 border-blue-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  high: "bg-red-50 text-red-700 border-red-200",
  critical: "bg-red-100 text-red-800 border-red-300",
} as const;

export function ErrorDialog({
  error,
  isOpen,
  onOpenChange,
  onRetry,
  onContactSupport,
  showTechnicalDetails = false,
}: ErrorDialogProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showContext, setShowContext] = useState(false);

  if (!error) return null;

  const SeverityIcon = SEVERITY_ICONS[error.severity];
  const severityColorClass = SEVERITY_COLORS[error.severity];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${severityColorClass.replace("text-", "bg-").replace("-700", "-100").replace("-800", "-100")}`}
            >
              <SeverityIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-left">{error.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={severityColorClass}>
                  {error.severity === "low" && "Informação"}
                  {error.severity === "medium" && "Atenção"}
                  {error.severity === "high" && "Erro"}
                  {error.severity === "critical" && "Crítico"}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {error.code}
                </Badge>
              </div>
            </div>
          </div>
          <DialogDescription className="text-left pt-3">{error.message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* LGPD Privacy Notice */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <CardTitle className="text-sm font-medium text-blue-800">
                  Proteção de Dados (LGPD)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-blue-700">
                Seus dados pessoais estão protegidos. Este erro foi registrado de forma anônima para
                melhorar nosso sistema, sem exposição de informações sensíveis.
              </p>
            </CardContent>
          </Card>

          {/* Suggested Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />O que você pode fazer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {error.suggestedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Progressive Disclosure - Additional Details */}
          {error.description && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                  <div className="flex items-center gap-2">
                    {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span className="font-medium">
                      {showDetails ? "Ocultar detalhes" : "Ver mais detalhes"}
                    </span>
                  </div>
                  {showDetails ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-700">{error.description}</p>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Technical Details - Only for authorized users */}
          {showTechnicalDetails && error.technicalDetails && (
            <Collapsible open={showContext} onOpenChange={setShowContext}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto text-orange-600"
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span className="font-medium">
                      {showContext ? "Ocultar informações técnicas" : "Ver informações técnicas"}
                    </span>
                  </div>
                  {showContext ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3">
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-orange-800">
                      Informações Técnicas (Uso Interno)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="font-medium text-gray-600">ID do Erro:</span>
                        <code className="ml-2 bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                          {error.id}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Componente:</span>
                        <code className="ml-2 bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                          {error.context.component}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Ação:</span>
                        <code className="ml-2 bg-gray-100 px-1 py-0.5 rounded text-gray-800">
                          {error.context.action}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="font-medium text-gray-600">Timestamp:</span>
                        <span className="text-gray-700">
                          {new Date(error.context.timestamp).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      {error.technicalDetails && (
                        <div>
                          <span className="font-medium text-gray-600">Detalhes:</span>
                          <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                            {error.technicalDetails}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Help Link */}
          {error.helpUrl && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Precisa de ajuda adicional?
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-700 border-green-300 hover:bg-green-100"
                    onClick={() => window.open(error.helpUrl, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Ver Guia
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Retry Button */}
            {error.canRetry && onRetry && (
              <Button
                onClick={() => {
                  onRetry();
                  onOpenChange(false);
                }}
                className="flex-1 sm:flex-none"
                disabled={error.retryDelay ? true : false}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {error.retryDelay ? "Aguarde..." : "Tentar Novamente"}
              </Button>
            )}

            {/* Contact Support Button */}
            {error.requiresSupport && onContactSupport && (
              <Button
                variant="outline"
                onClick={() => {
                  onContactSupport();
                  onOpenChange(false);
                }}
                className="flex-1 sm:flex-none"
              >
                Contatar Suporte
              </Button>
            )}
          </div>

          {/* Close Button */}
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
