'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@neonpro/ui/card';
import { Badge } from '@neonpro/ui/badge';
import { Alert, AlertDescription } from '@neonpro/ui/alert';
import { Progress } from '@neonpro/ui/progress';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Lock,
} from 'lucide-react';

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
    recentRequests: any[];
  };
  lastUpdated: string;
}

// ============================================================================
// COMPLIANCE DASHBOARD COMPONENT
// ============================================================================

export function ComplianceDashboard() {
  const [complianceStatus, setComplianceStatus] =
    useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceStatus();
  }, []);

  const loadComplianceStatus = async () => {
    try {
      const response = await fetch('/api/lgpd/compliance/status');
      if (!response.ok) {
        throw new Error('Failed to load compliance status');
      }

      const data: ComplianceStatus = await response.json();
      setComplianceStatus(data);
    } catch (error) {
      console.error('Load compliance status error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Dashboard de Conformidade LGPD
          </CardTitle>
          <CardDescription>
            Carregando status de conformidade...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg" />
            ))}
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
            <Shield className="w-5 h-5" />
            Dashboard de Conformidade LGPD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar status de conformidade. Tente novamente mais
              tarde.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const consentProgress =
    complianceStatus.consentCompliance.requiredConsentsCount > 0
      ? (complianceStatus.consentCompliance.grantedRequiredConsentsCount /
          complianceStatus.consentCompliance.requiredConsentsCount) *
        100
      : 100;

  const isFullyCompliant =
    complianceStatus.consentCompliance.hasAllRequiredConsents;

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card
        className={
          isFullyCompliant
            ? 'border-green-200 bg-green-50'
            : 'border-yellow-200 bg-yellow-50'
        }
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Status Geral de Conformidade LGPD
            {isFullyCompliant ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Conforme
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Atenção Necessária
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Última atualização:{' '}
            {new Date(complianceStatus.lastUpdated).toLocaleString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFullyCompliant ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Parabéns! Você está em total conformidade com a LGPD. Todos os
                consentimentos obrigatórios foram concedidos.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Alguns consentimentos obrigatórios estão pendentes. Revise suas
                preferências de privacidade para garantir conformidade total.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Consent Compliance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conformidade de Consentimento
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {consentProgress.toFixed(0)}%
                </span>
                <Badge variant={isFullyCompliant ? 'default' : 'secondary'}>
                  {
                    complianceStatus.consentCompliance
                      .grantedRequiredConsentsCount
                  }{' '}
                  / {complianceStatus.consentCompliance.requiredConsentsCount}
                </Badge>
              </div>
              <Progress value={consentProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Consentimentos obrigatórios concedidos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solicitações de Dados
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {complianceStatus.dataRequests.totalRequests}
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  <span>
                    {complianceStatus.dataRequests.pendingRequests} pendentes
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>
                    {complianceStatus.dataRequests.completedRequests} concluídas
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Total de solicitações realizadas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pontuação de Privacidade
            </CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {isFullyCompliant ? '100' : Math.floor(consentProgress)}
              </div>
              <div className="flex items-center gap-1">
                {isFullyCompliant ? (
                  <Badge className="bg-green-100 text-green-800">
                    Excelente
                  </Badge>
                ) : consentProgress >= 75 ? (
                  <Badge className="bg-blue-100 text-blue-800">Bom</Badge>
                ) : consentProgress >= 50 ? (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Regular
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    Precisa Melhorar
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
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
              {complianceStatus.dataRequests.recentRequests.map(
                (request, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">{request.requestType}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(request.requestedAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        request.status === 'completed'
                          ? 'default'
                          : request.status === 'processing'
                            ? 'secondary'
                            : request.status === 'denied'
                              ? 'destructive'
                              : 'outline'
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                )
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Seus Direitos</h4>
              <ul className="text-sm text-gray-600 space-y-1">
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
              <h4 className="font-medium mb-2">Nossos Compromissos</h4>
              <ul className="text-sm text-gray-600 space-y-1">
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