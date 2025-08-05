'use client';

import { useHealthcareAuth, useLGPDConsent } from '@/lib/trpc/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Shield, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Healthcare Profile Component Example
 * Demonstrates tRPC integration with healthcare compliance
 */

export function HealthcareProfile() {
  const {
    user,
    isLoading,
    error,
    isAuthenticated,
    isMedicalProfessional,
    isAdmin,
    isLGPDCompliant,
    canAccessPatientData,
  } = useHealthcareAuth();

  const {
    grantConsent,
    revokeConsent,
    isLoading: consentLoading,
    error: consentError,
  } = useLGPDConsent();

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Carregando perfil healthcare...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="w-full max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar perfil: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Alert className="w-full max-w-2xl mx-auto">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Autenticação healthcare necessária para acessar o perfil.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <CardTitle>Perfil Healthcare</CardTitle>
          </div>
          <CardDescription>
            Informações do profissional de saúde com validação LGPD
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="text-sm">{user.profile?.full_name || 'Não informado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Função</label>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role === 'healthcare_professional' ? 'Profissional de Saúde' :
                 user.role === 'admin' ? 'Administrador' :
                 user.role === 'patient' ? 'Paciente' : 'Staff'}
              </Badge>
            </div>
            {user.medical_license && (
              <div>
                <label className="text-sm font-medium text-gray-500">CRM</label>
                <p className="text-sm font-mono">{user.medical_license}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* LGPD Compliance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Conformidade LGPD</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isLGPDCompliant ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {isLGPDCompliant ? 'Conforme LGPD' : 'Não conforme LGPD'}
              </span>
            </div>
            <Badge variant={isLGPDCompliant ? 'default' : 'destructive'}>
              {isLGPDCompliant ? 'Ativo' : 'Pendente'}
            </Badge>
          </div>

          <div className="flex space-x-2">
            {!isLGPDCompliant && (
              <Button
                onClick={grantConsent}
                disabled={consentLoading}
                size="sm"
              >
                {consentLoading ? 'Processando...' : 'Conceder Consentimento LGPD'}
              </Button>
            )}
          </div>

          {consentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao atualizar consentimento: {consentError.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
