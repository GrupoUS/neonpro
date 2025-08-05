"use client";

/**
 * Privacy Controls Component for Patient Photo Management
 * Manages LGPD compliance and privacy settings for patient photos
 *
 * @author APEX Master Developer
 */

import type {
  AlertTriangle,
  Check,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Switch } from "@/components/ui/switch";
import type { Textarea } from "@/components/ui/textarea";
import type { useToast } from "@/components/ui/use-toast";

interface PrivacyControlsProps {
  patientId: string;
  patientName: string;
  onPrivacyUpdated?: (controls: PrivacyControls) => void;
  readOnly?: boolean;
}

interface PrivacyControls {
  allowFacialRecognition: boolean;
  allowPhotoSharing: boolean;
  dataRetentionPeriod: number;
  accessLevel: "public" | "restricted" | "private";
  consentGiven: boolean;
  consentDate: string;
  consentVersion: string;
  allowDataProcessing: boolean;
  allowThirdPartyAccess: boolean;
  notificationPreferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    dataProcessingAlerts: boolean;
  };
  dataExportRequests: DataExportRequest[];
  deletionRequests: DeletionRequest[];
}

interface DataExportRequest {
  id: string;
  requestDate: string;
  status: "pending" | "processing" | "completed" | "failed";
  downloadUrl?: string;
  expiresAt?: string;
}

interface DeletionRequest {
  id: string;
  requestDate: string;
  reason: string;
  status: "pending" | "approved" | "completed" | "rejected";
  scheduledDate?: string;
  completedDate?: string;
}

interface ConsentHistory {
  id: string;
  version: string;
  givenAt: string;
  revokedAt?: string;
  changes: string[];
}

const ACCESS_LEVEL_DESCRIPTIONS = {
  public: "Fotos podem ser acessadas por toda a equipe médica",
  restricted: "Acesso limitado apenas aos profissionais envolvidos no tratamento",
  private: "Acesso restrito apenas ao médico responsável",
};

const RETENTION_PERIODS = [
  { value: 365, label: "1 ano" },
  { value: 730, label: "2 anos" },
  { value: 1095, label: "3 anos" },
  { value: 1825, label: "5 anos" },
  { value: 3650, label: "10 anos" },
  { value: -1, label: "Indefinido (conforme legislação)" },
];

export function PrivacyControls({
  patientId,
  patientName,
  onPrivacyUpdated,
  readOnly = false,
}: PrivacyControlsProps) {
  const [privacyControls, setPrivacyControls] = useState<PrivacyControls | null>(null);
  const [consentHistory, setConsentHistory] = useState<ConsentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeletionDialog, setShowDeletionDialog] = useState(false);
  const [deletionReason, setDeletionReason] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    loadPrivacyControls();
    loadConsentHistory();
  }, [patientId]);

  const loadPrivacyControls = async () => {
    try {
      const response = await fetch(`/api/patients/photos/privacy?patientId=${patientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("supabase_token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setPrivacyControls(result.data);
      } else {
        // Initialize default privacy controls if none exist
        const defaultControls: PrivacyControls = {
          allowFacialRecognition: false,
          allowPhotoSharing: false,
          dataRetentionPeriod: 1825, // 5 years default
          accessLevel: "restricted",
          consentGiven: false,
          consentDate: new Date().toISOString(),
          consentVersion: "1.0",
          allowDataProcessing: false,
          allowThirdPartyAccess: false,
          notificationPreferences: {
            emailNotifications: true,
            smsNotifications: false,
            dataProcessingAlerts: true,
          },
          dataExportRequests: [],
          deletionRequests: [],
        };
        setPrivacyControls(defaultControls);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações de privacidade.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadConsentHistory = async () => {
    try {
      const response = await fetch(
        `/api/patients/photos/privacy/consent-history?patientId=${patientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("supabase_token")}`,
          },
        },
      );

      if (response.ok) {
        const result = await response.json();
        setConsentHistory(result.data || []);
      }
    } catch (error) {
      console.error("Error loading consent history:", error);
    }
  };

  const updatePrivacyControls = async (updates: Partial<PrivacyControls>) => {
    if (readOnly) return;

    setIsSaving(true);
    try {
      const updatedControls = { ...privacyControls, ...updates };

      const response = await fetch("/api/patients/photos/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("supabase_token")}`,
        },
        body: JSON.stringify({
          patientId,
          privacyControls: updatedControls,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update privacy controls");
      }

      const result = await response.json();
      setPrivacyControls(result.data);
      onPrivacyUpdated?.(result.data);

      toast({
        title: "Configurações atualizadas",
        description: "As configurações de privacidade foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar configurações",
        description: "Não foi possível atualizar as configurações de privacidade.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const requestDataExport = async () => {
    try {
      const response = await fetch("/api/patients/photos/privacy/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("supabase_token")}`,
        },
        body: JSON.stringify({ patientId }),
      });

      if (!response.ok) {
        throw new Error("Failed to request data export");
      }

      toast({
        title: "Solicitação enviada",
        description:
          "Sua solicitação de exportação de dados foi enviada. Você receberá um email quando estiver pronta.",
      });

      setShowExportDialog(false);
      loadPrivacyControls(); // Reload to get updated export requests
    } catch (error) {
      toast({
        title: "Erro na solicitação",
        description: "Não foi possível processar sua solicitação de exportação.",
        variant: "destructive",
      });
    }
  };

  const requestDataDeletion = async () => {
    if (!deletionReason.trim()) {
      toast({
        title: "Motivo obrigatório",
        description: "Por favor, informe o motivo da solicitação de exclusão.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/patients/photos/privacy/deletion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("supabase_token")}`,
        },
        body: JSON.stringify({
          patientId,
          reason: deletionReason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request data deletion");
      }

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de exclusão de dados foi enviada para análise.",
      });

      setShowDeletionDialog(false);
      setDeletionReason("");
      loadPrivacyControls(); // Reload to get updated deletion requests
    } catch (error) {
      toast({
        title: "Erro na solicitação",
        description: "Não foi possível processar sua solicitação de exclusão.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pendente" },
      processing: { color: "bg-blue-100 text-blue-800", label: "Processando" },
      completed: { color: "bg-green-100 text-green-800", label: "Concluído" },
      failed: { color: "bg-red-100 text-red-800", label: "Falhou" },
      approved: { color: "bg-green-100 text-green-800", label: "Aprovado" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejeitado" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!privacyControls) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Não foi possível carregar as configurações de privacidade.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Privacidade - {patientName}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Consent Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {privacyControls.consentGiven ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <X className="h-5 w-5 text-red-600" />
            )}
            Status do Consentimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {privacyControls.consentGiven
                    ? "Consentimento concedido"
                    : "Consentimento pendente"}
                </p>
                <p className="text-sm text-gray-500">
                  Versão: {privacyControls.consentVersion} •{" "}
                  {formatDate(privacyControls.consentDate)}
                </p>
              </div>
              {!readOnly && (
                <Button variant="outline" onClick={() => setShowConsentDialog(true)}>
                  {privacyControls.consentGiven ? "Revogar" : "Conceder"} Consentimento
                </Button>
              )}
            </div>

            {!privacyControls.consentGiven && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Consentimento necessário</p>
                    <p className="text-sm text-yellow-700">
                      O consentimento é obrigatório para o processamento de fotos e dados pessoais
                      conforme a LGPD.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configurações de Privacidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Facial Recognition */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="facial-recognition" className="text-base font-medium">
                  Reconhecimento Facial
                </Label>
                <p className="text-sm text-gray-500">
                  Permitir o uso de tecnologia de reconhecimento facial para identificação
                </p>
              </div>
              <Switch
                id="facial-recognition"
                checked={privacyControls.allowFacialRecognition}
                onCheckedChange={(checked) =>
                  updatePrivacyControls({ allowFacialRecognition: checked })
                }
                disabled={readOnly || isSaving}
              />
            </div>

            {/* Photo Sharing */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="photo-sharing" className="text-base font-medium">
                  Compartilhamento de Fotos
                </Label>
                <p className="text-sm text-gray-500">
                  Permitir compartilhamento de fotos com outros profissionais
                </p>
              </div>
              <Switch
                id="photo-sharing"
                checked={privacyControls.allowPhotoSharing}
                onCheckedChange={(checked) => updatePrivacyControls({ allowPhotoSharing: checked })}
                disabled={readOnly || isSaving}
              />
            </div>

            {/* Data Processing */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="data-processing" className="text-base font-medium">
                  Processamento de Dados
                </Label>
                <p className="text-sm text-gray-500">
                  Permitir processamento automatizado de dados para análises
                </p>
              </div>
              <Switch
                id="data-processing"
                checked={privacyControls.allowDataProcessing}
                onCheckedChange={(checked) =>
                  updatePrivacyControls({ allowDataProcessing: checked })
                }
                disabled={readOnly || isSaving}
              />
            </div>

            {/* Third Party Access */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="third-party" className="text-base font-medium">
                  Acesso de Terceiros
                </Label>
                <p className="text-sm text-gray-500">
                  Permitir acesso a dados por parceiros e laboratórios
                </p>
              </div>
              <Switch
                id="third-party"
                checked={privacyControls.allowThirdPartyAccess}
                onCheckedChange={(checked) =>
                  updatePrivacyControls({ allowThirdPartyAccess: checked })
                }
                disabled={readOnly || isSaving}
              />
            </div>

            {/* Access Level */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Nível de Acesso</Label>
              <Select
                value={privacyControls.accessLevel}
                onValueChange={(value) => updatePrivacyControls({ accessLevel: value as any })}
                disabled={readOnly || isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="restricted">Restrito</SelectItem>
                  <SelectItem value="private">Privado</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                {ACCESS_LEVEL_DESCRIPTIONS[privacyControls.accessLevel]}
              </p>
            </div>

            {/* Data Retention */}
            <div className="space-y-2">
              <Label className="text-base font-medium">Período de Retenção</Label>
              <Select
                value={privacyControls.dataRetentionPeriod.toString()}
                onValueChange={(value) =>
                  updatePrivacyControls({ dataRetentionPeriod: parseInt(value) })
                }
                disabled={readOnly || isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RETENTION_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value.toString()}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Tempo que os dados serão mantidos no sistema</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferências de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Notificações por email</Label>
              <Switch
                id="email-notifications"
                checked={privacyControls.notificationPreferences.emailNotifications}
                onCheckedChange={(checked) =>
                  updatePrivacyControls({
                    notificationPreferences: {
                      ...privacyControls.notificationPreferences,
                      emailNotifications: checked,
                    },
                  })
                }
                disabled={readOnly || isSaving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">Notificações por SMS</Label>
              <Switch
                id="sms-notifications"
                checked={privacyControls.notificationPreferences.smsNotifications}
                onCheckedChange={(checked) =>
                  updatePrivacyControls({
                    notificationPreferences: {
                      ...privacyControls.notificationPreferences,
                      smsNotifications: checked,
                    },
                  })
                }
                disabled={readOnly || isSaving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="processing-alerts">Alertas de processamento</Label>
              <Switch
                id="processing-alerts"
                checked={privacyControls.notificationPreferences.dataProcessingAlerts}
                onCheckedChange={(checked) =>
                  updatePrivacyControls({
                    notificationPreferences: {
                      ...privacyControls.notificationPreferences,
                      dataProcessingAlerts: checked,
                    },
                  })
                }
                disabled={readOnly || isSaving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Direitos do Titular dos Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
                disabled={readOnly}
                className="h-auto p-4 text-left"
              >
                <div>
                  <p className="font-medium">Exportar Dados</p>
                  <p className="text-sm text-gray-500">Solicitar cópia dos seus dados</p>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowDeletionDialog(true)}
                disabled={readOnly}
                className="h-auto p-4 text-left"
              >
                <div>
                  <p className="font-medium">Excluir Dados</p>
                  <p className="text-sm text-gray-500">Solicitar exclusão dos dados</p>
                </div>
              </Button>
            </div>

            {/* Export Requests */}
            {privacyControls.dataExportRequests.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Solicitações de Exportação</h4>
                {privacyControls.dataExportRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">{formatDate(request.requestDate)}</p>
                      {request.downloadUrl && (
                        <a
                          href={request.downloadUrl}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Download disponível
                        </a>
                      )}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                ))}
              </div>
            )}

            {/* Deletion Requests */}
            {privacyControls.deletionRequests.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Solicitações de Exclusão</h4>
                {privacyControls.deletionRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <p className="text-sm font-medium">{formatDate(request.requestDate)}</p>
                      <p className="text-sm text-gray-500">{request.reason}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consent History */}
      {consentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Consentimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consentHistory.map((consent) => (
                <div key={consent.id} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Versão {consent.version}</p>
                      <p className="text-sm text-gray-500">
                        Concedido em: {formatDate(consent.givenAt)}
                        {consent.revokedAt && ` • Revogado em: ${formatDate(consent.revokedAt)}`}
                      </p>
                    </div>
                  </div>
                  {consent.changes.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Alterações:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {consent.changes.map((change, index) => (
                          <li key={index}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consent Dialog */}
      <Dialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {privacyControls.consentGiven ? "Revogar" : "Conceder"} Consentimento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {privacyControls.consentGiven
                ? "Ao revogar o consentimento, o processamento de suas fotos e dados será interrompido."
                : "Ao conceder o consentimento, você autoriza o processamento de suas fotos e dados conforme nossa política de privacidade."}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowConsentDialog(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  updatePrivacyControls({
                    consentGiven: !privacyControls.consentGiven,
                    consentDate: new Date().toISOString(),
                  });
                  setShowConsentDialog(false);
                }}
              >
                {privacyControls.consentGiven ? "Revogar" : "Conceder"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Dados</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Você receberá um arquivo com todos os seus dados pessoais e fotos armazenados no
              sistema. O download estará disponível por 7 dias após o processamento.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={requestDataExport}>Solicitar Exportação</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deletion Dialog */}
      <Dialog open={showDeletionDialog} onOpenChange={setShowDeletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Exclusão de Dados</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Esta solicitação será analisada conforme os requisitos legais. Alguns dados podem ser
              mantidos por obrigações regulatórias.
            </p>
            <div className="space-y-2">
              <Label htmlFor="deletion-reason">Motivo da solicitação</Label>
              <Textarea
                id="deletion-reason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Descreva o motivo da solicitação de exclusão..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeletionDialog(false);
                  setDeletionReason("");
                }}
              >
                Cancelar
              </Button>
              <Button onClick={requestDataDeletion}>Enviar Solicitação</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
