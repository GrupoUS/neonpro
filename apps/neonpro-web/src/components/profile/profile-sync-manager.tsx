"use client";

import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { useProfileSync } from "@/hooks/use-profile-sync";
import type {
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  RefreshCw,
  Shield,
  Stethoscope,
  User,
} from "lucide-react";
import type { useState } from "react";
import type { toast } from "sonner";

interface ProfileSyncManagerProps {
  className?: string;
}

export function ProfileSyncManager({ className = "" }: ProfileSyncManagerProps) {
  const {
    profile,
    syncStatus,
    isLoading,
    isUpdating,
    error,
    updateProfile,
    syncWithGoogle,
    resolveConflict,
    toggleGoogleSync,
  } = useProfileSync();

  const [formData, setFormData] = useState({
    full_name: "",
    first_name: "",
    last_name: "",
    professional_title: "",
    medical_license: "",
    department: "",
    phone: "",
    role: "professional" as "admin" | "doctor" | "nurse" | "staff" | "professional",
  });

  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Initialize form when profile loads
  if (profile && !isFormInitialized) {
    setFormData({
      full_name: profile.full_name || "",
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      professional_title: profile.professional_title || "",
      medical_license: profile.medical_license || "",
      department: profile.department || "",
      phone: profile.phone || "",
      role: profile.role,
    });
    setIsFormInitialized(true);
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    const success = await updateProfile(formData);
    if (success) {
      toast.success("Perfil atualizado com sucesso!");
    }
  };

  const handleSyncWithGoogle = async () => {
    const success = await syncWithGoogle();
    if (success) {
      // Refresh form data with synced profile
      setIsFormInitialized(false);
    }
  };

  const handleResolveConflict = async () => {
    const success = await resolveConflict(formData);
    if (success) {
      setIsFormInitialized(false);
    }
  };

  const handleToggleGoogleSync = async (enabled: boolean) => {
    const success = await toggleGoogleSync(enabled);
    if (success) {
      toast.success(enabled ? "Sincronização Google ativada" : "Sincronização Google desativada");
    }
  };

  const getSyncStatusIcon = () => {
    if (!syncStatus) return <Clock className="h-4 w-4 text-gray-400" />;

    switch (syncStatus.sync_status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "conflict":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSyncStatusText = () => {
    if (!syncStatus) return "Verificando...";

    switch (syncStatus.sync_status) {
      case "synced":
        return "Sincronizado";
      case "conflict":
        return "Conflito detectado";
      case "error":
        return "Erro na sincronização";
      case "pending":
        return "Pendente";
      default:
        return "Status desconhecido";
    }
  };

  const getSyncStatusColor = () => {
    if (!syncStatus) return "secondary";

    switch (syncStatus.sync_status) {
      case "synced":
        return "success";
      case "conflict":
        return "warning";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando perfil...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status de Sincronização Google
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSyncStatusIcon()}
              <span className="font-medium">{getSyncStatusText()}</span>
              <Badge variant={getSyncStatusColor() as any}>
                {syncStatus?.sync_status || "unknown"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="google-sync">Sincronização automática</Label>
              <Switch
                id="google-sync"
                checked={profile?.google_sync_enabled || false}
                onCheckedChange={handleToggleGoogleSync}
                disabled={isUpdating}
              />
            </div>
          </div>

          {syncStatus?.last_sync && (
            <p className="text-sm text-gray-600">
              Última sincronização: {new Date(syncStatus.last_sync).toLocaleString("pt-BR")}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSyncWithGoogle}
              disabled={isUpdating}
              size="sm"
              variant="outline"
            >
              {isUpdating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sincronizar agora
            </Button>

            {syncStatus?.has_conflicts && (
              <Button
                onClick={handleResolveConflict}
                disabled={isUpdating}
                size="sm"
                variant="default"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Resolver conflito
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Nome completo"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Input id="email" value={profile?.email || ""} disabled className="bg-gray-50" />
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="first_name">Primeiro nome</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                placeholder="Primeiro nome"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Sobrenome</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                placeholder="Sobrenome"
                disabled={isUpdating}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Informações Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="professional_title">Título profissional</Label>
              <Input
                id="professional_title"
                value={formData.professional_title}
                onChange={(e) => handleInputChange("professional_title", e.target.value)}
                placeholder="Ex: Médico Cardiologista"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_license">Registro profissional</Label>
              <Input
                id="medical_license"
                value={formData.medical_license}
                onChange={(e) => handleInputChange("medical_license", e.target.value)}
                placeholder="Ex: CRM 12345"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                placeholder="Ex: Cardiologia"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="doctor">Médico</SelectItem>
                  <SelectItem value="nurse">Enfermeiro(a)</SelectItem>
                  <SelectItem value="staff">Funcionário</SelectItem>
                  <SelectItem value="professional">Profissional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                  disabled={isUpdating}
                />
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={handleUpdateProfile} disabled={isUpdating} size="lg">
          {isUpdating ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
