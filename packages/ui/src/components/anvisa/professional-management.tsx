/**
 * ANVISA Professional Management Component
 * Component for managing professional certifications and authorizations
 */

"use client";

import {
  AlertTriangle,
  Award,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  Shield,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { Alert, AlertDescription } from "../Alert";
import { Badge } from "../Badge";
import { Button } from "../Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../Card";

interface Professional {
  id: string;
  name: string;
  crm_number: string;
  specialty: string;
  certification_status: "active" | "pending" | "expired" | "suspended";
  authorization_level: "basic" | "intermediate" | "advanced" | "expert";
  compliance_score: number;
  authorized_procedures: string[];
  certification_expiry: string;
  created_at: string;
}

interface ProfessionalFormData {
  name: string;
  crm_number: string;
  specialty: string;
  certification_level: string;
  authorized_procedures: string[];
}

interface ANVISAProfessionalManagementProps {
  clinicId: string;
}

export function ANVISAProfessionalManagement({
  clinicId,
}: ANVISAProfessionalManagementProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [_formData, _setFormData] = useState<ProfessionalFormData>({
    name: "",
    crm_number: "",
    specialty: "",
    certification_level: "",
    authorized_procedures: [],
  });
  const [error, setError] = useState<string | null>();
  const [success, setSuccess] = useState<string | null>();

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/anvisa/professionals?clinic_id=${clinicId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.data);
      }
    } catch {
      setError("Erro ao carregar profissionais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const checkAuthorization = async (professionalId: string) => {
    try {
      const response = await fetch(
        `/api/anvisa/professionals?clinic_id=${clinicId}&action=check_authorization&professional_id=${professionalId}`,
        { method: "GET" },
      );
      if (response.ok) {
        const data = await response.json();
        return data.data.is_authorized;
      }
    } catch {}
    return false;
  };

  const updateComplianceScore = async (professionalId: string) => {
    try {
      const response = await fetch(
        `/api/anvisa/professionals?clinic_id=${clinicId}&action=update_compliance_score&professional_id=${professionalId}`,
        { method: "GET" },
      );
      if (response.ok) {
        const data = await response.json();
        // Update the professional in the list
        setProfessionals((prev) =>
          prev.map((p) =>
            p.id === professionalId
              ? { ...p, compliance_score: data.data.compliance_score }
              : p,
          ),
        );
        setSuccess(
          `Score de conformidade atualizado: ${data.data.compliance_score}%`,
        );
      }
    } catch {
      setError("Erro ao atualizar score de conformidade");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": {
        return <Badge className="bg-green-500 text-white">Ativo</Badge>;
      }
      case "pending": {
        return <Badge variant="outline">Pendente</Badge>;
      }
      case "expired": {
        return <Badge variant="destructive">Expirado</Badge>;
      }
      case "suspended": {
        return <Badge variant="secondary">Suspenso</Badge>;
      }
      default: {
        return <Badge variant="outline">{status}</Badge>;
      }
    }
  };

  const getAuthorizationBadge = (level: string) => {
    switch (level) {
      case "expert": {
        return <Badge className="bg-purple-500 text-white">Especialista</Badge>;
      }
      case "advanced": {
        return <Badge className="bg-blue-500 text-white">Avançado</Badge>;
      }
      case "intermediate": {
        return <Badge className="bg-green-500 text-white">Intermediário</Badge>;
      }
      case "basic": {
        return <Badge variant="outline">Básico</Badge>;
      }
      default: {
        return <Badge variant="outline">{level}</Badge>;
      }
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) {
      return "text-green-600";
    }
    if (score >= 75) {
      return "text-blue-600";
    }
    if (score >= 60) {
      return "text-yellow-600";
    }
    return "text-red-600";
  };

  const isNearExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {new Array(6).fill().map((_, i) => (
            <Card className="animate-pulse" key={i}>
              <CardHeader>
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-200" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-6 w-16 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-2xl tracking-tight">
            Profissionais Certificados
          </h3>
          <p className="text-muted-foreground">
            Gerencie certificações e autorizações profissionais ANVISA
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Profissional
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Professionals Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {professionals.map((professional) => (
          <Card
            className="transition-shadow hover:shadow-md"
            key={professional.id}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{professional.name}</CardTitle>
                  <CardDescription className="text-sm">
                    CRM: {professional.crm_number}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getStatusBadge(professional.certification_status)}
                  {isNearExpiry(professional.certification_expiry) && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Especialidade:
                </span>
                <span className="font-medium text-sm">
                  {professional.specialty}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Nível:</span>
                {getAuthorizationBadge(professional.authorization_level)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Conformidade:
                </span>
                <div className="flex items-center space-x-2">
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      getComplianceColor(professional.compliance_score),
                    )}
                  >
                    {professional.compliance_score}%
                  </span>
                  <Button
                    onClick={() => updateComplianceScore(professional.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Shield className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Validade:</span>
                <span
                  className={cn(
                    "text-sm",
                    isNearExpiry(professional.certification_expiry) &&
                      "font-medium text-yellow-600",
                  )}
                >
                  {new Date(
                    professional.certification_expiry,
                  ).toLocaleDateString("pt-BR")}
                </span>
              </div>

              <div className="border-t pt-2">
                <div className="space-y-2">
                  <span className="text-muted-foreground text-xs">
                    Procedimentos Autorizados:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {professional.authorized_procedures
                      .slice(0, 3)
                      .map((procedure, index) => (
                        <Badge
                          className="text-xs"
                          key={index}
                          variant="secondary"
                        >
                          {procedure}
                        </Badge>
                      ))}
                    {professional.authorized_procedures.length > 3 && (
                      <Badge className="text-xs" variant="outline">
                        +{professional.authorized_procedures.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-2">
                <div className="flex space-x-1">
                  {professional.certification_status === "active" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {professional.certification_status === "pending" && (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  {(professional.certification_status === "expired" ||
                    professional.certification_status === "suspended") && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Award className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {professionals.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">
              Nenhum profissional cadastrado
            </h3>
            <p className="mb-4 text-center text-muted-foreground">
              Adicione profissionais para gerenciar certificações e autorizações
              ANVISA
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Profissional
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {professionals.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-muted-foreground text-sm">
                    Total
                  </p>
                  <p className="font-bold text-2xl">{professionals.length}</p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-muted-foreground text-sm">
                    Ativos
                  </p>
                  <p className="font-bold text-2xl text-green-600">
                    {
                      professionals.filter(
                        (p) => p.certification_status === "active",
                      ).length
                    }
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-muted-foreground text-sm">
                    Pendentes
                  </p>
                  <p className="font-bold text-2xl text-yellow-600">
                    {
                      professionals.filter(
                        (p) => p.certification_status === "pending",
                      ).length
                    }
                  </p>
                </div>
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-muted-foreground text-sm">
                    Próximos ao Vencimento
                  </p>
                  <p className="font-bold text-2xl text-orange-600">
                    {
                      professionals.filter((p) =>
                        isNearExpiry(p.certification_expiry),
                      ).length
                    }
                  </p>
                </div>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
