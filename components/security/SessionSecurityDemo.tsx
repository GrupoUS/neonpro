'use client';

import React, { useState, useEffect } from 'react';
import { useSessionSecurity, useCSRFToken, useSessionTimeout } from '@/lib/security/hooks/useSessionSecurity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

/**
 * SessionSecurityDemo Component
 * Demonstrates the session security features implemented in Story 1.5
 */
export default function SessionSecurityDemo() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [activityCount, setActivityCount] = useState(0);
  
  // Use session security hooks
  const {
    isSecurityActive,
    securityStatus,
    updateActivity,
    extendSession,
    terminateSession,
    error: securityError
  } = useSessionSecurity(sessionId);
  
  const {
    csrfToken,
    isLoading: csrfLoading,
    error: csrfError,
    refreshToken
  } = useCSRFToken(sessionId);
  
  const {
    timeRemaining,
    warningLevel,
    isExpired,
    extendTimeout,
    error: timeoutError
  } = useSessionTimeout(sessionId);

  // Simulate user activity
  const simulateActivity = async () => {
    await updateActivity('user_interaction', {
      action: 'demo_activity',
      timestamp: new Date().toISOString(),
      count: activityCount + 1
    });
    setActivityCount(prev => prev + 1);
  };

  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get warning color based on level
  const getWarningColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Session Security Demo
        </h1>
        <p className="text-gray-600">
          Demonstração das funcionalidades de segurança de sessão implementadas na Story 1.5
        </p>
        <Badge variant="outline" className="mt-2">
          Session ID: {sessionId.slice(-12)}
        </Badge>
      </div>

      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status de Segurança da Sessão
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real da segurança da sessão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {isSecurityActive ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                Segurança: {isSecurityActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="font-medium">
                Tempo Restante: {timeRemaining ? formatTimeRemaining(timeRemaining) : 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">
                Atividades: {activityCount}
              </span>
            </div>
          </div>
          
          {securityStatus && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Detalhes de Segurança:</h4>
              <div className="text-sm space-y-1">
                <p>Risk Score: <Badge variant="outline">{securityStatus.riskScore || 'N/A'}</Badge></p>
                <p>Última Atividade: {securityStatus.lastActivity || 'N/A'}</p>
                <p>Fingerprint Válido: {securityStatus.fingerprintValid ? '✅' : '❌'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSRF Token Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Token CSRF</CardTitle>
          <CardDescription>
            Proteção contra ataques Cross-Site Request Forgery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Token CSRF:</span>
              <div className="flex items-center gap-2">
                {csrfLoading ? (
                  <Badge variant="secondary">Carregando...</Badge>
                ) : csrfToken ? (
                  <Badge variant="default">{csrfToken.slice(0, 16)}...</Badge>
                ) : (
                  <Badge variant="destructive">Não disponível</Badge>
                )}
                <Button size="sm" onClick={refreshToken} disabled={csrfLoading}>
                  Renovar
                </Button>
              </div>
            </div>
            
            {csrfError && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Erro no CSRF: {csrfError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Timeout Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Timeout</CardTitle>
          <CardDescription>
            Controle automático de expiração de sessão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {warningLevel && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <Badge variant={getWarningColor(warningLevel)} className="mr-2">
                    {warningLevel.toUpperCase()}
                  </Badge>
                  {warningLevel === 'critical' && 'Sessão expirará em breve!'}
                  {warningLevel === 'warning' && 'Sessão próxima do timeout.'}
                  {warningLevel === 'info' && 'Sessão ativa.'}
                </AlertDescription>
              </Alert>
            )}
            
            {isExpired && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Sessão expirada! Faça login novamente.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={() => extendTimeout(30)} 
                disabled={isExpired}
                variant="outline"
              >
                Estender 30min
              </Button>
              <Button 
                onClick={() => extendSession(60)} 
                disabled={isExpired}
                variant="outline"
              >
                Estender 1h
              </Button>
            </div>
            
            {timeoutError && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Erro no timeout: {timeoutError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>Simulação de Atividade</CardTitle>
          <CardDescription>
            Teste as funcionalidades de rastreamento de atividade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={simulateActivity}>
                Simular Atividade
              </Button>
              <Button 
                onClick={terminateSession} 
                variant="destructive"
              >
                Terminar Sessão
              </Button>
            </div>
            
            {securityError && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Erro de segurança: {securityError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notas de Implementação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p>✅ <strong>CSRF Protection:</strong> Tokens gerados automaticamente e validados em todas as requisições</p>
            <p>✅ <strong>Session Hijacking Protection:</strong> Fingerprinting de sessão e detecção de anomalias</p>
            <p>✅ <strong>Session Timeout:</strong> Timeout automático com avisos progressivos</p>
            <p>✅ <strong>Concurrent Session Management:</strong> Controle de sessões simultâneas</p>
            <p>✅ <strong>Security Middleware:</strong> Middleware integrado para proteção global</p>
            <p>✅ <strong>Database Security:</strong> Tabelas com RLS e triggers de limpeza automática</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}