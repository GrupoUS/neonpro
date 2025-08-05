"use client";

import type { useState, useEffect } from "react";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Button } from "@/components/ui/button";
import type { Badge } from "@/components/ui/badge";
import type { Input } from "@/components/ui/input";
import type { PatientConsent } from "@/app/types/compliance";
import type { ConsentService } from "@/app/services/consent.service";
import type { Search, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import type { useToast } from "@/hooks/use-toast";

interface PatientConsentManagerProps {
  patientId?: string;
  clinicId: string;
}

export function PatientConsentManager({ patientId, clinicId }: PatientConsentManagerProps) {
  const [consents, setConsents] = useState<PatientConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const consentService = new ConsentService();

  useEffect(() => {
    loadConsents();
  }, [patientId, clinicId]);

  const loadConsents = async () => {
    try {
      setLoading(true);
      const data = patientId
        ? await consentService.getPatientConsents(patientId)
        : await consentService.getClinicConsents(clinicId);
      setConsents(data);
    } catch (error) {
      console.error("Error loading consents:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os consentimentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    try {
      await consentService.revokePatientConsent(consentId);
      toast({
        title: "Sucesso",
        description: "Consentimento revogado com sucesso.",
      });
      loadConsents();
    } catch (error) {
      console.error("Error revoking consent:", error);
      toast({
        title: "Erro",
        description: "Não foi possível revogar o consentimento.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "withdrawn":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "expired":
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Ativo",
      withdrawn: "Retirado",
      expired: "Expirado",
      pending: "Pendente",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "withdrawn":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const isExpiringSoon = (consent: PatientConsent) => {
    if (!consent.expires_at) return false;
    const expiryDate = new Date(consent.expires_at);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const filteredConsents = consents.filter((consent) => {
    const matchesSearch =
      consent.consent_form?.form_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || consent.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {patientId ? "Consentimentos do Paciente" : "Consentimentos da Clínica"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Gerencie e monitore consentimentos de dados e tratamentos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={
                patientId ? "Buscar consentimentos..." : "Buscar por paciente ou formulário..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-input bg-background text-sm rounded-md"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="withdrawn">Retirados</option>
            <option value="expired">Expirados</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Ativos</p>
                <p className="text-2xl font-bold">
                  {consents.filter((c) => c.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-4 h-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Revogados</p>
                <p className="text-2xl font-bold">
                  {consents.filter((c) => c.status === "withdrawn").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Expirados</p>
                <p className="text-2xl font-bold">
                  {consents.filter((c) => c.status === "expired").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Expirando Soon</p>
                <p className="text-2xl font-bold">
                  {consents.filter((c) => isExpiringSoon(c)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consents List */}
      <div className="space-y-4">
        {filteredConsents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum consentimento encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== "all"
                  ? "Tente ajustar os filtros de busca."
                  : "Não há consentimentos registrados ainda."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConsents.map((consent) => (
            <Card key={consent.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(consent.status)}
                      <h4 className="font-semibold">{consent.consent_form?.form_name}</h4>
                      <Badge className={getStatusColor(consent.status)}>
                        {getStatusLabel(consent.status)}
                      </Badge>
                      {isExpiringSoon(consent) && (
                        <Badge variant="outline" className="border-orange-500 text-orange-700">
                          Expira em breve
                        </Badge>
                      )}
                    </div>

                    {!patientId && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Paciente: <span className="font-medium">{consent.patient?.full_name}</span>
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Data de Consentimento</p>
                        <p>{new Date(consent.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                      {consent.expires_at && (
                        <div>
                          <p className="font-medium text-muted-foreground">Data de Expiração</p>
                          <p>{new Date(consent.expires_at).toLocaleDateString("pt-BR")}</p>
                        </div>
                      )}
                      {consent.withdrawal_date && (
                        <div>
                          <p className="font-medium text-muted-foreground">Data de Revogação</p>
                          <p>{new Date(consent.withdrawal_date).toLocaleDateString("pt-BR")}</p>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-muted-foreground">Versão do Formulário</p>
                        <p>{consent.consent_form?.form_version}</p>
                      </div>
                    </div>

                    {consent.withdrawal_reason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Motivo da revogação:</strong> {consent.withdrawal_reason}
                        </p>
                      </div>
                    )}
                  </div>

                  {consent.status === "active" && (
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeConsent(consent.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Revogar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
