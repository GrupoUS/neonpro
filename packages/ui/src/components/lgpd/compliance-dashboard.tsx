"use client";

import { AlertTriangle, CheckCircle, Clock, FileText, Lock, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import type { LGPDRequest } from "./types";

// ============================================================================
// TYPES
// ============================================================================

interface ComplianceStatus {
  userId: string;
  consentCompliance: {
    hasAllRequiredConsents: boolean;
    requiredConsentsCount: number;
    grantedRequiredConsentsCount: number;
  };
  dataRequests: {
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    recentRequests: unknown[];
  };
  lastUpdated: string;
}

// ============================================================================
// COMPLIANCE DASHBOARD COMPONENT
// ============================================================================

export function ComplianceDashboard() {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>();
  const [loading, setLoading] = useState(true);

  const loadComplianceStatus = async () => {
    try {
      const response = await fetch("/api/lgpd/compliance/status");
      if (!response.ok) {
        throw new Error("Failed to load compliance status");
      }

      const data: ComplianceStatus = await response.json();
      setComplianceStatus(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplianceStatus();
  }, [loadComplianceStatus]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dashboard de Conformidade LGPD
          </CardTitle>
          <CardDescription>
            Carregando status de conformidade...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => <div className="h-20 rounded-lg bg-gray-200" key={i} />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!complianceStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Dashboard de Conformidade LGPD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar status de conformidade. Tente novamente mais tarde.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const consentProgress = complianceStatus.consentCompliance.requiredConsentsCount > 0
    ? (complianceStatus.consentCompliance.grantedRequiredConsentsCount
      / complianceStatus.consentCompliance.requiredConsentsCount)
      * 100
    : 100;

  const isFullyCompliant = complianceStatus.consentCompliance.hasAllRequiredConsents;

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card
        className={isFullyCompliant
          ? "border-green-200 bg-green-50"
          : "border-yellow-200 bg-yellow-50"}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status Geral de Conformidade LGPD
            {isFullyCompliant
              ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Conforme
                </Badge>
              )
              : (
                <Badge className="bg-yellow-100 text-yellow-800">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Atenção Necessária
                </Badge>
              )}
          </CardTitle>
          <CardDescription>
            Última atualização: {new Date(complianceStatus.lastUpdated).toLocaleString("pt-BR")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFullyCompliant
            ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Parabéns! Você está em total conformidade com a LGPD. Todos os consentimentos
                  obrigatórios foram concedidos.
                </AlertDescription>
              </Alert>
            )
            : (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Alguns consentimentos obrigatórios estão pendentes. Revise suas preferências de
                  privacidade para garantir conformidade total.
                </AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Consent Compliance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Conformidade de Consentimento
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-2xl">
                  {consentProgress.toFixed(0)}%
                </span>
                <Badge variant={isFullyCompliant ? "default" : "secondary"}>
                  {complianceStatus.consentCompliance
                    .grantedRequiredConsentsCount} /{" "}
                  {complianceStatus.consentCompliance.requiredConsentsCount}
                </Badge>
              </div>
              <Progress className="h-2" value={consentProgress} />
              <p className="text-muted-foreground text-xs">
                Consentimentos obrigatórios concedidos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Solicitações de Dados
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="font-bold text-2xl">
                {complianceStatus.dataRequests.totalRequests}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-yellow-500" />
                  <span>
                    {complianceStatus.dataRequests.pendingRequests} pendentes
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>
                    {complianceStatus.dataRequests.completedRequests} concluídas
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-xs">
                Total de solicitações realizadas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              Pontuação de Privacidade
            </CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="font-bold text-2xl">
                {isFullyCompliant ? "100" : Math.floor(consentProgress)}
              </div>
              <div className="flex items-center gap-1">
                {isFullyCompliant
                  ? (
                    <Badge className="bg-green-100 text-green-800">
                      Excelente
                    </Badge>
                  )
                  : consentProgress >= 75
                  ? <Badge className="bg-blue-100 text-blue-800">Bom</Badge>
                  : consentProgress >= 50
                  ? (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Regular
                    </Badge>
                  )
                  : (
                    <Badge className="bg-red-100 text-red-800">
                      Precisa Melhorar
                    </Badge>
                  )}
              </div>
              <p className="text-muted-foreground text-xs">
                Baseado na conformidade LGPD
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {complianceStatus.dataRequests.recentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Suas solicitações mais recentes relacionadas à LGPD
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(complianceStatus.dataRequests.recentRequests as LGPDRequest[]).map(
                (request: LGPDRequest, index) => (
                  <div
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    key={index}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{request.requestType}</p>
                        <p className="text-gray-600 text-sm">
                          {new Date(request.requestedAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={request.status === "completed"
                        ? "default"
                        : request.status === "processing"
                        ? "secondary"
                        : request.status === "denied"
                        ? "destructive"
                        : "outline"}
                    >
                      {request.status}
                    </Badge>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* LGPD Information */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre a LGPD</CardTitle>
          <CardDescription>
            Informações importantes sobre seus direitos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">Seus Direitos</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Confirmação da existência de tratamento</li>
                <li>• Acesso aos dados</li>
                <li>
                  • Correção de dados incompletos, inexatos ou desatualizados
                </li>
                <li>• Anonimização, bloqueio ou eliminação</li>
                <li>• Portabilidade dos dados</li>
                <li>• Informação sobre compartilhamento</li>
                <li>• Revogação do consentimento</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Nossos Compromissos</h4>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• Transparência no tratamento dos dados</li>
                <li>• Segurança e proteção das informações</li>
                <li>• Resposta em até 15 dias às solicitações</li>
                <li>• Minimização da coleta de dados</li>
                <li>• Finalidade específica e explícita</li>
                <li>• Conformidade com a LGPD</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
